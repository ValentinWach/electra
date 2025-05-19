# coding: utf-8

from typing import ClassVar, Dict, List, Tuple, Optional # noqa: F401
from fastapi import HTTPException
from sqlalchemy import text
from ..database.connection import Session as db_session
from pydantic import StrictBool, StrictInt
import importlib
import pkgutil

from ..database.models import Bundesland, Partei, Wahlkreis
from ..models.auslaenderanteil_wahlkreise_inner import AuslaenderanteilWahlkreiseInner
from ..models.berufsgruppen_berufsgruppen_inner import BerufsgruppenBerufsgruppenInner
from ..models.einkommen_wahlkreise_inner import EinkommenWahlkreiseInner
from ..models.auslaenderanteil import Auslaenderanteil
from ..models.berufsgruppen import Berufsgruppen
from ..models.einkommen import Einkommen


class BaseAnalysisApi:
    subclasses: ClassVar[Tuple] = ()

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        BaseAnalysisApi.subclasses = BaseAnalysisApi.subclasses + (cls,)

    async def get_berufsgruppen(
        self,
        wahlid: StrictInt,
        parteiid: StrictInt,
        only_abgeordnete: Optional[StrictBool],
    ) -> Berufsgruppen:
        try:
            with db_session() as db:

                validation_query = text('''
                    SELECT 1 FROM wahlen 
                    WHERE id = :wahlId 
                    AND EXTRACT(YEAR FROM date) = 2021
                ''')
                
                is_2021 = db.execute(validation_query, {"wahlId": wahlid}).fetchone()
                
                if not is_2021:
                    return Berufsgruppen(berufsgruppen=[])
                
                if only_abgeordnete:

                    berufsgruppen_query = text('''
                       WITH total AS (
                            SELECT COUNT(a.kandidat_id) AS total_candidates
                            FROM abgeordnete a
                            WHERE a.wahl_id = :wahlId AND a.partei_id = :parteiId
                        ),
                        joined_candidates AS (
                            SELECT k.id, k.profession_key
                            FROM kandidaten k
                            JOIN abgeordnete a ON k.id = a.kandidat_id
                            WHERE a.wahl_id = :wahlId AND a.partei_id = :parteiId
                        )
                        SELECT
                            bk.id,
                            bk.name,
                            COALESCE(COUNT(DISTINCT jc.id), 0) AS absolute,
                            COALESCE(ROUND((COUNT(DISTINCT jc.id) * 100.0) / NULLIF((SELECT total_candidates FROM total), 0), 2), 0.0) AS share
                        FROM berufskategorien bk
                        LEFT JOIN joined_candidates jc ON bk.id = jc.profession_key
                        GROUP BY bk.id, bk.name;
                    ''')
                else:
                    berufsgruppen_query = text('''
                        WITH total AS (
                            SELECT COUNT(DISTINCT kandidat_id) AS total_candidates
                            FROM (
                                SELECT kandidat_id FROM listenkandidaturen WHERE wahl_id = :wahlId AND partei_id = :parteiId
                                UNION
                                SELECT kandidat_id FROM wahlkreiskandidaturen WHERE wahl_id = :wahlId AND partei_id = :parteiId
                            ) combined
                        ),
                        joined_candidates AS (
                            SELECT k.id, k.profession_key
                            FROM kandidaten k
                            JOIN (
                                SELECT kandidat_id FROM listenkandidaturen WHERE wahl_id = :wahlId AND partei_id = :parteiId
                                UNION
                                SELECT kandidat_id FROM wahlkreiskandidaturen WHERE wahl_id = :wahlId AND partei_id = :parteiId
                            ) combined ON k.id = combined.kandidat_id
                        )
                        SELECT
                            bk.id,
                            bk.name,
                            COALESCE(COUNT(DISTINCT jc.id), 0) AS absolute,
                            COALESCE(ROUND((COUNT(DISTINCT jc.id) * 100.0) / NULLIF((SELECT total_candidates FROM total), 0), 2), 0.0) AS share
                        FROM berufskategorien bk
                        LEFT JOIN joined_candidates jc ON bk.id = jc.profession_key
                        GROUP BY bk.id, bk.name;
                                        ''')

                berufsgruppen_results = db.execute(
                    berufsgruppen_query,
                    {"wahlId": wahlid, "parteiId": parteiid}
                ).fetchall()

                if not berufsgruppen_results:
                    raise HTTPException(
                        status_code=400,
                        detail=f"No profession data found for Wahl ID: {wahlid} and Partei ID: {parteiid}"
                    )

                berufsgruppen_response = Berufsgruppen(berufsgruppen=[])

                for result in berufsgruppen_results:
                    id, name, absolute, share = result

                    berufsgruppen_response.berufsgruppen.append(
                        BerufsgruppenBerufsgruppenInner(
                            id=id,
                            name=name,
                            absolute=absolute,
                            share=share
                        )
                    )

                return berufsgruppen_response

        except HTTPException as http_ex:
            raise http_ex

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"An unexpected error occurred: {str(e)}"
            )

    async def get_foreigners(
        self,
        wahlid: StrictInt,
        parteiid: StrictInt
    ) -> Auslaenderanteil:
        try:
            with db_session() as db:
                auslaenderanteil_query = text('''
                    WITH total_stimmen AS (
                        SELECT 
                            wahlkreise_id, 
                            SUM(stimmen_sum) AS total_stimmen_sum
                        FROM zweitstimmen_wahlkreis_partei
                        WHERE wahlen_id = :wahlId
                        GROUP BY wahlkreise_id
                    ),
                    party_stimmen AS (
                        SELECT 
                            s.wahlkreis_id, 
                            w.name, 
                            s.auslaenderanteil,
                            ROUND(COALESCE(zwp1.stimmen_sum, 0) / ts.total_stimmen_sum * 100, 2) AS stimmanteil
                        FROM strukturdaten s
                        JOIN zweitstimmen_wahlkreis_partei zwp1
                            ON s.wahlkreis_id = zwp1.wahlkreise_id 
                            AND s.wahl_id = zwp1.wahlen_id 
                            AND zwp1.parteien_id = :parteiId
                        JOIN wahlkreise w ON s.wahlkreis_id = w.id
                        LEFT JOIN total_stimmen ts ON s.wahlkreis_id = ts.wahlkreise_id
                        WHERE s.wahl_id = :wahlId
                        AND zwp1.stimmen_sum > 0
                    ),
                    stats AS (
                        SELECT 
                            AVG(stimmanteil) AS mean_stimmanteil,
                            STDDEV_POP(stimmanteil) AS stddev_stimmanteil
                        FROM party_stimmen
                    )
                    SELECT 
                        ps.wahlkreis_id,
                        ps.name,
                        ps.auslaenderanteil,
                        CASE 
                            WHEN st.stddev_stimmanteil = 0 THEN 0  -- Avoid division by zero
                            ELSE ROUND((ps.stimmanteil - st.mean_stimmanteil) / st.stddev_stimmanteil, 2)
                        END AS stimmanteil
                    FROM party_stimmen ps, stats st;
                ''')

                auslaenderanteil_results = db.execute(
                    auslaenderanteil_query,
                    {"wahlId": wahlid, "parteiId": parteiid}
                ).fetchall()

                if not auslaenderanteil_results:
                    raise HTTPException(
                        status_code=404,
                        detail=f"No foreigner share data found for Wahl ID: {wahlid}"
                    )

                auslaenderanteil_response = Auslaenderanteil(wahlkreise=[])

                for result in auslaenderanteil_results:
                    wahlkreis_id, wahlkreis_name, auslaenderanteil_value, stimmen_anteil = result

                    if stimmen_anteil is None:
                        adjusted_stimmen_anteil = 0.0
                    else:
                        adjusted_stimmen_anteil = stimmen_anteil

                    auslaenderanteil_response.wahlkreise.append(
                        AuslaenderanteilWahlkreiseInner(
                            wahlkreis_id=wahlkreis_id,
                            wahlkreis_name=wahlkreis_name,
                            auslaenderanteil=auslaenderanteil_value,
                            stimmanteil=adjusted_stimmen_anteil
                        )
                    )

            return auslaenderanteil_response

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"An unexpected error occurred: {str(e)}"
            )


    async def get_income(
        self,
        wahlid: StrictInt,
        parteiid: StrictInt
    ) -> Einkommen:
        try:
            with db_session() as db:
                einkommen_query = text('''
WITH total_stimmen AS (
    SELECT 
        wahlkreise_id, 
        SUM(stimmen_sum) AS total_stimmen_sum
    FROM zweitstimmen_wahlkreis_partei
    WHERE wahlen_id = :wahlId
    GROUP BY wahlkreise_id
),
party_stimmen AS (
    SELECT 
        s.wahlkreis_id, 
        w.name, 
        s.einkommen,
        -- Calculate vote share, excluding districts where the party got 0 votes
        ROUND(zwp1.stimmen_sum / ts.total_stimmen_sum * 100, 2) AS stimmanteil
    FROM strukturdaten s
    JOIN zweitstimmen_wahlkreis_partei zwp1
        ON s.wahlkreis_id = zwp1.wahlkreise_id 
        AND s.wahl_id = zwp1.wahlen_id 
        AND zwp1.parteien_id = :parteiId
    JOIN wahlkreise w ON s.wahlkreis_id = w.id
    JOIN total_stimmen ts ON s.wahlkreis_id = ts.wahlkreise_id
    WHERE s.wahl_id = :wahlId
    AND zwp1.stimmen_sum > 0  -- Exclude districts with 0 votes for the party
),
stats AS (
    SELECT 
        AVG(stimmanteil) AS mean_stimmanteil,
        STDDEV_POP(stimmanteil) AS stddev_stimmanteil
    FROM party_stimmen
)
SELECT 
    ps.wahlkreis_id,
    ps.name,
    ps.einkommen,
    -- Z-score normalization
    CASE 
        WHEN st.stddev_stimmanteil = 0 THEN 0  -- Avoid division by zero
        ELSE ROUND((ps.stimmanteil - st.mean_stimmanteil) / st.stddev_stimmanteil, 2)
    END AS stimmanteil
FROM party_stimmen ps, stats st;
                ''')

                einkommen_results = db.execute(
                    einkommen_query,
                    {"wahlId": wahlid, "parteiId": parteiid}
                ).fetchall()

                if not einkommen_results:
                    raise HTTPException(
                        status_code=404,
                        detail=f"No foreigner share data found for Wahl ID: {wahlid}"
                    )

                einkommen_response = Einkommen(wahlkreise=[])

                for result in einkommen_results:
                    wahlkreis_id, wahlkreis_name, einkommen_value, stimmen_anteil = result

                    if stimmen_anteil is None:
                        adjusted_stimmen_anteil = 0.0
                    else:
                        adjusted_stimmen_anteil = stimmen_anteil

                    einkommen_response.wahlkreise.append(
                        EinkommenWahlkreiseInner(
                            wahlkreis_id=wahlkreis_id,
                            wahlkreis_name=wahlkreis_name,
                            einkommen=einkommen_value,
                            stimmanteil=adjusted_stimmen_anteil
                        )
                    )

            return einkommen_response

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"An unexpected error occurred: {str(e)}"
            )