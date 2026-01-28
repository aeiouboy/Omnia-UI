# Chore: Add Merchant SKU Toggle Switch

## Metadata
adw_id: `edda1b55`
prompt: `Add a toggle switch to show/hide the Merchant SKU field on the Stock Card By Product page (http://localhost:3000/inventory-new/stores). Requirements: 1) Remove the existing Merchant SKU search filter input from the filter row (it's no longer needed), 2) Add a toggle/switch UI control (use existing Switch component from @/components/ui/switch) near the filter section to enable/disable Merchant SKU visibility, 3) When toggle is OFF (default): hide the Merchant SKU column from the transaction history table, hide Merchant SKU from mobile card view, exclude Merchant SKU from CSV export, 4) When toggle is ON: show Merchant SKU column in table, show in mobile card view, include in CSV export, 5) Persist the toggle state in localStorage so user preference is remembered across sessions, 6) Add label text 'Show Merchant SKU' next to the toggle. Position the toggle at the end of filter row 2 before the action buttons (Refresh, Clear All, Export CSV).`

## Chore Description
This chore modifies the Stock Card By Product page to replace the Merchant SKU search filter with a toggle switch that controls the visibility of the Merchant SKU field across the page. The toggle will:
- Control visibility of the Merchant SKU column in the desktop transaction history table
- Control visibility of the Merchant SKU section in the mobile card view
- Control whether Merchant SKU is included in CSV exports
- Persist user preference in localStorage for cross-session memory
- Default to OFF (hidden) state

## Relevant Files
Use these files to complete the chore:

- **app/inventory-new/stores/page.tsx** - Main page component containing the By Product view with filter rows, transaction history table, mobile card view, and CSV export functionality. This is where the Merchant SKU search filter input (lines 1039-1048) needs to be removed, the toggle switch added, and visibility logic implemented.

- **src/components/ui/switch.tsx** - Existing Switch component from Radix UI that will be used for the toggle control. Already implements proper styling and accessibility.

- **src/lib/stock-card-export.ts** - CSV export utility that currently includes Merchant SKU column (line 98). Needs modification to accept a parameter controlling whether to include Merchant SKU.

- **src/lib/stock-card-mock-data.ts** - Mock data generator (read-only reference). Contains the ProductTransaction interface with merchantSku field. No changes needed to this file.

### New Files
None - all changes are modifications to existing files.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Add Switch Component Import and State Management
- Import Switch component from `@/components/ui/switch` in `app/inventory-new/stores/page.tsx`
- Add state variable for toggle: `const [showMerchantSku, setShowMerchantSku] = useState(false)` (default OFF)
- Add useEffect to load saved preference from localStorage on mount
- Add useEffect to save preference to localStorage when toggle changes
- localStorage key: `"stockCard-showMerchantSku"`

### 2. Remove Existing Merchant SKU Search Filter
- Remove the `searchMerchantSku` state variable (line 286)
- Remove the Merchant SKU search filter input JSX (lines 1039-1048)
- Remove `searchMerchantSku` from the Clear All button disabled condition (line 1069)
- Remove `searchMerchantSku` from `handleClearByProductFilters` function (line 573)
- Remove the `filterTransactionsByMerchantSku` call in `loadProductTransactions` (lines 400-403)
- Remove `searchMerchantSku` from the useCallback dependency array for `loadProductTransactions`

### 3. Add Toggle Switch UI Control
- Add toggle switch at the end of filter row 2, before the Refresh button (around line 1053)
- Use the existing Switch component with proper styling
- Add label text "Show Merchant SKU" to the left of the switch
- Wrap in a flex container with items-center and gap-2 for proper alignment
- Use text-sm font-medium for label styling consistent with other filter labels

### 4. Conditionally Render Merchant SKU Column in Desktop Table
- In the desktop table header (line 1144), wrap the Merchant SKU TableHead in a conditional: `{showMerchantSku && (<TableHead>...)}`
- In the table body (line 1207-1209), wrap the Merchant SKU TableCell in the same conditional

### 5. Conditionally Render Merchant SKU Section in Mobile Card View
- In the mobile card view (lines 1280-1286), wrap the Merchant SKU section in: `{showMerchantSku && (<div className="mt-3">...)}`

### 6. Update CSV Export to Accept Merchant SKU Toggle
- Modify `exportStockCardToCSV` function signature in `src/lib/stock-card-export.ts` to accept an optional parameter: `includeMerchantSku?: boolean` (default true for backward compatibility)
- Conditionally add "Merchant SKU" to the header row based on the parameter
- Conditionally add merchantSku field to data rows based on the parameter
- Update the function call in `app/inventory-new/stores/page.tsx` (line 557-561) to pass `showMerchantSku` value

### 7. Validate and Clean Up
- Run `pnpm build` to ensure no TypeScript errors
- Verify all references to removed `searchMerchantSku` are cleaned up
- Verify localStorage persistence works correctly
- Test desktop table, mobile card view, and CSV export all respect the toggle state

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Build the project to ensure no TypeScript or compilation errors
- `pnpm lint` - Run ESLint to check for linting errors
- Open `http://localhost:3000/inventory-new/stores` and verify:
  1. Merchant SKU search filter is removed from filter row 2
  2. Toggle switch with "Show Merchant SKU" label appears before action buttons
  3. Toggle defaults to OFF (unchecked)
  4. When OFF: Merchant SKU column not visible in table, not visible in mobile view
  5. When ON: Merchant SKU column appears in table and mobile view
  6. Refresh page and verify toggle state persists via localStorage
  7. Export CSV with toggle OFF and verify no Merchant SKU column
  8. Export CSV with toggle ON and verify Merchant SKU column present

## Notes
- The toggle position is specified as "end of filter row 2 before the action buttons" which means it should appear after the Notes search input and before the Refresh button
- Default state is OFF to match the user's requirement that Merchant SKU visibility should be opt-in
- localStorage is used for persistence rather than URL parameters since this is a user preference rather than shareable state
- The filter input removal also means removing the `filterTransactionsByMerchantSku` import from stock-card-mock-data.ts is NOT needed - the function can remain for potential future use
