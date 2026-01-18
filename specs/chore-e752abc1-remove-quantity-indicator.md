# Chore: Remove Quantity Indicator from Order Detail Items

## Metadata
adw_id: `e752abc1`
prompt: `Remove the '1 of N' quantity indicator from the order detail view Items tab while keeping the split line functionality and 'Split line X' numbering.`

## Chore Description
Remove the "1 of N" quantity indicator (e.g., "1 of 3", "1 of 5") from split order lines in the order detail view Items tab. The quantity display should simply show "Qty: 1" for all items, regardless of whether they are split lines. Keep the "(Split line X)" numbering intact as it provides valuable context about which split line an item represents. The order line splitting logic in `src/lib/order-utils.ts` must remain unchanged.

## Relevant Files

### Files to Modify

**src/components/order-detail-view.tsx** (Lines 730-743)
- Contains the quantity display logic in the Items tab
- Line 736: Current implementation shows "1 of N" for split lines using ternary operator
- Lines 738-742: "(Split line X)" display must be preserved

### Files to Keep Unchanged

**src/lib/order-utils.ts**
- Contains `splitOrderLines` function and related utilities
- The splitting logic must remain intact - orders should still be split into individual lines with quantity = 1
- Functions: `splitOrderLineItem`, `splitOrderLines`, `groupSplitLinesByParent`, `getOriginalQuantity`, `isSplitLine`, `hasSplitChildren`

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Read the Current Implementation
- Locate the quantity display section in `src/components/order-detail-view.tsx` around lines 730-743
- Understand the current ternary logic: `{item.parentLineId ? '${item.quantity} of ${count}' : item.quantity}`
- Identify the exact line that needs modification (line 736)

### 2. Simplify the Quantity Display
- Replace line 736 with a simple quantity display: `item.quantity`
- Remove the ternary operator that conditionally shows "1 of N" for split lines
- Ensure the quantity still displays correctly for both split and non-split items

### 3. Verify Split Line Numbering is Preserved
- Confirm lines 738-742 remain unchanged: the "(Split line X)" text should still display
- The conditional `{item.parentLineId && (...)}` block must remain intact
- Verify `item.splitIndex! + 1` still correctly numbers split lines starting from 1

### 4. Build and Test
- Run `pnpm build` to verify no TypeScript errors
- Run `pnpm dev` to start development server
- Navigate to an order detail page with split items (quantity > 1)
- Verify the Items tab shows "Qty: 1" for all items
- Verify "(Split line X)" numbering still appears below the quantity for split lines

## Validation
- ✅ `pnpm build` - TypeScript compilation succeeded without errors
- ⏳ `pnpm lint` - ESLint verification
- ⏳ Manual testing: Open order detail view for an order with items having quantity > 1

## Implementation Complete

### Changes Made
Modified `src/components/order-detail-view.tsx` line 736:

**Before:**
```tsx
{item.parentLineId ? `${item.quantity} of ${filteredItems.filter(i => i.parentLineId === item.parentLineId || i.id === item.parentLineId).length}` : item.quantity}
```

**After:**
```tsx
{item.quantity}
```

The quantity display now simply shows the item quantity (which is always 1 for split lines due to the splitting logic in `order-utils.ts`). The "(Split line X)" numbering on lines 738-742 remains intact, providing clear context about which split line an item represents.

## Notes
- The order line splitting logic in `order-utils.ts` creates split items with `quantity: 1`, so the display will correctly show "1" for all split lines
- The `parentLineId` and `splitIndex` properties are set by the splitting utility and remain available for the "(Split line X)" display
- This change simplifies the UI by removing redundant "1 of N" information while preserving the more useful split line numbering
- The `splitOrderLines` function in `order-utils.ts` logs splitting statistics to console; this logging will continue to work as before
