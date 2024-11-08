from sqlalchemy import Column, Integer, String, ForeignKey, Date, Enum
from sqlalchemy.orm import relationship
from datetime import date

from connection import Base

class Erststimme(Base):
    __tablename__ = 'erststimmen'

    id = Column(Integer, primary_key=True, index=True)

    # Relations
    wahlkreis = relationship('Wahlkreis', back_populates='erststimmen')
    wahlkreis_id = Column(Integer, ForeignKey('wahlkreise.id'), nullable=False)
    partei = relationship('Partei', back_populates='erststimmen')
    partei_id = Column(Integer, ForeignKey('parteien.id'), nullable=False)
    wahl = relationship('Wahl', back_populates='erststimmen')
    wahl_id = Column(Integer, ForeignKey('wahlen.id'), nullable=False)

    def __repr__(self):
        return f"Erststimme(id={self.id}, wahlkreis={self.wahlkreis}, partei='{self.partei}')"

class Zweitstimme(Base):
    __tablename__ = 'zweitstimmen'

    id = Column(Integer, primary_key=True, index=True)

    # Relations
    wahlkreis = relationship('Wahlkreis', back_populates='zweitstimmen')
    wahlkreis_id = Column(Integer, ForeignKey('wahlkreise.id'), nullable=False)
    partei = relationship('Partei', back_populates='zweitstimmen')
    partei_id = Column(Integer, ForeignKey('parteien.id'), nullable=False)
    wahl = relationship('Wahl', back_populates='zweitstimmen')
    wahl_id = Column(Integer, ForeignKey('wahlen.id'), nullable=False)

class Partei(Base):
    __tablename__ = 'parteien'

    id = Column(Integer, primary_key=True, index=True)
    type = Column(Enum(1, 2, name="party_types"), nullable=False)
    name = Column(String, nullable=False, unique=True)
    shortName = Column(String, nullable=False, unique=True)
    slogan = Column(String, nullable=False)

    # Relations
    erststimmen = relationship('Erststimme', back_populates="partei")
    zweitstimmen = relationship('Zweitstimme', back_populates='partei')

class Wahl(Base):
    __tablename__ = 'wahlen'

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, unique=True)

    # Relations
    erststimmen = relationship('Erststimme', back_populates="wahl")
    zweitstimmen = relationship('Zweitstimme', back_populates='wahl')
    abgeordnete = relationship('Abgeordnete', back_populates='wahl')

class Abgeordnete(Base):
    __tablename__ = 'abgeordneten'

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String, nullable=True)
    name = Column(String, nullable=False)
    firstname = Column(String, nullable=False)

    # relations
    wahl = relationship('Wahl', back_populates='abgeordnete')
    wahl_id = Column(Integer, ForeignKey('wahlen.id'), nullable=False)

class Wahlkreis(Base):
    __tablename__ = 'wahlkreise'

    id = Column(Integer, primary_key=True, index=True)

    # Relations
    erststimmen = relationship('Erststimme', back_populates='wahlkreis')
    zweitstimmen = relationship('Zweitstimme', back_populates='wahlkreis')
    bundesland = relationship('Bundesland', back_populates='wahlkreise')
    bundesland_id = Column(Integer, ForeignKey('bundeslaender.id'), nullable=False)

class Bundesland(Base):
    __tablename__ = 'bundeslaender'

    id = Column(Integer, primary_key=True, index=True)

    # Relations
    wahlkreise = relationship('Wahlkreis', back_populates='bundesland')