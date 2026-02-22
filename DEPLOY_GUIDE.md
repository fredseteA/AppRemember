# 🚀 Guia de Deploy - Remember QRCode

Este guia explica como fazer o deploy do Remember QRCode em produção.

---

## 📋 Pré-requisitos

1. **Conta no Fly.io**: https://fly.io/app/sign-up
2. **Conta na Vercel**: https://vercel.com/signup
3. **MongoDB Atlas** (ou outro MongoDB): https://www.mongodb.com/atlas
4. **Credenciais de Produção do Mercado Pago**
5. **Fly CLI instalado**: `curl -L https://fly.io/install.sh | sh`

---

## 🔧 PARTE 1: Deploy do Backend (Fly.io)

### Passo 1: Login no Fly.io

```bash
fly auth login
```

### Passo 2: Navegar até a pasta do backend

```bash
cd backend
```

### Passo 3: Criar o app no Fly.io

```bash
fly launch --name remember-qrcode-api --region gru --no-deploy
```

> Quando perguntado, responda:
> - Would you like to copy its configuration? **Yes**
> - Would you like to set up a Postgresql database? **No**
> - Would you like to set up an Upstash Redis database? **No**

### Passo 4: Configurar variáveis de ambiente (secrets)

```bash
# MongoDB
fly secrets set MONGO_URL="mongodb+srv://usuario:senha@cluster.mongodb.net/?retryWrites=true&w=majority"
fly secrets set DB_NAME="remember_qrcode"

# Firebase
fly secrets set FIREBASE_API_KEY="sua_api_key"
fly secrets set FIREBASE_AUTH_DOMAIN="seu-projeto.firebaseapp.com"
fly secrets set FIREBASE_PROJECT_ID="seu-projeto"
fly secrets set FIREBASE_STORAGE_BUCKET="seu-projeto.firebasestorage.app"
fly secrets set FIREBASE_MESSAGING_SENDER_ID="123456789"
fly secrets set FIREBASE_APP_ID="1:123456789:web:abcdef"

# Mercado Pago (PRODUÇÃO)
fly secrets set MERCADOPAGO_PUBLIC_KEY="APP_USR-xxxxxxxx"
fly secrets set MERCADOPAGO_ACCESS_TOKEN="APP_USR-xxxxxxxx"

# Email (Resend)
fly secrets set RESEND_API_KEY="re_xxxxxxxx"
fly secrets set ADMIN_EMAIL="rememberqrcode@gmail.com"
fly secrets set SENDER_EMAIL="onboarding@resend.dev"

# WhatsApp
fly secrets set WHATSAPP_NUMBER="+5522992080811"

# CORS - URL do frontend na Vercel
fly secrets set CORS_ORIGINS="https://remember-qrcode.vercel.app"
```

### Passo 5: Fazer o deploy

```bash
fly deploy
```

### Passo 6: Verificar o deploy

```bash
fly status
fly logs
```

### Passo 7: Testar a API

```bash
curl https://remember-qrcode-api.fly.dev/api/
```

Deve retornar: `{"message":"Remember QrCode API"}`

---

## 🎨 PARTE 2: Deploy do Frontend (Vercel)

### Passo 1: Preparar o repositório

Faça push do código para um repositório Git (GitHub, GitLab ou Bitbucket).

### Passo 2: Importar projeto na Vercel

1. Acesse: https://vercel.com/new
2. Clique em **"Import Git Repository"**
3. Selecione seu repositório
4. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `yarn build`
   - **Output Directory**: `build`

### Passo 3: Configurar variáveis de ambiente

Na tela de configuração (ou depois em Settings > Environment Variables):

| Variável | Valor |
|----------|-------|
| `REACT_APP_BACKEND_URL` | `https://remember-qrcode-api.fly.dev` |
| `REACT_APP_MERCADOPAGO_PUBLIC_KEY` | `APP_USR-xxxxxxxx` (produção) |

### Passo 4: Deploy

Clique em **"Deploy"** e aguarde.

### Passo 5: Configurar domínio personalizado (opcional)

1. Vá em **Settings > Domains**
2. Adicione seu domínio personalizado
3. Configure os registros DNS conforme instruído

---

## 🔗 PARTE 3: Configurações Finais

### Atualizar CORS no Backend

Após saber a URL final do frontend na Vercel, atualize:

```bash
fly secrets set CORS_ORIGINS="https://seu-dominio.vercel.app"
```

### Configurar Webhook do Mercado Pago

1. Acesse: https://www.mercadopago.com.br/developers/panel/app
2. Selecione sua aplicação
3. Vá em **"Webhooks"** ou **"Notificações IPN"**
4. Configure:
   - **URL**: `https://remember-qrcode-api.fly.dev/api/webhooks/mercadopago`
   - **Eventos**: `payment`

### Verificar Firebase

Certifique-se de que o domínio da Vercel está autorizado no Firebase:
1. Acesse: https://console.firebase.google.com
2. Vá em **Authentication > Settings > Authorized domains**
3. Adicione: `seu-dominio.vercel.app`

---

## ✅ Checklist Final

- [ ] Backend rodando no Fly.io
- [ ] Frontend rodando na Vercel
- [ ] MongoDB Atlas configurado e acessível
- [ ] Variáveis de ambiente configuradas (Fly.io)
- [ ] Variáveis de ambiente configuradas (Vercel)
- [ ] CORS configurado corretamente
- [ ] Webhook do Mercado Pago configurado
- [ ] Domínio autorizado no Firebase
- [ ] Teste de criação de memorial funcionando
- [ ] Teste de pagamento funcionando

---

## 🔍 Comandos Úteis

### Fly.io

```bash
# Ver logs em tempo real
fly logs -a remember-qrcode-api

# Ver status
fly status -a remember-qrcode-api

# Reiniciar app
fly apps restart remember-qrcode-api

# Ver variáveis configuradas
fly secrets list -a remember-qrcode-api

# Escalar para mais máquinas
fly scale count 2 -a remember-qrcode-api
```

### Vercel

```bash
# Instalar CLI
npm i -g vercel

# Login
vercel login

# Deploy manual
vercel --prod
```

---

## 🆘 Troubleshooting

### Erro de CORS
- Verifique se `CORS_ORIGINS` no Fly.io está correto
- A URL deve ser exatamente igual (com ou sem www)

### Erro de conexão com MongoDB
- Verifique se o IP do Fly.io está liberado no MongoDB Atlas
- Em MongoDB Atlas > Network Access, adicione `0.0.0.0/0` para permitir qualquer IP

### Webhook não funciona
- Verifique a URL do webhook no painel do Mercado Pago
- Verifique os logs: `fly logs -a remember-qrcode-api`

### Build falha na Vercel
- Verifique se todas as variáveis de ambiente estão configuradas
- Verifique os logs de build na Vercel

---

## 📞 Suporte

Em caso de dúvidas:
- WhatsApp: +55 22 99208-0811
- Email: rememberqrcode@gmail.com
