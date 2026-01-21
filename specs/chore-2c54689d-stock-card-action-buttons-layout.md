# Chore: Stock Card UI Fix - Action Buttons Layout Alignment

## Metadata
adw_id: `2c54689d`
prompt: `Stock Card UI Fix - Action buttons layout alignment in app/inventory-new/stores/page.tsx: BY PRODUCT VIEW FIX (around lines 1034-1069): Move action buttons (Refresh, Clear All, Export CSV) from separate row to be INLINE with Row 2 (Product filters row). BY STORE VIEW FIX (around lines 719-744): Ensure Clear All and Refresh buttons are on the SAME ROW as View Type and Store filters. Both views should have all filters and action buttons on their designated rows without wrapping to additional rows on desktop screens. Test at 1280px+ viewport width to ensure single-row layout.`

## Chore Description
Fix the action buttons layout alignment in the Stock Card page to ensure all filter elements and action buttons appear on the same row without wrapping on desktop screens. The By Product view should have all Row 2 elements (Product filters, Transaction Type, Notes, Refresh, Clear All, Export CSV) inline. The By Store view should have all elements (View Type, Store filters, Clear All, Refresh) inline.

## Current State Analysis

After reviewing `app/inventory-new/stores/page.tsx` (1329 lines), the current layout structure is:

### By Product View (lines 872-1066)
- **Row 1 (lines 877-970)**: Date Range filter + Store Search Group - using `flex flex-wrap items-center gap-1.5`
- **Row 2 (lines 972-1066)**: Product Search Group + Transaction Type + Notes + flex-1 spacer + Refresh + Clear All + Export CSV
- Current structure: All elements are in a single `div` with `flex flex-wrap items-center gap-1.5`

### By Store View (lines 626-744)
- **Single Row (lines 629-744)**: View Type + divider + Store Search Group + flex-1 spacer + Clear All + Refresh
- Current structure: All elements are in a single `div` with `flex flex-wrap items-center gap-4`

## Relevant Files
Use these files to complete the chore:

- **app/inventory-new/stores/page.tsx** - Main Stock Card page containing both By Store and By Product views. Contains all filter and action button layouts that need alignment fixes.

### Potential Layout Issues
1. **By Store View**: Uses `gap-4` which may cause wrapping at narrower widths
2. **By Product View Row 2**: May wrap if total element width exceeds container
3. Input field widths may need adjustment to prevent overflow

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Analyze Current Layout Widths
- Calculate total width of By Store view row: View Type (280px) + divider (1px) + Store group (~300px) + buttons (~200px)
- Calculate total width of By Product view Row 2: Product group (~300px) + Transaction Type (140px) + Notes (200px) + buttons (~300px)
- Identify if any element widths need reduction to fit 1280px viewport

### 2. Optimize By Store View Layout (lines 629-744)
- Verify `flex-1` spacer is present between Store Search Group and buttons (line 720)
- Confirm Clear All and Refresh buttons are direct children of the flex container
- Ensure no extra wrapper divs around buttons that could cause layout issues
- If wrapping occurs, consider:
  - Reducing `gap-4` to `gap-2` or `gap-3`
  - Adding `flex-nowrap` to prevent wrapping on desktop
  - Using responsive `lg:flex-nowrap` to allow wrapping only on mobile

### 3. Optimize By Product View Row 2 Layout (lines 972-1066)
- Verify `flex-1` spacer is present between Notes and action buttons (line 1031-1032)
- Confirm Refresh, Clear All, and Export CSV buttons are direct children of the flex container
- Ensure no extra wrapper divs around buttons
- Current button order should be: Refresh → Clear All → Export CSV
- If wrapping occurs, consider:
  - Reducing Notes field width from 200px to 180px
  - Adding `lg:flex-nowrap` class
  - Reducing gap from `gap-1.5` if needed

### 4. Apply flex-nowrap for Desktop
- Add `lg:flex-nowrap` or `xl:flex-nowrap` to both filter rows to prevent wrapping on desktop while allowing mobile responsiveness
- By Store view: line 629 - add to existing flex classes
- By Product view Row 2: line 973 - add to existing flex classes

### 5. Test and Validate Layout
- Run development server with `pnpm dev`
- Test By Store view at 1280px+ viewport
- Test By Product view at 1280px+ viewport
- Verify no wrapping occurs on either view
- Ensure buttons remain accessible on mobile (wrapping is acceptable on mobile)

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Verify no TypeScript compilation errors
- `pnpm dev` - Start development server and manually test at viewport widths:
  - 1280px (xl breakpoint) - no wrapping expected
  - 1024px (lg breakpoint) - minimal wrapping acceptable
  - 768px (md breakpoint) - mobile layout kicks in

### Visual Validation Checklist
1. **By Store View at 1280px+**:
   - [ ] View Type dropdown visible inline
   - [ ] Vertical divider visible
   - [ ] Store ID and Store Name inputs visible inline
   - [ ] Clear All button visible inline (right side)
   - [ ] Refresh button visible inline (right side)
   - [ ] No row wrapping

2. **By Product View Row 2 at 1280px+**:
   - [ ] Product ID and Product Name inputs visible inline
   - [ ] Transaction Type dropdown visible inline
   - [ ] Notes input visible inline
   - [ ] Refresh button visible inline (right side)
   - [ ] Clear All button visible inline (right side)
   - [ ] Export CSV button visible inline (right side)
   - [ ] No row wrapping

## Notes

### Expected Final Structure

**By Store View:**
```jsx
<div className="flex flex-wrap lg:flex-nowrap items-center gap-3">
  {/* View Type Dropdown */}
  {/* Vertical Divider */}
  {/* Store Search Group */}
  <div className="flex-1" />
  {/* Clear All Button */}
  {/* Refresh Button */}
</div>
```

**By Product View Row 2:**
```jsx
<div className="flex flex-wrap lg:flex-nowrap items-center gap-1.5">
  {/* Product Search Group */}
  {/* Transaction Type Filter */}
  {/* Notes Search */}
  <div className="flex-1" />
  {/* Refresh Button */}
  {/* Clear All Button */}
  {/* Export CSV Button */}
</div>
```

### Width Considerations
- Total available width at 1280px: ~1200px (accounting for sidebar/padding)
- By Store: 280px + 8px + 1px + 8px + 300px + flex + 100px + 100px ≈ 800px (fits)
- By Product Row 2: 300px + 140px + 200px + flex + 100px + 100px + 100px ≈ 940px (fits with margin)

If elements still wrap, the issue may be in the filter group internal padding/margins. Inspect with browser dev tools to identify the exact cause.
