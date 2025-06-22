// Currency formatting utilities

/**
 * Format currency amount as integer (whole number) with Thai locale
 * @param amount - The amount to format
 * @param showCurrency - Whether to include the currency symbol
 * @returns Formatted currency string
 */
export function formatCurrencyInt(amount: number | undefined | null, showCurrency = true): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return showCurrency ? '฿0' : '0'
  }
  
  // Round to nearest integer
  const roundedAmount = Math.round(amount)
  
  // Format with Thai locale for thousand separators
  const formatted = roundedAmount.toLocaleString('th-TH')
  
  return showCurrency ? `฿${formatted}` : formatted
}

/**
 * Format large amounts with suffix (K, M, B)
 * @param amount - The amount to format
 * @param decimals - Number of decimal places for the shortened value
 * @returns Formatted string with suffix
 */
export function formatCurrencyShort(amount: number | undefined | null, decimals = 0): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '฿0'
  }
  
  const absAmount = Math.abs(amount)
  const sign = amount < 0 ? '-' : ''
  
  if (absAmount >= 1_000_000_000) {
    return `${sign}฿${(absAmount / 1_000_000_000).toFixed(decimals)}B`
  } else if (absAmount >= 1_000_000) {
    return `${sign}฿${(absAmount / 1_000_000).toFixed(decimals)}M`
  } else if (absAmount >= 1_000) {
    return `${sign}฿${(absAmount / 1_000).toFixed(decimals)}K`
  }
  
  return `${sign}฿${Math.round(absAmount).toLocaleString('th-TH')}`
}

/**
 * Parse currency string to number
 * @param value - Currency string to parse
 * @returns Parsed number value
 */
export function parseCurrency(value: string): number {
  // Remove currency symbol and thousand separators
  const cleanValue = value.replace(/[฿,$,]/g, '').trim()
  const parsed = parseFloat(cleanValue)
  return isNaN(parsed) ? 0 : parsed
}