# Chore: Simplify Export Button and Remove Active Filters Display

## Metadata
adw_id: `5af95596`
prompt: `Make two UI changes to the Order Management Hub:

  1. **Change Export Button Text**:
     - Change the button text from 'Export Search Results' to just 'Export'
     - Keep all other button functionality (disabled state, icon, export logic) unchanged

  2. **Remove Active Filters Display Section**:
     - Remove the 'Active Filters' section that shows filter badges (e.g., 'Status: SUBMITTED ×')
     - Remove the 'Clear All Filters' link that appears in this section
     - Keep the 'Clear Filters' button in the Quick Filters section - do NOT remove that
     - The filter state variables and logic should remain unchanged - only remove the UI display of active filter badges`

## Chore Description
This is a simple UI cleanup task to make two non-functional changes to the Order Management Hub component:

1. **Simplify Export Button**: Change the export button text from the verbose "Export Search Results" to a concise "Export" while maintaining all existing functionality (icon, disabled states, export logic).

2. **Remove Active Filters Display**: Remove the blue "Active Filters" section that currently displays all active filter badges with individual remove buttons and a "Clear All Filters" link. This section appears below the filters but above the table (lines 1891-1922). The "Clear Filters" button in the Quick Filters toolbar will remain as the primary way to reset filters.

Both changes are purely cosmetic and do not affect any business logic, state management, or data filtering functionality.

## Relevant Files
Use these files to complete the chore:

- **src/components/order-management-hub.tsx** (lines 1-2012)
  - Line 1493: Export button text change from "Export Search Results" to "Export"
  - Lines 1891-1922: Active Filters display section to be removed entirely
  - Line 1619: "Clear Filters" button in Quick Filters section - KEEP this, do NOT remove

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Change Export Button Text
- Open `src/components/order-management-hub.tsx`
- Locate the export button around line 1493
- Change the button text from "Export Search Results" to "Export"
- Verify the icon (Download) and loading state text remain unchanged
- Verify disabled state logic remains unchanged

### 2. Remove Active Filters Display Section
- In the same file, locate the Active Filters section (lines 1891-1922)
- Remove the entire conditional block that renders the Active Filters summary
- This includes:
  - The outer div with blue background (`bg-blue-50 border border-blue-200`)
  - The header with "Active Filters ({count})" title
  - The "Clear All Filters" button in this section
  - The badge mapping that displays individual filter tags with X buttons
- Ensure the surrounding CardContent structure remains intact
- Verify the "Clear Filters" button in the Quick Filters section (line 1619) is NOT removed

### 3. Validate Changes
- Run `npm run dev` to start the development server
- Navigate to the Order Management Hub page
- Verify the export button now shows "Export" instead of "Export Search Results"
- Verify the Active Filters display section is completely removed
- Apply various filters and confirm:
  - Filters still work correctly (data is filtered properly)
  - The "Clear Filters" button in Quick Filters section still appears and works
  - No Active Filters badges appear below the filters
  - No visual regressions or layout issues
- Check console for any errors

## Validation Commands
Execute these commands to validate the chore is complete:

- `npm run dev` - Start development server and manually verify UI changes
- `npm run build` - Ensure TypeScript compilation succeeds with no errors
- Visual verification:
  - Export button displays "Export" (not "Export Search Results")
  - No Active Filters section appears when filters are applied
  - "Clear Filters" button in Quick Filters section still present and functional

## Notes
- This is a purely cosmetic change with zero functional impact
- All filter state logic (`generateActiveFilters`, `removeFilter`, `handleResetAllFilters`) remains unchanged
- The `generateActiveFilters` useMemo hook (lines 806-835) should remain as it may be used elsewhere or for future features
- The Quick Filters section's "Clear Filters" button provides the same functionality as the removed "Clear All Filters" link
