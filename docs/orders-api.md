# Orders API Documentation

## Overview

The Orders API provides comprehensive access to order data with advanced filtering, pagination, sorting, and search capabilities. The API is designed to handle large datasets efficiently while maintaining security and performance.

## Base URL

\`\`\`
https://your-domain.com/api/orders
\`\`\`

## Authentication

All requests require authentication using a Bearer token in the Authorization header:

\`\`\`
Authorization: Bearer YOUR_API_TOKEN
\`\`\`

## Rate Limiting

- **Limit**: 100 requests per minute per client
- **Headers**: Rate limit information is included in response headers
- **Exceeded**: Returns 429 status code with retry information

## Endpoints

### GET /api/orders

Fetch orders with optional filtering, pagination, and sorting.

#### Query Parameters

| Parameter | Type | Description | Default | Example |
|-----------|------|-------------|---------|---------|
| `startDate` | string | Filter orders from this date (ISO 8601) | - | `2024-01-01` |
| `endDate` | string | Filter orders until this date (ISO 8601) | - | `2024-12-31` |
| `customerId` | string | Filter by customer ID | - | `cust_123` |
| `customerEmail` | string | Filter by customer email | - | `john@example.com` |
| `status` | enum | Filter by order status | - | `PENDING` |
| `productId` | string | Filter orders containing this product | - | `prod_456` |
| `channel` | string | Filter by sales channel | - | `ONLINE` |
| `businessUnit` | string | Filter by business unit | - | `RETAIL` |
| `page` | number | Page number (1-based) | `1` | `2` |
| `pageSize` | number | Items per page (1-100) | `20` | `50` |
| `sortBy` | enum | Sort field | `created_at` | `order_date` |
| `sortOrder` | enum | Sort direction (`asc`, `desc`) | `desc` | `asc` |
| `search` | string | Search in order number, customer name, email | - | `john` |

#### Status Values

- `PENDING` - Order placed but not yet processed
- `PROCESSING` - Order is being prepared
- `SHIPPED` - Order has been shipped
- `DELIVERED` - Order has been delivered
- `CANCELLED` - Order was cancelled
- `RETURNED` - Order was returned

#### Sort Fields

- `order_date` - Date the order was placed
- `total` - Total order amount
- `created_at` - Date the order was created in system
- `status` - Order status

#### Example Request

\`\`\`bash
curl -X GET "https://your-domain.com/api/orders?status=PENDING&page=1&pageSize=10&sortBy=order_date&sortOrder=desc" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json"
\`\`\`

#### Response Format

\`\`\`json
{
  "data": [
    {
      "id": "order_123",
      "order_no": "ORD-2024-001",
      "customer": {
        "id": "cust_456",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1-555-0123"
      },
      "order_date": "2024-01-15T10:30:00Z",
      "status": "PENDING",
      "channel": "ONLINE",
      "business_unit": "RETAIL",
      "order_type": "STANDARD",
      "items": [
        {
          "id": "item_789",
          "product_id": "prod_101",
          "product_name": "Wireless Headphones",
          "product_sku": "WH-001",
          "quantity": 2,
          "unit_price": 99.99,
          "total_price": 199.98,
          "product_details": {
            "description": "Premium wireless headphones",
            "category": "Electronics",
            "brand": "TechBrand"
          }
        }
      ],
      "total_amount": 199.98,
      "shipping_address": {
        "street": "123 Main St",
        "city": "Anytown",
        "state": "CA",
        "postal_code": "12345",
        "country": "US"
      },
      "payment_info": {
        "method": "CREDIT_CARD",
        "status": "PAID",
        "transaction_id": "txn_abc123"
      },
      "sla_info": {
        "target_minutes": 1440,
        "elapsed_minutes": 120,
        "status": "COMPLIANT"
      },
      "metadata": {
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T11:00:00Z",
        "priority": "NORMAL",
        "store_name": "Main Store"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 150,
    "totalPages": 15,
    "hasNext": true,
    "hasPrev": false
  },
  "filters": {
    "status": "PENDING",
    "page": 1,
    "pageSize": 10,
    "sortBy": "order_date",
    "sortOrder": "desc"
  }
}
\`\`\`

## Error Handling

The API returns appropriate HTTP status codes and detailed error messages:

### Error Response Format

\`\`\`json
{
  "error": "Error type",
  "message": "Detailed error message",
  "details": ["Additional error details"],
  "timestamp": "2024-01-15T10:30:00Z"
}
\`\`\`

### Common Error Codes

| Status Code | Error Type | Description |
|-------------|------------|-------------|
| 400 | Bad Request | Invalid query parameters |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side error |

## Security Considerations

1. **Authentication**: All requests require valid Bearer tokens
2. **Authorization**: Users can only access orders they have permission to view
3. **Rate Limiting**: Prevents abuse and ensures fair usage
4. **Input Validation**: All parameters are validated and sanitized
5. **SQL Injection Protection**: Parameterized queries prevent injection attacks
6. **Data Encryption**: All data transmitted over HTTPS

## Usage Examples

### JavaScript/TypeScript

\`\`\`typescript
import { createOrdersApiClient } from './lib/orders-api-client'

const client = createOrdersApiClient('your-api-token')

// Get recent orders
const recentOrders = await client.getOrders({
  sortBy: 'order_date',
  sortOrder: 'desc',
  pageSize: 20
})

// Search for orders
const searchResults = await client.searchOrders('john@example.com')

// Get orders by status
const pendingOrders = await client.getOrdersByStatus('PENDING')
\`\`\`

### Python

\`\`\`python
import requests

def get_orders(api_token, **params):
    headers = {
        'Authorization': f'Bearer {api_token}',
        'Content-Type': 'application/json'
    }
    
    response = requests.get(
        'https://your-domain.com/api/orders',
        headers=headers,
        params=params
    )
    
    response.raise_for_status()
    return response.json()

# Usage
orders = get_orders(
    'your-api-token',
    status='PENDING',
    page=1,
    pageSize=10
)
\`\`\`

## Performance Considerations

1. **Pagination**: Always use pagination for large datasets
2. **Filtering**: Apply filters to reduce data transfer
3. **Caching**: Consider caching frequently accessed data
4. **Indexing**: Database indexes optimize query performance
5. **Rate Limiting**: Respect rate limits to avoid throttling

## Support

For API support, please contact our development team or refer to the technical documentation.
