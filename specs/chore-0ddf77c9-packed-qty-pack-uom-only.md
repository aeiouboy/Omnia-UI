# Chore: Fix Packed Ordered Qty Display for Pack-Type UOMs Only

## Metadata
adw_id: `0ddf77c9`
prompt: `Fix Packed Ordered Qty display to only show for pack-type UOMs in order-detail-view.tsx`

## Chore Description
The 'Packed Ordered Qty' field in the PRODUCT DETAILS section of the order detail view is currently displaying for all items regardless of their Unit of Measure (UOM) type. This is incorrect because 'Packed Ordered Qty' should only be relevant for pack-type UOMs (PACK, BOX, SET, CASE, CTN, CARTON), not for individual unit UOMs like bottles (BTL), pieces (PCS), or weight measurements (KG, G).

**Issue Example:**
- Fresh Milk 1L with UOM: BTL (bottle) incorrectly shows 'Packed Ordered Qty: 3'
- This field should either be hidden or show '-' for non-pack UOMs

**Pack UOMs (should show field):**
- PACK, BOX, SET, CASE, CTN, CARTON

**Non-Pack UOMs (should hide field or show '-'):**
- BTL, PCS, EA, EACH, KG, G, GRAM, LB, L, ML, UNIT

## Relevant Files
Use these files to complete the chore:

- **src/components/order-detail-view.tsx** (lines 730-770) - Contains the PRODUCT DETAILS section in the expanded item view where the 'Packed Ordered Qty' field is displayed. Need to add conditional rendering logic based on UOM type.

- **src/lib/mock-data.ts** (lines 260-286, 373) - Contains mock data generation for order items, including the `packedOrderedQty` field. Currently generates `packedOrderedQty` for all items regardless of UOM type. Need to conditionally generate this field only for pack-type UOMs.

- **src/components/order-management-hub.tsx** (lines 101-104) - Contains the TypeScript interface definition for `ApiOrderItem` which includes the `packedOrderedQty` optional field. No changes needed here, just for reference.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Add Conditional Logic to Order Detail View
- Open `src/components/order-detail-view.tsx`
- Locate the PRODUCT DETAILS section around lines 730-770 in the expanded item details
- Find the "Packed Ordered Qty" field display (around line 742-743)
- Add a constant before the PRODUCT DETAILS section to define pack-type UOMs:
  ```typescript
  const isPackUOM = ['PACK', 'BOX', 'SET', 'CASE', 'CTN', 'CARTON'].includes(item.uom?.toUpperCase() || '')
  ```
- Wrap the "Packed Ordered Qty" row in a conditional render that checks `isPackUOM`
- For non-pack UOMs, either hide the entire row or display '-' as the value
- Ensure the conditional rendering maintains proper spacing and layout

### 2. Update Mock Data Generation Logic
- Open `src/lib/mock-data.ts`
- Locate the mock data generation for order items (around lines 260-286)
- Find where `packedOrderedQty` is assigned (line 281)
- Add logic to only generate `packedOrderedQty` for pack-type UOMs:
  ```typescript
  const isPackUOM = ['PACK', 'BOX', 'SET', 'CASE', 'CTN', 'CARTON'].includes(uom.toUpperCase())
  const packedOrderedQty = isPackUOM ? quantity : undefined
  ```
- Ensure the assignment in the item object (line 373) uses this conditional value
- Verify that non-pack UOMs will have `packedOrderedQty` as `undefined` or `null`

### 3. Test the Changes
- Start the development server with `pnpm dev`
- Navigate to the Order Management Hub
- Select an order with mixed UOM types (both pack and non-pack)
- Expand the order details for each item
- Verify that items with pack UOMs (PACK, BOX, etc.) show the 'Packed Ordered Qty' field
- Verify that items with non-pack UOMs (BTL, PCS, EA, KG, etc.) either hide the field or show '-'
- Check multiple items to ensure consistency
- Verify no layout issues or spacing problems in the PRODUCT DETAILS section

### 4. Validate Build and Type Safety
- Run TypeScript compilation check: `pnpm build` or `npx tsc --noEmit`
- Ensure no TypeScript errors are introduced
- Verify the optional `packedOrderedQty?: number` type in the interface allows undefined values
- Check that all conditional rendering is type-safe

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm dev` - Start development server and manually test the UI changes
- `npx tsc --noEmit` - Verify no TypeScript errors
- `pnpm build` - Ensure production build succeeds without errors
- Manual testing steps:
  1. Open http://localhost:3000
  2. Navigate to Order Management Hub
  3. Select an order and view details
  4. Expand items in the Items tab
  5. Verify 'Packed Ordered Qty' only shows for PACK, BOX, SET, CASE, CTN, CARTON UOMs
  6. Verify items with BTL, PCS, EA, KG, etc. don't show the field (or show '-')

## Notes
- The `packedOrderedQty` field in the TypeScript interface is already optional (`packedOrderedQty?: number`), so setting it to `undefined` for non-pack UOMs is type-safe
- Consider using a centralized constant for pack-type UOMs if this logic is used in multiple places (currently only 2 files)
- The conditional rendering approach (hiding vs showing '-') should be consistent with other optional fields in the PRODUCT DETAILS section
- This change improves data accuracy and user experience by only showing relevant fields for each UOM type
