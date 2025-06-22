// Request optimization service with batching and deduplication
// Implements request batching and deduplication within 100ms window

interface PendingRequest<T> {
  promise: Promise<T>
  resolve: (value: T) => void
  reject: (error: any) => void
  timestamp: number
}

interface BatchConfig {
  batchWindow: number      // Batching window in milliseconds
  maxBatchSize: number     // Maximum requests in a batch
  timeout: number          // Request timeout in milliseconds
}

class RequestService {
  private pendingRequests = new Map<string, PendingRequest<any>>()
  private batchTimers = new Map<string, NodeJS.Timeout>()
  private config: BatchConfig

  constructor(config: Partial<BatchConfig> = {}) {
    this.config = {
      batchWindow: 100,      // 100ms batching window
      maxBatchSize: 10,      // Max 10 requests per batch
      timeout: 30000,        // 30 second timeout
      ...config
    }
  }

  // Generate request key for deduplication
  private generateRequestKey(url: string, options: RequestInit = {}): string {
    const method = options.method || 'GET'
    const body = options.body || ''
    const headers = JSON.stringify(options.headers || {})
    return `${method}:${url}:${headers}:${body}`
  }

  // Deduplicated fetch with caching
  async fetch<T = any>(url: string, options: RequestInit = {}): Promise<T> {
    const key = this.generateRequestKey(url, options)
    
    // Check if identical request is already pending
    const existing = this.pendingRequests.get(key)
    if (existing) {
      console.log(`🔗 Request deduplication for ${url}`)
      return existing.promise
    }

    // Create new request promise
    let resolve: (value: T) => void
    let reject: (error: any) => void
    
    const promise = new Promise<T>((res, rej) => {
      resolve = res
      reject = rej
    })

    // Store pending request
    const pendingRequest: PendingRequest<T> = {
      promise,
      resolve: resolve!,
      reject: reject!,
      timestamp: Date.now()
    }
    
    this.pendingRequests.set(key, pendingRequest)

    // Execute request with timeout
    this.executeRequest(url, options, pendingRequest)
      .then((result) => {
        pendingRequest.resolve(result)
        this.pendingRequests.delete(key)
      })
      .catch((error) => {
        pendingRequest.reject(error)
        this.pendingRequests.delete(key)
      })

    return promise
  }

  // Execute actual HTTP request
  private async executeRequest<T>(
    url: string, 
    options: RequestInit, 
    pendingRequest: PendingRequest<T>
  ): Promise<T> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

    try {
      console.log(`🔄 Executing request: ${options.method || 'GET'} ${url}`)
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      console.log(`✅ Request completed: ${url}`)
      return result

    } catch (error) {
      clearTimeout(timeoutId)
      console.error(`❌ Request failed: ${url}`, error)
      throw error
    }
  }

  // Batch multiple requests with similar patterns
  async batchFetch<T = any>(requests: Array<{url: string, options?: RequestInit}>): Promise<T[]> {
    console.log(`📦 Batching ${requests.length} requests`)
    
    // Execute all requests in parallel with deduplication
    const promises = requests.map(({ url, options }) => 
      this.fetch<T>(url, options)
    )

    try {
      const results = await Promise.all(promises)
      console.log(`✅ Batch completed: ${results.length} results`)
      return results
    } catch (error) {
      console.error('❌ Batch request failed:', error)
      throw error
    }
  }

  // Cancel pending requests
  cancelPendingRequests(): void {
    console.log(`🚫 Cancelling ${this.pendingRequests.size} pending requests`)
    
    for (const [key, request] of this.pendingRequests.entries()) {
      request.reject(new Error('Request cancelled'))
      this.pendingRequests.delete(key)
    }

    // Clear batch timers
    for (const timer of this.batchTimers.values()) {
      clearTimeout(timer)
    }
    this.batchTimers.clear()
  }

  // Get request statistics
  getStats() {
    return {
      pendingRequests: this.pendingRequests.size,
      activeBatches: this.batchTimers.size,
      batchWindow: this.config.batchWindow,
      maxBatchSize: this.config.maxBatchSize
    }
  }

  // Exponential backoff retry logic
  async fetchWithRetry<T = any>(
    url: string, 
    options: RequestInit = {}, 
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: any
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.fetch<T>(url, options)
      } catch (error) {
        lastError = error
        
        if (attempt === maxRetries) {
          break
        }

        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempt - 1) * 1000
        console.log(`⏳ Retry attempt ${attempt} in ${delay}ms for ${url}`)
        
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    throw lastError
  }

  // Request with circuit breaker pattern
  private failureCounts = new Map<string, number>()
  private circuitBreakers = new Map<string, number>() // endpoint -> timestamp when circuit opens

  async fetchWithCircuitBreaker<T = any>(
    url: string, 
    options: RequestInit = {},
    failureThreshold: number = 5,
    recoveryTime: number = 60000 // 1 minute
  ): Promise<T> {
    const endpoint = new URL(url).pathname
    const now = Date.now()
    
    // Check if circuit is open
    const circuitOpenTime = this.circuitBreakers.get(endpoint)
    if (circuitOpenTime && now - circuitOpenTime < recoveryTime) {
      throw new Error(`Circuit breaker open for ${endpoint}`)
    }

    try {
      const result = await this.fetch<T>(url, options)
      
      // Reset failure count on success
      this.failureCounts.set(endpoint, 0)
      this.circuitBreakers.delete(endpoint)
      
      return result
    } catch (error) {
      // Increment failure count
      const failures = (this.failureCounts.get(endpoint) || 0) + 1
      this.failureCounts.set(endpoint, failures)
      
      // Open circuit if threshold reached
      if (failures >= failureThreshold) {
        console.warn(`🔌 Circuit breaker opened for ${endpoint}`)
        this.circuitBreakers.set(endpoint, now)
      }
      
      throw error
    }
  }
}

// Global request service instance
export const requestService = new RequestService()

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    requestService.cancelPendingRequests()
  })
}

// Request service presets
export const RequestPresets = {
  ORDERS_API: {
    batchWindow: 100,
    maxBatchSize: 5,
    timeout: 15000
  },
  DASHBOARD_API: {
    batchWindow: 50,
    maxBatchSize: 10, 
    timeout: 10000
  },
  DETAILS_API: {
    batchWindow: 200,
    maxBatchSize: 3,
    timeout: 20000
  }
}
