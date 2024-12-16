BEGIN;
REFRESH MATERIALIZED VIEW zweitstimmen_wahlkreis_partei;
REFRESH MATERIALIZED VIEW zweitstimmen_bundesland_partei;
REFRESH MATERIALIZED VIEW zweitstimmen_partei;
REFRESH MATERIALIZED VIEW wahlkreis_winners;
REFRESH MATERIALIZED VIEW bundestag_parties;
REFRESH MATERIALIZED VIEW wahlkreis_knappste_sieger;


--Depends on dynamic statement and can thus not be a materialized view
TRUNCATE TABLE uv_sitzkontingente_parteien_bundestag;
INSERT INTO uv_sitzkontingente_parteien_bundestag (wahl_id, bundesland_id, partei_id, sitze)
SELECT wahl_id, bundesland_id, partei_id, sitze
FROM calculate_seats_per_party_per_bundesland_and_election(1)
UNION
SELECT wahl_id, bundesland_id, partei_id, sitze
FROM calculate_seats_per_party_per_bundesland_and_election(2);

COMMIT;