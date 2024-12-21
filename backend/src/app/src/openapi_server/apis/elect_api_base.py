# coding: utf-8

from typing import ClassVar, Dict, List, Tuple  # noqa: F401

from pydantic import StrictInt
from typing import Any
from openapi_server.models.authentication_details import AuthenticationDetails
from openapi_server.models.direktkandidaten import Direktkandidaten
from openapi_server.models.partei_wahlzettel import ParteiWahlzettel
from openapi_server.models.session_token import SessionToken


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
        self,
        wahlid: StrictInt,
        wahlkreisid: StrictInt,
    ) -> ParteiWahlzettel:
        ...


    async def get_direktkandidaten(
        self,
        wahlid: StrictInt,
        wahlkreisid: StrictInt,
    ) -> Direktkandidaten:
        ...
