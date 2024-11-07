from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base

DATABASE_URL = "postgresql://admin:admin@localhost:5432/mydatabase"

engine = create_engine(DATABASE_URL)
Base = declarative_base()

Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)


