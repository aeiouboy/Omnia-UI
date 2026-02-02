# Chore: Add Order Data Fetching to OrderDetailView Component

## Metadata
adw_id: `70d7fd1c`
prompt: `Add order data fetching to OrderDetailView component when orderId prop is provided. Currently the component at src/components/order-detail-view.tsx accepts orderId prop (line 72) but has NO useEffect to fetch order data - it only fetches notes (line 282-289). When accessed via dedicated page /orders/[id], only orderId is passed, so the component shows N/A for all fields. Fix: (1) Add useState for orderData and loading state, (2) Add useEffect that fetches from /api/orders/details/{orderId} when orderId prop is provided and order prop is null, (3) Use fetched orderData as fallback: const displayOrder = order || orderData, (4) Show loading skeleton while fetching, (5) Handle fetch errors gracefully. Keep existing behavior when order prop is passed directly.`

## Chore Description
The `OrderDetailView` component currently supports two usage patterns:
1. **Modal pattern**: Receives the full `order` object directly as a prop (used in modal overlays)
2. **Route pattern**: Receives only `orderId` string prop (used when navigating to `/orders/[id]` dedicated page)

The problem is that when accessed via the dedicated route (`/orders/[id]`), only the `orderId` is passed to the component. The component has no data fetching logic for this scenario - it only has a useEffect (lines 282-289) that fetches notes, not the order data itself. This results in all order fields displaying "N/A" or empty values.

The fix requires:
1. Adding `useState` hooks for fetched order data and loading state
2. Adding a `useEffect` hook that fetches from `/api/orders/details/{orderId}` when `orderId` is provided but `order` prop is null/undefined
3. Using the fetched data as a fallback: `const displayOrder = order || fetchedOrderData`
4. Showing a loading skeleton while the fetch is in progress
5. Handling fetch errors gracefully with toast notifications
6. Preserving existing behavior when `order` prop is passed directly (modal pattern)

## Relevant Files
Use these files to complete the chore:

- **src/components/order-detail-view.tsx** - Main component to modify. Currently accepts `orderId` prop (line 72) but lacks data fetching logic. Needs useState for orderData/loading, useEffect for fetching, and loading skeleton UI.
- **app/api/orders/details/[id]/route.ts** - Existing API endpoint that returns order details. Returns `{ success: boolean, data: Order | null, mockData?: boolean }`. Supports lookup by `id` or `order_no`.
- **app/orders/[id]/page.tsx** - Dedicated order detail page that passes only `orderId` to OrderDetailView component (line 14).
- **src/components/order-management-hub.tsx** - Contains the `Order` type definition (imported at line 55 of order-detail-view.tsx). Reference for type structure.
- **src/components/ui/skeleton.tsx** - Existing Skeleton component for loading states.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Add State Variables for Order Data Fetching
- Add `useState` for `fetchedOrder` to store API response data (type: `Order | null`, initial: `null`)
- Add `useState` for `isLoading` to track loading state (type: `boolean`, initial: `false`)
- Add `useState` for `fetchError` to track error state (type: `string | null`, initial: `null`)
- Place these after the existing state declarations (around line 268)

### 2. Create the displayOrder Computed Value
- After the new state declarations, create a computed value: `const displayOrder = order || fetchedOrder`
- This ensures the component uses the prop if provided, otherwise falls back to fetched data

### 3. Add useEffect Hook for Order Data Fetching
- Create a new `useEffect` that runs when `orderId` changes
- Only fetch if: `orderId` is provided AND `order` prop is null/undefined
- Set `isLoading` to `true` before fetching
- Fetch from `/api/orders/details/${orderId}`
- Parse response and set `fetchedOrder` from `response.data`
- Handle errors by setting `fetchError` and showing toast notification
- Set `isLoading` to `false` after fetch completes (in finally block)
- Place this useEffect BEFORE the existing notes fetch useEffect (before line 282)

### 4. Update Existing Notes useEffect Dependency
- Modify the notes fetch useEffect (lines 282-289) to depend on `displayOrder?.id` instead of `order?.id`
- This ensures notes are fetched after order data is loaded via API

### 5. Replace All order References with displayOrder
- Update all references to `order` in the JSX to use `displayOrder`
- Key locations include:
  - Header section (order_no display, copy functionality)
  - Quick Info Cards (status, channel, total_amount)
  - Overview tab (customer, order info, delivery, payment)
  - Items tab (items array filtering and rendering)
  - Payments tab (order prop)
  - Fulfillment tab (orderData prop)
  - Notes tab (order?.id references)
  - Tracking tab (orderData prop)
  - Audit Trail tab (orderData prop)
  - Cancel dialog (order_no, status checks)
- Do NOT change the props interface - keep accepting `order` as optional

### 6. Add Loading Skeleton UI
- Import `Skeleton` component from "@/components/ui/skeleton" if not already imported
- Wrap the main content in a conditional render:
  - If `isLoading` is true: render loading skeleton with similar structure to actual content
  - If `isLoading` is false: render actual content
- Loading skeleton should include:
  - Header skeleton (title and order number)
  - Quick info cards skeleton (3 cards with skeleton content)
  - Tab content area skeleton (card with skeleton lines)

### 7. Add Error State Handling
- After the loading check, add error state handling:
  - If `fetchError` is truthy AND `!displayOrder`: show error alert with retry button
  - Use existing Alert component for error display
  - Retry button should clear error and re-trigger fetch

### 8. Update canCancelOrder Check
- Update the `canCancelOrder` computation (lines 274-276) to use `displayOrder?.status` instead of `order?.status`

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure the code compiles without TypeScript errors
- `pnpm lint` - Verify no linting errors
- `pnpm dev` - Start dev server and manually test:
  1. Navigate to `/orders` page
  2. Click on any order row to navigate to `/orders/[id]`
  3. Verify order details load and display correctly
  4. Verify loading skeleton appears briefly before data loads
  5. Test browser refresh on `/orders/[id]` page - should still load correctly
  6. Verify back button navigates to `/orders`

## Notes
- The API endpoint `/api/orders/details/[id]/route.ts` already exists and returns order data in the correct format
- The API response structure is `{ success: boolean, data: Order | null, mockData?: boolean }`
- When using mock data, the API falls back gracefully - component should work with both real and mock data
- The `Order` type is already imported from `order-management-hub.tsx` at line 55
- Existing modal-based usage (where `order` prop is passed) must continue to work unchanged
- Consider adding a brief artificial delay or transition for smoother UX if API is very fast
