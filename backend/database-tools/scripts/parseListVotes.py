import pandas as pd
from pathlib import Path
from datetime import datetime
from openapi_server.database.models import Wahl, Wahlkreis, Partei
from io import StringIO

def parse_list_votes(session, Base, year):
    script_dir = Path(__file__).parent
    source_dir = script_dir / 'sourcefiles'
    
    df = pd.read_csv(source_dir / f'kerg2_{year}.csv', delimiter=';')
    filtered_df = df[(df['Stimme'] == 2) & (df['Gruppenart'] == 'Partei') & (df['Gebietsart'] == 'Wahlkreis')]

    foreign_keys = []

    rowCounter = 0
    voteCounter = 0
    for index, row in filtered_df.iterrows():
        if(rowCounter % 1000 == 0):
            print(rowCounter)
        rowCounter += 1

        count = 0
        if(pd.isna(row['Anzahl'])):
            continue
        else:
            count = int(row['Anzahl'])

        date_str = row['Wahltag']
        wahl_date = datetime.strptime(date_str, '%d.%m.%Y').date()

        wahl_id = session.query(Wahl.id).filter_by(
            date=wahl_date
        ).scalar()

        row['Gebietsname'] = 'Höxter – Gütersloh III – Lippe II' if row['Gebietsname'] == 'Höxter – Lippe II' else row['Gebietsname']
        row['Gebietsname'] = 'Paderborn' if row['Gebietsname'] == 'Paderborn – Gütersloh III' else row['Gebietsname']

        wahlkreis_id = session.query(Wahlkreis.id).filter_by(
            name=row['Gebietsname']
        ).scalar()

        row['Gruppenname'] = 'HEIMAT' if row['Gruppenname'] == 'NPD' or row['Gruppenname'] == 'HEIMAT (2021: NPD)' else row['Gruppenname']
        row['Gruppenname'] = 'Wir Bürger' if row['Gruppenname'] == 'LKR' or row['Gruppenname'] == 'Wir Bürger (2021: LKR)' else row['Gruppenname']
        row['Gruppenname'] = 'Verjüngungsforschung' if row['Gruppenname'] == 'Gesundheitsforschung' or row['Gruppenname'] == 'Verjüngungsforschung (2021: Gesundheitsforschung)' else row['Gruppenname']

        partei_id = session.query(Partei.id).filter_by(
            shortName=row['Gruppenname']
        ).scalar()

        if not wahl_id:
            raise ValueError("Foreign key 'wahl_id' not found")
        if not wahlkreis_id:
            raise ValueError("Foreign key 'wahlkreis_id' not found")
        if not partei_id:
            raise ValueError("Foreign key 'partei_id' not found")

        if wahl_id and wahlkreis_id and partei_id:
            for _ in range(count):
                foreign_keys.append((wahlkreis_id, partei_id, wahl_id))
                voteCounter += 1

    print(voteCounter)

    print("Creating CSV in memory...")
    # Create in-memory buffer
    output = StringIO()
    bulk_df = pd.DataFrame(foreign_keys, columns=['wahlkreis_id', 'partei_id', 'wahl_id'])
    bulk_df.to_csv(output, index=False, header=False, sep='\t')
    output.seek(0)  # Move cursor to start of buffer

    print("Streaming CSV to database...")
    with session.connection().connection.cursor() as cursor:
        cursor.copy_from(output, 'zweitstimmen', columns=('wahlkreis_id', 'partei_id', 'wahl_id'))
    
    session.commit()

if __name__ == '__main__':
    # This section only runs if script is called directly
    import os
    import argparse
    from sqlalchemy import create_engine, text
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

    # Drop constraints and indexes before parsing
    print("Dropping constraints and indexes...")
    with session.connection().connection.cursor() as cursor:
        cursor.execute("""
            ALTER TABLE zweitstimmen DROP CONSTRAINT IF EXISTS zweitstimmen_wahlkreis_id_fkey;
            ALTER TABLE zweitstimmen DROP CONSTRAINT IF EXISTS zweitstimmen_partei_id_fkey;
            ALTER TABLE zweitstimmen DROP CONSTRAINT IF EXISTS zweitstimmen_wahl_id_fkey;
            DROP INDEX IF EXISTS ix_zweitstimmen_wahlkreis_id;
            DROP INDEX IF EXISTS ix_zweitstimmen_partei_id;
            DROP INDEX IF EXISTS ix_zweitstimmen_wahl_id;
        """)
    session.commit()
    
    # Parse the votes
    parse_list_votes(session, Base, args.year)

    # Rebuild constraints and indexes after parsing
    print("Rebuilding constraints and indexes...")
    with session.connection().connection.cursor() as cursor:
        cursor.execute("""
            ALTER TABLE zweitstimmen 
            ADD CONSTRAINT zweitstimmen_wahlkreis_id_fkey 
            FOREIGN KEY (wahlkreis_id) 
            REFERENCES wahlkreise(id);
            
            ALTER TABLE zweitstimmen 
            ADD CONSTRAINT zweitstimmen_partei_id_fkey 
            FOREIGN KEY (partei_id) 
            REFERENCES parteien(id);
            
            ALTER TABLE zweitstimmen 
            ADD CONSTRAINT zweitstimmen_wahl_id_fkey 
            FOREIGN KEY (wahl_id) 
            REFERENCES wahlen(id);
            
            CREATE INDEX ix_zweitstimmen_wahlkreis_id 
            ON zweitstimmen(wahlkreis_id);
            
            CREATE INDEX ix_zweitstimmen_partei_id 
            ON zweitstimmen(partei_id);
            
            CREATE INDEX ix_zweitstimmen_wahl_id 
            ON zweitstimmen(wahl_id);
        """)
    session.commit()
    
    session.close()
