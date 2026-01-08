# Chore: Move Filters to Header in All Stock Configurations Section

## Metadata
adw_id: `a91e40d3`
prompt: `Move filters in All Stock Configurations section to match Upload History section layout on Stock Configuration page (app/stock-config/page.tsx). Requirements: 1) Move the filter row (Search input, Date Range From/To, Frequency dropdown, Supply Type tabs) into the header area next to the 'All Stock Configurations' title, similar to how Upload History has filters in its header row 2) Use flex layout with justify-between to put title on left and filters on right 3) The header should have: left side = 'All Stock Configurations' title + 'Showing X of Y configurations' subtitle, right side = all filter controls (Search, Date Range, Frequency, Supply Type tabs) 4) Remove the separate filter row that currently sits between header and table 5) Ensure filters are vertically centered with the title 6) On mobile, filters should wrap below the title 7) Match the exact styling pattern used in Upload History section header`

## Chore Description
This chore involves reorganizing the filter controls in the "All Stock Configurations" section to match the layout pattern used in the "Upload History" section. Currently, the filters (Search input, Date Range pickers, Frequency dropdown, and Supply Type tabs) are positioned in a separate row between the header and the table. The goal is to move these filters into the CardHeader alongside the title, creating a cleaner, more consistent layout.

The Upload History section already demonstrates the desired pattern (lines 827-957): it has a CardHeader with a flex layout using `justify-between` that places the title/description on the left and all filter controls on the right. This same pattern should be applied to the Stock Configurations section.

## Relevant Files
Use these files to complete the chore:

- **app/stock-config/page.tsx** (lines 643-823) - Main file to modify. Contains the Stock Configurations section with the Tabs component and filters that need to be reorganized. The reference implementation for the desired pattern exists in the Upload History section (lines 826-958).

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Review Current Structure
- Examine the current "All Stock Configurations" section structure (lines 643-823)
- Identify the filters row (lines 647-760) that needs to be moved
- Review the Upload History section header pattern (lines 827-957) as the reference implementation
- Note the flex layout pattern: `flex flex-col md:flex-row md:items-center md:justify-between gap-4`

### 2. Reorganize Stock Config Section Header
- Move the CardHeader (currently at lines 767-779) to wrap both title content and filters
- Apply the flex layout pattern from Upload History: outer div with `flex flex-col md:flex-row md:items-center md:justify-between gap-4`
- Left side: Keep the existing title div structure with CardTitle and CardDescription
- Right side: Move all filter controls (Search, Date Range, Frequency, Supply Type tabs) into a new div

### 3. Update Filter Controls Layout
- Extract the filter controls from the current separate row (lines 647-760)
- Place them in the right side of the CardHeader using the same structure as Upload History filters
- Maintain the inner flex layout: `flex flex-col sm:flex-row items-start sm:items-center gap-3`
- Ensure all filter components (Search, Date Range pickers, Frequency Select, TabsList) are preserved

### 4. Remove Obsolete Filter Row
- Remove the separate filter row div structure (lines 645-761) that currently exists outside CardContent
- Ensure the TabsContent component (line 763) follows immediately after the Tabs component
- Verify Supply Type tabs are now inside the CardHeader instead of in a separate row

### 5. Adjust Responsive Behavior
- Verify mobile responsiveness: filters should wrap below title on small screens
- Ensure the `flex-col md:flex-row` pattern allows vertical stacking on mobile
- Test that all filter controls remain functional and properly aligned

### 6. Validate Layout Consistency
- Compare the updated Stock Configurations header with Upload History header
- Ensure both sections use the same flex layout pattern and spacing (gap-4, gap-3)
- Verify CardTitle and CardDescription styling matches between sections
- Confirm filter controls are vertically centered with titles on desktop view

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm run dev` - Start development server and verify page loads without errors
- Visual inspection at http://localhost:3000/stock-config:
  - Confirm "All Stock Configurations" header has title on left, filters on right
  - Verify filters wrap below title on mobile view (< 768px width)
  - Check that both sections (Stock Configs and Upload History) have matching header layouts
  - Ensure all filter controls work correctly (search, date pickers, frequency, tabs)
- `pnpm run build` - Build for production and ensure no TypeScript/ESLint errors

## Notes
- The key pattern to replicate is from lines 827-957 (Upload History section)
- The flex layout structure uses `md:flex-row` breakpoint for desktop and `flex-col` for mobile
- All filter functionality should remain unchanged - only the visual layout is being reorganized
- The Supply Type tabs (TabsList) should move from the separate filter row into the CardHeader
- The outer Tabs component wrapper should remain, but its internal layout structure changes
