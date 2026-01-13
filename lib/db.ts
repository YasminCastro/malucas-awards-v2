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

// Resetar senha do usuário (remove passwordHash e define hasSetPassword como false)
export async function resetUserPassword(id: string): Promise<User> {
  await initializeIndexes();
  const collection = await getUsersCollection();

  const { ObjectId } = await import("mongodb");
  let query: any;
  try {
    query = { _id: new ObjectId(id) };
  } catch {
    query = { _id: id };
  }

  const result = await collection.updateOne(query, {
    $set: {
      passwordHash: "",
      hasSetPassword: false,
      updatedAt: new Date(),
    },
  });

  if (result.matchedCount === 0) {
    throw new Error("Usuário não encontrado");
  }

  const updatedUser = await getUserById(id);
  if (!updatedUser) {
    throw new Error("Usuário não encontrado após reset");
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

// ========== CATEGORIES ==========

export interface Participant {
  instagram: string;
  image: string;
}

export interface Category {
  _id?: string;
  id: string;
  name: string;
  participants: Participant[];
  createdAt: Date;
  updatedAt?: Date;
}

// Obter coleção de categorias
async function getCategoriesCollection(): Promise<Collection<Category>> {
  const { db } = await connectToDatabase();
  return db.collection<Category>("categories");
}

// Buscar todas as categorias
export async function getCategories(): Promise<Category[]> {
  const collection = await getCategoriesCollection();
  const categories = await collection.find({}).sort({ createdAt: 1 }).toArray();
  return categories;
}

// Buscar categoria por ID
export async function getCategoryById(id: string): Promise<Category | null> {
  const collection = await getCategoriesCollection();
  const { ObjectId } = await import("mongodb");
  let query: any;
  try {
    query = { _id: new ObjectId(id) };
  } catch {
    query = { _id: id };
  }
  const category = await collection.findOne(query);
  return category || null;
}

// Buscar categoria por id (campo id, não _id)
export async function getCategoryByCustomId(
  id: string
): Promise<Category | null> {
  const collection = await getCategoriesCollection();
  const category = await collection.findOne({ id });
  return category || null;
}

// Criar nova categoria
export async function createCategory(
  name: string,
  participants: Participant[] = []
): Promise<Category> {
  const collection = await getCategoriesCollection();

  // Gerar um ID único baseado no timestamp
  const id = Date.now().toString();

  const newCategory: Omit<Category, "_id"> = {
    id,
    name,
    participants,
    createdAt: new Date(),
  };

  const result = await collection.insertOne(newCategory as any);
  const insertedCategory = await collection.findOne({ _id: result.insertedId });
  return insertedCategory as Category;
}

// Atualizar categoria
export async function updateCategory(
  id: string,
  updates: Partial<Pick<Category, "name" | "participants">>
): Promise<Category> {
  const collection = await getCategoriesCollection();

  const updateData: any = {
    updatedAt: new Date(),
  };

  if (updates.name !== undefined) {
    updateData.name = updates.name;
  }
  if (updates.participants !== undefined) {
    updateData.participants = updates.participants;
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
    throw new Error("Categoria não encontrada");
  }

  const updatedCategory = await getCategoryById(id);
  if (!updatedCategory) {
    throw new Error("Categoria não encontrada após atualização");
  }

  return updatedCategory;
}

// Deletar categoria
export async function deleteCategory(id: string): Promise<boolean> {
  const collection = await getCategoriesCollection();

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

// ========== VOTES ==========

export interface Vote {
  _id?: string;
  userId: string;
  userInstagram: string;
  categoryId: string;
  categoryName: string;
  participantInstagram: string;
  createdAt: Date;
}

// Obter coleção de votos
async function getVotesCollection(): Promise<Collection<Vote>> {
  const { db } = await connectToDatabase();
  return db.collection<Vote>("votes");
}

// Salvar votos de um usuário
export async function saveVotes(
  userId: string,
  userInstagram: string,
  votes: Record<string, string>,
  categories: { id: string; name: string }[]
): Promise<Vote[]> {
  const collection = await getVotesCollection();

  // Primeiro, remover votos anteriores do usuário
  await collection.deleteMany({ userId });

  // Criar novos votos
  const votesToInsert: Omit<Vote, "_id">[] = [];
  for (const [categoryId, participantInstagram] of Object.entries(votes)) {
    const category = categories.find((cat) => cat.id === categoryId);
    if (category) {
      votesToInsert.push({
        userId,
        userInstagram,
        categoryId,
        categoryName: category.name,
        participantInstagram,
        createdAt: new Date(),
      });
    }
  }

  if (votesToInsert.length > 0) {
    await collection.insertMany(votesToInsert as any);
  }

  // Retornar os votos inseridos
  const insertedVotes = await collection.find({ userId }).toArray();
  return insertedVotes;
}

// Buscar todos os votos
export async function getAllVotes(): Promise<Vote[]> {
  const collection = await getVotesCollection();
  return collection.find({}).sort({ createdAt: 1 }).toArray();
}

// Buscar votos de um usuário específico
export async function getVotesByUser(userId: string): Promise<Vote[]> {
  const collection = await getVotesCollection();
  return collection.find({ userId }).toArray();
}

// Buscar votos por categoria
export async function getVotesByCategory(categoryId: string): Promise<Vote[]> {
  const collection = await getVotesCollection();
  return collection.find({ categoryId }).toArray();
}

// Calcular resultados de uma categoria (contagem de votos)
export async function getCategoryResults(categoryId: string): Promise<
  Array<{
    participantInstagram: string;
    votes: number;
    voters: string[];
  }>
> {
  const votes = await getVotesByCategory(categoryId);

  // Agrupar votos por participante
  const voteCount: Record<string, { count: number; voters: string[] }> = {};

  for (const vote of votes) {
    if (!voteCount[vote.participantInstagram]) {
      voteCount[vote.participantInstagram] = {
        count: 0,
        voters: [],
      };
    }
    voteCount[vote.participantInstagram].count++;
    voteCount[vote.participantInstagram].voters.push(vote.userInstagram);
  }

  // Converter para array e ordenar por votos (decrescente)
  const results = Object.entries(voteCount)
    .map(([participantInstagram, data]) => ({
      participantInstagram,
      votes: data.count,
      voters: data.voters,
    }))
    .sort((a, b) => b.votes - a.votes);

  return results;
}
