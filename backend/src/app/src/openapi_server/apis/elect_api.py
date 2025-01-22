# coding: utf-8

from typing import Dict, List  # noqa: F401
import importlib
import pkgutil

from openapi_server.apis.elect_api_base import BaseElectApi
import openapi_server.impl

from fastapi import (  # noqa: F401
    APIRouter,
    Body,
    Cookie,
    Depends,
    Form,
    Header,
    HTTPException,
    Path,
    Query,
    Response,
    Security,
    status,
)

from openapi_server.models.extra_models import TokenModel  # noqa: F401
from pydantic import StrictInt
from typing import Any
from openapi_server.models.authentication_details import AuthenticationDetails
from openapi_server.models.direktkandidaten import Direktkandidaten
from openapi_server.models.partei_wahlzettel import ParteiWahlzettel
from openapi_server.models.session_token import SessionToken


router = APIRouter()

ns_pkg = openapi_server.impl
for _, name, _ in pkgutil.iter_modules(ns_pkg.__path__, ns_pkg.__name__ + "."):
    importlib.import_module(name)


@router.post(
    "/elect/{wahlid}/authenticate/{wahlkreisid}",
    responses={
        200: {"model": SessionToken, "description": "User successfully authenticated"},
        401: {"description": "Invalid authentication token"},
    },
    tags=["Elect"],
    summary="Authenticate with token",
    response_model_by_alias=True,
)
async def elect_wahlid_authenticate_wahlkreisid_post(
    wahlid: StrictInt = Path(..., description=""),
    wahlkreisid: StrictInt = Path(..., description=""),
    authentication_details: AuthenticationDetails = Body(None, description=""),
) -> SessionToken:
    if not BaseElectApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseElectApi.subclasses[0]().elect_wahlid_authenticate_wahlkreisid_post(wahlid, wahlkreisid, authentication_details)


@router.get(
    "/elect/{wahlid}/parteien/{wahlkreisid}",
    responses={
        200: {"model": ParteiWahlzettel, "description": "Returning the competing parties per wahlkreis"},
    },
    tags=["Elect"],
    response_model_by_alias=True,
)
async def get_competing_parties(
    wahlid: StrictInt = Path(..., description=""),
    wahlkreisid: StrictInt = Path(..., description=""),
) -> ParteiWahlzettel:
    return await BaseElectApi.get_competing_parties(wahlid, wahlkreisid, self=None)


@router.get(
    "/elect/{wahlid}/direktkandidaten/{wahlkreisid}",
    responses={
        200: {"model": Direktkandidaten, "description": "Returning the direktkandidaten per wahlkreis"},
    },
    tags=["Elect"],
    response_model_by_alias=True,
)
async def get_direktkandidaten(
    wahlid: StrictInt = Path(..., description=""),
    wahlkreisid: StrictInt = Path(..., description=""),
) -> Direktkandidaten:
    return await BaseElectApi.get_direktkandidaten(wahlid, wahlkreisid, self=None)
