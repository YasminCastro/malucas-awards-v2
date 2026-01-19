import { User } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { cache, CacheKeys } from "@/lib/cache";
import { Collection } from "mongodb";

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

// Criar usuário pré-registrado (sem senha)
export async function createPreRegisteredUser(
    instagram: string,
    name: string,
    isAdmin: boolean
): Promise<User> {
    await initializeIndexes();
    const collection = await getUsersCollection();

    if (!name || !name.trim()) {
        throw new Error("Nome é obrigatório");
    }

    const existing = await getUserByInstagram(instagram);
    if (existing) {
        throw new Error("Usuário já existe");
    }

    const newUser: Omit<User, "_id"> = {
        name: name.trim(),
        instagram: instagram.toLowerCase(),
        passwordHash: "",
        hasSetPassword: false,
        createdAt: new Date(),
        isAdmin: isAdmin,
    };

    const result = await collection.insertOne(newUser as any);
    const insertedUser = await collection.findOne({ _id: result.insertedId });

    // Invalidar cache de usuários
    cache.delete(CacheKeys.USERS);

    return insertedUser as User;
}

// Criar novo usuário (mantido para compatibilidade, mas não usado no signup)
export async function createUser(
    instagram: string,
    passwordHash: string,
    name?: string
): Promise<User> {
    await initializeIndexes();
    const collection = await getUsersCollection();

    // Verificar se já existe
    const existing = await getUserByInstagram(instagram);
    if (existing) {
        throw new Error("Usuário já existe");
    }

    const newUser: Omit<User, "_id"> = {
        name: name?.trim() || undefined,
        instagram: instagram.toLowerCase(),
        passwordHash,
        hasSetPassword: true,
        createdAt: new Date(),
    };

    const result = await collection.insertOne(newUser as any);
    const insertedUser = await collection.findOne({ _id: result.insertedId });

    // Invalidar cache de usuários
    cache.delete(CacheKeys.USERS);

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

    // Invalidar cache de usuários
    cache.delete(CacheKeys.USERS);

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

    // Invalidar cache de usuários
    cache.delete(CacheKeys.USERS);

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

// Buscar todos os usuários
export async function getUsers(): Promise<User[]> {
    // Verificar cache
    const cached = cache.get<User[]>(CacheKeys.USERS);
    if (cached) {
        return cached;
    }

    await initializeIndexes();
    const collection = await getUsersCollection();
    const users = await collection.find({}).toArray();

    // Armazenar no cache por 5 minutos
    cache.set(CacheKeys.USERS, users, 5 * 60 * 1000);

    return users;
}

// Salvar usuários (mantido para compatibilidade)
export async function saveUsers(users: User[]): Promise<void> {
    // Esta função não é mais necessária com MongoDB
    // Mantida apenas para compatibilidade, mas não faz nada
    console.warn(
        "saveUsers() não é mais necessária com MongoDB. Use as funções específicas de atualização."
    );
}

// Atualizar usuário (para admin)
export async function updateUser(
    id: string,
    updates: Partial<Pick<User, "name" | "instagram" | "hasSetPassword" | "isAdmin">>
): Promise<User> {
    await initializeIndexes();
    const collection = await getUsersCollection();

    const updateData: any = {};
    if (updates.name !== undefined) {
        updateData.name = updates.name.trim();
    }
    if (updates.instagram !== undefined) {
        updateData.instagram = updates.instagram.toLowerCase();
    }
    if (updates.hasSetPassword !== undefined) {
        updateData.hasSetPassword = updates.hasSetPassword;
    }
    if (updates.isAdmin !== undefined) {
        updateData.isAdmin = updates.isAdmin;
    }

    if (updateData.name !== undefined && !updateData.name) {
        throw new Error("Nome é obrigatório");
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

    // Invalidar cache de usuários
    cache.delete(CacheKeys.USERS);

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

    // Invalidar cache de usuários se deletado com sucesso
    if (result.deletedCount > 0) {
        cache.delete(CacheKeys.USERS);
    }

    return result.deletedCount > 0;
}

// Verificar se usuário é admin
export async function isUserAdmin(userId: string): Promise<boolean> {
    const user = await getUserById(userId);
    return user?.isAdmin === true;
}