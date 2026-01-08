# Chore: Add Inventory Page Filters

## Metadata
adw_id: `b5f8eb2b`
prompt: `Design and implement filters for the Inventory Management page at app/inventory/page.tsx. Based on the current UI analysis and data model in src/types/inventory.ts, add the following filters: Warehouse Filter, Category Filter, and Item Type Filter.`

## Chore Description
Add three new filters to the Inventory Management page to enhance product discovery and warehouse operations:

1. **Warehouse Filter** - A dropdown/select filter to filter by warehouse code (CDC-BKK01, CDC-BKK02, CDC-NTH01, CDC-STH01, RWH-LP, TPS-1005, TPS-2001, TPS-2002, CMG, etc.). Extract unique warehouse codes dynamically from inventory items' `warehouseLocations` field.

2. **Category Filter** - A dropdown to filter by ProductCategory (Produce, Dairy, Bakery, Meat, Seafood, Pantry, Frozen, Beverages, Snacks, Household). The `InventoryFilters` interface already supports this.

3. **Item Type Filter** - A dropdown to filter by itemType ("weight" vs "normal"). Weight items include weight and pack_weight types; Unit items include pack and normal types.

Implementation must:
- Place filters in a row between tabs and search box
- Use shadcn/ui Select components for consistency with stock-config page
- Reset pagination to page 1 when any filter changes
- Support combinable filters (e.g., Dairy + Low Stock + CDC-BKK01)
- Update InventoryFilters interface to add `warehouseCode` and `itemType` fields
- Update `applyFilters()` and `fetchInventoryData()` in inventory-service.ts

## Relevant Files
Use these files to complete the chore:

- **`app/inventory/page.tsx`** - Main inventory page component. Add filter state, filter UI components, and update filter handlers.
- **`src/types/inventory.ts`** - Contains `InventoryFilters` interface (line 238-247). Add `warehouseCode` and `itemType` fields.
- **`src/lib/inventory-service.ts`** - Contains `applyFilters()` function (line 84-172) and `fetchInventoryData()` (line 180-274). Add filtering logic for new fields.
- **`src/lib/mock-inventory-data.ts`** - Contains `WAREHOUSE_CODES` constant (line 41-72). Use for populating warehouse dropdown options.
- **`src/components/ui/select.tsx`** - shadcn/ui Select component to use for dropdowns.

### New Files
None required - all changes are to existing files.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update InventoryFilters Interface
- Open `src/types/inventory.ts`
- Add `warehouseCode?: string | "all"` field to `InventoryFilters` interface after `storeName`
- Add `itemType?: "weight" | "unit" | "all"` field after `warehouseCode`
- Keep existing fields unchanged

### 2. Update applyFilters Function in inventory-service.ts
- Open `src/lib/inventory-service.ts`
- Add warehouse code filtering logic after store filtering (around line 100):
  ```typescript
  // Filter by warehouse code
  if (filters.warehouseCode && filters.warehouseCode !== "all") {
    filtered = filtered.filter((item) =>
      item.warehouseLocations?.some(
        (loc) => loc.warehouseCode === filters.warehouseCode
      )
    )
  }
  ```
- Add item type filtering logic after warehouse filtering:
  ```typescript
  // Filter by item type
  if (filters.itemType && filters.itemType !== "all") {
    if (filters.itemType === "weight") {
      filtered = filtered.filter((item) =>
        item.itemType === "weight" || item.itemType === "pack_weight"
      )
    } else {
      filtered = filtered.filter((item) =>
        item.itemType === "pack" || item.itemType === "normal"
      )
    }
  }
  ```

### 3. Update fetchInventoryData for Supabase Queries
- In `fetchInventoryData()` function (around line 211-225)
- Add Supabase query filter for category if not already done
- Note: Warehouse code filtering may need post-fetch filtering since warehouseLocations is a nested array

### 4. Add Filter State and Handlers to Inventory Page
- Open `app/inventory/page.tsx`
- Import Select components:
  ```typescript
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
  ```
- Import WAREHOUSE_CODES from mock data:
  ```typescript
  import { WAREHOUSE_CODES } from "@/lib/mock-inventory-data"
  ```
- Add state for new filters after line 97:
  ```typescript
  const [warehouseFilter, setWarehouseFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | "all">("all")
  const [itemTypeFilter, setItemTypeFilter] = useState<"weight" | "unit" | "all">("all")
  ```
- Import ProductCategory type from inventory types
- Update the filters useMemo (around line 131-139) to include new filter values:
  ```typescript
  warehouseCode: warehouseFilter,
  category: categoryFilter,
  itemType: itemTypeFilter,
  ```

### 5. Add Filter Change Handlers
- Add handlers that reset page to 1 when filter changes:
  ```typescript
  const handleWarehouseChange = (value: string) => {
    setWarehouseFilter(value)
    setPage(1)
  }
  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value as ProductCategory | "all")
    setPage(1)
  }
  const handleItemTypeChange = (value: string) => {
    setItemTypeFilter(value as "weight" | "unit" | "all")
    setPage(1)
  }
  ```

### 6. Add Filter UI Components
- Locate the Tabs/filter section (around line 368-385)
- Add a new filter row between TabsList and search box:
  ```tsx
  <div className="flex items-center gap-3">
    <TabsList>...</TabsList>

    {/* Filter Row */}
    <div className="flex items-center gap-2">
      {/* Warehouse Filter */}
      <Select value={warehouseFilter} onValueChange={handleWarehouseChange}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="All Warehouses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Warehouses</SelectItem>
          {WAREHOUSE_CODES.map((code) => (
            <SelectItem key={code} value={code}>{code}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Category Filter */}
      <Select value={categoryFilter} onValueChange={handleCategoryChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="Produce">Produce</SelectItem>
          <SelectItem value="Dairy">Dairy</SelectItem>
          <SelectItem value="Bakery">Bakery</SelectItem>
          <SelectItem value="Meat">Meat</SelectItem>
          <SelectItem value="Seafood">Seafood</SelectItem>
          <SelectItem value="Pantry">Pantry</SelectItem>
          <SelectItem value="Frozen">Frozen</SelectItem>
          <SelectItem value="Beverages">Beverages</SelectItem>
          <SelectItem value="Snacks">Snacks</SelectItem>
          <SelectItem value="Household">Household</SelectItem>
        </SelectContent>
      </Select>

      {/* Item Type Filter */}
      <Select value={itemTypeFilter} onValueChange={handleItemTypeChange}>
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="weight">Weight Items</SelectItem>
          <SelectItem value="unit">Unit Items</SelectItem>
        </SelectContent>
      </Select>
    </div>

    {/* Search Box */}
    <div className="relative flex-1 max-w-sm">...</div>
  </div>
  ```

### 7. Update Layout for Responsive Design
- Ensure the filter row wraps properly on smaller screens
- Use `flex-wrap` on the container
- Consider using `gap-4` for better spacing
- Adjust filter widths as needed for mobile:
  ```tsx
  <div className="flex flex-wrap items-center justify-between gap-4">
    <div className="flex flex-wrap items-center gap-2">
      <TabsList>...</TabsList>
      {/* Filters */}
    </div>
    {/* Search */}
  </div>
  ```

### 8. Validate and Test
- Run `pnpm dev` to start development server
- Navigate to /inventory page
- Test each filter individually
- Test filter combinations (e.g., Dairy + Low Stock + CDC-BKK01)
- Verify pagination resets to page 1 on filter change
- Verify search works alongside filters
- Test on smaller screen widths for responsive behavior

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure TypeScript compilation succeeds with no errors
- `pnpm lint` - Ensure no ESLint errors
- `pnpm dev` - Start dev server and manually test:
  1. Open http://localhost:3000/inventory
  2. Verify all three filter dropdowns appear
  3. Select "CDC-BKK01" warehouse - verify table filters
  4. Select "Dairy" category - verify table filters
  5. Select "Weight Items" type - verify table shows only weight items
  6. Combine multiple filters - verify they work together
  7. Verify pagination shows "Page 1 of X" after filter change
  8. Test search with active filters
  9. Test on mobile viewport (≤640px)

## Notes
- The `category` filter already exists in `InventoryFilters` interface but wasn't wired up in the UI
- Warehouse filtering is done client-side against `warehouseLocations` array since nested array filtering in Supabase is complex
- Item types "weight" and "pack_weight" should be grouped as "Weight Items"
- Item types "pack" and "normal" should be grouped as "Unit Items"
- Follow the existing pattern from stock-config page for filter UI consistency
- Do NOT add URL params for filters in this iteration (can be added later as enhancement)
