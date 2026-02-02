# Chore: Enhanced Order Date Range Picker with Material Design Style

## Metadata
adw_id: `0d7f9d61`
prompt: `Enhance Order Date Range picker in order-management-hub.tsx to match Material Design style with these features: (1) Replace month navigation with dropdown selector showing 'February 2026' format with clickable dropdown to select month/year, (2) Add week number column on the right side of calendar grid showing week numbers 16-22 etc, (3) Add 'Clear' and 'Today' action buttons at bottom of calendar popover - Clear resets selection, Today jumps to current date and selects it. Keep using react-day-picker but configure showWeekNumber prop, add captionLayout='dropdown' for month/year selector, and wrap with custom footer for Clear/Today buttons. File: src/components/order-management-hub.tsx lines 2211-2261`

## Chore Description
Enhance the Order Date Range picker in the Order Management Hub to provide a more Material Design-inspired user experience. The current implementation uses basic calendar navigation with chevron arrows for month navigation. This chore will upgrade the calendar with:

1. **Month/Year Dropdown Selector**: Replace the chevron-based month navigation with a dropdown that shows "February 2026" format, allowing users to quickly jump to any month/year combination instead of clicking through months one at a time.

2. **Week Number Display**: Add a week number column on the left side of the calendar grid (react-day-picker v9 default position) showing ISO week numbers (1-52), helping users quickly identify which week they're selecting.

3. **Footer Action Buttons**: Add "Clear" and "Today" buttons at the bottom of the calendar popover:
   - **Clear**: Resets the selected date to undefined
   - **Today**: Jumps to and selects the current date

The implementation will use react-day-picker v9.13.0 (already installed) built-in props:
- `captionLayout="dropdown"` for month/year dropdown
- `showWeekNumber={true}` for week numbers
- `footer` prop for custom action buttons

## Relevant Files
Use these files to complete the chore:

- **src/components/ui/calendar.tsx** - Base Calendar component wrapper around react-day-picker. Need to create an enhanced variant that supports the new features while preserving the original component for backward compatibility.
- **src/components/order-management-hub.tsx** (lines 2211-2261) - Order Date Range filter section containing two Calendar instances (From/To dates). Need to update to use enhanced calendar component.
- **src/lib/utils.ts** - Contains `cn()` utility for className merging, already imported in relevant files.

### New Files
- **src/components/ui/enhanced-calendar.tsx** - New enhanced calendar component with dropdown caption, week numbers, and footer actions. Created as separate component to avoid breaking existing Calendar usage elsewhere.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Create Enhanced Calendar Component
- Create new file `src/components/ui/enhanced-calendar.tsx`
- Import DayPicker from react-day-picker and required dependencies
- Configure `captionLayout="dropdown"` prop for month/year dropdown selector
- Configure `showWeekNumber={true}` prop to display week numbers
- Add custom `footer` prop rendering Clear and Today buttons
- Accept `onClear` callback prop for clearing selection
- Accept `onToday` callback prop for selecting today's date
- Style dropdown elements using Tailwind classes matching existing design system
- Add proper classNames for week number column styling (week_number class)
- Style footer buttons to match shadcn/ui button patterns

### 2. Update Order Management Hub Date Range Picker
- Import `EnhancedCalendar` component in order-management-hub.tsx
- Replace Calendar component with EnhancedCalendar in both From and To date popovers (lines 2230-2235 and 2253-2258)
- Pass `onClear` prop to reset respective date filter state (`setDateFromFilter(undefined)` / `setDateToFilter(undefined)`)
- Pass `onToday` prop to set respective date filter state to `new Date()`
- Ensure proper TypeScript types for the new component props

### 3. Style Enhancements for Material Design Feel
- Add styling for dropdown elements: readable font size, proper padding, chevron indicator
- Style week number column: muted foreground color, smaller font, right-aligned
- Style footer: border-top separator, centered buttons with proper spacing
- Ensure responsive behavior within popover container
- Add hover states to Clear/Today buttons matching existing button patterns

### 4. Validate Implementation
- Run `pnpm build` to ensure no TypeScript errors
- Test calendar functionality in browser:
  - Dropdown month/year selection works
  - Week numbers display correctly
  - Clear button resets date selection
  - Today button selects current date
- Verify existing Calendar component is unaffected (backward compatibility)

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure production build succeeds with no TypeScript errors
- `pnpm lint` - Ensure no ESLint errors introduced
- Visual validation in browser at `/orders` route:
  - Click Order Date Range "From" button → verify dropdown caption, week numbers, and footer buttons appear
  - Test dropdown month/year selection functionality
  - Test Clear button clears the selection
  - Test Today button selects current date
  - Repeat for "To" date picker

## Notes
- react-day-picker v9.13.0 uses different API than v8. Key v9 features:
  - `captionLayout` accepts: `"label"` (default), `"dropdown"`, `"dropdown-months"`, `"dropdown-years"`
  - `showWeekNumber` is a boolean prop
  - `footer` accepts ReactNode for custom footer content
  - Week numbers appear on the LEFT side of the grid by default in v9
- Creating a separate EnhancedCalendar component preserves backward compatibility with any other components using the base Calendar
- The footer will be a live region for accessibility per react-day-picker v9 documentation
- Consider adding `startMonth` and `endMonth` props to limit dropdown range to reasonable date bounds (e.g., 2020-2030)
