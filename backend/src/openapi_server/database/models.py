from sqlalchemy import Column, Integer, Boolean, String, ForeignKey, Date, Float, Enum as SQLEnum
from sqlalchemy.orm import relationship, declarative_base
from enum import Enum
from openapi_server.database.base import Base

class Wahl(Base):
    __tablename__ = 'wahlen'

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, unique=True)

    # Relations
    zweitstimmen = relationship('Zweitstimme', back_populates='wahl')
    wahlkreiskandidaturen = relationship('Wahlkreiskandidatur', back_populates='wahl')
    listenkandidaturen = relationship('Listenkandidatur', back_populates='wahl')
    strukturdaten = relationship('Strukturdatum', back_populates='wahl')
    einwohner_pro_bundesland_temp = relationship('einwohner_pro_bundesland_temp', back_populates='wahl')
    def __repr__(self):
        return f"<Wahl(id={self.id}, date={self.date})>"

class Wahlkreis(Base):
    __tablename__ = 'wahlkreise'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    # Relations
    zweitstimmen = relationship('Zweitstimme', back_populates='wahlkreis')
    bundesland = relationship('Bundesland', back_populates='wahlkreise')
    bundesland_id = Column(Integer, ForeignKey('bundeslaender.id'), nullable=False)
    wahlkreiskandidaturen = relationship('Wahlkreiskandidatur', back_populates='wahlkreis')
    strukturdaten = relationship('Strukturdatum', back_populates='wahlkreis')

    def __repr__(self):
        return f"<Wahlkreis(id={self.id}, name={self.name} bundesland_id={self.bundesland_id})>"

class Bundesland(Base):
    __tablename__ = 'bundeslaender'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)

    # Relations
    wahlkreise = relationship('Wahlkreis', back_populates='bundesland')
    listenkandidaturen = relationship('Listenkandidatur', back_populates='bundesland')
    einwohner_pro_bundesland_temp = relationship('einwohner_pro_bundesland_temp', back_populates='bundesland')
    
    def __repr__(self):
        return f"<Bundesland(id={self.id})>"

class Erststimme(Base):
    __tablename__ = 'erststimmen'

    id = Column(Integer, primary_key=True)

    # Relations
    wahlkreiskandidatur = relationship('Wahlkreiskandidatur', back_populates='erststimmen')
    wahlkreiskandidatur_id = Column(Integer, ForeignKey('wahlkreiskandidaturen.id'), nullable=False)

    def __repr__(self):
        return f"<Erststimme(id={self.id}), wahlkreiskandidatur_id={self.wahlkreiskandidatur_id}>"

class ErststimmeTest(Base):
    __tablename__ = 'erststimmen_test'

    id = Column(Integer, primary_key=True, index=True)

    # Relations
    wahlkreiskandidatur = relationship('Wahlkreiskandidatur')
    wahlkreiskandidatur_id = Column(Integer, ForeignKey('wahlkreiskandidaturen.id'), nullable=False)

    def __repr__(self):
        return f"<Erststimme(id={self.id}), wahlkreiskandidatur_id={self.wahlkreiskandidatur_id}>"

class Zweitstimme(Base):
    __tablename__ = 'zweitstimmen'

    id = Column(Integer, primary_key=True)

    # Relations
    wahlkreis_id = Column(Integer, ForeignKey('wahlkreise.id'), nullable=False)
    wahlkreis = relationship('Wahlkreis', back_populates='zweitstimmen')
    partei_id = Column(Integer, ForeignKey('parteien.id'), nullable=False)
    partei = relationship('Partei', back_populates='zweitstimmen')
    wahl_id = Column(Integer, ForeignKey('wahlen.id'), nullable=False)
    wahl = relationship('Wahl', back_populates='zweitstimmen')

    def __repr__(self):
        return f"<Zweitstimme(id={self.id}, wahlkreis_id={self.wahlkreis_id}, partei_id={self.partei_id})>"

class ZweitstimmeTest(Base):
    __tablename__ = 'zweitstimmen_test'

    id = Column(Integer, primary_key=True, index=True)

    # Relations
    wahlkreis_id = Column(Integer, ForeignKey('wahlkreise.id'), nullable=False)
    wahlkreis = relationship('Wahlkreis')
    partei_id = Column(Integer, ForeignKey('parteien.id'), nullable=False)
    partei = relationship('Partei')
    wahl_id = Column(Integer, ForeignKey('wahlen.id'), nullable=False)
    wahl = relationship('Wahl')

    def __repr__(self):
        return f"<Zweitstimme(id={self.id}, wahlkreis_id={self.wahlkreis_id}, partei_id={self.partei_id})>"

class Partei(Base):
    __tablename__ = 'parteien'

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, nullable=False)
    name = Column(String, nullable=True)
    shortName = Column(String, nullable=False, index=True)

    # Relations
    wahlkreiskandidaturen = relationship('Wahlkreiskandidatur', back_populates='partei')
    listenkandidaturen = relationship('Listenkandidatur', back_populates='partei')
    zweitstimmen = relationship('Zweitstimme', back_populates='partei')

    def __repr__(self):
        return f"<Partei(id={self.id}, type={self.type}, name={self.name}, shortName={self.shortName})>"
    
class einwohner_pro_bundesland_temp(Base):
    __tablename__ = 'einwohner_pro_bundesland_temp'

    id = Column(Integer, primary_key=True, index=True)
    einwohnerzahl = Column(Integer, nullable=False)
    wahl_id = Column(Integer, ForeignKey('wahlen.id'), nullable=False)
    wahl = relationship('Wahl')
    bundesland_id = Column(Integer, ForeignKey('bundeslaender.id'), nullable=False)
    bundesland = relationship('Bundesland')

class Kandidat(Base):
    __tablename__ = 'kandidaten'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    firstname = Column(String, nullable=False)
    profession = Column(String)
    yearOfBirth = Column(Integer, nullable=False)

    # Relations
    wahlkreiskandidaturen = relationship('Wahlkreiskandidatur', back_populates='kandidat')
    listenkandidaturen = relationship('Listenkandidatur', back_populates='kandidat')

    def __repr__(self):
        return f"<Kandidat(id={self.id}, name={self.name}, firstname={self.firstname}, profession={self.profession}, birth={self.yearOfBirth})>"

class Wahlkreiskandidatur(Base):
    __tablename__ = 'wahlkreiskandidaturen'
    id = Column(Integer, primary_key=True, index=True)

    # Relations
    kandidat = relationship('Kandidat', back_populates='wahlkreiskandidaturen')
    kandidat_id = Column(Integer, ForeignKey('kandidaten.id'), nullable=False)
    wahlkreis = relationship('Wahlkreis', back_populates='wahlkreiskandidaturen')
    wahlkreis_id = Column(Integer, ForeignKey('wahlkreise.id'), nullable=False)
    partei = relationship('Partei', back_populates='wahlkreiskandidaturen')
    partei_id = Column(Integer, ForeignKey('parteien.id'), nullable=True)
    erststimmen = relationship('Erststimme', back_populates='wahlkreiskandidatur')
    wahl = relationship('Wahl', back_populates='wahlkreiskandidaturen')
    wahl_id = Column(Integer, ForeignKey('wahlen.id'), nullable=False)

    def __repr__(self):
        return f"<Wahlkreiskandidatur(id={self.id}, kandidat={self.kandidat_id}, wahlkreis={self.wahlkreis_id}, partei={self.partei_id}, wahl={self.wahl_id})>"

class Listenkandidatur(Base):
    __tablename__ = 'listenkandidaturen'

    id = Column(Integer, primary_key=True, index=True)
    listPosition = Column(Integer, nullable=False)

    # Relations
    kandidat = relationship('Kandidat', back_populates='listenkandidaturen')
    kandidat_id = Column(Integer, ForeignKey('kandidaten.id'), nullable=False)
    bundesland = relationship('Bundesland', back_populates='listenkandidaturen')
    bundesland_id = Column(Integer, ForeignKey('bundeslaender.id'), nullable=False)
    partei = relationship('Partei', back_populates='listenkandidaturen')
    partei_id = Column(Integer, ForeignKey('parteien.id'), nullable=False)
    wahl = relationship('Wahl', back_populates='listenkandidaturen')
    wahl_id = Column(Integer, ForeignKey('wahlen.id'), nullable=False)

def __repr__(self):
    return f"<Listenkandidatur(id={self.id}, kandidat={self.kandidat_id}, bundesland={self.bundesland_id}, partei={self.partei_id}, listPosition={self.listPosition}, wahl={self.wahl_id})>"

class Strukturdatum(Base):
    __tablename__ = 'strukturdaten'

    id = Column(Integer, primary_key=True, index=True)
    # Relations
    wahl = relationship('Wahl', back_populates='strukturdaten')
    wahl_id = Column(Integer, ForeignKey('wahlen.id'), nullable=False)
    wahlkreis = relationship('Wahlkreis', back_populates='strukturdaten')
    wahlkreis_id = Column(Integer, ForeignKey('wahlkreise.id'), nullable=False)


    einwohnerzahl = Column(Integer, nullable=False)
    wahlbeteiligung = Column(Float, nullable=False)
    auslaenderanteil = Column(Float, nullable=False)
    unternehmensdichte = Column(Float, nullable=False) # je 1000 EW
    einkommen = Column(Integer, nullable=False) # je EW


    def __repr__(self):
        return (
            f"<Strukturdaten(id={self.id}, wahl_id={self.wahl_id}, "
            f"wahlkreis_id={self.wahlkreis_id}, einwohnerzahl={self.einwohnerzahl}, "
            f"wahlbeteiligung={self.wahlbeteiligung}, auslaenderanteil={self.auslaenderanteil}, "
            f"unternehmensdichte={self.unternehmensdichte}, einkommen={self.einkommen})>"
        )


class Token(Base):
    __tablename__ = 'token'

    id = Column(Integer, primary_key=True, index=True)
    # Relations
    wahl = relationship('Wahl')
    wahl_id = Column(Integer, ForeignKey('wahlen.id'), nullable=False)
    wahlkreis = relationship('Wahlkreis')
    wahlkreis_id = Column(Integer, ForeignKey('wahlkreise.id'), nullable=False)

    voted = Column(Boolean, nullable=False)
    hash = Column(String, nullable=False)

    def __repr__(self):
        return (
            f"<Token(id={self.id}, "
            f"wahl_id={self.wahl_id}, "
            f"wahlkreis_id={self.wahlkreis_id}, "
            f"voted={self.voted}, "
            f"token='{self.hash}')>"
        )


