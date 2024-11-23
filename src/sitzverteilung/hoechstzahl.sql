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

CREATE OR REPLACE VIEW wahlkreissitze_parteien AS
SELECT bp.wahlen_id as wahl_id, b.id as bundesland_id, bp.parteien_id as partei_id, COALESCE(COUNT(ww.wahlkreis_id), 0) AS wahlkreissitze
FROM (bundestag_parties bp join wahlen w on bp.wahlen_id = w.id) CROSS JOIN bundeslaender b LEFT JOIN
     (wahlkreis_winners ww1 join wahlkreise wk on ww1.wahlkreis_id = wk.id) ww
      on bp.parteien_id = ww.partei_id and bp.wahlen_id = ww.wahl_id and ww.bundesland_id = b.id
GROUP BY bp.wahlen_id, bp.parteien_id, b.id


CREATE OR REPLACE VIEW wahlkreissitze_parteien_bundesweit AS
SELECT wahl_id, partei_id, sum(wahlkreissitze) as wahlkreissitze
FROM wahlkreissitze_parteien
GROUP BY wahl_id, partei_id;

CREATE OR REPLACE VIEW uv_mindestsitzanspruch_bundestag AS
SELECT sk.wahl_id, sk.bundesland_id, sk.partei_id, sk.sitze, wahlkreissitze, GREATEST(0, (coalesce(wahlkreissitze, 0) - sk.sitze)) as drohender_ueberhang, GREATEST(TRUNC((coalesce(wahlkreissitze, 0)::NUMERIC + sk.sitze::NUMERIC)/2 + 0.5), wahlkreissitze) as mindestsitzzahlen
FROM uv_sitzkontingente_parteien_bundestag sk join wahlkreissitze_parteien wp on wp.wahl_id = sk.wahl_id and wp.bundesland_id = sk.bundesland_id and wp.partei_id = sk.partei_id;

CREATE VIEW sitze_nach_gewinnern_ohne_partei AS
SELECT wahl_id, (598 - (SELECT count(*)
FROM wahlkreis_winners ww join wahlkreiskandidaturen wk on ww.wahl_id = wk.wahl_id and ww.kandidat_id = wk.kandidat_id
WHERE wk.partei_id IS NULL)) AS kandidaten_sum
FROM wahlkreis_winners
GROUP BY wahl_id;

CREATE OR REPLACE VIEW ov_sitzkontingente_basis_erhoehung AS
SELECT wahl_id, partei_id, GREATEST(sum(sitze), sum(mindestsitzzahlen)) as mindestsitzanspruch, sum(drohender_ueberhang) as drohender_ueberhang, zs.stimmen_sum, sum(sitze) as sitze
FROM uv_mindestsitzanspruch_bundestag msa join zweitstimmen_partei zs on zs.wahlen_id = msa.wahl_id and zs.parteien_id = msa.partei_id
GROUP BY wahl_id, partei_id, zs.stimmen_sum;

CREATE OR REPLACE VIEW ov_sitzkontingente_erhoehung AS
SELECT partei_id as parteien_id, mindestsitzanspruch, verbleibender_ueberhang, sitze_nach_erhoehung, sum_sitze from calculate_seats_per_party_per_election_nationwide();