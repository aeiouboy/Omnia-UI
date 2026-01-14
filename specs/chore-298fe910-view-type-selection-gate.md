# Chore: Inventory Management - View Type Selection Gate

## Metadata
adw_id: `298fe910`
prompt: `Implement View Type selection gate for Inventory Management page with mandatory selection before accessing other menus, BU→Channel mapping, and removal of Channel filter dropdown`

## Chore Description
Implement a View Type selection gate for the Inventory Management page that enforces mandatory View Type selection before users can access inventory data. The View Type determines the Business Unit (BU) and Channel filtering automatically through a configuration mapping table.

Key requirements:
1. User MUST select a View Type before inventory data is displayed
2. View Type selection gates access to Stock Card and other inventory subpages
3. Selected View Type is stored in context and persisted across inventory pages
4. Channel filter dropdown is removed - Channel is determined automatically by View Type → BU → Channel mapping
5. View Type configuration follows the specified BU-Channel mapping table

### View Type Configuration Mapping
| View Type | BU | Channel |
|-----------|-----|---------|
| ECOM-TH-CFR-LOCD-STD | CFR | TOL |
| ECOM-TH-CFR-LOCD-STD | CFR | MKP |
| MKP-TH-CFR-LOCD-STD | CFR | QC |
| ECOM-TH-DSS-NW-STD | DS | STD (Standard Delivery and Standard Pickup) |
| ECOM-TH-DSS-LOCD-EXP | DS | EXP (3H delivery and 1H pickup) |

## Relevant Files
Use these files to complete the chore:

### Core Components
- **`app/inventory/page.tsx`** - Main inventory page where View Type selector is already placed; needs to enforce mandatory selection and disable menus
- **`src/components/inventory/inventory-view-selector.tsx`** - Existing View Type dropdown component; needs to be updated with new VIEW_TYPE_CONFIG mapping
- **`src/components/inventory/inventory-empty-state.tsx`** - Empty state component shown when no view is selected

### Context and State Management
- **`src/contexts/organization-context.tsx`** - Reference pattern for creating the View Type context with localStorage persistence
- **`src/types/inventory.ts`** - Contains InventoryViewType and InventoryFilters types; needs new ViewType config types

### Related Pages (need View Type inheritance)
- **`app/inventory/stores/page.tsx`** - Stock Card page; should inherit View Type from context and gate access
- **`app/inventory/[id]/page.tsx`** - Inventory detail page; should maintain View Type context

### New Files

- **`src/contexts/inventory-view-context.tsx`** - New context provider for View Type state management with localStorage persistence and BU→Channel mapping
- **`src/types/view-type-config.ts`** - New type definitions for View Type configuration mapping

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Create View Type Configuration Types
- Create `src/types/view-type-config.ts` with ViewType configuration interfaces
- Define the ViewTypeConfig interface with viewType, businessUnit, and channels array
- Create the VIEW_TYPE_CONFIG constant mapping based on the requirements table
- Add helper function to get channels by view type: `getChannelsByViewType(viewType: string): string[]`
- Add helper function to get business unit by view type: `getBusinessUnitByViewType(viewType: string): string`
- Export all types and constants

### 2. Create Inventory View Context
- Create `src/contexts/inventory-view-context.tsx` with InventoryViewProvider
- Store selectedViewType in state with localStorage persistence (key: 'inventory-view-type')
- Expose `selectedViewType`, `setViewType`, `clearViewType`, and `isViewTypeSelected` from context
- Derive `businessUnit` and `channels` from selected view type using config helpers
- Include `isLoading` state for initial localStorage read
- Follow pattern from organization-context.tsx for implementation

### 3. Update Type Definitions
- Update `src/types/inventory.ts` to import and re-export view type config types
- Add 'viewType' to InventoryFilters interface (if not already present)
- Ensure InventoryItem.view field aligns with new ViewType configuration

### 4. Update Inventory View Selector Component
- Modify `src/components/inventory/inventory-view-selector.tsx`
- Import VIEW_TYPE_CONFIG from types
- Replace VIEW_CODE_OPTIONS with values from VIEW_TYPE_CONFIG
- Add "Select a View Type" placeholder text (no "All" option)
- Style selector to indicate mandatory selection (e.g., required indicator)
- Show BU and Channel info as tooltip or subtitle for each option

### 5. Wrap Inventory Pages with Context Provider
- Update `app/inventory/page.tsx` to wrap content with InventoryViewProvider (or add to root layout)
- Alternative: Add InventoryViewProvider to `app/inventory/layout.tsx` if it exists, or create it
- Ensure context is available to all inventory subpages

### 6. Update Main Inventory Page
- Modify `app/inventory/page.tsx` to use `useInventoryView` context hook
- Remove the Channel filter dropdown (`warehouseFilter` and related handlers)
- Keep the existing View Type selector but wire it to context
- Disable "Stock Card" button until View Type is selected
- Update filters to automatically include BU and channels from selected View Type
- Remove the "All" / "Clear View" option - View Type must always be selected after initial selection
- Show clear messaging in empty state about mandatory selection

### 7. Update Stock Card Page (Stores)
- Modify `app/inventory/stores/page.tsx` to use `useInventoryView` context hook
- If no View Type is selected, redirect to `/inventory` or show gate message
- Do NOT show View Type selector again - inherit from context
- Filter store data based on View Type's BU and Channel mapping
- Add visual indicator showing current View Type context

### 8. Update Inventory Detail Page
- Ensure `app/inventory/[id]/page.tsx` maintains View Type context
- Pass View Type context to InventoryDetailView component if needed
- Transaction filtering should respect View Type's channel constraints

### 9. Remove Channel Filter from UI
- In `app/inventory/page.tsx`, remove the Channel dropdown filter completely
- Remove `warehouseFilter` state and `handleWarehouseChange` handler
- Remove the Select component for "All Channels"
- Channel filtering is now automatic via View Type selection

### 10. Validate Implementation
- Run `pnpm build` to verify no TypeScript errors
- Test navigation flow: Inventory → View Selection → Data Display → Stock Card
- Verify View Type persists across page refreshes
- Verify Stock Card is gated until View Type is selected
- Verify Channel filter is removed and filtering works via View Type mapping

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure production build succeeds with no TypeScript errors
- `pnpm lint` - Verify no ESLint errors or warnings
- `pnpm dev` - Start dev server and manually test:
  1. Navigate to `/inventory` - should show empty state requiring View Type selection
  2. Select a View Type (e.g., ECOM-TH-CFR-LOCD-STD) - should display inventory data
  3. Click "Stock Card" button - should navigate and show filtered store data
  4. Refresh page - View Type should persist from localStorage
  5. Verify Channel dropdown is completely removed
  6. Verify BU/Channel filtering works based on View Type mapping

## Notes
- The existing `viewFilter` state in inventory/page.tsx already implements partial view gating; this chore extends it to full enforcement with context sharing
- The VIEW_TYPE_CONFIG mapping may need to accommodate additional view types from the existing VIEW_CODE_OPTIONS list (CMG-*, MKP-*, etc.) - prioritize the 5 specified types
- Consider adding a "Change View Type" option in the header area once selected, rather than full removal capability
- localStorage key should be distinct from organization context to avoid conflicts
- The Stock Card page currently lacks View Type awareness - this is a key integration point
