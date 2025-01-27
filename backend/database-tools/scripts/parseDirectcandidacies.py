import pandas as pd
from pathlib import Path
from datetime import datetime

def parse_directcandidacies(session, Base, year):
    script_dir = Path(__file__).parent.parent  # go up to database-tools directory
    source_dir = script_dir / 'sourcefiles'
    
    df = pd.read_csv(source_dir / f'kandidaturen_{year}.csv', delimiter=';', keep_default_na=False)
    filtered_df = df[(df['Kennzeichen'] == 'Kreiswahlvorschlag') | (df['Kennzeichen'] == 'anderer Kreiswahlvorschlag')]

    for index, row in filtered_df.iterrows():
        full_name = f"{row['Titel']} {row['Nachname']}".strip() if 'Titel' in row and row['Titel'] else row['Nachname']

        kandidat = session.query(Base.classes.kandidaten).filter_by(
            name=full_name,
            firstname=row['Vornamen'],
            yearOfBirth=row['Geburtsjahr'],
        ).one()

        wahlkreis = session.query(Base.classes.wahlkreise).filter_by(
            name = row['Gebietsname'],
        ).one()

        row['Gruppenname'] = 'HEIMAT (2021: NPD)' if row['Gruppenname'] == 'NPD' else row['Gruppenname']
        row['GruppennameLang'] = 'Die Heimat (2021: Nationaldemokratische Partei Deutschlands)' if row['GruppennameLang'] == 'Nationaldemokratische Partei Deutschlands' else row['GruppennameLang']
        row['Gruppenname'] = 'Wir Bürger (2021: LKR)' if row['Gruppenname'] == 'LKR' else row['Gruppenname']
        row['GruppennameLang'] = 'Wir Bürger (2021: Liberal-Konservative Reformer)' if row['GruppennameLang'] == 'Liberal-Konservative Reformer' else row['GruppennameLang']
        row['Gruppenname'] = 'Verjüngungsforschung (2021: Gesundheitsforschung)' if row['Gruppenname'] == 'Gesundheitsforschung' else row['Gruppenname']
        row['GruppennameLang'] = 'Partei für schulmedizinische Verjüngungsforschung (2021: Partei für Gesundheitsforschung)' if row['GruppennameLang'] == 'Partei für Gesundheitsforschung' else row['GruppennameLang']

        date_str = row['Wahltag']
        wahl_date = datetime.strptime(date_str, '%d.%m.%Y').date()
        wahl = session.query(Base.classes.wahlen).filter_by(
            date=wahl_date,
        ).one()

        if not (row['Gruppenname'].startswith("EB: ")):
            partei_query = session.query(Base.classes.parteien).filter_by(
                shortName=row['Gruppenname'],
            ).all()
            if len(partei_query) > 1:
                print(
                    f"WARNING: Multiple results found for Partei with shortName={row['Gruppenname']} and name={row['GruppennameLang']}")
            elif len(partei_query) == 0:
                raise ValueError(f"Partei not found with shortName={row['Gruppenname']} and name={row['GruppennameLang']}")
            partei = partei_query[0] if partei_query else None

            wahlkreiskandidatur = Base.classes.wahlkreiskandidaturen(
                kandidat_id=kandidat.id,
                wahlkreis_id=wahlkreis.id,
                partei_id=partei.id,
                wahl_id=wahl.id,
            )
        else:
            wahlkreiskandidatur = Base.classes.wahlkreiskandidaturen(
                kandidat_id=kandidat.id,
                wahlkreis_id=wahlkreis.id,
                partei_id=None,
                wahl_id=wahl.id,
            )

        session.add(wahlkreiskandidatur)

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
    
    parse_directcandidacies(session, Base, args.year)
    session.close()
