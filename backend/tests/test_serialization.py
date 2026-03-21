from datetime import datetime, timezone
from utils.serialization import serialize_datetime, deserialize_datetime


def test_serializa_datetime_para_string():
    dt     = datetime(2024, 1, 15, 10, 30, 0, tzinfo=timezone.utc)
    result = serialize_datetime(dt)
    assert isinstance(result, str)
    assert "2024-01-15" in result


def test_serializa_dict_com_datetime():
    dt     = datetime(2024, 1, 15, tzinfo=timezone.utc)
    result = serialize_datetime({"created_at": dt, "name": "test"})
    assert isinstance(result["created_at"], str)
    assert result["name"] == "test"


def test_serializa_lista_com_datetime():
    dt     = datetime(2024, 1, 15, tzinfo=timezone.utc)
    result = serialize_datetime([dt, "texto", 42])
    assert isinstance(result[0], str)
    assert result[1] == "texto"
    assert result[2] == 42


def test_serializa_valor_simples_sem_alterar():
    assert serialize_datetime("texto") == "texto"
    assert serialize_datetime(42) == 42
    assert serialize_datetime(None) is None


def test_deserializa_string_para_datetime():
    data   = {"created_at": "2024-01-15T10:30:00+00:00"}
    result = deserialize_datetime(data, ["created_at"])
    assert isinstance(result["created_at"], datetime)


def test_deserializa_ignora_campos_nao_listados():
    data   = {"created_at": "2024-01-15T10:30:00+00:00", "name": "test"}
    result = deserialize_datetime(data, ["created_at"])
    assert result["name"] == "test"


def test_deserializa_data_none_retorna_sem_erro():
    result = deserialize_datetime(None, ["created_at"])
    assert result is None