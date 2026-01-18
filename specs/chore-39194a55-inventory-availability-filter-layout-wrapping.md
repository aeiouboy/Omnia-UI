# Chore: Fix Inventory Availability Filter Layout Wrapping Issue

## Metadata
adw_id: `39194a55`
prompt: `Fix Inventory Availability filter layout wrapping issue (app/inventory-new/supply/page.tsx): The filter groups are stacking vertically instead of being horizontally inline. Make these changes: 1) Keep Store and Product groups on the same row by using 'flex-nowrap' for the inner filter container instead of 'flex-wrap'. 2) Hide the vertical divider on small screens using 'hidden sm:block' class. 3) For dropdowns (Supply Type and View Type), move them outside the main filter groups and keep them inline using 'flex-shrink-0'. 4) Make the filter container scrollable horizontally on small screens by adding 'overflow-x-auto' to allow horizontal scrolling when space is limited. 5) Ensure Supply Type dropdown uses 'w-[160px]' fixed width instead of stretching. The expected layout on desktop should be: [Store group] | [Product group] [Supply Type ▼] [View Type ▼] [Clear All] all on one row or with minimal wrapping.`

## Chore Description
The Inventory Availability page filter section has a layout issue where the Store and Product filter groups are stacking vertically instead of remaining horizontally inline. This creates a poor user experience, especially on larger screens where there is ample horizontal space. The fix involves:

1. **Prevent wrapping** of the inner filter container by changing `flex-wrap` to `flex-nowrap`
2. **Responsive divider** - Hide the vertical divider between Store and Product groups on small screens
3. **Dropdown positioning** - Move Supply Type and View Type dropdowns outside the grouped filters with `flex-shrink-0` to prevent them from wrapping
4. **Horizontal scroll** - Add `overflow-x-auto` to allow horizontal scrolling on narrow viewports
5. **Fixed dropdown width** - Change Supply Type from `min-w-[160px]` to `w-[160px]` for consistent sizing

The expected desktop layout should be: `[Store group] | [Product group] [Supply Type ▼] [View Type ▼] [Clear All]` all on one row.

## Relevant Files
Use these files to complete the chore:

- **app/inventory-new/supply/page.tsx** - The main file containing the filter layout that needs to be fixed. Contains the filter bar JSX from lines 315-406.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Outer Filter Container
- Change line 316 from `<div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">` to add horizontal scroll support
- Add `overflow-x-auto` to enable horizontal scrolling on small screens

### 2. Update Inner Filter Container
- Change line 317 from `<div className="flex flex-wrap gap-3 items-center">` to `<div className="flex flex-nowrap gap-3 items-center">`
- This prevents the Store and Product groups from wrapping to new lines

### 3. Update Vertical Divider Visibility
- Change line 336 from `<div className="h-8 w-px bg-border" />` to `<div className="hidden sm:block h-8 w-px bg-border" />`
- This hides the divider on mobile where it would appear disconnected from the groups

### 4. Update Supply Type Dropdown Width
- Change line 357 from `<SelectTrigger className="min-w-[160px] h-9">` to `<SelectTrigger className="w-[160px] h-9 flex-shrink-0">`
- Use fixed width `w-[160px]` instead of minimum width to prevent stretching
- Add `flex-shrink-0` to prevent the dropdown from shrinking

### 5. Update View Type Dropdown
- Change line 369 from `<SelectTrigger className="w-[280px] h-9">` to `<SelectTrigger className="w-[280px] h-9 flex-shrink-0">`
- Add `flex-shrink-0` to prevent the dropdown from shrinking

### 6. Validate the Build
- Run `pnpm build` to ensure no TypeScript or compilation errors
- Visually verify the layout in a browser at various viewport sizes

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure the project builds without errors
- `pnpm dev` - Start dev server and manually verify the filter layout at localhost:3000/inventory-new/supply
- Verify desktop layout shows: `[Store group] | [Product group] [Supply Type ▼] [View Type ▼] [Clear All]` on one row
- Verify mobile/narrow viewport enables horizontal scroll instead of vertical stacking

## Notes
- The filter groups (Store and Product) use bordered containers with `border border-border/40 rounded-md bg-muted/5` styling
- Each group contains a label and two input fields
- The Clear All button and loading indicator remain in the right-aligned section
- The `flex-shrink-0` class ensures dropdowns maintain their size when container space is limited
