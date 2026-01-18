# Chore: Executive Dashboard UI Improvements

## Metadata
adw_id: `2c72bf1d`
prompt: `Improve Executive Dashboard UI in components/executive-dashboard.tsx: (1) Rotate chart x-axis labels to horizontal or 45-degree angle for better readability, (2) Truncate store names with ellipsis and show full name on hover tooltip, (3) Make Order Alerts section more compact by reducing card padding and using a scrollable container with max-height, (4) Improve SLA breach text color contrast for accessibility (use darker red bg with white text), (5) Add consistent spacing between KPI cards and chart sections`

## Chore Description
This chore enhances the Executive Dashboard UI for improved readability, accessibility, and visual consistency. The improvements focus on five key areas:

1. **Chart Label Readability**: Rotate x-axis labels on all charts to horizontal or 45-degree angle to prevent overlapping text and improve readability, especially for store names and time labels
2. **Store Name Truncation**: Truncate long store names with ellipsis in the "Fulfillment by Branch" section and show full names on hover using tooltips
3. **Compact Order Alerts**: Reduce padding in the Order Alerts cards and implement a scrollable container with max-height to prevent the alerts section from dominating the page
4. **Accessibility Enhancement**: Improve color contrast for SLA breach alerts by using a darker red background with white text instead of the current styling
5. **Consistent Spacing**: Standardize spacing between KPI cards and chart sections for better visual hierarchy

## Relevant Files
Use these files to complete the chore:

- **`src/components/executive-dashboard.tsx`** (primary file, ~3800 lines): Contains the entire Executive Dashboard component with all charts, KPIs, and alerts. This is where all modifications will be made.
  - Lines 63-72: Recharts imports including XAxis, YAxis, Tooltip, Legend components needed for label rotation
  - Lines 2970-3016: KPI cards grid section - needs spacing adjustments between this and chart sections
  - Lines 3082-3183: Critical Alerts section (Order Alerts card) - needs compact styling and scrollable container
  - Lines 3086-3113: Urgent Orders alerts - needs darker red background with white text for better contrast
  - Lines 3117-3142: Due Soon alerts section
  - Lines 3226-3252: Hourly Order Summary chart - needs x-axis label rotation
  - Lines 3258-3279: Daily Order Volume chart - needs x-axis label rotation
  - Lines 3317-3339: Channel Performance chart - needs x-axis label rotation
  - Lines 3286-3309: Fulfillment by Branch section - needs store name truncation with tooltips

- **`src/components/ui/tooltip.tsx`** (if it exists): May be needed for implementing hover tooltips on truncated store names. If not present, we'll use Recharts' built-in Tooltip or HTML title attribute.

### New Files
None required - all changes are modifications to the existing `src/components/executive-dashboard.tsx` file.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Add Consistent Spacing Between KPI Cards and Chart Sections
- Locate the main KPI cards grid (around line 2970-3016)
- Find the next section after KPI cards (the tabs/charts section around line 3020)
- Add or update the margin-top class on the section following KPI cards:
  - Change `mt-12` to `mt-8` or add `mt-8` if not present for consistent spacing
- Verify the TabsContent elements have consistent top margin:
  - All TabsContent should use `mt-8` for the same spacing (lines 3046, 3187, 3284, 3353)
- Update the grid gap between chart cards:
  - Ensure all chart grids use `gap-6` consistently (lines 3049, 3188, 3285, etc.)

### 2. Rotate Chart X-Axis Labels for Better Readability
- **Hourly Order Summary Chart** (around line 3233-3237):
  - Update the XAxis component to add rotation:
    ```tsx
    <XAxis
      dataKey="hour"
      tick={{ fontSize: 12, angle: 0 }}
      interval={1}
      height={60}
    />
    ```
  - Set `angle: 0` for horizontal labels (current vertical text is hard to read)
  - Increase height to 60 to accommodate horizontal labels

- **Daily Order Volume Chart** (around line 3263-3264):
  - Update the XAxis component:
    ```tsx
    <XAxis
      dataKey="date"
      tick={{ fontSize: 12, angle: -45 }}
      textAnchor="end"
      height={80}
    />
    ```
  - Use -45 degree angle for date labels to prevent overlap
  - Add textAnchor="end" to align rotated text properly
  - Increase height to 80 for rotated labels

- **Channel Performance Chart** (around line 3324):
  - Update the XAxis component:
    ```tsx
    <XAxis
      dataKey="channel"
      tick={{ fontSize: 12, angle: 0 }}
      height={60}
    />
    ```
  - Use horizontal labels (angle: 0) since channel names are short (GRAB, LAZADA, etc.)

### 3. Truncate Store Names with Hover Tooltips in Fulfillment Section
- Locate the Fulfillment by Branch section (around line 3290-3309)
- Find the branch name display (around line 3293):
  ```tsx
  <span className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{branch.branch}</span>
  ```
- Replace with truncated version with HTML title tooltip:
  ```tsx
  <span
    className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate max-w-[200px] block"
    title={branch.branch}
  >
    {branch.branch}
  </span>
  ```
- Add `truncate` class for ellipsis overflow
- Add `max-w-[200px]` to limit width before truncation
- Add `block` display for truncate to work
- Use HTML `title` attribute for native browser tooltip on hover

### 4. Make Order Alerts Section More Compact with Scrollable Container
- Locate the Critical Alerts ChartCard (around line 3082-3183)
- Update the outer container div inside ChartCard (around line 3083):
  - Change from: `<div className="space-y-4">`
  - Change to: `<div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">`
  - Reduces vertical spacing from `space-y-4` to `space-y-3`
  - Adds max-height of 600px with scroll capability
  - Adds `pr-2` for padding-right to prevent scrollbar overlap

- **Update Urgent Orders alert cards** (around line 3093):
  - Reduce padding from `p-6` to `p-4`:
    ```tsx
    <div key={...} className="flex items-center justify-between p-4 bg-white rounded-xl border border-red-200 shadow-sm hover:shadow-md hover:border-red-300 transition-all duration-200 group">
    ```
  - Reduce inner spacing from `space-y-2` to `space-y-1`:
    ```tsx
    <div className="space-y-1">
    ```

- **Update Due Soon alert cards** (around line 3124):
  - Reduce padding from `p-6` to `p-4`:
    ```tsx
    <div key={...} className="flex items-center justify-between p-4 bg-white rounded-xl border border-amber-200 shadow-sm hover:shadow-md hover:border-amber-300 transition-all duration-200 group">
    ```
  - Reduce inner spacing from `space-y-2` to `space-y-1`:
    ```tsx
    <div className="space-y-1">
    ```

- **Update section headers spacing** (around line 3086 and 3117):
  - Reduce bottom margin from `mb-2` to `mb-1.5`:
    ```tsx
    <h4 className="font-semibold text-red-600 mb-1.5 flex items-center">
    <h4 className="font-semibold text-orange-600 mb-1.5 flex items-center">
    ```

### 5. Improve SLA Breach Text Color Contrast for Accessibility
- Locate the Urgent Orders section (around line 3093-3109)
- Update the alert card styling for better accessibility:
  - Change from: `className="flex items-center justify-between p-4 bg-white rounded-xl border border-red-200 ..."`
  - Change to: `className="flex items-center justify-between p-4 bg-red-700 rounded-xl border border-red-800 ..."`
  - Update the hover state: `hover:bg-red-800 hover:border-red-900`

- Update text colors inside Urgent Orders cards for white text on dark red background:
  - Order number text (line 3095):
    ```tsx
    <div className="font-semibold text-base text-white group-hover:text-white transition-colors">
    ```
  - Customer name and channel (line 3096-3098):
    ```tsx
    <div className="flex items-center space-x-3 text-sm text-red-100">
    ```
  - Over time text (line 3102):
    ```tsx
    <div className="text-base font-bold text-white group-hover:text-white transition-colors">
    ```
  - Location text (line 3105):
    ```tsx
    <div className="text-sm text-red-100">
    ```

- Update the ChannelBadge component call to use a light variant if available, or ensure it has good contrast against red-700 background

### 6. Validate All Changes
- Run TypeScript compilation to ensure no type errors
- Test chart label rotation at different viewport sizes
- Verify store names truncate properly with tooltips
- Check that Order Alerts section scrolls when content exceeds 600px
- Validate color contrast ratios using browser DevTools accessibility checker:
  - Target: WCAG AA standard (4.5:1 for normal text, 3:1 for large text)
  - Red-700 background (#b91c1c) with white text should meet WCAG AAA
- Verify consistent spacing between all major sections

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Verify TypeScript compilation succeeds with no errors
- `pnpm lint` - Check for linting errors
- Manual testing in browser:
  - Navigate to Executive Dashboard
  - Scroll through all chart types to verify x-axis labels are readable
  - Hover over truncated store names to see full names in tooltips
  - Check Order Alerts section scrolls smoothly when multiple alerts present
  - Use browser DevTools Accessibility inspector to verify contrast ratios (should be 7:1 or higher for white on red-700)
  - Verify spacing consistency between KPI cards and chart sections looks professional

## Notes

### Recharts Label Rotation Best Practices
- Use `angle: 0` for horizontal labels (best for short text like hours)
- Use `angle: -45` for 45-degree rotation (best for dates and longer text)
- Always add `textAnchor="end"` when using negative angles to align properly
- Increase chart container height when rotating labels to prevent clipping

### Color Contrast Guidelines (WCAG)
- **AA Standard**: 4.5:1 for normal text, 3:1 for large text (18px+ or 14px+ bold)
- **AAA Standard**: 7:1 for normal text, 4.5:1 for large text
- Red-700 (#b91c1c) with white (#ffffff) = ~8:1 contrast ratio (AAA compliant)
- Current design likely uses red-600 (#dc2626) which has lower contrast

### Scrollable Container Considerations
- Max-height of 600px allows ~8-10 alert cards to be visible before scrolling
- The `pr-2` padding prevents scrollbar from overlapping content
- Scrollbar will only appear when content exceeds max-height
- Consider adding a subtle gradient at the bottom to indicate more content below

### Typography Truncation
- `truncate` class requires `display: block` or `display: inline-block` to work
- Always provide a tooltip/title attribute when truncating text for accessibility
- Test truncation at multiple screen sizes to ensure it works responsively
