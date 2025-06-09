/**
 * Timezone utility functions for GMT+7 (Bangkok timezone)
 */

/**
 * Get current time in GMT+7 timezone formatted as HH:MM:SS
 */
export function getBangkokTimeString(): string {
  try {
    return new Date().toLocaleString("en-US", {
      timeZone: "Asia/Bangkok",
      hour: "2-digit",
      minute: "2-digit", 
      second: "2-digit",
      hour12: false,
    })
  } catch (error) {
    console.warn("Error formatting Bangkok time:", error)
    return new Date().toLocaleTimeString("en-US", { hour12: false })
  }
}

/**
 * Format any date to GMT+7 timezone
 */
export function formatBangkokTime(date?: Date | string | number): string {
  try {
    const inputDate = date ? new Date(date) : new Date()
    if (isNaN(inputDate.getTime())) {
      throw new Error("Invalid date")
    }
    return inputDate.toLocaleString("en-US", {
      timeZone: "Asia/Bangkok",
      hour: "2-digit",
      minute: "2-digit", 
      second: "2-digit",
      hour12: false,
    })
  } catch (error) {
    console.warn("Error formatting Bangkok time:", error)
    return new Date().toLocaleTimeString("en-US", { hour12: false })
  }
}

/**
 * Format date and time for GMT+7
 */
export function formatBangkokDateTime(date?: Date | string | number): string {
  try {
    const inputDate = date ? new Date(date) : new Date()
    if (isNaN(inputDate.getTime())) {
      throw new Error("Invalid date")
    }
    return inputDate.toLocaleString("en-US", {
      timeZone: "Asia/Bangkok",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit", 
      second: "2-digit",
      hour12: false,
    })
  } catch (error) {
    console.warn("Error formatting Bangkok datetime:", error)
    return new Date().toLocaleString("en-US")
  }
}
