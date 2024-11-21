CREATE OR REPLACE VIEW zweitstimmen_bundesland_partei_with_votes AS
SELECT parteien_id, wahlen_id, bundeslaender_id, stimmen_sum
from zweitstimmen_bundesland_partei
where stimmen_sum > 0;

CREATE OR REPLACE VIEW zweitstimmen_bundesland_bundestags_parteien_with_votes AS
SELECT zs.parteien_id, zs.wahlen_id, bundeslaender_id, stimmen_sum
from zweitstimmen_bundesland_partei zs join bundestag_parties bp on zs.parteien_id = bp.parteien_id and zs.wahlen_id = bp.wahlen_id
where stimmen_sum > 0;

CREATE OR REPLACE VIEW einwohner_pro_bundesland AS
(
SELECT bundeslaender.id AS bundeslaender_id, SUM(einwohnerzahl) AS einwohnerzahl
FROM bundeslaender JOIN wahlkreise ON bundeslaender.id = wahlkreise.bundesland_id
GROUP BY bundeslaender.id
);

CREATE OR REPLACE VIEW ov_sitzkontingente as
SELECT sl.id as bundeslaender_id, sl.slots
FROM sainte_lague('einwohner_pro_bundesland_temp', 'bundeslaender_id', 'einwohnerzahl', 598) sl;

CREATE OR REPLACE VIEW uv_sitzkontingente_parteien_bundestag AS
SELECT wahl_id, bundesland_id, partei_id, sitze
FROM calculate_seats_per_party_per_bundesland_and_election()
;

CREATE OR REPLACE VIEW wahlkreissitze_parteien AS
SELECT wahl_id, bundesland_id, partei_id, count(*) as wahlkreissitze
FROM wahlkreis_winners ww join wahlkreise w on w.id = ww.wahlkreis_id join bundeslaender b on w.bundesland_id = b.id
    join parteien p on ww.partei_id = p.id
GROUP BY wahl_id, bundesland_id, partei_id;

CREATE OR REPLACE VIEW uv_mindestsitzanspruch_bundestag AS
SELECT sk.wahl_id, sk.bundesland_id, sk.partei_id, sk.sitze, wahlkreissitze, GREATEST(0, (coalesce(wahlkreissitze, 0) - sk.sitze)) as drohender_ueberhang, GREATEST(TRUNC((coalesce(wahlkreissitze, 0)::NUMERIC + sk.sitze::NUMERIC)/2 + 0.5), wahlkreissitze) as mindestsitzanspruch
FROM uv_sitzkontingente_parteien_bundestag sk left join wahlkreissitze_parteien wp on wp.wahl_id = sk.wahl_id and wp.bundesland_id = sk.bundesland_id and wp.partei_id = sk.partei_id;

CREATE VIEW sitze_nach_gewinnern_ohne_partei AS
SELECT (598 - (SELECT count(*)
FROM wahlkreis_winners ww join wahlkreiskandidaturen wk on ww.wahl_id = wk.wahl_id and ww.kandidat_id = wk.kandidat_id
WHERE wk.partei_id IS NULL)) AS kandidaten_sum;



