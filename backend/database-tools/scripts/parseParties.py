import pandas as pd
import os
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from pathlib import Path

from backend.src.openapi_server.database.models import Partei
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("No DATABASE_URL found in the environment variables")


engine = create_engine(DATABASE_URL)

Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)


df = pd.read_csv(Path('sourcefiles', 'parteien_2017.csv'), delimiter=';', keep_default_na=False)

filtered_df = df[df['Gruppenart_XML'].isin(['PARTEI', 'EINZELBEWERBER'])]

db = Session()


for index, row in filtered_df.iterrows():
    if not row['Gruppenname_kurz'].startswith('EB: '):
        partei_query = db.query(Partei).filter_by(
            shortName=row['Gruppenname_kurz'],
        ).all()
        if(len(partei_query) == 0):
            partei = Partei(
                type=row['Gruppenart_XML'],
                name=row['Gruppenname_lang'],
                shortName=row['Gruppenname_kurz'],
            )
            db.add(partei)
db.commit()
db.close()

