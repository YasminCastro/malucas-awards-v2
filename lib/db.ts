import { MongoClient, Db, Collection } from "mongodb";
import { User } from "./auth";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Por favor, defina a variável de ambiente MONGODB_URI");
}

// Cache da conexão para reutilização
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

// Conectar ao MongoDB
async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  // Verificar se já temos uma conexão válida
  if (cachedClient && cachedDb) {
    try {
      // Verificar se a conexão ainda está ativa
      await cachedClient.db().admin().ping();
      return { client: cachedClient, db: cachedDb };
    } catch {
      // Conexão perdida, resetar cache
      cachedClient = null;
      cachedDb = null;
    }
  }

  // Criar nova conexão
  const client = new MongoClient(MONGODB_URI!, {
    maxPoolSize: 10,
    minPoolSize: 1,
  });

  await client.connect();

  // Usar o banco de dados especificado na URI ou o padrão
  // Se a URI não especificar um banco, usa 'malucas-awards'
  // Extrair nome do banco da URI (tudo após a última barra, antes de ? ou #)
  let dbName = "malucas-awards-2026"; // padrão
  try {
    // Tentar extrair da URI usando regex (funciona com mongodb:// e mongodb+srv://)
    const match = MONGODB_URI!.match(/\/([^\/\?\#]+)(?:\?|#|$)/);
    if (match && match[1]) {
      dbName = match[1];
    }
  } catch {
    // Se falhar, usar o padrão
  }

  const db = client.db(dbName);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

// Obter coleção de usuários
async function getUsersCollection(): Promise<Collection<User>> {
  const { db } = await connectToDatabase();
  return db.collection<User>("users");
}

// Criar índices (executar uma vez)
async function ensureIndexes() {
  const collection = await getUsersCollection();
  await collection.createIndex({ instagram: 1 }, { unique: true });
}

// Inicializar índices na primeira conexão
let indexesInitialized = false;
async function initializeIndexes() {
  if (!indexesInitialized) {
    await ensureIndexes();
    indexesInitialized = true;
  }
}

// Buscar usuário por Instagram
export async function getUserByInstagram(
  instagram: string
): Promise<User | null> {
  await initializeIndexes();
  const collection = await getUsersCollection();
  const user = await collection.findOne({
    instagram: instagram.toLowerCase(),
  });

  return user || null;
}

// Buscar usuário por ID
export async function getUserById(id: string): Promise<User | null> {
  await initializeIndexes();
  const collection = await getUsersCollection();
  const { ObjectId } = await import("mongodb");
  let query: any;
  try {
    query = { _id: new ObjectId(id) };
  } catch {
    query = { _id: id };
  }
  const user = await collection.findOne(query);
  return user || null;
}

export async function createPreRegisteredUser(
  instagram: string,
  isAdmin: boolean
): Promise<User> {
  await initializeIndexes();
  const collection = await getUsersCollection();

  const existing = await getUserByInstagram(instagram);
  if (existing) {
    throw new Error("Usuário já existe");
  }

  const newUser: Omit<User, "_id"> = {
    instagram: instagram.toLowerCase(),
    passwordHash: "",
    hasSetPassword: false,
    createdAt: new Date(),
    isAdmin: isAdmin,
  };

  const result = await collection.insertOne(newUser as any);
  const insertedUser = await collection.findOne({ _id: result.insertedId });
  return insertedUser as User;
}

// Criar novo usuário (mantido para compatibilidade, mas não usado no signup)
export async function createUser(
  instagram: string,
  passwordHash: string
): Promise<User> {
  await initializeIndexes();
  const collection = await getUsersCollection();

  // Verificar se já existe
  const existing = await getUserByInstagram(instagram);
  if (existing) {
    throw new Error("Usuário já existe");
  }

  const newUser: Omit<User, "_id"> = {
    instagram: instagram.toLowerCase(),
    passwordHash,
    hasSetPassword: true,
    createdAt: new Date(),
  };

  const result = await collection.insertOne(newUser as any);
  const insertedUser = await collection.findOne({ _id: result.insertedId });
  return insertedUser as User;
}

// Atualizar senha do usuário
export async function updateUserPassword(
  instagram: string,
  passwordHash: string
): Promise<User> {
  await initializeIndexes();
  const collection = await getUsersCollection();

  const result = await collection.updateOne(
    { instagram: instagram.toLowerCase() },
    {
      $set: {
        passwordHash,
        hasSetPassword: true,
        updatedAt: new Date(),
      },
    }
  );

  if (result.matchedCount === 0) {
    throw new Error("Usuário não encontrado");
  }

  // Buscar o usuário atualizado
  const updatedUser = await getUserByInstagram(instagram);
  if (!updatedUser) {
    throw new Error("Usuário não encontrado após atualização");
  }

  return updatedUser;
}

// Verificar se usuário precisa definir senha
export async function userNeedsPassword(instagram: string): Promise<boolean> {
  const user = await getUserByInstagram(instagram);
  if (!user) {
    return false; // Usuário não cadastrado não pode definir senha
  }
  return !user.hasSetPassword;
}

// Funções auxiliares mantidas para compatibilidade (não são mais necessárias com MongoDB)
export async function getUsers(): Promise<User[]> {
  await initializeIndexes();
  const collection = await getUsersCollection();
  const users = await collection.find({}).toArray();
  return users;
}

export async function saveUsers(users: User[]): Promise<void> {
  // Esta função não é mais necessária com MongoDB
  // Mantida apenas para compatibilidade, mas não faz nada
  // Se precisar atualizar múltiplos usuários, use updateMany ou bulkWrite
  console.warn(
    "saveUsers() não é mais necessária com MongoDB. Use as funções específicas de atualização."
  );
}

// Atualizar usuário (para admin)
export async function updateUser(
  id: string,
  updates: Partial<Pick<User, "instagram" | "hasSetPassword" | "isAdmin">>
): Promise<User> {
  await initializeIndexes();
  const collection = await getUsersCollection();

  const updateData: any = {};
  if (updates.instagram !== undefined) {
    updateData.instagram = updates.instagram.toLowerCase();
  }
  if (updates.hasSetPassword !== undefined) {
    updateData.hasSetPassword = updates.hasSetPassword;
  }
  if (updates.isAdmin !== undefined) {
    updateData.isAdmin = updates.isAdmin;
  }

  const { ObjectId } = await import("mongodb");
  let query: any;
  try {
    query = { _id: new ObjectId(id) };
  } catch {
    query = { _id: id };
  }

  const result = await collection.updateOne(query, { $set: updateData });

  if (result.matchedCount === 0) {
    throw new Error("Usuário não encontrado");
  }

  const updatedUser = await getUserById(id);
  if (!updatedUser) {
    throw new Error("Usuário não encontrado após atualização");
  }

  return updatedUser;
}

// Deletar usuário
export async function deleteUser(id: string): Promise<boolean> {
  await initializeIndexes();
  const collection = await getUsersCollection();

  const { ObjectId } = await import("mongodb");
  let query: any;
  try {
    query = { _id: new ObjectId(id) };
  } catch {
    query = { _id: id };
  }

  const result = await collection.deleteOne(query);
  return result.deletedCount > 0;
}

// Verificar se usuário é admin
export async function isUserAdmin(userId: string): Promise<boolean> {
  const user = await getUserById(userId);
  return user?.isAdmin === true;
}
