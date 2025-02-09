CREATE OR REPLACE FUNCTION calculate_increased_seats_per_party_per_bundesland_and_election()
    RETURNS TABLE (
        wahl_id             INT,
        bundesland_id       INT,
        partei_id          INT,
        stimmen_sum        bigint,
        landeslistensitze  NUMERIC,
        mindestsitzanspruch BIGINT,
        sitze_final        NUMERIC
    )
AS $$
DECLARE
    counter         INT;
    condition_met   BOOLEAN;
    rec             RECORD;
    temp_table_name TEXT;
BEGIN
    FOR rec IN (
        SELECT DISTINCT nw.wahl_id, nw.partei_id
        FROM ov_2_sitzkontingente_bundesweit_erhoeht nw
    ) LOOP
        temp_table_name := 'temp_table';
        counter := (
            SELECT sitze_nach_erhoehung
            FROM ov_2_sitzkontingente_bundesweit_erhoeht nw
            WHERE nw.wahl_id = rec.wahl_id
              AND nw.partei_id = rec.partei_id
        );

        EXECUTE 'CREATE TEMP TABLE temp_table_verringert AS
            SELECT
                nw.wahl_id,
                ma.bundesland_id,
                nw.partei_id,
                zbp.stimmen_sum,
                ma.mindestsitzzahlen,
                0 as sitze_berechnet,
                ma.mindestsitzzahlen as max_sitze_mindestsitze
            FROM ov_2_sitzkontingente_bundesweit_erhoeht nw
            JOIN mindestsitzanspruch_partei_bundesland ma
                ON nw.wahl_id = ma.wahl_id
                AND nw.partei_id = ma.partei_id
            JOIN zweitstimmen_bundesland_partei zbp
                ON zbp.bundeslaender_id = ma.bundesland_id
                AND zbp.wahlen_id = ma.wahl_id
                AND zbp.parteien_id = ma.partei_id
            WHERE nw.wahl_id = ' || rec.wahl_id || '
              AND nw.partei_id = ' || rec.partei_id;

        EXECUTE 'SELECT EXISTS (SELECT 1)' INTO condition_met;

        WHILE condition_met LOOP
            EXECUTE 'CREATE TEMP TABLE temp_table_verringert_helper AS
                SELECT
                    verr.wahl_id,
                    bundesland_id,
                    partei_id,
                    stimmen_sum,
                    mindestsitzzahlen,
                    sl.slots as sitze_berechnet,
                    GREATEST(mindestsitzzahlen, sl.slots) as max_sitze_mindestsitze
                FROM sainte_lague(' || quote_literal('temp_table_verringert') || ', ' ||
                    quote_literal('bundesland_id') || ', ' ||
                    quote_literal('stimmen_sum') || ', ' ||
                    counter || ', ' || rec.wahl_id || ') sl
                JOIN temp_table_verringert verr ON verr.bundesland_id = sl.id';

            counter := counter - 1;

            EXECUTE 'DROP TABLE temp_table_verringert';
            EXECUTE 'CREATE TEMP TABLE temp_table_verringert AS TABLE temp_table_verringert_helper';
            EXECUTE 'DROP TABLE temp_table_verringert_helper';

            EXECUTE '
                WITH total_max_sitze AS (
                    SELECT SUM(max_sitze_mindestsitze) AS total_max_sitze
                    FROM temp_table_verringert
                )
                SELECT EXISTS (
                    SELECT 1
                    FROM total_max_sitze
                    WHERE total_max_sitze > (
                        SELECT sitze_nach_erhoehung
                        FROM ov_2_sitzkontingente_bundesweit_erhoeht
                        WHERE wahl_id = ' || rec.wahl_id || '
                          AND partei_id = ' || rec.partei_id || '
                    )
                )' INTO condition_met;
        END LOOP;

        RETURN QUERY EXECUTE '
            SELECT
                wahl_id,
                bundesland_id,
                partei_id,
                stimmen_sum,
                mindestsitzzahlen,
                sitze_berechnet,
                max_sitze_mindestsitze
            FROM temp_table_verringert';

        EXECUTE 'DROP TABLE temp_table_verringert';
    END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_seats_per_party_per_election_nationwide(wahl_id_init INT)
    RETURNS TABLE (
        wahl_id                 INT,
        stimmen_sum            NUMERIC,
        partei_id              INT,
        mindestsitzanspruch    NUMERIC,
        verbleibender_ueberhang NUMERIC,
        sitze_nach_erhoehung   NUMERIC,
        sum_sitze              NUMERIC
    )
AS $$
DECLARE
    lower_bound INT := 598;
    upper_bound INT := 800;
    mid INT;
    condition_met BOOLEAN;
    found_valid_solution BOOLEAN := FALSE;
BEGIN
    EXECUTE 'CREATE TEMP TABLE temp_table_erhoeht AS
        SELECT 
            wahl_id,
            stimmen_sum,
            partei_id,
            mindestsitzanspruch,
            drohender_ueberhang AS verbleibender_ueberhang,
            sitze AS sitze_nach_erhoehung
        FROM ov_2_sitzkontingente_bundesweit_erhoeht_basis 
        WHERE wahl_id = ' || wahl_id_init;

    -- First try with initial upper bound
    LOOP
        -- Try current upper bound
        EXECUTE 'CREATE TEMP TABLE temp_table_erhoeht_helper AS
            SELECT 
                ' || wahl_id_init || ' AS wahl_id,
                basis.stimmen_sum,
                sl.id AS partei_id,
                basis.mindestsitzanspruch,
                GREATEST(0, (COALESCE(basis.mindestsitzanspruch, 0) - sl.slots)) AS verbleibender_ueberhang,
                sl.slots AS sitze_nach_erhoehung
            FROM wahlkreissitze_parteien_bundesweit wp
            JOIN sainte_lague(' || quote_literal('temp_table_erhoeht') || ', ' ||
                quote_literal('partei_id') || ', ' ||
                quote_literal('stimmen_sum') || ', ' ||
                upper_bound || ', ' || wahl_id_init || ') sl ON wp.partei_id = sl.id
            JOIN ov_2_sitzkontingente_bundesweit_erhoeht_basis basis ON basis.partei_id = sl.id
            JOIN parteien p ON wp.partei_id = p.id
            WHERE wp.wahl_id = ' || wahl_id_init || '
              AND basis.wahl_id = ' || wahl_id_init;

        EXECUTE 'DROP TABLE temp_table_erhoeht';
        EXECUTE 'CREATE TEMP TABLE temp_table_erhoeht AS TABLE temp_table_erhoeht_helper';
        EXECUTE 'DROP TABLE temp_table_erhoeht_helper';

        -- Check if conditions are met with current upper bound
        EXECUTE 'SELECT EXISTS (
            SELECT 1
            FROM temp_table_erhoeht
            WHERE (verbleibender_ueberhang = 0 AND sitze_nach_erhoehung < mindestsitzanspruch)
               OR (SELECT SUM(verbleibender_ueberhang) FROM temp_table_erhoeht) > 3
        )' INTO condition_met;

        EXIT WHEN NOT condition_met;
        -- If conditions not met, increase upper bound by 100
        upper_bound := upper_bound + 100;
    END LOOP;

    -- Now we know a valid upper bound exists, do binary search
    lower_bound := 598;
    
    WHILE lower_bound <= upper_bound LOOP
        mid := lower_bound + (upper_bound - lower_bound) / 2;
        
        EXECUTE 'CREATE TEMP TABLE temp_table_erhoeht_helper AS
            SELECT 
                ' || wahl_id_init || ' AS wahl_id,
                basis.stimmen_sum,
                sl.id AS partei_id,
                basis.mindestsitzanspruch,
                GREATEST(0, (COALESCE(basis.mindestsitzanspruch, 0) - sl.slots)) AS verbleibender_ueberhang,
                sl.slots AS sitze_nach_erhoehung
            FROM wahlkreissitze_parteien_bundesweit wp
            JOIN sainte_lague(' || quote_literal('temp_table_erhoeht') || ', ' ||
                quote_literal('partei_id') || ', ' ||
                quote_literal('stimmen_sum') || ', ' ||
                mid || ', ' || wahl_id_init || ') sl ON wp.partei_id = sl.id
            JOIN ov_2_sitzkontingente_bundesweit_erhoeht_basis basis ON basis.partei_id = sl.id
            JOIN parteien p ON wp.partei_id = p.id
            WHERE wp.wahl_id = ' || wahl_id_init || '
              AND basis.wahl_id = ' || wahl_id_init;

        EXECUTE 'DROP TABLE temp_table_erhoeht';
        EXECUTE 'CREATE TEMP TABLE temp_table_erhoeht AS TABLE temp_table_erhoeht_helper';
        EXECUTE 'DROP TABLE temp_table_erhoeht_helper';

        EXECUTE 'SELECT EXISTS (
            SELECT 1
            FROM temp_table_erhoeht
            WHERE (verbleibender_ueberhang = 0 AND sitze_nach_erhoehung < mindestsitzanspruch)
               OR (SELECT SUM(verbleibender_ueberhang) FROM temp_table_erhoeht) > 3
        )' INTO condition_met;

        IF NOT condition_met THEN
            found_valid_solution := TRUE;
            upper_bound := mid - 1;  -- Try to find an even smaller valid solution
        ELSE
            lower_bound := mid + 1;  -- Need more seats
        END IF;
    END LOOP;

    -- If we found a valid solution, use the last known good state
    -- Otherwise use the current state (which would be the minimum required)
    RETURN QUERY EXECUTE '
        WITH sum_sitze_cte AS (
            SELECT (sum(sitze_nach_erhoehung) + sum(verbleibender_ueberhang)) as sum_sitze 
            FROM temp_table_erhoeht
        )
        SELECT 
            tte.wahl_id,
            stimmen_sum,
            partei_id,
            mindestsitzanspruch,
            verbleibender_ueberhang,
            sitze_nach_erhoehung + verbleibender_ueberhang,
            (SELECT max(sum_sitze) FROM sum_sitze_cte)
        FROM temp_table_erhoeht tte';

    EXECUTE 'DROP TABLE temp_table_erhoeht';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_seats_per_party_per_bundesland_and_election()
    RETURNS TABLE (
        wahl_id       INT,
        bundesland_id INT,
        partei_id     INT,
        sitze         BIGINT
    )
AS $$
DECLARE
    rec RECORD;
    temp_table_name TEXT;
BEGIN
    FOR rec IN (
        SELECT DISTINCT wahlen_id, bundeslaender_id
        FROM zweitstimmen_bundesland_partei_with_votes
    ) LOOP
        temp_table_name := 'temp_table';

        EXECUTE 'CREATE TEMP TABLE ' || quote_ident(temp_table_name) || ' AS
            SELECT 
                parteien_id,
                stimmen_sum,
                ' || rec.wahlen_id || ' AS wahl_id
            FROM zweitstimmen_bundesland_bundestags_parteien_with_votes
            WHERE wahlen_id = ' || rec.wahlen_id || '
              AND bundeslaender_id = ' || rec.bundeslaender_id;

        RETURN QUERY EXECUTE '
            SELECT 
                ' || rec.wahlen_id || ' AS wahl_id,
                ' || rec.bundeslaender_id || ' AS bundesland_id,
                sl.id AS partei_id,
                sl.slots AS sitze
            FROM sainte_lague(' || 
                quote_literal('temp_table') || ', ' ||
                quote_literal('parteien_id') || ', ' ||
                quote_literal('stimmen_sum') || ', 
                CAST((
                    SELECT ov_1_sitzkontingente_bundesleander.slots 
                    FROM ov_1_sitzkontingente_bundesleander 
                    WHERE bundeslaender_id = ' || rec.bundeslaender_id || '
                      AND wahl_id = ' || rec.wahlen_id || '
                ) AS INT), ' || rec.wahlen_id || ') sl';

        EXECUTE 'DROP TABLE ' || quote_ident(temp_table_name);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sainte_lague(
    table_name    TEXT,
    id_column     TEXT,
    value_column  TEXT,
    total_slots    INTEGER,
    wahl_id_init  INTEGER
)
    RETURNS TABLE (
        id      INT,
        slots   BIGINT,
        wahl_id INT
    )
AS $$
DECLARE
    query TEXT;
BEGIN
    query := '
        SELECT id, COUNT(*) as slots, wahl_id
        FROM (
            SELECT id, value, wahl_id
            FROM public.sainte_lague_table(' ||
                quote_literal(table_name) || '::text, ' ||
                quote_literal(id_column) || '::text, ' ||
                quote_literal(value_column) || '::text, ' ||
                total_slots || '::integer, ' ||
                wahl_id_init || '::integer)
            ORDER BY value DESC
            LIMIT ' || total_slots || '
        ) AS top_values
        GROUP BY id, wahl_id';

    RETURN QUERY EXECUTE query;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sainte_lague_table(
    table_name    TEXT,
    id_column     TEXT,
    value_column  TEXT,
    total_slots    INT,
    wahl_id_init  INT
)
    RETURNS TABLE (
        id      INT,
        divisor NUMERIC,
        value   NUMERIC,
        wahl_id INT
    )
AS $$
DECLARE
    query TEXT;
BEGIN
    query := '
        WITH RECURSIVE initial_values AS (
            SELECT 
                ' || quote_ident(id_column) || ' AS id,
                ' || quote_ident(value_column) || ' * 1.00 AS value,
                0.5 AS divisor,
                ' || wahl_id_init || ' as wahl_id
            FROM ' || quote_ident(table_name) || '
            WHERE wahl_id = ' || wahl_id_init || '
        ),
        divide AS (
            SELECT 
                id,
                value,
                divisor,
                value/divisor as divided_value,
                wahl_id
            FROM initial_values

            UNION ALL

            SELECT 
                id,
                value,
                divisor + 1,
                value/(divisor + 1) as divided_value,
                ' || wahl_id_init || ' as wahl_id
            FROM divide
            WHERE divisor <= ' || total_slots || '
        )
        SELECT 
            id,
            divisor,
            divided_value AS value,
            wahl_id
        FROM divide';

    RETURN QUERY EXECUTE query;
END;
$$ LANGUAGE plpgsql;

