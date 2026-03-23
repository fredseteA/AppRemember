# 🕊️ Remember QRCode - Digital Memorials Platform

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-green.svg)](https://fastapi.tiangolo.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange.svg)](https://firebase.google.com/)
[![Status](https://img.shields.io/badge/status-production-brightgreen.svg)]()

> Complete B2B2C SaaS platform for creating, managing, and publishing personalized digital memorials, connecting physical and digital memories through QR Code technology with an affiliate system for funeral homes and cemeteries.

**English** | [Versão em Português](README.pt-BR.md)

🌐 **Production**: [rememberqr.online](https://rememberqr.online)

---

## 📋 Table of Contents

- [About the Project](#-about-the-project)
- [Features](#-features)
- [Publishing Plans](#-publishing-plans)
- [Supporter Program](#-supporter-program)
- [Technologies](#-technologies)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [API](#-api)
- [Business Flows](#-business-flows)
- [Cancellation Policy](#-cancellation-policy)
- [Roadmap](#-roadmap)
- [License](#-license)
- [Contact](#-contact)

---

## 🌟 About the Project

**Remember QRCode** is a complete SaaS platform that revolutionizes memory preservation by combining:

- **B2C** → End customers creating memorials for loved ones
- **B2B** → Strategic partnerships with funeral homes and cemeteries through affiliate system
- **Admin** → Complete management panel for production and analytics

### 💡 How It Works

1. **Free Creation**: Anyone can create a digital memorial for free
2. **Draft System**: Memorial stays saved as draft, allowing unlimited edits
3. **Paid Publication**: After content approval, choose a plan for official publication
4. **Unique QR Code**: Each published memorial receives an exclusive, permanent QR Code
5. **Physical Plaque (Optional)**: Stainless steel plaques with engraved QR Code for installation on graves

### ✨ Technical Differentiators

- 🔐 **Firebase Authentication**: Robust system with custom claims (user/supporter/admin)
- 💳 **Automated Payments**: Mercado Pago integration with idempotent webhooks
- 📊 **Complete Analytics**: Real-time dashboard with financial and operational metrics
- 🤝 **Affiliate System**: Automatic commissions for partners with 3 tiers (10%/15%/20%)
- 📧 **Transactional Emails**: HTML templates via Resend for each order stage
- 🔄 **Idempotent Processing**: Webhooks can be received multiple times without duplicating data
- 📝 **Complete Auditing**: Detailed logs of all administrative actions
- 🎯 **Prioritized Notifications**: Alert system with urgency levels (critical/high/normal/low)
- 🌐 **Bilingual**: Full PT/EN support via react-i18next with animated flag switcher

---

## 🚀 Features

### For Users

- ✅ **Memorial Creation** — Intuitive 3-step form with photo crop, gallery and audio upload
- ✅ **Draft System** — Edit freely before publishing
- ✅ **Preview** — See the full memorial before choosing a plan
- ✅ **Memorial Management** — Edit, visibility controls, gallery management
- ✅ **Condolences** — Leave and view condolence messages with preset or custom text
- ✅ **Email Notifications** — Order confirmed, in production, shipped (with tracking), delivered

### For Administrators

- ✅ **Complete Admin Panel** — Memorial, order, production, shipping and user management
- ✅ **Financial Dashboard** — Revenue, profit, cost tracking in real time
- ✅ **Supporter Management** — Approve partners, view performance, configure commission tiers
- ✅ **QR Code Generator** — PNG (high-res), PDF (print-ready 50×50mm), SVG (vectorized)
- ✅ **Prioritized Notifications** — Critical alerts for payments, orders and system events
- ✅ **Audit Logs** — Full history of all administrative actions

### For Supporters (Partners)

- ✅ **Exclusive Affiliate Code** — Share code for client discounts
- ✅ **Sales Dashboard** — Track commissions and performance
- ✅ **Tiered Commissions** — Automatic tier upgrades based on volume

---

## 💎 Publishing Plans

### 📱 Digital Plan — R$ 29,90

- Official publication with permanent link
- Personalized QR Code
- Unlimited access and future edits
- Ideal for online-only memorials

### 🏛️ Physical Plan — R$ 149,90

- Everything in the Digital Plan
- High-quality stainless steel plaque
- Permanently engraved QR Code
- Shipping across Brazil with tracking
- Ideal for graves, tombs and memorial gardens

---

## 🤝 Supporter Program

Strategic partnership system for **funeral homes, cemeteries, and funeral service providers**.

| Monthly Volume | Commission |
|---------------|-----------|
| Standard | 10% |
| High volume | 15% |
| Premium volume | 20% |

- Clients using a supporter code receive **5% discount**
- Supporters access a dedicated dashboard with sales and commission reports

---

## 🛠️ Technologies

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

### Infrastructure
```
Vercel (frontend) · Fly.io (backend) · Firebase (auth + database)
Firebase Storage (media) · GitHub Actions (CI/CD)
```

---

## 🏗️ Architecture
```
┌─────────────────────────────────────────────────────────┐
│              FRONTEND — React + Vite (Vercel)           │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │   Public    │  │     User     │  │     Admin     │  │
│  │  (Landing)  │  │  (Dashboard) │  │    (Panel)    │  │
│  └─────────────┘  └──────────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│           BACKEND — FastAPI (Fly.io · GRU region)       │
│   Routers: auth · memorials · payments · admin          │
│            reviews · affiliate                          │
└─────────────────────────────────────────────────────────┘
                            │
          ┌─────────────────┼─────────────────┐
          ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────────┐  ┌──────────────┐
│   Firestore  │  │  Firebase Auth   │  │   Firebase   │
│  (Database)  │  │  (custom claims) │  │   Storage    │
└──────────────┘  └──────────────────┘  └──────────────┘
          │                                    │
          ▼                                    ▼
┌──────────────┐                    ┌──────────────────┐
│ Mercado Pago │                    │  Resend (email)  │
│  (payments   │                    │  HTML templates  │
│  + webhooks) │                    └──────────────────┘
└──────────────┘
```

---

## 💻 Installation

### Prerequisites

- Node.js >= 18
- Python >= 3.11
- Firebase project with Firestore enabled
- Mercado Pago account
- Resend account

### Clone the Repository
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

## ⚙️ Configuration

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

### Main Endpoints
```http
# Auth
POST   /auth/verify

# Memorials
GET    /memorials/explore
POST   /memorials
GET    /memorials/:id
PUT    /memorials/:id
GET    /memorials/by-slug/:slug

# Payments
POST   /payments/create-checkout
POST   /webhooks/mercadopago

# Admin
GET    /admin/dashboard
GET    /admin/orders
PUT    /admin/orders/:id/status

# Supporters
GET    /supporters/validate/:code
GET    /affiliate/dashboard

# Reviews & Condolences
GET    /reviews
POST   /reviews
GET    /memorials/:id/condolences
POST   /memorials/:id/condolences
```

---

## 🔒 Cancellation Policy

- ✅ **7 calendar days** right of withdrawal from order confirmation
- ✅ Full refund processed via Mercado Pago
- ❌ Physical products already shipped cannot be cancelled

---

## 🗺️ Roadmap

### Phase 1 - Core Platform ✅
- [x] Memorial creation with 3-step form and photo crop
- [x] Draft and preview system
- [x] Firebase authentication with custom claims
- [x] Mercado Pago payment integration with webhooks
- [x] Digital and physical publishing plans
- [x] QR Code generation (PNG, PDF, SVG)

### Phase 2 - Operations & Partnerships ✅
- [x] Complete admin panel with financial dashboard
- [x] Production and shipping order management
- [x] Transactional email system via Resend
- [x] Affiliate/supporter program with tiered commissions
- [x] Condolences system with preset messages
- [x] Reviews and testimonials system
- [x] Prioritized notification system
- [x] Complete audit logs

### Phase 3 - Bilingual & Polish ✅
- [x] Full PT/EN bilingual system via react-i18next
- [x] Animated flag language switcher
- [x] All pages and components translated

### Phase 4 - Planned 📋
- [ ] Mobile app (iOS/Android)
- [ ] AI-assisted biography generation
- [ ] Interactive life timeline
- [ ] Virtual donations and flowers
- [ ] Augmented reality memorial viewer

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 📞 Contact

- 🌐 **Website**: [rememberqr.online](https://rememberqr.online)
- 📧 **Email**: [rememberqrcode@gmail.com](mailto:rememberqrcode@gmail.com)
- 💬 **WhatsApp**: [(22) 99208-0811](https://wa.me/5522992080811)
- 🐙 **GitHub**: [fredseteA](https://github.com/fredseteA)

---

<div align="center">

**Made with ❤️ to preserve memories forever**

[⬆ Back to top](#-remember-qrcode---digital-memorials-platform)

</div>