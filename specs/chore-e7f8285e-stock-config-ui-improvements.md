# Chore: Stock Config UI Improvements

## Metadata
adw_id: `e7f8285e`
prompt: `Improve Stock Config UI at app/stock-config/page.tsx: (1) Increase filter input widths to show full placeholder text (Filter by Location ID, Filter by Item ID) - use min-width: 160px, (2) Add hover effect to Upload Status card to indicate clickability, (3) Enhance tab selected state with thicker bottom border and bolder font weight, (4) Make valid/invalid counts more distinct with green background for valid and red background for invalid badges, (5) Add subtle row hover effect to both tables for better scanability`

## Chore Description
This chore improves the user experience of the Stock Configuration page through several UI enhancements:

1. **Filter Input Widths**: Increase the width of Location ID and Item ID filter inputs from 40px (w-40) to minimum 160px to prevent truncation of placeholder text
2. **Upload Status Card Hover**: Add a visual hover effect to the Upload Status card header to indicate it is clickable and will scroll to the upload history section
3. **Tab Enhancement**: Make the selected tab state more prominent with a thicker bottom border and bolder font weight
4. **Badge Styling**: Enhance the visual distinction between valid/invalid counts by adding green background for valid badges and red background for invalid badges
5. **Table Row Hover**: Add subtle hover effects to table rows in both Stock Config Table and Upload History Table for better scanability

## Relevant Files
Use these files to complete the chore:

- **app/stock-config/page.tsx** (lines 764-810) - Contains the filter input fields for Location ID and Item ID that need width adjustments
- **app/stock-config/page.tsx** (lines 695-699) - Contains the Upload Status card header that needs hover effect
- **app/stock-config/page.tsx** (lines 911-915) - Contains the TabsList for supply type filters that need enhanced selected state
- **app/stock-config/page.tsx** (lines 1074-1093) - Contains the TabsList for upload history filters that need enhanced selected state
- **src/components/stock-config/stock-config-table.tsx** - Contains the Stock Config table that needs row hover effects
- **src/components/stock-config/upload-history-table.tsx** - Contains the Upload History table that needs row hover effects
- **src/components/stock-config/validation-results-table.tsx** - May contain valid/invalid count badges that need styling updates
- **src/components/ui/tabs.tsx** - May need to check the Tabs component styling for selected state enhancements

### New Files
No new files are required for this chore.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Increase Filter Input Widths
- Open `app/stock-config/page.tsx`
- Locate the Location ID filter input (around line 766-771)
- Change `className="w-40 pl-9 pr-8 h-9 text-sm"` to `className="min-w-[160px] pl-9 pr-8 h-9 text-sm"`
- Locate the Item ID filter input (around line 791-796)
- Change `className="w-40 pl-9 pr-8 h-9 text-sm"` to `className="min-w-[160px] pl-9 pr-8 h-9 text-sm"`
- This ensures the full placeholder text "Filter by Location ID" and "Filter by Item ID" are visible without truncation

### 2. Add Hover Effect to Upload Status Card
- Open `app/stock-config/page.tsx`
- Locate the Upload Status card header (around line 696)
- The existing className is: `className="flex flex-row items-center justify-between space-y-0 pb-2 cursor-pointer transition-colors hover:bg-accent/50"`
- Verify the hover effect is already present
- If not present, add `hover:bg-accent/50 transition-colors` to the className
- Ensure the entire CardHeader is clickable and has the visual hover feedback

### 3. Enhance Tab Selected State
- Open `src/components/ui/tabs.tsx` to check the TabsTrigger component styling
- Look for the data-state="active" styles
- Update the selected tab styling to include:
  - Thicker bottom border: `border-b-2` or `border-b-[3px]`
  - Bolder font weight: `font-semibold` or `font-bold`
- If customization is not possible in the base component, add custom classes to the specific TabsList instances in `app/stock-config/page.tsx`
- Apply to both supply type tabs (line 911-915) and upload history tabs (line 1074-1093)

### 4. Make Valid/Invalid Count Badges More Distinct
- Open `src/components/stock-config/validation-results-table.tsx`
- Locate the valid and invalid count badges (likely in the component header or summary section)
- For valid count badges, add green background styling: `className="bg-green-600 text-white hover:bg-green-700"`
- For invalid count badges, add red background styling: `className="bg-red-600 text-white hover:bg-red-700"`
- Ensure the badge variant is set to `"default"` rather than `"outline"` for solid backgrounds
- Verify the text color has sufficient contrast (white text on colored backgrounds)

### 5. Add Row Hover Effect to Stock Config Table
- Open `src/components/stock-config/stock-config-table.tsx`
- Locate the TableRow component in the TableBody section (around line 102+)
- Add hover class to the TableRow: `className="hover:bg-accent/50 transition-colors"`
- Ensure the hover effect is subtle and doesn't interfere with existing row interactions

### 6. Add Row Hover Effect to Upload History Table
- Open `src/components/stock-config/upload-history-table.tsx`
- Locate the TableRow component in the TableBody section (around line 102+)
- Add hover class to the TableRow: `className="hover:bg-accent/50 transition-colors"`
- Ensure consistency with the Stock Config Table hover effect

### 7. Test All UI Improvements
- Run the development server: `pnpm dev`
- Navigate to `/stock-config` page
- Verify filter inputs show full placeholder text without truncation
- Hover over Upload Status card to verify visual feedback
- Click between tabs to verify enhanced selected state (thicker border, bolder font)
- Check valid/invalid count badges have distinct green/red backgrounds
- Hover over rows in both tables to verify subtle hover effect
- Test all improvements on different screen sizes (mobile, tablet, desktop)

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure the code compiles without TypeScript or build errors
- Visual testing in browser:
  - Navigate to `http://localhost:3000/stock-config`
  - Verify Location ID and Item ID filters show full placeholder text
  - Hover over "Upload Status" card header to see hover effect
  - Click tabs to verify enhanced selected state styling
  - Locate valid/invalid badges and verify green/red backgrounds
  - Hover over table rows to verify subtle hover effects work in both tables

## Notes
- The `min-w-[160px]` approach is used instead of fixed width to allow inputs to grow on larger screens while ensuring minimum visibility on smaller screens
- Hover effects should use the `accent` color from the theme for consistency
- Tab styling enhancements should work with the existing Radix UI Tabs component
- All color choices (green for valid, red for invalid) follow common UI/UX conventions for success/error states
- Row hover effects should be subtle (`accent/50` opacity) to avoid overwhelming the interface
