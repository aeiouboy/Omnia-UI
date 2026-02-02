# Chore: Fix Enhanced Calendar to Match Material Design Date Picker

## Metadata
adw_id: `26c6b988`
prompt: `Fix enhanced-calendar.tsx to match Material Design date picker: (1) Combine month+year into single dropdown button showing 'February 2026' format with ChevronDown icon, clicking opens both month and year selection, (2) Replace horizontal navigation arrows with VERTICAL ChevronUp/ChevronDown arrows positioned NEXT to the dropdown title, (3) Move week numbers from LEFT to RIGHT side of calendar grid using custom CSS/classNames, (4) Style the current week row with blue highlight background like the target showing week 48 highlighted. Reference design: Month dropdown with vertical nav arrows, week numbers on right column, Clear/Today at bottom. Files: src/components/ui/enhanced-calendar.tsx`

## Chore Description

The current `enhanced-calendar.tsx` component uses react-day-picker v9.13.0 with `captionLayout="dropdown"` which renders separate month and year dropdowns with horizontal navigation arrows. This implementation needs to be modified to match a Material Design-inspired date picker with:

1. **Combined Month/Year Dropdown**: Single dropdown button showing "February 2026" format with ChevronDown icon instead of two separate dropdowns
2. **Vertical Navigation Arrows**: Replace horizontal left/right arrows with vertical up/down arrows (ChevronUp/ChevronDown) positioned next to the month/year title
3. **Week Numbers on Right**: Move week number column from left side to right side of the calendar grid
4. **Current Week Highlighting**: Add blue background highlight to the current week row

## Relevant Files

Use these files to complete the chore:

- **src/components/ui/enhanced-calendar.tsx** - The main file to modify. Currently uses react-day-picker with dropdown caption layout and week numbers on left side
- **src/components/ui/calendar.tsx** - Reference for base calendar styling and Chevron component pattern
- **src/components/ui/button.tsx** - For buttonVariants used in styling
- **src/lib/utils.ts** - For `cn()` utility function

### Dependencies
- **react-day-picker v9.13.0** - Provides DayPicker, DayPickerProps, and custom component interfaces
- **lucide-react** - For ChevronUp, ChevronDown icons
- **date-fns** - For date formatting (format function)

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

### 1. Add Required Imports
- Import `ChevronUp`, `ChevronDown` from lucide-react
- Import `format` from date-fns
- Import React hooks: `useState` for managing dropdown state

### 2. Create Custom MonthCaption Component
- Create a custom `CustomMonthCaption` component that replaces the default caption
- Render month/year as "February 2026" format using `format(month, "MMMM yyyy")`
- Add ChevronDown icon next to the text
- Style as a clickable button that opens the dropdown selectors
- Use inline popover or dropdown to show month and year selection when clicked

### 3. Create Custom Nav Component with Vertical Arrows
- Create a custom `CustomNav` component using NavProps from react-day-picker
- Position vertical ChevronUp (previous month) and ChevronDown (next month) arrows NEXT to the month/year title
- Wire up `onPreviousClick` and `onNextClick` handlers
- Remove absolute positioning used by horizontal arrows
- Use flexbox with `flex-col` for vertical arrow stack

### 4. Update classNames for Week Number Positioning
- Modify `week` classNames to use flexbox `flex-row-reverse` to move week number to right
- OR use CSS Grid with explicit column ordering
- Update `week_number` and `week_number_header` styling for right-side positioning
- Ensure week numbers appear AFTER the day cells, not before

### 5. Add Current Week Row Highlighting
- Identify current week using `getWeek()` from date-fns or manual calculation
- Add custom `week` classNames logic to apply blue background when row contains today's date
- Use conditional styling: `bg-blue-50` or `bg-primary/10` for current week row
- Ensure the highlight doesn't interfere with individual day selection styles

### 6. Update EnhancedCalendar Component
- Replace `captionLayout="dropdown"` with custom components approach
- Add `components` prop with:
  - `MonthCaption: CustomMonthCaption`
  - `Nav: CustomNav`
- Update classNames object for new layout structure
- Preserve existing `footer` with Clear/Today buttons
- Preserve `onClear` and `onToday` callback props

### 7. Validate and Test Build
- Run `pnpm build` to check for TypeScript errors
- Test visually by starting dev server and navigating to Order Management page
- Verify all 4 requirements are met:
  - Combined month/year dropdown with ChevronDown
  - Vertical navigation arrows next to title
  - Week numbers on right side
  - Current week highlighted in blue

## Implementation Details

### CustomMonthCaption Structure
```tsx
function CustomMonthCaption({ calendarMonth }: MonthCaptionProps) {
  const [open, setOpen] = useState(false)
  const monthLabel = format(calendarMonth.date, "MMMM yyyy")

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-sm font-medium hover:bg-accent rounded-md px-2 py-1"
      >
        {monthLabel}
        <ChevronDown className="h-4 w-4" />
      </button>
      {/* Dropdown for month/year selection */}
    </div>
  )
}
```

### CustomNav Structure with Vertical Arrows
```tsx
function CustomNav({ onPreviousClick, onNextClick }: NavProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <button
        onClick={onPreviousClick}
        className="h-6 w-6 p-0 hover:bg-accent rounded"
      >
        <ChevronUp className="h-4 w-4" />
      </button>
      <button
        onClick={onNextClick}
        className="h-6 w-6 p-0 hover:bg-accent rounded"
      >
        <ChevronDown className="h-4 w-4" />
      </button>
    </div>
  )
}
```

### Week Number Right-Side CSS
```tsx
classNames={{
  week: "flex w-full mt-2 flex-row-reverse",
  week_number: "text-muted-foreground text-[0.7rem] w-8 text-center opacity-60",
  weekdays: "flex flex-row-reverse",
  week_number_header: "text-muted-foreground text-[0.7rem] w-8 text-center opacity-60",
}}
```

### Current Week Highlighting
Use react-day-picker's modifiers or custom week component with `isToday` check.

## Validation Commands

Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure TypeScript compiles without errors
- `pnpm dev` - Start development server for visual testing
- Navigate to `localhost:3000/orders` and click the Order Date Range filter "From" button
- Verify:
  1. Month/year shows as single "February 2026" with dropdown arrow
  2. Vertical up/down arrows appear next to the month/year
  3. Week numbers appear on the RIGHT side of the calendar grid
  4. Current week row has light blue background highlight
  5. Clear and Today buttons remain at bottom footer

## Notes

- The react-day-picker v9 API uses different prop names than v8:
  - `fromYear`/`toYear` → `startMonth`/`endMonth` (already correct)
  - `IconLeft`/`IconRight` → Single `Chevron` component with `orientation` prop
  - `CaptionProps` → `MonthCaptionProps`
- The `showWeekNumber` prop must remain `true` for week numbers to display
- Keep the existing `startMonth={new Date(2020, 0)}` and `endMonth={new Date(2030, 11)}` for dropdown range
- Preserve backward compatibility with `onClear` and `onToday` callback props
- The `footer` prop should remain unchanged with Clear/Today buttons

Sources:
- [React DayPicker Custom Components](https://daypicker.dev/guides/custom-components)
- [React DayPicker Styling](https://daypicker.dev/docs/styling)
- [React DayPicker API v9.13.0](https://daypicker.dev/api)
