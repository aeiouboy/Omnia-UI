/**
 * Payment Types
 *
 * Type definitions for payment-related data structures
 * used in order management and MAO integration.
 */

/**
 * Transaction type for payment operations
 */
export type TransactionType = 'AUTHORIZATION' | 'SETTLEMENT' | 'REFUNDED'

/**
 * Payment transaction details
 */
export interface PaymentTransaction {
  id: string
  method: string
  status: string
  transactionId: string
  amount: number
  currency: string
  date: string
  gateway?: string
  cardNumber?: string
  expiryDate?: string
  transactionType?: TransactionType
  invoiceNo?: string
}

/**
 * Order-level discount
 */
export interface OrderDiscount {
  amount: number
  type: string
  description: string
}

/**
 * Promotion details
 */
export interface Promotion {
  promotionId: string
  promotionName?: string
  promotionType: string
  discountAmount: number
  couponCode?: string
}

/**
 * Coupon code details
 */
export interface CouponCode {
  code: string
  description: string
  discountAmount: number
  appliedAt: string
}

/**
 * Tax breakdown per line item
 */
export interface TaxBreakdown {
  lineId: string
  taxAmount: number
}

/**
 * Complete pricing breakdown for an order
 */
export interface PricingBreakdown {
  subtotal: number
  orderDiscount: number
  lineItemDiscount: number
  taxAmount: number
  taxBreakdown?: TaxBreakdown[]
  shippingFee: number
  additionalFees?: number
  grandTotal: number
  paidAmount: number
  currency: string
}
