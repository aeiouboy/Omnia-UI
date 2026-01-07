# Chore: Restore Records and Uploaded By Columns to Upload History Table

## Metadata
adw_id: `685f764b`
prompt: `Restore Records and Uploaded By columns to Upload History table in Stock Configuration page. Update src/components/stock-config/upload-history-table.tsx to: 1) Add back 'Uploaded By' column header after 'Upload Date' - show User icon + uploadedBy name, use text-sm for readability, show '-' if undefined 2) Add back 'Records' column header after 'Uploaded By' - show total count on first line, 'X valid / Y invalid' on second line with color coding (green for valid, red for invalid if > 0) 3) Update responsive classes: hide 'Uploaded By' on screens smaller than md (hidden md:table-cell), hide 'Records' on screens smaller than lg (hidden lg:table-cell) 4) Final column order should be: File Name, Upload Date, Records, Uploaded By, Status (no Actions column)`

## Chore Description
This chore restores two previously removed columns to the Upload History table in the Stock Configuration page:
1. **Uploaded By column** - Displays the username of the person who uploaded the file with a User icon
2. **Records column** - Shows the total record count and breakdown of valid/invalid records with color coding

The table needs responsive behavior where columns hide on smaller screens:
- Uploaded By: Hidden on screens < md (768px)
- Records: Hidden on screens < lg (1024px)

The final column order will be: File Name, Upload Date, Records, Uploaded By, Status

## Relevant Files
Use these files to complete the chore:

- **src/components/stock-config/upload-history-table.tsx** - The main component file to update. Currently has 3 columns (File Name, Upload Date, Status). Need to add 2 new columns in the correct order with responsive classes.
- **src/types/stock-config.ts** - Type definitions for StockConfigFile interface. Already includes `uploadedBy?: string`, `recordCount`, `validRecords`, and `invalidRecords` properties needed for the new columns.

### Dependencies/References
- **lucide-react** - User icon already used in other components (src/components/user-nav.tsx:14), need to import it
- **Tailwind responsive classes** - Use `hidden md:table-cell` and `hidden lg:table-cell` patterns
- **Table components** - Already imported from "@/components/ui/table"

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Import User Icon
- Add `User` to the existing lucide-react import statement at the top of the file
- The import statement is currently on lines 13-21

### 2. Update Table Headers
- Locate the TableHeader section (currently lines 168-173)
- Add `<TableHead className="hidden lg:table-cell">Records</TableHead>` after "Upload Date" header
- Add `<TableHead className="hidden md:table-cell">Uploaded By</TableHead>` after "Records" header
- Keep "Status" header as the last column
- Update loading skeleton TableHeader section (lines 123-128) with the same headers

### 3. Add Records Column Cell
- Locate the TableBody row rendering section (lines 176-205)
- After the "Upload Date" TableCell (lines 187-201), add new Records TableCell
- Use `<TableCell className="hidden lg:table-cell">` for responsive hiding
- Display total count on first line: `{file.recordCount || 0}`
- Display breakdown on second line in smaller text:
  - Use green text (text-green-600) for valid count: `{file.validRecords || 0} valid`
  - Use red text (text-red-600) for invalid count if > 0: `{file.invalidRecords || 0} invalid`
  - Use gray text (text-gray-600) if invalid count is 0
- Wrap in a flex column div with appropriate spacing

### 4. Add Uploaded By Column Cell
- After the Records TableCell, add new Uploaded By TableCell
- Use `<TableCell className="hidden md:table-cell">` for responsive hiding
- Display User icon with uploadedBy name in a flex row
- Use `text-sm` for readability
- Show '-' if uploadedBy is undefined: `{file.uploadedBy || '-'}`
- Align icon and text with gap-2

### 5. Update Loading Skeleton
- Locate the loading skeleton TableBody section (lines 130-144)
- Add two new TableCell elements with Skeleton components for the new columns:
  - Records column skeleton with `className="hidden lg:table-cell"`
  - Uploaded By column skeleton with `className="hidden md:table-cell"`
- Place them in the correct order matching the data table structure

### 6. Verify Column Order
- Final column order in both TableHeader and TableBody should be:
  1. File Name (no responsive class - always visible)
  2. Upload Date (no responsive class - always visible)
  3. Records (hidden lg:table-cell - visible on lg+ screens)
  4. Uploaded By (hidden md:table-cell - visible on md+ screens)
  5. Status (no responsive class - always visible)

## Validation Commands
Execute these commands to validate the chore is complete:

- `npm run lint` - Verify no linting errors introduced
- `npm run build` - Ensure TypeScript compilation succeeds without errors
- Manual testing:
  - Navigate to Stock Configuration page in browser
  - Verify all 5 columns display correctly on desktop (≥1024px width)
  - Resize browser to tablet width (768-1023px): Records column should hide, 4 columns visible
  - Resize browser to mobile width (<768px): Both Records and Uploaded By should hide, 3 columns visible
  - Verify User icon displays correctly with username
  - Verify valid/invalid record counts display with correct color coding
  - Verify '-' displays for uploadedBy when undefined

## Notes
- The StockConfigFile type already includes all necessary properties (uploadedBy, recordCount, validRecords, invalidRecords)
- User icon is available from lucide-react and follows the same pattern as other components in the codebase
- Color coding uses standard Tailwind classes (text-green-600, text-red-600) for consistency
- Responsive breakpoints follow Tailwind's standard breakpoints: sm (640px), md (768px), lg (1024px)
- The `hidden {breakpoint}:table-cell` pattern is the correct approach for responsive table columns in Tailwind
