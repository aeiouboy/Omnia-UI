# Chore: Add Pack Item Support Fields to Product Details

## Metadata
adw_id: `edb65bbb`
prompt: `Add pack item support fields to the Product Details section of order line items. Add three new fields next to the existing Substitution field: 1) Bundle (boolean indicator), 2) Bundle Ref (reference string), 3) Packed Ordered Qty (quantity number). These fields should display in the order detail view component where line item product details are shown. Update the relevant type definitions if needed and ensure the mock data includes sample values for these new fields.`

## Chore Description
This chore moves and consolidates pack item support fields into the Product Details section of the order line items expanded view. The goal is to group related pack/bundle information together for better UX:

1. **Bundle** - Boolean indicator showing whether the item is part of a bundle (currently displayed in Fulfillment & Shipping column, needs to move to Product Details)
2. **Bundle Ref** - Reference string for the bundle (not currently displayed, needs to be added)
3. **Packed Ordered Qty** - Quantity number for packed items (currently conditionally displayed only for pack UOMs, should be shown unconditionally with N/A fallback)

The fields should be placed immediately after the Substitution field in the Product Details column.

## Relevant Files
Use these files to complete the chore:

- **`src/components/order-detail-view.tsx`** - Main file to modify. Contains the expanded item details UI with Product Details column (lines 835-882) where the new fields need to be added, and Fulfillment & Shipping column (lines 987-1070) where Bundle field needs to be removed from.
- **`src/components/order-management-hub.tsx`** - Contains the `ApiOrderItem` interface definition (lines 96-148). Already includes `bundle?: boolean`, `bundleRef?: string`, and `packedOrderedQty?: number` fields - no changes needed.
- **`src/lib/mock-data.ts`** - Contains mock data generation. Already generates `bundle`, `bundleRef`, and `packedOrderedQty` fields with sample values - no changes needed.

### New Files
No new files needed.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Add Bundle Field to Product Details Section
- Open `src/components/order-detail-view.tsx`
- Locate the Product Details column (around line 840-882)
- Find the Substitution field display (lines 863-866)
- Add a new field display for Bundle immediately after Substitution:
  ```tsx
  <div className="flex justify-between">
    <span className="text-gray-500">Bundle</span>
    <span className="text-gray-900 font-medium">{item.bundle ? 'Yes' : 'No'}</span>
  </div>
  ```

### 2. Add Bundle Ref Field to Product Details Section
- Immediately after the Bundle field, add Bundle Ref field:
  ```tsx
  <div className="flex justify-between">
    <span className="text-gray-500">Bundle Ref</span>
    <span className="text-gray-900 font-medium font-mono text-xs">{item.bundleRef || 'N/A'}</span>
  </div>
  ```

### 3. Modify Packed Ordered Qty Display Logic
- Locate the existing Packed Ordered Qty conditional display (lines 849-854)
- Move it to appear after Bundle Ref (after Substitution section)
- Remove the `isPackUOM` conditional wrapper so it displays unconditionally
- Change the fallback display to show 'N/A' when not applicable instead of `item.quantity`:
  ```tsx
  <div className="flex justify-between">
    <span className="text-gray-500">Packed Ordered Qty</span>
    <span className="text-gray-900 font-medium">{item.packedOrderedQty || 'N/A'}</span>
  </div>
  ```

### 4. Remove Bundle Field from Fulfillment & Shipping Column
- Locate the Fulfillment & Shipping column (around line 987-1070)
- Find and remove the Bundle field display (lines 1005-1008):
  ```tsx
  <div className="flex justify-between">
    <span className="text-gray-500">Bundle</span>
    <span className="text-gray-900 font-medium">{item.bundle ? 'Yes' : 'No'}</span>
  </div>
  ```

### 5. Clean Up isPackUOM Variable Usage
- Check if the `isPackUOM` variable (line 831) is still used elsewhere after removing the conditional display
- If not used anywhere else, it can be removed for cleaner code
- If used elsewhere (e.g., other conditional logic), keep it

### 6. Validate Type Definitions
- Open `src/components/order-management-hub.tsx`
- Verify that the `ApiOrderItem` interface already includes:
  - `bundle?: boolean` (line 117)
  - `bundleRef?: string` (line 118)
  - `packedOrderedQty?: number` (line 108)
- No changes should be needed - this is just verification

### 7. Validate Mock Data Generation
- Open `src/lib/mock-data.ts`
- Verify that mock data generation includes:
  - `bundle` field with ~5% true values (line 344)
  - `bundleRef` field generated when bundle is true (line 345)
  - `packedOrderedQty` field for pack-based UOMs (line 318)
- No changes should be needed - this is just verification

### 8. Build and Runtime Validation
- Run `pnpm build` to verify no TypeScript errors
- Run `pnpm dev` and navigate to an order detail page
- Expand a line item and verify:
  - Product Details section shows Bundle, Bundle Ref, and Packed Ordered Qty fields after Substitution
  - Fulfillment & Shipping section no longer shows Bundle field
  - All field values display correctly (Yes/No for Bundle, reference or N/A for Bundle Ref, number or N/A for Packed Ordered Qty)

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure no TypeScript compilation errors
- `pnpm lint` - Ensure no linting errors
- `pnpm dev` - Start development server and manually verify:
  1. Navigate to Orders → select an order → view order details
  2. Go to "Items" tab
  3. Click on any line item to expand details
  4. Verify "Product Details" column shows: UOM, Supply Type ID, Substitution, Bundle, Bundle Ref, Packed Ordered Qty, Gift Wrapped, Gift Message
  5. Verify "Fulfillment & Shipping" column does NOT show Bundle field (should start with Shipping Method, Fulfillment Status, Route...)
  6. Find an item where bundle=true (5% of items) and verify Bundle Ref shows a reference like "BDL-XXXX"
  7. Find an item with pack-based UOM (PACK, BOX, SET, etc.) and verify Packed Ordered Qty shows a number

## Notes
- The type definitions and mock data already support these fields, so this is primarily a UI reorganization task
- The Bundle field existed in Fulfillment & Shipping but logically belongs with Product Details alongside Bundle Ref
- The conditional display of Packed Ordered Qty based on UOM type is removed for consistency - showing N/A for non-pack items is clearer than hiding the field
- The `isPackUOM` variable may become unused after this change and can be cleaned up if so
