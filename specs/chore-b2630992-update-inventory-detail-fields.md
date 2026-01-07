# Chore: Update Inventory Detail View and Types

## Metadata
adw_id: `b2630992`
prompt: `Update inventory detail view (src/components/inventory-detail-view.tsx) and types (src/types/inventory.ts): 1) Expand ItemType to include 'weight', 'pack_weight', 'pack', 'normal'. 2) Display weight items with 3 decimal digits (xx.xxx kg). 3) Update Total Stock formula to show 'Total = Available + Reserved + Safety' in Stock Breakdown section.`

## Chore Description
This chore updates the inventory management system to support more granular item type categorization and improve the display of weight-based items with precise formatting. The changes include:

1. **Expand ItemType enum** - Add four item type values ('weight', 'pack_weight', 'pack', 'normal') to replace the current binary 'weight' | 'unit' type system, allowing better categorization of inventory items.

2. **Weight formatting precision** - Display weight-based items (itemType === 'weight' or 'pack_weight') with exactly 3 decimal places (e.g., 12.500 kg) for accurate weight measurements in the inventory detail view.

3. **Update Total Stock formula** - Change the Total Stock calculation in the Stock Breakdown section to explicitly show "Total = Available + Reserved + Safety" instead of the current formula that includes all stock statuses.

## Relevant Files

### Files to Modify

- **src/types/inventory.ts** (lines 20-23)
  - Expand `ItemType` type definition from `"weight" | "unit"` to include `"weight" | "pack_weight" | "pack" | "normal"`
  - Update JSDoc comments to describe each item type clearly

- **src/components/inventory-detail-view.tsx** (lines 262-280, 406-434)
  - Update item type badge display logic to handle all four item types
  - Add weight formatting function to display 3 decimal places for weight-based items
  - Update Total Stock card to use new formula (Available + Reserved + Safety)
  - Update Total Stock tooltip to reflect the new calculation method

- **src/lib/warehouse-utils.ts** (new utility function)
  - Add `formatStockQuantity()` helper function to format stock quantities based on item type
  - Weight items: format with 3 decimals (e.g., "12.500 kg")
  - Other items: format as integers (e.g., "42 pieces")

### Files to Review

- **src/components/recent-transactions-table.tsx** (lines 187-194)
  - Review quantity and balanceAfter display to ensure they use the new formatting for weight items
  - May need to add itemType prop to support proper formatting

- **src/lib/mock-inventory-data.ts**
  - Review mock data generation to include new item types
  - Ensure test data covers all four item type scenarios

## Step by Step Tasks

### 1. Update ItemType Type Definition
- Open `src/types/inventory.ts`
- Expand `ItemType` from `"weight" | "unit"` to `"weight" | "pack_weight" | "pack" | "normal"`
- Update JSDoc comment on lines 18-22 to describe all four types:
  - `weight`: Items sold by weight (kg) - displayed with 3 decimals
  - `pack_weight`: Pre-packed items sold by weight (kg) - displayed with 3 decimals
  - `pack`: Pre-packed items sold by unit - displayed as integers
  - `normal`: Standard items sold by piece/unit - displayed as integers

### 2. Create Stock Quantity Formatting Utility
- Open `src/lib/warehouse-utils.ts`
- Add new exported function `formatStockQuantity(quantity: number, itemType: ItemType): string`
- Implementation logic:
  - If itemType is 'weight' or 'pack_weight': return `${quantity.toFixed(3)} kg`
  - Otherwise: return quantity as integer string (no decimals)
- Add JSDoc comment explaining the function purpose and parameters

### 3. Update Inventory Detail View Item Type Display
- Open `src/components/inventory-detail-view.tsx`
- Update lines 262-280 (Item Type section in Product Details Grid):
  - Expand badge logic to handle all four item types
  - For 'weight' and 'pack_weight': show Scale icon with "(kg)" suffix
  - For 'pack' and 'normal': show Package icon with "(pieces)" suffix
  - Update badge colors: weight types use blue, pack/normal use gray
  - Update badge text to display descriptive labels for each type

### 4. Update Total Stock Card Formula
- In `src/components/inventory-detail-view.tsx`, locate Total Stock card (lines 406-434)
- Update the total stock value calculation on line 420:
  - Change from `{item.currentStock}` to `{item.availableStock + item.reservedStock + item.safetyStock}`
- Update tooltip content on line 431-432:
  - Change from "Complete inventory including available and reserved stock"
  - To "Total stock calculated as: Available + Reserved + Safety Stock"

### 5. Apply Weight Formatting in Stock Breakdown
- In `src/components/inventory-detail-view.tsx`, Stock Breakdown section (lines 315-434)
- Import `formatStockQuantity` from `@/lib/warehouse-utils`
- Update all stock value displays in the four cards:
  - Available Stock card (line 330): use `formatStockQuantity(item.availableStock, item.itemType)`
  - Reserved Stock card (line 360): use `formatStockQuantity(item.reservedStock, item.itemType)`
  - Safety Stock card (line 390): use `formatStockQuantity(item.safetyStock, item.itemType)`
  - Total Stock card (line 420): use `formatStockQuantity(item.availableStock + item.reservedStock + item.safetyStock, item.itemType)`

### 6. Apply Weight Formatting in Stock by Location
- In `src/components/inventory-detail-view.tsx`, Stock by Location section (lines 597-667)
- Update location card stock displays (lines 640-661) to use `formatStockQuantity`:
  - Available: `formatStockQuantity(location.stockAvailable, item.itemType)`
  - Reserved: `formatStockQuantity(location.stockInProcess, item.itemType)`
  - Safety Stock: `formatStockQuantity(location.stockSafetyStock ?? 0, item.itemType)`
  - Total Stock: `formatStockQuantity(totalLocationStock, item.itemType)`

### 7. Update Recent Transactions Table (if needed)
- Review `src/components/recent-transactions-table.tsx`
- Check if transactions need itemType information for proper formatting
- If needed, add optional `itemType` prop to `StockTransaction` interface in types
- Update quantity display (lines 187-194) to use `formatStockQuantity` if weight item
- Update balanceAfter display (line 192-194) similarly

### 8. Validate Changes
- Run TypeScript compiler to ensure no type errors
- Test that all four item types display correctly
- Verify weight formatting shows exactly 3 decimal places
- Confirm Total Stock formula shows correct calculation
- Check that existing functionality is not broken

## Validation Commands

Execute these commands to validate the chore is complete:

- `pnpm run build` - Verify TypeScript compilation succeeds with no errors
- `pnpm run lint` - Check for linting issues in modified files
- `pnpm run dev` - Start development server and manually test:
  - Navigate to inventory detail page
  - Verify item type badge displays correctly for all types
  - Check that weight items show 3 decimal places (e.g., 12.500 kg)
  - Confirm Total Stock card shows formula: Available + Reserved + Safety
  - Inspect Stock Breakdown cards for proper weight formatting
  - Review Stock by Location cards for consistent formatting

## Notes

### Design Decisions

1. **ItemType Expansion**: The new types provide better inventory categorization:
   - `weight`: Loose items sold by weight (produce, bulk goods)
   - `pack_weight`: Pre-packaged weight items (pre-packed meat, cheese)
   - `pack`: Pre-packaged unit items (boxes, cartons)
   - `normal`: Standard unit items (bottles, cans)

2. **Weight Formatting**: Using `.toFixed(3)` ensures consistent 3-decimal display for weight items, which is standard in retail inventory systems for accuracy.

3. **Total Stock Formula Change**: The new formula (Available + Reserved + Safety) provides a clearer view of how total inventory is allocated, excluding statuses like sold, on_hold, and pending which represent different inventory states.

### Backwards Compatibility

- Existing items with `itemType: "unit"` will need migration or fallback logic
- Consider adding migration script or fallback: if itemType is "unit", treat as "normal"
- Database schema may need update if itemType is stored

### Testing Considerations

- Test with weight items to verify 3 decimal formatting (e.g., 1.250 kg, 0.500 kg)
- Test with zero values (0.000 kg should display correctly)
- Test with large values (1234.567 kg)
- Test Total Stock formula with various stock combinations
- Verify tooltip updates reflect new calculation
