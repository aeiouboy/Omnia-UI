# Chore: Fix Enhanced Calendar Material Design Layout Issues

## Metadata
adw_id: `f2fe2130`
prompt: `Fix enhanced-calendar.tsx to match Material Design date picker exactly: (1) Fix reversed day order - calendar currently shows Sa-Fr-Th-We-Tu-Mo-Su but must show Su-Mo-Tu-We-Th-Fr-Sa in correct left-to-right order, likely caused by CSS flex-direction or RTL styling in the grid, (2) Position navigation arrows (ChevronUp/ChevronDown) IMMEDIATELY NEXT TO the 'February 2026' dropdown button on the RIGHT side, not floating left - layout should be: [February 2026 ▼] [↑] [↓], (3) Style current week row with bg-blue-50 highlight to indicate today's week, (4) Ensure week numbers column stays on RIGHT side of calendar grid. Check enhanced-calendar.tsx for any direction:rtl, flex-row-reverse, or incorrect grid column order. File: src/components/ui/enhanced-calendar.tsx`

## Chore Description

The `enhanced-calendar.tsx` component has several layout issues that deviate from the Material Design date picker specification:

1. **Day Order Reversed**: The calendar displays days as Sa-Fr-Th-We-Tu-Mo-Su instead of Su-Mo-Tu-We-Th-Fr-Sa. This is caused by `flex-row-reverse` being applied to both `weekdays` and `week` classNames (lines 234, 236). The flex-row-reverse was intended to move week numbers to the right, but it also reversed the day column order.

2. **Navigation Arrows Mispositioned**: The vertical navigation arrows (ChevronUp/ChevronDown) render in a separate area from the month/year dropdown. The target layout requires them IMMEDIATELY adjacent to the dropdown button: `[February 2026 ▼] [↑] [↓]`. Currently, react-day-picker renders the Nav component separately from the MonthCaption.

3. **Current Week Highlighting**: The modifiers for current week highlighting are implemented (lines 182-192) but need verification that the blue background is visible.

4. **Week Numbers Position**: Week numbers should remain on the RIGHT side of the calendar grid, but without reversing the day order.

## Relevant Files

Use these files to complete the chore:

- **src/components/ui/enhanced-calendar.tsx** (lines 1-279) - The main file to modify. Contains:
  - `CustomNav` component (lines 24-51) - Vertical arrow navigation
  - `CustomMonthCaption` component (lines 54-154) - Month/year dropdown
  - `EnhancedCalendar` component (lines 156-279) - Main calendar wrapper
  - Issue classNames at lines 234 (`weekdays: "flex flex-row-reverse"`) and 236 (`week: "flex w-full mt-2 flex-row-reverse"`)

### Reference Files
- **src/components/ui/calendar.tsx** - Base calendar for comparison (uses standard flex, not reversed)
- **node_modules/react-day-picker** - API reference for component customization

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

### 1. Fix Day Order by Removing flex-row-reverse from Day Cells
- Change line 234 from `weekdays: "flex flex-row-reverse"` to `weekdays: "flex"`
- Change line 236 from `week: "flex w-full mt-2 flex-row-reverse"` to `week: "flex w-full mt-2"`
- This restores correct Su-Mo-Tu-We-Th-Fr-Sa day ordering

### 2. Reposition Week Numbers to Right Using CSS order Property
- Update `week_number` class (line 237) to add `order-last` so week numbers render after day cells
- Update `week_number_header` class (line 238) to add `order-last` for the header row
- This moves week numbers to the right WITHOUT reversing day order

### 3. Merge Navigation Arrows into CustomMonthCaption Component
- Move the vertical arrow rendering from `CustomNav` into `CustomMonthCaption`
- Update CustomMonthCaption to receive and use `onPreviousClick` and `onNextClick` handlers
- Layout the caption as a flex row: `[February 2026 ▼] [↑] [↓]`
- Remove or hide the default Nav component by setting `nav: "hidden"` in classNames

### 4. Verify Current Week Highlighting
- Confirm the `currentWeek` modifier (lines 182-187) correctly identifies today's week
- Confirm `modifiersClassNames` (lines 189-192) applies `bg-blue-50 dark:bg-blue-950/30`
- Test that the current week row displays with the blue background

### 5. Update Nav Component Handling
- Since arrows are now in CustomMonthCaption, update the `components` prop
- Either remove `Nav: CustomNav` or keep it hidden with CSS
- Pass navigation handlers to CustomMonthCaption through the component wrapper

### 6. Validate Build and Visual Testing
- Run `pnpm build` to verify TypeScript compilation
- Start `pnpm dev` and navigate to `/orders` page
- Click the Order Date Range filter to open the calendar
- Verify all 4 requirements are met visually

## Implementation Details

### Updated classNames for Week Number Positioning (without day reversal)
```tsx
classNames={{
  weekdays: "flex",  // REMOVED flex-row-reverse
  weekday: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] text-center",
  week: "flex w-full mt-2",  // REMOVED flex-row-reverse
  week_number: "text-muted-foreground text-[0.7rem] w-8 text-center opacity-60 flex items-center justify-center order-last",  // ADDED order-last
  week_number_header: "text-muted-foreground text-[0.7rem] w-8 text-center opacity-60 order-last",  // ADDED order-last
}}
```

### Updated CustomMonthCaption with Integrated Navigation Arrows
```tsx
function CustomMonthCaption({
  calendarMonth,
  onMonthChange,
  onPreviousClick,
  onNextClick
}: MonthCaptionProps & {
  onMonthChange?: (date: Date) => void
  onPreviousClick?: React.MouseEventHandler<HTMLButtonElement>
  onNextClick?: React.MouseEventHandler<HTMLButtonElement>
}) {
  const [open, setOpen] = useState(false)
  const monthLabel = format(calendarMonth.date, "MMMM yyyy")

  return (
    <div className="flex items-center justify-center gap-1">
      {/* Month/Year Dropdown Button */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button className="flex items-center gap-1 text-sm font-medium hover:bg-accent rounded-md px-2 py-1">
            {monthLabel}
            <ChevronDown className="h-4 w-4 opacity-70" />
          </button>
        </PopoverTrigger>
        {/* ... Popover content ... */}
      </Popover>

      {/* Vertical Navigation Arrows - IMMEDIATELY after dropdown */}
      <div className="flex flex-col gap-0.5">
        <button onClick={onPreviousClick} className="h-6 w-6 p-0 flex items-center justify-center rounded hover:bg-accent">
          <ChevronUp className="h-4 w-4" />
        </button>
        <button onClick={onNextClick} className="h-6 w-6 p-0 flex items-center justify-center rounded hover:bg-accent">
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
```

### Updated EnhancedCalendar components Prop
```tsx
components={{
  Nav: () => null,  // Hide default nav - arrows are in MonthCaption now
  MonthCaption: (props) => (
    <CustomMonthCaption
      {...props}
      onMonthChange={handleMonthChange}
      // Nav handlers need to be passed here - may require accessing DayPicker context
    />
  ),
}}
```

### Alternative: Use react-day-picker's useDayPicker Hook
If passing navigation handlers to MonthCaption is complex, use the `useDayPicker` hook inside CustomMonthCaption:
```tsx
import { useDayPicker } from "react-day-picker"

function CustomMonthCaption({ calendarMonth, onMonthChange }) {
  const { goToMonth, nextMonth, previousMonth } = useDayPicker()

  const handlePrevious = () => previousMonth && goToMonth(previousMonth)
  const handleNext = () => nextMonth && goToMonth(nextMonth)
  // ...
}
```

## Validation Commands

Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure TypeScript compiles without errors
- `pnpm dev` - Start development server for visual testing
- Navigate to `http://localhost:3000/orders` and click the "Order Date Range" filter
- Verify in the calendar popup:
  1. Day header shows: Su Mo Tu We Th Fr Sa (left-to-right, NOT reversed)
  2. Navigation arrows are IMMEDIATELY next to "February 2026" dropdown: `[February 2026 ▼] [↑] [↓]`
  3. Current week row has light blue (bg-blue-50) background
  4. Week numbers column appears on the RIGHT side of the calendar grid

## Notes

- The `order-last` CSS utility from Tailwind positions flex children at the end regardless of DOM order
- The `useDayPicker` hook from react-day-picker v9 provides `goToMonth`, `nextMonth`, and `previousMonth` for navigation
- Keep `showWeekNumber={true}` for week numbers to display
- Preserve existing `startMonth` and `endMonth` constraints (2020-2030)
- The `bg-blue-50` color is already in the modifiersClassNames - verify it's applying to entire week row, not just individual days
- The modifiers system in react-day-picker applies to individual days, not entire rows. May need custom CSS to highlight the full week row via adjacent sibling selectors or wrapper component
