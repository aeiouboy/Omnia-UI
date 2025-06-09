import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility functions for GMT+7 timezone handling
export function getGMT7Time(date?: Date | string): Date {
  const inputDate = date ? new Date(date) : new Date()
  // Convert to GMT+7 (Bangkok timezone)
  const utc = inputDate.getTime() + (inputDate.getTimezoneOffset() * 60000)
  const gmt7 = new Date(utc + (7 * 3600000))
  return gmt7
}

export function formatGMT7Time(date?: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const gmt7Date = getGMT7Time(date)
  return gmt7Date.toLocaleString("en-US", {
    timeZone: "Asia/Bangkok",
    ...options
  })
}

export function formatGMT7TimeString(date?: Date | string): string {
  return formatGMT7Time(date, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  })
}

export function formatGMT7DateString(date?: Date | string): string {
  return formatGMT7Time(date, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
}

export function formatGMT7DateTime(date?: Date | string): string {
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
