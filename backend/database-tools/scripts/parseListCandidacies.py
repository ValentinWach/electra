import pandas as pd
import os

from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from datetime import datetime
from pathlib import Path

from backend.src.openapi_server.database.models import Partei, Listenkandidatur, Kandidat, Bundesland, Wahl
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("No DATABASE_URL found in the environment variables")

engine = create_engine(DATABASE_URL)
Base = declarative_base()

Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)


df = pd.read_csv(Path('sourcefiles', 'kandidaturen_2017.csv'), delimiter=';', keep_default_na=False)

filtered_df = df[(df['Kennzeichen'] == 'Landesliste')]

db = Session()

for index, row in filtered_df.iterrows():

    full_name = f"{row['Titel']} {row['Nachname']}".strip() if 'Titel' in row and row['Titel'] else row['Nachname']

    kandidat = db.query(Kandidat).filter_by(
        name=full_name,
        firstname=row['Vornamen'],
        yearOfBirth=row['Geburtsjahr'],
    ).one()

    bundesland = db.query(Bundesland).filter_by(
        name = row['Gebietsname'],
    ).one()

    row['Gruppenname'] = 'HEIMAT (2021: NPD)' if row['Gruppenname'] == 'NPD' else row['Gruppenname']
    row['Gruppenname'] = 'Wir Bürger (2021: LKR)' if row['Gruppenname'] == 'LKR' else row['Gruppenname']
    row['Gruppenname'] = 'Verjüngungsforschung (2021: Gesundheitsforschung)' if row['Gruppenname'] == 'Gesundheitsforschung' else row['Gruppenname']

    partei = db.query(Partei).filter_by(
        shortName = row['Gruppenname'],
    ).one()

    date_str = row['Wahltag']
    wahl_date = datetime.strptime(date_str, '%d.%m.%Y').date()

    wahl = db.query(Wahl).filter_by(
        date=wahl_date,
    ).one()

    listenkandidatur = Listenkandidatur(
        kandidat_id=kandidat.id,
        listPosition=row['Listenplatz'],
        bundesland_id=bundesland.id,
        partei_id=partei.id,
        wahl_id=wahl.id,
    )

    db.add(listenkandidatur)

db.commit()
db.close()

