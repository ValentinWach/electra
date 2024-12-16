import pandas as pd
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from pathlib import Path

from backend.src.app.src.openapi_server.database.models import Partei

DATABASE_URL = "postgresql://admin:admin@localhost:5432/postgres"

engine = create_engine(DATABASE_URL)

Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)


df = pd.read_csv(Path('sourcefiles', 'parteien_2017.csv'), delimiter=';', keep_default_na=False)

# Filtern der Zeilen, bei denen 'Stimme' == 1
# Filter for rows where 'Gruppenart_XML' is either 'PARTEI' or 'EINZELBEWERBER'
filtered_df = df[df['Gruppenart_XML'].isin(['PARTEI', 'EINZELBEWERBER'])]
# Session starten
db = Session()

# Für jedes gefilterte Tupel ein neues Objekt erstellen und in die Datenbank einfügen

for index, row in filtered_df.iterrows():
    if not row['Gruppenname_kurz'].startswith('EB: '):
        partei_query = db.query(Partei).filter_by(
            shortName=row['Gruppenname_kurz'],
        ).all()
        if(len(partei_query) == 0):
            partei = Partei(
                #id=row['Gruppenschluessel'],  haben wir 2017 eh nicht...
                type=row['Gruppenart_XML'],  # Setting the type based on the condition above
                name=row['Gruppenname_lang'],  # Adjust according to actual column name for 'name'
                shortName=row['Gruppenname_kurz'],  # Adjust according to actual column name for 'shortName'
            )
            db.add(partei)
db.commit()
db.close()

