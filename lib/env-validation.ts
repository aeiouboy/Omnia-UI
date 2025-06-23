// Environment variable validation
export interface EnvConfig {
  // External API Configuration
  API_BASE_URL: string
  PARTNER_CLIENT_ID: string
  PARTNER_CLIENT_SECRET: string
  
  // Optional configurations
  NEXT_PUBLIC_SUPABASE_URL?: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string
  NEXT_PUBLIC_MS_TEAMS_WEBHOOK_URL?: string
  NEXT_PUBLIC_APP_URL?: string
}

export class EnvValidationError extends Error {
  constructor(message: string, public missingVars: string[]) {
    super(message)
    this.name = 'EnvValidationError'
  }
}

/**
 * Validates that all required environment variables are present
 * @throws {EnvValidationError} If required variables are missing
 */
export function validateEnv(): EnvConfig {
  const required = {
    API_BASE_URL: process.env.API_BASE_URL,
    PARTNER_CLIENT_ID: process.env.PARTNER_CLIENT_ID,
    PARTNER_CLIENT_SECRET: process.env.PARTNER_CLIENT_SECRET,
  }

  const optional = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_MS_TEAMS_WEBHOOK_URL: process.env.NEXT_PUBLIC_MS_TEAMS_WEBHOOK_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  }

  // Check for missing required variables
  const missingVars: string[] = []
  for (const [key, value] of Object.entries(required)) {
    if (!value) {
      missingVars.push(key)
    }
  }

  if (missingVars.length > 0) {
    throw new EnvValidationError(
      `Missing required environment variables: ${missingVars.join(', ')}`,
      missingVars
    )
  }

  return {
    ...required,
    ...optional,
  } as EnvConfig
}

/**
 * Get environment configuration with validation
 * Returns null if validation fails (for non-critical operations)
 */
export function getEnvConfig(): EnvConfig | null {
  try {
    return validateEnv()
  } catch (error) {
    if (error instanceof EnvValidationError) {
      console.error('⚠️ Environment validation failed:', error.message)
      return null
    }
    throw error
  }
}

/**
 * Check if we're in development mode
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development'
}

/**
 * Check if we have valid API credentials
 */
export function hasValidApiCredentials(): boolean {
  const config = getEnvConfig()
  return !!(
    config?.API_BASE_URL &&
    config?.PARTNER_CLIENT_ID &&
    config?.PARTNER_CLIENT_SECRET
  )
}