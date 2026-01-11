# Chore: Fix SelectItem empty value error in Order Management Hub filters

## Metadata
adw_id: `c796cc5c`
prompt: `Fix SelectItem empty value error in Order Management Hub filters. Application crashes with error 'A <Select.Item /> must have a value prop that is not an empty string.' Root cause is line 1515 with <SelectItem value="">All Stores</SelectItem>`

## Chore Description
The Order Management Hub filters crash when using the Store No. dropdown because the "All Stores" option uses an empty string value (`value=""`). Radix UI's Select component requires all SelectItem components to have non-empty string values. This chore fixes the issue by replacing empty string values with meaningful default values (following the existing pattern used by `all-status` and `all-channels`).

## Relevant Files
Use these files to complete the chore:

- **src/components/order-management-hub.tsx** - Main file containing the SelectItem with empty value on line 1515. Contains all filter state definitions, filter logic, reset handlers, and active filter generation.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Store No. Filter State and SelectItem
- Line 454: Change `const [storeNoFilter, setStoreNoFilter] = useState("")` to `const [storeNoFilter, setStoreNoFilter] = useState("all-stores")`
- Line 1515: Change `<SelectItem value="">All Stores</SelectItem>` to `<SelectItem value="all-stores">All Stores</SelectItem>`

### 2. Update Filter Logic for Store No. Filter
- Line 1031: Change `if (storeNoFilter)` to `if (storeNoFilter && storeNoFilter !== "all-stores")`

### 3. Update generateActiveFilters for Store No.
- Line 812: Change `if (storeNoFilter)` to `if (storeNoFilter && storeNoFilter !== "all-stores")`

### 4. Update handleResetAllFilters for Store No.
- Line 845: Change `setStoreNoFilter("")` to `setStoreNoFilter("all-stores")`

### 5. Update removeFilter for Store No.
- Line 775: Change `setStoreNoFilter("")` to `setStoreNoFilter("all-stores")`

### 6. Update Clear Filters Button Disabled State
- Line 1469: Update the disabled condition to check for `storeNoFilter === "all-stores"` instead of `!storeNoFilter`

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure the application builds without errors
- `pnpm dev` - Start development server and verify:
  1. Navigate to Order Management Hub
  2. Click on Store No. dropdown - it should open without crashing
  3. Select "All Stores" option - no crash should occur
  4. Select a specific store - filter should apply
  5. Click "Clear Filters" - Store No. should reset to "All Stores"
  6. Verify the active filters badge correctly shows/hides Store No. filter

## Notes
- This fix follows the existing pattern used by other filters like `statusFilter` (uses "all-status") and `channelFilter` (uses "all-channels")
- The Store No. dropdown is the only filter with an empty string value - other new filters like `paymentStatusFilter`, `itemStatusFilter`, `paymentMethodFilter`, and `orderTypeFilter` already use proper default values like "all-payment", "all-item-status", "all-payment-method", "all-order-type"
- The bug is specific to the Radix UI Select component which validates that all SelectItem values are non-empty strings
