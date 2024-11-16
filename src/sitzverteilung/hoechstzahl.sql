CREATE MATERIALIZED VIEW zweitstimmen_wahlkreis_partei AS
SELECT parteien.id as parteien_id, wahlen.id as wahlen_id, wahlkreise.id as wahlkreise_id, count(*) as stimmen_sum
from zweitstimmen join wahlen on zweitstimmen.wahl_id = wahlen.id
    join parteien on zweitstimmen.partei_id = parteien.id
    join wahlkreise on zweitstimmen.wahlkreis_id = wahlkreise.id
group by parteien.id, wahlen.id, wahlkreise.id;

CREATE MATERIALIZED VIEW zweitstimmen_bundesland_partei AS
SELECT parteien_id, wahlen_id, bundeslaender.id as bundeslaender_id, sum(stimmen_sum) as stimmen_sum
from zweitstimmen_wahlkreis_partei
    join wahlkreise on wahlkreise_id = wahlkreise.id
    join bundeslaender on wahlkreise.bundesland_id = bundeslaender.id
group by parteien_id, wahlen_id, bundeslaender.id;

CREATE MATERIALIZED VIEW zweitstimmen_partei AS
SELECT parteien_id, wahlen_id, sum(stimmen_sum) as stimmen_sum
from zweitstimmen_bundesland_partei
group by parteien_id, wahlen_id;

CREATE MATERIALIZED VIEW relevant_parties AS
SELECT parteien_id
FROM zweitstimmen_partei
WHERE parteien_id = 27 or ((stimmen_sum * 1.00) / (SELECT SUM(stimmen_sum) * 1.00 FROM zweitstimmen_partei)) > 0.05;

CREATE VIEW einwohner_pro_bundesland AS (
    SELECT bundeslaender.id AS bundeslaender_id, SUM(einwohnerzahl) AS einwohnerzahl
    FROM bundeslaender
    JOIN wahlkreise ON bundeslaender.id = wahlkreise.bundesland_id
    GROUP BY bundeslaender.id
);

CREATE OR REPLACE FUNCTION sainte_lague(
    table_name TEXT,
    id_column TEXT,
    value_column TEXT,
    totalSlots INT
)
RETURNS TABLE(id INT, slots bigint) AS $$
DECLARE
    query TEXT;
BEGIN
    query := '
        SELECT id, COUNT(*) as slots
        FROM (
            SELECT id, value
            FROM sainte_lague_table(' || quote_literal(table_name) || ', ' || quote_literal(id_column) || ', ' || quote_literal(value_column) || ', ' || totalSlots || ')
            ORDER BY value DESC
            LIMIT ' || totalSlots || '
        ) AS top_values
        GROUP BY id;
    ';
    RETURN QUERY EXECUTE query;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION sainte_lague_table(
    table_name TEXT,
    id_column TEXT,
    value_column TEXT,
    totalSlots INT
)
RETURNS TABLE(id INT, divisor NUMERIC, value NUMERIC) AS $$
DECLARE
    query TEXT;
BEGIN
    query := '
        WITH RECURSIVE initial_values AS (
            SELECT ' || quote_ident(id_column) || ' AS id, ' || quote_ident(value_column) || ' * 1.00 AS value,  0.5 AS divisor
            FROM ' || quote_ident(table_name) || '
        ), divide AS (
            SELECT id, value, divisor, value/divisor as divided_value
            FROM initial_values

            UNION ALL

            SELECT id, value, divisor + 1, value/(divisor + 1) as divided_value
            FROM divide
            WHERE divisor <= ' || totalSlots || '
        )
        SELECT id, divisor, divided_value AS value
        FROM divide;
    ';
    RETURN QUERY EXECUTE query;
END;
$$ LANGUAGE plpgsql;

WITH einwohner_pro_bundesland AS (
    SELECT bundeslaender.id AS bundeslaender_id, SUM(einwohnerzahl) AS einwohnerzahl
    FROM bundeslaender
    JOIN wahlkreise ON bundeslaender.id = wahlkreise.bundesland_id
    GROUP BY bundeslaender.id
) WITH RECURSIVE divide AS (
    SELECT bundeslaender_id AS bundesland, einwohnerzahl AS val_alt, 1 AS divisor, einwohnerzahl / 1 AS val_neu
    FROM  einwohner_pro_bundesland

    UNION ALL

    SELECT bundesland, val_neu as val_alt, divisor + 1, val_neu / (divisor + 1) as val_neu
    FROM divide
    WHERE divisor <= 100
)
SELECT * FROM divide;






