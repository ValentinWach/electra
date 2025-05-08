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

from openapi_server.models.authenticated_response import AuthenticatedResponse
from openapi_server.models.authentication_request import AuthenticationRequest
from openapi_server.models.direktkandidaten import Direktkandidaten
from openapi_server.models.extra_models import TokenModel  # noqa: F401
from pydantic import StrictInt
from openapi_server.models.vote_request import VoteRequest
from openapi_server.models.wahlzettel_parteien import WahlzettelParteien

router = APIRouter()

ns_pkg = openapi_server.impl
for _, name, _ in pkgutil.iter_modules(ns_pkg.__path__, ns_pkg.__name__ + "."):
    importlib.import_module(name)


@router.post(
    "/elect/authenticate",
    responses={
        200: {"model": AuthenticatedResponse, "description": "User successfully authenticated"},
        401: {"description": "Invalid authentication token"},
    },
    tags=["Elect"],
    response_model_by_alias=True,
)
async def authenticate(
    authentication_request: AuthenticationRequest = Body(None, description=""),
) -> AuthenticatedResponse:
    elect_api = BaseElectApi()
    return await elect_api.authenticate(authentication_request)

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
    elect_api = BaseElectApi()
    return await elect_api.get_direktkandidaten(wahlid, wahlkreisid)

@router.get(
    "/elect/{wahlid}/parteien/{wahlkreisid}",
    responses={
        200: {"model": WahlzettelParteien, "description": "Returning the competing parties per wahlkreis"},
    },
    tags=["Elect"],
    response_model_by_alias=True,
)
async def get_competing_parties(
    wahlid: StrictInt = Path(..., description=""),
    wahlkreisid: StrictInt = Path(..., description=""),
) -> WahlzettelParteien:
    return await BaseElectApi.get_competing_parties(wahlid, wahlkreisid, self=None)


@router.post(
    "/elect/vote",
    responses={
        200: {"description": "Vote successfully cast"},
        400: {"description": "Invalid request, e.g. the partyid or directCandidateId is not valid for the tokens wahlkreis"},
        401: {"description": "Invalid authentication token"},
    },
    tags=["Elect"],
    response_model_by_alias=True,
)
async def vote(
    vote_request: VoteRequest = Body(None, description=""),
) -> None:
    elect_api = BaseElectApi()
    return await elect_api.vote(vote_request)

