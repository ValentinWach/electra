import pandas as pd
from pathlib import Path
from datetime import datetime
from openapi_server.database.models import Wahl, Wahlkreis, Partei, Wahlkreiskandidatur, Kandidat
from io import StringIO

def parse_direct_votes(session, Base, year):
    try:
        script_dir = Path(__file__).parent
        source_dir = script_dir / 'sourcefiles'
        
        df = pd.read_csv(source_dir / f'kerg2_{year}.csv', delimiter=';')
        filtered_df = df[(df['Stimme'] == 1) & ((df['Gruppenart'] == 'Partei') | (df['Gruppenart'] == 'Einzelbewerber/Wählergruppe')) & (df['Gebietsart'] == 'Wahlkreis')]

        print("Pre-fetching lookup data...")
        wahl_date = datetime.strptime(filtered_df['Wahltag'].iloc[0], '%d.%m.%Y').date()
        wahl_id = session.query(Wahl.id).filter_by(date=wahl_date).scalar()
        
        wahlkreis_lookup = {wk.name: wk.id for wk in session.query(Wahlkreis).all()}
        partei_lookup = {p.shortName: p.id for p in session.query(Partei).all()}
        
        wahlkreiskandidaturen = session.query(Wahlkreiskandidatur).filter_by(wahl_id=wahl_id).all()
        kandidaturen_lookup = {}
        for wk in wahlkreiskandidaturen:
            key = (wk.wahlkreis_id, wk.partei_id) if wk.partei_id else (wk.wahlkreis_id, None)
            kandidaturen_lookup[key] = wk.id

        print("Processing votes...")
        chunk_size = 1000
        total_votes = 0

        grouped_df = filtered_df.groupby(['Gebietsname', 'Gruppenname'])['Anzahl'].sum().reset_index()
        
        # Process the grouped DataFrame in chunks
        for chunk_start in range(0, len(grouped_df), chunk_size):
            chunk_end = min(chunk_start + chunk_size, len(grouped_df))
            chunk_df = grouped_df.iloc[chunk_start:chunk_end]
            
            vote_records = []
            
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

                if gruppenname.startswith('EB: '):
                    key = (wahlkreis_id, None)
                else:
                    partei_id = partei_lookup.get(gruppenname)
                    if not partei_id:
                        continue
                    key = (wahlkreis_id, partei_id)

                wahlkreiskandidatur_id = kandidaturen_lookup.get(key)
                if not wahlkreiskandidatur_id:
                    continue

                count = int(row['Anzahl'])
                vote_records.append(f"{wahlkreiskandidatur_id}\t{count}")
                total_votes += count
            
            # Insert chunk directly into database using COPY
            if vote_records:
                print(f"Streaming chunk {chunk_start//chunk_size + 1} into database, records in chunk: {len(vote_records)}")
                
                buffer = StringIO('\n'.join(vote_records))
                buffer.seek(0)
                
                with session.connection().connection.cursor() as cursor:
                    cursor.copy_from(buffer, 'erststimmen', columns=('wahlkreiskandidatur_id', 'amount'))
                
                session.commit()
                buffer.close()
                
        print(f"Total direct votes processed for {year}: {total_votes}")
    except Exception as e:
        print(f"Error processing direct votes for {year}: {str(e)}")
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
                ALTER TABLE erststimmen DISABLE TRIGGER ALL;
                
                DROP INDEX IF EXISTS ix_erststimmen_wahlkreiskandidatur_id;
            """)
        session.commit()
        
        parse_direct_votes(session, Base, args.year)

        print("Rebuilding constraints and indexes...")
        with session.connection().connection.cursor() as cursor:
            cursor.execute("""
                ALTER TABLE erststimmen ENABLE TRIGGER ALL;

                CREATE INDEX ix_erststimmen_wahlkreiskandidatur_id 
                ON erststimmen(wahlkreiskandidatur_id);
            """)
        session.commit()
    finally:
        session.close()
        engine.dispose()
