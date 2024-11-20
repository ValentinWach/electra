CREATE OR REPLACE FUNCTION calculate_seats_per_party_per_bundesland_and_election()
RETURNS TABLE (
    wahl_id INT,
    bundesland_id INT,
    partei_id INT,
    sitze BIGINT
) AS $$ DECLARE
    rec RECORD;
    temp_table_name TEXT;
BEGIN
    FOR rec IN (
        SELECT DISTINCT wahlen_id, bundeslaender_id
        FROM zweitstimmen_bundesland_partei_with_votes
    ) LOOP
        temp_table_name := 'temp_table';

        EXECUTE 'CREATE TEMP TABLE ' || quote_ident(temp_table_name) || ' AS
                 SELECT parteien_id, stimmen_sum
                 FROM zweitstimmen_bundesland_bundestags_parteien_with_votes
                 WHERE wahlen_id = ' || rec.wahlen_id || ' AND bundeslaender_id = ' || rec.bundeslaender_id;

        RETURN QUERY EXECUTE '
            SELECT ' || rec.wahlen_id || ' AS wahl_id, ' || rec.bundeslaender_id || ' AS bundesland_id, sl.id AS partei_id, sl.slots AS sitze
            FROM sainte_lague(' || quote_literal('temp_table') || ', ' || quote_literal('parteien_id') || ', ' || quote_literal('stimmen_sum') || ', CAST((SELECT ov_sitzkontingente.slots FROM ov_sitzkontingente WHERE bundeslaender_id = ' || rec.bundeslaender_id || ') AS INT)) sl';

        EXECUTE 'DROP TABLE ' || quote_ident(temp_table_name);
    END LOOP;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION sainte_lague(
    table_name TEXT,
    id_column TEXT,
    value_column TEXT,
    totalSlots INT
)
RETURNS TABLE(id INT, slots bigint)
AS $$ DECLARE
    query TEXT;
BEGIN
    query := '
        SELECT id, COUNT(*) as slots
        FROM (
            SELECT id, value
            FROM sainte_lague_table(' || quote_literal(table_name) || ', ' || quote_literal(id_column) || ', ' ||
             quote_literal(value_column) || ', ' || totalSlots || ')
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
RETURNS TABLE
(
    id      INT,
    divisor NUMERIC,
    value   NUMERIC
)
AS $$ DECLARE query TEXT;
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