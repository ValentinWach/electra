# coding: utf-8
import random
import string

from fastapi import HTTPException
from typing import ClassVar, Dict, List, Tuple  # noqa: F401
from openapi_server.database.connection import Session as db_session
from sqlalchemy import text, insert

from pydantic import StrictInt, StrictStr
from typing import List

from openapi_server.database.models import Token


class BaseAdminApi:
    subclasses: ClassVar[Tuple] = ()

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        BaseAdminApi.subclasses = BaseAdminApi.subclasses + (cls,)

    def verify_wahl_and_wahlkreis(self, db, wahlid: int, wahlkreisid: int) -> None:
        wahl_exists_query = text("SELECT 1 FROM wahlen WHERE id = :wahlid LIMIT 1")
        if not db.execute(wahl_exists_query, {"wahlid": wahlid}).fetchone():
            raise HTTPException(
                status_code=404, detail=f"wahlid {wahlid} does not exist in wahlen"
            )

        wahlkreis_exists_query = text("SELECT 1 FROM wahlkreise WHERE id = :wahlkreisid LIMIT 1")
        if not db.execute(wahlkreis_exists_query, {"wahlkreisid": wahlkreisid}).fetchone():
            raise HTTPException(
                status_code=404, detail=f"wahlkreisid {wahlkreisid} does not exist in wahlkreise"
            )

    def generate_random_tokens(self, amount: int) -> List[str]:
        return [
            ''.join(random.choices(string.ascii_letters + string.digits, k=15))
            for _ in range(amount)
        ]

    def store_tokens(self, db, wahlid: int, wahlkreisid: int, tokens: List[str]) -> None:
        token_records = [
            {"wahl_id": wahlid, "wahlkreis_id": wahlkreisid, "token": token, "voted": False}
            for token in tokens
        ]
        try:
            db.execute(insert(Token), token_records)
            db.commit()
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Error storing tokens: {str(e)}")

    async def generate_token(
            self,
            wahlid: StrictInt,
            wahlkreisid: StrictInt,
            amount: StrictInt,
    ) -> List[str]:
        if amount > 50000:
            raise HTTPException(
                status_code=400,
                detail=f"Requested amount {amount} exceeds the limit of 50,000"
            )

        with db_session() as db:
            self.verify_wahl_and_wahlkreis(db, wahlid, wahlkreisid)

            tokens = self.generate_random_tokens(amount)

            self.store_tokens(db, wahlid, wahlkreisid, tokens)

        return tokens
