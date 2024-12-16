# coding: utf-8

from fastapi.testclient import TestClient


from pydantic import StrictInt  # noqa: F401
from typing import List  # noqa: F401
from openapi_server.models.abgeordneter import Abgeordneter  # noqa: F401
from openapi_server.models.closest_winners import ClosestWinners  # noqa: F401
from openapi_server.models.seat_distribution import SeatDistribution  # noqa: F401
from openapi_server.models.stimmanteil import Stimmanteil  # noqa: F401


def test_get_abgeordnete(client: TestClient):
    """Test case for get_abgeordnete

    
    """

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/results/{wahlid}/abgeordnete".format(wahlid=56),
    #    headers=headers,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_get_closest_winners(client: TestClient):
    """Test case for get_closest_winners

    
    """

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/results/{wahlid}/closestwinners".format(wahlid=56),
    #    headers=headers,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_get_sitzverteilung(client: TestClient):
    """Test case for get_sitzverteilung

    
    """

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/results/{wahlid}/sitzverteilung".format(wahlid=56),
    #    headers=headers,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_get_stimmanteil(client: TestClient):
    """Test case for get_stimmanteil

    
    """

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/results/{wahlid}/stimmanteil/{wahlkreisid}".format(wahlid=56, wahlkreisid=56),
    #    headers=headers,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200

