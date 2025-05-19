# coding: utf-8

from typing import Dict, List  # noqa: F401
import importlib
import pkgutil

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

from .global_api_base import BaseGlobalApi
from ..models.extra_models import TokenModel  # noqa: F401
from pydantic import StrictInt
from typing import List
from ..models.abgeordneter import Abgeordneter
from ..models.closest_winners import ClosestWinners
from ..models.seat_distribution import SeatDistribution
from ..models.stimmanteil import Stimmanteil
from ..models.ueberhang import Ueberhang

router = APIRouter()

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
    "/results/{wahlid}/stimmanteil/zweitstimmen",
    responses={
        200: {"model": List[Stimmanteil], "description": "Returning the zweitstimmen results of the election"},
    },
    tags=["Global"],
    response_model_by_alias=True,
)
async def get_stimmanteil_zweitstimmen(
    wahlid: StrictInt = Path(..., description=""),
) -> List[Stimmanteil]:
    return await BaseGlobalApi.get_stimmanteil_zweitstimmen(wahlid, self=None)

@router.get(
    "/results/{wahlid}/stimmanteil/erststimmen",
    responses={
        200: {"model": List[Stimmanteil], "description": "Returning the erststimmen results of the election"},
    },
    tags=["Global"],
    response_model_by_alias=True,
)
async def get_stimmanteil_erstimmen(
    wahlid: StrictInt = Path(..., description=""),
) -> List[Stimmanteil]:
    return await BaseGlobalApi.get_stimmanteil_erststimmen(wahlid, self=None)

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
    return await BaseGlobalApi.get_ueberhang(wahlid, parteiid, self=None)
