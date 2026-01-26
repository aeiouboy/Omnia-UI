# Chore: Add Product Info Card to Stock Card By Product View

## Metadata
adw_id: `bf6f530d`
prompt: `Add Product Info Card to the Stock Card 'By Product' view at app/inventory-new/stores/page.tsx. When a product is selected/searched, display a Product Info Card ABOVE the Transaction History table showing the selected product's actual data. Layout per wireframe wf_specs/wf-stock-card-product-info.md: left side shows dark image placeholder (bg-gray-900 rounded-xl) with item.brand/productName in white text, right side shows item.productName (h2), item.category, separator, three-column grid with Barcode (item.barcode), Item Type badge (item.itemType), Supply Type green badge (item.supplyType), Stock Config status with checkmark (item.stockConfigStatus), Last Restocked formatted date. The card should appear when a product search returns results, displaying info for the currently viewed product. Keep the existing Transaction History section below the card.`

## Chore Description
Add a Product Info Card component to the Stock Card "By Product" view (`app/inventory-new/stores/page.tsx`). When a user searches for a product and the filter criteria are met (Date Range, Product, and Store filters all satisfied), the system should display a Product Info Card above the Transaction History table. This card will show the currently searched product's information following the layout defined in the wireframe specification (`wf_specs/wf-stock-card-product-info.md`).

The card layout includes:
- **Left side**: Dark image placeholder (bg-gray-900 rounded-xl) displaying item.brand or productName in white text
- **Right side**:
  - Product name (h2)
  - Category
  - Horizontal separator
  - Three-column grid with Barcode, Item Type badge, Supply Type green badge
  - Stock Config status with checkmark icon
  - Last Restocked formatted date

The existing `ProductInfoCard` component (`src/components/inventory/product-info-card.tsx`) already implements this exact layout and can be reused. The main work involves integrating this component into the Stock Card page and creating a mock product object from the search inputs.

## Relevant Files
Use these files to complete the chore:

- **`app/inventory-new/stores/page.tsx`** - The Stock Card page containing both "By Store" and "By Product" views. This is the primary file to modify for integrating the Product Info Card.
- **`src/components/inventory/product-info-card.tsx`** - Existing Product Info Card component with full implementation. Accepts `product: InventoryItem`, `onClose: () => void`, `onViewDetails: () => void` props.
- **`src/types/inventory.ts`** - Contains `InventoryItem` interface definition with all required fields (productName, category, barcode, itemType, supplyType, stockConfigStatus, lastRestocked, brand, imageUrl, etc.).
- **`wf_specs/wf-stock-card-product-info.md`** - Wireframe specification document defining the visual layout and interaction requirements.
- **`app/inventory-new/page.tsx`** - Reference implementation showing how ProductInfoCard and TransactionHistorySection are integrated together (lines 43-44, 158, 392-412, 599-614).

### New Files
None required - reusing existing `ProductInfoCard` component.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Add ProductInfoCard Import
- Add import statement for `ProductInfoCard` component from `@/components/inventory/product-info-card`
- Verify import path matches existing component location

### 2. Create Mock InventoryItem from Search State
- Create a function `createMockProductFromSearch()` that generates an `InventoryItem` object from the current search state
- Use `productIdSearch` for barcode/productId field
- Use `productNameSearch` for productName field (with fallback to "Product {productId}")
- Set reasonable defaults for required fields:
  - `id`: generate from productId
  - `category`: "General" (default)
  - `storeName`: Use byProductStoreNameSearch or byProductStoreIdSearch
  - `currentStock`, `availableStock`, `reservedStock`: 0 (unknown from search)
  - `safetyStock`, `minStockLevel`, `maxStockLevel`: 0
  - `unitPrice`: 0
  - `lastRestocked`: Use first transaction date if available, or current date
  - `status`: "inStock" (default)
  - `supplier`: "Unknown"
  - `reorderPoint`: 0
  - `demandForecast`: 0
  - `imageUrl`: "" (empty to trigger fallback)
  - `itemType`: "normal" (default)
  - `brand`: Extract from productNameSearch if contains known brand, or undefined
  - `supplyType`: "On Hand Available" (default)
  - `stockConfigStatus`: "valid" (default)

### 3. Add State for Product Card Visibility
- Add `showProductCard` state (boolean, default false)
- Set to `true` when `hasAllMandatoryFiltersForProduct` becomes true and transactions load
- Set to `false` when filters are cleared

### 4. Add Product Card Close Handler
- Create `handleCloseProductCard` function that sets `showProductCard` to false

### 5. Add View Details Handler
- Create `handleViewProductDetails` function for navigating to product detail page
- Navigate to `/inventory-new/{productId}` or show toast if no valid product ID

### 6. Integrate ProductInfoCard into By Product View JSX
- Insert ProductInfoCard component ABOVE the Transaction History Card (around line 1100)
- Only render when `hasAllMandatoryFiltersForProduct` is true AND `showProductCard` is true
- Pass mock product object, onClose handler, and onViewDetails handler as props
- Wrap in conditional render with smooth animation (optional)

### 7. Auto-show Card When Data Loads
- Modify `loadProductTransactions` callback to set `showProductCard` to true after successful data load
- Ensure card shows automatically when user fills in mandatory filters

### 8. Clear Card on Filter Reset
- Modify `handleClearByProductFilters` to also set `showProductCard` to false

### 9. Update Card Data When Transactions Load
- If first transaction has additional product info (like balance, dates), use it to enhance the mock product
- Use `productTransactions[0]?.timestamp` for a more accurate `lastRestocked` date if available

### 10. Validate Implementation
- Run `pnpm dev` to verify no TypeScript errors
- Navigate to Stock Card > By Product view
- Fill in Date Range, Store, and Product filters
- Verify Product Info Card appears above Transaction History
- Verify card displays correct data from search inputs
- Verify Close (X) button dismisses the card
- Verify "View Full Details" button works (or shows appropriate message)
- Run `pnpm build` to ensure production build succeeds

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm dev` - Start development server and manually test the Product Info Card in By Product view
- `pnpm build` - Verify TypeScript compilation and production build succeeds
- `pnpm lint` - Verify no ESLint errors introduced

**Manual Testing Steps:**
1. Navigate to http://localhost:3000/inventory-new/stores
2. Ensure "By Product" tab is selected (default)
3. Fill in all mandatory filters:
   - Date Range: Select start and end dates
   - Store: Enter at least 2 characters in Store ID or Store Name
   - Product: Enter at least 2 characters in Product ID or Product Name
4. Verify Product Info Card appears above Transaction History table
5. Verify card shows product name from search input
6. Verify card shows barcode from Product ID search input
7. Verify Close (X) button hides the card
8. Click "View Full Details" button and verify navigation or toast message

## Notes
- The existing `ProductInfoCard` component is fully implemented and matches the wireframe spec exactly
- The Stock Card By Product view uses mock transaction data, so the product info will also be constructed from search inputs rather than fetched from an API
- The card should show immediately when all mandatory filters are satisfied to provide immediate visual feedback
- Consider adding a subtle animation when the card appears/disappears for better UX
- The "View Full Details" button may need to handle cases where no real product exists (search-based mock data)
