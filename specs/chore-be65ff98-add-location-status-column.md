# Chore: Add Location Status Column to Stock by Store Table

## Metadata
adw_id: `be65ff98`
prompt: `Add 'Location Status' column to Stock by Store table on Inventory Detail page.`

## Chore Description
Add a new 'Location Status' column to the Stock by Store table that displays whether each location is Active or Inactive. This column will provide visibility into which warehouse/store locations are currently operational and able to fulfill orders.

The column should:
- Display "Active" with a green indicator or "Inactive" with a gray/red indicator
- Be sortable like other columns in the table
- Handle undefined/null values by defaulting to "Active"

## Relevant Files
Use these files to complete the chore:

- **src/types/inventory.ts** - Contains the `StockLocation` interface that needs the new `locationStatus` field added
- **src/lib/mock-inventory-data.ts** - Contains the `generateMockWarehouseLocations` function that generates mock StockLocation data; needs to add `locationStatus` values
- **src/components/inventory/stock-by-store-table.tsx** - The main component that renders the Stock by Store table; needs the new column added with sorting support

### New Files
No new files needed.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Type Definitions
- Open `src/types/inventory.ts`
- Locate the `StockLocation` interface (around line 116-131)
- Add a new optional field `locationStatus?: 'Active' | 'Inactive'` with a JSDoc comment
- Place it after the `stockSafetyStock` field for logical grouping

### 2. Update Mock Data Generator
- Open `src/lib/mock-inventory-data.ts`
- Locate the `generateMockWarehouseLocations` function (around line 189-283)
- Add `locationStatus` field to each generated location object
- Use deterministic logic based on seed: approximately 85% Active, 15% Inactive
- Example logic: `locationStatus: (seed + i) % 7 === 0 ? 'Inactive' : 'Active'`
- Ensure the field is added in the locations.push() call around line 268-279

### 3. Update Stock by Store Table Component
- Open `src/components/inventory/stock-by-store-table.tsx`
- Add `"locationStatus"` to the `SortField` type union (line 32)
- Add sorting logic for `locationStatus` field in the sort switch statement (around line 79-84):
  ```typescript
  case "locationStatus":
    const locStatusA = a.locationStatus || 'Active'
    const locStatusB = b.locationStatus || 'Active'
    compareValue = locStatusA.localeCompare(locStatusB)
    break
  ```
- Add new table header column after the "Status" column (around line 215-223):
  ```tsx
  <TableHead
    className="cursor-pointer hover:bg-muted/50"
    onClick={() => handleSort("locationStatus")}
  >
    <div className="flex items-center">
      Location Status
      <SortIcon field="locationStatus" />
    </div>
  </TableHead>
  ```
- Update the `colSpan` value in the empty state row from `7` to `8` (line 229)
- Add new table cell in the table body after the Status cell (around line 277-282):
  ```tsx
  <TableCell>
    <Badge
      variant="outline"
      className={
        (location.locationStatus || 'Active') === 'Active'
          ? "bg-green-100 text-green-800 border-green-300"
          : "bg-gray-100 text-gray-600 border-gray-300"
      }
    >
      <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${
        (location.locationStatus || 'Active') === 'Active'
          ? "bg-green-500"
          : "bg-gray-400"
      }`} />
      {location.locationStatus || 'Active'}
    </Badge>
  </TableCell>
  ```

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm dev` - Start the development server and verify no runtime errors
- Navigate to `http://localhost:3000/inventory` in browser
- Click on any product row to open the detail view
- Scroll to "Stock by Store" section and verify:
  1. "Location Status" column header appears after "Status" column
  2. Active locations show green badge with green dot
  3. Inactive locations show gray badge with gray dot
  4. Click column header to verify sorting works (ascending/descending)
- `pnpm build` - Ensure TypeScript compilation passes with no errors
- `pnpm lint` - Ensure no linting errors

## Notes
- The `locationStatus` field is optional to maintain backwards compatibility with existing data
- Default to "Active" when the field is undefined/null to ensure graceful handling of legacy data
- The 85%/15% Active/Inactive ratio in mock data provides realistic testing scenarios
- The visual design uses consistent color coding: green for Active (operational), gray for Inactive (non-operational)
