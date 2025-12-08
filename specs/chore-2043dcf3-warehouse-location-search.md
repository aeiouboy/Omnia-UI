# Chore: Add Search Functionality to Stock Location Popover

## Metadata
adw_id: `2043dcf3`
prompt: `Add search functionality to the Stock Breakdown by Location popover. The search should:
1. Add a search input field at the top of the popover (below the header)
2. Filter warehouse locations in real-time as the user types
3. Search should match against warehouse codes and location codes
4. Show 'No locations found' message when search returns no results
5. Include a clear/reset button (X) to clear the search
6. Use appropriate placeholder text like 'Search warehouse or location...'
7. Maintain existing styling and layout
Reference: StockLocationPopover component at src/components/inventory/stock-location-popover.tsx`

## Chore Description
Enhance the StockLocationPopover component by adding a search/filter input field that allows users to quickly find specific warehouse locations within the popover. The search functionality should filter the list of warehouse locations in real-time based on user input, matching against both warehouse codes and location codes. This improves usability when dealing with multiple warehouse locations, allowing users to quickly navigate to specific locations without scrolling through the entire list.

## Relevant Files
Use these files to complete the chore:

- **src/components/inventory/stock-location-popover.tsx** - Main component file where search functionality will be added. Currently displays a list of warehouse locations in a popover with stock breakdown details.
- **src/lib/warehouse-utils.ts** - Contains utility functions including `formatWarehouseCode()` which is used to format the display codes. We'll use this to ensure search matches against the formatted codes.
- **src/components/ui/input.tsx** - Shadcn/ui Input component that will be used for the search field. Already styled with the project's design system.
- **src/types/inventory.ts** - TypeScript type definitions including `StockLocation` interface which defines the structure of location data being filtered.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Add React State and Imports
- Import `useState` hook from React (if not already imported)
- Import `Search` and `X` icons from "lucide-react" for the search input and clear button
- Import the `Input` component from "@/components/ui/input"
- Add state variable `searchQuery` with `useState("")` to track the search input value

### 2. Create Search Filter Function
- Create a `filteredLocations` computed value using `useMemo` or inline filtering
- Filter the `locations` array based on `searchQuery`
- Implement case-insensitive search matching against:
  - `location.warehouseCode` (exact and partial matches)
  - `location.locationCode` (exact and partial matches)
  - The formatted code from `formatWarehouseCode(location.warehouseCode, location.locationCode)`
- Return all locations when `searchQuery` is empty
- Performance: Use `useMemo` to avoid recalculating on every render

### 3. Add Search Input UI
- Insert a search input section between the header div (lines 70-75) and the scrollable list div (line 77)
- Create a new div with padding classes `px-4 py-3 border-b`
- Add the `Input` component with:
  - Type: "text"
  - Placeholder: "Search warehouse or location..."
  - Value: bound to `searchQuery` state
  - OnChange: update `searchQuery` state
  - Additional styling: "pr-8" for padding to accommodate clear button
- Wrap the Input in a relative positioned div to allow absolute positioning of icons

### 4. Add Search Icon and Clear Button
- Add a wrapper div with `relative` class around the Input component
- Add Search icon positioned absolutely on the left side of the input (left-3)
- Adjust Input padding-left to accommodate the search icon (pl-9)
- Add X (clear) icon button positioned absolutely on the right side of the input (right-3)
- Clear button should:
  - Only be visible when `searchQuery.length > 0`
  - Be clickable with `onClick` handler that sets `searchQuery` to ""
  - Have hover styles for better UX (hover:bg-gray-100 rounded)
  - Include accessible attributes (aria-label="Clear search")

### 5. Update List Rendering Logic
- Replace `locations.map()` with `filteredLocations.map()` in the render section (line 78)
- Add conditional rendering for "No locations found" message
- Show message when `filteredLocations.length === 0 && searchQuery.length > 0`
- Style the empty state message to match the existing design (centered, muted text, py-8)
- Ensure the message is only shown when actively searching (not when locations array is empty)

### 6. Update Footer Summary
- Update the total stock calculation to use `filteredLocations` instead of `locations`
- Update the locations count display to show filtered count when search is active
- Consider showing "X of Y locations" format when filtering is active (e.g., "3 of 8 locations")

## Validation Commands
Execute these commands to validate the chore is complete:

- `npm run dev` - Start development server and verify no TypeScript compilation errors
- Manual Testing Checklist:
  1. Navigate to the inventory page with items that have warehouse locations
  2. Click on "View Locations" button to open the popover
  3. Type in the search input and verify real-time filtering works
  4. Test search with warehouse codes (e.g., "CMG", "1005")
  5. Test search with location codes (e.g., "1055")
  6. Test partial matches (e.g., typing "10" should match "1005" and "1055")
  7. Test case-insensitivity (e.g., "cmg" should match "CMG")
  8. Verify "No locations found" message appears with no matches
  9. Verify clear button (X) appears when typing and clears search when clicked
  10. Verify total stock and location count updates correctly when filtering
  11. Verify existing styling and layout is maintained
  12. Test on mobile viewport to ensure responsive design
- `npm run build` - Ensure production build completes without errors

## Notes

### Design Considerations
- The search should feel responsive and performant even with many locations
- Using `useMemo` or direct filtering in render is acceptable given typical location counts (< 50)
- The search should be case-insensitive to improve user experience
- Maintain existing accessibility features (ARIA labels, keyboard navigation)

### Edge Cases to Handle
- Empty search string should show all locations
- Search with no results should show helpful message, not empty space
- Clear button should only appear when there's text to clear
- Component should handle undefined/null locations array gracefully (already does)

### Style Consistency
- Follow existing Tailwind class patterns in the component
- Use the same spacing (px-4, py-3) as other sections
- Match border styles (border-b) with existing sections
- Use muted colors for placeholder text and icons
- Ensure the search section integrates seamlessly with the popover design
