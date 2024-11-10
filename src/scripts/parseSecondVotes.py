from datetime import datetime

import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import Column, Integer, String
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship, declarative_base
from pathlib import Path

from src.database.models import Wahl, Wahlkreis, Wahlkreiskandidatur, Partei, Erststimme, Zweitstimme

DATABASE_URL = "postgresql://admin:admin@localhost:5432/mydatabase"

engine = create_engine(DATABASE_URL)

Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)



df = pd.read_csv(Path('sourcefiles', 'kerg2.csv'), delimiter=';')


# Filtern der Zeilen, bei denen 'Stimme' == 1
filtered_df = df[(df['Stimme'] == 2) & (df['Gruppenart'] == 'Partei') & (df['Gebietsart'] == 'Wahlkreis')]


# Session starten
db = Session()

# Für jedes gefilterte Tupel ein neues Objekt erstellen und in die Datenbank einfügen
for index, row in filtered_df.iterrows():
    # Get the count from the 'Anzahl' column
    count = int(row['Anzahl']) if not pd.isna(row['Anzahl']) else 0

    date_str = row['Wahltag']  # Assuming this is in 'DD.MM.YYYY' format, like '26.09.2021'
    wahl_date = datetime.strptime(date_str, '%d.%m.%Y').date()

    wahl = db.query(Wahl).filter_by(
        date=wahl_date,
    ).one_or_none()

    wahlkreis = db.query(Wahlkreis).filter_by(
        name = row['Gebietsname'],
    ).one_or_none()

    partei = db.query(Partei).filter_by(
        shortName = row['Gruppenname'],
    ).one_or_none()

    # Inner loop to insert 'Erststimme' objects 'count' times
    for _ in range(count):
        # Create a new Erststimme object with the necessary data
        zweitstimme = Zweitstimme(
            wahlkreis_id=wahlkreis.id,
            partei_id=partei.id,
            wahl_id=wahl.id,
        )
        print(zweitstimme)
        # Add the object to the session
        #db.add(zweitstimme)

    # Optional: Print the Erststimme object for debugging
# Commit der Änderungen und Session schließen
db.commit()
db.close()