import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normalizes a time unit to ensure it's always two digits
 * @param unit - The time unit to normalize (e.g., hours, minutes, seconds)
 * @returns A string representation of the unit with leading zero if needed
 */
export function normalizeTimeUnit(unit: number): string {
  return unit.toString().padStart(2, "0")
}

/**
 * Gets the current time in GMT+7 (Bangkok timezone)
 * @returns Date object representing the current time in GMT+7
 */
export function getGMT7Time(): Date {
  const now = new Date()
  // Get UTC time in milliseconds
  const utcTime = now.getTime() + now.getTimezoneOffset() * 60000
  // Convert to GMT+7
  return new Date(utcTime + 7 * 60 * 60000)
}

/**
 * Formats a date to GMT+7 time string in HH:MM:SS format
 * @param date - The date to format (defaults to current time)
 * @returns Formatted time string in HH:MM:SS format
 */
export function formatGMT7TimeString(date: Date = new Date()): string {
  const gmt7Date = new Date(date.getTime() + (7 * 60 - date.getTimezoneOffset()) * 60000)

  const hours = normalizeTimeUnit(gmt7Date.getHours())
  const minutes = normalizeTimeUnit(gmt7Date.getMinutes())
  const seconds = normalizeTimeUnit(gmt7Date.getSeconds())

  return `${hours}:${minutes}:${seconds}`
}

/**
 * Formats a date to GMT+7 date string in YYYY-MM-DD format
 * @param date - The date to format (defaults to current time)
 * @returns Formatted date string in YYYY-MM-DD format
 */
export function formatGMT7DateString(date: Date = new Date()): string {
  const gmt7Date = new Date(date.getTime() + (7 * 60 - date.getTimezoneOffset()) * 60000)

  const year = gmt7Date.getFullYear()
  const month = normalizeTimeUnit(gmt7Date.getMonth() + 1) // getMonth() is zero-based
  const day = normalizeTimeUnit(gmt7Date.getDate())

  return `${year}-${month}-${day}`
}

/**
 * Formats a date to GMT+7 date and time string in YYYY-MM-DD HH:MM:SS format
 * @param date - The date to format (defaults to current time)
 * @returns Formatted date and time string in YYYY-MM-DD HH:MM:SS format
 */
export function formatGMT7DateTime(date: Date = new Date()): string {
  return `${formatGMT7DateString(date)} ${formatGMT7TimeString(date)}`
}
