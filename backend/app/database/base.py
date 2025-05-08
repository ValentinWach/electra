from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import registry

# Create the registry
mapper_registry = registry()

# Create the Base class
Base = declarative_base()

# Export Base
__all__ = ['Base']