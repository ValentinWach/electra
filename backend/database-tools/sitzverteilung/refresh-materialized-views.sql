BEGIN;
REFRESH MATERIALIZED VIEW zweitstimmen_wahlkreis_partei;
REFRESH MATERIALIZED VIEW zweitstimmen_bundesland_partei;
REFRESH MATERIALIZED VIEW zweitstimmen_partei;
REFRESH MATERIALIZED VIEW wahlkreis_winners;
REFRESH MATERIALIZED VIEW bundestag_parties;


--Depends on dynamic statement and can thus not be a materialized view
TRUNCATE TABLE uv_sitzkontingente_parteien_bundestag;
INSERT INTO uv_sitzkontingente_parteien_bundestag (wahl_id, bundesland_id, partei_id, sitze)
SELECT wahl_id, bundesland_id, partei_id, sitze
FROM calculate_seats_per_party_per_bundesland_and_election(1)
UNION
SELECT wahl_id, bundesland_id, partei_id, sitze
FROM calculate_seats_per_party_per_bundesland_and_election(2);

--Depends on dynamic statement and can thus not be a materialized view
TRUNCATE TABLE ov_sitzkontingente_erhoehung;
INSERT INTO ov_sitzkontingente_erhoehung
SELECT wahl_id, partei_id, stimmen_sum, mindestsitzanspruch, verbleibender_ueberhang, sitze_nach_erhoehung from calculate_seats_per_party_per_election_nationwide(1)
UNION
SELECT wahl_id, partei_id, stimmen_sum, mindestsitzanspruch, verbleibender_ueberhang, sitze_nach_erhoehung from calculate_seats_per_party_per_election_nationwide(2);

--Depends on dynamic statement and can thus not be a materialized view
TRUNCATE TABLE uv_landeslisten_erhoeht;
INSERT INTO uv_landeslisten_erhoeht (wahl_id, bundesland_id, partei_id, landeslistensitze, stimmen_sum, mindestsitzanspruch, sum)
SELECT calc.wahl_id, calc.bundesland_id, calc.partei_id, calc.landeslistensitze, calc.stimmen_sum, calc.mindestsitzanspruch, calc.sitze_final as sum FROM calculate_increased_seats_per_party_per_bundesland_and_election() calc;
COMMIT;