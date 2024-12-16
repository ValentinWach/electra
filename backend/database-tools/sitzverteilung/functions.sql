CREATE OR REPLACE FUNCTION calculate_seats_per_party_per_election_nationwide(wahl_id_init INT)
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
             FROM ov_sitzkontingente_basis_erhoehung WHERE wahl_id = '|| wahl_id_init ||'';

    EXECUTE 'SELECT EXISTS (
                SELECT 1
                    FROM temp_table_erhoeht
                    WHERE (verbleibender_ueberhang = 0 AND sitze_nach_erhoehung < mindestsitzanspruch)
                    OR (SELECT SUM(verbleibender_ueberhang) FROM temp_table_erhoeht) > 3
             )' INTO condition_met;


    WHILE condition_met LOOP
        EXECUTE 'CREATE TEMP TABLE temp_table_erhoeht_helper AS
                 SELECT  '|| wahl_id_init ||' AS wahl_id, basis.stimmen_sum , sl.id AS partei_id, basis.mindestsitzanspruch,
                        GREATEST(0, (COALESCE(basis.mindestsitzanspruch, 0) - sl.slots)) AS verbleibender_ueberhang,
                        sl.slots AS sitze_nach_erhoehung
                 FROM wahlkreissitze_parteien_bundesweit wp
                 JOIN sainte_lague(' || quote_literal('temp_table_erhoeht') || ', ' ||quote_literal('partei_id') || ', ' || quote_literal('stimmen_sum') ||
                                   ', ' || counter || ', ' || wahl_id_init || ') sl
                 ON wp.partei_id = sl.id
                 JOIN ov_sitzkontingente_basis_erhoehung basis ON basis.partei_id = sl.id join parteien p on wp.partei_id = p.id
                 WHERE wp.wahl_id =  '|| wahl_id_init ||' and basis.wahl_id =  '|| wahl_id_init ||'';

        counter := counter + 1;

        EXECUTE 'DROP TABLE temp_table_erhoeht';
        EXECUTE 'CREATE TEMP TABLE temp_table_erhoeht AS TABLE temp_table_erhoeht_helper';
        EXECUTE 'DROP TABLE temp_table_erhoeht_helper';

        EXECUTE 'SELECT EXISTS (
                    SELECT 1
                    FROM temp_table_erhoeht
                    WHERE
                    (verbleibender_ueberhang = 0 AND sitze_nach_erhoehung < mindestsitzanspruch)
                    OR (SELECT SUM(verbleibender_ueberhang) FROM temp_table_erhoeht) > 3
                 )' INTO condition_met;

    END LOOP;


    -- Return the final result
    RETURN QUERY EXECUTE 'WITH sum_sitze_cte AS (SELECT (sum(sitze_nach_erhoehung) + sum(verbleibender_ueberhang)) as sum_sitze FROM temp_table_erhoeht)
    SELECT wahl_id, stimmen_sum, partei_id, mindestsitzanspruch,
    verbleibender_ueberhang, sitze_nach_erhoehung + verbleibender_ueberhang, (SELECT max(sum_sitze) FROM sum_sitze_cte)
    FROM temp_table_erhoeht';

    -- Clean up the temporary table
    EXECUTE 'DROP TABLE temp_table_erhoeht';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_seats_per_party_per_bundesland_and_election(wahl_id_init INT)
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
                 SELECT parteien_id, stimmen_sum, '||  wahl_id_init || ' AS wahl_id
                 FROM zweitstimmen_bundesland_bundestags_parteien_with_votes
                 WHERE wahlen_id = ' || rec.wahlen_id || ' AND bundeslaender_id = ' || rec.bundeslaender_id;

        RETURN QUERY EXECUTE '
            SELECT ' || rec.wahlen_id || ' AS wahl_id, ' || rec.bundeslaender_id || ' AS bundesland_id, sl.id AS partei_id, sl.slots AS sitze
            FROM sainte_lague(' || quote_literal('temp_table') || ', ' || quote_literal('parteien_id') || ', ' || quote_literal('stimmen_sum') || ', CAST((SELECT ov_sitzkontingente.slots FROM ov_sitzkontingente WHERE bundeslaender_id = ' || rec.bundeslaender_id || ' AND wahl_id = ' || rec.wahlen_id || ') AS INT), '||  wahl_id_init || ') sl';

        EXECUTE 'DROP TABLE ' || quote_ident(temp_table_name);
    END LOOP;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION sainte_lague(
    table_name TEXT,
    id_column TEXT,
    value_column TEXT,
    totalSlots INT,
    wahl_id_init INT
)
RETURNS TABLE(id INT, slots bigint, wahl_id INT)
AS $$ DECLARE
    query TEXT;
BEGIN
    query := '
        SELECT id, COUNT(*) as slots, wahl_id
        FROM (
            SELECT id, value, wahl_id
            FROM sainte_lague_table(' || quote_literal(table_name) || ', ' || quote_literal(id_column) || ', ' ||
             quote_literal(value_column) || ', ' || totalSlots || ', ' || wahl_id_init || ')
            ORDER BY value DESC
            LIMIT ' || totalSlots || '
        ) AS top_values
        GROUP BY id, wahl_id;
    ';
    RETURN QUERY EXECUTE query;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION sainte_lague_table(
    table_name TEXT,
    id_column TEXT,
    value_column TEXT,
    totalSlots INT,
    wahl_id_init INT
)
RETURNS TABLE
(
    id      INT,
    divisor NUMERIC,
    value   NUMERIC,
    wahl_id INT
)
AS $$ DECLARE query TEXT;
BEGIN
    query := '
        WITH RECURSIVE initial_values AS (
            SELECT ' || quote_ident(id_column) || ' AS id, ' || quote_ident(value_column) || ' * 1.00 AS value,  0.5 AS divisor, ' || wahl_id_init || ' as wahl_id
            FROM ' || quote_ident(table_name) || ' WHERE wahl_id = ' || wahl_id_init || '
        ), divide AS (
            SELECT id, value, divisor, value/divisor as divided_value, wahl_id
            FROM initial_values

            UNION ALL

            SELECT id, value, divisor + 1, value/(divisor + 1) as divided_value, ' || wahl_id_init || ' as wahl_id
            FROM divide
            WHERE divisor <= ' || totalSlots || '
        )
        SELECT id, divisor, divided_value AS value, wahl_id
        FROM divide;
    ';
    RETURN QUERY EXECUTE query;
END;
$$ LANGUAGE plpgsql;