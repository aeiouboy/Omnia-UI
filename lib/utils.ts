import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Ensures time units (hours, minutes, seconds) are always displayed with two digits
 * by adding leading zeros when needed
 */
export function normalizeTimeUnit(unit: number): string {
  return unit.toString().padStart(2, "0")
}

/**
 * Gets the current time in GMT+7 (Bangkok timezone)
 * @param date - Optional date input (Date object, string, or number)
 * @returns Date object representing the time in GMT+7
 */
export function getGMT7Time(date?: Date | string | number): Date {
  let inputDate: Date

  if (date === undefined || date === null) {
    inputDate = new Date()
  } else if (date instanceof Date) {
    inputDate = date
  } else if (typeof date === "string" || typeof date === "number") {
    inputDate = new Date(date)
    // Check if the date is invalid
    if (isNaN(inputDate.getTime())) {
      console.warn(`Invalid date provided to getGMT7Time: ${date}`)
      inputDate = new Date()
    }
  } else {
    console.warn(`Invalid date type provided to getGMT7Time: ${typeof date}`)
    inputDate = new Date()
  }

  // Create a date object with the GMT+7 offset
  const utcTime = inputDate.getTime() + inputDate.getTimezoneOffset() * 60000
  return new Date(utcTime + 7 * 60 * 60 * 1000)
}

/**
 * Formats a date to a time string in HH:MM:SS format using GMT+7 timezone
 * @param date - Optional date input (Date object, string, or number)
 * @returns Formatted time string in HH:MM:SS format
 */
export function formatGMT7TimeString(date?: Date | string | number): string {
  try {
    const inputDate = date ? new Date(date) : new Date()
    return inputDate.toLocaleString("en-US", {
      timeZone: "Asia/Bangkok",
      hour: "2-digit",
      minute: "2-digit", 
      second: "2-digit",
      hour12: false,
    })
  } catch (error) {
    console.warn("Error formatting GMT+7 time:", error)
    return new Date().toLocaleTimeString("en-US", { hour12: false })
  }
}

// Alternative function name for testing
export const getCurrentTimeString = (): string => {
  try {
    return new Date().toLocaleString("en-US", {
      timeZone: "Asia/Bangkok",
      hour: "2-digit",
      minute: "2-digit", 
      second: "2-digit",
      hour12: false,
    })
  } catch (error) {
    return new Date().toLocaleTimeString("en-US", { hour12: false })
  }
}

/**
 * Formats a date to a date string in MM/DD/YYYY format using GMT+7 timezone
 * @param date - Optional date input (Date object, string, or number)
 * @returns Formatted date string in MM/DD/YYYY format
 */
export function formatGMT7DateString(date?: Date | string | number): string {
  const gmt7Time = getGMT7Time(date)
  const year = gmt7Time.getFullYear()
  const month = normalizeTimeUnit(gmt7Time.getMonth() + 1) // getMonth() is 0-indexed
  const day = normalizeTimeUnit(gmt7Time.getDate())

  return `${month}/${day}/${year}`
}

/**
 * Formats a date to a datetime string in MM/DD/YYYY HH:MM:SS format using GMT+7 timezone
 * @param date - Optional date input (Date object, string, or number)
 * @returns Formatted datetime string in MM/DD/YYYY HH:MM:SS format
 */
export function formatGMT7DateTime(date?: Date | string | number): string {
  return `${formatGMT7DateString(date)} ${formatGMT7TimeString(date)}`
}

/**
 * Safely parses a date value and returns a valid Date object
 * @param dateValue - The date value to parse
 * @returns A valid Date object or current date if parsing fails
 */
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

/**
 * General function to format time with GMT+7 timezone
 * @param date - Optional date input
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted string
 */
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
