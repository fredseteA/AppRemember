from unittest.mock import MagicMock


def auth_headers():
    return {"Authorization": "Bearer fake-token"}


def make_memorial_dict(
    memorial_id="mem-123",
    user_id="uid-123",
    status="draft",
    public_memorial=True,
    active=True,
):
    return {
        "id": memorial_id,
        "user_id": user_id,
        "slug": "joao-silva",
        "display_name": "João Silva — Pai — 2024",
        "status": status,
        "plan_type": None,
        "qr_code_url": None,
        "active": active,
        "person_data": {
            "full_name": "João Silva",
            "relationship": "Pai",
            "birth_city": "Campos",
            "birth_state": "RJ",
            "death_city": "Campos",
            "death_state": "RJ",
            "birth_date": "1940-01-01",
            "death_date": "2020-01-01",
            "photo_url": None,
            "public_memorial": public_memorial,
        },
        "content": {
            "main_phrase": "Sempre em nossos corações",
            "biography": "Uma vida dedicada à família.",
            "gallery_urls": [],
            "audio_url": None,
        },
        "responsible": {
            "name": "Maria Silva",
            "phone": "22999999999",
            "email": "maria@test.com",
        },
        "created_at": "2024-01-01T00:00:00+00:00",
        "updated_at": "2024-01-01T00:00:00+00:00",
    }


def make_create_payload():
    return {
        "person_data": {
            "full_name": "João Silva",
            "relationship": "Pai",
            "birth_city": "Campos",
            "birth_state": "RJ",
            "death_city": "Campos",
            "death_state": "RJ",
            "public_memorial": False,
        },
        "content": {
            "main_phrase": "Sempre em nossos corações",
            "biography": "Uma vida dedicada à família.",
            "gallery_urls": [],
        },
        "responsible": {
            "name": "Maria Silva",
            "phone": "22999999999",
            "email": "maria@test.com",
        },
    }


# ── POST /memorials ───────────────────────────────────────────────────────────

def test_criar_memorial_retorna_201(client, mock_db, mock_verify_token):
    # Slug query retorna lista vazia (slug disponível)
    mock_db["memorials"].where.return_value.limit.return_value.stream.return_value = iter([])

    response = client.post("/api/memorials", json=make_create_payload(), headers=auth_headers())
    assert response.status_code == 200
    data = response.json()
    assert data["person_data"]["full_name"] == "João Silva"
    assert data["status"] == "draft"
    assert "slug" in data


# ── GET /memorials/my ─────────────────────────────────────────────────────────

def test_get_my_memorials_retorna_lista(client, mock_db, mock_verify_token):
    doc_mock = MagicMock()
    doc_mock.to_dict.return_value = make_memorial_dict()
    mock_db["memorials"].where.return_value.stream.return_value = iter([doc_mock])

    response = client.get("/api/memorials/my", headers=auth_headers())
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) == 1


def test_get_my_memorials_esconde_desativados(client, mock_db, mock_verify_token):
    doc_mock = MagicMock()
    doc_mock.to_dict.return_value = make_memorial_dict(active=False)
    mock_db["memorials"].where.return_value.stream.return_value = iter([doc_mock])

    response = client.get("/api/memorials/my", headers=auth_headers())
    assert response.status_code == 200
    assert len(response.json()) == 0


# ── GET /memorials/explore ────────────────────────────────────────────────────

def test_explore_retorna_so_publicados_e_publicos(client, mock_db):
    doc_mock = MagicMock()
    doc_mock.to_dict.return_value = make_memorial_dict(status="published", public_memorial=True)
    mock_db["memorials"].where.return_value.stream.return_value = iter([doc_mock])

    response = client.get("/api/memorials/explore")
    assert response.status_code == 200
    assert len(response.json()) == 1


def test_explore_nao_retorna_memorial_privado(client, mock_db):
    doc_mock = MagicMock()
    doc_mock.to_dict.return_value = make_memorial_dict(status="published", public_memorial=False)
    mock_db["memorials"].where.return_value.stream.return_value = iter([doc_mock])

    response = client.get("/api/memorials/explore")
    assert response.status_code == 200
    assert len(response.json()) == 0


def test_explore_nao_retorna_desativados(client, mock_db):
    doc_mock = MagicMock()
    doc_mock.to_dict.return_value = make_memorial_dict(status="published", public_memorial=True, active=False)
    mock_db["memorials"].where.return_value.stream.return_value = iter([doc_mock])

    response = client.get("/api/memorials/explore")
    assert response.status_code == 200
    assert len(response.json()) == 0


# ── GET /memorials/by-slug/{slug} ─────────────────────────────────────────────

def test_get_by_slug_encontrado(client, mock_db):
    doc_mock = MagicMock()
    doc_mock.to_dict.return_value = make_memorial_dict()
    mock_db["memorials"].where.return_value.limit.return_value.stream.return_value = iter([doc_mock])

    response = client.get("/api/memorials/by-slug/joao-silva")
    assert response.status_code == 200
    assert response.json()["slug"] == "joao-silva"


def test_get_by_slug_nao_encontrado(client, mock_db):
    mock_db["memorials"].where.return_value.limit.return_value.stream.return_value = iter([])

    response = client.get("/api/memorials/by-slug/nao-existe")
    assert response.status_code == 404


# ── GET /memorials/{id} ───────────────────────────────────────────────────────

def test_get_memorial_por_id(client, mock_db):
    doc_mock = MagicMock()
    doc_mock.exists = True
    doc_mock.to_dict.return_value = make_memorial_dict()
    mock_db["memorials"].document.return_value.get.return_value = doc_mock

    response = client.get("/api/memorials/mem-123")
    assert response.status_code == 200


def test_get_memorial_nao_encontrado(client, mock_db):
    doc_mock = MagicMock()
    doc_mock.exists = False
    mock_db["memorials"].document.return_value.get.return_value = doc_mock
    mock_db["memorials"].where.return_value.limit.return_value.stream.return_value = iter([])

    response = client.get("/api/memorials/nao-existe")
    assert response.status_code == 404


# ── PUT /memorials/{id} ───────────────────────────────────────────────────────

def test_update_memorial_pelo_dono(client, mock_db, mock_verify_token):
    doc_mock = MagicMock()
    doc_mock.exists = True
    doc_mock.to_dict.return_value = make_memorial_dict(user_id="uid-123")
    mock_db["memorials"].document.return_value.get.return_value = doc_mock

    response = client.put(
        "/api/memorials/mem-123",
        json={"person_data": {"full_name": "João Atualizado", "relationship": "Pai",
                               "birth_city": "RJ", "birth_state": "RJ",
                               "death_city": "RJ", "death_state": "RJ"}},
        headers=auth_headers(),
    )
    assert response.status_code == 200


def test_update_memorial_outro_usuario_retorna_403(client, mock_db, mock_verify_token):
    doc_mock = MagicMock()
    doc_mock.exists = True
    doc_mock.to_dict.return_value = make_memorial_dict(user_id="outro-uid")
    mock_db["memorials"].document.return_value.get.return_value = doc_mock

    response = client.put(
        "/api/memorials/mem-123",
        json={"person_data": {"full_name": "X", "relationship": "X",
                               "birth_city": "X", "birth_state": "X",
                               "death_city": "X", "death_state": "X"}},
        headers=auth_headers(),
    )
    assert response.status_code == 403


# ── DELETE /memorials/{id} ────────────────────────────────────────────────────

def test_delete_memorial_rascunho(client, mock_db, mock_verify_token):
    doc_mock = MagicMock()
    doc_mock.exists = True
    doc_mock.to_dict.return_value = make_memorial_dict(user_id="uid-123", status="draft")
    mock_db["memorials"].document.return_value.get.return_value = doc_mock

    response = client.delete("/api/memorials/mem-123", headers=auth_headers())
    assert response.status_code == 200
    assert response.json()["message"] == "Memorial deleted successfully"


def test_delete_memorial_publicado_retorna_400(client, mock_db, mock_verify_token):
    doc_mock = MagicMock()
    doc_mock.exists = True
    doc_mock.to_dict.return_value = make_memorial_dict(user_id="uid-123", status="published")
    mock_db["memorials"].document.return_value.get.return_value = doc_mock

    response = client.delete("/api/memorials/mem-123", headers=auth_headers())
    assert response.status_code == 400


def test_delete_memorial_outro_usuario_retorna_403(client, mock_db, mock_verify_token):
    doc_mock = MagicMock()
    doc_mock.exists = True
    doc_mock.to_dict.return_value = make_memorial_dict(user_id="outro-uid", status="draft")
    mock_db["memorials"].document.return_value.get.return_value = doc_mock

    response = client.delete("/api/memorials/mem-123", headers=auth_headers())
    assert response.status_code == 403


def test_delete_memorial_nao_encontrado_retorna_404(client, mock_db, mock_verify_token):
    doc_mock = MagicMock()
    doc_mock.exists = False
    mock_db["memorials"].document.return_value.get.return_value = doc_mock

    response = client.delete("/api/memorials/nao-existe", headers=auth_headers())
    assert response.status_code == 404
