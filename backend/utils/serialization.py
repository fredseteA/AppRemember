from datetime import datetime
from typing import Any, List


def serialize_datetime(data: Any) -> Any:
    if isinstance(data, datetime):
        return data.isoformat()
    elif isinstance(data, dict):
        return {key: serialize_datetime(value) for key, value in data.items()}
    elif isinstance(data, list):
        return [serialize_datetime(item) for item in data]
    return data


def deserialize_datetime(data: dict, datetime_fields: List[str]) -> dict:
    if not data:
        return data
    result = data.copy()
    for field in datetime_fields:
        if field in result and isinstance(result[field], str):
            try:
                result[field] = datetime.fromisoformat(result[field].replace('Z', '+00:00'))
            except (ValueError, AttributeError):
                pass
    return result