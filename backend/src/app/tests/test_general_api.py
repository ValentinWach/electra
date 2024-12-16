# coding: utf-8

from fastapi.testclient import TestClient


from typing import List  # noqa: F401
from openapi_server.models.wahl import Wahl  # noqa: F401


def test_get_wahlen(client: TestClient):
    """Test case for get_wahlen

    
    """

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/wahlen",
    #    headers=headers,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200

