# Chore: Inventory Supply Page Layout, Spacing, Sizing, and Usability Fixes

## Metadata
adw_id: `fe57f697`
prompt: `Fix layout, spacing, sizing, and usability issues on the Inventory Supply page at app/inventory-new/supply/page.tsx`

## Chore Description
Fix multiple layout, spacing, sizing, and usability issues on the Inventory Supply page (`app/inventory-new/supply/page.tsx`):

1. **Text Sizing Issues:**
   - Subheading too small (14px), should be 16px for better readability
   - Table header text too small (12px), should be 14px all caps
   - Supply Type badges too small (12px), should be 13px

2. **Spacing Problems:**
   - Filter section cramped: Add 16px horizontal spacing between filters, 12px vertical padding
   - Table row height too large (~56px), reduce to 48px for better density
   - Table cells have insufficient padding (8px), add 12px horizontal/vertical padding

3. **Layout Issues:**
   - Filter inputs need consistent width (250px minimum)
   - Column widths need adjustment: STORE ID/ITEM ID to 200px, QUANTITY/AVAILABLE QTY to 120px, SUPPLY TYPE to 150px

4. **Visual Hierarchy:**
   - Improve contrast for Supply Type badges
   - Make 'No active filters' text more prominent
   - Better table footer separation

5. **Mobile Responsiveness:**
   - Ensure table has horizontal scroll for mobile
   - Responsive grid for filters (1 column on mobile, 2 on sm, 4 on lg)

## Relevant Files
Use these files to complete the chore:

### Primary File
- `/app/inventory-new/supply/page.tsx` - Main Inventory Supply page component requiring all layout, spacing, and sizing fixes

### Related UI Components (for reference, no changes needed)
- `/src/components/ui/card.tsx` - Card component structure
- `/src/components/ui/input.tsx` - Input component styling
- `/src/components/ui/select.tsx` - Select component styling
- `/src/components/ui/table.tsx` - Table component structure

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Fix Subheading Text Size
- Change subheading `text-sm` (14px) to `text-base` (16px) on line 104
- Update: `<p className="text-sm text-muted-foreground mt-1">` to `<p className="text-base text-muted-foreground mt-1">`

### 2. Fix Table Header Text Size
- Change table header `text-xs` (12px) to `text-sm` (14px) on lines 217, 220, 223, 226, 229
- Update all `TableHead` classes from `text-xs` to `text-sm`

### 3. Fix Supply Type Badge Text Size
- Change Supply Type badge `text-xs` (12px) to `text-[13px]` (13px) on line 284
- Update badge className from `text-xs` to `text-[13px]`

### 4. Improve Filter Section Spacing
- Change filter grid gap from `gap-4` (16px) to `gap-x-4 gap-y-3` for better vertical spacing on line 119
- Update: `<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">`

### 5. Add Vertical Padding to Filter Section
- Add `py-3` (12px vertical padding) to filter labels on lines 122, 139, 156, 173
- Update label className to include `py-3`: `<label className="text-sm font-medium leading-none py-3 ...">`

### 6. Reduce Table Row Height
- Add `h-12` (48px height) to `TableRow` components on line 262
- Update: `<TableRow key={item.id} className="hover:bg-muted/50 h-12">`

### 7. Increase Table Cell Padding
- Add `px-3 py-3` (12px horizontal/vertical padding) to all `TableCell` components on lines 263, 266, 269, 274, 283
- Update each `TableCell` className to include `px-3 py-3`

### 8. Set Consistent Filter Input Width
- Add `min-w-[250px]` to all input/select elements on lines 127, 144, 160, 177
- Update Input and SelectTrigger className to include `min-w-[250px]`

### 9. Adjust Column Widths
- Change Store ID column width from `w-[180px]` to `w-[200px]` on line 217
- Change Quantity column width from `w-[120px]` to remain consistent on line 223
- Change Available Qty column width from `w-[140px]` to `w-[120px]` on line 226
- Change Supply Type column width from `w-[150px]` to `w-[150px]` (already correct) on line 229

### 10. Improve Supply Type Badge Contrast
- Increase badge font weight from `font-semibold` to `font-bold` on line 284
- Adjust badge colors for better contrast (darker backgrounds)

### 11. Make 'No Active Filters' Text More Prominent
- Change filter status text from `text-xs` to `text-sm font-medium` on line 192
- Update: `<p className="text-sm font-medium text-muted-foreground">`

### 12. Improve Table Footer Separation
- Add `border-t-2` (thicker border) to footer on line 299
- Update: `<div className="flex items-center justify-between border-t-2 bg-muted/30 px-4 py-3">`

### 13. Verify Mobile Responsiveness
- Confirm table has horizontal scroll with existing `overflow-x-auto` on line 213
- Confirm filter grid uses responsive classes `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` on line 119

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm dev` - Start development server to visually inspect changes
- Navigate to `/inventory-new/supply` and verify:
  - Subheading is 16px (text-base)
  - Table headers are 14px (text-sm)
  - Supply Type badges are 13px
  - Filter spacing is improved with 16px horizontal, 12px vertical gaps
  - Table rows are 48px height with 12px cell padding
  - Filter inputs are 250px minimum width
  - Column widths match specifications (200px, 120px, 150px)
  - Supply Type badges have better contrast
  - 'No active filters' text is more prominent
  - Table footer has thicker border
  - Mobile responsive grid works correctly (1/2/4 columns)

## Notes
- All changes are in a single file (`app/inventory-new/supply/page.tsx`)
- Changes follow the existing design system using Tailwind CSS utility classes
- Mobile responsiveness is already implemented, just needs verification
- The horizontal scroll on the table container already exists via `overflow-x-auto`
