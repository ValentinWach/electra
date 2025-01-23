# coding: utf-8
from cgitb import text
from fastapi import HTTPException
from typing import ClassVar, Dict, List, Tuple  # noqa: F401

from typing import List
from openapi_server.models.wahl import Wahl
from openapi_server.models.bundesland import Bundesland
from openapi_server.database.models import Wahl as WahlModel
from openapi_server.database.models import Bundesland as BundelandModel
from openapi_server.database.connection import Session as db_session
from openapi_server.models.wahlkreis import Wahlkreis
from openapi_server.models.partei import Partei
from sqlalchemy import text
from pydantic import StrictInt


def to_dict(instance):
    return {column.name: getattr(instance, column.name) for column in instance.__table__.columns}


class BaseGeneralApi:
    subclasses: ClassVar[Tuple] = ()

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        BaseGeneralApi.subclasses = BaseGeneralApi.subclasses + (cls,)
    async def get_wahlen(
        self
    ) -> List[Wahl]:
        try:
            with db_session() as db:
                elections = db.query(WahlModel).all()

            if not elections:
                raise HTTPException(status_code=404, detail="No elections found")

            election_dicts = [to_dict(election) for election in elections]

            election_list = [Wahl.model_validate(election) for election in election_dicts]

            return election_list

        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


    async def get_bundeslaender(
        self
    ) -> List[Bundesland]:
        try:
            with db_session() as db:
                bundeslaender = db.query(BundelandModel).all()

            if not bundeslaender:
                raise HTTPException(status_code=404, detail="No bundeslaender found")

            bundesland_dicts = [to_dict(bundesland) for bundesland in bundeslaender]

            bundesland_list = [Bundesland.model_validate(bundesland) for bundesland in bundesland_dicts]

            return bundesland_list

        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


    async def get_wahlkreise(
            self
    ) -> List[Wahlkreis]:
        try:
            with db_session() as db:
                wahlkreis_query = text('''
                            SELECT w.id, w.name, b.*
                            FROM wahlkreise w JOIN bundeslaender b ON b.id = bundesland_id;
                            ''')
                wahlkreis_results = db.execute(wahlkreis_query).fetchall()

            if not wahlkreis_results:
                raise HTTPException(status_code=404, detail="No winners found")

            wahlkreise = []
            for result in wahlkreis_results:
                id, name, bundesland_id, bundesland_name = result

                wahlkreise.append(
                    Wahlkreis(
                        id=id,
                        name=name,
                        bundesland=Bundesland(id=bundesland_id, name=bundesland_name),

                    )
                )

            return wahlkreise

        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    async def get_parteien(
            wahlId: StrictInt,
            self
    ) -> List[Partei]:
        try:
            with db_session() as db:
                parteien_query = text('''
                    SELECT DISTINCT p.id, p.name, p."shortName" from parteien p JOIN listenkandidaturen l ON p.id = l.partei_id WHERE wahl_id = :wahlid
                    UNION
                    SELECT DISTINCT p.id, p.name, p."shortName" from parteien p JOIN wahlkreiskandidaturen w ON p.id = w.partei_id WHERE wahl_id = :wahlid;
                ''')
                parteien_results = db.execute(parteien_query,
                                                       {"wahlid": wahlId}).fetchall()

                parteien = []
                for row in parteien_results:
                    parteien.append(
                        Partei(
                            id=row[0],
                            name=row[1],
                            shortname=row[2]
                        )
                    )

            return parteien

        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
