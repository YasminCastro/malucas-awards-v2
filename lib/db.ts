import { MongoClient, Db } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Por favor, defina a variável de ambiente MONGODB_URI");
}

// Cache da conexão para reutilização
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    try {
      await cachedClient.db().admin().ping();
      return { client: cachedClient, db: cachedDb };
    } catch {
      cachedClient = null;
      cachedDb = null;
    }
  }

  const client = new MongoClient(MONGODB_URI!, {
    maxPoolSize: 10,
    minPoolSize: 1,
  });

  await client.connect();

  let dbName = "malucas-awards-2026";
  try {
    const match = MONGODB_URI!.match(/\/([^\/\?\#]+)(?:\?|#|$)/);
    if (match && match[1]) {
      dbName = match[1];
    }
  } catch {
  }

  const db = client.db(dbName);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

export * from "@/database/users";
export * from "@/database/categories";
export * from "@/database/votes";
export * from "@/database/settings";
export * from "@/database/category-suggestions";
