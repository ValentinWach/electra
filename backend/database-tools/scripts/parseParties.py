import pandas as pd
from pathlib import Path
from openapi_server.database.models import Partei

def parse_parties(session, Base, year):
    script_dir = Path(__file__).parent  # go up to database-tools directory
    source_dir = script_dir / 'sourcefiles'
    
    df = pd.read_csv(source_dir / f'parteien_{year}.csv', delimiter=';', keep_default_na=False)
    filtered_df = df[df['Gruppenart_XML'].isin(['PARTEI', 'EINZELBEWERBER'])]

    for index, row in filtered_df.iterrows():
        if not row['Gruppenname_kurz'].startswith('EB: '):
            row['Gruppenname_kurz'] = 'HEIMAT' if row['Gruppenname_kurz'] == 'HEIMAT (2021: NPD)' else row['Gruppenname_kurz']
            row['Gruppenname_kurz'] = 'Wir Bürger' if row['Gruppenname_kurz'] == 'Wir Bürger (2021: LKR)' else row['Gruppenname_kurz']
            row['Gruppenname_kurz'] = 'Verjüngungsforschung' if row['Gruppenname_kurz'] == 'Verjüngungsforschung (2021: Gesundheitsforschung)' else row['Gruppenname_kurz']
            
            row['Gruppenname_lang'] = 'Partei für schulmedizinische Verjüngungsforschung' if row['Gruppenname_lang'] == 'Partei für schulmedizinische Verjüngungsforschung (2021: Partei für Gesundheitsforschung)' else row['Gruppenname_lang']
            row['Gruppenname_lang'] = 'Die Heimat' if row['Gruppenname_lang'] == 'Die Heimat (2021: Nationaldemokratische Partei Deutschlands)' else row['Gruppenname_lang']
            row['Gruppenname_lang'] = 'Wir Bürger' if row['Gruppenname_lang'] == 'Wir Bürger (2021: Liberal-Konservative Reformer)' else row['Gruppenname_lang']
            
            partei_query = session.query(Partei).filter_by(
                shortName=row['Gruppenname_kurz'],
            ).all()
            
            if(len(partei_query) == 0):


                partei = Partei(
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

