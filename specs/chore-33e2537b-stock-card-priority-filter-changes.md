# Chore: Stock Card Page Priority and Filter Changes

## Metadata
adw_id: `33e2537b`
prompt: `Implement Stock Card page priority and filter changes per wireframe specs/wireframe-stock-card-priority-and-filter-changes.md`

## Chore Description
Restructure the Stock Card page to:
1. Change default tab from 'By Store' to 'By Product' - making product-level transaction history the primary view
2. Update By Product view to require mandatory Store filter (in addition to existing Date and Product filters)
3. Remove Store Name column from By Product transaction table (redundant since user filtered by store)
4. Add filter context header showing selected Product, Store, and Period above the transaction table
5. Completely redesign By Store view to show a multi-store overview dashboard with simplified date-only filtering
6. Replace By Store's current product-level table with a store listing showing aggregated stock metrics
7. Implement ChevronRight navigation that switches to By Product view with store pre-selected
8. Apply color coding for Low Stock (yellow/orange) and Out of Stock (red) counts

## Relevant Files
Use these files to complete the chore:

- **app/inventory-new/stores/page.tsx** - Main Stock Card page component containing both By Store and By Product views. All UI changes happen here.
- **src/lib/stock-card-mock-data.ts** - Mock data generator for product transactions. Needs store filter support added to data generation.
- **specs/wireframe-stock-card-priority-and-filter-changes.md** - Reference wireframe specification with UI layouts and requirements.

### New Files
- None required - all changes are to existing files

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Change Default Tab to By Product
- Locate `viewTab` state initialization on line 253: `const [viewTab, setViewTab] = useState<ViewTab>("by-store")`
- Change default value from `"by-store"` to `"by-product"`
- Update TabsList order so "By Product" appears first, "By Store" appears second (swap TabsTrigger order around lines 618-621)

### 2. Add Store Filter to By Product View
- Add new state variables for store filtering in By Product view:
  - `byProductStoreIdSearch` - for Store ID input
  - `byProductStoreNameSearch` - for Store Name input
- Add store validation logic similar to existing product validation:
  - `hasValidByProductStoreIdSearch = byProductStoreIdSearch.trim().length >= MIN_SEARCH_CHARS`
  - `hasValidByProductStoreNameSearch = byProductStoreNameSearch.trim().length >= MIN_SEARCH_CHARS`
  - `hasValidByProductStoreCriteria = hasValidByProductStoreIdSearch || hasValidByProductStoreNameSearch`
- Update `hasAllMandatoryFiltersForProduct` to include store criteria:
  - From: `hasValidDateRange && hasValidProductCriteria`
  - To: `hasValidDateRange && hasValidProductCriteria && hasValidByProductStoreCriteria`
- Add Store filter group UI in By Product filter section (after Product group around line 996):
  - Same styling as Product group with orange border validation
  - Two inputs: Store ID search, Store Name search
  - Add vertical divider before the group

### 3. Update By Product Empty State Message
- Locate empty state around line 1093
- Update message from "Select a Product to View Stock Card" to "Select a Product and Store to View Stock Card"
- Update subtitle to: "Please select Date Range, Product (ID or Name), and Store (ID or Name) to view transaction history"

### 4. Add Filter Context Header to Transaction History
- Add a header section above the transaction table (inside CardHeader around line 1111)
- Display three lines:
  - `Product: {productId} - {productName}` (use productIdSearch/productNameSearch values)
  - `Store: {storeId} - {storeName}` (use byProductStoreIdSearch/byProductStoreNameSearch values)
  - `Period: {startDate} - {endDate}` (format dates using date-fns format)

### 5. Remove Store Name Column from By Product Transaction Table
- In desktop table (around line 1140), remove the Store Name column:
  - Remove `<TableHead className="w-[180px]">Store Name</TableHead>` (line 1148)
  - Remove the corresponding `<TableCell>` with store name display (lines 1186-1190)
- In mobile card view (around line 1226), remove the Store section:
  - Remove the entire store section block (lines 1269-1273)

### 6. Update handleClearByProductFilters
- Add clearing of new store filter state variables:
  - `setByProductStoreIdSearch("")`
  - `setByProductStoreNameSearch("")`
- Update disabled condition to include store fields

### 7. Redesign By Store View - Simplify Filters
- Remove Store ID and Store Name filter inputs from By Store view
- Remove Product ID and Product Name filter inputs from By Store view
- Keep ONLY Date Range filter
- Update `hasAllMandatoryFiltersForStore` to only require date range:
  - From: `hasValidDateRange && hasValidSearchCriteria && hasValidProductCriteria`
  - To: `hasValidDateRange`
- Update empty state message: "Please select Date Range to view store stock overview"

### 8. Add Store Mock Data Generator
- Add new interface `StoreStockOverview` in stock-card-mock-data.ts:
  ```typescript
  export interface StoreStockOverview {
    storeId: string
    storeName: string
    totalProducts: number
    lowStock: number
    outOfStock: number
  }
  ```
- Add Tops stores constant with 8 stores from wireframe:
  - Tops Central World (ST001)
  - Tops Central Plaza ลาดพร้าว (ST002)
  - Tops สุขุมวิท 39 (ST003)
  - Tops ทองหล่อ (ST004)
  - Tops สีลม คอมเพล็กซ์ (ST005)
  - Tops เอกมัย (ST006)
  - Tops พร้อมพงษ์ (ST007)
  - Tops จตุจักร (ST008)
- Add `generateMockStoreOverview()` function that returns array of StoreStockOverview with random values:
  - Total Products: 600-1300
  - Low Stock: 20-55
  - Out of Stock: 3-15

### 9. Replace By Store Table with Store Listing
- Remove existing filter groups (Store and Product) from By Store view
- Keep only Date Range filter group
- Remove existing table structure and replace with new Store Stock Overview table
- New table structure:
  - Title: "STORE STOCK OVERVIEW"
  - Period display above table: `Period: {startDate} - {endDate}`
  - Columns: Store Name, Store ID, Total Products, Low Stock (yellow/orange text), Out of Stock (red text), ChevronRight icon
- Add state for store overview data: `const [storeOverviewData, setStoreOverviewData] = useState<StoreStockOverview[]>([])`
- Load mock store data when By Store view is active and date range is valid

### 10. Implement ChevronRight Click Navigation
- Add click handler for store row that:
  - Switches to By Product tab: `setViewTab("by-product")`
  - Pre-fills the store filter: `setByProductStoreIdSearch(store.storeId)`
  - Optionally pre-fills store name: `setByProductStoreNameSearch(store.storeName)`

### 11. Add Color Coding for Stock Status
- Low Stock count: Use `text-yellow-600` or `text-orange-500` class
- Out of Stock count: Use `text-red-600` class
- Apply to both:
  - Store Stock Overview table cells
  - Mobile card view badges/values

### 12. Update Mobile Responsive Card View for By Store
- Create mobile card layout for Store Stock Overview:
  - Store Name (prominent)
  - Store ID below name
  - Grid showing Total Products, Low Stock (colored), Out of Stock (colored)
  - ChevronRight icon at bottom right

### 13. Validate Implementation
- Run `pnpm build` to ensure no TypeScript errors
- Test By Product view with all three mandatory filters
- Test By Store view with date-only filter
- Test ChevronRight navigation between views
- Verify mobile responsive layouts

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure TypeScript compilation succeeds with no errors
- `pnpm lint` - Check for linting issues
- `pnpm dev` - Start development server and manually test:
  1. Default tab should be "By Product"
  2. By Product requires Date + Product + Store filters
  3. By Product table should NOT have Store Name column
  4. By Store shows only Date filter
  5. By Store displays Store Stock Overview table
  6. ChevronRight click switches to By Product with store pre-filled
  7. Low Stock shows in yellow/orange, Out of Stock in red

## Notes
- The wireframe specification uses Thai names for some stores (e.g., "Tops Central Plaza ลาดพร้าว") - preserve these exactly
- The existing mock data file already has STORE_DATA with 8 stores - coordinate store names/IDs
- ChevronRight icon is already imported from lucide-react at line 47
- Filter validation styling uses `border-orange-400 ring-1 ring-orange-400` pattern - maintain consistency
- Consider keeping the existing summary statistics display hidden but functional for future use
