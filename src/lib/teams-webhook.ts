interface TeamsMessageCard {
  "@type": "MessageCard"
  "@context": "http://schema.org/extensions"
  themeColor: string
  summary: string
  sections: Array<{
    activityTitle: string
    activitySubtitle: string
    facts: Array<{
      name: string
      value: string
    }>
    markdown?: boolean
    title?: string
    text?: string
  }>
  potentialAction?: Array<{
    "@type": "OpenUri"
    name: string
    targets: Array<{
      os: string
      uri: string
    }>
  }>
}

interface EscalationData {
  orderNumber: string
  alertType: string
  branch: string
  severity: "HIGH" | "MEDIUM" | "LOW"
  description?: string
  additionalInfo?: Record<string, string>
}

export class TeamsWebhookService {
  private static readonly MAX_RETRIES = 3
  private static readonly RETRY_DELAY = 1000 // 1 second
  private static readonly REQUEST_TIMEOUT = 10000 // 10 seconds

  static async sendEscalation(data: EscalationData): Promise<{
    success: boolean
    message: string
    retryCount?: number
  }> {
    const webhookUrl = process.env.NEXT_PUBLIC_MS_TEAMS_WEBHOOK_URL

    if (!webhookUrl) {
      throw new Error("MS Teams webhook URL not configured")
    }

    // Validate input data
    this.validateEscalationData(data)

    const teamsMessage = this.createTeamsMessage(data)

    let lastError: Error | null = null

    for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
      try {
        const result = await this.sendWithTimeout(teamsMessage, attempt)

        return {
          success: true,
          message: "Escalation sent successfully",
          retryCount: attempt,
        }
      } catch (error) {
        lastError = error as Error
        console.warn(`Attempt ${attempt + 1} failed:`, error)

        // Don't retry on certain errors
        if (this.isNonRetryableError(error as Error)) {
          break
        }

        // Wait before retrying (exponential backoff)
        if (attempt < this.MAX_RETRIES - 1) {
          await this.delay(this.RETRY_DELAY * Math.pow(2, attempt))
        }
      }
    }

    throw lastError || new Error("Failed to send escalation after all retries")
  }

  private static validateEscalationData(data: EscalationData): void {
    if (!data.orderNumber?.trim()) {
      throw new Error("Order number is required")
    }
    if (!data.alertType?.trim()) {
      throw new Error("Alert type is required")
    }
    if (!data.branch?.trim()) {
      throw new Error("Branch is required")
    }
    if (!["HIGH", "MEDIUM", "LOW"].includes(data.severity)) {
      throw new Error("Invalid severity level")
    }
  }

  private static createTeamsMessage(data: EscalationData): TeamsMessageCard {
    const timestamp = new Date().toLocaleString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })

    const themeColor = this.getThemeColor(data.severity)
    const severityEmoji = this.getSeverityEmoji(data.severity)
    const alertTypeEmoji = this.getAlertTypeEmoji(data.alertType)

    // สร้างข้อมูลเพิ่มเติมตามประเภทของ alert
    const additionalInfo = this.getAdditionalAlertInfo(data)

    // สร้างคำแนะนำในการแก้ไขปัญหา
    const actionRecommendation = this.getActionRecommendation(data)

    return {
      "@type": "MessageCard",
      "@context": "http://schema.org/extensions",
      themeColor,
      summary: `${alertTypeEmoji} Order Alert: ${data.alertType} - ${data.orderNumber}`,
      sections: [
        {
          activityTitle: `${alertTypeEmoji} **Order Alert: ${data.alertType}**`,
          activitySubtitle: `🕐 Escalated at ${timestamp}`,
          facts: [
            {
              name: "📋 Order Number:",
              value: data.orderNumber,
            },
            {
              name: "⚠️ Alert Type:",
              value: data.alertType,
            },
            {
              name: "🏢 Branch:",
              value: data.branch,
            },
            {
              name: "🔥 Severity:",
              value: `${severityEmoji} ${data.severity}`,
            },
            {
              name: "👤 Escalated by:",
              value: "Executive Dashboard",
            },
            {
              name: "📝 Description:",
              value: data.description || `Alert for order ${data.orderNumber}`,
            },
            ...additionalInfo,
          ],
          markdown: true,
        },
        {
          activityTitle: "🛠️ Recommended Actions",
          activitySubtitle: "Please take the following actions",
          facts: [],
          text: actionRecommendation,
          markdown: true,
        },
      ],
      potentialAction: [
        {
          "@type": "OpenUri",
          name: "🔍 View Order Details",
          targets: [
            {
              os: "default",
              uri: `${process.env.NEXT_PUBLIC_APP_URL || "https://ris-oms.vercel.app"}/orders/${data.orderNumber}`,
            },
          ],
        },
        {
          "@type": "OpenUri",
          name: "📊 View Dashboard",
          targets: [
            {
              os: "default",
              uri: process.env.NEXT_PUBLIC_APP_URL || "https://ris-oms.vercel.app",
            },
          ],
        },
      ],
    }
  }

  // เพิ่มฟังก์ชันใหม่เพื่อสร้างข้อมูลเพิ่มเติมตามประเภทของ alert
  private static getAdditionalAlertInfo(data: EscalationData): Array<{ name: string; value: string }> {
    const additionalInfo: Array<{ name: string; value: string }> = []

    // ข้อมูลพื้นฐานที่ต้องมีสำหรับทุก alert
    if (data.additionalInfo?.processingTime) {
      additionalInfo.push({
        name: "🕐 Processing Time:",
        value: data.additionalInfo.processingTime,
      })
    }

    if (data.additionalInfo?.location) {
      additionalInfo.push({
        name: "📍 Location:",
        value: data.additionalInfo.location,
      })
    }

    if (data.additionalInfo?.status) {
      additionalInfo.push({
        name: "🔄 Status:",
        value: data.additionalInfo.status,
      })
    }

    // ข้อมูลเพิ่มเติมตามประเภทของ alert
    switch (data.alertType) {
      case "SLA_BREACH":
        additionalInfo.push({
          name: "⏱️ SLA Threshold:",
          value: data.additionalInfo?.slaThreshold || "5 minutes",
        })
        additionalInfo.push({
          name: "⚠️ Current Delay:",
          value: data.additionalInfo?.currentDelay || "Exceeding threshold",
        })
        additionalInfo.push({
          name: "🛒 Affected Orders:",
          value: data.additionalInfo?.affectedOrders || "Multiple orders affected",
        })
        break

      case "INVENTORY":
        additionalInfo.push({
          name: "📦 Stock Level:",
          value: data.additionalInfo?.stockLevel || "Low stock",
        })
        additionalInfo.push({
          name: "🛒 Affected Orders:",
          value: data.additionalInfo?.affectedOrders || "Multiple orders affected",
        })
        additionalInfo.push({
          name: "📋 SKU List:",
          value: data.additionalInfo?.skuList || "Multiple SKUs affected",
        })
        break

      case "SYSTEM":
      case "API_LATENCY":
        additionalInfo.push({
          name: "🌐 System Component:",
          value: data.additionalInfo?.systemComponent || "API Service",
        })
        additionalInfo.push({
          name: "📊 Current Performance:",
          value: data.additionalInfo?.currentPerformance || "Degraded",
        })
        additionalInfo.push({
          name: "⏱️ Response Time:",
          value: data.additionalInfo?.responseTime || "Elevated",
        })
        break
    }

    // เพิ่มข้อมูลอื่นๆ ที่ส่งมาแต่ไม่ได้จัดการข้างต้น
    if (data.additionalInfo) {
      Object.entries(data.additionalInfo).forEach(([key, value]) => {
        // ตรวจสอบว่าได้เพิ่มข้อมูลนี้ไปแล้วหรือไม่
        const isAlreadyAdded = additionalInfo.some(
          (info) =>
            info.name.toLowerCase().includes(key.toLowerCase()) ||
            key === "processingTime" ||
            key === "location" ||
            key === "status" ||
            key === "slaThreshold" ||
            key === "currentDelay" ||
            key === "affectedOrders" ||
            key === "stockLevel" ||
            key === "skuList" ||
            key === "systemComponent" ||
            key === "currentPerformance" ||
            key === "responseTime",
        )

        if (!isAlreadyAdded) {
          additionalInfo.push({
            name: `📌 ${this.capitalizeFirstLetter(key)}:`,
            value: value,
          })
        }
      })
    }

    return additionalInfo
  }

  // เพิ่มฟังก์ชันใหม่เพื่อสร้างคำแนะนำในการแก้ไขปัญหา
  private static getActionRecommendation(data: EscalationData): string {
    switch (data.alertType) {
      case "SLA_BREACH":
        return (
          "1. **Check order queue** and prioritize delayed orders\n" +
          "2. **Assign additional staff** to order processing if available\n" +
          "3. **Contact customer** if delay exceeds 10 minutes\n" +
          "4. **Update order status** in the system once processed"
        )

      case "INVENTORY":
        return (
          "1. **Verify physical inventory** matches system records\n" +
          "2. **Check for misplaced items** in store/warehouse\n" +
          "3. **Contact supplier** for emergency restock if needed\n" +
          "4. **Suggest alternatives** for out-of-stock items"
        )

      case "SYSTEM":
      case "API_LATENCY":
        return (
          "1. **Check system status** on monitoring dashboard\n" +
          "2. **Switch to manual processing** if system issues persist\n" +
          "3. **Contact IT support** if issue continues beyond 15 minutes\n" +
          "4. **Document affected orders** for follow-up"
        )

      default:
        return (
          "1. **Investigate the alert** details\n" +
          "2. **Take appropriate action** based on severity\n" +
          "3. **Update status** in the system\n" +
          "4. **Escalate to manager** if unable to resolve"
        )
    }
  }

  // เพิ่มฟังก์ชันช่วยเหลือสำหรับแปลงข้อความ
  private static capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1)
  }

  private static async sendWithTimeout(message: TeamsMessageCard, attempt: number): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT)

    try {
      const response = await fetch("/api/teams-webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      return response
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof Error && error.name === "AbortError") {
        throw new Error(`Request timeout after ${this.REQUEST_TIMEOUT}ms`)
      }

      throw error
    }
  }

  private static isNonRetryableError(error: Error): boolean {
    // Don't retry on validation errors or 4xx client errors
    return (
      error.message.includes("not configured") ||
      error.message.includes("is required") ||
      error.message.includes("Invalid") ||
      error.message.includes("400") ||
      error.message.includes("401") ||
      error.message.includes("403") ||
      error.message.includes("404")
    )
  }

  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  private static getThemeColor(severity: string): string {
    switch (severity) {
      case "HIGH":
        return "FF0000"
      case "MEDIUM":
        return "FFA500"
      case "LOW":
        return "0078D7"
      default:
        return "808080"
    }
  }

  private static getSeverityEmoji(severity: string): string {
    switch (severity) {
      case "HIGH":
        return "🔴"
      case "MEDIUM":
        return "🟡"
      case "LOW":
        return "🔵"
      default:
        return "⚪"
    }
  }

  private static getAlertTypeEmoji(alertType: string): string {
    switch (alertType) {
      case "SLA_BREACH":
        return "⏰"
      case "INVENTORY":
        return "📦"
      case "SYSTEM":
        return "⚙️"
      case "API_LATENCY":
        return "🌐"
      case "PAYMENT":
        return "💳"
      case "DELIVERY":
        return "🚚"
      case "CUSTOMER":
        return "👤"
      case "QUALITY":
        return "⭐"
      default:
        return "⚠️"
    }
  }
}
