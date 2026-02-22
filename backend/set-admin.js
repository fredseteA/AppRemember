#!/usr/bin/env node

/**
 * Script para definir usuário como admin usando Firebase Admin SDK
 * 
 * Uso: node set-admin.js email@exemplo.com
 * 
 * Pré-requisitos:
 * 1. Service Account JSON do Firebase Console
 * 2. Salvar arquivo como: /app/backend/firebase-admin-key.json
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Caminho para o arquivo de credenciais
const serviceAccountPath = path.join(__dirname, 'firebase-admin-key.json');

async function setAdminClaim(email) {
  try {
    // Verificar se arquivo de credenciais existe
    if (!fs.existsSync(serviceAccountPath)) {
      console.error('\n❌ ERRO: Arquivo de credenciais não encontrado!\n');
      console.log('Por favor, siga estes passos:\n');
      console.log('1. Acesse: https://console.firebase.google.com/');
      console.log('2. Selecione projeto: remember-qr-code');
      console.log('3. Vá em: Project Settings → Service Accounts');
      console.log('4. Clique em: "Generate new private key"');
      console.log('5. Baixe o arquivo JSON');
      console.log(`6. Salve como: ${serviceAccountPath}\n`);
      process.exit(1);
    }

    // Inicializar Firebase Admin SDK
    const serviceAccount = require(serviceAccountPath);
    
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }

    console.log(`\n🔍 Buscando usuário: ${email}...`);

    // Buscar usuário pelo email
    const user = await admin.auth().getUserByEmail(email);

    console.log(`✓ Usuário encontrado: ${user.uid}`);

    // Definir custom claim admin=true
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });

    console.log('\n✅ SUCESSO! Usuário agora é ADMIN\n');
    console.log(`   Email: ${email}`);
    console.log(`   UID: ${user.uid}`);
    console.log(`   Custom Claims: { admin: true }\n`);
    
    console.log('⚠️  IMPORTANTE:\n');
    console.log('O usuário DEVE fazer LOGOUT e LOGIN novamente');
    console.log('para que o novo token com permissões de admin seja gerado.\n');
    
    console.log('📝 Próximos passos:\n');
    console.log('1. Acesse: http://localhost:3000');
    console.log('2. Faça LOGOUT (clique no ícone do usuário → Sair)');
    console.log('3. Faça LOGIN novamente com este email');
    console.log('4. Acesse: http://localhost:3000/admin\n');

    process.exit(0);

  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.error(`\n❌ ERRO: Usuário '${email}' não encontrado no Firebase!\n`);
      console.log('Certifique-se de que o usuário está cadastrado:\n');
      console.log('1. Acesse: http://localhost:3000');
      console.log('2. Clique em "Entrar"');
      console.log('3. Cadastre-se com este email');
      console.log('4. Execute este script novamente\n');
    } else {
      console.error('\n❌ ERRO:', error.message, '\n');
    }
    process.exit(1);
  }
}

// Verificar argumentos
if (process.argv.length < 3) {
  console.error('\n❌ Uso: node set-admin.js email@exemplo.com\n');
  console.log('Exemplo:');
  console.log('  node set-admin.js admin@rememberqrcode.com\n');
  process.exit(1);
}

const email = process.argv[2];
setAdminClaim(email);
