from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship


from connection import Base

class Erststimme(Base):
    __tablename__ = 'erststimme'

    id = Column(Integer, primary_key=True, index=True)

    # Relations
    wahlkreis = relationship('Wahlkreis', back_populates='erststimmen')
    wahlkreis_id = Column(Integer, ForeignKey('wahlkreis.id'), nullable=False)
    partei = relationship('Partei', back_populates='erststimmen')
    partei_id = Column(Integer, ForeignKey('partei.id'), nullable=False)

class Zweitstimme(Base):
    __tablename__ = 'zweitstimme'

    id = Column(Integer, primary_key=True, index=True)

    # Relations
    wahlkreis = relationship('Wahlkreis', back_populates='zweitstimmen')
    wahlkreis_id = Column(Integer, ForeignKey('wahlkreis.id'), nullable=False)
    partei = relationship('Partei', back_populates='zweitstimmen')
    partei_id = Column(Integer, ForeignKey('partei.id'), nullable=False)

class Partei(Base):
    __tablename__ = 'partei'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)

    # Relations
    erststimmen = relationship('Erststimme', back_populates="partei")
    zweitstimmen = relationship('Zweitstimme', back_populates='partei')



class Wahlkreis(Base):
    __tablename__ = 'wahlkreis'

    id = Column(Integer, primary_key=True, index=True)

    # Relations
    erststimmen = relationship('Erststimme', back_populates='wahlkreis')
    zweitstimmen = relationship('Zweitstimme', back_populates='wahlkreis')
    bundesland = relationship('Bundesland', back_populates='wahlkreise')
    bundesland_id = Column(Integer, ForeignKey('bundesland.id'), nullable=False)

class Bundesland(Base):
    __tablename__ = 'bundesland'

    id = Column(Integer, primary_key=True, index=True)

    # Relations
    wahlkreise = relationship('Wahlkreis', back_populates='bundesland')