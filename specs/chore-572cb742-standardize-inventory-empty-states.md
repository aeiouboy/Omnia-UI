# Chore: Standardize Empty State Designs Across Inventory Pages

## Metadata
adw_id: `572cb742`
prompt: `Standardize empty state designs across Inventory Availability and Stock Card pages: 1. Use consistent icon size and style for empty state illustrations 2. Ensure empty state messages use same typography (font size, weight, color) 3. Add consistent vertical centering for empty state content 4. Consider adding a subtle background color or border to the empty state container`

## Chore Description
Standardize the empty state designs across the Inventory Availability and Stock Card pages to ensure visual consistency. Currently, both pages use the shared `InventoryEmptyState` component for the "please search/select" states, but have different inline empty states for "no results found" scenarios within their tables. This chore will:

1. Ensure the shared `InventoryEmptyState` component has consistent, well-defined styling
2. Update inline "no results" empty states in both pages to match the shared component's design language
3. Add a subtle background color to the empty state container for better visual distinction
4. Standardize icon sizes to h-12 w-12 (medium size, between current h-6 and h-16)
5. Ensure consistent typography: text-base font-medium for primary message, text-sm for subtitle

## Relevant Files
Use these files to complete the chore:

- **src/components/inventory/inventory-empty-state.tsx** - The shared empty state component used by both pages. Will be updated to have improved styling with subtle background color.

- **app/inventory-new/supply/page.tsx** - Inventory Availability page. Contains inline "no results" empty state (lines 489-504) that needs to be updated to use consistent styling.

- **app/inventory-new/stores/page.tsx** - Stock Card page. Contains inline "no stores found" message (lines 694-699) that needs enhanced styling to match the shared component.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update the Shared InventoryEmptyState Component
- Open `src/components/inventory/inventory-empty-state.tsx`
- Update icon size from `h-16 w-16` to `h-12 w-12` for better proportion
- Add subtle background color using `bg-muted/50` to the icon container
- Wrap icon in a rounded container: `<div className="rounded-full bg-muted/50 p-4 mb-4">`
- Update primary message typography from `text-lg` to `text-base` for consistency
- Ensure vertical centering with `min-h-[200px]` for consistent height
- Add subtle border styling enhancement: change `border-dashed` to `border-dashed border-muted-foreground/20`

### 2. Update Inventory Availability Page Inline Empty State
- Open `app/inventory-new/supply/page.tsx`
- Locate the inline "no results" empty state (around lines 489-504)
- Update icon size from `h-6 w-6` to `h-12 w-12`
- Update container padding from `p-3` to `p-4`
- Change primary message from `text-sm font-medium` to `text-base font-medium text-muted-foreground`
- Change subtitle from `text-xs text-muted-foreground` to `text-sm text-muted-foreground/70`
- Update cell height from `h-64` to `h-[200px]` to match shared component

### 3. Update Stock Card Page Inline Empty State
- Open `app/inventory-new/stores/page.tsx`
- Locate the inline "no stores found" message (around lines 694-699)
- Enhance from simple text to full empty state design:
  - Add icon container: `<div className="rounded-full bg-muted/50 p-4"><Search className="h-12 w-12 text-muted-foreground/50" /></div>`
  - Update text styling to match: `text-base font-medium text-muted-foreground`
  - Add subtitle: `text-sm text-muted-foreground/70 mt-2`
  - Update padding from `py-12` to `h-[200px]` with flex centering
- Import the Search icon from lucide-react if not already imported

### 4. Validate the Changes
- Run `pnpm build` to ensure no TypeScript errors
- Verify both pages display consistent empty states
- Check that both the "search required" state and "no results" state look visually similar

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Verify no build errors after changes
- `pnpm lint` - Ensure no linting issues

## Notes
- The shared `InventoryEmptyState` component is used for the initial "please search/select" state on both pages
- The inline empty states within the tables are for "no results found" after a search is performed
- Both types of empty states should use consistent design language (icons, colors, typography) but can have slightly different messages
- The Package icon is used in the shared component, while Search icon is more appropriate for "no results" states
- Height of 200px provides adequate vertical space without being excessive
