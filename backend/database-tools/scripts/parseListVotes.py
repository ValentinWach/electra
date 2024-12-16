from datetime import datetime
import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from pathlib import Path
import os
from backend.src.app.src.openapi_server.database.models import Wahl, Wahlkreis, Partei

# Database configuration
DATABASE_URL = "postgresql://admin:admin@localhost:5432/postgres"
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)

# Load and filter data
df = pd.read_csv(Path('sourcefiles', 'kerg2_2017.csv'), delimiter=';')
filtered_df = df[(df['Stimme'] == 2) & (df['Gruppenart'] == 'Partei') & (df['Gebietsart'] == 'Wahlkreis')]

# Session starten
session = Session()

# Prepare data for bulk insert
foreign_keys = []

rowCounter = 0
voteCounter = 0
for index, row in filtered_df.iterrows():
    if(rowCounter % 1000 == 0):
        print(rowCounter)
    rowCounter += 1

    count = 0
    if(pd.isna(row['Anzahl'])):
        continue
    else:
        count = int(row['Anzahl'])

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

    partei_id = session.query(
        Partei.id
    ).filter_by(shortName=row['Gruppenname']).scalar()

    if not wahl_id:
        raise ValueError("Foreign key 'wahl_id' not found")
    if not wahlkreis_id:
        raise ValueError("Foreign key 'wahlkreis_id' not found")
    if not partei_id:
        raise ValueError("Foreign key 'partei_id' not found")

    # If all foreign keys are valid, append `count` rows
    if wahl_id and wahlkreis_id and partei_id:
        for _ in range(count):
            foreign_keys.append((wahlkreis_id, partei_id, wahl_id))
            voteCounter += 1

# Close session after querying
print(voteCounter)
session.close()

bulk_df = pd.DataFrame(foreign_keys, columns=['wahlkreis_id', 'partei_id', 'wahl_id'])
# Write to a temporary CSV file
temp_csv = Path('temp_zweitstimme.csv')
bulk_df.to_csv(temp_csv, index=False, header=False)

with engine.connect() as conn:
    # Access the raw psycopg2 connection to use cursor
    with conn.begin():  # Begin a transaction
        raw_conn = conn.connection
        with raw_conn.cursor() as cursor:
            with open(temp_csv, 'r') as f:
                cursor.copy_expert("COPY zweitstimmen (wahlkreis_id, partei_id, wahl_id) FROM stdin WITH CSV", f)
    conn.commit()

os.remove(temp_csv)
