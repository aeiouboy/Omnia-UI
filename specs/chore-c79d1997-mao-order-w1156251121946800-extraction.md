# Chore: Extract REAL Data from MAO Order W1156251121946800 and Create in Omnia-UI

## Metadata
adw_id: `c79d1997`
prompt: `Extract REAL data from MAO order W1156251121946800 and create order in Omnia-UI using EXISTING fields only.`

## Chore Description
Extract comprehensive real order data from MAO (Manhattan Active Order) system for order W1156251121946800 and create a complete mock data entry in the Omnia-UI application using ONLY EXISTING fields. This task involves:

1. Navigating to the MAO order status page to extract all order details
2. Mapping MAO data to existing Omnia-UI order structure fields
3. Extracting audit trail data for order history
4. Creating a complete mock order object in `src/lib/mock-data.ts` following the existing template
5. Validating the order displays correctly in the application

**MAO Order Details:**
- Order ID: W1156251121946800
- Order Status URL: https://crcpp.omni.manh.com/customerengagementfacade/app/orderstatus?orderId=W1156251121946800&selectedOrg=CFR
- Audit Trail URL: https://crcpp.omni.manh.com/omnifacade/#/order
- Organization: CFR

**CRITICAL Requirements:**
- User MUST be logged into MAO before running the extraction script
- Use ONLY existing fields - DO NOT add new fields to the Order interface
- Follow the exact structure of `maoOrderW1156260115052036` (lines 3119-3652 in mock-data.ts)
- Preserve Thai text exactly (copy-paste from MAO)

## Relevant Files

### Existing Files
- `src/lib/mock-data.ts` - Contains mock order data structures and MAO order templates
  - Template reference: `maoOrderW1156260115052036` (lines 3119-3652)
  - Insert location: After line 3652, following `maoOrderW1156260115052036`
  - Use exact same field names and structure as template
- `.playwright-mcp/` - Directory for screenshots (screenshots must be saved here)
- `specs/chore-c79d1997-mao-order-w1156251121946800-extraction.md` - This specification file

### New Files (Screenshots)
- `.playwright-mcp/mao-W1156251121946800-status.png` - Full page screenshot of order status
- `.playwright-mcp/mao-W1156251121946800-audit.png` - Full page screenshot of audit trail

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Navigate to MAO Order Status Page
- Use Playwright MCP to navigate to: https://crcpp.omni.manh.com/customerengagementfacade/app/orderstatus?orderId=W1156251121946800&selectedOrg=CFR
- Wait 5 seconds for page load and dynamic content to render
- Take full-page screenshot: `.playwright-mcp/mao-W1156251121946800-status.png` (fullPage: true)
- Capture page snapshot for accessibility structure analysis

### 2. Extract Order Header Data and Map to Existing Fields
- Extract from the order status page and map to existing fields:
  - `order_no`: 'W1156251121946800'
  - `order_date`: [Convert MAO date to ISO format with timezone]
  - `status`: [MAO status value]
  - `organization`: [MAO organization]
  - `business_unit`: [MAO business unit]
  - `sellingChannel`: [MAO channel]
  - `channel`: [MAO channel]
  - `order_type`: [MAO order type]

### 3. Extract Customer Information and Map to Existing Fields
- Extract from customer section and map to existing `customer` object:
  - `customer.id`: [MAO customer ID]
  - `customer.name`: [EXACT Thai name from MAO - copy-paste]
  - `customer.email`: [MAO email]
  - `customer.phone`: [MAO phone]
  - `customer.customerType`: [MAO customer type]
  - `customer.custRef`: [MAO customer reference]
  - `customer.T1Number`: [MAO T1 number if shown]

### 4. Extract Shipping Address and Map to Existing Fields
- Extract complete shipping address and map to existing `shipping_address` object:
  - `shipping_address.street`: [EXACT Thai address from MAO - copy-paste]
  - `shipping_address.city`: [MAO city]
  - `shipping_address.state`: [MAO state/province]
  - `shipping_address.postal_code`: [MAO postal code]
  - `shipping_address.country`: 'TH'

### 5. Extract Line Items and Map to Existing Fields
- For each line item in MAO, map to existing `items[]` array fields:
  - `id`: [MAO line ID]
  - `product_sku`: [MAO SKU]
  - `product_name`: [MAO product name]
  - `thaiName`: [MAO Thai name if shown]
  - `barcode`: [MAO barcode]
  - `quantity`: [MAO quantity]
  - `orderedQty`: [MAO ordered qty]
  - `fulfilledQty`: [MAO fulfilled qty]
  - `unit_price`: [MAO unit price]
  - `total_price`: [MAO total price]
  - `uom`: [MAO UOM]
  - `location`: [MAO location]
  - `fulfillmentStatus`: [MAO status]

  - `priceBreakdown.subtotal`: [MAO subtotal]
  - `priceBreakdown.discount`: [MAO discount]
  - `priceBreakdown.charges`: [MAO charges]
  - `priceBreakdown.amountExcludedTaxes`: [MAO amount]
  - `priceBreakdown.taxes`: [MAO taxes]
  - `priceBreakdown.amountIncludedTaxes`: [MAO amount]
  - `priceBreakdown.total`: [MAO total]

  - `promotions`: [Extract from MAO after clicking 'Promotions' button if present]
    - `promotionId`: [MAO promotion ID]
    - `promotionType`: [MAO promotion type]
    - `discountAmount`: [MAO discount amount]

### 6. Extract Order-Level Pricing and Map to Existing Fields
- Extract from order totals and map to existing `pricingBreakdown` object:
  - `pricingBreakdown.subtotal`: [MAO subtotal]
  - `pricingBreakdown.orderDiscount`: [MAO order discount]
  - `pricingBreakdown.lineItemDiscount`: [MAO line item discount]
  - `pricingBreakdown.taxAmount`: [MAO tax amount]
  - `pricingBreakdown.shippingFee`: [MAO shipping fee]
  - `pricingBreakdown.grandTotal`: [MAO grand total]
  - `pricingBreakdown.paidAmount`: [MAO paid amount]
  - `pricingBreakdown.currency`: 'THB'
  - `total_amount`: [MAO grand total]

### 7. Extract Payment Information and Map to Existing Fields
- Extract payment details and map to existing `payment_info` object:
  - `payment_info.method`: [MAO payment method]
  - `payment_info.status`: [MAO payment status]
  - `payment_info.transaction_id`: [MAO transaction ID]
  - `payment_info.cardNumber`: [MAO masked card number]

- Map to existing `paymentDetails[]` array:
  - `id`: 'PAY-W1156251121946800-001'
  - `method`: [MAO method]
  - `status`: [MAO status]
  - `transactionId`: [MAO transaction ID]
  - `amount`: [MAO amount]
  - `currency`: 'THB'
  - `date`: [MAO date]
  - `cardNumber`: [MAO masked card]

### 8. Extract Discounts and Map to Existing Fields
- Map to existing `orderDiscounts[]` array:
  - `amount`: [MAO discount amount]
  - `type`: 'ORDER_LEVEL'
  - `description`: [MAO promotion name]

### 9. Extract Promotions and Map to Existing Fields
- Map to existing `promotions[]` array:
  - `promotionId`: [MAO promotion ID]
  - `promotionName`: [MAO promotion name]
  - `promotionType`: [MAO promotion type]
  - `discountAmount`: [MAO discount amount]

### 10. Extract Coupons and Map to Existing Fields
- Map to existing `couponCodes[]` array:
  - `code`: [MAO coupon code]
  - `description`: [MAO coupon description]
  - `discountAmount`: [MAO discount amount]
  - `appliedAt`: [MAO applied date]

### 11. Extract Delivery Information and Map to Existing Fields
- Extract delivery details and map to existing `deliveryMethods[]` array:
  - `type`: 'HOME_DELIVERY' or 'CLICK_COLLECT'
  - `itemCount`: [MAO item count]
  - `homeDelivery.recipient`: [MAO recipient name]
  - `homeDelivery.phone`: [MAO phone]
  - `homeDelivery.address`: [EXACT Thai address from MAO]
  - `homeDelivery.district`: [MAO district]
  - `homeDelivery.city`: [MAO city]
  - `homeDelivery.postalCode`: [MAO postal code]

- Map to existing `deliveryTypeCode` field:
  - `deliveryTypeCode`: [MAO delivery type code]

### 12. Extract SLA Information and Map to Existing Fields
- Map to existing `sla_info` object:
  - `sla_info.target_minutes`: [MAO target]
  - `sla_info.elapsed_minutes`: [MAO elapsed]
  - `sla_info.status`: [MAO SLA status]

### 13. Extract Metadata and Map to Existing Fields
- Map to existing `metadata` object:
  - `metadata.created_at`: [Convert MAO date to ISO]
  - `metadata.updated_at`: [Convert MAO date to ISO]
  - `metadata.priority`: [MAO priority]
  - `metadata.store_name`: [MAO store name]

### 14. Navigate to Audit Trail Page
- Navigate to: https://crcpp.omni.manh.com/omnifacade/#/order
- Wait for page load
- Search for order W1156251121946800 in the order search
- Click on the order to open details
- Navigate to Audit Trail tab
- Take full-page screenshot: `.playwright-mcp/mao-W1156251121946800-audit.png` (fullPage: true)

### 15. Extract Audit Trail Events
- Extract ALL audit trail events:
  - Timestamp (with timezone)
  - Entity (what was changed)
  - User (who made the change)
  - Parameter (field name)
  - Old Value
  - New Value
  - Capture in chronological order

### 16. Create Mock Order in src/lib/mock-data.ts
- Read `src/lib/mock-data.ts` to locate insertion point (after line 3652, after `maoOrderW1156260115052036`)
- Use `maoOrderW1156260115052036` as the EXACT structure template
- Create `maoOrderW1156251121946800` object with ALL extracted data:
  - SAME field names as template
  - SAME structure as template
  - REAL data from MAO (no fake values)
  - Include all sections: Order Header, Customer, Shipping Address, Items, Pricing, Payment, Delivery, SLA, Metadata
  - Include: `orderDiscounts` array
  - Include: `promotions` array
  - Include: `couponCodes` array
  - Include: `paymentDetails` array

### 17. Create Audit Trail Generator Function
- Create `generateMAOOrderW1156251121946800AuditTrail()` function
- Return array of all audit events extracted from MAO
- Each event should include: id, orderId, updatedBy, updatedOn, entityName, entityId, changedParameter, oldValue, newValue
- Sort by timestamp ascending (oldest first)
- Follow the same structure as `generateMAOOrderW1156260115052036AuditTrail()`

### 18. Add Order to Mock Data
- Add `mockApiOrders.unshift(maoOrderW1156251121946800)` after the order definition
- This ensures the order appears at the top of the mock orders list

### 19. Validate Build
- Run: `pnpm build` to ensure no TypeScript errors
- Verify build completes successfully

### 20. Validate Order Display
- Run: `pnpm dev` to start development server
- Wait for server to start on http://localhost:3000
- Navigate to: http://localhost:3000/orders
- Use the search box to search for: W1156251121946800
- Verify order appears in search results
- Click on the order to open detail view
- Verify ALL order details display correctly with REAL MAO data:
  - Order header information
  - Customer information (Thai name preserved exactly)
  - Shipping address (Thai address preserved exactly)
  - All line items with complete details
  - Pricing totals
  - Payment information
  - Delivery information
  - Promotions/coupons (if applicable)
  - Audit trail events

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Verify TypeScript compilation succeeds
- `pnpm dev` - Start development server
- Navigate to http://localhost:3000/orders and search for W1156251121946800
- Verify all order sections display correctly with REAL MAO data

## Notes

**Pre-requisites:**
- User MUST be logged into MAO before starting the extraction
- MAO URLs:
  - Order Status: https://crcpp.omni.manh.com/customerengagementfacade/app/orderstatus?orderId=W1156251121946800&selectedOrg=CFR
  - Audit Trail: https://crcpp.omni.manh.com/omnifacade/#/order

**Data Structure Reference:**
- Follow the EXACT structure of `maoOrderW1156260115052036` in `src/lib/mock-data.ts` (lines 3119-3652)
- Use the SAME field names and data types as the template
- DO NOT add new fields - use ONLY existing fields from the template
- Ensure all arrays are properly formatted (items, promotions, orderDiscounts, couponCodes, paymentDetails)

**Critical Requirements:**
- Use EXACT values from MAO (copy-paste)
- Preserve Thai text exactly (names, addresses)
- NO new fields - only existing fields from template
- Same structure as W1156260115052036 template
- All timestamps should preserve timezone information (GMT+7 for Thailand)

**Screenshot Locations:**
- All screenshots must be saved in `.playwright-mcp/` directory
- Use descriptive filenames with order ID prefix
- Full-page screenshots required for order status and audit trail

**Mock Data Insertion:**
- Insert after line 3652 in `src/lib/mock-data.ts`
- After the existing `maoOrderW1156260115052036` definition
- Use `mockApiOrders.unshift()` to add order to the beginning of the array
