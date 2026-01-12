# Chore: Inventory Store Context Preservation

## Metadata
adw_id: `f8eab7a2`
prompt: `Inventory store context fix: When navigating from store-filtered inventory to product detail, preserve the store query parameter in URL. In inventory-detail-view.tsx add storeContext prop, hide Stock by Store section when storeContext exists, and filter Recent Transactions by store. Update app/inventory/page.tsx to pass store param when clicking product rows.`

## Chore Description
When users navigate from a store-filtered inventory list to a product detail page, the store context should be preserved throughout the user experience. This chore implements three key behaviors:

1. **URL Preservation**: Pass the store query parameter from the inventory list page to the product detail page URL
2. **UI Adaptation**: Hide the "Stock by Store" section in the detail view when viewing from a store-specific context (since user is already viewing a specific store)
3. **Transaction Filtering**: Filter the Recent Transactions table to show only transactions from the selected store context

This enhancement improves user experience by maintaining navigation context and showing only relevant information when drilling down from a store-filtered view.

## Relevant Files
Use these files to complete the chore:

- **app/inventory/page.tsx** (lines 628): Inventory list page - needs to pass store parameter when clicking product rows
  - Currently navigates to `/inventory/${item.id}` without preserving store context
  - Need to append `?store=${activeStoreFilter}` when activeStoreFilter exists

- **app/inventory/[id]/page.tsx** (lines 51, 73): Product detail page route - already extracts store param from searchParams
  - Already extracts `store` from searchParams (line 51)
  - Already passes `storeContext={store}` to InventoryDetailView (line 73)
  - No changes needed - this file is already correctly implemented

- **src/components/inventory-detail-view.tsx** (lines 66, 100, 105-107, 475): Product detail view component
  - Already has `storeContext` prop defined (line 66)
  - Already filters transactions by store (lines 105-107)
  - Already hides Stock by Store section when storeContext exists (line 475)
  - Component logic is already correctly implemented

- **src/components/recent-transactions-table.tsx**: Transactions table component
  - Already receives filtered transactions as props
  - No changes needed - filtering happens in parent component

- **src/components/inventory/stock-by-store-table.tsx**: Store stock table component
  - Already conditionally hidden in inventory-detail-view.tsx
  - No changes needed

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Inventory List Navigation
- Open `app/inventory/page.tsx`
- Locate the TableRow onClick handler (around line 628)
- Modify the navigation logic to append store query parameter when activeStoreFilter exists
- Use URL encoding for the store parameter to handle special characters
- Ensure the navigation works both with and without store filter

### 2. Verify Detail Page Implementation
- Review `app/inventory/[id]/page.tsx` to confirm it extracts store from searchParams
- Confirm it passes storeContext prop to InventoryDetailView component
- No changes should be needed - verify existing implementation is correct

### 3. Verify Detail View Component Implementation
- Review `src/components/inventory-detail-view.tsx` to confirm:
  - storeContext prop is defined in interface
  - Transaction filtering logic exists and works correctly
  - Stock by Store section is conditionally hidden based on storeContext
- No changes should be needed - verify existing implementation is correct

### 4. Test Navigation Flow
- Start dev server with `pnpm dev`
- Navigate to inventory list page
- Apply a store filter using the store context feature
- Click on a product row
- Verify URL contains `?store=<store-name>` parameter
- Verify product detail page shows filtered transactions
- Verify Stock by Store section is hidden
- Test navigation back to inventory list maintains filter

### 5. Test Edge Cases
- Test with store names containing special characters or spaces
- Test direct URL access with store parameter
- Test without store parameter (all stores view)
- Verify back navigation works correctly
- Verify clearing store filter removes parameter from URLs

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm dev` - Start development server and manually test the navigation flow
- Check browser console for any errors or warnings during navigation
- Verify URL structure: `/inventory/[id]?store=<encoded-store-name>`
- Test the following user flows:
  1. Inventory List → Apply Store Filter → Click Product → Verify store param in URL
  2. Product Detail (with store) → Verify Stock by Store hidden
  3. Product Detail (with store) → Verify transactions filtered by store
  4. Product Detail (without store) → Verify Stock by Store visible
  5. Product Detail (without store) → Verify all transactions shown
- Use React DevTools to inspect component props and verify storeContext is passed correctly
- Check Network tab to ensure API calls include appropriate store filters

## Notes

### Current Implementation Status
Based on code review, most of the functionality is **already implemented**:
- ✅ `app/inventory/[id]/page.tsx` correctly extracts store from searchParams and passes to component
- ✅ `inventory-detail-view.tsx` has storeContext prop defined and uses it to:
  - Filter transactions (lines 105-107)
  - Hide Stock by Store section (line 475)
- ❌ `app/inventory/page.tsx` does NOT pass store parameter when navigating to detail page (line 628)

### Implementation Focus
The primary change needed is in **app/inventory/page.tsx line 628**:

**Current:**
```typescript
onClick={() => router.push(`/inventory/${item.id}`)}
```

**Should be:**
```typescript
onClick={() => {
  const url = `/inventory/${item.id}`
  const params = activeStoreFilter ? `?store=${encodeURIComponent(activeStoreFilter)}` : ''
  router.push(`${url}${params}`)
}}
```

### Store Context Flow
1. User filters inventory by store (activeStoreFilter state is set from URL param)
2. User clicks product row → Navigate with store param
3. Detail page extracts store from searchParams
4. Detail view receives storeContext and adapts UI accordingly

### Design Considerations
- URL encoding ensures store names with spaces/special chars work correctly
- Conditional logic prevents adding empty query parameters
- Back navigation maintains store filter context for better UX
- Component design supports both filtered and unfiltered views seamlessly
