// Sistema de cache simples com TTL (Time To Live)

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class SimpleCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private defaultTTL: number = 60000; // 1 minuto em milissegundos

  // Obter valor do cache
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Verificar se expirou
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  // Armazenar valor no cache
  set<T>(key: string, data: T, ttl?: number): void {
    const expiresAt = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, { data, expiresAt });
  }

  // Remover do cache
  delete(key: string): void {
    this.cache.delete(key);
  }

  // Limpar todo o cache
  clear(): void {
    this.cache.clear();
  }

  // Limpar entradas expiradas
  cleanExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

// Instância global do cache
export const cache = new SimpleCache();

// Chaves de cache
export const CacheKeys = {
  CATEGORIES: "categories",
  CATEGORY_SUGGESTIONS: "category_suggestions",
  USERS: "users",
  USERS_PUBLIC: "users_public",
  SETTINGS: "settings",
  CATEGORY_RESULTS: (categoryId: string) => `category_results_${categoryId}`,
  CATEGORY_BY_ID: (id: string) => `category_${id}`,
  CATEGORY_SUGGESTION_BY_ID: (id: string) => `category_suggestion_${id}`,
} as const;

// Limpar entradas expiradas periodicamente (a cada 5 minutos)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    cache.cleanExpired();
  }, 5 * 60 * 1000);
}
