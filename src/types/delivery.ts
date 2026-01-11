/**
 * Delivery Types for Order Detail Page
 * Supports mixed delivery methods: Home Delivery and Click & Collect
 */

/**
 * Delivery method type enum
 */
export type DeliveryMethodType = 'HOME_DELIVERY' | 'CLICK_COLLECT'

/**
 * Home delivery address and recipient details
 */
export interface HomeDeliveryDetails {
  recipient: string
  phone: string
  address: string
  district: string
  city: string
  postalCode: string
  specialInstructions?: string
}

/**
 * Click & Collect store pickup details
 */
export interface ClickCollectDetails {
  storeName: string
  storeAddress: string
  storePhone: string
  recipientName: string
  phone: string
  relNo: string
  pickupDate: string
  timeSlot: string
  collectionCode: string
  allocationType?: 'Pickup'
}

/**
 * Delivery method with item count and details
 */
export interface DeliveryMethod {
  type: DeliveryMethodType
  itemCount: number
  homeDelivery?: HomeDeliveryDetails
  clickCollect?: ClickCollectDetails
}
