# Chore: Supply Type Display Value Standardization

## Metadata
adw_id: `0f609910`
prompt: `Standardize Supply Type values. In Inventory Availability page (app/inventory-new/supply/page.tsx), ensure consistent naming: use 'On Hand' (not 'On Hand Available') as the short display value, and 'Pre-Order' remains as-is. Update both the dropdown options and the table cell display to use the same values.`

## Chore Description
Currently, the Inventory Availability page (`app/inventory-new/supply/page.tsx`) has inconsistent naming for the Supply Type values. The dropdown shows "On Hand Available" while the table cell display shows "On Hand". This chore standardizes the display value to use the shorter "On Hand" consistently across both locations, while maintaining "Pre-Order" as-is.

**Current State:**
- Dropdown SelectItem: `<SelectItem value="On Hand Available">On Hand Available</SelectItem>`
- Table cell fallback: `{item.supplyType || "On Hand"}`
- Data type definition: `SupplyType = "On Hand Available" | "Pre-Order"`

**Desired State:**
- Dropdown SelectItem: Display "On Hand" (while keeping the internal value as "On Hand Available")
- Table cell fallback: Display "On Hand" (consistent with dropdown)
- Internal data values remain unchanged ("On Hand Available" in types and data)

**Key Principle:**
- This is a **UI display-only change**
- Internal type definitions (`src/types/inventory.ts`) remain unchanged
- Mock data generation (`src/lib/mock-inventory-data.ts`) remains unchanged
- Only the user-facing display labels in the Inventory Availability page are affected

## Relevant Files
Use these files to complete the chore:

- `app/inventory-new/supply/page.tsx` - Main file requiring updates. Contains:
  - Line 371: Dropdown SelectItem for "On Hand Available" that needs display text updated
  - Line 540: Table cell that shows fallback value "On Hand" (already correct, but verify consistency)
  - Lines 365-374: Supply Type dropdown filter component
  - Lines 535-542: Supply Type badge display in table cells

- `src/types/inventory.ts` - Reference file for understanding SupplyType type definition (NO CHANGES NEEDED)
  - Line 67: `export type SupplyType = "On Hand Available" | "Pre-Order"`
  - This type definition should NOT be changed - it defines the internal data values

- `src/lib/mock-inventory-data.ts` - Reference file for understanding how supply type data is generated (NO CHANGES NEEDED)
  - Line 134: Supply type generation logic using "On Hand Available"
  - This data generation should NOT be changed

- `docs/wording/06-supply-type-value-standardization.txt` - The source requirement document for this chore
  - Contains the exact wording requirement that prompted this chore

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Supply Type Dropdown Display Label
- Open `app/inventory-new/supply/page.tsx`
- Locate the Supply Type dropdown SelectItem on line 371
- Change the display text from "On Hand Available" to "On Hand"
- Keep the value attribute unchanged as "On Hand Available" (this is the internal data value)
- The change should be: `<SelectItem value="On Hand Available">On Hand</SelectItem>`
- **Rationale:** Displays shorter, cleaner label to user while maintaining data consistency

### 2. Verify Table Cell Display Consistency
- In the same file (`app/inventory-new/supply/page.tsx`), locate the Supply Type badge display around line 540
- Verify the fallback value is "On Hand" (not "On Hand Available")
- Current code: `{item.supplyType || "On Hand"}`
- **Expected:** Fallback should already be "On Hand" - verify this is correct
- If the fallback shows "On Hand Available", change it to "On Hand"
- **Rationale:** Ensures consistent display between dropdown and table when data is missing

### 3. Test Dropdown and Table Display
- Run the development server: `pnpm dev`
- Navigate to the Inventory Availability page at `/inventory-new/supply`
- Perform the following validations:
  - Check the Supply Type dropdown shows "On Hand" option (not "On Hand Available")
  - Enter a search query to display results (e.g., search for a product)
  - Verify table cells show "On Hand" badge for items with supplyType "On Hand Available"
  - Verify "Pre-Order" items display correctly with "Pre-Order" label
- **Rationale:** Confirms the display changes work correctly in the UI

### 4. Verify No Breaking Changes
- Confirm that changing only the display text does not affect:
  - Filter functionality (selecting "On Hand" in dropdown still filters by "On Hand Available" value)
  - Badge color logic (line 536-538: still checks `item.supplyType === "Pre-Order"`)
  - Data fetching and processing
- Run a quick smoke test by applying the Supply Type filter and verifying results
- **Rationale:** Ensures the change is purely cosmetic and doesn't break functionality

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm dev` - Start development server and manually test the Inventory Availability page
- Navigate to `http://localhost:3000/inventory-new/supply`
- **Visual Validation:**
  - Supply Type dropdown displays "On Hand" (not "On Hand Available")
  - Table cells display "On Hand" badge for On Hand Available items
  - "Pre-Order" items display "Pre-Order" badge unchanged
- **Functional Validation:**
  - Selecting "On Hand" in dropdown filters correctly (shows items with supplyType "On Hand Available")
  - Badge colors remain correct (blue for On Hand, yellow for Pre-Order)
- `pnpm build` - Verify no TypeScript compilation errors introduced

## Notes
- **Scope:** This chore is intentionally limited to UI display changes in the Inventory Availability page only
- **No Type Changes:** The `SupplyType` type definition in `src/types/inventory.ts` remains unchanged
- **No Data Changes:** Mock data generation in `src/lib/mock-inventory-data.ts` remains unchanged
- **Other Files:** Other components that display supply type (e.g., `src/components/inventory-detail-view.tsx`) are NOT modified in this chore - they may be addressed in future chores if needed
- **Internal vs Display:** Internal data values stay as "On Hand Available" (in types, data, filters), while display labels show the shorter "On Hand"
