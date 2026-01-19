# Chore: Mock Data Order Line Splitting Variety Enhancement

## Metadata
adw_id: `51c24d10`
prompt: `Update the mock data in src/lib/mock-data.ts to add items with quantities > 1 to multiple orders (not just the test order). This will demonstrate the order line splitting functionality across all orders.`

## Chore Description

The current mock data in `src/lib/mock-data.ts` generates 150 orders with random quantities for items, but only the dedicated test order `ORD-SPLIT-TEST-001` has comprehensive quantity variations that demonstrate the order line splitting functionality. The chore requires updating the existing mock order generation to add items with quantities > 1 to approximately 30-50% of the existing orders, ensuring variety in the order line splitting demonstration.

The order line splitting logic in `src/lib/order-utils.ts` already handles:
- Splitting integer quantities > 1 into multiple lines with quantity = 1
- Preserving decimal/weight-based quantities (no split)
- Adding parentLineId, splitIndex, and splitReason metadata to split lines

This change ensures the splitting logic is exercised across many orders in the system, not just the dedicated test order.

## Relevant Files

### Files to Modify
- **src/lib/mock-data.ts** (line ~273-277)
  - Contains the order item generation logic within the `mockApiOrders` array generation
  - Current quantity distribution: 40% chance of 1, 30% chance of 2, 20% chance of 3, 10% chance of 4-5
  - Need to adjust this distribution to ensure 30-50% of orders have at least one item with quantity > 1

### Files to Keep Unchanged
- **src/lib/order-utils.ts**
  - Contains the splitting logic (`splitOrderLines`, `splitOrderLineItem`)
  - Should automatically handle the new data without changes

- **app/api/orders/external/route.ts**
  - API route that integrates the splitting logic
  - Should work automatically with updated mock data

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Review Current Mock Data Structure
- Locate the order items generation code (around line 273-277 in mock-data.ts)
- Identify the current quantity distribution logic: `quantityRoll < 0.4 ? 1 : quantityRoll < 0.7 ? 2 : quantityRoll < 0.9 ? 3 : Math.floor(Math.random() * 2) + 4`
- Verify that this already generates some orders with quantity > 1
- Confirm the test order ORD-SPLIT-TEST-001 is at lines 2670-2868 and should remain unchanged

### 2. Adjust Quantity Distribution Strategy
- Modify the quantity generation logic to increase variety of scenarios:
  - Keep some orders with all single-quantity items (no splits)
  - Create some orders with mixed quantities (some split, some not)
  - Add some orders with multiple high-quantity items
- Target: 30-50% of orders should have at least one item with quantity > 1

### 3. Preserve Weight-Based Items
- Ensure weight-based items with decimal quantities remain unchanged
- The current `WEIGHT_UOMS` array already handles this
- Verify that items with KG, G, GRAM, LB UOMs keep decimal quantities (no split)

### 4. Update Order Totals Calculation
- Verify that order totals are calculated correctly based on quantities
- The `total_price` calculation (line 279) already uses `unit_price * quantity`
- Verify `total_amount` (line 410) uses `orderItems.reduce((sum, item) => sum + item.total_price, 0)`
- Ensure payment breakdown (lines 412-419) uses the correct totals

### 5. Test Order Preservation
- Confirm ORD-SPLIT-TEST-001 (lines 2670-2868) remains completely unchanged
- Verify all test cases in the test order remain intact:
  - Test Case 1: Quantity = 3 (splits into 3 lines)
  - Test Case 2: Quantity = 5 (splits into 5 lines)
  - Test Case 3: Decimal 1.75kg (no split - weight)
  - Test Case 4: Quantity = 1 (no split - single)
  - Test Case 5: Quantity = 2 (splits into 2 lines)
  - Test Case 6: Decimal 0.5kg (no split - weight)

### 6. Verify Splitting Logic Integration
- Confirm that `src/lib/order-utils.ts` requires no changes
- The existing `splitOrderLines` function will automatically handle the new data
- Verify `app/api/orders/external/route.ts` calls the splitting function correctly

## Validation Commands
Execute these commands to validate the chore is complete:

```bash
# Development server start
pnpm dev

# Verify TypeScript compilation
pnpm build

# Check for any linting errors
pnpm lint
```

Manual validation steps:
1. Start the development server
2. Navigate to the Orders page
3. Open various order details to verify:
   - Some orders show split order lines (quantity > 1 items split into multiple lines)
   - Some orders have no splits (all single-quantity items)
   - Weight-based items with decimal quantities are not split
   - The test order ORD-SPLIT-TEST-001 still has all 6 test cases intact

## Notes

### Current Implementation Details

**Existing Quantity Distribution (line 276-277):**
```javascript
const quantityRoll = Math.random()
const quantity = quantityRoll < 0.4 ? 1 : quantityRoll < 0.7 ? 2 : quantityRoll < 0.9 ? 3 : Math.floor(Math.random() * 2) + 4
```

This creates:
- 40% of items with quantity 1
- 30% of items with quantity 2
- 20% of items with quantity 3
- 10% of items with quantity 4-5

**Potential Enhancement:**
To better demonstrate splitting variety, consider a two-tiered approach:
1. First decide if an order should have split-eligible items (30-50% chance)
2. For split-eligible orders, increase the probability of quantity > 1 items

### Order Line Splitting Rules

The splitting logic in `order-utils.ts` follows these rules:
- **Split:** Integer quantity > 1, non-weight UOM
- **No Split:** Quantity = 1, decimal quantities, weight-based UOM (KG, G, GRAM, LB, LBS, OZ, ML, L, LITER)
- **Metadata Added:** `parentLineId`, `splitIndex`, `splitReason`, and each split line gets `quantity: 1`

### Test Order Location

The test order `ORD-SPLIT-TEST-001` is defined at lines 2670-2868 and added to `mockApiOrders` via `unshift()` at line 2868, making it the first order in the array for easy access during testing.
