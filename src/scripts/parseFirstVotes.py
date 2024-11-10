from datetime import datetime
import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from pathlib import Path
import os
from src.database.models import Wahl, Wahlkreis, Partei, Wahlkreiskandidatur

# Database configuration
DATABASE_URL = "postgresql://admin:admin@localhost:5432/mydatabase"
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)

# Load and filter data
df = pd.read_csv(Path('sourcefiles', 'kerg2.csv'), delimiter=';')
filtered_df = df[(df['Stimme'] == 1) & (df['Gruppenart'] == 'Partei') & (df['Gebietsart'] == 'Wahlkreis')]

# Session starten
session = Session()

# Prepare data for bulk insert
foreign_keys = []

counter = 0
for index, row in filtered_df.iterrows():
    if(counter % 1000 == 0):
        print(counter)
    counter += 1
    count = int(row['Anzahl']) if not pd.isna(row['Anzahl']) else 0

    # Convert and cache date
    date_str = row['Wahltag']
    wahl_date = datetime.strptime(date_str, '%d.%m.%Y').date()

    # Use the session to fetch foreign key IDs
    wahl = session.query(
        Wahl.id
    ).filter_by(date=wahl_date).scalar()
    wahlkreis = session.query(
        Wahlkreis.id
    ).filter_by(name=row['Gebietsname']).scalar()
    partei = session.query(
        Partei.id
    ).filter_by(shortName=row['Gruppenname']).scalar()
    wahlkreiskandidatur = session.query(
        Wahlkreiskandidatur.id
    ).filter_by(
        wahlkreis_id=wahlkreis,
        wahl_id=wahl,
        partei_id=partei
    ).scalar()

    # If all foreign keys are valid, append `count` rows
    if wahl and wahlkreis and partei and wahlkreiskandidatur:
        for _ in range(count):
            foreign_keys.append((wahlkreis, wahlkreiskandidatur, wahl))

# Close session after querying
session.close()

bulk_df = pd.DataFrame(foreign_keys, columns=['wahlkreis_id', 'wahlkreiskandidatur_id', 'wahl_id'])
# Write to a temporary CSV file
temp_csv = Path('temp_erststimme.csv')
bulk_df.to_csv(temp_csv, index=False, header=False)

with engine.connect() as conn:
    # Access the raw psycopg2 connection to use cursor
    with conn.begin():  # Begin a transaction
        raw_conn = conn.connection
        with raw_conn.cursor() as cursor:
            cursor.execute("TRUNCATE TABLE erststimmen") # Empty Table
            with open(temp_csv, 'r') as f:
                cursor.copy_expert("COPY erststimmen (wahlkreis_id, wahlkreiskandidatur_id, wahl_id) FROM stdin WITH CSV", f)
    conn.commit()

os.remove(temp_csv)
