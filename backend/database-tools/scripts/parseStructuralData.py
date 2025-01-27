import pandas as pd
from pathlib import Path

def parse_structural_data(session, Base):
    script_dir = Path(__file__).parent.parent  # go up to database-tools directory
    source_dir = script_dir / 'sourcefiles'
    
    skd17 = pd.read_csv(source_dir / 'strukturdaten_2017.csv', delimiter=';')
    skd21 = pd.read_csv(source_dir / 'strukturdaten_2021.csv', delimiter=';')
    wbt17 = pd.read_csv(source_dir / 'wahlbeteiligung_2017.csv', delimiter=',')
    wbt21 = pd.read_csv(source_dir / 'wahlbeteiligung_2021.csv', delimiter=',')

    filtered_skd17 = skd17[(skd17['Wahlkreis-Nr.'] < 900)]
    filtered_skd21 = skd21[(skd21['Wahlkreis-Nr.'] < 900)]

    for index, row in filtered_skd17.iterrows():
        wahlbeteiligung = wbt17[wbt17['WK_NR'] == row['Wahlkreis-Nr.']]['Wahlbeteiligung'].values[0].replace(",", ".")
        strukturdatum = Base.classes.strukturdaten(
            wahlkreis_id=row['Wahlkreis-Nr.'],
            wahl_id=2,
            einwohnerzahl=int(float(row['Bevlkerung am 31.12.2015 - Deutsche (in 1000)'].replace(",", ".")) * 1000),
            wahlbeteiligung=wahlbeteiligung,
            auslaenderanteil=float(row['Bevlkerung am 31.12.2015 - Auslnder (%)'].replace(",", ".")),
            unternehmensdichte=float(row['Unternehmensregister 2014 - Unternehmen insgesamt (je 1000 Einwohner)'].replace(",", ".")),
            einkommen=int(row['Verfgbares Einkommen der privaten Haushalte 2014 ( je Einwohner)']),
        )

        print(strukturdatum)
        session.add(strukturdatum)

    for index, row in filtered_skd21.iterrows():
        wahlbeteiligung = wbt21[wbt21['Gebietsnummer'] == row['Wahlkreis-Nr.']]['Prozent'].values[0].replace(",", ".")

        strukturdatum = Base.classes.strukturdaten(
            wahlkreis_id=row['Wahlkreis-Nr.'],
            wahl_id=1,
            einwohnerzahl=int(float(row['Bevölkerung am 31.12.2019 - Deutsche (in 1000)'].replace(",", ".")) * 1000),
            wahlbeteiligung=wahlbeteiligung,
            auslaenderanteil=float(row['Bevölkerung am 31.12.2019 - Ausländer/-innen (%)'].replace(",", ".")),
            unternehmensdichte=float(row['Unternehmensregister 2018 - Unternehmen insgesamt (je 1000 EW)'].replace(",", ".")),
            einkommen=int(row['Verfügbares Einkommen der privaten Haushalte 2018 (EUR je EW)']),
        )

        print(strukturdatum)
        session.add(strukturdatum)

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

