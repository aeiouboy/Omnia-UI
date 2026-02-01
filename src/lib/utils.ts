import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Simple time formatting function that should always work
export function formatGMT7TimeString(date?: Date | string | number): string {
  try {
    let inputDate: Date
    if (date === undefined || date === null) {
      inputDate = new Date()
    } else if (date instanceof Date) {
      inputDate = date
    } else {
      inputDate = new Date(date)
      if (isNaN(inputDate.getTime())) {
        inputDate = new Date()
      }
    }
    return inputDate.toLocaleString("en-US", {
      timeZone: "Asia/Bangkok",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
  } catch (error) {
    // Fallback to basic time format
    return new Date().toLocaleTimeString("en-US", { hour12: false })
  }
}

export function getCurrentTimeString(): string {
  return formatGMT7TimeString()
}

export function normalizeTimeUnit(unit: number): string {
  return unit.toString().padStart(2, "0")
}

export function getGMT7Time(date?: Date | string | number): Date {
  let inputDate: Date

  if (date === undefined || date === null) {
    inputDate = new Date()
  } else if (date instanceof Date) {
    inputDate = date
  } else if (typeof date === "string" || typeof date === "number") {
    inputDate = new Date(date)
    if (isNaN(inputDate.getTime())) {
      console.warn(`Invalid date provided to getGMT7Time: ${date}`)
      inputDate = new Date()
    }
  } else {
    console.warn(`Invalid date type provided to getGMT7Time: ${typeof date}`)
    inputDate = new Date()
  }

  const utcTime = inputDate.getTime() + inputDate.getTimezoneOffset() * 60000
  return new Date(utcTime + 7 * 60 * 60 * 1000)
}

export function formatGMT7DateString(date?: Date | string | number): string {
  const gmt7Time = getGMT7Time(date)
  const year = gmt7Time.getFullYear()
  const month = normalizeTimeUnit(gmt7Time.getMonth() + 1)
  const day = normalizeTimeUnit(gmt7Time.getDate())

  return `${month}/${day}/${year}`
}

export function formatGMT7DateTime(date?: Date | string | number): string {
  return `${formatGMT7DateString(date)} ${formatGMT7TimeString(date)}`
}

/**
 * Standardized date/time format: MM/DD/YYYY HH:mm:ss
 * This is the official format for all user-facing date/time displays in the application.
 * Uses GMT+7 (Asia/Bangkok) timezone.
 *
 * @param date - Date value to format (Date object, ISO string, timestamp, null, or undefined)
 * @returns Formatted date/time string in MM/DD/YYYY HH:mm:ss format (e.g., "11/21/2025 10:42:00")
 *
 * @example
 * formatStandardDateTime(new Date()) // "02/01/2026 14:30:45"
 * formatStandardDateTime("2025-11-21T10:42:00Z") // "11/21/2025 17:42:00"
 * formatStandardDateTime(null) // Current date/time
 */
export function formatStandardDateTime(date?: Date | string | number | null): string {
  try {
    let inputDate: Date
    if (date === undefined || date === null) {
      inputDate = new Date()
    } else if (date instanceof Date) {
      inputDate = date
    } else {
      inputDate = new Date(date)
      if (isNaN(inputDate.getTime())) {
        inputDate = new Date()
      }
    }

    // Format as MM/DD/YYYY HH:mm:ss in GMT+7
    const gmt7Time = getGMT7Time(inputDate)
    const month = normalizeTimeUnit(gmt7Time.getMonth() + 1)
    const day = normalizeTimeUnit(gmt7Time.getDate())
    const year = gmt7Time.getFullYear()
    const hours = normalizeTimeUnit(gmt7Time.getHours())
    const minutes = normalizeTimeUnit(gmt7Time.getMinutes())
    const seconds = normalizeTimeUnit(gmt7Time.getSeconds())

    return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`
  } catch (error) {
    // Fallback to current date/time
    const now = new Date()
    const gmt7Time = getGMT7Time(now)
    const month = normalizeTimeUnit(gmt7Time.getMonth() + 1)
    const day = normalizeTimeUnit(gmt7Time.getDate())
    const year = gmt7Time.getFullYear()
    const hours = normalizeTimeUnit(gmt7Time.getHours())
    const minutes = normalizeTimeUnit(gmt7Time.getMinutes())
    const seconds = normalizeTimeUnit(gmt7Time.getSeconds())

    return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`
  }
}

/**
 * Standardized date-only format: MM/DD/YYYY
 * Uses GMT+7 (Asia/Bangkok) timezone.
 *
 * @param date - Date value to format
 * @returns Formatted date string in MM/DD/YYYY format (e.g., "11/21/2025")
 */
export function formatStandardDate(date?: Date | string | number | null): string {
  try {
    let inputDate: Date
    if (date === undefined || date === null) {
      inputDate = new Date()
    } else if (date instanceof Date) {
      inputDate = date
    } else {
      inputDate = new Date(date)
      if (isNaN(inputDate.getTime())) {
        inputDate = new Date()
      }
    }

    const gmt7Time = getGMT7Time(inputDate)
    const month = normalizeTimeUnit(gmt7Time.getMonth() + 1)
    const day = normalizeTimeUnit(gmt7Time.getDate())
    const year = gmt7Time.getFullYear()

    return `${month}/${day}/${year}`
  } catch (error) {
    const now = new Date()
    const gmt7Time = getGMT7Time(now)
    const month = normalizeTimeUnit(gmt7Time.getMonth() + 1)
    const day = normalizeTimeUnit(gmt7Time.getDate())
    const year = gmt7Time.getFullYear()

    return `${month}/${day}/${year}`
  }
}

/**
 * Standardized time-only format: HH:mm:ss
 * Uses GMT+7 (Asia/Bangkok) timezone.
 *
 * @param date - Date value to format
 * @returns Formatted time string in HH:mm:ss format (e.g., "10:42:00")
 */
export function formatStandardTime(date?: Date | string | number | null): string {
  try {
    let inputDate: Date
    if (date === undefined || date === null) {
      inputDate = new Date()
    } else if (date instanceof Date) {
      inputDate = date
    } else {
      inputDate = new Date(date)
      if (isNaN(inputDate.getTime())) {
        inputDate = new Date()
      }
    }

    const gmt7Time = getGMT7Time(inputDate)
    const hours = normalizeTimeUnit(gmt7Time.getHours())
    const minutes = normalizeTimeUnit(gmt7Time.getMinutes())
    const seconds = normalizeTimeUnit(gmt7Time.getSeconds())

    return `${hours}:${minutes}:${seconds}`
  } catch (error) {
    const now = new Date()
    const gmt7Time = getGMT7Time(now)
    const hours = normalizeTimeUnit(gmt7Time.getHours())
    const minutes = normalizeTimeUnit(gmt7Time.getMinutes())
    const seconds = normalizeTimeUnit(gmt7Time.getSeconds())

    return `${hours}:${minutes}:${seconds}`
  }
}

export function safeParseDate(dateValue: any): Date {
  if (!dateValue) {
    return new Date()
  }

  if (dateValue instanceof Date) {
    return isNaN(dateValue.getTime()) ? new Date() : dateValue
  }

  const parsed = new Date(dateValue)
  return isNaN(parsed.getTime()) ? new Date() : parsed
}

export function formatGMT7Time(date?: Date | string, options?: Intl.DateTimeFormatOptions): string {
  try {
    const inputDate = date ? new Date(date) : new Date()
    return inputDate.toLocaleString("en-US", {
      timeZone: "Asia/Bangkok",
      ...options
    })
  } catch (error) {
    console.warn("Error formatting GMT+7 time:", error)
    return new Date().toLocaleString("en-US")
  }
}

/**
 * Safely converts a date value to ISO string with validation
 * @param date - Date value to convert (string, Date, null, or undefined)
 * @param fallback - Optional fallback ISO string to use if date is invalid
 * @param context - Optional context for logging (e.g., "processOrderAlerts", "orderId: 12345")
 * @returns ISO string representation of the date, or fallback/current date if invalid
 */
export function safeToISOString(
  date: string | Date | null | undefined,
  fallback?: string,
  context?: string
): string {
  // Check if input exists
  if (date === null || date === undefined) {
    if (context) {
      console.warn(`⚠️ Invalid date detected: null/undefined${context ? ` (${context})` : ''}`)
    }
    return fallback || new Date().toISOString()
  }

  // Create Date object
  let dateObj: Date
  if (date instanceof Date) {
    dateObj = date
  } else {
    dateObj = new Date(date)
  }

  // Validate Date object
  if (isNaN(dateObj.getTime())) {
    if (context) {
      console.warn(`⚠️ Invalid date detected: ${date}${context ? ` (${context})` : ''}`)
    }
    return fallback || new Date().toISOString()
  }

  // Return valid ISO string
  return dateObj.toISOString()
}

/**
 * Generate a unique React key combining multiple fallback values
 * @param values - Array of potential key values, first non-empty is used
 * @param prefix - Optional prefix for the key
 * @param index - Fallback index if all values are empty
 * @returns A unique string suitable for use as a React key
 *
 * @example
 * // Use with array map
 * items.map((item, index) => (
 *   <div key={generateUniqueKey([item.id, item.sku], 'product', index)}>
 *     {item.name}
 *   </div>
 * ))
 */
export function generateUniqueKey(
  values: (string | number | undefined | null)[],
  prefix: string = 'item',
  index?: number
): string {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== '') {
      return `${prefix}-${value}`;
    }
  }
  return `${prefix}-${index ?? Math.random().toString(36).substr(2, 9)}`;
}
