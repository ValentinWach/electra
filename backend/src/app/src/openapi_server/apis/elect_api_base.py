# coding: utf-8
from collections import defaultdict
from http.client import HTTPException
from typing import ClassVar, Dict, List, Tuple  # noqa: F401

from pydantic import StrictInt
from typing import Any
from sqlalchemy import text

from openapi_server.models.abgeordneter import Abgeordneter
from openapi_server.models.authentication_details import AuthenticationDetails
from openapi_server.models.direktkandidaten import Direktkandidaten
from openapi_server.models.partei import Partei
from openapi_server.models.partei_wahlzettel import ParteiWahlzettel
from openapi_server.models.partei_wahlzettel_parteien_inner import ParteiWahlzettelParteienInner
from openapi_server.models.session_token import SessionToken

from openapi_server.database.connection import Session as db_session

class BaseElectApi:
    subclasses: ClassVar[Tuple] = ()

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        BaseElectApi.subclasses = BaseElectApi.subclasses + (cls,)

    async def elect_wahlid_authenticate_wahlkreisid_post(
        self,
        wahlid: StrictInt,
        wahlkreisid: StrictInt,
        authentication_details: AuthenticationDetails,
    ) -> SessionToken:
        ...


    async def get_competing_parties(
        wahlid: StrictInt,
        wahlkreisid: StrictInt,
        self,
    ) -> ParteiWahlzettel:
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
                    ParteiWahlzettelParteienInner(
                        partei=partei,
                        topfive=topfive
                    )
                    for partei, topfive in parteien_dict.items()
                ]

                partei_wahlzettel = ParteiWahlzettel(parteien=parteien_list)

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
