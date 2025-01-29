CREATE MATERIALIZED VIEW wahlkreis_knappste_sieger AS
WITH candidate_votes AS (
    SELECT wahlkreis_id, w.kandidat_id, w.partei_id, w.wahl_id, COUNT(*) AS votes
    FROM erststimmen e
    JOIN wahlkreiskandidaturen w ON e.wahlkreiskandidatur_id = w.id
    GROUP BY wahlkreis_id, w.kandidat_id, w.partei_id, w.wahl_id
),
ranked_votes AS (
    SELECT cv.wahlkreis_id, cv.wahl_id, cv.kandidat_id, cv.partei_id, cv.votes,
           RANK() OVER (PARTITION BY cv.wahlkreis_id, cv.wahl_id ORDER BY cv.votes DESC) AS vote_rank
    FROM candidate_votes cv
),
second_place_votes AS (
    SELECT wahlkreis_id, wahl_id, MAX(votes) AS second_place_votes
    FROM ranked_votes
    WHERE vote_rank = 2
    GROUP BY wahlkreis_id, wahl_id
),
margin_calculation AS (
    SELECT r1.wahlkreis_id, r1.wahl_id, r1.kandidat_id AS winner_kandidat_id, r1.partei_id AS winner_partei_id,
           r1.votes AS winner_votes, COALESCE(r2.second_place_votes, 0) AS second_place_votes,
           (r1.votes - COALESCE(r2.second_place_votes, 0)) AS margin
    FROM ranked_votes r1
    LEFT JOIN second_place_votes r2 ON r1.wahlkreis_id = r2.wahlkreis_id AND r1.wahl_id = r2.wahl_id
    WHERE r1.vote_rank = 1
),
party_margin_calculation AS (
    SELECT m.wahlkreis_id, m.wahl_id, m.winner_kandidat_id, m.winner_partei_id, m.margin,
           DENSE_RANK() OVER (PARTITION BY m.winner_partei_id, m.wahl_id ORDER BY m.margin ASC) AS margin_rank
    FROM margin_calculation m
),
losing_margins AS (
    SELECT r.wahlkreis_id, r.wahl_id, r.kandidat_id AS losing_kandidat_id, r.partei_id AS losing_partei_id,
           r.votes AS losing_votes, COALESCE(r2.votes, 0) AS winning_votes,
           (COALESCE(r2.votes, 0) - r.votes) AS margin
    FROM ranked_votes r
    JOIN ranked_votes r2 ON r.wahlkreis_id = r2.wahlkreis_id AND r.wahl_id = r2.wahl_id AND r2.vote_rank = 1
    WHERE r.partei_id != r2.partei_id
),
party_losing_margins AS (
    SELECT l.wahlkreis_id, l.wahl_id, l.losing_kandidat_id, l.losing_partei_id, l.margin,
           DENSE_RANK() OVER (PARTITION BY l.losing_partei_id, l.wahl_id ORDER BY l.margin ASC) AS margin_rank
    FROM losing_margins l
),
relevant_parties AS (
    SELECT DISTINCT parteien_id AS partei_id, wahlen_id AS wahl_id FROM bundestag_parties
),
winner_results AS (
    SELECT p.wahlkreis_id, p.wahl_id, p.winner_kandidat_id AS kandidat_id, p.winner_partei_id AS partei_id,
           p.margin, p.margin_rank
    FROM party_margin_calculation p
    WHERE p.margin_rank <= 10 AND EXISTS (
        SELECT 1 FROM relevant_parties rp WHERE rp.partei_id = p.winner_partei_id AND rp.wahl_id = p.wahl_id
    )
),
loser_results AS (
    SELECT l.wahlkreis_id, l.wahl_id, l.losing_kandidat_id AS kandidat_id, l.losing_partei_id AS partei_id,
           l.margin, l.margin_rank
    FROM party_losing_margins l
    WHERE l.margin_rank <= 10 AND NOT EXISTS (
        SELECT 1 FROM party_margin_calculation p
        WHERE p.winner_partei_id = l.losing_partei_id AND p.wahl_id = l.wahl_id
    ) AND EXISTS (
        SELECT 1 FROM relevant_parties rp WHERE rp.partei_id = l.losing_partei_id AND rp.wahl_id = l.wahl_id
    )
)
SELECT *, 'Winner' AS result_status FROM winner_results
UNION ALL
SELECT *, 'Loser' AS result_status FROM loser_results;


