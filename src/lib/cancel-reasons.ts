// Cancel Reasons Configuration
// Based on MAO cancel reason Excel file with two categories: Return (RT-) and Short (SH-)

export interface CancelReason {
  id: string
  type: 'RETURN' | 'SHORT'
  shortDescription: string
  description: string
}

// Cancel Reasons Configuration
export const CANCEL_REASONS: CancelReason[] = [
  // Return Reasons (RT-) - Customer initiated returns/cancellations
  {
    id: 'RT-AdverseEffects',
    type: 'RETURN',
    shortDescription: 'Adverse Effects',
    description: 'Product caused allergic reaction or adverse effects'
  },
  {
    id: 'RT-CustChangeMind',
    type: 'RETURN',
    shortDescription: 'Customer Change Mind',
    description: 'Customer changed their mind'
  },
  {
    id: 'RT-ProdDamaged',
    type: 'RETURN',
    shortDescription: 'Product Damaged',
    description: 'Product damaged during shipping'
  },
  {
    id: 'RT-ProdExpired',
    type: 'RETURN',
    shortDescription: 'Product Expired',
    description: 'Product expired or near expiry'
  },
  {
    id: 'RT-ProdWrongSize',
    type: 'RETURN',
    shortDescription: 'Wrong Size',
    description: 'Wrong size received'
  },
  {
    id: 'RT-ProdWrongItem',
    type: 'RETURN',
    shortDescription: 'Wrong Item',
    description: 'Wrong item received'
  },
  {
    id: 'RT-QualityIssue',
    type: 'RETURN',
    shortDescription: 'Quality Issue',
    description: 'Product quality not satisfactory'
  },
  {
    id: 'RT-PriceMismatch',
    type: 'RETURN',
    shortDescription: 'Price Mismatch',
    description: 'Price charged different from advertised'
  },
  {
    id: 'RT-DeliveryDelay',
    type: 'RETURN',
    shortDescription: 'Delivery Delay',
    description: 'Delivery took too long'
  },
  {
    id: 'RT-DuplicateOrder',
    type: 'RETURN',
    shortDescription: 'Duplicate Order',
    description: 'Customer accidentally placed duplicate order'
  },
  {
    id: 'RT-FoundElsewhere',
    type: 'RETURN',
    shortDescription: 'Found Elsewhere',
    description: 'Customer found product elsewhere at better price'
  },
  {
    id: 'RT-NoLongerNeeded',
    type: 'RETURN',
    shortDescription: 'No Longer Needed',
    description: 'Customer no longer needs the product'
  },
  {
    id: 'RT-PaymentIssue',
    type: 'RETURN',
    shortDescription: 'Payment Issue',
    description: 'Customer has payment concerns'
  },
  {
    id: 'RT-FamilyIssue',
    type: 'RETURN',
    shortDescription: 'Family Issue',
    description: 'Family emergency or personal issue'
  },
  {
    id: 'RT-MovedAddress',
    type: 'RETURN',
    shortDescription: 'Moved Address',
    description: 'Customer moved to new address'
  },
  {
    id: 'RT-HealthIssue',
    type: 'RETURN',
    shortDescription: 'Health Issue',
    description: 'Customer health related issue'
  },

  // Short Reasons (SH-) - System/Store initiated cancellations
  {
    id: 'SH-OOS',
    type: 'SHORT',
    shortDescription: 'Out of Stock',
    description: 'Product out of stock'
  },
  {
    id: 'SH-DamagedDefect',
    type: 'SHORT',
    shortDescription: 'Damaged & Defect',
    description: 'Product damaged or defective'
  },
  {
    id: 'SH-CustChangeMind',
    type: 'SHORT',
    shortDescription: 'Customer Change Mind',
    description: "Customer's change of mind"
  },
  {
    id: 'SH-OOSMismatch',
    type: 'SHORT',
    shortDescription: 'Image Mismatch',
    description: "Image doesn't match product"
  },
  {
    id: 'SH-ProdExpired',
    type: 'SHORT',
    shortDescription: 'Product Expired',
    description: 'Product expired or damaged'
  },
  {
    id: 'SH-PaymentFailed',
    type: 'SHORT',
    shortDescription: 'Payment Failed',
    description: 'Payment verification failed'
  },
  {
    id: 'SH-SystemError',
    type: 'SHORT',
    shortDescription: 'System Error',
    description: 'System or technical error'
  },
  {
    id: 'SH-PricingError',
    type: 'SHORT',
    shortDescription: 'Pricing Error',
    description: 'Incorrect pricing in system'
  },
  {
    id: 'SH-InventoryError',
    type: 'SHORT',
    shortDescription: 'Inventory Error',
    description: 'Inventory discrepancy'
  },
  {
    id: 'SH-SupplierIssue',
    type: 'SHORT',
    shortDescription: 'Supplier Issue',
    description: 'Supplier unable to fulfill'
  },
  {
    id: 'SH-WeatherIssue',
    type: 'SHORT',
    shortDescription: 'Weather Issue',
    description: 'Weather or natural disaster'
  },
  {
    id: 'SH-TransportIssue',
    type: 'SHORT',
    shortDescription: 'Transport Issue',
    description: 'Transportation or logistics issue'
  },
  {
    id: 'SH-StoreClosed',
    type: 'SHORT',
    shortDescription: 'Store Closed',
    description: 'Store temporarily closed'
  },
  {
    id: 'SH-PromotionError',
    type: 'SHORT',
    shortDescription: 'Promotion Error',
    description: 'Promotion or discount error'
  },
  {
    id: 'SH-CustomerRequest',
    type: 'SHORT',
    shortDescription: 'Customer Request',
    description: 'Customer requested cancellation'
  },
  {
    id: 'SH-FraudSuspected',
    type: 'SHORT',
    shortDescription: 'Fraud Suspected',
    description: 'Suspicious or fraudulent order'
  },
  {
    id: 'SH-DeliveryIssue',
    type: 'SHORT',
    shortDescription: 'Delivery Issue',
    description: 'Unable to deliver to address'
  },
  {
    id: 'SH-ProductRecall',
    type: 'SHORT',
    shortDescription: 'Product Recall',
    description: 'Product recalled by manufacturer'
  },
  {
    id: 'SH-Other',
    type: 'SHORT',
    shortDescription: 'Other',
    description: 'Other reasons not listed'
  }
]

/**
 * Get all return reasons (RT- prefix)
 */
export function getReturnReasons(): CancelReason[] {
  return CANCEL_REASONS.filter(reason => reason.type === 'RETURN')
}

/**
 * Get all short reasons (SH- prefix)
 */
export function getShortReasons(): CancelReason[] {
  return CANCEL_REASONS.filter(reason => reason.type === 'SHORT')
}

/**
 * Get cancel reason by ID
 */
export function getCancelReasonById(id: string): CancelReason | undefined {
  return CANCEL_REASONS.find(reason => reason.id === id)
}

/**
 * Get cancel reason short description by ID
 */
export function getCancelReasonLabel(id: string): string {
  const reason = getCancelReasonById(id)
  return reason ? reason.shortDescription : 'Unknown'
}

/**
 * Group cancel reasons by type
 */
export function getCancelReasonsByType(): Record<string, CancelReason[]> {
  return {
    RETURN: getReturnReasons(),
    SHORT: getShortReasons()
  }
}
