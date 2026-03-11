# 🕊️ Remember QRCode - Plataforma de Memoriais Digitais

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-green.svg)](https://fastapi.tiangolo.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange.svg)](https://firebase.google.com/)
[![Status](https://img.shields.io/badge/status-em%20produção-brightgreen.svg)]()

> Plataforma SaaS B2B2C completa para criação, gestão e publicação de memoriais digitais personalizados, conectando memórias físicas e digitais através de tecnologia QR Code com sistema de afiliados para funerárias e cemitérios.

[English Version](README.md) | **Português**

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
- [Uso](#-uso)
- [API](#-api)
- [Fluxos de Negócio](#-fluxos-de-negócio)
- [Política de Cancelamento](#-política-de-cancelamento)
- [Segurança](#-segurança)
- [Roadmap](#-roadmap)
- [Contribuindo](#-contribuindo)
- [Licença](#-licença)
- [Contato](#-contato)

---

## 🌟 Sobre o Projeto

**Remember QRCode** é uma plataforma SaaS completa que revoluciona a forma de preservar memórias, combinando:

- **B2C** → Clientes finais criando memoriais de entes queridos
- **B2B** → Parcerias estratégicas com funerárias e cemitérios através de sistema de afiliados
- **Admin** → Painel completo de gestão, produção e analytics

### 💡 Como Funciona

1. **Criação Gratuita**: Qualquer pessoa pode criar um memorial digital gratuitamente
2. **Sistema Draft**: O memorial fica salvo como rascunho, permitindo edições ilimitadas
3. **Publicação Paga**: Após aprovação do conteúdo, escolhe-se um plano para publicação oficial
4. **QR Code Único**: Cada memorial publicado recebe um QR Code exclusivo e permanente
5. **Placa Física (Opcional)**: Placas em aço inoxidável com QR Code gravado para instalação em túmulos

### ✨ Diferenciais Técnicos

- 🔐 **Autenticação Firebase**: Sistema robusto com custom claims (user/apoiador/admin)
- 💳 **Pagamento Automatizado**: Integração com Mercado Pago + webhooks idempotentes
- 📊 **Analytics Completo**: Dashboard em tempo real com métricas financeiras e operacionais
- 🤝 **Sistema de Afiliados**: Comissões automáticas para parceiros com 3 níveis (10%/15%/20%)
- 📧 **E-mails Transacionais**: Templates HTML personalizados para cada etapa do pedido
- 🔄 **Processamento Idempotente**: Webhooks podem ser recebidos múltiplas vezes sem duplicar dados
- 📝 **Auditoria Completa**: Logs detalhados de todas as ações administrativas
- 🎯 **Notificações Priorizadas**: Sistema de alertas com níveis de urgência (crítico/alto/normal/baixo)

---

## 🚀 Funcionalidades

### Para Usuários (Clientes)

- ✅ **Criação de Memoriais**
  - Criação 100% gratuita de memoriais em formato draft
  - Edições ilimitadas antes da publicação
  - Upload de múltiplas fotos e vídeos
  - Biografia completa com editor de texto
  - Arquivo de áudio (mensagem do falecido ou familiar)
  - Datas de nascimento e falecimento
  - Informações de cidade/estado
  - Slug único gerado automaticamente (URL amigável)
  
- ✅ **Gestão de Memoriais**
  - Visualização prévia antes da publicação
  - Edição permitida apenas pelo dono do memorial
  - Controle de privacidade (memorial público/privado)
  - Sistema de condolências públicas
  - Gerenciamento de endereço de entrega
  
- ✅ **Notificações Automáticas por E-mail**
  - ✉️ **Pagamento Aprovado** - Confirmação da compra
  - 🔧 **Produção Iniciada** - Placa entrando em fabricação
  - 📦 **Produto Finalizado** - Placa pronta para envio
  - 🚚 **Pedido Enviado** - Código de rastreio dos Correios ou entrega local
  - ✅ **Pedido Entregue** - Confirmação de recebimento
  - ❌ **Pedido Cancelado** - Informações sobre reembolso

### Para Administradores

- 🎛️ **Dashboard Analytics Avançado**
  - 📊 Receita total vs. receita do mês
  - 🎫 Ticket médio (geral e mensal)
  - 📈 Gráfico de vendas dos últimos 6 meses
  - 📉 Taxa de cancelamento de pedidos
  - 💰 Comissões pendentes/disponíveis/pagas
  - 🏷️ Vendas por tipo de plano (Digital/Placa/Completo)
  - ⚠️ Alertas de solicitações de cancelamento
  
- 🏭 **Fila de Produção**
  - Lista de pedidos físicos aguardando produção (FIFO)
  - Preview do memorial (nome, foto, datas)
  - Controle de status: Aprovado → Em Produção → Produzido → Enviado
  - Botões de ação rápida para cada etapa
  
- 📦 **Gestão Completa de Pedidos**
  - Atualização de status com histórico (audit trail)
  - Adição de código de rastreio (Correios ou entrega local)
  - Cancelamento de pedidos com estorno automático de comissão
  - Arquivamento de pedidos finalizados
  - Sistema de notas internas (não visível ao cliente)
  - Reenvio de e-mails de confirmação
  - Exclusão permanente de pedidos (com log de auditoria)
  
- 🤝 **Gestão de Parceiros (Apoiadores)**
  - Criação de parceiro + conta Firebase Auth automática
  - Edição de taxa de comissão individualizada
  - Relatórios de vendas por parceiro
  - Pagamento em lote de comissões (por período)
  - Histórico de vendas e performance
  
- 🔔 **Sistema de Notificações Priorizadas**
  - 🔴 **Crítico** (prioridade 1): Solicitações de cancelamento
  - 🟠 **Alto** (prioridade 2): Pagamentos aprovados, novos pedidos
  - 🟡 **Normal** (prioridade 3): Mudanças de status, reviews
  - ⚪ **Baixo** (prioridade 4): Avisos de sistema
  - Badge com contador de não lidas
  - Ordenação automática por prioridade + data
  
- 📝 **Logs de Auditoria**
  - Registro de TODAS as ações administrativas
  - Informações: quem fez, quando, qual entidade, detalhes
  - Filtros por tipo de entidade (order/memorial/partner/review)
  
- 💵 **Relatórios Financeiros**
  - Receita total e por período customizado
  - Vendas por tipo de plano
  - Evolução mensal de receitas
  - Total de comissões (pending/available/paid)
  - Lucro estimado (receita - comissões)
  - % de vendas com código de apoiador
  - Exportação de dados em JSON

### Para Apoiadores (Funerárias/Cemitérios)

- 🤝 **Painel do Parceiro**
  - Código exclusivo de apoio (gerado automaticamente)
  - Visualização de vendas realizadas com seu código
  - Proteção de dados: apoiador vê APENAS suas próprias vendas
  - E-mails mascarados dos clientes (privacidade LGPD)
  
- 💰 **Gestão de Comissões**
  - Listagem completa de comissões (pending/available/paid)
  - Totalizadores por status
  - Histórico de pagamentos recebidos
  - Transparência total sobre cálculo de comissões
  
- 📊 **Relatórios de Performance**
  - Total de vendas no mês
  - Total de vendas all-time
  - Receita gerada (bruta)
  - Meta mensal de vendas (se configurado)

---

## 💎 Planos de Publicação

### 📱 Plano Digital

**Benefícios:**
- ✅ Publicação oficial do memorial na plataforma
- ✅ Link exclusivo e permanente (slug personalizado)
- ✅ QR Code personalizado gerado automaticamente
- ✅ Acesso ilimitado ao memorial
- ✅ Sistema de condolências públicas
- ✅ Galeria de fotos e vídeos
- ✅ Áudio memorial (mensagem gravada)
- ✅ Biografia completa

**Ideal para:**
- Memoriais exclusivamente digitais
- Compartilhamento em redes sociais
- Famílias distribuídas geograficamente
- Homenagens virtuais

**Preço:** A partir de R$ 49,90 (valores podem variar)

---

### 🏛️ Plano Placa QR Code

**Todos os benefícios do Plano Digital +**
- ✅ Placa física em **aço inoxidável 304** de alta qualidade
- ✅ QR Code gravado a laser permanentemente
- ✅ Resistente a intempéries (chuva, sol, umidade)
- ✅ Fixação inclusa (parafusos em aço inox)
- ✅ Dimensões: 10cm x 15cm (padrão)
- ✅ Design elegante e discreto
- ✅ Garantia de 2 anos contra defeitos de fabricação
- ✅ Frete incluso para todo o Brasil

**Ideal para:**
- Túmulos e jazigos em cemitérios
- Memoriais físicos em jardins
- Placas em locais de homenagem
- Cemitérios verticais e parques memoriais

**Instalação:**
- Cliente escolhe o local (túmulo, memorial, etc.)
- Placa entregue em endereço informado
- Instalação por conta do cliente ou cemitério parceiro

**Preço:** A partir de R$ 149,90 (valores podem variar)

---

### 🌟 Plano Completo (Futuro)

**Todos os benefícios do Plano Placa +**
- ✅ Placa Premium com acabamento diferenciado
- ✅ Instalação profissional inclusa (regiões parceiras)
- ✅ Suporte prioritário
- ✅ Atualizações de conteúdo facilitadas
- ✅ Certificado digital de autenticidade

**Status:** 🚧 Em desenvolvimento

---

### 💳 Formas de Pagamento

- **PIX** - Aprovação instantânea
- **Cartão de Crédito** - Parcelamento em até 12x
- **Boleto Bancário** - Aprovação em até 2 dias úteis

**Gateway de Pagamento:** Mercado Pago (integração oficial)

---

## 🤝 Programa de Apoiadores

Sistema de **parceria estratégica B2B** voltado para funerárias, cemitérios e prestadores de serviços funerários.

### 💡 Como Funciona

#### 1. **Cadastro como Apoiador**
   - Admin cria conta do parceiro no painel
   - Sistema gera código exclusivo automaticamente (ex: `FUNERAL1234`)
   - Parceiro recebe acesso ao painel de apoiadores
   - Código pode ser impresso em cartões, folders, etc.

#### 2. **Cliente Utiliza o Código**
   - Cliente informa código no checkout
   - Sistema valida código (ativo/inativo)
   - Desconto aplicado automaticamente
   - Cliente vê economia no resumo do pedido

#### 3. **Cálculo de Valores** (Exemplo Real)

```
Valor Original do Plano:     R$ 149,90
Desconto (5% fixo):          - R$   7,49
─────────────────────────────────────
Valor Final Pago pelo Cliente:  R$ 142,41

Comissão do Apoiador (10%):    R$  14,24
```

**Importante:** A comissão é calculada sobre o **valor final** (após desconto), não sobre o valor original.

#### 4. **Estados da Comissão**

| Status | Descrição | Ação Necessária |
|--------|-----------|-----------------|
| **pending** | Pedido pago, aguardando entrega | Aguardar conclusão |
| **available** | Pedido entregue, pode ser paga | Admin deve pagar |
| **paid** | Comissão paga ao parceiro | Finalizado ✅ |
| **canceled** | Pedido cancelado | Comissão estornada |

### 📊 Sistema de Comissões Escalonado

As comissões aumentam conforme o volume mensal de vendas:

| Vendas no Mês | Taxa de Comissão | Exemplo (venda de R$ 142,41) |
|---------------|------------------|------------------------------|
| 0-9 vendas | 10% | R$ 14,24 por venda |
| 10-29 vendas | 15% | R$ 21,36 por venda |
| 30+ vendas | 20% | R$ 28,48 por venda |

**Observação:** A taxa é revisada automaticamente todo mês com base no desempenho.

### 💰 Pagamento de Comissões

**Quando a comissão fica disponível:**
- ✅ Pedido foi **entregue ao cliente** (status: `entregue`)
- ✅ Prazo de cancelamento (7 dias) expirou
- ✅ Nenhuma solicitação de cancelamento pendente

**Como receber:**
1. Admin acessa painel de comissões
2. Filtra por parceiro e período (ex: Janeiro/2025)
3. Clica em "Marcar como pago"
4. Comissões mudam de `available` → `paid`
5. Registro fica no histórico permanentemente

**Formas de pagamento:**
- PIX (preferencial)
- Transferência bancária
- Outros acordos comerciais

### 🎯 Vantagens do Programa

**Para Apoiadores:**
- 💰 Fonte adicional de receita recorrente
- 📈 Comissões crescentes com volume
- 🎯 Agrega valor aos serviços oferecidos
- 📊 Painel exclusivo com relatórios em tempo real
- 🏆 Sem meta mínima obrigatória
- 🔒 Dados seguros e privacidade garantida (LGPD)

**Para a Plataforma:**
- 🌐 Expansão orgânica via parceiros
- 🤝 Relacionamento de longo prazo
- 📈 Crescimento sustentável e previsível
- 🎓 Ecossistema colaborativo

**Para os Clientes:**
- 💵 Desconto imediato de 5%
- 🤝 Indicação de confiança (código de funerária conhecida)
- ✅ Segurança na compra

### 📧 Comunicação Automática

**E-mail ao apoiador quando há uma venda:**
- 🎉 Notificação em tempo real
- 📊 Detalhes da venda (valor, desconto, comissão)
- ⏳ Status da comissão (pending/available)
- 🔗 Link para painel de vendas

**Exemplo de e-mail:**
```
Nova venda com seu código! 🎉

Pedido: #ABC12345
Valor Original: R$ 149,90
Desconto Aplicado: -R$ 7,49 (5%)
Valor Final: R$ 142,41
Sua Comissão: R$ 14,24

Status: Pendente — liberação após entrega do pedido
```

### 🔒 Segurança e Privacidade

- ✅ Apoiador vê **apenas** vendas com seu código
- ✅ Dados do cliente são mascarados (ex: `joa***@gmail.com`)
- ✅ Endereços de entrega NÃO são exibidos
- ✅ Filtros por `firebase_uid` impedem vazamento de dados
- ✅ Conformidade com LGPD

### 📈 Relatórios Disponíveis

**No Painel do Apoiador:**
- Total de vendas no mês
- Total de vendas all-time
- Comissões pendentes/disponíveis/pagas
- Histórico completo de transações

**No Painel Admin:**
- Performance de todos os parceiros
- Vendas por parceiro (exportável)
- Comissões a pagar (relatório mensal)
- Taxa de uso de códigos apoiadores

---

## 🛠️ Tecnologias

### Backend (FastAPI + Python 3.11+)

```python
Core Framework:
├── FastAPI 0.110.1          # Framework web assíncrono de alta performance
├── Uvicorn 0.25.0           # Servidor ASGI para produção
├── Starlette 0.37.2         # Base do FastAPI (middleware, roteamento)
└── Pydantic 2.12.5          # Validação de dados e serialização

Banco de Dados:
├── Firebase Admin SDK 7.1.0 # Firestore NoSQL + Authentication
├── google-cloud-firestore   # Cliente Firestore oficial
├── Motor 3.3.1              # Driver assíncrono MongoDB (backup/cache)
└── PyMongo 4.5.0            # Driver síncrono MongoDB

Autenticação e Segurança:
├── Firebase Auth            # Sistema de autenticação principal
├── PyJWT 2.11.0            # Manipulação de tokens JWT
├── python-jose 3.5.0       # Criptografia e validação
├── BCrypt 4.1.3            # Hash de senhas
└── Cryptography 46.0.4     # Primitivas criptográficas

Pagamentos:
├── Mercado Pago SDK 2.3.0  # Gateway principal (PIX, cartão, boleto)
└── Stripe 14.3.0           # Gateway alternativo (pagamentos internacionais)

E-mails:
└── Resend ≥2.0.0           # Serviço de e-mail transacional moderno

Storage e Mídia:
├── Boto3 1.42.39           # AWS SDK (S3 para fotos/vídeos)
├── google-cloud-storage    # Google Cloud Storage (backup)
└── Pillow 12.1.0           # Processamento de imagens

QR Code:
├── qrcode 8.2              # Geração de QR Codes
└── Base64                  # Encoding para storage inline

Inteligência Artificial (Preparado para futuro):
├── OpenAI 1.99.9           # GPT-4 para biografias automáticas
├── google-generativeai     # Google Gemini AI
├── LiteLLM 1.80.0          # Wrapper unificado multi-LLM
└── huggingface_hub 1.3.7   # Modelos de ML open-source

Analytics e Dados:
├── Pandas 3.0.0            # Manipulação de dados tabulares
├── NumPy 2.4.2             # Computação numérica
└── python-dateutil         # Manipulação avançada de datas

Desenvolvimento e Qualidade:
├── Black 26.1.0            # Formatação automática de código
├── Flake8 7.3.0            # Linting e análise estática
├── MyPy 1.19.1             # Type checking estático
├── isort 7.0.0             # Organização de imports
└── Pytest 9.0.2            # Framework de testes
```

### Frontend (React + Next.js)

```typescript
Core:
├── Next.js 14+             # Framework React com SSR/SSG
├── React 18+               # Biblioteca UI
├── TypeScript 5+           # Superset tipado do JavaScript
└── Tailwind CSS 3+         # Framework CSS utility-first

State Management:
├── Zustand                 # Gerenciamento de estado global
├── React Query             # Cache e sincronização de dados servidor
└── React Hook Form         # Formulários performáticos

Validação:
└── Zod                     # Schema validation TypeScript-first

UI Components:
├── Radix UI                # Componentes acessíveis headless
├── Lucide Icons            # Biblioteca de ícones
└── shadcn/ui               # Componentes reutilizáveis

Autenticação:
└── Firebase SDK            # Auth client-side
```

### Infraestrutura e DevOps

```yaml
Cloud Services:
├── Firebase (Google Cloud)
│   ├── Authentication      # Login social (Google, Email/Password)
│   ├── Firestore          # Banco de dados NoSQL
│   └── Storage            # Armazenamento de mídia
│
├── AWS
│   ├── S3                 # Storage principal de mídia
│   ├── CloudFront         # CDN para distribuição global
│   └── SES                # Envio de e-mails (alternativa)
│
└── Vercel / Railway       # Deploy do frontend e backend

Monitoramento:
├── Firebase Analytics      # Eventos e comportamento de usuário
└── Sentry (futuro)        # Error tracking e performance

CI/CD:
├── GitHub Actions          # Automação de testes e deploy
└── Docker                 # Containerização
```

### Integrações Externas

```
Pagamentos:
└── Mercado Pago API v2    # PIX, cartão, boleto, webhooks

E-mail:
└── Resend API             # Envio transacional com templates HTML

Logística:
└── Correios API (planejado) # Rastreamento de encomendas

IA/ML (futuro):
├── OpenAI API             # Geração de biografias
└── Google Gemini API      # Análise de sentimentos em condolências
```

---

## 🏗️ Arquitetura

### Arquitetura de Alto Nível

```
┌─────────────────────────────────────────────────────────────┐
│                  FRONTEND (Next.js + React)                  │
│  ┌───────────────┐  ┌────────────────┐  ┌────────────────┐ │
│  │   Landing     │  │ User Dashboard │  │ Admin Panel    │ │
│  │   Público     │  │ (Memoriais)    │  │ (Gestão Total) │ │
│  └───────────────┘  └────────────────┘  └────────────────┘ │
│  ┌───────────────┐  ┌────────────────┐                      │
│  │   Memorial    │  │ Apoiador Panel │                      │
│  │   Público     │  │ (Vendas/$$)    │                      │
│  └───────────────┘  └────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼ HTTPS/REST
┌─────────────────────────────────────────────────────────────┐
│               BACKEND API (FastAPI + Python)                 │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  API Router (/api/*)                                    ││
│  │  ├── /auth/*          - Autenticação Firebase          ││
│  │  ├── /memorials/*     - CRUD de memoriais              ││
│  │  ├── /payments/*      - Checkout e webhooks            ││
│  │  ├── /admin/*         - Painel administrativo          ││
│  │  ├── /apoiador/*      - Painel de parceiros            ││
│  │  └── /webhooks/*      - Mercado Pago, integrações      ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │ Business Logic   │  │ Authentication   │                 │
│  │ - Pagamentos     │  │ - Firebase Auth  │                 │
│  │ - Comissões      │  │ - JWT Verify     │                 │
│  │ - E-mails        │  │ - Custom Claims  │                 │
│  │ - QR Codes       │  │ - Role-based     │                 │
│  └──────────────────┘  └──────────────────┘                 │
└─────────────────────────────────────────────────────────────┘
            │                  │                │
            ▼                  ▼                ▼
┌──────────────────┐ ┌─────────────────┐ ┌──────────────────┐
│ Firebase         │ │ Mercado Pago    │ │ AWS S3 + Resend  │
│ - Firestore      │ │ - Checkout      │ │ - Mídia Storage  │
│ - Authentication │ │ - Webhooks      │ │ - E-mail Sending │
│ - Storage        │ │ - PIX/Cartão    │ │ - QR Codes       │
└──────────────────┘ └─────────────────┘ └──────────────────┘
```

### Estrutura de Dados (Firestore Collections)

```javascript
📁 Firestore Database
├── 👤 users (firebase_uid)
│   ├── firebase_uid: string
│   ├── email: string
│   ├── name: string
│   ├── role: "user" | "admin" | "apoiador"
│   ├── phone?: string
│   ├── delivery_address?: DeliveryAddress
│   └── created_at: timestamp
│
├── 🕊️ memorials (id)
│   ├── id: uuid
│   ├── user_id: string (ref → users)
│   ├── slug: string (unique, URL-friendly)
│   ├── display_name: string (busca no console)
│   ├── status: "draft" | "published" | "cancelled"
│   ├── plan_type?: "digital" | "plaque" | "complete"
│   ├── person_data: PersonData
│   ├── content: MemorialContent
│   ├── responsible: ResponsibleData
│   ├── qr_code_url?: string (base64)
│   └── created_at/updated_at: timestamp
│
├── 💳 payments (id)
│   ├── id: uuid
│   ├── user_id: string (ref → users)
│   ├── memorial_id: string (ref → memorials)
│   ├── user_email: string
│   ├── plan_type: string
│   ├── status: ORDER_STATUS_VALUES
│   ├── amount: float (valor final)
│   ├── original_amount: float
│   ├── discount_amount: float
│   ├── supporter_id?: string (ref → partners)
│   ├── supporter_code?: string
│   ├── commission_amount: float
│   ├── commission_status?: "pending" | "available" | "paid"
│   ├── mercadopago_payment_id?: string
│   ├── tracking_code?: string
│   ├── delivery_type?: "correios" | "local"
│   ├── delivery_address_snapshot?: DeliveryAddress (imutável)
│   ├── status_history: Array<StatusChange>
│   ├── admin_notes?: string
│   ├── archived: boolean
│   └── created_at/updated_at: timestamp
│
├── 🤝 partners (id)
│   ├── id: uuid
│   ├── name: string
│   ├── email: string
│   ├── supporter_code: string (unique, uppercase)
│   ├── code: string (alias de supporter_code)
│   ├── firebase_uid?: string (ref → users)
│   ├── commission_rate: float (0.10/0.15/0.20)
│   ├── monthly_goal?: int
│   ├── status: "active" | "inactive"
│   ├── total_sales_month: int
│   ├── total_revenue_month: float
│   └── created_at/updated_at: timestamp
│
├── 💰 supporter_commissions (id)
│   ├── id: uuid
│   ├── order_id: string (ref → payments)
│   ├── partner_id: string (ref → partners)
│   ├── partner_name: string
│   ├── supporter_code: string
│   ├── commission_amount: float
│   ├── commission_status: "pending" | "available" | "paid" | "canceled"
│   ├── paid_at?: timestamp
│   ├── payment_method?: string
│   └── created_at: timestamp
│
├── 🔔 admin_notifications (id)
│   ├── id: uuid
│   ├── type: string (cancellation_request, payment_approved, etc.)
│   ├── title: string
│   ├── message: string
│   ├── priority: 1 | 2 | 3 | 4 (crítico → baixo)
│   ├── entity_type?: string
│   ├── entity_id?: string
│   ├── read: boolean
│   ├── details?: object
│   └── created_at: timestamp
│
├── 📝 admin_logs (id)
│   ├── id: uuid
│   ├── admin_uid: string (ref → users)
│   ├── admin_email: string
│   ├── action: string (update_status, cancel_order, etc.)
│   ├── entity_type: string (order, memorial, partner, etc.)
│   ├── entity_id: string
│   ├── details: object
│   └── created_at: timestamp
│
├── ⭐ reviews (id)
│   ├── id: uuid
│   ├── user_id: string (ref → users)
│   ├── user_name: string
│   ├── user_email: string
│   ├── rating: int (1-5)
│   ├── title?: string
│   ├── comment?: string
│   ├── approved: boolean
│   ├── admin_response?: string
│   └── created_at: timestamp
│
└── 💬 condolences (id)
    ├── id: uuid
    ├── memorial_id: string (ref → memorials)
    ├── message: string
    ├── sender_name?: string
    ├── relation?: string
    ├── anonymous: boolean
    └── created_at: timestamp
```

### Fluxo de Autenticação

```
┌─────────────┐
│   Cliente   │
└──────┬──────┘
       │ 1. Login (email/password ou Google)
       ▼
┌─────────────────┐
│ Firebase Auth   │ ← Retorna ID Token (JWT)
└────────┬────────┘
         │ 2. Inclui token em Authorization: Bearer {token}
         ▼
┌──────────────────────┐
│ verify_firebase_token│ ← Middleware FastAPI
└─────────┬────────────┘
          │ 3. Decodifica JWT + verifica assinatura
          │ 4. Busca custom claims (admin=true?)
          │ 5. Busca role no Firestore users/{uid}
          ▼
┌────────────────────┐
│ Endpoint Protegido │ ← Acesso liberado com user_data
└────────────────────┘
```

### Fluxo de Pagamento (Idempotente)

```
Cliente                 Backend                 Mercado Pago        Firestore
  │                        │                         │                 │
  │ POST /payments/       │                         │                 │
  │  create-checkout      │                         │                 │
  ├────────────────────►  │                         │                 │
  │                       │ POST /v1/preferences   │                 │
  │                       ├─────────────────────►   │                 │
  │                       │                         │                 │
  │ ◄────init_point────── │◄─── preference_id ───  │                 │
  │                       │                         │                 │
  │                       │ Salva payment (pending) │                 │
  │                       ├─────────────────────────┼────────────────►│
  │                       │                         │                 │
  │ [Paga no MP] ────────┼────────────────────────►│                 │
  │                       │                         │                 │
  │                       │ ◄────── WEBHOOK ─────── │                 │
  │                       │  (pode vir múltiplas    │                 │
  │                       │   vezes!)               │                 │
  │                       │                         │                 │
  │                       │ _process_approved_payment()               │
  │                       │ ┌─────────────────────┐                   │
  │                       │ │ if status in        │                   │
  │                       │ │  PAID_STATUSES:     │                   │
  │                       │ │   return False ◄────── IDEMPOTÊNCIA     │
  │                       │ │ (já processado)     │                   │
  │                       │ └─────────────────────┘                   │
  │                       │                         │                 │
  │                       │ 1. Publica memorial     │                 │
  │                       ├─────────────────────────┼────────────────►│
  │                       │ 2. Gera QR Code         │                 │
  │                       │ 3. Atualiza status      │                 │
  │                       ├─────────────────────────┼────────────────►│
  │                       │ 4. Cria notificação     │                 │
  │                       ├─────────────────────────┼────────────────►│
  │                       │ 5. Envia e-mails        │                 │
  │                       │                         │                 │
```

---

## 💻 Instalação

### Pré-requisitos

- Node.js >= 18.0.0
- PostgreSQL >= 14
- Redis >= 6.0
- Docker (opcional)
- Yarn ou npm

### Clone o Repositório

```bash
git clone https://github.com/seu-usuario/plataforma-memoriais.git
cd plataforma-memoriais
```

### Instalação com Docker (Recomendado)

```bash
# Construir e iniciar os containers
docker-compose up -d

# Executar migrations
docker-compose exec api npm run migrate

# Seed do banco de dados
docker-compose exec api npm run seed
```

### Instalação Manual

#### Backend

```bash
cd backend
npm install

# Configurar variáveis de ambiente
cp .env.example .env

# Executar migrations
npm run migrate

# Iniciar o servidor
npm run dev
```

#### Frontend

```bash
cd frontend
npm install

# Configurar variáveis de ambiente
cp .env.example .env

# Iniciar o servidor de desenvolvimento
npm run dev
```

---

## ⚙️ Configuração

### Variáveis de Ambiente - Backend

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/memoriais"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"

# AWS
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_S3_BUCKET="memoriais-bucket"
AWS_REGION="us-east-1"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-password"

# Payment
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# App
APP_URL="http://localhost:3000"
API_URL="http://localhost:4000"
```

### Variáveis de Ambiente - Frontend

```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_STRIPE_PUBLIC_KEY="pk_test_..."
```

---

## 🎯 Uso

### Para Usuários

1. **Criar um Memorial**
   ```
   - Acesse a plataforma
   - Clique em "Criar Memorial"
   - Preencha as informações
   - Adicione fotos e vídeos
   - Salve como rascunho
   ```

2. **Publicar Memorial**
   ```
   - Revise o memorial no modo de visualização
   - Escolha um plano (Digital ou Físico)
   - Realize o pagamento
   - Receba o link permanente e QR Code
   ```

3. **Acompanhar Pedido**
   ```
   - Verifique o e-mail para atualizações
   - Acesse "Meus Pedidos" no painel
   - Utilize o código de rastreamento (plano físico)
   ```

### Para Administradores

1. **Acessar Painel Admin**
   ```
   https://seusite.com/admin
   ```

2. **Gerenciar Pedidos**
   ```
   - Visualizar pedidos pendentes
   - Atualizar status de produção
   - Gerar etiquetas de envio
   - Registrar rastreamento
   ```

3. **Gerenciar Apoiadores**
   ```
   - Aprovar novos apoiadores
   - Visualizar performance
   - Configurar níveis de comissão
   ```

---

## 📡 API

### Endpoints Principais

#### Autenticação

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
```

#### Memoriais

```http
GET    /api/memorials
POST   /api/memorials
GET    /api/memorials/:id
PUT    /api/memorials/:id
DELETE /api/memorials/:id
POST   /api/memorials/:id/publish
```

#### Pedidos

```http
GET    /api/orders
POST   /api/orders
GET    /api/orders/:id
PUT    /api/orders/:id/status
GET    /api/orders/:id/tracking
```

#### Apoiadores

```http
GET    /api/supporters
POST   /api/supporters/register
GET    /api/supporters/:code/stats
POST   /api/supporters/:code/validate
```

### Exemplo de Requisição

```javascript
// Criar um memorial
const response = await fetch('/api/memorials', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'João Silva',
    birthDate: '1950-01-15',
    deathDate: '2024-03-10',
    biography: 'Uma vida dedicada à família...',
    photos: ['url1', 'url2']
  })
});
```

---

## 🔒 Política de Cancelamento

### Direito de Arrependimento

Conforme previsto no Código de Defesa do Consumidor (Lei nº 8.078/90):

- ✅ O usuário tem **7 dias corridos** para cancelar a compra
- ✅ Contados a partir da data de confirmação do pedido
- ✅ Reembolso integral do valor pago
- ❌ **Exceção**: Produtos físicos já entregues não podem ser cancelados

### Como Solicitar Cancelamento

1. Acesse "Meus Pedidos" no painel do usuário
2. Selecione o pedido desejado
3. Clique em "Solicitar Cancelamento"
4. Confirme a solicitação
5. Aguarde a confirmação por e-mail (até 48h)

### Processamento do Reembolso

- 💳 Cartão de crédito: 5-10 dias úteis
- 🏦 Outros métodos: conforme política do gateway de pagamento

---

## 🗺️ Roadmap

### Fase 1 - MVP ✅
- [x] Sistema de criação de memoriais
- [x] Sistema de usuários e autenticação
- [x] Planos de publicação
- [x] Integração com pagamento
- [x] Painel administrativo básico

### Fase 2 - Em Desenvolvimento 🚧
- [ ] Programa de apoiadores completo
- [ ] Sistema de notificações por e-mail
- [ ] Integração com Correios
- [ ] QR Code generator e personalização
- [ ] Sistema de produção de placas

### Fase 3 - Planejado 📋
- [ ] App mobile (iOS/Android)
- [ ] Sistema de comentários e homenagens
- [ ] Integração com redes sociais
- [ ] Galeria de fotos expandida
- [ ] Timeline interativa
- [ ] Sistema de doações e flores virtuais

### Fase 4 - Futuro 🔮
- [ ] IA para geração de biografias
- [ ] Realidade aumentada nos memoriais
- [ ] Blockchain para certificação de autenticidade
- [ ] Marketplace de serviços relacionados
- [ ] API pública para integrações

---

## 🤝 Contribuindo

Contribuições são sempre bem-vindas! Este projeto segue as melhores práticas de código aberto.

### Como Contribuir

1. **Fork o projeto**
2. **Crie uma branch para sua feature**
   ```bash
   git checkout -b feature/MinhaNovaFeature
   ```
3. **Commit suas mudanças**
   ```bash
   git commit -m 'Adiciona nova feature X'
   ```
4. **Push para a branch**
   ```bash
   git push origin feature/MinhaNovaFeature
   ```
5. **Abra um Pull Request**

### Diretrizes

- Siga o guia de estilo do projeto
- Escreva testes para novas funcionalidades
- Atualize a documentação quando necessário
- Mantenha commits pequenos e descritivos
- Use [Conventional Commits](https://www.conventionalcommits.org/)

### Código de Conduta

Este projeto adota o [Contributor Covenant](https://www.contributor-covenant.org/). Ao participar, você concorda em seguir seus termos.

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

```
MIT License

Copyright (c) 2024 Plataforma de Memoriais Digitais

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 📞 Contato

### Equipe do Projeto

- **Website**: [https://seusite.com](https://seusite.com)
- **Email**: contato@seusite.com
- **Suporte**: suporte@seusite.com

### Links Úteis

- 📚 [Documentação](https://docs.seusite.com)
- 🐛 [Reportar Bug](https://github.com/seu-usuario/plataforma-memoriais/issues)
- 💡 [Solicitar Feature](https://github.com/seu-usuario/plataforma-memoriais/issues)
- 💬 [Discussões](https://github.com/seu-usuario/plataforma-memoriais/discussions)

### Redes Sociais

- [LinkedIn](https://linkedin.com/company/seusite)
- [Instagram](https://instagram.com/seusite)
- [Facebook](https://facebook.com/seusite)

---

## 🙏 Agradecimentos

Agradecemos a todos que contribuíram para este projeto:

- Famílias que confiaram na plataforma para preservar memórias
- Funerárias e cemitérios parceiros
- Desenvolvedores e colaboradores open-source
- Comunidade de feedback e testes

---

## 📊 Status do Projeto

![GitHub stars](https://img.shields.io/github/stars/seu-usuario/plataforma-memoriais?style=social)
![GitHub forks](https://img.shields.io/github/forks/seu-usuario/plataforma-memoriais?style=social)
![GitHub issues](https://img.shields.io/github/issues/seu-usuario/plataforma-memoriais)
![GitHub pull requests](https://img.shields.io/github/issues-pr/seu-usuario/plataforma-memoriais)

---

<div align="center">

**Feito com ❤️ para preservar memórias**

[⬆ Voltar ao topo](#-plataforma-de-memoriais-digitais)

</div>
