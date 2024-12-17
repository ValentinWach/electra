# coding: utf-8
from http.client import HTTPException
from typing import ClassVar, Dict, List, Tuple  # noqa: F401

from typing import List
from openapi_server.models.wahl import Wahl
from openapi_server.models.bundesland import Bundesland
from openapi_server.database.models import Wahl as WahlModel
from openapi_server.database.models import Bundesland as BundelandModel
from openapi_server.database.connection import Session as db_session  # Import Session from connection.py
from openapi_server.models.wahlkreis import Wahlkreis
from openapi_server.database.models import Partei as ParteiModel
from openapi_server.models.partei import Partei
from openapi_server.database.models import Wahlkreis as WahlkreisModel


def to_dict(instance):
    """Convert SQLAlchemy instance to dictionary"""
    # Return a dictionary with column names as keys and column values as values
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
            # Query the database for elections
            with db_session() as db:
                elections = db.query(WahlModel).all()  # This retrieves all rows from the "wahlen" table

            if not elections:
                raise HTTPException(status_code=404, detail="No elections found")

            election_dicts = [to_dict(election) for election in elections]

            election_list = [Wahl.model_validate(election) for election in election_dicts]  # Use model_validate()

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

            bundesland_list = [Bundesland.model_validate(bundesland) for bundesland in bundesland_dicts]  # Use model_validate()

            return bundesland_list

        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


    async def get_wahlkreise(
            self
    ) -> List[Wahlkreis]:
        try:
            with db_session() as db:
                wahlkreise = db.query(WahlkreisModel).all()

            if not wahlkreise:
                raise HTTPException(status_code=404, detail="No wahlkreise found")

            wahlkreis_dicts = [to_dict(wahlkreis) for wahlkreis in wahlkreise]

            wahlkreis_list = [Wahlkreis.model_validate(wahlkreis) for wahlkreis in wahlkreis_dicts]  # Use model_validate()

            return wahlkreis_list

        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    async def get_parteien(
            self
    ) -> List[Partei]:
        try:
            with db_session() as db:
                parteien = db.query(ParteiModel).all()

            if not parteien:
                raise HTTPException(status_code=404, detail="No wahlkreise found")

            partei_dicts = [to_dict(partei) for partei in parteien]

            partei_list = [Partei.model_validate({**partei, "shortname": partei.pop("shortName")}) for partei in
                           partei_dicts]

            return partei_list

        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
