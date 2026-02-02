/**
 * Payment Types
 *
 * Type definitions for payment-related data structures
 * used in order management and MAO integration.
 */

/**
 * Transaction type for payment operations
 *
 * @description Represents the lifecycle stage of a payment transaction
 * - `AUTHORIZATION`: Initial payment authorization hold - funds are reserved but not yet captured
 * - `SETTLEMENT`: Payment has been captured/settled with the merchant - funds transferred
 * - `REFUNDED`: Payment has been refunded to the customer
 */
export type TransactionType = 'AUTHORIZATION' | 'SETTLEMENT' | 'REFUNDED'

/**
 * Item settled by a specific payment transaction
 *
 * @description Represents an order item that was settled/paid for by a specific payment transaction.
 * Used to show item-level breakdown per payment in split payment scenarios.
 */
export interface SettledItem {
  /** References the order line item ID */
  lineId: string
  /** Product display name */
  productName: string
  /** Product SKU/ID (displayed in table with monospace font) */
  sku: string
  /** Optional Thai product name */
  thaiName?: string
  /** Quantity settled by this payment */
  quantity: number
  /** Price per unit */
  unitPrice: number
  /** Total amount for this item (qty × price after discounts) */
  itemAmount: number
  /** Item-level discount applied */
  discountAmount?: number
  /** Unit of measure (PCS, SBTL, etc.) */
  uom?: string
}

/**
 * Payment transaction details
 *
 * @description Contains all details for a single payment transaction,
 * including payment method, amounts, and transaction lifecycle state.
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
  /** Member ID for loyalty/points payments (e.g., The1 Points) */
  memberId?: string
  /** The current transaction type/lifecycle stage (Authorization, Settlement, or Refunded) */
  transactionType?: TransactionType
  invoiceNo?: string
  /** Items settled by this payment transaction */
  settledItems?: SettledItem[]
  /** Quick count of settled items */
  settledItemsCount?: number
  /** Sum of item amounts (should match transaction amount) */
  settledItemsTotal?: number
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
