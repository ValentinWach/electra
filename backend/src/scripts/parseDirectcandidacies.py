import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import Column, Integer, String
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime
from pathlib import Path

from backend.src.database.models import Partei, Listenkandidatur, Kandidat, Bundesland, Wahl, Wahlkreis, Wahlkreiskandidatur

DATABASE_URL = "postgresql://admin:admin@localhost:5432/postgres"

engine = create_engine(DATABASE_URL)
Base = declarative_base()

Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)


df = pd.read_csv(Path('sourcefiles', 'kandidaturen_2017.csv'), delimiter=';', keep_default_na=False)
filtered_df = df[(df['Kennzeichen'] == 'Kreiswahlvorschlag') | (df['Kennzeichen'] == 'anderer Kreiswahlvorschlag')]
db = Session()

# Für jedes gefilterte Tupel ein neues Objekt erstellen und in die Datenbank einfügen

for index, row in filtered_df.iterrows():

    kandidat = db.query(Kandidat).filter_by(
        name=row['Nachname'],
        firstname=row['Vornamen'],
        yearOfBirth=row['Geburtsjahr'],
    ).one()

    wahlkreis = db.query(Wahlkreis).filter_by(
        name = row['Gebietsname'],
    ).one()

    #print(row['Gruppenname'])
    #print(row['GruppennameLang'])
    row['Gruppenname'] = 'HEIMAT (2021: NPD)' if row['Gruppenname'] == 'NPD' else row['Gruppenname']
    row['GruppennameLang'] = 'Die Heimat (2021: Nationaldemokratische Partei Deutschlands)' if row['GruppennameLang'] == 'Nationaldemokratische Partei Deutschlands' else row['GruppennameLang']
    row['Gruppenname'] = 'Wir Bürger (2021: LKR)' if row['Gruppenname'] == 'LKR' else row['Gruppenname']
    row['GruppennameLang'] = 'Wir Bürger (2021: Liberal-Konservative Reformer)' if row['GruppennameLang'] == 'Liberal-Konservative Reformer' else row['GruppennameLang']
    row['Gruppenname'] = 'Verjüngungsforschung (2021: Gesundheitsforschung)' if row['Gruppenname'] == 'Gesundheitsforschung' else row['Gruppenname']
    row['GruppennameLang'] = 'Partei für schulmedizinische Verjüngungsforschung (2021: Partei für Gesundheitsforschung)' if row['GruppennameLang'] == 'Partei für Gesundheitsforschung' else row['GruppennameLang']

    date_str = row['Wahltag']  # Assuming this is in 'DD.MM.YYYY' format, like '26.09.2021'
    wahl_date = datetime.strptime(date_str, '%d.%m.%Y').date()
    wahl = db.query(Wahl).filter_by(
        date=wahl_date,
    ).one()

    if not (row['Gruppenname'].startswith("EB: ")):
        partei_query = db.query(Partei).filter_by(
            shortName=row['Gruppenname'],
            #name=row['GruppennameLang']
        ).all()
        if len(partei_query) > 1:
            print(
                f"WARNING: Multiple results found for Partei with shortName={row['Gruppenname']} and name={row['GruppennameLang']}")
        elif len(partei_query) == 0:
            raise ValueError(f"Partei not found with shortName={row['Gruppenname']} and name={row['GruppennameLang']}")
        partei = partei_query[0] if partei_query else None

        wahlkreiskandidatur = Wahlkreiskandidatur(
            kandidat_id=kandidat.id,  # Assuming 'Gruppenschluessel' is the id column
            wahlkreis_id=wahlkreis.id,  # Adjust according to actual column name for 'name'
            partei_id=partei.id,
            wahl_id=wahl.id,
        )
    else:
        wahlkreiskandidatur = Wahlkreiskandidatur(
            kandidat_id=kandidat.id,  # Assuming 'Gruppenschluessel' is the id column
            wahlkreis_id=wahlkreis.id,  # Adjust according to actual column name for 'name'
            partei_id=None,
            wahl_id=wahl.id,
        )
    # Print for debugging (optional)
    #print(wahlkreiskandidatur)

    # Add to session
    db.add(wahlkreiskandidatur)

db.commit()
db.close()
