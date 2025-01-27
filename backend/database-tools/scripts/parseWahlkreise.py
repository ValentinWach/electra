import pandas as pd
import os
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from pathlib import Path

from backend.src.openapi_server.database.models import Wahlkreis, Bundesland
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("No DATABASE_URL found in the environment variables")


engine = create_engine(DATABASE_URL)

Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)

df = pd.read_csv(Path('sourcefiles', 'strukturdaten_2021.csv'), delimiter=';')

filtered_df = df[(df['Wahlkreis-Nr.'] < 900)]

model = Session()

for index, row in filtered_df.iterrows():

    corrected_name = row['Wahlkreis-Name']
    bundesland = model.query(Bundesland).filter_by(
        name = row['Land'],
    ).one()

    wahlkreis = Wahlkreis(
        id= row['Wahlkreis-Nr.'],
        name=corrected_name,
        bundesland_id=bundesland.id
    )

    print(wahlkreis)

    model.add(wahlkreis)

model.commit()
print("Commited")
model.close()

