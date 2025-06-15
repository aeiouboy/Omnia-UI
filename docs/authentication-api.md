# External Authentication API

This document describes the external authentication API endpoint for the RIS OMS system.

## Authentication Endpoint

### POST /api/auth/external

Authenticates with the external partner API and returns an access token.

#### Request

- **Method**: POST
- **URL**: `{{baseUrl}}/api/auth/external`
- **Headers**: 
  - `Content-Type: application/json`

#### Request Body

\`\`\`json
{
  "partnerClientId": "testpocorderlist",
  "partnerClientSecret": "xitgmLwmp"
}
\`\`\`

**Note**: The credentials are automatically handled by environment variables:
- `PARTNER_CLIENT_ID` (defaults to "testpocorderlist")
- `PARTNER_CLIENT_SECRET` (defaults to "xitgmLwmp")

#### Response

##### Success Response (200)

\`\`\`json
{
  "success": true,
  "message": "Authentication successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600,
    "token_type": "Bearer",
    "authenticated_at": "2024-01-15T10:30:00.000Z"
  }
}
\`\`\`

##### Error Response (4xx/5xx)

\`\`\`json
{
  "success": false,
  "error": "Authentication failed: 401 - Unauthorized",
  "details": "Invalid credentials",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
\`\`\`

### GET /api/auth/external

Returns information about the authentication endpoint configuration.

#### Response

\`\`\`json
{
  "message": "External authentication endpoint",
  "endpoint": "/api/auth/external",
  "method": "POST",
  "description": "Authenticate with external partner API",
  "required_env_vars": [
    "PARTNER_CLIENT_ID",
    "PARTNER_CLIENT_SECRET",
    "API_BASE_URL"
  ],
  "current_config": {
    "client_id": "testpocorderlist",
    "base_url": "https://dev-pmpapis.central.co.th/pmp/v2/grabmart/v1",
    "has_secret": true
  }
}
\`\`\`

## Environment Variables

The following environment variables are used for authentication:

- `PARTNER_CLIENT_ID`: Partner client ID (default: "testpocorderlist")
- `PARTNER_CLIENT_SECRET`: Partner client secret (default: "xitgmLwmp")
- `API_BASE_URL`: Base URL for the external API (default: "https://dev-pmpapis.central.co.th/pmp/v2/grabmart/v1")

## Authentication Endpoints

The system tries multiple authentication endpoints in order:

1. `/auth/poc-orderlist/login` - **Specified POC endpoint** (should work with testpocorderlist credentials)
   - **Current Status**: Returns 404 Not Found
   - **Expected**: Should return valid JWT token
   - **Credentials**: partnerClientId: "testpocorderlist", partnerClientSecret: "xitgmLwmp"

2. `/auth/login` - Generic auth endpoint  
   - **Current Status**: Returns 401 Unauthorized (endpoint exists, credentials rejected)
   - **Note**: Endpoint works but rejects testpocorderlist credentials

3. `/merchant/auth/login` - Merchant API endpoint (404 Not Found)
4. `/auth/partner/login` - Partner-specific endpoint (404 Not Found) 
5. `/partner/auth/login` - Alternative partner endpoint (404 Not Found)
6. `/oauth/token` - OAuth2 standard endpoint (404 Not Found)

## Current Issue

The `/auth/poc-orderlist/login` endpoint returns 404 Not Found, suggesting it may not be deployed on the current API server (`dev-pmpapis.central.co.th`). This endpoint should work according to the specification.

## Usage Examples

### Using the Auth Client

\`\`\`typescript
import { createAuthClient } from '@/lib/auth-client'

const authClient = createAuthClient()

// Authenticate and get token
try {
  const token = await authClient.authenticate()
  console.log('Access token:', token)
} catch (error) {
  console.error('Authentication failed:', error)
}

// Check if we have a valid token
if (authClient.hasValidToken()) {
  console.log('Token is valid')
}

// Clear cached token
authClient.clearToken()
\`\`\`

### Using the React Hook

\`\`\`typescript
import { useExternalAuth } from '@/lib/auth-client'

function MyComponent() {
  const { authenticate, hasValidToken, clearToken } = useExternalAuth()

  const handleAuth = async () => {
    try {
      const token = await authenticate()
      console.log('Authenticated successfully')
    } catch (error) {
      console.error('Authentication failed:', error)
    }
  }

  return (
    <div>
      <button onClick={handleAuth}>Authenticate</button>
      <p>Has valid token: {hasValidToken() ? 'Yes' : 'No'}</p>
      <button onClick={clearToken}>Clear Token</button>
    </div>
  )
}
\`\`\`

### Direct API Call

\`\`\`javascript
// POST request to authenticate
const response = await fetch('/api/auth/external', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
})

const authData = await response.json()

if (authData.success) {
  const token = authData.data.token
  // Use token for subsequent API calls
} else {
  console.error('Authentication failed:', authData.error)
}
\`\`\`

## Error Handling

The API handles various error scenarios:

1. **Network Timeout**: 15-second timeout for authentication requests
2. **Invalid Credentials**: Returns 401 with error details
3. **Missing Token**: Returns 500 if no token is received
4. **Server Errors**: Returns appropriate HTTP status codes with error messages

## Security Notes

- Credentials are stored as environment variables
- Tokens are cached with automatic expiration
- All requests include proper timeout handling
- Error responses include minimal information to prevent information leakage
