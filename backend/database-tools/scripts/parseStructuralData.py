import pandas as pd
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from pathlib import Path

from backend.database_tools.database.models import Strukturdatum

DATABASE_URL = "postgresql://admin:admin@localhost:5432/Electra"

engine = create_engine(DATABASE_URL)

Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)

skd17 = pd.read_csv(Path('sourcefiles', 'strukturdaten_2017.csv'), delimiter=';')
skd21 = pd.read_csv(Path('sourcefiles', 'strukturdaten_2021.csv'), delimiter=';')
wbt17 = pd.read_csv(Path('sourcefiles', 'wahlbeteiligung_2017.csv'), delimiter=',')
wbt21 = pd.read_csv(Path('sourcefiles', 'wahlbeteiligung_2021.csv'), delimiter=',')

filtered_skd17 = skd17[(skd17['Wahlkreis-Nr.'] < 900)]
filtered_skd21 = skd21[(skd21['Wahlkreis-Nr.'] < 900)]

# Session starten
model = Session()

# Für jedes gefilterte Tupel ein neues Objekt erstellen und in die Datenbank einfügen

for index, row in filtered_skd17.iterrows():

    wahlbeteiligung = wbt17[wbt17['WK_NR'] == row['Wahlkreis-Nr.']]['Wahlbeteiligung'].values[0].replace(",", ".")
    # Create a new Partei object
    strukturdatum = Strukturdatum(
        wahlkreis_id= row['Wahlkreis-Nr.'],
        wahl_id=2,
        einwohnerzahl= int(float(row['Bev�lkerung am 31.12.2015 - Deutsche (in 1000)'].replace(",", ".")) * 1000),
        wahlbeteiligung=wahlbeteiligung,
        auslaenderanteil=float(row['Bev�lkerung am 31.12.2015 - Ausl�nder (%)'].replace(",", ".")),
        unternehmensdichte=float(row['Unternehmensregister 2014 - Unternehmen insgesamt (je 1000 Einwohner)'].replace(",", ".")),
        einkommen=int(row['Verf�gbares Einkommen der privaten Haushalte 2014 (� je Einwohner)']),
    )

    # Relations

    # Print for debugging (optional)
    print(strukturdatum)

    # Add to session
    model.add(strukturdatum)

for index, row in filtered_skd21.iterrows():

    wahlbeteiligung = wbt21[wbt21['Gebietsnummer'] == row['Wahlkreis-Nr.']]['Prozent'].values[0].replace(",", ".")
    # Create a new Partei object
    strukturdatum = Strukturdatum(
        wahlkreis_id= row['Wahlkreis-Nr.'],
        wahl_id=1,
        einwohnerzahl= int(float(row['Bevölkerung am 31.12.2019 - Deutsche (in 1000)'].replace(",", ".")) * 1000),
        wahlbeteiligung=wahlbeteiligung,
        auslaenderanteil=float(row['Bevölkerung am 31.12.2019 - Ausländer/-innen (%)'].replace(",", ".")),
        unternehmensdichte=float(row['Unternehmensregister 2018 - Unternehmen insgesamt (je 1000 EW)'].replace(",", ".")),
        einkommen=int(row['Verfügbares Einkommen der privaten Haushalte 2018 (EUR je EW)']),
    )

    # Relations

    # Print for debugging (optional)
    print(strukturdatum)

    # Add to session
    model.add(strukturdatum)

model.commit()
print("Commited")
model.close()

