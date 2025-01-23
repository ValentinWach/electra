# coding: utf-8
import random
import string
import csv
import io
import hashlib

from fastapi import UploadFile, File, HTTPException
from typing import ClassVar, Dict, List, Tuple, Any  # noqa: F401
from openapi_server.database.connection import Session as db_session
from sqlalchemy import text, insert
from sqlalchemy.exc import SQLAlchemyError

from pydantic import Field, StrictBytes, StrictInt, StrictStr
from typing_extensions import Annotated
from typing import Any, List, Optional, Tuple, Union

from openapi_server.database.models import Token, ErststimmeTest, ZweitstimmeTest


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

    def generate_random_tokens(self, amount: int, id_numbers: List[StrictStr]) -> list[dict]:
        result = []

        for i in range(amount):
            random_string = ''.join(random.choices(string.ascii_letters + string.digits, k=15))

            combined_string = random_string + id_numbers[i]

            hash_value = hashlib.sha256(combined_string.encode()).hexdigest()

            result.append({
                "random_string": random_string,
                "id_number": id_numbers[i],
                "hash": hash_value
            })

        return result

    def store_hashes(self, db, wahlid: int, wahlkreisid: int, hashes: List[str]) -> None:
        token_records = [
            {"wahl_id": wahlid, "wahlkreis_id": wahlkreisid, "hash": hash, "voted": False}
            for hash in hashes
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
            id_numbers: List[StrictStr]
    ):
        if amount > 50000:
            raise HTTPException(
                status_code=400,
                detail=f"Requested amount {amount} exceeds the limit of 50,000"
            )

        if len(id_numbers) != amount:
            raise HTTPException(
                status_code=400,
                detail=f"Amount of id_numbers does not match the requested amount"
            )

        with db_session() as db:
            self.verify_wahl_and_wahlkreis(db, wahlid, wahlkreisid)

            result = self.generate_random_tokens(amount, id_numbers)

            hash_values = [data["hash"] for data in result]

            self.store_hashes(db, wahlid, wahlkreisid, hash_values)

        return [
            {"idNumber": data["id_number"], "token": data["random_string"]}
            for data in result
        ]


    def handle_database_operations(self, db, erststimmen_records, zweitstimmen_records):
        try:
            if erststimmen_records:
                db.add_all(erststimmen_records)
            if zweitstimmen_records:
                db.add_all(zweitstimmen_records)
            db.commit()
        except SQLAlchemyError as db_ex:
            db.rollback()
            raise HTTPException(
                status_code=500,
                detail=f"Database operation failed: {str(db_ex)}"
            )

    def process_csv_row(self, row, row_number):
        try:
            wahl_id = int(row['wahl_id'])
            wahlkreis_id = int(row['wahlkreis_id'])
            direktkandidat_id = int(row['direktkandidat_id'])
            partei_id = int(row['partei_id'])
            return wahl_id, wahlkreis_id, direktkandidat_id, partei_id
        except KeyError as key_error:
            raise HTTPException(
                status_code=400,
                detail=f"Missing required column in row {row_number}: {str(key_error)}"
            )
        except ValueError as value_error:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid data format in row {row_number}: {str(value_error)}"
            )

    async def prepare_votes(self, wahl_id, wahlkreis_id, direktkandidat_id, partei_id, row):

        erststimme = ErststimmeTest(wahlkreiskandidatur_id=direktkandidat_id)

        zweitstimme = ZweitstimmeTest(wahl_id=wahl_id, wahlkreis_id=wahlkreis_id, partei_id=partei_id)

        return erststimme, zweitstimme

    async def batch_vote(
        self,
        file: UploadFile = File(..., description="A CSV file with columns `wahl_id`, `wahlkreis_id`, `direktkandidat_id`, `partei_id`")
    ) -> None:
        try:

            if file.content_type != "text/csv":
                raise HTTPException(status_code=400, detail="Uploaded file must be a CSV file.")

            content = await file.read()
            decoded_content = content.decode("utf-8")
            csv_reader = csv.DictReader(io.StringIO(decoded_content))

            erststimmen_records = []
            zweitstimmen_records = []

            with db_session() as db:
                for row_number, row in enumerate(csv_reader, start=1):
                    wahl_id, wahlkreis_id, direktkandidat_id, partei_id = self.process_csv_row(row, row_number)
                    erststimme, zweitstimme = await self.prepare_votes(wahl_id, wahlkreis_id,
                                                                               direktkandidat_id, partei_id, row)

                    if erststimme:
                        erststimmen_records.append(erststimme)
                    if zweitstimme:
                        zweitstimmen_records.append(zweitstimme)

            self.handle_database_operations(db, erststimmen_records, zweitstimmen_records)

        except HTTPException as http_ex:
            raise http_ex
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Internal server error: {str(e)}"
            )
