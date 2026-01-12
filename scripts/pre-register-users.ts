/**
 * Script para pré-cadastrar usuários no sistema
 * Execute com: npx tsx scripts/pre-register-users.ts
 */

import { createPreRegisteredUser } from '../lib/db';

async function main() {
  // Lista de usuários para pré-cadastrar (apenas Instagram)
  const usersToRegister = [
    'usuario1',
    'usuario2',
    'usuario3',
    // Adicione mais usuários aqui
  ];

  console.log('🚀 Pré-cadastrando usuários...\n');

  for (const instagram of usersToRegister) {
    try {
      const user = await createPreRegisteredUser(instagram);
      console.log(`✅ Usuário @${instagram} pré-cadastrado com sucesso (ID: ${user.id})`);
    } catch (error: any) {
      if (error.message === 'Usuário já existe') {
        console.log(`⚠️  Usuário @${instagram} já está cadastrado`);
      } else {
        console.error(`❌ Erro ao pré-cadastrar @${instagram}:`, error.message);
      }
    }
  }

  console.log('\n✨ Processo concluído!');
  console.log('💡 Os usuários pré-cadastrados agora podem acessar /signup para definir suas senhas.');
}

main().catch(console.error);
