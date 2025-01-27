import os
from datetime import datetime
from sqlalchemy import create_engine, Table, Column, Integer, MetaData
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from pathlib import Path
from sqlalchemy.ext.automap import automap_base

# Change to the script's directory
os.chdir(Path(__file__).parent)

# Import models
import sys
script_dir = Path(__file__).parent.parent.parent / 'src'
sys.path.append(str(script_dir))

from openapi_server.database.base import Base
from openapi_server.database.models import *

# Load environment variables and setup database connection
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("No DATABASE_URL found in the environment variables")

engine = create_engine(DATABASE_URL)
Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Drop all existing tables
Base.metadata.drop_all(bind=engine)

# Create all tables from models
Base.metadata.create_all(bind=engine)

# Disable all constraints and indexes before data import
print("Disabling constraints and indexes...")
with Session().connection().connection.cursor() as cursor:
    # Erststimmen
    cursor.execute("ALTER TABLE erststimmen DROP CONSTRAINT erststimmen_wahlkreiskandidatur_id_fkey")
    cursor.execute("DROP INDEX IF EXISTS ix_erststimmen_wahlkreiskandidatur_id")
    
    # Zweitstimmen
    cursor.execute("ALTER TABLE zweitstimmen DROP CONSTRAINT zweitstimmen_wahlkreis_id_fkey")
    cursor.execute("ALTER TABLE zweitstimmen DROP CONSTRAINT zweitstimmen_partei_id_fkey")
    cursor.execute("ALTER TABLE zweitstimmen DROP CONSTRAINT zweitstimmen_wahl_id_fkey")
    cursor.execute("DROP INDEX IF EXISTS ix_zweitstimmen_wahlkreis_id")
    cursor.execute("DROP INDEX IF EXISTS ix_zweitstimmen_partei_id")
    cursor.execute("DROP INDEX IF EXISTS ix_zweitstimmen_wahl_id")

# Create temporary table for einwohner_pro_bundesland
metadata = MetaData()
einwohner_pro_bundesland_temp = Table(
    'einwohner_pro_bundesland_temp',
    metadata,
    Column('bundesland_id', Integer),
    Column('einwohnerzahl', Integer),
    Column('wahl_id', Integer)
)
metadata.create_all(bind=engine)

# Create a single session for all operations
session = Session()

# Insert Bundesländer and Wahlen data
bundeslaender_data = [
    'Baden-Württemberg', 'Bayern', 'Berlin', 'Brandenburg', 'Bremen',
    'Hamburg', 'Hessen', 'Mecklenburg-Vorpommern', 'Niedersachsen',
    'Nordrhein-Westfalen', 'Rheinland-Pfalz', 'Saarland', 'Sachsen',
    'Sachsen-Anhalt', 'Schleswig-Holstein', 'Thüringen'
]

for name in bundeslaender_data:
    bundesland = Bundesland(name=name)
    session.add(bundesland)

# Insert Wahlen
wahlen_data = ['2021-09-26', '2017-09-24']
for date_str in wahlen_data:
    date = datetime.strptime(date_str, '%Y-%m-%d').date()
    wahl = Wahl(date=date)
    session.add(wahl)

session.commit()

# Insert einwohner_pro_bundesland_temp data
einwohner_data = [
    (1, 9313413, 1), (1, 9365001, 2),
    (2, 11328866, 1), (2, 11362245, 2),
    (3, 2942960, 1), (3, 2975745, 2),
    (4, 2391746, 2), (4, 2397701, 1),
    (5, 548941, 1), (5, 568510, 2),
    (6, 1525090, 2), (6, 1537766, 1),
    (7, 5222158, 1), (7, 5281198, 2),
    (8, 1548400, 2), (8, 1532412, 1),
    (9, 7207587, 1), (9, 7278789, 2),
    (10, 15707569, 2), (10, 15415642, 1),
    (11, 3661245, 2), (11, 3610865, 1),
    (12, 899748, 2), (12, 865191, 1),
    (13, 3826905, 1), (13, 3914671, 2),
    (14, 2145671, 2), (14, 2056177, 1),
    (15, 2659792, 1), (15, 2673803, 2),
    (16, 1996822, 1), (16, 2077901, 2)
]

for bundesland_id, einwohnerzahl, wahl_id in einwohner_data:
    einwohner_pro_bundesland_temp.insert().values(
        bundesland_id=bundesland_id,
        einwohnerzahl=einwohnerzahl,
        wahl_id=wahl_id
    )

session.commit()

# Import all parsing functions
from parseWahlkreise import parse_wahlkreise
from parseParties import parse_parties
from parseCandidates import parse_candidates
from parseDirectcandidacies import parse_directcandidacies
from parseListCandidacies import parse_listcandidacies
from parseDirectVotes import parse_direct_votes
from parseListVotes import parse_list_votes
from parseStructuralData import parse_structural_data

# Run parsing functions in order
print("Running parseWahlkreise...")
parse_wahlkreise(session, Base)

print("\nProcessing data for 2021 election...")
parse_parties(session, Base, '2021')
parse_candidates(session, Base, '2021')
parse_directcandidacies(session, Base, '2021')
parse_listcandidacies(session, Base, '2021')
parse_direct_votes(session, Base, '2021')
parse_list_votes(session, Base, '2021')

print("\nProcessing data for 2017 election...")
parse_parties(session, Base, '2017')
parse_candidates(session, Base, '2017')
parse_directcandidacies(session, Base, '2017')
parse_listcandidacies(session, Base, '2017')
parse_direct_votes(session, Base, '2017')
parse_list_votes(session, Base, '2017')

print("\nRunning parseStructuralData...")
parse_structural_data(session, Base)

# Re-enable all constraints and rebuild indexes after data import
print("Rebuilding constraints and indexes...")
with Session().connection().connection.cursor() as cursor:
    # Erststimmen
    cursor.execute("""
        ALTER TABLE erststimmen 
        ADD CONSTRAINT erststimmen_wahlkreiskandidatur_id_fkey 
        FOREIGN KEY (wahlkreiskandidatur_id) 
        REFERENCES wahlkreiskandidaturen(id)
    """)
    cursor.execute("CREATE INDEX ix_erststimmen_wahlkreiskandidatur_id ON erststimmen(wahlkreiskandidatur_id)")
    
    # Zweitstimmen
    cursor.execute("""
        ALTER TABLE zweitstimmen 
        ADD CONSTRAINT zweitstimmen_wahlkreis_id_fkey 
        FOREIGN KEY (wahlkreis_id) 
        REFERENCES wahlkreise(id)
    """)
    cursor.execute("""
        ALTER TABLE zweitstimmen 
        ADD CONSTRAINT zweitstimmen_partei_id_fkey 
        FOREIGN KEY (partei_id) 
        REFERENCES parteien(id)
    """)
    cursor.execute("""
        ALTER TABLE zweitstimmen 
        ADD CONSTRAINT zweitstimmen_wahl_id_fkey 
        FOREIGN KEY (wahl_id) 
        REFERENCES wahlen(id)
    """)
    cursor.execute("CREATE INDEX ix_zweitstimmen_wahlkreis_id ON zweitstimmen(wahlkreis_id)")
    cursor.execute("CREATE INDEX ix_zweitstimmen_partei_id ON zweitstimmen(partei_id)")
    cursor.execute("CREATE INDEX ix_zweitstimmen_wahl_id ON zweitstimmen(wahl_id)")

session.close()
print("\nDatabase setup completed successfully!") 