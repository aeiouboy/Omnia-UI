# Chore: Refactor Order Management Hub Navigation to Dedicated Page

## Metadata
adw_id: `0b70a919`
prompt: `Refactor Order Management Hub to navigate to dedicated order details page instead of modal overlay. Current behavior: clicking order row opens modal (handleOrderRowClick in order-management-hub.tsx). Target behavior: clicking order row should navigate to /orders/[orderId] using Next.js router. The dedicated page already exists at app/orders/[id]/page.tsx. Changes needed: (1) Replace modal open logic with router.push to /orders/{orderId}, (2) Remove modal-related state and handlers (selectedOrderForDetail, isDetailViewOpen, handleCloseDetailView), (3) Remove modal overlay JSX at lines 2574-2587, (4) Ensure OrderDetailView on dedicated page has back navigation to /orders, (5) Keep mobile card view with same navigation behavior. Preserve all existing filtering, pagination, and search functionality.`

## Chore Description
This refactoring task transitions the Order Management Hub from a modal-based order detail view to a dedicated page-based navigation pattern. Currently, when users click an order row in the Order Management Hub, a modal overlay opens with the order details (using `handleOrderRowClick` handler). This prevents URL-based sharing/bookmarking of specific orders and doesn't integrate with browser history.

The target architecture will:
1. Navigate users to `/orders/{orderId}` using Next.js router when clicking an order
2. Enable URL-based deep linking to specific orders
3. Integrate with browser back/forward navigation
4. Maintain the existing dedicated page at `app/orders/[id]/page.tsx`
5. Apply consistently across both desktop table view and mobile card view

## Relevant Files
Use these files to complete the chore:

- **`src/components/order-management-hub.tsx`** - Main component containing modal state, handlers, and JSX overlay. Primary file for changes.
  - Line 24: Imports `OrderDetailView` (to be removed)
  - Lines 924-932: `handleOrderRowClick` handler (to be refactored)
  - Lines 1007-1012: `handleCloseDetailView` handler (to be removed)
  - Lines 1018-1019: Modal state declarations (to be removed)
  - Lines 1120-1134: Escape key handler useEffect (to be removed)
  - Lines 837-842: Desktop table order number click handler
  - Lines 2506-2542: Mobile card view click handlers
  - Lines 2574-2587: Modal overlay JSX (to be removed)

- **`app/orders/[id]/page.tsx`** - Dedicated order detail page that already exists (no changes needed, already functional)

- **`src/components/order-detail-view.tsx`** - Order detail component used by the dedicated page
  - Line 52: Already imports `useRouter`
  - Line 257: Already has `router` instance
  - Line 488: Already has back navigation to `/orders` (no changes needed)

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Add useRouter Import
- Add `useRouter` import from `next/navigation` at the top of `src/components/order-management-hub.tsx`
- Add after line 6 (after existing imports from React)

### 2. Initialize Router in Component
- Add `const router = useRouter()` at the beginning of the `OrderManagementHub` function body
- Add near other hook initializations (around line 367 after `useOrganization`)

### 3. Refactor handleOrderRowClick Handler
- Modify the `handleOrderRowClick` function (lines 924-932) to use `router.push` instead of setting modal state
- Change from:
  ```typescript
  const handleOrderRowClick = (order: Order) => {
    const fullOrderData = ordersData.find((o) => o.id === order.id)
    if (fullOrderData) {
      setSelectedOrderForDetail(fullOrderData)
      setIsDetailViewOpen(true)
      document.body.style.overflow = "hidden"
    }
  }
  ```
- To:
  ```typescript
  const handleOrderRowClick = (order: Order) => {
    router.push(`/orders/${order.id}`)
  }
  ```

### 4. Remove Modal State Declarations
- Remove the following state declarations (lines 1018-1019):
  - `const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<Order | null>(null)`
  - `const [isDetailViewOpen, setIsDetailViewOpen] = useState(false)`

### 5. Remove handleCloseDetailView Handler
- Remove the entire `handleCloseDetailView` function (lines 1007-1012):
  ```typescript
  const handleCloseDetailView = () => {
    setIsDetailViewOpen(false)
    setSelectedOrderForDetail(null)
    document.body.style.overflow = "unset"
  }
  ```

### 6. Remove Escape Key Handler useEffect
- Remove the useEffect block that handles Escape key for closing the modal (lines 1120-1134):
  ```typescript
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isDetailViewOpen) {
        handleCloseDetailView()
      }
    }
    if (isDetailViewOpen) {
      document.addEventListener("keydown", handleEscapeKey)
      return () => {
        document.removeEventListener("keydown", handleEscapeKey)
      }
    }
  }, [isDetailViewOpen])
  ```

### 7. Remove Modal Overlay JSX
- Remove the modal overlay JSX block (lines 2574-2587):
  ```tsx
  {/* Order Detail View Modal/Overlay */}
  {isDetailViewOpen && selectedOrderForDetail && (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={handleCloseDetailView}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <OrderDetailView order={selectedOrderForDetail} onClose={handleCloseDetailView} />
      </div>
    </div>
  )}
  ```

### 8. Remove OrderDetailView Import
- Remove the import of `OrderDetailView` component (line 24):
  ```typescript
  import { OrderDetailView } from "./order-detail-view"
  ```

### 9. Verify Mobile Card View Click Handlers
- Confirm that the mobile card view click handlers (lines 2506-2511 and 2536-2542) will automatically use the refactored `handleOrderRowClick` function
- No code changes needed as they already call `handleOrderRowClick`

### 10. Validate Build and Lint
- Run `pnpm build` to ensure TypeScript compilation succeeds
- Run `pnpm lint` to check for any linting errors
- Verify no unused imports or variables warnings

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Verify TypeScript compilation succeeds with no errors
- `pnpm lint` - Check for any linting errors or warnings
- `pnpm dev` - Start development server and manually test:
  1. Navigate to `/orders` page
  2. Click on any order row in desktop table view - should navigate to `/orders/{orderId}`
  3. Click on any order number in mobile card view - should navigate to `/orders/{orderId}`
  4. Verify URL changes to `/orders/{orderId}` when viewing order details
  5. Click browser back button - should return to `/orders` with filters preserved
  6. Verify no modal overlay appears

## Notes
- The existing dedicated page at `app/orders/[id]/page.tsx` is already fully functional with proper back navigation to `/orders`
- The `OrderDetailView` component supports both `order` prop (full object) and `orderId` prop (for fetching)
- When navigating via router, the dedicated page receives only the `orderId` and fetches the order data internally
- All filtering, pagination, and search functionality remains unchanged as they operate independently from order detail viewing
- Browser history integration is automatic with Next.js router navigation
- URL-based bookmarking and sharing of specific orders is now possible
