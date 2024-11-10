from datetime import datetime

import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import Column, Integer, String
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship, declarative_base
from pathlib import Path

from src.database.models import Wahl, Wahlkreis, Wahlkreiskandidatur, Partei, Erststimme

DATABASE_URL = "postgresql://admin:admin@localhost:5432/mydatabase"

engine = create_engine(DATABASE_URL)

Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)

df = pd.read_csv(Path('sourcefiles', 'kerg2.csv'), delimiter=';')

# Filtern der Zeilen, bei denen 'Stimme' == 1
filtered_df = df[(df['Stimme'] == 1) & (df['Gruppenart'] == 'Partei') & (df['Gebietsart'] == 'Wahlkreis')]

# Session starten
db = Session()

# Für jedes gefilterte Tupel ein neues Objekt erstellen und in die Datenbank einfügen
batch_size = 100000
batch = []

counter = 0
for index, row in filtered_df.iterrows():
    print(f"Count: {counter}")
    counter += 1

    if pd.isna(row['Anzahl']):
        continue

    count = int(row['Anzahl'])

    date_str = row['Wahltag']  # Assuming this is in 'DD.MM.YYYY' format, like '26.09.2021'
    wahl_date = datetime.strptime(date_str, '%d.%m.%Y').date()

    wahl = db.query(Wahl).filter_by(
        date=wahl_date,
    ).one()

    wahlkreis = db.query(Wahlkreis).filter_by(
        name=row['Gebietsname'],
    ).one()

    partei = db.query(Partei).filter_by(
        shortName=row['Gruppenname'],
    ).one()

    wahlkreiskandidatur = db.query(Wahlkreiskandidatur).filter_by(
        wahlkreis_id=wahlkreis.id,
        wahl_id=wahl.id,
        partei_id=partei.id
    ).one()

    erststimme = Erststimme(
        wahlkreis_id=wahlkreis.id,
        wahlkreiskandidatur_id=wahlkreiskandidatur.id,
        wahl_id=wahl.id,
    )

    # Inner loop to insert 'Erststimme' objects 'count' times
    for _ in range(count):
        # Create a new Erststimme object with the necessary data

        batch.append(erststimme)
        if len(batch) >= batch_size:
            db.bulk_save_objects(batch)
            db.commit()
            batch = []

# Save any remaining objects in the batch
if batch:
    db.bulk_save_objects(batch)
    db.commit()

db.close()
