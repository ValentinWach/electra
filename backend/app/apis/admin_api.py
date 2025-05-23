# coding: utf-8

from typing import Dict, List  # noqa: F401
import importlib
import pkgutil

from .admin_api_base import BaseAdminApi
from typing_extensions import Annotated
from typing import Any, List, Optional, Tuple, Union


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
    UploadFile,
    File
)

from fastapi.security import OAuth2PasswordBearer
from pydantic import Field, StrictBytes, StrictInt, StrictStr
from typing import List

from ..models.extra_models import TokenModel  # noqa: F401

router = APIRouter()

@router.post(
    "/admin/batch-vote",
    responses={
        200: {"description": "Batch voting successfully processed."},
        400: {"description": "Invalid request, e.g., missing or invalid CSV file."},
    },
    tags=["Admin"],
    summary="Accepts a CSV file for batch voting.",
    response_model_by_alias=True,
)
async def batch_vote(
    file: UploadFile = File(..., description="A CSV file with the columns `wahl_id`, `wahlkreis_id`, `direktkandidat_id`, `partei_id`."),
) -> None:
    admin_api = BaseAdminApi()
    return await admin_api.batch_vote(file)

@router.post(
    "/admin/generate/generatetoken/{wahlid}/{wahlkreisid}",
    responses={
        200: {"model": List[str], "description": "Returning the generated token"},
    },
    tags=["Admin"],
    response_model_by_alias=True,
)
async def generate_token(
    wahlid: StrictInt = Path(..., description=""),
    wahlkreisid: StrictInt = Path(..., description=""),
    amount: StrictInt = Body(None, description=""),
    idNumbers: List[StrictStr] = Body(None, description=""),
):
    admin_api = BaseAdminApi()
    return await admin_api.generate_token(wahlid, wahlkreisid, amount, idNumbers)


@router.post(
    "/admin/refresh",
    responses={
        200: {"description": "Successfully refreshed all materialized views."},
        400: {"description": "Failed to refresh materialized views."},
    },
    tags=["Admin"],
    response_model_by_alias=True,
)
async def refresh() -> None:
    admin_api = BaseAdminApi()
    return await admin_api.refresh()