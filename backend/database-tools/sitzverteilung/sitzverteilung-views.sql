----------Basisdaten----------
CREATE OR REPLACE VIEW einwohner_pro_bundesland AS
(
SELECT bundeslaender.id AS bundeslaender_id, SUM(s.einwohnerzahl) AS einwohnerzahl, wahl_id
FROM bundeslaender JOIN wahlkreise ON bundeslaender.id = wahlkreise.bundesland_id JOIN  strukturdaten s on wahlkreise.id = s.wahlkreis_id
GROUP BY bundeslaender.id, wahl_id
);

CREATE MATERIALIZED VIEW zweitstimmen_wahlkreis_partei AS
SELECT parteien.id as parteien_id, wahlen.id as wahlen_id, wahlkreise.id as wahlkreise_id, count(*) as stimmen_sum
from zweitstimmen
         join wahlen on zweitstimmen.wahl_id = wahlen.id
         join parteien on zweitstimmen.partei_id = parteien.id
         join wahlkreise on zweitstimmen.wahlkreis_id = wahlkreise.id
group by parteien.id, wahlen.id, wahlkreise.id;

CREATE MATERIALIZED VIEW zweitstimmen_bundesland_partei AS
SELECT parteien_id, wahlen_id, bundeslaender.id as bundeslaender_id, sum(stimmen_sum) as stimmen_sum
from zweitstimmen_wahlkreis_partei
         join wahlkreise on wahlkreise_id = wahlkreise.id
         join bundeslaender on wahlkreise.bundesland_id = bundeslaender.id
group by parteien_id, wahlen_id, bundeslaender.id;

CREATE OR REPLACE VIEW zweitstimmen_bundesland_partei_with_votes AS
SELECT parteien_id, wahlen_id, bundeslaender_id, stimmen_sum
from zweitstimmen_bundesland_partei
where stimmen_sum > 0;

CREATE MATERIALIZED VIEW zweitstimmen_partei AS
SELECT parteien_id, wahlen_id, sum(stimmen_sum) as stimmen_sum
from zweitstimmen_bundesland_partei
group by parteien_id, wahlen_id;

CREATE MATERIALIZED VIEW wahlkreis_winners AS --erststimmen
WITH candidate_votes AS (SELECT wahlkreis_id, w.kandidat_id, w.partei_id, w.wahl_id, COUNT(*) AS votes
                         FROM erststimmen e
                                  JOIN wahlkreiskandidaturen w ON e.wahlkreiskandidatur_id = w.id
                         GROUP BY wahlkreis_id, w.kandidat_id, w.partei_id, w.wahl_id),
     max_votes AS (SELECT wahlkreis_id, wahl_id, MAX(votes) AS max_votes
                   FROM candidate_votes
                   GROUP BY wahlkreis_id, wahl_id)
SELECT cv.wahlkreis_id, cv.wahl_id, cv.kandidat_id, cv.partei_id
FROM candidate_votes cv
         JOIN max_votes mv ON cv.wahlkreis_id = mv.wahlkreis_id AND cv.wahl_id = mv.wahl_id AND cv.votes = mv.max_votes;

----------Berechnungen----------

CREATE MATERIALIZED VIEW bundestag_parties AS
WITH total_stimmen as (SELECT wahlen_id, SUM(stimmen_sum) as total_stimmen
                       FROM zweitstimmen_partei
                       GROUP BY wahlen_id),
     three_wahlkreis_parties as (SELECT partei_id, wahl_id
                                 FROM wahlkreis_winners
                                 GROUP BY partei_id, wahl_id
                                 HAVING count(*) >= 3)
SELECT parteien_id, zp.wahlen_id
FROM zweitstimmen_partei zp
         join total_stimmen ts on zp.wahlen_id = ts.wahlen_id
         JOIN parteien p on zp.parteien_id = p.id
WHERE p."shortName" = 'SSW'
   or ((stimmen_sum * 1.00) / (total_stimmen)) > 0.05
   or parteien_id in (SELECT partei_id FROM three_wahlkreis_parties twp WHERE zp.wahlen_id = twp.wahl_id);

CREATE OR REPLACE VIEW zweitstimmen_bundesland_bundestags_parteien_with_votes AS
SELECT zs.parteien_id, zs.wahlen_id, bundeslaender_id, stimmen_sum
from zweitstimmen_bundesland_partei zs join bundestag_parties bp on zs.parteien_id = bp.parteien_id and zs.wahlen_id = bp.wahlen_id
where stimmen_sum > 0;


CREATE OR REPLACE VIEW ov_1_sitzkontingente_bundesleander as
SELECT sl.id as bundeslaender_id, sl.slots, sl.wahl_id
FROM sainte_lague('einwohner_pro_bundesland', 'bundeslaender_id', 'einwohnerzahl', 598, 1) sl
UNION ALL
SELECT sl2.id as bundeslaender_id, sl2.slots, sl2.wahl_id
FROM sainte_lague('einwohner_pro_bundesland', 'bundeslaender_id', 'einwohnerzahl', 598, 2) sl2;

--Depends on dynamic statement and can thus not be a materialized view
CREATE TABLE uv_1_sitzkontingente_landeslisten AS
SELECT wahl_id, bundesland_id, partei_id, sitze
FROM calculate_seats_per_party_per_bundesland_and_election();

CREATE OR REPLACE VIEW wahlkreissitze_parteien AS
SELECT bp.wahlen_id as wahl_id, b.id as bundesland_id, bp.parteien_id as partei_id, COALESCE(COUNT(ww.wahlkreis_id), 0) AS wahlkreissitze
FROM (bundestag_parties bp join wahlen w on bp.wahlen_id = w.id) CROSS JOIN bundeslaender b LEFT JOIN
     (wahlkreis_winners ww1 join wahlkreise wk on ww1.wahlkreis_id = wk.id) ww
      on bp.parteien_id = ww.partei_id and bp.wahlen_id = ww.wahl_id and ww.bundesland_id = b.id
GROUP BY bp.wahlen_id, bp.parteien_id, b.id;

--Should be materialized because used in loop in function
CREATE MATERIALIZED VIEW wahlkreissitze_parteien_bundesweit AS
SELECT wahl_id, partei_id, sum(wahlkreissitze) as wahlkreissitze
FROM wahlkreissitze_parteien
GROUP BY wahl_id, partei_id;

--Should be materialized because used in loop in function
CREATE MATERIALIZED VIEW mindestsitzanspruch_partei_bundesland AS
SELECT sk.wahl_id, sk.bundesland_id, sk.partei_id, sk.sitze, wahlkreissitze, GREATEST(0, (coalesce(wahlkreissitze, 0) - sk.sitze)) as drohender_ueberhang, GREATEST(TRUNC((coalesce(wahlkreissitze, 0)::NUMERIC + sk.sitze::NUMERIC)/2 + 0.5), wahlkreissitze) as mindestsitzzahlen
FROM uv_1_sitzkontingente_landeslisten sk join wahlkreissitze_parteien wp on wp.wahl_id = sk.wahl_id and wp.bundesland_id = sk.bundesland_id and wp.partei_id = sk.partei_id;

--Should be materialized because used in loop in function
CREATE MATERIALIZED VIEW ov_2_sitzkontingente_bundesweit_erhoeht_basis AS
SELECT wahl_id, partei_id, GREATEST(sum(sitze), sum(mindestsitzzahlen)) as mindestsitzanspruch, sum(drohender_ueberhang) as drohender_ueberhang, zs.stimmen_sum, sum(sitze) as sitze
FROM mindestsitzanspruch_partei_bundesland msa join zweitstimmen_partei zs on zs.wahlen_id = msa.wahl_id and zs.parteien_id = msa.partei_id
GROUP BY wahl_id, partei_id, zs.stimmen_sum;

--Depends on dynamic statement and can thus not be a materialized view
CREATE TABLE ov_2_sitzkontingente_bundesweit_erhoeht AS
SELECT wahl_id, partei_id, stimmen_sum, mindestsitzanspruch, verbleibender_ueberhang, sitze_nach_erhoehung from calculate_seats_per_party_per_election_nationwide(1)
UNION
SELECT wahl_id, partei_id, stimmen_sum, mindestsitzanspruch, verbleibender_ueberhang, sitze_nach_erhoehung from calculate_seats_per_party_per_election_nationwide(2);


--Depends on dynamic statement and can thus not be a materialized view
CREATE TABLE uv_2_sitzkontingente_landeslisten_erhoeht AS
SELECT calc.wahl_id, calc.bundesland_id, calc.partei_id, calc.landeslistensitze, calc.stimmen_sum, calc.mindestsitzanspruch, calc.sitze_final as sum
FROM calculate_increased_seats_per_party_per_bundesland_and_election() calc;

CREATE MATERIALIZED VIEW abgeordnete AS
WITH wahlkreis_winners_bundesland AS (
    SELECT ww.wahl_id, ww.partei_id, w.bundesland_id, COUNT(*) as sum
    FROM wahlkreis_winners ww
    JOIN wahlkreise w on ww.wahlkreis_id = w.id
    GROUP BY wahl_id, partei_id, bundesland_id
),
listenabgeordnete_anzahl AS (
    SELECT u.wahl_id, u.bundesland_id, u.partei_id, COALESCE(u.sum, 0) - COALESCE(wwb.sum, 0) AS difference
    FROM uv_2_sitzkontingente_landeslisten_erhoeht u
    LEFT JOIN wahlkreis_winners_bundesland wwb
    ON u.wahl_id = wwb.wahl_id AND u.partei_id = wwb.partei_id AND u.bundesland_id = wwb.bundesland_id
),
unmatched_candidates AS (
    SELECT kandidat_id, wahl_id, "listPosition", partei_id, bundesland_id
    FROM listenkandidaturen
    WHERE (kandidat_id, wahl_id) NOT IN (
        SELECT kandidat_id, wahl_id
        FROM wahlkreis_winners
    )
),
ranked_remaining_candidates AS (
SELECT uc.kandidat_id, uc.wahl_id, uc."listPosition", uc.partei_id, uc.bundesland_id, dv.difference,
        ROW_NUMBER() OVER (
            PARTITION BY uc.wahl_id, uc.partei_id, uc.bundesland_id
            ORDER BY uc."listPosition" ASC
        ) AS rank
FROM unmatched_candidates uc
JOIN listenabgeordnete_anzahl dv ON uc.wahl_id = dv.wahl_id AND uc.partei_id = dv.partei_id AND uc.bundesland_id = dv.bundesland_id
),
listenabgeordnete AS (
SELECT *
FROM ranked_remaining_candidates
WHERE rank <= difference
)
SELECT wahl_id, kandidat_id, partei_id FROM listenabgeordnete
UNION
SELECT wahl_id, kandidat_id, partei_id FROM wahlkreis_winners;