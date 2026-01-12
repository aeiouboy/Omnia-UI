// Mock data service for development when external APIs are not configured
// This provides realistic sample data for all dashboard components

import { AuditActionType, AuditType, ACTION_TYPE_TO_AUDIT_TYPE } from "@/types/audit"
import { DeliveryMethod, DeliveryMethodType } from "@/types/delivery"

// Click & Collect store names
const clickCollectStores = [
  'Central Ladprao',
  'Central World',
  'Central Bangna',
  'Central Westgate',
  'Central Pinklao',
  'Tops Central Plaza Ladprao',
  'Tops Central World',
  'Tops Sukhumvit 39'
]

// Pickup time slots
const pickupTimeSlots = [
  '09:00 - 12:00',
  '12:00 - 15:00',
  '15:00 - 18:00',
  '18:00 - 21:00'
]

// Thai districts for home delivery
const thaiDistricts = [
  'Watthana',
  'Chatuchak',
  'Khlong Toei',
  'Bang Rak',
  'Phaya Thai',
  'Din Daeng',
  'Huai Khwang',
  'Bang Kapi',
  'Sathon',
  'Pathum Wan'
]

// Thai addresses for home delivery
const thaiAddressStreets = [
  '123/45 Sukhumvit Soi 39',
  '88/12 Phaholyothin Road',
  '456 Thonglor Soi 13',
  '789/1 Silom Road',
  '234/56 Ari Soi 1',
  '567/89 Ratchadaphisek Road',
  '321/7 Ekkamai Soi 5',
  '654 Sathorn Road',
  '111/22 Ladprao Soi 71',
  '999/33 Rama 9 Road'
]

/**
 * Generate a collection code in format CC-XXXXXX (6 random digits)
 */
function generateCollectionCode(): string {
  const digits = String(Math.floor(Math.random() * 1000000)).padStart(6, '0')
  return `CC-${digits}`
}

/**
 * Generate release number in format REL-YYYY-XXXXXX
 */
function generateReleaseNumber(): string {
  const year = new Date().getFullYear()
  const digits = String(Math.floor(Math.random() * 1000000)).padStart(6, '0')
  return `REL-${year}-${digits}`
}

/**
 * Generate delivery methods for an order
 * Distribution: 50% Home Delivery only, 25% Click & Collect only, 25% Mixed
 * @param itemCount Total number of items in the order
 * @param customer Customer information from the order
 * @param shippingAddress Shipping address from the order
 * @returns Array of DeliveryMethod objects
 */
function generateDeliveryMethods(
  itemCount: number,
  customer: { name: string; phone: string; email?: string },
  shippingAddress: { street: string; city: string; postal_code: string }
): DeliveryMethod[] {
  const random = Math.random()
  const deliveryMethods: DeliveryMethod[] = []

  // Generate future pickup date (1-7 days from now)
  const pickupDate = new Date()
  pickupDate.setDate(pickupDate.getDate() + Math.floor(Math.random() * 7) + 1)
  const pickupDateStr = pickupDate.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })

  // Select random store and time slot
  const storeName = clickCollectStores[Math.floor(Math.random() * clickCollectStores.length)]
  const timeSlot = pickupTimeSlots[Math.floor(Math.random() * pickupTimeSlots.length)]
  const district = thaiDistricts[Math.floor(Math.random() * thaiDistricts.length)]

  if (random < 0.5) {
    // 50% - Home Delivery only
    deliveryMethods.push({
      type: 'HOME_DELIVERY' as DeliveryMethodType,
      itemCount: itemCount,
      homeDelivery: {
        recipient: customer.name,
        phone: customer.phone,
        address: shippingAddress.street,
        district: district,
        city: shippingAddress.city,
        postalCode: shippingAddress.postal_code,
        specialInstructions: Math.random() > 0.5 ? 'Please leave at the front door' : undefined
      }
    })
  } else if (random < 0.75) {
    // 25% - Click & Collect only
    deliveryMethods.push({
      type: 'CLICK_COLLECT' as DeliveryMethodType,
      itemCount: itemCount,
      clickCollect: {
        storeName: storeName,
        storeAddress: `Floor ${Math.floor(Math.random() * 5) + 1}, ${storeName}, Bangkok`,
        storePhone: `02-${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        recipientName: customer.name,
        phone: customer.phone,
        relNo: generateReleaseNumber(),
        pickupDate: pickupDateStr,
        timeSlot: timeSlot,
        collectionCode: generateCollectionCode(),
        allocationType: 'Pickup'
      }
    })
  } else {
    // 25% - Mixed (both methods)
    // Split items between methods (ensure at least 1 item per method)
    const homeDeliveryCount = Math.max(1, Math.floor(Math.random() * (itemCount - 1)) + 1)
    const clickCollectCount = itemCount - homeDeliveryCount

    deliveryMethods.push({
      type: 'HOME_DELIVERY' as DeliveryMethodType,
      itemCount: homeDeliveryCount,
      homeDelivery: {
        recipient: customer.name,
        phone: customer.phone,
        address: shippingAddress.street,
        district: district,
        city: shippingAddress.city,
        postalCode: shippingAddress.postal_code,
        specialInstructions: Math.random() > 0.7 ? 'Ring doorbell twice' : undefined
      }
    })

    deliveryMethods.push({
      type: 'CLICK_COLLECT' as DeliveryMethodType,
      itemCount: clickCollectCount,
      clickCollect: {
        storeName: storeName,
        storeAddress: `Floor ${Math.floor(Math.random() * 5) + 1}, ${storeName}, Bangkok`,
        storePhone: `02-${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        recipientName: customer.name,
        phone: customer.phone,
        relNo: generateReleaseNumber(),
        pickupDate: pickupDateStr,
        timeSlot: timeSlot,
        collectionCode: generateCollectionCode(),
        allocationType: 'Pickup'
      }
    })
  }

  return deliveryMethods
}

// Mock API Orders with realistic data for Tops stores
export const mockApiOrders: any[] = Array.from({ length: 150 }, (_, i) => {
  const id = `ORD-${String(i + 1).padStart(4, "0")}`
  const topsStores = [
    "Tops Central Plaza ลาดพร้าว",
    "Tops Central World",
    "Tops สุขุมวิท 39",
    "Tops ทองหล่อ",
    "Tops สีลม คอมเพล็กซ์",
    "Tops เอกมัย",
    "Tops พร้อมพงษ์",
    "Tops จตุจักร"
  ]

  const statuses = ["SUBMITTED", "PROCESSING", "READY_FOR_PICKUP", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"]
  const channels = ["GrabMart", "LINE MAN", "FoodDelivery", "Tops Online", "ShopeeFood"]
  const priorities = ["LOW", "NORMAL", "HIGH", "URGENT"]
  const foodCategories = ["Fresh Produce", "Meat & Seafood", "Dairy & Eggs", "Beverages", "Snacks & Confectionery", "Bakery", "Frozen Foods", "Pantry Staples"]
  const products = [
    { name: "Fresh Milk 1L", thaiName: "นมสด 1ลิตร", sku: "DAIRY-001", category: "Dairy & Eggs", price: 45 },
    { name: "Chicken Breast 500g", thaiName: "อกไก่ 500กรัม", sku: "MEAT-001", category: "Meat & Seafood", price: 120 },
    { name: "Jasmine Rice 5kg", thaiName: "ข้าวหอมมะลิ 5กิโลกรัม", sku: "PANTRY-001", category: "Pantry Staples", price: 180 },
    { name: "Green Apples", thaiName: "แอปเปิ้ลเขียว", sku: "PRODUCE-001", category: "Fresh Produce", price: 80 },
    { name: "Coca Cola 1.5L", thaiName: "โค้ก 1.5ลิตร", sku: "BEV-001", category: "Beverages", price: 35 },
    { name: "Chocolate Cookies", thaiName: "คุกกี้ช็อกโกแลต", sku: "SNACK-001", category: "Snacks & Confectionery", price: 65 },
    { name: "Whole Wheat Bread", thaiName: "ขนมปังโฮลวีท", sku: "BAKERY-001", category: "Bakery", price: 40 },
    { name: "Frozen Pizza", thaiName: "พิซซ่าแช่แข็ง", sku: "FROZEN-001", category: "Frozen Foods", price: 180 },
    { name: "Organic Eggs 10pcs", thaiName: "ไข่ออร์แกนิค 10ฟอง", sku: "DAIRY-002", category: "Dairy & Eggs", price: 95 },
    { name: "Fresh Salmon 300g", thaiName: "ปลาแซลมอนสด 300กรัม", sku: "MEAT-002", category: "Meat & Seafood", price: 250 },
    { name: "Potato Chips", thaiName: "มันฝรั่งทอด", sku: "SNACK-002", category: "Snacks & Confectionery", price: 45 },
    { name: "Orange Juice 1L", thaiName: "น้ำส้ม 1ลิตร", sku: "BEV-002", category: "Beverages", price: 55 },
    { name: "Bananas 1kg", thaiName: "กล้วย 1กิโลกรัม", sku: "PRODUCE-002", category: "Fresh Produce", price: 35 },
    { name: "Croissant 6pcs", thaiName: "ครัวซองต์ 6ชิ้น", sku: "BAKERY-002", category: "Bakery", price: 120 },
    { name: "Ice Cream Vanilla", thaiName: "ไอศกรีมวานิลลา", sku: "FROZEN-002", category: "Frozen Foods", price: 150 }
  ]

  const status = statuses[Math.floor(Math.random() * statuses.length)]
  const elapsedMinutes = Math.floor(Math.random() * 600)
  const targetMinutes = Math.floor(Math.random() * 300) + 180 // 3-8 minutes
  const isBreach = elapsedMinutes > targetMinutes
  const isNearBreach = !isBreach && (targetMinutes - elapsedMinutes) <= (targetMinutes * 0.2)

  const createdDate = new Date()
  createdDate.setMinutes(createdDate.getMinutes() - elapsedMinutes)

  // Generate random order date within last 7 days
  const randomDaysAgo = Math.floor(Math.random() * 7)
  const orderDate = new Date()
  orderDate.setDate(orderDate.getDate() - randomDaysAgo)
  orderDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), 0, 0)

  // Generate customer and shipping address data first
  const itemCount = Math.floor(Math.random() * 5) + 1

  const customerData = {
    id: `CUST-${Math.floor(Math.random() * 10000)}`,
    name: `Customer ${i + 1}`,
    email: `customer${i + 1}@example.com`,
    phone: `+66${Math.floor(Math.random() * 900000000) + 100000000}`,
    T1Number: `T1${Math.floor(Math.random() * 10000000)}`,
    customerType: "",  // Will be set later
    custRef: `CREF-${Math.floor(Math.random() * 90000) + 10000}`
  }

  const shippingAddressData = {
    street: `${Math.floor(Math.random() * 999) + 1} Sukhumvit Road`,
    city: "Bangkok",
    state: "Bangkok",
    postal_code: `${Math.floor(Math.random() * 90000) + 10000}`,
    country: "Thailand"
  }

  // Generate delivery methods BEFORE order items so we know the delivery type
  const deliveryMethods = generateDeliveryMethods(
    itemCount,
    { name: customerData.name, phone: customerData.phone, email: customerData.email },
    { street: shippingAddressData.street, city: shippingAddressData.city, postal_code: shippingAddressData.postal_code }
  )

  // Manhattan OMS field options
  const uomOptions = ['PACK', 'SCAN', 'SBOX', 'EA', 'KG', 'PCS', 'BOX', 'BTL']
  const fulfillmentStatusOptions: ('Picked' | 'Pending' | 'Shipped' | 'Packed')[] = ['Picked', 'Pending', 'Shipped', 'Packed']
  // Updated shipping methods for Click & Collect and Home Delivery scenarios
  const clickCollectShippingOptions = ['Standard Pickup', '1H Delivery']
  const homeDeliveryShippingOptions = ['Standard Delivery', '3H Delivery', 'Next Day', 'Express']
  const promotionTypes = ['Discount', 'Product Discount Promotion', 'Bundle Discount', 'Member Discount']
  const giftMessages = ['Happy Birthday!', 'Congratulations!', 'Best Wishes!', 'With Love', 'Thank You!']

  // Determine shipping method options based on delivery methods
  const hasHomeDelivery = deliveryMethods.some(dm => dm.type === 'HOME_DELIVERY')
  const hasClickCollect = deliveryMethods.some(dm => dm.type === 'CLICK_COLLECT')
  const homeDeliveryItemCount = deliveryMethods.find(dm => dm.type === 'HOME_DELIVERY')?.itemCount || 0

  const orderItems = Array.from({ length: itemCount }, (_, j) => {
    const product = products[Math.floor(Math.random() * products.length)]
    const quantity = Math.floor(Math.random() * 3) + 1
    const unit_price = product.price
    const total_price = unit_price * quantity

    // Generate Manhattan OMS enhanced fields
    const uom = uomOptions[Math.floor(Math.random() * uomOptions.length)]
    const packedOrderedQty = quantity
    const location = `CFM${Math.floor(Math.random() * 9000 + 1000)}`
    const barcode = String(Math.floor(Math.random() * 9000000000000) + 1000000000000)
    const giftWrapped = Math.random() < 0.15  // 15% chance
    const giftWrappedMessage = giftWrapped ? giftMessages[Math.floor(Math.random() * giftMessages.length)] : undefined
    const supplyTypeId: 'On Hand Available' | 'Pre-Order' = Math.random() < 0.8 ? 'On Hand Available' : 'Pre-Order'
    const substitution = Math.random() < 0.1  // 10% chance
    const fulfillmentStatus = fulfillmentStatusOptions[Math.floor(Math.random() * fulfillmentStatusOptions.length)]

    // Determine shipping method based on delivery methods and item index
    let shippingMethod: string
    if (hasHomeDelivery && hasClickCollect) {
      // Mixed delivery: first N items are home delivery, rest are click & collect
      if (j < homeDeliveryItemCount) {
        shippingMethod = homeDeliveryShippingOptions[Math.floor(Math.random() * homeDeliveryShippingOptions.length)]
      } else {
        shippingMethod = clickCollectShippingOptions[Math.floor(Math.random() * clickCollectShippingOptions.length)]
      }
    } else if (hasClickCollect) {
      // Click & Collect only
      shippingMethod = clickCollectShippingOptions[Math.floor(Math.random() * clickCollectShippingOptions.length)]
    } else {
      // Home Delivery only
      shippingMethod = homeDeliveryShippingOptions[Math.floor(Math.random() * homeDeliveryShippingOptions.length)]
    }

    const bundle = Math.random() < 0.05  // 5% chance
    const bundleRef = bundle ? `BDL-${Math.floor(Math.random() * 10000)}` : undefined

    // Generate ETA (1-7 days from now)
    const etaFrom = new Date()
    etaFrom.setDate(etaFrom.getDate() + Math.floor(Math.random() * 3) + 1)
    const etaTo = new Date(etaFrom)
    etaTo.setDate(etaTo.getDate() + Math.floor(Math.random() * 4) + 1)
    const formatEtaDate = (d: Date) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      return `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
    }

    // Generate promotions (0-2 random promotions)
    const promotionCount = Math.floor(Math.random() * 3)  // 0, 1, or 2
    const promotions = promotionCount > 0 ? Array.from({ length: promotionCount }, (_, k) => ({
      discountAmount: -Math.round(Math.random() * 50 * 100) / 100,  // -0.01 to -50.00
      promotionId: `PROMO-${Math.floor(Math.random() * 100000)}`,
      promotionType: promotionTypes[Math.floor(Math.random() * promotionTypes.length)],
      secretCode: Math.random() < 0.3 ? `CODE${Math.floor(Math.random() * 1000)}` : undefined
    })) : undefined

    // Calculate price breakdown
    const itemSubtotal = total_price
    const itemDiscount = promotions ? promotions.reduce((sum, p) => sum + Math.abs(p.discountAmount), 0) : 0
    const itemCharges = Math.round(Math.random() * 10 * 100) / 100  // 0-10 baht charges
    const itemAmountExcludedTaxes = itemSubtotal - itemDiscount + itemCharges
    const itemTaxes = Math.round(itemAmountExcludedTaxes * 0.07 * 100) / 100  // 7% VAT
    const itemAmountIncludedTaxes = itemAmountExcludedTaxes + itemTaxes

    const giftWithPurchase = Math.random() < 0.1 ? 'Free Sample Gift' : null

    return {
      id: `ITEM-${id}-${j + 1}`,
      product_id: product.sku,
      product_name: product.name,
      thaiName: product.thaiName,
      product_sku: product.sku,
      quantity,
      unit_price,
      total_price,
      product_details: {
        description: `High quality ${product.name.toLowerCase()}`,
        category: product.category,
        brand: "Tops Quality"
      },
      // Manhattan OMS Enhanced Fields
      uom,
      packedOrderedQty,
      location,
      barcode,
      giftWrapped,
      giftWrappedMessage,
      supplyTypeId,
      substitution,
      fulfillmentStatus,
      shippingMethod,
      bundle,
      bundleRef,
      eta: {
        from: formatEtaDate(etaFrom),
        to: formatEtaDate(etaTo)
      },
      promotions,
      giftWithPurchase,
      priceBreakdown: {
        subtotal: itemSubtotal,
        discount: itemDiscount,
        charges: itemCharges,
        amountIncludedTaxes: itemAmountIncludedTaxes,
        amountExcludedTaxes: itemAmountExcludedTaxes,
        taxes: itemTaxes,
        total: itemAmountIncludedTaxes
      }
    }
  })

  const total_amount = orderItems.reduce((sum, item) => sum + item.total_price, 0)

  // Calculate payment breakdown
  const subtotal = total_amount
  const discountPercent = Math.random() * 0.15 // 0-15% discount
  const discounts = Math.round(subtotal * discountPercent * 100) / 100
  const charges = Math.round(Math.random() * 100 * 100) / 100 // 0-100 baht charges
  const amountExcludedTaxes = subtotal - discounts + charges
  const taxes = Math.round(amountExcludedTaxes * 0.07 * 100) / 100 // 7% VAT
  const amountIncludedTaxes = amountExcludedTaxes + taxes

  // Customer and order metadata
  const customerTypes = ['Guest', 'Tier 1 Login', 'Tops Prime', 'General', 'cluster_1', 'cluster_2', 'cluster_3', 'Tops Prime Plus']
  const customerType = customerTypes[Math.floor(Math.random() * customerTypes.length)]
  const channel = channels[Math.floor(Math.random() * channels.length)]
  const fullTaxInvoice = Math.random() > 0.5
  const allowSubstitution = Math.random() > 0.5
  const selectedStore = topsStores[Math.floor(Math.random() * topsStores.length)]
  const storeNo = `STR-${Math.floor(Math.random() * 9000) + 1000}`

  // Update customer type that was set earlier
  customerData.customerType = customerType

  return {
    id,
    order_no: id,
    customer: customerData,
    items: orderItems,
    status,
    channel,
    business_unit: "Retail",
    order_type: Math.random() > 0.5 ? "DELIVERY" : "PICKUP",
    total_amount: amountIncludedTaxes,
    order_date: orderDate.toISOString(),
    shipping_address: shippingAddressData,
    payment_info: {
      method: ["CREDIT_CARD", "CASH", "WALLET", "QR_CODE"][Math.floor(Math.random() * 4)],
      status: ["PAID", "PENDING", "FAILED"][Math.floor(Math.random() * 3)],
      transaction_id: `TXN-${Math.floor(Math.random() * 1000000)}`,
      subtotal,
      discounts,
      charges,
      amountIncludedTaxes,
      amountExcludedTaxes,
      taxes
    },
    metadata: {
      created_at: createdDate.toISOString(),
      updated_at: new Date().toISOString(),
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      store_name: selectedStore,
      store_no: storeNo,
      order_created: createdDate.toISOString()
    },
    sla_info: {
      target_minutes: targetMinutes,
      elapsed_minutes: elapsedMinutes,
      status: isBreach ? "BREACH" : isNearBreach ? "NEAR_BREACH" : "COMPLIANT"
    },
    on_hold: Math.random() > 0.9,
    fullTaxInvoice,
    customerTypeId: `CT-${customerType.substring(0, 3)}`,
    sellingChannel: channel,
    allowSubstitution,
    taxId: fullTaxInvoice ? `${Math.floor(Math.random() * 9000000000000) + 1000000000000}` : undefined,
    companyName: customerType === "CORPORATE" ? `Company ${Math.floor(Math.random() * 100) + 1} Co., Ltd.` : undefined,
    branchNo: customerType === "CORPORATE" ? `BR-${Math.floor(Math.random() * 900) + 100}` : undefined,
    deliveryMethods
  }
})

// Force ORD-0100 to always have mixed delivery for testing
const mixedDeliveryOrder = mockApiOrders.find(o => o.id === 'ORD-0100')
if (mixedDeliveryOrder) {
  mixedDeliveryOrder.deliveryMethods = [
    {
      type: 'HOME_DELIVERY' as const,
      itemCount: 2,
      homeDelivery: {
        recipient: mixedDeliveryOrder.customer.name,
        phone: mixedDeliveryOrder.customer.phone,
        address: '123 Test Street',
        district: 'Watthana',
        city: 'Bangkok',
        postalCode: '10110',
        specialInstructions: 'Test mixed delivery - Home Delivery items'
      }
    },
    {
      type: 'CLICK_COLLECT' as const,
      itemCount: 2,
      clickCollect: {
        storeName: 'Central Bangna',
        storeAddress: 'Floor 2, Central Bangna, Bangkok',
        storePhone: '02-123-4567',
        recipientName: mixedDeliveryOrder.customer.name,
        phone: mixedDeliveryOrder.customer.phone,
        pickupDate: '15/01/2026',
        timeSlot: '10:00-12:00',
        collectionCode: 'CC-TEST-100',
        relNo: 'REL-2026-TEST100',
        allocationType: 'Pickup'
      }
    }
  ]

  // Update items to match delivery methods - ensure 4 items total with correct shipping methods
  const homeDeliveryShippingOptions = ['Standard Delivery', '3H Delivery', 'Next Day', 'Express']
  const clickCollectShippingOptions = ['Standard Pickup', '1H Delivery']

  // Ensure we have at least 4 items, pad if necessary
  while (mixedDeliveryOrder.items.length < 4) {
    const lastItem = mixedDeliveryOrder.items[mixedDeliveryOrder.items.length - 1]
    mixedDeliveryOrder.items.push({ ...lastItem, id: `ITEM-ORD-0100-${mixedDeliveryOrder.items.length + 1}` })
  }

  // Update shipping methods for first 2 items (Home Delivery)
  mixedDeliveryOrder.items.slice(0, 2).forEach((item: any) => {
    item.shippingMethod = homeDeliveryShippingOptions[Math.floor(Math.random() * homeDeliveryShippingOptions.length)]
  })

  // Update shipping methods for remaining items (Click & Collect)
  mixedDeliveryOrder.items.slice(2).forEach((item: any) => {
    item.shippingMethod = clickCollectShippingOptions[Math.floor(Math.random() * clickCollectShippingOptions.length)]
  })
}

// Mock Executive KPIs
export const mockExecutiveKPIs: any = {
  totalOrders: 1247,
  urgentOrders: 23,
  nearBreachOrders: 45,
  onTimeDeliveryRate: 94.2,
  averageFulfillmentTime: 12.5,
  slaComplianceRate: 91.8,
  activeOrders: 156,
  completedOrders: 1091,
  revenue: 2847500,
  breachCount: 89,
  approachingDeadlineCount: 45,
  submittedCount: 1247,
  onHoldCount: 18,
  lastUpdated: new Date().toISOString()
}

// Mock Order Metrics
export const mockOrderMetrics: any = {
  totalOrders: 1247,
  urgentOrders: 23,
  processingOrders: 89,
  completedOrders: 1091,
  cancelledOrders: 44,
  averageProcessingTime: 12.5,
  onTimeDeliveryRate: 94.2,
  slaComplianceRate: 91.8,
  breachCount: 89,
  approachingDeadlineCount: 45,
  submittedCount: 1247,
  onHoldCount: 18,
  ordersByChannel: {
    ONLINE: 523,
    OFFLINE: 312,
    MOBILE_APP: 289,
    WEBSITE: 123
  },
  ordersByStatus: {
    SUBMITTED: 234,
    PROCESSING: 189,
    READY_FOR_PICKUP: 145,
    OUT_FOR_DELIVERY: 178,
    DELIVERED: 1091,
    CANCELLED: 44
  },
  ordersByHour: Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    count: Math.floor(Math.random() * 100) + 10
  })),
  lastUpdated: new Date().toISOString()
}

// Mock Performance Metrics
export const mockPerformanceMetrics: any = {
  fulfillmentByStore: [
    { storeName: "Tops Central World", fulfilled: 234, total: 250, percentage: 93.6 },
    { storeName: "Tops สุขุมวิท 39", fulfilled: 189, total: 200, percentage: 94.5 },
    { storeName: "Tops ทองหล่อ", fulfilled: 156, total: 175, percentage: 89.1 },
    { storeName: "Tops สีลม คอมเพล็กซ์", fulfilled: 145, total: 160, percentage: 90.6 },
    { storeName: "Tops เอกมัย", fulfilled: 134, total: 145, percentage: 92.4 },
    { storeName: "Tops พร้อมพงษ์", fulfilled: 123, total: 135, percentage: 91.1 },
    { storeName: "Tops จตุจักร", fulfilled: 112, total: 125, percentage: 89.6 },
    { storeName: "Tops Central Plaza ลาดพร้าว", fulfilled: 98, total: 110, percentage: 89.1 }
  ],
  slaByDay: Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return {
      date: date.toISOString().split('T')[0],
      compliant: Math.floor(Math.random() * 100) + 50,
      breach: Math.floor(Math.random() * 30) + 10,
      nearBreach: Math.floor(Math.random() * 20) + 5
    }
  }),
  channelPerformance: [
    { channel: "ONLINE", orders: 523, avgTime: 11.2, onTimeRate: 95.1 },
    { channel: "OFFLINE", orders: 312, avgTime: 10.8, onTimeRate: 96.3 },
    { channel: "MOBILE_APP", orders: 289, avgTime: 13.1, onTimeRate: 92.7 },
    { channel: "WEBSITE", orders: 123, avgTime: 14.5, onTimeRate: 90.2 }
  ],
  lastUpdated: new Date().toISOString()
}

// Mock Recent Orders
export const mockRecentOrders = mockApiOrders
  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  .slice(0, 10)

// Mock Alerts
export const mockAlerts = [
  {
    id: "alert-1",
    type: "SLA_BREACH",
    message: "Order ORD-0156 has exceeded SLA target time",
    orderId: "ORD-0156",
    severity: "HIGH" as const,
    timestamp: "2025-11-23T10:30:00Z",
    acknowledged: false,
    storeName: "Tops Central World"
  },
  {
    id: "alert-2",
    type: "SLA_APPROACHING",
    message: "Order ORD-0157 is approaching SLA breach threshold",
    orderId: "ORD-0157",
    severity: "MEDIUM" as const,
    timestamp: "2025-11-23T11:15:00Z",
    acknowledged: false,
    storeName: "Tops สุขุมวิท 39"
  },
  {
    id: "alert-3",
    type: "HIGH_VOLUME",
    message: "Unusual order volume detected at Tops ทองหล่อ",
    orderId: undefined,
    severity: "MEDIUM" as const,
    timestamp: "2025-11-23T12:00:00Z",
    acknowledged: true,
    storeName: "Tops ทองหล่อ"
  },
  {
    id: "alert-4",
    type: "PAYMENT_FAILED",
    message: "Payment processing failure for Order ORD-0158",
    orderId: "ORD-0158",
    severity: "LOW" as const,
    timestamp: "2025-11-23T12:30:00Z",
    acknowledged: true,
    storeName: "Tops เอกมัย"
  }
]

// Mock Analytics Data
export const mockAnalyticsData = {
  orderTrends: Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    return {
      date: date.toISOString().split('T')[0],
      orders: Math.floor(Math.random() * 150) + 50,
      revenue: Math.floor(Math.random() * 500000) + 100000,
      avgTime: Math.floor(Math.random() * 10) + 8,
      slaCompliance: Math.floor(Math.random() * 15) + 85
    }
  }),
  peakHours: Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    orders: Math.floor(Math.random() * 80) + 20,
    avgTime: Math.floor(Math.random() * 5) + 10
  })),
  storeComparison: [
    {
      storeName: "Tops Central World",
      totalOrders: 234,
      avgFulfillmentTime: 11.2,
      slaCompliance: 94.5,
      revenue: 587500
    },
    {
      storeName: "Tops สุขุมวิท 39",
      totalOrders: 189,
      avgFulfillmentTime: 10.8,
      slaCompliance: 96.3,
      revenue: 472500
    },
    {
      storeName: "Tops ทองหล่อ",
      totalOrders: 156,
      avgFulfillmentTime: 13.1,
      slaCompliance: 89.1,
      revenue: 390000
    },
    {
      storeName: "Tops สีลม คอมเพล็กซ์",
      totalOrders: 145,
      avgFulfillmentTime: 12.5,
      slaCompliance: 90.6,
      revenue: 362500
    }
  ],
  channelEfficiency: [
    { channel: "ONLINE", efficiency: 0.951, orderCount: 523, avgTime: 11.2 },
    { channel: "OFFLINE", efficiency: 0.963, orderCount: 312, avgTime: 10.8 },
    { channel: "MOBILE_APP", efficiency: 0.927, orderCount: 289, avgTime: 13.1 },
    { channel: "WEBSITE", efficiency: 0.902, orderCount: 123, avgTime: 14.5 }
  ]
}

// Helper function to get mock orders with filters
export function getMockOrders(filters: {
  status?: string
  channel?: string
  businessUnit?: string
  search?: string
  page?: number
  pageSize?: number
  dateFrom?: string
  dateTo?: string
  // New filter parameters
  storeNo?: string
  paymentStatus?: string
  paymentMethod?: string
  orderType?: string
  itemName?: string
  customerName?: string
  email?: string
  phone?: string
  itemStatus?: string
}) {
  let filtered = [...mockApiOrders]

  // Apply filters
  if (filters.status && filters.status !== "all") {
    filtered = filtered.filter(order => order.status === filters.status)
  }

  if (filters.channel && filters.channel !== "all") {
    filtered = filtered.filter(order => order.channel === filters.channel)
  }

  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    filtered = filtered.filter(order =>
      order.order_no.toLowerCase().includes(searchLower) ||
      order.customer.name.toLowerCase().includes(searchLower) ||
      order.customer.email.toLowerCase().includes(searchLower) ||
      order.items?.some((item: { product_sku?: string }) =>
        item.product_sku?.toLowerCase().includes(searchLower)
      )
    )
  }

  if (filters.dateFrom || filters.dateTo) {
    filtered = filtered.filter(order => {
      const orderDate = new Date(order.order_date).toISOString().split('T')[0]
      if (filters.dateFrom && orderDate < filters.dateFrom) return false
      if (filters.dateTo && orderDate > filters.dateTo) return false
      return true
    })
  }

  // Store No filter
  if (filters.storeNo) {
    filtered = filtered.filter(order =>
      order.metadata?.store_no?.toUpperCase() === filters.storeNo?.toUpperCase()
    )
  }

  // Payment Status filter
  if (filters.paymentStatus && filters.paymentStatus !== "all-payment") {
    filtered = filtered.filter(order =>
      order.payment_info?.status?.toUpperCase() === filters.paymentStatus?.toUpperCase()
    )
  }

  // Payment Method filter
  if (filters.paymentMethod && filters.paymentMethod !== "all-payment-method") {
    filtered = filtered.filter(order =>
      order.payment_info?.method?.toUpperCase() === filters.paymentMethod?.toUpperCase()
    )
  }

  // Order Type filter
  if (filters.orderType && filters.orderType !== "all-order-type") {
    filtered = filtered.filter(order =>
      order.order_type?.toUpperCase() === filters.orderType?.toUpperCase()
    )
  }

  // Item Name filter
  if (filters.itemName) {
    const itemNameLower = filters.itemName.toLowerCase()
    filtered = filtered.filter(order =>
      order.items?.some((item: { product_name?: string }) =>
        item.product_name?.toLowerCase().includes(itemNameLower)
      )
    )
  }

  // Customer Name filter
  if (filters.customerName) {
    const customerNameLower = filters.customerName.toLowerCase()
    filtered = filtered.filter(order =>
      order.customer?.name?.toLowerCase().includes(customerNameLower)
    )
  }

  // Email filter
  if (filters.email) {
    const emailLower = filters.email.toLowerCase()
    filtered = filtered.filter(order =>
      order.customer?.email?.toLowerCase().includes(emailLower)
    )
  }

  // Phone filter
  if (filters.phone) {
    filtered = filtered.filter(order =>
      order.customer?.phone?.includes(filters.phone!)
    )
  }

  // Item Status filter
  if (filters.itemStatus && filters.itemStatus !== "all-item-status") {
    filtered = filtered.filter(order =>
      order.items?.some((item: { fulfillmentStatus?: string }) =>
        item.fulfillmentStatus?.toUpperCase() === filters.itemStatus?.toUpperCase()
      )
    )
  }

  // Pagination
  const page = filters.page || 1
  const pageSize = filters.pageSize || 25
  const start = (page - 1) * pageSize
  const paginated = filtered.slice(start, start + pageSize)

  return {
    data: paginated,
    pagination: {
      page,
      pageSize,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / pageSize),
      hasNext: page < Math.ceil(filtered.length / pageSize),
      hasPrev: page > 1
    }
  }
}

// Helper function to get mock order counts
export function getMockOrderCounts() {
  const now = new Date()
  const today = now.toISOString().split('T')[0]

  return {
    date: today,
    urgentOrders: 23,
    nearBreachOrders: 45,
    readyToProcessOrders: 156,
    onHoldOrders: 18,
    totalOrders: 1247,
    lastUpdated: now.toISOString()
  }
}

/**
 * Generate mock escalation records for development and testing
 * @param count Number of escalation records to generate (default: 50)
 * @returns Array of mock escalation records matching database schema
 */
export function generateMockEscalations(count: number = 50) {
  const alertTypes = [
    "SLA_BREACH",
    "SLA_APPROACHING",
    "HIGH_VOLUME",
    "PAYMENT_FAILED",
    "DELIVERY_DELAYED",
    "INVENTORY_LOW",
    "SYSTEM_ERROR"
  ]

  const severities: ("HIGH" | "MEDIUM" | "LOW")[] = ["HIGH", "MEDIUM", "LOW"]
  const statuses: ("PENDING" | "SENT" | "FAILED" | "RESOLVED")[] = ["PENDING", "SENT", "FAILED", "RESOLVED"]

  const escalatedToOptions = [
    "operations-team@central.co.th",
    "store-managers@central.co.th",
    "it-support@central.co.th",
    "customer-service@central.co.th",
    "logistics@central.co.th"
  ]

  const topsStores = [
    "Tops Central Plaza ลาดพร้าว",
    "Tops Central World",
    "Tops สุขุมวิท 39",
    "Tops ทองหล่อ",
    "Tops สีลม คอมเพล็กซ์",
    "Tops เอกมัย",
    "Tops พร้อมพงษ์",
    "Tops จตุจักร"
  ]

  return Array.from({ length: count }, (_, i) => {
    const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)]
    const severity = severities[Math.floor(Math.random() * severities.length)]
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const store = topsStores[Math.floor(Math.random() * topsStores.length)]
    const orderId = `ORD-${String(Math.floor(Math.random() * 9999) + 1).padStart(4, "0")}`

    const createdDate = new Date()
    createdDate.setHours(createdDate.getHours() - Math.floor(Math.random() * 168)) // Up to 7 days ago

    const updatedDate = new Date(createdDate)
    updatedDate.setMinutes(updatedDate.getMinutes() + Math.floor(Math.random() * 120))

    let message = ""
    switch (alertType) {
      case "SLA_BREACH":
        message = `Order ${orderId} has exceeded SLA target time at ${store}`
        break
      case "SLA_APPROACHING":
        message = `Order ${orderId} is approaching SLA breach threshold at ${store}`
        break
      case "HIGH_VOLUME":
        message = `Unusual order volume detected at ${store}`
        break
      case "PAYMENT_FAILED":
        message = `Payment processing failure for Order ${orderId} at ${store}`
        break
      case "DELIVERY_DELAYED":
        message = `Delivery delay detected for Order ${orderId} at ${store}`
        break
      case "INVENTORY_LOW":
        message = `Low inventory alert at ${store}`
        break
      case "SYSTEM_ERROR":
        message = `System error encountered processing Order ${orderId}`
        break
      default:
        message = `Alert for Order ${orderId}`
    }

    return {
      id: `ESC-${String(i + 1).padStart(5, "0")}`,
      alert_id: `ALERT-${String(i + 1).padStart(5, "0")}`,
      alert_type: alertType,
      message,
      severity,
      timestamp: createdDate.toISOString().replace("T", " ").substring(0, 19),
      status,
      escalated_by: "system",
      escalated_to: escalatedToOptions[Math.floor(Math.random() * escalatedToOptions.length)],
      created_at: createdDate.toISOString(),
      updated_at: updatedDate.toISOString()
    }
  })
}

/**
 * Get mock escalations with filters and pagination
 * Matches the API route filter structure
 */
export function getMockEscalations(filters: {
  status?: string
  alertType?: string
  severity?: string
  escalatedTo?: string
  search?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  pageSize?: number
}) {
  let filtered = generateMockEscalations(100) // Generate larger dataset for filtering

  // Apply filters
  if (filters.status && filters.status !== "all") {
    filtered = filtered.filter(esc => esc.status === filters.status?.toUpperCase())
  }

  if (filters.alertType && filters.alertType !== "all") {
    filtered = filtered.filter(esc => esc.alert_type === filters.alertType?.toUpperCase())
  }

  if (filters.severity && filters.severity !== "all") {
    filtered = filtered.filter(esc => esc.severity === filters.severity?.toUpperCase())
  }

  if (filters.escalatedTo) {
    filtered = filtered.filter(esc =>
      esc.escalated_to.toLowerCase().includes(filters.escalatedTo!.toLowerCase())
    )
  }

  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    filtered = filtered.filter(esc =>
      esc.alert_id.toLowerCase().includes(searchLower) ||
      esc.message.toLowerCase().includes(searchLower) ||
      esc.escalated_to.toLowerCase().includes(searchLower)
    )
  }

  if (filters.dateFrom || filters.dateTo) {
    filtered = filtered.filter(esc => {
      const escDate = new Date(esc.created_at!).toISOString().split('T')[0]
      if (filters.dateFrom && escDate < filters.dateFrom) return false
      if (filters.dateTo && escDate > filters.dateTo) return false
      return true
    })
  }

  // Sort by created_at descending (newest first)
  filtered.sort((a, b) =>
    new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()
  )

  // Pagination
  const page = filters.page || 1
  const pageSize = filters.pageSize || 25
  const start = (page - 1) * pageSize
  const paginated = filtered.slice(start, start + pageSize)

  return {
    data: paginated,
    pagination: {
      page,
      pageSize,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / pageSize),
      hasNext: page < Math.ceil(filtered.length / pageSize),
      hasPrev: page > 1
    }
  }
}

/**
 * Generate mock audit trail events for an order
 * Creates realistic chronological audit history from order creation to current status
 * @param orderId Order ID to generate audit trail for
 * @param orderData Optional order data to generate contextual events
 * @returns Array of AuditEvent objects sorted by timestamp (newest first)
 */
export function generateMockAuditTrail(orderId: string, orderData?: any): any[] {
  const events: any[] = []
  const now = new Date()

  // Base timestamp - order creation (random time in the past 1-7 days)
  const daysAgo = Math.floor(Math.random() * 7) + 1
  const hoursAgo = Math.floor(Math.random() * 24)
  const orderCreationTime = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000) - (hoursAgo * 60 * 60 * 1000))

  const users = [
    { id: "USR-001", name: "Somchai Prasert", type: "USER" as const },
    { id: "USR-002", name: "Naree Wongkham", type: "USER" as const },
    { id: "USR-003", name: "Prasit Somsak", type: "USER" as const },
    { id: "SYS-001", name: "System", type: "SYSTEM" as const },
    { id: "API-001", name: "GrabMart API", type: "API" as const },
    { id: "WH-001", name: "Webhook Handler", type: "WEBHOOK" as const },
  ]

  const sources: ("API" | "MANUAL" | "INTEGRATION" | "WEBHOOK" | "SYSTEM")[] = [
    "API", "MANUAL", "INTEGRATION", "WEBHOOK", "SYSTEM"
  ]

  let currentTime = new Date(orderCreationTime)
  let eventId = 1

  // Helper function to get audit type from action type
  const getAuditType = (actionType: string): AuditType => {
    return ACTION_TYPE_TO_AUDIT_TYPE[actionType as AuditActionType] || AuditType.SYSTEM
  }

  // 1. Order Created Event
  events.push({
    id: `AUDIT-${orderId}-${String(eventId++).padStart(3, "0")}`,
    orderId,
    actionType: "ORDER_CREATED",
    auditType: getAuditType("ORDER_CREATED"),
    description: `Order ${orderId} was created via ${orderData?.channel || "GrabMart"}`,
    timestamp: currentTime.toISOString(),
    source: "API",
    actor: users.find(u => u.type === "API") || users[4],
    changes: [
      { field: "status", oldValue: null, newValue: "SUBMITTED" },
      { field: "channel", oldValue: null, newValue: orderData?.channel || "GrabMart" },
      { field: "total_amount", oldValue: null, newValue: orderData?.total_amount || 450.00 },
    ],
    metadata: { channel: orderData?.channel || "GrabMart" },
  })

  // 2. Payment Confirmed Event (5-15 minutes later)
  currentTime = new Date(currentTime.getTime() + (Math.floor(Math.random() * 10) + 5) * 60 * 1000)
  events.push({
    id: `AUDIT-${orderId}-${String(eventId++).padStart(3, "0")}`,
    orderId,
    actionType: "PAYMENT_UPDATED",
    auditType: getAuditType("PAYMENT_UPDATED"),
    description: "Payment confirmed and verified",
    timestamp: currentTime.toISOString(),
    source: "INTEGRATION",
    actor: users.find(u => u.type === "SYSTEM") || users[3],
    changes: [
      { field: "payment_status", oldValue: "PENDING", newValue: "PAID" },
      { field: "transaction_id", oldValue: null, newValue: `TXN-${Math.floor(Math.random() * 1000000)}` },
    ],
  })

  // 3. Status Changed to PROCESSING (10-30 minutes after payment)
  currentTime = new Date(currentTime.getTime() + (Math.floor(Math.random() * 20) + 10) * 60 * 1000)
  const assignedUser = users[Math.floor(Math.random() * 3)]
  events.push({
    id: `AUDIT-${orderId}-${String(eventId++).padStart(3, "0")}`,
    orderId,
    actionType: "STATUS_CHANGED",
    auditType: getAuditType("STATUS_CHANGED"),
    description: `Order assigned to ${assignedUser.name} for processing`,
    timestamp: currentTime.toISOString(),
    source: "MANUAL",
    actor: assignedUser,
    changes: [
      { field: "status", oldValue: "SUBMITTED", newValue: "PROCESSING" },
      { field: "assigned_to", oldValue: null, newValue: assignedUser.name },
    ],
  })

  // 4. Random chance of item modification (30% chance)
  if (Math.random() < 0.3) {
    currentTime = new Date(currentTime.getTime() + (Math.floor(Math.random() * 15) + 5) * 60 * 1000)
    events.push({
      id: `AUDIT-${orderId}-${String(eventId++).padStart(3, "0")}`,
      orderId,
      actionType: "ITEM_MODIFIED",
      auditType: getAuditType("ITEM_MODIFIED"),
      description: "Item quantity updated due to stock availability",
      timestamp: currentTime.toISOString(),
      source: "MANUAL",
      actor: users[Math.floor(Math.random() * 3)],
      changes: [
        { field: "item_quantity", oldValue: 3, newValue: 2 },
        { field: "reason", oldValue: null, newValue: "Stock shortage" },
      ],
    })
  }

  // 5. Fulfillment Update - Picking Started
  currentTime = new Date(currentTime.getTime() + (Math.floor(Math.random() * 20) + 10) * 60 * 1000)
  events.push({
    id: `AUDIT-${orderId}-${String(eventId++).padStart(3, "0")}`,
    orderId,
    actionType: "FULFILLMENT_UPDATE",
    auditType: getAuditType("FULFILLMENT_UPDATE"),
    description: "Picking process started",
    timestamp: currentTime.toISOString(),
    source: "SYSTEM",
    actor: users.find(u => u.type === "SYSTEM") || users[3],
    changes: [
      { field: "fulfillment_stage", oldValue: "pending", newValue: "picking" },
    ],
  })

  // 6. Fulfillment Update - Picking Completed
  currentTime = new Date(currentTime.getTime() + (Math.floor(Math.random() * 15) + 10) * 60 * 1000)
  events.push({
    id: `AUDIT-${orderId}-${String(eventId++).padStart(3, "0")}`,
    orderId,
    actionType: "FULFILLMENT_UPDATE",
    auditType: getAuditType("FULFILLMENT_UPDATE"),
    description: "All items picked and verified",
    timestamp: currentTime.toISOString(),
    source: "MANUAL",
    actor: users[Math.floor(Math.random() * 3)],
    changes: [
      { field: "fulfillment_stage", oldValue: "picking", newValue: "packing" },
      { field: "items_picked", oldValue: 0, newValue: orderData?.items?.length || 3 },
    ],
  })

  // 7. Random chance of SLA warning (40% chance)
  if (Math.random() < 0.4) {
    currentTime = new Date(currentTime.getTime() + (Math.floor(Math.random() * 10) + 5) * 60 * 1000)
    events.push({
      id: `AUDIT-${orderId}-${String(eventId++).padStart(3, "0")}`,
      orderId,
      actionType: "SYSTEM_EVENT",
      auditType: getAuditType("SYSTEM_EVENT"),
      description: "SLA warning: Order approaching target time threshold",
      timestamp: currentTime.toISOString(),
      source: "SYSTEM",
      actor: users.find(u => u.type === "SYSTEM") || users[3],
      changes: [
        { field: "sla_warning_level", oldValue: "none", newValue: "approaching" },
      ],
    })
  }

  // 8. Random chance of SLA breach (20% chance)
  if (Math.random() < 0.2) {
    currentTime = new Date(currentTime.getTime() + (Math.floor(Math.random() * 30) + 15) * 60 * 1000)
    events.push({
      id: `AUDIT-${orderId}-${String(eventId++).padStart(3, "0")}`,
      orderId,
      actionType: "SLA_BREACH",
      auditType: getAuditType("SLA_BREACH"),
      description: "SLA breach detected: Order exceeded target processing time",
      timestamp: currentTime.toISOString(),
      source: "SYSTEM",
      actor: users.find(u => u.type === "SYSTEM") || users[3],
      changes: [
        { field: "sla_status", oldValue: "compliant", newValue: "breach" },
        { field: "breach_minutes", oldValue: null, newValue: Math.floor(Math.random() * 30) + 5 },
      ],
    })

    // 9. Escalation after SLA breach (70% chance if breach occurred)
    if (Math.random() < 0.7) {
      currentTime = new Date(currentTime.getTime() + (Math.floor(Math.random() * 5) + 2) * 60 * 1000)
      events.push({
        id: `AUDIT-${orderId}-${String(eventId++).padStart(3, "0")}`,
        orderId,
        actionType: "ESCALATED",
        auditType: getAuditType("ESCALATED"),
        description: "Order escalated to supervisor due to SLA breach",
        timestamp: currentTime.toISOString(),
        source: "SYSTEM",
        actor: users.find(u => u.type === "SYSTEM") || users[3],
        changes: [
          { field: "escalation_level", oldValue: 0, newValue: 1 },
          { field: "escalated_to", oldValue: null, newValue: "operations-supervisor@central.co.th" },
        ],
      })
    }
  }

  // 10. Status Changed to READY_FOR_PICKUP
  currentTime = new Date(currentTime.getTime() + (Math.floor(Math.random() * 20) + 10) * 60 * 1000)
  events.push({
    id: `AUDIT-${orderId}-${String(eventId++).padStart(3, "0")}`,
    orderId,
    actionType: "STATUS_CHANGED",
    auditType: getAuditType("STATUS_CHANGED"),
    description: "Order packed and ready for pickup/delivery",
    timestamp: currentTime.toISOString(),
    source: "MANUAL",
    actor: users[Math.floor(Math.random() * 3)],
    changes: [
      { field: "status", oldValue: "PROCESSING", newValue: "READY_FOR_PICKUP" },
    ],
  })

  // 11. Random chance of note being added (50% chance)
  if (Math.random() < 0.5) {
    currentTime = new Date(currentTime.getTime() + (Math.floor(Math.random() * 10) + 3) * 60 * 1000)
    const noteMessages = [
      "Customer requested contactless delivery",
      "Extra care needed for fragile items",
      "Customer will pick up at service counter",
      "Verified customer identity via phone",
      "Added extra packaging for frozen items",
    ]
    events.push({
      id: `AUDIT-${orderId}-${String(eventId++).padStart(3, "0")}`,
      orderId,
      actionType: "NOTE_ADDED",
      auditType: getAuditType("NOTE_ADDED"),
      description: noteMessages[Math.floor(Math.random() * noteMessages.length)],
      timestamp: currentTime.toISOString(),
      source: "MANUAL",
      actor: users[Math.floor(Math.random() * 3)],
    })
  }

  // 12. Final status change based on probability
  const finalStatusRandom = Math.random()
  if (finalStatusRandom < 0.7) {
    // 70% chance of DELIVERED
    currentTime = new Date(currentTime.getTime() + (Math.floor(Math.random() * 60) + 30) * 60 * 1000)
    events.push({
      id: `AUDIT-${orderId}-${String(eventId++).padStart(3, "0")}`,
      orderId,
      actionType: "STATUS_CHANGED",
      auditType: getAuditType("STATUS_CHANGED"),
      description: "Order successfully delivered to customer",
      timestamp: currentTime.toISOString(),
      source: "WEBHOOK",
      actor: users.find(u => u.type === "WEBHOOK") || users[5],
      changes: [
        { field: "status", oldValue: "READY_FOR_PICKUP", newValue: "DELIVERED" },
        { field: "delivered_at", oldValue: null, newValue: currentTime.toISOString() },
      ],
    })
  } else if (finalStatusRandom < 0.85) {
    // 15% chance still OUT_FOR_DELIVERY
    currentTime = new Date(currentTime.getTime() + (Math.floor(Math.random() * 30) + 15) * 60 * 1000)
    events.push({
      id: `AUDIT-${orderId}-${String(eventId++).padStart(3, "0")}`,
      orderId,
      actionType: "STATUS_CHANGED",
      auditType: getAuditType("STATUS_CHANGED"),
      description: "Order dispatched for delivery",
      timestamp: currentTime.toISOString(),
      source: "WEBHOOK",
      actor: users.find(u => u.type === "WEBHOOK") || users[5],
      changes: [
        { field: "status", oldValue: "READY_FOR_PICKUP", newValue: "OUT_FOR_DELIVERY" },
        { field: "driver_assigned", oldValue: null, newValue: "Driver #" + Math.floor(Math.random() * 100) },
      ],
    })
  }
  // 15% chance remains at READY_FOR_PICKUP (no additional event)

  // Sort by timestamp descending (newest first)
  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

/**
 * Generate Manhattan Associates OMS style audit trail events
 * Creates realistic chronological audit history with Manhattan-style data format
 * @param orderId Order ID to generate audit trail for
 * @param orderData Optional order data to generate contextual events
 * @returns Array of ManhattanAuditEvent objects sorted by timestamp (newest first)
 */
export function generateManhattanAuditTrail(orderId: string, orderData?: any): any[] {
  const events: any[] = []
  const now = new Date()

  // Base timestamp - order creation (random time in the past 1-7 days)
  const daysAgo = Math.floor(Math.random() * 7) + 1
  const hoursAgo = Math.floor(Math.random() * 24)
  const orderCreationTime = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000) - (hoursAgo * 60 * 60 * 1000))

  // Manhattan-style users
  const updatedByOptions = [
    'apiuser4TMS',
    'system',
    'warehouse_api',
    'pos_sync',
    'fulfillment_service',
    'payment_gateway',
    'inventory_sync',
    'order_processor',
    'Somchai.P',
    'Naree.W',
    'Prasit.S',
    'Admin.User'
  ]

  // Entity names for Manhattan OMS
  const entityNames = [
    'Order',
    'QuantityDetail',
    'OrderTrackingDetail',
    'PaymentDetail',
    'ShipmentDetail',
    'FulfillmentDetail',
    'LineItem',
    'AddressDetail',
    'CustomerDetail',
    'InventoryReservation'
  ]

  // Helper function to format date as DD/MM/YYYY HH:mm ICT
  const formatManhattanDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${day}/${month}/${year} ${hours}:${minutes} ICT`
  }

  // Generate entity ID based on order ID
  const generateEntityId = (entityName: string, baseId: string, index: number): string => {
    const random = Math.floor(Math.random() * 1000000)
    switch (entityName) {
      case 'Order':
        return `RM${baseId.replace('ORD-', '')}${String(random).substring(0, 6)}`
      case 'QuantityDetail':
      case 'LineItem':
        return `${random}:${Math.floor(Math.random() * 100000)}:${8424790100108 + index}`
      case 'OrderTrackingDetail':
        return `TRK${baseId.replace('ORD-', '')}${String(random).substring(0, 4)}`
      case 'ShipmentDetail':
        return `SHP${baseId.replace('ORD-', '')}${String(random).substring(0, 4)}`
      case 'PaymentDetail':
        return `PAY${baseId.replace('ORD-', '')}${String(random).substring(0, 4)}`
      case 'FulfillmentDetail':
        return `FUL${baseId.replace('ORD-', '')}${String(random).substring(0, 4)}`
      default:
        return `${entityName.toUpperCase().substring(0, 3)}${random}`
    }
  }

  let currentTime = new Date(orderCreationTime)
  let eventId = 1

  // 1. Order Created
  const orderEntityId = generateEntityId('Order', orderId, eventId)
  events.push({
    id: `AUDIT-${orderId}-${String(eventId++).padStart(3, '0')}`,
    orderId,
    updatedBy: 'apiuser4TMS',
    updatedOn: formatManhattanDate(currentTime),
    entityName: 'Order',
    entityId: orderEntityId,
    changedParameter: 'Inserted Order',
    oldValue: null,
    newValue: null
  })

  // 2. Order Tracking Detail inserted
  currentTime = new Date(currentTime.getTime() + 1000)
  events.push({
    id: `AUDIT-${orderId}-${String(eventId++).padStart(3, '0')}`,
    orderId,
    updatedBy: 'apiuser4TMS',
    updatedOn: formatManhattanDate(currentTime),
    entityName: 'OrderTrackingDetail',
    entityId: generateEntityId('OrderTrackingDetail', orderId, eventId),
    changedParameter: 'Inserted OrderTrackingDetail',
    oldValue: null,
    newValue: null
  })

  // 3. Customer Detail
  currentTime = new Date(currentTime.getTime() + 500)
  events.push({
    id: `AUDIT-${orderId}-${String(eventId++).padStart(3, '0')}`,
    orderId,
    updatedBy: 'system',
    updatedOn: formatManhattanDate(currentTime),
    entityName: 'CustomerDetail',
    entityId: generateEntityId('CustomerDetail', orderId, eventId),
    changedParameter: 'Inserted CustomerDetail',
    oldValue: null,
    newValue: null
  })

  // 4. Line Items (2-5 items)
  const itemCount = Math.floor(Math.random() * 4) + 2
  for (let i = 0; i < itemCount; i++) {
    currentTime = new Date(currentTime.getTime() + 200)
    events.push({
      id: `AUDIT-${orderId}-${String(eventId++).padStart(3, '0')}`,
      orderId,
      updatedBy: 'apiuser4TMS',
      updatedOn: formatManhattanDate(currentTime),
      entityName: 'LineItem',
      entityId: generateEntityId('LineItem', orderId, eventId),
      changedParameter: 'Inserted LineItem',
      oldValue: null,
      newValue: null
    })

    // Quantity Detail for each line item
    currentTime = new Date(currentTime.getTime() + 100)
    events.push({
      id: `AUDIT-${orderId}-${String(eventId++).padStart(3, '0')}`,
      orderId,
      updatedBy: 'system',
      updatedOn: formatManhattanDate(currentTime),
      entityName: 'QuantityDetail',
      entityId: generateEntityId('QuantityDetail', orderId, eventId),
      changedParameter: 'Inserted QuantityDetail',
      oldValue: null,
      newValue: null
    })
  }

  // 5. Payment Detail
  currentTime = new Date(currentTime.getTime() + (Math.floor(Math.random() * 5) + 2) * 60 * 1000)
  events.push({
    id: `AUDIT-${orderId}-${String(eventId++).padStart(3, '0')}`,
    orderId,
    updatedBy: 'payment_gateway',
    updatedOn: formatManhattanDate(currentTime),
    entityName: 'PaymentDetail',
    entityId: generateEntityId('PaymentDetail', orderId, eventId),
    changedParameter: 'Inserted PaymentDetail',
    oldValue: null,
    newValue: null
  })

  // 6. Order Status Change - PROCESSING
  currentTime = new Date(currentTime.getTime() + (Math.floor(Math.random() * 10) + 5) * 60 * 1000)
  events.push({
    id: `AUDIT-${orderId}-${String(eventId++).padStart(3, '0')}`,
    orderId,
    updatedBy: 'order_processor',
    updatedOn: formatManhattanDate(currentTime),
    entityName: 'Order',
    entityId: orderEntityId,
    changedParameter: 'Changed Status from SUBMITTED to PROCESSING',
    oldValue: 'SUBMITTED',
    newValue: 'PROCESSING'
  })

  // 7. Fulfillment Detail Created
  currentTime = new Date(currentTime.getTime() + (Math.floor(Math.random() * 5) + 2) * 60 * 1000)
  const fulfillmentEntityId = generateEntityId('FulfillmentDetail', orderId, eventId)
  events.push({
    id: `AUDIT-${orderId}-${String(eventId++).padStart(3, '0')}`,
    orderId,
    updatedBy: 'fulfillment_service',
    updatedOn: formatManhattanDate(currentTime),
    entityName: 'FulfillmentDetail',
    entityId: fulfillmentEntityId,
    changedParameter: 'Inserted FulfillmentDetail',
    oldValue: null,
    newValue: null
  })

  // 8. Inventory Reservations
  currentTime = new Date(currentTime.getTime() + 1000)
  for (let i = 0; i < itemCount; i++) {
    events.push({
      id: `AUDIT-${orderId}-${String(eventId++).padStart(3, '0')}`,
      orderId,
      updatedBy: 'inventory_sync',
      updatedOn: formatManhattanDate(currentTime),
      entityName: 'InventoryReservation',
      entityId: generateEntityId('InventoryReservation', orderId, eventId),
      changedParameter: 'Inserted InventoryReservation',
      oldValue: null,
      newValue: null
    })
    currentTime = new Date(currentTime.getTime() + 100)
  }

  // 9. Random quantity updates (30% chance)
  if (Math.random() < 0.3) {
    currentTime = new Date(currentTime.getTime() + (Math.floor(Math.random() * 10) + 5) * 60 * 1000)
    const oldQty = Math.floor(Math.random() * 3) + 2
    const newQty = oldQty - 1
    events.push({
      id: `AUDIT-${orderId}-${String(eventId++).padStart(3, '0')}`,
      orderId,
      updatedBy: updatedByOptions[Math.floor(Math.random() * 4) + 8], // User names
      updatedOn: formatManhattanDate(currentTime),
      entityName: 'QuantityDetail',
      entityId: generateEntityId('QuantityDetail', orderId, eventId),
      changedParameter: `Changed Quantity from ${oldQty} to ${newQty}`,
      oldValue: String(oldQty),
      newValue: String(newQty)
    })
  }

  // 10. Fulfillment status updates
  currentTime = new Date(currentTime.getTime() + (Math.floor(Math.random() * 15) + 10) * 60 * 1000)
  events.push({
    id: `AUDIT-${orderId}-${String(eventId++).padStart(3, '0')}`,
    orderId,
    updatedBy: 'fulfillment_service',
    updatedOn: formatManhattanDate(currentTime),
    entityName: 'FulfillmentDetail',
    entityId: fulfillmentEntityId,
    changedParameter: 'Changed FulfillmentStatus from PENDING to PICKING',
    oldValue: 'PENDING',
    newValue: 'PICKING'
  })

  currentTime = new Date(currentTime.getTime() + (Math.floor(Math.random() * 10) + 5) * 60 * 1000)
  events.push({
    id: `AUDIT-${orderId}-${String(eventId++).padStart(3, '0')}`,
    orderId,
    updatedBy: 'warehouse_api',
    updatedOn: formatManhattanDate(currentTime),
    entityName: 'FulfillmentDetail',
    entityId: fulfillmentEntityId,
    changedParameter: 'Changed FulfillmentStatus from PICKING to PACKING',
    oldValue: 'PICKING',
    newValue: 'PACKING'
  })

  // 11. Shipment Detail
  currentTime = new Date(currentTime.getTime() + (Math.floor(Math.random() * 10) + 5) * 60 * 1000)
  const shipmentEntityId = generateEntityId('ShipmentDetail', orderId, eventId)
  events.push({
    id: `AUDIT-${orderId}-${String(eventId++).padStart(3, '0')}`,
    orderId,
    updatedBy: 'fulfillment_service',
    updatedOn: formatManhattanDate(currentTime),
    entityName: 'ShipmentDetail',
    entityId: shipmentEntityId,
    changedParameter: 'Inserted ShipmentDetail',
    oldValue: null,
    newValue: null
  })

  // 12. Order Status - READY_FOR_PICKUP
  currentTime = new Date(currentTime.getTime() + (Math.floor(Math.random() * 5) + 2) * 60 * 1000)
  events.push({
    id: `AUDIT-${orderId}-${String(eventId++).padStart(3, '0')}`,
    orderId,
    updatedBy: 'order_processor',
    updatedOn: formatManhattanDate(currentTime),
    entityName: 'Order',
    entityId: orderEntityId,
    changedParameter: 'Changed Status from PROCESSING to READY_FOR_PICKUP',
    oldValue: 'PROCESSING',
    newValue: 'READY_FOR_PICKUP'
  })

  // 13. Final status changes based on probability
  const finalStatusRandom = Math.random()
  if (finalStatusRandom < 0.7) {
    // Delivered
    currentTime = new Date(currentTime.getTime() + (Math.floor(Math.random() * 60) + 30) * 60 * 1000)
    events.push({
      id: `AUDIT-${orderId}-${String(eventId++).padStart(3, '0')}`,
      orderId,
      updatedBy: 'pos_sync',
      updatedOn: formatManhattanDate(currentTime),
      entityName: 'Order',
      entityId: orderEntityId,
      changedParameter: 'Changed Status from READY_FOR_PICKUP to DELIVERED',
      oldValue: 'READY_FOR_PICKUP',
      newValue: 'DELIVERED'
    })

    // Update shipment tracking
    currentTime = new Date(currentTime.getTime() + 1000)
    events.push({
      id: `AUDIT-${orderId}-${String(eventId++).padStart(3, '0')}`,
      orderId,
      updatedBy: 'pos_sync',
      updatedOn: formatManhattanDate(currentTime),
      entityName: 'ShipmentDetail',
      entityId: shipmentEntityId,
      changedParameter: 'Changed DeliveryStatus from IN_TRANSIT to DELIVERED',
      oldValue: 'IN_TRANSIT',
      newValue: 'DELIVERED'
    })
  } else if (finalStatusRandom < 0.85) {
    // Out for delivery
    currentTime = new Date(currentTime.getTime() + (Math.floor(Math.random() * 30) + 15) * 60 * 1000)
    events.push({
      id: `AUDIT-${orderId}-${String(eventId++).padStart(3, '0')}`,
      orderId,
      updatedBy: 'fulfillment_service',
      updatedOn: formatManhattanDate(currentTime),
      entityName: 'Order',
      entityId: orderEntityId,
      changedParameter: 'Changed Status from READY_FOR_PICKUP to OUT_FOR_DELIVERY',
      oldValue: 'READY_FOR_PICKUP',
      newValue: 'OUT_FOR_DELIVERY'
    })

    // Shipment tracking update
    events.push({
      id: `AUDIT-${orderId}-${String(eventId++).padStart(3, '0')}`,
      orderId,
      updatedBy: 'fulfillment_service',
      updatedOn: formatManhattanDate(currentTime),
      entityName: 'ShipmentDetail',
      entityId: shipmentEntityId,
      changedParameter: 'Changed DeliveryStatus from PENDING to IN_TRANSIT',
      oldValue: 'PENDING',
      newValue: 'IN_TRANSIT'
    })
  }

  // Sort by updatedOn timestamp descending (newest first)
  // Parse the Manhattan date format back to Date for sorting
  return events.sort((a, b) => {
    const parseDate = (dateStr: string) => {
      const [datePart, timePart] = dateStr.replace(' ICT', '').split(' ')
      const [day, month, year] = datePart.split('/')
      const [hours, minutes] = timePart.split(':')
      return new Date(Number(year), Number(month) - 1, Number(day), Number(hours), Number(minutes))
    }
    return parseDate(b.updatedOn).getTime() - parseDate(a.updatedOn).getTime()
  })
}

/**
 * Generate fulfillment timeline events for an order
 * Creates realistic progression: Picking → Packing → Packed → Ready To Ship
 * @param orderId Order ID to generate timeline for
 * @param orderData Optional order data to generate contextual events
 * @returns Array of FulfillmentStatusEvent objects sorted chronologically
 */
export function generateFulfillmentTimeline(
  orderId: string,
  orderData?: any,
  deliveryMethodType?: 'HOME_DELIVERY' | 'CLICK_COLLECT'
): any[] {
  const events: any[] = []
  const now = new Date()

  // Base timestamp - random time in the past 1-3 days
  const hoursAgo = Math.floor(Math.random() * 72) + 2
  let currentTime = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000)

  // Use delivery method prefix for unique event IDs
  const idPrefix = deliveryMethodType === 'HOME_DELIVERY' ? 'HD' :
                   deliveryMethodType === 'CLICK_COLLECT' ? 'CC' : 'FUL'
  let eventId = 1

  // Helper to format timestamp as YYYY-MM-DDTHH:mm:ss
  const formatTimestamp = (date: Date): string => {
    return date.toISOString().substring(0, 19)
  }

  // Get item count based on delivery method type or from order data
  let itemCount = orderData?.items?.length || Math.floor(Math.random() * 4) + 1

  if (deliveryMethodType && orderData?.deliveryMethods) {
    const method = orderData.deliveryMethods.find((d: any) => d.type === deliveryMethodType)
    if (method?.itemCount) {
      itemCount = method.itemCount
    }
  }

  // 1. Picking events - one per item
  for (let i = 0; i < itemCount; i++) {
    const itemSku = orderData?.items?.[i]?.product_sku || `SKU-${String(i + 1).padStart(3, '0')}`
    const itemName = orderData?.items?.[i]?.product_name || `Item ${i + 1}`

    events.push({
      id: `FUL-${idPrefix}-${orderId}-${String(eventId++).padStart(3, '0')}`,
      status: 'Picking',
      timestamp: formatTimestamp(currentTime),
      details: `${itemName} (${itemSku}) picked from location A${Math.floor(Math.random() * 50) + 1}`
    })

    // Add 2-5 minutes between picks
    currentTime = new Date(currentTime.getTime() + (Math.floor(Math.random() * 3) + 2) * 60 * 1000)
  }

  // 2. Packing event - start of packing
  currentTime = new Date(currentTime.getTime() + (Math.floor(Math.random() * 5) + 3) * 60 * 1000)
  events.push({
    id: `FUL-${idPrefix}-${orderId}-${String(eventId++).padStart(3, '0')}`,
    status: 'Packing',
    timestamp: formatTimestamp(currentTime),
    details: `Packing started - ${itemCount} item${itemCount > 1 ? 's' : ''} to pack`
  })

  // 3. Packed event - packing completed
  currentTime = new Date(currentTime.getTime() + (Math.floor(Math.random() * 10) + 5) * 60 * 1000)
  events.push({
    id: `FUL-${idPrefix}-${orderId}-${String(eventId++).padStart(3, '0')}`,
    status: 'Packed',
    timestamp: formatTimestamp(currentTime),
    details: `All items packed in ${Math.floor(Math.random() * 2) + 1} package${Math.random() > 0.5 ? 's' : ''}`
  })

  // 4. Ready To Ship event (70% chance - some orders may still be in packed status)
  const hasReadyToShip = Math.random() < 0.7
  if (hasReadyToShip) {
    currentTime = new Date(currentTime.getTime() + (Math.floor(Math.random() * 15) + 5) * 60 * 1000)
    events.push({
      id: `FUL-${idPrefix}-${orderId}-${String(eventId++).padStart(3, '0')}`,
      status: 'Ready To Ship',
      timestamp: formatTimestamp(currentTime),
      details: 'Order ready for carrier pickup'
    })
  }

  // 5. Click & Collect specific events
  // If deliveryMethodType is specified, only add CC events for CLICK_COLLECT
  // If not specified (legacy behavior), check order data for CC delivery method
  const shouldAddCCEvents = deliveryMethodType === 'CLICK_COLLECT' ||
    (deliveryMethodType === undefined && orderData?.deliveryMethods?.some((d: any) => d.type === 'CLICK_COLLECT'))

  if (hasReadyToShip && shouldAddCCEvents) {
    // Get store name from order data if available
    const ccMethod = orderData?.deliveryMethods?.find((d: any) => d.type === 'CLICK_COLLECT')
    const storeName = ccMethod?.clickCollect?.storeName || 'pickup store'

    // 5a. Pending CC Received - 15-30 mins after Ready To Ship
    currentTime = new Date(currentTime.getTime() + (Math.floor(Math.random() * 15) + 15) * 60 * 1000)
    events.push({
      id: `FUL-${idPrefix}-${orderId}-${String(eventId++).padStart(3, '0')}`,
      status: 'Pending CC Received',
      timestamp: formatTimestamp(currentTime),
      details: 'Store notified for goods transfer'
    })

    // 5b. CC Received - 1-3 hours after Pending CC Received (70% chance)
    if (Math.random() < 0.7) {
      currentTime = new Date(currentTime.getTime() + (Math.floor(Math.random() * 120) + 60) * 60 * 1000)
      events.push({
        id: `FUL-${idPrefix}-${orderId}-${String(eventId++).padStart(3, '0')}`,
        status: 'CC Received',
        timestamp: formatTimestamp(currentTime),
        details: `Goods received at ${storeName}`
      })

      // 5c. Ready to Collect - 10-20 mins after CC Received
      currentTime = new Date(currentTime.getTime() + (Math.floor(Math.random() * 10) + 10) * 60 * 1000)
      events.push({
        id: `FUL-${idPrefix}-${orderId}-${String(eventId++).padStart(3, '0')}`,
        status: 'Ready to Collect',
        timestamp: formatTimestamp(currentTime),
        details: 'Customer notified - order ready for pickup'
      })

      // 5d. CC Collected - 2-6 hours after Ready to Collect (50% chance)
      if (Math.random() < 0.5) {
        currentTime = new Date(currentTime.getTime() + (Math.floor(Math.random() * 240) + 120) * 60 * 1000)
        events.push({
          id: `FUL-${idPrefix}-${orderId}-${String(eventId++).padStart(3, '0')}`,
          status: 'CC Collected',
          timestamp: formatTimestamp(currentTime),
          details: 'Order collected by customer'
        })
      }
    }
  }

  return events
}

/**
 * Generate tracking data for an order
 * Creates 1-3 tracking numbers with realistic carrier tracking events
 * @param orderId Order ID to generate tracking for
 * @param orderData Optional order data for context
 * @returns Array of TrackingShipment objects
 */
export function generateTrackingData(orderId: string, orderData?: any): any[] {
  const shipments: any[] = []

  // Check if this is a Click & Collect order
  const isClickCollect = orderData?.deliveryMethods?.some((dm: any) => dm.type === 'CLICK_COLLECT') || false

  // Carrier prefixes, names, and tracking URL templates
  const carriers = [
    { prefix: 'JNT', name: 'J&T Express', urlTemplate: 'https://www.jtexpress.co.th/tracking?awb={trackingNumber}' },
    { prefix: 'KNJ', name: 'Kerry Express', urlTemplate: 'https://th.kerryexpress.com/th/track/?track={trackingNumber}' },
    { prefix: 'THP', name: 'Thailand Post', urlTemplate: 'https://track.thailandpost.co.th/?trackNumber={trackingNumber}' },
    { prefix: 'FLS', name: 'Flash Express', urlTemplate: 'https://www.flashexpress.co.th/tracking/?trackingNumber={trackingNumber}' },
    { prefix: 'SPX', name: 'Shopee Express', urlTemplate: 'https://spx.co.th/tracking?id={trackingNumber}' },
    { prefix: 'GRB', name: 'Grab Express', urlTemplate: 'https://www.grab.com/th/express/tracking/{trackingNumber}' }
  ]

  // Thai store names for origin
  const thaiStores = [
    'Tops RCA',
    'Tops Central Plaza ลาดพร้าว',
    'Tops Central World',
    'Tops สุขุมวิท 39',
    'Tops ทองหล่อ',
    'Tops สีลม คอมเพล็กซ์',
    'Tops เอกมัย',
    'Tops พร้อมพงษ์',
    'Tops จตุจักร',
    'Tops อารีย์'
  ]

  // Thai subdistrict names
  const thaiSubdistricts = [
    'ดินแดง',
    'วัฒนา',
    'จตุจักร',
    'ห้วยขวาง',
    'บางกะปิ',
    'พญาไท',
    'ราชเทวี',
    'ปทุมวัน',
    'สาทร',
    'บางรัก'
  ]

  // Thai recipient names
  const thaiRecipientNames = [
    'สมชาย วงศ์สุวรรณ',
    'สมหญิง ศรีสุข',
    'วิชัย เจริญพร',
    'นภา รัตนกุล',
    'อนันต์ พิทักษ์',
    'กมลา ประสิทธิ์',
    'ธนวัฒน์ ศิริมงคล',
    'พรรณี จันทร์เพ็ญ',
    'สุรศักดิ์ วงษ์วิเศษ',
    'มาลี ทองดี'
  ]

  // Thai street addresses
  const thaiAddresses = [
    '123/45 ซอยสุขุมวิท 39',
    '88/12 ถนนพหลโยธิน',
    '456 ซอยทองหล่อ 13',
    '789/1 ถนนสีลม',
    '234/56 ซอยอารีย์ 1',
    '567/89 ถนนรัชดาภิเษก',
    '321/7 ซอยเอกมัย 5',
    '654 ถนนสาทร',
    '111/22 ซอยลาดพร้าว 71',
    '999/33 ถนนพระราม 9'
  ]

  // Thai districts and full addresses
  const thaiDistrictAddresses = [
    'วัฒนา, กรุงเทพมหานคร 10110',
    'จตุจักร, กรุงเทพมหานคร 10900',
    'คลองเตย, กรุงเทพมหานคร 10110',
    'บางรัก, กรุงเทพมหานคร 10500',
    'พญาไท, กรุงเทพมหานคร 10400',
    'ดินแดง, กรุงเทพมหานคร 10400',
    'ห้วยขวาง, กรุงเทพมหานคร 10310',
    'บางกะปิ, กรุงเทพมหานคร 10240',
    'สาทร, กรุงเทพมหานคร 10120',
    'ปทุมวัน, กรุงเทพมหานคร 10330'
  ]

  // Locations for transit events
  const hubs = [
    'Bangkok Hub',
    'Central Distribution Center',
    'Regional Sorting Center',
    'Local Delivery Station',
    'Destination Hub'
  ]

  // Helper to format date as DD/MM/YYYY
  const formatDateDDMMYYYY = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  // Helper to generate random Thai phone number
  const generateThaiPhone = (): string => {
    const prefixes = ['08', '09', '06']
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
    const digit = Math.floor(Math.random() * 10)
    const rest = String(Math.floor(Math.random() * 10000000)).padStart(7, '0')
    return `${prefix}${digit}-${rest.substring(0, 3)}-${rest.substring(3)}`
  }

  // Helper to generate random email
  const generateEmail = (name: string): string => {
    const domains = ['gmail.com', 'hotmail.com', 'yahoo.co.th', 'outlook.com']
    const domain = domains[Math.floor(Math.random() * domains.length)]
    // Create email from name (simplified romanization)
    const emailName = `customer${Math.floor(Math.random() * 10000)}`
    return `${emailName}@${domain}`
  }

  // Product names for Ship to Store scenario
  const productNames = [
    'Organic Green Tea 500g',
    'Premium Coffee Beans 1kg',
    'Extra Virgin Olive Oil 750ml',
    'Whole Grain Bread 400g',
    'Greek Yogurt 500g',
    'Fresh Salmon Fillet 300g',
    'Mixed Nuts 250g',
    'Dark Chocolate 85% 200g',
    'Jasmine Rice 5kg',
    'Honey 350ml'
  ]

  // UOM (Unit of Measure) options
  const uomOptions = ['EA', 'KG', 'L', 'PCS', 'BOX']

  // Helper to generate product items for Ship to Store (Merge) scenario
  const generateProductItems = (itemCount: number): any[] => {
    const items: any[] = []
    for (let i = 0; i < itemCount; i++) {
      const orderedQty = Math.floor(Math.random() * 5) + 1
      const shippedQty = Math.random() < 0.8 ? orderedQty : Math.max(1, orderedQty - 1)
      items.push({
        productName: productNames[Math.floor(Math.random() * productNames.length)],
        sku: `SKU-${String(Math.floor(Math.random() * 900000) + 100000)}`,
        shippedQty,
        orderedQty,
        uom: uomOptions[Math.floor(Math.random() * uomOptions.length)]
      })
    }
    return items
  }

  // Check for mixed delivery (both Home Delivery and Click & Collect)
  const hasHomeDelivery = orderData?.deliveryMethods?.some((dm: any) => dm.type === 'HOME_DELIVERY') || false
  const hasBothMethods = hasHomeDelivery && isClickCollect

  // Generate shipments:
  // - Mixed delivery: 2 shipments (1 Home Delivery + 1 C&C)
  // - C&C only: 1 shipment
  // - Home delivery only: 1-3 shipments
  const shipmentCount = hasBothMethods ? 2 : (isClickCollect ? 1 : Math.floor(Math.random() * 3) + 1)
  const now = new Date()

  for (let s = 0; s < shipmentCount; s++) {
    // For mixed delivery: first shipment is Home Delivery, second is C&C
    // For Click & Collect only, determine allocation type: 70% Pickup, 30% Merge
    // For home delivery only: always 'Delivery'
    let allocationType: 'Delivery' | 'Pickup' | 'Merge'
    let shipmentType: 'HOME_DELIVERY' | 'CLICK_COLLECT' = 'HOME_DELIVERY'

    if (hasBothMethods) {
      if (s === 0) {
        // First shipment: Home Delivery
        allocationType = 'Delivery'
        shipmentType = 'HOME_DELIVERY'
      } else {
        // Second shipment: Click & Collect
        allocationType = Math.random() < 0.7 ? 'Pickup' : 'Merge'
        shipmentType = 'CLICK_COLLECT'
      }
    } else if (isClickCollect) {
      allocationType = Math.random() < 0.7 ? 'Pickup' : 'Merge'
      shipmentType = 'CLICK_COLLECT'
    } else {
      allocationType = 'Delivery'
      shipmentType = 'HOME_DELIVERY'
    }

    // For Pickup scenario, minimal tracking info needed
    if (shipmentType === 'CLICK_COLLECT' && allocationType === 'Pickup') {
      // Generate release number
      const relNo = `REL-${now.getFullYear()}-${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`

      // Get store info from Click & Collect details
      const clickCollectData = orderData?.deliveryMethods?.find((dm: any) => dm.type === 'CLICK_COLLECT')?.clickCollect
      const storeName = clickCollectData?.storeName || thaiStores[Math.floor(Math.random() * thaiStores.length)]
      const storeAddress = clickCollectData?.storeAddress || thaiAddresses[Math.floor(Math.random() * thaiAddresses.length)]
      const storePhone = clickCollectData?.storePhone || generateThaiPhone()

      const recipientName = clickCollectData?.recipientName || thaiRecipientNames[Math.floor(Math.random() * thaiRecipientNames.length)]
      const recipientPhone = clickCollectData?.phone || generateThaiPhone()

      // Generate ETA for Pickup (1-3 days from now)
      const pickupEtaDate = new Date(now.getTime() + (Math.floor(Math.random() * 3) + 1) * 24 * 60 * 60 * 1000)

      // Minimal tracking data for Pickup
      shipments.push({
        trackingNumber: `CC-${String(Math.floor(Math.random() * 900000000) + 100000000)}`,
        carrier: 'CRC Logistics', // Default carrier for C&C
        events: [], // No events for Pickup
        status: 'PICKED_UP', // Always PICKED_UP for Pickup scenario
        eta: formatDateDDMMYYYY(pickupEtaDate), // Generate ETA for Pickup
        shippedOn: '', // No shipped date for Pickup
        relNo,
        shippedFrom: storeName, // Actually "Picked from" for Pickup
        subdistrict: thaiSubdistricts[Math.floor(Math.random() * thaiSubdistricts.length)],
        shipToAddress: {
          email: generateEmail(recipientName),
          name: recipientName,
          address: storeAddress,
          fullAddress: thaiDistrictAddresses[Math.floor(Math.random() * thaiDistrictAddresses.length)],
          allocationType: 'Pickup',
          phone: recipientPhone
        },
        trackingUrl: '', // No tracking URL for Pickup
        shipmentType: 'CLICK_COLLECT' // C&C shipment type
      })
      continue
    }

    // For Merge (Ship to Store), generate TWO shipments:
    // 1. Merge shipment: From origin store to destination store
    // 2. Pickup shipment: Customer picks up from destination store
    if (allocationType === 'Merge' && shipmentType === 'CLICK_COLLECT') {
      // Helper to format timestamp as YYYY-MM-DDTHH:mm:ss
      const formatTimestamp = (date: Date): string => {
        return date.toISOString().substring(0, 19)
      }

      // Get store info from Click & Collect details
      const clickCollectData = orderData?.deliveryMethods?.find((dm: any) => dm.type === 'CLICK_COLLECT')?.clickCollect
      const originStore = orderData?.metadata?.store_name || thaiStores[Math.floor(Math.random() * thaiStores.length)]
      const destinationStore = clickCollectData?.storeName || thaiStores[Math.floor(Math.random() * thaiStores.length)]
      const destinationAddress = clickCollectData?.storeAddress || thaiAddresses[Math.floor(Math.random() * thaiAddresses.length)]
      const recipientName = clickCollectData?.recipientName || thaiRecipientNames[Math.floor(Math.random() * thaiRecipientNames.length)]
      const recipientPhone = clickCollectData?.phone || generateThaiPhone()

      // --- FIRST SHIPMENT: Merge (Ship to Store) ---
      const mergeTrackingNumber = `CC-${String(Math.floor(Math.random() * 900000000) + 100000000)}`
      const mergeRelNo = `REL-${now.getFullYear()}-${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`

      // Generate tracking events for Merge shipment
      const mergeEvents: any[] = []
      let currentTime = new Date(now.getTime() - (Math.floor(Math.random() * 48) + 12) * 60 * 60 * 1000)
      const shippedOnDate = new Date(currentTime)

      // 1. Shipment picked up from origin store
      mergeEvents.push({
        status: 'Shipment pickedup',
        timestamp: formatTimestamp(currentTime),
        location: originStore
      })

      // 2. Hub transit events (1-2 transit stops)
      const transitStops = Math.floor(Math.random() * 2) + 1
      for (let t = 0; t < transitStops; t++) {
        currentTime = new Date(currentTime.getTime() + (Math.floor(Math.random() * 8) + 4) * 60 * 60 * 1000)
        mergeEvents.push({
          status: 'Hub / Intransit - destination arrived',
          timestamp: formatTimestamp(currentTime),
          location: hubs[Math.floor(Math.random() * hubs.length)]
        })
      }

      // 3. Delivered to destination store (always delivered for Merge)
      currentTime = new Date(currentTime.getTime() + (Math.floor(Math.random() * 4) + 2) * 60 * 60 * 1000)
      mergeEvents.push({
        status: 'Delivered',
        timestamp: formatTimestamp(currentTime),
        location: destinationStore
      })

      // Calculate ETA for Merge (based on delivery time)
      const mergeEtaDate = currentTime

      // Push Merge shipment (Ship to Store)
      shipments.push({
        trackingNumber: mergeTrackingNumber,
        carrier: 'CRC Logistics',
        events: mergeEvents,
        status: 'DELIVERED', // Shows as FULFILLED in UI
        eta: formatDateDDMMYYYY(mergeEtaDate),
        shippedOn: formatDateDDMMYYYY(shippedOnDate),
        relNo: mergeRelNo,
        shippedFrom: originStore,
        subdistrict: thaiSubdistricts[Math.floor(Math.random() * thaiSubdistricts.length)],
        shipToAddress: {
          email: generateEmail(recipientName),
          name: destinationStore, // Destination store for Merge
          address: destinationAddress,
          fullAddress: thaiDistrictAddresses[Math.floor(Math.random() * thaiDistrictAddresses.length)],
          allocationType: 'Merge' as const,
          phone: recipientPhone
        },
        trackingUrl: 'https://crc.central.co.th/tracking',
        shipmentType: 'CLICK_COLLECT' as const
      })

      // --- SECOND SHIPMENT: Pickup (Customer picks up from destination store) ---
      const pickupTrackingNumber = `CC-${String(Math.floor(Math.random() * 900000000) + 100000000)}`
      const pickupRelNo = `REL-${now.getFullYear()}-${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`

      // Calculate ETA for Pickup (same day or next day after Merge delivered)
      const pickupEtaDate = new Date(currentTime.getTime() + (Math.floor(Math.random() * 24) + 1) * 60 * 60 * 1000)

      // Push Pickup shipment (Customer picks up)
      shipments.push({
        trackingNumber: pickupTrackingNumber,
        carrier: 'CRC Logistics',
        events: [], // No tracking events for Pickup
        status: 'PICKED_UP', // Shows as PICKED UP in UI
        eta: formatDateDDMMYYYY(pickupEtaDate),
        shippedOn: '', // No shipped date for Pickup
        relNo: pickupRelNo,
        shippedFrom: destinationStore, // "Picked from" destination store
        subdistrict: thaiSubdistricts[Math.floor(Math.random() * thaiSubdistricts.length)],
        shipToAddress: {
          email: generateEmail(recipientName),
          name: recipientName, // Customer name for Pickup
          address: destinationAddress,
          fullAddress: thaiDistrictAddresses[Math.floor(Math.random() * thaiDistrictAddresses.length)],
          allocationType: 'Pickup' as const,
          phone: recipientPhone
        },
        trackingUrl: 'https://crc.central.co.th/tracking',
        shipmentType: 'CLICK_COLLECT' as const
      })

      continue // Skip the rest of the loop for Merge scenario
    }

    // For Home Delivery, generate full tracking
    const carrier = carriers[Math.floor(Math.random() * carriers.length)]
    const trackingNumber = `${carrier.prefix}${String(Math.floor(Math.random() * 900000000) + 100000000)}`

    const events: any[] = []
    let currentTime = new Date(now.getTime() - (Math.floor(Math.random() * 48) + 12) * 60 * 60 * 1000)
    const shippedOnDate = new Date(currentTime)

    // Helper to format timestamp as YYYY-MM-DDTHH:mm:ss
    const formatTimestamp = (date: Date): string => {
      return date.toISOString().substring(0, 19)
    }

    // 1. Shipment picked up
    const originStore = orderData?.metadata?.store_name || thaiStores[Math.floor(Math.random() * thaiStores.length)]
    events.push({
      status: 'Shipment pickedup',
      timestamp: formatTimestamp(currentTime),
      location: originStore
    })

    // 2. Hub transit events (1-3 transit stops)
    const transitStops = Math.floor(Math.random() * 3) + 1
    for (let t = 0; t < transitStops; t++) {
      currentTime = new Date(currentTime.getTime() + (Math.floor(Math.random() * 8) + 4) * 60 * 60 * 1000)
      events.push({
        status: 'Hub / Intransit - destination arrived',
        timestamp: formatTimestamp(currentTime),
        location: hubs[Math.floor(Math.random() * hubs.length)]
      })
    }

    // Track if delivered for status
    let isDelivered = false
    let isOutForDelivery = false

    // 3. Out for Delivery (80% chance)
    if (Math.random() < 0.8) {
      isOutForDelivery = true
      currentTime = new Date(currentTime.getTime() + (Math.floor(Math.random() * 6) + 2) * 60 * 60 * 1000)
      events.push({
        status: 'Out for Delivery',
        timestamp: formatTimestamp(currentTime),
        location: 'Local Delivery Station'
      })

      // 4. Delivered (60% chance if out for delivery)
      if (Math.random() < 0.6) {
        isDelivered = true
        currentTime = new Date(currentTime.getTime() + (Math.floor(Math.random() * 4) + 1) * 60 * 60 * 1000)
        const deliveryLocation = orderData?.shipping_address?.city || 'Bangkok'
        events.push({
          status: 'Delivered',
          timestamp: formatTimestamp(currentTime),
          location: deliveryLocation
        })
      }
    }

    // Derive shipment status from events
    let shipmentStatus: 'DELIVERED' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'PICKED_UP' | 'PENDING'
    if (isDelivered) {
      shipmentStatus = 'DELIVERED'
    } else if (isOutForDelivery) {
      shipmentStatus = 'OUT_FOR_DELIVERY'
    } else if (events.length > 1) {
      shipmentStatus = 'IN_TRANSIT'
    } else if (events.length === 1) {
      shipmentStatus = 'PICKED_UP'
    } else {
      shipmentStatus = 'PENDING'
    }

    // Calculate ETA (2-5 days from shipped date for non-delivered)
    const etaDays = Math.floor(Math.random() * 4) + 2
    const etaDate = isDelivered
      ? currentTime
      : new Date(shippedOnDate.getTime() + etaDays * 24 * 60 * 60 * 1000)

    // Generate release number
    const relNo = `REL-${now.getFullYear()}-${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`

    // Generate ship-to address details
    const recipientName = thaiRecipientNames[Math.floor(Math.random() * thaiRecipientNames.length)]

    const shipToAddress = {
      email: generateEmail(recipientName),
      name: recipientName,
      address: thaiAddresses[Math.floor(Math.random() * thaiAddresses.length)],
      fullAddress: thaiDistrictAddresses[Math.floor(Math.random() * thaiDistrictAddresses.length)],
      allocationType: 'Delivery' as const,
      phone: generateThaiPhone()
    }

    // Generate tracking URL
    const trackingUrl = carrier.urlTemplate.replace('{trackingNumber}', trackingNumber)

    const shipmentData: any = {
      trackingNumber,
      carrier: carrier.name,
      events,
      status: shipmentStatus,
      eta: formatDateDDMMYYYY(etaDate),
      shippedOn: formatDateDDMMYYYY(shippedOnDate),
      relNo,
      shippedFrom: originStore,
      subdistrict: thaiSubdistricts[Math.floor(Math.random() * thaiSubdistricts.length)],
      shipToAddress,
      trackingUrl,
      shipmentType // 'HOME_DELIVERY'
    }

    shipments.push(shipmentData)
  }

  return shipments
}

// Export all mock data
export const mockData = {
  orders: mockApiOrders,
  kpis: mockExecutiveKPIs,
  metrics: mockOrderMetrics,
  performance: mockPerformanceMetrics,
  recentOrders: mockRecentOrders,
  alerts: mockAlerts,
  analytics: mockAnalyticsData,
  getOrders: getMockOrders,
  getOrderCounts: getMockOrderCounts,
  generateEscalations: generateMockEscalations,
  getEscalations: getMockEscalations,
  generateAuditTrail: generateMockAuditTrail,
  generateManhattanAuditTrail: generateManhattanAuditTrail,
  generateFulfillmentTimeline: generateFulfillmentTimeline,
  generateTrackingData: generateTrackingData
}