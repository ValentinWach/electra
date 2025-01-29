BEGIN;
----------Basisdaten----------

-- Base data views must be refreshed first
REFRESH MATERIALIZED VIEW zweitstimmen_wahlkreis_partei;
REFRESH MATERIALIZED VIEW zweitstimmen_bundesland_partei;
REFRESH MATERIALIZED VIEW zweitstimmen_partei;
REFRESH MATERIALIZED VIEW wahlkreis_winners;
REFRESH MATERIALIZED VIEW wahlkreis_knappste_sieger;

----------Berechnungen----------
REFRESH MATERIALIZED VIEW bundestag_parties;

--Depends on dynamic statement and can thus not be a materialized view
TRUNCATE TABLE uv_1_sitzkontingente_landeslisten;
INSERT INTO uv_1_sitzkontingente_landeslisten (wahl_id, bundesland_id, partei_id, sitze)
SELECT wahl_id, bundesland_id, partei_id, sitze
FROM calculate_seats_per_party_per_bundesland_and_election();

REFRESH MATERIALIZED VIEW wahlkreissitze_parteien_bundesweit;
REFRESH MATERIALIZED VIEW mindestsitzanspruch_partei_bundesland;
REFRESH MATERIALIZED VIEW ov_2_sitzkontingente_bundesweit_erhoeht_basis;

--Depends on dynamic statement and can thus not be a materialized view
TRUNCATE TABLE ov_2_sitzkontingente_bundesweit_erhoeht;
INSERT INTO ov_2_sitzkontingente_bundesweit_erhoeht
SELECT wahl_id, partei_id, stimmen_sum, mindestsitzanspruch, verbleibender_ueberhang, sitze_nach_erhoehung from calculate_seats_per_party_per_election_nationwide(1)
UNION
SELECT wahl_id, partei_id, stimmen_sum, mindestsitzanspruch, verbleibender_ueberhang, sitze_nach_erhoehung from calculate_seats_per_party_per_election_nationwide(2);
--Depends on dynamic statement and can thus not be a materialized view
TRUNCATE TABLE uv_2_sitzkontingente_landeslisten_erhoeht;
INSERT INTO uv_2_sitzkontingente_landeslisten_erhoeht (wahl_id, bundesland_id, partei_id, landeslistensitze, stimmen_sum, mindestsitzanspruch, sum)
SELECT calc.wahl_id, calc.bundesland_id, calc.partei_id, calc.landeslistensitze, calc.stimmen_sum, calc.mindestsitzanspruch, calc.sitze_final as sum FROM calculate_increased_seats_per_party_per_bundesland_and_election() calc;

REFRESH MATERIALIZED VIEW abgeordnete;

COMMIT;