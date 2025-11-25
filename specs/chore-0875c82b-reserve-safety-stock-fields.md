# Chore: Add Reserve Stock and Safety Stock Quantity Fields

## Metadata
adw_id: `0875c82b`
prompt: `Add reserve stock and safety stock quantity fields to inventory product details. Steps: 1) Add reservedStock and safetyStock fields to InventoryItem interface, 2) Update mock inventory data with realistic values for both fields (reservedStock = currentStock - availableStock, safetyStock = reasonable buffer like 10-20% of max stock), 3) Update inventory detail view to display these fields in a clear card/section showing: Available Stock, Reserved Stock, Safety Stock, Total Stock, with proper formatting and icons, 4) Add helpful tooltips or descriptions explaining what each stock type means (Reserved = allocated to orders, Safety = minimum buffer to prevent stockouts), 5) Use appropriate icons and color coding for each stock type.`

## Chore Description
Enhance the inventory product details page by adding reserve stock and safety stock tracking capabilities. This will provide better visibility into stock allocation and minimum safety thresholds, helping prevent stockouts and improve inventory management.

The changes will introduce two new fields to the inventory system:
- **Reserved Stock**: Quantity allocated to pending orders (calculated as currentStock - availableStock)
- **Safety Stock**: Minimum buffer quantity to prevent stockouts (typically 10-20% of max stock level)

These fields will be displayed in a dedicated stock breakdown section with clear visual indicators, icons, and tooltips explaining each stock type.

## Relevant Files
Use these files to complete the chore:

- **`src/types/inventory.ts`** - Define TypeScript interfaces for inventory data. Need to add `reservedStock` and `safetyStock` fields to `InventoryItem` and `InventoryItemDB` interfaces.

- **`src/lib/mock-inventory-data.ts`** - Contains mock inventory items for development. Need to add realistic `reservedStock` and `safetyStock` values to all mock inventory items.

- **`src/lib/inventory-service.ts`** - Service layer for fetching inventory data. Need to update `convertDBItemToInventoryItem` function to handle new fields with proper fallback values.

- **`src/components/inventory-detail-view.tsx`** - Product detail view component. Need to add a new stock breakdown card/section displaying all stock types with proper icons, formatting, and tooltips.

### New Files
No new files need to be created. All changes will be made to existing files.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update TypeScript Interfaces
- Add `reservedStock: number` field to `InventoryItem` interface in `src/types/inventory.ts`
- Add `safetyStock: number` field to `InventoryItem` interface
- Add JSDoc comments explaining what each field represents
- Add corresponding `reserved_stock: number` field to `InventoryItemDB` interface
- Add corresponding `safety_stock: number` field to `InventoryItemDB` interface
- Update database schema documentation comment to include new fields

### 2. Update Mock Inventory Data
- Open `src/lib/mock-inventory-data.ts`
- For each item in `mockInventoryItems` array, calculate and add:
  - `reservedStock: currentStock - availableStock` (stock allocated to orders)
  - `safetyStock: Math.round(maxStockLevel * 0.15)` (15% of max stock as safety buffer)
- Ensure values are realistic and consistent with existing stock levels
- Verify all 20+ items across different categories have the new fields

### 3. Update Service Layer Conversion Function
- Open `src/lib/inventory-service.ts`
- Update `convertDBItemToInventoryItem` function to handle new fields:
  - `reservedStock: dbItem.reserved_stock ?? (dbItem.current_stock - dbItem.available_stock)`
  - `safetyStock: dbItem.safety_stock ?? Math.round(dbItem.max_stock_level * 0.15)`
- Add fallback calculations when database values are missing
- Ensure proper type safety and null handling

### 4. Create Stock Breakdown Display Section
- Open `src/components/inventory-detail-view.tsx`
- Replace or enhance the existing "Stock Level Cards" section (starting at line 276)
- Create a new comprehensive stock breakdown card displaying 4 stock types:
  1. **Available Stock** - Stock available for sale (green icon, CheckCircle)
  2. **Reserved Stock** - Stock allocated to orders (orange icon, ShoppingCart or Lock)
  3. **Safety Stock** - Minimum buffer to prevent stockouts (blue icon, Shield)
  4. **Total Stock** - Complete inventory (gray icon, Package)
- Use a grid layout: `grid grid-cols-2 md:grid-cols-4 gap-4`
- Each stock type should show: icon, label, value, and percentage bar

### 5. Add Icons and Visual Indicators
- Import additional icons from `lucide-react`: `CheckCircle`, `ShoppingCart`, `Shield`, `Lock`
- Apply color coding for each stock type:
  - Available Stock: green (`text-green-600`, `bg-green-100`)
  - Reserved Stock: orange (`text-orange-600`, `bg-orange-100`)
  - Safety Stock: blue (`text-blue-600`, `bg-blue-100`)
  - Total Stock: gray (`text-gray-600`, `bg-gray-100`)
- Add visual progress bars showing percentage of total stock
- Use consistent icon sizes: `h-5 w-5`

### 6. Add Tooltips and Descriptions
- Install/verify `@radix-ui/react-tooltip` is available (should be in project)
- Import Tooltip components: `Tooltip`, `TooltipContent`, `TooltipProvider`, `TooltipTrigger`
- Add informative tooltip for each stock type:
  - Available Stock: "Stock currently available for sale to customers"
  - Reserved Stock: "Stock allocated to pending orders and not available for sale"
  - Safety Stock: "Minimum buffer quantity to prevent stockouts and ensure continuity"
  - Total Stock: "Complete inventory including available and reserved stock"
- Add info icon (`Info` from lucide-react) next to each label to indicate tooltip presence
- Wrap the stock breakdown section in `TooltipProvider`

### 7. Update Stock Calculations and Display
- Calculate percentages for each stock type relative to total stock
- Add visual warning indicators if:
  - Available stock falls below safety stock level (show warning badge)
  - Reserved stock exceeds 50% of total (show info badge)
- Display values with proper number formatting and unit labels
- Ensure responsive design works on mobile, tablet, and desktop

### 8. Test and Validate Implementation
- Run the development server: `pnpm dev`
- Navigate to an inventory product detail page
- Verify all 4 stock types display correctly with proper icons and colors
- Test tooltips appear on hover for all stock types
- Check responsive layout on different screen sizes
- Verify calculations are correct (reserved = current - available, etc.)
- Test with different stock status items (healthy, low, critical)
- Ensure no TypeScript errors in the terminal
- Verify proper fallback when safety stock or reserved stock data is missing

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm dev` - Start development server and verify inventory detail pages load without errors
- Navigate to `/inventory` and click on any product to view details
- Check browser console for any TypeScript or runtime errors
- Verify all 4 stock types display with correct icons, colors, and tooltips
- Test on different products with varying stock levels (healthy, low, critical status)
- `pnpm build` - Run production build to ensure no TypeScript compilation errors
- Check that the build completes successfully without warnings

## Notes

### Design Considerations
- The stock breakdown should be visually clear and scannable at a glance
- Use consistent spacing and alignment for professional appearance
- Icons should be meaningful and match their respective stock types
- Color coding should follow accessibility guidelines (sufficient contrast)
- Tooltips should be concise but informative

### Data Calculation Logic
- **Reserved Stock** = Current Stock - Available Stock (stock allocated but not available)
- **Safety Stock** = 10-20% of Max Stock Level (minimum buffer, typically 15%)
- **Available Stock** = Already exists in data (stock ready for sale)
- **Total Stock** = Current Stock (complete inventory)

### Stock Status Warnings
Consider adding visual indicators when:
- Available stock < Safety stock → Warning: approaching safety threshold
- Reserved stock > 50% of total → Info: high allocation rate
- Available stock = 0 but Reserved > 0 → Info: all stock allocated

### Accessibility
- Ensure sufficient color contrast for all text and backgrounds
- Tooltips should be keyboard accessible (focus with Tab key)
- Icon labels should be screen-reader friendly
- Progress bars should have aria-labels

### Future Enhancements (out of scope for this chore)
- Add historical tracking of safety stock changes
- Implement automated safety stock calculation based on demand forecast
- Add notifications when available stock falls below safety threshold
- Create reporting dashboard for reserved vs available stock trends
