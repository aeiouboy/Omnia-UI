import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Simple time formatting function that should always work
export function formatGMT7TimeString(): string {
  try {
    return new Date().toLocaleString("en-US", {
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
  return `${formatGMT7DateString(date)} ${formatGMT7TimeString()}`
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

