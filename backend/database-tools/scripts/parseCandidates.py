import pandas as pd
from pathlib import Path
from openapi_server.database.models import Kandidat

def parse_candidates(session, Base, year):
    script_dir = Path(__file__).parent  # go up to database-tools directory
    source_dir = script_dir / 'sourcefiles'
    
    df = pd.read_csv(source_dir / f'kandidaturen_{year}.csv', delimiter=';', keep_default_na=False)
    filtered_df = df

    for index, row in filtered_df.iterrows():
        full_name = f"{row['Titel']} {row['Nachname']}".strip() if 'Titel' in row and row['Titel'] else row['Nachname']

        existing_kandidat = session.query(Kandidat).filter(
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

            session.add(kandidat)
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
    
    parse_candidates(session, Base, args.year)
    session.close()

