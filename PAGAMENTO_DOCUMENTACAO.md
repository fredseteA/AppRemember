# 💳 Sistema de Pagamento Mercado Pago - Documentação Completa

## ✅ Correções Implementadas

### 🔧 Problemas Identificados e Corrigidos

**ANTES:**
- ❌ Tentava criar pagamento PIX direto (não funcionava)
- ❌ Não usava Preferences API (método correto para checkout redirect)
- ❌ Faltavam logs detalhados
- ❌ Tratamento de erros genérico
- ❌ Frontend não sabia onde redirecionar

**AGORA:**
- ✅ Usa Preferences API do Mercado Pago
- ✅ Redireciona para checkout hospedado no Mercado Pago
- ✅ Logs detalhados em cada etapa
- ✅ Tratamento de erros específicos
- ✅ Frontend redireciona para `init_point`
- ✅ Páginas de retorno (success, failure, pending)

---

## 🔄 Fluxo Completo do Pagamento

```
1. Usuário cria memorial (3 etapas)
   ↓
2. Visualiza preview
   ↓
3. Clica "Escolher Plano e Publicar"
   ↓
4. Seleciona plano (Digital R$29,90 ou Placa R$119,90)
   ↓
5. Frontend: POST /api/payments/create-checkout
   {
     memorial_id, plan_type, transaction_amount,
     description, payer_email
   }
   ↓
6. Backend: Cria preference no Mercado Pago
   - Usa MERCADOPAGO_ACCESS_TOKEN
   - Define título, preço, back_urls
   - Retorna init_point
   ↓
7. Frontend: Recebe { checkout_url: init_point }
   ↓
8. Frontend: window.location.href = checkout_url
   ↓
9. Usuário é redirecionado para Mercado Pago
   ↓
10. Usuário realiza pagamento no site do MP
   ↓
11. Mercado Pago redireciona de volta:
    - ✅ Sucesso: /payment/success?payment_id=xxx
    - ❌ Falha: /payment/failure?payment_id=xxx
    - ⏳ Pendente: /payment/pending?payment_id=xxx
   ↓
12. Webhook: MP notifica backend
    - POST /api/webhooks/mercadopago
    - Backend atualiza status do pagamento
    - Se aprovado: publica memorial automaticamente
```

---

## 🛠️ Configuração das Variáveis de Ambiente

### Backend (`/app/backend/.env`)

```env
MERCADOPAGO_PUBLIC_KEY="APP_USR-b97e44a0-f764-470f-a765-49c8e17c365c"
MERCADOPAGO_ACCESS_TOKEN="APP_USR-8693850697876893-020213-34df38c21a6af2c26a44cdc8dd1c4765-3111237404"
REACT_APP_BACKEND_URL=http://localhost:8001
```

⚠️ **IMPORTANTE:**
- `MERCADOPAGO_ACCESS_TOKEN` é usado no backend
- Está em modo **teste/sandbox**
- Para produção, substitua pelas credenciais reais

---

## 📡 API Backend

### POST `/api/payments/create-checkout`

**Headers:**
```
Authorization: Bearer {firebase_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "memorial_id": "abc123",
  "plan_type": "digital",
  "transaction_amount": 29.90,
  "description": "Plano Digital - Memorial de João Silva",
  "payer_email": "usuario@email.com",
  "payment_method_id": "account_money"
}
```

**Response Success (201):**
```json
{
  "success": true,
  "payment_id": "internal-payment-id",
  "preference_id": "12345-mp-preference-id",
  "checkout_url": "https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=...",
  "message": "Checkout criado com sucesso"
}
```

**Response Error (4xx/5xx):**
```json
{
  "detail": "Erro específico do que aconteceu"
}
```

---

## 🎨 Frontend

### SelectPlan.js

**Código Corrigido:**

```javascript
const handleSelectPlan = async (plan) => {
  console.log('=== INICIANDO PROCESSO DE PAGAMENTO ===');
  
  try {
    const response = await axios.post(
      `${API}/payments/create-checkout`,
      {
        memorial_id: id,
        plan_type: plan.id,
        transaction_amount: plan.price,
        description: `${plan.name} - Memorial de ...`,
        payer_email: user.email,
        payment_method_id: 'account_money'
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.data.success && response.data.checkout_url) {
      // Redireciona para checkout do Mercado Pago
      window.location.href = response.data.checkout_url;
    }
  } catch (error) {
    console.error('❌ ERRO:', error);
    toast.error(error.response?.data?.detail || 'Erro ao processar pagamento');
  }
};
```

**Logs no Console:**
- ✅ Início do processo
- ✅ Plano selecionado
- ✅ Payload enviado
- ✅ Resposta recebida
- ✅ URL de redirecionamento
- ❌ Erros detalhados se falhar

---

## 📄 Páginas de Retorno

### PaymentSuccess.js
- **Rota:** `/payment/success?payment_id=xxx`
- **Status:** Pagamento aprovado ✅
- **Ações:**
  - Mostra mensagem de sucesso
  - Botão "Ver Meus Memoriais"
  - Botão "Voltar ao Início"

### PaymentFailure.js
- **Rota:** `/payment/failure?payment_id=xxx`
- **Status:** Pagamento falhou ❌
- **Ações:**
  - Mostra mensagem de erro
  - Botão "Tentar Novamente"
  - Botão "Voltar ao Início"

### PaymentPending.js
- **Rota:** `/payment/pending?payment_id=xxx`
- **Status:** Pagamento pendente ⏳
- **Ações:**
  - Mostra mensagem de aguardo
  - Explica que receberá notificação
  - Botões de navegação

---

## 🔍 Logs e Debug

### Backend Logs

**Verificar logs:**
```bash
tail -f /var/log/supervisor/backend.*.log
```

**Logs implementados:**
```python
logger.info("=== INICIANDO CRIAÇÃO DE CHECKOUT ===")
logger.info(f"Memorial ID: {memorial_id}")
logger.info(f"Plan Type: {plan_type}")
logger.info(f"Access Token configurado: {token[:20]}...")
logger.info("Enviando requisição para Mercado Pago...")
logger.info(f"✅ Preference criada com sucesso!")
logger.error(f"❌ Erro ao criar preference")
```

### Frontend Console

**Abrir DevTools (F12) e ver:**
```
=== INICIANDO PROCESSO DE PAGAMENTO ===
Plano selecionado: digital
Memorial ID: abc123
Enviando requisição para backend: {...}
✅ Resposta do backend: {...}
Redirecionando para checkout: https://...
```

**Se der erro:**
```
❌ ERRO AO PROCESSAR PAGAMENTO
Erro completo: {...}
Status: 500
Dados: { detail: "..." }
```

---

## 🧪 Como Testar

### 1. Testar Criação de Checkout

```bash
# Com token válido
curl -X POST "http://localhost:8001/api/payments/create-checkout" \
  -H "Authorization: Bearer SEU_TOKEN_FIREBASE" \
  -H "Content-Type: application/json" \
  -d '{
    "memorial_id": "memorial-id-existente",
    "plan_type": "digital",
    "transaction_amount": 29.90,
    "description": "Plano Digital - Teste",
    "payer_email": "teste@email.com",
    "payment_method_id": "account_money"
  }'
```

**Resposta esperada:**
```json
{
  "success": true,
  "checkout_url": "https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=..."
}
```

### 2. Testar no Site

1. Cadastre-se/faça login
2. Crie um memorial (preencha os 3 passos)
3. Na página de preview, clique "Escolher Plano e Publicar"
4. Selecione um plano
5. Clique "Selecionar Plano"
6. Verifique o console do navegador (F12)
7. Você será redirecionado para o Mercado Pago

### 3. Testar Pagamento (Sandbox)

No checkout do Mercado Pago (modo teste):
- Use cartões de teste: https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/additional-content/test-cards
- Cartão aprovado: `5031 4332 1540 6351`
- CVV: `123`
- Vencimento: `11/25`

---

## ⚠️ Troubleshooting

### Erro: "MERCADOPAGO_ACCESS_TOKEN não configurado"

**Causa:** Variável de ambiente não está definida

**Solução:**
1. Verifique `/app/backend/.env`
2. Confirme que existe:
   ```
   MERCADOPAGO_ACCESS_TOKEN="APP_USR-..."
   ```
3. Reinicie o backend:
   ```bash
   sudo supervisorctl restart backend
   ```

---

### Erro: "Memorial not found"

**Causa:** Memorial ID inválido ou inexistente

**Solução:**
1. Verifique se o memorial foi criado corretamente
2. Confirme o ID no banco:
   ```bash
   mongosh remember_qrcode
   db.memorials.find({}, {id: 1, "person_data.full_name": 1})
   ```

---

### Erro: "Erro ao criar checkout"

**Causa:** Problema na API do Mercado Pago

**Solução:**
1. Verifique logs do backend
2. Confirme que o Access Token é válido
3. Teste o Access Token:
   ```bash
   curl -X GET "https://api.mercadopago.com/users/me" \
     -H "Authorization: Bearer SEU_ACCESS_TOKEN"
   ```

---

### Não redireciona para checkout

**Causa:** JavaScript bloqueado ou `checkout_url` vazio

**Solução:**
1. Abra console do navegador (F12)
2. Verifique se há erros
3. Confirme que `response.data.checkout_url` existe
4. Teste manualmente:
   ```javascript
   window.location.href = 'URL_DO_CHECKOUT'
   ```

---

## 🎯 Próximos Passos

- [ ] Testar webhook em produção (precisa URL pública)
- [ ] Implementar notificações por email após pagamento
- [ ] Adicionar mais métodos de pagamento (além de cartão)
- [ ] Criar painel admin para ver pagamentos em tempo real
- [ ] Adicionar retry automático em caso de falha
- [ ] Implementar split payment (se necessário)

---

## 📞 Suporte

Se ainda tiver problemas:

1. Verifique os logs (backend e frontend)
2. Confirme variáveis de ambiente
3. Teste com cartão de teste do Mercado Pago
4. Consulte documentação oficial: https://www.mercadopago.com.br/developers/pt/docs

---

## ✅ Checklist Final

Antes de considerar o pagamento funcional:

- [x] Access Token configurado no `.env`
- [x] Rota `POST /api/payments/create-checkout` criada
- [x] Frontend envia requisição correta
- [x] Backend cria preference no MP
- [x] Backend retorna `checkout_url`
- [x] Frontend redireciona para checkout
- [x] Páginas de retorno criadas (success/failure/pending)
- [x] Webhook configurado
- [x] Logs detalhados implementados
- [x] Tratamento de erros específicos

**Status: ✅ SISTEMA DE PAGAMENTO FUNCIONAL**
