# Chore: Material Design Calendar Final Fixes

## Metadata
adw_id: `a1dbe028`
prompt: `Fix enhanced-calendar.tsx to match Material Design date picker exactly: (1) REMOVE week numbers completely - set showWeekNumber={false} or remove the displayWeekNumber prop, the calendar should NOT show week numbers column, (2) Reposition navigation arrows - the ↑ and ↓ arrows should be on the FAR RIGHT of the header row, horizontally aligned, layout should be: [May 2017 ▼] ... [↑] [↓], (3) Change footer to show only 'Today' link styled as blue text link (not a button), remove the 'Clear' button entirely, (4) Enable showOutsideDays={true} or showDaysOutsideCurrentMonth to display grayed-out days from previous/next months. Reference Material UI DatePicker layout. File: src/components/ui/enhanced-calendar.tsx`

## Chore Description
Align the enhanced-calendar.tsx component with Material UI DatePicker design specifications. The current implementation has four issues that need to be fixed:

1. **Week Numbers Removal**: The calendar currently shows week numbers (06, 07, 08, 09) in a column. Material Design date pickers do not display week numbers - this column must be completely removed.

2. **Navigation Arrow Repositioning**: Navigation arrows are currently stacked vertically immediately after the month/year dropdown. Material Design places these arrows horizontally on the FAR RIGHT of the header row. Target layout: `[February 2026 ▼]............[↑] [↓]` with space-between alignment.

3. **Footer Simplification**: Current footer shows two buttons "Clear" and "Today". Material Design uses only a "Today" text link styled in blue (primary color). Remove the Clear button entirely and convert Today to a text link.

4. **Outside Days Display**: Ensure showOutsideDays remains enabled to display grayed-out days from adjacent months (previous month's last days and next month's first days).

## Relevant Files
Use these files to complete the chore:

- **`src/components/ui/enhanced-calendar.tsx`** - Main file to modify. Contains the EnhancedCalendar component with CustomMonthCaption, footer section, and DayPicker configuration
- **`src/components/ui/calendar.tsx`** - Reference for standard patterns and Tailwind class naming conventions
- **`src/components/ui/button.tsx`** - Reference for button styling patterns (may not need modification)

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Remove Week Numbers
- Remove `showWeekNumber` prop from DayPicker (line 236)
- Remove `week_number` classNames entry (line 255)
- Remove `week_number_header` classNames entry (line 256)
- Remove unused imports: `getWeek` from date-fns (line 6) if no longer needed after removing week number functionality
- Remove `currentWeekNumber` calculation (line 195) since week highlighting is no longer relevant without week numbers

### 2. Reposition Navigation Arrows to Far Right
- Modify CustomMonthCaption component layout (lines 75-171)
- Change outer container from `justify-center` to `justify-between` with `w-full`
- Move the navigation arrows div to be a sibling OUTSIDE the current flex-col structure
- Change arrows from vertical stack (`flex-col`) to horizontal (`flex-row` or `flex gap-1`)
- Use horizontal chevrons: Replace `ChevronUp`/`ChevronDown` with `ChevronLeft`/`ChevronRight` for better visual match
- Target layout: `<div flex justify-between w-full> <dropdown/> <arrows-horizontal/> </div>`

### 3. Simplify Footer to Today Link Only
- Remove the Clear button entirely (lines 214-220)
- Replace Today Button with styled text link
- Style: `text-blue-600 hover:text-blue-700 hover:underline cursor-pointer text-sm font-medium`
- Remove the flex gap and center alignment, simplify to just the Today link
- Remove `onClear` prop from EnhancedCalendarProps type definition (line 19)
- Remove `onClear` from destructured props (line 179)

### 4. Verify Outside Days Configuration
- Confirm `showOutsideDays={showOutsideDays}` is passed to DayPicker (already on line 235)
- Confirm default value `showOutsideDays = true` in props destructuring (line 177)
- Verify `outside` classNames styling is appropriate for grayed-out appearance (line 274-275)

### 5. Clean Up Unused Code
- Remove unused imports after changes:
  - `getWeek` from date-fns if not used elsewhere
  - `ChevronUp`, `ChevronDown` from lucide-react (replace with `ChevronLeft`, `ChevronRight`)
  - `Button` from ui/button if footer no longer uses it
- Remove `currentWeekNumber` variable if no longer needed
- Remove `currentWeek` modifier logic if week highlighting is removed
- Remove `modifiersClassNames` for `currentWeek` if not needed

### 6. Validate Build and TypeScript Compilation
- Run `pnpm build` to ensure no TypeScript errors
- Verify the component exports correctly
- Test visual rendering in browser at localhost:3000/orders

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Verify TypeScript compilation passes without errors
- `pnpm lint` - Ensure no ESLint errors introduced
- Open http://localhost:3000/orders in browser and click date range picker to visually verify:
  - No week number column visible
  - Navigation arrows are horizontal on far right
  - Footer shows only "Today" as blue text link
  - Outside days (grayed) are visible from adjacent months

## Notes
- The current implementation at line 177 already has `showOutsideDays = true` as default
- The `outside` classNames at line 274-275 already provides proper grayed styling with `opacity-50`
- ChevronLeft/ChevronRight are more conventional for month navigation than Up/Down arrows for horizontal layout
- The Material Design DatePicker typically uses < > arrows horizontally, not ↑ ↓ vertically
- Removing week numbers will simplify the grid layout and CSS significantly
- The current week highlighting feature (modifiers/modifiersClassNames) becomes less relevant without week numbers - consider keeping for day highlighting or removing entirely
