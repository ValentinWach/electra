# coding: utf-8

from typing import Dict, List  # noqa: F401
import importlib
import pkgutil

from .wahlkreis_api_base import BaseWahlkreisApi

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

from ..models.extra_models import TokenModel  # noqa: F401
from pydantic import StrictBool, StrictInt
from typing import List, Optional
from ..models.overview_wahlkreis import OverviewWahlkreis
from ..models.stimmanteil import Stimmanteil
from ..models.winning_parties import WinningParties
from ..models.auslaenderanteil import Auslaenderanteil
from ..models.einkommen import Einkommen


router = APIRouter()


@router.get(
    "/results/{wahlid}/overview/wahlkreis/{wahlkreisid}",
    responses={
        200: {"model": OverviewWahlkreis, "description": "Returning the overview of the election in the wahlkreis"},
    },
    tags=["Wahlkreis"],
    response_model_by_alias=True,
)
async def get_overview_wahlkreis(
    wahlid: StrictInt = Path(..., description=""),
    wahlkreisid: StrictInt = Path(..., description=""),
    generatefromaggregate: Optional[str] = Query("true", alias="generatefromaggregate"),
) -> OverviewWahlkreis:
    generatefromaggregate_bool = generatefromaggregate.lower() == "true"
    return await BaseWahlkreisApi.get_overview_wahlkreis(wahlid, wahlkreisid, generatefromaggregate_bool, self=None)


@router.get(
    "/results/{wahlid}/stimmanteil/zweitstimmen/wahlkreis/{wahlkreisid}",
    responses={
        200: {"model": List[Stimmanteil], "description": "Returning the zweitstimmen of the election in the wahlkreis"},
    },
    tags=["Wahlkreis"],
    response_model_by_alias=True,
)
async def get_stimmanteil_zweitstimmen_wahlkreis(
    wahlid: StrictInt = Path(..., description=""),
    wahlkreisid: StrictInt = Path(..., description=""),
    generatefromaggregate: Optional[str] = Query("true", alias="generatefromaggregate"),
) -> List[Stimmanteil]:
    generatefromaggregate_bool = generatefromaggregate.lower() == "true"
    return await BaseWahlkreisApi.get_stimmanteil_zweitstimmen_wahlkreis(wahlid, wahlkreisid, generatefromaggregate_bool, self=None)

@router.get(
    "/results/{wahlid}/stimmanteil/erststimmen/wahlkreis/{wahlkreisid}",
    responses={
        200: {"model": List[Stimmanteil], "description": "Returning the erststimmen of the election in the wahlkreis"},
    },
    tags=["Wahlkreis"],
    response_model_by_alias=True,
)
async def get_stimmanteil_erststimmen_wahlkreis(
    wahlid: StrictInt = Path(..., description=""),
    wahlkreisid: StrictInt = Path(..., description=""),
    generatefromaggregate: Optional[str] = Query("true", alias="generatefromaggregate"),
) -> List[Stimmanteil]:
    generatefromaggregate_bool = generatefromaggregate.lower() == "true"
    return await BaseWahlkreisApi.get_stimmanteil_erststimmen_wahlkreis(wahlid, wahlkreisid, generatefromaggregate_bool, self=None)


@router.get(
    "/results/{wahlid}/winningparties/wahlkreis/{wahlkreisid}",
    responses={
        200: {"model": WinningParties, "description": "Returning the winning parties of the election per wahlkreis"},
    },
    tags=["Wahlkreis"],
    response_model_by_alias=True,
)
async def get_winning_parties_wahlkreis(
    wahlid: StrictInt = Path(..., description=""),
    wahlkreisid: StrictInt = Path(..., description=""),
) -> WinningParties:
    return await BaseWahlkreisApi.get_winning_parties_wahlkreis(wahlid, wahlkreisid, self=None)

@router.get(
    "/results/{wahlid}/winningparties/wahlkreis",
    responses={
        200: {"model": WinningParties, "description": "Returning the winning parties of the election"},
    },
    tags=["Wahlkreis"],
    response_model_by_alias=True,
)
async def get_winning_parties_wahlkreis(
    wahlid: StrictInt = Path(..., description=""),
) -> WinningParties:
    return await BaseWahlkreisApi.get_winning_parties(wahlid, self=None)

