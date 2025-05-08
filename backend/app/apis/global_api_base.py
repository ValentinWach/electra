# coding: utf-8
from fastapi import HTTPException
from typing import ClassVar, Dict, List, Tuple  # noqa: F401

from pydantic import StrictInt
from typing import List
from sqlalchemy import text
from openapi_server.models.abgeordneter import Abgeordneter
from openapi_server.models.closest_winner import ClosestWinner
from openapi_server.models.closest_winners import ClosestWinners
from openapi_server.models.seat_distribution import SeatDistribution
from openapi_server.models.seat_distribution_distribution_inner import SeatDistributionDistributionInner
from openapi_server.models.partei import Partei
from openapi_server.models.stimmanteil import Stimmanteil
from openapi_server.models.ueberhang import Ueberhang
from openapi_server.models.ueberhang_bundesland import UeberhangBundesland
from openapi_server.models.wahlkreis import Wahlkreis
from openapi_server.models.bundesland import Bundesland

from openapi_server.database.connection import Session as db_session


class BaseGlobalApi:
    subclasses: ClassVar[Tuple] = ()

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        BaseGlobalApi.subclasses = BaseGlobalApi.subclasses + (cls,)

    async def get_abgeordnete(
        wahlid: StrictInt,
        self
    ) -> List[Abgeordneter]:
        try:
            with db_session() as db:

                abgeordnete = []

                abgeordnete_query = text('''
                    SELECT p.id, p.name, p."shortName", k.id, k.name, k.firstname, k."yearOfBirth", k.profession
                    FROM abgeordnete a JOIN parteien p ON a.partei_id = p.id JOIN kandidaten k ON a.kandidat_id = k.id
                    WHERE a.wahl_id = :wahlid
                ''')

                abgeordnete_results = db.execute(abgeordnete_query, {"wahlid": wahlid}).fetchall()

                for row in abgeordnete_results:

                    abgeordnete.append(
                        Abgeordneter(
                            id=row[3],
                            name=row[4],
                            firstname=row[5],
                            year_of_birth=row[6],
                            profession=row[7],
                            party=Partei(id=int(row[0]), name=row[1], shortname=row[2])
                        )
                    )

            return abgeordnete

        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


    async def get_closest_winners(
        wahlId: StrictInt,
        parteiId: StrictInt,
        self
    ) -> ClosestWinners:
        try:
            with db_session() as db:
                closest_for_party_query = text('''
                    SELECT p.id, p.name, p."shortName", wk.id, wk.name, bl.id AS bundesland_id, bl.name AS bundesland_name, result_status, k.id, k.name, k.firstname, k."yearOfBirth", k.profession, wks.margin
                    FROM wahlkreis_knappste_sieger wks JOIN parteien p ON wks.partei_id = p.id JOIN kandidaten k ON wks.kandidat_id = k.id JOIN wahlkreise wk ON wks.wahlkreis_id = wk.id JOIN bundeslaender bl ON wk.bundesland_id = bl.id
                    WHERE wks.wahl_id = :wahlid and wks.partei_id = :partyid
                    ORDER BY wks.margin_rank ASC
                ''')
                closest_for_party_results = db.execute(closest_for_party_query,
                                                       {"wahlid": wahlId, "partyid": parteiId}).fetchall()

                closest_winner = ClosestWinners(
                    party=Partei(id=closest_for_party_results[0][0], name=closest_for_party_results[0][1], shortname=closest_for_party_results[0][2]),
                    closest_type=closest_for_party_results[0][7],
                    closest_winners=[]
                )

                for row in closest_for_party_results:

                    closest_winner.closest_winners.append(
                        ClosestWinner(
                            abgeordneter=Abgeordneter(
                                id=row[8],
                                name=row[9],
                                firstname=row[10],
                                year_of_birth=row[11],
                                profession=row[12],
                                party=Partei(id=closest_for_party_results[0][0], name=closest_for_party_results[0][1], shortname=closest_for_party_results[0][2])
                            ),
                            margin=row[13],
                            wahlkreis=Wahlkreis(
                                id=row[3],
                                name=row[4],
                                bundesland=Bundesland(
                                    id=row[5],
                                    name=row[6]
                                )
                            )
                        )
                    )

            return closest_winner

        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    async def get_sitzverteilung(
        wahlId: StrictInt,
        self
    ) -> SeatDistribution:
        try:
            with db_session() as db:
                query = text('''
                                SELECT parteien."shortName", name, partei_id, ov_2_sitzkontingente_bundesweit_erhoeht.sitze_nach_erhoehung, stimmen_sum 
                                FROM ov_2_sitzkontingente_bundesweit_erhoeht
                                JOIN parteien ON ov_2_sitzkontingente_bundesweit_erhoeht.partei_id = parteien.id
                                WHERE ov_2_sitzkontingente_bundesweit_erhoeht.wahl_id = :wahlid
                            ''')
                query_results = db.execute(query, {"wahlid": wahlId}).fetchall()
            if not query_results:
                raise HTTPException(status_code=404, detail="No sitzverteilung found")
            total_seats = 0
            distribution = []

            for row in query_results:
                shortname, name, party_id, seats, total = row

                party = Partei(id=party_id, name=name, shortname=shortname)

                distribution_inner = SeatDistributionDistributionInner(
                    party=party,
                    seats=int(seats)
                )
                distribution.append(distribution_inner)

                total_seats = int(total)

            return SeatDistribution(distribution=distribution, numberofseats=total_seats)

        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


    async def get_stimmanteil_zweitstimmen(
        wahlId: StrictInt,
        self,
    ) -> List[Stimmanteil]:
        try:
            with db_session() as db:
                stimmanteil_query = text('''
                            SELECT
                                p.id, p.name, p."shortName",
                                stimmen_sum,
                                ROUND(
                                    (stimmen_sum * 100.0) /
                                    (SELECT SUM(stimmen_sum)
                                     FROM zweitstimmen_partei
                                     WHERE wahlen_id = z.wahlen_id),
                                    1
                                ) AS prozentualer_anteil
                            FROM
                                zweitstimmen_partei z JOIN parteien p on z.parteien_id = p.id
                            WHERE wahlen_id = :wahlId;
                            ''')
                stimmanteil_results = db.execute(stimmanteil_query,
                    {"wahlId": wahlId}
                ).fetchall()

            if not stimmanteil_results:
                raise HTTPException(status_code=404, detail="No zweitstimmen stimmanteil found")

            stimmanteile = []
            for result in stimmanteil_results:
                id, name, short_name, stimmenanzahl, prozentualer_anteil = result

                stimmanteile.append(
                    Stimmanteil(
                        party=Partei(id=id, name=name, shortname=short_name),
                        share=prozentualer_anteil,
                        absolute=int(stimmenanzahl)
                    )
                )

            return stimmanteile

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

    async def get_stimmanteil_erststimmen(
        wahlId: StrictInt,
        self,
    ) -> List[Stimmanteil]:
        try:
            with db_session() as db:
                stimmanteil_query = text('''
                            SELECT
                                COALESCE(p.id, -1) AS id, 
                                COALESCE(p.name, 'EINZELBEWERBER') AS name, 
                                COALESCE(p."shortName", 'EB') AS "shortName",
                                stimmen_sum,
                                ROUND(
                                    (stimmen_sum * 100.0) /
                                    (SELECT SUM(stimmen_sum)
                                     FROM erststimmen_partei
                                     WHERE wahlen_id = z.wahlen_id),
                                    1
                                ) AS prozentualer_anteil
                            FROM erststimmen_partei z
                            LEFT JOIN parteien p ON z.parteien_id = p.id
                            WHERE wahlen_id = :wahlId;
                            ''')
                stimmanteil_results = db.execute(stimmanteil_query,
                    {"wahlId": wahlId}
                ).fetchall()

            if not stimmanteil_results:
                raise HTTPException(status_code=404, detail="No erststimmen stimmanteil found")

            stimmanteile = []
            for result in stimmanteil_results:
                id, name, short_name, stimmenanzahl, prozentualer_anteil = result

                stimmanteile.append(
                    Stimmanteil(
                        party=Partei(id=id, name=name, shortname=short_name),
                        share=prozentualer_anteil,
                        absolute=int(stimmenanzahl)
                    )
                )

            return stimmanteile

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

    async def get_ueberhang(
        wahlid: StrictInt,
        parteiid: StrictInt,
        self,
    ) -> Ueberhang:
        try:
            with db_session() as db:
                ueberhang_query = text('''
                            SELECT b.*, sk.drohender_ueberhang 
                            FROM mindestsitzanspruch_partei_bundesland sk 
                            JOIN bundeslaender b ON b.id = sk.bundesland_id 
                            WHERE wahl_id = :wahlId AND partei_id = :parteiId
                            ''')
                ueberhang_results = db.execute(ueberhang_query,
                    {"wahlId": wahlid, "parteiId": parteiid}
                ).fetchall()

                if not ueberhang_results:
                    raise HTTPException(status_code=404, detail="No ueberhang found")

                ueberhang = Ueberhang(bundeslaender=[])
                for result in ueberhang_results:
                    id, name, drohender_ueberhang = result

                    ueberhang.bundeslaender.append(
                        UeberhangBundesland(
                            bundesland=Bundesland(
                                id=id,
                                name=name
                            ),
                            ueberhang=drohender_ueberhang
                        )
                    )

            return ueberhang

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


