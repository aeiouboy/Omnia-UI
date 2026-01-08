# Chore: Add Color Indicators to Upload History Filter Tabs

## Metadata
adw_id: `ba6675f9`
prompt: `Add color indicators to Upload History filter tabs on Stock Configuration page (app/stock-config/page.tsx) to match the Upload Status card styling. Requirements: 1) Add colored dot or icon before each tab label to indicate status type 2) Pending tab: amber/yellow color (text-amber-600) with Clock icon 3) Processed tab: green color (text-green-600) with CheckCircle icon 4) Error tab: red color (text-red-600) with AlertCircle icon 5) All tab: keep neutral without icon or use a subtle gray List icon 6) Icons should be small (h-3.5 w-3.5) and placed before the tab text 7) When tab is selected, the icon color should remain visible 8) Import necessary icons from lucide-react (Clock, CheckCircle, AlertCircle, List)`

## Chore Description
Add visual status indicators (colored icons) to the Upload History filter tabs to improve usability and match the existing Upload Status card styling. Each tab will display a small icon with appropriate color coding to indicate the status type (Pending = amber, Processed = green, Error = red, All = neutral gray). Icons should remain visible when tabs are selected/active.

## Relevant Files
Use these files to complete the chore:

- **app/stock-config/page.tsx** (lines 640-647) - Contains the Upload History TabsList that needs icon additions. This is where we'll add the Clock, CheckCircle, AlertCircle, and List icons to the TabsTrigger components.
- **app/stock-config/page.tsx** (lines 10-24) - Import section where lucide-react icons are already imported. Need to verify Clock, CheckCircle, AlertCircle are already imported, and add List if not present.

### New Files
None required - all changes are within existing file structure.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Verify and Update Icon Imports
- Check current imports at app/stock-config/page.tsx:10-24
- Confirm Clock, CheckCircle, and AlertCircle are already imported (they appear to be based on lines 18, 22, 23)
- Add List icon import if not already present
- Ensure all four icons (Clock, CheckCircle, AlertCircle, List) are imported from lucide-react

### 2. Update Upload History TabsList Component
- Locate the Upload History Tabs section at app/stock-config/page.tsx:640-647
- Modify each TabsTrigger to include an icon before the text label
- Apply the following structure to each tab:
  ```tsx
  <TabsTrigger value="...">
    <IconComponent className="h-3.5 w-3.5 mr-1.5 text-[color]" />
    Label Text
  </TabsTrigger>
  ```

### 3. Apply Icon and Color Styling to Each Tab
- **All tab** (value="all"): Add List icon with text-gray-500 or text-muted-foreground class
- **Pending tab** (value="pending"): Add Clock icon with text-amber-600 class
- **Processed tab** (value="processed"): Add CheckCircle icon with text-green-600 class
- **Error tab** (value="error"): Add AlertCircle icon with text-red-600 class
- Add small right margin (mr-1.5) to each icon for spacing from text
- Ensure icon color classes persist when tab is active by using explicit color classes

### 4. Validate Visual Consistency
- Ensure icon styling matches the Upload Status card (lines 506-542) which uses similar icons and colors
- Verify icon size (h-3.5 w-3.5) is appropriate for tab labels
- Check that spacing between icon and text is consistent across all tabs
- Confirm icon colors remain visible in both active and inactive tab states

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm run build` - Verify TypeScript compilation passes with no errors
- `pnpm run lint` - Check for ESLint warnings or errors
- Manual browser test:
  1. Navigate to http://localhost:3000/stock-config
  2. Scroll to Upload History section
  3. Verify all four tabs display icons with correct colors
  4. Click each tab and verify icons remain visible when active
  5. Compare visual styling with Upload Status card above for consistency

## Notes
- The icons are already used in the Upload Status card (lines 512, 524, 536), so we're maintaining visual consistency across the page
- The TabsTrigger component uses Radix UI which supports inline content, so icons can be placed directly before text
- Icon colors should use explicit Tailwind classes (text-amber-600, text-green-600, text-red-600) rather than CSS variables to ensure visibility in active state
- Consider using `flex items-center gap-1.5` wrapper if icon alignment needs adjustment
