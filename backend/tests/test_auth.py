from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient


# ── Helpers ──────────────────────────────────────────────────────────────────

def make_user_dict(uid="uid-123", email="user@test.com", name="Test User"):
    return {
        "firebase_uid": uid,
        "email": email,
        "name": name,
        "phone": None,
        "cpf": None,
        "birth_date": None,
        "role": "user",
        "delivery_address": None,
        "created_at": "2024-01-01T00:00:00+00:00",
        "updated_at": "2024-01-01T00:00:00+00:00",
    }


def auth_headers():
    return {"Authorization": "Bearer fake-token"}


# ── POST /auth/register ───────────────────────────────────────────────────────

def test_register_cria_novo_usuario(client, mock_db):
    doc_mock = MagicMock()
    doc_mock.exists = False
    mock_db["users"].document.return_value.get.return_value = doc_mock

    payload = {
        "firebase_uid": "uid-novo",
        "email": "novo@test.com",
        "name": "Novo Usuario",
        "role": "user",
        "created_at": "2024-01-01T00:00:00+00:00",
        "updated_at": "2024-01-01T00:00:00+00:00",
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 200


def test_register_retorna_usuario_existente(client, mock_db):
    doc_mock = MagicMock()
    doc_mock.exists = True
    doc_mock.to_dict.return_value = make_user_dict()
    mock_db["users"].document.return_value.get.return_value = doc_mock

    payload = {
        "firebase_uid": "uid-123",
        "email": "user@test.com",
        "name": "Test User",
        "role": "user",
        "created_at": "2024-01-01T00:00:00+00:00",
        "updated_at": "2024-01-01T00:00:00+00:00",
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 200
    assert response.json()["email"] == "user@test.com"


# ── GET /auth/me ──────────────────────────────────────────────────────────────

def test_get_me_retorna_usuario(client, mock_db, mock_verify_token):
    doc_mock = MagicMock()
    doc_mock.exists = True
    doc_mock.to_dict.return_value = make_user_dict()
    mock_db["users"].document.return_value.get.return_value = doc_mock

    response = client.get("/api/auth/me", headers=auth_headers())
    assert response.status_code == 200
    assert response.json()["email"] == "user@test.com"


def test_get_me_sem_token_retorna_401(client):
    response = client.get("/api/auth/me")
    assert response.status_code == 401


def test_get_me_usuario_nao_encontrado_retorna_404(client, mock_db, mock_verify_token):
    doc_mock = MagicMock()
    doc_mock.exists = False
    mock_db["users"].document.return_value.get.return_value = doc_mock

    response = client.get("/api/auth/me", headers=auth_headers())
    assert response.status_code == 404


# ── PUT /auth/me ──────────────────────────────────────────────────────────────

def test_update_me_atualiza_campos(client, mock_db, mock_verify_token):
    doc_mock = MagicMock()
    doc_mock.exists = True
    updated = make_user_dict(name="Nome Atualizado")
    doc_mock.to_dict.return_value = updated
    mock_db["users"].document.return_value.get.return_value = doc_mock

    response = client.put("/api/auth/me", json={"name": "Nome Atualizado"}, headers=auth_headers())
    assert response.status_code == 200


def test_update_me_usuario_nao_encontrado_retorna_404(client, mock_db, mock_verify_token):
    doc_mock = MagicMock()
    doc_mock.exists = False
    mock_db["users"].document.return_value.get.return_value = doc_mock

    response = client.put("/api/auth/me", json={"name": "X"}, headers=auth_headers())
    assert response.status_code == 404


# ── GET /auth/me/address ──────────────────────────────────────────────────────

def test_get_address_com_endereco(client, mock_db, mock_verify_token):
    address = {
        "recipient_name": "Fulano",
        "phone": "22999999999",
        "zip_code": "28000-000",
        "street": "Rua Teste",
        "number": "10",
        "neighborhood": "Centro",
        "city": "Campos",
        "state": "RJ",
    }
    user_with_address = make_user_dict()
    user_with_address["delivery_address"] = address

    doc_mock = MagicMock()
    doc_mock.exists = True
    doc_mock.to_dict.return_value = user_with_address
    mock_db["users"].document.return_value.get.return_value = doc_mock

    response = client.get("/api/auth/me/address", headers=auth_headers())
    assert response.status_code == 200
    assert response.json()["has_address"] is True


def test_get_address_sem_endereco(client, mock_db, mock_verify_token):
    doc_mock = MagicMock()
    doc_mock.exists = True
    doc_mock.to_dict.return_value = make_user_dict()
    mock_db["users"].document.return_value.get.return_value = doc_mock

    response = client.get("/api/auth/me/address", headers=auth_headers())
    assert response.status_code == 200
    assert response.json()["has_address"] is False


# ── PUT /auth/me/address ──────────────────────────────────────────────────────

def test_update_address_salva_corretamente(client, mock_db, mock_verify_token):
    doc_mock = MagicMock()
    doc_mock.exists = True
    mock_db["users"].document.return_value.get.return_value = doc_mock

    address_payload = {
        "recipient_name": "Fulano",
        "phone": "22999999999",
        "zip_code": "28000-000",
        "street": "Rua Teste",
        "number": "10",
        "neighborhood": "Centro",
        "city": "Campos",
        "state": "RJ",
    }
    response = client.put("/api/auth/me/address", json=address_payload, headers=auth_headers())
    assert response.status_code == 200
    assert response.json()["message"] == "Endereço salvo com sucesso"
