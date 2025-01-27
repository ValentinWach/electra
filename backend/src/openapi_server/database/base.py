from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import registry

# Create the registry
mapper_registry = registry()

# Create the Base class
Base = declarative_base()

# Import all models here to ensure they're registered
from openapi_server.database.models import (
    Wahl, Wahlkreis, Bundesland, Erststimme, ErststimmeTest,
    Zweitstimme, ZweitstimmeTest, Partei, einwohner_pro_bundesland_temp,
    Kandidat, Wahlkreiskandidatur, Listenkandidatur, Strukturdatum, Token
)

# This ensures all models are registered with the Base
__all__ = [
    'Base',
    'Wahl', 'Wahlkreis', 'Bundesland', 'Erststimme', 'ErststimmeTest',
    'Zweitstimme', 'ZweitstimmeTest', 'Partei', 'einwohner_pro_bundesland_temp',
    'Kandidat', 'Wahlkreiskandidatur', 'Listenkandidatur', 'Strukturdatum', 'Token'
]