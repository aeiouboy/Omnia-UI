# Chore: Stock Configuration Filter Layout Wrap Fix

## Metadata
adw_id: `eb35ec82`
prompt: `Fix Stock Configuration page filter layout to wrap instead of scroll (app/stock-config/page.tsx): The current horizontal scroll behavior is bad UX. Change the filter layout to wrap to multiple rows instead. In the 'All Stock Configurations' section (around lines 762-925): 1) Change outer container from 'overflow-x-auto' to remove it entirely. 2) Change inner wrapper from 'flex-nowrap' to 'flex-wrap' to allow filters to wrap naturally. 3) Keep the vertical divider but add 'hidden lg:block' to only show it on large screens where everything fits on one row. 4) Apply same changes to Upload History section (around lines 985-1100): remove overflow-x-auto and change flex-nowrap to flex-wrap. The expected desktop layout should show all filters on one row, while tablet/mobile gracefully wraps filters to additional rows without horizontal scrolling.`

## Chore Description
The Stock Configuration page currently uses horizontal scrolling for filter sections, which provides poor user experience especially on tablet and mobile devices. Users must scroll horizontally to access all filters, which is unintuitive. This chore updates both the "All Stock Configurations" section and the "Upload History" section filter layouts to use flex-wrap instead of horizontal scrolling. On large screens (lg+), filters will display on a single row. On smaller screens, filters will gracefully wrap to multiple rows without requiring horizontal scrolling.

## Relevant Files
Use these files to complete the chore:

- **app/stock-config/page.tsx** - Main file containing the Stock Configuration page with both filter sections that need modification. Lines 762-925 contain the "All Stock Configurations" filter section, and lines 985-1106 contain the "Upload History" filter section.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update "All Stock Configurations" Filter Container (Lines 762-763)
- Locate the outer container div at line 762: `<div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between overflow-x-auto">`
- Remove `overflow-x-auto` from the className
- The new className should be: `"flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between"`

### 2. Update "All Stock Configurations" Inner Wrapper (Line 763)
- Locate the inner wrapper div at line 763: `<div className="flex flex-nowrap gap-3 items-center">`
- Change `flex-nowrap` to `flex-wrap`
- The new className should be: `"flex flex-wrap gap-3 items-center"`

### 3. Update "All Stock Configurations" Vertical Divider (Line 819)
- Locate the vertical divider at line 819: `<div className="hidden sm:block h-8 w-px bg-border" />`
- Add `lg:block` and change visibility to only show on large screens
- The new className should be: `"hidden lg:block h-8 w-px bg-border"`

### 4. Update "Upload History" Filter Container (Line 987)
- Locate the outer container div at line 987: `<div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between overflow-x-auto">`
- Remove `overflow-x-auto` from the className
- The new className should be: `"flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between"`

### 5. Update "Upload History" Inner Wrapper (Line 988)
- Locate the inner wrapper div at line 988: `<div className="flex flex-nowrap gap-3 items-center">`
- Change `flex-nowrap` to `flex-wrap`
- The new className should be: `"flex flex-wrap gap-3 items-center"`

### 6. Validate TypeScript Compilation
- Run `pnpm build` to ensure no TypeScript errors
- Verify the build completes successfully

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Verify TypeScript compilation and production build succeeds
- `pnpm dev` - Start development server and manually verify:
  - Navigate to `/stock-config` page
  - Resize browser window to tablet width (~768px) - filters should wrap to multiple rows
  - Resize browser window to mobile width (~375px) - filters should wrap further
  - Resize browser window to desktop width (1280px+) - filters should display on single row
  - Verify no horizontal scrollbar appears at any viewport width
  - Verify vertical divider only appears on large screens (1024px+)

## Notes
- The vertical divider is a visual separator between filter groups. On smaller screens where filters wrap, the divider would look out of place floating in the middle, so it's hidden.
- This pattern matches the Inventory Availability page filter layout approach (see chore-39194a55)
- Both sections (Stock Configurations and Upload History) should have consistent behavior
