# coding: utf-8

from typing import Dict, List  # noqa: F401
import importlib
import pkgutil

from openapi_server.apis.wahlkreis_api_base import BaseWahlkreisApi
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
from pydantic import StrictBool, StrictInt
from typing import List, Optional
from openapi_server.models.overview_wahlkreis import OverviewWahlkreis
from openapi_server.models.stimmanteil import Stimmanteil
from openapi_server.models.winning_parties import WinningParties
from openapi_server.models.auslaenderanteil import Auslaenderanteil
from openapi_server.models.einkommen import Einkommen


router = APIRouter()

ns_pkg = openapi_server.impl
for _, name, _ in pkgutil.iter_modules(ns_pkg.__path__, ns_pkg.__name__ + "."):
    importlib.import_module(name)


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
    "/results/{wahlid}/stimmanteil/wahlkreis/{wahlkreisid}",
    responses={
        200: {"model": List[Stimmanteil], "description": "Returning the results of the election in the wahlkreis"},
    },
    tags=["Wahlkreis"],
    response_model_by_alias=True,
)
async def get_stimmanteil_wahlkreis(
    wahlid: StrictInt = Path(..., description=""),
    wahlkreisid: StrictInt = Path(..., description=""),
    generatefromaggregate: Optional[str] = Query("true", alias="generatefromaggregate"),
) -> List[Stimmanteil]:
    generatefromaggregate_bool = generatefromaggregate.lower() == "true"
    return await BaseWahlkreisApi.get_stimmanteil_wahlkreis(wahlid, wahlkreisid, generatefromaggregate_bool, self=None)


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

@router.get(
    "/results/{wahlid}/auslaenderanteil/{parteiid}/",
    responses={
        200: {"model": Auslaenderanteil, "description": "Returning the auslaenderanteil and zweitstimmen per selected party for all wahlkreise"},
    },
    tags=["Wahlkreis"],
    response_model_by_alias=True,
)
async def get_foreigners(
    wahlid: StrictInt = Path(..., description=""),
    parteiid: StrictInt = Path(..., description=""),
) -> Auslaenderanteil:
    return await BaseWahlkreisApi.get_foreigners(wahlid, parteiid, self=None)


@router.get(
    "/results/{wahlid}/income/{parteiid}/",
    responses={
        200: {"model": Einkommen, "description": "Returning the income and zweitstimmen per selected party for all wahlkreise"},
    },
    tags=["Wahlkreis"],
    response_model_by_alias=True,
)
async def get_income(
    wahlid: StrictInt = Path(..., description=""),
    parteiid: StrictInt = Path(..., description=""),
) -> Einkommen:
    return await BaseWahlkreisApi.get_income(wahlid, parteiid, self=None)
