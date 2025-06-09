import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Timezone utility functions for GMT+7 (Bangkok/Asia timezone)

/**
 * Converts any date input to GMT+7 timezone
 */
export function getGMT7Time(date?: Date | string | number): Date {
  const inputDate = date ? new Date(date) : new Date()
  return inputDate // Let toLocaleString handle timezone conversion
}

/**
 * Formats a date to GMT+7 date string (YYYY-MM-DD)
 */
export function formatGMT7DateString(date?: Date | string | number): string {
  const gmt7Date = getGMT7Time(date)
  return gmt7Date.toLocaleDateString("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
}

/**
 * Formats a date to GMT+7 date and time string
 */
export function formatGMT7DateTime(date?: Date | string | number): string {
  const gmt7Date = getGMT7Time(date)
  return gmt7Date.toLocaleString("en-US", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
}

/**
 * Formats current time to GMT+7 time string (HH:MM:SS)
 */
export function formatGMT7TimeString(): string {
  const now = new Date()
  return now.toLocaleTimeString("en-US", {
    timeZone: "Asia/Bangkok",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
}

/**
 * Normalizes time units to ensure consistent formatting
 */
export function normalizeTimeUnit(value: number, unit: "seconds" | "minutes" | "hours" = "seconds"): number {
  switch (unit) {
    case "minutes":
      return Math.floor(value / 60)
    case "hours":
      return Math.floor(value / 3600)
    case "seconds":
    default:
      return Math.floor(value)
  }
}
