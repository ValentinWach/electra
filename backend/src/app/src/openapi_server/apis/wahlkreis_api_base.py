# coding: utf-8

from typing import ClassVar, Dict, List, Tuple  # noqa: F401
from fastapi import HTTPException
from sqlalchemy import text
from openapi_server.database.connection import Session as db_session
from pydantic import StrictBool, StrictInt
from typing import List, Optional
from openapi_server.models.overview_wahlkreis import OverviewWahlkreis
from openapi_server.models.stimmanteil import Stimmanteil
from openapi_server.models.winning_parties import WinningParties
from openapi_server.models.partei import Partei
from openapi_server.models.winning_parties_erststimme_inner import WinningPartiesErststimmeInner
from openapi_server.models.winning_parties_zweitstimme_inner import WinningPartiesZweitstimmeInner


class BaseWahlkreisApi:
    subclasses: ClassVar[Tuple] = ()

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        BaseWahlkreisApi.subclasses = BaseWahlkreisApi.subclasses + (cls,)
    async def get_overview_wahlkreis(
        self,
        wahlid: StrictInt,
        wahlkreisid: StrictInt,
        generatefromaggregate: Optional[StrictBool],
    ) -> OverviewWahlkreis:
        ...


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
                                    parteien_id,
                                    stimmen_sum,
                                    ROUND(
                                        (stimmen_sum * 100.0) /
                                        (SELECT SUM(stimmen_sum)
                                         FROM zweitstimmen_wahlkreis_partei
                                         WHERE wahlen_id = z.wahlen_id and wahlkreise_id = z.wahlkreise_id),
                                        2
                                    ) AS prozentualer_anteil
                                FROM
                                    zweitstimmen_wahlkreis_partei z
                                WHERE wahlen_id = :wahlId and wahlkreise_id = :wahlkreisId;
                                ''')
                else:
                    stimmanteil_query = text('''
                                            SELECT
                                                partei_id,
                                                COUNT(*) AS stimmenanzahl,
                                                ROUND((COUNT(*) * 100.0) / SUM(COUNT(*)) OVER(), 2) AS prozentualer_anteil
                                            FROM
                                                zweitstimmen
                                            WHERE
                                                wahl_id = :wahlId and wahlkreis_id = :wahlkreisId
                                            GROUP BY
                                                partei_id;
                                                ''')

                # Execute the query with parameterized input, avoiding direct string interpolation
                stimmanteil_results = db.execute(stimmanteil_query,
                    {"wahlId": wahlid, "wahlkreisId": wahlkreisid}
                ).fetchall()

            if not stimmanteil_results:
                raise HTTPException(status_code=404, detail="No winners found")

            # Return the WinningParties object with the filled lists
            stimmanteile = []
            for result in stimmanteil_results:
                partei_id, stimmenanzahl, prozentualer_anteil = result

                # Fetch the Partei details from the database or cache
                partei = db.execute(
                    text('SELECT id, name, "shortName" FROM parteien WHERE id = :partei_id'),
                    {"partei_id": partei_id}
                ).fetchone()

                if not partei:
                    raise HTTPException(
                        status_code=404,
                        detail=f"Partei with id {partei_id} not found"
                    )

                # Map the result to the schema
                stimmanteile.append(
                    Stimmanteil(
                        party=Partei(id=partei.id, name=partei.name, shortname=partei.shortName),
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
            # Query the database for elections
            with db_session() as db:
                erstimmen_winner_query = text('''
                                SELECT parteien."shortName", parteien.id, parteien.name AS erstimmen_winner FROM wahlkreise JOIN wahlkreis_winners ON wahlkreise.id = wahlkreis_winners.wahlkreis_id JOIN parteien ON wahlkreis_winners.partei_id = parteien.id WHERE wahlkreis_winners.wahl_id = :wahlId AND wahlkreis_winners.wahlkreis_id = :wahlkreisId;
                            ''')
                zweitstimmen_winner_query = text('''
                                SELECT parteien."shortName", parteien.id, parteien.name AS zweitstimmen_winner FROM wahlkreise JOIN zweitstimmen_wahlkreis_partei ON wahlkreise.id = zweitstimmen_wahlkreis_partei.wahlkreise_id JOIN parteien ON parteien.id = zweitstimmen_wahlkreis_partei.parteien_id WHERE zweitstimmen_wahlkreis_partei.wahlen_id = :wahlId AND wahlkreise.id = :wahlkreisId AND zweitstimmen_wahlkreis_partei.stimmen_sum = (SELECT MAX(z2.stimmen_sum) FROM zweitstimmen_wahlkreis_partei z2 WHERE z2.wahlkreise_id = wahlkreise.id AND z2.wahlen_id = :wahlId);
                            ''')
                # Execute the query with parameterized input, avoiding direct string interpolation
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
                    party=Partei(id=row[1], shortname=row[0], name=row[2]),  # Assuming Partei is an existing class
                    region_id=wahlkreisId,
                ) for row in erstimmen_winner_results
            ]

            zweitstimme_winners = [
                WinningPartiesZweitstimmeInner(
                    party=Partei(id=row[1], shortname=row[0], name=row[2]),  # Assuming Partei is an existing class
                    region_id=wahlkreisId,
                ) for row in zweitstimmen_winner_results
            ]

            # Return the WinningParties object with the filled lists
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
            # Query the database for elections
            with db_session() as db:
                erstimmen_winner_query = text('''
                                SELECT parteien."shortName", parteien.id, parteien.name AS erstimmen_winner, wahlkreise.id FROM wahlkreise JOIN wahlkreis_winners ON wahlkreise.id = wahlkreis_winners.wahlkreis_id JOIN parteien ON wahlkreis_winners.partei_id = parteien.id WHERE wahlkreis_winners.wahl_id = :wahlId;
                            ''')
                zweitstimmen_winner_query = text('''
                                SELECT parteien."shortName", parteien.id, parteien.name AS zweitstimmen_winner, wahlkreise.id FROM wahlkreise JOIN zweitstimmen_wahlkreis_partei ON wahlkreise.id = zweitstimmen_wahlkreis_partei.wahlkreise_id JOIN parteien ON parteien.id = zweitstimmen_wahlkreis_partei.parteien_id WHERE zweitstimmen_wahlkreis_partei.wahlen_id = :wahlId AND zweitstimmen_wahlkreis_partei.stimmen_sum = (SELECT MAX(z2.stimmen_sum) FROM zweitstimmen_wahlkreis_partei z2 WHERE z2.wahlkreise_id = wahlkreise.id AND z2.wahlen_id = :wahlId);
                            ''')
                # Execute the query with parameterized input, avoiding direct string interpolation
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
                    party=Partei(id=row[1], shortname=row[0], name=row[2]),  # Assuming Partei is an existing class
                    region_id=row[3],
                ) for row in erstimmen_winner_results
            ]

            zweitstimme_winners = [
                WinningPartiesZweitstimmeInner(
                    party=Partei(id=row[1], shortname=row[0], name=row[2]),  # Assuming Partei is an existing class
                    region_id=row[3],
                ) for row in zweitstimmen_winner_results
            ]

            # Return the WinningParties object with the filled lists
            return WinningParties(
                erststimme=erststimme_winners,
                zweitstimme=zweitstimme_winners
            )

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")