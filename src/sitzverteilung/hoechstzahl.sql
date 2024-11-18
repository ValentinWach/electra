CREATE VIEW zweitstimmen_bundesland_partei_with_votes AS
SELECT parteien_id, wahlen_id, bundeslaender_id, stimmen_sum
from zweitstimmen_bundesland_partei
where stimmen_sum > 0;

CREATE VIEW einwohner_pro_bundesland AS
(
SELECT bundeslaender.id AS bundeslaender_id, SUM(einwohnerzahl) AS einwohnerzahl
FROM bundeslaender JOIN wahlkreise ON bundeslaender.id = wahlkreise.bundesland_id
GROUP BY bundeslaender.id
);

CREATE VIEW ov_sitzkontingente as
SELECT sl.id as bundeslaender_id, sl.slots
FROM sainte_lague('einwohner_pro_bundesland', 'bundeslaender_id', 'einwohnerzahl', 598) sl;
