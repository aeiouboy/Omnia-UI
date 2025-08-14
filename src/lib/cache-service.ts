// Multi-level caching service for order data
// L1: Memory cache (5 minutes)
// L2: Local storage cache (30 minutes)  
// L3: Server-side cache (handled by Next.js)

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiry: number
}

interface CacheConfig {
  memoryTTL: number    // L1 cache TTL in milliseconds
  storageTTL: number   // L2 cache TTL in milliseconds
  maxMemoryItems: number
}

class CacheService {
  private memoryCache = new Map<string, CacheEntry<any>>()
  private config: CacheConfig

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      memoryTTL: 5 * 60 * 1000,      // 5 minutes
      storageTTL: 30 * 60 * 1000,    // 30 minutes
      maxMemoryItems: 100,
      ...config
    }

    // Cleanup memory cache every minute
    setInterval(() => this.cleanupMemoryCache(), 60 * 1000)
  }

  // Generate cache key with filters
  private generateKey(endpoint: string, params: Record<string, any> = {}): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          acc[key] = params[key]
        }
        return acc
      }, {} as Record<string, any>)
    
    return `${endpoint}:${JSON.stringify(sortedParams)}`
  }

  // L1: Memory cache operations
  private getFromMemory<T>(key: string): T | null {
    const entry = this.memoryCache.get(key)
    if (!entry) return null

    if (Date.now() > entry.expiry) {
      this.memoryCache.delete(key)
      return null
    }

    return entry.data
  }

  private setInMemory<T>(key: string, data: T): void {
    // Implement LRU eviction if cache is full
    if (this.memoryCache.size >= this.config.maxMemoryItems) {
      const oldestKey = this.memoryCache.keys().next().value
      this.memoryCache.delete(oldestKey)
    }

    this.memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + this.config.memoryTTL
    })
  }

  private cleanupMemoryCache(): void {
    const now = Date.now()
    for (const [key, entry] of this.memoryCache.entries()) {
      if (now > entry.expiry) {
        this.memoryCache.delete(key)
      }
    }
  }

  // L2: Local storage operations (browser only)
  private getFromStorage<T>(key: string): T | null {
    if (typeof window === 'undefined') return null

    try {
      const item = localStorage.getItem(`cache:${key}`)
      if (!item) return null

      const entry: CacheEntry<T> = JSON.parse(item)
      if (Date.now() > entry.expiry) {
        localStorage.removeItem(`cache:${key}`)
        return null
      }

      return entry.data
    } catch (error) {
      console.warn('Cache storage read error:', error)
      return null
    }
  }

  private setInStorage<T>(key: string, data: T): void {
    if (typeof window === 'undefined') return

    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        expiry: Date.now() + this.config.storageTTL
      }
      localStorage.setItem(`cache:${key}`, JSON.stringify(entry))
    } catch (error) {
      console.warn('Cache storage write error:', error)
      // Clear old entries if storage is full
      this.clearOldStorageEntries()
    }
  }

  private clearOldStorageEntries(): void {
    if (typeof window === 'undefined') return

    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('cache:'))
      const now = Date.now()
      
      for (const key of keys) {
        try {
          const entry = JSON.parse(localStorage.getItem(key) || '{}')
          if (now > entry.expiry) {
            localStorage.removeItem(key)
          }
        } catch {
          localStorage.removeItem(key)
        }
      }
    } catch (error) {
      console.warn('Cache cleanup error:', error)
    }
  }

  // Public API
  get<T>(endpoint: string, params: Record<string, any> = {}): T | null {
    const key = this.generateKey(endpoint, params)

    // Try L1 cache first
    const memoryResult = this.getFromMemory<T>(key)
    if (memoryResult) {
      console.log(`📦 L1 Cache hit for ${key}`)
      return memoryResult
    }

    // Try L2 cache
    const storageResult = this.getFromStorage<T>(key)
    if (storageResult) {
      console.log(`📦 L2 Cache hit for ${key}`)
      // Promote to L1 cache
      this.setInMemory(key, storageResult)
      return storageResult
    }

    console.log(`❌ Cache miss for ${key}`)
    return null
  }

  set<T>(endpoint: string, params: Record<string, any> = {}, data: T): void {
    const key = this.generateKey(endpoint, params)
    console.log(`💾 Caching data for ${key}`)
    
    // Store in both L1 and L2 caches
    this.setInMemory(key, data)
    this.setInStorage(key, data)
  }

  // Invalidate specific cache entries
  invalidate(endpoint: string, params: Record<string, any> = {}): void {
    const key = this.generateKey(endpoint, params)
    console.log(`🗑️ Invalidating cache for ${key}`)
    
    this.memoryCache.delete(key)
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`cache:${key}`)
    }
  }

  // Invalidate all cache entries for an endpoint
  invalidateEndpoint(endpoint: string): void {
    console.log(`🗑️ Invalidating all cache for endpoint ${endpoint}`)
    
    // Clear memory cache
    for (const key of this.memoryCache.keys()) {
      if (key.startsWith(endpoint + ':')) {
        this.memoryCache.delete(key)
      }
    }

    // Clear storage cache
    if (typeof window !== 'undefined') {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith(`cache:${endpoint}:`)
      )
      keys.forEach(key => localStorage.removeItem(key))
    }
  }

  // Clear all caches
  clear(): void {
    console.log('🗑️ Clearing all caches')
    this.memoryCache.clear()
    
    if (typeof window !== 'undefined') {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('cache:'))
      keys.forEach(key => localStorage.removeItem(key))
    }
  }

  // Get cache statistics
  getStats() {
    const memorySize = this.memoryCache.size
    let storageSize = 0
    
    if (typeof window !== 'undefined') {
      storageSize = Object.keys(localStorage).filter(key => 
        key.startsWith('cache:')
      ).length
    }

    return {
      memoryEntries: memorySize,
      storageEntries: storageSize,
      memoryTTL: this.config.memoryTTL,
      storageTTL: this.config.storageTTL
    }
  }

  // Background refresh functionality
  async refreshInBackground<T>(
    endpoint: string, 
    params: Record<string, any> = {},
    fetcher: () => Promise<T>
  ): Promise<T> {
    const key = this.generateKey(endpoint, params)
    const cached = this.get<T>(endpoint, params)

    if (cached) {
      // Return cached data immediately
      // Refresh in background (stale-while-revalidate)
      setTimeout(async () => {
        try {
          const fresh = await fetcher()
          this.set(endpoint, params, fresh)
          console.log(`🔄 Background refresh completed for ${key}`)
        } catch (error) {
          console.warn(`⚠️ Background refresh failed for ${key}:`, error)
        }
      }, 0)
      
      return cached
    } else {
      // No cached data, fetch immediately
      const fresh = await fetcher()
      this.set(endpoint, params, fresh)
      return fresh
    }
  }

  // Check if data needs refresh (within 30 seconds of expiry)
  shouldRefresh(endpoint: string, params: Record<string, any> = {}): boolean {
    const key = this.generateKey(endpoint, params)
    const entry = this.memoryCache.get(key)
    
    if (!entry) return true
    
    const timeToExpiry = entry.expiry - Date.now()
    const refreshThreshold = 30 * 1000 // 30 seconds
    
    return timeToExpiry <= refreshThreshold
  }
}

// Global cache instance
export const cacheService = new CacheService()

// Cache configuration presets
export const CachePresets = {
  ORDERS_SUMMARY: {
    memoryTTL: 5 * 60 * 1000,     // 5 minutes
    storageTTL: 30 * 60 * 1000,   // 30 minutes
  },
  ORDER_DETAILS: {
    memoryTTL: 10 * 60 * 1000,    // 10 minutes
    storageTTL: 60 * 60 * 1000,   // 1 hour
  },
  DASHBOARD_METRICS: {
    memoryTTL: 2 * 60 * 1000,     // 2 minutes
    storageTTL: 10 * 60 * 1000,   // 10 minutes
  }
}
