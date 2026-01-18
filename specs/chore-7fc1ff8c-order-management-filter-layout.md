# Chore: Improve Order Management Filter Layout

## Metadata
adw_id: `7fc1ff8c`
prompt: `Improve Order Management filter layout at src/components/order-management-hub.tsx:
1. Reorganize Main Filters section - group related filters together (Status dropdowns in one row, Date fields in another)
2. Make the search input field wider to accommodate longer order numbers
3. Align Order Date From and Order Date To fields horizontally with equal width
4. Add visual separation between filter groups
5. Consider making filter dropdowns consistent width for visual alignment`

## Chore Description
Reorganize the Main Filters section in the Order Management Hub to improve usability and visual consistency. Currently, filters are arranged in a single 6-column grid that mixes different filter types together. The improved layout will:

1. **Group related filters logically**: Status-related dropdowns (Order Status, Payment Status) together; location/channel filters (Store No., Channel) together
2. **Widen search input**: Currently spans 4 columns on xl screens - make it full-width or more prominent
3. **Align date fields**: Ensure Order Date From and Order Date To are side-by-side with equal widths
4. **Add visual separation**: Use borders, spacing, or subtle backgrounds to distinguish filter groups
5. **Consistent dropdown widths**: Ensure all Select components have consistent minimum widths for visual alignment

## Relevant Files
Use these files to complete the chore:

- **src/components/order-management-hub.tsx** (lines 1850-1996): Main component containing the filter layout. The Main Filters Section starts at line 1850 with a grid layout containing search input and various filter dropdowns.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Restructure Main Filters Section Layout
- Replace the single 6-column grid with multiple grouped rows
- Create a new layout structure:
  - **Row 1 (Search)**: Full-width search input field that spans entire row
  - **Row 2 (Status Filters)**: Order Status and Payment Status dropdowns side-by-side
  - **Row 3 (Location & Channel)**: Store No. and Channel dropdowns side-by-side
  - **Row 4 (Date Range)**: Order Date From and Order Date To pickers with equal widths

### 2. Update Search Input Styling
- Change search input from `sm:col-span-2 lg:col-span-3 xl:col-span-4` to full width
- Add `max-w-full` or `w-full` to ensure it uses available space
- Keep the existing height (`h-11`) and icon positioning

### 3. Create Filter Group Containers
- Wrap each filter group (Status, Location/Channel, Dates) in a div with visual separation
- Add subtle border-b or border with `border-gray-200` between groups
- Consider using `pb-3 mb-3` for bottom padding and margin between groups
- Optionally add a small label for each group (e.g., "Status", "Location", "Date Range")

### 4. Standardize Dropdown Widths
- Add `min-w-[180px]` or similar consistent minimum width to all Select components
- Use `flex-1` on filter dropdowns within each row to ensure they grow equally
- Maintain the existing `h-11` height for consistency

### 5. Align Date Fields Horizontally
- Ensure Date From and Date To are in a 2-column grid: `grid grid-cols-2 gap-3`
- Remove the current 5-column grid on Row 2 (line 1925)
- Both date pickers should have equal widths using `flex-1` or `w-full`

### 6. Validate Layout Changes
- Run development server and verify filter layout renders correctly
- Check responsive behavior on mobile (single column), tablet (2 columns), and desktop (grouped rows)
- Ensure all filters still function correctly after layout changes
- Run build to verify no TypeScript errors

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure TypeScript compiles without errors
- `pnpm dev` - Start development server to visually verify the layout changes
- Navigate to Order Management page and verify:
  - Search input is full-width
  - Status dropdowns (Order Status, Payment Status) are grouped together
  - Location/Channel dropdowns (Store No., Channel) are grouped together
  - Date fields are horizontally aligned with equal widths
  - Visual separation exists between filter groups
  - Responsive layout works on different screen sizes

## Notes
- The current layout uses a 6-column responsive grid that becomes crowded on smaller screens
- Filter grouping will improve discoverability and reduce cognitive load
- Consider adding optional group labels (e.g., "Status Filters", "Date Range") if space permits
- The Advanced Filters section (Collapsible) starting at line 1998 should remain unchanged
- Maintain existing filter state management - only modify the JSX layout, not the filter logic
