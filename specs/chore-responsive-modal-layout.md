# Chore: Fix Upload Stock Configuration Modal Responsive Layout

## Metadata
adw_id: `responsive-modal-layout`
prompt: `Fix Upload Stock Configuration modal responsive layout to support all viewport sizes (mobile 375px, tablet 768px, desktop 1440px+)`

## Chore Description
Fix the Upload Stock Configuration modal layout issues across all viewport sizes. Testing revealed multiple responsive layout problems:

**Mobile (375x667):**
1. Description text truncated without indication
2. Step indicator missing step label ("Review")
3. Filename cut off without proper truncation/ellipsis
4. Validation Summary "Invalid" column not visible (off-screen)
5. Footer buttons completely missing from viewport (no scrolling)

**Tablet (768x1024):**
1. Long filename overflows container boundary
2. "Proceed" button partially cut off at right edge

**Desktop (1440x900):**
1. Filename still slightly truncated (missing file extension)
2. "Proceed" button partially cut off

## Relevant Files
Use these files to complete the chore:

- `src/components/stock-config/file-upload-modal.tsx` - Main modal component with layout issues. Contains DialogContent, step indicator, file info display, validation summary, and footer buttons.
- `src/components/ui/dialog.tsx` - Base Dialog UI component with default styling. DialogContent has `max-w-lg` default, DialogFooter has flex layout.
- `src/components/stock-config/validation-results-table.tsx` - Related modal for validation details, may need similar fixes for consistency.
- `src/components/stock-config/post-processing-report.tsx` - Related modal for processing results, may need similar fixes for consistency.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Fix Modal Container and Max Height
- In `file-upload-modal.tsx`, update DialogContent className:
  - Change `sm:max-w-3xl max-w-[95vw]` to `sm:max-w-2xl max-w-[95vw] max-h-[90vh] flex flex-col`
  - Add proper overflow handling with `overflow-hidden`
- Wrap modal body content in a scrollable container with `flex-1 overflow-y-auto min-h-0`

### 2. Fix Filename Truncation
- In the file info section (line ~308-328), ensure filename is properly truncated:
  - The `<p>` for filename should have `truncate` class
  - Add `max-w-[calc(100%-3rem)]` to the text container div
  - Ensure the `title` attribute shows full filename on hover

### 3. Fix Step Indicator for Mobile
- Update step indicator (line ~226-232) to handle mobile:
  - Wrap step label in responsive container
  - Use `hidden sm:inline` for step label on very small screens OR
  - Keep full text but reduce font size on mobile with `text-xs sm:text-sm`

### 4. Fix Validation Summary Grid
- Update validation summary grid (line ~335-350):
  - Change grid from fixed columns to responsive: `grid-cols-2 sm:grid-cols-3`
  - Always show Invalid column but in a new row on mobile if needed
  - Reduce padding on mobile: `p-1.5 sm:p-2`

### 5. Fix Footer Buttons Layout
- Update DialogFooter section (line ~436-485):
  - Ensure footer doesn't overflow: `w-full` on container
  - Make buttons stack on mobile: `flex flex-col sm:flex-row`
  - Add `gap-2` for consistent spacing
  - Ensure all buttons are visible with proper wrapping
  - For Step 3 footer (line ~446-470): Change wrapper to `flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 w-full`

### 6. Add Proper Scrolling for Modal Content
- Wrap the main content area (`<div className="space-y-4 py-4">`) in a scrollable container:
  - Add `flex-1 overflow-y-auto min-h-0` to allow scrolling when content exceeds viewport
  - Keep footer fixed at bottom with proper spacing

### 7. Test and Verify All Viewports
- Test at mobile (375x667): All content visible, buttons accessible
- Test at tablet (768x1024): Proper truncation, all buttons visible
- Test at desktop (1440x900): Full content displayed properly

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm dev` - Start development server
- Open browser to http://localhost:3000/stock-config
- Click "Upload Config" button to open modal
- Upload a file with a long filename (e.g., `errors-only-PreOrder_endconfigarogatoSF_07112025_resync_CFM0103_test2_longname.csv`)
- Test at viewport widths: 375px, 768px, 1440px
- Verify:
  1. Filename truncates with ellipsis, shows full name on hover
  2. All footer buttons visible and clickable at all sizes
  3. Validation summary shows all columns (may wrap on mobile)
  4. Step indicator shows step name at all sizes
  5. Modal content scrolls if needed on small viewports
  6. No horizontal overflow or content cut off

## Notes
- The modal uses Radix UI Dialog primitives with custom styling
- DialogFooter has default `flex-col-reverse sm:flex-row` which causes issues with custom flex layouts
- Consider using `DialogFooter` className override or replacing with custom div
- Long filenames are common in enterprise use cases, truncation with tooltip is essential
- Test with actual CSV files from `/tmp/` directory used in previous testing
