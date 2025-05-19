import pandas as pd
import numpy as np
import sys
import os
from pathlib import Path

# Add the parent directory to the Python path so we can import from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.database.models import Bundesland, Wahlkreis  # Import the actual model classes


def parse_wahlkreise(session, Base):
    script_dir = Path(__file__).parent  # go up to database-tools directory
    source_dir = script_dir / 'sourcefiles'
    
    df = pd.read_csv(source_dir / 'strukturdaten_2021.csv', delimiter=';')
    filtered_df = df[(df['Wahlkreis-Nr.'] < 900)]

    for index, row in filtered_df.iterrows():
        corrected_name = row['Wahlkreis-Name']
        bundesland = session.query(Bundesland).filter_by(
            name = row['Land'],
        ).one()

        wahlkreis = Wahlkreis(
            id= row['Wahlkreis-Nr.'],
            name=corrected_name,
            bundesland_id=bundesland.id
        )

        #print(wahlkreis)
        session.add(wahlkreis)

    session.commit()

if __name__ == '__main__':
    # This section only runs if script is called directly
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
    
    parse_wahlkreise(session, Base)
    session.close()

