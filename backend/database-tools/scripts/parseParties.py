import pandas as pd
from pathlib import Path

def parse_parties(session, Base, year):
    script_dir = Path(__file__).parent.parent  # go up to database-tools directory
    source_dir = script_dir / 'sourcefiles'
    
    df = pd.read_csv(source_dir / f'parteien_{year}.csv', delimiter=';', keep_default_na=False)
    filtered_df = df[df['Gruppenart_XML'].isin(['PARTEI', 'EINZELBEWERBER'])]

    for index, row in filtered_df.iterrows():
        if not row['Gruppenname_kurz'].startswith('EB: '):
            partei_query = session.query(Base.classes.parteien).filter_by(
                shortName=row['Gruppenname_kurz'],
            ).all()
            if(len(partei_query) == 0):
                partei = Base.classes.parteien(
                    type=row['Gruppenart_XML'],
                    name=row['Gruppenname_lang'],
                    shortName=row['Gruppenname_kurz'],
                )
                session.add(partei)
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
    
    parse_parties(session, Base, args.year)
    session.close()

