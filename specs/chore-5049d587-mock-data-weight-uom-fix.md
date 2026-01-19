# Chore: Fix Mock Data Weight Generation for UOM Types

## Metadata
adw_id: `5049d587`
prompt: `Fix mock data weight generation to correctly distinguish weight vs non-weight items in order-management-hub.tsx and order-detail-view.tsx:

  PROBLEM:
  - Currently mock data generates weight for ALL items regardless of UOM type
  - Items with UOM='PACK', 'PCS', 'PIECE', 'EA', 'EACH', 'BOX', 'SET' are non-weight items and should NOT have weight data
  - Items with UOM='KG', 'G', 'GRAM', 'LB' are weight items and SHOULD have weight data
  - This causes non-weight items like Croissant 6pcs (UOM: PACK) to incorrectly display Weight/Weight(Actual) instead of Qty

  SOLUTION:
  1. In order-management-hub.tsx mock data generation (around lines 380-420), update the generateMockItems function:
     - Check item UOM type before assigning weight
     - Non-weight UOMs (PACK, PCS, PIECE, EA, EACH, BOX, SET): set weight=undefined, actualWeight=undefined
     - Weight UOMs (KG, G, GRAM, LB): generate random weight and actualWeight values

  2. Ensure consistency between order list collapsed view and order detail expanded view:
     - Collapsed view shows 'Qty: X' for non-weight items
     - Expanded Pricing & Promotions shows Price|Qty, Total|(empty) for non-weight items
     - Collapsed view shows 'Weight: X kg' for weight items (if applicable)
     - Expanded Pricing & Promotions shows Price|Weight, Weight(Actual)|Total for weight items

  3. Update mock item generation to use realistic UOMs:
     - Bakery items (Croissant, Bread): UOM='PACK' or 'PCS' - NO weight
     - Frozen items (Ice Cream): UOM='EA' or 'PCS' - NO weight
     - Produce items (Fruits, Vegetables): UOM='KG' - HAS weight
     - Meat/Seafood items: UOM='KG' - HAS weight

  4. Test both display modes work correctly after the fix`

## Chore Description
Fix the mock data generation logic to properly distinguish between weight-based and quantity-based items based on their UOM (Unit of Measurement) types. Currently, all mock items are incorrectly assigned weight and actualWeight values regardless of their UOM, causing non-weight items like "Croissant 6pcs (UOM: PACK)" to display weight fields instead of quantity fields in the UI.

The fix involves:
1. Defining weight vs non-weight UOM types
2. Conditionally generating weight data only for weight-based UOMs (KG, G, GRAM, LB)
3. Setting weight=undefined and actualWeight=undefined for non-weight UOMs (PACK, PCS, PIECE, EA, EACH, BOX, SET)
4. Updating product definitions with appropriate UOMs matching their real-world types
5. Verifying UI displays correctly in both collapsed and expanded views

## Relevant Files
Use these files to complete the chore:

- **src/lib/mock-data.ts** (lines 176-471) - Contains the mock data generation logic where items are created with weight fields. This is the PRIMARY file that needs modification.
  - Line 256: UOM options array definition
  - Line 276: UOM assignment to items
  - Lines 335-337: Weight and actualWeight generation (currently unconditional)
  - Lines 194-210: Product definitions that need UOM type updates

- **src/components/order-detail-view.tsx** (lines 775-829) - Contains the Pricing & Promotions section that conditionally displays weight or quantity based on item.weight. This file already has correct display logic and should work properly once mock data is fixed.
  - Line 782: Checks `hasWeight = item.weight && item.weight > 0` to determine display mode
  - Lines 791-801: Conditionally shows Weight or Qty based on hasWeight flag

### New Files
No new files need to be created.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Define UOM Type Constants
- At the top of `src/lib/mock-data.ts` (after imports, around line 7), add constants to categorize UOM types:
  ```typescript
  // UOM Type Categories
  const WEIGHT_UOMS = ['KG', 'G', 'GRAM', 'LB'] as const
  const NON_WEIGHT_UOMS = ['PACK', 'PCS', 'PIECE', 'EA', 'EACH', 'BOX', 'SET', 'SCAN', 'SBOX', 'BTL'] as const
  ```

### 2. Update Product Definitions with Realistic UOMs
- In `src/lib/mock-data.ts` around lines 194-210, update the products array to assign appropriate UOMs to each product:
  - Bakery items (Croissant, Bread): UOM='PACK' or 'PCS'
  - Frozen items (Ice Cream, Pizza): UOM='EA' or 'PCS'
  - Produce items (Apples, Bananas): UOM='KG'
  - Meat/Seafood items (Chicken, Salmon): UOM='KG'
  - Dairy items (Milk, Eggs): UOM='PCS' or 'PACK'
  - Beverages (Coca Cola, Orange Juice): UOM='BTL' or 'EA'
  - Snacks (Cookies, Chips): UOM='PACK' or 'PCS'
  - Pantry (Rice): UOM='KG' or 'PACK'
- Add a `uom` field to each product object in the array

### 3. Update Item Generation to Use Product-Specific UOMs
- In `src/lib/mock-data.ts` around line 276, replace the random UOM assignment:
  ```typescript
  // OLD: const uom = uomOptions[Math.floor(Math.random() * uomOptions.length)]
  // NEW: Use the UOM from the product definition
  const uom = product.uom || 'EA'  // Fallback to EA if not specified
  ```

### 4. Conditionally Generate Weight Data Based on UOM
- In `src/lib/mock-data.ts` around lines 335-337, replace the unconditional weight generation with conditional logic:
  ```typescript
  // OLD CODE (lines 335-337):
  // const weight = parseFloat((Math.random() * 4.9 + 0.1).toFixed(2))
  // const actualWeight = parseFloat((weight + (Math.random() * 0.2 - 0.1)).toFixed(2))

  // NEW CODE:
  // Conditionally generate weight fields only for weight-based UOMs
  const isWeightBasedUom = WEIGHT_UOMS.includes(uom as any)
  const weight = isWeightBasedUom ? parseFloat((Math.random() * 4.9 + 0.1).toFixed(2)) : undefined
  const actualWeight = isWeightBasedUom && weight ? parseFloat((weight + (Math.random() * 0.2 - 0.1)).toFixed(2)) : undefined
  ```

### 5. Verify Return Object Includes Conditional Weight Fields
- Ensure the item object returned around lines 352-399 in `src/lib/mock-data.ts` includes the conditionally assigned weight and actualWeight fields
- The fields should be at lines 394-395 and remain as-is since they now reference the conditionally assigned variables

### 6. Test Mock Data Generation
- Start the development server: `pnpm dev`
- Navigate to the Order Management Hub
- Verify that:
  - Items with UOM='KG' (Chicken, Salmon, Apples, Bananas) display "Weight: X kg" in collapsed view
  - Items with UOM='PACK', 'PCS', 'EA' (Croissant, Ice Cream, Milk) display "Qty: X" in collapsed view
  - Expand an item with weight UOM and verify Pricing & Promotions shows "Weight" and "Weight (Actual)" fields
  - Expand an item with non-weight UOM and verify Pricing & Promotions shows "Qty" field but no weight fields

### 7. Test Order Detail View Display
- Click on an order to open the detail view
- Navigate to the "Items" tab
- Expand multiple items and verify:
  - Non-weight items (Croissant, Cookies, Ice Cream) show Price|Qty, Total|(empty) in Pricing & Promotions section
  - Weight items (Chicken, Salmon, Apples) show Price|Weight, Weight(Actual)|Total in Pricing & Promotions section
- Check that the conditional display logic at lines 781-829 in `order-detail-view.tsx` works correctly with the fixed mock data

### 8. Verify Console and Build
- Check browser console for any errors or warnings
- Run `pnpm build` to ensure TypeScript compilation succeeds
- Verify no type errors related to weight/actualWeight fields (they should be `number | undefined`)

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm dev` - Start development server and manually verify:
  - Order list shows correct "Qty" or "Weight" based on UOM type
  - Order detail expanded view shows correct fields in Pricing & Promotions section
  - No console errors related to weight/actualWeight fields
  - Croissant 6pcs (UOM: PACK) shows "Qty: X" not "Weight: X kg"
  - Chicken Breast (UOM: KG) shows "Weight: X kg" not "Qty: X"

- `pnpm build` - Verify TypeScript compilation succeeds with no type errors

- `pnpm lint` - Verify no ESLint errors introduced

## Notes
- The order-detail-view.tsx component already has correct conditional rendering logic (lines 781-829) that checks `hasWeight = item.weight && item.weight > 0`. This chore only fixes the mock data generation to properly set weight fields based on UOM types.
- The TypeScript type definitions for ApiOrderItem already support optional weight and actualWeight fields (weight?: number, actualWeight?: number), so no type changes are needed.
- After this fix, the UI will correctly distinguish between quantity-based items (displaying Qty fields) and weight-based items (displaying Weight/Weight(Actual) fields) based on realistic UOM assignments.
