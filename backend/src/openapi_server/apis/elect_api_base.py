# coding: utf-8
from collections import defaultdict
from fastapi import HTTPException
from typing import ClassVar, Dict, List, Tuple  # noqa: F401

from pydantic import StrictInt
from sqlalchemy import text

from openapi_server.models.bundesland import Bundesland
from openapi_server.models.abgeordneter import Abgeordneter

from openapi_server.models.authenticated_response import AuthenticatedResponse
from openapi_server.models.authentication_request import AuthenticationRequest
from openapi_server.models.direktkandidaten import Direktkandidaten
from openapi_server.models.partei import Partei

from openapi_server.database.connection import Session as db_session
from openapi_server.models.vote_request import VoteRequest
from openapi_server.models.wahl import Wahl
from openapi_server.models.wahlkreis import Wahlkreis
from openapi_server.models.wahlzettel_partei_wrapper import WahlzettelParteiWrapper
from openapi_server.models.wahlzettel_parteien import WahlzettelParteien


class BaseElectApi:
    subclasses: ClassVar[Tuple] = ()

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        BaseElectApi.subclasses = BaseElectApi.subclasses + (cls,)

    async def authenticate(
            self,
            authentication_request: AuthenticationRequest,
    ) -> AuthenticatedResponse:
        try:
            token_value = authentication_request.token

            with db_session() as db:
                query = text("""
                    SELECT w.id, w.date, wk.id, wk.name, b.id, b.name
                    FROM token t
                    INNER JOIN wahlen w ON t.wahl_id = w.id
                    INNER JOIN wahlkreise wk ON t.wahlkreis_id = wk.id
                    INNER JOIN bundeslaender b on b.id = wk.bundesland_id
                    WHERE t.token = :token_value
                """)

                result = db.execute(query, {"token_value": token_value}).fetchone()

                if not result:
                    raise HTTPException(
                        status_code=401, detail="Invalid authentication token"
                    )
                wahl_id, date, wahlkreis_id, wahlkreis_name, bundesland_id, name = result

                bundesland = Bundesland(
                    id=bundesland_id,
                    name=name
                )

                wahl = Wahl(
                    id=wahl_id,
                    var_date=date
                )

                wahlkreis = Wahlkreis(
                    id=wahlkreis_id,
                    name=name,
                    bundesland=bundesland
                )

                return AuthenticatedResponse(
                    wahl=wahl,
                    wahlkreis=wahlkreis,
                )
        except HTTPException as http_ex:
            raise http_ex
        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Internal server error: {str(e)}"
            )


    async def get_competing_parties(
        wahlid: StrictInt,
        wahlkreisid: StrictInt,
        self,
    ) -> WahlzettelParteien:
        try:
            with db_session() as db:

                top_five_listenkandidaten_query = text('''
                           SELECT k.id, k.name, k.firstname, k."yearOfBirth", k.profession, p.id, p.name, p."shortName"
                           FROM listenkandidaturen lk JOIN kandidaten k on lk.kandidat_id = k.id 
                           JOIN parteien p ON lk.partei_id = p.id JOIN wahlkreise w ON w.id = :wahlkreisid
                           WHERE lk.wahl_id = :wahlid AND w.bundesland_id = lk.bundesland_id AND lk."listPosition" < 6;
                       ''')

                top_five_listenkandidaten_query_results = db.execute(top_five_listenkandidaten_query,
                                                      {"wahlid": wahlid, "wahlkreisid": wahlkreisid}).fetchall()

                parteien_dict = defaultdict(list)
                for row in top_five_listenkandidaten_query_results:
                    kandidat_id, name, firstname, year_of_birth, profession, partei_id, partei_name, partei_short_name = row

                    # Create a Partei object
                    partei = Partei(
                        id=partei_id,
                        name=partei_name,
                        shortname=partei_short_name
                    )

                    # Create an Abgeordneter object, including the party
                    abgeordneter = Abgeordneter(
                        id=kandidat_id,
                        name=name,
                        firstname=firstname,
                        year_of_birth=year_of_birth,
                        profession=profession,
                        party=partei
                    )

                    parteien_dict[partei].append(abgeordneter)

                parteien_list = [
                    WahlzettelParteiWrapper(
                        partei=partei,
                        topfive=topfive
                    )
                    for partei, topfive in parteien_dict.items()
                ]

                partei_wahlzettel = WahlzettelParteien(parteien=parteien_list)

            return partei_wahlzettel

        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


    async def get_direktkandidaten(
        wahlid: StrictInt,
        wahlkreisid: StrictInt,
        self,
    ) -> Direktkandidaten:
        try:
            with db_session() as db:

                direktkandidaten = Direktkandidaten(kandidaten=[])

                direktkandidaten_query = text('''
                    SELECT k.id, k.name, k.firstname, k."yearOfBirth", k.profession, p.id, p.name, p."shortName"
                    FROM wahlkreiskandidaturen wk JOIN parteien p ON wk.partei_id = p.id 
                    JOIN kandidaten k ON wk.kandidat_id = k.id
                    WHERE wk.wahl_id = :wahlid AND wk.wahlkreis_id = :wahlkreisid;
                ''')

                direktkandidaten_results = db.execute(direktkandidaten_query, {"wahlid": wahlid, "wahlkreisid": wahlkreisid}).fetchall()

                for row in direktkandidaten_results:

                    direktkandidaten.kandidaten.append(
                        Abgeordneter(
                            id=row[0],
                            name=row[1],
                            firstname=row[2],
                            year_of_birth=row[3],
                            profession=row[4],
                            party=Partei(id=int(row[5]), name=row[6], shortname=row[7])
                        )
                    )

            return direktkandidaten

        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    async def vote(
            self,
            vote_request: VoteRequest,
    ) -> None:
        ...
