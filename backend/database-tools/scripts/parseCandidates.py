import pandas as pd
from pathlib import Path
from openapi_server.database.models import Kandidat

def parse_candidates(session, Base, year):
    script_dir = Path(__file__).parent
    source_dir = script_dir / 'sourcefiles'
    
    df = pd.read_csv(source_dir / f'kandidaturen_{year}.csv', delimiter=';', keep_default_na=False)

    existing_candidates = set()
    for k in session.query(Kandidat).all():
        existing_candidates.add((k.name, k.firstname, k.yearOfBirth))

    new_candidates = []
    for _, row in df.iterrows():
        full_name = f"{row['Titel']} {row['Nachname']}".strip() if 'Titel' in row and row['Titel'] else row['Nachname']
        
        candidate_key = (full_name, row['Vornamen'], row['Geburtsjahr'])
        if candidate_key not in existing_candidates:
            new_candidates.append(Kandidat(
                name=full_name,
                firstname=row['Vornamen'],
                profession=row['Beruf'],
                yearOfBirth=row['Geburtsjahr'],
            ))
            # Add to existing set to prevent duplicates within the same file
            existing_candidates.add(candidate_key)

    if new_candidates:
        session.bulk_save_objects(new_candidates)
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
    
    parse_candidates(session, Base, args.year)
    session.close()

