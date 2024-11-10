from sqlalchemy import Column, Integer, String, ForeignKey, Date, Enum as SQLEnum, Year
from sqlalchemy.orm import relationship
from datetime import date
from enum import Enum

from connection import Base

class Erststimme(Base):
    __tablename__ = 'erststimmen'

    id = Column(Integer, primary_key=True, index=True)

    # Relations
    wahlkreis_id = Column(Integer, ForeignKey('wahlkreise.id'), nullable=False)
    wahlkreis = relationship('Wahlkreis', back_populates='erststimmen')
    partei_id = Column(Integer, ForeignKey('parteien.id'), nullable=False)
    partei = relationship('Partei', back_populates='erststimmen')
    wahl_id = Column(Integer, ForeignKey('wahlen.id'), nullable=False)
    wahl = relationship('Wahl', back_populates='erststimmen')

    def __repr__(self):
        return f"<Erststimme(id={self.id}, wahlkreis_id={self.wahlkreis_id}, partei_id={self.partei_id})>"

class Zweitstimme(Base):
    __tablename__ = 'zweitstimmen'

    id = Column(Integer, primary_key=True, index=True)

    # Relations
    wahlkreis_id = Column(Integer, ForeignKey('wahlkreise.id'), nullable=False)
    wahlkreis = relationship('Wahlkreis', back_populates='zweitstimmen')
    partei_id = Column(Integer, ForeignKey('parteien.id'), nullable=False)
    partei = relationship('Partei', back_populates='zweitstimmen')
    wahl_id = Column(Integer, ForeignKey('wahlen.id'), nullable=False)
    wahl = relationship('Wahl', back_populates='zweitstimmen')

    def __repr__(self):
        return f"<Zweitstimme(id={self.id}, wahlkreis_id={self.wahlkreis_id}, partei_id={self.partei_id})>"

class Partei(Base):
    __tablename__ = 'parteien'

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, nullable=False)
    name = Column(String, nullable=False, unique=True)
    shortName = Column(String, nullable=False, unique=True)

    # Relations
    erststimmen = relationship('Erststimme', back_populates='partei')
    zweitstimmen = relationship('Zweitstimme', back_populates='partei')

    def __repr__(self):
        return f"<Partei(id={self.id}, type={self.type}, name={self.name}, shortName={self.shortName})>"

class Wahl(Base):
    __tablename__ = 'wahlen'

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, unique=True)

    # Relations
    erststimmen = relationship('Erststimme', back_populates='wahl')
    zweitstimmen = relationship('Zweitstimme', back_populates='wahl')
    abgeordnete = relationship('Abgeordneter', back_populates='wahl')

    def __repr__(self):
        return f"<Wahl(id={self.id}, date={self.date})>"

'''class Abgeordneter(Base):
    __tablename__ = 'abgeordnete'

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String, nullable=True)
    name = Column(String, nullable=False)
    firstname = Column(String, nullable=False)

    # Relations
    wahl_id = Column(Integer, ForeignKey('wahlen.id'), nullable=False)
    wahl = relationship('Wahl', back_populates='abgeordnete')

    def __repr__(self):
        return f"<Abgeordneter(id={self.id}, title={self.title}, name={self.name}, firstname={self.firstname})>"'''

class Gender(Enum):
    MALE = "m"
    FEMALE = "w"
    DIVERSE = "d"
class Kandidat(Base):
    __tablename__ = 'kandidaten'

    name = Column(String, nullable=False)
    firstname = Column(String, nullable=False)
    gender = Column(SQLEnum(Gender), nullable=False)
    profession = Column(String)
    yearOfBirth = Column(Date)

    # relations


class Wahlkreiskandidatur(Base):
    __tablename__ = 'wahlkreiskandidaturen'

    # relations
    kandidat = relationship('kandidaten', back_populates='wahlkreiskandidatur')
    kandidat_id = Column(Integer, ForeignKey('kandidat.id'), nullable=False)
    wahlkreis = relationship('wahlkreise', back_populates='wahlkreiskandidaten')
    wahlkreis_id = Column(Integer, ForeignKey('wahlkreis.id'), nullable=False)
    partei = relationship('parteien', back_populates='Kandidaten')
    partei_id = Column(Integer, ForeignKey('partei.id'), nullable=False)
    wahl = relationship('wahlen', back_populates='kandidaten')
    wahl_id = Column(Integer, ForeignKey('wahl.id'), nullable=False)


class Listenkandidatur(Base):
    __tablename__ = 'listenkandidaturen'

    # relations
    kandidat = relationship('kandidaten', back_populates='wahlkreiskandidatur')
    listPosition = Column(Integer, nullable=False)
    bundesland = relationship('bundeslaender', back_populates='listenkandidaten')
    partei = relationship('parteien', back_populates='Kandidaten')
    wahl = relationship('wahlen', back_populates='kandidaten')



class Wahlkreis(Base):
    __tablename__ = 'wahlkreise'

    id = Column(Integer, primary_key=True, index=True)

    # Relations
    erststimmen = relationship('Erststimme', back_populates='wahlkreis')
    zweitstimmen = relationship('Zweitstimme', back_populates='wahlkreis')
    bundesland_id = Column(Integer, ForeignKey('bundeslaender.id'), nullable=False)
    bundesland = relationship('Bundesland', back_populates='wahlkreise')

    def __repr__(self):
        return f"<Wahlkreis(id={self.id}, bundesland_id={self.bundesland_id})>"

class Bundesland(Base):
    __tablename__ = 'bundeslaender'

    id = Column(Integer, primary_key=True, index=True)

    # Relations
    wahlkreise = relationship('Wahlkreis', back_populates='bundesland')

    def __repr__(self):
        return f"<Bundesland(id={self.id})>"
