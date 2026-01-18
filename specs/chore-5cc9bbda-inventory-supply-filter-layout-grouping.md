# Chore: Inventory Supply Page Filter Layout Grouping

## Metadata
adw_id: `5cc9bbda`
prompt: `Fix layout filtering on Inventory Availability page (app/inventory-new/supply/page.tsx): Add visual grouping for search fields to match the main Inventory page pattern. Group Store ID and Store Name inputs together in a bordered container with 'Store' label. Group Product ID and Product Name inputs together in a bordered container with 'Product' label. Add a vertical divider between the two groups. Use the same styling as app/inventory/page.tsx lines 626-661: 'flex items-center gap-2 p-2 border border-border/40 rounded-md bg-muted/5' with 'text-xs font-medium text-muted-foreground whitespace-nowrap' for group labels. Add 'h-8 w-px bg-border' vertical divider between Store and Product groups. Keep Supply Type and View Type dropdowns after the Product group, and Clear All button at the end.`

## Chore Description
Update the Inventory Supply page (`app/inventory-new/supply/page.tsx`) filter section to match the visual grouping pattern used in the main Inventory page (`app/inventory/page.tsx`). Currently, the four search inputs (Store ID, Store Name, Product ID, Product Name) are displayed as individual flat inputs without visual grouping. This chore adds:

1. A bordered container around Store ID and Store Name inputs with a "Store" label
2. A bordered container around Product ID and Product Name inputs with a "Product" label
3. A vertical divider between the Store and Product groups
4. Consistent styling matching the main Inventory page pattern

This creates visual hierarchy and improves user understanding of related filter fields.

## Relevant Files
Use these files to complete the chore:

- **app/inventory-new/supply/page.tsx** - The target file to modify. Contains the filter bar layout at lines 315-413 that needs to be updated with grouped containers.

- **app/inventory/page.tsx** (lines 626-661) - Reference implementation showing the exact styling pattern to follow:
  - Store group: `flex items-center gap-2 p-2 border border-border/40 rounded-md bg-muted/5`
  - Label: `text-xs font-medium text-muted-foreground whitespace-nowrap`
  - Vertical divider: `h-8 w-px bg-border`

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Filter Bar Container Structure
- In `app/inventory-new/supply/page.tsx`, locate the filter bar section starting at line 316
- Replace the current flat `flex flex-wrap gap-3 items-center` container with the new grouped structure

### 2. Create Store Search Group Container
- Wrap Store ID and Store Name inputs (lines 318-338) in a bordered container
- Add container with classes: `flex items-center gap-2 p-2 border border-border/40 rounded-md bg-muted/5`
- Add label span before inputs: `<span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Store</span>`
- Remove the Search icon from individual inputs (the group label replaces the visual indicator)
- Update input classes to: `min-w-[160px] h-9 text-sm placeholder:transition-opacity placeholder:duration-200 focus:placeholder:opacity-0`

### 3. Add Vertical Divider
- After the Store group container, add: `<div className="h-8 w-px bg-border" />`

### 4. Create Product Search Group Container
- Wrap Product ID and Product Name inputs (lines 340-360) in a bordered container
- Add container with classes: `flex items-center gap-2 p-2 border border-border/40 rounded-md bg-muted/5`
- Add label span before inputs: `<span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Product</span>`
- Remove the Search icon from individual inputs (the group label replaces the visual indicator)
- Update input classes to: `min-w-[160px] h-9 text-sm placeholder:transition-opacity placeholder:duration-200 focus:placeholder:opacity-0`

### 5. Maintain Dropdown Filters Position
- Keep Supply Type dropdown (lines 362-372) after the Product group
- Keep View Type dropdown (lines 374-390) after Supply Type
- These remain as standalone filters, not grouped

### 6. Keep Clear All and Loading Indicator Position
- Maintain the right-aligned section with filter loading indicator and Clear All button
- No changes needed to this section (lines 393-412)

### 7. Validate the Implementation
- Run development server and verify visual appearance
- Confirm Store group shows: label + Store ID input + Store Name input in bordered container
- Confirm vertical divider appears between groups
- Confirm Product group shows: label + Product ID input + Product Name input in bordered container
- Confirm Supply Type and View Type dropdowns appear after Product group
- Confirm Clear All button remains at the end

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure no TypeScript/ESLint errors in the build
- `pnpm dev` - Start development server to visually verify the filter layout
- Navigate to `/inventory-new/supply` and verify:
  - Store group container is visible with "Store" label and bordered styling
  - Product group container is visible with "Product" label and bordered styling
  - Vertical divider separates the two groups
  - Supply Type and View Type dropdowns appear after the Product group
  - Clear All button appears at the end
  - Filter functionality remains unchanged (typing in fields still filters data)

## Notes
- The Search icons are removed from individual inputs because the group labels provide sufficient visual context
- The grouped pattern improves visual hierarchy and helps users understand which fields are related
- Placeholder text in inputs provides specific guidance (e.g., "Search Store ID..." vs "Search Store Name...")
- The responsive behavior (`flex-wrap`) should still work correctly with the new grouped structure
- This matches the exact pattern used in `app/inventory/page.tsx` for consistency across the application
