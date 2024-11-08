import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import Column, Integer, String
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship, declarative_base

from src.database.connection import Erststimme

DATABASE_URL = "postgresql://admin:admin@localhost:5432/mydatabase"

engine = create_engine(DATABASE_URL)
Base = declarative_base()

Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)



df = pd.read_csv('C:\\Users\\Valentin\\Documents\\Kurse 7. Semester\\DBS\\kerg2.csv', delimiter=';', on_bad_lines='skip')

# Filtern der Zeilen, bei denen 'Stimme' == 1
filtered_df = df[(df['Stimme'] == 1) & (df['Gruppenart'] == 'Partei') & (df['Gebietsart'] == 'Wahlkreis')]


# Session starten
db = Session()

# Für jedes gefilterte Tupel ein neues Objekt erstellen und in die Datenbank einfügen
for index, row in filtered_df.iterrows():
    # Get the count from the 'Anzahl' column
    count = int(row['Anzahl'])

    # Inner loop to insert 'Erststimme' objects 'count' times
    for _ in range(count):
        # Create a new Erststimme object with the necessary data
        erststimme = Erststimme(
            wahlkreis=row['Gebietsnummer'],
            partei=row['Gruppenname'],
        )
        print(erststimme)
        # Add the object to the session
        #db.add(erststimme)

    # Optional: Print the Erststimme object for debugging
# Commit der Änderungen und Session schließen
#db.commit()
#db.close()