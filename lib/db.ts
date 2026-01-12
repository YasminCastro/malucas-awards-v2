import { User } from './auth';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const DB_PATH = join(process.cwd(), 'data', 'users.json');

// Garantir que o diretório existe
async function ensureDbExists() {
  try {
    await readFile(DB_PATH);
  } catch {
    // Arquivo não existe, criar estrutura inicial
    await writeFile(DB_PATH, JSON.stringify([], null, 2), 'utf-8');
  }
}

// Ler usuários do arquivo
export async function getUsers(): Promise<User[]> {
  await ensureDbExists();
  const data = await readFile(DB_PATH, 'utf-8');
  const users = JSON.parse(data);
  
  // Converter datas de string para Date
  return users.map((user: any) => ({
    ...user,
    createdAt: new Date(user.createdAt),
  }));
}

// Salvar usuários no arquivo
export async function saveUsers(users: User[]): Promise<void> {
  await ensureDbExists();
  await writeFile(DB_PATH, JSON.stringify(users, null, 2), 'utf-8');
}

// Buscar usuário por Instagram
export async function getUserByInstagram(instagram: string): Promise<User | null> {
  const users = await getUsers();
  return users.find((u) => u.instagram.toLowerCase() === instagram.toLowerCase()) || null;
}

// Buscar usuário por ID
export async function getUserById(id: string): Promise<User | null> {
  const users = await getUsers();
  return users.find((u) => u.id === id) || null;
}

// Criar novo usuário pré-cadastrado (sem senha)
export async function createPreRegisteredUser(
  instagram: string
): Promise<User> {
  const users = await getUsers();
  
  // Verificar se já existe
  const existing = await getUserByInstagram(instagram);
  if (existing) {
    throw new Error('Usuário já existe');
  }

  const newUser: User = {
    id: crypto.randomUUID(),
    instagram: instagram.toLowerCase(),
    passwordHash: '', // Sem senha inicial
    hasSetPassword: false,
    createdAt: new Date(),
  };

  users.push(newUser);
  await saveUsers(users);
  return newUser;
}

// Criar novo usuário (mantido para compatibilidade, mas não usado no signup)
export async function createUser(
  instagram: string,
  passwordHash: string
): Promise<User> {
  const users = await getUsers();
  
  // Verificar se já existe
  const existing = await getUserByInstagram(instagram);
  if (existing) {
    throw new Error('Usuário já existe');
  }

  const newUser: User = {
    id: crypto.randomUUID(),
    instagram: instagram.toLowerCase(),
    passwordHash,
    hasSetPassword: true,
    createdAt: new Date(),
  };

  users.push(newUser);
  await saveUsers(users);
  return newUser;
}

// Atualizar senha do usuário
export async function updateUserPassword(
  instagram: string,
  passwordHash: string
): Promise<User> {
  const users = await getUsers();
  const userIndex = users.findIndex(
    (u) => u.instagram.toLowerCase() === instagram.toLowerCase()
  );

  if (userIndex === -1) {
    throw new Error('Usuário não encontrado');
  }

  users[userIndex].passwordHash = passwordHash;
  users[userIndex].hasSetPassword = true;
  await saveUsers(users);
  return users[userIndex];
}

// Verificar se usuário precisa definir senha
export async function userNeedsPassword(instagram: string): Promise<boolean> {
  const user = await getUserByInstagram(instagram);
  if (!user) {
    return false; // Usuário não cadastrado não pode definir senha
  }
  return !user.hasSetPassword;
}
