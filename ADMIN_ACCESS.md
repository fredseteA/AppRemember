# 🔐 Como Acessar o Painel Admin

## ⚠️ IMPORTANTE: Sistema baseado em Firebase Custom Claims

O controle de acesso ao painel admin é feito **exclusivamente via Firebase Custom Claims**.
**NÃO** usamos MongoDB para controlar permissões de administrador.

---

## 📋 Pré-requisitos

### 1. Obter Credenciais do Firebase Admin SDK

Você precisa do arquivo **Service Account JSON** do Firebase:

**Passo a passo:**

1. Acesse: https://console.firebase.google.com/
2. Selecione seu projeto: **remember-qr-code**
3. Clique no ⚙️ ícone de configurações → **Project Settings**
4. Vá na aba: **Service Accounts**
5. Clique em: **Generate new private key**
6. Clique em: **Generate key** (vai baixar um arquivo JSON)
7. Salve o arquivo baixado como:
   ```
   /app/backend/firebase-admin-key.json
   ```

⚠️ **Mantenha este arquivo seguro! Não compartilhe e não faça commit no Git!**

---

## 🚀 Como Tornar um Usuário Admin

### Passo 1: Cadastre o usuário no site

Antes de executar o script, o usuário precisa estar cadastrado:

1. Acesse: http://localhost:3000
2. Clique em **"Entrar"**
3. Clique em **"Cadastrar"**
4. Cadastre-se com o email que deseja tornar admin
   - Exemplo: `admin@rememberqrcode.com`

### Passo 2: Execute o script

```bash
cd /app/backend
node set-admin.js admin@rememberqrcode.com
```

**Saída esperada:**
```
🔍 Buscando usuário: admin@rememberqrcode.com...
✓ Usuário encontrado: abc123xyz

✅ SUCESSO! Usuário agora é ADMIN

   Email: admin@rememberqrcode.com
   UID: abc123xyz
   Custom Claims: { admin: true }

⚠️  IMPORTANTE:
O usuário DEVE fazer LOGOUT e LOGIN novamente
para que o novo token com permissões de admin seja gerado.
```

### Passo 3: Logout e Login

**CRÍTICO:** Você DEVE fazer logout e login para atualizar o token!

1. No site, clique no ícone do usuário (canto superior direito)
2. Clique em **"Sair"**
3. Faça **LOGIN** novamente com o mesmo email

### Passo 4: Acesse o Painel Admin

Agora você pode acessar:
- URL direta: http://localhost:3000/admin
- Ou clique no menu do usuário → **"Admin"**

---

## ✅ Verificação

### Como saber se funcionou?

Após fazer login como admin, você verá:

✅ **No menu do usuário:**
- Opção "Admin" aparece na lista

✅ **No painel `/admin`:**
- Dashboard com estatísticas:
  - Total de memoriais criados
  - Total de pedidos/pagamentos
  - Total de placas vendidas
- Aba **"Pedidos"**: Lista todos os pagamentos
- Aba **"Memoriais"**: Galeria de todos os memoriais
- Opção de atualizar status de pedidos

---

## 🐛 Troubleshooting

### ❌ "Arquivo de credenciais não encontrado"

**Problema:** O arquivo `firebase-admin-key.json` não existe.

**Solução:**
1. Baixe o Service Account JSON do Firebase Console (veja seção "Pré-requisitos")
2. Salve como `/app/backend/firebase-admin-key.json`
3. Execute o script novamente

---

### ❌ "Usuário não encontrado no Firebase"

**Problema:** O email não está cadastrado.

**Solução:**
1. Acesse http://localhost:3000
2. Cadastre-se com o email desejado
3. Execute o script novamente

---

### ❌ "Admin access required" ao acessar /admin

**Problema:** Token não foi atualizado com as novas permissões.

**Solução:**
1. Faça **LOGOUT** completo (clique em "Sair")
2. Faça **LOGIN** novamente com o mesmo email
3. Tente acessar `/admin` novamente

**Por que isso acontece?**
- Custom claims são armazenados no token JWT
- O token é gerado no momento do login
- Logout/Login força a geração de um novo token com as claims atualizadas

---

### ❌ Opção "Admin" não aparece no menu

**Solução:**
1. Abra o console do navegador (F12)
2. Verifique se há erros JavaScript
3. Limpe o cache do navegador
4. Faça logout e login novamente
5. Recarregue a página (Ctrl+F5 ou Cmd+Shift+R)

---

## 🔒 Como Funciona (Técnico)

### Backend (`/app/backend/server.py`)

```python
async def verify_admin(token_data: dict = Depends(verify_firebase_token)):
    """Verifica se o usuário tem custom claim admin=true"""
    if not token_data.get("admin", False):
        raise HTTPException(status_code=403, detail="Admin access required")
    return token_data
```

- Decodifica token JWT do Firebase
- Verifica se `admin === true` nos custom claims
- Bloqueia acesso se não for admin

### Frontend (`/app/frontend/src/contexts/AuthContext.js`)

```javascript
const tokenResult = await firebaseUser.getIdTokenResult();
const isAdmin = tokenResult.claims.admin || false;
```

- Obtém custom claims do Firebase
- Atualiza estado do usuário com `is_admin`
- Mostra/oculta opção "Admin" no menu

### Rota Protegida (`/app/frontend/src/App.js`)

```javascript
<Route path="/admin" element={
  <AdminRoute>
    <Admin />
  </AdminRoute>
} />
```

- `AdminRoute` verifica se `user.is_admin === true`
- Redireciona para home se não for admin

---

## 📊 Funcionalidades do Painel Admin

### 📈 Dashboard
- Estatísticas em tempo real
- Total de memoriais publicados
- Total de pedidos realizados
- Total de placas vendidas

### 📦 Gestão de Pedidos
- Visualizar todos os pagamentos
- Filtrar por status:
  - Pendente
  - Aprovado
  - Em Produção
  - Enviado
  - Entregue
- Atualizar status manualmente
- Ver detalhes do comprador
- Ver memorial associado

### 💐 Gestão de Memoriais
- Listar todos os memoriais (públicos e privados)
- Ver status (draft/published)
- Visualizar fotos e informações
- Identificar criador de cada memorial

---

## 🔐 Segurança

✅ **Firebase Custom Claims**
- Armazenados no token JWT (não no MongoDB)
- Não podem ser alterados pelo cliente
- Verificados no backend em cada requisição
- Método mais seguro e recomendado pelo Firebase

✅ **Proteção de Rota**
- Backend valida token em todas as rotas `/api/admin/*`
- Frontend valida custom claim antes de renderizar
- Redirecionamento automático se não autorizado

✅ **Service Account**
- Credenciais Firebase mantidas no servidor
- Não expostas ao cliente
- Acesso controlado apenas por scripts backend

---

## 📝 Comandos Úteis

### Definir usuário como admin
```bash
cd /app/backend
node set-admin.js usuario@email.com
```

### Verificar custom claims (via Firebase Console)
1. Acesse Firebase Console
2. Authentication → Users
3. Clique no usuário
4. Veja a seção "Custom Claims"

### Remover permissões de admin
```javascript
// Executar em set-admin.js modificado:
await admin.auth().setCustomUserClaims(user.uid, { admin: false });
```

---

## ✅ Checklist Final

Antes de tentar acessar o painel admin:

- [ ] Service Account JSON baixado e salvo em `/app/backend/firebase-admin-key.json`
- [ ] Usuário cadastrado no site (http://localhost:3000)
- [ ] Script executado: `node set-admin.js email@exemplo.com`
- [ ] Mensagem de sucesso exibida
- [ ] Logout realizado no site
- [ ] Login realizado novamente
- [ ] Tentar acessar: http://localhost:3000/admin

---

## 🆘 Suporte

Se ainda tiver problemas:

1. Verifique logs do backend:
   ```bash
   tail -f /var/log/supervisor/backend.*.log
   ```

2. Verifique console do navegador (F12)

3. Confirme que o arquivo de credenciais está correto:
   ```bash
   cat /app/backend/firebase-admin-key.json | head -5
   ```

4. Teste a autenticação:
   ```bash
   # Ver se token tem custom claims
   # No console do navegador:
   firebase.auth().currentUser.getIdTokenResult()
     .then(token => console.log(token.claims))
   ```
