# coding: utf-8

from typing import ClassVar, Dict, List, Tuple  # noqa: F401
from fastapi import HTTPException
from sqlalchemy import text
from openapi_server.database.connection import Session as db_session
from pydantic import StrictBool, StrictInt
from typing import List, Optional

from openapi_server.models.auslaenderanteil_wahlkreise_inner import AuslaenderanteilWahlkreiseInner
from openapi_server.models.einkommen_wahlkreise_inner import EinkommenWahlkreiseInner
from openapi_server.models.overview_wahlkreis import OverviewWahlkreis
from openapi_server.models.stimmanteil import Stimmanteil
from openapi_server.models.winning_parties import WinningParties
from openapi_server.models.abgeordneter import Abgeordneter
from openapi_server.models.partei import Partei
from openapi_server.models.winning_parties_erststimme_inner import WinningPartiesErststimmeInner
from openapi_server.models.winning_parties_zweitstimme_inner import WinningPartiesZweitstimmeInner
from openapi_server.models.auslaenderanteil import Auslaenderanteil
from openapi_server.models.einkommen import Einkommen


class BaseWahlkreisApi:
    subclasses: ClassVar[Tuple] = ()

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        BaseWahlkreisApi.subclasses = BaseWahlkreisApi.subclasses + (cls,)
    async def get_overview_wahlkreis(
        wahlid: StrictInt,
        wahlkreisid: StrictInt,
        generatefromaggregate: Optional[StrictBool],
        self
    ) -> OverviewWahlkreis:
        try:
            with db_session() as db:
                if generatefromaggregate:
                    abgeordneter_query = text('''
                                SELECT k.id, k.name, k.firstname, k.profession, k."yearOfBirth", ww.partei_id 
                                FROM wahlkreis_winners ww 
                                JOIN kandidaten k ON ww.kandidat_id = k.id 
                                WHERE ww.wahlkreis_id = :wahlkreisId AND ww.wahl_id = :wahlId;
                            ''')
                else:
                    abgeordneter_query = text('''
                                WITH candidate_votes AS
                                    (SELECT w.kandidat_id, w.partei_id, COUNT(*) AS votes
                                    FROM erststimmen e
                                          JOIN wahlkreiskandidaturen w ON e.wahlkreiskandidatur_id = w.id
                                    WHERE wahlkreis_id = :wahlkreisId AND w.wahl_id = :wahlId
                                    GROUP BY w.kandidat_id, w.partei_id),
                                max_votes AS (SELECT kandidat_id, partei_id
                                    FROM candidate_votes
                                    WHERE votes = (SELECT MAX(votes) FROM candidate_votes)) 
                                SELECT k.id, k.name, k.firstname, k.profession, k."yearOfBirth", mv.partei_id
                                FROM max_votes mv JOIN kandidaten k ON mv.kandidat_id = k.id;
                            ''')

                abgeordneter_results = db.execute(
                    abgeordneter_query,
                    {"wahlId": wahlid, "wahlkreisId": wahlkreisid}
                ).fetchall()

                if not abgeordneter_results:
                    raise HTTPException(status_code=404, detail="No direktkandidat found")

                direktkandidat = abgeordneter_results[0]

                partei = db.execute(
                    text('SELECT id, name, "shortName" FROM parteien WHERE id = :partei_id'),
                    {"partei_id": direktkandidat[5]}
                ).fetchone()

                if not partei:
                    raise HTTPException(status_code=404, detail="No Partei details found")

                wahlbeteiligung_query = text('''
                            SELECT wahlbeteiligung 
                            FROM strukturdaten 
                            WHERE wahl_id = :wahlId AND wahlkreis_id = :wahlkreisId;
                        ''')

                wahlbeteiligung_results = db.execute(
                    wahlbeteiligung_query,
                    {"wahlId": wahlid, "wahlkreisId": wahlkreisid}
                ).fetchone()

                if not wahlbeteiligung_results:
                    raise HTTPException(status_code=404, detail="No wahlbeteiligung found")

                overview = OverviewWahlkreis(
                    wahlbeteiligung=wahlbeteiligung_results[0],
                    direktkandidat=Abgeordneter(
                        id=direktkandidat[0],
                        name=direktkandidat[1],
                        firstname=direktkandidat[2],
                        profession=direktkandidat[3],
                        year_of_birth=direktkandidat[4],
                        party=Partei(id=partei[0], name=partei[1], shortname=partei[2])
                    )
                )

                return overview

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

    async def get_stimmanteil_wahlkreis(
        wahlid: StrictInt,
        wahlkreisid: StrictInt,
        generatefromaggregate: Optional[StrictBool],
        self,
    ) -> List[Stimmanteil]:
        try:
            with db_session() as db:
                if generatefromaggregate:
                    stimmanteil_query = text('''
                                SELECT
                                    p.id, p.name, p."shortName",
                                    stimmen_sum,
                                    ROUND(
                                        (stimmen_sum * 100.0) /
                                        (SELECT SUM(stimmen_sum)
                                         FROM zweitstimmen_wahlkreis_partei
                                         WHERE wahlen_id = z.wahlen_id and wahlkreise_id = z.wahlkreise_id),
                                        2
                                    ) AS prozentualer_anteil
                                FROM
                                    zweitstimmen_wahlkreis_partei z JOIN parteien p ON z.parteien_id = p.id   
                                WHERE wahlen_id = :wahlId and wahlkreise_id = :wahlkreisId;
                                ''')
                else:
                    stimmanteil_query = text('''
                                            SELECT
                                                p.id, p.name, p."shortName",
                                                COUNT(*) AS stimmenanzahl,
                                                ROUND((COUNT(*) * 100.0) / SUM(COUNT(*)) OVER(), 2) AS prozentualer_anteil
                                            FROM
                                                zweitstimmen z JOIN parteien p ON z.partei_id = p.id   
                                            WHERE
                                                wahl_id = :wahlId and wahlkreis_id = :wahlkreisId
                                            GROUP BY
                                                p.id, p.name, p."shortName";
                                                ''')

                stimmanteil_results = db.execute(stimmanteil_query,
                    {"wahlId": wahlid, "wahlkreisId": wahlkreisid}
                ).fetchall()

            if not stimmanteil_results:
                raise HTTPException(status_code=404, detail="No stimmanteil found")
            print(stimmanteil_results)

            stimmanteile = []
            for result in stimmanteil_results:
                partei_id, partei_name, partei_short_name, stimmenanzahl, prozentualer_anteil = result

                stimmanteile.append(
                    Stimmanteil(
                        party=Partei(id=partei_id, name=partei_name, shortname=partei_short_name),
                        share=prozentualer_anteil,
                        absolute=int(stimmenanzahl)
                    )
                )

            return stimmanteile

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

    async def get_winning_parties_wahlkreis(
        wahlId: StrictInt,
        wahlkreisId: StrictInt,
        self,
    ) -> WinningParties:
        try:
            with db_session() as db:
                erstimmen_winner_query = text('''
                                SELECT parteien."shortName", parteien.id, parteien.name AS erstimmen_winner, wahlkreise.name FROM wahlkreise JOIN wahlkreis_winners ON wahlkreise.id = wahlkreis_winners.wahlkreis_id JOIN parteien ON wahlkreis_winners.partei_id = parteien.id WHERE wahlkreis_winners.wahl_id = :wahlId AND wahlkreis_winners.wahlkreis_id = :wahlkreisId;
                            ''')
                zweitstimmen_winner_query = text('''
                                SELECT parteien."shortName", parteien.id, parteien.name AS zweitstimmen_winner, wahlkreise.name FROM wahlkreise JOIN zweitstimmen_wahlkreis_partei ON wahlkreise.id = zweitstimmen_wahlkreis_partei.wahlkreise_id JOIN parteien ON parteien.id = zweitstimmen_wahlkreis_partei.parteien_id WHERE zweitstimmen_wahlkreis_partei.wahlen_id = :wahlId AND wahlkreise.id = :wahlkreisId AND zweitstimmen_wahlkreis_partei.stimmen_sum = (SELECT MAX(z2.stimmen_sum) FROM zweitstimmen_wahlkreis_partei z2 WHERE z2.wahlkreise_id = wahlkreise.id AND z2.wahlen_id = :wahlId);
                            ''')
                erstimmen_winner_results = db.execute(
                    erstimmen_winner_query,
                    {"wahlId": wahlId, "wahlkreisId": wahlkreisId}
                ).fetchall()

                zweitstimmen_winner_results = db.execute(
                    zweitstimmen_winner_query,
                    {"wahlId": wahlId, "wahlkreisId": wahlkreisId}
                ).fetchall()
            if not erstimmen_winner_results or not zweitstimmen_winner_results:
                raise HTTPException(status_code=404, detail="No winners found")
            erststimme_winners = [
                WinningPartiesErststimmeInner(
                    party=Partei(id=row[1], shortname=row[0], name=row[2]),
                    region_id=wahlkreisId,
                    region_name=row[3]
                ) for row in erstimmen_winner_results
            ]

            zweitstimme_winners = [
                WinningPartiesZweitstimmeInner(
                    party=Partei(id=row[1], shortname=row[0], name=row[2]),
                    region_id=wahlkreisId,
                    region_name=row[3]
                ) for row in zweitstimmen_winner_results
            ]

            return WinningParties(
                erststimme=erststimme_winners,
                zweitstimme=zweitstimme_winners
            )

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

    async def get_winning_parties(
        wahlId: StrictInt,
        self,
    ) -> WinningParties:
        try:
            with db_session() as db:
                erstimmen_winner_query = text('''
                                SELECT parteien."shortName", parteien.id, parteien.name AS erstimmen_winner, wahlkreise.id, wahlkreise.name FROM wahlkreise JOIN wahlkreis_winners ON wahlkreise.id = wahlkreis_winners.wahlkreis_id JOIN parteien ON wahlkreis_winners.partei_id = parteien.id WHERE wahlkreis_winners.wahl_id = :wahlId;
                            ''')
                zweitstimmen_winner_query = text('''
                                SELECT parteien."shortName", parteien.id, parteien.name AS zweitstimmen_winner, wahlkreise.id, wahlkreise.name FROM wahlkreise JOIN zweitstimmen_wahlkreis_partei ON wahlkreise.id = zweitstimmen_wahlkreis_partei.wahlkreise_id JOIN parteien ON parteien.id = zweitstimmen_wahlkreis_partei.parteien_id WHERE zweitstimmen_wahlkreis_partei.wahlen_id = :wahlId AND zweitstimmen_wahlkreis_partei.stimmen_sum = (SELECT MAX(z2.stimmen_sum) FROM zweitstimmen_wahlkreis_partei z2 WHERE z2.wahlkreise_id = wahlkreise.id AND z2.wahlen_id = :wahlId);
                            ''')
                erstimmen_winner_results = db.execute(
                    erstimmen_winner_query,
                    {"wahlId": wahlId}
                ).fetchall()

                zweitstimmen_winner_results = db.execute(
                    zweitstimmen_winner_query,
                    {"wahlId": wahlId}
                ).fetchall()
            if not erstimmen_winner_results or not zweitstimmen_winner_results:
                raise HTTPException(status_code=404, detail="No winners found")
            erststimme_winners = [
                WinningPartiesErststimmeInner(
                    party=Partei(id=row[1], shortname=row[0], name=row[2]),
                    region_id=row[3],
                    region_name=row[4]
                ) for row in erstimmen_winner_results
            ]

            zweitstimme_winners = [
                WinningPartiesZweitstimmeInner(
                    party=Partei(id=row[1], shortname=row[0], name=row[2]),
                    region_id=row[3],
                    region_name=row[4]
                ) for row in zweitstimmen_winner_results
            ]

            return WinningParties(
                erststimme=erststimme_winners,
                zweitstimme=zweitstimme_winners
            )

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

    async def get_foreigners(
            wahlid: StrictInt,
            parteiid: StrictInt,
            self
    ) -> Auslaenderanteil:
        try:
            with db_session() as db:
                auslaenderanteil_query = text('''
                    SELECT s.wahlkreis_id, s.auslaenderanteil, zwp.stimmen_sum
                    FROM strukturdaten s
                    LEFT JOIN zweitstimmen_wahlkreis_partei zwp
                        ON s.wahlkreis_id = zwp.wahlkreise_id
                        AND s.wahl_id = zwp.wahlen_id
                        AND zwp.parteien_id = :parteiId
                    WHERE s.wahl_id = :wahlId;
                ''')

                auslaenderanteil_results = db.execute(
                    auslaenderanteil_query,
                    {"wahlId": wahlid, "parteiId": parteiid}
                ).fetchall()

                if not auslaenderanteil_results:
                    raise HTTPException(
                        status_code=404,
                        detail=f"No foreigner share data found for Wahl ID: {wahlid}"
                    )

                auslaenderanteil_response = Auslaenderanteil(wahlkreise=[])

                for result in auslaenderanteil_results:
                    wahlkreis_id, auslaenderanteil_value, stimmen_result = result

                    if stimmen_result is None:
                        stimmen_sum = 0
                    else:
                        stimmen_sum = stimmen_result

                    auslaenderanteil_response.wahlkreise.append(
                        AuslaenderanteilWahlkreiseInner(
                            wahlkreis_id=wahlkreis_id,
                            auslaenderanteil=auslaenderanteil_value,
                            stimmen=stimmen_sum
                        )
                    )

            return auslaenderanteil_response

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"An unexpected error occurred: {str(e)}"
            )


    async def get_income(
            wahlid: StrictInt,
            parteiid: StrictInt,
            self
    ) -> Einkommen:
        try:
            with db_session() as db:
                einkommen_query = text('''
                    SELECT wahlkreis_id, einkommen, zwp.stimmen_sum
                    FROM strukturdaten s
                    LEFT JOIN zweitstimmen_wahlkreis_partei zwp
                        ON s.wahlkreis_id = zwp.wahlkreise_id
                        AND s.wahl_id = zwp.wahlen_id
                        AND zwp.parteien_id = :parteiId
                    WHERE s.wahl_id = :wahlId;
                ''')

                einkommen_results = db.execute(
                    einkommen_query,
                    {"wahlId": wahlid, "parteiId": parteiid}
                ).fetchall()

                if not einkommen_results:
                    raise HTTPException(
                        status_code=404,
                        detail=f"No foreigner share data found for Wahl ID: {wahlid}"
                    )

                einkommen_response = Einkommen(wahlkreise=[])

                for result in einkommen_results:
                    wahlkreis_id, einkommen_value, stimmen_result = result

                    if stimmen_result is None:
                        stimmen_sum = 0
                    else:
                        stimmen_sum = stimmen_result

                    einkommen_response.wahlkreise.append(
                        EinkommenWahlkreiseInner(
                            wahlkreis_id=wahlkreis_id,
                            einkommen=einkommen_value,
                            stimmen=stimmen_sum
                        )
                    )

            return einkommen_response

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"An unexpected error occurred: {str(e)}"
            )