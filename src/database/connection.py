from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import Column, Integer, String
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship, declarative_base

DATABASE_URL = "postgresql://admin:admin@localhost:5432/mydatabase"

engine = create_engine(DATABASE_URL)
Base = declarative_base()

Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Erststimme(Base):
    __tablename__ = 'Erststimme'

    id = Column(Integer, primary_key=True, index=True)
    wahlkreis = relationship('Wahlkreis', back_populates='')

class Wahlkreis(Base):
    __tablename__ = 'Wahlkreis'

    id = Column(Integer, primary_key=True, index=True)


