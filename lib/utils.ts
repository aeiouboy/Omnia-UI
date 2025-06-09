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
  return inputDate // Return the original date, let toLocaleString handle timezone conversion
}

export function formatGMT7Time(date?: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const inputDate = date ? new Date(date) : new Date()
  return inputDate.toLocaleString("en-US", {
    timeZone: "Asia/Bangkok",
    ...options
  })
}

/**
 * Formats a date to a time string in GMT+7 timezone (HH:MM:SS AM/PM)
 */
export function formatGMT7TimeString(date?: Date | string | number): string {
  return formatGMT7Time(date, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  })
}

/**
 * Formats a date to a date string in GMT+7 timezone (MM/DD/YYYY)
 */
export function formatGMT7DateString(date?: Date | string | number): string {
  return formatGMT7Time(date, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
}

/**
 * Formats a date to a datetime string in GMT+7 timezone
 */
export function formatGMT7DateTime(date?: Date | string | number): string {
  return formatGMT7Time(date, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  })
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
