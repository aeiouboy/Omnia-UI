# Chore: Inventory View Type Gate Implementation

## Metadata
adw_id: `CFR03`
prompt: `Implement View Type selection gate for Inventory Management page: User MUST select View Type first before accessing other Inventory Management menus. Remove Channel filter.`

## Chore Description
Implement a strict View Type selection gate on the Inventory Management page. The user must select a View Type before seeing any inventory data. This selection should be persisted in the `InventoryViewContext`. The manual Channel/Warehouse filter should be removed, as the channels are now determined by the selected View Type configuration.

## Relevant Files
Use these files to complete the chore:

*   `app/inventory/page.tsx` - Main inventory page to modify.
*   `src/contexts/inventory-view-context.tsx` - Context to use for global view state.
*   `src/types/view-type-config.ts` - Configuration definitions (View Type -> BU/Channels).
*   `src/types/inventory.ts` - Verify filter types.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Integrate InventoryViewContext in Inventory Page
*   Modify `app/inventory/page.tsx` to import and use `useInventoryView`.
*   Replace local `viewFilter` state with `selectedViewType` from the context.
*   Update `handleViewChange` to use `setViewType` from the context.
*   Ensure the page initializes correctly (loading state) while waiting for the context to load from localStorage.

### 2. Remove Manual Channel Filter
*   In `app/inventory/page.tsx`, remove the `Select` component for "Channel Filter" (currently using `warehouseFilter`).
*   Remove the `warehouseFilter` state variable.
*   Remove `handleWarehouseChange` function.

### 3. Update Data Fetching Logic
*   Modify the `filters` memo in `app/inventory/page.tsx`.
*   Instead of passing a user-selected `warehouseCode`, pass the `channels` derived from the `InventoryViewContext`.
*   Ensure `businessUnit` is also passed from the context.
*   Remove `warehouseCode` from the `filters` object if it's no longer used for manual filtering (or set it to `undefined`).

### 4. Verify View Gate UI
*   Ensure the "Please select a view..." empty state is shown when no view is selected.
*   Ensure the loading skeleton only shows if a view IS selected but data is loading.
*   Verify the `InventoryViewSelector` uses the context values.

## Validation Commands
Execute these commands to validate the chore is complete:

*   `npm run lint` - Ensure no unused variables (like `warehouseFilter`) remain.
*   `npm run build` - Verify the build passes with the changes.
