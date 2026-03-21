from models.admin import ProductCostConfig
from services.cost_service import (
    calculate_cost_total,
    calculate_gateway_fee,
    calculate_profit_no_affiliate,
    calculate_profit_with_affiliate,
)


def test_custo_total_soma_todos_componentes():
    cfg = ProductCostConfig()
    esperado = cfg.custo_placa + cfg.custo_caixa + cfg.custo_palha + cfg.custo_papel_seda + cfg.custo_fitilho
    assert calculate_cost_total(cfg) == esperado


def test_taxa_gateway_inclui_percentual_e_fixo():
    cfg  = ProductCostConfig()
    taxa = calculate_gateway_fee(100.0, cfg)
    assert abs(taxa - (100.0 * cfg.taxa_percentual_gateway + cfg.taxa_fixa_gateway)) < 0.0001


def test_lucro_sem_afiliado_retorna_campos_esperados():
    cfg    = ProductCostConfig()
    result = calculate_profit_no_affiliate(cfg)
    assert "lucro" in result
    assert "margem_pct" in result
    assert result["comissao"] == 0.0
    assert result["desconto"] == 0.0


def test_lucro_com_afiliado_menor_que_sem():
    cfg        = ProductCostConfig()
    sem        = calculate_profit_no_affiliate(cfg)
    com        = calculate_profit_with_affiliate(cfg)
    assert com["lucro"] < sem["lucro"]


def test_lucro_com_afiliado_retorna_campos_esperados():
    cfg    = ProductCostConfig()
    result = calculate_profit_with_affiliate(cfg)
    assert "preco_com_desconto" in result
    assert "comissao" in result
    assert result["comissao"] > 0


def test_margem_entre_zero_e_cem():
    cfg = ProductCostConfig()
    sem = calculate_profit_no_affiliate(cfg)
    assert -100 < sem["margem_pct"] < 100