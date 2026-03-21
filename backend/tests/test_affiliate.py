from unittest.mock import MagicMock


def auth_headers():
    return {"Authorization": "Bearer fake-token"}


def make_partner_dict(partner_id="partner-123", code="JOAO2024", uid="uid-123"):
    return {
        "id": partner_id,
        "name": "João Parceiro",
        "email": "joao@test.com",
        "phone": "22999999999",
        "supporter_code": code,
        "code": code,
        "firebase_uid": uid,
        "commission_rate": 0.10,
        "status": "active",
        "created_at": "2024-01-01T00:00:00+00:00",
        "updated_at": "2024-01-01T00:00:00+00:00",
    }


def make_sale_dict(partner_id="partner-123", code="JOAO2024"):
    return {
        "id": "pay-123",
        "memorial_id": "mem-123",
        "user_id": "uid-comprador",
        "user_email": "comprador@test.com",
        "plan_type": "digital",
        "amount": 29.90,
        "final_amount": 29.90,
        "status": "approved",
        "supporter_code": code,
        "partner_id": partner_id,
        "commission_amount": 2.84,
        "commission_status": "pending",
        "created_at": "2024-01-01T00:00:00+00:00",
        "updated_at": "2024-01-01T00:00:00+00:00",
    }


def make_commission_dict(partner_id="partner-123"):
    return {
        "id": "comm-123",
        "order_id": "pay-123",
        "partner_id": partner_id,
        "partner_name": "João Parceiro",
        "supporter_code": "JOAO2024",
        "commission_amount": 2.84,
        "commission_status": "pending",
        "paid_at": None,
        "created_at": "2024-01-01T00:00:00+00:00",
    }


# ── GET /supporters/validate/{code} ──────────────────────────────────────────

def test_validate_codigo_ativo(client, mock_db):
    partner_doc = MagicMock()
    partner_doc.to_dict.return_value = make_partner_dict()
    mock_db["partners"].limit.return_value.stream.return_value = iter([partner_doc])

    response = client.get("/api/supporters/validate/JOAO2024")
    assert response.status_code == 200
    assert response.json()["valid"] is True


def test_validate_codigo_inexistente_retorna_404(client, mock_db):
    mock_db["partners"].where.return_value.where.return_value.limit.return_value.stream.return_value = iter([])

    response = client.get("/api/supporters/validate/INVALIDO")
    assert response.status_code == 404


# ── GET /affiliate/me ─────────────────────────────────────────────────────────

def test_affiliate_me_retorna_parceiro(client, mock_db, mock_verify_affiliate):
    partner_doc = MagicMock()
    partner_doc.id = "partner-123"
    partner_doc.to_dict.return_value = make_partner_dict()
    mock_db["partners"].where.return_value.limit.return_value.stream.return_value = iter([partner_doc])

    response = client.get("/api/affiliate/me", headers=auth_headers())
    assert response.status_code == 200
    assert response.json()["supporter_code"] == "JOAO2024"
    # firebase_uid não deve aparecer na resposta
    assert "firebase_uid" not in response.json()


def test_affiliate_me_sem_parceiro_retorna_404(client, mock_db, mock_verify_affiliate):
    mock_db["partners"].where.return_value.limit.return_value.stream.return_value = iter([])

    response = client.get("/api/affiliate/me", headers=auth_headers())
    assert response.status_code == 404


# ── GET /affiliate/sales ──────────────────────────────────────────────────────

def test_affiliate_sales_retorna_vendas_do_parceiro(client, mock_db, mock_verify_affiliate):
    partner_doc = MagicMock()
    partner_doc.id = "partner-123"
    partner_doc.to_dict.return_value = make_partner_dict()
    mock_db["partners"].where.return_value.limit.return_value.stream.return_value = iter([partner_doc])

    sale_doc = MagicMock()
    sale_doc.id = "pay-123"
    sale_doc.to_dict.return_value = make_sale_dict()
    mock_db["payments"].where.return_value.stream.return_value = iter([sale_doc])

    response = client.get("/api/affiliate/sales", headers=auth_headers())
    assert response.status_code == 200
    data = response.json()
    assert "sales" in data
    assert data["total"] == 1


def test_affiliate_sales_mascara_email_comprador(client, mock_db, mock_verify_affiliate):
    partner_doc = MagicMock()
    partner_doc.id = "partner-123"
    partner_doc.to_dict.return_value = make_partner_dict()
    mock_db["partners"].where.return_value.limit.return_value.stream.return_value = iter([partner_doc])

    sale_doc = MagicMock()
    sale_doc.id = "pay-123"
    sale_doc.to_dict.return_value = make_sale_dict()
    mock_db["payments"].where.return_value.stream.return_value = iter([sale_doc])

    response = client.get("/api/affiliate/sales", headers=auth_headers())
    sales = response.json()["sales"]
    assert len(sales) > 0
    # Email deve estar mascarado: com*** ao invés de comprador@test.com
    assert "***" in sales[0]["user_email"]


def test_affiliate_sales_nao_retorna_dados_sensiveis(client, mock_db, mock_verify_affiliate):
    partner_doc = MagicMock()
    partner_doc.id = "partner-123"
    partner_doc.to_dict.return_value = make_partner_dict()
    mock_db["partners"].where.return_value.limit.return_value.stream.return_value = iter([partner_doc])

    sale_doc = MagicMock()
    sale_doc.id = "pay-123"
    sale_doc.to_dict.return_value = make_sale_dict()
    mock_db["payments"].where.return_value.stream.return_value = iter([sale_doc])

    response = client.get("/api/affiliate/sales", headers=auth_headers())
    sales = response.json()["sales"]
    for sale in sales:
        assert "user_id" not in sale
        assert "mercadopago_payment_id" not in sale
        assert "delivery_address_snapshot" not in sale


def test_affiliate_sales_sem_parceiro_retorna_404(client, mock_db, mock_verify_affiliate):
    mock_db["partners"].where.return_value.limit.return_value.stream.return_value = iter([])

    response = client.get("/api/affiliate/sales", headers=auth_headers())
    assert response.status_code == 404


# ── GET /affiliate/commissions ────────────────────────────────────────────────

def test_affiliate_commissions_retorna_totais(client, mock_db, mock_verify_affiliate):
    partner_doc = MagicMock()
    partner_doc.id = "partner-123"
    partner_doc.to_dict.return_value = make_partner_dict()
    mock_db["partners"].where.return_value.limit.return_value.stream.return_value = iter([partner_doc])

    comm_doc = MagicMock()
    comm_doc.id = "comm-123"
    comm_doc.to_dict.return_value = make_commission_dict()
    mock_db["supporter_commissions"].where.return_value.stream.return_value = iter([comm_doc])

    response = client.get("/api/affiliate/commissions", headers=auth_headers())
    assert response.status_code == 200
    data = response.json()
    assert "commissions" in data
    assert "totals" in data
    assert "pending" in data["totals"]
    assert "available" in data["totals"]
    assert "paid" in data["totals"]


def test_affiliate_commissions_calcula_totais_corretamente(client, mock_db, mock_verify_affiliate):
    partner_doc = MagicMock()
    partner_doc.id = "partner-123"
    partner_doc.to_dict.return_value = make_partner_dict()
    mock_db["partners"].where.return_value.limit.return_value.stream.return_value = iter([partner_doc])

    comm1 = MagicMock()
    comm1.id = "comm-1"
    c1 = make_commission_dict()
    c1["commission_status"] = "pending"
    c1["commission_amount"] = 10.0
    comm1.to_dict.return_value = c1

    comm2 = MagicMock()
    comm2.id = "comm-2"
    c2 = make_commission_dict()
    c2["id"] = "comm-2"
    c2["commission_status"] = "paid"
    c2["commission_amount"] = 20.0
    comm2.to_dict.return_value = c2

    mock_db["supporter_commissions"].where.return_value.stream.return_value = iter([comm1, comm2])

    response = client.get("/api/affiliate/commissions", headers=auth_headers())
    totals = response.json()["totals"]
    assert totals["pending"] == 10.0
    assert totals["paid"] == 20.0
    assert totals["available"] == 0.0
