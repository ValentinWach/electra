# coding: utf-8

from fastapi.testclient import TestClient


from pydantic import StrictBool, StrictInt  # noqa: F401
from typing import List, Optional  # noqa: F401
from openapi_server.models.overview_wahlkreis import OverviewWahlkreis  # noqa: F401
from openapi_server.models.stimmanteil import Stimmanteil  # noqa: F401
from openapi_server.models.winning_parties import WinningParties  # noqa: F401


def test_get_overview_wahlkreis(client: TestClient):
    """Test case for get_overview_wahlkreis

    
    """
    params = [("generatefromaggregate", True)]
    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/results/{wahlid}/overview/wahlkreis/{wahlkreisid}".format(wahlid=56, wahlkreisid=56),
    #    headers=headers,
    #    params=params,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_get_stimmanteil_wahlkreis(client: TestClient):
    """Test case for get_stimmanteil_wahlkreis

    
    """
    params = [("generatefromaggregate", True)]
    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/results/{wahlid}/stimmanteil/wahlkreis/{wahlkreisid}".format(wahlid=56, wahlkreisid=56),
    #    headers=headers,
    #    params=params,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_get_winning_parties_wahlkreis(client: TestClient):
    """Test case for get_winning_parties_wahlkreis

    
    """

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/results/{wahlid}/winningparties/wahlkreis/{wahlkreisid}".format(wahlid=56, wahlkreisid=56),
    #    headers=headers,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200

