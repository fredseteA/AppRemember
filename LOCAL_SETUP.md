# 🖥️ Guia de Configuração Local - Remember QRCode

Este guia explica como configurar o projeto Remember QRCode na sua máquina local após clonar do GitHub.

---

## 📋 Requisitos do Sistema

### Versões Necessárias

| Tecnologia | Versão | Comando para verificar |
|------------|--------|------------------------|
| **Python** | 3.11.x | `python --version` |
| **Node.js** | 20.x | `node --version` |
| **Yarn** | 1.22.x | `yarn --version` |
| **MongoDB** | 6.x ou 7.x | `mongod --version` |
| **Git** | 2.x | `git --version` |

### Instalação dos Requisitos

#### Windows
```powershell
# Python 3.11 - Download: https://www.python.org/downloads/release/python-3114/
# Node.js 20 - Download: https://nodejs.org/
# Yarn
npm install -g yarn
# MongoDB - Download: https://www.mongodb.com/try/download/community
```

#### macOS
```bash
# Homebrew
brew install python@3.11
brew install node@20
brew install yarn
brew install mongodb-community
```

#### Linux (Ubuntu/Debian)
```bash
# Python 3.11
sudo apt update
sudo apt install python3.11 python3.11-venv python3.11-pip

# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs

# Yarn
npm install -g yarn

# MongoDB
# Siga: https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/
```

---

## 🚀 Passo a Passo - Configuração Completa

### 1️⃣ Clonar o Repositório

```bash
git clone https://github.com/SEU_USUARIO/remember-qrcode.git
cd remember-qrcode
```

---

### 2️⃣ Configurar o Backend (Python/FastAPI)

#### 2.1 Navegar até a pasta do backend
```bash
cd backend
```

#### 2.2 Criar ambiente virtual
```bash
# Windows
python -m venv .venv
.venv\Scripts\activate

# macOS/Linux
python3.11 -m venv .venv
source .venv/bin/activate
```

#### 2.3 Atualizar pip
```bash
pip install --upgrade pip
```

#### 2.4 Instalar dependências
```bash
pip install -r requirements-prod.txt
```

#### 2.5 Criar arquivo .env
```bash
# Copiar exemplo
cp .env.example .env

# Editar com suas credenciais
# Windows: notepad .env
# macOS/Linux: nano .env
```

#### 2.6 Conteúdo do .env (preencha com seus dados)
```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="remember_qrcode"
CORS_ORIGINS="http://localhost:3000"

FIREBASE_API_KEY="sua_api_key"
FIREBASE_AUTH_DOMAIN="seu-projeto.firebaseapp.com"
FIREBASE_PROJECT_ID="seu-projeto"
FIREBASE_STORAGE_BUCKET="seu-projeto.firebasestorage.app"
FIREBASE_MESSAGING_SENDER_ID="123456789"
FIREBASE_APP_ID="1:123456789:web:abcdef"

MERCADOPAGO_PUBLIC_KEY="APP_USR-xxxxxxxx"
MERCADOPAGO_ACCESS_TOKEN="APP_USR-xxxxxxxx"

RESEND_API_KEY="re_xxxxxxxx"
ADMIN_EMAIL="seu@email.com"
SENDER_EMAIL="onboarding@resend.dev"

WHATSAPP_NUMBER="+5500000000000"
```

#### 2.7 Iniciar o MongoDB (em outro terminal)
```bash
# Windows
mongod

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

#### 2.8 Iniciar o Backend
```bash
# Com ambiente virtual ativado
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

✅ Backend rodando em: `http://localhost:8001`

---

### 3️⃣ Configurar o Frontend (React)

#### 3.1 Abrir novo terminal e navegar até a pasta do frontend
```bash
cd frontend
```

#### 3.2 Instalar dependências
```bash
yarn install
```

#### 3.3 Criar arquivo .env
```bash
# Copiar exemplo
cp .env.example .env

# Editar
# Windows: notepad .env
# macOS/Linux: nano .env
```

#### 3.4 Conteúdo do .env
```env
REACT_APP_BACKEND_URL=http://localhost:8001
REACT_APP_MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxxxxx
```

#### 3.5 Iniciar o Frontend
```bash
yarn start
```

✅ Frontend rodando em: `http://localhost:3000`

---

## 📦 Versões das Dependências

### Backend (Python)

| Pacote | Versão |
|--------|--------|
| fastapi | 0.110.1 |
| uvicorn | 0.25.0 |
| motor | 3.3.1 |
| pymongo | 4.5.0 |
| pydantic | 2.12.5 |
| firebase-admin | 7.1.0 |
| mercadopago | 2.3.0 |
| resend | 2.21.0 |
| qrcode | 8.2 |
| pillow | 12.1.0 |
| python-dotenv | 1.2.1 |
| python-multipart | 0.0.22 |
| httpx | 0.28.1 |
| requests | 2.32.5 |
| aiohttp | 3.13.3 |
| email-validator | 2.3.0 |
| python-jose | 3.5.0 |
| PyJWT | 2.11.0 |

### Frontend (Node.js/React)

| Pacote | Versão |
|--------|--------|
| react | 19.0.0 |
| react-dom | 19.0.0 |
| react-router-dom | 7.5.2 |
| axios | 1.8.4 |
| firebase | 12.8.0 |
| i18next | 25.8.0 |
| react-i18next | 15.5.1 |
| lucide-react | 0.507.0 |
| tailwindcss | 3.4.17 |
| @mercadopago/sdk-react | 1.0.7 |
| date-fns | 4.1.0 |
| react-hook-form | 7.56.2 |
| zod | 3.25.28 |
| sonner | 2.0.3 |

---

## 🔧 Comandos Úteis

### Backend
```bash
# Ativar ambiente virtual
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate

# Iniciar servidor
uvicorn server:app --reload --host 0.0.0.0 --port 8001

# Verificar se está rodando
curl http://localhost:8001/api/
```

### Frontend
```bash
# Instalar dependências
yarn install

# Iniciar desenvolvimento
yarn start

# Build para produção
yarn build
```

### MongoDB
```bash
# Conectar ao banco
mongosh

# Listar bancos
show dbs

# Usar banco do projeto
use remember_qrcode

# Listar coleções
show collections
```

---

## ⚠️ Problemas Comuns

### 1. Erro: "Python não encontrado"
```bash
# Verifique a instalação
python --version
# ou
python3 --version

# Se necessário, use python3 em vez de python
python3 -m venv .venv
```

### 2. Erro: "Module not found"
```bash
# Certifique-se que o ambiente virtual está ativado
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate

# Reinstale as dependências
pip install -r requirements-prod.txt
```

### 3. Erro: "EACCES permission denied" (Yarn/npm)
```bash
# Linux/macOS - usar sudo apenas para instalação global
sudo npm install -g yarn

# Nunca use sudo para yarn install local
```

### 4. Erro de conexão com MongoDB
```bash
# Verifique se MongoDB está rodando
# Windows
net start MongoDB

# macOS
brew services list

# Linux
sudo systemctl status mongod
```

### 5. Erro de CORS
- Verifique se `CORS_ORIGINS` no `.env` do backend inclui `http://localhost:3000`
- Verifique se o backend está rodando na porta 8001

### 6. Erro "Port already in use"
```bash
# Windows - encontrar processo na porta
netstat -ano | findstr :8001
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :8001
kill -9 <PID>
```

---

## 📁 Estrutura do Projeto

```
remember-qrcode/
├── backend/
│   ├── .venv/              # Ambiente virtual (criar localmente)
│   ├── server.py           # Código principal da API
│   ├── requirements-prod.txt # Dependências Python
│   ├── .env                # Variáveis de ambiente (criar localmente)
│   ├── .env.example        # Exemplo de variáveis
│   ├── Dockerfile          # Para deploy no Fly.io
│   └── fly.toml            # Config do Fly.io
│
├── frontend/
│   ├── node_modules/       # Dependências (criado pelo yarn)
│   ├── public/             # Arquivos públicos
│   ├── src/                # Código fonte React
│   ├── package.json        # Dependências Node
│   ├── .env                # Variáveis de ambiente (criar localmente)
│   ├── .env.example        # Exemplo de variáveis
│   └── vercel.json         # Config da Vercel
│
├── DEPLOY_GUIDE.md         # Guia de deploy
└── LOCAL_SETUP.md          # Este arquivo
```

---

## ✅ Checklist de Configuração

- [ ] Python 3.11 instalado
- [ ] Node.js 20 instalado
- [ ] Yarn instalado
- [ ] MongoDB instalado e rodando
- [ ] Repositório clonado
- [ ] Ambiente virtual criado e ativado
- [ ] Dependências do backend instaladas
- [ ] Arquivo .env do backend configurado
- [ ] Backend rodando na porta 8001
- [ ] Dependências do frontend instaladas
- [ ] Arquivo .env do frontend configurado
- [ ] Frontend rodando na porta 3000
- [ ] Acessar http://localhost:3000 com sucesso

---

## 🎉 Pronto!

Se seguiu todos os passos, você terá:
- Backend rodando em `http://localhost:8001`
- Frontend rodando em `http://localhost:3000`

Acesse `http://localhost:3000` no navegador para usar a aplicação!
