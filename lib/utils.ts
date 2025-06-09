import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines multiple class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Gets the current time in GMT+7 (Bangkok) timezone
 */
export function getGMT7Time(date?: Date | string | number): Date {
  const inputDate = date ? new Date(date) : new Date()

  // Create a date object with the GMT+7 offset
  const gmt7Offset = 7 * 60 * 60 * 1000 // 7 hours in milliseconds
  const utcTime = inputDate.getTime() + inputDate.getTimezoneOffset() * 60 * 1000
  return new Date(utcTime + gmt7Offset)
}

/**
 * Formats a date to a time string in GMT+7 timezone (HH:MM:SS)
 */
export function formatGMT7TimeString(date?: Date | string | number): string {
  const gmt7Date = getGMT7Time(date)

  const hours = gmt7Date.getUTCHours().toString().padStart(2, "0")
  const minutes = gmt7Date.getUTCMinutes().toString().padStart(2, "0")
  const seconds = gmt7Date.getUTCSeconds().toString().padStart(2, "0")

  return `${hours}:${minutes}:${seconds}`
}

/**
 * Formats a date to a date string in GMT+7 timezone (YYYY-MM-DD)
 */
export function formatGMT7DateString(date?: Date | string | number): string {
  const gmt7Date = getGMT7Time(date)

  const year = gmt7Date.getUTCFullYear()
  const month = (gmt7Date.getUTCMonth() + 1).toString().padStart(2, "0")
  const day = gmt7Date.getUTCDate().toString().padStart(2, "0")

  return `${year}-${month}-${day}`
}

/**
 * Formats a date to a datetime string in GMT+7 timezone (YYYY-MM-DD HH:MM:SS)
 */
export function formatGMT7DateTime(date?: Date | string | number): string {
  const dateString = formatGMT7DateString(date)
  const timeString = formatGMT7TimeString(date)

  return `${dateString} ${timeString}`
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
