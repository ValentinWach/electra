import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import Column, Integer, String
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime

from src.database.models import Partei, Listenkandidatur, Kandidat, Bundesland, Wahl

DATABASE_URL = "postgresql://admin:admin@localhost:5432/mydatabase"

engine = create_engine(DATABASE_URL)
Base = declarative_base()

Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)


df = pd.read_csv('C:\\Users\\Valentin\\Documents\\Kurse 7. Semester\\DBS\\kandidaturen_2021.csv', delimiter=';')

# Filtern der Zeilen, bei denen 'Stimme' == 1
# Filter for rows where 'Gruppenart_XML' is either 'PARTEI' or 'EINZELBEWERBER'
filtered_df = df[(df['Kennzeichen'] == 'Landesliste')]
# Session starten
db = Session()

# Für jedes gefilterte Tupel ein neues Objekt erstellen und in die Datenbank einfügen

for index, row in filtered_df.iterrows():

    kandidat = db.query(Kandidat).filter_by(
        name=row['Nachname'],
        firstname=row['Vornamen'],
        yearOfBirth=row['Geburtsjahr'],
    ).one_or_none()

    bundesland = db.query(Bundesland).filter_by(
        name = row['Gebietsname'],
    ).one_or_none()

    partei = db.query(Partei).filter_by(
        shortName = row['Gruppenname'],
    ).one_or_none()

    date_str = row['Wahltag']  # Assuming this is in 'DD.MM.YYYY' format, like '26.09.2021'
    wahl_date = datetime.strptime(date_str, '%d.%m.%Y').date()

    wahl = db.query(Wahl).filter_by(
        date=wahl_date,
    ).one_or_none()

    # Create a new Partei object
    listenkandidatur = Listenkandidatur(
        kandidat_id=kandidat.id,  # Assuming 'Gruppenschluessel' is the id column
        listPosition=row['Listenplatz'],  # Setting the type based on the condition above
        bundesland_id=bundesland.id,  # Adjust according to actual column name for 'name'
        partei_id=partei.id,
        wahl_id=wahl.id,
    )

    # Print for debugging (optional)
    print(listenkandidatur)

    # Add to session
    #db.add(partei)

#db.commit()
#db.close()

