# Chore: Add Allocate by Order Transactions Section

## Metadata
adw_id: `b9383718`
prompt: `Add 'Transaction about allocate by order' section to inventory detail page with tabular display showing order ID, allocation date/time, quantity, warehouse, status, and user. Include API integration, loading states, error handling, and mobile responsiveness. Follow requirements from docs/task/inv-2-allocate-transactions.md`

## Chore Description
Add a new section to the inventory detail page (`inventory-detail-view.tsx`) that displays allocation transactions by order. This section will show a tabular view of all stock allocations tied to specific orders, including:
- Order ID/Number (with clickable link to order details)
- Allocation Date/Time
- Quantity Allocated
- Warehouse/Location
- Status (pending, confirmed, cancelled)
- User who performed the allocation

The implementation requires:
1. A new TypeScript interface for the allocation transaction data
2. A new API endpoint to fetch allocate-by-order transactions
3. A new React component for displaying the transactions table
4. Integration into the existing inventory detail view
5. Loading states, error handling, and empty state UI
6. Mobile-responsive layout (table on desktop, cards on mobile)

## Relevant Files
Use these files to complete the chore:

- **`/Users/naruechon/Omnia-UI/src/components/inventory-detail-view.tsx`** - Main inventory detail page component where the new section will be added
- **`/Users/naruechon/Omnia-UI/src/components/recent-transactions-table.tsx`** - Reference implementation for transaction table patterns (loading states, filtering, badges, tooltips)
- **`/Users/naruechon/Omnia-UI/src/types/inventory.ts`** - Type definitions for inventory domain; add new interface here
- **`/Users/naruechon/Omnia-UI/docs/task/inv-2-allocate-transactions.md`** - Requirements specification with data structure
- **`/Users/naruechon/Omnia-UI/src/lib/mock-inventory-data.ts`** - Mock data generator; add mock allocate transactions
- **`/Users/naruechon/Omnia-UI/src/components/ui/table.tsx`** - UI table components
- **`/Users/naruechon/Omnia-UI/src/components/ui/skeleton.tsx`** - Loading skeleton component
- **`/Users/naruechon/Omnia-UI/src/components/ui/badge.tsx`** - Status badge component
- **`/Users/naruechon/Omnia-UI/src/components/ui/card.tsx`** - Card container component
- **`/Users/naruechon/Omnia-UI/app/api/orders/route.ts`** - Reference for API route patterns

### New Files
- **`/Users/naruechon/Omnia-UI/src/components/allocate-by-order-table.tsx`** - New component for allocation transactions table
- **`/Users/naruechon/Omnia-UI/app/api/inventory/[item_id]/allocate-transactions/route.ts`** - New API endpoint for fetching allocations
- **`/Users/naruechon/Omnia-UI/src/hooks/use-allocate-transactions.ts`** - Custom hook for fetching and managing allocation data

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Add TypeScript Interface to Inventory Types
- Open `/Users/naruechon/Omnia-UI/src/types/inventory.ts`
- Add the `AllocateByOrderTransaction` interface as defined in the requirements:
  ```typescript
  export interface AllocateByOrderTransaction {
    id: string
    order_id: string
    order_no: string
    allocated_at: string
    quantity: number
    warehouse_id: string
    warehouse_name: string
    status: 'pending' | 'confirmed' | 'cancelled'
    allocated_by: string
    allocated_by_name: string
  }
  ```
- Add `AllocateByOrderStatus` type for status values

### 2. Create Mock Data Generator Function
- Open `/Users/naruechon/Omnia-UI/src/lib/mock-inventory-data.ts`
- Add function `generateMockAllocateTransactions(productId: string): AllocateByOrderTransaction[]`
- Generate 5-10 realistic mock transactions with:
  - Order numbers like "ORD-12345"
  - Realistic warehouse names from existing data
  - Mix of pending, confirmed, and cancelled statuses
  - Realistic user names

### 3. Create API Endpoint for Allocate Transactions
- Create directory `/Users/naruechon/Omnia-UI/app/api/inventory/[item_id]/allocate-transactions/`
- Create `route.ts` file with GET handler
- Accept `item_id` as dynamic route parameter
- Return mock data for now (ready for backend integration)
- Include proper error handling and response structure
- Add CORS headers following existing API patterns

### 4. Create Custom Hook for Data Fetching
- Create `/Users/naruechon/Omnia-UI/src/hooks/use-allocate-transactions.ts`
- Implement `useAllocateTransactions(itemId: string)` hook
- Return `{ data, loading, error, refetch }` object
- Use SWR or native fetch with loading state management
- Handle error states gracefully

### 5. Create AllocateByOrderTable Component
- Create `/Users/naruechon/Omnia-UI/src/components/allocate-by-order-table.tsx`
- Use "use client" directive
- Import UI components: Card, Table, Badge, Skeleton, Button
- Implement props interface:
  ```typescript
  interface AllocateByOrderTableProps {
    transactions: AllocateByOrderTransaction[]
    loading?: boolean
    error?: string
    onRetry?: () => void
  }
  ```
- Implement table layout with columns:
  - Order ID (clickable link to `/orders/{order_id}`)
  - Allocation Date/Time (formatted with locale string)
  - Quantity (with proper formatting)
  - Warehouse (with MapPin icon badge)
  - Status (colored badge: green=confirmed, yellow=pending, red=cancelled)
  - Allocated By (user name)
- Implement loading skeleton (5 rows)
- Implement empty state with informative message
- Implement error state with retry button
- Add mobile responsive layout:
  - Desktop: full table
  - Mobile: card-based layout showing key fields

### 6. Integrate Component into Inventory Detail View
- Open `/Users/naruechon/Omnia-UI/src/components/inventory-detail-view.tsx`
- Import the new `AllocateByOrderTable` component
- Import the `useAllocateTransactions` hook
- Add hook call in component: `const { data: allocateTransactions, loading: allocateLoading, error: allocateError, refetch } = useAllocateTransactions(item.id)`
- Add the new section after "Recent Transactions" section:
  ```tsx
  {/* Allocate by Order Transactions */}
  <AllocateByOrderTable
    transactions={allocateTransactions || []}
    loading={allocateLoading}
    error={allocateError}
    onRetry={refetch}
  />
  ```
- Ensure proper spacing with existing sections

### 7. Add Mobile Responsive Styles
- In `AllocateByOrderTable`, implement responsive breakpoints:
  - `hidden md:table-cell` for less critical columns on mobile
  - Card layout for mobile using `md:hidden` and `hidden md:block`
- Ensure minimum 44px touch targets for interactive elements
- Test with viewport sizes: 320px, 375px, 768px, 1024px

### 8. Validate Implementation
- Run `pnpm dev` to start development server
- Navigate to an inventory item detail page
- Verify:
  - Section appears with title "Transaction about allocate by order"
  - Table displays mock data correctly
  - Loading skeleton shows briefly on initial load
  - Order IDs are clickable and link to correct order page
  - Status badges have correct colors
  - Mobile layout switches to cards below 768px width
  - No console errors

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure no TypeScript or build errors
- `pnpm lint` - Ensure no ESLint errors
- `pnpm dev` - Start dev server and manually test the feature at `/inventory/{item_id}`

## Notes
- The API endpoint returns mock data initially; backend integration can be added later
- Follow the existing pattern from `RecentTransactionsTable` for consistency
- The component should handle the `storeContext` prop similar to other sections (filter by store if provided)
- Status colors follow the project's existing badge color scheme:
  - Confirmed: `bg-green-100 text-green-800`
  - Pending: `bg-yellow-100 text-yellow-800`
  - Cancelled: `bg-red-100 text-red-800`
- Date/time formatting should use locale string for internationalization readiness
