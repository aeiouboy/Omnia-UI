# Chore: Extract MAO Order W1156251121946800 and Create Mock Data

## Metadata
adw_id: `9ddbb659`
prompt: `Extract MAO order W1156251121946800 and create complete order in Omnia-UI mock data.`

## Chore Description
Extract comprehensive order data from MAO (Manhattan Active Order) system for order W1156251121946800 and create a complete mock data entry in the Omnia-UI application. This task involves:

1. Navigating to the MAO order status page to extract all order details
2. Capturing promotional and coupon information (CRITICAL)
3. Extracting audit trail data for order history
4. Creating a complete mock order object in `src/lib/mock-data.ts`
5. Validating the order displays correctly in the application

**MAO Order Details:**
- Order ID: W1156251121946800
- Order Status URL: https://crcpp.omni.manh.com/customerengagementfacade/app/orderstatus?orderId=W1156251121946800&selectedOrg=CFR
- Audit Trail URL: https://crcpp.omni.manh.com/omnifacade/#/order
- Organization: CFR

**Critical Requirement:** User must be logged into MAO before running the extraction script.

## Relevant Files

### Existing Files
- `src/lib/mock-data.ts` - Contains mock order data structures and MAO order templates (insert location: after line 3652, following `maoOrderW1156260115052036`)
- `.playwright-mcp/` - Directory for screenshots (screenshots must be saved here)
- `specs/chore-9ddbb659-mao-order-w1156251121946800-extraction.md` - This specification file

### New Files (Screenshots)
- `.playwright-mcp/mao-W1156251121946800-status.png` - Full page screenshot of order status
- `.playwright-mcp/mao-W1156251121946800-coupons.png` - Screenshot of expanded coupons/promotions section (if applicable)
- `.playwright-mcp/mao-W1156251121946800-audit.png` - Full page screenshot of audit trail

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Navigate to MAO Order Status Page
- Use Playwright MCP to navigate to: https://crcpp.omni.manh.com/customerengagementfacade/app/orderstatus?orderId=W1156251121946800&selectedOrg=CFR
- Wait 5 seconds for page load and dynamic content to render
- Take full-page screenshot: `.playwright-mcp/mao-W1156251121946800-status.png` (fullPage: true)
- Capture page snapshot for accessibility structure analysis

### 2. Extract Order Header Data
- Extract from the order status page:
  - Order Number: W1156251121946800
  - Order Date (with timezone)
  - Order Status
  - Organization (should be CFR)
  - Business Unit
  - Selling Channel
  - Order Type (delivery type code)

### 3. Extract Customer Information
- Extract from the customer section:
  - Customer ID
  - Customer Name (Thai and English if available)
  - Email Address
  - Phone Number
  - Customer Type
  - T1 Number (The1 member number)
  - Customer Reference Number

### 4. Extract Shipping Address
- Extract complete shipping address:
  - Street address (in Thai)
  - City/District
  - State/Province
  - Postal Code
  - Country

### 5. Extract Line Items
- For each line item, extract:
  - Line Item ID
  - SKU/Product ID
  - Barcode
  - Product Name (English)
  - Product Name (Thai)
  - Quantity Ordered
  - Quantity Fulfilled
  - Quantity Backordered
  - Quantity Cancelled
  - Unit Price
  - Total Price
  - UOM (Unit of Measure)
  - Location/Fulfillment Store
  - Fulfillment Status
  - Shipping Method
  - Route Information
  - Booking Slot (From/To)
  - ETA Dates
  - Gift Wrap Status
  - Substitution Status
  - Supply Type ID
  - Weight Information

### 6. Extract Line Item Price Breakdowns
- For each line item, extract pricing:
  - Subtotal
  - Discounts
  - Charges
  - Taxes
  - Total

### 7. Extract Promotions and Coupons (CRITICAL)
- Look for clickable "Promotions" buttons/links on line items
- Look for "Coupons" or "Applied Coupons" sections
- Click on each promotion to expand details
- Extract all promotion information:
  - Promotion Name
  - Promotion Type
  - Discount Amount
  - Applied Items
- Take screenshot of expanded promotions section: `.playwright-mcp/mao-W1156251121946800-coupons.png`

### 8. Extract Order-Level Pricing
- Extract from order totals section:
  - Subtotal
  - Order-Level Discounts
  - Tax Amount
  - Shipping Fee
  - Grand Total

### 9. Extract Payment Information
- Extract payment details:
  - Payment Method
  - Payment Status
  - Transaction ID
  - Card Number (masked)
  - Payment Date/Time

### 10. Extract Delivery Information
- Extract delivery details:
  - Delivery Type Code
  - Delivery Method
  - Recipient Name
  - Delivery Address
  - Delivery Instructions

### 11. Navigate to Audit Trail Page
- Navigate to: https://crcpp.omni.manh.com/omnifacade/#/order
- Wait for page load
- Search for order W1156251121946800 in the order search
- Click on the order to open details
- Navigate to Audit Trail tab
- Take full-page screenshot: `.playwright-mcp/mao-W1156251121946800-audit.png` (fullPage: true)

### 12. Extract Audit Trail Events
- Extract ALL audit trail events:
  - Timestamp (with timezone)
  - Entity (what was changed)
  - User (who made the change)
  - Parameter (field name)
  - Old Value
  - New Value
  - Capture in chronological order

### 13. Create Mock Order in src/lib/mock-data.ts
- Read `src/lib/mock-data.ts` to locate insertion point (after line 3652, after `maoOrderW1156260115052036`)
- Create `maoOrderW1156251121946800` object with ALL extracted data:
  - Order Header section
  - Customer section
  - Shipping Address section
  - Items array (all line items with complete details)
  - Pricing section
  - Payment section
  - Delivery section
  - Include: `orderDiscounts` array
  - Include: `promotions` array (if applicable)
  - Include: `couponCodes` array (if applicable)

### 14. Create Audit Trail Generator Function
- Create `generateMAOOrderW1156251121946800AuditTrail()` function
- Return array of all audit events extracted from MAO
- Each event should include: timestamp, entity, user, parameter, oldValue, newValue
- Sort by timestamp ascending (oldest first)

### 15. Add Order to Mock Data
- Add `mockApiOrders.unshift(maoOrderW1156251121946800)` after the order definition
- This ensures the order appears at the top of the mock orders list

### 16. Validate Build and Deployment
- Run: `pnpm build` to ensure no TypeScript errors
- Verify build completes successfully
- Run: `pnpm dev` to start development server
- Wait for server to start on http://localhost:3000

### 17. Validate Order Display
- Navigate to: http://localhost:3000/orders
- Use the search box to search for: W1156251121946800
- Verify order appears in search results
- Click on the order to open detail view
- Verify ALL order details display correctly:
  - Order header information
  - Customer information
  - Shipping address
  - All line items
  - Pricing totals
  - Payment information
  - Delivery information
  - Promotions/coupons (if applicable)
  - Audit trail events

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Verify TypeScript compilation succeeds
- `pnpm dev` - Start development server (manual verification required)
- Navigate to http://localhost:3000/orders and search for W1156251121946800
- Verify all order sections display correctly with complete data

## Notes

**Pre-requisites:**
- User MUST be logged into MAO before starting the extraction
- MAO URLs:
  - Order Status: https://crcpp.omni.manh.com/customerengagementfacade/app/orderstatus?orderId=W1156251121946800&selectedOrg=CFR
  - Audit Trail: https://crcpp.omni.manh.com/omnifacade/#/order

**Data Structure Reference:**
- Follow the existing structure of `maoOrderW1156260115052036` in `src/lib/mock-data.ts` (starting at line 3119)
- Use the same field names and data types
- Ensure all arrays are properly formatted (items, promotions, orderDiscounts, couponCodes)

**Critical Fields:**
- Promotions and coupons are often hidden behind expandable sections - must click to extract
- Audit trail requires navigation to separate page and tab
- All timestamps should preserve timezone information (GMT+7 for Thailand)
- Thai names and addresses must be preserved exactly as shown in MAO

**Screenshot Locations:**
- All screenshots must be saved in `.playwright-mcp/` directory
- Use descriptive filenames with order ID prefix
- Full-page screenshots required for order status and audit trail

**Mock Data Insertion:**
- Insert after line 3652 in `src/lib/mock-data.ts`
- After the existing `maoOrderW1156260115052036` definition
- Use `mockApiOrders.unshift()` to add order to the beginning of the array
