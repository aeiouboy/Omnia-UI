import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convert any date input to GMT+7 timezone
 * @param dateInput - Date string, Date object, or timestamp
 * @returns Date object in GMT+7 timezone
 */
export function getGMT7Time(dateInput?: string | Date | number): Date {
  if (!dateInput) return new Date()

  const date = new Date(dateInput)
  if (isNaN(date.getTime())) {
    console.warn("Invalid date input:", dateInput)
    return new Date()
  }

  return date
}

/**
 * Format date to GMT+7 date string only
 * @param dateInput - Date string, Date object, or timestamp
 * @returns Formatted date string in GMT+7 timezone (e.g., "2025-01-09")
 */
export function formatGMT7DateString(dateInput?: string | Date | number): string {
  const date = getGMT7Time(dateInput)

  return date.toLocaleDateString("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
}

/**
 * Format date to GMT+7 date and time string
 * @param dateInput - Date string, Date object, or timestamp
 * @returns Formatted date string in GMT+7 timezone (e.g., "09/01/2025 14:30:45 GMT+7")
 */
export function formatGMT7DateTime(dateInput?: string | Date | number): string {
  const date = getGMT7Time(dateInput)

  return (
    date.toLocaleString("en-GB", {
      timeZone: "Asia/Bangkok",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }) + " GMT+7"
  )
}

/**
 * Format current time to GMT+7 time string
 * @returns Current time formatted as GMT+7 (e.g., "14:30:45 GMT+7")
 */
export function formatGMT7TimeString(): string {
  const now = new Date()

  return (
    now.toLocaleString("en-GB", {
      timeZone: "Asia/Bangkok",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }) + " GMT+7"
  )
}

/**
 * Formats a number as Thai Baht currency
 */
export function formatCurrency(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined) return "฿0"

  const numAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount
  return `฿${numAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/**
 * Converts seconds to minutes if the value is large (likely in seconds)
 * This helps handle inconsistent API responses that might return SLA times in seconds or minutes
 */
export function normalizeTimeUnit(value: number): number {
  // If the value is large (over 1000), assume it's in seconds and convert to minutes
  if (value > 1000) {
    return Math.round(value / 60)
  }
  return value
}

/**
 * Formats a duration in minutes to a human-readable string (e.g., "2h 30m")
 */
export function formatDuration(minutes: number): string {
  if (isNaN(minutes) || minutes < 0) return "-"

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = Math.floor(minutes % 60)

  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`
  }
  return `${remainingMinutes}m`
}
