// API Client configuration
interface ApiClientConfig {
  baseUrl: string
  apiKey: string
  timeout?: number
}

// Query parameters interface
export interface OrdersQueryParams {
  startDate?: string
  endDate?: string
  customerId?: string
  customerEmail?: string
  status?: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "RETURNED"
  productId?: string
  channel?: string
  businessUnit?: string
  page?: number
  pageSize?: number
  sortBy?: "order_date" | "total" | "created_at" | "status"
  sortOrder?: "asc" | "desc"
  search?: string
}

// Response types (matching the API)
export interface OrderItem {
  id: string
  product_id: string
  product_name: string
  product_sku: string
  quantity: number
  unit_price: number
  total_price: number
  product_details?: {
    description: string
    category: string
    brand: string
  }
}

export interface OrderResponse {
  id: string
  order_no: string
  customer: {
    id: string
    name: string
    email: string
    phone: string
  }
  order_date: string
  status: string
  channel: string
  business_unit: string
  order_type: string
  items: OrderItem[]
  total_amount: number
  shipping_address: {
    street?: string
    city?: string
    state?: string
    postal_code?: string
    country?: string
  }
  payment_info: {
    method: string
    status: string
    transaction_id?: string
  }
  sla_info: {
    target_minutes: number
    elapsed_minutes: number
    status: string
  }
  metadata: {
    created_at: string
    updated_at: string
    priority: string
    store_name: string
  }
}

export interface PaginatedOrdersResponse {
  data: OrderResponse[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  filters: OrdersQueryParams
}

export interface ApiError {
  error: string
  message: string
  details?: any[]
  timestamp?: string
}

export class OrdersApiClient {
  private config: ApiClientConfig

  constructor(config: ApiClientConfig) {
    this.config = config
  }

  private async makeRequest<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(endpoint, this.config.baseUrl)

    // Add query parameters
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout || 30000)

    try {
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData: ApiError = await response.json()
        throw new Error(`API Error (${response.status}): ${errorData.message}`)
      }

      return await response.json()
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error("Request timeout")
        }
        throw error
      }

      throw new Error("Unknown error occurred")
    }
  }

  /**
   * Fetch orders with filtering, pagination, and sorting
   */
  async getOrders(params?: OrdersQueryParams): Promise<PaginatedOrdersResponse> {
    return this.makeRequest<PaginatedOrdersResponse>("/api/orders", params)
  }

  /**
   * Get a single order by ID
   */
  async getOrderById(orderId: string): Promise<OrderResponse> {
    const response = await this.getOrders({
      search: orderId,
      pageSize: 1,
    })

    const order = response.data.find((o) => o.id === orderId || o.order_no === orderId)
    if (!order) {
      throw new Error(`Order not found: ${orderId}`)
    }

    return order
  }

  /**
   * Get orders by customer
   */
  async getOrdersByCustomer(
    customerId: string,
    params?: Omit<OrdersQueryParams, "customerId">,
  ): Promise<PaginatedOrdersResponse> {
    return this.getOrders({ ...params, customerId })
  }

  /**
   * Get orders by status
   */
  async getOrdersByStatus(
    status: OrdersQueryParams["status"],
    params?: Omit<OrdersQueryParams, "status">,
  ): Promise<PaginatedOrdersResponse> {
    return this.getOrders({ ...params, status })
  }

  /**
   * Search orders
   */
  async searchOrders(searchTerm: string, params?: Omit<OrdersQueryParams, "search">): Promise<PaginatedOrdersResponse> {
    return this.getOrders({ ...params, search: searchTerm })
  }
}

// Factory function to create a configured client
export function createOrdersApiClient(apiKey: string, baseUrl?: string): OrdersApiClient {
  return new OrdersApiClient({
    baseUrl: baseUrl || (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"),
    apiKey,
    timeout: 30000,
  })
}

// React hook for using the API client
export function useOrdersApi(apiKey: string) {
  const client = createOrdersApiClient(apiKey)

  return {
    getOrders: client.getOrders.bind(client),
    getOrderById: client.getOrderById.bind(client),
    getOrdersByCustomer: client.getOrdersByCustomer.bind(client),
    getOrdersByStatus: client.getOrdersByStatus.bind(client),
    searchOrders: client.searchOrders.bind(client),
  }
}
