# Chore: Inventory Management UI Enhancements

## Metadata
adw_id: `b7055bd9`
prompt: `Analyze and implement Inventory Management UI enhancements based on user feedback including: Stock Card Redesign, Brand Filter, Supply Type ID Field, Channel Field, Stock Config Status, Export Button, Rename Stock by Location to Stock by Store, Enhance Stock by Store Section, and Stock by Store Page Redesign`

## Chore Description
This chore implements a comprehensive set of UI enhancements to the Inventory Management system based on user feedback. The changes span multiple pages and components:

1. **Stock Card Redesign** - Improve multi-store SKU visibility with collapsible/tabular views
2. **Brand Field & Filter** - Add brand information and filtering capability
3. **Supply Type ID Field** - Display On Hand Available vs Pre-Order indicators
4. **Channel Field** - Show where SKUs are sold (store, website, Grab, LINE MAN, Gokoo)
5. **Stock Config Status** - Visual indicator (checkmark) when stock config is correct
6. **Export Button** - Add CSV/Excel export to Recent Transactions section
7. **Rename "Stock by Location" to "Stock by Store"** - Terminology update
8. **Stock by Store Table View** - Convert to sortable table format
9. **Stock by Store Page Redesign** - Dashboard-style location master view

## Relevant Files
Use these files to complete the chore:

### Core Type Definitions
- **`src/types/inventory.ts`** - Add new type definitions for Brand, Channel, SupplyType, and StockConfigStatus fields

### Inventory Management Page
- **`app/inventory/page.tsx`** - Main inventory listing page
  - Add Brand filter dropdown
  - Add Channel column/display
  - Add Stock Config status indicator
  - Integrate redesigned stock card component

### Inventory Detail Page
- **`app/inventory/[id]/page.tsx`** - Product detail page wrapper
- **`src/components/inventory-detail-view.tsx`** - Detail view component
  - Rename "Stock by Location" to "Stock by Store"
  - Convert stock by store section to table view
  - Add Supply Type ID display

### Stock by Store Page
- **`app/inventory/stores/page.tsx`** - Store overview page
  - Redesign to dashboard-style with store performance cards
  - Add summary metrics per store (total items, low stock, out of stock)

### Supporting Components
- **`src/components/inventory/warehouse-location-cell.tsx`** - Currently handles warehouse display
- **`src/components/inventory/stock-location-popover.tsx`** - Stock breakdown popover
- **`src/components/recent-transactions-table.tsx`** - Add export functionality

### Service Layer
- **`src/lib/inventory-service.ts`** - Update data fetching to include new fields
- **`src/lib/mock-inventory-data.ts`** - Add mock data for new fields

### New Files
- **`src/components/inventory/stock-by-store-table.tsx`** - New table component for stock by store
- **`src/components/inventory/brand-filter.tsx`** - Brand filter component (optional, can be inline)
- **`src/lib/export-utils.ts`** - Export utility functions for CSV/Excel

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Type Definitions
- Add `brand?: string` field to `InventoryItem` interface in `src/types/inventory.ts`
- Add `channels?: Channel[]` field with type `Channel = "store" | "website" | "Grab" | "LINE MAN" | "Gokoo"`
- Add `supplyType?: SupplyType` field with type `SupplyType = "On Hand Available" | "Pre-Order"`
- Add `stockConfigStatus?: "valid" | "invalid" | "unconfigured"` field
- Update `InventoryFilters` interface to include `brand?: string | "all"` and `channels?: Channel[]`

### 2. Update Mock Data
- In `src/lib/mock-inventory-data.ts`:
  - Add realistic brand data (e.g., "CP", "Betagro", "Thai Union", "Nestle", etc.)
  - Add channel arrays for each product
  - Add supplyType values
  - Add stockConfigStatus values
- Ensure brands are distributed across products realistically

### 3. Implement Brand Filter
- In `app/inventory/page.tsx`:
  - Add brand filter state: `const [brandFilter, setBrandFilter] = useState<string>("all")`
  - Add brand filter dropdown after category filter
  - Extract unique brands from inventory data
  - Update filters object to include brand
  - Add handler `handleBrandChange`

### 4. Add Channel Column to Inventory Table
- In `app/inventory/page.tsx`:
  - Add "Channel" table header after existing columns
  - Add table cell displaying channel badges (similar to `getChannelBadge` in recent-transactions-table.tsx)
  - Create multi-badge display for products sold on multiple channels
  - Style: Use colored badges - store (gray), website (blue), Grab (green), LINE MAN (lime), Gokoo (orange)

### 5. Add Stock Config Status Indicator
- In `app/inventory/page.tsx`:
  - Add "Config" table header (narrow column)
  - Display green checkmark icon (`CheckCircle` from lucide-react) when stockConfigStatus === "valid"
  - Display yellow warning icon when "invalid"
  - Display gray dash when "unconfigured"
  - Add tooltip explaining the status

### 6. Add Supply Type ID to Inventory Detail Page
- In `src/components/inventory-detail-view.tsx`:
  - Add Supply Type section in the Product Details Grid (after Item Type)
  - Display badge: "On Hand Available" (green) or "Pre-Order" (blue)
  - Include tooltip explaining the supply type

### 7. Rename Stock by Location to Stock by Store
- In `src/components/inventory-detail-view.tsx`:
  - Change CardTitle from "Stock by Location" to "Stock by Store"
  - Update CardDescription accordingly
  - Update any related comments

### 8. Create Stock by Store Table Component
- Create new file `src/components/inventory/stock-by-store-table.tsx`:
  - Props: `locations: StockLocation[]`, `itemType: ItemType`
  - Table columns: Store/Warehouse, Location Code, Available, Reserved, Total, Status
  - Add sorting capability on all columns
  - Add search/filter for store name
  - Style: Use existing table component patterns
  - Include empty state message

### 9. Integrate Stock by Store Table in Detail View
- In `src/components/inventory-detail-view.tsx`:
  - Replace the current grid-based location display with `StockByStoreTable` component
  - Keep filter controls above the table
  - Maintain responsive design

### 10. Add Export Button to Recent Transactions
- In `src/components/recent-transactions-table.tsx`:
  - Add Export button in CardHeader next to filter dropdown
  - Create `handleExport` function
  - Support CSV export format
  - Include all visible columns: Date, Type, Channel, Qty, Balance, Location, Order ID, Notes, Action By

### 11. Create Export Utility Functions
- Create new file `src/lib/export-utils.ts`:
  - `exportToCSV(data: any[], filename: string, columns: ColumnConfig[]): void`
  - `formatTransactionsForExport(transactions: StockTransaction[]): ExportRow[]`
  - Handle proper CSV escaping and date formatting
  - Trigger browser download

### 12. Redesign Stock by Store Page
- In `app/inventory/stores/page.tsx`:
  - Change from card grid to dashboard-style layout
  - Create store performance summary cards showing:
    * Store name
    * Total SKUs in stock
    * Items running low (count)
    * Items out of stock (count)
    * Health score percentage
  - Add quick action buttons to drill down to store inventory
  - Add table view option alongside card view
  - Sort stores by critical issues (out of stock) by default

### 13. Update Inventory Service
- In `src/lib/inventory-service.ts`:
  - Update `fetchInventoryData` to handle brand filter
  - Update `fetchInventoryData` to handle channel filter
  - Ensure new fields are included in response mapping
  - Add `getUniqueBrands()` helper function

### 14. Update Table Column Span
- In `app/inventory/page.tsx`:
  - Update empty state colspan to account for new columns (Channel, Config)
  - Verify all column headers align with data cells

### 15. Validate Changes
- Run `pnpm dev` and verify:
  - Brand filter appears and works correctly
  - Channel badges display properly for each product
  - Stock config status shows correct icons
  - Supply Type appears on detail page
  - "Stock by Store" label is updated
  - Stock by Store uses table format with sorting
  - Export button downloads CSV correctly
  - Stock by Store page shows dashboard layout
- Run `pnpm build` to ensure no TypeScript errors
- Run `pnpm lint` to verify code style

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm dev` - Start development server and visually verify all changes
- Navigate to http://localhost:3000/inventory:
  - Verify Brand filter dropdown exists and filters data
  - Verify Channel column shows multi-channel badges
  - Verify Config status column shows green checkmarks/warnings
- Navigate to http://localhost:3000/inventory/[any-id]:
  - Verify "Stock by Store" section title
  - Verify table view with sortable columns
  - Verify Supply Type field displays
  - Verify Export button in Recent Transactions works
- Navigate to http://localhost:3000/inventory/stores:
  - Verify dashboard-style store cards
  - Verify per-store metrics (total, low, out of stock)
  - Verify clicking store navigates to filtered inventory
- `pnpm build` - Verify production build compiles without errors
- `pnpm lint` - Verify no linting errors

## Notes
- Channel badges should match the existing design pattern from `recent-transactions-table.tsx`
- Brand filter should only show brands that exist in the current dataset
- Stock Config status is based on the stock-config system - products with valid configurations should show green
- The "Stock by Store" rename applies to the inventory detail page section, not the store overview page
- Export format should be user-friendly CSV that opens correctly in Excel
- Consider adding loading states for export operations
- The store page redesign should maintain mobile responsiveness
- All new fields should gracefully handle undefined/null values
