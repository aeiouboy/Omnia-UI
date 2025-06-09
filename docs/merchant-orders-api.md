# Merchant Orders API Documentation

## Overview

The Merchant Orders API provides access to order data from the external system. This API is a proxy to the external API and handles authentication, error handling, and response formatting.

## Base URL

\`\`\`
https://dev-pmpapis.central.co.th/pmp/v2/grabmart/v1/merchant/orders
\`\`\`

## Authentication

Authentication is handled automatically by the system. The API uses the following credentials:

- `partnerClientId`: "testpocorderlist"
- `partnerClientSecret`: "xitgmLwmp"

## Endpoints

### GET /api/orders/external

Fetch orders from the external API with optional filtering and pagination.

#### Query Parameters

| Parameter | Type | Description | Default | Example |
|-----------|------|-------------|---------|---------|
| `page` | number | Page number (1-based) | `1` | `2` |
| `pageSize` | number | Items per page | `10` | `25` |
| `status` | string | Filter by order status | - | `PENDING` |
| `channel` | string | Filter by sales channel | - | `ONLINE` |
| `search` | string | Search term | - | `john` |

#### Example Request

\`\`\`bash
curl -X GET "https://your-domain.com/api/orders/external?page=1&pageSize=10&status=PENDING" \
  -H "Content-Type: application/json"
\`\`\`

#### Response Format

\`\`\`json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "order_123",
        "order_no": "ORD-2024-001",
        "customer": {
          "name": "John Doe",
          "email": "john@example.com",
          "phone": "+1-555-0123"
        },
        "order_date": "2024-01-15T10:30:00Z",
        "status": "PENDING",
        "channel": "ONLINE",
        "items": [
          {
            "product_name": "Wireless Headphones",
            "product_sku": "WH-001",
            "quantity": 2,
            "unit_price": 99.99
          }
        ],
        "total_amount": 199.98
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 150,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
\`\`\`

## Error Handling

The API returns appropriate HTTP status codes and detailed error messages:

### Error Response Format

\`\`\`json
{
  "success": false,
  "error": "Detailed error message",
  "fallback": true,
  "data": {
    "data": [],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 0,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
\`\`\`

### Common Error Scenarios

1. **Authentication Failure**: When the system cannot authenticate with the external API
2. **API Error**: When the external API returns an error
3. **Timeout**: When the external API takes too long to respond
4. **Network Error**: When there's a network issue connecting to the external API

## Usage Examples

### JavaScript/TypeScript

\`\`\`typescript
// Fetch orders from external API
async function fetchExternalOrders(page = 1, pageSize = 10) {
  const response = await fetch(`/api/orders/external?page=${page}&pageSize=${pageSize}`);
  const data = await response.json();
  
  if (!data.success) {
    console.error("Error fetching orders:", data.error);
    return data.data; // Return fallback data
  }
  
  return data.data;
}
\`\`\`

## Implementation Notes

1. The API automatically handles authentication with the external system
2. Tokens are cached to avoid repeated authentication requests
3. If a request fails with a 401 Unauthorized, the system will automatically refresh the token and retry
4. All errors return a fallback response with an empty data array to prevent frontend crashes
5. Detailed logging is included for debugging purposes
