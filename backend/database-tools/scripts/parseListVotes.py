import pandas as pd
from pathlib import Path
from datetime import datetime
from openapi_server.database.models import Wahl, Wahlkreis, Partei
from io import StringIO

def parse_list_votes(session, Base, year):
    try:
        script_dir = Path(__file__).parent
        source_dir = script_dir / 'sourcefiles'
        
        df = pd.read_csv(source_dir / f'kerg2_{year}.csv', delimiter=';')
        filtered_df = df[(df['Stimme'] == 2) & (df['Gruppenart'] == 'Partei') & (df['Gebietsart'] == 'Wahlkreis')]

        print("Pre-fetching lookup data...")
        wahl_date = datetime.strptime(filtered_df['Wahltag'].iloc[0], '%d.%m.%Y').date()
        wahl_id = session.query(Wahl.id).filter_by(date=wahl_date).scalar()
        
        wahlkreis_lookup = {wk.name: wk.id for wk in session.query(Wahlkreis).all()}
        partei_lookup = {p.shortName: p.id for p in session.query(Partei).all()}

        print("Processing votes...")
        chunk_size = 750 #adjust size according to your system's memory. 16 GB ~ 750	
        total_votes = 0
        

        grouped_df = filtered_df.groupby(['Gebietsname', 'Gruppenname'])['Anzahl'].sum().reset_index()
        print("Count of grouped_df:")
        print(len(grouped_df))
        
        # Process the grouped DataFrame in chunks
        for chunk_start in range(0, len(grouped_df), chunk_size):
            chunk_end = min(chunk_start + chunk_size, len(grouped_df))
            chunk_df = grouped_df.iloc[chunk_start:chunk_end]
            
            foreign_keys = []
            
            for _, row in chunk_df.iterrows():
                wahlkreis_name = row['Gebietsname']
                wahlkreis_name = 'Höxter – Gütersloh III – Lippe II' if wahlkreis_name == 'Höxter – Lippe II' else wahlkreis_name
                wahlkreis_name = 'Paderborn' if wahlkreis_name == 'Paderborn – Gütersloh III' else wahlkreis_name
                
                wahlkreis_id = wahlkreis_lookup.get(wahlkreis_name)
                if not wahlkreis_id:
                    continue

                gruppenname = row['Gruppenname']
                gruppenname = 'HEIMAT' if gruppenname == 'NPD' or gruppenname == 'HEIMAT (2021: NPD)' else gruppenname
                gruppenname = 'Wir Bürger' if gruppenname == 'LKR' or gruppenname == 'Wir Bürger (2021: LKR)' else gruppenname
                gruppenname = 'Verjüngungsforschung' if gruppenname == 'Gesundheitsforschung' or gruppenname == 'Verjüngungsforschung (2021: Gesundheitsforschung)' else gruppenname

                partei_id = partei_lookup.get(gruppenname)
                if not partei_id:
                    continue

                count = int(row['Anzahl'])
                foreign_keys.extend([(wahlkreis_id, partei_id, wahl_id)] * count)

            # Insert chunk directly into database using COPY
            if foreign_keys:
                total_votes += len(foreign_keys)
                print(f"Processing chunk {chunk_start//chunk_size + 1}, votes in chunk: {len(foreign_keys)}")
                
                # Create a buffer with the data
                buffer = StringIO()
                for wk_id, p_id, w_id in foreign_keys:
                    buffer.write(f"{wk_id}\t{p_id}\t{w_id}\n")
                buffer.seek(0)
                
                with session.connection().connection.cursor() as cursor:
                    cursor.copy_from(buffer, 'zweitstimmen', columns=('wahlkreis_id', 'partei_id', 'wahl_id'))
                
                session.commit()
                buffer.close()
                
        print(f"Total votes processed: {total_votes}")
    except Exception as e:
        print(f"Error processing list votes for {year}: {str(e)}")
        session.rollback()
        raise
    finally:
        session.commit()

if __name__ == '__main__':
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

    try:
        print("Dropping constraints and indexes...")
        with session.connection().connection.cursor() as cursor:
            cursor.execute("""
                ALTER TABLE zweitstimmen DISABLE TRIGGER ALL;
                DROP INDEX IF EXISTS ix_zweitstimmen_wahlkreis_id;
                DROP INDEX IF EXISTS ix_zweitstimmen_partei_id;
                DROP INDEX IF EXISTS ix_zweitstimmen_wahl_id;
            """)
        session.commit()
        
        parse_list_votes(session, Base, args.year)

        print("Rebuilding constraints and indexes...")
        with session.connection().connection.cursor() as cursor:
            cursor.execute("""
                ALTER TABLE zweitstimmen ENABLE TRIGGER ALL;
                
                CREATE INDEX ix_zweitstimmen_wahlkreis_id 
                ON zweitstimmen(wahlkreis_id);
                
                CREATE INDEX ix_zweitstimmen_partei_id 
                ON zweitstimmen(partei_id);
                
                CREATE INDEX ix_zweitstimmen_wahl_id 
                ON zweitstimmen(wahl_id);
            """)
        session.commit()
    finally:
        session.close()
        engine.dispose()
