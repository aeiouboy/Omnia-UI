# Chore: Implement Product Info Card (Version 1 - Inline Card Above Table)

## Metadata
adw_id: `5edd747d`
prompt: `Implement Version 1 (Inline Card Above Table) from wireframe spec wf_specs/wf-stock-card-product-info.md. Add a dynamic Product Info Card to app/inventory-new/page.tsx that displays the selected product's actual data when a row is clicked. Layout: left side shows dark image placeholder with item.brand/productName, right side shows item.productName (h2), item.category, separator, three-column grid with Barcode (item.barcode), Item Type badge (item.itemType), Supply Type green badge (item.supplyType), Stock Config status (item.stockConfigStatus with checkmark), Last Restocked (formatted item.lastRestocked). Include Transaction History section below using existing TransactionHistorySection component. Add selectedProduct state, modify row click to toggle selection instead of navigation, add close button. Create new component src/components/inventory/product-info-card.tsx. Match existing inventory-new page styling.`

## Chore Description
Add a dynamic **Product Info Card** that displays above the products table when a user clicks on a product row in the Stock Card By Product page (`/inventory-new`). The card shows the selected product's actual data from the `InventoryItem` object and includes a Transaction History section below it.

Key implementation details:
1. **Product Info Card**: A new reusable component with left image section (dark placeholder with brand/product name) and right content section showing product details
2. **Row Click Behavior**: Modify table row clicks to toggle product selection instead of immediate navigation to detail page
3. **Transaction History**: Integrate the existing `TransactionHistorySection` component below the Product Info Card
4. **Close/Toggle**: Clicking the same row again or clicking a close button dismisses the card
5. **View Details Navigation**: Add a "View Full Details" button to navigate to the existing `/inventory-new/[id]` detail page

## Relevant Files
Use these files to complete the chore:

- **`app/inventory-new/page.tsx`** - Main inventory page where Product Info Card will be added. Contains product table, state management, and row click handlers that need modification.
- **`src/components/inventory/transaction-history-section.tsx`** - Existing Transaction History component to reuse. Props: `productId`, `productName`, `itemType`, `storeContext`.
- **`src/types/inventory.ts`** - TypeScript types for `InventoryItem`, `ItemType`, `SupplyType`, `StockConfigStatus` - needed for proper typing.
- **`wf_specs/wf-stock-card-product-info.md`** - Wireframe specification with visual layout, badge styling, and interaction details.
- **`src/components/ui/badge.tsx`** - Existing Badge component for styling Item Type and Supply Type badges.
- **`src/components/ui/card.tsx`** - Existing Card component for the info card container.
- **`src/lib/utils.ts`** - Utility functions including `formatGMT7Time` for formatting Last Restocked date.

### New Files
- **`src/components/inventory/product-info-card.tsx`** - New reusable Product Info Card component

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Create ProductInfoCard Component
- Create new file `src/components/inventory/product-info-card.tsx`
- Define props interface: `product: InventoryItem`, `onClose: () => void`, `onViewDetails: () => void`
- Implement left section with dark background placeholder (`bg-gray-900 rounded-xl aspect-square`) showing `item.brand` or `item.productName` centered in white text
- Implement right section with:
  - Product name as `h2` heading (`text-2xl font-bold`)
  - Category as muted text
  - Separator line (`border-t`)
  - Three-column grid for Barcode, Item Type badge, Supply Type badge
  - Stock Config status with checkmark icon
  - Last Restocked formatted date using `formatGMT7Time`
- Add close button (`X` icon) in top-right corner
- Add "View Full Details" button at bottom
- Use badge styling from wireframe spec:
  - Item Type: `weight` → blue, `pack_weight` → purple, `pack` → indigo, `normal` → gray
  - Supply Type: `On Hand Available` → green, `Pre-Order` → amber
  - Stock Config: `valid` → green checkmark, `invalid` → red X, `unconfigured` → gray circle

### 2. Add State Management to Inventory Page
- Import the new `ProductInfoCard` component
- Add `selectedProduct` state: `useState<InventoryItem | null>(null)`
- Create `handleRowClick` function that toggles selection:
  - If clicking same product, set `selectedProduct` to `null`
  - If clicking different product, set `selectedProduct` to that product
- Create `handleCloseCard` function that sets `selectedProduct` to `null`
- Create `handleViewDetails` function that navigates to `/inventory-new/${selectedProduct.id}` with optional store param

### 3. Modify Table Row Click Behavior
- Replace the existing row `onClick` that immediately navigates to detail page
- Use new `handleRowClick` function to toggle selection
- Add visual highlight to selected row (e.g., `bg-primary/5` or subtle border)
- Keep the chevron icon but make it secondary to the card display

### 4. Add Product Info Card Above Table
- Insert `ProductInfoCard` component between the KPI Summary Cards and the Products Table Tabs
- Only render when `selectedProduct` is not null
- Pass required props: `product={selectedProduct}`, `onClose={handleCloseCard}`, `onViewDetails={handleViewDetails}`
- Add smooth animation for card appearance (optional: use Collapsible from shadcn/ui)

### 5. Add Transaction History Section Below Product Info Card
- Import `TransactionHistorySection` from `@/components/inventory/transaction-history-section`
- Render `TransactionHistorySection` below the Product Info Card when `selectedProduct` is not null
- Pass required props:
  - `productId={selectedProduct.id}`
  - `productName={selectedProduct.productName}`
  - `itemType={selectedProduct.itemType}`
  - `storeContext={activeStoreFilter || undefined}`

### 6. Validate Implementation
- Run TypeScript compilation to check for type errors
- Test row click behavior (toggle selection)
- Test close button functionality
- Test "View Full Details" navigation
- Verify badge colors match wireframe spec
- Verify Transaction History loads for selected product
- Test responsive layout on different screen sizes

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Verify TypeScript compilation succeeds with no errors
- `pnpm lint` - Check for ESLint issues
- `pnpm dev` - Start development server and manually test:
  1. Navigate to `/inventory-new`
  2. Select a View Type to load products
  3. Click a product row - Product Info Card should appear above table
  4. Verify all product data displays correctly (name, category, barcode, badges, stock config, last restocked)
  5. Verify Transaction History section loads below the card
  6. Click same row again - card should close
  7. Click different row - card should show new product data
  8. Click close button - card should close
  9. Click "View Full Details" - should navigate to `/inventory-new/[id]`

## Notes
- The `TransactionHistorySection` component already handles its own loading, error, and empty states
- Badge styling should match existing patterns in the codebase (see Item Type badge in current table)
- The wireframe shows `item.imageUrl` with fallback to dark placeholder - implement image display if `imageUrl` exists
- Consider mobile responsiveness - the card layout may need to stack vertically on small screens
- The existing detail page at `/inventory-new/[id]` can be used as reference for styling patterns
