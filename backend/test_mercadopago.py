#!/usr/bin/env python3
"""
Script de teste para criar uma preference no Mercado Pago
e verificar se está funcionando corretamente.
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv
import mercadopago

# Carregar variáveis de ambiente
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

def test_mercadopago():
    """Testa criação de preference no Mercado Pago"""
    
    access_token = os.getenv('MERCADOPAGO_ACCESS_TOKEN')
    
    if not access_token:
        print("❌ MERCADOPAGO_ACCESS_TOKEN não configurado!")
        return False
    
    print("=" * 60)
    print("TESTANDO MERCADO PAGO")
    print("=" * 60)
    print(f"Access Token: {access_token[:30]}...")
    print(f"Tipo: {'TESTE' if access_token.startswith('TEST-') else 'PRODUÇÃO/SANDBOX'}")
    print()
    
    # Inicializar SDK
    sdk = mercadopago.SDK(access_token)
    
    # Criar preference de teste
    preference_data = {
        "items": [
            {
                "title": "Teste - Memorial Digital",
                "quantity": 1,
                "unit_price": 29.90,
                "currency_id": "BRL"
            }
        ],
        "payer": {
            "email": "test@test.com"
        },
        "back_urls": {
            "success": "http://localhost:3000/payment/success",
            "failure": "http://localhost:3000/payment/failure",
            "pending": "http://localhost:3000/payment/pending"
        },
        "external_reference": "test-123",
        "statement_descriptor": "Remember QrCode"
    }
    
    print("PAYLOAD:")
    import json
    print(json.dumps(preference_data, indent=2))
    print()
    
    print("Enviando requisição...")
    result = sdk.preference().create(preference_data)
    
    print("=" * 60)
    print("RESPOSTA:")
    print(f"Status: {result.get('status')}")
    print()
    
    if result["status"] == 201:
        print("✅ SUCESSO!")
        print(f"Preference ID: {result['response'].get('id')}")
        print(f"Init Point: {result['response'].get('init_point')}")
        return True
    else:
        print("❌ ERRO!")
        print(json.dumps(result, indent=2))
        return False

if __name__ == "__main__":
    success = test_mercadopago()
    sys.exit(0 if success else 1)
