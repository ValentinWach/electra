# coding: utf-8

from typing import Dict, List  # noqa: F401
import importlib
import pkgutil

from openapi_server.apis.global_api_base import BaseGlobalApi
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
from typing import List
from openapi_server.models.abgeordneter import Abgeordneter
from openapi_server.models.closest_winners import ClosestWinners
from openapi_server.models.seat_distribution import SeatDistribution
from openapi_server.models.stimmanteil import Stimmanteil
from openapi_server.models.ueberhang import Ueberhang

router = APIRouter()

ns_pkg = openapi_server.impl
for _, name, _ in pkgutil.iter_modules(ns_pkg.__path__, ns_pkg.__name__ + "."):
    importlib.import_module(name)


@router.get(
    "/results/{wahlid}/abgeordnete",
    responses={
        200: {"model": List[Abgeordneter], "description": "Returning the deputies of the election"},
    },
    tags=["Global"],
    response_model_by_alias=True,
)
async def get_abgeordnete(
    wahlid: StrictInt = Path(..., description=""),
) -> List[Abgeordneter]:
    return await BaseGlobalApi.get_abgeordnete(wahlid, self=None)


@router.get(
    "/results/{wahlid}/{parteiid}/closestwinners",
    responses={
        200: {"model": ClosestWinners, "description": "Returning the closest winners of the selected party"},
    },
    tags=["Global"],
    response_model_by_alias=True,
)
async def get_closest_winners(
    wahlid: StrictInt = Path(..., description=""),
    parteiid: StrictInt = Path(..., description=""),
self=None) -> ClosestWinners:
    return await BaseGlobalApi.get_closest_winners(wahlid, parteiid, self)


@router.get(
    "/results/{wahlid}/sitzverteilung",
    responses={
        200: {"model": SeatDistribution, "description": "Returning the seat distribution of the election"},
    },
    tags=["Global"],
    response_model_by_alias=True,
)
async def get_sitzverteilung(
    wahlid: StrictInt = Path(..., description=""),
self=None) -> SeatDistribution:
    return await BaseGlobalApi.get_sitzverteilung(wahlid, self)


@router.get(
    "/results/{wahlid}/stimmanteil/",
    responses={
        200: {"model": List[Stimmanteil], "description": "Returning the global results of the election"},
    },
    tags=["Global"],
    response_model_by_alias=True,
)
async def get_stimmanteil(
    wahlid: StrictInt = Path(..., description=""),
) -> List[Stimmanteil]:
    return await BaseGlobalApi.get_stimmanteil(wahlid, self=None)

@router.get(
    "/results/{wahlid}/ueberhang/{parteiid}",
    responses={
        200: {"model": Ueberhang, "description": "Returning the ueberhang per selected party"},
    },
    tags=["Global"],
    response_model_by_alias=True,
)
async def get_ueberhang(
    wahlid: StrictInt = Path(..., description=""),
    parteiid: StrictInt = Path(..., description=""),
) -> Ueberhang:
    if not BaseGlobalApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseGlobalApi.subclasses[0]().get_ueberhang(wahlid, parteiid)
