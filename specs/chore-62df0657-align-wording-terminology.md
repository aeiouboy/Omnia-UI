# Chore: Align Wording and Terminology Across Order & Inventory Modules

## Metadata
adw_id: `62df0657`
prompt: `Analyze and align all wording, labels, and terminology across the Order Management and Inventory Management modules to ensure consistency. Use Playwright MCP to validate each page.`

## Chore Description
Perform a comprehensive terminology and wording audit across the Order Management and Inventory Management modules. The goal is to identify and fix inconsistencies in:
- Table column header casing (UPPERCASE vs Title Case)
- Button label formatting
- Status badge text formatting
- Filter dropdown placeholder text
- Empty state messages
- Pagination labels

The Order Management module uses UPPERCASE for table headers (e.g., "ORDER NUMBER", "SLA STATUS"), while the Inventory module uses Title Case (e.g., "Product Name", "Status"). This chore will align all terminology to use a consistent convention across both modules.

## Relevant Files
Use these files to complete the chore:

### Primary Files
- **`src/components/order-management-hub.tsx`** - Order Management table with UPPERCASE headers (ORDER NUMBER, SHORT ORDER, ORDER TOTAL, SELLING LOCATION ID, etc.)
- **`app/inventory/page.tsx`** - Inventory Management table with Title Case headers (Product Name, Barcode, Brand, Status, etc.)
- **`app/inventory/stores/page.tsx`** - Stock by Store table with Title Case headers (Store Name, Total SKUs, Low Stock, etc.)

### Secondary Files
- **`src/components/recent-transactions-table.tsx`** - Transaction history table with Title Case headers (Date & Time, Transaction Type, Channel, Quantity, etc.)

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Run Development Server
- Start the development server with `pnpm dev`
- Ensure the application is running on http://localhost:3000

### 2. Audit Order Management Page (/orders)
- Navigate to http://localhost:3000/orders using Playwright browser_navigate
- Capture browser_snapshot for accessibility tree analysis
- Take browser_take_screenshot for visual reference
- Document all terminology found:
  - Table headers (currently UPPERCASE)
  - Button labels (Export, Refresh, Clear Filters)
  - Filter labels (All Status, All Channels, All Stores)
  - Quick filter buttons (Urgent Orders, Due Soon, Ready to Process, On Hold)
  - Empty state message ("No orders found.")
  - Pagination format ("Last updated: {time}")

### 3. Audit Inventory Page (/inventory)
- Navigate to http://localhost:3000/inventory using Playwright browser_navigate
- Capture browser_snapshot for accessibility tree analysis
- Take browser_take_screenshot for visual reference
- Document all terminology found:
  - Table headers (currently Title Case)
  - Button labels (Export, Retry)
  - Filter labels (All Warehouses, All Categories, All Brands, All Types)
  - Tab labels (All Products, Low Stock, Out of Stock)
  - Empty state message ("No products found matching your search.")
  - Pagination format ("Page {x} of {y}")
  - Status badges (In Stock, Low Stock, Out of Stock)

### 4. Audit Stock by Store Page (/inventory/stores)
- Navigate to http://localhost:3000/inventory/stores using Playwright browser_navigate
- Capture browser_snapshot for accessibility tree analysis
- Take browser_take_screenshot for visual reference
- Document all terminology found:
  - Table headers (currently Title Case)
  - Button labels (Refresh, Back to Inventory, View Inventory)
  - Filter buttons (All Stores, Low Stock, Out of Stock)
  - Empty state message ("No stores found matching your search.")
  - KPI card labels

### 5. Define Terminology Standards
Based on the audit, establish consistent conventions:

**Table Headers**: Use Title Case (align to Inventory style)
- Order Management: Change UPPERCASE to Title Case
- Example: "ORDER NUMBER" -> "Order Number"

**Button Labels**: Use Title Case with verb-noun format
- Consistent across modules: "Export", "Refresh", "Clear Filters"

**Status Badges**: Use Title Case
- Order: "Processing", "Delivered", "Cancelled"
- Inventory: "In Stock", "Low Stock", "Out of Stock"

**Filter Labels**: Use "All {Noun}" format
- "All Status" (not "All Statuses")
- "All Channels", "All Stores", "All Warehouses"

**Empty States**: Use consistent messaging
- Primary: "No {items} found."
- With search: "No {items} found matching your search."

### 6. Update Order Management Hub Table Headers
- Edit `src/components/order-management-hub.tsx`
- Change all table headers from UPPERCASE to Title Case:
  - "ORDER NUMBER" -> "Order Number"
  - "SHORT ORDER" -> "Short Order"
  - "ORDER TOTAL" -> "Order Total"
  - "SELLING LOCATION ID" -> "Selling Location ID"
  - "ORDER STATUS" -> "Order Status"
  - "SLA STATUS" -> "SLA Status"
  - "RETURN STATUS" -> "Return Status"
  - "ON HOLD" -> "On Hold"
  - "PAYMENT STATUS" -> "Payment Status"
  - "CONFIRMED" -> "Confirmed"
  - "SELLING CHANNEL" -> "Selling Channel"
  - "ALLOW SUBSTITUTION" -> "Allow Substitution"
  - "CREATED DATE" -> "Created Date"

### 7. Verify Inventory Page Consistency
- Confirm `app/inventory/page.tsx` uses Title Case headers (already correct)
- Verify status badges use Title Case
- Verify empty state message format

### 8. Verify Stock by Store Page Consistency
- Confirm `app/inventory/stores/page.tsx` uses Title Case headers (already correct)
- Verify filter button labels match Order Management patterns

### 9. Validate Changes with Playwright
- Navigate to each page and capture updated snapshots:
  - /orders - Verify Title Case headers
  - /inventory - Verify consistent styling
  - /inventory/stores - Verify consistent styling
- Take screenshots for visual validation
- Compare before/after to ensure consistency

### 10. Final Cross-Module Verification
- Compare terminology across all three pages
- Ensure button labels match (Export, Refresh patterns)
- Ensure filter dropdown placeholders are consistent
- Verify pagination labels follow same format

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure no TypeScript/build errors after changes
- `pnpm lint` - Verify no linting errors introduced
- Use Playwright MCP tools to validate:
  - `browser_navigate` to each page
  - `browser_snapshot` to capture accessibility tree
  - `browser_take_screenshot` to capture visual state

## Notes
- The Order Management module currently uses UPPERCASE for table headers, which is inconsistent with the Inventory module's Title Case convention
- Title Case is the more common and accessible convention for table headers
- Status badges in both modules already use Title Case formatting
- Filter dropdowns have minor variations in placeholder text that should be standardized
- Empty state messages have slight wording differences that should be unified
