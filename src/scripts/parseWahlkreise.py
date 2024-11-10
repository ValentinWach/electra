import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import Column, Integer, String
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship, declarative_base

from src.database.models import Partei, Kandidat, Wahlkreis, Bundesland

DATABASE_URL = "postgresql://admin:admin@localhost:5432/mydatabase"

engine = create_engine(DATABASE_URL)
Base = declarative_base()

Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)


df = pd.read_csv('C:\\Users\\Valentin\\Documents\\Kurse 7. Semester\\DBS\\strukturdaten_2021.csv', delimiter=';')


filtered_df = df[(df['Wahlkreis-Nr.'] < 900)]
# Session starten
db = Session()

# Für jedes gefilterte Tupel ein neues Objekt erstellen und in die Datenbank einfügen

for index, row in filtered_df.iterrows():

    corrected_name = row['Wahlkreis-Name'].encode('latin-1').decode('utf-8')

    bundesland = db.query(Bundesland).filter_by(
        name = row['Land'],
    ).one_or_none()
    # Create a new Partei object
    wahlkreis = Wahlkreis(
        id=row['Wahlkreis-Nr.'],
        name=corrected_name,
        einwohnerzahl=row['BevÃ¶lkerung am 31.12.2019 - Insgesamt (in 1000)'],
        bundesland_id=bundesland.id
    )

    # Print for debugging (optional)
    print(wahlkreis)

    # Add to session
    #db.add(partei)

#db.commit()
#db.close()

