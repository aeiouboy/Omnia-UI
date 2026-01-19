# Chore: Fix Demo Order Modification for MAO Orders

## Metadata
adw_id: `41433b8c`
prompt: `Fix demo order modification in order-management-hub.tsx that incorrectly adds 'giftWithPurchase: Free Travel Kit' to every 4th item including MAO orders. The demo modification at lines 423-435 should NOT apply to real MAO orders like W1156251121946800. Either: 1) Remove the demo order modification entirely since it creates incorrect data, OR 2) Add a condition to exclude orders that start with 'W' (MAO order pattern) from the demo modification.`

## Chore Description
The `mapApiResponseToOrders` function in `order-management-hub.tsx` contains a development-only code block (lines 330-438) that adds demo modifications to orders. One of these modifications (lines 423-435) adds `giftWithPurchase: "Free Travel Kit"` to every 4th item in an order's items array.

The problem is that this demo modification applies to ALL orders during development, including real MAO (Manhattan Active Omni) orders like `W1156251121946800`. MAO orders have actual data extracted from the MAO system and should NOT be modified by demo code.

The fix will add a condition to exclude MAO orders (identified by the 'W' prefix in their order ID) from the gift with purchase demo modification, preserving the authentic data from MAO orders while still allowing demo data augmentation for non-MAO orders.

## Relevant Files
Use these files to complete the chore:

- **src/components/order-management-hub.tsx** (lines 423-435): Contains the demo modification code that adds `giftWithPurchase: "Free Travel Kit"` to every 4th item. This is the file to modify.
- **src/lib/mock-data.ts**: Contains the MAO order `W1156251121946800` with authentic `giftWithPurchase: false` values. Used as reference to verify the fix preserves authentic data.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Add MAO Order Detection Condition
- Open `src/components/order-management-hub.tsx`
- Navigate to lines 423-435 where the gift with purchase demo modification exists
- Wrap the existing gift with purchase modification block in a condition that checks if the order ID does NOT start with 'W'
- The condition should check `apiOrder.id` or `apiOrder.order_no` to detect MAO orders

### 2. Implement the Conditional Logic
- Add the condition: `if (!apiOrder.id?.startsWith('W') && !apiOrder.order_no?.startsWith('W'))`
- This ensures both `id` and `order_no` fields are checked (MAO orders may use either)
- Keep the existing logic unchanged inside the condition - only add the outer condition wrapper

### 3. Verify Build Success
- Run `pnpm build` to ensure no TypeScript errors
- Confirm the build completes successfully

### 4. Visual Validation
- Run `pnpm dev` to start the development server
- Navigate to order search and find order `W1156251121946800`
- Open the Items tab
- Verify that NO items show "Gift with Purchase" section
- All items should have `giftWithPurchase: false` (hidden in UI per previous fix)

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Verify TypeScript compilation passes without errors
- `grep -n "Free Travel Kit" src/components/order-management-hub.tsx` - Confirm the code still exists but is now conditional
- `grep -A5 -B2 "giftWithPurchase.*Free Travel Kit" src/components/order-management-hub.tsx` - Verify the MAO exclusion condition is present

## Notes
- MAO orders are identified by the 'W' prefix in their order ID (e.g., W1156251121946800, W1156260115052036)
- The demo modification block is inside a `process.env.NODE_ENV === 'development'` check at line 332
- Other demo modifications (SLA patterns, delivery codes, selling channels) remain unchanged
- This fix preserves the demo functionality for non-MAO orders while ensuring MAO orders retain their authentic data
- The gift with purchase display was already fixed in a previous chore to only show when the value is truthy - this fix ensures MAO orders don't get incorrect truthy values added
