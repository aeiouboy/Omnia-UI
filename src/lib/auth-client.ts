// Authentication client for external API

// Get environment configuration directly
const API_BASE_URL = process.env.API_BASE_URL || "https://dev-pmpapis.central.co.th/pmp/v2/grabmart/v1"
const PARTNER_CLIENT_ID = process.env.PARTNER_CLIENT_ID
const PARTNER_CLIENT_SECRET = process.env.PARTNER_CLIENT_SECRET

// Authentication endpoints to try (based on API testing)
const AUTH_ENDPOINTS = [
  "/auth/poc-orderlist/login", // ✅ Correct endpoint per CLAUDE.md
  "/auth/login", // Fallback endpoint
]

// Cache for authentication token
let authToken: string | null = null
let tokenExpiry = 0

/**
 * Get authentication token for external API with multiple fallback strategies
 * @param forceRefresh Force refresh token even if cached token is valid
 * @returns Promise with authentication token
 */
export async function getAuthToken(forceRefresh = false): Promise<string> {
  // Check if we have a valid cached token
  if (!forceRefresh && authToken && Date.now() < tokenExpiry) {
    return authToken
  }

  // Validate environment configuration
  if (!PARTNER_CLIENT_ID || !PARTNER_CLIENT_SECRET) {
    const error = new Error('Invalid API credentials configuration')
    console.error('❌ Authentication failed: Missing or invalid API credentials')
    console.error('Please ensure the following environment variables are set:')
    console.error('- API_BASE_URL')
    console.error('- PARTNER_CLIENT_ID')
    console.error('- PARTNER_CLIENT_SECRET')
    throw error
  }

  console.log("🔐 Authenticating with external API...")
  console.log(`🔑 Using credentials: ${PARTNER_CLIENT_ID} / [PROTECTED]`)
  console.log(`🌐 API endpoint: ${API_BASE_URL}`)
  console.log(`🔐 Available auth endpoints: ${AUTH_ENDPOINTS.length}`)

  // Try different auth endpoints
  const baseUrl = API_BASE_URL
  console.log(`🌐 Using API endpoint: ${baseUrl}`)
    
  for (const authEndpoint of AUTH_ENDPOINTS) {
    const fullUrl = `${baseUrl}${authEndpoint}`
    console.log(`🔐 Trying auth endpoint: ${fullUrl}`)

    const authController = new AbortController()
    const authTimeoutId = setTimeout(() => authController.abort(), 15000)

    try {
        // Prepare request body - try different formats
        const requestBodies = [
          // Primary format for POC
          {
            partnerClientId: PARTNER_CLIENT_ID,
            partnerClientSecret: PARTNER_CLIENT_SECRET,
          },
          // Standard OAuth2 format
          {
            grant_type: "client_credentials",
            client_id: PARTNER_CLIENT_ID,
            client_secret: PARTNER_CLIENT_SECRET,
          },
          // Alternative formats
          {
            client_id: PARTNER_CLIENT_ID,
            client_secret: PARTNER_CLIENT_SECRET,
          },
          {
            username: PARTNER_CLIENT_ID,
            password: PARTNER_CLIENT_SECRET,
          },
          // Try different field names
          {
            clientId: PARTNER_CLIENT_ID,
            clientSecret: PARTNER_CLIENT_SECRET,
          },
          {
            user: PARTNER_CLIENT_ID,
            pass: PARTNER_CLIENT_SECRET,
          }
        ]

        for (const requestBody of requestBodies) {
          try {
            console.log(`📤 Trying request body format:`, Object.keys(requestBody))

            const loginResponse = await fetch(fullUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "User-Agent": "RIS-OMS/1.0",
              },
              body: JSON.stringify(requestBody),
              signal: authController.signal,
            })

            clearTimeout(authTimeoutId)

            console.log(`📥 Response status: ${loginResponse.status} ${loginResponse.statusText}`)

            if (loginResponse.ok) {
              const authData = await loginResponse.json()
              console.log("✅ Authentication successful!", Object.keys(authData))

              // Try different token field names
              authToken = authData.token || 
                         authData.access_token || 
                         authData.accessToken || 
                         authData.authToken ||
                         authData.jwt ||
                         authData.bearerToken

              if (authToken) {
                // Set expiry time
                const expiresIn = authData.expires_in || authData.expiresIn || 3600
                tokenExpiry = Date.now() + (expiresIn * 1000)
                
                console.log(`✅ Token obtained: ${authToken.substring(0, 20)}...`)
                console.log(`⏰ Token expires in: ${expiresIn} seconds`)
                
                return authToken
              } else {
                console.warn("⚠️ No token found in response:", authData)
              }
            } else {
              const errorText = await loginResponse.text()
              console.warn(`⚠️ Auth failed: ${fullUrl} - ${loginResponse.status} - ${errorText}`)
              
              // For 401/403, log the response but continue trying other formats
              if (loginResponse.status === 401 || loginResponse.status === 403) {
                console.log(`🔑 Auth response for ${fullUrl}:`, errorText)
                continue
              }
            }
          } catch (bodyError: any) {
            console.warn(`⚠️ Request body format failed:`, bodyError.message)
            continue
          }
        }
    } catch (error: any) {
      clearTimeout(authTimeoutId)
      console.warn(`⚠️ Auth endpoint failed: ${fullUrl} - ${error.message}`)
      continue
    }
  }

  // If all attempts failed, throw error
  const errorMessage = `Authentication failed on all endpoints. Tried ${AUTH_ENDPOINTS.length} auth endpoints.`
  console.error("❌", errorMessage)
  console.log("📋 Authentication Status Summary:")
  console.log(`🔑 Using credentials from environment: ${PARTNER_CLIENT_ID}`)
  
  throw new Error(errorMessage)
}

/**
 * Create an authenticated fetch function for external API
 * @returns Function that performs authenticated fetch requests
 */
export function createAuthenticatedFetch() {
  return async (url: string, options: RequestInit = {}) => {
    const token = await getAuthToken()

    const headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    }

    return fetch(url, {
      ...options,
      headers,
    })
  }
}

/**
 * Manually set a valid Bearer Token (for when you have a working token)
 * @param token Valid Bearer Token
 * @param expiresIn Token expiry time in seconds (default: 1 hour)
 */
export function setManualAuthToken(token: string, expiresIn = 3600) {
  authToken = token
  tokenExpiry = Date.now() + (expiresIn * 1000)
  console.log("✅ Manual Bearer Token set successfully")
  console.log(`⏰ Token expires in: ${expiresIn} seconds`)
}

/**
 * Create an authentication client for external API
 * @returns Authentication client object
 */
export function createAuthClient() {
  return {
    authenticate: async (forceRefresh = false) => {
      return getAuthToken(forceRefresh)
    },
    fetch: createAuthenticatedFetch(),
    setToken: setManualAuthToken,
    hasValidToken: () => authToken && Date.now() < tokenExpiry,
    clearToken: () => {
      authToken = null
      tokenExpiry = 0
    }
  }
}

// React hook for using the auth client (client-side only)
export function useAuthClient() {
  return createAuthClient()
}
