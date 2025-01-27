import pandas as pd
from pathlib import Path
from datetime import datetime
from openapi_server.database.models import Kandidat, Bundesland, Partei, Wahl, Listenkandidatur

def parse_listcandidacies(session, Base, year):
    script_dir = Path(__file__).parent  # go up to database-tools directory
    source_dir = script_dir / 'sourcefiles'
    
    df = pd.read_csv(source_dir / f'kandidaturen_{year}.csv', delimiter=';', keep_default_na=False)
    filtered_df = df[(df['Kennzeichen'] == 'Landesliste')]

    for index, row in filtered_df.iterrows():
        full_name = f"{row['Titel']} {row['Nachname']}".strip() if 'Titel' in row and row['Titel'] else row['Nachname']

        kandidat = session.query(Kandidat).filter_by(
            name=full_name,
            firstname=row['Vornamen'],
            yearOfBirth=row['Geburtsjahr'],
        ).one()

        bundesland = session.query(Bundesland).filter_by(
            name = row['Gebietsname'],
        ).one()

        row['Gruppenname'] = 'HEIMAT' if row['Gruppenname'] == 'NPD' else row['Gruppenname']
        row['Gruppenname'] = 'Wir Bürger' if row['Gruppenname'] == 'LKR' else row['Gruppenname']
        row['Gruppenname'] = 'Verjüngungsforschung' if row['Gruppenname'] == 'Gesundheitsforschung' else row['Gruppenname']

        partei = session.query(Partei).filter_by(
            shortName = row['Gruppenname'],
        ).one()

        date_str = row['Wahltag']
        wahl_date = datetime.strptime(date_str, '%d.%m.%Y').date()

        wahl = session.query(Wahl).filter_by(
            date=wahl_date,
        ).one()

        listenkandidatur = Listenkandidatur(
            kandidat_id=kandidat.id,
            listPosition=row['Listenplatz'],
            bundesland_id=bundesland.id,
            partei_id=partei.id,
            wahl_id=wahl.id,
        )

        session.add(listenkandidatur)

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
    
    parse_listcandidacies(session, Base, args.year)
    session.close()

