import pandas as pd
from pathlib import Path
from datetime import datetime
from openapi_server.database.models import Wahl, Wahlkreis, Partei, Wahlkreiskandidatur, Kandidat
from io import StringIO

def parse_direct_votes(session, Base, year):
    script_dir = Path(__file__).parent
    source_dir = script_dir / 'sourcefiles'
    
    df = pd.read_csv(source_dir / f'kerg2_{year}.csv', delimiter=';')
    filtered_df = df[(df['Stimme'] == 1) & ((df['Gruppenart'] == 'Partei') | (df['Gruppenart'] == 'Einzelbewerber/Wählergruppe')) & (df['Gebietsart'] == 'Wahlkreis')]

    wahlkreiskandidaturen_id = []

    voteCounter = 0
    rowCounter = 0
    print("Processing votes...")
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

        row['Gruppenname'] = 'HEIMAT' if row['Gruppenname'] == 'NPD' or row['Gruppenname'] == 'HEIMAT (2021: NPD)' else row['Gruppenname']
        row['Gruppenname'] = 'Wir Bürger' if row['Gruppenname'] == 'LKR' or row['Gruppenname'] == 'Wir Bürger (2021: LKR)' else row['Gruppenname']
        row['Gruppenname'] = 'Verjüngungsforschung' if row['Gruppenname'] == 'Gesundheitsforschung' or row['Gruppenname'] == 'Verjüngungsforschung (2021: Gesundheitsforschung)' else row['Gruppenname']

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
            raise ValueError("Foreign key 'partei_id' for " + row['Gruppenname'] + " not found")
        if not wahlkreiskandidatur_id:
            raise ValueError("'wahlkreiskandidatur_id' for not found")
        if wahl_id and wahlkreis_id and partei_id and wahlkreiskandidatur_id:
            for _ in range(count):
                wahlkreiskandidaturen_id.append(wahlkreiskandidatur_id)
                voteCounter += 1
    print(voteCounter)

    print("Creating CSV in memory...")
    # Create in-memory buffer
    output = StringIO()
    bulk_df = pd.DataFrame(wahlkreiskandidaturen_id, columns=['wahlkreiskandidatur_id'])
    bulk_df.to_csv(output, index=False, header=False)
    output.seek(0)  # Move cursor to start of buffer

    print("Streaming CSV to database...")
    with session.connection().connection.cursor() as cursor:
        cursor.copy_expert("COPY erststimmen (wahlkreiskandidatur_id) FROM stdin WITH CSV", output)
    
    session.commit()

if __name__ == '__main__':
    # This section only runs if script is called directly
    import os
    import argparse
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    from dotenv import load_dotenv
    from sqlalchemy.ext.automap import automap_base

    parser = argparse.ArgumentParser()
    parser.add_argument('--year', type=str, required=True, choices=['2017', '2021'])
    args = parser.parse_args()

    load_dotenv()
    DATABASE_URL = os.getenv("DATABASE_URL")
    if not DATABASE_URL:
        raise ValueError("No DATABASE_URL found in the environment variables")

    engine = create_engine(DATABASE_URL)
    Base = automap_base()
    Base.prepare(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    
    parse_direct_votes(session, Base, args.year)
    session.close()
