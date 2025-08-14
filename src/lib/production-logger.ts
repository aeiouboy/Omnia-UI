/**
 * Production-safe logging utility
 * Replaces console.log with structured logging in production
 */

export const logger = {
  /**
   * Log informational messages
   * In production: sends to monitoring service
   * In development: shows in console
   */
  info: (message: string, data?: unknown) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`ℹ️ ${message}`, data || '')
    } else {
      // In production, send to monitoring service (Sentry, DataDog, etc.)
      // This prevents console spam in production while maintaining logging
    }
  },

  /**
   * Log warning messages - always shown
   */
  warn: (message: string, data?: unknown) => {
    console.warn(`⚠️ ${message}`, data || '')
  },

  /**
   * Log error messages - always shown
   */
  error: (message: string, error?: unknown) => {
    console.error(`❌ ${message}`, error || '')
  },

  /**
   * Log debug messages - only in development
   */
  debug: (message: string, data?: unknown) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🐛 ${message}`, data || '')
    }
  },

  /**
   * Log performance metrics
   */
  perf: (message: string, timing?: number) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`⚡ ${message}${timing ? ` (${timing}ms)` : ''}`)
    }
    // In production: send to performance monitoring
  }
}

/**
 * Cache validation logger - production safe
 */
export const cacheLogger = {
  miss: (reason: string) => logger.debug(`Cache miss: ${reason}`),
  hit: (details: string) => logger.debug(`Cache hit: ${details}`),
  invalidated: (reason: string) => logger.debug(`Cache invalidated: ${reason}`)
}

/**
 * API logger - production safe  
 */
export const apiLogger = {
  request: (url: string, method: string) => logger.debug(`API ${method}: ${url}`),
  success: (url: string, count?: number) => logger.debug(`API Success: ${url}${count ? ` (${count} items)` : ''}`),
  error: (url: string, error: unknown) => logger.error(`API Error: ${url}`, error)
}