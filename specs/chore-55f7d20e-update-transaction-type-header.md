# Chore: Update Transaction Type Column Header

## Metadata
adw_id: `55f7d20e`
prompt: `In src/components/recent-transactions-table.tsx, update the table column header from 'Type' to 'Transaction Type' for clarity and consistency with inventory terminology standards. The 'Type' column displays transaction types (Stock In, Stock Out, Adjustment, Return) and should be distinguished from the 'Item Type' column used in the main inventory table. Also verify the column width accommodates the longer header text without breaking the layout. Update docs/inventory-terminology-standards.md to include this change in the transaction terminology section.`

## Chore Description
Update the column header label in the Recent Transactions table from "Type" to "Transaction Type" to provide clearer distinction from the "Item Type" column used in the main inventory table. This change improves terminology consistency and reduces potential user confusion between product item types (weight, pack, normal) and transaction types (Stock In, Stock Out, Adjustment, Return).

The change involves:
1. Updating the table header cell text from "Type" to "Transaction Type" in the component file
2. Verifying the column layout accommodates the longer header text without visual breaking
3. Documenting this terminology standard in the inventory terminology standards document

## Relevant Files
Use these files to complete the chore:

- **src/components/recent-transactions-table.tsx** (line 198) - Contains the table header that needs to be updated from "Type" to "Transaction Type"
- **docs/inventory-terminology-standards.md** (Section 1.2.1, lines 68-81) - Transaction Table terminology section that needs to be updated to reflect the new header label
- **app/inventory/page.tsx** (line 442) - Reference file showing "Item Type" column usage in the main inventory table, which justifies the need for clearer distinction

### New Files
No new files need to be created.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Table Header in Component File
- Open `src/components/recent-transactions-table.tsx`
- Locate line 198 containing `<TableHead>Type</TableHead>`
- Change the header text from "Type" to "Transaction Type"
- Save the file

### 2. Verify Layout and Visual Appearance
- Start the development server using `pnpm dev`
- Navigate to a page that displays the Recent Transactions table (inventory detail view or main inventory page)
- Visually inspect the table header row to ensure:
  - The "Transaction Type" header text is fully visible and not truncated
  - The column width adjusts appropriately to accommodate the longer header
  - No text wrapping or layout breaking occurs
  - The header aligns properly with the transaction type badges below it
- Test on different viewport sizes (mobile, tablet, desktop) to confirm responsive behavior
- Stop the development server (Ctrl+C)

### 3. Update Terminology Standards Documentation
- Open `docs/inventory-terminology-standards.md`
- Navigate to Section 1.2.1 "Transaction Table" (lines 68-81)
- Update the table entry for the "Type" column header:
  - Change "Type" to "Transaction Type" in the "Current Term" column (should be line 72 or nearby)
  - Update the "Notes" column to mention: "Distinguishes transaction operations from Item Type in main inventory table"
- Add a brief note in the "Transaction Table" section introduction explaining the distinction between "Transaction Type" (transaction operations) and "Item Type" (product classification)
- Save the file

### 4. Validate Changes
- Run `pnpm build` to ensure the code compiles without TypeScript errors
- Search for any remaining references to the old header label using: `grep -r "Type</TableHead>" src/components/`
- Verify the documentation update is accurate by reviewing the updated terminology table
- Confirm all three files have been modified correctly

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Test to ensure the code compiles without errors or warnings
- `grep -n "Transaction Type</TableHead>" src/components/recent-transactions-table.tsx` - Verify the header has been updated (should return a match)
- `grep -n "Type</TableHead>" src/components/recent-transactions-table.tsx` - Verify the old header label is removed (should return no matches)
- `grep -n "Transaction Type" docs/inventory-terminology-standards.md` - Verify documentation has been updated (should return matches)
- `pnpm dev` - Start development server and manually verify the UI displays correctly (stop with Ctrl+C after verification)

## Notes
- The change from "Type" to "Transaction Type" improves clarity by distinguishing transaction operations (Stock In, Stock Out, Adjustment, Return) from product item types (weight, pack_weight, pack, normal) used in the main inventory table
- The column already has appropriate width handling through responsive table design, but visual verification is important
- This change aligns with the inventory terminology standards that emphasize clear, unambiguous labels in the UI (see Section 4.3 Rule 1 in the terminology standards document)
- No breaking changes or API modifications are involved - this is purely a UI label update
