import pandas as pd
from pathlib import Path
from datetime import datetime
from openapi_server.database.models import Kandidat, Bundesland, Partei, Wahl, Listenkandidatur

def parse_listcandidacies(session, Base, year):
    script_dir = Path(__file__).parent
    source_dir = script_dir / 'sourcefiles'
    
    df = pd.read_csv(source_dir / f'kandidaturen_{year}.csv', delimiter=';', keep_default_na=False)
    filtered_df = df[(df['Kennzeichen'] == 'Landesliste')]

    print("Pre-fetching lookup data...")
    
    date_str = filtered_df['Wahltag'].iloc[0]
    wahl_date = datetime.strptime(date_str, '%d.%m.%Y').date()
    wahl = session.query(Wahl).filter_by(date=wahl_date).one()

    kandidaten_lookup = {}
    for k in session.query(Kandidat).all():
        key = (k.name, k.firstname, k.yearOfBirth)
        kandidaten_lookup[key] = k.id

    bundesland_lookup = {}
    for bl in session.query(Bundesland).all():
        bundesland_lookup[bl.name] = bl.id

    partei_lookup = {}
    for p in session.query(Partei).all():
        partei_lookup[p.shortName] = p.id

    listenkandidaturen = []
    for _, row in filtered_df.iterrows():
        full_name = f"{row['Titel']} {row['Nachname']}".strip() if 'Titel' in row and row['Titel'] else row['Nachname']
        
        kandidat_key = (full_name, row['Vornamen'], row['Geburtsjahr'])
        kandidat_id = kandidaten_lookup.get(kandidat_key)
        if not kandidat_id:
            print(f"Kandidat not found: {full_name}, {row['Vornamen']}, {row['Geburtsjahr']}")
            continue

        bundesland_id = bundesland_lookup.get(row['Gebietsname'])
        if not bundesland_id:
            print(f"Bundesland not found: {row['Gebietsname']}")
            continue

        gruppenname = row['Gruppenname']
        gruppenname = 'HEIMAT' if gruppenname == 'NPD' or gruppenname == 'HEIMAT (2021: NPD)' else gruppenname
        gruppenname = 'Wir Bürger' if gruppenname == 'LKR' or gruppenname == 'Wir Bürger (2021: LKR)' else gruppenname
        gruppenname = 'Verjüngungsforschung' if gruppenname == 'Gesundheitsforschung' or gruppenname == 'Verjüngungsforschung (2021: Gesundheitsforschung)' else gruppenname

        partei_id = partei_lookup.get(gruppenname)
        if not partei_id:
            print(f"Partei not found: {gruppenname}")
            continue

        listenkandidaturen.append(Listenkandidatur(
            kandidat_id=kandidat_id,
            listPosition=row['Listenplatz'],
            bundesland_id=bundesland_id,
            partei_id=partei_id,
            wahl_id=wahl.id,
        ))

    if listenkandidaturen:
        session.bulk_save_objects(listenkandidaturen)
        session.commit()

if __name__ == '__main__':
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
    
    parse_listcandidacies(session, Base, args.year)
    session.close()

