# Chore: Standardize Config Dropdown Labels

## Metadata
adw_id: `22872cdf`
prompt: `Standardize Config dropdown labels. In Inventory Management (app/inventory-new/page.tsx), change 'All Config' to 'All Stock Config', change 'Configured' to 'Config Valid', change 'Not Configured' to 'Config Invalid' to align with the menu name 'Stock Config'.`
status: `completed`
completed_date: `2026-01-17`

## Chore Description
Update the Config filter dropdown labels in the Inventory Management page to use more specific terminology that aligns with the "Stock Config" menu name. This change improves clarity and consistency across the UI by making it clear that the configuration relates to stock configuration status.

The changes will:
- Replace "All Configs" with "All Stock Config" for the default/all option
- Replace "Configured" with "Config Valid" for items with valid stock configuration
- Replace "Not Configured" with "Config Invalid" for items with invalid/missing stock configuration

## Relevant Files
Use these files to complete the chore:

- **app/inventory-new/page.tsx** (lines 636-646) - Contains the Config filter dropdown Select component with SelectItems that need label updates

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Config Filter Dropdown Labels
- Open `app/inventory-new/page.tsx`
- Locate the Config filter Select component (around lines 636-646)
- Update the SelectItem labels:
  - Change "All Configs" → "All Stock Config" (line 642)
  - Change "Configured" → "Config Valid" (line 643)
  - Change "Not Configured" → "Config Invalid" (line 644)
- Ensure the SelectValue placeholder remains as "All Configs" or update to "All Stock Config" if needed for consistency

### 2. Verify TypeScript Compilation
- Run TypeScript compiler to ensure no type errors were introduced
- Confirm the application builds successfully

### 3. Test the Changes
- Start the development server
- Navigate to the Inventory Management page
- Open the Config dropdown filter
- Verify all three labels display correctly:
  - "All Stock Config"
  - "Config Valid"
  - "Config Invalid"
- Confirm the dropdown functionality still works as expected

## Validation Commands
Execute these commands to validate the chore is complete:

- `grep -n "All Stock Config\|Config Valid\|Config Invalid" app/inventory-new/page.tsx` - Verify the new labels are present in the file
- `npm run build` - Ensure the application builds without errors
- `npm run dev` - Start development server and manually test the Config dropdown (Ctrl+C after verification)

## Notes
- This is a UI label-only change with no logic modifications
- The filter values ("all", "valid", "invalid") remain unchanged - only display labels are updated
- The change improves alignment with the "Stock Config" terminology used in the menu/header
- No database schema or API changes are required
