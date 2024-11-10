import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import Column, Integer, String
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship, declarative_base

from src.database.models import Partei, Kandidat

DATABASE_URL = "postgresql://admin:admin@localhost:5432/mydatabase"

engine = create_engine(DATABASE_URL)
Base = declarative_base()

Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)


df = pd.read_csv('C:\\Users\\Valentin\\Documents\\Kurse 7. Semester\\DBS\\kandidaturen_2021.csv', delimiter=';')

# Filtern der Zeilen, bei denen 'Stimme' == 1
# Filter for rows where 'Gruppenart_XML' is either 'PARTEI' or 'EINZELBEWERBER'
filtered_df = df
# Session starten
db = Session()

# Für jedes gefilterte Tupel ein neues Objekt erstellen und in die Datenbank einfügen

for index, row in filtered_df.iterrows():
    # Create a new Partei object
    kandidat = Kandidat(
        name=row['Nachname'],  # Assuming 'Gruppenschluessel' is the id column
        firstname=row['Vornamen'],  # Setting the type based on the condition above
        gender=row['Geschlecht'],  # Adjust according to actual column name for 'name'
        profession=row['Beruf'],
        yearOfBirth=row['Geburtsjahr'],
    )

    # Print for debugging (optional)
    print(kandidat)

    # Add to session
    #db.add(partei)

#db.commit()
#db.close()

