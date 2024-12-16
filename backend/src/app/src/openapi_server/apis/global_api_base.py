# coding: utf-8
import pdb
from fastapi import HTTPException
from typing import ClassVar, Dict, List, Tuple  # noqa: F401

from pydantic import StrictInt
from typing import List
from sqlalchemy import text
from openapi_server.models.abgeordneter import Abgeordneter
from openapi_server.models.closest_winners import ClosestWinners
from openapi_server.models.seat_distribution import SeatDistribution
from openapi_server.models.seat_distribution_distribution_inner import SeatDistributionDistributionInner
from openapi_server.models.partei import Partei
from openapi_server.models.stimmanteil import Stimmanteil
from openapi_server.models.wahl import Wahl
from openapi_server.database.models import Wahl as WahlModel
from openapi_server.database.connection import Session as db_session


class BaseGlobalApi:
    subclasses: ClassVar[Tuple] = ()

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        BaseGlobalApi.subclasses = BaseGlobalApi.subclasses + (cls,)
    async def get_abgeordnete(
        self,
        wahlid: StrictInt,
    ) -> List[Abgeordneter]:
        ...


    async def get_closest_winners(
        wahlId: StrictInt,
        self
    ) -> List[ClosestWinners]:
        try:
            # Query the database for elections
            with db_session() as db:

                closest_winners = []

                bundestag_parties_query = text('''
                    SELECT bp.parteien_id
                    FROM bundestag_parties bp
                    WHERE bp.wahlen_id = :wahlid
                ''')

                bundestag_parties_results = db.execute(bundestag_parties_query, {"wahlid": wahlId}).fetchall()
                for row in bundestag_parties_results:
                    party_id = row[0]

                    # Query for party details
                    party_query = text('''
                        SELECT id, name, "shortName"
                        FROM parteien
                        WHERE id = :partyid
                    ''')
                    party_results = db.execute(party_query, {"partyid": party_id}).fetchall()

                    # Query for closest winners
                    closest_for_party_query = text('''
                        SELECT wks.partei_id, wks.wahlkreis_id, wks.kandidat_id, result_status
                        FROM wahlkreis_knappste_sieger wks
                        WHERE wks.wahl_id = :wahlid and wks.partei_id = :partyid
                    ''')
                    closest_for_party_results = db.execute(closest_for_party_query,
                                                           {"wahlid": wahlId, "partyid": party_id}).fetchall()

                    # Create the ClosestWinners instance for the current party
                    closest_winner = ClosestWinners(
                        party=Partei(id=party_results[0][0], name=party_results[0][1], shortName=party_results[0][2]),
                        closest_type=closest_for_party_results[0][3],  # 'result_status' from closest query
                        closest_winners=[]  # Initialize an empty list for the closest winners
                    )

                    # Process each closest winner entry
                    for row in closest_for_party_results:
                        # Query for the candidate (abgeordneter) details
                        abgeordneter_query = text('''
                            SELECT k.id, k.name, k.firstname, k."yearOfBirth", k.profession
                            FROM kandidaten k
                            WHERE k.id = :kandidaten_id
                        ''')
                        abgeordneter_results = db.execute(abgeordneter_query, {"kandidaten_id": row[2]}).fetchall()

                        # If candidate exists, populate closest_winner with the candidate information
                        if abgeordneter_results:
                            closest_winner.closest_winners.append(
                                Abgeordneter(
                                    id=abgeordneter_results[0][0],
                                    name=abgeordneter_results[0][1],
                                    firstname=abgeordneter_results[0][2],
                                    year_of_birth=abgeordneter_results[0][3],
                                    profession=abgeordneter_results[0][4],
                                    party=Partei(id=party_id, name=party_results[0][1], shortName=party_results[0][2])
                                )
                            )

                    # Append the populated ClosestWinners instance to the list
                    closest_winners.append(closest_winner)

            return closest_winners  # Return the list of closest winners

        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    async def get_sitzverteilung(
        wahlId: StrictInt,
        self
    ) -> SeatDistribution:
        try:
            # Query the database for elections
            with db_session() as db:
                query = text('''
                                SELECT parteien."shortName", name, partei_id, ov_sitzkontingente_erhoehung.sitze_nach_erhoehung, stimmen_sum 
                                FROM ov_sitzkontingente_erhoehung
                                JOIN parteien ON ov_sitzkontingente_erhoehung.partei_id = parteien.id
                                WHERE ov_sitzkontingente_erhoehung.wahl_id = :wahlid
                            ''')
                # Execute the query with parameterized input, avoiding direct string interpolation
                query_results = db.execute(query, {"wahlid": wahlId}).fetchall()
            if not query_results:
                raise HTTPException(status_code=404, detail="No elections found")
            total_seats = 0
            distribution = []

            for row in query_results:
                shortname, name, party_id, seats, total = row

                # Parse individual party details
                party = Partei(id=party_id, name=name, shortName=shortname)

                # Add to distribution list
                distribution_inner = SeatDistributionDistributionInner(
                    party=party,
                    seats=int(seats)  # Convert Decimal to int
                )
                distribution.append(distribution_inner)

                # Update total seats
                total_seats = int(total)  # Same total for all rows; will overwrite

            return SeatDistribution(distribution=distribution, numberofseats=total_seats)

        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


    async def get_stimmanteil(
        wahlId: StrictInt,
        self,
    ) -> List[Stimmanteil]:
        try:
            with db_session() as db:
                stimmanteil_query = text('''
                            SELECT
                                parteien_id,
                                stimmen_sum,
                                ROUND(
                                    (stimmen_sum * 100.0) /
                                    (SELECT SUM(stimmen_sum)
                                     FROM zweitstimmen_partei
                                     WHERE wahlen_id = z.wahlen_id),
                                    2
                                ) AS prozentualer_anteil
                            FROM
                                zweitstimmen_partei z
                            WHERE wahlen_id = :wahlId;
                            ''')
                # Execute the query with parameterized input, avoiding direct string interpolation
                stimmanteil_results = db.execute(stimmanteil_query,
                    {"wahlId": wahlId}
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
                        party=Partei(id=partei.id, name=partei.name, shortName=partei.shortName),
                        share=prozentualer_anteil,
                        absolute=int(stimmenanzahl)
                    )
                )

            return stimmanteile

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
