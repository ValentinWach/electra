from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from models import *

DATABASE_URL = "postgresql://admin:admin@localhost:5432/postgres"
engine = create_engine(DATABASE_URL)
Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)
print("Creating tables.")
#Base.metadata.create_all(bind=engine)
