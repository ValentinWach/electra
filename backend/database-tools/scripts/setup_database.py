import os
from datetime import datetime
from sqlalchemy import create_engine, Table, Column, Integer, MetaData, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from pathlib import Path
import multiprocessing as mp
import platform
from sqlalchemy.ext.automap import automap_base

# Change to the script's directory
os.chdir(Path(__file__).parent)

import sys
script_dir = Path(__file__).parent.parent.parent / 'src'
sys.path.append(str(script_dir))

from openapi_server.database.base import Base
from openapi_server.database.models import *

# Load environment variables and setup database connection
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("No DATABASE_URL found in the environment variables")

engine = create_engine(DATABASE_URL)
Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def drop_schema():
    """Transaction 1: Drop and recreate schema"""
    print("Transaction 1: Dropping and recreating schema...")
    with engine.connect() as conn:
        with conn.begin():
            conn.execute(text("DROP SCHEMA IF EXISTS public CASCADE"))
            conn.execute(text("CREATE SCHEMA public"))
            conn.execute(text("GRANT ALL ON SCHEMA public TO CURRENT_USER"))
            conn.execute(text("GRANT ALL ON SCHEMA public TO public"))

def create_tables():
    """Transaction 2: Create tables without vote constraints/indexes"""
    print("Transaction 2: Creating tables without vote constraints/indexes...")
    with engine.connect() as conn:
        with conn.begin():
            Base.metadata.create_all(bind=engine)

def process_votes_for_year(year, database_url, vote_type):
    """Process either direct or list votes for a specific year with its own database connection"""
    from parseDirectVotes import parse_direct_votes
    from parseListVotes import parse_list_votes
    
    engine = create_engine(database_url)
    Base = automap_base()
    Base.prepare(engine)
    Session = sessionmaker(bind=engine)
    session = Session()

    try:
        print(f"\nProcessing {vote_type} votes for {year} in separate process...")

        if vote_type == 'direct':
            parse_direct_votes(session, Base, year)
        else:
            parse_list_votes(session, Base, year)
    finally:
        session.close()
        engine.dispose()

def process_all_votes_parallel(database_url):
    """Process all votes (both years, both types) in parallel"""
    # Determine the appropriate start method based on the platform
    if platform.system() == 'Darwin':  # macOS
        mp.set_start_method('spawn')
    elif platform.system() == 'Windows':
        mp.set_start_method('spawn')
    else:  # Linux and others
        mp.set_start_method('fork')
    
    processes = []
    combinations = [
        ('2021', 'direct'),
        ('2021', 'list'),
        ('2017', 'direct'),
        ('2017', 'list')
    ]
    
    for year, vote_type in combinations:
        p = mp.Process(target=process_votes_for_year, args=(year, database_url, vote_type))
        processes.append(p)
        p.start()

    for p in processes:
        p.join()

def insert_data():
    """Transaction 3: Insert data and rebuild indexes/constraints"""
    print("Transaction 3: Inserting data and rebuilding indexes/constraints...")
    session = Session()

    try:
        bundeslaender_data = [
            'Baden-Württemberg', 'Bayern', 'Berlin', 'Brandenburg', 'Bremen',
            'Hamburg', 'Hessen', 'Mecklenburg-Vorpommern', 'Niedersachsen',
            'Nordrhein-Westfalen', 'Rheinland-Pfalz', 'Saarland', 'Sachsen',
            'Sachsen-Anhalt', 'Schleswig-Holstein', 'Thüringen'
        ]

        for name in bundeslaender_data:
            bundesland = Bundesland(name=name)
            session.add(bundesland)

        wahlen_data = ['2021-09-26', '2017-09-24']
        for date_str in wahlen_data:
            date = datetime.strptime(date_str, '%Y-%m-%d').date()
            wahl = Wahl(date=date)
            session.add(wahl)

        session.commit()


        # Insert profession categories
        profession_categories = [
            (0, 'Militär'),
            (1, 'Land-, Forst- und Tierwirtschaft und Gartenbau'),
            (2, 'Rohstoffgewinnung, Produktion und Fertigung'),
            (3, 'Bau, Architektur, Vermessung und Gebäudetechnik'),
            (4, 'Naturwissenschaft, Geografie und Informatik'),
            (5, 'Verkehr, Logistik, Schutz und Sicherheit'),
            (6, 'Kaufmännische Dienstleistungen, Warenhandel, Vertrieb, Hotel und Tourismus'),
            (7, 'Unternehmensorganisation, Buchhaltung, Recht und Verwaltung'),
            (8, 'Gesundheit, Soziales, Lehre und Erziehung'),
            (9, 'Geistes-, Gesellschafts- und Wirtschaftswissenschaften, Medien, Kunst und Kultur'),
            (10, 'Studenten, Auszubildende und Schüler'),
            (11, 'Rentner'),
            (12, 'Freiberufler'),
            (13, 'Arbeitslose')
        ]

        for id, name in profession_categories:
            category = BerufsKategorie(id=id, name=name)
            session.add(category)

        session.commit()

        from parseWahlkreise import parse_wahlkreise
        from parseParties import parse_parties
        from parseCandidates import parse_candidates
        from parseDirectcandidacies import parse_directcandidacies
        from parseListCandidacies import parse_listcandidacies
        from parseStructuralData import parse_structural_data

        print("Running parseWahlkreise...")
        parse_wahlkreise(session, Base)

        print("\nProcessing data for 2021 election...")
        print("Parsing parties...")
        parse_parties(session, Base, '2021')
        print("Parsing candidates...")
        parse_candidates(session, Base, '2021')
        print("Parsing direct candidacies...")
        parse_directcandidacies(session, Base, '2021')
        print("Parsing list candidacies...")
        parse_listcandidacies(session, Base, '2021')

        print("\nProcessing data for 2017 election...")
        print("Parsing parties...")
        parse_parties(session, Base, '2017')
        print("Parsing candidates...")
        parse_candidates(session, Base, '2017')
        print("Parsing direct candidacies...")
        parse_directcandidacies(session, Base, '2017')
        print("Parsing list candidacies...")
        parse_listcandidacies(session, Base, '2017')

        print("\nRunning parseStructuralData...")
        parse_structural_data(session, Base)

        print("\nProcessing all votes in parallel...")
        process_all_votes_parallel(DATABASE_URL)

        print("Committing changes...")
        session.commit()
    finally:
        session.close()

def execute_sql_file(file_path):
    with engine.connect() as conn:
        with conn.begin():
            with open(file_path, 'r') as file:
                sql_commands = file.read()
                conn.execute(text(sql_commands))

def main():
    if __name__ == '__main__':
        drop_schema()
        create_tables()
        insert_data()
        
        print("\nAggregating votes, calculating election results and creating relevant materialized views...")
        sql_files = [
            '../sitzverteilung/sitzverteilung-functions.sql',
            '../sitzverteilung/sitzverteilung-views.sql',
            '../topTen/closestWinners.sql'
        ]
        
        for sql_file in sql_files:
            execute_sql_file(sql_file)
        
        print("\nDatabase setup completed successfully!")

main()