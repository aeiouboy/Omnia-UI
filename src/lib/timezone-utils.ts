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
 * Format date and time for GMT+7 in standardized MM/DD/YYYY HH:mm:ss format
 * @returns Formatted date/time string (e.g., "11/21/2025 10:42:00")
 */
export function formatBangkokDateTime(date?: Date | string | number): string {
  try {
    const inputDate = date ? new Date(date) : new Date()
    if (isNaN(inputDate.getTime())) {
      throw new Error("Invalid date")
    }

    // Get GMT+7 time components
    const utcTime = inputDate.getTime() + inputDate.getTimezoneOffset() * 60000
    const gmt7Date = new Date(utcTime + 7 * 60 * 60 * 1000)

    const pad = (n: number) => n.toString().padStart(2, '0')
    const month = pad(gmt7Date.getMonth() + 1)
    const day = pad(gmt7Date.getDate())
    const year = gmt7Date.getFullYear()
    const hours = pad(gmt7Date.getHours())
    const minutes = pad(gmt7Date.getMinutes())
    const seconds = pad(gmt7Date.getSeconds())

    return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`
  } catch (error) {
    console.warn("Error formatting Bangkok datetime:", error)
    const now = new Date()
    const utcTime = now.getTime() + now.getTimezoneOffset() * 60000
    const gmt7Date = new Date(utcTime + 7 * 60 * 60 * 1000)

    const pad = (n: number) => n.toString().padStart(2, '0')
    const month = pad(gmt7Date.getMonth() + 1)
    const day = pad(gmt7Date.getDate())
    const year = gmt7Date.getFullYear()
    const hours = pad(gmt7Date.getHours())
    const minutes = pad(gmt7Date.getMinutes())
    const seconds = pad(gmt7Date.getSeconds())

    return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`
  }
}
