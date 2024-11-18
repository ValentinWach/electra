-- Refresh the materialized views in dependency order
BEGIN;

-- Refresh the lowest-level view first
REFRESH MATERIALIZED VIEW zweitstimmen_wahlkreis_partei;

-- Refresh the second-level view
REFRESH MATERIALIZED VIEW zweitstimmen_bundesland_partei;

-- Refresh the third-level view
REFRESH MATERIALIZED VIEW zweitstimmen_partei;

-- Refresh the view related to the election winners
REFRESH MATERIALIZED VIEW wahlkreis_winners;

-- Refresh the final view for bundestag parties
REFRESH MATERIALIZED VIEW bundestag_parties;

COMMIT;