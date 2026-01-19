# Chore: Stock Card UI Improvements

## Metadata
adw_id: `4634cc92`
prompt: `Improve Stock Card UI at app/inventory-new/stores/page.tsx or app/inventory/stores/page.tsx: (1) Make View Type dropdown visually distinct with subtle background or different border color as it is the primary filter, (2) Increase search field min-width to 160px for better touch targets, (3) Condense empty state message to single line: 'Select a view type or search for a store to display data', (4) Align filter layout to match Inventory Availability page for consistency, (5) Add subtle hover effect to Clear All button for better affordance`

## Chore Description
This chore enhances the Stock Card page UI/UX by improving the visual hierarchy, touch targets, and layout consistency. The primary objective is to make the View Type dropdown more prominent as the main filter, improve mobile usability with larger touch targets, simplify the empty state messaging, ensure layout consistency with the Inventory Availability page, and enhance button affordance with hover effects.

## Relevant Files

### Files to Modify
- **app/inventory-new/stores/page.tsx** (Lines 410-512) - Primary Stock Card implementation
  - Contains View Type dropdown at line 413-428
  - Search fields at lines 430-450
  - Empty state at lines 598-613
  - Clear All button at lines 453-465

- **app/inventory/page.tsx** (Lines 625-691) - Inventory Availability page reference
  - Reference implementation for filter layout consistency
  - Shows the target layout pattern with search groups and visual dividers

### Reference Files
- **src/components/inventory/inventory-empty-state.tsx** - Empty state component
  - Used by Stock Card page for consistent empty state messaging

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Make View Type Dropdown Visually Distinct
- Add a subtle background color to the View Type Select component (line 413-428)
- Apply `bg-primary/5` or `bg-blue-50` background class
- Add `border-primary/30` or `border-blue-300` for distinct border color
- Ensure the styling emphasizes this as the primary filter option

### 2. Increase Search Field Min-Width for Better Touch Targets
- Update Store ID search field min-width from `w-[160px]` to `min-w-[160px]` (line 437)
- Update Store Name search field from `w-[180px]` to `min-w-[160px]` (line 448)
- This ensures consistent touch target sizing across both search fields
- Maintains mobile-first design principle with 44px minimum touch target

### 3. Condense Empty State Message to Single Line
- Update empty state message in InventoryEmptyState component call (lines 598-613)
- Change primary message to: `"Select a view type or search for a store to display data"`
- Remove or simplify the subtitle prop to avoid multi-line verbosity
- Keep the conditional logic for minimum character validation message separate

### 4. Align Filter Layout to Match Inventory Availability Page
- Restructure filter section (lines 410-512) to match app/inventory/page.tsx (lines 625-691)
- Create visual grouping with border, padding, and background color
- Add vertical divider between filter groups using `<div className="h-8 w-px bg-border" />`
- Group filters logically: View Type as standalone primary filter, then search fields grouped together
- Ensure consistent spacing with `gap-3` or `gap-4` between elements
- Apply `p-2 border border-border/40 rounded-md bg-muted/5` wrapper around search field group

### 5. Add Subtle Hover Effect to Clear All Button
- Add hover classes to Clear All button (lines 453-465)
- Apply `hover:bg-muted/80` or `hover:bg-accent` for background transition
- Add `transition-colors` class for smooth hover animation
- Consider changing variant from `ghost` to `outline` for better visibility
- Ensure hover effect is noticeable but not overwhelming

## Validation Commands
Execute these commands to validate the chore is complete:

- `npm run dev` - Start development server and verify page renders without errors
- `npm run build` - Test production build to ensure no TypeScript errors
- Visual validation checklist:
  1. Navigate to Stock Card page at `/inventory-new/stores` or `/inventory/stores`
  2. Verify View Type dropdown has distinct background/border color
  3. Confirm both search fields have min-width of 160px (use browser inspector)
  4. Check empty state shows single-line message when no filters active
  5. Verify filter layout matches Inventory Availability page structure
  6. Test Clear All button hover effect is visible and smooth
  7. Test on mobile viewport (375px width) to ensure touch targets are adequate

## Notes
- The chore applies to **app/inventory-new/stores/page.tsx** as the primary file (newer implementation)
- The older implementation at **app/inventory/stores/page.tsx** may need similar updates for consistency
- Focus on the inventory-new version first as indicated by the more comprehensive implementation
- Maintain existing functionality - only UI/UX improvements, no logic changes
- Ensure all changes follow the existing Tailwind CSS utility class patterns
- Test responsive behavior on mobile, tablet, and desktop viewports
