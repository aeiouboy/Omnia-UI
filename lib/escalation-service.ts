import { EscalationRecord, EscalationCreateInput, EscalationUpdateInput } from "@/app/api/escalations/route"

export interface EscalationFilters {
  status?: string
  alertType?: string
  severity?: string
  escalatedTo?: string
  search?: string
  dateFrom?: string
  dateTo?: string
}

export interface EscalationPagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface EscalationResponse {
  data: EscalationRecord[]
  pagination: EscalationPagination
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
  pagination?: EscalationPagination
}

/**
 * Fetches escalation history with pagination and filters
 */
export async function fetchEscalationHistory(
  page: number = 1,
  pageSize: number = 25,
  filters: EscalationFilters = {}
): Promise<EscalationResponse> {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    })

    // Add filter parameters
    if (filters.status && filters.status !== "all") {
      queryParams.set("status", filters.status)
    }
    if (filters.alertType && filters.alertType !== "all") {
      queryParams.set("alertType", filters.alertType)
    }
    if (filters.severity && filters.severity !== "all") {
      queryParams.set("severity", filters.severity)
    }
    if (filters.escalatedTo) {
      queryParams.set("escalatedTo", filters.escalatedTo)
    }
    if (filters.search) {
      queryParams.set("search", filters.search)
    }
    if (filters.dateFrom) {
      queryParams.set("dateFrom", filters.dateFrom)
    }
    if (filters.dateTo) {
      queryParams.set("dateTo", filters.dateTo)
    }

    const response = await fetch(`/api/escalations?${queryParams.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      
      // If table doesn't exist, return empty data instead of throwing error
      if (errorData.error && errorData.error.includes("does not exist")) {
        console.warn("Escalation history table does not exist, returning empty data")
        return {
          data: [],
          pagination: {
            page: 1,
            pageSize: 25,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
        }
      }
      
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    const result: ApiResponse<EscalationRecord[]> = await response.json()

    if (!result.success) {
      // If table doesn't exist, return empty data instead of throwing error
      if (result.error && result.error.includes("does not exist")) {
        console.warn("Escalation history table does not exist, returning empty data")
        return {
          data: [],
          pagination: {
            page: 1,
            pageSize: 25,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
        }
      }
      
      throw new Error(result.error || "Failed to fetch escalation history")
    }

    return {
      data: result.data || [],
      pagination: result.pagination || {
        page: 1,
        pageSize: 25,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    }
  } catch (error) {
    console.error("Error fetching escalation history:", error)
    
    // If it's a "table does not exist" error, return empty data
    if (error instanceof Error && error.message.includes("does not exist")) {
      console.warn("Escalation history table does not exist, returning empty data")
      return {
        data: [],
        pagination: {
          page: 1,
          pageSize: 25,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      }
    }
    
    throw new Error(`Failed to fetch escalation history: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

/**
 * Creates a new escalation record
 */
export async function createEscalationRecord(escalationData: EscalationCreateInput): Promise<EscalationRecord> {
  try {
    const response = await fetch("/api/escalations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(escalationData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    const result: ApiResponse<EscalationRecord> = await response.json()

    if (!result.success) {
      throw new Error(result.error || "Failed to create escalation record")
    }

    if (!result.data) {
      throw new Error("No data returned from create operation")
    }

    return result.data
  } catch (error) {
    console.error("Error creating escalation record:", error)
    throw new Error(`Failed to create escalation record: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

/**
 * Updates an escalation record status
 */
export async function updateEscalationStatus(id: string, updateData: EscalationUpdateInput): Promise<EscalationRecord> {
  try {
    const response = await fetch(`/api/escalations?id=${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    const result: ApiResponse<EscalationRecord> = await response.json()

    if (!result.success) {
      throw new Error(result.error || "Failed to update escalation record")
    }

    if (!result.data) {
      throw new Error("No data returned from update operation")
    }

    return result.data
  } catch (error) {
    console.error("Error updating escalation record:", error)
    throw new Error(`Failed to update escalation record: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

/**
 * Deletes an escalation record (admin only)
 */
export async function deleteEscalationRecord(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/escalations?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    const result: ApiResponse<void> = await response.json()

    if (!result.success) {
      throw new Error(result.error || "Failed to delete escalation record")
    }
  } catch (error) {
    console.error("Error deleting escalation record:", error)
    throw new Error(`Failed to delete escalation record: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

/**
 * Helper function to get alert message based on alert type
 */
export function getAlertMessage(alertType: string, orderNumber: string): string {
  switch (alertType) {
    case "SLA_BREACH":
      return `SLA breach for order ${orderNumber}`
    case "INVENTORY":
      return `Inventory issue affecting order ${orderNumber}`
    case "SYSTEM":
      return `System issue affecting order ${orderNumber}`
    case "API_LATENCY":
      return `API latency issue affecting order ${orderNumber}`
    default:
      return `Alert for order ${orderNumber}`
  }
}

/**
 * Helper function to get severity from alert type
 */
export function getSeverityFromAlertType(alertType: string): "HIGH" | "MEDIUM" | "LOW" {
  switch (alertType) {
    case "SLA_BREACH":
      return "HIGH"
    case "INVENTORY":
      return "MEDIUM"
    case "API_LATENCY":
      return "LOW"
    case "SYSTEM":
      return "MEDIUM"
    default:
      return "MEDIUM"
  }
}

/**
 * Helper function to format escalation data for Teams webhook
 */
export function createTeamsMessagePayload(
  orderNumber: string,
  alertType: string,
  branch: string,
  timestamp: string
) {
  return {
    "@type": "MessageCard",
    "@context": "http://schema.org/extensions",
    themeColor: alertType === "SLA_BREACH" ? "FF0000" : alertType === "INVENTORY" ? "FFA500" : "0078D7",
    summary: `Order Alert: ${alertType} - ${orderNumber}`,
    sections: [
      {
        activityTitle: `🚨 Order Alert: ${alertType}`,
        activitySubtitle: `Escalated at ${timestamp}`,
        facts: [
          {
            name: "Order Number:",
            value: orderNumber,
          },
          {
            name: "Alert Type:",
            value: alertType,
          },
          {
            name: "Branch:",
            value: branch,
          },
          {
            name: "Escalated by:",
            value: "Executive Dashboard",
          },
        ],
        markdown: true,
      },
    ],
    potentialAction: [
      {
        "@type": "OpenUri",
        name: "View Order Details",
        targets: [
          {
            os: "default",
            uri: `https://ris-oms.vercel.app/orders/${orderNumber}`,
          },
        ],
      },
      {
        "@type": "OpenUri",
        name: "View Dashboard",
        targets: [
          {
            os: "default",
            uri: "https://ris-oms.vercel.app/",
          },
        ],
      },
    ],
  }
}

/**
 * Retry logic wrapper for API calls
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown error")
      
      if (attempt === maxRetries) {
        break
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt))
    }
  }

  throw lastError
}

/**
 * Get escalation statistics
 */
export async function getEscalationStats(): Promise<{
  total: number
  sent: number
  failed: number
  resolved: number
  pending: number
}> {
  try {
    const response = await fetchEscalationHistory(1, 1000) // Get a large number to calculate stats
    const escalations = response.data

    return {
      total: escalations.length,
      sent: escalations.filter(e => e.status === "SENT").length,
      failed: escalations.filter(e => e.status === "FAILED").length,
      resolved: escalations.filter(e => e.status === "RESOLVED").length,
      pending: escalations.filter(e => e.status === "PENDING").length,
    }
  } catch (error) {
    console.error("Error getting escalation stats:", error)
    return {
      total: 0,
      sent: 0,
      failed: 0,
      resolved: 0,
      pending: 0,
    }
  }
}
