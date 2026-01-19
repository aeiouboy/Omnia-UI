# Chore: Remove Mock Store No. from MAO Orders

## Metadata
adw_id: `5e5284ab`
prompt: `Remove mock Store No. value from MAO orders in mock data (src/lib/mock-data.ts): The MAO system shows Store No. as empty for order W1156251121946800, but our mock data incorrectly shows 'TW001'. Update the mock data to remove or clear the storeNo field for MAO orders to match the real MAO data. Search for order 'W1156251121946800' in mock-data.ts and set storeNo to empty string or undefined. Also check order 'W1156260115052036' and any other MAO orders (orders starting with 'W') and clear their storeNo values since MAO doesn't provide store number data. The Store No. field in the UI should remain but display '-' when the value is empty.`

## Chore Description
The MAO (Manhattan Active Omni) system does not provide Store No. data for orders. However, our mock data for MAO orders (order IDs starting with 'W') incorrectly includes a `store_no` value of 'TW001' in the metadata object. This discrepancy causes the UI to display a store number that doesn't exist in the real MAO system.

This chore updates the mock data to remove or clear the `store_no` field from all MAO orders to accurately reflect the real MAO data structure. The UI already handles empty/undefined values by displaying '-' via the fallback logic: `order?.metadata?.store_no || order?.metadata?.store_name || '-'`.

## Relevant Files
Use these files to complete the chore:

- **src/lib/mock-data.ts** - Contains the mock order data including MAO orders. The `metadata` object within each MAO order definition has the `store_no` field that needs to be cleared.
  - Line ~3747-3755: `maoOrderW1156251121946800` metadata with `store_no: 'TW001'`
  - Line ~9387-9395: `maoOrderW1156260115052036` metadata with `store_no: 'TW001'`

- **src/components/order-detail-view.tsx** - UI component displaying Store No. field (line 476-477). Already handles empty values with fallback to '-'. No changes needed.

- **src/components/order-management-hub.tsx** - Order management table displaying Store No. column (line 1815). Already handles empty values with `|| "-"`. No changes needed.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update MAO Order W1156251121946800 Metadata
- Open `src/lib/mock-data.ts`
- Locate the `maoOrderW1156251121946800` object definition (around line 3607)
- Find the `metadata` object within it (around line 3747)
- Change `store_no: 'TW001'` to `store_no: ''` (empty string)

### 2. Update MAO Order W1156260115052036 Metadata
- In the same file, locate the `maoOrderW1156260115052036` object definition (around line 9256)
- Find the `metadata` object within it (around line 9387)
- Change `store_no: 'TW001'` to `store_no: ''` (empty string)

### 3. Verify No Other MAO Orders Exist
- Search for any other order definitions with IDs starting with 'W' in mock-data.ts
- If found, apply the same `store_no: ''` change to their metadata

### 4. Validate Build Compiles Successfully
- Run `pnpm build` to ensure TypeScript compilation passes
- Verify no errors related to the metadata structure changes

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure the production build compiles without errors
- `grep -n "store_no.*TW001" src/lib/mock-data.ts` - Should return no results after the fix (confirms 'TW001' is removed)
- `grep -n "store_no.*''" src/lib/mock-data.ts` - Should show the MAO order metadata lines with empty string values

## Notes
- The UI components already handle empty `store_no` values gracefully by falling back to display '-'
- Only MAO orders (IDs starting with 'W') should have empty `store_no` - other mock orders should retain their randomly generated store numbers
- The `store_name` field in MAO orders ('Tops Westgate1') should remain unchanged as it represents the fulfillment location
