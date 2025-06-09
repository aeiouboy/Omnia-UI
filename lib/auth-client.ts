// Authentication client for external API
const PARTNER_CLIENT_ID = process.env.PARTNER_CLIENT_ID || "testpocorderlist"
const PARTNER_CLIENT_SECRET = process.env.PARTNER_CLIENT_SECRET || "xitgmLwmp"
const BASE_URL = process.env.API_BASE_URL || "https://dev-pmpapis.central.co.th/pmp/v2/grabmart/v1"

// Cache for authentication token
let authToken: string | null = null
let tokenExpiry = 0

/**
 * Get authentication token for external API
 * @param forceRefresh Force refresh token even if cached token is valid
 * @returns Promise with authentication token
 */
export async function getAuthToken(forceRefresh = false): Promise<string> {
  // Check if we have a valid cached token
  if (!forceRefresh && authToken && Date.now() < tokenExpiry) {
    return authToken
  }

  console.log("🔐 Authenticating with external API...")

  const authController = new AbortController()
  const authTimeoutId = setTimeout(() => authController.abort(), 15000)

  try {
    const loginResponse = await fetch(`${BASE_URL}/auth/poc-orderlist/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        partnerClientId: PARTNER_CLIENT_ID,
        partnerClientSecret: PARTNER_CLIENT_SECRET,
      }),
      signal: authController.signal,
    })

    clearTimeout(authTimeoutId)

    if (!loginResponse.ok) {
      const errorText = await loginResponse.text()
      console.error(`❌ Auth Error: ${loginResponse.status} - ${loginResponse.statusText}`)
      console.error(`❌ Auth Response: ${errorText}`)
      throw new Error(`Authentication failed: ${loginResponse.status} - ${loginResponse.statusText}`)
    }

    const authData = await loginResponse.json()
    console.log("✅ Authentication successful")

    // Cache the token (assuming it expires in 1 hour if not specified)
    authToken = authData.token || authData.access_token || authData.accessToken
    tokenExpiry = Date.now() + (authData.expires_in ? authData.expires_in * 1000 : 3600000) // 1 hour default

    if (!authToken) {
      throw new Error("No token received from authentication response")
    }

    return authToken
  } catch (error) {
    clearTimeout(authTimeoutId)
    console.error("❌ Authentication error:", error)
    throw error
  }
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
 * Create an authentication client for external API
 * @returns Authentication client object
 */
export function createAuthClient() {
  return {
    authenticate: async (forceRefresh = false) => {
      return getAuthToken(forceRefresh)
    },
    fetch: createAuthenticatedFetch(),
  }
}

// React hook for using the auth client (client-side only)
export function useAuthClient() {
  return createAuthClient()
}
