// Debug authentication specifically for poc-orderlist endpoint

const PARTNER_CLIENT_ID = "testpocorderlist"
const PARTNER_CLIENT_SECRET = "xitgmLwmp"

// Debug function to test authentication with detailed logging
export async function debugAuth() {
  const baseUrls = [
    "https://service-api-nonprd.central.co.th/dev/pmprevamp/grabmart/v1",
    "https://dev-pmpapis.central.co.th/pmp/v2/grabmart/v1"
  ]

  for (const baseUrl of baseUrls) {
    console.log(`\n🔍 Testing base URL: ${baseUrl}`)
    
    const authUrl = `${baseUrl}/auth/poc-orderlist/login`
    console.log(`🔐 Auth URL: ${authUrl}`)
    
    const requestBody = {
      partnerClientId: PARTNER_CLIENT_ID,
      partnerClientSecret: PARTNER_CLIENT_SECRET
    }
    
    console.log(`📤 Request body:`, requestBody)
    
    try {
      const response = await fetch(authUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "User-Agent": "RIS-OMS-Debug/1.0"
        },
        body: JSON.stringify(requestBody)
      })
      
      console.log(`📥 Response status: ${response.status} ${response.statusText}`)
      console.log(`📥 Response headers:`, Object.fromEntries(response.headers.entries()))
      
      const responseText = await response.text()
      console.log(`📥 Response body: ${responseText}`)
      
      if (response.ok) {
        try {
          const data = JSON.parse(responseText)
          console.log(`✅ Success! Response data:`, data)
          
          // Check for token in different fields
          const token = data.token || data.access_token || data.accessToken || data.authToken
          if (token) {
            console.log(`🎟️ Token found: ${token.substring(0, 20)}...`)
            return {
              success: true,
              token,
              data,
              endpoint: authUrl
            }
          } else {
            console.log(`⚠️ No token field found in response`)
            return {
              success: false,
              error: "No token in response",
              data,
              endpoint: authUrl
            }
          }
        } catch (parseError) {
          console.log(`⚠️ Response is not JSON: ${parseError}`)
          return {
            success: false,
            error: "Invalid JSON response",
            response: responseText,
            endpoint: authUrl
          }
        }
      } else {
        console.log(`❌ Auth failed: ${response.status}`)
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          response: responseText,
          endpoint: authUrl
        }
      }
      
    } catch (error) {
      console.log(`❌ Network error: ${error.message}`)
      return {
        success: false,
        error: `Network error: ${error.message}`,
        endpoint: authUrl
      }
    }
  }
  
  return {
    success: false,
    error: "All endpoints failed"
  }
}

// Test specific endpoint variations
export async function testEndpointVariations() {
  const baseUrl = "https://service-api-nonprd.central.co.th/dev/pmprevamp/grabmart/v1"
  
  const endpoints = [
    "/auth/poc-orderlist/login",
    "/auth/login",
    "/auth/partner/login", 
    "/partner/auth/login",
    "/oauth/token",
    "/api/auth/login",
    "/api/v1/auth/login",
    "/login"
  ]
  
  const results = []
  
  for (const endpoint of endpoints) {
    const fullUrl = `${baseUrl}${endpoint}`
    console.log(`\n🧪 Testing endpoint: ${fullUrl}`)
    
    try {
      const response = await fetch(fullUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          partnerClientId: PARTNER_CLIENT_ID,
          partnerClientSecret: PARTNER_CLIENT_SECRET
        })
      })
      
      const responseText = await response.text()
      console.log(`📥 ${response.status}: ${responseText.substring(0, 200)}`)
      
      results.push({
        endpoint: fullUrl,
        status: response.status,
        statusText: response.statusText,
        response: responseText.substring(0, 500)
      })
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`)
      results.push({
        endpoint: fullUrl,
        error: error.message
      })
    }
  }
  
  return results
}