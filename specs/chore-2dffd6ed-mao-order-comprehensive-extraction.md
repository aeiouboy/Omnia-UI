# Chore: MAO Order W1156251121946800 Complete Extraction with Promotions and Coupons

## Metadata
adw_id: `2dffd6ed`
prompt: `Analyze MAO order W1156251121946800 completely (order status + audit trail) and create comprehensive order in Omnia-UI mock data with ALL details including promotions, coupons, and audit trail.`

## Chore Description
Extract comprehensive order data from Manhattan Active Omni (MAO) system for order W1156251121946800 using Playwright MCP automation. This task requires:

1. **Navigate to MAO Order Status page** and extract all visible data fields
2. **CRITICAL: Click 'Promotions' for EACH line item** to extract promotion details (NOT visible on main page)
3. **CRITICAL: Click 'Coupons' section** to extract applied coupon codes (NOT visible on main page)
4. **Navigate to MAO Audit Trail page** and extract ALL audit trail entries
5. **Create complete mock order** in `src/lib/mock-data.ts` with ALL extracted data
6. **Validate** the order displays correctly in Omnia-UI

**CRITICAL DIFFERENCE FROM PREVIOUS MAO EXTRACTIONS:**
- Promotions and coupons are HIDDEN in collapsible sections
- MUST click on 'Promotions' button/link for EACH line item
- MUST click on 'Coupons' section to view applied coupon codes
- These discount details are NOT visible on the main order status page

## Relevant Files
Use these files to complete the chore:

### Files to Read/Analyze
- `src/lib/mock-data.ts` - Contains existing MAO order patterns (lines 3119-3655 for reference)
- `src/components/order-management-hub.tsx` - Contains Order interface definition (lines 215-263)
- `src/types/payment.ts` - Payment type definitions
- `src/types/delivery.ts` - Delivery type definitions
- `src/types/audit.ts` - Audit trail type definitions
- `.playwright-mcp/` - Directory for screenshots

### Files to Modify
- `src/lib/mock-data.ts` - Add new maoOrderW1156251121946800 after line 3652

### New Files
- `specs/chore-2dffd6ed-mao-order-comprehensive-extraction.md` - This plan document

### MAO Pages to Extract Data From
1. **Order Status Page**: https://crcpp.omni.manh.com/customerengagementfacade/app/orderstatus?orderId=W1156251121946800&selectedOrg=CFR
2. **Audit Trail Page**: https://crcpp.omni.manh.com/omnifacade/#/order

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Navigate to MAO Order Status Page
- Use `mcp__playwright__browser_navigate` to navigate to:
  ```
  https://crcpp.omni.manh.com/customerengagementfacade/app/orderstatus?orderId=W1156251121946800&selectedOrg=CFR
  ```
- Wait for page load using `mcp__playwright__browser_wait_for` with `time=5`
- Take full-page screenshot: `.playwright-mcp/mao-W1156251121946800-status.png` using `mcp__playwright__browser_take_screenshot` with `fullPage: true`
- Capture page snapshot using `mcp__playwright__browser_snapshot` to understand page structure

### 2. Extract Basic Order Data from Main Page
From the order status page, extract:

**Order Header:**
- Order Number (order_no)
- Order Date (order_date) - Convert to ISO format
- Status (status)
- Organization (organization)
- Business Unit (business_unit)
- Order Type (order_type)
- Selling Channel (sellingChannel/channel)

**Customer Information:**
- Customer ID (customer.id)
- Customer Name in Thai (customer.name)
- Email (customer.email)
- Phone (customer.phone)
- Customer Type (customer.customerType)
- Customer Reference (customer.custRef)
- T1 Number (customer.T1Number)

**Shipping Address:**
- Full Thai address (shipping_address.street)
- City (shipping_address.city)
- State/Province (shipping_address.state)
- Postal Code (shipping_address.postal_code)

**Line Items (Basic Info):**
For EACH line item, extract:
- Line Item ID (items[].id)
- Product SKU (items[].product_sku)
- Product Name (items[].product_name)
- Thai Name (items[].thaiName)
- Barcode (items[].barcode)
- Ordered Quantity (items[].orderedQty)
- Fulfilled Quantity (items[].fulfilledQty)
- Unit Price (items[].unit_price)
- Total Price (items[].total_price)
- UOM (items[].uom)
- Location (items[].location)
- Fulfillment Status (items[].fulfillmentStatus)

**Pricing Information:**
- Subtotal (pricingBreakdown.subtotal)
- Order Discount (pricingBreakdown.orderDiscount)
- Line Item Discount (pricingBreakdown.lineItemDiscount)
- Tax Amount (pricingBreakdown.taxAmount)
- Shipping Fee (pricingBreakdown.shippingFee)
- Grand Total (pricingBreakdown.grandTotal)
- Paid Amount (pricingBreakdown.paidAmount)

**Payment Information:**
- Payment Method (payment_info.method)
- Payment Status (payment_info.status)
- Transaction ID (payment_info.transaction_id)
- Card Number (payment_info.cardNumber - masked)

**Delivery Information:**
- Delivery Type Code (deliveryTypeCode)
- Delivery Method (deliveryMethods[])
- Recipient Name (deliveryMethods[].homeDelivery.recipient)
- Recipient Phone (deliveryMethods[].homeDelivery.phone)
- Delivery Address (deliveryMethods[].homeDelivery.address)
- District (deliveryMethods[].homeDelivery.district)
- City (deliveryMethods[].homeDelivery.city)
- Postal Code (deliveryMethods[].homeDelivery.postalCode)

**SLA Information:**
- Target Minutes (sla_info.target_minutes)
- Elapsed Minutes (sla_info.elapsed_minutes)
- Status (sla_info.status)

**Metadata:**
- Created At (metadata.created_at)
- Updated At (metadata.updated_at)
- Priority (metadata.priority)
- Store Name (metadata.store_name)

### 3. CRITICAL - Extract Promotions for EACH Line Item
For EVERY line item on the order:

- Use `mcp__playwright__browser_click` to click on 'Promotions' button/link for that line item
- Wait 2 seconds for promotion details to expand: `mcp__playwright__browser_wait_for` with `time=2`
- Take screenshot: `.playwright-mcp/mao-W1156251121946800-item-[N]-promotions.png` where [N] is the line item number
- Extract from the expanded promotion section:
  - Promotion ID (promotions[].promotionId)
  - Promotion Name (promotions[].promotionName)
  - Promotion Type (promotions[].promotionType)
  - Discount Amount (promotions[].discountAmount)
  - Secret Code/Coupon Code (promotions[].secretCode if applicable)

**Repeat for ALL line items** - Each line item may have different promotions!

### 4. CRITICAL - Extract Coupon Codes
- Find 'Coupons' or 'Applied Coupons' section on the order status page
- Use `mcp__playwright__browser_click` to expand the coupons section
- Wait 2 seconds for coupon details to expand
- Take screenshot: `.playwright-mcp/mao-W1156251121946800-coupons.png`
- Extract from the expanded coupons section:
  - Coupon Code (couponCodes[].code)
  - Description (couponCodes[].description)
  - Discount Amount (couponCodes[].discountAmount)
  - Applied Date (couponCodes[].appliedAt)

### 5. Navigate to MAO Audit Trail Page
- Use `mcp__playwright__browser_navigate` to navigate to:
  ```
  https://crcpp.omni.manh.com/omnifacade/#/order
  ```
- Wait for page load using `mcp__playwright__browser_wait_for` with `time=5`
- Search for order W1156251121946800 using page search functionality
- Click on the order to open details
- Click on Audit Trail tab/section
- Take full-page screenshot: `.playwright-mcp/mao-W1156251121946800-audit.png` using `mcp__playwright__browser_take_screenshot` with `fullPage: true`

### 6. Extract Audit Trail Events
Extract ALL audit trail events in chronological order (oldest first):

For EACH audit event, extract:
- Timestamp (updatedOn) - Format: 'DD/MM/YYYY HH:mm ICT'
- Entity Name (entityName) - e.g., 'Order', 'OrderLine', 'QuantityDetail', 'ShipmentDetail'
- Entity ID (entityId)
- Modified By (updatedBy) - e.g., 'apiuser4TMS', 'system'
- Changed Parameter (changedParameter)
- Old Value (oldValue)
- New Value (newValue)

**Extract ALL events** - Not just a sample! The audit trail provides complete order history.

### 7. Create Complete Order in src/lib/mock-data.ts
Locate the position after `maoOrderW1156260115052036` (after line 3652) and create the new order:

```typescript
const maoOrderW1156251121946800: any = {
  // ===== ORDER HEADER =====
  id: 'W1156251121946800',
  order_no: 'W1156251121946800',
  organization: '[EXTRACT FROM MAO]',
  order_date: '[ISO FORMAT FROM MAO]',  // e.g., '2026-01-15T19:41:00+07:00'
  business_unit: '[FROM MAO]',
  order_type: '[FROM MAO]',
  sellingChannel: '[FROM MAO]',
  channel: '[FROM MAO]',
  status: '[FROM MAO]',

  // ===== CUSTOMER INFORMATION =====
  customer: {
    id: '[EXACT FROM MAO]',
    name: '[EXACT THAI NAME]',
    email: '[EXACT FROM MAO]',
    phone: '[EXACT FROM MAO]',
    customerType: '[EXACT FROM MAO]',
    custRef: '[FROM MAO]',
    T1Number: '[FROM MAO]'
  },

  // ===== SHIPPING ADDRESS =====
  shipping_address: {
    street: '[EXACT THAI ADDRESS]',
    city: '[EXACT FROM MAO]',
    state: '[EXACT FROM MAO]',
    postal_code: '[EXACT FROM MAO]',
    country: 'TH'
  },

  // ===== LINE ITEMS =====
  items: [
    {
      id: '[LINE ID]',
      product_id: '[SKU]',
      product_sku: '[EXACT SKU]',
      product_name: '[EXACT NAME]',
      thaiName: '[EXACT THAI NAME]',
      barcode: '[EXACT BARCODE]',
      quantity: [EXACT],
      orderedQty: [EXACT],
      fulfilledQty: [EXACT],
      backorderedQty: [EXTRACT IF EXISTS],
      cancelledQty: [EXTRACT IF EXISTS],
      unit_price: [EXACT],
      total_price: [EXACT],
      uom: '[EXACT]',
      location: '[EXACT]',
      fulfillmentStatus: '[EXACT]',
      shippingMethod: '[EXTRACT IF EXISTS]',
      bundle: [EXTRACT IF EXISTS],
      bundleRef: [EXTRACT IF EXISTS],
      route: '[EXTRACT IF EXISTS]',
      bookingSlotFrom: '[EXTRACT IF EXISTS]',
      bookingSlotTo: '[EXTRACT IF EXISTS]',
      eta: {
        from: '[FROM MAO]',
        to: '[FROM MAO]'
      },
      giftWrapped: [EXTRACT IF EXISTS],
      substitution: [EXTRACT IF EXISTS],
      giftWithPurchase: [EXTRACT IF EXISTS],
      supplyTypeId: '[EXTRACT IF EXISTS]',
      weight: [EXTRACT IF EXISTS],
      actualWeight: [EXTRACT IF EXISTS],

      priceBreakdown: {
        subtotal: [FROM MAO],
        discount: [FROM MAO],
        charges: [FROM MAO],
        amountExcludedTaxes: [FROM MAO],
        taxes: [FROM MAO],
        amountIncludedTaxes: [FROM MAO],
        total: [FROM MAO]
      },

      // CRITICAL: Promotions extracted from clicking Promotions button
      promotions: [
        {
          promotionId: '[EXTRACTED FROM PROMOTIONS CLICK]',
          promotionType: '[EXTRACTED]',
          discountAmount: [EXTRACTED],
          secretCode: '[EXTRACTED]'
        }
      ],

      product_details: {
        description: '[EXTRACT FROM MAO]',
        category: '[EXTRACT IF EXISTS]',
        brand: '[EXTRACT IF EXISTS]'
      }
    }
    // Repeat for ALL line items
  ],

  // ===== PRICING BREAKDOWN =====
  pricingBreakdown: {
    subtotal: [EXACT],
    orderDiscount: [EXACT],
    lineItemDiscount: [EXACT],
    taxAmount: [EXACT],
    taxBreakdown: [
      { lineId: '[LINE ID]', taxAmount: [EXACT] }
      // Repeat for all line items
    ],
    shippingFee: [EXACT],
    additionalFees: [EXTRACT IF EXISTS],
    grandTotal: [EXACT],
    paidAmount: [EXACT],
    currency: 'THB'
  },

  // ===== TOTAL AMOUNT =====
  total_amount: [EXACT],

  // ===== PAYMENT INFORMATION =====
  payment_info: {
    method: '[EXACT]',
    status: '[EXACT]',
    transaction_id: '[EXACT]',
    subtotal: [EXACT],
    discounts: [EXACT],
    charges: [EXACT],
    amountIncludedTaxes: [EXACT],
    amountExcludedTaxes: [EXACT],
    taxes: [EXACT],
    cardNumber: '[EXACT MASKED]',
    expiryDate: '[EXTRACT IF EXISTS]'
  },

  // Extended payment details array
  paymentDetails: [
    {
      id: 'PAY-W1156251121946800-001',
      method: '[EXACT]',
      status: '[EXACT]',
      transactionId: '[EXACT]',
      amount: [EXACT],
      currency: 'THB',
      date: '[FROM MAO]',
      gateway: '[EXTRACT IF EXISTS]',
      cardNumber: '[EXACT MASKED]',
      expiryDate: '[EXTRACT IF EXISTS]'
    }
  ],

  // ===== DISCOUNTS =====
  orderDiscounts: [
    {
      amount: [EXTRACT FROM MAO],
      type: 'ORDER_LEVEL',
      description: '[PROMOTION NAME]'
    }
  ],

  // ===== PROMOTIONS =====
  promotions: [
    {
      promotionId: '[EXTRACTED]',
      promotionName: '[EXACT]',
      promotionType: '[EXACT]',
      discountAmount: [EXACT]
    }
  ],

  // ===== COUPON CODES =====
  // CRITICAL: Extracted from clicking Coupons section
  couponCodes: [
    {
      code: '[EXTRACTED]',
      description: '[EXACT]',
      discountAmount: [EXACT],
      appliedAt: '[TIMESTAMP]'
    }
  ],

  // ===== DELIVERY METHODS =====
  deliveryMethods: [
    {
      type: '[HOME_DELIVERY or CLICK_COLLECT]',
      itemCount: [EXACT],
      homeDelivery: {
        recipient: '[EXACT]',
        phone: '[EXACT]',
        address: '[EXACT]',
        district: '[EXACT]',
        city: '[EXACT]',
        postalCode: '[EXACT]',
        specialInstructions: '[EXTRACT IF EXISTS]'
      }
    }
  ],

  // Delivery type code
  deliveryTypeCode: '[EXACT]',

  // ===== SLA INFORMATION =====
  sla_info: {
    target_minutes: [FROM MAO],
    elapsed_minutes: [FROM MAO],
    status: '[FROM MAO]'
  },

  // ===== METADATA =====
  metadata: {
    created_at: '[ISO FORMAT]',
    updated_at: '[ISO FORMAT]',
    priority: '[FROM MAO]',
    store_name: '[EXACT]',
    store_no: '[EXTRACT IF EXISTS]',
    order_created: '[ISO FORMAT]'
  },

  // ===== ADDITIONAL FIELDS =====
  on_hold: [EXTRACT IF EXISTS],
  fullTaxInvoice: [EXTRACT IF EXISTS],
  customerTypeId: '[EXTRACT IF EXISTS]',
  allowSubstitution: [EXTRACT IF EXISTS],
  allow_substitution: [EXTRACT IF EXISTS],
  taxId: [EXTRACT IF EXISTS],
  companyName: [EXTRACT IF EXISTS],
  branchNo: [EXTRACT IF EXISTS],
  currency: 'THB',

  // MAO-specific fields
  capturedDate: '[EXTRACT IF EXISTS]',
  t1Member: '[EXTRACT IF EXISTS]',
  confirmedDate: '[EXTRACT IF EXISTS]',
  doNotReleaseBefore: '[EXTRACT IF EXISTS]',
  trackingNumber: '[FROM MAO]',
  shippedFrom: '[FROM MAO]',
  shippedOn: '[FROM MAO]',
  eta: '[FROM MAO]',
  relNo: '[EXTRACT IF EXISTS]',
  crcTrackingLink: '[EXTRACT IF EXISTS]',

  // ===== AUDIT TRAIL =====
  auditTrail: generateMAOOrderW1156251121946800AuditTrail()
}

// Add the MAO order to the beginning of mock orders for easy access
mockApiOrders.unshift(maoOrderW1156251121946800);
```

### 8. Create generateMAOOrderW1156251121946800AuditTrail() Function
Create the audit trail generation function using ALL extracted audit events:

```typescript
function generateMAOOrderW1156251121946800AuditTrail(): any[] {
  const events: any[] = []

  // Extract ALL audit events from MAO in chronological order
  // Each event should have:
  // - id: Unique event ID
  // - orderId: 'W1156251121946800'
  // - updatedBy: User who made the change
  // - updatedOn: Exact timestamp in 'DD/MM/YYYY HH:mm ICT' format
  // - entityName: Entity type (e.g., 'Order', 'OrderLine', 'QuantityDetail')
  // - entityId: Entity ID
  // - changedParameter: What changed
  // - oldValue: Previous value
  // - newValue: New value

  // Example structure:
  events.push({
    id: 'AUDIT-W115625-001',
    orderId: 'W1156251121946800',
    updatedBy: '[USER FROM MAO]',
    updatedOn: '[TIMESTAMP FROM MAO]',  // e.g., '15/01/2026 19:41 ICT'
    entityName: '[ENTITY FROM MAO]',
    entityId: '[ENTITY ID FROM MAO]',
    changedParameter: '[PARAMETER FROM MAO]',
    oldValue: [OLD VALUE OR NULL],
    newValue: '[NEW VALUE FROM MAO]'
  })

  // Repeat for ALL audit events extracted from MAO
  // Preserve chronological order (oldest first)

  return events
}
```

**IMPORTANT:**
- Extract ALL audit events, not just a sample
- Use exact timestamps from MAO
- Use exact user names from MAO
- Use exact entity names and field names from MAO
- Preserve chronological order

### 9. Validate Data Type Consistency
- Verify all date fields use ISO format with timezone (e.g., '2026-01-15T19:41:00+07:00')
- Verify all numeric fields are numbers (not strings)
- Verify all boolean fields are booleans (not strings)
- Verify all array fields are arrays (even if empty)
- Verify all string fields are strings (even if empty)
- Verify Thai text is preserved (not translated)

### 10. Validate Order Display
- Start dev server: `pnpm dev`
- Navigate to Orders page: http://localhost:3000/orders
- Search for order: W1156251121946800
- Verify order appears in list with correct data
- Click on order to open detail page
- Verify all tabs display correctly:
  - **Overview tab**: Shows correct order header, status, dates
  - **Customer tab**: Shows correct customer information including Thai name
  - **Items tab**: Shows all line items with quantities and prices
  - **Payment tab**: Shows correct payment information
  - **Delivery tab**: Shows correct delivery information
  - **Audit tab**: Shows ALL audit trail entries in chronological order
- Verify no 'undefined' or 'N/A' errors (unless data is truly missing in MAO)
- Verify currency formatting works (Thai Baht with ฿ symbol)
- Verify dates display correctly in GMT+7 timezone
- Verify promotions display correctly for each line item
- Verify coupon codes display correctly

## Validation Commands
Execute these commands to validate the chore is complete:

```bash
# 1. Check TypeScript compilation
pnpm build

# 2. Check for lint errors
pnpm lint

# 3. Verify only mock-data.ts was modified
git status

# 4. See the exact changes made
git diff src/lib/mock-data.ts

# 5. Verify screenshots were created
ls -la .playwright-mcp/mao-W1156251121946800-*.png

# 6. Test order displays in dev server
pnpm dev
# Then navigate to http://localhost:3000/orders
# Search for order W1156251121946800
# Verify all fields display correctly
```

## Notes

### Critical: Promotions and Coupons Extraction
**This is the KEY difference from previous MAO extraction tasks:**
- Promotions and coupons are NOT visible on the main order status page
- They are hidden in collapsible sections that must be clicked to expand
- **MUST click on 'Promotions' button/link for EACH line item** to see line-item-specific promotions
- **MUST click on 'Coupons' section** to see order-level coupon codes
- These discount details provide critical pricing information

### Authentication Consideration
The MAO system may require authentication. If Playwright MCP encounters a login page:
- The user will need to manually authenticate first
- Or provide valid credentials for automated login
- The screenshots will still be valuable for manual data extraction if automation fails

### Screenshot Requirements
The following screenshots MUST be captured:
1. `.playwright-mcp/mao-W1156251121946800-status.png` - Full order status page
2. `.playwright-mcp/mao-W1156251121946800-item-[N]-promotions.png` - ONE screenshot per line item showing expanded promotions
3. `.playwright-mcp/mao-W1156251121946800-coupons.png` - Expanded coupons section
4. `.playwright-mcp/mao-W1156251121946800-audit.png` - Full audit trail page

These screenshots serve as:
- Validation of extracted data
- Reference for future maintenance
- Documentation of MAO UI structure

### Data Formatting Standards
- **Dates**: ISO format with timezone (e.g., '2026-01-15T19:41:00+07:00')
- **Audit timestamps**: 'DD/MM/YYYY HH:mm ICT' format
- **Numbers**: Use numbers (not strings) for quantities, prices
- **Currency**: Thai Baht (THB)
- **Text**: Preserve Thai text exactly as shown (don't translate)
- **Arrays**: Always arrays, even if empty (use [] not null/undefined)

### Field Placement
- **Insert location**: After `maoOrderW1156260115052036` (after line 3652)
- **Function location**: Create `generateMAOOrderW1156251121946800AuditTrail()` before the order object
- **Array insertion**: Use `mockApiOrders.unshift(maoOrderW1156251121946800)` to add to beginning

### Testing Checklist
After creating the mock order:
- [ ] Order appears in order list when searching for W1156251121946800
- [ ] Order detail page opens without errors
- [ ] Overview tab shows correct order header data
- [ ] Customer tab shows correct customer information with Thai name
- [ ] Items tab shows all line items with correct quantities and prices
- [ ] Each line item shows correct promotions
- [ ] Payment tab shows correct payment information
- [ ] Delivery tab shows correct delivery information
- [ ] Audit tab shows ALL audit trail entries in chronological order
- [ ] Coupons section shows correct coupon codes
- [ ] No 'undefined' values displayed (unless data is truly missing)
- [ ] Currency formatting works (฿ symbol)
- [ ] Dates display correctly in GMT+7 timezone
- [ ] Thai text displays correctly (not garbled)
- [ ] TypeScript compilation succeeds
- [ ] No ESLint errors
- [ ] All required screenshots exist

### Reference Order Structure
Use `maoOrderW1156260115052036` (lines 3119-3652) as a structural reference:
- Follow the same field ordering
- Use the same data types
- Match the same nesting structure
- Apply the same formatting conventions
- Include all the same optional fields (or leave undefined if not in MAO)
