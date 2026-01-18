# Chore: MAO Order W1156251121946800 Mock Data Fixes

## Metadata
adw_id: `07c60a77`
prompt: `Fix MAO order W1156251121946800 mock data issues for Gift with Purchase, promotions, and Fulfillment & Shipping information.`

## Chore Description
Fix three issues in the MAO order W1156251121946800 mock data in `src/lib/mock-data.ts`:

1. **Gift with Purchase**: Add `giftWithPurchase: false` field to all 17 line items to match MAO system data. Currently the field is missing from the MAO order items.

2. **Smarter Dental Floss Promotion**: The prompt states LINE-W115625-003 should have a promotion, but a previous verification (chore-a6e728d3) confirmed the empty promotions array is CORRECT per MAO data. This needs clarification from the user before making changes.

3. **Fulfillment & Shipping Info**: Add missing fulfillment fields (`shippingMethod`, `eta`, `route`, `bundle`, `bookingSlotFrom`, `bookingSlotTo`) to line items that don't have them (LINE-W115625-003, LINE-W115625-005, LINE-W115625-007-0/1, and several others).

## Relevant Files
Use these files to complete the chore:

- **src/lib/mock-data.ts** (lines 4706-5640) - Contains the maoOrderW1156251121946800 object with all line items
- **specs/chore-a6e728d3-mao-order-promotion-verification.md** - Previous verification confirming Smarter Dental Floss has no promotions per MAO

### Line Items Inventory (17 total)
| Line ID | Product | Has shippingMethod | Has eta | Has route | Has bundle |
|---------|---------|-------------------|---------|-----------|------------|
| LINE-W115625-001-0 | Bon Aroma Coffee | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No |
| LINE-W115625-001-1 | Bon Aroma Coffee | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No |
| LINE-W115625-001-2 | Bon Aroma Coffee | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No |
| LINE-W115625-002-0 | Betagro Egg Tofu | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No |
| LINE-W115625-002-1 | Betagro Egg Tofu | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No |
| LINE-W115625-003 | Smarter Dental Floss | ❌ No | ❌ No | ❌ No | ❌ No |
| LINE-W115625-004-0 | Tops Frozen Salmon | ❌ No | ❌ No | ❌ No | ❌ No |
| LINE-W115625-004-1 | Tops Frozen Salmon | ❌ No | ❌ No | ❌ No | ❌ No |
| LINE-W115625-004-2 | Tops Frozen Salmon | ❌ No | ❌ No | ❌ No | ❌ No |
| LINE-W115625-004-3 | Tops Frozen Salmon | ❌ No | ❌ No | ❌ No | ❌ No |
| LINE-W115625-005 | N&P Hom Banana | ❌ No | ❌ No | ❌ No | ❌ No |
| LINE-W115625-006-0 | Thammachart Seafood | ❌ No | ❌ No | ❌ No | ❌ No |
| LINE-W115625-006-1 | Thammachart Seafood | ❌ No | ❌ No | ❌ No | ❌ No |
| LINE-W115625-006-2 | Thammachart Seafood | ❌ No | ❌ No | ❌ No | ❌ No |
| LINE-W115625-006-3 | Thammachart Seafood | ❌ No | ❌ No | ❌ No | ❌ No |
| LINE-W115625-007-0 | Cubic Wheat Loaf | ❌ No | ❌ No | ❌ No | ❌ No |
| LINE-W115625-007-1 | Cubic Wheat Loaf | ❌ No | ❌ No | ❌ No | ❌ No |

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Add giftWithPurchase Field to All Line Items
Add `giftWithPurchase: false` to all 17 line items in the maoOrderW1156251121946800.items array. Per MAO system data, all items have Gift with Purchase = False.

**Implementation**: For each line item, add after `fulfillmentStatus` or at a consistent location:
```typescript
giftWithPurchase: false,
```

**Note**: Do NOT add a `giftWithPurchaseItem` field when giftWithPurchase is false.

**Line items to update**:
- LINE-W115625-001-0 (line ~4755)
- LINE-W115625-001-1 (line ~4796)
- LINE-W115625-001-2 (line ~4837)
- LINE-W115625-002-0 (line ~4879)
- LINE-W115625-002-1 (line ~4926)
- LINE-W115625-003 (line ~4974)
- LINE-W115625-004-0 (line ~5001)
- LINE-W115625-004-1 (line ~5048)
- LINE-W115625-004-2 (line ~5095)
- LINE-W115625-004-3 (line ~5142)
- LINE-W115625-005 (line ~5190)
- LINE-W115625-006-0 (line ~5230)
- LINE-W115625-006-1 (line ~5271)
- LINE-W115625-006-2 (line ~5312)
- LINE-W115625-006-3 (line ~5353)
- LINE-W115625-007-0 (line ~5395)
- LINE-W115625-007-1 (line ~5431)

### 2. Review Smarter Dental Floss Promotion Status
**IMPORTANT CONFLICT**: The prompt claims LINE-W115625-003 should have a promotion, but the previous chore verification (chore-a6e728d3) confirmed from MAO data that the Smarter Dental Floss item correctly has NO promotions (empty array).

**Decision Required**:
- If the user has new MAO data showing a promotion for Smarter Dental Floss, request the promotion details (promotionId, promotionType, discountAmount)
- If the previous verification is still valid, keep `promotions: []` as-is

**Temporary Action**: Skip this change until user clarifies. The current empty array matches previous MAO verification.

### 3. Add Missing Fulfillment & Shipping Fields
Add the following fields to line items that are missing them. Use consistent values matching other items in the same order:

**Standard values for this order**:
```typescript
shippingMethod: '3H Delivery',
bundle: false,
route: 'สายรถบางม่วง',
bookingSlotFrom: null,
bookingSlotTo: null,
eta: {
  from: '21 Nov 2025 12:00:00',
  to: '21 Nov 2025 13:00:00'
}
```

**Items needing fulfillment fields added**:
- LINE-W115625-003 (after fulfillmentStatus: 'DELIVERED')
- LINE-W115625-004-0 through LINE-W115625-004-3
- LINE-W115625-005
- LINE-W115625-006-0 through LINE-W115625-006-3
- LINE-W115625-007-0 and LINE-W115625-007-1

**Implementation Pattern**:
```typescript
{
  id: 'LINE-W115625-XXX',
  // ... existing fields ...
  fulfillmentStatus: 'DELIVERED',
  shippingMethod: '3H Delivery',    // ADD
  bundle: false,                     // ADD
  route: 'สายรถบางม่วง',            // ADD
  bookingSlotFrom: null,            // ADD
  bookingSlotTo: null,              // ADD
  eta: {                            // ADD
    from: '21 Nov 2025 12:00:00',
    to: '21 Nov 2025 13:00:00'
  },
  priceBreakdown: { ... },
  // ... rest of fields ...
}
```

### 4. Run Build Validation
Execute `pnpm build` to verify no TypeScript errors after all changes.

### 5. Visual Verification with Playwright MCP
Use Playwright MCP to:
1. Navigate to order W1156251121946800 in Omnia-UI
2. Verify line items display correctly
3. Confirm fulfillment information shows for all items
4. Take screenshot for validation

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Verify TypeScript compilation succeeds with no errors
- `grep -n "giftWithPurchase" src/lib/mock-data.ts | grep -c "false"` - Should return 17 (all MAO order items)
- `grep -n "shippingMethod.*3H" src/lib/mock-data.ts | wc -l` - Should return 17 (all MAO order items)

## Notes

### Issue 2 Clarification Needed
The prompt states Smarter Dental Floss "should have a promotion" but previous MAO verification (chore-a6e728d3, completed 2026-01-16) confirmed this item correctly has NO promotions. The verification showed:
- LINE-W115625-003 has `promotions: []` at line 4984
- This matches the MAO system data

If the user has updated MAO data showing a promotion for this item, they should provide:
1. promotionId (e.g., '9400006629' or similar)
2. promotionType (e.g., 'TOPS SALE', 'BOGO', 'Red Hot')
3. discountAmount (the discount value)

### Fulfillment Fields Consistency
The first 5 line items (001-0/1/2, 002-0/1) have complete fulfillment fields. The remaining 12 items need these fields added for consistency. All items in this order were delivered via 3H Delivery from Tops Westgate1 using route 'สายรถบางม่วง' with ETA 12:00-13:00 on Nov 21, 2025.

### No giftWithPurchaseItem for false values
When `giftWithPurchase: false`, the line item should NOT have a `giftWithPurchaseItem` field. This field should only exist when `giftWithPurchase: true` and would contain the gift item details.
