import os

import pandas as pd
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from pathlib import Path
from dotenv import load_dotenv

from backend.src.openapi_server.database.models import Kandidat

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("No DATABASE_URL found in the environment variables")
engine = create_engine(DATABASE_URL)

Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)


df = pd.read_csv(Path('sourcefiles', 'kandidaturen_2017.csv'), delimiter=';', keep_default_na=False)

filtered_df = df

db = Session()

for index, row in filtered_df.iterrows():

    full_name = f"{row['Titel']} {row['Nachname']}".strip() if 'Titel' in row and row['Titel'] else row['Nachname']

    existing_kandidat = db.query(Kandidat).filter(
        Kandidat.name == full_name,
        Kandidat.firstname == row['Vornamen'],
        Kandidat.yearOfBirth == row['Geburtsjahr']
    ).first()

    if existing_kandidat is not None:
        print(f"Kandidat {existing_kandidat} already exists")
    else:
        kandidat = Kandidat(
            name=full_name,
            firstname=row['Vornamen'],
            profession=row['Beruf'],
            yearOfBirth=row['Geburtsjahr'],
        )

        db.add(kandidat)
        db.commit()
db.close()

