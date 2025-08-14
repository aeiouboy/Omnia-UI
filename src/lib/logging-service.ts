/**
 * Structured Console Progress Logging System for Multi-Page Fetching Operations
 * Provides detailed console output with emoji indicators and performance metrics
 */

export type LogLevel = 'info' | 'success' | 'warning' | 'error' | 'debug'

export interface LogContext {
  operation?: string
  page?: number
  totalPages?: number
  orders?: number
  totalOrders?: number
  elapsed?: number
  pageTime?: number
  avgTime?: number
  progress?: number
  hasNext?: boolean
  retries?: number
  errors?: string[]
  memory?: string
  [key: string]: any
}

export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: number
  context?: LogContext
  stackTrace?: string
}

class LoggingService {
  private logs: LogEntry[] = []
  private maxLogs: number = 1000
  private enableConsole: boolean = true
  private enableStorage: boolean = false
  private sessionId: string
  private startTime: number

  constructor(options: {
    maxLogs?: number
    enableConsole?: boolean
    enableStorage?: boolean
  } = {}) {
    this.maxLogs = options.maxLogs || 1000
    this.enableConsole = options.enableConsole !== false
    this.enableStorage = options.enableStorage || false
    this.sessionId = this.generateSessionId()
    this.startTime = Date.now()
  }

  private generateSessionId(): string {
    return `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private getEmoji(level: LogLevel): string {
    const emojis = {
      info: '🔄',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      debug: '🔍'
    }
    return emojis[level]
  }

  private formatTime(timestamp: number): string {
    const elapsed = timestamp - this.startTime
    const seconds = (elapsed / 1000).toFixed(1)
    return `+${seconds}s`
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const emoji = this.getEmoji(level)
    const time = this.formatTime(Date.now())
    
    let formatted = `${emoji} [${time}] ${message}`
    
    if (context) {
      const details = this.formatContext(context)
      if (details) {
        formatted += ` ${details}`
      }
    }
    
    return formatted
  }

  private formatContext(context: LogContext): string {
    const parts: string[] = []
    
    // Page information
    if (context.page !== undefined) {
      if (context.totalPages) {
        parts.push(`(Page ${context.page}/${context.totalPages})`)
      } else {
        parts.push(`(Page ${context.page})`)
      }
    }
    
    // Progress information
    if (context.progress !== undefined) {
      parts.push(`[${context.progress.toFixed(1)}%]`)
    }
    
    // Orders information
    if (context.orders !== undefined) {
      parts.push(`${context.orders} orders`)
      if (context.totalOrders !== undefined) {
        parts.push(`(total: ${context.totalOrders})`)
      }
    }
    
    // Timing information
    if (context.pageTime !== undefined) {
      parts.push(`${context.pageTime}ms`)
    }
    
    if (context.avgTime !== undefined) {
      parts.push(`(avg: ${context.avgTime.toFixed(0)}ms)`)
    }
    
    // Status information
    if (context.hasNext !== undefined) {
      parts.push(context.hasNext ? 'more pages' : 'last page')
    }
    
    // Performance information
    if (context.memory) {
      parts.push(`mem: ${context.memory}`)
    }
    
    // Error information
    if (context.retries !== undefined && context.retries > 0) {
      parts.push(`retries: ${context.retries}`)
    }
    
    if (context.errors && context.errors.length > 0) {
      parts.push(`errors: ${context.errors.length}`)
    }
    
    return parts.join(' ')
  }

  private addLog(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    const logEntry: LogEntry = {
      level,
      message,
      timestamp: Date.now(),
      context,
      stackTrace: error?.stack
    }
    
    this.logs.push(logEntry)
    
    // Trim logs if exceeding max
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }
    
    // Console output
    if (this.enableConsole) {
      const formatted = this.formatMessage(level, message, context)
      
      switch (level) {
        case 'error':
          console.error(formatted, context || '', error || '')
          break
        case 'warning':
          console.warn(formatted, context || '')
          break
        case 'success':
        case 'info':
          console.log(formatted, context || '')
          break
        case 'debug':
          console.debug(formatted, context || '')
          break
      }
    }
  }

  // Public logging methods with specific use cases for pagination

  /**
   * Log pagination start
   */
  startPagination(estimatedPages?: number, estimatedTotal?: number, operation: string = 'data fetch'): void {
    this.info(`Starting ${operation}`, {
      operation,
      totalPages: estimatedPages,
      totalOrders: estimatedTotal,
      progress: 0
    })
  }

  /**
   * Log page fetch start
   */
  startPage(page: number, pageSize: number, totalPages?: number): void {
    this.info(`Fetching page ${page}`, {
      operation: 'page fetch',
      page,
      totalPages,
      pageSize
    })
  }

  /**
   * Log successful page completion
   */
  completePage(page: number, orders: number, totalOrders: number, pageTime: number, avgTime: number, hasNext: boolean, totalPages?: number): void {
    const progress = totalPages ? (page / totalPages) * 100 : undefined
    
    this.success(`Page ${page} completed`, {
      operation: 'page complete',
      page,
      totalPages,
      orders,
      totalOrders,
      pageTime,
      avgTime,
      hasNext,
      progress
    })
  }

  /**
   * Log page retry attempt
   */
  retryPage(page: number, attempt: number, maxRetries: number, error: string): void {
    this.warning(`Retrying page ${page}`, {
      operation: 'page retry',
      page,
      retries: attempt,
      maxRetries,
      error
    })
  }

  /**
   * Log page failure
   */
  failPage(page: number, error: string, willContinue: boolean = true): void {
    this.error(`Page ${page} failed`, {
      operation: 'page error',
      page,
      error,
      willContinue
    })
  }

  /**
   * Log pagination completion
   */
  completePagination(totalOrders: number, totalPages: number, totalTime: number, avgTime: number, errors: number = 0, retries: number = 0): void {
    const successRate = totalPages > 0 ? ((totalPages - errors) / totalPages * 100).toFixed(1) : '100'
    
    this.success(`Pagination completed`, {
      operation: 'pagination complete',
      totalOrders,
      totalPages,
      elapsed: totalTime,
      avgTime,
      errors,
      retries,
      successRate: `${successRate}%`,
      progress: 100
    })
  }

  /**
   * Log memory usage
   */
  logMemoryUsage(usage: string, context?: LogContext): void {
    this.debug(`Memory usage: ${usage}`, {
      ...context,
      memory: usage
    })
  }

  /**
   * Log performance warning
   */
  performanceWarning(message: string, context?: LogContext): void {
    this.warning(`Performance: ${message}`, {
      ...context,
      operation: 'performance'
    })
  }

  /**
   * Log timeout event
   */
  timeout(operation: string, elapsed: number, limit: number, partialResults?: number): void {
    this.warning(`Timeout: ${operation}`, {
      operation: 'timeout',
      elapsed,
      limit,
      partialResults
    })
  }

  /**
   * Log cache events
   */
  cacheHit(orders: number, age: number): void {
    this.info(`Cache hit`, {
      operation: 'cache',
      orders,
      age: `${age}ms`,
      type: 'hit'
    })
  }

  cacheMiss(reason: string): void {
    this.info(`Cache miss: ${reason}`, {
      operation: 'cache',
      type: 'miss',
      reason
    })
  }

  cacheUpdate(orders: number): void {
    this.success(`Cache updated`, {
      operation: 'cache',
      orders,
      type: 'update'
    })
  }

  // Basic logging methods
  info(message: string, context?: LogContext): void {
    this.addLog('info', message, context)
  }

  success(message: string, context?: LogContext): void {
    this.addLog('success', message, context)
  }

  warning(message: string, context?: LogContext): void {
    this.addLog('warning', message, context)
  }

  error(message: string, context?: LogContext, error?: Error): void {
    this.addLog('error', message, context, error)
  }

  debug(message: string, context?: LogContext): void {
    this.addLog('debug', message, context)
  }

  // Utility methods

  /**
   * Get all logs for the current session
   */
  getLogs(): LogEntry[] {
    return [...this.logs]
  }

  /**
   * Get logs filtered by level
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level)
  }

  /**
   * Get recent logs (last N entries)
   */
  getRecentLogs(count: number = 10): LogEntry[] {
    return this.logs.slice(-count)
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = []
    this.info('Logs cleared')
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify({
      sessionId: this.sessionId,
      startTime: this.startTime,
      logs: this.logs
    }, null, 2)
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    totalLogs: number
    errorCount: number
    warningCount: number
    successCount: number
    sessionDuration: number
    averageLogRate: number
  } {
    const now = Date.now()
    const duration = now - this.startTime
    
    return {
      totalLogs: this.logs.length,
      errorCount: this.logs.filter(log => log.level === 'error').length,
      warningCount: this.logs.filter(log => log.level === 'warning').length,
      successCount: this.logs.filter(log => log.level === 'success').length,
      sessionDuration: duration,
      averageLogRate: this.logs.length > 0 ? duration / this.logs.length : 0
    }
  }

  /**
   * Create a child logger for specific operations
   */
  createChildLogger(operation: string): {
    info: (message: string, context?: LogContext) => void
    success: (message: string, context?: LogContext) => void
    warning: (message: string, context?: LogContext) => void
    error: (message: string, context?: LogContext, error?: Error) => void
  } {
    return {
      info: (message: string, context?: LogContext) => 
        this.info(message, { ...context, operation }),
      success: (message: string, context?: LogContext) => 
        this.success(message, { ...context, operation }),
      warning: (message: string, context?: LogContext) => 
        this.warning(message, { ...context, operation }),
      error: (message: string, context?: LogContext, error?: Error) => 
        this.error(message, { ...context, operation }, error)
    }
  }
}

// Create singleton instance for global use
export const loggingService = new LoggingService({
  enableConsole: true,
  enableStorage: false,
  maxLogs: 1000
})

// Export for custom instances
export { LoggingService }

// Export types
export type { LogEntry, LogContext }
