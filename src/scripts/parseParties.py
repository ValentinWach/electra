import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import Column, Integer, String
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship, declarative_base
from pathlib import Path

from src.database.models import Partei

DATABASE_URL = "postgresql://admin:admin@localhost:5432/postgres"

engine = create_engine(DATABASE_URL)

Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)


df = pd.read_csv(Path('sourcefiles', 'btw21_parteien.csv'), delimiter=';')

# Filtern der Zeilen, bei denen 'Stimme' == 1
# Filter for rows where 'Gruppenart_XML' is either 'PARTEI' or 'EINZELBEWERBER'
filtered_df = df[df['Gruppenart_XML'].isin(['PARTEI', 'EINZELBEWERBER'])]
# Session starten
db = Session()

# Für jedes gefilterte Tupel ein neues Objekt erstellen und in die Datenbank einfügen

for index, row in filtered_df.iterrows():
    # Create a new Partei object
    partei = Partei(
        id=row['Gruppenschluessel'],  # Assuming 'Gruppenschluessel' is the id column
        type=row['Gruppenart_XML'],  # Setting the type based on the condition above
        name=row['Gruppenname_lang'],  # Adjust according to actual column name for 'name'
        shortName=row['Gruppenname_kurz'],  # Adjust according to actual column name for 'shortName'
    )

    # Print for debugging (optional)
    print(partei)

    # Add to session
    db.add(partei)

db.commit()
db.close()

