# coding: utf-8
from typing import Dict, List  # noqa: F401
import importlib
import pkgutil

from .general_api_base import BaseGeneralApi

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
from fastapi.security import OAuth2PasswordBearer

from pydantic import StrictInt
from ..models.extra_models import TokenModel  # noqa: F401
from typing import List
from ..models.bundesland import Bundesland
from ..models.partei import Partei
from ..models.wahl import Wahl
from ..models.wahlkreis import Wahlkreis

router = APIRouter()

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


@router.get(
    "/parteien/{wahlid}",
    responses={
        200: {"model": List[Partei], "description": "Returning all parties"},
    },
    tags=["General"],
    response_model_by_alias=True,
)
async def get_parteien(
        wahlid: StrictInt = Path(..., description=""),
self=None) -> List[Partei]:
    return await BaseGeneralApi.get_parteien(wahlid, self)



