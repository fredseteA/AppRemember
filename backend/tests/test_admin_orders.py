from unittest.mock import MagicMock


def admin_headers():
    return {"Authorization": "Bearer fake-admin-token"}


def make_order_dict(
    order_id="order-123",
    status="approved",
    plan_type="plaque",
    archived=False,
    cancel_requested=False,
):
    return {
        "id": order_id,
        "memorial_id": "mem-123",
        "user_id": "uid-123",
        "user_email": "user@test.com",
        "plan_type": plan_type,
        "amount": 149.90,
        "original_amount": 149.90,
        "final_amount": 149.90,
        "status": status,
        "archived": archived,
        "cancel_requested": cancel_requested,
        "status_history": [],
        "supporter_code": None,
        "commission_amount": 0.0,
        "commission_status": None,
        "tracking_code": None,
        "delivery_type": "correios",
        "created_at": "2024-01-01T00:00:00+00:00",
        "updated_at": "2024-01-01T00:00:00+00:00",
    }


# ── GET /admin/orders ─────────────────────────────────────────────────────────

def test_get_orders_retorna_lista(client, mock_db, mock_verify_admin):
    doc = MagicMock()
    doc.to_dict.return_value = make_order_dict()
    mock_db["payments"].stream.return_value = iter([doc])

    response = client.get("/api/admin/orders", headers=admin_headers())
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_get_orders_filtro_status(client, mock_db, mock_verify_admin):
    doc = MagicMock()
    doc.to_dict.return_value = make_order_dict(status="approved")
    mock_db["payments"].stream.return_value = iter([doc])

    response = client.get("/api/admin/orders?status=approved", headers=admin_headers())
    assert response.status_code == 200


def test_get_orders_nao_retorna_arquivados_por_padrao(client, mock_db, mock_verify_admin):
    doc_arquivado = MagicMock()
    doc_arquivado.to_dict.return_value = make_order_dict(archived=True)
    doc_normal = MagicMock()
    doc_normal.to_dict.return_value = make_order_dict(archived=False)
    mock_db["payments"].stream.return_value = iter([doc_arquivado, doc_normal])

    response = client.get("/api/admin/orders", headers=admin_headers())
    assert response.status_code == 200
    results = response.json()
    assert all(not r.get("archived") for r in results)


def test_get_orders_retorna_so_arquivados(client, mock_db, mock_verify_admin):
    doc_arquivado = MagicMock()
    doc_arquivado.to_dict.return_value = make_order_dict(archived=True)
    doc_normal = MagicMock()
    doc_normal.to_dict.return_value = make_order_dict(archived=False)
    mock_db["payments"].stream.return_value = iter([doc_arquivado, doc_normal])

    response = client.get("/api/admin/orders?archived=true", headers=admin_headers())
    assert response.status_code == 200
    results = response.json()
    assert all(r.get("archived") for r in results)


def test_get_orders_sem_admin_retorna_403(client, mock_db):
    response = client.get("/api/admin/orders") 
    assert response.status_code in (401, 403)


# ── PUT /admin/orders/{id}/status ─────────────────────────────────────────────

def test_update_status_muda_corretamente(client, mock_db, mock_verify_admin):
    doc = MagicMock()
    doc.exists = True
    doc.to_dict.return_value = make_order_dict(status="approved")
    mock_db["payments"].document.return_value.get.return_value = doc

    response = client.put(
        "/api/admin/orders/order-123/status",
        json={"status": "in_production"},
        headers=admin_headers(),
    )
    assert response.status_code == 200
    assert response.json()["new_status"] == "in_production"


def test_update_status_entregue_ativa_comissao(client, mock_db, mock_verify_admin):
    order_data = make_order_dict(status="shipped")
    order_data["commission_status"] = "pending"
    order_data["commission_amount"] = 10.0

    doc = MagicMock()
    doc.exists = True
    doc.to_dict.return_value = order_data
    mock_db["payments"].document.return_value.get.return_value = doc

    comm_doc = MagicMock()
    comm_doc.to_dict.return_value = {"commission_status": "pending"}
    mock_db["supporter_commissions"].where.return_value.where.return_value.stream.return_value = iter([comm_doc])

    response = client.put(
        "/api/admin/orders/order-123/status",
        json={"status": "entregue"},
        headers=admin_headers(),
    )
    assert response.status_code == 200


def test_update_status_pedido_nao_encontrado_retorna_404(client, mock_db, mock_verify_admin):
    doc = MagicMock()
    doc.exists = False
    mock_db["payments"].document.return_value.get.return_value = doc

    response = client.put(
        "/api/admin/orders/nao-existe/status",
        json={"status": "in_production"},
        headers=admin_headers(),
    )
    assert response.status_code == 404


# ── PUT /admin/orders/{id}/cancel ─────────────────────────────────────────────

def test_cancel_order_cancela_e_arquiva_memorial(client, mock_db, mock_verify_admin):
    doc = MagicMock()
    doc.exists = True
    doc.to_dict.return_value = make_order_dict(status="approved")
    mock_db["payments"].document.return_value.get.return_value = doc

    mem_doc = MagicMock()
    mem_doc.exists = True
    mock_db["memorials"].document.return_value.get.return_value = mem_doc

    comm_doc = MagicMock()
    comm_doc.to_dict.return_value = {"commission_status": "pending"}
    mock_db["supporter_commissions"].where.return_value.stream.return_value = iter([comm_doc])

    response = client.put("/api/admin/orders/order-123/cancel", headers=admin_headers())
    assert response.status_code == 200
    assert "cancelado" in response.json()["message"].lower()


def test_cancel_order_nao_encontrado_retorna_404(client, mock_db, mock_verify_admin):
    doc = MagicMock()
    doc.exists = False
    mock_db["payments"].document.return_value.get.return_value = doc

    response = client.put("/api/admin/orders/nao-existe/cancel", headers=admin_headers())
    assert response.status_code == 404


# ── PUT /admin/orders/{id}/archive ────────────────────────────────────────────

def test_archive_order_entregue(client, mock_db, mock_verify_admin):
    doc = MagicMock()
    doc.exists = True
    doc.to_dict.return_value = make_order_dict(status="entregue")
    mock_db["payments"].document.return_value.get.return_value = doc

    response = client.put("/api/admin/orders/order-123/archive", headers=admin_headers())
    assert response.status_code == 200


def test_archive_order_cancelled(client, mock_db, mock_verify_admin):
    doc = MagicMock()
    doc.exists = True
    doc.to_dict.return_value = make_order_dict(status="cancelled")
    mock_db["payments"].document.return_value.get.return_value = doc

    response = client.put("/api/admin/orders/order-123/archive", headers=admin_headers())
    assert response.status_code == 200


def test_archive_order_status_invalido_retorna_400(client, mock_db, mock_verify_admin):
    doc = MagicMock()
    doc.exists = True
    doc.to_dict.return_value = make_order_dict(status="in_production")
    mock_db["payments"].document.return_value.get.return_value = doc

    response = client.put("/api/admin/orders/order-123/archive", headers=admin_headers())
    assert response.status_code == 400


# ── PUT /admin/orders/{id}/tracking ──────────────────────────────────────────

def test_add_tracking_muda_status_para_shipped(client, mock_db, mock_verify_admin):
    doc = MagicMock()
    doc.exists = True
    doc.to_dict.return_value = make_order_dict(status="produced")
    mock_db["payments"].document.return_value.get.return_value = doc

    mem_doc = MagicMock()
    mem_doc.exists = True
    mem_doc.to_dict.return_value = {"responsible": {"name": "Maria", "email": "maria@test.com"}, "person_data": {"full_name": "João"}}
    mock_db["memorials"].document.return_value.get.return_value = mem_doc

    response = client.put(
        "/api/admin/orders/order-123/tracking",
        json={"tracking_code": "BR123456789BR", "delivery_type": "correios"},
        headers=admin_headers(),
    )
    assert response.status_code == 200
    assert response.json()["tracking_code"] == "BR123456789BR"


def test_add_tracking_pedido_nao_encontrado_retorna_404(client, mock_db, mock_verify_admin):
    doc = MagicMock()
    doc.exists = False
    mock_db["payments"].document.return_value.get.return_value = doc

    response = client.put(
        "/api/admin/orders/nao-existe/tracking",
        json={"tracking_code": "BR123456789BR", "delivery_type": "correios"},
        headers=admin_headers(),
    )
    assert response.status_code == 404


# ── DELETE /admin/orders/{id} ─────────────────────────────────────────────────

def test_delete_order_com_sucesso(client, mock_db, mock_verify_admin):
    doc = MagicMock()
    doc.exists = True
    doc.to_dict.return_value = make_order_dict()
    mock_db["payments"].document.return_value.get.return_value = doc

    log_doc = MagicMock()
    mock_db["admin_logs"].document.return_value = log_doc

    response = client.delete("/api/admin/orders/order-123", headers=admin_headers())
    assert response.status_code == 200


def test_delete_order_nao_encontrado_retorna_404(client, mock_db, mock_verify_admin):
    doc = MagicMock()
    doc.exists = False
    mock_db["payments"].document.return_value.get.return_value = doc

    response = client.delete("/api/admin/orders/nao-existe", headers=admin_headers())
    assert response.status_code == 404
