// Authentication retry mechanism with exponential backoff
export interface RetryOptions {
  maxRetries?: number
  initialDelay?: number
  maxDelay?: number
  backoffFactor?: number
  onRetry?: (attempt: number, error: Error) => void
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffFactor: 2,
  onRetry: () => {}, // no-op
}

/**
 * Sleep for a given number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Calculate delay for exponential backoff
 */
function calculateDelay(
  attempt: number,
  initialDelay: number,
  maxDelay: number,
  backoffFactor: number
): number {
  const delay = initialDelay * Math.pow(backoffFactor, attempt - 1)
  // Add jitter (±10% randomization)
  const jitter = delay * 0.1 * (Math.random() * 2 - 1)
  return Math.min(delay + jitter, maxDelay)
}

/**
 * Retry a function with exponential backoff
 * @param fn Function to retry
 * @param options Retry options
 * @returns Result of the function
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      // Don't retry on the last attempt
      if (attempt === opts.maxRetries) {
        break
      }

      // Call the retry callback
      opts.onRetry(attempt, lastError)

      // Calculate and apply delay
      const delay = calculateDelay(
        attempt,
        opts.initialDelay,
        opts.maxDelay,
        opts.backoffFactor
      )
      
      console.log(`⏳ Retry attempt ${attempt}/${opts.maxRetries} after ${delay}ms delay...`)
      await sleep(delay)
    }
  }

  // All retries exhausted
  throw lastError || new Error('All retry attempts failed')
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: Error): boolean {
  // Network errors
  if (error.message.includes('fetch failed')) return true
  if (error.message.includes('ECONNREFUSED')) return true
  if (error.message.includes('ETIMEDOUT')) return true
  if (error.message.includes('ENOTFOUND')) return true
  if (error.message.includes('socket hang up')) return true
  
  // HTTP status codes that are retryable
  const retryableStatusMessages = [
    '429', // Too Many Requests
    '502', // Bad Gateway
    '503', // Service Unavailable
    '504', // Gateway Timeout
  ]
  
  return retryableStatusMessages.some(status => error.message.includes(status))
}

/**
 * Create a retry-enabled version of a function
 */
export function withRetry<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: RetryOptions = {}
): T {
  return (async (...args: Parameters<T>) => {
    return retryWithBackoff(() => fn(...args), options)
  }) as T
}