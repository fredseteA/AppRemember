from datetime import datetime, timezone
from models.admin import ProductCostConfig
from core.firebase import db


def get_product_cost_config() -> ProductCostConfig:
    doc = db.collection("settings").document("product_costs").get()
    if doc.exists:
        return ProductCostConfig(**doc.to_dict())
    return ProductCostConfig()


def calculate_cost_total(cfg: ProductCostConfig) -> float:
    return (
        cfg.custo_placa
        + cfg.custo_caixa
        + cfg.custo_palha
        + cfg.custo_papel_seda
        + cfg.custo_fitilho
    )


def calculate_gateway_fee(valor: float, cfg: ProductCostConfig) -> float:
    return (valor * cfg.taxa_percentual_gateway) + cfg.taxa_fixa_gateway


def calculate_profit_no_affiliate(cfg: ProductCostConfig) -> dict:
    custo_total = calculate_cost_total(cfg)
    taxa        = calculate_gateway_fee(cfg.preco_produto, cfg)
    lucro       = cfg.preco_produto - custo_total - cfg.frete_medio - taxa
    margem      = lucro / cfg.preco_produto if cfg.preco_produto > 0 else 0
    return {
        "preco_produto": round(cfg.preco_produto, 2),
        "custo_produto": round(custo_total, 2),
        "frete":         round(cfg.frete_medio, 2),
        "taxa_gateway":  round(taxa, 2),
        "comissao":      0.0,
        "desconto":      0.0,
        "lucro":         round(lucro, 2),
        "margem_pct":    round(margem * 100, 1),
    }


def calculate_profit_with_affiliate(cfg: ProductCostConfig) -> dict:
    custo_total        = calculate_cost_total(cfg)
    preco_com_desconto = cfg.preco_produto * (1 - cfg.desconto_percentual_afiliado)
    desconto_valor     = cfg.preco_produto - preco_com_desconto
    taxa               = calculate_gateway_fee(preco_com_desconto, cfg)
    comissao           = preco_com_desconto * cfg.comissao_percentual_afiliado
    lucro              = preco_com_desconto - custo_total - cfg.frete_medio - taxa - comissao
    margem             = lucro / cfg.preco_produto if cfg.preco_produto > 0 else 0
    return {
        "preco_produto":      round(cfg.preco_produto, 2),
        "desconto":           round(desconto_valor, 2),
        "preco_com_desconto": round(preco_com_desconto, 2),
        "custo_produto":      round(custo_total, 2),
        "frete":              round(cfg.frete_medio, 2),
        "taxa_gateway":       round(taxa, 2),
        "comissao":           round(comissao, 2),
        "lucro":              round(lucro, 2),
        "margem_pct":         round(margem * 100, 1),
    }