from pydantic import BaseModel, StrictInt, StrictStr, Field
from typing import ClassVar, List, Dict, Any
import json
import pprint

class Bundesland(BaseModel):
    id: StrictInt
    name: StrictStr

    model_config = {
        "populate_by_name": True,
        "validate_assignment": True,
        "protected_namespaces": (),
    }

    __properties: ClassVar[List[str]] = ["id", "name", "var_date"]

    def to_str(self) -> str:
        """Returns the string representation of the model using alias"""
        return pprint.pformat(self.model_dump(by_alias=True))

    def to_json(self) -> str:
        """Returns the JSON representation of the model using alias"""
        return json.dumps(self.to_dict())

    @classmethod
    def from_json(cls, json_str: str) -> "Bundesland":
        """Create an instance of Wahl from a JSON string"""
        return cls.from_dict(json.loads(json_str))

    def to_dict(self) -> Dict[str, Any]:
        """Return the dictionary representation of the model using alias."""
        _dict = self.model_dump(
            by_alias=True,
            exclude_none=True,  # Exclude fields that are None
        )
        return _dict

    @classmethod
    def from_dict(cls, obj: Dict) -> "Bundesland":
        """Create an instance of Wahl from a dict"""
        if obj is None:
            return None

        if not isinstance(obj, dict):
            return cls.model_validate(obj)

        _obj = cls.model_validate({
            "id": obj.get("id"),
            "name": obj.get("name"),
        })
        return _obj
