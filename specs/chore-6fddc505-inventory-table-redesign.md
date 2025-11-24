# Chore: Inventory Page Table Layout Redesign

## Metadata
adw_id: `6fddc505`
prompt: `Rewrite the inventory page (app/inventory/page.tsx) to match the reference design at https://v0-ris-oms-git-main-indytrading-gmailcoms-projects.vercel.app/inventory. Key changes needed:

1. Change from card-based layout to TABLE layout with columns: Image, Product Name, Barcode, Category, Stock, Status, Price
2. Add tabs: 'All Products', 'Low Stock', 'Out of Stock'
3. Stock column should show 'current / minimum' format (e.g. '45 / 15')
4. Status badges: 'In Stock' (green), 'Low Stock' (yellow), 'Out of Stock' (red)
5. Remove progress bars - use simple status badges instead
6. Add action buttons in header: Import, Export, Add Product
7. Keep the 4 summary KPI cards at top (Total Products, Low Stock Items, Out of Stock Items, Total Inventory Value)
8. Add sortable table headers
9. Product images as small thumbnails in first column
10. Compact table design with proper spacing

Reference the existing table components from the codebase if available. Match the exact layout and styling from the reference URL.`

## Chore Description
Transform the inventory page from a card-based layout with progress bars into a clean, table-based interface with tabs and sortable columns. The redesign focuses on improving data density, simplifying the stock status visualization, and adding quick filtering tabs for common inventory views.

### Current State
The inventory page (`app/inventory/page.tsx`) currently uses:
- Card-based layout with individual items displayed as expandable cards
- Progress bars showing stock levels as percentages
- Three tabs: Products, Store Performance, Stock Alerts
- Filter controls: search, category, store, status dropdowns
- Pagination at the bottom
- Detailed information including reorder points and demand forecasts

### Target State
The new design should provide:
- Clean table layout with 7 columns: Image, Product Name, Barcode, Category, Stock, Status, Price
- Simplified tabs: All Products, Low Stock, Out of Stock
- Simple stock display format: "45 / 15" (current / minimum)
- Color-coded status badges: In Stock (green), Low Stock (yellow), Out of Stock (red)
- Header action buttons: Import, Export, Add Product
- Sortable table headers for all columns
- Product thumbnail images in first column
- Compact, scannable design with proper spacing

## Relevant Files
Use these files to complete the chore:

- **app/inventory/page.tsx** - Main inventory page component to be rewritten
  - Currently implements card-based layout
  - Contains filter logic, state management, and data fetching
  - Needs complete UI restructuring while preserving data fetching logic

- **src/components/ui/table.tsx** - Existing table components
  - Contains Table, TableHeader, TableBody, TableRow, TableHead, TableCell components
  - Will be used for new table layout
  - Already styled with proper hover states and border handling

- **src/components/ui/tabs.tsx** - Existing tabs components
  - Contains Tabs, TabsList, TabsTrigger, TabsContent components
  - Will be used for new tab structure (All Products, Low Stock, Out of Stock)

- **src/components/ui/badge.tsx** - Badge component for status display
  - Will be used for status badges (In Stock, Low Stock, Out of Stock)
  - Supports variant prop for different colors

- **src/types/inventory.ts** - TypeScript type definitions
  - Contains InventoryItem, InventoryStatus, ProductCategory types
  - Will be referenced for data structure
  - Status values: "healthy", "low", "critical"

- **src/lib/mock-inventory-data.ts** - Mock data source
  - Contains sample inventory items with all required fields
  - Includes 24 items across different categories and stores
  - Has productId field that can be used as barcode

- **src/lib/inventory-service.ts** - Data fetching service
  - Contains fetchInventoryData, fetchInventorySummary functions
  - Will continue to be used for data retrieval
  - No changes needed to this file

### New Files

- **public/images/placeholder-product.png** - Placeholder product image
  - Small thumbnail image (64x64px) for products without images
  - Simple gray box with package icon or generic product icon
  - Will be used as fallback for all product images initially

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Create Placeholder Product Image
- Create a simple placeholder image file at `public/images/placeholder-product.png`
- Use a 64x64px gray square with centered package icon
- This will serve as the product thumbnail for all items initially
- Ensure image is optimized for web use

### 2. Update Type Definitions (if needed)
- Review `src/types/inventory.ts` to check if any new types are needed
- Consider adding a `barcode` or `imageUrl` field to InventoryItem if not present
- For now, use `productId` as the barcode value
- Add type for table sort configuration if needed

### 3. Rewrite Page Header Section
- Replace current header with new layout
- Add three action buttons: Import, Export, Add Product
- Import button: outline variant with Upload icon
- Export button: outline variant with Download icon
- Add Product button: primary variant with Plus icon
- Position buttons in flex row on the right side of header
- Keep page title and description on the left

### 4. Preserve KPI Summary Cards
- Keep the existing 4 KPI cards at the top
- Update card titles to match new requirements:
  - Total Products (keep as is)
  - Low Stock Items (change from "Low Stock")
  - Out of Stock Items (change from "Critical Stock")
  - Total Inventory Value (keep as is)
- Adjust summary calculations to match new terminology
- "Out of Stock" = items with status "critical"

### 5. Replace Tabs Structure
- Remove existing tabs: Products, Store Performance, Stock Alerts
- Add new tabs: All Products, Low Stock, Out of Stock
- "All Products": Show all inventory items (no filtering)
- "Low Stock": Show items with status = "low"
- "Out of Stock": Show items with status = "critical"
- Move Store Performance and Stock Alerts to separate pages/routes (future work)
- Set default tab to "All Products"

### 6. Remove Filters Card
- Remove the filters card with dropdowns (category, store, status)
- Keep only the search input box
- Position search box above the table, left-aligned
- Use Search icon inside input field
- Search should filter across product name, barcode, category

### 7. Implement Table Layout
- Replace card-based product list with Table component
- Use components from `src/components/ui/table.tsx`
- Create table structure with 7 columns:
  1. Image (48px thumbnail)
  2. Product Name (left-aligned, font-semibold)
  3. Barcode (use productId field, monospace font)
  4. Category (text-sm)
  5. Stock (format: "current / minimum", e.g., "45 / 15")
  6. Status (badge component)
  7. Price (right-aligned, ฿ prefix)
- Apply proper column widths and alignment

### 8. Add Product Thumbnails
- Add Image column as first column in table
- Use 48x48px thumbnail size
- Render Next.js Image component with placeholder image
- Apply rounded corners (rounded-md)
- Set proper alt text with product name
- Use `placeholder-product.png` for all items initially

### 9. Implement Status Badges
- Remove progress bars completely
- Add Badge component in Status column
- Map inventory status to badge variants:
  - "healthy" → "In Stock" badge with green styling (bg-green-100 text-green-800)
  - "low" → "Low Stock" badge with yellow styling (bg-yellow-100 text-yellow-800)
  - "critical" → "Out of Stock" badge with red styling (bg-red-100 text-red-800)
- Use Badge component from `src/components/ui/badge.tsx`

### 10. Format Stock Display
- Change stock display from progress bar to simple text format
- Display as "current / minimum" (e.g., "45 / 15")
- Use regular font weight, centered alignment
- Remove all references to maxStockLevel in display
- Keep values as numbers (no "units" suffix)

### 11. Add Sortable Table Headers
- Make all table headers clickable for sorting
- Add sort state: column name and direction (asc/desc)
- Show sort indicator icons (ArrowUp, ArrowDown, ArrowUpDown)
- Implement sort logic for each column:
  - Product Name: alphabetical
  - Barcode: alphanumeric
  - Category: alphabetical
  - Stock: numeric (by current stock)
  - Status: by severity (critical > low > healthy)
  - Price: numeric
- Update table display when sort changes
- Add hover state to sortable headers

### 12. Update Tab Filtering Logic
- Implement tab-based filtering in data fetching
- "All Products" tab: fetch all items (status = "all")
- "Low Stock" tab: filter items where status = "low"
- "Out of Stock" tab: filter items where status = "critical"
- Update URL parameters when tab changes for shareability
- Preserve search and sort state when switching tabs

### 13. Adjust Pagination
- Keep existing pagination controls at bottom
- Ensure pagination works with tab filtering
- Update "Showing X of Y" text to reflect current tab
- Reset to page 1 when changing tabs
- Keep page size selector (25, 50, 100 items per page)

### 14. Remove Unused UI Elements
- Remove "View Details" and "Reorder Now" buttons from cards
- Remove reorder point and demand forecast from display
- Remove supplier information from main view
- Remove last restocked timestamp from table
- Clean up unused state variables and imports
- These details can be added to a detail view modal (future work)

### 15. Style and Spacing Adjustments
- Apply compact table row height (h-16 or similar)
- Add proper padding to table cells (p-4)
- Ensure consistent spacing between elements
- Add hover effect to table rows (hover:bg-muted/50)
- Ensure text is readable and not cramped
- Test responsive behavior on mobile (table should scroll horizontally)

### 16. Update Action Button Handlers
- Add placeholder onClick handlers for Import, Export, Add Product buttons
- Import: console.log("Import clicked") for now
- Export: console.log("Export clicked") for now
- Add Product: console.log("Add Product clicked") for now
- Add TODO comments indicating these need backend implementation
- Consider adding toast notifications on button clicks

### 17. Test Data Fetching
- Verify data still loads correctly from inventory-service
- Ensure summary calculations are accurate
- Test search functionality across all tabs
- Verify sorting works correctly for all columns
- Check pagination with different page sizes
- Confirm loading and error states still work

### 18. Clean Up Code
- Remove unused imports (Progress, Separator, etc.)
- Remove unused state variables
- Remove commented-out code
- Update component comments and documentation
- Ensure proper TypeScript typing throughout
- Format code consistently

## Validation Commands
Execute these commands to validate the chore is complete:

- `npm run dev` - Start development server and verify page loads without errors
- Navigate to `http://localhost:3000/inventory` in browser
- Verify the following manually:
  - 4 KPI cards display at top with correct data
  - 3 tabs present: All Products, Low Stock, Out of Stock
  - Table displays with 7 columns: Image, Product Name, Barcode, Category, Stock, Status, Price
  - Stock column shows "current / minimum" format
  - Status badges show correct colors (green, yellow, red)
  - Table headers are sortable (click to sort)
  - Search filters products correctly
  - Tab switching filters data correctly
  - Pagination works on all tabs
  - Import, Export, Add Product buttons are present in header
  - Product thumbnails display (placeholder image)
  - No console errors
  - Responsive on mobile (table scrolls horizontally)

- `npm run build` - Verify production build succeeds with no errors
- `npm run lint` - Ensure no linting errors
- `npx tsc --noEmit` - Verify no TypeScript errors

## Notes

### Design Considerations
- The table layout provides better data density than cards
- Simplified status badges are easier to scan than progress bars
- Tab-based filtering is faster than dropdown filters for common views
- Sortable headers allow users to find items in their preferred order
- Stock format "45 / 15" is more concise than progress bars

### Future Enhancements
- Implement actual Import/Export functionality
- Add Product form with validation
- Create product detail modal with full information
- Add product images via upload or API
- Implement reorder workflow
- Add Store Performance and Stock Alerts as separate pages
- Add batch operations (multi-select and bulk actions)
- Add barcode scanning functionality
- Add advanced filters (price range, supplier, etc.)

### Mobile Responsiveness
- Table will scroll horizontally on small screens
- Consider adding a card view toggle for mobile (future)
- Ensure touch targets are at least 44px for action buttons
- Test on various screen sizes during validation

### Data Mapping
- `productId` serves as barcode until actual barcode field is added
- `status: "healthy"` → "In Stock"
- `status: "low"` → "Low Stock"
- `status: "critical"` → "Out of Stock"
- All products use placeholder image initially
- Stock display uses `currentStock / minStockLevel` format
