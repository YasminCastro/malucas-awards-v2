/**
 * Script para pré-cadastrar usuários no sistema
 * Execute com: npx tsx scripts/pre-register-users.ts
 */

import { createPreRegisteredUser } from '../lib/db';

async function main() {
  // Lista de usuários para pré-cadastrar
  // Obs: agora é obrigatório informar o nome.
  const usersToRegister: Array<{
    instagram: string;
    name: string;
    isAdmin?: boolean;
  }> = [
    { instagram: "usuario1", name: "Usuário 1" },
    { instagram: "usuario2", name: "Usuário 2" },
    { instagram: "usuario3", name: "Usuário 3" },
    // Adicione mais usuários aqui
  ];

  console.log('🚀 Pré-cadastrando usuários...\n');

  for (const { instagram, name, isAdmin } of usersToRegister) {
    try {
      const user = await createPreRegisteredUser(instagram, name, Boolean(isAdmin));
      console.log(
        `✅ Usuário ${user.name ? `${user.name} ` : ""}@${instagram} pré-cadastrado com sucesso (ID: ${user._id})`
      );
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
