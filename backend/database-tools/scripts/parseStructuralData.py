import pandas as pd
import numpy as np
import sys
import os
from pathlib import Path

# Add the parent directory to the Python path so we can import from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.database.models import Strukturdatum, Wahlkreis

def parse_structural_data(session, Base):
    script_dir = Path(__file__).parent  # go up to database-tools directory
    source_dir = script_dir / 'sourcefiles'
    
    skd17 = pd.read_csv(source_dir / 'strukturdaten_2017.csv', delimiter=';')
    skd21 = pd.read_csv(source_dir / 'strukturdaten_2021.csv', delimiter=';')
    
    # Read KERG files with proper encoding and handle potential BOM
    kerg17 = pd.read_csv(source_dir / 'kerg2_2017.csv', delimiter=';', encoding='utf-8-sig')
    kerg21 = pd.read_csv(source_dir / 'kerg2_2021.csv', delimiter=';', encoding='utf-8-sig')

    filtered_skd17 = skd17[(skd17['Wahlkreis-Nr.'] < 900)]
    filtered_skd21 = skd21[(skd21['Wahlkreis-Nr.'] < 900)]

    def get_value_from_kerg(kerg_df, wahlkreis_nr, group_name, stimme_type= None):
        # First try to get data from Wahlkreis level
        result = kerg_df[
            (kerg_df['Gebietsart'] == 'Wahlkreis') & 
            (kerg_df['Gebietsnummer'] == wahlkreis_nr) & 
            (kerg_df['Gruppenart'] == 'System-Gruppe') & 
            (kerg_df['Gruppenname'] == group_name) & 
            (kerg_df['Stimme'] == stimme_type if stimme_type is not None else True
        )]
        
        if len(result) > 0:
            # Convert numpy.int64 to Python int
            return int(result['Anzahl'].iloc[0])
                   
        raise ValueError(f"No data found for Wahlkreis {wahlkreis_nr} and group {group_name}")

    for index, row in filtered_skd17.iterrows():
        wahlkreis_nr = int(row['Wahlkreis-Nr.'])
        try:
            wahlberechtigte = get_value_from_kerg(kerg17, wahlkreis_nr, 'Wahlberechtigte')
            ungueltige_zweistimmen = get_value_from_kerg(kerg17, wahlkreis_nr, 'Ungültige', 2)
            # Convert all values to Python native types
            strukturdatum = Strukturdatum(
                wahlkreis_id=int(wahlkreis_nr),
                wahl_id=2,
                einwohnerzahl=int(float(row['Bevölkerung am 31.12.2015 - Deutsche (in 1000)'].replace(",", ".")) * 1000),
                wahlberechtigte=int(wahlberechtigte),
                auslaenderanteil=float(row['Bevölkerung am 31.12.2015 - Ausländer (%)'].replace(",", ".")),
                unternehmensdichte=float(row['Unternehmensregister 2014 - Unternehmen insgesamt (je 1000 Einwohner)'].replace(",", ".")),
                einkommen=int(row['Verfügbares Einkommen der privaten Haushalte 2014 (EUR je Einwohner)']),
                ungueltige_zweistimmen=int(ungueltige_zweistimmen),
            )
            session.add(strukturdatum)
        except Exception as e:
            print(f"Error processing Wahlkreis {wahlkreis_nr} for 2017: {str(e)}")

    for index, row in filtered_skd21.iterrows():
        wahlkreis_nr = int(row['Wahlkreis-Nr.'])
        try:
            wahlberechtigte = get_value_from_kerg(kerg21, wahlkreis_nr, 'Wahlberechtigte')
            ungueltige_zweistimmen = get_value_from_kerg(kerg21, wahlkreis_nr, 'Ungültige', 2)
            # Convert all values to Python native types
            strukturdatum = Strukturdatum(
                wahlkreis_id=int(wahlkreis_nr),
                wahl_id=1,
                einwohnerzahl=int(float(row['Bevölkerung am 31.12.2019 - Deutsche (in 1000)'].replace(",", ".")) * 1000),
                wahlberechtigte=int(wahlberechtigte),
                auslaenderanteil=float(row['Bevölkerung am 31.12.2019 - Ausländer/-innen (%)'].replace(",", ".")),
                unternehmensdichte=float(row['Unternehmensregister 2018 - Unternehmen insgesamt (je 1000 EW)'].replace(",", ".")),
                einkommen=int(row['Verfügbares Einkommen der privaten Haushalte 2018 (EUR je EW)']),
                ungueltige_zweistimmen=int(ungueltige_zweistimmen)
            )
            session.add(strukturdatum)
        except Exception as e:
            print(f"Error processing Wahlkreis {wahlkreis_nr} for 2021: {str(e)}")

    session.commit()

if __name__ == '__main__':
    # This section only runs if script is called directly
    import os
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    from dotenv import load_dotenv
    from sqlalchemy.ext.automap import automap_base

    load_dotenv()
    DATABASE_URL = os.getenv("DATABASE_URL")
    if not DATABASE_URL:
        raise ValueError("No DATABASE_URL found in the environment variables")

    engine = create_engine(DATABASE_URL)
    Base = automap_base()
    Base.prepare(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    
    parse_structural_data(session, Base)
    session.close()

