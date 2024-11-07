from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship


from connection import Base

class Erststimme(Base):
    __tablename__ = 'erststimme'

    id = Column(Integer, primary_key=True, index=True)

    #Wahlkreis
    wahlkreis = relationship('Wahlkreis', back_populates='erststimmen')
    wahlkreis_id = Column(Integer, ForeignKey('wahlkreis.id'), nullable=False)

    #Partei
    partei = relationship('Partei', back_populates='erststimmen')
    partei_id = Column(Integer, ForeignKey('partei.id'), nullable=False)

class Zweitstimme(Base):
    __tablename__ = 'zweitstimme'

    id = Column(Integer, primary_key=True, index=True)

    #Wahlkreis
    wahlkreis = relationship('Wahlkreis', back_populates='zweitstimmen')
    wahlkreis_id = Column(Integer, ForeignKey('wahlkreis.id'), nullable=False)

    #Partei
    partei = relationship('Partei', back_populates='zweitstimmen')
    partei_id = Column(Integer, ForeignKey('partei.id'), nullable=False)

class Partei(Base):
    __tablename__ = 'partei'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)

    #Erstimmen
    erststimmen = relationship('Erststimme', back_populates="partei")

    #Zweitstimmen
    zweitstimmen = relationship('Zweitstimme', back_populates='partei')



class Wahlkreis(Base):
    __tablename__ = 'wahlkreis'

    id = Column(Integer, primary_key=True, index=True)

    #Erststimmen
    erststimmen = relationship('Erststimme', back_populates='wahlkreis')

    #Zweitstimmen
    zweitstimmen = relationship('Zweitstimme', back_populates='wahlkreis')