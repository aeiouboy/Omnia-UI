# Chore: Improve Navigation Sidebar Spacing

## Metadata
adw_id: `f207b92d`
prompt: `Improve navigation sidebar spacing at src/components/side-nav.tsx:
1. Add more visual separation between active menu section (Inventory Management) and disabled items
2. Consider adding a subtle divider line before disabled menu items
3. Ensure disabled menu items have consistent opacity/styling
4. Add indentation consistency for submenu items (Inventory Availability, Stock Card, Stock Config)`

## Chore Description
This chore improves the visual hierarchy and spacing in the navigation sidebar component. The current implementation has several UX issues:

1. **Lack of visual separation**: The active menu section (Inventory Management with its submenu) transitions directly into disabled menu items without clear visual boundary, making it harder for users to distinguish between active and inactive navigation areas.

2. **Missing divider**: There is no visual separator between the enabled navigation items and the disabled items section, which could help users understand that certain features are not yet available.

3. **Inconsistent disabled styling**: Disabled items currently use `opacity-50` and `text-gray-400`, but this should be reviewed for consistency across all disabled items.

4. **Submenu indentation**: The submenu items (Inventory Availability, Stock Card, Stock Config) use `ml-4 pl-3 border-l` for the container, but individual item indentation via `marginLeft` style may need adjustment for better visual hierarchy.

## Relevant Files
Use these files to complete the chore:

- **src/components/side-nav.tsx** - Main navigation component containing all nav items, submenu rendering logic, and styling. This is the primary file to modify for all spacing and visual improvements.

- **src/contexts/sidebar-context.tsx** - Context provider for sidebar state (collapsed/expanded, mobile open/close). Reference only - no changes needed.

- **src/lib/utils.ts** - Contains the `cn()` utility for Tailwind class merging. Will be used for conditional styling.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Add Visual Divider Before Disabled Items
- Identify where disabled items start in the `navItems` array (currently after "Inventory Management")
- Modify the `renderNavItem` function or the nav element to detect when a disabled item is being rendered after enabled items
- Add a divider element (using Tailwind classes like `border-t border-gray-200` or a custom separator component) before the first disabled item
- Ensure the divider only renders once, not before each disabled item
- The divider should have appropriate margin (e.g., `my-3`) to create visual breathing room

### 2. Improve Disabled Items Styling Consistency
- Review current disabled item styling: `opacity-50 text-gray-400 cursor-not-allowed`
- Standardize disabled styling to use `opacity-40` for slightly more muted appearance
- Add `text-gray-500` for better color consistency
- Ensure disabled icon colors match the text (`text-gray-400` on the icon)
- Remove any inconsistent styling between desktop and mobile disabled items

### 3. Enhance Submenu Indentation and Spacing
- Review current submenu container styling: `ml-4 pl-3 border-l text-sm`
- Adjust border color to be more subtle: `border-gray-200` instead of default
- Verify individual submenu item margin calculation: `marginLeft: ${level * 12}px`
- Consider using consistent Tailwind classes instead of inline styles where possible
- Ensure submenu items have consistent padding and alignment with parent items

### 4. Add Section Spacing for Active Menu Area
- Add `mb-2` or similar margin-bottom to the "Inventory Management" section to create separation
- Alternatively, add `mt-2` padding before the divider element
- Ensure spacing looks balanced in both collapsed and expanded sidebar states

### 5. Validate Visual Hierarchy
- Test the sidebar in expanded state to verify:
  - Clear separation between active and disabled sections
  - Divider is visible and appropriately styled
  - Submenu items are properly indented and aligned
  - Disabled items have consistent, muted appearance
- Test in collapsed state to ensure no visual regressions
- Test on mobile view to ensure changes work correctly

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure TypeScript compilation succeeds with no errors
- `pnpm dev` - Start development server and visually inspect the sidebar at http://localhost:3000
- Visual inspection checklist:
  1. Verify divider line appears between "Inventory Management" and "Dashboard"
  2. Confirm disabled items have consistent muted styling
  3. Check submenu items (Inventory Availability, Stock Card, Stock Config) have proper indentation
  4. Test sidebar collapse/expand to ensure no visual regressions
  5. Test mobile view sidebar appearance

## Notes
- The navItems array structure shows that items with `disabled: true` start at index 3 (Dashboard, Inventory, ATC Config, Escalations, Style Guide)
- The sidebar has two render modes: mobile (overlay) and desktop (fixed sidebar)
- Both modes share the `renderNavItem` function, so changes will apply to both
- The sidebar supports collapsed state on desktop, where only icons are shown
- Current submenu border-l creates a visual connection line which should be preserved but made more subtle
