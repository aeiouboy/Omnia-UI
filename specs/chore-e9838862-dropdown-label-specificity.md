# Chore: Make 'All' dropdown option labels more specific

## Metadata
adw_id: `e9838862`
prompt: `Make 'All' dropdown option labels more specific. In Inventory Availability (app/inventory-new/supply/page.tsx), change 'All Types' to 'All Supply Types' and 'All Views' to 'All View Types'. In Inventory Management (app/inventory-new/page.tsx), change 'All Config' to 'All Configs'. In Recent Transactions (src/components/recent-transactions-table.tsx), change 'All Types' to 'All Transaction Types'.`

## Chore Description
This chore improves the clarity and specificity of dropdown filter labels across three inventory-related components. Currently, generic labels like "All Types", "All Views", and "All Config" are used, which can be ambiguous when users see multiple filters on the same page. By making these labels more specific (e.g., "All Supply Types", "All View Types", "All Configs", "All Transaction Types"), users will have better context about what each filter controls.

The changes affect:
1. **Inventory Availability page** (supply page) - Two dropdowns need label updates
2. **Inventory Management page** - One dropdown needs label update
3. **Recent Transactions component** - One dropdown needs label update

## Relevant Files

- **app/inventory-new/supply/page.tsx** (lines 370, 382)
  - Line 370: Supply Type Select dropdown - Change "All Types" to "All Supply Types"
  - Line 382: View Type Select dropdown - Change "All Views" to "All View Types"

- **app/inventory-new/page.tsx** (line 642)
  - Line 642: Config Filter Select dropdown - Change "All Config" to "All Configs"

- **src/components/recent-transactions-table.tsx** (line 252)
  - Line 252: Transaction Type Filter Select dropdown - Change "All Types" to "All Transaction Types"

## Step by Step Tasks

### 1. Update Inventory Availability Supply Type dropdown
- Open `app/inventory-new/supply/page.tsx`
- Locate the Supply Type Select component around line 365-374
- Change the SelectItem value="all" label from "All Types" to "All Supply Types"

### 2. Update Inventory Availability View Type dropdown
- In the same file `app/inventory-new/supply/page.tsx`
- Locate the View Type Select component around line 377-392
- Change the SelectItem value="all" label from "All Views" to "All View Types"

### 3. Update Inventory Management Config Filter dropdown
- Open `app/inventory-new/page.tsx`
- Locate the Config Filter Select component around line 637-646
- Change the SelectItem value="all" label from "All Config" to "All Configs"

### 4. Update Recent Transactions Type Filter dropdown
- Open `src/components/recent-transactions-table.tsx`
- Locate the Transaction Type Filter Select component around line 247-258
- Change the SelectItem value="all" label from "All Types" to "All Transaction Types"

### 5. Validate changes
- Run the development server to ensure no TypeScript errors
- Visually inspect each affected dropdown to confirm the label changes
- Verify that the functionality remains unchanged (only labels updated, not values or logic)

## Validation Commands

Execute these commands to validate the chore is complete:

- `pnpm dev` - Start development server and verify no compilation errors
- Manually test each dropdown:
  - Navigate to `/inventory-new/supply` and check both "All Supply Types" and "All View Types" labels
  - Navigate to `/inventory-new` and check "All Configs" label
  - Navigate to any page with Recent Transactions component and check "All Transaction Types" label
- `git diff app/inventory-new/supply/page.tsx app/inventory-new/page.tsx src/components/recent-transactions-table.tsx` - Verify only 4 label changes were made

## Notes

This is a simple wording improvement that enhances UX clarity without changing any functionality. The changes are purely cosmetic and affect only the display labels in Select dropdowns. The underlying filter logic and values remain unchanged.
