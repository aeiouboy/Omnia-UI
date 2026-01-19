# Chore: MAO Order Data Extraction and Mock Data Update

## Metadata
adw_id: `5ae417f8`
prompt: `Login to MAO (Manhattan Active Omni) using Playwright MCP, extract REAL data for order W1156260115052036, and update the mock data in src/lib/mock-data.ts.`

## Chore Description
This chore involves logging into the Manhattan Active Omni (MAO) system using Playwright MCP browser automation to extract real data for a specific order (W1156260115052036) and updating the mock data file with the authentic information. The process requires manual password input during login, followed by automated navigation to order status and audit trail pages, data extraction, and updating the TypeScript mock data file with exact values from MAO including Thai text, preserving all field structures and data types.

## Relevant Files
Use these files to complete the chore:

- **src/lib/mock-data.ts** (lines 3017-3616)
  - Contains `generateMAOOrderW1156260115052036AuditTrail()` function (line ~3017)
  - Contains `maoOrderW1156260115052036` object (line ~3193)
  - Target file for updating with REAL MAO data

- **.playwright-mcp/mao-order-status.png** (to be created)
  - Full-page screenshot of order status page for documentation

- **.playwright-mcp/mao-audit-trail.png** (to be created)
  - Full-page screenshot of audit trail page for documentation

### New Files
- **.playwright-mcp/mao-order-status.png** - Screenshot of order status page
- **.playwright-mcp/mao-audit-trail.png** - Screenshot of audit trail page

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Initialize Playwright MCP and Navigate to MAO Login Page
- Use `mcp__playwright__browser_navigate` to navigate to: `https://crcpp.omni.manh.com/customerengagementfacade/app/orderstatus`
- Wait for page to fully load using `mcp__playwright__browser_wait_for` with time=3
- Take initial screenshot using `mcp__playwright__browser_take_screenshot` saved to `.playwright-mcp/mao-login-page.png`
- Capture page snapshot using `mcp__playwright__browser_snapshot` to understand page structure

### 2. Fill Username and Wait for Manual Password Input
- Locate username input field using page snapshot
- Use `mcp__playwright__browser_type` to fill username: `wonaruechon@central.co.th`
- **CRITICAL PAUSE**: Inform user that password input is required
- Wait for user to manually input password and submit/login
- Use `mcp__playwright__browser_wait_for` with time=10 to allow for manual login
- Take screenshot after successful login: `.playwright-mcp/mao-after-login.png`

### 3. Navigate to Order Status Page for W1156260115052036
- Use `mcp__playwright__browser_navigate` to navigate to: `https://crcpp.omni.manh.com/customerengagementfacade/app/orderstatus?orderId=W1156260115052036&selectedOrg=CFR`
- Wait for page to fully load using `mcp__playwright__browser_wait_for` with time=5
- Take full-page screenshot using `mcp__playwright__browser_take_screenshot` with:
  - `filename`: `.playwright-mcp/mao-order-status.png`
  - `fullPage`: true
- Capture page snapshot using `mcp__playwright__browser_snapshot` to extract all visible data

### 4. Extract Order Header Data from MAO
- From the page snapshot, extract the following fields EXACTLY as shown:
  - **Order Number**: Extract from page (should be `W1156260115052036`)
  - **Order Date**: Extract exact date format from MAO
  - **Status**: Extract exact status value from MAO
  - **Organization**: Extract exact value from MAO (should be `CFR`)
  - **Business Unit**: Extract exact value from MAO
  - **Selling Channel**: Extract exact value from MAO (will populate both `sellingChannel` and `channel` fields)

### 5. Extract Customer Information from MAO
- Extract customer fields EXACTLY as shown in MAO:
  - **Customer ID**: Extract exact customer ID value
  - **Customer Name**: Extract EXACT Thai name (preserve Thai characters exactly)
  - **Customer Email**: Extract exact email address
  - **Customer Phone**: Extract exact phone number
  - **Customer Type**: Extract exact customer type value
  - **Customer Reference**: Extract if shown on page
  - **T1 Number**: Extract if shown on page

### 6. Extract Shipping Address from MAO
- Extract address fields EXACTLY as shown in MAO:
  - **Street**: Extract EXACT address including Thai text
  - **City**: Extract EXACT city name (likely in Thai)
  - **State/Province**: Extract EXACT state/province name
  - **District**: Extract if shown separately from state
  - **Postal Code**: Extract EXACT postal code
  - **Country**: Extract EXACT country name

### 7. Extract Line Items from MAO
- For EACH line item visible on the page, extract:
  - **Line ID**: Extract from MAO
  - **Product SKU**: Extract EXACT SKU value
  - **Product Name**: Extract EXACT product name
  - **Thai Name**: Extract EXACT Thai product name (preserve Thai characters)
  - **Barcode**: Extract EXACT barcode value
  - **Ordered Quantity**: Extract EXACT number
  - **Fulfilled Quantity**: Extract EXACT number
  - **Backordered Quantity**: Extract if shown
  - **Cancelled Quantity**: Extract if shown
  - **Unit Price**: Extract EXACT number
  - **Total Price**: Extract EXACT number
  - **UOM**: Extract EXACT unit of measure
  - **Location**: Extract EXACT location code
  - **Fulfillment Status**: Extract EXACT status value
  - **Shipping Method**: Extract EXACT method name
  - **Weight**: Extract if shown for weight-based items
  - **Actual Weight**: Extract if shown

### 8. Extract Pricing Information from MAO
- Extract pricing breakdown fields EXACTLY as shown:
  - **Subtotal**: Extract EXACT amount
  - **Order Discount**: Extract EXACT amount
  - **Line Item Discount**: Extract EXACT amount
  - **Tax Amount**: Extract EXACT amount
  - **Shipping Fee**: Extract EXACT amount
  - **Additional Fees**: Extract if shown
  - **Grand Total**: Extract EXACT amount
  - **Paid Amount**: Extract if shown separately from grand total
  - **Currency**: Extract currency code (likely `THB`)

### 9. Extract Payment Information from MAO
- Extract payment fields EXACTLY as shown:
  - **Payment Method**: Extract EXACT method name
  - **Payment Status**: Extract EXACT status value
  - **Transaction ID**: Extract EXACT transaction ID
  - **Payment Date**: Extract if shown on page

### 10. Extract Delivery Information from MAO
- Extract delivery fields EXACTLY as shown:
  - **Delivery Type Code**: Extract EXACT code (e.g., `RT-HD-EXP`)
  - **Delivery Method**: Extract EXACT method type
  - **Recipient Name**: Extract EXACT name from delivery details
  - **Recipient Phone**: Extract EXACT phone number
  - **Delivery Address**: Extract EXACT full address

### 11. Extract SLA Information from MAO
- Extract SLA fields if shown:
  - **Target Minutes**: Extract EXACT value
  - **Elapsed Minutes**: Extract EXACT value
  - **SLA Status**: Extract EXACT status value

### 12. Extract Metadata from MAO
- Extract metadata fields if shown:
  - **Created At**: Extract EXACT timestamp
  - **Updated At**: Extract EXACT timestamp
  - **Priority**: Extract if shown
  - **Store Name**: Extract if shown

### 13. Navigate to Audit Trail Page
- Use `mcp__playwright__browser_navigate` to navigate to: `https://crcpp.omni.manh.com/omnifacade/#/order`
- Wait for page to load using `mcp__playwright__browser_wait_for` with time=5
- Take screenshot: `.playwright-mcp/mao-order-page.png`
- Use page snapshot to search for order `W1156260115052036` if needed
- Click on Audit Trail section/tab using `mcp__playwright__browser_click`
- Wait for audit trail to load using `mcp__playwright__browser_wait_for` with time=3
- Take full-page screenshot: `.playwright-mcp/mao-audit-trail.png` (fullPage: true)
- Capture audit trail snapshot using `mcp__playwright__browser_snapshot`

### 14. Extract Audit Trail Data from MAO
- For EACH audit event visible on the page, extract:
  - **Event ID**: Extract from audit trail
  - **Timestamp**: Extract EXACT timestamp format from MAO
  - **User**: Extract EXACT username who made the change
  - **Entity Name**: Extract EXACT entity name (e.g., `Order`, `QuantityDetail`)
  - **Entity ID**: Extract EXACT entity ID
  - **Changed Parameter**: Extract EXACT parameter name
  - **Old Value**: Extract EXACT old value (may be null)
  - **New Value**: Extract EXACT new value
- Preserve chronological order (oldest events first)

### 15. Read src/lib/mock-data.ts File
- Use `Read` tool to read `/Users/naruechon/Omnia-UI/src/lib/mock-data.ts`
- Focus on lines 3017-3616 containing:
  - `generateMAOOrderW1156260115052036AuditTrail()` function (line ~3017)
  - `maoOrderW1156260115052036` object (line ~3193)

### 16. Update maoOrderW1156260115052036 Object with REAL Data
- Locate the `maoOrderW1156260115052036` object starting at line ~3193
- **DO NOT** change field names or object structure
- **ONLY** update field VALUES with real data from MAO
- Use `Edit` tool to replace each field value:
  - **ORDER HEADER** (lines ~3194-3203):
    - `order_no`: Update with exact value from MAO
    - `organization`: Update with exact value from MAO
    - `order_date`: Convert to ISO format: `YYYY-MM-DDTHH:mm:ss+07:00`
    - `business_unit`: Update with exact value from MAO
    - `sellingChannel`: Update with exact value from MAO
    - `channel`: Update with exact value from MAO
    - `status`: Update with exact value from MAO
  - **CUSTOMER** (lines ~3206-3214):
    - Update ALL customer fields with exact values from MAO
    - Preserve Thai text exactly (do not translate)
  - **SHIPPING ADDRESS** (lines ~3217-3223):
    - Update ALL address fields with exact values from MAO
    - Preserve Thai text exactly
  - **LINE ITEMS** (lines ~3226-3458):
    - Update EACH line item with exact data from MAO
    - Preserve array structure
    - Update quantities, prices, statuses exactly
  - **PRICING** (lines ~3461-3477):
    - Update ALL pricing fields with exact amounts from MAO
  - **PAYMENT** (lines ~3483-3507):
    - Update ALL payment fields with exact values from MAO
  - **DELIVERY** (lines ~3564-3581):
    - Update delivery method fields with exact values from MAO
    - Update `deliveryTypeCode` with exact code from MAO
  - **SLA** (lines ~3584-3588):
    - Update SLA fields if present in MAO
  - **METADATA** (lines ~3591-3598):
    - Update metadata fields with exact values from MAO

### 17. Update generateMAOOrderW1156260115052036AuditTrail() Function
- Locate the function at line ~3017
- Replace ALL mock audit events with REAL events from MAO
- Use `Edit` tool to update the function:
  - Replace each `events.push()` call with real audit event data
  - Use EXACT timestamps from MAO (preserve MAO's timestamp format)
  - Use EXACT usernames from MAO
  - Use EXACT entity names and parameters from MAO
  - Use EXACT old and new values from MAO
  - Preserve chronological order (oldest first)
- Remove the `formatMAOAuditTimestamp()` function usage if MAO uses a different format
- Preserve the exact audit event structure with fields: `id`, `orderId`, `updatedBy`, `updatedOn`, `entityName`, `entityId`, `changedParameter`, `oldValue`, `newValue`

### 18. Close Browser Session
- Use `mcp__playwright__browser_close` to close the browser
- Verify all screenshots were saved successfully

### 19. Build and Type Check
- Run `pnpm build` to check for TypeScript errors
- Fix any type errors that arise from data type mismatches
- Ensure all numbers remain as numbers (not strings)
- Ensure all dates use ISO format: `YYYY-MM-DDTHH:mm:ss+07:00`

### 20. Development Server Validation
- Run `pnpm dev` in background
- Wait for server to start
- Use `mcp__playwright__browser_navigate` to navigate to: `http://localhost:3000/orders`
- Wait for page to load
- Use `mcp__playwright__browser_snapshot` to get page structure
- Locate search input field
- Use `mcp__playwright__browser_type` to search for: `W1156260115052036`
- Wait for search results
- Click on the order to open detail view using `mcp__playwright__browser_click`
- Wait for detail view to load
- Take screenshot: `.playwright-mcp/validation-mao-order-detail.png`

### 21. Verify Order Detail Display
- Use `mcp__playwright__browser_snapshot` to capture order detail view
- Verify ALL tabs display correctly with REAL data:
  - **Overview Tab**: Verify order header, customer, shipping info display correctly
  - **Items Tab**: Verify all line items display with correct quantities and prices
  - **Payment Tab**: Verify payment information displays correctly
  - **Delivery Tab**: Verify delivery information displays correctly
  - **Audit Trail Tab**: Verify audit trail displays with correct chronological order
- Check for any `undefined` values in the display
- Verify Thai text displays correctly (not garbled)
- Verify currency formatting works (฿ symbol displays correctly)

### 22. Final Validation and Documentation
- Create validation report summarizing:
  - All fields updated with real MAO data
  - No fake/mock values remain
  - Thai text preserved correctly
  - Currency formatting works
  - All tabs display correctly
- Close development server
- Close browser session

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Verify TypeScript compiles without errors
- `pnpm dev` - Start development server for manual validation
- Navigate to `http://localhost:3000/orders` in browser
- Search for order `W1156260115052036`
- Verify all order details display with real data (no undefined/fake values)
- Verify Thai text displays correctly
- Verify currency formatting (฿ symbol) works
- Check all tabs: Overview, Items, Payment, Delivery, Audit Trail
- Verify screenshots exist: `.playwright-mcp/mao-order-status.png` and `.playwright-mcp/mao-audit-trail.png`

## Notes

### Important Considerations:
1. **Manual Password Input**: The login process requires manual password input. Pause and inform the user when password input is needed.

2. **Exact Value Preservation**: All values must be copied EXACTLY as shown in MAO, including:
   - Thai text (do not translate or transliterate)
   - Date formats (convert to ISO format for TypeScript)
   - Numeric values (preserve as numbers, not strings)
   - Status codes and identifiers

3. **Data Type Integrity**: Ensure data types are preserved:
   - Prices and quantities: numbers (not strings)
   - Dates: ISO format strings
   - Booleans: true/false
   - Arrays: preserve array structure

4. **Field Structure**: DO NOT modify field names or object structure. ONLY update VALUES.

5. **Screenshot Documentation**: Screenshots are critical for documentation and future reference.

6. **Audit Trail Order**: Preserve chronological order (oldest events first) in audit trail.

7. **Validation**: The order detail view should display all data correctly without undefined values.

8. **Browser Session Management**: Close browser sessions after completing data extraction to free resources.

9. **Error Handling**: If MAO pages fail to load or data is not accessible, document the issue and retry after checking network connectivity.

10. **Security**: Credentials are being used for a legitimate business purpose (data extraction for mock data updating). Ensure password input is done manually by the user, not automated.
