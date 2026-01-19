import { connectToDatabase } from "@/lib/db";
import { cache, CacheKeys } from "@/lib/cache";
import { Collection } from "mongodb";

export interface Participant {
    instagram: string;
    image: string;
}

export interface Category {
    _id?: string;
    name: string;
    participants: Participant[];
    createdAt: Date;
    updatedAt?: Date;
}

let indexesEnsured = false;

async function getCategoriesCollection(): Promise<Collection<Category>> {
    const { db } = await connectToDatabase();
    const collection = db.collection<Category>("categories");

    if (!indexesEnsured) {
        await collection.createIndex(
            { name: 1 },
            {
                unique: true,
                collation: { locale: "pt", strength: 2 },
            }
        );
        indexesEnsured = true;
    }

    return collection;
}

export async function getCategories(options?: { bypassCache?: boolean }): Promise<Category[]> {
    const bypassCache = options?.bypassCache === true;

    if (!bypassCache) {
        const cached = cache.get<Category[]>(CacheKeys.CATEGORIES);
        if (cached) {
            return cached;
        }
    }

    const collection = await getCategoriesCollection();
    const categories = await collection.find({}).sort({ createdAt: 1 }).toArray();

    if (!bypassCache) {
        cache.set(CacheKeys.CATEGORIES, categories, 2 * 60 * 1000);
    }

    return categories;
}

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

export async function getCategoryByCustomId(
    id: string
): Promise<Category | null> {
    const collection = await getCategoriesCollection();
    const category = await collection.findOne({ id });
    return category || null;
}

export async function createCategory(
    name: string,
    participants: Participant[] = []
): Promise<Category> {
    const collection = await getCategoriesCollection();

    const newCategory: Omit<Category, "_id"> = {
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
