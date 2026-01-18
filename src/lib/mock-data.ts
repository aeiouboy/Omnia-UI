// Mock data service for development when external APIs are not configured
// This provides realistic sample data for all dashboard components

import { AuditActionType, AuditType, ACTION_TYPE_TO_AUDIT_TYPE, type ManhattanAuditEvent } from "@/types/audit"
import { DeliveryMethod, DeliveryMethodType } from "@/types/delivery"

// UOM Type Categories
const WEIGHT_UOMS = ['KG', 'G', 'GRAM', 'LB'] as const
const NON_WEIGHT_UOMS = ['PACK', 'PCS', 'PIECE', 'EA', 'EACH', 'BOX', 'SET', 'SCAN', 'SBOX', 'BTL'] as const

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
    { name: "Fresh Milk 1L", thaiName: "นมสด 1ลิตร", sku: "DAIRY-001", category: "Dairy & Eggs", price: 45, uom: "BTL" },
    { name: "Chicken Breast 500g", thaiName: "อกไก่ 500กรัม", sku: "MEAT-001", category: "Meat & Seafood", price: 120, uom: "KG" },
    { name: "Jasmine Rice 5kg", thaiName: "ข้าวหอมมะลิ 5กิโลกรัม", sku: "PANTRY-001", category: "Pantry Staples", price: 180, uom: "KG" },
    { name: "Green Apples", thaiName: "แอปเปิ้ลเขียว", sku: "PRODUCE-001", category: "Fresh Produce", price: 80, uom: "KG" },
    { name: "Coca Cola 1.5L", thaiName: "โค้ก 1.5ลิตร", sku: "BEV-001", category: "Beverages", price: 35, uom: "BTL" },
    { name: "Chocolate Cookies", thaiName: "คุกกี้ช็อกโกแลต", sku: "SNACK-001", category: "Snacks & Confectionery", price: 65, uom: "PACK" },
    { name: "Whole Wheat Bread", thaiName: "ขนมปังโฮลวีท", sku: "BAKERY-001", category: "Bakery", price: 40, uom: "PCS" },
    { name: "Frozen Pizza", thaiName: "พิซซ่าแช่แข็ง", sku: "FROZEN-001", category: "Frozen Foods", price: 180, uom: "EA" },
    { name: "Organic Eggs 10pcs", thaiName: "ไข่ออร์แกนิค 10ฟอง", sku: "DAIRY-002", category: "Dairy & Eggs", price: 95, uom: "PACK" },
    { name: "Fresh Salmon 300g", thaiName: "ปลาแซลมอนสด 300กรัม", sku: "MEAT-002", category: "Meat & Seafood", price: 250, uom: "KG" },
    { name: "Potato Chips", thaiName: "มันฝรั่งทอด", sku: "SNACK-002", category: "Snacks & Confectionery", price: 45, uom: "PACK" },
    { name: "Orange Juice 1L", thaiName: "น้ำส้ม 1ลิตร", sku: "BEV-002", category: "Beverages", price: 55, uom: "BTL" },
    { name: "Bananas 1kg", thaiName: "กล้วย 1กิโลกรัม", sku: "PRODUCE-002", category: "Fresh Produce", price: 35, uom: "KG" },
    { name: "Croissant 6pcs", thaiName: "ครัวซองต์ 6ชิ้น", sku: "BAKERY-002", category: "Bakery", price: 120, uom: "PACK" },
    { name: "Ice Cream Vanilla", thaiName: "ไอศกรีมวานิลลา", sku: "FROZEN-002", category: "Frozen Foods", price: 150, uom: "EA" }
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
    const uom = product.uom || 'EA'  // Use product-specific UOM with fallback to EA
    const isPackUOM = ['PACK', 'BOX', 'SET', 'CASE', 'CTN', 'CARTON'].includes(uom.toUpperCase())
    const packedOrderedQty = isPackUOM ? quantity : undefined
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

    // Conditionally generate weight fields only for weight-based UOMs
    const isWeightBasedUom = WEIGHT_UOMS.includes(uom as any)
    const weight = isWeightBasedUom ? parseFloat((Math.random() * 4.9 + 0.1).toFixed(2)) : undefined
    const actualWeight = isWeightBasedUom && weight ? parseFloat((weight + (Math.random() * 0.2 - 0.1)).toFixed(2)) : undefined

    // Generate route and booking slot fields
    const routeNames = ['สายรถหนองบอน', 'สายรถบางนา', 'สายรถลาดพร้าว', 'สายรถรามคำแหง', 'สายรถพระราม 9']
    const route = routeNames[Math.floor(Math.random() * routeNames.length)]

    // Generate booking slot (1-3 days from now, 1-2 hour window)
    const bookingSlotFromDate = new Date()
    bookingSlotFromDate.setDate(bookingSlotFromDate.getDate() + Math.floor(Math.random() * 3) + 1)
    bookingSlotFromDate.setHours(Math.floor(Math.random() * 12) + 8, 0, 0, 0)  // 8:00 - 20:00
    const bookingSlotToDate = new Date(bookingSlotFromDate)
    bookingSlotToDate.setHours(bookingSlotToDate.getHours() + Math.floor(Math.random() * 2) + 1)  // 1-2 hours later
    const bookingSlotFrom = bookingSlotFromDate.toISOString()
    const bookingSlotTo = bookingSlotToDate.toISOString()

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
      },
      weight,
      actualWeight,
      route,
      bookingSlotFrom,
      bookingSlotTo
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
export function generateManhattanAuditTrail(orderId: string, orderData?: any): ManhattanAuditEvent[] {
  // Return actual MAO audit trail data for order W1156251121946800 (439 events)
  if (orderId === 'W1156251121946800') {
    return maoOrderW1156251121946800AuditTrail
  }

  const events: ManhattanAuditEvent[] = []
  const now = new Date()

  // Base timestamp - order creation (random time in the past 1-7 days)
  const daysAgo = Math.floor(Math.random() * 7) + 1
  const hoursAgo = Math.floor(Math.random() * 24)
  const orderCreationTime = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000) - (hoursAgo * 60 * 60 * 1000))

  // MAO-specific users from PDF
  const updatedByOptions = [
    'apiuser4TMS',
    'system-msg-user@CFR',
    'integrationuser@crc.com',
    'apiuser4Slick',
    'pubsubuser@TWD.null'
  ]

  // Helper function to format date as MM/DD/YYYY HH:mm ICT (MAO format)
  const formatManhattanDate = (date: Date): string => {
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${month}/${day}/${year} ${hours}:${minutes} ICT`
  }

  // Generate random long numeric ID for MAO entities
  const generateLongId = (): string => {
    let id = ''
    for (let i = 0; i < 30; i++) {
      id += Math.floor(Math.random() * 10)
    }
    return id
  }

  // Generate entity ID based on entity type (MAO-style)
  const generateEntityId = (entityName: string, lineNum?: number): string => {
    const orderIdClean = orderId.replace(/[^0-9]/g, '') || '1156251121946800'
    switch (entityName) {
      case 'Order':
        return `WT${orderIdClean}`
      case 'OrderLine':
        return String(lineNum || Math.floor(Math.random() * 7) + 1)
      case 'QuantityDetail':
        return generateLongId()
      case 'OrderTrackingDetail':
        return `TRKWT${orderIdClean}-${lineNum || 1}`
      case 'OrderTrackingInfo':
        return generateLongId()
      case 'FulfillmentDetail':
        return generateLongId()
      case 'OrderMilestone':
        return generateLongId()
      case 'OrderLineNote':
        return generateLongId()
      case 'OrderLineTaxDetail':
        return generateLongId()
      case 'Invoice':
        return generateLongId().substring(0, 21)
      case 'InvoiceLine':
        return generateLongId()
      case 'InvoiceLineChargeDetail':
        return generateLongId()
      case 'InvoiceLineTaxDetail':
        return generateLongId()
      case 'Allocation':
        return `${Math.floor(Math.random() * 100)}A${generateLongId().substring(0, 19)}`
      case 'ReleaseLine':
        return generateLongId()
      case 'OrderAdditional':
        return generateLongId()
      case 'OrderAttribute':
        return generateLongId()
      case 'OrderExtension1':
        return generateLongId()
      default:
        return generateLongId()
    }
  }

  // Helper to add random milliseconds to time
  const addRandomMs = (time: Date, minMs: number, maxMs: number): Date => {
    return new Date(time.getTime() + Math.floor(Math.random() * (maxMs - minMs)) + minMs)
  }

  let currentTime = new Date(orderCreationTime)
  let eventId = 1

  // Number of order lines (7 for MAO-like data)
  const orderLineCount = 7

  // Order entity ID
  const orderEntityId = generateEntityId('Order')

  // ===========================================
  // PHASE 1: Order Creation Events (~30 events)
  // ===========================================

  // Order Inserted
  events.push({
    id: `AUDIT-${orderId}-${String(eventId++).padStart(4, '0')}`,
    orderId,
    updatedBy: 'apiuser4TMS',
    updatedOn: formatManhattanDate(currentTime),
    entityName: 'Order',
    entityId: orderEntityId,
    changedParameter: 'Inserted Order',
    oldValue: null,
    newValue: null
  })

  // OrderExtension1
  currentTime = addRandomMs(currentTime, 50, 100)
  events.push({
    id: `AUDIT-${orderId}-${String(eventId++).padStart(4, '0')}`,
    orderId,
    updatedBy: 'apiuser4TMS',
    updatedOn: formatManhattanDate(currentTime),
    entityName: 'OrderExtension1',
    entityId: generateEntityId('OrderExtension1'),
    changedParameter: 'Inserted OrderExtension1',
    oldValue: null,
    newValue: null
  })

  // OrderAdditional
  currentTime = addRandomMs(currentTime, 50, 100)
  events.push({
    id: `AUDIT-${orderId}-${String(eventId++).padStart(4, '0')}`,
    orderId,
    updatedBy: 'apiuser4TMS',
    updatedOn: formatManhattanDate(currentTime),
    entityName: 'OrderAdditional',
    entityId: generateEntityId('OrderAdditional'),
    changedParameter: 'Inserted OrderAdditional',
    oldValue: null,
    newValue: null
  })

  // OrderAttribute entries (3 attributes)
  for (let i = 0; i < 3; i++) {
    currentTime = addRandomMs(currentTime, 50, 100)
    events.push({
      id: `AUDIT-${orderId}-${String(eventId++).padStart(4, '0')}`,
      orderId,
      updatedBy: 'apiuser4TMS',
      updatedOn: formatManhattanDate(currentTime),
      entityName: 'OrderAttribute',
      entityId: generateEntityId('OrderAttribute'),
      changedParameter: 'Inserted OrderAttribute',
      oldValue: null,
      newValue: null
    })
  }

  // OrderTrackingInfo
  currentTime = addRandomMs(currentTime, 50, 100)
  events.push({
    id: `AUDIT-${orderId}-${String(eventId++).padStart(4, '0')}`,
    orderId,
    updatedBy: 'apiuser4TMS',
    updatedOn: formatManhattanDate(currentTime),
    entityName: 'OrderTrackingInfo',
    entityId: generateEntityId('OrderTrackingInfo'),
    changedParameter: 'Inserted OrderTrackingInfo',
    oldValue: null,
    newValue: null
  })

  // OrderLine events (7 lines) - creates multiple events per line
  for (let lineNum = 1; lineNum <= orderLineCount; lineNum++) {
    currentTime = addRandomMs(currentTime, 100, 200)
    events.push({
      id: `AUDIT-${orderId}-${String(eventId++).padStart(4, '0')}`,
      orderId,
      updatedBy: 'apiuser4TMS',
      updatedOn: formatManhattanDate(currentTime),
      entityName: 'OrderLine',
      entityId: String(lineNum),
      changedParameter: 'Inserted OrderLine',
      oldValue: null,
      newValue: null
    })

    // OrderTrackingDetail for each line
    currentTime = addRandomMs(currentTime, 50, 100)
    events.push({
      id: `AUDIT-${orderId}-${String(eventId++).padStart(4, '0')}`,
      orderId,
      updatedBy: 'apiuser4TMS',
      updatedOn: formatManhattanDate(currentTime),
      entityName: 'OrderTrackingDetail',
      entityId: generateEntityId('OrderTrackingDetail', lineNum),
      changedParameter: 'Inserted OrderTrackingDetail',
      oldValue: null,
      newValue: null
    })
  }

  // ===========================================
  // PHASE 2: QuantityDetail Bulk Events (~200 events)
  // ===========================================

  // Each line gets multiple QuantityDetail inserts (about 25-30 per line)
  for (let lineNum = 1; lineNum <= orderLineCount; lineNum++) {
    const quantityDetailCount = 25 + Math.floor(Math.random() * 10)
    for (let q = 0; q < quantityDetailCount; q++) {
      currentTime = addRandomMs(currentTime, 10, 50)
      events.push({
        id: `AUDIT-${orderId}-${String(eventId++).padStart(4, '0')}`,
        orderId,
        updatedBy: 'system-msg-user@CFR',
        updatedOn: formatManhattanDate(currentTime),
        entityName: 'QuantityDetail',
        entityId: generateEntityId('QuantityDetail'),
        changedParameter: 'Inserted QuantityDetail',
        oldValue: null,
        newValue: null
      })
    }
  }

  // ===========================================
  // PHASE 3: OrderMilestone Events (~20 events)
  // ===========================================

  const milestones = ['Confirmed', 'Released', 'Allocated', 'Shipped', 'Delivered']
  for (const milestone of milestones) {
    currentTime = addRandomMs(currentTime, 5000, 15000)
    // Order-level milestone
    events.push({
      id: `AUDIT-${orderId}-${String(eventId++).padStart(4, '0')}`,
      orderId,
      updatedBy: 'integrationuser@crc.com',
      updatedOn: formatManhattanDate(currentTime),
      entityName: 'OrderMilestone',
      entityId: generateEntityId('OrderMilestone'),
      changedParameter: `Order:Milestone:${milestone}`,
      oldValue: null,
      newValue: null
    })

    // Line-level milestones for some lines
    for (let lineNum = 1; lineNum <= orderLineCount; lineNum++) {
      if (Math.random() > 0.5) {
        currentTime = addRandomMs(currentTime, 100, 500)
        events.push({
          id: `AUDIT-${orderId}-${String(eventId++).padStart(4, '0')}`,
          orderId,
          updatedBy: 'integrationuser@crc.com',
          updatedOn: formatManhattanDate(currentTime),
          entityName: 'OrderMilestone',
          entityId: generateEntityId('OrderMilestone'),
          changedParameter: `OrderLine:${lineNum}:Milestone:${milestone}`,
          oldValue: null,
          newValue: null
        })
      }
    }
  }

  // ===========================================
  // PHASE 4: Status Change Events (~70 events for 7 lines)
  // ===========================================

  const statusTransitions = [
    { from: 'Open', to: 'Allocated' },
    { from: 'Allocated', to: 'Released' },
    { from: 'Released', to: 'In Process' },
    { from: 'In Process', to: 'Picked' },
    { from: 'Picked', to: 'Packed' },
    { from: 'Packed', to: 'Fulfilled' },
    { from: 'Fulfilled', to: 'Delivered' }
  ]

  for (let lineNum = 1; lineNum <= orderLineCount; lineNum++) {
    for (const transition of statusTransitions) {
      currentTime = addRandomMs(currentTime, 1000, 5000)

      // MaxFulfillmentStatusId change
      events.push({
        id: `AUDIT-${orderId}-${String(eventId++).padStart(4, '0')}`,
        orderId,
        updatedBy: 'apiuser4TMS',
        updatedOn: formatManhattanDate(currentTime),
        entityName: 'OrderLine',
        entityId: String(lineNum),
        changedParameter: `Changed MaxFulfillmentStatusId from ${transition.from} to ${transition.to}`,
        oldValue: transition.from,
        newValue: transition.to
      })

      // MinFulfillmentStatusId change
      currentTime = addRandomMs(currentTime, 10, 50)
      events.push({
        id: `AUDIT-${orderId}-${String(eventId++).padStart(4, '0')}`,
        orderId,
        updatedBy: 'apiuser4TMS',
        updatedOn: formatManhattanDate(currentTime),
        entityName: 'OrderLine',
        entityId: String(lineNum),
        changedParameter: `Changed MinFulfillmentStatusId from ${transition.from} to ${transition.to}`,
        oldValue: transition.from,
        newValue: transition.to
      })
    }
  }

  // Order-level status changes
  currentTime = addRandomMs(currentTime, 5000, 10000)
  events.push({
    id: `AUDIT-${orderId}-${String(eventId++).padStart(4, '0')}`,
    orderId,
    updatedBy: 'apiuser4TMS',
    updatedOn: formatManhattanDate(currentTime),
    entityName: 'Order',
    entityId: orderEntityId,
    changedParameter: 'Changed Status from Open to Closed',
    oldValue: 'Open',
    newValue: 'Closed'
  })

  // ===========================================
  // PHASE 5: FulfillmentDetail Events (~20 events)
  // ===========================================

  const fulfillmentId = generateEntityId('FulfillmentDetail')

  currentTime = addRandomMs(currentTime, 1000, 3000)
  events.push({
    id: `AUDIT-${orderId}-${String(eventId++).padStart(4, '0')}`,
    orderId,
    updatedBy: 'apiuser4Slick',
    updatedOn: formatManhattanDate(currentTime),
    entityName: 'FulfillmentDetail',
    entityId: fulfillmentId,
    changedParameter: 'Inserted FulfillmentDetail',
    oldValue: null,
    newValue: null
  })

  // FulfillmentDetail field changes
  const fulfillmentChanges = [
    { field: 'PhysicalOriginId', oldVal: 'null', newVal: 'CFR156' },
    { field: 'ReturnEligibilityDays', oldVal: 'null', newVal: '14' },
    { field: 'PublishStatus', oldVal: 'None', newVal: 'Published' },
    { field: 'FulfilledQuantity', oldVal: '0.0', newVal: '4.0' },
    { field: 'ExpectedTime', oldVal: '2025-11-21T04:30:35.345', newVal: '2025-11-21T04:30:35.345617' }
  ]

  for (let lineNum = 1; lineNum <= orderLineCount; lineNum++) {
    for (const change of fulfillmentChanges) {
      if (Math.random() > 0.3) {
        currentTime = addRandomMs(currentTime, 100, 500)
        events.push({
          id: `AUDIT-${orderId}-${String(eventId++).padStart(4, '0')}`,
          orderId,
          updatedBy: 'apiuser4Slick',
          updatedOn: formatManhattanDate(currentTime),
          entityName: 'FulfillmentDetail',
          entityId: generateEntityId('FulfillmentDetail'),
          changedParameter: `Changed ${change.field} from ${change.oldVal} to ${change.newVal}`,
          oldValue: change.oldVal === 'null' ? null : change.oldVal,
          newValue: change.newVal
        })
      }
    }
  }

  // ===========================================
  // PHASE 6: Allocation Events (~20 events)
  // ===========================================

  for (let lineNum = 1; lineNum <= orderLineCount; lineNum++) {
    currentTime = addRandomMs(currentTime, 500, 1500)
    events.push({
      id: `AUDIT-${orderId}-${String(eventId++).padStart(4, '0')}`,
      orderId,
      updatedBy: 'pubsubuser@TWD.null',
      updatedOn: formatManhattanDate(currentTime),
      entityName: 'Allocation',
      entityId: generateEntityId('Allocation'),
      changedParameter: 'Inserted Allocation',
      oldValue: null,
      newValue: null
    })

    // Some allocations get status changes
    if (Math.random() > 0.4) {
      currentTime = addRandomMs(currentTime, 100, 300)
      events.push({
        id: `AUDIT-${orderId}-${String(eventId++).padStart(4, '0')}`,
        orderId,
        updatedBy: 'pubsubuser@TWD.null',
        updatedOn: formatManhattanDate(currentTime),
        entityName: 'Allocation',
        entityId: generateEntityId('Allocation'),
        changedParameter: 'Changed AllocatedQuantity from 0.0 to 4.0',
        oldValue: '0.0',
        newValue: '4.0'
      })
    }
  }

  // ===========================================
  // PHASE 7: ReleaseLine Events (~10 events)
  // ===========================================

  for (let lineNum = 1; lineNum <= orderLineCount; lineNum++) {
    currentTime = addRandomMs(currentTime, 500, 1500)
    events.push({
      id: `AUDIT-${orderId}-${String(eventId++).padStart(4, '0')}`,
      orderId,
      updatedBy: 'integrationuser@crc.com',
      updatedOn: formatManhattanDate(currentTime),
      entityName: 'ReleaseLine',
      entityId: generateEntityId('ReleaseLine'),
      changedParameter: 'Inserted ReleaseLine',
      oldValue: null,
      newValue: null
    })
  }

  // ===========================================
  // PHASE 8: Invoice Events (~30 events)
  // ===========================================

  const invoiceId = generateEntityId('Invoice')

  currentTime = addRandomMs(currentTime, 5000, 10000)
  events.push({
    id: `AUDIT-${orderId}-${String(eventId++).padStart(4, '0')}`,
    orderId,
    updatedBy: 'apiuser4TMS',
    updatedOn: formatManhattanDate(currentTime),
    entityName: 'Invoice',
    entityId: invoiceId,
    changedParameter: 'Inserted Invoice',
    oldValue: null,
    newValue: null
  })

  // InvoiceLine for each order line
  for (let lineNum = 1; lineNum <= orderLineCount; lineNum++) {
    currentTime = addRandomMs(currentTime, 100, 300)
    events.push({
      id: `AUDIT-${orderId}-${String(eventId++).padStart(4, '0')}`,
      orderId,
      updatedBy: 'apiuser4TMS',
      updatedOn: formatManhattanDate(currentTime),
      entityName: 'InvoiceLine',
      entityId: generateEntityId('InvoiceLine'),
      changedParameter: 'Inserted InvoiceLine',
      oldValue: null,
      newValue: null
    })

    // InvoiceLineChargeDetail
    currentTime = addRandomMs(currentTime, 50, 100)
    events.push({
      id: `AUDIT-${orderId}-${String(eventId++).padStart(4, '0')}`,
      orderId,
      updatedBy: 'apiuser4TMS',
      updatedOn: formatManhattanDate(currentTime),
      entityName: 'InvoiceLineChargeDetail',
      entityId: generateEntityId('InvoiceLineChargeDetail'),
      changedParameter: 'Inserted InvoiceLineChargeDetail',
      oldValue: null,
      newValue: null
    })

    // InvoiceLineTaxDetail
    currentTime = addRandomMs(currentTime, 50, 100)
    events.push({
      id: `AUDIT-${orderId}-${String(eventId++).padStart(4, '0')}`,
      orderId,
      updatedBy: 'apiuser4TMS',
      updatedOn: formatManhattanDate(currentTime),
      entityName: 'InvoiceLineTaxDetail',
      entityId: generateEntityId('InvoiceLineTaxDetail'),
      changedParameter: 'Inserted InvoiceLineTaxDetail',
      oldValue: null,
      newValue: null
    })
  }

  // ===========================================
  // PHASE 9: OrderLineNote Events (~10 events)
  // ===========================================

  for (let lineNum = 1; lineNum <= orderLineCount; lineNum++) {
    if (Math.random() > 0.3) {
      currentTime = addRandomMs(currentTime, 200, 500)
      events.push({
        id: `AUDIT-${orderId}-${String(eventId++).padStart(4, '0')}`,
        orderId,
        updatedBy: 'system-msg-user@CFR',
        updatedOn: formatManhattanDate(currentTime),
        entityName: 'OrderLineNote',
        entityId: generateEntityId('OrderLineNote'),
        changedParameter: 'Inserted OrderLineNote',
        oldValue: null,
        newValue: null
      })
    }
  }

  // ===========================================
  // PHASE 10: Tax Detail Events (~20 events)
  // ===========================================

  for (let lineNum = 1; lineNum <= orderLineCount; lineNum++) {
    // Insert tax detail
    currentTime = addRandomMs(currentTime, 100, 300)
    events.push({
      id: `AUDIT-${orderId}-${String(eventId++).padStart(4, '0')}`,
      orderId,
      updatedBy: 'apiuser4TMS',
      updatedOn: formatManhattanDate(currentTime),
      entityName: 'OrderLineTaxDetail',
      entityId: generateEntityId('OrderLineTaxDetail'),
      changedParameter: 'Inserted OrderLineTaxDetail',
      oldValue: null,
      newValue: null
    })

    // Some tax details get deleted and re-inserted
    if (Math.random() > 0.5) {
      currentTime = addRandomMs(currentTime, 100, 200)
      events.push({
        id: `AUDIT-${orderId}-${String(eventId++).padStart(4, '0')}`,
        orderId,
        updatedBy: 'apiuser4TMS',
        updatedOn: formatManhattanDate(currentTime),
        entityName: 'OrderLineTaxDetail',
        entityId: generateEntityId('OrderLineTaxDetail'),
        changedParameter: 'Deleted OrderLineTaxDetail',
        oldValue: null,
        newValue: null
      })
    }

    // TotalInformationalTaxes change
    currentTime = addRandomMs(currentTime, 50, 100)
    events.push({
      id: `AUDIT-${orderId}-${String(eventId++).padStart(4, '0')}`,
      orderId,
      updatedBy: 'apiuser4TMS',
      updatedOn: formatManhattanDate(currentTime),
      entityName: 'OrderLine',
      entityId: String(lineNum),
      changedParameter: 'Changed TotalInformationalTaxes from 0.00 to 0.00',
      oldValue: '0.00',
      newValue: '0.00'
    })
  }

  // ===========================================
  // PHASE 11: Tracking URL and Archive Events (~10 events)
  // ===========================================

  currentTime = addRandomMs(currentTime, 10000, 30000)
  events.push({
    id: `AUDIT-${orderId}-${String(eventId++).padStart(4, '0')}`,
    orderId,
    updatedBy: 'integrationuser@crc.com',
    updatedOn: formatManhattanDate(currentTime),
    entityName: 'Order',
    entityId: orderEntityId,
    changedParameter: 'Changed CRCTrackingURL from null to https://share.lalamove.com/track/12345',
    oldValue: null,
    newValue: 'https://share.lalamove.com/track/12345'
  })

  // Payment status change
  currentTime = addRandomMs(currentTime, 1000, 3000)
  events.push({
    id: `AUDIT-${orderId}-${String(eventId++).padStart(4, '0')}`,
    orderId,
    updatedBy: 'apiuser4TMS',
    updatedOn: formatManhattanDate(currentTime),
    entityName: 'Order',
    entityId: orderEntityId,
    changedParameter: 'Changed PaymentStatus from Authorized to Paid',
    oldValue: 'Authorized',
    newValue: 'Paid'
  })

  // ArchiveDate changes
  const archiveDate1 = formatManhattanDate(addRandomMs(currentTime, 86400000, 172800000)).split(' ')[0]
  const archiveDate2 = formatManhattanDate(addRandomMs(currentTime, 172800000, 259200000)).split(' ')[0]

  currentTime = addRandomMs(currentTime, 5000, 10000)
  events.push({
    id: `AUDIT-${orderId}-${String(eventId++).padStart(4, '0')}`,
    orderId,
    updatedBy: 'system-msg-user@CFR',
    updatedOn: formatManhattanDate(currentTime),
    entityName: 'Order',
    entityId: orderEntityId,
    changedParameter: `Changed ArchiveDate from ${archiveDate1}T04:39:36.769 to ${archiveDate2}T04:51:14.727484`,
    oldValue: `${archiveDate1}T04:39:36.769`,
    newValue: `${archiveDate2}T04:51:14.727484`
  })

  // Quantity changes for some lines
  for (let lineNum = 1; lineNum <= orderLineCount; lineNum++) {
    if (Math.random() > 0.6) {
      currentTime = addRandomMs(currentTime, 500, 1500)
      const oldQty = Math.floor(Math.random() * 4) + 2
      events.push({
        id: `AUDIT-${orderId}-${String(eventId++).padStart(4, '0')}`,
        orderId,
        updatedBy: 'pubsubuser@TWD.null',
        updatedOn: formatManhattanDate(currentTime),
        entityName: 'QuantityDetail',
        entityId: generateEntityId('QuantityDetail'),
        changedParameter: `Changed Quantity from ${oldQty}.0 to 0.0`,
        oldValue: `${oldQty}.0`,
        newValue: '0.0'
      })
    }
  }

  // Sort by updatedOn timestamp descending (newest first)
  // Parse the Manhattan date format back to Date for sorting (MM/DD/YYYY format)
  return events.sort((a, b) => {
    const parseDate = (dateStr: string) => {
      const [datePart, timePart] = dateStr.replace(' ICT', '').split(' ')
      const [month, day, year] = datePart.split('/')
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
  // If order has pre-defined fulfillmentTimeline, use it
  if (orderData?.fulfillmentTimeline && Array.isArray(orderData.fulfillmentTimeline)) {
    return orderData.fulfillmentTimeline
  }

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
  // If order has pre-defined tracking, use it
  if (orderData?.tracking && Array.isArray(orderData.tracking)) {
    return orderData.tracking
  }

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

// -----------------------------------------------------------------------------
// MAO ORDER: W1156251121946800
// -----------------------------------------------------------------------------
// Real MAO order extracted from Manhattan Active Omni system
// Customer: Thai customer from Nonthaburi
// Items: 17 line items (after quantity splitting)
// Products: Bon Aroma Coffee, Betagro Egg Tofu, Smarter Dental Floss,
//           Tops Frozen Salmon, N&P Hom Banana, Thammachart Seafood, Cubic Wheat Loaf
// Delivery: Home Delivery - 3H Delivery from Tops Westgate1
// Payment: Credit Card, PAID
// Promotions: 3 BOGO promotions (-647.00 total)
// Coupons: AUTOAPPLY (-170.00) + 15FRESH (-100.00)
// Total: 933.00 THB
// -----------------------------------------------------------------------------

const maoOrderW1156251121946800Items = [
  // LINE-W115625-001-0: Bon Aroma Coffee (split 1 of 3)
  {
    id: 'LINE-W115625-001-0',
    product_id: 'BON-AROMA-001',
    product_sku: '5904277114444',
    product_name: 'Bon Aroma Gold Freeze Dried Coffee 100g',
    thaiName: 'บอน อโรมา โกลด์ กาแฟผงสำเร็จรูปฟรีซดราย 100ก.',
    barcode: '5904277114444',
    quantity: 1,
    orderedQty: 1,
    fulfilledQty: 1,
    unit_price: 115,
    total_price: 115,
    uom: 'SBTL',
    location: 'Tops Westgate1',
    fulfillmentStatus: 'DELIVERED',
    shippingMethod: '3H Delivery',
    bundle: false,
    packedOrderedQty: 1,
    route: 'สายรถบางม่วง',
    bookingSlotFrom: '2025-11-21T19:00:00+07:00',
    bookingSlotTo: '2025-11-21T20:00:00+07:00',
    eta: {
      from: '21 Nov 2025 12:00:00',
      to: '21 Nov 2025 13:00:00'
    },
    giftWithPurchase: false,
    priceBreakdown: {
      subtotal: 115,
      discount: 0,
      charges: 0,
      amountExcludedTaxes: 107.48,
      taxes: 7.52,
      amountIncludedTaxes: 115,
      total: 115
    },
    promotions: [
      {
        promotionId: '1700015040',
        promotionType: 'Red Hot',
        discountAmount: 0
      }
    ],
    parentLineId: 'LINE-W115625-001',
    splitIndex: 0,
    splitReason: 'quantity-normalization',
    viewType: 'ECOM-TH-DSS-NW-STD',
    supplyTypeId: 'On Hand Available',
    substitution: false,
    product_details: {
      description: 'Premium roasted coffee beans',
      category: 'Beverages',
      brand: 'Bon Aroma'
    }
  },
  // LINE-W115625-001-1: Bon Aroma Coffee (split 2 of 3)
  {
    id: 'LINE-W115625-001-1',
    product_id: 'BON-AROMA-001',
    product_sku: '5904277114444',
    product_name: 'Bon Aroma Gold Freeze Dried Coffee 100g',
    thaiName: 'บอน อโรมา โกลด์ กาแฟผงสำเร็จรูปฟรีซดราย 100ก.',
    barcode: '5904277114444',
    quantity: 1,
    orderedQty: 1,
    fulfilledQty: 1,
    unit_price: 115,
    total_price: 115,
    uom: 'SBTL',
    location: 'Tops Westgate1',
    fulfillmentStatus: 'DELIVERED',
    shippingMethod: '3H Delivery',
    bundle: false,
    packedOrderedQty: 1,
    route: 'สายรถบางม่วง',
    bookingSlotFrom: '2025-11-21T19:00:00+07:00',
    bookingSlotTo: '2025-11-21T20:00:00+07:00',
    eta: {
      from: '21 Nov 2025 12:00:00',
      to: '21 Nov 2025 13:00:00'
    },
    giftWithPurchase: false,
    priceBreakdown: {
      subtotal: 115,
      discount: 0,
      charges: 0,
      amountExcludedTaxes: 107.48,
      taxes: 7.52,
      amountIncludedTaxes: 115,
      total: 115
    },
    promotions: [
      {
        promotionId: '1700015040',
        promotionType: 'Red Hot',
        discountAmount: 0
      }
    ],
    parentLineId: 'LINE-W115625-001',
    splitIndex: 1,
    splitReason: 'quantity-normalization',
    viewType: 'ECOM-TH-DSS-NW-STD',
    supplyTypeId: 'On Hand Available',
    substitution: false,
    product_details: {
      description: 'Premium roasted coffee beans',
      category: 'Beverages',
      brand: 'Bon Aroma'
    }
  },
  // LINE-W115625-001-2: Bon Aroma Coffee (split 3 of 3)
  {
    id: 'LINE-W115625-001-2',
    product_id: 'BON-AROMA-001',
    product_sku: '5904277114444',
    product_name: 'Bon Aroma Gold Freeze Dried Coffee 100g',
    thaiName: 'บอน อโรมา โกลด์ กาแฟผงสำเร็จรูปฟรีซดราย 100ก.',
    barcode: '5904277114444',
    quantity: 1,
    orderedQty: 1,
    fulfilledQty: 1,
    unit_price: 115,
    total_price: 115,
    uom: 'SBTL',
    location: 'Tops Westgate1',
    fulfillmentStatus: 'DELIVERED',
    shippingMethod: '3H Delivery',
    bundle: false,
    packedOrderedQty: 1,
    route: 'สายรถบางม่วง',
    bookingSlotFrom: '2025-11-21T19:00:00+07:00',
    bookingSlotTo: '2025-11-21T20:00:00+07:00',
    eta: {
      from: '21 Nov 2025 12:00:00',
      to: '21 Nov 2025 13:00:00'
    },
    giftWithPurchase: false,
    priceBreakdown: {
      subtotal: 115,
      discount: 0,
      charges: 0,
      amountExcludedTaxes: 107.48,
      taxes: 7.52,
      amountIncludedTaxes: 115,
      total: 115
    },
    promotions: [
      {
        promotionId: '1700015040',
        promotionType: 'Red Hot',
        discountAmount: 0
      }
    ],
    parentLineId: 'LINE-W115625-001',
    splitIndex: 2,
    splitReason: 'quantity-normalization',
    viewType: 'ECOM-TH-DSS-NW-STD',
    supplyTypeId: 'On Hand Available',
    substitution: false,
    product_details: {
      description: 'Premium roasted coffee beans',
      category: 'Beverages',
      brand: 'Bon Aroma'
    }
  },
  // LINE-W115625-002-0: Betagro Egg Tofu (split 1 of 2)
  {
    id: 'LINE-W115625-002-0',
    product_id: 'BETAGRO-TOFU-001',
    product_sku: '8852043003485',
    product_name: 'Betagro Egg Tofu 120g',
    thaiName: 'เบทาโกร เต้าหู้ไข่ 120ก.',
    barcode: '8852043003485',
    quantity: 1,
    orderedQty: 1,
    fulfilledQty: 1,
    unit_price: 11,
    total_price: 11,
    uom: 'STUB',
    location: 'Tops Westgate1',
    fulfillmentStatus: 'DELIVERED',
    shippingMethod: '3H Delivery',
    bundle: false,
    packedOrderedQty: 1,
    route: 'สายรถบางม่วง',
    bookingSlotFrom: '2025-11-21T19:00:00+07:00',
    bookingSlotTo: '2025-11-21T20:00:00+07:00',
    eta: {
      from: '21 Nov 2025 12:00:00',
      to: '21 Nov 2025 13:00:00'
    },
    giftWithPurchase: false,
    priceBreakdown: {
      subtotal: 11,
      discount: 6.36,
      charges: 0,
      amountExcludedTaxes: 4.34,
      taxes: 0.30,
      amountIncludedTaxes: 4.64,
      total: 4.64
    },
    promotions: [
      {
        promotionId: '5200060159',
        promotionType: 'BOGO',
        discountAmount: -5.50
      },
      {
        promotionId: 'CPN-AUTOAPPLY',
        promotionType: 'Coupon',
        discountAmount: -0.86,
        secretCode: 'AUTOAPPLY',
        couponType: 'CPN9',
        couponId: 'AUTOAPPLY',
        couponName: 'CPN9|AUTOAPPLY'
      }
    ],
    parentLineId: 'LINE-W115625-002',
    splitIndex: 0,
    splitReason: 'quantity-normalization',
    viewType: 'ECOM-TH-DSS-NW-STD',
    supplyTypeId: 'On Hand Available',
    substitution: false,
    product_details: {
      description: 'Fresh egg tofu',
      category: 'Fresh Food',
      brand: 'Betagro'
    }
  },
  // LINE-W115625-002-1: Betagro Egg Tofu (split 2 of 2)
  {
    id: 'LINE-W115625-002-1',
    product_id: 'BETAGRO-TOFU-001',
    product_sku: '8852043003485',
    product_name: 'Betagro Egg Tofu 120g',
    thaiName: 'เบทาโกร เต้าหู้ไข่ 120ก.',
    packedOrderedQty: 1,
    barcode: '8852043003485',
    quantity: 1,
    orderedQty: 1,
    fulfilledQty: 1,
    unit_price: 11,
    total_price: 11,
    uom: 'STUB',
    location: 'Tops Westgate1',
    fulfillmentStatus: 'DELIVERED',
    shippingMethod: '3H Delivery',
    bundle: false,
    route: 'สายรถบางม่วง',
    bookingSlotFrom: '2025-11-21T19:00:00+07:00',
    bookingSlotTo: '2025-11-21T20:00:00+07:00',
    eta: {
      from: '21 Nov 2025 12:00:00',
      to: '21 Nov 2025 13:00:00'
    },
    giftWithPurchase: false,
    priceBreakdown: {
      subtotal: 11,
      discount: 6.37,
      charges: 0,
      amountExcludedTaxes: 4.34,
      taxes: 0.29,
      amountIncludedTaxes: 4.63,
      total: 4.63
    },
    promotions: [
      {
        promotionId: '5200060159',
        promotionType: 'BOGO',
        discountAmount: -5.50
      },
      {
        promotionId: 'CPN-AUTOAPPLY',
        promotionType: 'Coupon',
        discountAmount: -0.87,
        secretCode: 'AUTOAPPLY',
        couponType: 'CPN9',
        couponId: 'AUTOAPPLY',
        couponName: 'CPN9|AUTOAPPLY'
      }
    ],
    parentLineId: 'LINE-W115625-002',
    splitIndex: 1,
    splitReason: 'quantity-normalization',
    viewType: 'ECOM-TH-DSS-NW-STD',
    supplyTypeId: 'On Hand Available',
    substitution: false,
    product_details: {
      description: 'Fresh egg tofu',
      category: 'Fresh Food',
      brand: 'Betagro'
    }
  },
  // LINE-W115625-003: Smarter Dental Floss (no split, qty 1)
  {
    id: 'LINE-W115625-003',
    product_id: 'SMARTER-FLOSS-001',
    product_sku: '8853474057764',
    product_name: 'Smarter Dental Floss Picks 50pcs',
    thaiName: 'สมาร์ทเทอร์ ไหมขัดฟันพร้อมด้าม 50ชิ้น',
    barcode: '8853474057764',
    quantity: 1,
    orderedQty: 1,
    fulfilledQty: 1,
    unit_price: 45,
    total_price: 45,
    uom: 'SPAC',
    location: 'Tops Westgate1',
    fulfillmentStatus: 'DELIVERED',
    shippingMethod: '3H Delivery',
    bundle: false,
    packedOrderedQty: 1,
    route: 'สายรถบางม่วง',
    bookingSlotFrom: '2025-11-21T19:00:00+07:00',
    bookingSlotTo: '2025-11-21T20:00:00+07:00',
    eta: {
      from: '21 Nov 2025 12:00:00',
      to: '21 Nov 2025 13:00:00'
    },
    giftWithPurchase: false,
    priceBreakdown: {
      subtotal: 45,
      discount: 0,
      charges: 0,
      amountExcludedTaxes: 42.06,
      taxes: 2.94,
      amountIncludedTaxes: 45,
      total: 45
    },
    promotions: [
      {
        promotionId: '4300035710',
        promotionType: 'TOPS SALE',
        discountAmount: 0
      }
    ],
    viewType: 'ECOM-TH-DSS-NW-STD',
    supplyTypeId: 'On Hand Available',
    substitution: false,
    product_details: {
      description: 'Premium dental floss picks',
      category: 'Personal Care',
      brand: 'Smarter'
    }
  },
  // LINE-W115625-004-0: Tops Frozen Salmon (split 1 of 4)
  {
    id: 'LINE-W115625-004-0',
    product_id: 'TOPS-SALMON-001',
    product_sku: '8853474080366',
    product_name: 'Tops Frozen Salmon Steak 150g',
    thaiName: 'ท็อปส์ สเต็กแซลมอนแช่แข็ง 150ก.',
    barcode: '8853474080366',
    quantity: 1,
    orderedQty: 1,
    fulfilledQty: 1,
    unit_price: 159,
    total_price: 159,
    uom: 'SPCS',
    location: 'Tops Westgate1',
    fulfillmentStatus: 'DELIVERED',
    shippingMethod: '3H Delivery',
    bundle: false,
    packedOrderedQty: 1,
    route: 'สายรถบางม่วง',
    bookingSlotFrom: '2025-11-21T19:00:00+07:00',
    bookingSlotTo: '2025-11-21T20:00:00+07:00',
    eta: {
      from: '21 Nov 2025 12:00:00',
      to: '21 Nov 2025 13:00:00'
    },
    giftWithPurchase: false,
    priceBreakdown: {
      subtotal: 159,
      discount: 107.01,
      charges: 0,
      amountExcludedTaxes: 48.59,
      taxes: 3.40,
      amountIncludedTaxes: 51.99,
      total: 51.99
    },
    promotions: [
      {
        promotionId: '9400006629',
        promotionType: 'BOGO',
        discountAmount: -79.50
      },
      {
        promotionId: 'CPN-AUTOAPPLY',
        promotionType: 'Coupon',
        discountAmount: -17.77,
        secretCode: 'AUTOAPPLY',
        couponType: 'CPN9'
      },
      {
        promotionId: 'CPN-15FRESH',
        promotionType: 'Coupon',
        discountAmount: -9.74,
        secretCode: '15FRESH',
        couponType: 'CPN2'
      }
    ],
    parentLineId: 'LINE-W115625-004',
    splitIndex: 0,
    splitReason: 'quantity-normalization',
    viewType: 'ECOM-TH-DSS-NW-STD',
    supplyTypeId: 'On Hand Available',
    substitution: false,
    product_details: {
      description: 'Premium frozen salmon steak',
      category: 'Frozen Food',
      brand: 'Tops'
    }
  },
  // LINE-W115625-004-1: Tops Frozen Salmon (split 2 of 4)
  {
    id: 'LINE-W115625-004-1',
    product_id: 'TOPS-SALMON-001',
    product_sku: '8853474080366',
    product_name: 'Tops Frozen Salmon Steak 150g',
    thaiName: 'ท็อปส์ สเต็กแซลมอนแช่แข็ง 150ก.',
    barcode: '8853474080366',
    quantity: 1,
    orderedQty: 1,
    fulfilledQty: 1,
    unit_price: 159,
    total_price: 159,
    uom: 'SPCS',
    location: 'Tops Westgate1',
    fulfillmentStatus: 'DELIVERED',
    shippingMethod: '3H Delivery',
    bundle: false,
    packedOrderedQty: 1,
    route: 'สายรถบางม่วง',
    bookingSlotFrom: '2025-11-21T19:00:00+07:00',
    bookingSlotTo: '2025-11-21T20:00:00+07:00',
    eta: {
      from: '21 Nov 2025 12:00:00',
      to: '21 Nov 2025 13:00:00'
    },
    giftWithPurchase: false,
    priceBreakdown: {
      subtotal: 159,
      discount: 107.01,
      charges: 0,
      amountExcludedTaxes: 48.59,
      taxes: 3.40,
      amountIncludedTaxes: 51.99,
      total: 51.99
    },
    promotions: [
      {
        promotionId: '9400006629',
        promotionType: 'BOGO',
        discountAmount: -79.50
      },
      {
        promotionId: 'CPN-AUTOAPPLY',
        promotionType: 'Coupon',
        discountAmount: -17.77,
        secretCode: 'AUTOAPPLY',
        couponType: 'CPN9'
      },
      {
        promotionId: 'CPN-15FRESH',
        promotionType: 'Coupon',
        discountAmount: -9.74,
        secretCode: '15FRESH',
        couponType: 'CPN2'
      }
    ],
    parentLineId: 'LINE-W115625-004',
    splitIndex: 1,
    splitReason: 'quantity-normalization',
    viewType: 'ECOM-TH-DSS-NW-STD',
    supplyTypeId: 'On Hand Available',
    substitution: false,
    product_details: {
      description: 'Premium frozen salmon steak',
      category: 'Frozen Food',
      brand: 'Tops'
    }
  },
  // LINE-W115625-004-2: Tops Frozen Salmon (split 3 of 4)
  {
    id: 'LINE-W115625-004-2',
    product_id: 'TOPS-SALMON-001',
    product_sku: '8853474080366',
    product_name: 'Tops Frozen Salmon Steak 150g',
    thaiName: 'ท็อปส์ สเต็กแซลมอนแช่แข็ง 150ก.',
    barcode: '8853474080366',
    quantity: 1,
    orderedQty: 1,
    fulfilledQty: 1,
    unit_price: 159,
    total_price: 159,
    uom: 'SPCS',
    location: 'Tops Westgate1',
    fulfillmentStatus: 'DELIVERED',
    shippingMethod: '3H Delivery',
    bundle: false,
    packedOrderedQty: 1,
    route: 'สายรถบางม่วง',
    bookingSlotFrom: '2025-11-21T19:00:00+07:00',
    bookingSlotTo: '2025-11-21T20:00:00+07:00',
    eta: {
      from: '21 Nov 2025 12:00:00',
      to: '21 Nov 2025 13:00:00'
    },
    giftWithPurchase: false,
    priceBreakdown: {
      subtotal: 159,
      discount: 107.01,
      charges: 0,
      amountExcludedTaxes: 48.59,
      taxes: 3.40,
      amountIncludedTaxes: 51.99,
      total: 51.99
    },
    promotions: [
      {
        promotionId: '9400006629',
        promotionType: 'BOGO',
        discountAmount: -79.50
      },
      {
        promotionId: 'CPN-AUTOAPPLY',
        promotionType: 'Coupon',
        discountAmount: -17.77,
        secretCode: 'AUTOAPPLY',
        couponType: 'CPN9'
      },
      {
        promotionId: 'CPN-15FRESH',
        promotionType: 'Coupon',
        discountAmount: -9.74,
        secretCode: '15FRESH',
        couponType: 'CPN2'
      }
    ],
    parentLineId: 'LINE-W115625-004',
    splitIndex: 2,
    splitReason: 'quantity-normalization',
    viewType: 'ECOM-TH-DSS-NW-STD',
    supplyTypeId: 'On Hand Available',
    substitution: false,
    product_details: {
      description: 'Premium frozen salmon steak',
      category: 'Frozen Food',
      brand: 'Tops'
    }
  },
  // LINE-W115625-004-3: Tops Frozen Salmon (split 4 of 4)
  {
    id: 'LINE-W115625-004-3',
    product_id: 'TOPS-SALMON-001',
    product_sku: '8853474080366',
    product_name: 'Tops Frozen Salmon Steak 150g',
    thaiName: 'ท็อปส์ สเต็กแซลมอนแช่แข็ง 150ก.',
    barcode: '8853474080366',
    quantity: 1,
    orderedQty: 1,
    fulfilledQty: 1,
    unit_price: 159,
    total_price: 159,
    uom: 'SPCS',
    location: 'Tops Westgate1',
    fulfillmentStatus: 'DELIVERED',
    shippingMethod: '3H Delivery',
    bundle: false,
    packedOrderedQty: 1,
    route: 'สายรถบางม่วง',
    bookingSlotFrom: '2025-11-21T19:00:00+07:00',
    bookingSlotTo: '2025-11-21T20:00:00+07:00',
    eta: {
      from: '21 Nov 2025 12:00:00',
      to: '21 Nov 2025 13:00:00'
    },
    giftWithPurchase: false,
    priceBreakdown: {
      subtotal: 159,
      discount: 107.01,
      charges: 0,
      amountExcludedTaxes: 48.59,
      taxes: 3.40,
      amountIncludedTaxes: 51.99,
      total: 51.99
    },
    promotions: [
      {
        promotionId: '9400006629',
        promotionType: 'BOGO',
        discountAmount: -79.50
      },
      {
        promotionId: 'CPN-AUTOAPPLY',
        promotionType: 'Coupon',
        discountAmount: -17.77,
        secretCode: 'AUTOAPPLY',
        couponType: 'CPN9'
      },
      {
        promotionId: 'CPN-15FRESH',
        promotionType: 'Coupon',
        discountAmount: -9.74,
        secretCode: '15FRESH',
        couponType: 'CPN2'
      }
    ],
    parentLineId: 'LINE-W115625-004',
    splitIndex: 3,
    splitReason: 'quantity-normalization',
    viewType: 'ECOM-TH-DSS-NW-STD',
    supplyTypeId: 'On Hand Available',
    substitution: false,
    product_details: {
      description: 'Premium frozen salmon steak',
      category: 'Frozen Food',
      brand: 'Tops'
    }
  },
  // LINE-W115625-005: N&P Hom Banana (no split, qty 1)
  {
    id: 'LINE-W115625-005',
    product_id: 'NP-BANANA-001',
    product_sku: '8858738405534',
    product_name: 'N&P Hom Banana Pack 2(C',
    thaiName: 'เอ็น แอนด์ พี กล้วยหอม แพ็ค 2(C',
    barcode: '8858738405534',
    quantity: 1,
    orderedQty: 1,
    fulfilledQty: 1,
    unit_price: 28,
    total_price: 28,
    uom: 'SPAC',
    location: 'Tops Westgate1',
    fulfillmentStatus: 'DELIVERED',
    shippingMethod: '3H Delivery',
    bundle: false,
    packedOrderedQty: 1,
    route: 'สายรถบางม่วง',
    bookingSlotFrom: '2025-11-21T19:00:00+07:00',
    bookingSlotTo: '2025-11-21T20:00:00+07:00',
    eta: {
      from: '21 Nov 2025 12:00:00',
      to: '21 Nov 2025 13:00:00'
    },
    giftWithPurchase: false,
    priceBreakdown: {
      subtotal: 28,
      discount: 8.12,
      charges: 0,
      amountExcludedTaxes: 18.58,
      taxes: 1.30,
      amountIncludedTaxes: 19.88,
      total: 19.88
    },
    promotions: [
      {
        promotionId: 'CPN-AUTOAPPLY',
        promotionType: 'Coupon',
        discountAmount: -4.40,
        secretCode: 'AUTOAPPLY',
        couponType: 'CPN9'
      },
      {
        promotionId: 'CPN-15FRESH',
        promotionType: 'Coupon',
        discountAmount: -3.72,
        secretCode: '15FRESH',
        couponType: 'CPN2'
      }
    ],
    viewType: 'ECOM-TH-DSS-NW-STD',
    supplyTypeId: 'On Hand Available',
    substitution: false,
    product_details: {
      description: 'Fresh hom banana pack',
      category: 'Fresh Produce',
      brand: 'N&P'
    }
  },
  // LINE-W115625-006-0: Thammachart Seafood (split 1 of 4)
  {
    id: 'LINE-W115625-006-0',
    product_id: 'THAMMACHART-SALMON-001',
    product_sku: '8858781403990',
    product_name: 'Thammachart Seafood Frozen Atlantic Salmon Steak',
    thaiName: 'ธรรมชาติซีฟู้ด สเต็กแซลมอนแอตแลนติกแช่แข็ง',
    barcode: '8858781403990',
    quantity: 1,
    orderedQty: 1,
    fulfilledQty: 1,
    unit_price: 159,
    total_price: 159,
    uom: 'SPCS',
    location: 'Tops Westgate1',
    fulfillmentStatus: 'DELIVERED',
    shippingMethod: '3H Delivery',
    bundle: false,
    packedOrderedQty: 1,
    route: 'สายรถบางม่วง',
    bookingSlotFrom: '2025-11-21T19:00:00+07:00',
    bookingSlotTo: '2025-11-21T20:00:00+07:00',
    eta: {
      from: '21 Nov 2025 12:00:00',
      to: '21 Nov 2025 13:00:00'
    },
    giftWithPurchase: false,
    priceBreakdown: {
      subtotal: 159,
      discount: 89.24,
      charges: 0,
      amountExcludedTaxes: 65.19,
      taxes: 4.57,
      amountIncludedTaxes: 69.76,
      total: 69.76
    },
    promotions: [
      {
        promotionId: '9400006713',
        promotionType: 'BOGO',
        discountAmount: -79.50
      },
      {
        promotionId: 'CPN-15FRESH',
        promotionType: 'Coupon',
        discountAmount: -9.74,
        secretCode: '15FRESH',
        couponType: 'CPN2'
      }
    ],
    parentLineId: 'LINE-W115625-006',
    splitIndex: 0,
    splitReason: 'quantity-normalization',
    viewType: 'ECOM-TH-DSS-NW-STD',
    supplyTypeId: 'On Hand Available',
    substitution: false,
    product_details: {
      description: 'Premium salmon fillet',
      category: 'Fresh Seafood',
      brand: 'Thammachart'
    }
  },
  // LINE-W115625-006-1: Thammachart Seafood (split 2 of 4)
  {
    id: 'LINE-W115625-006-1',
    product_id: 'THAMMACHART-SALMON-001',
    product_sku: '8858781403990',
    product_name: 'Thammachart Seafood Frozen Atlantic Salmon Steak',
    thaiName: 'ธรรมชาติซีฟู้ด สเต็กแซลมอนแอตแลนติกแช่แข็ง',
    barcode: '8858781403990',
    quantity: 1,
    orderedQty: 1,
    fulfilledQty: 1,
    unit_price: 159,
    total_price: 159,
    uom: 'SPCS',
    location: 'Tops Westgate1',
    fulfillmentStatus: 'DELIVERED',
    shippingMethod: '3H Delivery',
    bundle: false,
    packedOrderedQty: 1,
    route: 'สายรถบางม่วง',
    bookingSlotFrom: '2025-11-21T19:00:00+07:00',
    bookingSlotTo: '2025-11-21T20:00:00+07:00',
    eta: {
      from: '21 Nov 2025 12:00:00',
      to: '21 Nov 2025 13:00:00'
    },
    giftWithPurchase: false,
    priceBreakdown: {
      subtotal: 159,
      discount: 89.24,
      charges: 0,
      amountExcludedTaxes: 65.19,
      taxes: 4.57,
      amountIncludedTaxes: 69.76,
      total: 69.76
    },
    promotions: [
      {
        promotionId: '9400006713',
        promotionType: 'BOGO',
        discountAmount: -79.50
      },
      {
        promotionId: 'CPN-15FRESH',
        promotionType: 'Coupon',
        discountAmount: -9.74,
        secretCode: '15FRESH',
        couponType: 'CPN2'
      }
    ],
    parentLineId: 'LINE-W115625-006',
    splitIndex: 1,
    splitReason: 'quantity-normalization',
    viewType: 'ECOM-TH-DSS-NW-STD',
    supplyTypeId: 'On Hand Available',
    substitution: false,
    product_details: {
      description: 'Premium salmon fillet',
      category: 'Fresh Seafood',
      brand: 'Thammachart'
    }
  },
  // LINE-W115625-006-2: Thammachart Seafood (split 3 of 4)
  {
    id: 'LINE-W115625-006-2',
    product_id: 'THAMMACHART-SALMON-001',
    product_sku: '8858781403990',
    product_name: 'Thammachart Seafood Frozen Atlantic Salmon Steak',
    thaiName: 'ธรรมชาติซีฟู้ด สเต็กแซลมอนแอตแลนติกแช่แข็ง',
    barcode: '8858781403990',
    quantity: 1,
    orderedQty: 1,
    fulfilledQty: 1,
    unit_price: 159,
    total_price: 159,
    uom: 'SPCS',
    location: 'Tops Westgate1',
    fulfillmentStatus: 'DELIVERED',
    shippingMethod: '3H Delivery',
    bundle: false,
    packedOrderedQty: 1,
    route: 'สายรถบางม่วง',
    bookingSlotFrom: '2025-11-21T19:00:00+07:00',
    bookingSlotTo: '2025-11-21T20:00:00+07:00',
    eta: {
      from: '21 Nov 2025 12:00:00',
      to: '21 Nov 2025 13:00:00'
    },
    giftWithPurchase: false,
    priceBreakdown: {
      subtotal: 159,
      discount: 89.24,
      charges: 0,
      amountExcludedTaxes: 65.19,
      taxes: 4.57,
      amountIncludedTaxes: 69.76,
      total: 69.76
    },
    promotions: [
      {
        promotionId: '9400006713',
        promotionType: 'BOGO',
        discountAmount: -79.50
      },
      {
        promotionId: 'CPN-15FRESH',
        promotionType: 'Coupon',
        discountAmount: -9.74,
        secretCode: '15FRESH',
        couponType: 'CPN2'
      }
    ],
    parentLineId: 'LINE-W115625-006',
    splitIndex: 2,
    splitReason: 'quantity-normalization',
    viewType: 'ECOM-TH-DSS-NW-STD',
    supplyTypeId: 'On Hand Available',
    substitution: false,
    product_details: {
      description: 'Premium salmon fillet',
      category: 'Fresh Seafood',
      brand: 'Thammachart'
    }
  },
  // LINE-W115625-006-3: Thammachart Seafood (split 4 of 4)
  {
    id: 'LINE-W115625-006-3',
    product_id: 'THAMMACHART-SALMON-001',
    product_sku: '8858781403990',
    product_name: 'Thammachart Seafood Frozen Atlantic Salmon Steak',
    thaiName: 'ธรรมชาติซีฟู้ด สเต็กแซลมอนแอตแลนติกแช่แข็ง',
    barcode: '8858781403990',
    quantity: 1,
    orderedQty: 1,
    fulfilledQty: 1,
    unit_price: 159,
    total_price: 159,
    uom: 'SPCS',
    location: 'Tops Westgate1',
    fulfillmentStatus: 'DELIVERED',
    shippingMethod: '3H Delivery',
    bundle: false,
    packedOrderedQty: 1,
    route: 'สายรถบางม่วง',
    bookingSlotFrom: '2025-11-21T19:00:00+07:00',
    bookingSlotTo: '2025-11-21T20:00:00+07:00',
    eta: {
      from: '21 Nov 2025 12:00:00',
      to: '21 Nov 2025 13:00:00'
    },
    giftWithPurchase: false,
    priceBreakdown: {
      subtotal: 159,
      discount: 89.24,
      charges: 0,
      amountExcludedTaxes: 65.19,
      taxes: 4.57,
      amountIncludedTaxes: 69.76,
      total: 69.76
    },
    promotions: [
      {
        promotionId: '9400006713',
        promotionType: 'BOGO',
        discountAmount: -79.50
      },
      {
        promotionId: 'CPN-15FRESH',
        promotionType: 'Coupon',
        discountAmount: -9.74,
        secretCode: '15FRESH',
        couponType: 'CPN2'
      }
    ],
    parentLineId: 'LINE-W115625-006',
    splitIndex: 3,
    splitReason: 'quantity-normalization',
    viewType: 'ECOM-TH-DSS-NW-STD',
    supplyTypeId: 'On Hand Available',
    substitution: false,
    product_details: {
      description: 'Premium salmon fillet',
      category: 'Fresh Seafood',
      brand: 'Thammachart'
    }
  },
  // LINE-W115625-007-0: Cubic Wheat Loaf (split 1 of 2)
  {
    id: 'LINE-W115625-007-0',
    product_id: 'CUBIC-BREAD-001',
    product_sku: '8858894100014',
    product_name: 'Cubic Original Wheat Loaf(C',
    thaiName: 'คิวบิก ขนมปังโฮลวีทออริจินัล(C',
    barcode: '8858894100014',
    quantity: 1,
    orderedQty: 1,
    fulfilledQty: 1,
    unit_price: 69,
    total_price: 69,
    uom: 'SPCS',
    location: 'Tops Westgate1',
    fulfillmentStatus: 'DELIVERED',
    shippingMethod: '3H Delivery',
    bundle: false,
    packedOrderedQty: 1,
    route: 'สายรถบางม่วง',
    bookingSlotFrom: '2025-11-21T19:00:00+07:00',
    bookingSlotTo: '2025-11-21T20:00:00+07:00',
    eta: {
      from: '21 Nov 2025 12:00:00',
      to: '21 Nov 2025 13:00:00'
    },
    giftWithPurchase: false,
    priceBreakdown: {
      subtotal: 69,
      discount: 9.18,
      charges: 0,
      amountExcludedTaxes: 55.90,
      taxes: 3.92,
      amountIncludedTaxes: 59.82,
      total: 59.82
    },
    promotions: [
      {
        promotionId: 'CPN-15FRESH',
        promotionType: 'Coupon',
        discountAmount: -9.18,
        secretCode: '15FRESH',
        couponType: 'CPN2'
      }
    ],
    parentLineId: 'LINE-W115625-007',
    splitIndex: 0,
    splitReason: 'quantity-normalization',
    viewType: 'ECOM-TH-DSS-NW-STD',
    supplyTypeId: 'On Hand Available',
    substitution: false,
    product_details: {
      description: 'Fresh whole wheat bread',
      category: 'Bakery',
      brand: 'Cubic'
    }
  },
  // LINE-W115625-007-1: Cubic Wheat Loaf (split 2 of 2)
  {
    id: 'LINE-W115625-007-1',
    product_id: 'CUBIC-BREAD-001',
    product_sku: '8858894100014',
    product_name: 'Cubic Original Wheat Loaf(C',
    thaiName: 'คิวบิก ขนมปังโฮลวีทออริจินัล(C',
    barcode: '8858894100014',
    quantity: 1,
    orderedQty: 1,
    fulfilledQty: 1,
    unit_price: 69,
    total_price: 69,
    uom: 'SPCS',
    location: 'Tops Westgate1',
    fulfillmentStatus: 'DELIVERED',
    shippingMethod: '3H Delivery',
    bundle: false,
    packedOrderedQty: 1,
    route: 'สายรถบางม่วง',
    bookingSlotFrom: '2025-11-21T19:00:00+07:00',
    bookingSlotTo: '2025-11-21T20:00:00+07:00',
    eta: {
      from: '21 Nov 2025 12:00:00',
      to: '21 Nov 2025 13:00:00'
    },
    giftWithPurchase: false,
    priceBreakdown: {
      subtotal: 69,
      discount: 9.17,
      charges: 0,
      amountExcludedTaxes: 55.91,
      taxes: 3.92,
      amountIncludedTaxes: 59.83,
      total: 59.83
    },
    promotions: [
      {
        promotionId: 'CPN-15FRESH',
        promotionType: 'Coupon',
        discountAmount: -9.17,
        secretCode: '15FRESH',
        couponType: 'CPN2'
      }
    ],
    parentLineId: 'LINE-W115625-007',
    splitIndex: 1,
    splitReason: 'quantity-normalization',
    viewType: 'ECOM-TH-DSS-NW-STD',
    supplyTypeId: 'On Hand Available',
    substitution: false,
    product_details: {
      description: 'Fresh whole wheat bread',
      category: 'Bakery',
      brand: 'Cubic'
    }
  }
];

// MAO Order W1156251121946800 - Complete Order Object
const maoOrderW1156251121946800 = {
  id: 'W1156251121946800',
  order_no: 'W1156251121946800',
  organization: 'CFR',
  order_date: '2025-11-21T10:42:00+07:00',
  business_unit: 'Tops',
  order_type: 'DELIVERY',
  sellingChannel: 'web',
  channel: 'web',
  status: 'DELIVERED',
  customer: {
    id: 'CUST-W115625-001',
    name: 'WEERAPAT WIRUNTANGTRAKUL',
    email: 'wee.wirun@gmail.com',
    phone: '0804411221',
    customerType: 'INDIVIDUAL',
    custRef: '2403601305',
    T1Number: '8048068914',
    taxId: '1100900457471',
    customerTypeId: 'cluster_3 - Prime'
  },
  shipping_address: {
    street: '59/20 หมู่ 11 หมู่บ้านยูเทรียมพลัสวัน ซอยวัดพระเงิน',
    subdistrict: 'Bang Muang',
    city: 'Bang Yai',
    state: 'Nonthaburi',
    postal_code: '11140',
    country: 'TH'
  },
  items: maoOrderW1156251121946800Items,
  pricingBreakdown: {
    subtotal: 1850,
    orderDiscount: 0,
    lineItemDiscount: 917,
    taxAmount: 32.53,
    taxBreakdown: maoOrderW1156251121946800Items.map(item => ({
      lineId: item.id,
      taxAmount: item.priceBreakdown.taxes
    })),
    shippingFee: 0,
    additionalFees: 0,
    grandTotal: 933,
    paidAmount: 933,
    currency: 'THB'
  },
  total_amount: 933,
  payment_info: {
    method: 'CREDIT_CARD',
    status: 'PAID',
    transaction_id: '17636994333493701826',
    subtotal: 1850,
    discounts: 917,
    charges: 0,
    amountIncludedTaxes: 933,
    amountExcludedTaxes: 900.47,
    taxes: 32.53,
    cardNumber: '525667XXXXXX4575',
    expiryDate: '**/****'
  },
  paymentDetails: [
    {
      id: 'PAY-W1156251121946800-001',
      method: 'CREDIT_CARD',
      status: 'PAID',
      transactionId: '17636994333493701826',
      amount: 933,
      currency: 'THB',
      date: '2025-11-21T10:45:00+07:00',
      gateway: 'KBank',
      cardNumber: '525667XXXXXX4575',
      expiryDate: '**/****'
    }
  ],
  orderDiscounts: [
    {
      amount: 647,
      type: 'BOGO_PROMOTIONS',
      description: 'BOGO Promotions (3 items)'
    },
    {
      amount: 270,
      type: 'COUPONS',
      description: 'Coupon Discounts (AUTOAPPLY + 15FRESH)'
    }
  ],
  promotions: [
    {
      promotionId: '5200060159',
      promotionName: 'BOGO - Betagro Egg Tofu',
      promotionType: 'BOGO',
      discountAmount: -11.00
    },
    {
      promotionId: '9400006629',
      promotionName: 'BOGO - Frozen Salmon',
      promotionType: 'BOGO',
      discountAmount: -318.00
    },
    {
      promotionId: '9400006629',
      promotionName: 'BOGO - Thammachart Seafood',
      promotionType: 'BOGO',
      discountAmount: -318.00
    }
  ],
  couponCodes: [
    {
      code: 'AUTOAPPLY',
      description: 'CPN9|AUTOAPPLY',
      discountAmount: -170.00,
      appliedAt: '2025-11-21T10:42:00+07:00'
    },
    {
      code: '15FRESH',
      description: 'CPN2|15FRESH',
      discountAmount: -100.00,
      appliedAt: '2025-11-21T10:42:00+07:00'
    }
  ],
  deliveryMethods: [
    {
      type: 'HOME_DELIVERY' as DeliveryMethodType,
      itemCount: 17,
      homeDelivery: {
        recipient: 'WEERAPAT WIRUNTANGTRAKUL',
        phone: '0804411221',
        address: '59/20 หมู่ 11 หมู่บ้านยูเทรียมพลัสวัน ซอยวัดพระเงิน',
        district: 'Bang Muang',
        city: 'Bang Yai',
        postalCode: '11140',
        specialInstructions: '3H Delivery - กรุณาโทรก่อนส่ง'
      }
    }
  ],
  deliveryTypeCode: 'HOME_DELIVERY_3H',
  sla_info: {
    target_minutes: 180,
    elapsed_minutes: 165,
    status: 'COMPLIANT'
  },
  metadata: {
    created_at: '2025-11-21T10:42:00+07:00',
    updated_at: '2025-11-21T13:00:00+07:00',
    priority: 'NORMAL',
    store_name: 'Tops Westgate1',
    store_no: '',
    order_created: '2025-11-21T10:42:00+07:00',
    viewTypes: ['ECOM-TH-DSS-NW-STD']
  },
  on_hold: false,
  fullTaxInvoice: true,
  customerTypeId: 'cluster_3 - Prime',
  allowSubstitution: true,
  allow_substitution: true,
  currency: 'THB',
  capturedDate: '2025-11-21T10:45:00+07:00',
  t1Member: '8048068914',
  confirmedDate: '2025-11-21T10:46:00+07:00',
  billingName: 'วีรภัทร วิรุฬห์ตั้งตระกูล',
  billingAddress: {
    street: '59/20 หมู่ 11 หมู่บ้านยูเทรียมพลัสวัน',
    subdistrict: 'Bang Muang',
    city: 'Bang Yai',
    state: 'Nonthaburi',
    postal_code: '11140',
    country: 'TH'
  },
  trackingNumber: 'TRKW1156251121946800',
  shippedFrom: 'Tops Westgate1',
  shippedOn: '2025-11-21T11:30:00+07:00',
  eta: '11/21/2025',
  relNo: 'W11562511219468001',
  subdistrict: 'Bang Muang',
  fulfillmentTimeline: [
    {
      id: 'FUL-HD-W1156251121946800-001',
      status: 'Picking',
      timestamp: '2025-11-21T10:45:30',
      details: 'Items being picked from store'
    },
    {
      id: 'FUL-HD-W1156251121946800-002',
      status: 'Picked',
      timestamp: '2025-11-21T11:06:35',
      details: 'All items picked'
    },
    {
      id: 'FUL-HD-W1156251121946800-003',
      status: 'Packed',
      timestamp: '2025-11-21T11:29:32',
      details: 'Order packed and ready'
    },
    {
      id: 'FUL-HD-W1156251121946800-004',
      status: 'Ready To Ship',
      timestamp: '2025-11-21T11:30:33',
      details: 'Order ready for carrier pickup'
    }
  ],
  // Pre-defined tracking data for MAO order W1156251121946800
  // Structured to match TrackingShipment interface in src/types/audit.ts
  tracking: [
    {
      trackingNumber: 'TRKW1156251121946800',
      carrier: 'Home Delivery',
      status: 'DELIVERED',
      eta: '21/11/2025',
      shippedOn: '21/11/2025',
      relNo: 'W11562511219468001',
      shippedFrom: 'Tops Westgate1',
      subdistrict: 'Bang Muang',
      shipToAddress: {
        email: 'wee.wirun@gmail.com',
        name: 'WEERAPAT WIRUNTANGTRAKUL',
        address: '59/20 หมู่ 11 หมู่บ้านยูเทรียมพลัสวัน ซอยวัดพระเงิน',
        fullAddress: 'Bang Muang, Bang Yai, Nonthaburi 11140',
        allocationType: 'Delivery',
        phone: '0804411221'
      },
      trackingUrl: 'https://share.lalamove.com/?TH100251121123033575110010048622967&lang=en_TH&sign=8cef48844c3b24015cf7750c690d4a',
      shipmentType: 'HOME_DELIVERY',
      // Shipped items aggregated from order line items
      shippedItems: [
        { productName: 'Bon Aroma Gold Freeze Dried Coffee 100g', sku: '5904277114444', shippedQty: 3, orderedQty: 3, uom: 'SBTL' },
        { productName: 'Betagro Egg Tofu 120g', sku: '8852043003485', shippedQty: 2, orderedQty: 2, uom: 'STUB' },
        { productName: 'Smarter Dental Floss Picks 50pcs', sku: '8853474057764', shippedQty: 1, orderedQty: 1, uom: 'SPAC' },
        { productName: 'Tops Frozen Salmon Steak 150g', sku: '8853474080366', shippedQty: 4, orderedQty: 4, uom: 'SPCS' },
        { productName: 'N&P Hom Banana Pack 2', sku: '8858738405534', shippedQty: 1, orderedQty: 1, uom: 'SPAC' },
        { productName: 'Thammachart Seafood Frozen Atlantic Salmon Steak', sku: '8858781403990', shippedQty: 4, orderedQty: 4, uom: 'SPCS' },
        { productName: 'Cubic Original Wheat Loaf', sku: '8858894100014', shippedQty: 2, orderedQty: 2, uom: 'SPCS' }
      ],
      // Carrier tracking events only - fulfillment events are in fulfillmentTimeline
      events: [
        { status: 'Out for Delivery', timestamp: '2025-11-21T11:39:33', location: 'Bang Yai' },
        { status: 'Delivered', timestamp: '2025-11-21T11:51:14', location: 'Bang Muang, Bang Yai' }
      ]
    }
  ]
};
// MAO Order W1156251121946800 Audit Trail - 439 events extracted from MAO system
const maoOrderW1156251121946800AuditTrail: ManhattanAuditEvent[] = [
  {
    "id": "AUDIT-W1156251121946800-0001",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4TMS",
    "updatedOn": "11/21/2025 11:51 ICT",
    "entityName": "QuantityDetail",
    "entityId": "252256219114609171599:5904277114444",
    "changedParameter": "Inserted QuantityDetail",
    "oldValue": null,
    "newValue": "252256219114609171599"
  },
  {
    "id": "AUDIT-W1156251121946800-0002",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4TMS",
    "updatedOn": "11/21/2025 11:51 ICT",
    "entityName": "QuantityDetail",
    "entityId": "252256225077022384261:8852043003485",
    "changedParameter": "Inserted QuantityDetail",
    "oldValue": null,
    "newValue": "252256225077022384261"
  },
  {
    "id": "AUDIT-W1156251121946800-0003",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4TMS",
    "updatedOn": "11/21/2025 11:51 ICT",
    "entityName": "QuantityDetail",
    "entityId": "252256228351811076048:8853474057764",
    "changedParameter": "Inserted QuantityDetail",
    "oldValue": null,
    "newValue": "252256228351811076048"
  },
  {
    "id": "AUDIT-W1156251121946800-0004",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4TMS",
    "updatedOn": "11/21/2025 11:51 ICT",
    "entityName": "QuantityDetail",
    "entityId": "252256231339964971809:8853474080366",
    "changedParameter": "Inserted QuantityDetail",
    "oldValue": null,
    "newValue": "252256231339964971809"
  },
  {
    "id": "AUDIT-W1156251121946800-0005",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4TMS",
    "updatedOn": "11/21/2025 11:51 ICT",
    "entityName": "QuantityDetail",
    "entityId": "252256233765299224737:8858738405534",
    "changedParameter": "Inserted QuantityDetail",
    "oldValue": null,
    "newValue": "252256233765299224737"
  },
  {
    "id": "AUDIT-W1156251121946800-0006",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4TMS",
    "updatedOn": "11/21/2025 11:51 ICT",
    "entityName": "QuantityDetail",
    "entityId": "252256236232097355152:8858781403990",
    "changedParameter": "Inserted QuantityDetail",
    "oldValue": null,
    "newValue": "252256236232097355152"
  },
  {
    "id": "AUDIT-W1156251121946800-0007",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4TMS",
    "updatedOn": "11/21/2025 11:51 ICT",
    "entityName": "QuantityDetail",
    "entityId": "252256238927689557377:8858894100014",
    "changedParameter": "Inserted QuantityDetail",
    "oldValue": null,
    "newValue": "252256238927689557377"
  },
  {
    "id": "AUDIT-W1156251121946800-0008",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4TMS",
    "updatedOn": "11/21/2025 11:51 ICT",
    "entityName": "OrderTrackingDetail",
    "entityId": "TRKW1156251121946800-5",
    "changedParameter": "Inserted OrderTrackingDetail",
    "oldValue": null,
    "newValue": "TRKW1156251121946800-5"
  },
  {
    "id": "AUDIT-W1156251121946800-0009",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4TMS",
    "updatedOn": "11/21/2025 11:51 ICT",
    "entityName": "Order",
    "entityId": "W1156251121946800",
    "changedParameter": "Changed ArchiveDate from 2026-02-19T04:39:36.769 to 2026-02-19T04:51:14.727484",
    "oldValue": "2026-02-19T04:39:36.769",
    "newValue": "2026-02-19T04:51:14.727484"
  },
  {
    "id": "AUDIT-W1156251121946800-0010",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4TMS",
    "updatedOn": "11/21/2025 11:51 ICT",
    "entityName": "Order",
    "entityId": "W1156251121946800",
    "changedParameter": "Changed MaxFulfillmentStatusId from Fulfilled to Delivered",
    "oldValue": "Fulfilled",
    "newValue": "Delivered"
  },
  {
    "id": "AUDIT-W1156251121946800-0011",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4TMS",
    "updatedOn": "11/21/2025 11:51 ICT",
    "entityName": "Order",
    "entityId": "W1156251121946800",
    "changedParameter": "Changed MinFulfillmentStatusId from Fulfilled to Delivered",
    "oldValue": "Fulfilled",
    "newValue": "Delivered"
  },
  {
    "id": "AUDIT-W1156251121946800-0012",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4TMS",
    "updatedOn": "11/21/2025 11:51 ICT",
    "entityName": "OrderLine",
    "entityId": "1",
    "changedParameter": "Changed MaxFulfillmentStatusId from Fulfilled to Delivered",
    "oldValue": "Fulfilled",
    "newValue": "Delivered"
  },
  {
    "id": "AUDIT-W1156251121946800-0013",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4TMS",
    "updatedOn": "11/21/2025 11:51 ICT",
    "entityName": "OrderLine",
    "entityId": "1",
    "changedParameter": "Changed MinFulfillmentStatusId from Fulfilled to Delivered",
    "oldValue": "Fulfilled",
    "newValue": "Delivered"
  },
  {
    "id": "AUDIT-W1156251121946800-0014",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4TMS",
    "updatedOn": "11/21/2025 11:51 ICT",
    "entityName": "OrderLine",
    "entityId": "2",
    "changedParameter": "Changed MaxFulfillmentStatusId from Fulfilled to Delivered",
    "oldValue": "Fulfilled",
    "newValue": "Delivered"
  },
  {
    "id": "AUDIT-W1156251121946800-0015",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4TMS",
    "updatedOn": "11/21/2025 11:51 ICT",
    "entityName": "OrderLine",
    "entityId": "2",
    "changedParameter": "Changed MinFulfillmentStatusId from Fulfilled to Delivered",
    "oldValue": "Fulfilled",
    "newValue": "Delivered"
  },
  {
    "id": "AUDIT-W1156251121946800-0016",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4TMS",
    "updatedOn": "11/21/2025 11:51 ICT",
    "entityName": "OrderLine",
    "entityId": "3",
    "changedParameter": "Changed MaxFulfillmentStatusId from Fulfilled to Delivered",
    "oldValue": "Fulfilled",
    "newValue": "Delivered"
  },
  {
    "id": "AUDIT-W1156251121946800-0017",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4TMS",
    "updatedOn": "11/21/2025 11:51 ICT",
    "entityName": "OrderLine",
    "entityId": "3",
    "changedParameter": "Changed MinFulfillmentStatusId from Fulfilled to Delivered",
    "oldValue": "Fulfilled",
    "newValue": "Delivered"
  },
  {
    "id": "AUDIT-W1156251121946800-0018",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4TMS",
    "updatedOn": "11/21/2025 11:51 ICT",
    "entityName": "OrderLine",
    "entityId": "4",
    "changedParameter": "Changed MaxFulfillmentStatusId from Fulfilled to Delivered",
    "oldValue": "Fulfilled",
    "newValue": "Delivered"
  },
  {
    "id": "AUDIT-W1156251121946800-0019",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4TMS",
    "updatedOn": "11/21/2025 11:51 ICT",
    "entityName": "OrderLine",
    "entityId": "4",
    "changedParameter": "Changed MinFulfillmentStatusId from Fulfilled to Delivered",
    "oldValue": "Fulfilled",
    "newValue": "Delivered"
  },
  {
    "id": "AUDIT-W1156251121946800-0020",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4TMS",
    "updatedOn": "11/21/2025 11:51 ICT",
    "entityName": "OrderLine",
    "entityId": "5",
    "changedParameter": "Changed MaxFulfillmentStatusId from Fulfilled to Delivered",
    "oldValue": "Fulfilled",
    "newValue": "Delivered"
  },
  {
    "id": "AUDIT-W1156251121946800-0021",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4TMS",
    "updatedOn": "11/21/2025 11:51 ICT",
    "entityName": "OrderLine",
    "entityId": "5",
    "changedParameter": "Changed MinFulfillmentStatusId from Fulfilled to Delivered",
    "oldValue": "Fulfilled",
    "newValue": "Delivered"
  },
  {
    "id": "AUDIT-W1156251121946800-0022",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4TMS",
    "updatedOn": "11/21/2025 11:51 ICT",
    "entityName": "OrderLine",
    "entityId": "6",
    "changedParameter": "Changed MaxFulfillmentStatusId from Fulfilled to Delivered",
    "oldValue": "Fulfilled",
    "newValue": "Delivered"
  },
  {
    "id": "AUDIT-W1156251121946800-0023",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4TMS",
    "updatedOn": "11/21/2025 11:51 ICT",
    "entityName": "OrderLine",
    "entityId": "6",
    "changedParameter": "Changed MinFulfillmentStatusId from Fulfilled to Delivered",
    "oldValue": "Fulfilled",
    "newValue": "Delivered"
  },
  {
    "id": "AUDIT-W1156251121946800-0024",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4TMS",
    "updatedOn": "11/21/2025 11:51 ICT",
    "entityName": "OrderLine",
    "entityId": "7",
    "changedParameter": "Changed MaxFulfillmentStatusId from Fulfilled to Delivered",
    "oldValue": "Fulfilled",
    "newValue": "Delivered"
  },
  {
    "id": "AUDIT-W1156251121946800-0025",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4TMS",
    "updatedOn": "11/21/2025 11:51 ICT",
    "entityName": "OrderLine",
    "entityId": "7",
    "changedParameter": "Changed MinFulfillmentStatusId from Fulfilled to Delivered",
    "oldValue": "Fulfilled",
    "newValue": "Delivered"
  },
  {
    "id": "AUDIT-W1156251121946800-0026",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4TMS",
    "updatedOn": "11/21/2025 11:51 ICT",
    "entityName": "FulfillmentDetail",
    "entityId": "1673202763699433221:8853474080366",
    "changedParameter": "Changed StatusId from 7000 to 7500",
    "oldValue": "7000",
    "newValue": "7500"
  },
  {
    "id": "AUDIT-W1156251121946800-0027",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4TMS",
    "updatedOn": "11/21/2025 11:51 ICT",
    "entityName": "FulfillmentDetail",
    "entityId": "4533203763699433223:5904277114444",
    "changedParameter": "Changed StatusId from 7000 to 7500",
    "oldValue": "7000",
    "newValue": "7500"
  },
  {
    "id": "AUDIT-W1156251121946800-0028",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4TMS",
    "updatedOn": "11/21/2025 11:51 ICT",
    "entityName": "FulfillmentDetail",
    "entityId": "7873204763699433224:8853474057764",
    "changedParameter": "Changed StatusId from 7000 to 7500",
    "oldValue": "7000",
    "newValue": "7500"
  },
  {
    "id": "AUDIT-W1156251121946800-0029",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4TMS",
    "updatedOn": "11/21/2025 11:51 ICT",
    "entityName": "FulfillmentDetail",
    "entityId": "3775205763699433225:8858781403990",
    "changedParameter": "Changed StatusId from 7000 to 7500",
    "oldValue": "7000",
    "newValue": "7500"
  },
  {
    "id": "AUDIT-W1156251121946800-0030",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4TMS",
    "updatedOn": "11/21/2025 11:51 ICT",
    "entityName": "FulfillmentDetail",
    "entityId": "4291206763699433227:8858894100014",
    "changedParameter": "Changed StatusId from 7000 to 7500",
    "oldValue": "7000",
    "newValue": "7500"
  },
  {
    "id": "AUDIT-W1156251121946800-0031",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4TMS",
    "updatedOn": "11/21/2025 11:51 ICT",
    "entityName": "FulfillmentDetail",
    "entityId": "9213207763699433228:8858738405534",
    "changedParameter": "Changed StatusId from 7000 to 7500",
    "oldValue": "7000",
    "newValue": "7500"
  },
  {
    "id": "AUDIT-W1156251121946800-0032",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4TMS",
    "updatedOn": "11/21/2025 11:51 ICT",
    "entityName": "FulfillmentDetail",
    "entityId": "1842208763699433229:8852043003485",
    "changedParameter": "Changed StatusId from 7000 to 7500",
    "oldValue": "7000",
    "newValue": "7500"
  },
  {
    "id": "AUDIT-W1156251121946800-0033",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4TMS",
    "updatedOn": "11/21/2025 11:51 ICT",
    "entityName": "OrderMilestone",
    "entityId": "Order::Milestone::Confirmed",
    "changedParameter": "Changed ExpectedTime from 2025-11-21T04:39:36.891 to 2025-11-21T04:51:14.616066",
    "oldValue": "2025-11-21T04:39:36.891",
    "newValue": "2025-11-21T04:51:14.616066"
  },
  {
    "id": "AUDIT-W1156251121946800-0034",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4TMS",
    "updatedOn": "11/21/2025 11:51 ICT",
    "entityName": "OrderTrackingInfo",
    "entityId": "TRKW1156251121946800:AutoShip",
    "changedParameter": "Changed PackageStatus from null to Closed",
    "oldValue": null,
    "newValue": "Closed"
  },
  {
    "id": "AUDIT-W1156251121946800-0035",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4TMS",
    "updatedOn": "11/21/2025 11:51 ICT",
    "entityName": "QuantityDetail",
    "entityId": "239842443037032048864:8853474080366",
    "changedParameter": "Changed Quantity from 4.0 to 0.0",
    "oldValue": "4.0",
    "newValue": "0.0"
  },
  {
    "id": "AUDIT-W1156251121946800-0036",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4TMS",
    "updatedOn": "11/21/2025 11:51 ICT",
    "entityName": "QuantityDetail",
    "entityId": "239842472143614781910:5904277114444",
    "changedParameter": "Changed Quantity from 3.0 to 0.0",
    "oldValue": "3.0",
    "newValue": "0.0"
  },
  {
    "id": "AUDIT-W1156251121946800-0037",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4TMS",
    "updatedOn": "11/21/2025 11:51 ICT",
    "entityName": "QuantityDetail",
    "entityId": "239842484963422452697:8853474057764",
    "changedParameter": "Changed Quantity from 1.0 to 0.0",
    "oldValue": "1.0",
    "newValue": "0.0"
  },
  {
    "id": "AUDIT-W1156251121946800-0038",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4TMS",
    "updatedOn": "11/21/2025 11:51 ICT",
    "entityName": "QuantityDetail",
    "entityId": "239842497335668418065:8858781403990",
    "changedParameter": "Changed Quantity from 4.0 to 0.0",
    "oldValue": "4.0",
    "newValue": "0.0"
  },
  {
    "id": "AUDIT-W1156251121946800-0039",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4TMS",
    "updatedOn": "11/21/2025 11:51 ICT",
    "entityName": "QuantityDetail",
    "entityId": "23984250963368178622:8858894100014",
    "changedParameter": "Changed Quantity from 2.0 to 0.0",
    "oldValue": "2.0",
    "newValue": "0.0"
  },
  {
    "id": "AUDIT-W1156251121946800-0040",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4TMS",
    "updatedOn": "11/21/2025 11:51 ICT",
    "entityName": "QuantityDetail",
    "entityId": "239842521076655449772:8858738405534",
    "changedParameter": "Changed Quantity from 1.0 to 0.0",
    "oldValue": "1.0",
    "newValue": "0.0"
  },
  {
    "id": "AUDIT-W1156251121946800-0041",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4TMS",
    "updatedOn": "11/21/2025 11:51 ICT",
    "entityName": "QuantityDetail",
    "entityId": "239842532568482570530:8852043003485",
    "changedParameter": "Changed Quantity from 2.0 to 0.0",
    "oldValue": "2.0",
    "newValue": "0.0"
  },
  {
    "id": "AUDIT-W1156251121946800-0042",
    "orderId": "W1156251121946800",
    "updatedBy": "system-msg-user@CFR",
    "updatedOn": "11/21/2025 11:39 ICT",
    "entityName": "OrderTrackingInfo",
    "entityId": "TRKW1156251121946800:AutoShip",
    "changedParameter": "Inserted OrderTrackingInfo",
    "oldValue": null,
    "newValue": "TRKW1156251121946800"
  },
  {
    "id": "AUDIT-W1156251121946800-0043",
    "orderId": "W1156251121946800",
    "updatedBy": "system-msg-user@CFR",
    "updatedOn": "11/21/2025 11:39 ICT",
    "entityName": "OrderTrackingDetail",
    "entityId": "TRKW1156251121946800-4",
    "changedParameter": "Inserted OrderTrackingDetail",
    "oldValue": null,
    "newValue": "TRKW1156251121946800-4"
  },
  {
    "id": "AUDIT-W1156251121946800-0044",
    "orderId": "W1156251121946800",
    "updatedBy": "system-msg-user@CFR",
    "updatedOn": "11/21/2025 11:39 ICT",
    "entityName": "OrderAttribute",
    "entityId": "W1156251121946800",
    "changedParameter": "Inserted OrderAttribute",
    "oldValue": null,
    "newValue": "W1156251121946800"
  },
  {
    "id": "AUDIT-W1156251121946800-0045",
    "orderId": "W1156251121946800",
    "updatedBy": "system-msg-user@CFR",
    "updatedOn": "11/21/2025 11:39 ICT",
    "entityName": "Order",
    "entityId": "W1156251121946800",
    "changedParameter": "Changed ArchiveDate from 2026-02-19T04:30:35.449 to 2026-02-19T04:39:36.769428",
    "oldValue": "2026-02-19T04:30:35.449",
    "newValue": "2026-02-19T04:39:36.769428"
  },
  {
    "id": "AUDIT-W1156251121946800-0046",
    "orderId": "W1156251121946800",
    "updatedBy": "system-msg-user@CFR",
    "updatedOn": "11/21/2025 11:39 ICT",
    "entityName": "FulfillmentDetail",
    "entityId": "1673202763699433221:8853474080366",
    "changedParameter": "Changed CRCTrackingURL from null to https://share.lalamove.com/?TH1002511211230335751110010048622967&lang=en_TH&sign=8cef48844c3b24015cf7750c690d4af7&source=api_wrapper",
    "oldValue": null,
    "newValue": "https://share.lalamove.com/?TH1002511211230335751110010048622967&lang=en_TH&sign=8cef48844c3b24015cf7750c690d4af7&source=api_wrapper"
  },
  {
    "id": "AUDIT-W1156251121946800-0047",
    "orderId": "W1156251121946800",
    "updatedBy": "system-msg-user@CFR",
    "updatedOn": "11/21/2025 11:39 ICT",
    "entityName": "FulfillmentDetail",
    "entityId": "4533203763699433223:5904277114444",
    "changedParameter": "Changed CRCTrackingURL from null to https://share.lalamove.com/?TH1002511211230335751110010048622967&lang=en_TH&sign=8cef48844c3b24015cf7750c690d4af7&source=api_wrapper",
    "oldValue": null,
    "newValue": "https://share.lalamove.com/?TH1002511211230335751110010048622967&lang=en_TH&sign=8cef48844c3b24015cf7750c690d4af7&source=api_wrapper"
  },
  {
    "id": "AUDIT-W1156251121946800-0048",
    "orderId": "W1156251121946800",
    "updatedBy": "system-msg-user@CFR",
    "updatedOn": "11/21/2025 11:39 ICT",
    "entityName": "FulfillmentDetail",
    "entityId": "7873204763699433224:8853474057764",
    "changedParameter": "Changed CRCTrackingURL from null to https://share.lalamove.com/?TH1002511211230335751110010048622967&lang=en_TH&sign=8cef48844c3b24015cf7750c690d4af7&source=api_wrapper",
    "oldValue": null,
    "newValue": "https://share.lalamove.com/?TH1002511211230335751110010048622967&lang=en_TH&sign=8cef48844c3b24015cf7750c690d4af7&source=api_wrapper"
  },
  {
    "id": "AUDIT-W1156251121946800-0049",
    "orderId": "W1156251121946800",
    "updatedBy": "system-msg-user@CFR",
    "updatedOn": "11/21/2025 11:39 ICT",
    "entityName": "FulfillmentDetail",
    "entityId": "3775205763699433225:8858781403990",
    "changedParameter": "Changed CRCTrackingURL from null to https://share.lalamove.com/?TH1002511211230335751110010048622967&lang=en_TH&sign=8cef48844c3b24015cf7750c690d4af7&source=api_wrapper",
    "oldValue": null,
    "newValue": "https://share.lalamove.com/?TH1002511211230335751110010048622967&lang=en_TH&sign=8cef48844c3b24015cf7750c690d4af7&source=api_wrapper"
  },
  {
    "id": "AUDIT-W1156251121946800-0050",
    "orderId": "W1156251121946800",
    "updatedBy": "system-msg-user@CFR",
    "updatedOn": "11/21/2025 11:39 ICT",
    "entityName": "FulfillmentDetail",
    "entityId": "4291206763699433227:8858894100014",
    "changedParameter": "Changed CRCTrackingURL from null to https://share.lalamove.com/?TH1002511211230335751110010048622967&lang=en_TH&sign=8cef48844c3b24015cf7750c690d4af7&source=api_wrapper",
    "oldValue": null,
    "newValue": "https://share.lalamove.com/?TH1002511211230335751110010048622967&lang=en_TH&sign=8cef48844c3b24015cf7750c690d4af7&source=api_wrapper"
  },
  {
    "id": "AUDIT-W1156251121946800-0051",
    "orderId": "W1156251121946800",
    "updatedBy": "system-msg-user@CFR",
    "updatedOn": "11/21/2025 11:39 ICT",
    "entityName": "FulfillmentDetail",
    "entityId": "9213207763699433228:8858738405534",
    "changedParameter": "Changed CRCTrackingURL from null to https://share.lalamove.com/?TH1002511211230335751110010048622967&lang=en_TH&sign=8cef48844c3b24015cf7750c690d4af7&source=api_wrapper",
    "oldValue": null,
    "newValue": "https://share.lalamove.com/?TH1002511211230335751110010048622967&lang=en_TH&sign=8cef48844c3b24015cf7750c690d4af7&source=api_wrapper"
  },
  {
    "id": "AUDIT-W1156251121946800-0052",
    "orderId": "W1156251121946800",
    "updatedBy": "system-msg-user@CFR",
    "updatedOn": "11/21/2025 11:39 ICT",
    "entityName": "FulfillmentDetail",
    "entityId": "1842208763699433229:8852043003485",
    "changedParameter": "Changed CRCTrackingURL from null to https://share.lalamove.com/?TH1002511211230335751110010048622967&lang=en_TH&sign=8cef48844c3b24015cf7750c690d4af7&source=api_wrapper",
    "oldValue": null,
    "newValue": "https://share.lalamove.com/?TH1002511211230335751110010048622967&lang=en_TH&sign=8cef48844c3b24015cf7750c690d4af7&source=api_wrapper"
  },
  {
    "id": "AUDIT-W1156251121946800-0053",
    "orderId": "W1156251121946800",
    "updatedBy": "system-msg-user@CFR",
    "updatedOn": "11/21/2025 11:39 ICT",
    "entityName": "OrderMilestone",
    "entityId": "Order::Milestone::Confirmed",
    "changedParameter": "Changed ExpectedTime from 2025-11-21T04:30:35.345 to 2025-11-21T04:39:36.891097",
    "oldValue": "2025-11-21T04:30:35.345",
    "newValue": "2025-11-21T04:39:36.891097"
  },
  {
    "id": "AUDIT-W1156251121946800-0054",
    "orderId": "W1156251121946800",
    "updatedBy": "integrationuser@crc.com",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLineNote",
    "entityId": "W1156251121946800_1763699433959",
    "changedParameter": "Inserted OrderLineNote",
    "oldValue": null,
    "newValue": "W1156251121946800_1763699433959"
  },
  {
    "id": "AUDIT-W1156251121946800-0055",
    "orderId": "W1156251121946800",
    "updatedBy": "integrationuser@crc.com",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLineNote",
    "entityId": "W1156251121946800_1763699433959",
    "changedParameter": "Inserted OrderLineNote",
    "oldValue": null,
    "newValue": "W1156251121946800_1763699433959"
  },
  {
    "id": "AUDIT-W1156251121946800-0056",
    "orderId": "W1156251121946800",
    "updatedBy": "integrationuser@crc.com",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLineNote",
    "entityId": "W1156251121946800_1763699433959",
    "changedParameter": "Inserted OrderLineNote",
    "oldValue": null,
    "newValue": "W1156251121946800_1763699433959"
  },
  {
    "id": "AUDIT-W1156251121946800-0057",
    "orderId": "W1156251121946800",
    "updatedBy": "integrationuser@crc.com",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLineNote",
    "entityId": "W1156251121946800_1763699433959",
    "changedParameter": "Inserted OrderLineNote",
    "oldValue": null,
    "newValue": "W1156251121946800_1763699433959"
  },
  {
    "id": "AUDIT-W1156251121946800-0058",
    "orderId": "W1156251121946800",
    "updatedBy": "integrationuser@crc.com",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLineNote",
    "entityId": "W1156251121946800_1763699433959",
    "changedParameter": "Inserted OrderLineNote",
    "oldValue": null,
    "newValue": "W1156251121946800_1763699433959"
  },
  {
    "id": "AUDIT-W1156251121946800-0059",
    "orderId": "W1156251121946800",
    "updatedBy": "integrationuser@crc.com",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLineNote",
    "entityId": "W1156251121946800_1763699433959",
    "changedParameter": "Inserted OrderLineNote",
    "oldValue": null,
    "newValue": "W1156251121946800_1763699433959"
  },
  {
    "id": "AUDIT-W1156251121946800-0060",
    "orderId": "W1156251121946800",
    "updatedBy": "integrationuser@crc.com",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLineNote",
    "entityId": "W1156251121946800_1763699433959",
    "changedParameter": "Inserted OrderLineNote",
    "oldValue": null,
    "newValue": "W1156251121946800_1763699433959"
  },
  {
    "id": "AUDIT-W1156251121946800-0061",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "Order",
    "entityId": "W1156251121946800",
    "changedParameter": "Changed ArchiveDate from null to 2026-02-19T04:30:35.449604",
    "oldValue": null,
    "newValue": "2026-02-19T04:30:35.449604"
  },
  {
    "id": "AUDIT-W1156251121946800-0062",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "Order",
    "entityId": "W1156251121946800",
    "changedParameter": "Changed PaymentStatus from Authorized to Paid",
    "oldValue": "Authorized",
    "newValue": "Paid"
  },
  {
    "id": "AUDIT-W1156251121946800-0063",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLineTaxDetail",
    "entityId": "fd942c75-d4f9-4572-8417-6e451477403c",
    "changedParameter": "Inserted OrderLineTaxDetail",
    "oldValue": null,
    "newValue": "fd942c75-d4f9-4572-8417-6e451477403c"
  },
  {
    "id": "AUDIT-W1156251121946800-0064",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLineTaxDetail",
    "entityId": "996fd695-30e1-4b07-a5ed-7a24688dcdfe",
    "changedParameter": "Inserted OrderLineTaxDetail",
    "oldValue": null,
    "newValue": "996fd695-30e1-4b07-a5ed-7a24688dcdfe"
  },
  {
    "id": "AUDIT-W1156251121946800-0065",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLineTaxDetail",
    "entityId": "067e5d16-d356-49b8-8c83-8d5288df41fb",
    "changedParameter": "Inserted OrderLineTaxDetail",
    "oldValue": null,
    "newValue": "067e5d16-d356-49b8-8c83-8d5288df41fb"
  },
  {
    "id": "AUDIT-W1156251121946800-0066",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLineTaxDetail",
    "entityId": "2b6b585c-9b56-491c-bf7c-1f0c90f9a6eb",
    "changedParameter": "Inserted OrderLineTaxDetail",
    "oldValue": null,
    "newValue": "2b6b585c-9b56-491c-bf7c-1f0c90f9a6eb"
  },
  {
    "id": "AUDIT-W1156251121946800-0067",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLineTaxDetail",
    "entityId": "5e268331-c792-48a5-a4bd-6531f5e4a1ce",
    "changedParameter": "Inserted OrderLineTaxDetail",
    "oldValue": null,
    "newValue": "5e268331-c792-48a5-a4bd-6531f5e4a1ce"
  },
  {
    "id": "AUDIT-W1156251121946800-0068",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLineTaxDetail",
    "entityId": "c57790be-cc12-41d5-8269-a516211fb3ec",
    "changedParameter": "Inserted OrderLineTaxDetail",
    "oldValue": null,
    "newValue": "c57790be-cc12-41d5-8269-a516211fb3ec"
  },
  {
    "id": "AUDIT-W1156251121946800-0069",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLineTaxDetail",
    "entityId": "4d3ab7a7-c05a-4e33-b49d-4c4b5fbbfc0c",
    "changedParameter": "Inserted OrderLineTaxDetail",
    "oldValue": null,
    "newValue": "4d3ab7a7-c05a-4e33-b49d-4c4b5fbbfc0c"
  },
  {
    "id": "AUDIT-W1156251121946800-0070",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLineTaxDetail",
    "entityId": "17636994347939310923",
    "changedParameter": "Inserted OrderLineTaxDetail",
    "oldValue": null,
    "newValue": "17636994347939310923"
  },
  {
    "id": "AUDIT-W1156251121946800-0071",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLineTaxDetail",
    "entityId": "17636994347939706795",
    "changedParameter": "Inserted OrderLineTaxDetail",
    "oldValue": null,
    "newValue": "17636994347939706795"
  },
  {
    "id": "AUDIT-W1156251121946800-0072",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLineTaxDetail",
    "entityId": "1763699434794224910",
    "changedParameter": "Inserted OrderLineTaxDetail",
    "oldValue": null,
    "newValue": "1763699434794224910"
  },
  {
    "id": "AUDIT-W1156251121946800-0073",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLineTaxDetail",
    "entityId": "bc089158-5a7f-4857-bac2-1eef195a1990",
    "changedParameter": "Inserted OrderLineTaxDetail",
    "oldValue": null,
    "newValue": "bc089158-5a7f-4857-bac2-1eef195a1990"
  },
  {
    "id": "AUDIT-W1156251121946800-0074",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLineTaxDetail",
    "entityId": "d0adb54b-efab-4d2e-a5ed-a922d7a03b41",
    "changedParameter": "Inserted OrderLineTaxDetail",
    "oldValue": null,
    "newValue": "d0adb54b-efab-4d2e-a5ed-a922d7a03b41"
  },
  {
    "id": "AUDIT-W1156251121946800-0075",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLineTaxDetail",
    "entityId": "00e80f50-b7e8-4011-a8dc-bbcb9a0246a4",
    "changedParameter": "Inserted OrderLineTaxDetail",
    "oldValue": null,
    "newValue": "00e80f50-b7e8-4011-a8dc-bbcb9a0246a4"
  },
  {
    "id": "AUDIT-W1156251121946800-0076",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLineTaxDetail",
    "entityId": "39c8773f-767e-4bb5-8363-68c9f8f8fe2f",
    "changedParameter": "Inserted OrderLineTaxDetail",
    "oldValue": null,
    "newValue": "39c8773f-767e-4bb5-8363-68c9f8f8fe2f"
  },
  {
    "id": "AUDIT-W1156251121946800-0077",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLineTaxDetail",
    "entityId": "4ab7ffe1-7a63-48b2-bdf4-30c438fe6b91",
    "changedParameter": "Inserted OrderLineTaxDetail",
    "oldValue": null,
    "newValue": "4ab7ffe1-7a63-48b2-bdf4-30c438fe6b91"
  },
  {
    "id": "AUDIT-W1156251121946800-0078",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLineTaxDetail",
    "entityId": "1651ff4f-404a-452b-9875-c3a81638dbe2",
    "changedParameter": "Inserted OrderLineTaxDetail",
    "oldValue": null,
    "newValue": "1651ff4f-404a-452b-9875-c3a81638dbe2"
  },
  {
    "id": "AUDIT-W1156251121946800-0079",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLineTaxDetail",
    "entityId": "01b87f8e-79ef-4135-83c0-c2533a38ba11",
    "changedParameter": "Inserted OrderLineTaxDetail",
    "oldValue": null,
    "newValue": "01b87f8e-79ef-4135-83c0-c2533a38ba11"
  },
  {
    "id": "AUDIT-W1156251121946800-0080",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLineTaxDetail",
    "entityId": "17636994352888674523",
    "changedParameter": "Inserted OrderLineTaxDetail",
    "oldValue": null,
    "newValue": "17636994352888674523"
  },
  {
    "id": "AUDIT-W1156251121946800-0081",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLineTaxDetail",
    "entityId": "17636994352881105174",
    "changedParameter": "Inserted OrderLineTaxDetail",
    "oldValue": null,
    "newValue": "17636994352881105174"
  },
  {
    "id": "AUDIT-W1156251121946800-0082",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLineTaxDetail",
    "entityId": "1763699435288314878",
    "changedParameter": "Inserted OrderLineTaxDetail",
    "oldValue": null,
    "newValue": "1763699435288314878"
  },
  {
    "id": "AUDIT-W1156251121946800-0083",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "Order",
    "entityId": "W1156251121946800",
    "changedParameter": "Changed PublishStatus from None to Published",
    "oldValue": "None",
    "newValue": "Published"
  },
  {
    "id": "AUDIT-W1156251121946800-0084",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLine",
    "entityId": "4",
    "changedParameter": "Changed TotalInformationalTaxes from 0.00 to 0.00",
    "oldValue": "0.00",
    "newValue": "0.00"
  },
  {
    "id": "AUDIT-W1156251121946800-0085",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLine",
    "entityId": "5",
    "changedParameter": "Changed TotalInformationalTaxes from 0.00 to 0.00",
    "oldValue": "0.00",
    "newValue": "0.00"
  },
  {
    "id": "AUDIT-W1156251121946800-0086",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLine",
    "entityId": "6",
    "changedParameter": "Changed TotalInformationalTaxes from 0.00 to 0.00",
    "oldValue": "0.00",
    "newValue": "0.00"
  },
  {
    "id": "AUDIT-W1156251121946800-0087",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "Invoice",
    "entityId": "17636994333493701826",
    "changedParameter": "Changed Status from Open to Closed",
    "oldValue": "Open",
    "newValue": "Closed"
  },
  {
    "id": "AUDIT-W1156251121946800-0088",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "Invoice",
    "entityId": "17636994333493701826",
    "changedParameter": "Changed AmountProcessed from null to 933.00",
    "oldValue": null,
    "newValue": "933.00"
  },
  {
    "id": "AUDIT-W1156251121946800-0089",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "Invoice",
    "entityId": "17636994333493701826",
    "changedParameter": "Changed PublishCount from null to 1",
    "oldValue": null,
    "newValue": "1"
  },
  {
    "id": "AUDIT-W1156251121946800-0090",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "Invoice",
    "entityId": "17636994333493701826",
    "changedParameter": "Changed PublishStatus from None to Published",
    "oldValue": "None",
    "newValue": "Published"
  },
  {
    "id": "AUDIT-W1156251121946800-0091",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderMilestone",
    "entityId": "Order::Milestone::Confirmed",
    "changedParameter": "Changed ExpectedTime from 2025-11-21T04:30:33.257 to 2025-11-21T04:30:35.345617",
    "oldValue": "2025-11-21T04:30:33.257",
    "newValue": "2025-11-21T04:30:35.345617"
  },
  {
    "id": "AUDIT-W1156251121946800-0092",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLineTaxDetail",
    "entityId": "7d257a1f-2218-4f02-ac43-9859db9f1051",
    "changedParameter": "Deleted OrderLineTaxDetail",
    "oldValue": null,
    "newValue": "7d257a1f-2218-4f02-ac43-9859db9f1051"
  },
  {
    "id": "AUDIT-W1156251121946800-0093",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLineTaxDetail",
    "entityId": "e3c688d3-65b7-468b-b3cc-2c64b5df3b52",
    "changedParameter": "Deleted OrderLineTaxDetail",
    "oldValue": null,
    "newValue": "e3c688d3-65b7-468b-b3cc-2c64b5df3b52"
  },
  {
    "id": "AUDIT-W1156251121946800-0094",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLineTaxDetail",
    "entityId": "9cc28bf9-154a-4601-b728-8543dcabff8c",
    "changedParameter": "Deleted OrderLineTaxDetail",
    "oldValue": null,
    "newValue": "9cc28bf9-154a-4601-b728-8543dcabff8c"
  },
  {
    "id": "AUDIT-W1156251121946800-0095",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLineTaxDetail",
    "entityId": "7cb309ff-8240-423d-80f8-c100adef8303",
    "changedParameter": "Deleted OrderLineTaxDetail",
    "oldValue": null,
    "newValue": "7cb309ff-8240-423d-80f8-c100adef8303"
  },
  {
    "id": "AUDIT-W1156251121946800-0096",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLineTaxDetail",
    "entityId": "1063054b-83d7-4957-94a2-d2d27bf85ef8",
    "changedParameter": "Deleted OrderLineTaxDetail",
    "oldValue": null,
    "newValue": "1063054b-83d7-4957-94a2-d2d27bf85ef8"
  },
  {
    "id": "AUDIT-W1156251121946800-0097",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLineTaxDetail",
    "entityId": "a36a47af-8189-4c52-90b0-93a5331a6517",
    "changedParameter": "Deleted OrderLineTaxDetail",
    "oldValue": null,
    "newValue": "a36a47af-8189-4c52-90b0-93a5331a6517"
  },
  {
    "id": "AUDIT-W1156251121946800-0098",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLineTaxDetail",
    "entityId": "b1d97ad5-487e-453f-96d5-0e6c4e240e8e",
    "changedParameter": "Deleted OrderLineTaxDetail",
    "oldValue": null,
    "newValue": "b1d97ad5-487e-453f-96d5-0e6c4e240e8e"
  },
  {
    "id": "AUDIT-W1156251121946800-0099",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLineTaxDetail",
    "entityId": "17636994335871770169",
    "changedParameter": "Deleted OrderLineTaxDetail",
    "oldValue": null,
    "newValue": "17636994335871770169"
  },
  {
    "id": "AUDIT-W1156251121946800-0100",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLineTaxDetail",
    "entityId": "17636994335873075098",
    "changedParameter": "Deleted OrderLineTaxDetail",
    "oldValue": null,
    "newValue": "17636994335873075098"
  },
  {
    "id": "AUDIT-W1156251121946800-0101",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLineTaxDetail",
    "entityId": "17636994335879429394",
    "changedParameter": "Deleted OrderLineTaxDetail",
    "oldValue": null,
    "newValue": "17636994335879429394"
  },
  {
    "id": "AUDIT-W1156251121946800-0102",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "QuantityDetail",
    "entityId": "239842443037032048864:8853474080366",
    "changedParameter": "Inserted QuantityDetail",
    "oldValue": null,
    "newValue": "239842443037032048864"
  },
  {
    "id": "AUDIT-W1156251121946800-0103",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "FulfillmentDetail",
    "entityId": "1673202763699433221:8853474080366",
    "changedParameter": "Inserted FulfillmentDetail",
    "oldValue": null,
    "newValue": "1673202763699433221"
  },
  {
    "id": "AUDIT-W1156251121946800-0104",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "QuantityDetail",
    "entityId": "239842472143614781910:5904277114444",
    "changedParameter": "Inserted QuantityDetail",
    "oldValue": null,
    "newValue": "239842472143614781910"
  },
  {
    "id": "AUDIT-W1156251121946800-0105",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "FulfillmentDetail",
    "entityId": "4533203763699433223:5904277114444",
    "changedParameter": "Inserted FulfillmentDetail",
    "oldValue": null,
    "newValue": "4533203763699433223"
  },
  {
    "id": "AUDIT-W1156251121946800-0106",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "QuantityDetail",
    "entityId": "239842484963422452697:8853474057764",
    "changedParameter": "Inserted QuantityDetail",
    "oldValue": null,
    "newValue": "239842484963422452697"
  },
  {
    "id": "AUDIT-W1156251121946800-0107",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "FulfillmentDetail",
    "entityId": "7873204763699433224:8853474057764",
    "changedParameter": "Inserted FulfillmentDetail",
    "oldValue": null,
    "newValue": "7873204763699433224"
  },
  {
    "id": "AUDIT-W1156251121946800-0108",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "QuantityDetail",
    "entityId": "239842497335668418065:8858781403990",
    "changedParameter": "Inserted QuantityDetail",
    "oldValue": null,
    "newValue": "239842497335668418065"
  },
  {
    "id": "AUDIT-W1156251121946800-0109",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "FulfillmentDetail",
    "entityId": "3775205763699433225:8858781403990",
    "changedParameter": "Inserted FulfillmentDetail",
    "oldValue": null,
    "newValue": "3775205763699433225"
  },
  {
    "id": "AUDIT-W1156251121946800-0110",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "QuantityDetail",
    "entityId": "23984250963368178622:8858894100014",
    "changedParameter": "Inserted QuantityDetail",
    "oldValue": null,
    "newValue": "23984250963368178622"
  },
  {
    "id": "AUDIT-W1156251121946800-0111",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "FulfillmentDetail",
    "entityId": "4291206763699433227:8858894100014",
    "changedParameter": "Inserted FulfillmentDetail",
    "oldValue": null,
    "newValue": "4291206763699433227"
  },
  {
    "id": "AUDIT-W1156251121946800-0112",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "QuantityDetail",
    "entityId": "239842521076655449772:8858738405534",
    "changedParameter": "Inserted QuantityDetail",
    "oldValue": null,
    "newValue": "239842521076655449772"
  },
  {
    "id": "AUDIT-W1156251121946800-0113",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "FulfillmentDetail",
    "entityId": "9213207763699433228:8858738405534",
    "changedParameter": "Inserted FulfillmentDetail",
    "oldValue": null,
    "newValue": "9213207763699433228"
  },
  {
    "id": "AUDIT-W1156251121946800-0114",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "QuantityDetail",
    "entityId": "239842532568482570530:8852043003485",
    "changedParameter": "Inserted QuantityDetail",
    "oldValue": null,
    "newValue": "239842532568482570530"
  },
  {
    "id": "AUDIT-W1156251121946800-0115",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "FulfillmentDetail",
    "entityId": "1842208763699433229:8852043003485",
    "changedParameter": "Inserted FulfillmentDetail",
    "oldValue": null,
    "newValue": "1842208763699433229"
  },
  {
    "id": "AUDIT-W1156251121946800-0116",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "Invoice",
    "entityId": "17636994333493701826",
    "changedParameter": "Inserted Invoice",
    "oldValue": null,
    "newValue": "17636994333493701826"
  },
  {
    "id": "AUDIT-W1156251121946800-0117",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "InvoiceLine",
    "entityId": "17636994333496137531",
    "changedParameter": "Inserted InvoiceLine",
    "oldValue": null,
    "newValue": "17636994333496137531"
  },
  {
    "id": "AUDIT-W1156251121946800-0118",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "InvoiceLineTaxDetail",
    "entityId": "43183e955e3019bf7f8c942e16b7b13",
    "changedParameter": "Inserted InvoiceLineTaxDetail",
    "oldValue": null,
    "newValue": "43183e955e3019bf7f8c942e16b7b13"
  },
  {
    "id": "AUDIT-W1156251121946800-0119",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "InvoiceLine",
    "entityId": "17636994333502343541",
    "changedParameter": "Inserted InvoiceLine",
    "oldValue": null,
    "newValue": "17636994333502343541"
  },
  {
    "id": "AUDIT-W1156251121946800-0120",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "InvoiceLineChargeDetail",
    "entityId": "100000001",
    "changedParameter": "Inserted InvoiceLineChargeDetail",
    "oldValue": null,
    "newValue": "100000001"
  },
  {
    "id": "AUDIT-W1156251121946800-0121",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "InvoiceLineChargeDetail",
    "entityId": "200000001",
    "changedParameter": "Inserted InvoiceLineChargeDetail",
    "oldValue": null,
    "newValue": "200000001"
  },
  {
    "id": "AUDIT-W1156251121946800-0122",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "InvoiceLineTaxDetail",
    "entityId": "43183e955e3019bf7f8c942e16b7b13",
    "changedParameter": "Inserted InvoiceLineTaxDetail",
    "oldValue": null,
    "newValue": "43183e955e3019bf7f8c942e16b7b13"
  },
  {
    "id": "AUDIT-W1156251121946800-0123",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "InvoiceLine",
    "entityId": "17636994333504556714",
    "changedParameter": "Inserted InvoiceLine",
    "oldValue": null,
    "newValue": "17636994333504556714"
  },
  {
    "id": "AUDIT-W1156251121946800-0124",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "InvoiceLineTaxDetail",
    "entityId": "43183e955e3019bf7f8c942e16b7b13",
    "changedParameter": "Inserted InvoiceLineTaxDetail",
    "oldValue": null,
    "newValue": "43183e955e3019bf7f8c942e16b7b13"
  },
  {
    "id": "AUDIT-W1156251121946800-0125",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "InvoiceLine",
    "entityId": "17636994333513848665",
    "changedParameter": "Inserted InvoiceLine",
    "oldValue": null,
    "newValue": "17636994333513848665"
  },
  {
    "id": "AUDIT-W1156251121946800-0126",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "InvoiceLineChargeDetail",
    "entityId": "100000002",
    "changedParameter": "Inserted InvoiceLineChargeDetail",
    "oldValue": null,
    "newValue": "100000002"
  },
  {
    "id": "AUDIT-W1156251121946800-0127",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "InvoiceLineChargeDetail",
    "entityId": "200000001",
    "changedParameter": "Inserted InvoiceLineChargeDetail",
    "oldValue": null,
    "newValue": "200000001"
  },
  {
    "id": "AUDIT-W1156251121946800-0128",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "InvoiceLineChargeDetail",
    "entityId": "200000002",
    "changedParameter": "Inserted InvoiceLineChargeDetail",
    "oldValue": null,
    "newValue": "200000002"
  },
  {
    "id": "AUDIT-W1156251121946800-0129",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "InvoiceLineChargeDetail",
    "entityId": "200000003",
    "changedParameter": "Inserted InvoiceLineChargeDetail",
    "oldValue": null,
    "newValue": "200000003"
  },
  {
    "id": "AUDIT-W1156251121946800-0130",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "InvoiceLine",
    "entityId": "17636994333519043061",
    "changedParameter": "Inserted InvoiceLine",
    "oldValue": null,
    "newValue": "17636994333519043061"
  },
  {
    "id": "AUDIT-W1156251121946800-0131",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "InvoiceLineChargeDetail",
    "entityId": "200000001",
    "changedParameter": "Inserted InvoiceLineChargeDetail",
    "oldValue": null,
    "newValue": "200000001"
  },
  {
    "id": "AUDIT-W1156251121946800-0132",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "InvoiceLineChargeDetail",
    "entityId": "200000003",
    "changedParameter": "Inserted InvoiceLineChargeDetail",
    "oldValue": null,
    "newValue": "200000003"
  },
  {
    "id": "AUDIT-W1156251121946800-0133",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "InvoiceLine",
    "entityId": "1763699433351951379",
    "changedParameter": "Inserted InvoiceLine",
    "oldValue": null,
    "newValue": "1763699433351951379"
  },
  {
    "id": "AUDIT-W1156251121946800-0134",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "InvoiceLineChargeDetail",
    "entityId": "100000003",
    "changedParameter": "Inserted InvoiceLineChargeDetail",
    "oldValue": null,
    "newValue": "100000003"
  },
  {
    "id": "AUDIT-W1156251121946800-0135",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "InvoiceLineChargeDetail",
    "entityId": "200000001",
    "changedParameter": "Inserted InvoiceLineChargeDetail",
    "oldValue": null,
    "newValue": "200000001"
  },
  {
    "id": "AUDIT-W1156251121946800-0136",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "InvoiceLineChargeDetail",
    "entityId": "200000002",
    "changedParameter": "Inserted InvoiceLineChargeDetail",
    "oldValue": null,
    "newValue": "200000002"
  },
  {
    "id": "AUDIT-W1156251121946800-0137",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "InvoiceLineChargeDetail",
    "entityId": "200000003",
    "changedParameter": "Inserted InvoiceLineChargeDetail",
    "oldValue": null,
    "newValue": "200000003"
  },
  {
    "id": "AUDIT-W1156251121946800-0138",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "InvoiceLine",
    "entityId": "17636994333521530443",
    "changedParameter": "Inserted InvoiceLine",
    "oldValue": null,
    "newValue": "17636994333521530443"
  },
  {
    "id": "AUDIT-W1156251121946800-0139",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "InvoiceLineChargeDetail",
    "entityId": "200000001",
    "changedParameter": "Inserted InvoiceLineChargeDetail",
    "oldValue": null,
    "newValue": "200000001"
  },
  {
    "id": "AUDIT-W1156251121946800-0140",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "InvoiceLineChargeDetail",
    "entityId": "200000003",
    "changedParameter": "Inserted InvoiceLineChargeDetail",
    "oldValue": null,
    "newValue": "200000003"
  },
  {
    "id": "AUDIT-W1156251121946800-0141",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "InvoiceLineTaxDetail",
    "entityId": "43183e955e3019bf7f8c942e16b7b13",
    "changedParameter": "Inserted InvoiceLineTaxDetail",
    "oldValue": null,
    "newValue": "43183e955e3019bf7f8c942e16b7b13"
  },
  {
    "id": "AUDIT-W1156251121946800-0142",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLineTaxDetail",
    "entityId": "7d257a1f-2218-4f02-ac43-9859db9f1051",
    "changedParameter": "Inserted OrderLineTaxDetail",
    "oldValue": null,
    "newValue": "7d257a1f-2218-4f02-ac43-9859db9f1051"
  },
  {
    "id": "AUDIT-W1156251121946800-0143",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLineTaxDetail",
    "entityId": "e3c688d3-65b7-468b-b3cc-2c64b5df3b52",
    "changedParameter": "Inserted OrderLineTaxDetail",
    "oldValue": null,
    "newValue": "e3c688d3-65b7-468b-b3cc-2c64b5df3b52"
  },
  {
    "id": "AUDIT-W1156251121946800-0144",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLineTaxDetail",
    "entityId": "9cc28bf9-154a-4601-b728-8543dcabff8c",
    "changedParameter": "Inserted OrderLineTaxDetail",
    "oldValue": null,
    "newValue": "9cc28bf9-154a-4601-b728-8543dcabff8c"
  },
  {
    "id": "AUDIT-W1156251121946800-0145",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLineTaxDetail",
    "entityId": "7cb309ff-8240-423d-80f8-c100adef8303",
    "changedParameter": "Inserted OrderLineTaxDetail",
    "oldValue": null,
    "newValue": "7cb309ff-8240-423d-80f8-c100adef8303"
  },
  {
    "id": "AUDIT-W1156251121946800-0146",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLineTaxDetail",
    "entityId": "1063054b-83d7-4957-94a2-d2d27bf85ef8",
    "changedParameter": "Inserted OrderLineTaxDetail",
    "oldValue": null,
    "newValue": "1063054b-83d7-4957-94a2-d2d27bf85ef8"
  },
  {
    "id": "AUDIT-W1156251121946800-0147",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLineTaxDetail",
    "entityId": "a36a47af-8189-4c52-90b0-93a5331a6517",
    "changedParameter": "Inserted OrderLineTaxDetail",
    "oldValue": null,
    "newValue": "a36a47af-8189-4c52-90b0-93a5331a6517"
  },
  {
    "id": "AUDIT-W1156251121946800-0148",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLineTaxDetail",
    "entityId": "b1d97ad5-487e-453f-96d5-0e6c4e240e8e",
    "changedParameter": "Inserted OrderLineTaxDetail",
    "oldValue": null,
    "newValue": "b1d97ad5-487e-453f-96d5-0e6c4e240e8e"
  },
  {
    "id": "AUDIT-W1156251121946800-0149",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderAdditional",
    "entityId": "",
    "changedParameter": "Inserted OrderAdditional",
    "oldValue": null,
    "newValue": null
  },
  {
    "id": "AUDIT-W1156251121946800-0150",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLineTaxDetail",
    "entityId": "17636994335871770169",
    "changedParameter": "Inserted OrderLineTaxDetail",
    "oldValue": null,
    "newValue": "17636994335871770169"
  },
  {
    "id": "AUDIT-W1156251121946800-0151",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLineTaxDetail",
    "entityId": "17636994335873075098",
    "changedParameter": "Inserted OrderLineTaxDetail",
    "oldValue": null,
    "newValue": "17636994335873075098"
  },
  {
    "id": "AUDIT-W1156251121946800-0152",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLineTaxDetail",
    "entityId": "17636994335879429394",
    "changedParameter": "Inserted OrderLineTaxDetail",
    "oldValue": null,
    "newValue": "17636994335879429394"
  },
  {
    "id": "AUDIT-W1156251121946800-0153",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "Order",
    "entityId": "W1156251121946800",
    "changedParameter": "Changed MaxFulfillmentStatusId from Packed to Fulfilled",
    "oldValue": "Packed",
    "newValue": "Fulfilled"
  },
  {
    "id": "AUDIT-W1156251121946800-0154",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "Order",
    "entityId": "W1156251121946800",
    "changedParameter": "Changed MinFulfillmentStatusId from Packed to Fulfilled",
    "oldValue": "Packed",
    "newValue": "Fulfilled"
  },
  {
    "id": "AUDIT-W1156251121946800-0155",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "Order",
    "entityId": "W1156251121946800",
    "changedParameter": "Changed PublishStatus from null to None",
    "oldValue": null,
    "newValue": "None"
  },
  {
    "id": "AUDIT-W1156251121946800-0156",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLine",
    "entityId": "1",
    "changedParameter": "Changed MaxFulfillmentStatusId from Packed to Fulfilled",
    "oldValue": "Packed",
    "newValue": "Fulfilled"
  },
  {
    "id": "AUDIT-W1156251121946800-0157",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLine",
    "entityId": "1",
    "changedParameter": "Changed MinFulfillmentStatusId from Packed to Fulfilled",
    "oldValue": "Packed",
    "newValue": "Fulfilled"
  },
  {
    "id": "AUDIT-W1156251121946800-0158",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLine",
    "entityId": "1",
    "changedParameter": "Changed ReturnEligibilityDays from null to 14",
    "oldValue": null,
    "newValue": "14"
  },
  {
    "id": "AUDIT-W1156251121946800-0159",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLine",
    "entityId": "2",
    "changedParameter": "Changed MaxFulfillmentStatusId from Packed to Fulfilled",
    "oldValue": "Packed",
    "newValue": "Fulfilled"
  },
  {
    "id": "AUDIT-W1156251121946800-0160",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLine",
    "entityId": "2",
    "changedParameter": "Changed MinFulfillmentStatusId from Packed to Fulfilled",
    "oldValue": "Packed",
    "newValue": "Fulfilled"
  },
  {
    "id": "AUDIT-W1156251121946800-0161",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLine",
    "entityId": "2",
    "changedParameter": "Changed ReturnEligibilityDays from null to 14",
    "oldValue": null,
    "newValue": "14"
  },
  {
    "id": "AUDIT-W1156251121946800-0162",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLine",
    "entityId": "3",
    "changedParameter": "Changed MaxFulfillmentStatusId from Packed to Fulfilled",
    "oldValue": "Packed",
    "newValue": "Fulfilled"
  },
  {
    "id": "AUDIT-W1156251121946800-0163",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLine",
    "entityId": "3",
    "changedParameter": "Changed MinFulfillmentStatusId from Packed to Fulfilled",
    "oldValue": "Packed",
    "newValue": "Fulfilled"
  },
  {
    "id": "AUDIT-W1156251121946800-0164",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLine",
    "entityId": "3",
    "changedParameter": "Changed ReturnEligibilityDays from null to 14",
    "oldValue": null,
    "newValue": "14"
  },
  {
    "id": "AUDIT-W1156251121946800-0165",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLine",
    "entityId": "4",
    "changedParameter": "Changed TotalTaxes from null to 0.00",
    "oldValue": null,
    "newValue": "0.00"
  },
  {
    "id": "AUDIT-W1156251121946800-0166",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLine",
    "entityId": "4",
    "changedParameter": "Changed MaxFulfillmentStatusId from Packed to Fulfilled",
    "oldValue": "Packed",
    "newValue": "Fulfilled"
  },
  {
    "id": "AUDIT-W1156251121946800-0167",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLine",
    "entityId": "4",
    "changedParameter": "Changed TotalInformationalTaxes from 0.00 to 0.00",
    "oldValue": "0.00",
    "newValue": "0.00"
  },
  {
    "id": "AUDIT-W1156251121946800-0168",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLine",
    "entityId": "4",
    "changedParameter": "Changed MinFulfillmentStatusId from Packed to Fulfilled",
    "oldValue": "Packed",
    "newValue": "Fulfilled"
  },
  {
    "id": "AUDIT-W1156251121946800-0169",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLine",
    "entityId": "4",
    "changedParameter": "Changed ReturnEligibilityDays from null to 14",
    "oldValue": null,
    "newValue": "14"
  },
  {
    "id": "AUDIT-W1156251121946800-0170",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLine",
    "entityId": "5",
    "changedParameter": "Changed TotalTaxes from null to 0.00",
    "oldValue": null,
    "newValue": "0.00"
  },
  {
    "id": "AUDIT-W1156251121946800-0171",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLine",
    "entityId": "5",
    "changedParameter": "Changed MaxFulfillmentStatusId from Packed to Fulfilled",
    "oldValue": "Packed",
    "newValue": "Fulfilled"
  },
  {
    "id": "AUDIT-W1156251121946800-0172",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLine",
    "entityId": "5",
    "changedParameter": "Changed TotalInformationalTaxes from 0.00 to 0.00",
    "oldValue": "0.00",
    "newValue": "0.00"
  },
  {
    "id": "AUDIT-W1156251121946800-0173",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLine",
    "entityId": "5",
    "changedParameter": "Changed MinFulfillmentStatusId from Packed to Fulfilled",
    "oldValue": "Packed",
    "newValue": "Fulfilled"
  },
  {
    "id": "AUDIT-W1156251121946800-0174",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLine",
    "entityId": "5",
    "changedParameter": "Changed ReturnEligibilityDays from null to 14",
    "oldValue": null,
    "newValue": "14"
  },
  {
    "id": "AUDIT-W1156251121946800-0175",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLine",
    "entityId": "6",
    "changedParameter": "Changed TotalTaxes from null to 0.00",
    "oldValue": null,
    "newValue": "0.00"
  },
  {
    "id": "AUDIT-W1156251121946800-0176",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLine",
    "entityId": "6",
    "changedParameter": "Changed MaxFulfillmentStatusId from Packed to Fulfilled",
    "oldValue": "Packed",
    "newValue": "Fulfilled"
  },
  {
    "id": "AUDIT-W1156251121946800-0177",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLine",
    "entityId": "6",
    "changedParameter": "Changed TotalInformationalTaxes from 0.00 to 0.00",
    "oldValue": "0.00",
    "newValue": "0.00"
  },
  {
    "id": "AUDIT-W1156251121946800-0178",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLine",
    "entityId": "6",
    "changedParameter": "Changed MinFulfillmentStatusId from Packed to Fulfilled",
    "oldValue": "Packed",
    "newValue": "Fulfilled"
  },
  {
    "id": "AUDIT-W1156251121946800-0179",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLine",
    "entityId": "6",
    "changedParameter": "Changed ReturnEligibilityDays from null to 14",
    "oldValue": null,
    "newValue": "14"
  },
  {
    "id": "AUDIT-W1156251121946800-0180",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLine",
    "entityId": "7",
    "changedParameter": "Changed MaxFulfillmentStatusId from Packed to Fulfilled",
    "oldValue": "Packed",
    "newValue": "Fulfilled"
  },
  {
    "id": "AUDIT-W1156251121946800-0181",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLine",
    "entityId": "7",
    "changedParameter": "Changed MinFulfillmentStatusId from Packed to Fulfilled",
    "oldValue": "Packed",
    "newValue": "Fulfilled"
  },
  {
    "id": "AUDIT-W1156251121946800-0182",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLine",
    "entityId": "7",
    "changedParameter": "Changed ReturnEligibilityDays from null to 14",
    "oldValue": null,
    "newValue": "14"
  },
  {
    "id": "AUDIT-W1156251121946800-0183",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "Allocation",
    "entityId": "474503400716405973142",
    "changedParameter": "Changed Quantity from 3.0 to 0.0",
    "oldValue": "3.0",
    "newValue": "0.0"
  },
  {
    "id": "AUDIT-W1156251121946800-0184",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "Allocation",
    "entityId": "474503411579503199038",
    "changedParameter": "Changed Quantity from 2.0 to 0.0",
    "oldValue": "2.0",
    "newValue": "0.0"
  },
  {
    "id": "AUDIT-W1156251121946800-0185",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "Allocation",
    "entityId": "474503414732003741983",
    "changedParameter": "Changed Quantity from 1.0 to 0.0",
    "oldValue": "1.0",
    "newValue": "0.0"
  },
  {
    "id": "AUDIT-W1156251121946800-0186",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "Allocation",
    "entityId": "474503417196903927378",
    "changedParameter": "Changed Quantity from 4.0 to 0.0",
    "oldValue": "4.0",
    "newValue": "0.0"
  },
  {
    "id": "AUDIT-W1156251121946800-0187",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "Allocation",
    "entityId": "474503419600107713155",
    "changedParameter": "Changed Quantity from 1.0 to 0.0",
    "oldValue": "1.0",
    "newValue": "0.0"
  },
  {
    "id": "AUDIT-W1156251121946800-0188",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "Allocation",
    "entityId": "474503422161102885882",
    "changedParameter": "Changed Quantity from 4.0 to 0.0",
    "oldValue": "4.0",
    "newValue": "0.0"
  },
  {
    "id": "AUDIT-W1156251121946800-0189",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "Allocation",
    "entityId": "474503424211609865053",
    "changedParameter": "Changed Quantity from 2.0 to 0.0",
    "oldValue": "2.0",
    "newValue": "0.0"
  },
  {
    "id": "AUDIT-W1156251121946800-0190",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderMilestone",
    "entityId": "Order::Milestone::Confirmed",
    "changedParameter": "Changed ExpectedTime from 2025-11-21T04:29:33.122 to 2025-11-21T04:30:33.257612",
    "oldValue": "2025-11-21T04:29:33.122",
    "newValue": "2025-11-21T04:30:33.257612"
  },
  {
    "id": "AUDIT-W1156251121946800-0191",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderMilestone",
    "entityId": "Order::Milestone::Shipped",
    "changedParameter": "Changed ActualTime from null to 2025-11-21T04:30:33.257612",
    "oldValue": null,
    "newValue": "2025-11-21T04:30:33.257612"
  },
  {
    "id": "AUDIT-W1156251121946800-0192",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "QuantityDetail",
    "entityId": "239242529138536143985:8853474057764",
    "changedParameter": "Changed Quantity from 1.0 to 0.0",
    "oldValue": "1.0",
    "newValue": "0.0"
  },
  {
    "id": "AUDIT-W1156251121946800-0193",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "QuantityDetail",
    "entityId": "239242549696068413446:5904277114444",
    "changedParameter": "Changed Quantity from 3.0 to 0.0",
    "oldValue": "3.0",
    "newValue": "0.0"
  },
  {
    "id": "AUDIT-W1156251121946800-0194",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "QuantityDetail",
    "entityId": "239242584254314951630:8852043003485",
    "changedParameter": "Changed Quantity from 2.0 to 0.0",
    "oldValue": "2.0",
    "newValue": "0.0"
  },
  {
    "id": "AUDIT-W1156251121946800-0195",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "QuantityDetail",
    "entityId": "239242619513256314678:8858738405534",
    "changedParameter": "Changed Quantity from 1.0 to 0.0",
    "oldValue": "1.0",
    "newValue": "0.0"
  },
  {
    "id": "AUDIT-W1156251121946800-0196",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "QuantityDetail",
    "entityId": "239242637566249980309:8853474080366",
    "changedParameter": "Changed Quantity from 4.0 to 0.0",
    "oldValue": "4.0",
    "newValue": "0.0"
  },
  {
    "id": "AUDIT-W1156251121946800-0197",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "QuantityDetail",
    "entityId": "239242696592522690910:8858894100014",
    "changedParameter": "Changed Quantity from 2.0 to 0.0",
    "oldValue": "2.0",
    "newValue": "0.0"
  },
  {
    "id": "AUDIT-W1156251121946800-0198",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "QuantityDetail",
    "entityId": "239242727449988227341:8858781403990",
    "changedParameter": "Changed Quantity from 4.0 to 0.0",
    "oldValue": "4.0",
    "newValue": "0.0"
  },
  {
    "id": "AUDIT-W1156251121946800-0199",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "ReleaseLine",
    "entityId": "1",
    "changedParameter": "Changed FulfilledQuantity from 0.0 to 4.0",
    "oldValue": "0.0",
    "newValue": "4.0"
  },
  {
    "id": "AUDIT-W1156251121946800-0200",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "ReleaseLine",
    "entityId": "2",
    "changedParameter": "Changed FulfilledQuantity from 0.0 to 3.0",
    "oldValue": "0.0",
    "newValue": "3.0"
  },
  {
    "id": "AUDIT-W1156251121946800-0201",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "ReleaseLine",
    "entityId": "3",
    "changedParameter": "Changed FulfilledQuantity from 0.0 to 2.0",
    "oldValue": "0.0",
    "newValue": "2.0"
  },
  {
    "id": "AUDIT-W1156251121946800-0202",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "ReleaseLine",
    "entityId": "4",
    "changedParameter": "Changed FulfilledQuantity from 0.0 to 1.0",
    "oldValue": "0.0",
    "newValue": "1.0"
  },
  {
    "id": "AUDIT-W1156251121946800-0203",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "ReleaseLine",
    "entityId": "5",
    "changedParameter": "Changed FulfilledQuantity from 0.0 to 1.0",
    "oldValue": "0.0",
    "newValue": "1.0"
  },
  {
    "id": "AUDIT-W1156251121946800-0204",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "ReleaseLine",
    "entityId": "6",
    "changedParameter": "Changed FulfilledQuantity from 0.0 to 4.0",
    "oldValue": "0.0",
    "newValue": "4.0"
  },
  {
    "id": "AUDIT-W1156251121946800-0205",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "ReleaseLine",
    "entityId": "7",
    "changedParameter": "Changed FulfilledQuantity from 0.0 to 2.0",
    "oldValue": "0.0",
    "newValue": "2.0"
  },
  {
    "id": "AUDIT-W1156251121946800-0206",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLineTaxDetail",
    "entityId": "43183e955e3019bf7f8c942e16b7b13",
    "changedParameter": "Deleted OrderLineTaxDetail",
    "oldValue": null,
    "newValue": "43183e955e3019bf7f8c942e16b7b13"
  },
  {
    "id": "AUDIT-W1156251121946800-0207",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLineTaxDetail",
    "entityId": "43183e955e3019bf7f8c942e16b7b13",
    "changedParameter": "Deleted OrderLineTaxDetail",
    "oldValue": null,
    "newValue": "43183e955e3019bf7f8c942e16b7b13"
  },
  {
    "id": "AUDIT-W1156251121946800-0208",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLineTaxDetail",
    "entityId": "43183e955e3019bf7f8c942e16b7b13",
    "changedParameter": "Deleted OrderLineTaxDetail",
    "oldValue": null,
    "newValue": "43183e955e3019bf7f8c942e16b7b13"
  },
  {
    "id": "AUDIT-W1156251121946800-0209",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:30 ICT",
    "entityName": "OrderLineTaxDetail",
    "entityId": "43183e955e3019bf7f8c942e16b7b13",
    "changedParameter": "Deleted OrderLineTaxDetail",
    "oldValue": null,
    "newValue": "43183e955e3019bf7f8c942e16b7b13"
  },
  {
    "id": "AUDIT-W1156251121946800-0210",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:29 ICT",
    "entityName": "QuantityDetail",
    "entityId": "239242529138536143985:8853474057764",
    "changedParameter": "Inserted QuantityDetail",
    "oldValue": null,
    "newValue": "239242529138536143985"
  },
  {
    "id": "AUDIT-W1156251121946800-0211",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:29 ICT",
    "entityName": "QuantityDetail",
    "entityId": "239242549696068413446:5904277114444",
    "changedParameter": "Inserted QuantityDetail",
    "oldValue": null,
    "newValue": "239242549696068413446"
  },
  {
    "id": "AUDIT-W1156251121946800-0212",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:29 ICT",
    "entityName": "QuantityDetail",
    "entityId": "239242584254314951630:8852043003485",
    "changedParameter": "Inserted QuantityDetail",
    "oldValue": null,
    "newValue": "239242584254314951630"
  },
  {
    "id": "AUDIT-W1156251121946800-0213",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:29 ICT",
    "entityName": "QuantityDetail",
    "entityId": "239242619513256314678:8858738405534",
    "changedParameter": "Inserted QuantityDetail",
    "oldValue": null,
    "newValue": "239242619513256314678"
  },
  {
    "id": "AUDIT-W1156251121946800-0214",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:29 ICT",
    "entityName": "QuantityDetail",
    "entityId": "239242637566249980309:8853474080366",
    "changedParameter": "Inserted QuantityDetail",
    "oldValue": null,
    "newValue": "239242637566249980309"
  },
  {
    "id": "AUDIT-W1156251121946800-0215",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:29 ICT",
    "entityName": "QuantityDetail",
    "entityId": "239242696592522690910:8858894100014",
    "changedParameter": "Inserted QuantityDetail",
    "oldValue": null,
    "newValue": "239242696592522690910"
  },
  {
    "id": "AUDIT-W1156251121946800-0216",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:29 ICT",
    "entityName": "QuantityDetail",
    "entityId": "239242727449988227341:8858781403990",
    "changedParameter": "Inserted QuantityDetail",
    "oldValue": null,
    "newValue": "239242727449988227341"
  },
  {
    "id": "AUDIT-W1156251121946800-0217",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:29 ICT",
    "entityName": "Order",
    "entityId": "W1156251121946800",
    "changedParameter": "Changed MaxFulfillmentStatusId from Picked to Packed",
    "oldValue": "Picked",
    "newValue": "Packed"
  },
  {
    "id": "AUDIT-W1156251121946800-0218",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:29 ICT",
    "entityName": "Order",
    "entityId": "W1156251121946800",
    "changedParameter": "Changed MinFulfillmentStatusId from Picked to Packed",
    "oldValue": "Picked",
    "newValue": "Packed"
  },
  {
    "id": "AUDIT-W1156251121946800-0219",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:29 ICT",
    "entityName": "OrderLine",
    "entityId": "1",
    "changedParameter": "Changed MaxFulfillmentStatusId from Picked to Packed",
    "oldValue": "Picked",
    "newValue": "Packed"
  },
  {
    "id": "AUDIT-W1156251121946800-0220",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:29 ICT",
    "entityName": "OrderLine",
    "entityId": "1",
    "changedParameter": "Changed MinFulfillmentStatusId from Picked to Packed",
    "oldValue": "Picked",
    "newValue": "Packed"
  },
  {
    "id": "AUDIT-W1156251121946800-0221",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:29 ICT",
    "entityName": "OrderLine",
    "entityId": "2",
    "changedParameter": "Changed MaxFulfillmentStatusId from Picked to Packed",
    "oldValue": "Picked",
    "newValue": "Packed"
  },
  {
    "id": "AUDIT-W1156251121946800-0222",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:29 ICT",
    "entityName": "OrderLine",
    "entityId": "2",
    "changedParameter": "Changed MinFulfillmentStatusId from Picked to Packed",
    "oldValue": "Picked",
    "newValue": "Packed"
  },
  {
    "id": "AUDIT-W1156251121946800-0223",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:29 ICT",
    "entityName": "OrderLine",
    "entityId": "3",
    "changedParameter": "Changed MaxFulfillmentStatusId from Picked to Packed",
    "oldValue": "Picked",
    "newValue": "Packed"
  },
  {
    "id": "AUDIT-W1156251121946800-0224",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:29 ICT",
    "entityName": "OrderLine",
    "entityId": "3",
    "changedParameter": "Changed MinFulfillmentStatusId from Picked to Packed",
    "oldValue": "Picked",
    "newValue": "Packed"
  },
  {
    "id": "AUDIT-W1156251121946800-0225",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:29 ICT",
    "entityName": "OrderLine",
    "entityId": "4",
    "changedParameter": "Changed MaxFulfillmentStatusId from Picked to Packed",
    "oldValue": "Picked",
    "newValue": "Packed"
  },
  {
    "id": "AUDIT-W1156251121946800-0226",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:29 ICT",
    "entityName": "OrderLine",
    "entityId": "4",
    "changedParameter": "Changed MinFulfillmentStatusId from Picked to Packed",
    "oldValue": "Picked",
    "newValue": "Packed"
  },
  {
    "id": "AUDIT-W1156251121946800-0227",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:29 ICT",
    "entityName": "OrderLine",
    "entityId": "5",
    "changedParameter": "Changed MaxFulfillmentStatusId from Picked to Packed",
    "oldValue": "Picked",
    "newValue": "Packed"
  },
  {
    "id": "AUDIT-W1156251121946800-0228",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:29 ICT",
    "entityName": "OrderLine",
    "entityId": "5",
    "changedParameter": "Changed MinFulfillmentStatusId from Picked to Packed",
    "oldValue": "Picked",
    "newValue": "Packed"
  },
  {
    "id": "AUDIT-W1156251121946800-0229",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:29 ICT",
    "entityName": "OrderLine",
    "entityId": "6",
    "changedParameter": "Changed MaxFulfillmentStatusId from Picked to Packed",
    "oldValue": "Picked",
    "newValue": "Packed"
  },
  {
    "id": "AUDIT-W1156251121946800-0230",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:29 ICT",
    "entityName": "OrderLine",
    "entityId": "6",
    "changedParameter": "Changed MinFulfillmentStatusId from Picked to Packed",
    "oldValue": "Picked",
    "newValue": "Packed"
  },
  {
    "id": "AUDIT-W1156251121946800-0231",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:29 ICT",
    "entityName": "OrderLine",
    "entityId": "7",
    "changedParameter": "Changed MaxFulfillmentStatusId from Picked to Packed",
    "oldValue": "Picked",
    "newValue": "Packed"
  },
  {
    "id": "AUDIT-W1156251121946800-0232",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:29 ICT",
    "entityName": "OrderLine",
    "entityId": "7",
    "changedParameter": "Changed MinFulfillmentStatusId from Picked to Packed",
    "oldValue": "Picked",
    "newValue": "Packed"
  },
  {
    "id": "AUDIT-W1156251121946800-0233",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:29 ICT",
    "entityName": "QuantityDetail",
    "entityId": "225468625987981310969:8858781403990",
    "changedParameter": "Changed Quantity from 4.0 to 0.0",
    "oldValue": "4.0",
    "newValue": "0.0"
  },
  {
    "id": "AUDIT-W1156251121946800-0234",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:29 ICT",
    "entityName": "QuantityDetail",
    "entityId": "225468668330144627298:8853474057764",
    "changedParameter": "Changed Quantity from 1.0 to 0.0",
    "oldValue": "1.0",
    "newValue": "0.0"
  },
  {
    "id": "AUDIT-W1156251121946800-0235",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:29 ICT",
    "entityName": "QuantityDetail",
    "entityId": "225468692790818952888:5904277114444",
    "changedParameter": "Changed Quantity from 3.0 to 0.0",
    "oldValue": "3.0",
    "newValue": "0.0"
  },
  {
    "id": "AUDIT-W1156251121946800-0236",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:29 ICT",
    "entityName": "QuantityDetail",
    "entityId": "225468752703963180913:8852043003485",
    "changedParameter": "Changed Quantity from 2.0 to 0.0",
    "oldValue": "2.0",
    "newValue": "0.0"
  },
  {
    "id": "AUDIT-W1156251121946800-0237",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:29 ICT",
    "entityName": "QuantityDetail",
    "entityId": "22546880214058669214:8858738405534",
    "changedParameter": "Changed Quantity from 1.0 to 0.0",
    "oldValue": "1.0",
    "newValue": "0.0"
  },
  {
    "id": "AUDIT-W1156251121946800-0238",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:29 ICT",
    "entityName": "QuantityDetail",
    "entityId": "22546882708906933093:8853474080366",
    "changedParameter": "Changed Quantity from 4.0 to 0.0",
    "oldValue": "4.0",
    "newValue": "0.0"
  },
  {
    "id": "AUDIT-W1156251121946800-0239",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:29 ICT",
    "entityName": "QuantityDetail",
    "entityId": "225468914853859810299:8858894100014",
    "changedParameter": "Changed Quantity from 2.0 to 0.0",
    "oldValue": "2.0",
    "newValue": "0.0"
  },
  {
    "id": "AUDIT-W1156251121946800-0240",
    "orderId": "W1156251121946800",
    "updatedBy": "integrationuser@crc.com",
    "updatedOn": "11/21/2025 11:29 ICT",
    "entityName": "OrderLineNote",
    "entityId": "W1156251121946800_1763699372776",
    "changedParameter": "Inserted OrderLineNote",
    "oldValue": null,
    "newValue": "W1156251121946800_1763699372776"
  },
  {
    "id": "AUDIT-W1156251121946800-0241",
    "orderId": "W1156251121946800",
    "updatedBy": "integrationuser@crc.com",
    "updatedOn": "11/21/2025 11:29 ICT",
    "entityName": "OrderLineNote",
    "entityId": "W1156251121946800_1763699372776",
    "changedParameter": "Inserted OrderLineNote",
    "oldValue": null,
    "newValue": "W1156251121946800_1763699372776"
  },
  {
    "id": "AUDIT-W1156251121946800-0242",
    "orderId": "W1156251121946800",
    "updatedBy": "integrationuser@crc.com",
    "updatedOn": "11/21/2025 11:29 ICT",
    "entityName": "OrderLineNote",
    "entityId": "W1156251121946800_1763699372776",
    "changedParameter": "Inserted OrderLineNote",
    "oldValue": null,
    "newValue": "W1156251121946800_1763699372776"
  },
  {
    "id": "AUDIT-W1156251121946800-0243",
    "orderId": "W1156251121946800",
    "updatedBy": "integrationuser@crc.com",
    "updatedOn": "11/21/2025 11:29 ICT",
    "entityName": "OrderLineNote",
    "entityId": "W1156251121946800_1763699372776",
    "changedParameter": "Inserted OrderLineNote",
    "oldValue": null,
    "newValue": "W1156251121946800_1763699372776"
  },
  {
    "id": "AUDIT-W1156251121946800-0244",
    "orderId": "W1156251121946800",
    "updatedBy": "integrationuser@crc.com",
    "updatedOn": "11/21/2025 11:29 ICT",
    "entityName": "OrderLineNote",
    "entityId": "W1156251121946800_1763699372776",
    "changedParameter": "Inserted OrderLineNote",
    "oldValue": null,
    "newValue": "W1156251121946800_1763699372776"
  },
  {
    "id": "AUDIT-W1156251121946800-0245",
    "orderId": "W1156251121946800",
    "updatedBy": "integrationuser@crc.com",
    "updatedOn": "11/21/2025 11:29 ICT",
    "entityName": "OrderLineNote",
    "entityId": "W1156251121946800_1763699372776",
    "changedParameter": "Inserted OrderLineNote",
    "oldValue": null,
    "newValue": "W1156251121946800_1763699372776"
  },
  {
    "id": "AUDIT-W1156251121946800-0246",
    "orderId": "W1156251121946800",
    "updatedBy": "integrationuser@crc.com",
    "updatedOn": "11/21/2025 11:29 ICT",
    "entityName": "OrderLineNote",
    "entityId": "W1156251121946800_1763699372776",
    "changedParameter": "Inserted OrderLineNote",
    "oldValue": null,
    "newValue": "W1156251121946800_1763699372776"
  },
  {
    "id": "AUDIT-W1156251121946800-0247",
    "orderId": "W1156251121946800",
    "updatedBy": "integrationuser@crc.com",
    "updatedOn": "11/21/2025 11:29 ICT",
    "entityName": "Order",
    "entityId": "W1156251121946800",
    "changedParameter": "Changed CancelAllowed from true to false",
    "oldValue": "true",
    "newValue": "false"
  },
  {
    "id": "AUDIT-W1156251121946800-0248",
    "orderId": "W1156251121946800",
    "updatedBy": "integrationuser@crc.com",
    "updatedOn": "11/21/2025 11:29 ICT",
    "entityName": "OrderExtension1",
    "entityId": "",
    "changedParameter": "Changed CancelAllowed from null to false",
    "oldValue": null,
    "newValue": "false"
  },
  {
    "id": "AUDIT-W1156251121946800-0249",
    "orderId": "W1156251121946800",
    "updatedBy": "integrationuser@crc.com",
    "updatedOn": "11/21/2025 11:29 ICT",
    "entityName": "OrderExtension1",
    "entityId": "",
    "changedParameter": "Changed AutoSettlement from null to true",
    "oldValue": null,
    "newValue": "true"
  },
  {
    "id": "AUDIT-W1156251121946800-0250",
    "orderId": "W1156251121946800",
    "updatedBy": "integrationuser@crc.com",
    "updatedOn": "11/21/2025 11:29 ICT",
    "entityName": "OrderMilestone",
    "entityId": "Order::Milestone::Confirmed",
    "changedParameter": "Changed ExpectedTime from 2025-11-21T04:06:35.299 to 2025-11-21T04:29:33.122245",
    "oldValue": "2025-11-21T04:06:35.299",
    "newValue": "2025-11-21T04:29:33.122245"
  },
  {
    "id": "AUDIT-W1156251121946800-0251",
    "orderId": "W1156251121946800",
    "updatedBy": "integrationuser@crc.com",
    "updatedOn": "11/21/2025 11:06 ICT",
    "entityName": "OrderLineNote",
    "entityId": "W1156251121946800_1763697995519",
    "changedParameter": "Inserted OrderLineNote",
    "oldValue": null,
    "newValue": "W1156251121946800_1763697995519"
  },
  {
    "id": "AUDIT-W1156251121946800-0252",
    "orderId": "W1156251121946800",
    "updatedBy": "integrationuser@crc.com",
    "updatedOn": "11/21/2025 11:06 ICT",
    "entityName": "OrderLineNote",
    "entityId": "W1156251121946800_1763697995519",
    "changedParameter": "Inserted OrderLineNote",
    "oldValue": null,
    "newValue": "W1156251121946800_1763697995519"
  },
  {
    "id": "AUDIT-W1156251121946800-0253",
    "orderId": "W1156251121946800",
    "updatedBy": "integrationuser@crc.com",
    "updatedOn": "11/21/2025 11:06 ICT",
    "entityName": "OrderLineNote",
    "entityId": "W1156251121946800_1763697995519",
    "changedParameter": "Inserted OrderLineNote",
    "oldValue": null,
    "newValue": "W1156251121946800_1763697995519"
  },
  {
    "id": "AUDIT-W1156251121946800-0254",
    "orderId": "W1156251121946800",
    "updatedBy": "integrationuser@crc.com",
    "updatedOn": "11/21/2025 11:06 ICT",
    "entityName": "OrderLineNote",
    "entityId": "W1156251121946800_1763697995519",
    "changedParameter": "Inserted OrderLineNote",
    "oldValue": null,
    "newValue": "W1156251121946800_1763697995519"
  },
  {
    "id": "AUDIT-W1156251121946800-0255",
    "orderId": "W1156251121946800",
    "updatedBy": "integrationuser@crc.com",
    "updatedOn": "11/21/2025 11:06 ICT",
    "entityName": "OrderLineNote",
    "entityId": "W1156251121946800_1763697995519",
    "changedParameter": "Inserted OrderLineNote",
    "oldValue": null,
    "newValue": "W1156251121946800_1763697995519"
  },
  {
    "id": "AUDIT-W1156251121946800-0256",
    "orderId": "W1156251121946800",
    "updatedBy": "integrationuser@crc.com",
    "updatedOn": "11/21/2025 11:06 ICT",
    "entityName": "OrderLineNote",
    "entityId": "W1156251121946800_1763697995519",
    "changedParameter": "Inserted OrderLineNote",
    "oldValue": null,
    "newValue": "W1156251121946800_1763697995519"
  },
  {
    "id": "AUDIT-W1156251121946800-0257",
    "orderId": "W1156251121946800",
    "updatedBy": "integrationuser@crc.com",
    "updatedOn": "11/21/2025 11:06 ICT",
    "entityName": "OrderLineNote",
    "entityId": "W1156251121946800_1763697995519",
    "changedParameter": "Inserted OrderLineNote",
    "oldValue": null,
    "newValue": "W1156251121946800_1763697995519"
  },
  {
    "id": "AUDIT-W1156251121946800-0258",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:06 ICT",
    "entityName": "QuantityDetail",
    "entityId": "225468625987981310969:8858781403990",
    "changedParameter": "Inserted QuantityDetail",
    "oldValue": null,
    "newValue": "225468625987981310969"
  },
  {
    "id": "AUDIT-W1156251121946800-0259",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:06 ICT",
    "entityName": "QuantityDetail",
    "entityId": "225468668330144627298:8853474057764",
    "changedParameter": "Inserted QuantityDetail",
    "oldValue": null,
    "newValue": "225468668330144627298"
  },
  {
    "id": "AUDIT-W1156251121946800-0260",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:06 ICT",
    "entityName": "QuantityDetail",
    "entityId": "225468692790818952888:5904277114444",
    "changedParameter": "Inserted QuantityDetail",
    "oldValue": null,
    "newValue": "225468692790818952888"
  },
  {
    "id": "AUDIT-W1156251121946800-0261",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:06 ICT",
    "entityName": "QuantityDetail",
    "entityId": "225468752703963180913:8852043003485",
    "changedParameter": "Inserted QuantityDetail",
    "oldValue": null,
    "newValue": "225468752703963180913"
  },
  {
    "id": "AUDIT-W1156251121946800-0262",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:06 ICT",
    "entityName": "QuantityDetail",
    "entityId": "22546880214058669214:8858738405534",
    "changedParameter": "Inserted QuantityDetail",
    "oldValue": null,
    "newValue": "22546880214058669214"
  },
  {
    "id": "AUDIT-W1156251121946800-0263",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:06 ICT",
    "entityName": "QuantityDetail",
    "entityId": "22546882708906933093:8853474080366",
    "changedParameter": "Inserted QuantityDetail",
    "oldValue": null,
    "newValue": "22546882708906933093"
  },
  {
    "id": "AUDIT-W1156251121946800-0264",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:06 ICT",
    "entityName": "QuantityDetail",
    "entityId": "225468914853859810299:8858894100014",
    "changedParameter": "Inserted QuantityDetail",
    "oldValue": null,
    "newValue": "225468914853859810299"
  },
  {
    "id": "AUDIT-W1156251121946800-0265",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:06 ICT",
    "entityName": "Order",
    "entityId": "W1156251121946800",
    "changedParameter": "Changed MaxFulfillmentStatusId from In Process to Picked",
    "oldValue": "In Process",
    "newValue": "Picked"
  },
  {
    "id": "AUDIT-W1156251121946800-0266",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:06 ICT",
    "entityName": "Order",
    "entityId": "W1156251121946800",
    "changedParameter": "Changed MinFulfillmentStatusId from In Process to Picked",
    "oldValue": "In Process",
    "newValue": "Picked"
  },
  {
    "id": "AUDIT-W1156251121946800-0267",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:06 ICT",
    "entityName": "OrderLine",
    "entityId": "1",
    "changedParameter": "Changed MaxFulfillmentStatusId from In Process to Picked",
    "oldValue": "In Process",
    "newValue": "Picked"
  },
  {
    "id": "AUDIT-W1156251121946800-0268",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:06 ICT",
    "entityName": "OrderLine",
    "entityId": "1",
    "changedParameter": "Changed MinFulfillmentStatusId from In Process to Picked",
    "oldValue": "In Process",
    "newValue": "Picked"
  },
  {
    "id": "AUDIT-W1156251121946800-0269",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:06 ICT",
    "entityName": "OrderLine",
    "entityId": "2",
    "changedParameter": "Changed MaxFulfillmentStatusId from In Process to Picked",
    "oldValue": "In Process",
    "newValue": "Picked"
  },
  {
    "id": "AUDIT-W1156251121946800-0270",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:06 ICT",
    "entityName": "OrderLine",
    "entityId": "2",
    "changedParameter": "Changed MinFulfillmentStatusId from In Process to Picked",
    "oldValue": "In Process",
    "newValue": "Picked"
  },
  {
    "id": "AUDIT-W1156251121946800-0271",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:06 ICT",
    "entityName": "OrderLine",
    "entityId": "3",
    "changedParameter": "Changed MaxFulfillmentStatusId from In Process to Picked",
    "oldValue": "In Process",
    "newValue": "Picked"
  },
  {
    "id": "AUDIT-W1156251121946800-0272",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:06 ICT",
    "entityName": "OrderLine",
    "entityId": "3",
    "changedParameter": "Changed MinFulfillmentStatusId from In Process to Picked",
    "oldValue": "In Process",
    "newValue": "Picked"
  },
  {
    "id": "AUDIT-W1156251121946800-0273",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:06 ICT",
    "entityName": "OrderLine",
    "entityId": "4",
    "changedParameter": "Changed MaxFulfillmentStatusId from In Process to Picked",
    "oldValue": "In Process",
    "newValue": "Picked"
  },
  {
    "id": "AUDIT-W1156251121946800-0274",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:06 ICT",
    "entityName": "OrderLine",
    "entityId": "4",
    "changedParameter": "Changed MinFulfillmentStatusId from In Process to Picked",
    "oldValue": "In Process",
    "newValue": "Picked"
  },
  {
    "id": "AUDIT-W1156251121946800-0275",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:06 ICT",
    "entityName": "OrderLine",
    "entityId": "5",
    "changedParameter": "Changed MaxFulfillmentStatusId from In Process to Picked",
    "oldValue": "In Process",
    "newValue": "Picked"
  },
  {
    "id": "AUDIT-W1156251121946800-0276",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:06 ICT",
    "entityName": "OrderLine",
    "entityId": "5",
    "changedParameter": "Changed MinFulfillmentStatusId from In Process to Picked",
    "oldValue": "In Process",
    "newValue": "Picked"
  },
  {
    "id": "AUDIT-W1156251121946800-0277",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:06 ICT",
    "entityName": "OrderLine",
    "entityId": "6",
    "changedParameter": "Changed MaxFulfillmentStatusId from In Process to Picked",
    "oldValue": "In Process",
    "newValue": "Picked"
  },
  {
    "id": "AUDIT-W1156251121946800-0278",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:06 ICT",
    "entityName": "OrderLine",
    "entityId": "6",
    "changedParameter": "Changed MinFulfillmentStatusId from In Process to Picked",
    "oldValue": "In Process",
    "newValue": "Picked"
  },
  {
    "id": "AUDIT-W1156251121946800-0279",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:06 ICT",
    "entityName": "OrderLine",
    "entityId": "7",
    "changedParameter": "Changed MaxFulfillmentStatusId from In Process to Picked",
    "oldValue": "In Process",
    "newValue": "Picked"
  },
  {
    "id": "AUDIT-W1156251121946800-0280",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:06 ICT",
    "entityName": "OrderLine",
    "entityId": "7",
    "changedParameter": "Changed MinFulfillmentStatusId from In Process to Picked",
    "oldValue": "In Process",
    "newValue": "Picked"
  },
  {
    "id": "AUDIT-W1156251121946800-0281",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:06 ICT",
    "entityName": "QuantityDetail",
    "entityId": "21097001252911177746:8858781403990",
    "changedParameter": "Changed Quantity from 4.0 to 0.0",
    "oldValue": "4.0",
    "newValue": "0.0"
  },
  {
    "id": "AUDIT-W1156251121946800-0282",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:06 ICT",
    "entityName": "QuantityDetail",
    "entityId": "210970082382014130101:8853474057764",
    "changedParameter": "Changed Quantity from 1.0 to 0.0",
    "oldValue": "1.0",
    "newValue": "0.0"
  },
  {
    "id": "AUDIT-W1156251121946800-0283",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:06 ICT",
    "entityName": "QuantityDetail",
    "entityId": "210970106096802058669:5904277114444",
    "changedParameter": "Changed Quantity from 3.0 to 0.0",
    "oldValue": "3.0",
    "newValue": "0.0"
  },
  {
    "id": "AUDIT-W1156251121946800-0284",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:06 ICT",
    "entityName": "QuantityDetail",
    "entityId": "210970154436288303885:8852043003485",
    "changedParameter": "Changed Quantity from 2.0 to 0.0",
    "oldValue": "2.0",
    "newValue": "0.0"
  },
  {
    "id": "AUDIT-W1156251121946800-0285",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:06 ICT",
    "entityName": "QuantityDetail",
    "entityId": "210970196559844305251:8858738405534",
    "changedParameter": "Changed Quantity from 1.0 to 0.0",
    "oldValue": "1.0",
    "newValue": "0.0"
  },
  {
    "id": "AUDIT-W1156251121946800-0286",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:06 ICT",
    "entityName": "QuantityDetail",
    "entityId": "210970214149284356632:8853474080366",
    "changedParameter": "Changed Quantity from 4.0 to 0.0",
    "oldValue": "4.0",
    "newValue": "0.0"
  },
  {
    "id": "AUDIT-W1156251121946800-0287",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:06 ICT",
    "entityName": "QuantityDetail",
    "entityId": "210970275289615282005:8858894100014",
    "changedParameter": "Changed Quantity from 2.0 to 0.0",
    "oldValue": "2.0",
    "newValue": "0.0"
  },
  {
    "id": "AUDIT-W1156251121946800-0288",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 11:06 ICT",
    "entityName": "OrderMilestone",
    "entityId": "Order::Milestone::Confirmed",
    "changedParameter": "Changed ExpectedTime from 2025-11-21T03:45:30.403 to 2025-11-21T04:06:35.299228",
    "oldValue": "2025-11-21T03:45:30.403",
    "newValue": "2025-11-21T04:06:35.299228"
  },
  {
    "id": "AUDIT-W1156251121946800-0289",
    "orderId": "W1156251121946800",
    "updatedBy": "integrationuser@crc.com",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "OrderLineNote",
    "entityId": "W1156251121946800_1763696730501",
    "changedParameter": "Inserted OrderLineNote",
    "oldValue": null,
    "newValue": "W1156251121946800_1763696730501"
  },
  {
    "id": "AUDIT-W1156251121946800-0290",
    "orderId": "W1156251121946800",
    "updatedBy": "integrationuser@crc.com",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "OrderLineNote",
    "entityId": "W1156251121946800_1763696730501",
    "changedParameter": "Inserted OrderLineNote",
    "oldValue": null,
    "newValue": "W1156251121946800_1763696730501"
  },
  {
    "id": "AUDIT-W1156251121946800-0291",
    "orderId": "W1156251121946800",
    "updatedBy": "integrationuser@crc.com",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "OrderLineNote",
    "entityId": "W1156251121946800_1763696730501",
    "changedParameter": "Inserted OrderLineNote",
    "oldValue": null,
    "newValue": "W1156251121946800_1763696730501"
  },
  {
    "id": "AUDIT-W1156251121946800-0292",
    "orderId": "W1156251121946800",
    "updatedBy": "integrationuser@crc.com",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "OrderLineNote",
    "entityId": "W1156251121946800_1763696730501",
    "changedParameter": "Inserted OrderLineNote",
    "oldValue": null,
    "newValue": "W1156251121946800_1763696730501"
  },
  {
    "id": "AUDIT-W1156251121946800-0293",
    "orderId": "W1156251121946800",
    "updatedBy": "integrationuser@crc.com",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "OrderLineNote",
    "entityId": "W1156251121946800_1763696730501",
    "changedParameter": "Inserted OrderLineNote",
    "oldValue": null,
    "newValue": "W1156251121946800_1763696730501"
  },
  {
    "id": "AUDIT-W1156251121946800-0294",
    "orderId": "W1156251121946800",
    "updatedBy": "integrationuser@crc.com",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "OrderLineNote",
    "entityId": "W1156251121946800_1763696730501",
    "changedParameter": "Inserted OrderLineNote",
    "oldValue": null,
    "newValue": "W1156251121946800_1763696730501"
  },
  {
    "id": "AUDIT-W1156251121946800-0295",
    "orderId": "W1156251121946800",
    "updatedBy": "integrationuser@crc.com",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "OrderLineNote",
    "entityId": "W1156251121946800_1763696730501",
    "changedParameter": "Inserted OrderLineNote",
    "oldValue": null,
    "newValue": "W1156251121946800_1763696730501"
  },
  {
    "id": "AUDIT-W1156251121946800-0296",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "QuantityDetail",
    "entityId": "21097001252911177746:8858781403990",
    "changedParameter": "Inserted QuantityDetail",
    "oldValue": null,
    "newValue": "21097001252911177746"
  },
  {
    "id": "AUDIT-W1156251121946800-0297",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "QuantityDetail",
    "entityId": "210970082382014130101:8853474057764",
    "changedParameter": "Inserted QuantityDetail",
    "oldValue": null,
    "newValue": "210970082382014130101"
  },
  {
    "id": "AUDIT-W1156251121946800-0298",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "QuantityDetail",
    "entityId": "210970106096802058669:5904277114444",
    "changedParameter": "Inserted QuantityDetail",
    "oldValue": null,
    "newValue": "210970106096802058669"
  },
  {
    "id": "AUDIT-W1156251121946800-0299",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "QuantityDetail",
    "entityId": "210970154436288303885:8852043003485",
    "changedParameter": "Inserted QuantityDetail",
    "oldValue": null,
    "newValue": "210970154436288303885"
  },
  {
    "id": "AUDIT-W1156251121946800-0300",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "QuantityDetail",
    "entityId": "210970196559844305251:8858738405534",
    "changedParameter": "Inserted QuantityDetail",
    "oldValue": null,
    "newValue": "210970196559844305251"
  },
  {
    "id": "AUDIT-W1156251121946800-0301",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "QuantityDetail",
    "entityId": "210970214149284356632:8853474080366",
    "changedParameter": "Inserted QuantityDetail",
    "oldValue": null,
    "newValue": "210970214149284356632"
  },
  {
    "id": "AUDIT-W1156251121946800-0302",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "QuantityDetail",
    "entityId": "210970275289615282005:8858894100014",
    "changedParameter": "Inserted QuantityDetail",
    "oldValue": null,
    "newValue": "210970275289615282005"
  },
  {
    "id": "AUDIT-W1156251121946800-0303",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "Order",
    "entityId": "W1156251121946800",
    "changedParameter": "Changed MaxFulfillmentStatusId from Released to In Process",
    "oldValue": "Released",
    "newValue": "In Process"
  },
  {
    "id": "AUDIT-W1156251121946800-0304",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "Order",
    "entityId": "W1156251121946800",
    "changedParameter": "Changed MinFulfillmentStatusId from Released to In Process",
    "oldValue": "Released",
    "newValue": "In Process"
  },
  {
    "id": "AUDIT-W1156251121946800-0305",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "OrderLine",
    "entityId": "1",
    "changedParameter": "Changed MaxFulfillmentStatusId from Released to In Process",
    "oldValue": "Released",
    "newValue": "In Process"
  },
  {
    "id": "AUDIT-W1156251121946800-0306",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "OrderLine",
    "entityId": "1",
    "changedParameter": "Changed MinFulfillmentStatusId from Released to In Process",
    "oldValue": "Released",
    "newValue": "In Process"
  },
  {
    "id": "AUDIT-W1156251121946800-0307",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "OrderLine",
    "entityId": "2",
    "changedParameter": "Changed MaxFulfillmentStatusId from Released to In Process",
    "oldValue": "Released",
    "newValue": "In Process"
  },
  {
    "id": "AUDIT-W1156251121946800-0308",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "OrderLine",
    "entityId": "2",
    "changedParameter": "Changed MinFulfillmentStatusId from Released to In Process",
    "oldValue": "Released",
    "newValue": "In Process"
  },
  {
    "id": "AUDIT-W1156251121946800-0309",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "OrderLine",
    "entityId": "3",
    "changedParameter": "Changed MaxFulfillmentStatusId from Released to In Process",
    "oldValue": "Released",
    "newValue": "In Process"
  },
  {
    "id": "AUDIT-W1156251121946800-0310",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "OrderLine",
    "entityId": "3",
    "changedParameter": "Changed MinFulfillmentStatusId from Released to In Process",
    "oldValue": "Released",
    "newValue": "In Process"
  },
  {
    "id": "AUDIT-W1156251121946800-0311",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "OrderLine",
    "entityId": "4",
    "changedParameter": "Changed MaxFulfillmentStatusId from Released to In Process",
    "oldValue": "Released",
    "newValue": "In Process"
  },
  {
    "id": "AUDIT-W1156251121946800-0312",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "OrderLine",
    "entityId": "4",
    "changedParameter": "Changed MinFulfillmentStatusId from Released to In Process",
    "oldValue": "Released",
    "newValue": "In Process"
  },
  {
    "id": "AUDIT-W1156251121946800-0313",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "OrderLine",
    "entityId": "5",
    "changedParameter": "Changed MaxFulfillmentStatusId from Released to In Process",
    "oldValue": "Released",
    "newValue": "In Process"
  },
  {
    "id": "AUDIT-W1156251121946800-0314",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "OrderLine",
    "entityId": "5",
    "changedParameter": "Changed MinFulfillmentStatusId from Released to In Process",
    "oldValue": "Released",
    "newValue": "In Process"
  },
  {
    "id": "AUDIT-W1156251121946800-0315",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "OrderLine",
    "entityId": "6",
    "changedParameter": "Changed MaxFulfillmentStatusId from Released to In Process",
    "oldValue": "Released",
    "newValue": "In Process"
  },
  {
    "id": "AUDIT-W1156251121946800-0316",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "OrderLine",
    "entityId": "6",
    "changedParameter": "Changed MinFulfillmentStatusId from Released to In Process",
    "oldValue": "Released",
    "newValue": "In Process"
  },
  {
    "id": "AUDIT-W1156251121946800-0317",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "OrderLine",
    "entityId": "7",
    "changedParameter": "Changed MaxFulfillmentStatusId from Released to In Process",
    "oldValue": "Released",
    "newValue": "In Process"
  },
  {
    "id": "AUDIT-W1156251121946800-0318",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "OrderLine",
    "entityId": "7",
    "changedParameter": "Changed MinFulfillmentStatusId from Released to In Process",
    "oldValue": "Released",
    "newValue": "In Process"
  },
  {
    "id": "AUDIT-W1156251121946800-0319",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "OrderMilestone",
    "entityId": "Order::Milestone::Confirmed",
    "changedParameter": "Changed ExpectedTime from 2025-11-21T03:45:25.024 to 2025-11-21T03:45:30.403381",
    "oldValue": "2025-11-21T03:45:25.024",
    "newValue": "2025-11-21T03:45:30.403381"
  },
  {
    "id": "AUDIT-W1156251121946800-0320",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "QuantityDetail",
    "entityId": "486741429112436732627:8858781403990",
    "changedParameter": "Changed Quantity from 4.0 to 0.0",
    "oldValue": "4.0",
    "newValue": "0.0"
  },
  {
    "id": "AUDIT-W1156251121946800-0321",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "QuantityDetail",
    "entityId": "486741435210833401563:5904277114444",
    "changedParameter": "Changed Quantity from 3.0 to 0.0",
    "oldValue": "3.0",
    "newValue": "0.0"
  },
  {
    "id": "AUDIT-W1156251121946800-0322",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "QuantityDetail",
    "entityId": "486741439949937896130:8852043003485",
    "changedParameter": "Changed Quantity from 2.0 to 0.0",
    "oldValue": "2.0",
    "newValue": "0.0"
  },
  {
    "id": "AUDIT-W1156251121946800-0323",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "QuantityDetail",
    "entityId": "486741445988731632630:8858738405534",
    "changedParameter": "Changed Quantity from 1.0 to 0.0",
    "oldValue": "1.0",
    "newValue": "0.0"
  },
  {
    "id": "AUDIT-W1156251121946800-0324",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "QuantityDetail",
    "entityId": "48674145184743268881:8853474057764",
    "changedParameter": "Changed Quantity from 1.0 to 0.0",
    "oldValue": "1.0",
    "newValue": "0.0"
  },
  {
    "id": "AUDIT-W1156251121946800-0325",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "QuantityDetail",
    "entityId": "486741457812336444810:8853474080366",
    "changedParameter": "Changed Quantity from 4.0 to 0.0",
    "oldValue": "4.0",
    "newValue": "0.0"
  },
  {
    "id": "AUDIT-W1156251121946800-0326",
    "orderId": "W1156251121946800",
    "updatedBy": "apiuser4Slick",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "QuantityDetail",
    "entityId": "486741462937133170338:8858894100014",
    "changedParameter": "Changed Quantity from 2.0 to 0.0",
    "oldValue": "2.0",
    "newValue": "0.0"
  },
  {
    "id": "AUDIT-W1156251121946800-0327",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "Release",
    "entityId": "W11562511219468001",
    "changedParameter": "Inserted Release",
    "oldValue": null,
    "newValue": "W11562511219468001"
  },
  {
    "id": "AUDIT-W1156251121946800-0328",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "ReleaseLine",
    "entityId": "1",
    "changedParameter": "Inserted ReleaseLine",
    "oldValue": null,
    "newValue": "1"
  },
  {
    "id": "AUDIT-W1156251121946800-0329",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "ReleaseLine",
    "entityId": "2",
    "changedParameter": "Inserted ReleaseLine",
    "oldValue": null,
    "newValue": "2"
  },
  {
    "id": "AUDIT-W1156251121946800-0330",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "ReleaseLine",
    "entityId": "3",
    "changedParameter": "Inserted ReleaseLine",
    "oldValue": null,
    "newValue": "3"
  },
  {
    "id": "AUDIT-W1156251121946800-0331",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "ReleaseLine",
    "entityId": "4",
    "changedParameter": "Inserted ReleaseLine",
    "oldValue": null,
    "newValue": "4"
  },
  {
    "id": "AUDIT-W1156251121946800-0332",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "ReleaseLine",
    "entityId": "5",
    "changedParameter": "Inserted ReleaseLine",
    "oldValue": null,
    "newValue": "5"
  },
  {
    "id": "AUDIT-W1156251121946800-0333",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "ReleaseLine",
    "entityId": "6",
    "changedParameter": "Inserted ReleaseLine",
    "oldValue": null,
    "newValue": "6"
  },
  {
    "id": "AUDIT-W1156251121946800-0334",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "ReleaseLine",
    "entityId": "7",
    "changedParameter": "Inserted ReleaseLine",
    "oldValue": null,
    "newValue": "7"
  },
  {
    "id": "AUDIT-W1156251121946800-0335",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "QuantityDetail",
    "entityId": "486741429112436732627:8858781403990",
    "changedParameter": "Inserted QuantityDetail",
    "oldValue": null,
    "newValue": "486741429112436732627"
  },
  {
    "id": "AUDIT-W1156251121946800-0336",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "QuantityDetail",
    "entityId": "486741435210833401563:5904277114444",
    "changedParameter": "Inserted QuantityDetail",
    "oldValue": null,
    "newValue": "486741435210833401563"
  },
  {
    "id": "AUDIT-W1156251121946800-0337",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "QuantityDetail",
    "entityId": "486741439949937896130:8852043003485",
    "changedParameter": "Inserted QuantityDetail",
    "oldValue": null,
    "newValue": "486741439949937896130"
  },
  {
    "id": "AUDIT-W1156251121946800-0338",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "QuantityDetail",
    "entityId": "486741445988731632630:8858738405534",
    "changedParameter": "Inserted QuantityDetail",
    "oldValue": null,
    "newValue": "486741445988731632630"
  },
  {
    "id": "AUDIT-W1156251121946800-0339",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "QuantityDetail",
    "entityId": "48674145184743268881:8853474057764",
    "changedParameter": "Inserted QuantityDetail",
    "oldValue": null,
    "newValue": "48674145184743268881"
  },
  {
    "id": "AUDIT-W1156251121946800-0340",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "QuantityDetail",
    "entityId": "486741457812336444810:8853474080366",
    "changedParameter": "Inserted QuantityDetail",
    "oldValue": null,
    "newValue": "486741457812336444810"
  },
  {
    "id": "AUDIT-W1156251121946800-0341",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "QuantityDetail",
    "entityId": "486741462937133170338:8858894100014",
    "changedParameter": "Inserted QuantityDetail",
    "oldValue": null,
    "newValue": "486741462937133170338"
  },
  {
    "id": "AUDIT-W1156251121946800-0342",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "Order",
    "entityId": "W1156251121946800",
    "changedParameter": "Changed MaxFulfillmentStatusId from Allocated to Released",
    "oldValue": "Allocated",
    "newValue": "Released"
  },
  {
    "id": "AUDIT-W1156251121946800-0343",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "Order",
    "entityId": "W1156251121946800",
    "changedParameter": "Changed MinFulfillmentStatusId from Allocated to Released",
    "oldValue": "Allocated",
    "newValue": "Released"
  },
  {
    "id": "AUDIT-W1156251121946800-0344",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "OrderLine",
    "entityId": "1",
    "changedParameter": "Changed MaxFulfillmentStatusId from Allocated to Released",
    "oldValue": "Allocated",
    "newValue": "Released"
  },
  {
    "id": "AUDIT-W1156251121946800-0345",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "OrderLine",
    "entityId": "1",
    "changedParameter": "Changed MinFulfillmentStatusId from Allocated to Released",
    "oldValue": "Allocated",
    "newValue": "Released"
  },
  {
    "id": "AUDIT-W1156251121946800-0346",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "OrderLine",
    "entityId": "2",
    "changedParameter": "Changed MaxFulfillmentStatusId from Allocated to Released",
    "oldValue": "Allocated",
    "newValue": "Released"
  },
  {
    "id": "AUDIT-W1156251121946800-0347",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "OrderLine",
    "entityId": "2",
    "changedParameter": "Changed MinFulfillmentStatusId from Allocated to Released",
    "oldValue": "Allocated",
    "newValue": "Released"
  },
  {
    "id": "AUDIT-W1156251121946800-0348",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "OrderLine",
    "entityId": "3",
    "changedParameter": "Changed MaxFulfillmentStatusId from Allocated to Released",
    "oldValue": "Allocated",
    "newValue": "Released"
  },
  {
    "id": "AUDIT-W1156251121946800-0349",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "OrderLine",
    "entityId": "3",
    "changedParameter": "Changed MinFulfillmentStatusId from Allocated to Released",
    "oldValue": "Allocated",
    "newValue": "Released"
  },
  {
    "id": "AUDIT-W1156251121946800-0350",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "OrderLine",
    "entityId": "4",
    "changedParameter": "Changed MaxFulfillmentStatusId from Allocated to Released",
    "oldValue": "Allocated",
    "newValue": "Released"
  },
  {
    "id": "AUDIT-W1156251121946800-0351",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "OrderLine",
    "entityId": "4",
    "changedParameter": "Changed MinFulfillmentStatusId from Allocated to Released",
    "oldValue": "Allocated",
    "newValue": "Released"
  },
  {
    "id": "AUDIT-W1156251121946800-0352",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "OrderLine",
    "entityId": "5",
    "changedParameter": "Changed MaxFulfillmentStatusId from Allocated to Released",
    "oldValue": "Allocated",
    "newValue": "Released"
  },
  {
    "id": "AUDIT-W1156251121946800-0353",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "OrderLine",
    "entityId": "5",
    "changedParameter": "Changed MinFulfillmentStatusId from Allocated to Released",
    "oldValue": "Allocated",
    "newValue": "Released"
  },
  {
    "id": "AUDIT-W1156251121946800-0354",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "OrderLine",
    "entityId": "6",
    "changedParameter": "Changed MaxFulfillmentStatusId from Allocated to Released",
    "oldValue": "Allocated",
    "newValue": "Released"
  },
  {
    "id": "AUDIT-W1156251121946800-0355",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "OrderLine",
    "entityId": "6",
    "changedParameter": "Changed MinFulfillmentStatusId from Allocated to Released",
    "oldValue": "Allocated",
    "newValue": "Released"
  },
  {
    "id": "AUDIT-W1156251121946800-0356",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "OrderLine",
    "entityId": "7",
    "changedParameter": "Changed MaxFulfillmentStatusId from Allocated to Released",
    "oldValue": "Allocated",
    "newValue": "Released"
  },
  {
    "id": "AUDIT-W1156251121946800-0357",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "OrderLine",
    "entityId": "7",
    "changedParameter": "Changed MinFulfillmentStatusId from Allocated to Released",
    "oldValue": "Allocated",
    "newValue": "Released"
  },
  {
    "id": "AUDIT-W1156251121946800-0358",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "Allocation",
    "entityId": "474503400716405973142",
    "changedParameter": "Changed Status from Open to Released",
    "oldValue": "Open",
    "newValue": "Released"
  },
  {
    "id": "AUDIT-W1156251121946800-0359",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "Allocation",
    "entityId": "474503411579503199038",
    "changedParameter": "Changed Status from Open to Released",
    "oldValue": "Open",
    "newValue": "Released"
  },
  {
    "id": "AUDIT-W1156251121946800-0360",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "Allocation",
    "entityId": "474503414732003741983",
    "changedParameter": "Changed Status from Open to Released",
    "oldValue": "Open",
    "newValue": "Released"
  },
  {
    "id": "AUDIT-W1156251121946800-0361",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "Allocation",
    "entityId": "474503417196903927378",
    "changedParameter": "Changed Status from Open to Released",
    "oldValue": "Open",
    "newValue": "Released"
  },
  {
    "id": "AUDIT-W1156251121946800-0362",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "Allocation",
    "entityId": "474503419600107713155",
    "changedParameter": "Changed Status from Open to Released",
    "oldValue": "Open",
    "newValue": "Released"
  },
  {
    "id": "AUDIT-W1156251121946800-0363",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "Allocation",
    "entityId": "474503422161102885882",
    "changedParameter": "Changed Status from Open to Released",
    "oldValue": "Open",
    "newValue": "Released"
  },
  {
    "id": "AUDIT-W1156251121946800-0364",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "Allocation",
    "entityId": "474503424211609865053",
    "changedParameter": "Changed Status from Open to Released",
    "oldValue": "Open",
    "newValue": "Released"
  },
  {
    "id": "AUDIT-W1156251121946800-0365",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "OrderMilestone",
    "entityId": "Order::Milestone::Confirmed",
    "changedParameter": "Changed ExpectedTime from 2025-11-21T03:45:24.785 to 2025-11-21T03:45:25.024541",
    "oldValue": "2025-11-21T03:45:24.785",
    "newValue": "2025-11-21T03:45:25.024541"
  },
  {
    "id": "AUDIT-W1156251121946800-0366",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "OrderMilestone",
    "entityId": "Order::Milestone::Released",
    "changedParameter": "Changed ActualTime from null to 2025-11-21T03:45:25.024541",
    "oldValue": null,
    "newValue": "2025-11-21T03:45:25.024541"
  },
  {
    "id": "AUDIT-W1156251121946800-0367",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "QuantityDetail",
    "entityId": "474503439139105688235:5904277114444",
    "changedParameter": "Changed Quantity from 3.0 to 0.0",
    "oldValue": "3.0",
    "newValue": "0.0"
  },
  {
    "id": "AUDIT-W1156251121946800-0368",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "QuantityDetail",
    "entityId": "474503443979708809084:8852043003485",
    "changedParameter": "Changed Quantity from 2.0 to 0.0",
    "oldValue": "2.0",
    "newValue": "0.0"
  },
  {
    "id": "AUDIT-W1156251121946800-0369",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "QuantityDetail",
    "entityId": "474503446806407666519:8853474057764",
    "changedParameter": "Changed Quantity from 1.0 to 0.0",
    "oldValue": "1.0",
    "newValue": "0.0"
  },
  {
    "id": "AUDIT-W1156251121946800-0370",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "QuantityDetail",
    "entityId": "474503449538805223639:8853474080366",
    "changedParameter": "Changed Quantity from 4.0 to 0.0",
    "oldValue": "4.0",
    "newValue": "0.0"
  },
  {
    "id": "AUDIT-W1156251121946800-0371",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "QuantityDetail",
    "entityId": "47450345288920625226:8858738405534",
    "changedParameter": "Changed Quantity from 1.0 to 0.0",
    "oldValue": "1.0",
    "newValue": "0.0"
  },
  {
    "id": "AUDIT-W1156251121946800-0372",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "QuantityDetail",
    "entityId": "474503456499403471142:8858781403990",
    "changedParameter": "Changed Quantity from 4.0 to 0.0",
    "oldValue": "4.0",
    "newValue": "0.0"
  },
  {
    "id": "AUDIT-W1156251121946800-0373",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "QuantityDetail",
    "entityId": "474503459240009324886:8858894100014",
    "changedParameter": "Changed Quantity from 2.0 to 0.0",
    "oldValue": "2.0",
    "newValue": "0.0"
  },
  {
    "id": "AUDIT-W1156251121946800-0374",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "OrderMilestoneEvent",
    "entityId": "4e77ef34-c206-473a-b308-277c52854551",
    "changedParameter": "Inserted OrderMilestoneEvent",
    "oldValue": null,
    "newValue": "4e77ef34-c206-473a-b308-277c52854551"
  },
  {
    "id": "AUDIT-W1156251121946800-0375",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "Order",
    "entityId": "W1156251121946800",
    "changedParameter": "Changed NextEventTime from 2025-11-21T03:45:15.494 to null",
    "oldValue": "2025-11-21T03:45:15.494",
    "newValue": null
  },
  {
    "id": "AUDIT-W1156251121946800-0376",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "OrderMilestone",
    "entityId": "Order::Milestone::Confirmed",
    "changedParameter": "Changed ExpectedTime from 2025-11-21T03:42:15.494 to 2025-11-21T03:45:24.785185",
    "oldValue": "2025-11-21T03:42:15.494",
    "newValue": "2025-11-21T03:45:24.785185"
  },
  {
    "id": "AUDIT-W1156251121946800-0377",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "OrderMilestone",
    "entityId": "Order::Milestone::Released",
    "changedParameter": "Changed MonitoringRuleId from Remorse_Period to null",
    "oldValue": "Remorse_Period",
    "newValue": null
  },
  {
    "id": "AUDIT-W1156251121946800-0378",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:45 ICT",
    "entityName": "OrderMilestone",
    "entityId": "Order::Milestone::Released",
    "changedParameter": "Changed NextEventTime from 2025-11-21T03:45:15.494 to null",
    "oldValue": "2025-11-21T03:45:15.494",
    "newValue": null
  },
  {
    "id": "AUDIT-W1156251121946800-0379",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:42 ICT",
    "entityName": "Order",
    "entityId": "W1156251121946800",
    "changedParameter": "Changed EventSubmitTime from null to 2038-01-18T23:59",
    "oldValue": null,
    "newValue": "2038-01-18T23:59"
  },
  {
    "id": "AUDIT-W1156251121946800-0380",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:42 ICT",
    "entityName": "Order",
    "entityId": "W1156251121946800",
    "changedParameter": "Changed CountedDate from null to 2025-11-21T03:42:15.496914",
    "oldValue": null,
    "newValue": "2025-11-21T03:42:15.496914"
  },
  {
    "id": "AUDIT-W1156251121946800-0381",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:42 ICT",
    "entityName": "Order",
    "entityId": "W1156251121946800",
    "changedParameter": "Changed IsOrderCountable from false to true",
    "oldValue": "false",
    "newValue": "true"
  },
  {
    "id": "AUDIT-W1156251121946800-0382",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:42 ICT",
    "entityName": "Order",
    "entityId": "W1156251121946800",
    "changedParameter": "Changed NextEventTime from null to 2025-11-21T03:45:15.494610",
    "oldValue": null,
    "newValue": "2025-11-21T03:45:15.494610"
  },
  {
    "id": "AUDIT-W1156251121946800-0383",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:42 ICT",
    "entityName": "Order",
    "entityId": "W1156251121946800",
    "changedParameter": "Changed ConfirmedOrderTotal from null to 933.00",
    "oldValue": null,
    "newValue": "933.00"
  },
  {
    "id": "AUDIT-W1156251121946800-0384",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:42 ICT",
    "entityName": "Order",
    "entityId": "W1156251121946800",
    "changedParameter": "Changed DoNotReleaseBefore from null to 2025-11-21T03:45:15.494610",
    "oldValue": null,
    "newValue": "2025-11-21T03:45:15.494610"
  },
  {
    "id": "AUDIT-W1156251121946800-0385",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:42 ICT",
    "entityName": "Order",
    "entityId": "W1156251121946800",
    "changedParameter": "Changed IsConfirmed from false to true",
    "oldValue": "false",
    "newValue": "true"
  },
  {
    "id": "AUDIT-W1156251121946800-0386",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:42 ICT",
    "entityName": "Order",
    "entityId": "W1156251121946800",
    "changedParameter": "Changed ConfirmedDate from null to 2025-11-21T03:42:15.315564",
    "oldValue": null,
    "newValue": "2025-11-21T03:42:15.315564"
  },
  {
    "id": "AUDIT-W1156251121946800-0387",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:42 ICT",
    "entityName": "OrderMilestone",
    "entityId": "Order::Milestone::Confirmed",
    "changedParameter": "Changed ExpectedTime from 2025-11-21T03:42:02.048 to 2025-11-21T03:42:15.494610",
    "oldValue": "2025-11-21T03:42:02.048",
    "newValue": "2025-11-21T03:42:15.494610"
  },
  {
    "id": "AUDIT-W1156251121946800-0388",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:42 ICT",
    "entityName": "OrderMilestone",
    "entityId": "Order::Milestone::Confirmed",
    "changedParameter": "Changed ActualTime from null to 2025-11-21T03:42:15.494610",
    "oldValue": null,
    "newValue": "2025-11-21T03:42:15.494610"
  },
  {
    "id": "AUDIT-W1156251121946800-0389",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:42 ICT",
    "entityName": "OrderMilestone",
    "entityId": "Order::Milestone::Allocated",
    "changedParameter": "Changed ExpectedTime from null to 2025-11-21T03:42:15.494610",
    "oldValue": null,
    "newValue": "2025-11-21T03:42:15.494610"
  },
  {
    "id": "AUDIT-W1156251121946800-0390",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:42 ICT",
    "entityName": "OrderMilestone",
    "entityId": "Order::Milestone::Released",
    "changedParameter": "Changed MonitoringRuleId from null to Remorse_Period",
    "oldValue": null,
    "newValue": "Remorse_Period"
  },
  {
    "id": "AUDIT-W1156251121946800-0391",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:42 ICT",
    "entityName": "OrderMilestone",
    "entityId": "Order::Milestone::Released",
    "changedParameter": "Changed ExpectedTime from null to 2025-11-21T03:45:15.494610",
    "oldValue": null,
    "newValue": "2025-11-21T03:45:15.494610"
  },
  {
    "id": "AUDIT-W1156251121946800-0392",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:42 ICT",
    "entityName": "OrderMilestone",
    "entityId": "Order::Milestone::Released",
    "changedParameter": "Changed NextEventTime from null to 2025-11-21T03:45:15.494610",
    "oldValue": null,
    "newValue": "2025-11-21T03:45:15.494610"
  },
  {
    "id": "AUDIT-W1156251121946800-0393",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:42 ICT",
    "entityName": "Order",
    "entityId": "W1156251121946800",
    "changedParameter": "Changed PaymentStatus from Awaiting Payment Info to Authorized",
    "oldValue": "Awaiting Payment Info",
    "newValue": "Authorized"
  },
  {
    "id": "AUDIT-W1156251121946800-0394",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:42 ICT",
    "entityName": "Allocation",
    "entityId": "474503400716405973142",
    "changedParameter": "Inserted Allocation",
    "oldValue": null,
    "newValue": "474503400716405973142"
  },
  {
    "id": "AUDIT-W1156251121946800-0395",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:42 ICT",
    "entityName": "Allocation",
    "entityId": "474503411579503199038",
    "changedParameter": "Inserted Allocation",
    "oldValue": null,
    "newValue": "474503411579503199038"
  },
  {
    "id": "AUDIT-W1156251121946800-0396",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:42 ICT",
    "entityName": "Allocation",
    "entityId": "474503414732003741983",
    "changedParameter": "Inserted Allocation",
    "oldValue": null,
    "newValue": "474503414732003741983"
  },
  {
    "id": "AUDIT-W1156251121946800-0397",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:42 ICT",
    "entityName": "Allocation",
    "entityId": "474503417196903927378",
    "changedParameter": "Inserted Allocation",
    "oldValue": null,
    "newValue": "474503417196903927378"
  },
  {
    "id": "AUDIT-W1156251121946800-0398",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:42 ICT",
    "entityName": "Allocation",
    "entityId": "474503419600107713155",
    "changedParameter": "Inserted Allocation",
    "oldValue": null,
    "newValue": "474503419600107713155"
  },
  {
    "id": "AUDIT-W1156251121946800-0399",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:42 ICT",
    "entityName": "Allocation",
    "entityId": "474503422161102885882",
    "changedParameter": "Inserted Allocation",
    "oldValue": null,
    "newValue": "474503422161102885882"
  },
  {
    "id": "AUDIT-W1156251121946800-0400",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:42 ICT",
    "entityName": "Allocation",
    "entityId": "474503424211609865053",
    "changedParameter": "Inserted Allocation",
    "oldValue": null,
    "newValue": "474503424211609865053"
  },
  {
    "id": "AUDIT-W1156251121946800-0401",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:42 ICT",
    "entityName": "QuantityDetail",
    "entityId": "474503439139105688235:5904277114444",
    "changedParameter": "Inserted QuantityDetail",
    "oldValue": null,
    "newValue": "474503439139105688235"
  },
  {
    "id": "AUDIT-W1156251121946800-0402",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:42 ICT",
    "entityName": "QuantityDetail",
    "entityId": "474503443979708809084:8852043003485",
    "changedParameter": "Inserted QuantityDetail",
    "oldValue": null,
    "newValue": "474503443979708809084"
  },
  {
    "id": "AUDIT-W1156251121946800-0403",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:42 ICT",
    "entityName": "QuantityDetail",
    "entityId": "474503446806407666519:8853474057764",
    "changedParameter": "Inserted QuantityDetail",
    "oldValue": null,
    "newValue": "474503446806407666519"
  },
  {
    "id": "AUDIT-W1156251121946800-0404",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:42 ICT",
    "entityName": "QuantityDetail",
    "entityId": "474503449538805223639:8853474080366",
    "changedParameter": "Inserted QuantityDetail",
    "oldValue": null,
    "newValue": "474503449538805223639"
  },
  {
    "id": "AUDIT-W1156251121946800-0405",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:42 ICT",
    "entityName": "QuantityDetail",
    "entityId": "47450345288920625226:8858738405534",
    "changedParameter": "Inserted QuantityDetail",
    "oldValue": null,
    "newValue": "47450345288920625226"
  },
  {
    "id": "AUDIT-W1156251121946800-0406",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:42 ICT",
    "entityName": "QuantityDetail",
    "entityId": "474503456499403471142:8858781403990",
    "changedParameter": "Inserted QuantityDetail",
    "oldValue": null,
    "newValue": "474503456499403471142"
  },
  {
    "id": "AUDIT-W1156251121946800-0407",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:42 ICT",
    "entityName": "QuantityDetail",
    "entityId": "474503459240009324886:8858894100014",
    "changedParameter": "Inserted QuantityDetail",
    "oldValue": null,
    "newValue": "474503459240009324886"
  },
  {
    "id": "AUDIT-W1156251121946800-0408",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:42 ICT",
    "entityName": "Order",
    "entityId": "W1156251121946800",
    "changedParameter": "Changed MaxFulfillmentStatusId from Open to Allocated",
    "oldValue": "Open",
    "newValue": "Allocated"
  },
  {
    "id": "AUDIT-W1156251121946800-0409",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:42 ICT",
    "entityName": "Order",
    "entityId": "W1156251121946800",
    "changedParameter": "Changed MinFulfillmentStatusId from Open to Allocated",
    "oldValue": "Open",
    "newValue": "Allocated"
  },
  {
    "id": "AUDIT-W1156251121946800-0410",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:42 ICT",
    "entityName": "OrderLine",
    "entityId": "1",
    "changedParameter": "Changed MaxFulfillmentStatusId from Open to Allocated",
    "oldValue": "Open",
    "newValue": "Allocated"
  },
  {
    "id": "AUDIT-W1156251121946800-0411",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:42 ICT",
    "entityName": "OrderLine",
    "entityId": "1",
    "changedParameter": "Changed MinFulfillmentStatusId from Open to Allocated",
    "oldValue": "Open",
    "newValue": "Allocated"
  },
  {
    "id": "AUDIT-W1156251121946800-0412",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:42 ICT",
    "entityName": "OrderLine",
    "entityId": "1",
    "changedParameter": "Changed PhysicalOriginId from null to CFR156",
    "oldValue": null,
    "newValue": "CFR156"
  },
  {
    "id": "AUDIT-W1156251121946800-0413",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:42 ICT",
    "entityName": "OrderLine",
    "entityId": "2",
    "changedParameter": "Changed MaxFulfillmentStatusId from Open to Allocated",
    "oldValue": "Open",
    "newValue": "Allocated"
  },
  {
    "id": "AUDIT-W1156251121946800-0414",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:42 ICT",
    "entityName": "OrderLine",
    "entityId": "2",
    "changedParameter": "Changed MinFulfillmentStatusId from Open to Allocated",
    "oldValue": "Open",
    "newValue": "Allocated"
  },
  {
    "id": "AUDIT-W1156251121946800-0415",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:42 ICT",
    "entityName": "OrderLine",
    "entityId": "2",
    "changedParameter": "Changed PhysicalOriginId from null to CFR156",
    "oldValue": null,
    "newValue": "CFR156"
  },
  {
    "id": "AUDIT-W1156251121946800-0416",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:42 ICT",
    "entityName": "OrderLine",
    "entityId": "3",
    "changedParameter": "Changed MaxFulfillmentStatusId from Open to Allocated",
    "oldValue": "Open",
    "newValue": "Allocated"
  },
  {
    "id": "AUDIT-W1156251121946800-0417",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:42 ICT",
    "entityName": "OrderLine",
    "entityId": "3",
    "changedParameter": "Changed MinFulfillmentStatusId from Open to Allocated",
    "oldValue": "Open",
    "newValue": "Allocated"
  },
  {
    "id": "AUDIT-W1156251121946800-0418",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:42 ICT",
    "entityName": "OrderLine",
    "entityId": "3",
    "changedParameter": "Changed PhysicalOriginId from null to CFR156",
    "oldValue": null,
    "newValue": "CFR156"
  },
  {
    "id": "AUDIT-W1156251121946800-0419",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:42 ICT",
    "entityName": "OrderLine",
    "entityId": "4",
    "changedParameter": "Changed MaxFulfillmentStatusId from Open to Allocated",
    "oldValue": "Open",
    "newValue": "Allocated"
  },
  {
    "id": "AUDIT-W1156251121946800-0420",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:42 ICT",
    "entityName": "OrderLine",
    "entityId": "4",
    "changedParameter": "Changed MinFulfillmentStatusId from Open to Allocated",
    "oldValue": "Open",
    "newValue": "Allocated"
  },
  {
    "id": "AUDIT-W1156251121946800-0421",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:42 ICT",
    "entityName": "OrderLine",
    "entityId": "4",
    "changedParameter": "Changed PhysicalOriginId from null to CFR156",
    "oldValue": null,
    "newValue": "CFR156"
  },
  {
    "id": "AUDIT-W1156251121946800-0422",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:42 ICT",
    "entityName": "OrderLine",
    "entityId": "5",
    "changedParameter": "Changed MaxFulfillmentStatusId from Open to Allocated",
    "oldValue": "Open",
    "newValue": "Allocated"
  },
  {
    "id": "AUDIT-W1156251121946800-0423",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:42 ICT",
    "entityName": "OrderLine",
    "entityId": "5",
    "changedParameter": "Changed MinFulfillmentStatusId from Open to Allocated",
    "oldValue": "Open",
    "newValue": "Allocated"
  },
  {
    "id": "AUDIT-W1156251121946800-0424",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:42 ICT",
    "entityName": "OrderLine",
    "entityId": "5",
    "changedParameter": "Changed PhysicalOriginId from null to CFR156",
    "oldValue": null,
    "newValue": "CFR156"
  },
  {
    "id": "AUDIT-W1156251121946800-0425",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:42 ICT",
    "entityName": "OrderLine",
    "entityId": "6",
    "changedParameter": "Changed MaxFulfillmentStatusId from Open to Allocated",
    "oldValue": "Open",
    "newValue": "Allocated"
  },
  {
    "id": "AUDIT-W1156251121946800-0426",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:42 ICT",
    "entityName": "OrderLine",
    "entityId": "6",
    "changedParameter": "Changed MinFulfillmentStatusId from Open to Allocated",
    "oldValue": "Open",
    "newValue": "Allocated"
  },
  {
    "id": "AUDIT-W1156251121946800-0427",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:42 ICT",
    "entityName": "OrderLine",
    "entityId": "6",
    "changedParameter": "Changed PhysicalOriginId from null to CFR156",
    "oldValue": null,
    "newValue": "CFR156"
  },
  {
    "id": "AUDIT-W1156251121946800-0428",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:42 ICT",
    "entityName": "OrderLine",
    "entityId": "7",
    "changedParameter": "Changed MaxFulfillmentStatusId from Open to Allocated",
    "oldValue": "Open",
    "newValue": "Allocated"
  },
  {
    "id": "AUDIT-W1156251121946800-0429",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:42 ICT",
    "entityName": "OrderLine",
    "entityId": "7",
    "changedParameter": "Changed MinFulfillmentStatusId from Open to Allocated",
    "oldValue": "Open",
    "newValue": "Allocated"
  },
  {
    "id": "AUDIT-W1156251121946800-0430",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:42 ICT",
    "entityName": "OrderLine",
    "entityId": "7",
    "changedParameter": "Changed PhysicalOriginId from null to CFR156",
    "oldValue": null,
    "newValue": "CFR156"
  },
  {
    "id": "AUDIT-W1156251121946800-0431",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:42 ICT",
    "entityName": "OrderMilestone",
    "entityId": "Order::Milestone::Allocated",
    "changedParameter": "Changed ActualTime from null to 2025-11-21T03:42:02.448977",
    "oldValue": null,
    "newValue": "2025-11-21T03:42:02.448977"
  },
  {
    "id": "AUDIT-W1156251121946800-0432",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:42 ICT",
    "entityName": "QuantityDetail",
    "entityId": "474497479266829122853:5904277114444",
    "changedParameter": "Changed Quantity from 3.0 to 0.0",
    "oldValue": "3.0",
    "newValue": "0.0"
  },
  {
    "id": "AUDIT-W1156251121946800-0433",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:42 ICT",
    "entityName": "QuantityDetail",
    "entityId": "47449749424822943602:8852043003485",
    "changedParameter": "Changed Quantity from 2.0 to 0.0",
    "oldValue": "2.0",
    "newValue": "0.0"
  },
  {
    "id": "AUDIT-W1156251121946800-0434",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:42 ICT",
    "entityName": "QuantityDetail",
    "entityId": "4744975027983212045:8853474057764",
    "changedParameter": "Changed Quantity from 1.0 to 0.0",
    "oldValue": "1.0",
    "newValue": "0.0"
  },
  {
    "id": "AUDIT-W1156251121946800-0435",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:42 ICT",
    "entityName": "QuantityDetail",
    "entityId": "474497509802329379948:8853474080366",
    "changedParameter": "Changed Quantity from 4.0 to 0.0",
    "oldValue": "4.0",
    "newValue": "0.0"
  },
  {
    "id": "AUDIT-W1156251121946800-0436",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:42 ICT",
    "entityName": "QuantityDetail",
    "entityId": "474497518098729383923:8858738405534",
    "changedParameter": "Changed Quantity from 1.0 to 0.0",
    "oldValue": "1.0",
    "newValue": "0.0"
  },
  {
    "id": "AUDIT-W1156251121946800-0437",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:42 ICT",
    "entityName": "QuantityDetail",
    "entityId": "47449752492452986761:8858781403990",
    "changedParameter": "Changed Quantity from 4.0 to 0.0",
    "oldValue": "4.0",
    "newValue": "0.0"
  },
  {
    "id": "AUDIT-W1156251121946800-0438",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:42 ICT",
    "entityName": "QuantityDetail",
    "entityId": "474497532098028073053:8858894100014",
    "changedParameter": "Changed Quantity from 2.0 to 0.0",
    "oldValue": "2.0",
    "newValue": "0.0"
  },
  {
    "id": "AUDIT-W1156251121946800-0439",
    "orderId": "W1156251121946800",
    "updatedBy": "pubsubuser@TWD null",
    "updatedOn": "11/21/2025 10:42 ICT",
    "entityName": "Order",
    "entityId": "W1156251121946800",
    "changedParameter": "Inserted Order",
    "oldValue": null,
    "newValue": "W1156251121946800"
  }
];

// Note: MAO order W1156251121946800 will be added after W1156260115052036 to ensure it appears first in the list

// -----------------------------------------------------------------------------
// MAO Order W1156260115052036 Line Items
// -----------------------------------------------------------------------------
// Order W1156260115052036 - DELIVERED 3H delivery order from Tops Online
// 8 products, 10 line items (with quantity splits)
// Credit Card payment, shipped from Tops Westgate1
// -----------------------------------------------------------------------------
const maoOrderW1156260115052036Items = [
  // LINE-W115626-001: Pao M Wash Powder Detergent Regular 3000g
  {
    id: 'LINE-W115626-001',
    product_id: 'PAO-WASH-001',
    product_sku: '8850999123001',
    product_name: 'Pao M Wash Powder Detergent Regular 3000g',
    thaiName: 'เปา เอ็ม วอช ผงซักฟอก สูตรมาตรฐาน 3000ก.',
    barcode: '8850999123001',
    quantity: 1,
    orderedQty: 1,
    fulfilledQty: 1,
    unit_price: 269,
    total_price: 269,
    uom: 'EA',
    location: 'Tops Westgate1',
    fulfillmentStatus: 'DELIVERED',
    shippingMethod: '3H Delivery',
    bundle: false,
    packedOrderedQty: 1,
    route: 'สายรถนนทบุรี',
    bookingSlotFrom: '2026-01-15T21:00:00+07:00',
    bookingSlotTo: '2026-01-15T22:00:00+07:00',
    eta: {
      from: '15 Jan 2026 20:30:00',
      to: '15 Jan 2026 22:41:00'
    },
    giftWithPurchase: false,
    priceBreakdown: {
      subtotal: 269,
      discount: 0,
      charges: 0,
      amountExcludedTaxes: 251.40,
      taxes: 17.60,
      amountIncludedTaxes: 269,
      total: 269
    },
    promotions: [],
    viewType: 'ECOM-TH-DSS-NW-STD',
    supplyTypeId: 'On Hand Available',
    substitution: false,
    product_details: {
      description: 'Powder detergent for regular wash',
      category: 'Household',
      brand: 'Pao'
    }
  },
  // LINE-W115626-002-0: Pao Win Wash Liquid Regular 700ml (split 1 of 2)
  {
    id: 'LINE-W115626-002-0',
    product_id: 'PAO-LIQUID-001',
    product_sku: '8850999123002',
    product_name: 'Pao Win Wash Liquid Regular 700ml',
    thaiName: 'เปา วิน วอช น้ำยาซักผ้า สูตรมาตรฐาน 700มล.',
    barcode: '8850999123002',
    quantity: 1,
    orderedQty: 1,
    fulfilledQty: 1,
    unit_price: 89,
    total_price: 89,
    uom: 'EA',
    location: 'Tops Westgate1',
    fulfillmentStatus: 'DELIVERED',
    shippingMethod: '3H Delivery',
    bundle: false,
    packedOrderedQty: 1,
    route: 'สายรถนนทบุรี',
    bookingSlotFrom: '2026-01-15T21:00:00+07:00',
    bookingSlotTo: '2026-01-15T22:00:00+07:00',
    eta: {
      from: '15 Jan 2026 20:30:00',
      to: '15 Jan 2026 22:41:00'
    },
    giftWithPurchase: false,
    priceBreakdown: {
      subtotal: 89,
      discount: 0,
      charges: 0,
      amountExcludedTaxes: 83.18,
      taxes: 5.82,
      amountIncludedTaxes: 89,
      total: 89
    },
    promotions: [],
    parentLineId: 'LINE-W115626-002',
    splitIndex: 0,
    splitReason: 'quantity-normalization',
    viewType: 'ECOM-TH-DSS-NW-STD',
    supplyTypeId: 'On Hand Available',
    substitution: false,
    product_details: {
      description: 'Liquid detergent for regular wash',
      category: 'Household',
      brand: 'Pao'
    }
  },
  // LINE-W115626-002-1: Pao Win Wash Liquid Regular 700ml (split 2 of 2)
  {
    id: 'LINE-W115626-002-1',
    product_id: 'PAO-LIQUID-001',
    product_sku: '8850999123002',
    product_name: 'Pao Win Wash Liquid Regular 700ml',
    thaiName: 'เปา วิน วอช น้ำยาซักผ้า สูตรมาตรฐาน 700มล.',
    barcode: '8850999123002',
    quantity: 1,
    orderedQty: 1,
    fulfilledQty: 1,
    unit_price: 89,
    total_price: 89,
    uom: 'EA',
    location: 'Tops Westgate1',
    fulfillmentStatus: 'DELIVERED',
    shippingMethod: '3H Delivery',
    bundle: false,
    packedOrderedQty: 1,
    route: 'สายรถนนทบุรี',
    bookingSlotFrom: '2026-01-15T21:00:00+07:00',
    bookingSlotTo: '2026-01-15T22:00:00+07:00',
    eta: {
      from: '15 Jan 2026 20:30:00',
      to: '15 Jan 2026 22:41:00'
    },
    giftWithPurchase: false,
    priceBreakdown: {
      subtotal: 89,
      discount: 0,
      charges: 0,
      amountExcludedTaxes: 83.18,
      taxes: 5.82,
      amountIncludedTaxes: 89,
      total: 89
    },
    promotions: [],
    parentLineId: 'LINE-W115626-002',
    splitIndex: 1,
    splitReason: 'quantity-normalization',
    viewType: 'ECOM-TH-DSS-NW-STD',
    supplyTypeId: 'On Hand Available',
    substitution: false,
    product_details: {
      description: 'Liquid detergent for regular wash',
      category: 'Household',
      brand: 'Pao'
    }
  },
  // LINE-W115626-003: Cellox Toilet Tissue Purify Natural 24 Rolls
  {
    id: 'LINE-W115626-003',
    product_id: 'CELLOX-TISSUE-001',
    product_sku: '8850999123003',
    product_name: 'Cellox Toilet Tissue Purify Natural 24 Rolls',
    thaiName: 'เซลล็อกซ์ กระดาษทิชชู่ เพียวริฟาย เนเจอรัล 24 ม้วน',
    barcode: '8850999123003',
    quantity: 1,
    orderedQty: 1,
    fulfilledQty: 1,
    unit_price: 299,
    total_price: 299,
    uom: 'EA',
    location: 'Tops Westgate1',
    fulfillmentStatus: 'DELIVERED',
    shippingMethod: '3H Delivery',
    bundle: false,
    packedOrderedQty: 1,
    route: 'สายรถนนทบุรี',
    bookingSlotFrom: '2026-01-15T21:00:00+07:00',
    bookingSlotTo: '2026-01-15T22:00:00+07:00',
    eta: {
      from: '15 Jan 2026 20:30:00',
      to: '15 Jan 2026 22:41:00'
    },
    giftWithPurchase: false,
    priceBreakdown: {
      subtotal: 299,
      discount: 0,
      charges: 0,
      amountExcludedTaxes: 279.44,
      taxes: 19.56,
      amountIncludedTaxes: 299,
      total: 299
    },
    promotions: [],
    viewType: 'ECOM-TH-DSS-NW-STD',
    supplyTypeId: 'On Hand Available',
    substitution: false,
    product_details: {
      description: 'Natural toilet tissue 24 rolls pack',
      category: 'Household',
      brand: 'Cellox'
    }
  },
  // LINE-W115626-004: Tai Tai Organic Rice 5kg
  {
    id: 'LINE-W115626-004',
    product_id: 'TAITAI-RICE-001',
    product_sku: '8850999123004',
    product_name: 'Tai Tai Organic Rice 5kg',
    thaiName: 'ไท ไท ข้าวออร์แกนิค 5กก.',
    barcode: '8850999123004',
    quantity: 1,
    orderedQty: 1,
    fulfilledQty: 1,
    unit_price: 399,
    total_price: 399,
    uom: 'EA',
    location: 'Tops Westgate1',
    fulfillmentStatus: 'DELIVERED',
    shippingMethod: '3H Delivery',
    bundle: false,
    packedOrderedQty: 1,
    route: 'สายรถนนทบุรี',
    bookingSlotFrom: '2026-01-15T21:00:00+07:00',
    bookingSlotTo: '2026-01-15T22:00:00+07:00',
    eta: {
      from: '15 Jan 2026 20:30:00',
      to: '15 Jan 2026 22:41:00'
    },
    giftWithPurchase: false,
    priceBreakdown: {
      subtotal: 399,
      discount: 119.70,
      charges: 0,
      amountExcludedTaxes: 261.03,
      taxes: 18.27,
      amountIncludedTaxes: 279.30,
      total: 279.30
    },
    promotions: [
      {
        promotionId: 'PROMO-RICE-30OFF',
        promotionType: 'Percentage Discount',
        discountAmount: -119.70
      }
    ],
    viewType: 'ECOM-TH-DSS-NW-STD',
    supplyTypeId: 'On Hand Available',
    substitution: false,
    product_details: {
      description: 'Organic Thai rice 5kg bag',
      category: 'Food',
      brand: 'Tai Tai'
    }
  },
  // LINE-W115626-005-0: Ken Udon Fresh Noodle 200g (split 1 of 3)
  {
    id: 'LINE-W115626-005-0',
    product_id: 'KEN-UDON-001',
    product_sku: '8850999123005',
    product_name: 'Ken Udon Fresh Noodle 200g',
    thaiName: 'เคน อูด้ง บะหมี่สด 200ก.',
    barcode: '8850999123005',
    quantity: 1,
    orderedQty: 1,
    fulfilledQty: 1,
    unit_price: 45,
    total_price: 45,
    uom: 'EA',
    location: 'Tops Westgate1',
    fulfillmentStatus: 'DELIVERED',
    shippingMethod: '3H Delivery',
    bundle: false,
    packedOrderedQty: 1,
    route: 'สายรถนนทบุรี',
    bookingSlotFrom: '2026-01-15T21:00:00+07:00',
    bookingSlotTo: '2026-01-15T22:00:00+07:00',
    eta: {
      from: '15 Jan 2026 20:30:00',
      to: '15 Jan 2026 22:41:00'
    },
    giftWithPurchase: false,
    priceBreakdown: {
      subtotal: 45,
      discount: 13.50,
      charges: 0,
      amountExcludedTaxes: 29.44,
      taxes: 2.06,
      amountIncludedTaxes: 31.50,
      total: 31.50
    },
    promotions: [
      {
        promotionId: 'PROMO-FRESH-30OFF',
        promotionType: 'Percentage Discount',
        discountAmount: -13.50
      }
    ],
    parentLineId: 'LINE-W115626-005',
    splitIndex: 0,
    splitReason: 'quantity-normalization',
    viewType: 'ECOM-TH-DSS-NW-STD',
    supplyTypeId: 'On Hand Available',
    substitution: false,
    product_details: {
      description: 'Fresh udon noodles',
      category: 'Food',
      brand: 'Ken'
    }
  },
  // LINE-W115626-005-1: Ken Udon Fresh Noodle 200g (split 2 of 3)
  {
    id: 'LINE-W115626-005-1',
    product_id: 'KEN-UDON-001',
    product_sku: '8850999123005',
    product_name: 'Ken Udon Fresh Noodle 200g',
    thaiName: 'เคน อูด้ง บะหมี่สด 200ก.',
    barcode: '8850999123005',
    quantity: 1,
    orderedQty: 1,
    fulfilledQty: 1,
    unit_price: 45,
    total_price: 45,
    uom: 'EA',
    location: 'Tops Westgate1',
    fulfillmentStatus: 'DELIVERED',
    shippingMethod: '3H Delivery',
    bundle: false,
    packedOrderedQty: 1,
    route: 'สายรถนนทบุรี',
    bookingSlotFrom: '2026-01-15T21:00:00+07:00',
    bookingSlotTo: '2026-01-15T22:00:00+07:00',
    eta: {
      from: '15 Jan 2026 20:30:00',
      to: '15 Jan 2026 22:41:00'
    },
    giftWithPurchase: false,
    priceBreakdown: {
      subtotal: 45,
      discount: 13.50,
      charges: 0,
      amountExcludedTaxes: 29.44,
      taxes: 2.06,
      amountIncludedTaxes: 31.50,
      total: 31.50
    },
    promotions: [
      {
        promotionId: 'PROMO-FRESH-30OFF',
        promotionType: 'Percentage Discount',
        discountAmount: -13.50
      }
    ],
    parentLineId: 'LINE-W115626-005',
    splitIndex: 1,
    splitReason: 'quantity-normalization',
    viewType: 'ECOM-TH-DSS-NW-STD',
    supplyTypeId: 'On Hand Available',
    substitution: false,
    product_details: {
      description: 'Fresh udon noodles',
      category: 'Food',
      brand: 'Ken'
    }
  },
  // LINE-W115626-005-2: Ken Udon Fresh Noodle 200g (split 3 of 3)
  {
    id: 'LINE-W115626-005-2',
    product_id: 'KEN-UDON-001',
    product_sku: '8850999123005',
    product_name: 'Ken Udon Fresh Noodle 200g',
    thaiName: 'เคน อูด้ง บะหมี่สด 200ก.',
    barcode: '8850999123005',
    quantity: 1,
    orderedQty: 1,
    fulfilledQty: 1,
    unit_price: 45,
    total_price: 45,
    uom: 'EA',
    location: 'Tops Westgate1',
    fulfillmentStatus: 'DELIVERED',
    shippingMethod: '3H Delivery',
    bundle: false,
    packedOrderedQty: 1,
    route: 'สายรถนนทบุรี',
    bookingSlotFrom: '2026-01-15T21:00:00+07:00',
    bookingSlotTo: '2026-01-15T22:00:00+07:00',
    eta: {
      from: '15 Jan 2026 20:30:00',
      to: '15 Jan 2026 22:41:00'
    },
    giftWithPurchase: false,
    priceBreakdown: {
      subtotal: 45,
      discount: 13.50,
      charges: 0,
      amountExcludedTaxes: 29.44,
      taxes: 2.06,
      amountIncludedTaxes: 31.50,
      total: 31.50
    },
    promotions: [
      {
        promotionId: 'PROMO-FRESH-30OFF',
        promotionType: 'Percentage Discount',
        discountAmount: -13.50
      }
    ],
    parentLineId: 'LINE-W115626-005',
    splitIndex: 2,
    splitReason: 'quantity-normalization',
    viewType: 'ECOM-TH-DSS-NW-STD',
    supplyTypeId: 'On Hand Available',
    substitution: false,
    product_details: {
      description: 'Fresh udon noodles',
      category: 'Food',
      brand: 'Ken'
    }
  },
  // LINE-W115626-006: Khaokho Facial Moist Cream 50g
  {
    id: 'LINE-W115626-006',
    product_id: 'KHAOKHO-CREAM-001',
    product_sku: '8850999123006',
    product_name: 'Khaokho Facial Moist Cream 50g',
    thaiName: 'เขาค้อ ครีมบำรุงผิวหน้า 50ก.',
    barcode: '8850999123006',
    quantity: 1,
    orderedQty: 1,
    fulfilledQty: 1,
    unit_price: 289,
    total_price: 289,
    uom: 'EA',
    location: 'Tops Westgate1',
    fulfillmentStatus: 'DELIVERED',
    shippingMethod: '3H Delivery',
    bundle: false,
    packedOrderedQty: 1,
    route: 'สายรถนนทบุรี',
    bookingSlotFrom: '2026-01-15T21:00:00+07:00',
    bookingSlotTo: '2026-01-15T22:00:00+07:00',
    eta: {
      from: '15 Jan 2026 20:30:00',
      to: '15 Jan 2026 22:41:00'
    },
    giftWithPurchase: false,
    priceBreakdown: {
      subtotal: 289,
      discount: 86.70,
      charges: 0,
      amountExcludedTaxes: 189.07,
      taxes: 13.23,
      amountIncludedTaxes: 202.30,
      total: 202.30
    },
    promotions: [
      {
        promotionId: 'PROMO-BEAUTY-30OFF',
        promotionType: 'Percentage Discount',
        discountAmount: -86.70
      }
    ],
    viewType: 'ECOM-TH-DSS-NW-STD',
    supplyTypeId: 'On Hand Available',
    substitution: false,
    product_details: {
      description: 'Natural facial moisturizing cream',
      category: 'Beauty',
      brand: 'Khaokho'
    }
  },
  // LINE-W115626-007: Mama Instant Noodles Tom Yum 55g x 6
  {
    id: 'LINE-W115626-007',
    product_id: 'EXTRA-PROD-001',
    product_sku: '8850999123007',
    product_name: 'Mama Instant Noodles Tom Yum 55g x 6',
    thaiName: 'มาม่า บะหมี่กึ่งสำเร็จรูป ต้มยำ 55ก. x 6',
    barcode: '8850999123007',
    quantity: 1,
    orderedQty: 1,
    fulfilledQty: 1,
    unit_price: 72,
    total_price: 72,
    uom: 'EA',
    location: 'Tops Westgate1',
    fulfillmentStatus: 'DELIVERED',
    shippingMethod: '3H Delivery',
    bundle: false,
    packedOrderedQty: 1,
    route: 'สายรถนนทบุรี',
    bookingSlotFrom: '2026-01-15T21:00:00+07:00',
    bookingSlotTo: '2026-01-15T22:00:00+07:00',
    eta: {
      from: '15 Jan 2026 20:30:00',
      to: '15 Jan 2026 22:41:00'
    },
    giftWithPurchase: false,
    priceBreakdown: {
      subtotal: 72,
      discount: 21.60,
      charges: 0,
      amountExcludedTaxes: 47.10,
      taxes: 3.30,
      amountIncludedTaxes: 50.40,
      total: 50.40
    },
    promotions: [
      {
        promotionId: 'PROMO-MAMA-30OFF',
        promotionType: 'Percentage Discount',
        discountAmount: -21.60
      }
    ],
    viewType: 'ECOM-TH-DSS-NW-STD',
    supplyTypeId: 'On Hand Available',
    substitution: false,
    product_details: {
      description: 'Instant noodles Tom Yum flavor pack',
      category: 'Food',
      brand: 'Mama'
    }
  },
  // LINE-W115626-008: Dutch Mill Yogurt Drink Mixed Berry 180ml x 4
  {
    id: 'LINE-W115626-008',
    product_id: 'EXTRA-PROD-002',
    product_sku: '8850999123008',
    product_name: 'Dutch Mill Yogurt Drink Mixed Berry 180ml x 4',
    thaiName: 'ดัชมิลล์ โยเกิร์ตพร้อมดื่ม มิกซ์เบอร์รี่ 180มล. x 4',
    barcode: '8850999123008',
    quantity: 1,
    orderedQty: 1,
    fulfilledQty: 1,
    unit_price: 65,
    total_price: 65,
    uom: 'EA',
    location: 'Tops Westgate1',
    fulfillmentStatus: 'DELIVERED',
    shippingMethod: '3H Delivery',
    bundle: false,
    packedOrderedQty: 1,
    route: 'สายรถนนทบุรี',
    bookingSlotFrom: '2026-01-15T21:00:00+07:00',
    bookingSlotTo: '2026-01-15T22:00:00+07:00',
    eta: {
      from: '15 Jan 2026 20:30:00',
      to: '15 Jan 2026 22:41:00'
    },
    giftWithPurchase: false,
    priceBreakdown: {
      subtotal: 65,
      discount: 19.50,
      charges: 0,
      amountExcludedTaxes: 42.52,
      taxes: 2.98,
      amountIncludedTaxes: 45.50,
      total: 45.50
    },
    promotions: [
      {
        promotionId: 'PROMO-DAIRY-30OFF',
        promotionType: 'Percentage Discount',
        discountAmount: -19.50
      }
    ],
    viewType: 'ECOM-TH-DSS-NW-STD',
    supplyTypeId: 'On Hand Available',
    substitution: false,
    product_details: {
      description: 'Yogurt drink mixed berry flavor',
      category: 'Beverages',
      brand: 'Dutch Mill'
    }
  }
];

// MAO Order W1156260115052036 - Complete Order Object
const maoOrderW1156260115052036 = {
  id: 'W1156260115052036',
  order_no: 'W1156260115052036',
  organization: 'CFR',
  order_date: '2026-01-15T19:41:00+07:00',
  business_unit: 'Tops',
  order_type: 'DELIVERY',
  sellingChannel: 'web',
  channel: 'web',
  status: 'DELIVERED',
  customer: {
    id: 'CUST-W115626-001',
    name: 'วิริยงสุดา ศรีทอง',
    email: '2510083814@dummy.com',
    phone: '0622424423',
    customerType: 'INDIVIDUAL',
    custRef: 'CREF-W115626',
    T1Number: 'T1-2510083814'
  },
  shipping_address: {
    street: '88/99 หมู่บ้านเดอะคอนเนค ถนนราชพฤกษ์',
    city: 'นนทบุรี',
    state: 'นนทบุรี',
    postal_code: '11000',
    country: 'TH'
  },
  items: maoOrderW1156260115052036Items,
  pricingBreakdown: {
    subtotal: 1841,
    orderDiscount: 0,
    lineItemDiscount: 551.32,
    taxAmount: 84.34,
    taxBreakdown: maoOrderW1156260115052036Items.map(item => ({
      lineId: item.id,
      taxAmount: item.priceBreakdown.taxes
    })),
    shippingFee: 0,
    additionalFees: 0,
    grandTotal: 1289.68,
    paidAmount: 1289.68,
    currency: 'THB'
  },
  total_amount: 1289.68,
  payment_info: {
    method: 'CREDIT_CARD',
    status: 'PAID',
    transaction_id: '17637001260115052036',
    subtotal: 1841,
    discounts: 551.32,
    charges: 0,
    amountIncludedTaxes: 1289.68,
    amountExcludedTaxes: 1205.34,
    taxes: 84.34,
    cardNumber: '525669XXXXXX9368',
    expiryDate: '**/****'
  },
  paymentDetails: [
    {
      id: 'PAY-W1156260115052036-001',
      method: 'CREDIT_CARD',
      status: 'PAID',
      transactionId: '17637001260115052036',
      amount: 1289.68,
      currency: 'THB',
      date: '2026-01-15T19:45:00+07:00',
      gateway: 'KBank',
      cardNumber: '525669XXXXXX9368',
      expiryDate: '**/****'
    }
  ],
  orderDiscounts: [
    {
      amount: 551.32,
      type: 'PERCENTAGE_PROMOTIONS',
      description: '30% off selected items (6 items)'
    }
  ],
  promotions: [
    {
      promotionId: 'PROMO-RICE-30OFF',
      promotionName: '30% Off Organic Rice',
      promotionType: 'Percentage Discount',
      discountAmount: -119.70
    },
    {
      promotionId: 'PROMO-FRESH-30OFF',
      promotionName: '30% Off Fresh Products',
      promotionType: 'Percentage Discount',
      discountAmount: -40.50
    },
    {
      promotionId: 'PROMO-BEAUTY-30OFF',
      promotionName: '30% Off Beauty Products',
      promotionType: 'Percentage Discount',
      discountAmount: -86.70
    },
    {
      promotionId: 'PROMO-MAMA-30OFF',
      promotionName: '30% Off Mama Noodles',
      promotionType: 'Percentage Discount',
      discountAmount: -21.60
    },
    {
      promotionId: 'PROMO-DAIRY-30OFF',
      promotionName: '30% Off Dairy Products',
      promotionType: 'Percentage Discount',
      discountAmount: -19.50
    }
  ],
  couponCodes: [],
  deliveryMethods: [
    {
      type: 'HOME_DELIVERY' as DeliveryMethodType,
      itemCount: 10,
      homeDelivery: {
        recipient: 'วิริยงสุดา ศรีทอง',
        phone: '0622424423',
        address: '88/99 หมู่บ้านเดอะคอนเนค ถนนราชพฤกษ์',
        district: 'บางกรวย',
        city: 'นนทบุรี',
        postalCode: '11000',
        specialInstructions: '3H Delivery - ฝากไว้ที่รปภ. ได้'
      }
    }
  ],
  deliveryTypeCode: 'HOME_DELIVERY_3H',
  sla_info: {
    target_minutes: 180,
    elapsed_minutes: 170,
    status: 'COMPLIANT'
  },
  metadata: {
    created_at: '2026-01-15T19:41:00+07:00',
    updated_at: '2026-01-15T22:30:00+07:00',
    priority: 'NORMAL',
    store_name: 'Tops Westgate1',
    store_no: '',
    order_created: '2026-01-15T19:41:00+07:00',
    viewTypes: ['ECOM-TH-DSS-NW-STD']
  },
  on_hold: false,
  fullTaxInvoice: false,
  customerTypeId: 'CT-IND',
  allowSubstitution: false,
  allow_substitution: false,
  currency: 'THB',
  capturedDate: '2026-01-15T19:45:00+07:00',
  t1Member: 'T1-2510083814',
  confirmedDate: '2026-01-15T19:46:00+07:00',
  trackingNumber: 'TRKW1156260115052036',
  shippedFrom: 'Tops Westgate1',
  shippedOn: '2026-01-15T20:30:00+07:00',
  eta: '15 Jan 2026 20:30 - 22:41',
  relNo: 'REL-2026-W115626'
};

// Note: MAO orders added after scenarioOrder

// -----------------------------------------------------------------------------
// SCENARIO TEST ORDER: ORD-SCENARIO-001
// -----------------------------------------------------------------------------
// View Types: ECOM-TH-DSS-NW-STD (DS Standard) & ECOM-TH-DSS-LOCD-EXP (DS Express)
// Items: 4 items total
// Conditions: Promotion, Coupon, Gift Message, Gift with Purchase = Y
// Delivery: Home Delivery (Standard), Click & Collect (Express)
// Payment: Credit Card, T1 Member
// -----------------------------------------------------------------------------
const scenarioOrderItems = [
  // Item 1: Home Delivery - Standard (View: ECOM-TH-DSS-NW-STD)
  // Reqs: 1 item have 1 promotion
  {
    id: `ITEM-SCENARIO-001-1`,
    product_id: "PROD-DS-001",
    product_name: "Luxury Perfume 50ml",
    thaiName: "น้ำหอมหรู 50มล.",
    product_sku: "BEAUTY-001",
    quantity: 1,
    unit_price: 2500,
    total_price: 2500,
    product_details: {
      description: "Premium fragrance",
      category: "Beauty",
      brand: "Dior"
    },
    uom: "EA",
    packedOrderedQty: undefined,
    location: "CFM1001",
    barcode: "8850000000001",
    shippingMethod: "Standard Delivery", // HD Standard
    fulfillmentStatus: "Packed",
    giftWrapped: true,
    giftWrappedMessage: "Happy Birthday Mom!", // Gift Message
    giftWithPurchase: "Free Sample Perfume", // GWP
    promotions: [{
      discountAmount: -250,
      promotionId: "PROMO-BEAUTY-01",
      promotionType: "Discount"
      // Removed secretCode to meet "1 promotion" requirement
    }],
    viewType: "ECOM-TH-DSS-NW-STD",
    supplyTypeId: "On Hand Available",
    substitution: false,
    bundle: false,
    bundleRef: undefined,
    eta: {
      from: "16 Jan 2026 09:00:00",
      to: "18 Jan 2026 18:00:00"
    },
    priceBreakdown: {
      subtotal: 2500,
      discount: 250,
      charges: 0,
      amountIncludedTaxes: 2250,
      amountExcludedTaxes: 2102.80,
      taxes: 147.20,
      total: 2250
    },
    route: "สายรถพระราม 9",
    bookingSlotFrom: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
    bookingSlotTo: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString()
  },
  // Item 2: Home Delivery - Standard (View: ECOM-TH-DSS-NW-STD)
  // Reqs: 1 item have Promotions & Coupons (Mix)
  {
    id: `ITEM-SCENARIO-001-2`,
    product_id: "PROD-DS-002",
    product_name: "Silk Scarf",
    thaiName: "ผ้าพันคอไหม",
    product_sku: "FASHION-001",
    quantity: 1,
    unit_price: 1500,
    total_price: 1500,
    product_details: {
      description: "100% Silk Scarf",
      category: "Fashion",
      brand: "Jim Thompson"
    },
    uom: "EA",
    packedOrderedQty: undefined,
    location: "CFM1002",
    barcode: "8850000000002",
    shippingMethod: "Standard Delivery", // HD Standard
    fulfillmentStatus: "Packed",
    giftWrapped: true,
    giftWrappedMessage: "For you",
    giftWithPurchase: "Silk Care Kit",
    promotions: [
      {
        discountAmount: -150,
        promotionId: "PROMO-FASH-01",
        promotionType: "Member Discount"
      },
      {
        discountAmount: -100,
        promotionId: "COUPON-FASH-02",
        promotionType: "Coupon Discount",
        secretCode: "SILKLOVER" // Coupon
      }
    ],
    viewType: "ECOM-TH-DSS-NW-STD",
    supplyTypeId: "On Hand Available",
    substitution: false,
    bundle: false,
    bundleRef: undefined,
    eta: {
      from: "16 Jan 2026 09:00:00",
      to: "18 Jan 2026 18:00:00"
    },
    priceBreakdown: {
      subtotal: 1500,
      discount: 250, // 150 + 100
      charges: 0,
      amountIncludedTaxes: 1250,
      amountExcludedTaxes: 1168.22,
      taxes: 81.78,
      total: 1250
    },
    route: "สายรถพระราม 9",
    bookingSlotFrom: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
    bookingSlotTo: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString()
  },
  // Item 3: Click & Collect - Express (View: ECOM-TH-DSS-LOCD-EXP)
  // Reqs: 1 item use coupon
  {
    id: `ITEM-SCENARIO-001-3`,
    product_id: "PROD-DS-003",
    product_name: "Wireless Earbuds",
    thaiName: "หูฟังไร้สาย",
    product_sku: "ELEC-001",
    quantity: 1,
    unit_price: 5900,
    total_price: 5900,
    product_details: {
      description: "Noise cancelling earbuds",
      category: "Electronics",
      brand: "Sony"
    },
    uom: "EA",
    packedOrderedQty: undefined,
    location: "CFM1003",
    barcode: "8850000000003",
    shippingMethod: "1H Delivery", // CC Express
    fulfillmentStatus: "Ready for Pickup",
    giftWrapped: true,
    giftWrappedMessage: "Enjoy the music",
    giftWithPurchase: "Protective Case",
    promotions: [{
      discountAmount: -500,
      promotionId: "PROMO-ELEC-01",
      promotionType: "Product Discount Promotion",
      secretCode: "SONY500" // Coupon
    }],
    viewType: "ECOM-TH-DSS-LOCD-EXP",
    supplyTypeId: "On Hand Available",
    substitution: false,
    bundle: false,
    bundleRef: undefined,
    eta: {
      from: "15 Jan 2026 14:00:00",
      to: "15 Jan 2026 15:00:00"
    },
    priceBreakdown: {
      subtotal: 5900,
      discount: 500,
      charges: 0,
      amountIncludedTaxes: 5400,
      amountExcludedTaxes: 5046.73,
      taxes: 353.27,
      total: 5400
    },
    route: "CC-EXPRESS",
    bookingSlotFrom: new Date().toISOString(),
    bookingSlotTo: new Date(new Date().getTime() + 3600000).toISOString()
  },
  // Item 4: Click & Collect - Express (View: ECOM-TH-DSS-LOCD-EXP)
  // Reqs: 1 item have 2 promotion
  {
    id: `ITEM-SCENARIO-001-4`,
    product_id: "PROD-DS-004",
    product_name: "Smart Watch",
    thaiName: "สมาร์ทวอทช์",
    product_sku: "ELEC-002",
    quantity: 1,
    unit_price: 12900,
    total_price: 12900,
    product_details: {
      description: "Latest model smart watch",
      category: "Electronics",
      brand: "Garmin"
    },
    uom: "EA",
    packedOrderedQty: 2,
    location: "CFM1004",
    barcode: "8850000000004",
    shippingMethod: "1H Delivery", // CC Express
    fulfillmentStatus: "Ready for Pickup",
    giftWrapped: true,
    giftWrappedMessage: "Stay healthy",
    giftWithPurchase: "Screen Protector",
    promotions: [
      {
        discountAmount: -1000,
        promotionId: "PROMO-ELEC-02",
        promotionType: "Bundle Discount"
      },
      {
        discountAmount: -500,
        promotionId: "PROMO-ELEC-03",
        promotionType: "Season Discount"
      }
    ],
    viewType: "ECOM-TH-DSS-LOCD-EXP",
    supplyTypeId: "On Hand Available",
    substitution: false,
    bundle: true,
    bundleRef: "BDL-001",
    eta: {
      from: "15 Jan 2026 14:00:00",
      to: "15 Jan 2026 15:00:00"
    },
    priceBreakdown: {
      subtotal: 12900,
      discount: 1500, // 1000 + 500
      charges: 0,
      amountIncludedTaxes: 11400,
      amountExcludedTaxes: 10654.21,
      taxes: 745.79,
      total: 11400
    },
    route: "CC-EXPRESS",
    bookingSlotFrom: new Date().toISOString(),
    bookingSlotTo: new Date(new Date().getTime() + 3600000).toISOString()
  }
];

// Calculate totals from item breakdowns to ensure consistency
const scenarioSubtotal = scenarioOrderItems.reduce((sum, item) => sum + item.priceBreakdown.subtotal, 0);
const scenarioDiscounts = scenarioOrderItems.reduce((sum, item) => sum + item.priceBreakdown.discount, 0);
const scenarioCharges = 0;
const scenarioTotal = scenarioOrderItems.reduce((sum, item) => sum + item.priceBreakdown.total, 0);
const scenarioExcludedTaxes = scenarioOrderItems.reduce((sum, item) => sum + item.priceBreakdown.amountExcludedTaxes, 0);
const scenarioTaxes = scenarioOrderItems.reduce((sum, item) => sum + item.priceBreakdown.taxes, 0);

// Generate future pickup date (tomorrow)
const pickupDate = new Date();
pickupDate.setDate(pickupDate.getDate() + 1);
const pickupDateStr = pickupDate.toLocaleDateString('en-GB', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
});

const scenarioOrder = {
  id: "ORD-SCENARIO-001",
  order_no: "ORD-SCENARIO-001",
  customer: {
    id: "CUST-SCENARIO",
    name: "Scenario Tester",
    email: "tester@example.com",
    phone: "+66812345678",
    T1Number: "T199988877", // T1 Member
    customerType: "CORPORATE", // Changed to CORPORATE to trigger Company Name logic
    custRef: "CREF-SCENARIO"
  },
  items: scenarioOrderItems,
  status: "PROCESSING",
  channel: "Tops Online",
  business_unit: "DS", // Matching View Type BU
  order_type: "DELIVERY", // Mixed logic usually defaults to Delivery in top level
  total_amount: scenarioTotal,
  order_date: new Date().toISOString(),
  shipping_address: {
    street: "123 Scenario Road",
    city: "Bangkok",
    state: "Bangkok",
    postal_code: "10110",
    country: "Thailand"
  },
  payment_info: {
    method: "CREDIT_CARD",
    status: "PAID",
    transaction_id: "TXN-SCENARIO-001",
    subtotal: scenarioSubtotal,
    discounts: scenarioDiscounts,
    charges: scenarioCharges,
    amountIncludedTaxes: scenarioTotal,
    amountExcludedTaxes: scenarioExcludedTaxes,
    taxes: scenarioTaxes
  },
  metadata: {
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    priority: "NORMAL",
    store_name: "Tops Central World",
    store_no: "STR-0001",
    viewTypes: ["ECOM-TH-DSS-NW-STD", "ECOM-TH-DSS-LOCD-EXP"],
    order_created: new Date().toISOString() // Added Order Created field
  },
  sla_info: {
    target_minutes: 60,
    elapsed_minutes: 10,
    status: "COMPLIANT"
  },
  deliveryMethods: [
    {
      type: 'HOME_DELIVERY',
      itemCount: 2,
      homeDelivery: {
        recipient: "Scenario Tester",
        phone: "+66812345678",
        address: "123 Scenario Road",
        district: "Watthana",
        city: "Bangkok",
        postalCode: "10110",
        specialInstructions: "Standard Delivery Items"
      }
    },
    {
      type: 'CLICK_COLLECT',
      itemCount: 2,
      clickCollect: {
        storeName: "Tops Central World",
        storeAddress: "Central World, Bangkok",
        storePhone: "02-111-2222",
        recipientName: "Scenario Tester",
        phone: "+66812345678",
        pickupDate: pickupDateStr,
        timeSlot: "10:00 - 12:00", // Express/1H Slot usually
        collectionCode: "CC-SCENARIO-001",
        relNo: "REL-2026-SCENARIO",
        allocationType: "Pickup"
      }
    }
  ],
  on_hold: false,
  fullTaxInvoice: true,
  customerTypeId: "CT-TOP",
  sellingChannel: "Tops Online",
  allowSubstitution: false,
  taxId: "1234567890123",
  companyName: "Scenario Corp Co., Ltd.", // Added Company Name
  branchNo: "BR-0001" // Added Branch No
};

// Add to mock orders
mockApiOrders.unshift(scenarioOrder);

// Add MAO orders last so they appear at the top (row 1 and 2)
mockApiOrders.unshift(maoOrderW1156260115052036);  // Row 2
mockApiOrders.unshift(maoOrderW1156251121946800);  // Row 1 (top)

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