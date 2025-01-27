from datetime import datetime
import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from pathlib import Path
import os
from backend.src.openapi_server.database.models import Wahl, Wahlkreis, Partei, Wahlkreiskandidatur, Kandidat
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("No DATABASE_URL found in the environment variables")

engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)

df = pd.read_csv(Path('sourcefiles', 'kerg2_2021.csv'), delimiter=';')
filtered_df = df[(df['Stimme'] == 1) & ((df['Gruppenart'] == 'Partei') | (df['Gruppenart'] == 'Einzelbewerber/Wählergruppe')) & (df['Gebietsart'] == 'Wahlkreis')]

session = Session()

wahlkreiskandidaturen_id = []

voteCounter = 0
rowCounter = 0
for index, row in filtered_df.iterrows():
    if(rowCounter % 1000 == 0):
        print(rowCounter)
    rowCounter += 1

    count = 0
    if not pd.isna(row['Anzahl']):
        count = int(row['Anzahl'])
    else:
        continue


    date_str = row['Wahltag']
    wahl_date = datetime.strptime(date_str, '%d.%m.%Y').date()

    wahl_id = session.query(
        Wahl.id
    ).filter_by(date=wahl_date).scalar()

    row['Gebietsname'] = 'Höxter – Gütersloh III – Lippe II' if row['Gebietsname'] == 'Höxter – Lippe II' else row['Gebietsname']
    row['Gebietsname'] = 'Paderborn' if row['Gebietsname'] == 'Paderborn – Gütersloh III' else row['Gebietsname']

    wahlkreis_id = session.query(
        Wahlkreis.id
    ).filter_by(name=row['Gebietsname']).scalar()

    row['Gruppenname'] = 'HEIMAT (2021: NPD)' if row['Gruppenname'] == 'NPD' else row['Gruppenname']
    row['Gruppenname'] = 'Wir Bürger (2021: LKR)' if row['Gruppenname'] == 'LKR' else row['Gruppenname']
    row['Gruppenname'] = 'Verjüngungsforschung (2021: Gesundheitsforschung)' if row['Gruppenname'] == 'Gesundheitsforschung' else row['Gruppenname']

    if row['Gruppenname'].startswith('EB: '):
        kandidat_id = session.query(
            Kandidat.id
        ).filter(
            Kandidat.id.in_(
                session.query(Wahlkreiskandidatur.kandidat_id).filter_by(
                    wahlkreis_id=wahlkreis_id,
                    wahl_id=wahl_id,
                    partei_id=None
                )
            )
        ).filter(Kandidat.name.ilike(f"%{row['Gruppenname'].split(':')[1].strip()}%")).scalar()

        wahlkreiskandidatur_id = session.query(
            Wahlkreiskandidatur.id
        ).filter_by(
            wahlkreis_id=wahlkreis_id,
            wahl_id=wahl_id,
            kandidat_id=kandidat_id
        ).scalar()
    else:
        partei_id = session.query(
            Partei.id
        ).filter_by(shortName=row['Gruppenname']).scalar()
        wahlkreiskandidatur_id = session.query(
            Wahlkreiskandidatur.id
        ).filter_by(
            wahlkreis_id=wahlkreis_id,
            wahl_id=wahl_id,
            partei_id=partei_id
        ).scalar()

    if not wahl_id:
        raise ValueError("Foreign key 'wahl_id' not found")
    if not wahlkreis_id:
        raise ValueError("Foreign key 'wahlkreis_id' not found")
    if not partei_id:
        raise ValueError("Foreign key 'partei_id' not found")
    if not wahlkreiskandidatur_id:
        raise ValueError("'wahlkreiskandidatur_id' not found")
    if wahl_id and wahlkreis_id and partei_id and wahlkreiskandidatur_id:
        for _ in range(count):
            wahlkreiskandidaturen_id.append(wahlkreiskandidatur_id)
            voteCounter += 1
print(voteCounter)

session.close()

bulk_df = pd.DataFrame(wahlkreiskandidaturen_id, columns=['wahlkreiskandidatur_id'])

temp_csv = Path('temp_erststimme.csv')
bulk_df.to_csv(temp_csv, index=False, header=False)

with engine.connect() as conn:
    with conn.begin():
        raw_conn = conn.connection
        with raw_conn.cursor() as cursor:
            with open(temp_csv, 'r') as f:
                cursor.copy_expert("COPY erststimmen (wahlkreiskandidatur_id) FROM stdin WITH CSV", f)
    conn.commit()

os.remove(temp_csv)
