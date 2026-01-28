# Chore: Add Merchant SKU Field to Stock Card By Product

## Metadata
adw_id: `a82ba396`
prompt: `Add Merchant SKU field next to the Notes field on the Stock Card By Product page (http://localhost:3000/inventory-new/stores). The Merchant SKU should be displayed: 1) As an optional search filter input field next to the Notes filter in the filter row, 2) As a new column in the transaction history table between Balance and Notes columns, 3) In the mobile card view. Update the ProductTransaction interface in stock-card-mock-data.ts to include merchantSku field and generate mock data for it.`

## Chore Description
Add Merchant SKU field to the Stock Card By Product page to allow users to search by merchant-specific SKU codes and view the Merchant SKU for each transaction. This implementation includes:

1. **Filter Input**: Add optional Merchant SKU search field next to the Notes filter in filter row 2
2. **Table Column**: Add Merchant SKU column between Balance and Notes in the transaction history table
3. **Mobile View**: Display Merchant SKU in the mobile card layout
4. **Data Model**: Update ProductTransaction interface to include merchantSku field
5. **Mock Data**: Generate realistic merchant SKU values in mock data
6. **CSV Export**: Include Merchant SKU column in exported CSV files

The Merchant SKU field is optional (not part of mandatory filters) and follows the existing UI patterns for consistency.

## Relevant Files
Use these files to complete the chore:

- **app/inventory-new/stores/page.tsx** (lines 1-1330)
  - Main Stock Card page component with By Product tab
  - Contains filter inputs, transaction history table, and mobile card view
  - Need to add: Merchant SKU search input, table column, and mobile card display

- **src/lib/stock-card-mock-data.ts** (lines 1-429)
  - Mock data generator for product transactions
  - Contains ProductTransaction interface (lines 22-35)
  - Contains mock data generation function generateMockProductTransactions (lines 219-330)
  - Need to update: Add merchantSku field to interface and generate mock values

- **src/lib/stock-card-export.ts** (lines 1-133)
  - CSV export utility for stock card data
  - Need to update: Add Merchant SKU column to CSV export

### New Files
No new files need to be created for this chore.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update ProductTransaction Interface
- Open `src/lib/stock-card-mock-data.ts`
- Locate the `ProductTransaction` interface (around line 22)
- Add `merchantSku: string` field after `personName` field
- This makes merchantSku a required field for all transactions

### 2. Update Mock Data Generation
- In `src/lib/stock-card-mock-data.ts`, locate `generateMockProductTransactions` function (around line 219)
- Add merchantSku generation logic to create consistent SKU per product
- Use format: `MSKU-{6 digits derived from productId}`
- Example logic: `const merchantSku = 'MSKU-' + productId.replace(/\D/g, '').padStart(6, '0').slice(-6)`
- Add merchantSku field to the transaction object being created (around line 295-308)
- Ensure all generated transactions include the merchantSku value

### 3. Add Merchant SKU Filter Input
- Open `app/inventory-new/stores/page.tsx`
- Locate the "By Product View Content" section (around line 872)
- Find the filters row 2 with Notes search (around line 1020-1029)
- Add new state variable: `const [searchMerchantSku, setSearchMerchantSku] = useState("")`
- Add Merchant SKU input field before the Notes search input
- Use same styling: `min-w-[160px] h-10` with search icon
- Placeholder: "Merchant SKU"
- Add debounced search logic similar to Notes filter

### 4. Update Filter Logic
- In `app/inventory-new/stores/page.tsx`, locate `loadProductTransactions` function (around line 369)
- Add merchant SKU filtering logic after notes filter (around line 394-396)
- Create filter function: `filterTransactionsByMerchantSku` similar to `filterTransactionsByNotes`
- Apply filter when `searchMerchantSku.trim()` has value

### 5. Add Table Column (Desktop)
- In `app/inventory-new/stores/page.tsx`, locate Transaction History table header (around line 1118-1125)
- Add new `<TableHead>` for "Merchant SKU" between "Balance" and "Notes"
- Use class: `whitespace-nowrap`
- In table body (around line 1128-1189), add new `<TableCell>` after Balance column
- Display: `{txn.merchantSku || "-"}`
- Use class: `font-mono text-sm text-muted-foreground`

### 6. Add Mobile Card Display
- In `app/inventory-new/stores/page.tsx`, locate mobile card view (around line 1195-1260)
- Add Merchant SKU display row after the badge/timestamp header (around line 1221)
- Format: `<div className="text-xs text-muted-foreground">Merchant SKU</div>`
- Display value: `<div className="text-sm font-mono">{txn.merchantSku || "-"}</div>`
- Add to same grid section as Quantity and Balance

### 7. Update CSV Export
- Open `src/lib/stock-card-export.ts`
- Locate the header row creation (line 98)
- Update header: `"Date & Time,Transaction Type,Quantity,Balance,Merchant SKU,Reference No,Notes"`
- In data rows loop (lines 101-111), add merchantSku to row array
- Add after balance: `escapeCSVField(txn.merchantSku || "-")`
- Ensure proper column ordering matches header

### 8. Update Clear All Button
- In `app/inventory-new/stores/page.tsx`, locate Clear All button for By Product view (around line 1049-1054)
- Add `searchMerchantSku` to the disabled condition check
- Update `handleClearByProductFilters` function (around line 558-567) to reset `setSearchMerchantSku("")`

### 9. Add Filter Helper Functions
- In `src/lib/stock-card-mock-data.ts`, add new export function after `filterTransactionsByNotes`
- Create `filterTransactionsByMerchantSku` function following same pattern
- Filter transactions where merchantSku includes the search text (case-insensitive)

### 10. Test and Validate
- Start development server with `pnpm dev`
- Navigate to http://localhost:3000/inventory-new/stores
- Switch to "By Product" tab
- Verify all mandatory filters (Date Range, Store, Product) show orange borders initially
- Complete mandatory filters to load data
- Verify Merchant SKU filter input is visible next to Notes
- Verify Merchant SKU column appears between Balance and Notes in desktop table
- Verify Merchant SKU displays in mobile card view
- Test Merchant SKU search filter functionality
- Test CSV export includes Merchant SKU column
- Verify Clear All button resets Merchant SKU filter
- Check browser console for any TypeScript or runtime errors

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure no TypeScript errors in production build
- `pnpm lint` - Verify code passes ESLint checks
- Manual testing: Navigate to http://localhost:3000/inventory-new/stores → By Product tab → Complete mandatory filters → Verify Merchant SKU appears in filter row, table column, and mobile view
- CSV Export test: Click "Export CSV" button → Open downloaded file → Verify "Merchant SKU" column exists between Balance and Reference No

## Notes

**UI Consistency**:
- Merchant SKU filter follows existing filter pattern with min-w-[160px] width
- Table column uses font-mono for consistent code-like display
- Mobile card follows same structure as other transaction details
- Filter is optional (not mandatory) - no orange border validation required

**Data Format**:
- Merchant SKU format: `MSKU-{6 digits}` derived from productId
- Example: Product ID "PROD-001" → "MSKU-000001"
- Format ensures consistency across all transactions for the same product

**Column Positioning**:
The requirement specifies "between Balance and Notes" which matches the logical flow:
1. Date & Time (when)
2. Type (what happened)
3. Quantity (how much changed)
4. Balance (resulting stock level)
5. **Merchant SKU** (product identifier) ← NEW
6. Notes (additional context)

**Implementation References**:
- Wireframe spec: `wf_specs/wf-merchant-sku-by-product-tab.md` (Version 2 approach)
- Similar filter pattern: Notes search filter (lines 1020-1029 in page.tsx)
- Similar table column: Reference No column pattern for font-mono styling
- Mock data pattern: generateMockProductTransactions function structure

**CSV Export Column Order**:
Updated order: Date & Time, Transaction Type, Quantity, Balance, **Merchant SKU**, Reference No, Notes
This maintains logical grouping with product identifier before reference numbers and notes.
