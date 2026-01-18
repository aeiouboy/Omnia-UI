# Chore: MAO Order Detail and Audit Trail Mock Data Update

## Metadata
adw_id: `380609a9`
prompt: `Analyze the MAO (Manhattan Active Omni) order detail page and audit trail, then update the Omnia-UI order management mock data to match this real order data structure.`

## Chore Description

Update the Omnia-UI mock data in `src/lib/mock-data.ts` to match the Manhattan Active Omni (MAO) order data structure based on analysis of:

1. **Order Status Page**: https://crcpp.omni.manh.com/customerengagementfacade/app/orderstatus?orderId=W1156260115052036&selectedOrg=CFR
2. **Audit Trail Page**: https://crcpp.omni.manh.com/omnifacade/#/order (navigate to audit section for order W1156260115052036)
3. **Reference Screenshot**: `/Users/naruechon/Downloads/screencapture-crcpp-omni-manh-omnifacade-2026-01-16-01_31_30.png`

The goal is to create a comprehensive mock order with ID `W1156260115052036` that includes all fields documented from the MAO system, ensuring the Omnia-UI order detail view displays correctly with realistic data.

**Key Requirements:**
- Document ALL fields from MAO pages (order header, line items, shipping/delivery, payments, discounts/promotions/coupons, pricing breakdown, audit trail)
- Map MAO fields to existing Omnia-UI structure
- Add NEW fields discovered from MAO that are missing in Omnia-UI
- Ensure backward compatibility with existing components
- Use Thai Baht (THB) currency for all pricing fields

## Relevant Files

### Existing Files to Modify

- **`src/lib/mock-data.ts`**
  - Main mock data file with `mockApiOrders` array
  - Contains order generation logic with realistic Thai data
  - Has existing order structure with customer, items, payment_info, deliveryMethods, etc.
  - Need to add/update order W1156260115052036 with comprehensive MAO-style data

- **`src/types/audit.ts`**
  - Contains audit trail type definitions
  - Has `ManhattanAuditEvent` interface for MAO-style audit events
  - Has `AuditActionType` enum with event types (ORDER_CREATED, STATUS_CHANGED, etc.)
  - Has `AuditType` enum for categories (ORDER, FULFILLMENT, PAYMENT, etc.)
  - May need minor updates if new audit fields are discovered

- **`src/types/delivery.ts`**
  - Contains delivery method types (HOME_DELIVERY, CLICK_COLLECT)
  - Has `HomeDeliveryDetails` and `ClickCollectDetails` interfaces
  - Has `DeliveryMethod` interface with type, itemCount, and details

- **`src/types/order-analysis.ts`**
  - Contains order analysis and summary types
  - Has `OrderSummary` interface with delivery_type field
  - Reference for channel-based data structures

### Component Files (for validation)

- **`src/components/order-detail-view.tsx`**
  - Main order detail view component with tabs (Overview, Items, Payments, Fulfillment, Tracking, Audit Trail)
  - Displays customer info, order info, delivery info, payment info
  - Uses order data fields: customer, items, payment_info, deliveryMethods, metadata, etc.
  - Has HomeDeliverySection and ClickCollectSection components

- **`src/components/order-detail/tracking-tab.tsx`**
  - Displays tracking information with shipments and events
  - Uses `TrackingShipment` and `CCTrackingShipment` types from audit.ts
  - Shows shipment status, tracking number, events, items

- **`src/lib/currency-utils.ts`**
  - Has `formatCurrency()` and `formatCurrencyInt()` functions
  - Used for Thai Baht formatting throughout the UI

## Step by Step Tasks

### 1. Analyze MAO Pages and Document Fields

**Note:** The provided screenshot appears to be blank/unreadable. If the MAO pages are accessible via browser, navigate to them manually to extract data. Otherwise, use the existing Omnia-UI structure as a template and enhance it with MAO-style fields.

**Fields to document from MAO:**

- **Order Header**: Order ID (W1156260115052036), Organization (CFR), dates, status, customer info, selling channel, fulfillment location
- **Line Items**: SKU, product name, barcode, quantities (ordered, fulfilled, backordered, cancelled), pricing (unit price, extended price, tax, discount), fulfillment status, shipping method, bundle/reference info, supplier, line-level promotions
- **Shipping & Delivery**: Address, delivery type code (RT-HD-EXP, RT-CC, STS), delivery type description, tracking info (carrier, tracking number, URL), expected/actual delivery dates, fulfillment store for C&C, mixed delivery support
- **Payment Information**: Payment methods (credit card, cash, transfer, wallet), payment status, transaction IDs, amounts, dates, refund info, gateway details
- **Discounts/Promotions/Coupons**: Order-level discounts, line-item discounts, coupon codes, promotion details (ID, name, type), discount breakdown, membership discounts, campaign promotions, bundle discounts
- **Pricing Breakdown**: Subtotal, order-level discount, line-item discount total, tax amounts (per line, total, breakdown), shipping fees, additional fees, grand total, currency (THB), paid amount
- **Audit Trail**: Timestamp, event type (Created, Updated, Status Changed, Payment Received, Shipped, Delivered, Cancelled, Modified), description, user/system, field changes (old → new), status transitions, payment/fulfillment/cancellation events, attachment references

### 2. Map MAO Fields to Omnia-UI Structure

Create a mapping document showing:

| MAO Field | Omnia-UI Field | Type | Status |
|-----------|----------------|------|--------|
| Order ID | `order.id` | string | ✅ Exists |
| Organization | NEW FIELD | string | ❌ Missing |
| Order Date | `order.order_date` | string | ✅ Exists |
| Created Date | `order.metadata.order_created` | string | ✅ Exists |
| Customer Name | `order.customer.name` | string | ✅ Exists |
| Customer Email | `order.customer.email` | string | ✅ Exists |
| Customer Phone | `order.customer.phone` | string | ✅ Exists |
| Customer ID | `order.customer.id` | string | ✅ Exists |
| Customer Type | `order.customer.customerType` | string | ✅ Exists |
| Selling Channel | `order.sellingChannel` or `order.channel` | string | ✅ Exists |
| ... | ... | ... | ... |

**Identify NEW fields needed:**
- `organization` - Organization code (e.g., "CFR")
- `paymentDetails` array - Multiple payment transactions with method, status, transaction ID, amount, date
- `orderDiscounts` - Order-level discount structure (amount, percentage)
- `lineItemDiscounts` - Per-line discount breakdown
- `couponCodes` array - Applied coupon codes with details
- `promotions` array - Promotion information (ID, name, type, discount amount)
- `pricingBreakdown` - Detailed pricing (subtotal, discounts, tax, shipping, total, paid)
- `auditTrail` array - Complete audit event history
- `currency` - Currency code (THB)

### 3. Update Type Definitions (if needed)

**File: `src/types/audit.ts`**
- Verify `ManhattanAuditEvent` has all needed fields: `id`, `orderId`, `updatedBy`, `updatedOn`, `entityName`, `entityId`, `changedParameter`, `oldValue`, `newValue`
- Add any missing audit event types to `AuditActionType` enum if needed

**File: `src/types/delivery.ts`**
- Verify delivery type codes are supported (RT-HD-EXP, RT-CC, STS)
- Add `deliveryTypeCode` field to delivery types if missing

**New type file (if needed): `src/types/payment.ts`**
```typescript
export interface PaymentTransaction {
  id: string
  method: 'CREDIT_CARD' | 'CASH' | 'TRANSFER' | 'WALLET' | 'QR_CODE'
  status: 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED' | 'PARTIAL_REFUND'
  transactionId: string
  amount: number
  currency: string  // THB
  date: string  // ISO 8601
  gateway?: string
  refundId?: string
  refundReason?: string
}

export interface OrderDiscount {
  amount: number
  percentage?: number
  type: 'ORDER_LEVEL' | 'LINE_ITEM' | 'MEMBERSHIP' | 'COUPON' | 'PROMOTION'
  description?: string
}

export interface Promotion {
  promotionId: string
  promotionName: string
  promotionType: string
  discountAmount: number
  couponCode?: string
}

export interface CouponCode {
  code: string
  description: string
  discountAmount: number
  appliedAt: string
}

export interface PricingBreakdown {
  subtotal: number           // Merchandise subtotal before discounts
  orderDiscount: number      // Order-level discount amount
  lineItemDiscount: number   // Line-item discount total
  taxAmount: number          // Total tax
  taxBreakdown?: {           // Per-line tax breakdown
    lineId: string
    taxAmount: number
  }[]
  shippingFee: number        // Delivery/service fee
  additionalFees?: number    // Handling/packaging fee
  grandTotal: number         // After all discounts and fees
  paidAmount: number         // Actual payment received
  currency: string           // THB
}
```

### 4. Update Mock Data with MAO Order W1156260115052036

**File: `src/lib/mock-data.ts`**

**Add new order after the existing `mockApiOrders` array:**

```typescript
// MAO-style order for comprehensive testing
export const maoOrderW1156260115052036: Order = {
  // ===== ORDER HEADER =====
  id: "W1156260115052036",
  order_no: "W1156260115052036",
  organization: "CFR",  // NEW FIELD - Organization code
  order_date: "2026-01-09T10:30:00+07:00",
  business_unit: "Retail",
  order_type: "DELIVERY",
  sellingChannel: "web",
  channel: "web",
  status: "PROCESSING",

  // ===== CUSTOMER INFORMATION =====
  customer: {
    id: "CUST-W115626",
    name: "สมชาย ใจดี",  // Thai name
    email: "somchai.jaidei@example.com",
    phone: "+66812345678",
    customerType: "Tier 1 Login",
    custRef: "CREF-12345",
    T1Number: "T110234567"
  },

  // ===== SHIPPING ADDRESS =====
  shipping_address: {
    street: "123/45 สุขุมวิท ซอย 39",  // Sukhumvit Soi 39
    city: "กรุงเทพมหานคร",  // Bangkok
    state: "วัฒนา",  // Watthana district
    postal_code: "10110",
    country: "Thailand"
  },

  // ===== LINE ITEMS =====
  items: [
    {
      id: "LINE-W115626-001",
      product_id: "PROD-001",
      product_sku: "8850012345678",
      product_name: "Fresh Milk 1L",
      thaiName: "นมสด 1ลิตร",
      barcode: "8850012345678",
      quantity: 2,
      orderedQty: 2,
      fulfilledQty: 2,
      backorderedQty: 0,
      cancelledQty: 0,
      unit_price: 45.00,
      total_price: 90.00,
      uom: "BTL",
      location: "CFM1001",
      fulfillmentStatus: "Picked",
      shippingMethod: "Standard Delivery",
      bundle: false,
      bundleRef: undefined,
      route: "สายรถลาดพร้าว",
      bookingSlotFrom: "2026-01-10T09:00:00+07:00",
      bookingSlotTo: "2026-01-10T11:00:00+07:00",
      eta: {
        from: "10 Jan 2026 09:00:00",
        to: "10 Jan 2026 11:00:00"
      },
      giftWrapped: false,
      substitution: false,
      giftWithPurchase: null,
      supplyTypeId: "On Hand Available",
      weight: undefined,
      actualWeight: undefined,

      // Pricing breakdown per line
      priceBreakdown: {
        subtotal: 90.00,
        discount: 9.00,      // 10% promo discount
        charges: 0.00,
        amountExcludedTaxes: 81.00,
        taxes: 5.67,         // 7% VAT
        amountIncludedTaxes: 86.67,
        total: 86.67
      },

      // Line-level promotions
      promotions: [
        {
          promotionId: "PROMO-2026-001",
          promotionType: "Product Discount Promotion",
          discountAmount: -9.00,
          secretCode: "FRESH10"
        }
      ],

      product_details: {
        description: "High quality fresh milk 1 liter",
        category: "Dairy & Eggs",
        brand: "Tops Quality"
      }
    },
    // Add more items (3-5 items total with variety: weight-based, pack UOM, different promotions)
    // Include items with:
    // - Weight-based UOM (KG) with weight/actualWeight fields
    // - Pack UOM with packedOrderedQty
    // - Gift wrapping with message
    // - Bundle references
    // - Different fulfillment statuses
    // - Mixed shipping methods for testing mixed delivery
  ],

  // ===== PRICING BREAKDOWN =====
  pricingBreakdown: {
    subtotal: 350.00,         // Sum of all line item totals
    orderDiscount: 35.00,     // 10% order-level discount
    lineItemDiscount: 15.00,  // Sum of all line-level discounts
    taxAmount: 24.50,         // 7% VAT on (350 - 35 - 15 + charges)
    taxBreakdown: [
      { lineId: "LINE-W115626-001", taxAmount: 5.67 },
      { lineId: "LINE-W115626-002", taxAmount: 8.82 },
      { lineId: "LINE-W115626-003", taxAmount: 10.01 }
    ],
    shippingFee: 40.00,       // Standard delivery fee
    additionalFees: 5.00,     // Handling fee
    grandTotal: 369.50,       // (350 - 35 - 15 + 40 + 5 + 24.50)
    paidAmount: 369.50,
    currency: "THB"
  },

  // ===== TOTAL AMOUNT (for backward compatibility) =====
  total_amount: 369.50,

  // ===== PAYMENT INFORMATION =====
  payment_info: {
    method: "CREDIT_CARD",
    status: "PAID",
    transaction_id: "TXN-W115626-001",
    subtotal: 350.00,
    discounts: 50.00,        // Sum of order + line item discounts
    charges: 5.00,           // Additional fees
    amountIncludedTaxes: 369.50,
    amountExcludedTaxes: 345.00,
    taxes: 24.50
  },

  // Extended payment details array (NEW)
  paymentDetails: [
    {
      id: "PAY-W115626-001",
      method: "CREDIT_CARD",
      status: "PAID",
      transactionId: "TXN-W115626-001",
      amount: 369.50,
      currency: "THB",
      date: "2026-01-09T10:31:00+07:00",
      gateway: "2C2P"
    }
  ],

  // ===== DISCOUNTS =====
  orderDiscounts: [
    {
      amount: 35.00,
      percentage: 10,
      type: "ORDER_LEVEL",
      description: "10% off for orders over 300 THB"
    }
  ],

  // ===== PROMOTIONS =====
  promotions: [
    {
      promotionId: "PROMO-2026-001",
      promotionName: "Fresh Product Discount",
      promotionType: "Product Discount Promotion",
      discountAmount: 9.00
    },
    {
      promotionId: "PROMO-2026-002",
      promotionName: "Weekend Special",
      promotionType: "Order Level Promotion",
      discountAmount: 35.00
    }
  ],

  // ===== COUPON CODES =====
  couponCodes: [
    {
      code: "FRESH10",
      description: "10% off fresh products",
      discountAmount: 9.00,
      appliedAt: "2026-01-09T10:30:30+07:00"
    },
    {
      code: "WEEKEND10",
      description: "10% off orders over 300 THB",
      discountAmount: 35.00,
      appliedAt: "2026-01-09T10:30:31+07:00"
    }
  ],

  // ===== DELIVERY METHODS =====
  deliveryMethods: [
    {
      type: "HOME_DELIVERY",
      itemCount: 4,
      homeDelivery: {
        recipient: "สมชาย ใจดี",
        phone: "+66812345678",
        address: "123/45 สุขุมวิท ซอย 39",
        district: "วัฒนา",
        city: "กรุงเทพมหานคร",
        postalCode: "10110",
        specialInstructions: "Please leave at the front door"
      }
    }
  ],

  // Delivery type code (NEW)
  deliveryTypeCode: "RT-HD-EXP",  // Retail Home Delivery Express

  // ===== SLA INFORMATION =====
  sla_info: {
    target_minutes: 180,     // 3 hours
    elapsed_minutes: 45,
    status: "COMPLIANT"
  },

  // ===== METADATA =====
  metadata: {
    created_at: "2026-01-09T10:30:00+07:00",
    updated_at: "2026-01-09T11:15:00+07:00",
    priority: "NORMAL",
    store_name: "Tops Central World",
    store_no: "STR-1001",
    order_created: "2026-01-09T10:30:00+07:00"
  },

  // ===== ADDITIONAL FIELDS =====
  on_hold: false,
  fullTaxInvoice: false,
  customerTypeId: "CT-TIE",
  allowSubstitution: true,
  allow_substitution: true,
  taxId: undefined,
  companyName: undefined,
  branchNo: undefined,

  // ===== AUDIT TRAIL (Manhattan OMS style) =====
  auditTrail: [
    {
      id: "AUDIT-W115626-001",
      orderId: "W1156260115052036",
      updatedBy: "apiuser4TMS",
      updatedOn: "09/01/2026 10:30 ICT",
      entityName: "Order",
      entityId: "W1156260115052036",
      changedParameter: "Order Created",
      oldValue: null,
      newValue: "ORDER"
    },
    {
      id: "AUDIT-W115626-002",
      orderId: "W1156260115052036",
      updatedBy: "apiuser4TMS",
      updatedOn: "09/01/2026 10:30:15 ICT",
      entityName: "Order",
      entityId: "W1156260115052036",
      changedParameter: "Payment Received",
      oldValue: "PENDING",
      newValue: "PAID"
    },
    {
      id: "AUDIT-W115626-003",
      orderId: "W1156260115052036",
      updatedBy: "system",
      updatedOn: "09/01/2026 10:31:00 ICT",
      entityName: "Order",
      entityId: "W1156260115052036",
      changedParameter: "Status Changed",
      oldValue: "SUBMITTED",
      newValue: "PROCESSING"
    },
    {
      id: "AUDIT-W115626-004",
      orderId: "W1156260115052036",
      updatedBy: "warehouse_user",
      updatedOn: "09/01/2026 11:00:00 ICT",
      entityName: "QuantityDetail",
      entityId: "LINE-W115626-001",
      changedParameter: "Fulfillment Status",
      oldValue: "Pending",
      newValue: "Picked"
    },
    {
      id: "AUDIT-W115626-005",
      orderId: "W1156260115052036",
      updatedBy: "warehouse_user",
      updatedOn: "09/01/2026 11:05:00 ICT",
      entityName: "QuantityDetail",
      entityId: "LINE-W115626-002",
      changedParameter: "Fulfillment Status",
      oldValue: "Pending",
      newValue: "Picked"
    },
    // Add more audit events covering:
    // - All items picked
    // - Order packed
    // - Shipment created
    // - Shipped event
    // - Delivery events
    // - Any modifications
    // - System events
  ]
}

// Add the MAO order to the mock orders array
export const mockApiOrdersWithMAO = [...mockApiOrders, maoOrderW1156260115052036]
```

**Key points for the mock order:**
1. Use realistic Thai data (names, addresses, phone numbers)
2. Include all pricing with Thai Baht (THB) currency
3. Create comprehensive audit trail with 10-15 events showing order lifecycle
4. Include 4-5 line items with variety (different UOMs, promotions, statuses)
5. Show complete payment, discount, promotion, and coupon structures
6. Use realistic timestamps throughout
7. Include both order-level and line-level discounts
8. Show mixed delivery scenario (home delivery + click & collect)

### 5. Update Order Type Definition

**File: `src/components/order-management-hub.tsx`**

Add the new optional fields to the `Order` interface:

```typescript
export interface Order {
  // ... existing fields ...

  // NEW FIELDS from MAO
  organization?: string
  paymentDetails?: PaymentTransaction[]
  orderDiscounts?: OrderDiscount[]
  promotions?: Promotion[]
  couponCodes?: CouponCode[]
  pricingBreakdown?: PricingBreakdown
  auditTrail?: ManhattanAuditEvent[]
  currency?: string
}
```

Import the new types at the top of the file:
```typescript
import type { PaymentTransaction, OrderDiscount, Promotion, CouponCode, PricingBreakdown } from "@/types/payment"
```

### 6. Update Audit Trail Data Generator

**File: `src/lib/mock-data.ts`**

Add a helper function to generate MAO-style audit events:

```typescript
/**
 * Generate Manhattan OMS style audit trail for an order
 * @param orderId Order ID
 * @param itemCount Number of items in the order
 * @returns Array of ManhattanAuditEvent
 */
export function generateMAOAuditTrail(orderId: string, itemCount: number): ManhattanAuditEvent[] {
  const events: ManhattanAuditEvent[] = []
  const now = new Date()
  const orderDate = new Date(now)
  orderDate.setMinutes(orderDate.getMinutes() - 60) // Order created 1 hour ago

  // Event 1: Order Created
  events.push({
    id: `AUDIT-${orderId}-001`,
    orderId,
    updatedBy: "apiuser4TMS",
    updatedOn: formatMAOAuditTimestamp(orderDate),
    entityName: "Order",
    entityId: orderId,
    changedParameter: "Order Created",
    oldValue: null,
    newValue: "ORDER"
  })

  // Event 2: Payment Received (30 seconds after order created)
  const paymentDate = new Date(orderDate)
  paymentDate.setSeconds(paymentDate.getSeconds() + 30)
  events.push({
    id: `AUDIT-${orderId}-002`,
    orderId,
    updatedBy: "payment_gateway",
    updatedOn: formatMAOAuditTimestamp(paymentDate),
    entityName: "Order",
    entityId: orderId,
    changedParameter: "Payment Received",
    oldValue: "PENDING",
    newValue: "PAID"
  })

  // Event 3: Status Changed to Processing
  const processDate = new Date(paymentDate)
  processDate.setSeconds(processDate.getSeconds() + 30)
  events.push({
    id: `AUDIT-${orderId}-003`,
    orderId,
    updatedBy: "system",
    updatedOn: formatMAOAuditTimestamp(processDate),
    entityName: "Order",
    entityId: orderId,
    changedParameter: "Status Changed",
    oldValue: "SUBMITTED",
    newValue: "PROCESSING"
  })

  // Events 4-N: Item fulfillment events
  const fulfillmentDate = new Date(processDate)
  for (let i = 0; i < itemCount; i++) {
    fulfillmentDate.setMinutes(fulfillfillmentDate.getMinutes() + 5)
    events.push({
      id: `AUDIT-${orderId}-${String(i + 4).padStart(3, '0')}`,
      orderId,
      updatedBy: "warehouse_user",
      updatedOn: formatMAOAuditTimestamp(fulfillmentDate),
      entityName: "QuantityDetail",
      entityId: `LINE-${orderId}-${String(i + 1).padStart(3, '0')}`,
      changedParameter: "Fulfillment Status",
      oldValue: "Pending",
      newValue: "Picked"
    })
  }

  return events
}

/**
 * Format timestamp for MAO audit trail (DD/MM/YYYY HH:mm ICT)
 */
function formatMAOAuditTimestamp(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${day}/${month}/${year} ${hours}:${minutes} ICT`
}
```

### 7. Update Export Functionality (if needed)

**File: `src/lib/export-utils.ts`**

Verify that CSV export includes the new fields:
- Organization
- Payment details
- Discounts
- Promotions
- Coupon codes
- Pricing breakdown

Add export mappings for new fields if missing.

### 8. Validate and Test

**Validation steps:**

1. **TypeScript compilation check:**
   ```bash
   npm run build
   ```
   Ensure no TypeScript errors related to new types or fields.

2. **Component display check:**
   - Navigate to order detail page for W1156260115052036
   - Verify all tabs display correctly:
     - Overview: Customer info, order info, delivery info, payment info
     - Items: All line items with pricing, promotions, fulfillment status
     - Payments: Payment transactions with all details
     - Fulfillment: Timeline of fulfillment events
     - Tracking: Shipment tracking with events
     - Audit Trail: All audit events in chronological order

3. **Currency formatting check:**
   - All prices show in Thai Baht (฿)
   - `formatCurrency()` and `formatCurrencyInt()` work correctly
   - Prices display with 2 decimal places where appropriate

4. **Audit trail display check:**
   - Audit events display in chronological order
   - Event types show correct badges/colors
   - Field changes display (old value → new value)
   - Entity names filter correctly

5. **Export functionality check:**
   - CSV export includes all new fields
   - Data is formatted correctly for spreadsheet import

## Validation Commands

Execute these commands to validate the chore is complete:

```bash
# 1. TypeScript compilation check
npm run build

# 2. Development server start (for manual testing)
npm run dev
# Then navigate to http://localhost:3000 and test the order detail view

# 3. Lint check (if configured)
npm run lint

# 4. Type checking
npx tsc --noEmit
```

**Manual validation checklist:**
- [ ] Order W1156260115052036 displays correctly in order list
- [ ] Order detail page opens without errors
- [ ] All tabs (Overview, Items, Payments, Fulfillment, Tracking, Audit Trail) display data
- [ ] Customer information shows all fields
- [ ] Line items display with all pricing, promotions, and fulfillment details
- [ ] Payment information shows complete breakdown
- [ ] Delivery methods display correctly (home delivery, click & collect, or mixed)
- [ ] Audit trail shows all events in chronological order
- [ ] Currency formatting shows Thai Baht (฿) correctly
- [ ] Export functionality works with all new fields

## Notes

### Screenshot Analysis Note
The provided screenshot (`screencapture-crcpp-omni-manh-omnifacade-2026-01-16-01_31_30.png`) appears to be blank or unreadable based on the image analysis result. If the MAO pages are accessible:
1. Manually navigate to the URLs provided
2. Take a fresh, clear screenshot of each page
3. Document all visible fields systematically
4. Update the mock data accordingly

If MAO access is not available:
1. Use the existing Omnia-UI structure as a foundation
2. Add MAO-style fields based on typical OMS data structures
3. Reference the ManhattanAuditEvent interface which already follows MAO patterns
4. The mock order should still be comprehensive and realistic for testing

### Key Differences: MAO vs Omnia-UI
- **Organization**: MAO has organization codes (e.g., CFR), Omnia-UI currently doesn't
- **Payment Details**: MAO may support multiple payment transactions per order
- **Discount Structure**: MAO has more granular discount tracking (order-level, line-item, membership, coupons)
- **Promotions**: MAO tracks promotions with IDs, names, types
- **Audit Trail**: MAO uses a specific format with updatedBy, updatedOn, entityName, changedParameter, oldValue, newValue
- **Currency**: MAO uses THB (Thai Baht), Omnia-UI also supports this

### Backward Compatibility
- All new fields should be optional in the Order interface
- Existing mock orders should continue to work without modification
- Components should handle missing new fields gracefully
- Export functionality should work with both old and new order structures

### Testing Considerations
- Create test cases for the new MAO order in test files
- Test with various order scenarios (single delivery, mixed delivery, different statuses)
- Verify audit trail filtering and pagination
- Test currency edge cases (zero amounts, negative discounts, large numbers)
