import { connectToDatabase } from "@/lib/db";
import { cache, CacheKeys } from "@/lib/cache";
import { Collection } from "mongodb";

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
    // Verificar cache
    const cached = cache.get<Category[]>(CacheKeys.CATEGORIES);
    if (cached) {
        return cached;
    }

    const collection = await getCategoriesCollection();
    const categories = await collection.find({}).sort({ createdAt: 1 }).toArray();

    // Armazenar no cache por 2 minutos
    cache.set(CacheKeys.CATEGORIES, categories, 2 * 60 * 1000);

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

    // Invalidar cache de categorias
    cache.delete(CacheKeys.CATEGORIES);

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

    // Invalidar cache de categorias
    cache.delete(CacheKeys.CATEGORIES);

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

    // Invalidar cache de categorias se deletou
    if (result.deletedCount > 0) {
        cache.delete(CacheKeys.CATEGORIES);
    }

    return result.deletedCount > 0;
}
