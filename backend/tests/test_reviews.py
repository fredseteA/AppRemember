from unittest.mock import MagicMock


def auth_headers():
    return {"Authorization": "Bearer fake-token"}


def admin_headers():
    return {"Authorization": "Bearer fake-admin-token"}


def make_review_dict(review_id="rev-123", user_id="uid-123", approved=False):
    return {
        "id": review_id,
        "user_id": user_id,
        "user_name": "Test User",
        "user_email": "user@test.com",
        "user_photo_url": None,
        "rating": 5,
        "title": "Excelente!",
        "comment": "Muito bom o serviço.",
        "approved": approved,
        "created_at": "2024-01-01T00:00:00+00:00",
    }


def make_user_dict(uid="uid-123"):
    return {
        "firebase_uid": uid,
        "email": "user@test.com",
        "name": "Test User",
        "role": "user",
        "photo_url": None,
        "created_at": "2024-01-01T00:00:00+00:00",
        "updated_at": "2024-01-01T00:00:00+00:00",
    }


# ── POST /reviews ─────────────────────────────────────────────────────────────

def test_criar_review_com_sucesso(client, mock_db, mock_verify_token):
    # Sem review existente
    mock_db["reviews"].where.return_value.limit.return_value.stream.return_value = iter([])

    user_doc = MagicMock()
    user_doc.exists = True
    user_doc.to_dict.return_value = make_user_dict()
    mock_db["users"].document.return_value.get.return_value = user_doc

    response = client.post(
        "/api/reviews",
        json={"rating": 5, "title": "Ótimo!", "comment": "Serviço excelente."},
        headers=auth_headers(),
    )
    assert response.status_code == 200
    assert response.json()["rating"] == 5
    assert response.json()["approved"] is False


def test_criar_segunda_review_retorna_400(client, mock_db, mock_verify_token):
    existing_doc = MagicMock()
    existing_doc.to_dict.return_value = make_review_dict()
    mock_db["reviews"].where.return_value.limit.return_value.stream.return_value = iter([existing_doc])

    response = client.post(
        "/api/reviews",
        json={"rating": 4, "title": "Segunda avaliação", "comment": "Boa."},
        headers=auth_headers(),
    )
    assert response.status_code == 400


def test_criar_review_usuario_nao_encontrado_retorna_404(client, mock_db, mock_verify_token):
    mock_db["reviews"].where.return_value.limit.return_value.stream.return_value = iter([])

    user_doc = MagicMock()
    user_doc.exists = False
    mock_db["users"].document.return_value.get.return_value = user_doc

    response = client.post(
        "/api/reviews",
        json={"rating": 5, "title": "Ótimo!", "comment": "Serviço excelente."},
        headers=auth_headers(),
    )
    assert response.status_code == 404


# ── GET /reviews ──────────────────────────────────────────────────────────────

def test_get_reviews_retorna_so_aprovadas(client, mock_db):
    doc_aprovada = MagicMock()
    doc_aprovada.to_dict.return_value = make_review_dict(approved=True)
    mock_db["reviews"].where.return_value.order_by.return_value.stream.return_value = iter([doc_aprovada])

    response = client.get("/api/reviews")
    assert response.status_code == 200
    reviews = response.json()
    assert len(reviews) == 1
    assert all(r.get("approved") is not False for r in reviews)


def test_get_reviews_nao_expoe_email_usuario(client, mock_db):
    doc = MagicMock()
    review = make_review_dict(approved=True)
    doc.to_dict.return_value = review
    mock_db["reviews"].where.return_value.order_by.return_value.stream.return_value = iter([doc])

    response = client.get("/api/reviews")
    for r in response.json():
        assert "user_email" not in r


# ── GET /reviews/my ───────────────────────────────────────────────────────────

def test_get_my_review_existente(client, mock_db, mock_verify_token):
    doc = MagicMock()
    doc.to_dict.return_value = make_review_dict(user_id="uid-123")
    mock_db["reviews"].where.return_value.limit.return_value.stream.return_value = iter([doc])

    response = client.get("/api/reviews/my", headers=auth_headers())
    assert response.status_code == 200
    assert response.json()["user_id"] == "uid-123"


def test_get_my_review_inexistente_retorna_none(client, mock_db, mock_verify_token):
    mock_db["reviews"].where.return_value.limit.return_value.stream.return_value = iter([])

    response = client.get("/api/reviews/my", headers=auth_headers())
    assert response.status_code == 200
    assert response.json() is None


# ── GET /admin/reviews ────────────────────────────────────────────────────────

def test_admin_get_all_reviews(client, mock_db, mock_verify_admin):
    doc_ap = MagicMock()
    doc_ap.to_dict.return_value = make_review_dict(review_id="rev-1", approved=True)
    doc_pen = MagicMock()
    doc_pen.to_dict.return_value = make_review_dict(review_id="rev-2", approved=False)
    mock_db["reviews"].order_by.return_value.stream.return_value = iter([doc_ap, doc_pen])

    response = client.get("/api/admin/reviews", headers=admin_headers())
    assert response.status_code == 200
    assert len(response.json()) == 2


# ── PUT /admin/reviews/{id}/approve ──────────────────────────────────────────

def test_approve_review_com_sucesso(client, mock_db, mock_verify_admin):
    doc = MagicMock()
    doc.exists = True
    mock_db["reviews"].document.return_value.get.return_value = doc

    log_doc = MagicMock()
    mock_db["admin_logs"].document.return_value = log_doc

    response = client.put("/api/admin/reviews/rev-123/approve", headers=admin_headers())
    assert response.status_code == 200
    assert "aprovada" in response.json()["message"].lower()


def test_approve_review_nao_encontrada_retorna_404(client, mock_db, mock_verify_admin):
    doc = MagicMock()
    doc.exists = False
    mock_db["reviews"].document.return_value.get.return_value = doc

    response = client.put("/api/admin/reviews/nao-existe/approve", headers=admin_headers())
    assert response.status_code == 404


# ── PUT /admin/reviews/{id}/reject ───────────────────────────────────────────

def test_reject_review_com_sucesso(client, mock_db, mock_verify_admin):
    doc = MagicMock()
    doc.exists = True
    mock_db["reviews"].document.return_value.get.return_value = doc

    log_doc = MagicMock()
    mock_db["admin_logs"].document.return_value = log_doc

    response = client.put("/api/admin/reviews/rev-123/reject", headers=admin_headers())
    assert response.status_code == 200


# ── POST /admin/reviews/{id}/respond ─────────────────────────────────────────

def test_respond_review_com_sucesso(client, mock_db, mock_verify_admin):
    doc = MagicMock()
    doc.exists = True
    mock_db["reviews"].document.return_value.get.return_value = doc

    log_doc = MagicMock()
    mock_db["admin_logs"].document.return_value = log_doc

    response = client.post(
        "/api/admin/reviews/rev-123/respond",
        json={"response": "Obrigado pelo feedback!"},
        headers=admin_headers(),
    )
    assert response.status_code == 200


# ── DELETE /admin/reviews/{id} ────────────────────────────────────────────────

def test_delete_review_com_sucesso(client, mock_db, mock_verify_admin):
    doc = MagicMock()
    doc.exists = True
    mock_db["reviews"].document.return_value.get.return_value = doc

    log_doc = MagicMock()
    mock_db["admin_logs"].document.return_value = log_doc

    response = client.delete("/api/admin/reviews/rev-123", headers=admin_headers())
    assert response.status_code == 200
    assert "excluída" in response.json()["message"].lower()


def test_delete_review_nao_encontrada_retorna_404(client, mock_db, mock_verify_admin):
    doc = MagicMock()
    doc.exists = False
    mock_db["reviews"].document.return_value.get.return_value = doc

    response = client.delete("/api/admin/reviews/nao-existe", headers=admin_headers())
    assert response.status_code == 404
