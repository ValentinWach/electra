SELECT p."shortName", c.mindestsitzanspruch, verbleibender_ueberhang, sitze_nach_erhoehung, sum_sitze from calculate_seats_per_party_per_election_nationwide() c join parteien p on p.id = c.partei_id;
CREATE OR REPLACE FUNCTION calculate_seats_per_party_per_election_nationwide()
RETURNS TABLE (
    wahl_id INT,
    stimmen_sum NUMERIC,
    partei_id INT,
    mindestsitzanspruch NUMERIC,
    verbleibender_ueberhang NUMERIC,
    sitze_nach_erhoehung NUMERIC,
    sum_sitze NUMERIC
) AS $$
DECLARE
    counter INT := 598;
    condition_met BOOLEAN;
BEGIN
    EXECUTE 'CREATE TEMP TABLE temp_table_erhoeht AS
             SELECT wahl_id, stimmen_sum, partei_id, mindestsitzanspruch,
                    drohender_ueberhang AS verbleibender_ueberhang, sitze AS sitze_nach_erhoehung
             FROM ov_sitzkontingente_basis_erhoehung WHERE wahl_id = 1';

    EXECUTE 'SELECT EXISTS (
                SELECT 1
                FROM temp_table_erhoeht
                WHERE sitze_nach_erhoehung + verbleibender_ueberhang < mindestsitzanspruch
                   OR verbleibender_ueberhang > 3
             )' INTO condition_met;


    WHILE condition_met LOOP
        EXECUTE 'CREATE TEMP TABLE temp_table_erhoeht_helper AS
                 SELECT 1 AS wahlen_id, basis.stimmen_sum , sl.id AS partei_id, basis.mindestsitzanspruch,
                        GREATEST(0, (COALESCE(wahlkreissitze, 0) - sl.slots)) AS verbleibender_ueberhang,
                        sl.slots AS sitze_nach_erhoehung
                 FROM wahlkreissitze_parteien_bundesweit wp
                 JOIN sainte_lague(' || quote_literal('temp_table_erhoeht') || ', ' ||quote_literal('partei_id') || ', ' || quote_literal('stimmen_sum') ||
                                   ', ' || counter || ') sl
                 ON wp.partei_id = sl.id
                JOIN ov_sitzkontingente_basis_erhoehung basis ON basis.partei_id = sl.id and basis.wahl_id = wp.wahl_id join parteien p on wp.partei_id = p.id
                 WHERE wp.wahl_id = 1 and basis.wahl_id = 1';

        counter := counter + 1;

        EXECUTE 'DROP TABLE temp_table_erhoeht';
        EXECUTE 'CREATE TEMP TABLE temp_table_erhoeht AS TABLE temp_table_erhoeht_helper';
        EXECUTE 'DROP TABLE temp_table_erhoeht_helper';

        EXECUTE 'SELECT EXISTS (
                    SELECT 1
                    FROM temp_table_erhoeht
                    WHERE sitze_nach_erhoehung + verbleibender_ueberhang < mindestsitzanspruch
                       OR verbleibender_ueberhang >= 4
                 )' INTO condition_met;
    END LOOP;

    -- Return the final result
    RETURN QUERY EXECUTE 'WITH sum_sitze_cte AS (SELECT (sum(sitze_nach_erhoehung) + sum(verbleibender_ueberhang)) as sum_sitze FROM temp_table_erhoeht)
    SELECT wahlen_id, stimmen_sum, partei_id, mindestsitzanspruch,
    verbleibender_ueberhang, sitze_nach_erhoehung + verbleibender_ueberhang, (SELECT max(sum_sitze) FROM sum_sitze_cte)
    FROM temp_table_erhoeht';

    -- Clean up the temporary table
    EXECUTE 'DROP TABLE temp_table_erhoeht';
END;
$$ LANGUAGE plpgsql;

SELECT wahl_id, bundesland_id, partei_id, sitze
FROM calculate_seats_per_party_per_bundesland_and_election();

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