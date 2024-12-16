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

CREATE MATERIALIZED VIEW zweitstimmen_partei AS
SELECT parteien_id, wahlen_id, sum(stimmen_sum) as stimmen_sum
from zweitstimmen_bundesland_partei
group by parteien_id, wahlen_id;

CREATE MATERIALIZED VIEW wahlkreis_winners AS
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

CREATE MATERIALIZED VIEW bundestag_parties AS
WITH total_stimmen as (SELECT wahl_id, count(*) as total_stimmen
                       FROM zweitstimmen
                       GROUP BY wahl_id),
     three_wahlkreis_parties as (SELECT partei_id, wahl_id
                                 FROM wahlkreis_winners
                                 GROUP BY partei_id, wahl_id
                                 HAVING count(*) >= 3)
SELECT parteien_id, wahlen_id
FROM zweitstimmen_partei zp
         join total_stimmen ts on zp.wahlen_id = ts.wahl_id
WHERE parteien_id = 37
   or ((stimmen_sum * 1.00) / (total_stimmen)) > 0.05
   or parteien_id in (SELECT partei_id FROM three_wahlkreis_parties twp WHERE zp.wahlen_id = twp.wahl_id);

--Depends on dynamic statement and can thus not be a materialized view
CREATE TABLE uv_sitzkontingente_parteien_bundestag AS
SELECT wahl_id, bundesland_id, partei_id, sitze
FROM calculate_seats_per_party_per_bundesland_and_election(1)
UNION
SELECT wahl_id, bundesland_id, partei_id, sitze
FROM calculate_seats_per_party_per_bundesland_and_election(2);

--Depends on dynamic statement and can thus not be a materialized view
CREATE TABLE ov_sitzkontingente_erhoehung AS
SELECT wahl_id, partei_id, stimmen_sum, mindestsitzanspruch, verbleibender_ueberhang, sitze_nach_erhoehung from calculate_seats_per_party_per_election_nationwide(1)
UNION
SELECT wahl_id, partei_id, stimmen_sum, mindestsitzanspruch, verbleibender_ueberhang, sitze_nach_erhoehung from calculate_seats_per_party_per_election_nationwide(2);

--Depends on dynamic statement and can thus not be a materialized view
CREATE TABLE uv_landeslisten_erhoeht AS
SELECT calc.bundesland_id, calc.partei_id, calc.landeslistensitze, calc.stimmen_sum, calc.mindestsitzanspruch, calc.sitze_final as sum FROM calculate_increased_seats_per_party_per_bundesland_and_election() calc;
