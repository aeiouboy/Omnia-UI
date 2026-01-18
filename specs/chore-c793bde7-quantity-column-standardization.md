# Chore: Standardize Quantity Column Names Across Inventory Pages

## Metadata
adw_id: `c793bde7`
prompt: `Standardize quantity column names across inventory pages. In Inventory Availability (app/inventory-new/supply/page.tsx), rename 'Quantity' to 'Total Qty' and keep 'Available Qty'. In Inventory Management (app/inventory-new/page.tsx), rename 'Stock Available / Total' to 'Available / Total' for cleaner display.`

## Chore Description
This chore standardizes the quantity-related column names across the two main inventory pages for consistent terminology and cleaner UI presentation. The changes will:

1. **Inventory Availability page** (app/inventory-new/supply/page.tsx):
   - Rename the 'Quantity' column header to 'Total Qty'
   - Keep 'Available Qty' as is (already correctly named)

2. **Inventory Management page** (app/inventory-new/page.tsx):
   - Rename the 'Stock Available / Total' column header to 'Available / Total'

These changes improve UI consistency by using shorter, cleaner labels while maintaining clear meaning for users.

## Relevant Files

- **app/inventory-new/supply/page.tsx** (line 466): Update 'Quantity' column header to 'Total Qty' in the TableHeader section
- **app/inventory-new/page.tsx** (line 720): Update 'Stock Available / Total' column header to 'Available / Total' in the TableHeader section

Both files are React client components using Next.js 15 App Router with TypeScript. No type definitions or data structure changes are needed - only UI labels.

## Step by Step Tasks

### 1. Update Inventory Availability Page Column Header
- Open file `app/inventory-new/supply/page.tsx`
- Locate the TableHead component for the 'Quantity' column (currently at line 466)
- Change the text content from 'Quantity' to 'Total Qty'
- Verify the adjacent 'Available Qty' column header remains unchanged

### 2. Update Inventory Management Page Column Header
- Open file `app/inventory-new/page.tsx`
- Locate the TableHead component for the 'Stock Available / Total' column (currently at line 720)
- Change the text content from 'Stock Available / Total' to 'Available / Total'
- Verify this is the only text change needed (no state variable or function updates required)

### 3. Validate Changes
- Run the development server to verify the changes
- Navigate to both inventory pages and confirm column headers display correctly
- Check that sorting functionality still works correctly on both columns
- Verify no TypeScript compilation errors are introduced

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm dev` - Start development server and manually verify both pages at:
  - http://localhost:3000/inventory-new/supply (Inventory Availability page)
  - http://localhost:3000/inventory-new (Inventory Management page)
- `pnpm build` - Ensure TypeScript compilation succeeds with no errors
- `git diff app/inventory-new/supply/page.tsx app/inventory-new/page.tsx` - Review exact changes made to both files

## Notes
- This is a UI-only change with no impact on data structures, types, or business logic
- The changes align with cleaner, more concise column naming conventions
- Both columns retain their sorting functionality without modification
- No translation/i18n considerations needed as the application uses English labels throughout
