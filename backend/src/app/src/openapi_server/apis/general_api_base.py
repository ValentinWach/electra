# coding: utf-8
from cgitb import text
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
from sqlalchemy import text



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
                wahlkreis_query = text('''
                            SELECT w.id, w.name, b.*
                            FROM wahlkreise w JOIN bundeslaender b ON b.id = bundesland_id;
                            ''')
                # Execute the query with parameterized input, avoiding direct string interpolation
                wahlkreis_results = db.execute(wahlkreis_query).fetchall()

            if not wahlkreis_results:
                raise HTTPException(status_code=404, detail="No winners found")

            # Return the WinningParties object with the filled lists
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
