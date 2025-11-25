# Chore: Add Item Type Field to Inventory

## Metadata
adw_id: `a474cf81`
prompt: `Add an 'item type' field to product/inventory details to distinguish between weight items and normal items. Steps: 1) Add itemType field to InventoryItem interface with values 'weight' or 'unit' (for weight-based items like meat/produce sold by kg, vs normal items sold by piece), 2) Update mock inventory data to classify items appropriately (Fresh Produce, Meat & Seafood as weight items, packaged goods as unit items), 3) Add display of item type in the inventory detail view showing 'Weight Item' or 'Unit Item', 4) Optionally add an icon or badge to indicate the type, 5) Update the inventory table to show item type as a column or badge. Make it clear and user-friendly.`

## Chore Description
Add an `itemType` field to the inventory system to distinguish between weight-based items (sold by kg) and unit-based items (sold by piece). This enhancement will help users understand how products are measured and sold, improving inventory management accuracy.

**Business Context:**
- **Weight Items**: Products sold by weight (kg) such as fresh produce, meat, and seafood
- **Unit Items**: Packaged products sold by piece/unit such as dairy, bakery, beverages, snacks

**User Impact:**
- Clear indication of how items are measured and sold
- Better inventory tracking for weight-based vs unit-based products
- Improved clarity in product details and inventory tables

## Relevant Files
Use these files to complete the chore:

- **`src/types/inventory.ts`** - Add `itemType` field to `InventoryItem` interface and `InventoryItemDB` interface. Define type literal for `'weight' | 'unit'`.

- **`src/lib/mock-inventory-data.ts`** - Update all mock inventory items to include `itemType` field. Classify by category:
  - Weight items: Produce, Meat, Seafood
  - Unit items: Dairy, Bakery, Pantry, Frozen, Beverages, Snacks, Household

- **`src/lib/inventory-service.ts`** - Update `convertDBItemToInventoryItem()` function to handle `itemType` field with fallback logic (default to 'unit' if not specified).

- **`src/components/inventory-detail-view.tsx`** - Add display of item type in the product details section with:
  - Icon (Scale for weight items, Package for unit items)
  - Badge or label showing "Weight Item (kg)" or "Unit Item (pieces)"
  - Clear visual distinction

- **`app/inventory/page.tsx`** - Add item type column/badge to the inventory table for quick identification:
  - Column header: "Type"
  - Display icon + text or badge
  - Sortable column (optional)

### New Files
No new files need to be created. All changes are modifications to existing files.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update TypeScript Types
- Add `ItemType` type literal to `src/types/inventory.ts`: `export type ItemType = "weight" | "unit"`
- Add `itemType: ItemType` field to `InventoryItem` interface
- Add `item_type: string` field to `InventoryItemDB` interface (database schema)
- Update JSDoc comments to document the new field and its purpose

### 2. Update Mock Inventory Data
- Open `src/lib/mock-inventory-data.ts`
- Add `itemType: "weight"` to all items in categories: Produce, Meat, Seafood
- Add `itemType: "unit"` to all items in categories: Dairy, Bakery, Pantry, Frozen, Beverages, Snacks, Household
- Verify all 20+ mock items have the field added
- Update any data generation functions to include itemType

### 3. Update Inventory Service Layer
- Open `src/lib/inventory-service.ts`
- Modify `convertDBItemToInventoryItem()` function to:
  - Map `dbItem.item_type` to `itemType` field
  - Add fallback: `itemType: (dbItem.item_type as ItemType) || 'unit'`
  - Ensure proper type casting
- Test that mock data fallback still works correctly

### 4. Add Item Type Display to Detail View
- Open `src/components/inventory-detail-view.tsx`
- Import `Scale` and `Package` icons from `lucide-react`
- Add item type display to Product Details Grid (around line 197-229):
  - Create new grid item showing item type
  - Use conditional icon: `{item.itemType === 'weight' ? <Scale /> : <Package />}`
  - Display label: "Weight Item (kg)" or "Unit Item (pieces)"
  - Add badge with appropriate styling for visual distinction
- Position it prominently near Barcode, Store, or Supplier info

### 5. Add Item Type Column to Inventory Table
- Open `app/inventory/page.tsx`
- Add "Type" column header to the table (around TableHeader section)
- Add TableCell for item type in the data row:
  - Display icon (Scale or Package) + text
  - OR display Badge with item type
  - Use consistent styling with detail view
- Ensure responsive design (consider hiding on mobile with `hidden md:table-cell`)
- Optional: Add sorting capability for item type column

### 6. Style and Polish
- Ensure consistent styling between table and detail views
- Add appropriate colors/badges:
  - Weight items: Blue badge/icon (Scale icon)
  - Unit items: Gray badge/icon (Package icon)
- Verify spacing and alignment in both views
- Test mobile responsiveness

### 7. Validate the Changes
- Test inventory list page displays item type correctly
- Test inventory detail view shows item type with icon
- Verify mock data classification is correct:
  - Check Produce items show "Weight Item"
  - Check Dairy items show "Unit Item"
  - Check Meat/Seafood items show "Weight Item"
- Test filtering and sorting (if sorting added)
- Verify no TypeScript errors
- Test with both Supabase data and mock data fallback

## Validation Commands
Execute these commands to validate the chore is complete:

```bash
# 1. Check for TypeScript errors
npm run type-check || npx tsc --noEmit

# 2. Run the development server to visually test
npm run dev
# Then open http://localhost:3000/inventory
# Check: Inventory table shows item type column
# Check: Click on an item to see detail view with item type display

# 3. Verify all mock items have itemType field
grep -c "itemType:" src/lib/mock-inventory-data.ts
# Should show count matching number of mock items (20+)

# 4. Search for any TypeScript errors related to itemType
npx tsc --noEmit 2>&1 | grep -i "itemtype" || echo "No itemType errors found"

# 5. Verify the interface includes the new field
grep -A 5 "interface InventoryItem" src/types/inventory.ts | grep "itemType"

# 6. Check that convertDBItemToInventoryItem handles the field
grep -A 20 "convertDBItemToInventoryItem" src/lib/inventory-service.ts | grep "itemType"
```

## Notes

**Design Considerations:**
- Use Scale icon for weight items (represents weighing scales)
- Use Package icon for unit items (represents packaged goods)
- Consider color coding: Blue for weight, Gray/Neutral for unit
- Keep labels concise: "Weight (kg)" vs "Unit (pc)"

**Database Migration (Future):**
- If deploying to Supabase, need to add `item_type VARCHAR(50)` column to `inventory_items` table
- Consider adding CHECK constraint: `CHECK (item_type IN ('weight', 'unit'))`
- Update database documentation in type file comments

**Testing Tips:**
- Fresh Vegetables Mix (PROD-001) should show "Weight"
- Organic Milk (PROD-004) should show "Unit"
- Navigate to detail view by clicking on items in table
- Test both desktop and mobile views

**Accessibility:**
- Ensure icon has proper aria-label
- Color should not be the only indicator (use icon + text)
- Screen readers should clearly announce item type
