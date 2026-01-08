# Chore: Redesign Upload Status Card

## Metadata
adw_id: `5427698b`
prompt: `Redesign the Upload Status card in Stock Configuration page (app/stock-config/page.tsx) to be more visually clear and easy to understand. Requirements: 1) Replace the single-line text with individual status rows, each showing: colored status dot/icon + label + count 2) Use visual indicators: yellow/amber dot for Pending, green dot for Processed, red dot for Errors 3) Layout each status vertically in a clean list format: Pending with Clock icon and amber color, Processed with CheckCircle icon and green color, Errors with AlertCircle icon and red color 4) Keep the card clickable with hover effect 5) Remove 'Click to view details' text - the hover effect makes it obvious it's clickable 6) If any status has 0 count, still show it but with muted styling 7) Maintain responsive design - the card should work well on all screen sizes 8) Keep the FileSpreadsheet icon in the header`

## Chore Description
Redesign the Upload Status summary card to display upload processing status in a more visually clear and intuitive format. The current implementation shows a single-line text combining all status counts. The new design should display each status (Pending, Processed, Errors) in individual rows with distinct color-coded icons and styling for better readability and user experience.

### Key Requirements:
1. **Visual Hierarchy**: Individual status rows with colored icons and badges
2. **Color Coding**:
   - Pending: Amber/Yellow with Clock icon
   - Processed: Green with CheckCircle icon
   - Errors: Red with AlertCircle icon
3. **Zero States**: Show all statuses even if count is 0, with muted styling
4. **Interactivity**: Maintain clickable card with hover effect, remove redundant "Click to view details" text
5. **Responsive**: Works well on all screen sizes (mobile-first design)
6. **Consistency**: Keep FileSpreadsheet icon in the header

## Relevant Files
Use these files to complete the chore:

- **app/stock-config/page.tsx** (lines 464-478) - Contains the Upload Status card component that needs to be redesigned. Currently displays a single-line text format showing `{pending} pending, {processed} processed, {errors} errors`.
- **src/types/stock-config.ts** - Type definitions for file processing status, folder types, and upload history data structure. Needed to understand data types.
- **app/stock-config/page.tsx** (lines 10-22) - Import section where we'll add CheckCircle and AlertCircle icons from lucide-react.
- **app/stock-config/page.tsx** (lines 395-404) - `summaryStats` calculation using useMemo that provides the counts for pending, processed, and errors statuses.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Add Required Icon Imports
- Import `CheckCircle` and `AlertCircle` icons from lucide-react
- These icons are already available in the project (lucide-react is installed)
- `Clock` icon is already imported and available for Pending status
- `FileSpreadsheet` icon is already imported for the header

### 2. Redesign Upload Status Card Component
- Locate the Upload Status card at lines 464-478 in app/stock-config/page.tsx
- Replace the single-line text content (line 473-475) with a vertical list of status rows
- Each status row should contain:
  - Icon component (Clock/CheckCircle/AlertCircle)
  - Status label text
  - Count badge or number
- Structure layout using flexbox for vertical alignment
- Keep the card wrapper with cursor-pointer and hover:bg-accent/50 classes
- Keep the onClick={handleScrollToUploadHistory} handler

### 3. Implement Color-Coded Status Rows
- **Pending Row**:
  - Clock icon with amber/yellow color (`text-amber-500` or `text-yellow-600`)
  - Label: "Pending"
  - Count from `summaryStats.pending`
- **Processed Row**:
  - CheckCircle icon with green color (`text-green-600`)
  - Label: "Processed"
  - Count from `summaryStats.processed`
- **Errors Row**:
  - AlertCircle icon with red color (`text-red-600`)
  - Label: "Errors"
  - Count from `summaryStats.errors`

### 4. Add Zero State Styling
- Add conditional styling to mute rows when count is 0
- Use `text-muted-foreground` or reduced opacity for 0-count rows
- Still display all three status rows even when counts are 0
- Example: `className={cn("flex items-center gap-2", count === 0 && "opacity-50 text-muted-foreground")}`

### 5. Remove Redundant Text and Polish UI
- Remove the "Click to view details" text from line 476
- The hover effect (`hover:bg-accent/50`) already indicates interactivity
- Ensure proper spacing between status rows (gap-2 or gap-3)
- Add appropriate text sizing for labels and counts
- Ensure the card maintains consistent height with other summary cards

### 6. Test Responsive Design
- Verify card displays correctly on mobile (grid-cols-1)
- Verify card displays correctly on md screens (md:grid-cols-2)
- Verify card displays correctly on lg screens (lg:grid-cols-4)
- Ensure icons and text don't overflow or wrap awkwardly on small screens
- Test with different count values (0, small numbers, large numbers)

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm dev` - Start development server and verify the redesigned Upload Status card displays correctly
- Navigate to `http://localhost:3000/stock-config` and visually inspect:
  - Three status rows with correct icons (Clock, CheckCircle, AlertCircle)
  - Correct color coding (amber for Pending, green for Processed, red for Errors)
  - Zero-count rows are visible but muted
  - Card is clickable with hover effect
  - FileSpreadsheet icon remains in header
  - "Click to view details" text is removed
  - Responsive layout works on different screen sizes
- `pnpm build` - Ensure no TypeScript or build errors
- `pnpm lint` - Ensure no ESLint errors

## Notes
- The card is part of a 4-card summary grid that displays key metrics
- The card uses the existing `summaryStats` calculation from useMemo (lines 395-404)
- The card's onClick handler scrolls to the Upload History section below
- Maintain consistency with other summary cards in terms of padding, spacing, and overall visual style
- Consider using Badge component for count display if it fits the design better than plain text
- The FileFolder type ("pending" | "arch" | "err") and ProcessingStatus type are used to determine status counts
