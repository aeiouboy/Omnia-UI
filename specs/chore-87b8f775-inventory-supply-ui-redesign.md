# Chore: Redesign Inventory Supply Page UI

## Metadata
adw_id: `87b8f775`
prompt: `Redesign Inventory Supply page UI at /app/inventory-new/supply/page.tsx to improve user-friendliness and align with system patterns.`

## Chore Description
Redesign the Inventory Supply page UI to improve user-friendliness and consistency with other pages in the system. The redesign includes:

1. **Filter Layout Redesign**: Change from horizontal inline layout to a cleaner grid layout with labels above inputs. Add Search icons inside text input fields.

2. **Filter Fields Layout**: Organize filters into two rows:
   - Row 1: Store ID, Store Name, Product ID, Product Name (4-column grid)
   - Row 2: Supply Type dropdown, View Type dropdown, spacer, Clear All button

3. **Table Column Reorder**: Change column order to prioritize Store ID and Store Name first, then Product ID and Product Name, followed by Supply Type and quantities.

4. **Add Pagination**: Add pagination footer matching the Order Management Hub pattern with "Showing X to Y of Z results", page size selector, and page navigation.

5. **Remove Old Filter Styling**: Remove border wrappers, vertical dividers, and inline text labels.

## Relevant Files
Use these files to complete the chore:

- **`app/inventory-new/supply/page.tsx`** - The main file to be modified. Contains the current filter bar, table, and page structure.
- **`src/components/pagination-controls.tsx`** - Existing pagination component to reuse for consistency with Order Management Hub.
- **`src/components/ui/input.tsx`** - Input component for reference on styling.
- **`src/components/ui/select.tsx`** - Select component for dropdowns.
- **`src/components/ui/button.tsx`** - Button component for Clear All button.
- **`lucide-react`** - Icon library, specifically the `Search` icon for input fields.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Add Pagination State and Import
- Import `PaginationControls` from `@/components/pagination-controls`
- Add pagination state variables:
  - `const [currentPage, setCurrentPage] = useState(1)`
  - `const [pageSize, setPageSize] = useState(25)`
- Add handler functions:
  - `handlePageChange(page: number)` - sets currentPage, resets to 1 when filters change
  - `handlePageSizeChange(size: number)` - sets pageSize and resets currentPage to 1

### 2. Update Filter Change Effects
- When any filter changes (storeId, storeName, productId, productName, supplyType, viewType), reset `currentPage` to 1
- Add `currentPage` and `pageSize` to the dependency array where needed

### 3. Redesign Filter Layout - Row 1 (Search Inputs)
- Remove the outer wrapper divs with `border border-border/40 rounded-md bg-muted/5`
- Remove the vertical divider `<div className="hidden sm:block h-8 w-px bg-border" />`
- Remove inline text labels "Store" and "Product"
- Create a new grid layout with responsive columns:
  ```jsx
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  ```
- For each input field, wrap in a container with label above:
  ```jsx
  <div className="space-y-1.5">
    <label className="text-xs font-medium text-muted-foreground">Store ID</label>
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input ... className="h-9 pl-9" />
    </div>
  </div>
  ```
- Apply this pattern to all 4 text inputs:
  - Store ID
  - Store Name
  - Product ID
  - Product Name

### 4. Redesign Filter Layout - Row 2 (Dropdowns and Actions)
- Create a flex row below the grid:
  ```jsx
  <div className="flex flex-wrap items-center gap-4">
  ```
- Add Supply Type dropdown wrapper:
  ```jsx
  <div className="space-y-1.5">
    <label className="text-xs font-medium text-muted-foreground">Supply Type</label>
    <Select ... >
      <SelectTrigger className="w-[180px] h-9">
  ```
- Add View Type dropdown wrapper:
  ```jsx
  <div className="space-y-1.5">
    <label className="text-xs font-medium text-muted-foreground">View Type</label>
    <Select ... >
      <SelectTrigger className="w-[280px] h-9">
  ```
- Add spacer and Clear All button:
  ```jsx
  <div className="flex-1" />
  <div className="flex items-center gap-2">
    {filterLoading && (...)}
    <Button ... className="h-9 hover:bg-gray-100">Clear All</Button>
  </div>
  ```

### 5. Reorder Table Columns
- Change TableHeader column order to:
  1. Store ID (sortable)
  2. Store Name (not sortable)
  3. Product ID (sortable)
  4. Product Name (not sortable)
  5. Supply Type (sortable, center-aligned)
  6. Available Qty (sortable, right-aligned)
  7. Total Qty (sortable, right-aligned)
- Change TableBody cell order to match the new header order
- For Available Qty: Apply conditional text color
  - `text-green-600` if `item.availableStock > 0`
  - `text-red-600` if `item.availableStock === 0`
- For Total Qty: Apply `text-muted-foreground`
- Center-align Supply Type badge

### 6. Add Pagination Logic to filteredData
- Create `paginatedData` from `filteredData`:
  ```typescript
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredData.slice(startIndex, startIndex + pageSize)
  }, [filteredData, currentPage, pageSize])
  ```
- Calculate total pages:
  ```typescript
  const totalPages = Math.ceil(filteredData.length / pageSize)
  ```
- Update table to render `paginatedData` instead of `filteredData`

### 7. Add PaginationControls Component
- Replace the existing footer div with `PaginationControls`:
  ```jsx
  <PaginationControls
    currentPage={currentPage}
    totalPages={totalPages}
    pageSize={pageSize}
    totalItems={filteredData.length}
    onPageChange={handlePageChange}
    onPageSizeChange={handlePageSizeChange}
    isLoading={filterLoading}
  />
  ```
- Keep the footer inside `<CardContent>` but outside the table's border div

### 8. Reset Page on Filter Changes
- Modify the `handleClear` function to also reset `currentPage` to 1
- Add an effect to reset `currentPage` to 1 when `filteredData.length` changes significantly (or whenever filters change)

### 9. Validate Changes
- Run `pnpm build` to ensure no TypeScript errors
- Run `pnpm dev` and navigate to `/inventory-new/supply` to verify:
  - Filter layout displays correctly with labels above inputs
  - Search icons appear inside input fields
  - Dropdowns appear on Row 2 with proper widths
  - Clear All button is right-aligned
  - Table columns appear in correct order
  - Pagination controls work correctly
  - Page resets to 1 when filters change

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure TypeScript compiles without errors
- `pnpm dev` - Start development server and manually verify at http://localhost:3000/inventory-new/supply:
  - Filters display in grid layout with labels above
  - Search icons visible in text inputs
  - Supply Type dropdown is 180px wide
  - View Type dropdown is 280px wide
  - Clear All button is right-aligned
  - Table columns in order: Store ID, Store Name, Product ID, Product Name, Supply Type, Available Qty, Total Qty
  - Available Qty shows green/red text based on value
  - Pagination shows "Showing X to Y of Z" with page size selector
  - Page navigation buttons work correctly

## Notes

- The existing `PaginationControls` component from `src/components/pagination-controls.tsx` should be reused for consistency with Order Management Hub.
- The filter loading indicator (`filterLoading`) should remain visible next to the Clear All button.
- Badge styling for Supply Type should remain unchanged (no icons).
- Row styling (not clickable) and sorting functionality should remain unchanged.
- Empty state component and page header with refresh button should remain unchanged.
- The Search icon is already imported from `lucide-react` in the current file.
