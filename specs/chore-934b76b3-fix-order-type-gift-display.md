# Chore: Fix Order Type and Gift with Purchase Display Issues

## Metadata
adw_id: `934b76b3`
prompt: `Fix two display issues in Order Management: ISSUE 1 - Order Type Column Bug where CDS260120221340 shows 'Return Order' instead of 'RT-CC-STD'. ISSUE 2 - Gift with Purchase shows 'Gift with CDS24737203' instead of just 'CDS24737203'`

## Chore Description
This chore fixes two display bugs in the Order Management system:

1. **Order Type Column Bug**: Manhattan OMNI orders (prefixed with 'CDS') have their `orderType` field overwritten by demo data generation logic in `order-management-hub.tsx`. Order CDS260120221340 has `orderType='RT-CC-STD'` in the mock data but displays as 'Return Order' in the table because lines 473-478 unconditionally overwrite the orderType for all orders.

2. **Gift with Purchase Item Display**: In `manhattan-omni-mock-data.ts` line 566-568, the `giftWithPurchase` field is set to `Gift with ${item.giftWithPurchaseItem || 'purchase'}` which creates a double prefix when displayed. The UI shows "Gift with purchase item: Gift with CDS24737203" instead of the expected "Gift with purchase item: CDS24737203".

## Relevant Files
Use these files to complete the chore:

- **`src/components/order-management-hub.tsx`** (lines 461-478): Contains the demo data generation logic that overwrites orderType for all orders. The `isMaoOrder` check exists but doesn't protect the orderType assignment.

- **`src/lib/manhattan-omni-mock-data.ts`** (lines 566-568): Contains the `createOrderItem` function where `giftWithPurchase` field is set with the redundant "Gift with" prefix.

- **`src/components/order-detail-view.tsx`** (lines 1159-1168): Contains the display logic for gift with purchase items. The UI displays both "Gift with Purchase: Yes/No" and "Gift with purchase item: {value}" - the latter incorrectly shows the "Gift with" prefix from the data.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Fix Order Type overwrite for Manhattan OMNI orders
- Open `src/components/order-management-hub.tsx`
- Locate lines 473-478 where `orderType` and `deliveryTypeCode` are assigned
- Wrap the orderType/deliveryTypeCode assignment in `if (!isMaoOrder)` block
- This ensures CDS-prefixed orders preserve their original orderType from Manhattan mock data

**Before (lines 473-478):**
```typescript
// Generate random orderType using the UNIFIED 7 values (chore-ae72224b)
const fmsOrderTypes: FMSOrderType[] = ['Return Order', 'MKP-HD-STD', 'RT-HD-EXP', 'RT-CC-STD', 'RT-MIX-STD', 'RT-HD-STD', 'RT-CC-EXP']
// Return orders should be ~10% of total
demoOrder.orderType = index % 10 === 0 ? 'Return Order' : fmsOrderTypes[(index % 6) + 1]
// DEPRECATED: deliveryTypeCode - set to same as orderType for backward compatibility
demoOrder.deliveryTypeCode = demoOrder.orderType
```

**After:**
```typescript
// Generate random orderType using the UNIFIED 7 values (chore-ae72224b)
// EXCLUDE MAO orders (they have their own orderType from Manhattan OMS)
if (!isMaoOrder) {
  const fmsOrderTypes: FMSOrderType[] = ['Return Order', 'MKP-HD-STD', 'RT-HD-EXP', 'RT-CC-STD', 'RT-MIX-STD', 'RT-HD-STD', 'RT-CC-EXP']
  // Return orders should be ~10% of total
  demoOrder.orderType = index % 10 === 0 ? 'Return Order' : fmsOrderTypes[(index % 6) + 1]
  // DEPRECATED: deliveryTypeCode - set to same as orderType for backward compatibility
  demoOrder.deliveryTypeCode = demoOrder.orderType
}
```

### 2. Fix Gift with Purchase data value
- Open `src/lib/manhattan-omni-mock-data.ts`
- Locate line 566-568 in the `createOrderItem` function
- Change the giftWithPurchase field to store just the parent SKU (or 'Yes') instead of "Gift with {SKU}"

**Before (lines 566-568):**
```typescript
giftWithPurchase: item.giftWithPurchase
  ? `Gift with ${item.giftWithPurchaseItem || 'purchase'}`
  : null,
```

**After:**
```typescript
giftWithPurchase: item.giftWithPurchase
  ? (item.giftWithPurchaseItem || 'Yes')
  : null,
```

### 3. Validate the fixes
- Start the development server with `pnpm dev`
- Navigate to Order Management page
- Search for order `CDS260120221340`
- Verify Order Type column shows `RT-CC-STD` (not `Return Order`)
- Click on the order to open details panel
- Navigate to Items tab
- Expand the first gift item (CDS10174760)
- Verify "Gift with purchase item" shows `CDS24737203` (not `Gift with CDS24737203`)

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure no TypeScript or build errors
- `pnpm lint` - Ensure no linting errors
- Manual UI validation: Search `CDS260120221340`, verify Order Type = `RT-CC-STD`, expand gift item, verify gift with purchase item = `CDS24737203`

## Notes
- The `isMaoOrder` check already exists at line 462-463 but was only used for financial fields and channel - this fix extends its use to protect orderType as well
- The fix maintains backward compatibility - non-MAO orders continue to get randomly generated orderTypes
- Gift with purchase display now correctly separates the boolean indicator ("Gift with Purchase: Yes/No") from the parent item reference ("Gift with purchase item: {SKU}")
