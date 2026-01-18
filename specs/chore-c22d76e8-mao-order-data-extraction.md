# Chore: MAO Order W1156260115052036 Real Data Extraction

## Metadata
adw_id: `c22d76e8`
prompt: `Login to MAO (Manhattan Active Omni), extract REAL data for order W1156260115052036, and update the mock data.`

## Chore Description
Extract real data from Manhattan Active Omni (MAO) system for order W1156260115052036 and replace all mock/fake values in the test data. This involves:

1. Using Playwright MCP to navigate to MAO order status page
2. Instructing user to manually login (since automated login failed previously)
3. Extracting comprehensive order data from the UI
4. Extracting audit trail events
5. Updating mock-data.ts with real values (replacing fake Thai names, emails, phones, addresses)
6. Validating the updated data displays correctly

## Relevant Files
Use these files to complete the chore:

### Existing Files
- `src/lib/mock-data.ts` (lines 3017-3616)
  - Contains `generateMAOOrderW1156260115052036AuditTrail()` function with fake audit events
  - Contains `maoOrderW1156260115052036` object with fake customer data:
    - Fake customer name: 'สมชาย ใจดี'
    - Fake email: 'somchai.jaidei@example.com'
    - Fake phone: '+66812345678'
    - Fake address: '123/45 สุขุมวิท ซอย 39'
    - Fake customer ID: 'CUST-W115626'
  - All line items, pricing, promotions need to be verified against real MAO data

### New Files
- `.playwright-mcp/mao-order-status.png` - Full page screenshot of order status page
- `.playwright-mcp/mao-audit-trail.png` - Full page screenshot of audit trail page

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. User Manual Login Preparation
- **DO NOT** attempt automated login via Playwright
- Display clear message to user: "Please login to MAO at https://crcpp.omni.manh.com/customerengagementfacade/app/orderstatus?orderId=W1156260115052036&selectedOrg=CFR in your browser"
- Wait 30 seconds for user to complete manual login
- Proceed with navigation after user confirms login

### 2. Navigate to MAO Order Status Page
- Use `mcp__playwright__browser_navigate` to: `https://crcpp.omni.manh.com/customerengagementfacade/app/orderstatus?orderId=W1156260115052036&selectedOrg=CFR`
- Wait for page load using `mcp__playwright__browser_wait_for time=5`
- Capture full page screenshot: `.playwright-mcp/mao-order-status.png` (fullPage: true)
- Capture page snapshot using `mcp__playwright__browser_snapshot`

### 3. Extract Order Header Data
From the page snapshot, extract:
- Order Number (confirm: W1156260115052036)
- Order Date (exact timestamp)
- Status (current order status)
- Organization (CFR or other)
- Business Unit (Retail or other)
- Selling Channel (web, app, or other)

### 4. Extract Customer Information
From the page snapshot, extract EXACT Thai values:
- Customer ID (actual ID from MAO, not fake CUST-W115626)
- Customer Name (EXACT Thai name, not 'สมชาย ใจดี')
- Email Address (real email, not 'somchai.jaidei@example.com')
- Phone Number (real phone, not '+66812345678')
- Customer Type (Tier 1 Login or other)

### 5. Extract Shipping Address
From the page snapshot, extract EXACT Thai address:
- Street Address (real Thai address, not '123/45 สุขุมวิท ซอย 39')
- City/District (real Thai values)
- State/Province (real Thai value, not 'วัฒนา')
- Postal Code (real postal code)
- Country (Thailand or other)

### 6. Extract Line Items
For EACH line item on the order, extract:
- Line Item ID
- SKU/Product Barcode
- Product Name (both Thai and English if available)
- Quantity Ordered
- Quantity Fulfilled
- Unit Price
- Total Price
- UOM (Unit of Measure)
- Location/Store
- Fulfillment Status
- Supply Type ID

### 7. Extract Pricing Breakdown
- Subtotal amount
- Order-level discounts
- Line item discounts
- Tax amount (VAT 7%)
- Shipping fee
- Additional fees
- Grand Total
- Currency (THB)

### 8. Extract Payment Information
- Payment Method (CREDIT_CARD, COD, etc.)
- Payment Status (PAID, PENDING, etc.)
- Transaction ID
- Payment Date/Time
- Payment Gateway (2C2P or other)

### 9. Extract Delivery Information
- Delivery Type Code (RT-HD-EXP or other)
- Delivery Method (HOME_DELIVERY, CLICK_COLLECT)
- Recipient Name
- Delivery Address
- Special Instructions

### 10. Extract SLA Information
- Target minutes/seconds
- Elapsed minutes/seconds
- SLA Status (COMPLIANT, BREACH, NEAR_BREACH)

### 11. Navigate to Audit Trail Page
- Use `mcp__playwright__browser_navigate` to: `https://crcpp.omni.manh.com/omnifacade/#/order`
- Wait for page load
- Capture full page screenshot: `.playwright-mcp/mao-audit-trail.png` (fullPage: true)
- Capture page snapshot

### 12. Extract Audit Trail Events
For EACH audit event in chronological order:
- Timestamp (exact date/time)
- User (who made the change)
- Entity Name (Order, QuantityDetail, ShipmentDetail, etc.)
- Entity ID
- Changed Parameter (what field changed)
- Old Value (previous value)
- New Value (new value)

### 13. Update mock-data.ts - Customer Information
Read `src/lib/mock-data.ts` (lines 3017-3616) and use Edit tool to replace:
- `customer.id`: Replace 'CUST-W115626' with real customer ID
- `customer.name`: Replace 'สมชาย ใจดี' with real Thai name from MAO
- `customer.email`: Replace 'somchai.jaidei@example.com' with real email
- `customer.phone`: Replace '+66812345678' with real phone number
- Update other customer fields (customerType, custRef, T1Number) if present in MAO

### 14. Update mock-data.ts - Address Information
Use Edit tool to replace:
- `shipping_address.street`: Replace with real Thai street address
- `shipping_address.city`: Replace with real Thai city
- `shipping_address.state`: Replace with real Thai state/province
- `shipping_address.postal_code`: Replace with real postal code
- `shipping_address.country`: Update if different from Thailand

### 15. Update mock-data.ts - Line Items
For each line item (items[0] through items[3]), verify and update:
- Product SKU/Barcode
- Product Name (Thai and English)
- Thai Name
- Quantity values
- Pricing values
- Location
- Fulfillment Status

### 16. Update mock-data.ts - Pricing and Payment
Update pricing breakdown:
- `pricingBreakdown.subtotal`
- `pricingBreakdown.orderDiscount`
- `pricingBreakdown.lineItemDiscount`
- `pricingBreakdown.taxAmount`
- `pricingBreakdown.shippingFee`
- `pricingBreakdown.grandTotal`

Update payment info:
- `payment_info.method`
- `payment_info.status`
- `payment_info.transaction_id`

### 17. Update mock-data.ts - Audit Trail Function
Replace `generateMAOOrderW1156260115052036AuditTrail()` function (lines 3017-3190):
- Remove all fake audit events
- Add real audit events extracted from MAO
- Maintain chronological order (oldest first)
- Preserve the same event structure with all required fields

### 18. Validate Build
Run build to verify no syntax errors:
```bash
pnpm build
```

### 19. Validate Display
- Start dev server: `pnpm dev`
- Navigate to: `http://localhost:3000/orders`
- Search for order: W1156260115052036
- Click on the order to view details
- Verify ALL data displays correctly with real MAO values:
  - Customer name shows real Thai name
  - Email shows real email address
  - Phone shows real phone number
  - Address shows real Thai address
  - Line items match MAO data
  - Pricing totals match
  - Audit trail shows real events

## Validation Commands
Execute these commands to validate the chore is complete:

```bash
# Build to verify no errors
pnpm build

# Start dev server
pnpm dev

# Then manually validate:
# 1. Navigate to http://localhost:3000/orders
# 2. Search for W1156260115052036
# 3. Click order to view details
# 4. Verify customer name is NOT 'สมชาย ใจดี'
# 5. Verify email is NOT 'somchai.jaidei@example.com'
# 6. Verify phone is NOT '+66812345678'
# 7. Verify address is NOT '123/45 สุขุมวิท ซอย 39'
# 8. Verify all data matches MAO screenshots
```

## Notes
- **CRITICAL**: Since automated login failed previously, DO NOT attempt Playwright login automation
- Use manual user login approach - instruct user to login in their browser first
- Maintain EXACT Thai characters for names and addresses - preserve Unicode
- If certain fields are not visible in MAO, keep existing mock values
- Take full page screenshots for documentation purposes
- The order has 4 line items - ensure all are extracted and updated
- Audit trail should have ~10-15 events typical of order fulfillment lifecycle
- Real data is essential for accurate testing and demonstration
