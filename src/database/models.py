from sqlalchemy import Column, Integer, String, ForeignKey, Date, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import date
from enum import Enum

from connection import Base


class Wahl(Base):
    __tablename__ = 'wahlen'

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, unique=True)

    # Relations
    erststimmen = relationship('Erststimme', back_populates='wahl')
    zweitstimmen = relationship('Zweitstimme', back_populates='wahl')
    wahlkreiskandidaturen = relationship('Wahlkreiskandidatur', back_populates='wahl')
    listenkandidaturen = relationship('Listenkandidatur', back_populates='wahl')

    def __repr__(self):
        return f"<Wahl(id={self.id}, date={self.date})>"

class Wahlkreis(Base):
    __tablename__ = 'wahlkreise'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    einwohnerzahl = Column(Integer, nullable=False)
    # Relations
    erststimmen = relationship('Erststimme', back_populates='wahlkreis')
    zweitstimmen = relationship('Zweitstimme', back_populates='wahlkreis')
    bundesland = relationship('Bundesland', back_populates='wahlkreise')
    bundesland_id = Column(Integer, ForeignKey('bundeslaender.id'), nullable=False)
    wahlkreiskandidaturen = relationship('Wahlkreiskandidatur', back_populates='wahlkreis')

    def __repr__(self):
        return f"<Wahlkreis(id={self.id}, bundesland_id={self.bundesland_id})>"

class Bundesland(Base):
    __tablename__ = 'bundeslaender'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)

    # Relations
    wahlkreise = relationship('Wahlkreis', back_populates='bundesland')
    listenkandidaturen = relationship('Listenkandidatur', back_populates='bundesland')

    def __repr__(self):
        return f"<Bundesland(id={self.id})>"


class Erststimme(Base):
    __tablename__ = 'erststimmen'

    id = Column(Integer, primary_key=True, index=True)

    # Relations
    wahlkreis_id = Column(Integer, ForeignKey('wahlkreise.id'), nullable=False)
    wahlkreis = relationship('Wahlkreis', back_populates='erststimmen')
    wahlkreiskandidatur = relationship('wahlkreiskandidaturen', back_populates='erststimmen')
    wahlkreiskandidatur_id = Column(Integer, ForeignKey('wahlkreiskandidaturen.id'), nullable=False)
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
    wahlkreiskandidaturen = relationship('Wahlkreiskandidatur', back_populates='partei')
    listenkandidaturen = relationship('Listenkandidatur', back_populates='partei')
    zweitstimmen = relationship('Zweitstimmen', back_populates='partei')

    def __repr__(self):
        return f"<Partei(id={self.id}, type={self.type}, name={self.name}, shortName={self.shortName})>"

class Gender(Enum):
    MALE = "m"
    FEMALE = "w"
    DIVERSE = "d"

class Kandidat(Base):
    __tablename__ = 'kandidaten'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    firstname = Column(String, nullable=False)
    gender = Column(SQLEnum(Gender), nullable=False)
    profession = Column(String)
    yearOfBirth = Column(Integer)

    # Relations
    wahlkreiskandidaturen = relationship('wahlkreiskandidaturen', back_populates='kandidat')
    listenkandidaturen = relationship('listenkandidaturen', back_populates='kandidat')

    def __repr__(self):
        return f"<Kandidat(id={self.id}, name={self.name}, firstname={self.firstname})>"

class Wahlkreiskandidatur(Base):
    __tablename__ = 'wahlkreiskandidaturen'
    id = Column(Integer, primary_key=True, index=True)

    # relations
    kandidat = relationship('kandidaten', back_populates='wahlkreiskandidaturen')
    kandidat_id = Column(Integer, ForeignKey('kandidat.id'), nullable=False)
    wahlkreis = relationship('wahlkreise', back_populates='wahlkreiskandidaten')
    wahlkreis_id = Column(Integer, ForeignKey('wahlkreis.id'), nullable=False)
    partei = relationship('parteien', back_populates='Kandidaten')
    partei_id = Column(Integer, ForeignKey('parteien.id'), nullable=False)
    erststimmen = relationship('Erststimmen', back_populates='wahlkreiskandidatur')
    wahl = relationship('wahlen', back_populates='kandidaten')
    wahl_id = Column(Integer, ForeignKey('wahl.id'), nullable=False)


class Listenkandidatur(Base):
    __tablename__ = 'listenkandidaturen'

    id = Column(Integer, primary_key=True, index=True)

    # relations
    kandidat = relationship('kandidaten', back_populates='wahlkreiskandidaturen')
    kandidat_id = Column(Integer, ForeignKey('kandidat.id'), nullable=False)
    listPosition = Column(Integer, nullable=False)
    bundesland = relationship('bundeslaender', back_populates='listenkandidaten')
    bundesland_id = Column(Integer, ForeignKey('bundesland.id'), nullable=False)
    partei = relationship('parteien', back_populates='Kandidaten')
    partei_id = Column(Integer, ForeignKey('parteien.id'), nullable=False)
    wahl = relationship('wahlen', back_populates='kandidaten')
    wahl_id = Column(Integer, ForeignKey('wahl.id'), nullable=False)


