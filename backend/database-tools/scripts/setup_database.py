import os
import sys
import time
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError
from dotenv import load_dotenv
import concurrent.futures
import pandas as pd
import numpy as np
from datetime import datetime
from sqlalchemy import Table, Column, Integer, MetaData
import multiprocessing as mp
import platform
from sqlalchemy.ext.automap import automap_base

# Add the parent directory to the Python path so we can import from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.database.base import Base
from app.database.models import *

# Change to the script's directory
os.chdir(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

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
        script_dir = os.path.dirname(os.path.abspath(__file__))
        sql_files = [
            os.path.join(script_dir, '..', 'sitzverteilung', 'sitzverteilung-functions.sql'),
            os.path.join(script_dir, '..', 'sitzverteilung', 'sitzverteilung-views.sql'),
            os.path.join(script_dir, '..', 'topTen', 'closestWinners.sql')
        ]
        
        for sql_file in sql_files:
            print(f"Executing SQL file: {sql_file}")
            execute_sql_file(sql_file)
        
        print("\nDatabase setup completed successfully!")

main()