# Chore: Remove 'Fetch All Pages' Button from Order Management Hub

## Metadata
adw_id: `48d25133`
prompt: `Remove the 'Fetch All Pages' button from the Order Management Hub in src/components/order-management-hub.tsx. This button is located in the pagination controls section and should be completely removed from the UI.`

## Chore Description
Remove the "Fetch All Pages" button and all associated functionality from the Order Management Hub component. This includes:
- The button UI element labeled "Fetch All Pages" / "Switch to Paginated View"
- The `fetchAllMode` state variable
- The `fetchingAllProgress` state variable
- The `fetchAllOrders` function
- All conditional rendering logic based on `fetchAllMode`
- The conditional display of pagination controls

## Relevant Files
Use these files to complete the chore:

### Files to Modify
- **`src/components/order-management-hub.tsx`** - Main component containing the "Fetch All Pages" button and all associated fetch all functionality

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Remove State Variables
- Remove the `fetchAllMode` state declaration (around line 806)
- Remove the `fetchingAllProgress` state declaration (around line 807)

### 2. Remove the fetchAllOrders Function
- Remove the entire `fetchAllOrders` callback function (around lines 810-922)
- This function handles fetching all pages of orders with progress tracking

### 3. Update fetchOrders Function
- Remove the conditional logic checking `fetchAllMode` (around lines 926-928)
- Remove `fetchAllMode` and `fetchAllOrders` from the dependency array (around line 998)

### 4. Remove the Fetch All Toggle UI
- Remove the "Fetch All Toggle" section (around lines 2430-2457)
- This includes:
  - The Button component with Download icon
  - The label text showing order count when in fetch all mode
  - The info alert explaining the fetch all mode
- Keep only the pagination controls section

### 5. Restore Unconditional Pagination Controls
- Remove the conditional `{!fetchAllMode && (...)}` wrapper around PaginationControls (around line 2459)
- PaginationControls should always be visible

### 6. Clean Up Import Statements (if needed)
- Check if `Download` icon from lucide-react is still used elsewhere
- If not, remove it from the import statement

### 7. Verify No Leftover References
- Search for any remaining references to `fetchAllMode` in the file
- Search for any remaining references to `fetchingAllProgress` in the file
- Search for any remaining references to `fetchAllOrders` in the file

### 8. Validate the Changes
- Run `pnpm dev` to verify the application starts without errors
- Navigate to the Order Management page
- Verify the table displays correctly with standard pagination
- Verify no "Fetch All Pages" button is visible
- Test pagination controls work correctly (Previous, Next, page size selector)

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm dev` - Start development server to verify no compilation errors
- `pnpm build` - Verify production build succeeds
- `grep -r "fetchAllMode\|fetchAllOrders\|fetchingAllProgress" src/components/order-management-hub.tsx` - Should return no results
- `grep -r "Fetch All Pages" src/components/order-management-hub.tsx` - Should return no results

## Notes
- The "Fetch All Pages" feature was designed to allow users to fetch all pages of orders at once instead of paginating through them
- Removing this feature simplifies the UI and ensures consistent pagination behavior
- The existing pagination controls (Previous, Next, page size) will remain the primary method for navigating order data
- Ensure the Download icon import is only removed if it's not used elsewhere in the component
- After removal, the component will use a simpler pagination-only workflow
