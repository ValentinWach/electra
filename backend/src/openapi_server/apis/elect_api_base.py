# coding: utf-8

import hashlib
from collections import defaultdict
from fastapi import HTTPException
from typing import ClassVar, Dict, List, Tuple  # noqa: F401

from pydantic import StrictInt
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from openapi_server.database.models import Erststimme, Zweitstimme, Token
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

    async def validate_votes(self, wahl_id, wahlkreis_id, vote_request):

        if not vote_request.direct_candidate_id and not vote_request.party_id:
            raise HTTPException(
                status_code=400,
                detail="Invalid request: Both direct candidate ID and party ID are missing.",
            )

        with db_session() as db:
            if vote_request.direct_candidate_id:
                direktkandidatur_id_query = text("""
                    SELECT 1 FROM wahlkreiskandidaturen WHERE wahl_id = :wahlid AND wahlkreis_id = :wahlkreisid AND kandidat_id = :direct_candidate_id LIMIT 1
                """)

                direktkandidatur_id_query = db.execute(direktkandidatur_id_query, {"direct_candidate_id": vote_request.direct_candidate_id, "wahlid": wahl_id, "wahlkreisid": wahlkreis_id}).fetchone()
                if not direktkandidatur_id_query:
                    raise HTTPException(
                        status_code=400,
                        detail="Invalid request: the direct candidate ID is not valid for the tokens wahlkreis"
                    )


            if vote_request.party_id:
                partei_validity_query = text("""
                                SELECT 1 FROM listenkandidaturen l JOIN wahlkreise w ON l.bundesland_id = w.bundesland_id WHERE l.wahl_id = :wahlid AND l.partei_id = :partyid AND w.id = :wahlkreisid LIMIT 1;
                            """)

                partei_validity_result = db.execute(partei_validity_query,
                                                            {"partyid": vote_request.party_id,
                                                             "wahlid": wahl_id, "wahlkreisid": wahlkreis_id}).fetchone()
                if not partei_validity_result:
                    raise HTTPException(
                        status_code=400,
                        detail="Invalid request: the party ID is not valid for the tokens wahlkreis"
                    )


            return vote_request.direct_candidate_id is not None, vote_request.party_id is not None

    async def validate_data(self, token_value, id_number):
        with db_session() as db:

            combined_string = token_value + id_number

            hash_value = hashlib.sha256(combined_string.encode()).hexdigest()

            token_validity_query = text("""
                SELECT w.id, w.date, wk.id, wk.name, b.id, b.name, t.voted
                FROM token t
                INNER JOIN wahlen w ON t.wahl_id = w.id
                INNER JOIN wahlkreise wk ON t.wahlkreis_id = wk.id
                INNER JOIN bundeslaender b on b.id = wk.bundesland_id
                WHERE t.hash = :hash_value
            """)

            token_validity_result = db.execute(token_validity_query, {"hash_value": hash_value}).fetchone()

            if not token_validity_result or token_validity_result.voted == True:
                raise HTTPException(
                    status_code=401, detail="Invalid authentication token or ID number"
                )

            return token_validity_result, hash_value

    async def authenticate(self, authentication_request: AuthenticationRequest):
        try:
            token_value = authentication_request.token
            id_number = authentication_request.idNumber

            token_data, hash_value = await self.validate_data(token_value, id_number)

            wahl_id, date, wahlkreis_id, wahlkreis_name, bundesland_id, name, voted = token_data

            wahl = Wahl(
                id=wahl_id,
                var_date=date
            )

            wahlkreis = Wahlkreis(
                id=wahlkreis_id,
                name=wahlkreis_name,
                bundesland=Bundesland(
                    id=bundesland_id,
                    name=name
                )
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
        self,
        wahlid: StrictInt,
        wahlkreisid: StrictInt,
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

    async def vote(self, vote_request: VoteRequest):
        try:
            token_value = vote_request.token
            id_number = vote_request.idNumber
            token_data, hash_value = await self.validate_data(token_value, id_number)

            wahl_id, date, wahlkreis_id, wahlkreis_name, bundesland_id, name, voted = token_data

            direktkandidat_valid, partei_valid = await self.validate_votes(wahl_id, wahlkreis_id, vote_request)

            with db_session() as db:
                if direktkandidat_valid:
                    direktkandidatur_id_query = text("""
                        SELECT id FROM wahlkreiskandidaturen WHERE wahl_id = :wahlid AND wahlkreis_id = :wahlkreisid AND kandidat_id = :direct_candidate_id LIMIT 1
                    """)
                    direktkandidatur_id = db.execute(direktkandidatur_id_query, {"direct_candidate_id": vote_request.direct_candidate_id, "wahlid": wahl_id, "wahlkreisid": wahlkreis_id}).fetchone()
                    erststimme = Erststimme(wahlkreiskandidatur_id=direktkandidatur_id.id)
                    db.add(erststimme)
                if partei_valid:
                    zweitstimme = Zweitstimme(wahl_id=wahl_id, wahlkreis_id=wahlkreis_id, partei_id=vote_request.party_id)
                    db.add(zweitstimme)
                token = db.query(Token).filter(Token.hash == hash_value).first()
                if token:
                    token.voted = True
                    db.add(token)
                db.commit()

        except SQLAlchemyError as db_ex:
            db.rollback()
            raise HTTPException(
                status_code=500,
                detail=f"Database operation failed: {str(db_ex)}"
            )
        except HTTPException as http_ex:
            raise http_ex
        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Internal server error: {str(e)}"
            )


