/**
 * Simple in-memory TTL cache for server-side data.
 * Eliminates redundant WooCommerce API calls across visitors.
 * Data clears on server process restart (acceptable for product listings).
 */

interface CacheEntry<T> {
    data: T;
    expiresAt: number;
}

class MemoryCache {
    private store = new Map<string, CacheEntry<any>>();
    private maxSize: number;

    constructor(maxSize = 100) {
        this.maxSize = maxSize;
    }

    get<T>(key: string): T | null {
        const entry = this.store.get(key);
        if (!entry) return null;

        if (Date.now() > entry.expiresAt) {
            this.store.delete(key);
            return null;
        }

        return entry.data as T;
    }

    set<T>(key: string, data: T, ttlSeconds: number): void {
        if (this.store.size >= this.maxSize) {
            const firstKey = this.store.keys().next().value;
            if (firstKey) this.store.delete(firstKey);
        }

        this.store.set(key, {
            data,
            expiresAt: Date.now() + (ttlSeconds * 1000)
        });
    }

    invalidate(key: string): void {
        this.store.delete(key);
    }

    clear(): void {
        this.store.clear();
    }
}

export const serverCache = new MemoryCache(50);
