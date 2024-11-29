import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import Column, Integer, String
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship, declarative_base
from pathlib import Path

from backend.src.database.models import Partei, Kandidat

DATABASE_URL = "postgresql://admin:admin@localhost:5432/postgres"

engine = create_engine(DATABASE_URL)

Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)


df = pd.read_csv(Path('sourcefiles', 'kandidaturen_2017.csv'), delimiter=';', keep_default_na=False)

# Filtern der Zeilen, bei denen 'Stimme' == 1
# Filter for rows where 'Gruppenart_XML' is either 'PARTEI' or 'EINZELBEWERBER'
filtered_df = df
# Session starten
db = Session()

# Für jedes gefilterte Tupel ein neues Objekt erstellen und in die Datenbank einfügen


for index, row in filtered_df.iterrows():
    # Create a new Partei object
    existing_kandidat = db.query(Kandidat).filter(
        Kandidat.name == row['Nachname'],
        Kandidat.firstname == row['Vornamen'],
        Kandidat.yearOfBirth == row['Geburtsjahr']
    ).first()

    if existing_kandidat is not None:
        print(f"Kandidat {existing_kandidat} already exists")
    # If no existing Kandidat, insert the new one
    else:
        kandidat = Kandidat(
            name=row['Nachname'],
            firstname=row['Vornamen'],
            profession=row['Beruf'],
            yearOfBirth=row['Geburtsjahr'],
        )


        # Add to session
        db.add(kandidat)
        db.commit()
db.close()

