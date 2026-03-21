from unittest.mock import MagicMock, patch


def auth_headers():
    return {"Authorization": "Bearer fake-token"}


def make_memorial_dict(memorial_id="mem-123", user_id="uid-123"):
    return {
        "id": memorial_id,
        "user_id": user_id,
        "slug": "joao-silva",
        "status": "draft",
        "person_data": {
            "full_name": "João Silva",
            "relationship": "Pai",
            "birth_city": "Campos",
            "birth_state": "RJ",
            "death_city": "Campos",
            "death_state": "RJ",
            "public_memorial": False,
        },
        "content": {"main_phrase": "Paz", "biography": "Vida.", "gallery_urls": []},
        "responsible": {"name": "Maria", "phone": "22999999999", "email": "maria@test.com"},
        "created_at": "2024-01-01T00:00:00+00:00",
        "updated_at": "2024-01-01T00:00:00+00:00",
    }


def make_payment_dict(payment_id="pay-123", user_id="uid-123", status="pending"):
    return {
        "id": payment_id,
        "memorial_id": "mem-123",
        "user_id": user_id,
        "user_email": "user@test.com",
        "plan_type": "digital",
        "amount": 29.90,
        "original_amount": 29.90,
        "final_amount": 29.90,
        "discount_amount": 0.0,
        "status": status,
        "supporter_code": None,
        "commission_amount": 0.0,
        "commission_status": None,
        "mercadopago_payment_id": None,
        "cancel_requested": False,
        "created_at": "2024-01-01T00:00:00+00:00",
        "updated_at": "2024-01-01T00:00:00+00:00",
    }


def make_checkout_payload(plan_type="digital", delivery_address=None, supporter_code=None):
    payload = {
        "memorial_id": "mem-123",
        "plan_type": plan_type,
        "transaction_amount": 29.90,
        "description": "Plano Digital",
        "payer_email": "user@test.com",
        "payment_method_id": "pix",
    }
    if supporter_code:
        payload["supporter_code"] = supporter_code
    if delivery_address:
        payload["delivery_address"] = delivery_address
    return payload


def make_delivery_address():
    return {
        "recipient_name": "Fulano",
        "phone": "22999999999",
        "zip_code": "28000-000",
        "street": "Rua Teste",
        "number": "10",
        "neighborhood": "Centro",
        "city": "Campos",
        "state": "RJ",
    }


# ── POST /payments/create-checkout ────────────────────────────────────────────

def test_checkout_digital_sem_codigo(client, mock_db, mock_verify_token, mock_mp_sdk):
    mem_doc = MagicMock()
    mem_doc.exists = True
    mem_doc.to_dict.return_value = make_memorial_dict()
    mock_db["memorials"].document.return_value.get.return_value = mem_doc

    mock_mp_sdk["preference_create"].return_value = {
        "status": 201,
        "response": {"id": "pref-123", "init_point": "https://mp.com/checkout"},
    }

    response = client.post(
        "/api/payments/create-checkout",
        json=make_checkout_payload(),
        headers=auth_headers(),
    )
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert "checkout_url" in response.json()


def test_checkout_memorial_nao_encontrado_retorna_404(client, mock_db, mock_verify_token):
    mem_doc = MagicMock()
    mem_doc.exists = False
    mock_db["memorials"].document.return_value.get.return_value = mem_doc

    response = client.post(
        "/api/payments/create-checkout",
        json=make_checkout_payload(),
        headers=auth_headers(),
    )
    assert response.status_code == 404


def test_checkout_plano_fisico_sem_endereco_retorna_422(client, mock_db, mock_verify_token, mock_mp_sdk):
    mem_doc = MagicMock()
    mem_doc.exists = True
    mem_doc.to_dict.return_value = make_memorial_dict()
    mock_db["memorials"].document.return_value.get.return_value = mem_doc

    response = client.post(
        "/api/payments/create-checkout",
        json=make_checkout_payload(plan_type="plaque"),
        headers=auth_headers(),
    )
    assert response.status_code == 422


def test_checkout_plano_fisico_com_endereco(client, mock_db, mock_verify_token, mock_mp_sdk):
    mem_doc = MagicMock()
    mem_doc.exists = True
    mem_doc.to_dict.return_value = make_memorial_dict()
    mock_db["memorials"].document.return_value.get.return_value = mem_doc

    mock_mp_sdk["preference_create"].return_value = {
        "status": 201,
        "response": {"id": "pref-123", "init_point": "https://mp.com/checkout"},
    }

    response = client.post(
        "/api/payments/create-checkout",
        json=make_checkout_payload(plan_type="plaque", delivery_address=make_delivery_address()),
        headers=auth_headers(),
    )
    assert response.status_code == 200
    assert response.json()["success"] is True


def test_checkout_com_codigo_valido_aplica_desconto(client, mock_db, mock_verify_token, mock_mp_sdk):
    mem_doc = MagicMock()
    mem_doc.exists = True
    mem_doc.to_dict.return_value = make_memorial_dict()
    mock_db["memorials"].document.return_value.get.return_value = mem_doc

    partner_doc = MagicMock()
    partner_doc.to_dict.return_value = {
        "id": "partner-1", "name": "João", "supporter_code": "JOAO2024",
        "commission_rate": 0.10, "status": "active", "email": "joao@test.com",
    }
    mock_db["partners"].limit.return_value.stream.return_value = iter([partner_doc])

    mock_mp_sdk["preference_create"].return_value = {
        "status": 201,
        "response": {"id": "pref-123", "init_point": "https://mp.com/checkout"},
    }

    response = client.post(
        "/api/payments/create-checkout",
        json=make_checkout_payload(supporter_code="JOAO2024"),
        headers=auth_headers(),
    )
    assert response.status_code == 200
    assert response.json()["discount_applied"] is True


def test_checkout_com_codigo_invalido_retorna_400(client, mock_db, mock_verify_token):
    mem_doc = MagicMock()
    mem_doc.exists = True
    mem_doc.to_dict.return_value = make_memorial_dict()
    mock_db["memorials"].document.return_value.get.return_value = mem_doc

    mock_db["partners"].where.return_value.where.return_value.limit.return_value.stream.return_value = iter([])

    response = client.post(
        "/api/payments/create-checkout",
        json=make_checkout_payload(supporter_code="INVALIDO"),
        headers=auth_headers(),
    )
    assert response.status_code == 400


# ── GET /payments/my ──────────────────────────────────────────────────────────

def test_get_my_payments_retorna_lista(client, mock_db, mock_verify_token):
    doc_mock = MagicMock()
    doc_mock.to_dict.return_value = make_payment_dict()
    mock_db["payments"].where.return_value.stream.return_value = iter([doc_mock])

    response = client.get("/api/payments/my", headers=auth_headers())
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) == 1


# ── POST /payments/confirm ────────────────────────────────────────────────────

def test_confirm_payment_aprova_e_publica_memorial(client, mock_db, mock_verify_token, mock_mp_sdk):
    pay_doc = MagicMock()
    pay_doc.exists = True
    pay_doc.to_dict.return_value = make_payment_dict(user_id="uid-123", status="pending")
    mock_db["payments"].document.return_value.get.return_value = pay_doc

    mem_doc = MagicMock()
    mem_doc.exists = True
    mem_doc.to_dict.return_value = make_memorial_dict()
    mock_db["memorials"].document.return_value.get.return_value = mem_doc

    mock_db["memorials"].where.return_value.limit.return_value.stream.return_value = iter([])

    response = client.post(
        "/api/payments/confirm",
        json={"payment_id": "pay-123"},
        headers=auth_headers(),
    )
    assert response.status_code == 200
    assert response.json()["status"] == "approved"


def test_confirm_payment_idempotente_ja_aprovado(client, mock_db, mock_verify_token):
    pay_doc = MagicMock()
    pay_doc.exists = True
    pay_doc.to_dict.return_value = make_payment_dict(user_id="uid-123", status="approved")
    mock_db["payments"].document.return_value.get.return_value = pay_doc

    response = client.post(
        "/api/payments/confirm",
        json={"payment_id": "pay-123"},
        headers=auth_headers(),
    )
    assert response.status_code == 200
    assert response.json()["memorial_published"] is False


def test_confirm_payment_outro_usuario_retorna_403(client, mock_db, mock_verify_token):
    pay_doc = MagicMock()
    pay_doc.exists = True
    pay_doc.to_dict.return_value = make_payment_dict(user_id="outro-uid", status="pending")
    mock_db["payments"].document.return_value.get.return_value = pay_doc

    response = client.post(
        "/api/payments/confirm",
        json={"payment_id": "pay-123"},
        headers=auth_headers(),
    )
    assert response.status_code == 403


def test_confirm_payment_nao_encontrado_retorna_404(client, mock_db, mock_verify_token):
    pay_doc = MagicMock()
    pay_doc.exists = False
    mock_db["payments"].document.return_value.get.return_value = pay_doc

    response = client.post(
        "/api/payments/confirm",
        json={"payment_id": "nao-existe"},
        headers=auth_headers(),
    )
    assert response.status_code == 404


# ── POST /payments/{id}/request-cancel ───────────────────────────────────────

def test_request_cancel_dentro_do_prazo(client, mock_db, mock_verify_token):
    from datetime import datetime, timezone
    pay_data = make_payment_dict(user_id="uid-123", status="approved")
    pay_data["created_at"] = datetime.now(timezone.utc).isoformat()

    pay_doc = MagicMock()
    pay_doc.exists = True
    pay_doc.to_dict.return_value = pay_data
    mock_db["payments"].document.return_value.get.return_value = pay_doc

    mem_doc = MagicMock()
    mem_doc.exists = True
    mem_doc.to_dict.return_value = make_memorial_dict()
    mock_db["memorials"].document.return_value.get.return_value = mem_doc

    response = client.post("/api/payments/pay-123/request-cancel", headers=auth_headers())
    assert response.status_code == 200


def test_request_cancel_fora_do_prazo_retorna_400(client, mock_db, mock_verify_token):
    pay_data = make_payment_dict(user_id="uid-123", status="approved")
    pay_data["created_at"] = "2020-01-01T00:00:00+00:00"

    pay_doc = MagicMock()
    pay_doc.exists = True
    pay_doc.to_dict.return_value = pay_data
    mock_db["payments"].document.return_value.get.return_value = pay_doc

    response = client.post("/api/payments/pay-123/request-cancel", headers=auth_headers())
    assert response.status_code == 400


def test_request_cancel_ja_solicitado_retorna_400(client, mock_db, mock_verify_token):
    from datetime import datetime, timezone
    pay_data = make_payment_dict(user_id="uid-123", status="approved")
    pay_data["created_at"] = datetime.now(timezone.utc).isoformat()
    pay_data["cancel_requested"] = True

    pay_doc = MagicMock()
    pay_doc.exists = True
    pay_doc.to_dict.return_value = pay_data
    mock_db["payments"].document.return_value.get.return_value = pay_doc

    response = client.post("/api/payments/pay-123/request-cancel", headers=auth_headers())
    assert response.status_code == 400


def test_request_cancel_pedido_entregue_retorna_400(client, mock_db, mock_verify_token):
    from datetime import datetime, timezone
    pay_data = make_payment_dict(user_id="uid-123", status="entregue")
    pay_data["created_at"] = datetime.now(timezone.utc).isoformat()

    pay_doc = MagicMock()
    pay_doc.exists = True
    pay_doc.to_dict.return_value = pay_data
    mock_db["payments"].document.return_value.get.return_value = pay_doc

    response = client.post("/api/payments/pay-123/request-cancel", headers=auth_headers())
    assert response.status_code == 400


# ── POST /webhooks/mercadopago ────────────────────────────────────────────────

def test_webhook_payment_approved(client, mock_db, mock_mp_sdk):
    mock_mp_sdk["payment_get"].return_value = {
        "status": 200,
        "response": {
            "status": "approved",
            "external_reference": "pay-123",
        },
    }

    pay_doc = MagicMock()
    pay_doc.exists = True
    pay_doc.to_dict.return_value = make_payment_dict(status="pending")
    mock_db["payments"].document.return_value.get.return_value = pay_doc

    mem_doc = MagicMock()
    mem_doc.exists = True
    mem_doc.to_dict.return_value = make_memorial_dict()
    mock_db["memorials"].document.return_value.get.return_value = mem_doc

    mock_db["memorials"].where.return_value.limit.return_value.stream.return_value = iter([])

    payload = {"type": "payment", "data": {"id": "mp-pay-456"}}
    response = client.post("/api/webhooks/mercadopago", json=payload)
    assert response.status_code == 200
    assert response.json()["status"] == "success"


def test_webhook_payment_rejected(client, mock_db, mock_mp_sdk):
    mock_mp_sdk["payment_get"].return_value = {
        "status": 200,
        "response": {
            "status": "rejected",
            "external_reference": "pay-123",
        },
    }

    pay_doc = MagicMock()
    pay_doc.exists = True
    pay_doc.to_dict.return_value = make_payment_dict(status="pending")
    mock_db["payments"].document.return_value.get.return_value = pay_doc

    payload = {"type": "payment", "data": {"id": "mp-pay-456"}}
    response = client.post("/api/webhooks/mercadopago", json=payload)
    assert response.status_code == 200


def test_webhook_tipo_desconhecido_retorna_success(client):
    payload = {"type": "merchant_order", "data": {"id": "123"}}
    response = client.post("/api/webhooks/mercadopago", json=payload)
    assert response.status_code == 200
    assert response.json()["status"] == "success"
