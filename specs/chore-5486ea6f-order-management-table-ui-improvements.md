# Chore: Order Management Table UI Improvements

## Metadata
adw_id: `5486ea6f`
prompt: `Improve Order Management table UI in src/components/order-management-hub.tsx: (1) Add title attribute/tooltip to Email column cells to show full email on hover, (2) Add horizontal scroll indicator (shadow or gradient) on table edges when content overflows, (3) Ensure SLA breach row backgrounds have sufficient contrast with text (minimum WCAG AA), (4) Prevent Store No values from word-wrapping - use white-space: nowrap or min-width, (5) Add visual grouping to Main Filters with subtle background or border-bottom separator before Advanced Filters toggle`

## Chore Description
This chore improves the usability and accessibility of the Order Management table by implementing five specific UI enhancements:

1. **Email Tooltip Enhancement**: The Email column currently shows truncated email addresses with `max-w-[180px] truncate` styling and a basic `title` attribute. This improvement ensures the tooltip functionality works properly for all email cells to show full email addresses on hover.

2. **Horizontal Scroll Indicators**: Add visual cues (shadows or gradients) at the left and right edges of the table when horizontal scrolling is available. This helps users understand when there's more content to view horizontally.

3. **SLA Breach Row Contrast**: Current SLA breach row backgrounds use colors like `bg-red-50`, `bg-orange-50`, and `bg-yellow-50` which may not meet WCAG AA contrast requirements (4.5:1 for normal text). This needs validation and potential adjustments to ensure text remains readable.

4. **Store No Column No-Wrap**: The Store No column at line 1761 currently allows text wrapping. This should be prevented to maintain consistent column width and readability using `whitespace-nowrap` class.

5. **Main Filters Visual Grouping**: Add subtle visual separation between the "Main Filters" section (lines 1875-2021) and the "Advanced Filters" collapsible section (lines 2023-2253) to improve UI hierarchy and clarity.

## Relevant Files
Use these files to complete the chore:

- **src/components/order-management-hub.tsx** (Primary file for all changes)
  - Line 1758: Email column cell with existing title attribute and truncate styling
  - Line 1665: Table container with `overflow-x-auto` for horizontal scrolling
  - Lines 1079-1089: `getUrgencyRowStyle()` function defining SLA breach row background colors
  - Line 1748: TableRow applying urgency styles
  - Line 1761: Store No column cell that needs nowrap styling
  - Lines 1875-2021: Main Filters section that needs visual grouping
  - Lines 2023-2253: Advanced Filters collapsible section

- **src/components/ui/table.tsx** (Reference for table component structure)
  - Table components used throughout the order management hub

### New Files
No new files need to be created. All changes will be made within the existing `order-management-hub.tsx` file.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Verify Email Tooltip Implementation
- Review current Email column implementation at line 1758
- Confirm that `title={order.customerEmail || ""}` attribute is properly rendering
- No changes needed if already working correctly (implementation appears complete)

### 2. Add Horizontal Scroll Indicators to Table Container
- Locate the table container div at line 1665 with `className="overflow-x-auto"`
- Add React state to track scroll position (useRef for table container, useState for scroll indicators)
- Implement scroll event listener to detect when:
  - Content is scrollable (scrollWidth > clientWidth)
  - User is at left edge (scrollLeft === 0)
  - User is at right edge (scrollLeft + clientWidth >= scrollWidth)
- Add CSS shadows or gradients to show scroll indicators:
  - Left shadow: `shadow-[inset_10px_0_8px_-8px_rgba(0,0,0,0.15)]` when not at left edge
  - Right shadow: `shadow-[inset_-10px_0_8px_-8px_rgba(0,0,0,0.15)]` when not at right edge
- Wrap table in a positioned container to apply conditional shadow classes

### 3. Improve SLA Breach Row Background Contrast
- Review `getUrgencyRowStyle()` function at lines 1079-1089
- Test current color combinations for WCAG AA compliance:
  - Critical: `bg-red-50` with default text color
  - Warning: `bg-orange-50` with default text color
  - Approaching: `bg-yellow-50` with default text color
- Adjust background colors if needed to meet 4.5:1 contrast ratio:
  - Consider using slightly darker backgrounds or ensuring text is sufficiently dark
  - Option 1: Darken backgrounds (e.g., `bg-red-100`, `bg-orange-100`, `bg-yellow-100`)
  - Option 2: Explicitly set darker text color for these rows
  - Option 3: Add subtle borders to improve visual distinction
- Update hover states to maintain contrast (currently `hover:bg-red-100`, etc.)

### 4. Prevent Store No Column Text Wrapping
- Locate Store No column cell at line 1761
- Add `whitespace-nowrap` class to the TableCell component
- Current: `<TableCell>{order.storeNo || "-"}</TableCell>`
- Updated: `<TableCell className="whitespace-nowrap">{order.storeNo || "-"}</TableCell>`
- Verify that min-width on header (line 1684: `min-w-[100px]`) is sufficient

### 5. Add Visual Grouping to Main Filters Section
- Locate Main Filters container at line 1876: `<div className="mt-3 space-y-2 bg-muted/30 rounded-lg p-4">`
- Add visual separator before Advanced Filters toggle button
- Options for implementation:
  - Option A: Add `border-b border-gray-200 pb-3 mb-3` to Main Filters container
  - Option B: Add top border to Advanced Filters Collapsible section
  - Option C: Add subtle background transition between sections
- Recommended: Add `border-b border-gray-200 pb-2` to the Main Filters container to create clear separation
- Ensure spacing between sections is consistent (currently using `mt-4` on Collapsible at line 2024)

### 6. Validate All Changes
- Run development server: `pnpm dev`
- Test Email column tooltip by hovering over truncated emails
- Test horizontal scroll indicators:
  - Resize browser to trigger horizontal scroll
  - Verify left shadow appears when scrolled right
  - Verify right shadow appears when scrollable content exists
  - Verify shadows disappear at edges
- Test SLA breach rows:
  - Verify critical/warning/approaching rows have readable text
  - Check contrast using browser DevTools or accessibility checker
  - Confirm hover states maintain readability
- Test Store No column:
  - Verify no text wrapping occurs with various store numbers
  - Check column alignment and spacing
- Test Main Filters visual grouping:
  - Verify clear visual separation from Advanced Filters
  - Check responsive behavior at different screen sizes

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm dev` - Start development server and manually test all UI improvements in browser
- `pnpm build` - Ensure production build compiles without TypeScript errors
- Browser DevTools: Use Lighthouse or axe DevTools to verify WCAG AA contrast compliance for SLA breach rows
- Manual Testing Checklist:
  - [ ] Email tooltips show full email address on hover
  - [ ] Horizontal scroll indicators appear and disappear correctly
  - [ ] SLA breach row text is readable with sufficient contrast
  - [ ] Store No column values do not wrap
  - [ ] Main Filters section has clear visual separation from Advanced Filters

## Notes

### Current Implementation Details
- Email column already has `title` attribute at line 1758, tooltip should work by default
- Table container uses Tailwind's `overflow-x-auto` which enables horizontal scrolling
- SLA urgency styling is centralized in `getUrgencyRowStyle()` function for easy modification
- Main Filters section uses `bg-muted/30` background with `rounded-lg` and `p-4` padding

### Accessibility Considerations
- WCAG AA requires 4.5:1 contrast ratio for normal text, 3:1 for large text
- Current SLA breach colors (red-50, orange-50, yellow-50) are very light and may need adjustment
- Ensure scroll indicators don't interfere with table content readability
- Tooltips should be accessible via keyboard navigation (native `title` attribute provides this)

### Performance Considerations
- Scroll event listener should be throttled or use requestAnimationFrame for optimal performance
- Consider using IntersectionObserver API as alternative to scroll events if performance issues arise
- Ensure state updates for scroll indicators don't cause unnecessary re-renders

### Design Consistency
- Follow existing Tailwind utility class patterns used throughout the component
- Maintain consistent spacing and color palette (deep-navy, steel-gray, light-gray, etc.)
- Ensure changes are responsive and work across mobile, tablet, and desktop breakpoints
