# coding: utf-8

from typing import Dict, List, Optional  # noqa: F401
import importlib
import pkgutil

from .analysis_api_base import BaseAnalysisApi

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
from pydantic import StrictInt
from typing import List
from ..models.auslaenderanteil import Auslaenderanteil
from ..models.einkommen import Einkommen
from ..models.berufsgruppen import Berufsgruppen

router = APIRouter()


@router.get(
    "/results/{wahlid}/berufsgruppen/{parteiid}",
    responses={
        200: {"model": Berufsgruppen, "description": "Returning the berufsgruppen per selected party for all wahlkreise"},
    },
    tags=["Analysis"],
    response_model_by_alias=True,
)
async def get_berufsgruppen(
    wahlid: StrictInt = Path(..., description=""),
    parteiid: StrictInt = Path(..., description=""),
    only_abgeordnete: Optional[str] = Query("false", alias="only_abgeordnete"),
) -> Berufsgruppen:
    only_abgeordnete = only_abgeordnete.lower() == "true"
    analysis_api = BaseAnalysisApi()
    return await analysis_api.get_berufsgruppen(wahlid, parteiid, only_abgeordnete)

@router.get(
    "/results/{wahlid}/auslaenderanteil/{parteiid}/",
    responses={
        200: {"model": Auslaenderanteil, "description": "Returning the auslaenderanteil and zweitstimmen per selected party for all wahlkreise"},
    },
    tags=["Analysis"],
    response_model_by_alias=True,
)
async def get_foreigners(
    wahlid: StrictInt = Path(..., description=""),
    parteiid: StrictInt = Path(..., description=""),
) -> Auslaenderanteil:
    analysis_api = BaseAnalysisApi()
    return await analysis_api.get_foreigners(wahlid, parteiid)

@router.get(
    "/results/{wahlid}/income/{parteiid}/",
    responses={
        200: {"model": Einkommen, "description": "Returning the income and zweitstimmen per selected party for all wahlkreise"},
    },
    tags=["Analysis"],
    response_model_by_alias=True,
)
async def get_income(
    wahlid: StrictInt = Path(..., description=""),
    parteiid: StrictInt = Path(..., description=""),
) -> Einkommen:
    analysis_api = BaseAnalysisApi()
    return await analysis_api.get_income(wahlid, parteiid)
