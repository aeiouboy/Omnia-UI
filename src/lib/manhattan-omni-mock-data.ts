/**
 * Manhattan OMNI Mock Data Generator
 *
 * Generates mock order data based on the Manhattan OMNI order structure
 * as documented in mock_specs/mock-01440766-manhattan-omni-order-status.md
 *
 * Features:
 * - Maps Manhattan OMNI fields to Omnia-UI ApiOrder/Order interface
 * - Supports gift-with-purchase relationships
 * - Uses Thai Baht (THB) currency and GMT+7 timezone
 * - Generates realistic Thai customer data
 *
 * @see mock_specs/mock-01440766-manhattan-omni-order-status.md for field mapping details
 */

import { DeliveryMethod, DeliveryMethodType } from "@/types/delivery"
import type { PricingBreakdown } from "@/types/payment"

// ============================================================================
// TYPES
// ============================================================================

/**
 * Manhattan OMNI Order Type codes that map to Omnia-UI FMSOrderType
 */
export type ManhattanOrderType = 'RT-CC-STD' | 'RT-HD-STD' | 'RT-HD-EXP' | 'RT-CC-EXP' | 'RT-MIX-STD' | 'MKP-HD-STD' | 'Return Order'

/**
 * Manhattan OMNI payment methods
 */
export type ManhattanPaymentMethod = 'BANK TRANSFER' | 'CREDIT CARD' | 'QR PROMPTPAY' | 'CASH ON DELIVERY' | 'THE1 POINTS'

/**
 * Manhattan OMNI order status values
 */
export type ManhattanOrderStatus = 'FULFILLED' | 'SUBMITTED' | 'PROCESSING' | 'PICKED UP' | 'SHIPPED' | 'CANCELLED'

/**
 * Manhattan OMNI line item structure
 */
export interface ManhattanLineItem {
  sku: string
  itemName: string
  quantity: number
  price: number  // THB amount
  fulfillmentStatus: string
  uom: string
  eta: string  // MM/DD/YYYY format
  shippingMethod: string
  secretCode?: string
  giftWithPurchase: boolean
  giftWithPurchaseItem?: string  // Parent SKU for gift items
  style?: string
  color?: string
  size?: string
  bundle?: boolean
  bundleRefId?: string
  informationalTaxes?: number
}

/**
 * Manhattan OMNI shipment structure
 */
export interface ManhattanShipment {
  status: 'PICKED UP' | 'FULFILLED' | 'SHIPPED'
  trackingNumber: string
  releaseNumber: string
  eta: string
  shippingMethod: string
  allocationType: 'Pickup' | 'Merge'
  storeName: string
  storeAddress: string
  storeCity: string
  storeProvince: string
  storePostalCode: string
  storePhone: string
  pickedOn?: string
  shippedOn?: string
  shippedFrom?: string
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Parse THB currency string to number
 * @param currencyStr - Currency string in format "THB X,XXX.XX"
 * @returns Numeric value
 *
 * @example
 * parseTHBCurrency("THB 5,200.00") // Returns 5200
 * parseTHBCurrency("THB 0.00") // Returns 0
 */
export function parseTHBCurrency(currencyStr: string): number {
  if (!currencyStr) return 0
  // Remove "THB " prefix and commas, then parse
  const numStr = currencyStr.replace(/THB\s?/i, '').replace(/,/g, '')
  const value = parseFloat(numStr)
  return isNaN(value) ? 0 : value
}

/**
 * Format number as THB currency string
 * @param amount - Numeric amount
 * @returns Formatted currency string "THB X,XXX.XX"
 */
export function formatTHBCurrency(amount: number): string {
  return `THB ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/**
 * Parse Manhattan date format to ISO string
 * @param dateStr - Date string in format "MM/DD/YYYY HH:MM +07"
 * @returns ISO 8601 formatted date string
 *
 * @example
 * parseManhattanDateTime("01/20/2026 18:40 +07") // Returns "2026-01-20T18:40:00+07:00"
 */
export function parseManhattanDateTime(dateStr: string): string {
  if (!dateStr) return new Date().toISOString()

  // Extract parts from "MM/DD/YYYY HH:MM +07" format
  const match = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})\s*(\+\d{2})?/)
  if (!match) return new Date().toISOString()

  const [, month, day, year, hour, minute, timezone = '+07'] = match
  // Create ISO format with timezone
  return `${year}-${month}-${day}T${hour}:${minute}:00${timezone}:00`
}

/**
 * Format date as Manhattan display format (MM/DD/YYYY HH:mm:ss)
 * @param date - Date object or ISO string
 * @returns Formatted date string
 */
export function formatManhattanDisplayDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

/**
 * Generate a tracking number in Manhattan format
 * @example "CNJ2601065054"
 */
function generateTrackingNumber(): string {
  const prefix = 'CNJ'
  const dateCode = new Date().toISOString().slice(2, 10).replace(/-/g, '').slice(0, 4)
  const random = String(Math.floor(Math.random() * 1000000)).padStart(6, '0')
  return `${prefix}${dateCode}${random}`
}

/**
 * Generate a release number in Manhattan format
 * @param orderNumber - The base order number
 * @param sequence - Sequence number for multiple releases
 * @example "CDS2601202213402"
 */
function generateReleaseNumber(orderNumber: string, sequence: number = 1): string {
  return `${orderNumber}${sequence}`
}

/**
 * Generate an invoice number in Manhattan format
 * @example "17689146816096382236"
 */
function generateInvoiceNumber(): string {
  return String(Math.floor(Math.random() * 9000000000000000000) + 1000000000000000000)
}

// ============================================================================
// SAMPLE DATA CONSTANTS
// ============================================================================

/** Thai customer names for mock data */
const thaiCustomerNames = [
  'TIAGO SILVA',
  'SOMCHAI PRASERT',
  'KANNIKA SIRIPAN',
  'NATTAPONG WONGCHA',
  'SIRIPORN CHAIYONG',
  'THANAKORN WISET',
  'MALEE SRISUK',
  'PATCHARA THONGKAM',
  'SURAPONG KANCHANA',
  'WANIDA SOMBAT'
]

/** Thai phone numbers */
const thaiPhoneNumbers = [
  '0996576505',
  '0812345678',
  '0891234567',
  '0923456789',
  '0854321098',
  '0876543210',
  '0834567890',
  '0867890123',
  '0845678901',
  '0909876543'
]

/** Central store locations for Click & Collect */
const centralStores = [
  {
    storeName: 'CENTRAL CHIDLOM',
    storeCode: 'CDS',
    storeNumber: '10102',
    addressLine1: 'Store Pickup Central Chidlom (CDS 10102) 1027 Ploenchit Road',
    city: 'Pathumwan',
    province: 'Bangkok',
    postalCode: '10330',
    phone: '027937777',
    pickupLocation: 'Chidlom'
  },
  {
    storeName: 'CENTRAL LADPRAO',
    storeCode: 'CDL',
    storeNumber: '10103',
    addressLine1: 'Store Pickup Central Ladprao (CDL 10103) 1693 Phaholyothin Road',
    city: 'Chatuchak',
    province: 'Bangkok',
    postalCode: '10900',
    phone: '025411234',
    pickupLocation: 'Ladprao'
  },
  {
    storeName: 'CENTRAL BANGNA',
    storeCode: 'CDB',
    storeNumber: '10104',
    addressLine1: 'Store Pickup Central Bangna (CDB 10104) 585 Bangna-Trad Road',
    city: 'Bangna',
    province: 'Bangkok',
    postalCode: '10260',
    phone: '027445678',
    pickupLocation: 'Bangna'
  },
  {
    storeName: 'CENTRAL WORLD',
    storeCode: 'CDW',
    storeNumber: '10101',
    addressLine1: 'Store Pickup Central World (CDW 10101) 999 Rama 1 Road',
    city: 'Pathumwan',
    province: 'Bangkok',
    postalCode: '10330',
    phone: '022559000',
    pickupLocation: 'Central World'
  }
]

/** Manhattan OMNI product catalog for cosmetics/beauty */
const manhattanProducts = [
  {
    sku: 'CDS24737203',
    name: 'Women Fragrance Gift Set Libre 50 mL Holiday 25',
    category: 'Fragrance',
    brand: 'YSL',
    price: 5200,
    isMainGiftItem: true
  },
  {
    sku: 'CDS10174760',
    name: 'GET FREE - MYSLF EAU DE PARFUM 1.2 mL',
    category: 'Fragrance',
    brand: 'YSL',
    price: 0,
    isGift: true,
    triggerSku: 'CDS24737203'
  },
  {
    sku: 'CDS16319509',
    name: 'GET FREE - YSL Pureshot Stability Reboot B 30 mL.',
    category: 'Skincare',
    brand: 'YSL',
    price: 0,
    isGift: true,
    triggerSku: 'CDS24737203'
  },
  {
    sku: 'CDS23619029',
    name: 'GET FREE - Libre EDP 1.2 mL',
    category: 'Fragrance',
    brand: 'YSL',
    price: 0,
    isGift: true,
    triggerSku: 'CDS24737203'
  },
  {
    sku: 'CDS24890001',
    name: 'Chanel No.5 Eau de Parfum 100 mL',
    category: 'Fragrance',
    brand: 'Chanel',
    price: 6900
  },
  {
    sku: 'CDS24890002',
    name: 'Dior Sauvage EDT 100 mL',
    category: 'Fragrance',
    brand: 'Dior',
    price: 4800
  },
  {
    sku: 'CDS24890003',
    name: 'SK-II Facial Treatment Essence 230 mL',
    category: 'Skincare',
    brand: 'SK-II',
    price: 8500
  },
  {
    sku: 'CDS24890004',
    name: 'La Mer Moisturizing Cream 60 mL',
    category: 'Skincare',
    brand: 'La Mer',
    price: 12800
  },
  {
    sku: 'CDS24890005',
    name: 'Tom Ford Black Orchid EDP 50 mL',
    category: 'Fragrance',
    brand: 'Tom Ford',
    price: 5600
  },
  {
    sku: 'CDS24890006',
    name: 'Estee Lauder Advanced Night Repair 50 mL',
    category: 'Skincare',
    brand: 'Estee Lauder',
    price: 4200
  }
]

// ============================================================================
// ORDER GENERATOR
// ============================================================================

/**
 * Generate a Manhattan OMNI style order
 *
 * @param options - Configuration options for order generation
 * @returns Order object compatible with Omnia-UI Order interface
 */
export function generateManhattanOmniOrder(options: {
  orderNumber?: string
  customerIndex?: number
  orderType?: ManhattanOrderType
  paymentMethod?: ManhattanPaymentMethod
  orderStatus?: ManhattanOrderStatus
  includeGiftItems?: boolean
  storeIndex?: number
  orderDate?: Date
  customItems?: ManhattanLineItem[]
} = {}): any {
  const {
    orderNumber = `CDS${Date.now().toString().slice(-10)}`,
    customerIndex = Math.floor(Math.random() * thaiCustomerNames.length),
    orderType = 'RT-CC-STD',
    paymentMethod = 'BANK TRANSFER',
    orderStatus = 'FULFILLED',
    includeGiftItems = true,
    storeIndex = 0,
    orderDate = new Date(),
    customItems
  } = options

  const customerName = thaiCustomerNames[customerIndex]
  const customerPhone = thaiPhoneNumbers[customerIndex]
  const customerEmail = `${orderNumber.toLowerCase().replace(/[^a-z0-9]/g, '')}@dummy.com`
  const customerRef = orderNumber.slice(-10)
  const store = centralStores[storeIndex % centralStores.length]

  // Generate order items
  let orderItems: any[]
  let totalAmount = 0

  if (customItems) {
    orderItems = customItems.map((item, idx) => createOrderItem(item, orderNumber, idx))
    totalAmount = customItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  } else if (includeGiftItems) {
    // Generate the gift set scenario (main item + 3 free gifts)
    const mainProduct = manhattanProducts.find(p => p.sku === 'CDS24737203')!
    const giftProducts = manhattanProducts.filter(p => p.isGift && p.triggerSku === 'CDS24737203')

    orderItems = [
      ...giftProducts.map((product, idx) => createOrderItem({
        sku: product.sku,
        itemName: product.name,
        quantity: 1,
        price: 0,
        fulfillmentStatus: 'FULFILLED',
        uom: 'PCS',
        eta: formatFutureDate(6),
        shippingMethod: 'Standard Pickup',
        secretCode: '564775',
        giftWithPurchase: true,
        giftWithPurchaseItem: mainProduct.sku
      }, orderNumber, idx)),
      createOrderItem({
        sku: mainProduct.sku,
        itemName: mainProduct.name,
        quantity: 1,
        price: mainProduct.price,
        fulfillmentStatus: 'FULFILLED',
        uom: 'PCS',
        eta: formatFutureDate(6),
        shippingMethod: 'Standard Pickup',
        giftWithPurchase: false,
        informationalTaxes: mainProduct.price * 0.07 * (7 / 107) // VAT calculation
      }, orderNumber, giftProducts.length)
    ]
    totalAmount = mainProduct.price
  } else {
    // Generate random non-gift items
    const numItems = Math.floor(Math.random() * 3) + 1
    const availableProducts = manhattanProducts.filter(p => !p.isGift && p.price > 0)
    const selectedProducts = Array.from({ length: numItems }, () =>
      availableProducts[Math.floor(Math.random() * availableProducts.length)]
    )

    orderItems = selectedProducts.map((product, idx) => {
      const quantity = Math.floor(Math.random() * 2) + 1
      totalAmount += product.price * quantity
      return createOrderItem({
        sku: product.sku,
        itemName: product.name,
        quantity,
        price: product.price,
        fulfillmentStatus: orderStatus === 'FULFILLED' ? 'FULFILLED' : 'Pending',
        uom: 'PCS',
        eta: formatFutureDate(6),
        shippingMethod: orderType.includes('CC') ? 'Standard Pickup' : 'Standard Delivery',
        giftWithPurchase: false,
        informationalTaxes: product.price * quantity * 0.07 * (7 / 107)
      }, orderNumber, idx)
    })
  }

  // Calculate pricing breakdown
  const subtotal = totalAmount
  const informationalTaxes = Math.round(subtotal * 0.07 * (7 / 107) * 100) / 100  // VAT included in price

  // Generate delivery methods based on order type
  const deliveryMethods = generateManhattanDeliveryMethods(
    orderType,
    orderItems.length,
    { name: customerName, phone: customerPhone, email: customerEmail },
    store
  )

  // Determine SLA status based on order status
  const targetMinutes = 300  // 5 hours
  const elapsedMinutes = orderStatus === 'FULFILLED' ? targetMinutes - 60 : Math.floor(Math.random() * 400)
  const isBreach = elapsedMinutes > targetMinutes
  const isNearBreach = !isBreach && (targetMinutes - elapsedMinutes) <= (targetMinutes * 0.2)

  const order = {
    id: orderNumber,
    order_no: orderNumber,
    customer: {
      id: `CUST-${customerRef}`,
      name: customerName,
      email: customerEmail,
      phone: customerPhone,
      customerType: 'General',
      custRef: customerRef
    },
    order_date: orderDate.toISOString(),
    channel: 'Web',  // From Manhattan selling_channel field
    sellingChannel: 'Web',  // Manhattan field
    business_unit: 'Retail',
    order_type: orderType,
    orderType: orderType as any,  // FMSOrderType
    total_amount: totalAmount,
    shipping_address: {
      street: store.addressLine1,
      subdistrict: 'Lumpini',
      city: store.city,
      state: store.province,
      postal_code: store.postalCode,
      country: 'TH'
    },
    payment_info: {
      method: paymentMethod,
      status: 'PAID',
      transaction_id: generateInvoiceNumber(),
      subtotal: subtotal,
      discounts: 0,
      charges: 0,
      amountIncludedTaxes: totalAmount,
      amountExcludedTaxes: totalAmount - informationalTaxes,
      taxes: 0,
      informationalTaxes: informationalTaxes
    },
    sla_info: {
      target_minutes: targetMinutes,
      elapsed_minutes: elapsedMinutes,
      status: isBreach ? 'BREACH' : isNearBreach ? 'NEAR_BREACH' : 'COMPLIANT'
    },
    metadata: {
      created_at: orderDate.toISOString(),
      updated_at: new Date().toISOString(),
      priority: 'NORMAL',
      store_name: store.storeName,
      store_no: '',  // Empty per MAO spec line 60: store_number = "" (empty)
      order_created: orderDate.toISOString()
    },
    items: orderItems,
    status: orderStatus,
    on_hold: false,
    fullTaxInvoice: false,
    customerTypeId: 'General',
    allowSubstitution: false,
    allow_substitution: false,
    deliveryMethods,
    // Manhattan OMNI specific fields
    organization: 'DS',
    currency: 'THB',
    billingName: customerName,
    billingAddress: {
      street: '-',
      city: '-',
      country: 'TH'
    },
    pricingBreakdown: {
      subtotal: subtotal,
      orderDiscount: 0,
      lineItemDiscount: 0,
      taxAmount: 0,
      shippingFee: 0,
      grandTotal: totalAmount,
      paidAmount: totalAmount,
      currency: 'THB'
    } as PricingBreakdown,
    // MAO spec section 9: Payments and Settlements
    paymentDetails: [{
      method: paymentMethod,
      amount: totalAmount,
      status: 'PAID',
      transactionType: 'SETTLEMENT' as const,
      transactionDate: orderDate.toISOString(),
      invoiceNumber: `1768914681609638${Math.floor(Math.random() * 10000)}`,
      invoiceStatus: 'Closed',
      invoiceDate: orderDate.toISOString(),
      // Settled items from MAO spec section 9.2 (all 4 line items)
      settledItems: orderItems.map((item: any) => ({
        lineId: item.id,
        productName: item.product_name,
        sku: item.product_id,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        itemAmount: item.unit_price * item.quantity,
        discount: 0,
        charges: 0,
        taxes: 0,
        informationalTaxes: item.informationalTaxes || 0
      })),
      settledItemsCount: orderItems.length,
      itemSubtotal: subtotal,
      totalDiscounts: 0,
      totalCharges: 0,
      totalTaxes: 0,
      shipmentTotal: totalAmount,
      informationalTaxes: informationalTaxes
    }]
  }

  return order
}

/**
 * Create an order item from Manhattan line item data
 */
function createOrderItem(item: ManhattanLineItem, orderNumber: string, index: number): any {
  const etaDate = parseManhattanDate(item.eta)
  const etaTo = new Date(etaDate)
  etaTo.setDate(etaTo.getDate() + 1)

  return {
    id: `ITEM-${orderNumber}-${index + 1}`,
    product_id: item.sku,
    product_name: item.itemName,
    product_sku: item.sku,
    quantity: item.quantity,
    unit_price: item.price,
    total_price: item.price * item.quantity,
    product_details: {
      description: item.itemName,
      category: getCategoryFromSku(item.sku),
      brand: getBrandFromSku(item.sku)
    },
    // Manhattan OMS Enhanced Fields
    uom: item.uom,
    fulfillmentStatus: item.fulfillmentStatus,
    shippingMethod: item.shippingMethod,
    secretCode: item.secretCode,
    giftWithPurchase: item.giftWithPurchase
      ? (item.giftWithPurchaseItem || 'Yes')
      : null,
    style: item.style || '',
    color: item.color || '',
    size: item.size || '',
    bundle: item.bundle || false,
    bundleRef: item.bundleRefId || '',
    eta: {
      from: formatEtaDate(etaDate),
      to: formatEtaDate(etaTo)
    },
    priceBreakdown: {
      subtotal: item.price * item.quantity,
      discount: 0,
      charges: 0,
      amountIncludedTaxes: item.price * item.quantity,
      amountExcludedTaxes: item.price * item.quantity - (item.informationalTaxes || 0),
      taxes: 0,
      total: item.price * item.quantity
    }
  }
}

/**
 * Generate delivery methods based on Manhattan order type
 */
function generateManhattanDeliveryMethods(
  orderType: ManhattanOrderType,
  itemCount: number,
  customer: { name: string; phone: string; email?: string },
  store: typeof centralStores[0]
): DeliveryMethod[] {
  const methods: DeliveryMethod[] = []

  // Generate pickup date (1-7 days from now)
  const pickupDate = new Date()
  pickupDate.setDate(pickupDate.getDate() + Math.floor(Math.random() * 7) + 1)
  const pickupDateStr = formatPickupDate(pickupDate)

  if (orderType === 'RT-CC-STD' || orderType === 'RT-CC-EXP') {
    // Click & Collect only
    methods.push({
      type: 'CLICK_COLLECT' as DeliveryMethodType,
      itemCount: itemCount,
      clickCollect: {
        storeName: store.storeName,
        storeAddress: store.addressLine1,
        storePhone: store.phone,
        recipientName: customer.name,
        phone: customer.phone,
        relNo: `REL-2026-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`,
        pickupDate: pickupDateStr,
        timeSlot: '10:00 - 18:00',
        collectionCode: `CC-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`,
        allocationType: 'Pickup'
      }
    })
  } else if (orderType === 'RT-HD-STD' || orderType === 'RT-HD-EXP' || orderType === 'MKP-HD-STD') {
    // Home Delivery only
    methods.push({
      type: 'HOME_DELIVERY' as DeliveryMethodType,
      itemCount: itemCount,
      homeDelivery: {
        recipient: customer.name,
        phone: customer.phone,
        address: store.addressLine1,
        district: store.city,
        city: store.province,
        postalCode: store.postalCode
      }
    })
  } else if (orderType === 'RT-MIX-STD') {
    // Mixed delivery
    const hdCount = Math.ceil(itemCount / 2)
    const ccCount = itemCount - hdCount

    methods.push({
      type: 'HOME_DELIVERY' as DeliveryMethodType,
      itemCount: hdCount,
      homeDelivery: {
        recipient: customer.name,
        phone: customer.phone,
        address: store.addressLine1,
        district: store.city,
        city: store.province,
        postalCode: store.postalCode
      }
    })

    methods.push({
      type: 'CLICK_COLLECT' as DeliveryMethodType,
      itemCount: ccCount,
      clickCollect: {
        storeName: store.storeName,
        storeAddress: store.addressLine1,
        storePhone: store.phone,
        recipientName: customer.name,
        phone: customer.phone,
        relNo: `REL-2026-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`,
        pickupDate: pickupDateStr,
        timeSlot: '10:00 - 18:00',
        collectionCode: `CC-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`,
        allocationType: 'Pickup'
      }
    })
  }

  return methods
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format a future date as MM/DD/YYYY
 */
function formatFutureDate(daysAhead: number): string {
  const date = new Date()
  date.setDate(date.getDate() + daysAhead)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${pad(date.getMonth() + 1)}/${pad(date.getDate())}/${date.getFullYear()}`
}

/**
 * Parse Manhattan date format (MM/DD/YYYY) to Date object
 */
function parseManhattanDate(dateStr: string): Date {
  const [month, day, year] = dateStr.split('/').map(Number)
  return new Date(year, month - 1, day)
}

/**
 * Format date for pickup display (MM/DD/YYYY)
 */
function formatPickupDate(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${pad(date.getMonth() + 1)}/${pad(date.getDate())}/${date.getFullYear()}`
}

/**
 * Format date for ETA display (DD Mon YYYY HH:MM:SS)
 */
function formatEtaDate(date: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${pad(date.getDate())} ${months[date.getMonth()]} ${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

/**
 * Get product category from SKU
 */
function getCategoryFromSku(sku: string): string {
  const product = manhattanProducts.find(p => p.sku === sku)
  return product?.category || 'General'
}

/**
 * Get product brand from SKU
 */
function getBrandFromSku(sku: string): string {
  const product = manhattanProducts.find(p => p.sku === sku)
  return product?.brand || 'Unknown'
}

// ============================================================================
// SAMPLE ORDERS GENERATION
// ============================================================================

/**
 * Generate the exact sample order from Manhattan OMNI specification
 * Order: CDS260120221340 - YSL Libre Gift Set with 3 free gifts
 */
export function generateSampleOrderCDS260120221340(): any {
  const order = generateManhattanOmniOrder({
    orderNumber: 'CDS260120221340',
    customerIndex: 0,  // TIAGO SILVA
    orderType: 'RT-CC-STD',
    paymentMethod: 'BANK TRANSFER',
    orderStatus: 'FULFILLED',
    includeGiftItems: true,
    storeIndex: 0,  // CENTRAL CHIDLOM
    orderDate: new Date('2026-01-20T18:40:00+07:00')
  })

  // Override specific fields to match MAO specification exactly
  // MAO spec line 42: email = "2601202853@dummy.com"
  order.customer.email = '2601202853@dummy.com'

  // MAO spec line 67: customer_reference = "2601202853"
  order.customer.custRef = '2601202853'

  // MAO spec line 190: informational_taxes = "THB 340.19"
  order.payment_info.informational_taxes = 340.19

  return order
}

/**
 * Manhattan OMNI mock orders array
 * Contains ONLY the order from the MAO specification (mock-01440766)
 * Order CDS260120221340: Gift-with-purchase order with 3 free YSL samples
 */
export const manhattanOmniMockOrders: any[] = [
  // The ONLY order from MAO specification - CDS260120221340
  generateSampleOrderCDS260120221340()
]

/**
 * Get Manhattan OMNI mock orders with optional filtering
 *
 * @param filters - Optional filters to apply
 * @returns Filtered array of Manhattan OMNI orders
 */
export function getManhattanOmniMockOrders(filters?: {
  orderType?: string
  status?: string
  channel?: string
  search?: string
}): any[] {
  let filtered = [...manhattanOmniMockOrders]

  if (filters?.orderType && filters.orderType !== 'all-order-type') {
    filtered = filtered.filter(order => order.orderType === filters.orderType)
  }

  if (filters?.status && filters.status !== 'all') {
    filtered = filtered.filter(order => order.status === filters.status)
  }

  if (filters?.channel && filters.channel !== 'all') {
    // Include OMNI orders when channel filter is 'omni' or matches selling channel
    filtered = filtered.filter(order =>
      order.channel === filters.channel ||
      order.sellingChannel?.toLowerCase() === filters.channel?.toLowerCase()
    )
  }

  if (filters?.search) {
    const searchLower = filters.search.toLowerCase()
    filtered = filtered.filter(order =>
      order.order_no.toLowerCase().includes(searchLower) ||
      order.customer.name.toLowerCase().includes(searchLower) ||
      order.items?.some((item: { product_sku?: string; product_name?: string }) =>
        item.product_sku?.toLowerCase().includes(searchLower) ||
        item.product_name?.toLowerCase().includes(searchLower)
      )
    )
  }

  return filtered
}
