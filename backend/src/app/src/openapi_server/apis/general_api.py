# coding: utf-8
from typing import Dict, List  # noqa: F401
import importlib
import pkgutil

from openapi_server.apis.general_api_base import BaseGeneralApi
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
from typing import List
from openapi_server.models.bundesland import Bundesland
from openapi_server.models.wahl import Wahl
from openapi_server.models.wahlkreis import Wahlkreis
# app/src/openapi_server/apis/general_api.py

router = APIRouter()

ns_pkg = openapi_server.impl
for _, name, _ in pkgutil.iter_modules(ns_pkg.__path__, ns_pkg.__name__ + "."):
    importlib.import_module(name)

@router.get(
    "/",
    responses={
        200: {"model": str, "description": "Returning the string 'electra'"},
    },
    tags=["General"],
    response_model_by_alias=True,
)
async def get_wahlen(self=None) -> str:
    return "Electra"

@router.get(
    "/wahlen",
    responses={
        200: {"model": List[Wahl], "description": "Returning all elections"},
    },
    tags=["General"],
    response_model_by_alias=True,
)
async def get_wahlen(
self=None) -> List[Wahl]:
    return await BaseGeneralApi.get_wahlen(self)

@router.get(
    "/bundeslaender",
    responses={
        200: {"model": List[Wahl], "description": "Returning all bundeslaender"},
    },
    tags=["General"],
    response_model_by_alias=True,
)
async def get_bundeslaender(
self=None) -> List[Bundesland]:
    return await BaseGeneralApi.get_bundeslaender(self)

@router.get(
    "/wahlkreise",
    responses={
        200: {"model": List[Wahlkreis], "description": "Returning all wahlkreise"},
    },
    tags=["General"],
    response_model_by_alias=True,
)
async def get_wahlkreise(
self=None) -> List[Wahlkreis]:
    return await BaseGeneralApi.get_wahlkreise(self)
