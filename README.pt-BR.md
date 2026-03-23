# 🕊️ Remember QRCode - Plataforma de Memoriais Digitais

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-green.svg)](https://fastapi.tiangolo.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange.svg)](https://firebase.google.com/)
[![Status](https://img.shields.io/badge/status-produção-brightgreen.svg)]()

> Plataforma SaaS B2B2C completa para criação, gestão e publicação de memoriais digitais personalizados, conectando memórias físicas e digitais através de tecnologia QR Code com sistema de afiliados para funerárias e cemitérios.

[English](README.md) | **Versão em Português**

🌐 **Produção**: [rememberqr.online](https://rememberqr.online)

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Planos de Publicação](#-planos-de-publicação)
- [Programa de Apoiadores](#-programa-de-apoiadores)
- [Tecnologias](#-tecnologias)
- [Arquitetura](#-arquitetura)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [API](#-api)
- [Política de Cancelamento](#-política-de-cancelamento)
- [Roadmap](#-roadmap)
- [Licença](#-licença)
- [Contato](#-contato)

---

## 🌟 Sobre o Projeto

**Remember QRCode** é uma plataforma SaaS completa que revoluciona a preservação de memórias combinando:

- **B2C** → Clientes finais criando memoriais para seus entes queridos
- **B2B** → Parcerias estratégicas com funerárias e cemitérios via sistema de afiliados
- **Admin** → Painel completo de gestão para produção e analytics

### 💡 Como Funciona

1. **Criação Gratuita**: Qualquer pessoa pode criar um memorial digital gratuitamente
2. **Sistema de Rascunho**: O memorial fica salvo como rascunho, permitindo edições ilimitadas
3. **Publicação Paga**: Após aprovação do conteúdo, escolha um plano para publicação oficial
4. **QR Code Único**: Cada memorial publicado recebe um QR Code exclusivo e permanente
5. **Placa Física (Opcional)**: Placas de aço inox com QR Code gravado para instalação em túmulos

### ✨ Diferenciais Técnicos

- 🔐 **Firebase Authentication**: Sistema robusto com custom claims (user/supporter/admin)
- 💳 **Pagamentos Automatizados**: Integração com Mercado Pago e webhooks idempotentes
- 📊 **Analytics Completo**: Dashboard em tempo real com métricas financeiras e operacionais
- 🤝 **Sistema de Afiliados**: Comissões automáticas para parceiros com 3 níveis (10%/15%/20%)
- 📧 **Emails Transacionais**: Templates HTML via Resend para cada etapa do pedido
- 🔄 **Processamento Idempotente**: Webhooks podem ser recebidos múltiplas vezes sem duplicar dados
- 📝 **Auditoria Completa**: Logs detalhados de todas as ações administrativas
- 🎯 **Notificações Priorizadas**: Sistema de alertas com níveis de urgência (crítico/alto/normal/baixo)
- 🌐 **Bilíngue**: Suporte completo PT/EN via react-i18next com seletor de idioma animado

---

## 🚀 Funcionalidades

### Para Usuários

- ✅ **Criação de Memorial** — Formulário intuitivo em 3 etapas com corte de foto, galeria e áudio
- ✅ **Sistema de Rascunho** — Edite livremente antes de publicar
- ✅ **Preview** — Visualize o memorial completo antes de escolher um plano
- ✅ **Gestão de Memorial** — Editar, controles de visibilidade, gerenciamento de galeria
- ✅ **Condolências** — Deixe e visualize mensagens com textos pré-definidos ou personalizados
- ✅ **Notificações por Email** — Pedido confirmado, em produção, enviado (com rastreio), entregue

### Para Administradores

- ✅ **Painel Admin Completo** — Gestão de memoriais, pedidos, produção, envio e usuários
- ✅ **Dashboard Financeiro** — Receita, lucro e custos em tempo real
- ✅ **Gestão de Apoiadores** — Aprovar parceiros, ver performance, configurar níveis de comissão
- ✅ **Gerador de QR Code** — PNG (alta resolução), PDF (pronto para gráfica 50×50mm), SVG (vetorizado)
- ✅ **Notificações Priorizadas** — Alertas críticos para pagamentos, pedidos e eventos do sistema
- ✅ **Logs de Auditoria** — Histórico completo de todas as ações administrativas

### Para Apoiadores (Parceiros)

- ✅ **Código de Afiliado Exclusivo** — Compartilhe para clientes receberem desconto
- ✅ **Dashboard de Vendas** — Acompanhe comissões e performance
- ✅ **Comissões por Nível** — Upgrades automáticos de nível baseados em volume

---

## 💎 Planos de Publicação

### 📱 Plano Digital — R$ 29,90

- Publicação oficial com link permanente
- QR Code personalizado
- Acesso ilimitado e edições futuras
- Ideal para memoriais exclusivamente digitais

### 🏛️ Plano Placa QR Code — R$ 149,90

- Tudo do Plano Digital
- Placa física em aço inox de alta qualidade
- QR Code gravado permanentemente
- Envio para todo Brasil com rastreamento
- Ideal para túmulos, jazigos e jardins memoriais

---

## 🤝 Programa de Apoiadores

Sistema de parceria estratégica para **funerárias, cemitérios e prestadores de serviços funerários**.

| Volume Mensal | Comissão |
|--------------|---------|
| Padrão | 10% |
| Alto volume | 15% |
| Volume premium | 20% |

- Clientes que usam código de apoiador recebem **5% de desconto**
- Apoiadores acessam dashboard dedicado com relatórios de vendas e comissões

---

## 🛠️ Tecnologias

### Frontend
```
React.js · Vite · Tailwind CSS · React Router · Axios
react-i18next · Firebase SDK · Radix UI · Sonner
```

### Backend
```
Python 3.11 · FastAPI · Firebase Admin SDK · Firestore
Mercado Pago API · Resend (emails) · Pydantic
```

### Infraestrutura
```
Vercel (frontend) · Fly.io (backend) · Firebase (auth + banco de dados)
Firebase Storage (mídia) · GitHub Actions (CI/CD)
```

---

## 🏗️ Arquitetura
```
┌─────────────────────────────────────────────────────────┐
│              FRONTEND — React + Vite (Vercel)           │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │   Público   │  │   Usuário    │  │     Admin     │  │
│  │  (Landing)  │  │ (Dashboard)  │  │    (Painel)   │  │
│  └─────────────┘  └──────────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│           BACKEND — FastAPI (Fly.io · região GRU)       │
│   Routers: auth · memorials · payments · admin          │
│            reviews · affiliate                          │
└─────────────────────────────────────────────────────────┘
                            │
          ┌─────────────────┼─────────────────┐
          ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────────┐  ┌──────────────┐
│   Firestore  │  │  Firebase Auth   │  │   Firebase   │
│   (Banco)    │  │  (custom claims) │  │   Storage    │
└──────────────┘  └──────────────────┘  └──────────────┘
          │                                    │
          ▼                                    ▼
┌──────────────┐                    ┌──────────────────┐
│ Mercado Pago │                    │  Resend (email)  │
│ (pagamentos  │                    │  templates HTML  │
│  + webhooks) │                    └──────────────────┘
└──────────────┘
```

---

## 💻 Instalação

### Pré-requisitos

- Node.js >= 18
- Python >= 3.11
- Projeto Firebase com Firestore habilitado
- Conta no Mercado Pago
- Conta no Resend

### Clonar o Repositório
```bash
git clone https://github.com/fredseteA/remember-platform.git
cd remember-platform
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload
```

---

## ⚙️ Configuração

### Frontend `.env`
```env
VITE_API_URL=https://remember-qrcode-api.fly.dev
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### Backend `.env`
```env
FIREBASE_CREDENTIALS=...
MERCADOPAGO_ACCESS_TOKEN=...
RESEND_API_KEY=...
FRONTEND_URL=https://rememberqr.online
```

---

## 📡 API

Base URL: `https://remember-qrcode-api.fly.dev`

### Principais Endpoints
```http
# Auth
POST   /auth/verify

# Memoriais
GET    /memorials/explore
POST   /memorials
GET    /memorials/:id
PUT    /memorials/:id
GET    /memorials/by-slug/:slug

# Pagamentos
POST   /payments/create-checkout
POST   /webhooks/mercadopago

# Admin
GET    /admin/dashboard
GET    /admin/orders
PUT    /admin/orders/:id/status

# Apoiadores
GET    /supporters/validate/:code
GET    /affiliate/dashboard

# Avaliações e Condolências
GET    /reviews
POST   /reviews
GET    /memorials/:id/condolences
POST   /memorials/:id/condolences
```

---

## 🔒 Política de Cancelamento

- ✅ **7 dias corridos** de direito de arrependimento a partir da confirmação do pedido
- ✅ Reembolso integral processado via Mercado Pago
- ❌ Produtos físicos já enviados não podem ser cancelados

---

## 🗺️ Roadmap

### Fase 1 - Plataforma Core ✅
- [x] Criação de memorial com formulário em 3 etapas e corte de foto
- [x] Sistema de rascunho e preview
- [x] Firebase authentication com custom claims
- [x] Integração Mercado Pago com webhooks
- [x] Planos digital e físico de publicação
- [x] Geração de QR Code (PNG, PDF, SVG)

### Fase 2 - Operações e Parcerias ✅
- [x] Painel admin completo com dashboard financeiro
- [x] Gestão de pedidos de produção e envio
- [x] Sistema de emails transacionais via Resend
- [x] Programa de afiliados/apoiadores com comissões por nível
- [x] Sistema de condolências com mensagens pré-definidas
- [x] Sistema de avaliações e depoimentos
- [x] Sistema de notificações priorizadas
- [x] Logs de auditoria completos

### Fase 3 - Bilíngue e Polimento ✅
- [x] Sistema bilíngue completo PT/EN via react-i18next
- [x] Seletor de idioma com bandeiras SVG animadas
- [x] Todas as páginas e componentes traduzidos

### Fase 4 - Planejado 📋
- [ ] App mobile (iOS/Android)
- [ ] Geração de biografia assistida por IA
- [ ] Linha do tempo interativa
- [ ] Doações e flores virtuais
- [ ] API pública para integrações de terceiros
- [ ] Visualizador de memorial em realidade aumentada

---

## 📄 Licença

Licença MIT — veja [LICENSE](LICENSE) para detalhes.

---

## 📞 Contato

- 🌐 **Website**: [rememberqr.online](https://rememberqr.online)
- 📧 **Email**: [rememberqrcode@gmail.com](mailto:rememberqrcode@gmail.com)
- 💬 **WhatsApp**: [(22) 99208-0811](https://wa.me/5522992080811)
- 🐙 **GitHub**: [fredseteA](https://github.com/fredseteA)

---

<div align="center">

**Feito com ❤️ para preservar memórias para sempre**

[⬆ Voltar ao topo](#-remember-qrcode---plataforma-de-memoriais-digitais)

</div>