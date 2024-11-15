import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import Column, Integer, String
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship, declarative_base
from pathlib import Path

from src.database.models import Partei, Kandidat, Wahlkreis, Bundesland

DATABASE_URL = "postgresql://admin:admin@localhost:5432/postgres"

engine = create_engine(DATABASE_URL)

Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)

df = pd.read_csv(Path('sourcefiles', 'strukturdaten_2021.csv'), delimiter=';')

filtered_df = df[(df['Wahlkreis-Nr.'] < 900)]
# Session starten
model = Session()

# Für jedes gefilterte Tupel ein neues Objekt erstellen und in die Datenbank einfügen

for index, row in filtered_df.iterrows():

    corrected_name = row['Wahlkreis-Name']
    bundesland = model.query(Bundesland).filter_by(
        name = row['Land'],
    ).one()

    # Create a new Partei object
    wahlkreis = Wahlkreis(
        id= row['Wahlkreis-Nr.'],
        name=corrected_name,
        einwohnerzahl= int(float(row['Bevölkerung am 31.12.2019 - Insgesamt (in 1000)'].replace(",", ".")) * 1000),
        bundesland_id=bundesland.id
    )

    # Print for debugging (optional)
    print(wahlkreis)

    # Add to session
    model.add(wahlkreis)

model.commit()
print("Commited")
model.close()

