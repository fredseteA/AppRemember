# 🕊️ Digital Memorials Platform

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-in%20development-yellow.svg)]()
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)]()

> A comprehensive web platform for creating, managing, and publishing personalized digital memorials, connecting physical and digital memories through QR Code technology.

**English** | [Versão em Português](README.pt-BR.md)

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
- [Usage](#-usage)
- [API](#-api)
- [Cancellation Policy](#-cancellation-policy)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

---

## 🌟 About the Project

The **Digital Memorials Platform** is an innovative solution that enables the creation and preservation of memories through personalized digital memorials. Combining modern web technology with physical products, the platform offers a complete experience to honor and remember loved ones.

### ✨ Key Features

- 🆓 **Free Creation**: Create memorials at no initial cost
- 🔗 **Permanent Link**: Unique and permanent URLs for each memorial
- 📱 **Personalized QR Code**: Quick access through unique QR code
- 🏛️ **Physical Plaque**: Optional stainless steel plaque for physical locations
- 📧 **Complete Tracking**: Email notifications at each step
- 🤝 **Partnership Program**: Supporter system for funeral homes and cemeteries

---

## 🚀 Features

### For Users

- ✅ **Memorial Creation**
  - Intuitive interface for creating memorials
  - Draft system for editing before publication
  - Complete content customization
  - Photo and video uploads
  - Life timeline
  
- ✅ **Memorial Management**
  - Preview before publication
  - Draft memorial editing
  - Privacy controls
  
- ✅ **Email Notifications**
  - Memorial created
  - Order confirmed
  - Order in production
  - Product completed
  - Order shipped (with tracking)
  - Order delivered

### For Administrators

- 🎛️ **Complete Admin Panel**
  - Memorial management
  - Order control and status
  - Production tracking
  - Shipping and logistics management
  - User administration
  - Plans and payments control
  - Reports and analytics
  - Supporter program management

### For Supporters (Partners)

- 🤝 **Partnership System**
  - Exclusive support code
  - Sales tracking dashboard
  - Commission management
  - Performance reports

---

## 💎 Publishing Plans

### 📱 Digital Plan

**Benefits:**
- Official publication of the memorial on the platform
- Exclusive and permanent link
- Personalized QR Code
- Unlimited access to the memorial
- Future updates and edits

**Ideal for:**
- Exclusively digital memorials
- Social media sharing
- Geographically distributed families

---

### 🏛️ Physical Plan

**All Digital Plan benefits +**
- High-quality stainless steel physical plaque
- Permanently engraved QR Code
- Installation at chosen location (grave, memorial, tomb, etc.)
- Weather-resistant material
- Elegant and discreet design

**Ideal for:**
- Graves and tombs
- Physical memorials
- Cemeteries and memorial gardens
- Permanent tribute locations

---

## 🤝 Supporter Program

Strategic partnership system designed for **funeral homes, cemeteries, and funeral service providers**.

### How It Works

1. **Register as a Supporter**
   - Platform registration as a partner
   - Receive exclusive support code

2. **Benefits for Clients**
   - Client uses the supporter's code
   - Receives **5% discount** on purchase

3. **Tiered Commission System**

| Monthly Volume | Commission |
|---------------|-----------|
| Initial standard | 10% |
| High volume | 15% |
| Premium volume | 20% |

### Program Advantages

**For Supporters:**
- 💰 Additional revenue source
- 🎯 Value addition to services offered
- 📊 Control panel and reports
- 🏆 Progressive commissions

**For the Platform:**
- 🌐 Expanded reach
- 🤝 Strategic partnerships
- 📈 Sustainable growth
- 🎓 Collaborative ecosystem

---

## 🛠️ Technologies

### Frontend

```
- React.js / Next.js
- TypeScript
- Tailwind CSS
- React Query
- Zustand (State Management)
- React Hook Form
- Zod (Validation)
```

### Backend

```
- Node.js
- Express.js / Nest.js
- TypeScript
- Prisma ORM
- PostgreSQL
- Redis (Cache)
- JWT (Authentication)
```

### Infrastructure

```
- Docker
- AWS S3 (Media Storage)
- AWS SES (Emails)
- AWS CloudFront (CDN)
- GitHub Actions (CI/CD)
```

### External Services

```
- Stripe / MercadoPago (Payments)
- Postal Service API (Tracking)
- QR Code Generator
- Email sending system
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      FRONTEND (Next.js)                  │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │   Public    │  │     User     │  │     Admin     │  │
│  │  (Landing)  │  │  (Dashboard) │  │    (Panel)    │  │
│  └─────────────┘  └──────────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    API REST / GraphQL                    │
└─────────────────────────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                ▼                       ▼
┌──────────────────────┐    ┌──────────────────────┐
│   Business Logic     │    │   Authentication     │
│   - Memorials        │    │   - JWT              │
│   - Orders           │    │   - OAuth            │
│   - Supporters       │    │   - Permissions      │
└──────────────────────┘    └──────────────────────┘
                │
    ┌───────────┼───────────┬───────────┐
    ▼           ▼           ▼           ▼
┌────────┐ ┌────────┐ ┌─────────┐ ┌──────────┐
│PostgreSQL Redis  │ │   AWS   │ │ Payment  │
│  (DB)  │ (Cache)│ │   S3    │ │ Gateway  │
└────────┘ └────────┘ └─────────┘ └──────────┘
```

---

## 💻 Installation

### Prerequisites

- Node.js >= 18.0.0
- PostgreSQL >= 14
- Redis >= 6.0
- Docker (optional)
- Yarn or npm

### Clone the Repository

```bash
git clone https://github.com/your-username/digital-memorials-platform.git
cd digital-memorials-platform
```

### Docker Installation (Recommended)

```bash
# Build and start containers
docker-compose up -d

# Run migrations
docker-compose exec api npm run migrate

# Seed the database
docker-compose exec api npm run seed
```

### Manual Installation

#### Backend

```bash
cd backend
npm install

# Configure environment variables
cp .env.example .env

# Run migrations
npm run migrate

# Start the server
npm run dev
```

#### Frontend

```bash
cd frontend
npm install

# Configure environment variables
cp .env.example .env

# Start development server
npm run dev
```

---

## ⚙️ Configuration

### Backend Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/memorials"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"

# AWS
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_S3_BUCKET="memorials-bucket"
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

### Frontend Environment Variables

```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_STRIPE_PUBLIC_KEY="pk_test_..."
```

---

## 🎯 Usage

### For Users

1. **Create a Memorial**
   ```
   - Access the platform
   - Click "Create Memorial"
   - Fill in the information
   - Add photos and videos
   - Save as draft
   ```

2. **Publish Memorial**
   ```
   - Review the memorial in preview mode
   - Choose a plan (Digital or Physical)
   - Complete payment
   - Receive permanent link and QR Code
   ```

3. **Track Order**
   ```
   - Check email for updates
   - Access "My Orders" in the panel
   - Use tracking code (physical plan)
   ```

### For Administrators

1. **Access Admin Panel**
   ```
   https://yoursite.com/admin
   ```

2. **Manage Orders**
   ```
   - View pending orders
   - Update production status
   - Generate shipping labels
   - Register tracking
   ```

3. **Manage Supporters**
   ```
   - Approve new supporters
   - View performance
   - Configure commission levels
   ```

---

## 📡 API

### Main Endpoints

#### Authentication

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
```

#### Memorials

```http
GET    /api/memorials
POST   /api/memorials
GET    /api/memorials/:id
PUT    /api/memorials/:id
DELETE /api/memorials/:id
POST   /api/memorials/:id/publish
```

#### Orders

```http
GET    /api/orders
POST   /api/orders
GET    /api/orders/:id
PUT    /api/orders/:id/status
GET    /api/orders/:id/tracking
```

#### Supporters

```http
GET    /api/supporters
POST   /api/supporters/register
GET    /api/supporters/:code/stats
POST   /api/supporters/:code/validate
```

### Request Example

```javascript
// Create a memorial
const response = await fetch('/api/memorials', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'John Smith',
    birthDate: '1950-01-15',
    deathDate: '2024-03-10',
    biography: 'A life dedicated to family...',
    photos: ['url1', 'url2']
  })
});
```

---

## 🔒 Cancellation Policy

### Right of Withdrawal

In accordance with Consumer Protection Code:

- ✅ Users have **7 calendar days** to cancel the purchase
- ✅ Counted from the order confirmation date
- ✅ Full refund of amount paid
- ❌ **Exception**: Physical products already delivered cannot be cancelled

### How to Request Cancellation

1. Access "My Orders" in the user panel
2. Select the desired order
3. Click "Request Cancellation"
4. Confirm the request
5. Wait for email confirmation (up to 48h)

### Refund Processing

- 💳 Credit card: 5-10 business days
- 🏦 Other methods: according to payment gateway policy

---

## 🗺️ Roadmap

### Phase 1 - MVP ✅
- [x] Memorial creation system
- [x] User and authentication system
- [x] Publishing plans
- [x] Payment integration
- [x] Basic admin panel

### Phase 2 - In Development 🚧
- [ ] Complete supporter program
- [ ] Email notification system
- [ ] Postal service integration
- [ ] QR Code generator and customization
- [ ] Plaque production system

### Phase 3 - Planned 📋
- [ ] Mobile app (iOS/Android)
- [ ] Comments and tributes system
- [ ] Social media integration
- [ ] Expanded photo gallery
- [ ] Interactive timeline
- [ ] Virtual donations and flowers system

### Phase 4 - Future 🔮
- [ ] AI for biography generation
- [ ] Augmented reality in memorials
- [ ] Blockchain for authenticity certification
- [ ] Related services marketplace
- [ ] Public API for integrations

---

## 🤝 Contributing

Contributions are always welcome! This project follows open source best practices.

### How to Contribute

1. **Fork the project**
2. **Create a branch for your feature**
   ```bash
   git checkout -b feature/MyNewFeature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add new feature X'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/MyNewFeature
   ```
5. **Open a Pull Request**

### Guidelines

- Follow the project's style guide
- Write tests for new features
- Update documentation when necessary
- Keep commits small and descriptive
- Use [Conventional Commits](https://www.conventionalcommits.org/)

### Code of Conduct

This project adopts the [Contributor Covenant](https://www.contributor-covenant.org/). By participating, you agree to follow its terms.

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 Digital Memorials Platform

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

## 📞 Contact

### Project Team

- **Website**: [https://yoursite.com](https://yoursite.com)
- **Email**: contact@yoursite.com
- **Support**: support@yoursite.com

### Useful Links

- 📚 [Documentation](https://docs.yoursite.com)
- 🐛 [Report Bug](https://github.com/your-username/digital-memorials-platform/issues)
- 💡 [Request Feature](https://github.com/your-username/digital-memorials-platform/issues)
- 💬 [Discussions](https://github.com/your-username/digital-memorials-platform/discussions)

### Social Media

- [LinkedIn](https://linkedin.com/company/yoursite)
- [Instagram](https://instagram.com/yoursite)
- [Facebook](https://facebook.com/yoursite)

---

## 🙏 Acknowledgments

We thank everyone who contributed to this project:

- Families who trusted the platform to preserve memories
- Partner funeral homes and cemeteries
- Developers and open-source contributors
- Feedback and testing community

---

## 📊 Project Status

![GitHub stars](https://img.shields.io/github/stars/your-username/digital-memorials-platform?style=social)
![GitHub forks](https://img.shields.io/github/forks/your-username/digital-memorials-platform?style=social)
![GitHub issues](https://img.shields.io/github/issues/your-username/digital-memorials-platform)
![GitHub pull requests](https://img.shields.io/github/issues-pr/your-username/digital-memorials-platform)

---

<div align="center">

**Made with ❤️ to preserve memories**

[⬆ Back to top](#-digital-memorials-platform)

</div>
