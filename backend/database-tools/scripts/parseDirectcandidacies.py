import pandas as pd
import os

from dotenv import load_dotenv
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from datetime import datetime
from pathlib import Path

from backend.src.openapi_server.database.models import Partei, Kandidat, Wahl, Wahlkreis, Wahlkreiskandidatur


load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("No DATABASE_URL found in the environment variables")

engine = create_engine(DATABASE_URL)
Base = declarative_base()

Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)


df = pd.read_csv(Path('sourcefiles', 'kandidaturen_2017.csv'), delimiter=';', keep_default_na=False)
filtered_df = df[(df['Kennzeichen'] == 'Kreiswahlvorschlag') | (df['Kennzeichen'] == 'anderer Kreiswahlvorschlag')]
db = Session()

for index, row in filtered_df.iterrows():

    full_name = f"{row['Titel']} {row['Nachname']}".strip() if 'Titel' in row and row['Titel'] else row['Nachname']

    kandidat = db.query(Kandidat).filter_by(
        name=full_name,
        firstname=row['Vornamen'],
        yearOfBirth=row['Geburtsjahr'],
    ).one()

    wahlkreis = db.query(Wahlkreis).filter_by(
        name = row['Gebietsname'],
    ).one()

    row['Gruppenname'] = 'HEIMAT (2021: NPD)' if row['Gruppenname'] == 'NPD' else row['Gruppenname']
    row['GruppennameLang'] = 'Die Heimat (2021: Nationaldemokratische Partei Deutschlands)' if row['GruppennameLang'] == 'Nationaldemokratische Partei Deutschlands' else row['GruppennameLang']
    row['Gruppenname'] = 'Wir Bürger (2021: LKR)' if row['Gruppenname'] == 'LKR' else row['Gruppenname']
    row['GruppennameLang'] = 'Wir Bürger (2021: Liberal-Konservative Reformer)' if row['GruppennameLang'] == 'Liberal-Konservative Reformer' else row['GruppennameLang']
    row['Gruppenname'] = 'Verjüngungsforschung (2021: Gesundheitsforschung)' if row['Gruppenname'] == 'Gesundheitsforschung' else row['Gruppenname']
    row['GruppennameLang'] = 'Partei für schulmedizinische Verjüngungsforschung (2021: Partei für Gesundheitsforschung)' if row['GruppennameLang'] == 'Partei für Gesundheitsforschung' else row['GruppennameLang']

    date_str = row['Wahltag']
    wahl_date = datetime.strptime(date_str, '%d.%m.%Y').date()
    wahl = db.query(Wahl).filter_by(
        date=wahl_date,
    ).one()

    if not (row['Gruppenname'].startswith("EB: ")):
        partei_query = db.query(Partei).filter_by(
            shortName=row['Gruppenname'],
        ).all()
        if len(partei_query) > 1:
            print(
                f"WARNING: Multiple results found for Partei with shortName={row['Gruppenname']} and name={row['GruppennameLang']}")
        elif len(partei_query) == 0:
            raise ValueError(f"Partei not found with shortName={row['Gruppenname']} and name={row['GruppennameLang']}")
        partei = partei_query[0] if partei_query else None

        wahlkreiskandidatur = Wahlkreiskandidatur(
            kandidat_id=kandidat.id,
            wahlkreis_id=wahlkreis.id,
            partei_id=partei.id,
            wahl_id=wahl.id,
        )
    else:
        wahlkreiskandidatur = Wahlkreiskandidatur(
            kandidat_id=kandidat.id,
            wahlkreis_id=wahlkreis.id,
            partei_id=None,
            wahl_id=wahl.id,
        )

    db.add(wahlkreiskandidatur)

db.commit()
db.close()
