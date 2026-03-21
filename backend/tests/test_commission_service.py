from services.commission_service import commission_service_calculate, DISCOUNT_PERCENTAGE


def test_calculo_sem_desconto():
    result = commission_service_calculate(100.0, 0.10)
    assert result["original_amount"] == 100.0
    assert result["discount_percentage"] == DISCOUNT_PERCENTAGE


def test_desconto_aplicado_corretamente():
    result = commission_service_calculate(100.0, 0.10)
    esperado = round(100.0 * (DISCOUNT_PERCENTAGE / 100), 2)
    assert result["discount_amount"] == esperado


def test_valor_final_menor_que_original():
    result = commission_service_calculate(100.0, 0.10)
    assert result["final_amount"] < result["original_amount"]


def test_comissao_calculada_sobre_valor_final():
    result = commission_service_calculate(100.0, 0.10)
    esperado = round(result["final_amount"] * 0.10, 2)
    assert result["commission_amount"] == esperado


def test_comissao_zero_para_taxa_zero():
    result = commission_service_calculate(100.0, 0.0)
    assert result["commission_amount"] == 0.0


def test_valores_arredondados():
    result = commission_service_calculate(99.99, 0.10)
    assert len(str(result["final_amount"]).split(".")[-1]) <= 2
    assert len(str(result["commission_amount"]).split(".")[-1]) <= 2