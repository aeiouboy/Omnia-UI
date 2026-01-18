# Part 1: Split Order Lines for MAO Order W1156251121946800

## Overview
Update the existing `maoOrderW1156251121946800` order in `src/lib/mock-data.ts` to follow Omnia-UI order line splitting logic. Items with quantity > 1 must be split into multiple line items, each with quantity=1.

## Current State
The order has 7 line items with the following quantities that need splitting:
- LINE-W115625-001: quantity 3 (Dutch Mill UHT 125ml x3)
- LINE-W115625-002: quantity 2 (Milo Activ-Go 22g x2)
- LINE-W115625-004: quantity 4 (Milo Ready-to-Drink 180ml x4)
- LINE-W115625-006: quantity 4 (Milo Ready-to-Drink 180ml x4)
- LINE-W115625-007: quantity 2 (Dutch Mill UHT 125ml x2)

## Splitting Logic (from Omnia-UI)
For each item with quantity > 1, create multiple line items:
```typescript
const splitLines: ApiOrderItem[] = []
const splitCount = Math.floor(quantity)

for (let i = 0; i < splitCount; i++) {
  splitLines.push({
    ...item,
    id: `${id}-${i}`,
    quantity: 1,
    total_price: item.unit_price,  // Each line shows single unit price
    parentLineId: id,              // Reference to original line
    splitIndex: i,                 // Position in split (0, 1, 2, ...)
    splitReason: 'quantity-normalization'
  })
}
```

## Required Changes

### File: `src/lib/mock-data.ts`

1. **Locate the order**: Find `maoOrderW1156251121946800` (starts around line 3657)

2. **Split LINE-W115625-001** (quantity 3):
   ```typescript
   // Replace this single item:
   { id: 'LINE-W115625-001', quantity: 3, total_price: 345, unit_price: 115, ... }

   // With 3 split items:
   { id: 'LINE-W115625-001-0', quantity: 1, total_price: 115, unit_price: 115,
     parentLineId: 'LINE-W115625-001', splitIndex: 0, splitReason: 'quantity-normalization', ... }
   { id: 'LINE-W115625-001-1', quantity: 1, total_price: 115, unit_price: 115,
     parentLineId: 'LINE-W115625-001', splitIndex: 1, splitReason: 'quantity-normalization', ... }
   { id: 'LINE-W115625-001-2', quantity: 1, total_price: 115, unit_price: 115,
     parentLineId: 'LINE-W115625-001', splitIndex: 2, splitReason: 'quantity-normalization', ... }
   ```

3. **Split LINE-W115625-002** (quantity 2):
   ```typescript
   // Replace with 2 split items:
   { id: 'LINE-W115625-002-0', quantity: 1, total_price: 11, unit_price: 11,
     parentLineId: 'LINE-W115625-002', splitIndex: 0, splitReason: 'quantity-normalization', ... }
   { id: 'LINE-W115625-002-1', quantity: 1, total_price: 11, unit_price: 11,
     parentLineId: 'LINE-W115625-002', splitIndex: 1, splitReason: 'quantity-normalization', ... }
   ```

4. **LINE-W115625-003** (quantity 1): No splitting needed - keep as is

5. **Split LINE-W115625-004** (quantity 4):
   ```typescript
   // Replace with 4 split items:
   { id: 'LINE-W115625-004-0', quantity: 1, total_price: 159, unit_price: 159,
     parentLineId: 'LINE-W115625-004', splitIndex: 0, splitReason: 'quantity-normalization', ... }
   { id: 'LINE-W115625-004-1', quantity: 1, total_price: 159, unit_price: 159,
     parentLineId: 'LINE-W115625-004', splitIndex: 1, splitReason: 'quantity-normalization', ... }
   { id: 'LINE-W115625-004-2', quantity: 1, total_price: 159, unit_price: 159,
     parentLineId: 'LINE-W115625-004', splitIndex: 2, splitReason: 'quantity-normalization', ... }
   { id: 'LINE-W115625-004-3', quantity: 1, total_price: 159, unit_price: 159,
     parentLineId: 'LINE-W115625-004', splitIndex: 3, splitReason: 'quantity-normalization', ... }
   ```

6. **LINE-W115625-005** (quantity 1): No splitting needed - keep as is

7. **Split LINE-W115625-006** (quantity 4):
   ```typescript
   // Replace with 4 split items:
   { id: 'LINE-W115625-006-0', quantity: 1, total_price: 159, unit_price: 159,
     parentLineId: 'LINE-W115625-006', splitIndex: 0, splitReason: 'quantity-normalization', ... }
   { id: 'LINE-W115625-006-1', quantity: 1, total_price: 159, unit_price: 159,
     parentLineId: 'LINE-W115625-006', splitIndex: 1, splitReason: 'quantity-normalization', ... }
   { id: 'LINE-W115625-006-2', quantity: 1, total_price: 159, unit_price: 159,
     parentLineId: 'LINE-W115625-006', splitIndex: 2, splitReason: 'quantity-normalization', ... }
   { id: 'LINE-W115625-006-3', quantity: 1, total_price: 159, unit_price: 159,
     parentLineId: 'LINE-W115625-006', splitIndex: 3, splitReason: 'quantity-normalization', ... }
   ```

8. **Split LINE-W115625-007** (quantity 2):
   ```typescript
   // Replace with 2 split items:
   { id: 'LINE-W115625-007-0', quantity: 1, total_price: 69, unit_price: 69,
     parentLineId: 'LINE-W115625-007', splitIndex: 0, splitReason: 'quantity-normalization', ... }
   { id: 'LINE-W115625-007-1', quantity: 1, total_price: 69, unit_price: 69,
     parentLineId: 'LINE-W115625-007', splitIndex: 1, splitReason: 'quantity-normalization', ... }
   ```

## Expected Result
After splitting, the order should have **17 line items** total:
- 3 items from LINE-W115625-001
- 2 items from LINE-W115625-002
- 1 item from LINE-W115625-003 (no split)
- 4 items from LINE-W115625-004
- 1 item from LINE-W115625-005 (no split)
- 4 items from LINE-W115625-006
- 2 items from LINE-W115625-007

## Important Notes
1. **Preserve all other fields**: Copy ALL existing fields from original items to split items
2. **Update total_price**: Each split line should show unit_price as total_price (quantity=1)
3. **Maintain order**: Keep split items in the same position as original item
4. **Do NOT modify**:
   - Order header information
   - Customer data
   - Pricing breakdown
   - Promotions/coupons
   - Payment information
   - Delivery information
   - Only modify the `items` array

## Validation
After making changes:
1. Run `pnpm build` to verify no TypeScript errors
2. Start dev server with `pnpm dev`
3. Navigate to http://localhost:3000/orders
4. Search for order W1156251121946800
5. Verify order detail shows 17 line items
6. Verify items with parentLineId display correctly in UI
