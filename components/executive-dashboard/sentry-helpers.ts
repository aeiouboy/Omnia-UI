import * as Sentry from '@sentry/nextjs'

/**
 * Capture exceptions with executive dashboard context
 */
export function captureException(
  error: Error | unknown,
  context: {
    component: string
    action?: string
    data?: Record<string, any>
  }
) {
  if (typeof window === 'undefined') return
  
  const sentryContext = {
    tags: {
      component: `executive-dashboard.${context.component}`,
      action: context.action || 'unknown'
    },
    extra: context.data || {},
    level: 'error' as const
  }
  
  console.error(`[Dashboard Error] ${context.component}:`, error)
  
  try {
    Sentry.captureException(error, sentryContext)
  } catch (sentryError) {
    console.error('Failed to log to Sentry:', sentryError)
  }
}

/**
 * Log a warning message to Sentry
 */
export function captureMessage(
  message: string,
  context: {
    component: string
    data?: Record<string, any>
  }
) {
  if (typeof window === 'undefined') return
  
  const sentryContext = {
    tags: {
      component: `executive-dashboard.${context.component}`
    },
    extra: context.data || {},
    level: 'warning' as const
  }
  
  console.warn(`[Dashboard Warning] ${context.component}: ${message}`)
  
  try {
    Sentry.captureMessage(message, sentryContext)
  } catch (sentryError) {
    console.error('Failed to log to Sentry:', sentryError)
  }
}

/**
 * Start a performance transaction
 */
export function startTransaction(name: string, op: string) {
  if (typeof window === 'undefined') return null
  
  try {
    // startTransaction is not available in the current Sentry version
    // TODO: Update to use new performance monitoring API
    return null
  } catch (error) {
    console.error('Failed to start Sentry transaction:', error)
    return null
  }
}

/**
 * Safely finish a transaction
 */
export function finishTransaction(transaction: any) {
  if (!transaction) return
  
  try {
    transaction.finish()
  } catch (error) {
    console.error('Failed to finish Sentry transaction:', error)
  }
}