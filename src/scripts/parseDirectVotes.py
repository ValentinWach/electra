from datetime import datetime
import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from pathlib import Path
import os
from src.database.models import Wahl, Wahlkreis, Partei, Wahlkreiskandidatur, Kandidat

# Database configuration
DATABASE_URL = "postgresql://admin:admin@localhost:5432/postgres"
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)

# Load and filter data
df = pd.read_csv(Path('sourcefiles', 'kerg2_2017.csv'), delimiter=';')
filtered_df = df[(df['Stimme'] == 1) & ((df['Gruppenart'] == 'Partei') | (df['Gruppenart'] == 'Einzelbewerber/Wählergruppe')) & (df['Gebietsart'] == 'Wahlkreis')]

# Session starten
session = Session()

# Prepare data for bulk insert
wahlkreiskandidaturen_id = []

voteCounter = 0
rowCounter = 0
for index, row in filtered_df.iterrows():
    if(rowCounter % 1000 == 0):
        print(rowCounter)
    rowCounter += 1

    count = 0
    if not pd.isna(row['Anzahl']):
        count = int(row['Anzahl'])
    else:
        continue


    # Convert and cache date
    date_str = row['Wahltag']
    wahl_date = datetime.strptime(date_str, '%d.%m.%Y').date()

    # Use the session to fetch foreign key IDs
    wahl_id = session.query(
        Wahl.id
    ).filter_by(date=wahl_date).scalar()

    row['Gebietsname'] = 'Höxter – Gütersloh III – Lippe II' if row['Gebietsname'] == 'Höxter – Lippe II' else row['Gebietsname']
    row['Gebietsname'] = 'Paderborn' if row['Gebietsname'] == 'Paderborn – Gütersloh III' else row['Gebietsname']

    wahlkreis_id = session.query(
        Wahlkreis.id
    ).filter_by(name=row['Gebietsname']).scalar()

    row['Gruppenname'] = 'HEIMAT (2021: NPD)' if row['Gruppenname'] == 'NPD' else row['Gruppenname']
    row['Gruppenname'] = 'Wir Bürger (2021: LKR)' if row['Gruppenname'] == 'LKR' else row['Gruppenname']
    row['Gruppenname'] = 'Verjüngungsforschung (2021: Gesundheitsforschung)' if row['Gruppenname'] == 'Gesundheitsforschung' else row['Gruppenname']

    # Einzelbewerber?
    if row['Gruppenname'].startswith('EB: '):
        kandidat_id = session.query(
            Kandidat.id
        ).filter(
            Kandidat.id.in_(
                session.query(Wahlkreiskandidatur.kandidat_id).filter_by(
                    wahlkreis_id=wahlkreis_id,
                    wahl_id=wahl_id,
                    partei_id=None
                )
            )
        ).filter_by(name=row['Gruppenname'].split(":")[1].strip()).scalar()

        wahlkreiskandidatur_id = session.query(
            Wahlkreiskandidatur.id
        ).filter_by(
            wahlkreis_id=wahlkreis_id,
            wahl_id=wahl_id,
            kandidat_id=kandidat_id
        ).scalar()
    else:
        partei_id = session.query(
            Partei.id
        ).filter_by(shortName=row['Gruppenname']).scalar()
        wahlkreiskandidatur_id = session.query(
            Wahlkreiskandidatur.id
        ).filter_by(
            wahlkreis_id=wahlkreis_id,
            wahl_id=wahl_id,
            partei_id=partei_id
        ).scalar()

    if not wahl_id:
        raise ValueError("Foreign key 'wahl_id' not found")
    if not wahlkreis_id:
        raise ValueError("Foreign key 'wahlkreis_id' not found")
    if not partei_id:
        raise ValueError("Foreign key 'partei_id' not found")
    if not wahlkreiskandidatur_id:
        raise ValueError("'wahlkreiskandidatur_id' not found")
    # If all foreign keys are valid, append `count` rows
    if wahl_id and wahlkreis_id and partei_id and wahlkreiskandidatur_id:
        for _ in range(count):
            wahlkreiskandidaturen_id.append(wahlkreiskandidatur_id)
            voteCounter += 1
print(voteCounter)
# Close session after querying
session.close()

bulk_df = pd.DataFrame(wahlkreiskandidaturen_id, columns=['wahlkreiskandidatur_id'])
# Write to a temporary CSV file
temp_csv = Path('temp_erststimme.csv')
bulk_df.to_csv(temp_csv, index=False, header=False)

with engine.connect() as conn:
    # Access the raw psycopg2 connection to use cursor
    with conn.begin():  # Begin a transaction
        raw_conn = conn.connection
        with raw_conn.cursor() as cursor:
            with open(temp_csv, 'r') as f:
                cursor.copy_expert("COPY erststimmen (wahlkreiskandidatur_id) FROM stdin WITH CSV", f)
    conn.commit()

os.remove(temp_csv)
