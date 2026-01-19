import { connectToDatabase } from "@/lib/db";
import { cache, CacheKeys } from "@/lib/cache";
import { Collection } from "mongodb";

export interface CategorySuggestion {
  _id?: string;
  suggesterName: string;
  categoryName: string;
  participants: string[]; // Array de instagrams
  observations?: string; // Observações opcionais sobre a categoria
  createdAt?: Date;
  status?: "pending" | "approved" | "rejected";
}

// Obter coleção de sugestões de categorias
async function getCategorySuggestionsCollection(): Promise<Collection<CategorySuggestion>> {
  const { db } = await connectToDatabase();
  return db.collection<CategorySuggestion>("category_suggestions");
}

// Criar sugestão de categoria
export async function createCategorySuggestion(
  suggesterName: string,
  categoryName: string,
  participants: string[],
  observations?: string
): Promise<CategorySuggestion> {
  const collection = await getCategorySuggestionsCollection();

  const suggestion: CategorySuggestion = {
    suggesterName: suggesterName.trim(),
    categoryName: categoryName.trim(),
    participants: participants || [],
    observations: observations?.trim() || undefined,
    createdAt: new Date(),
    status: "pending",
  };

  const result = await collection.insertOne(suggestion);

  if (!result.insertedId) {
    throw new Error("Erro ao criar sugestão de categoria");
  }

  // Invalidar cache de sugestões
  cache.delete(CacheKeys.CATEGORY_SUGGESTIONS);

  return {
    ...suggestion,
    _id: result.insertedId.toString(),
  };
}

// Buscar todas as sugestões (para admin)
export async function getCategorySuggestions(options?: { bypassCache?: boolean }): Promise<CategorySuggestion[]> {
  const bypassCache = options?.bypassCache === true;

  if (!bypassCache) {
    const cached = cache.get<CategorySuggestion[]>(CacheKeys.CATEGORY_SUGGESTIONS);
    if (cached) {
      return cached;
    }
  }

  const collection = await getCategorySuggestionsCollection();
  const suggestions = await collection
    .find({})
    .sort({ createdAt: -1 })
    .toArray();

  if (!bypassCache) {
    // Armazenar no cache por 1 minuto
    cache.set(CacheKeys.CATEGORY_SUGGESTIONS, suggestions, 60 * 1000);
  }

  return suggestions;
}

// Buscar sugestão por ID
export async function getCategorySuggestionById(id: string): Promise<CategorySuggestion | null> {
  const collection = await getCategorySuggestionsCollection();
  const { ObjectId } = await import("mongodb");
  let query: any;
  try {
    query = { _id: new ObjectId(id) };
  } catch {
    query = { _id: id };
  }
  const suggestion = await collection.findOne(query);
  return suggestion || null;
}

// Adicionar participantes a uma sugestão (apenas adiciona, não remove)
export async function addParticipantsToSuggestion(
  id: string,
  newParticipants: string[]
): Promise<CategorySuggestion> {
  const collection = await getCategorySuggestionsCollection();
  const { ObjectId } = await import("mongodb");

  let query: any;
  try {
    query = { _id: new ObjectId(id) };
  } catch {
    query = { _id: id };
  }

  // Normalizar participantes (trim e remover duplicatas)
  const normalizedParticipants = Array.from(
    new Set(newParticipants.map(p => p.trim()).filter(p => p))
  );

  // Usar $addToSet para adicionar apenas participantes únicos
  const result = await collection.updateOne(
    query,
    {
      $addToSet: {
        participants: { $each: normalizedParticipants }
      }
    }
  );

  if (result.matchedCount === 0) {
    throw new Error("Sugestão não encontrada");
  }

  const updatedSuggestion = await getCategorySuggestionById(id);
  if (!updatedSuggestion) {
    throw new Error("Sugestão não encontrada após atualização");
  }

  // Invalidar cache de sugestões
  cache.delete(CacheKeys.CATEGORY_SUGGESTIONS);

  return updatedSuggestion;
}

// Atualizar status da sugestão
export async function updateCategorySuggestionStatus(
  id: string,
  status: "pending" | "approved" | "rejected"
): Promise<CategorySuggestion> {
  const collection = await getCategorySuggestionsCollection();
  const { ObjectId } = await import("mongodb");

  let query: any;
  try {
    query = { _id: new ObjectId(id) };
  } catch {
    query = { _id: id };
  }

  const result = await collection.updateOne(
    query,
    {
      $set: { status }
    }
  );

  if (result.matchedCount === 0) {
    throw new Error("Sugestão não encontrada");
  }

  const updatedSuggestion = await getCategorySuggestionById(id);
  if (!updatedSuggestion) {
    throw new Error("Sugestão não encontrada após atualização");
  }

  // Invalidar cache de sugestões
  cache.delete(CacheKeys.CATEGORY_SUGGESTIONS);

  return updatedSuggestion;
}

// Atualizar dados da sugestão (admin)
export async function updateCategorySuggestion(
  id: string,
  updates: Partial<
    Pick<
      CategorySuggestion,
      "suggesterName" | "categoryName" | "participants" | "observations" | "status"
    >
  >
): Promise<CategorySuggestion> {
  const collection = await getCategorySuggestionsCollection();
  const { ObjectId } = await import("mongodb");

  let query: any;
  try {
    query = { _id: new ObjectId(id) };
  } catch {
    query = { _id: id };
  }

  const updateData: any = {};
  if (updates.suggesterName !== undefined) {
    updateData.suggesterName = updates.suggesterName.trim();
  }
  if (updates.categoryName !== undefined) {
    updateData.categoryName = updates.categoryName.trim();
  }
  if (updates.participants !== undefined) {
    updateData.participants = updates.participants;
  }
  if (updates.observations !== undefined) {
    const obs = updates.observations?.trim();
    updateData.observations = obs ? obs : undefined;
  }
  if (updates.status !== undefined) {
    updateData.status = updates.status;
  }

  const result = await collection.updateOne(query, { $set: updateData });
  if (result.matchedCount === 0) {
    throw new Error("Sugestão não encontrada");
  }

  const updated = await getCategorySuggestionById(id);
  if (!updated) {
    throw new Error("Sugestão não encontrada após atualização");
  }

  cache.delete(CacheKeys.CATEGORY_SUGGESTIONS);
  return updated;
}

// Deletar sugestão (admin)
export async function deleteCategorySuggestion(id: string): Promise<boolean> {
  const collection = await getCategorySuggestionsCollection();
  const { ObjectId } = await import("mongodb");

  let query: any;
  try {
    query = { _id: new ObjectId(id) };
  } catch {
    query = { _id: id };
  }

  const result = await collection.deleteOne(query);
  if (result.deletedCount > 0) {
    cache.delete(CacheKeys.CATEGORY_SUGGESTIONS);
  }
  return result.deletedCount > 0;
}
