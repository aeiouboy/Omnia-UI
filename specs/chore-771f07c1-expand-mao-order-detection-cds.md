# Chore: Expand MAO Order Detection to Include CDS Orders

## Metadata
adw_id: `771f07c1`
prompt: `Expand MAO order detection in order-management-hub.tsx to include CDS orders. At line 421, change the isMaoOrder check from 'apiOrder.id?.startsWith('W') || apiOrder.order_no?.startsWith('W')' to also include 'apiOrder.id?.startsWith('CDS') || apiOrder.order_no?.startsWith('CDS')'. This prevents demo data modifications from overwriting channel and other fields for Central Department Store mock orders (CDS260121226285, CDS251229874674).`

## Chore Description
The order management hub currently only recognizes MAO (Manhattan Active Omni) orders that start with 'W' prefix. However, there are also Central Department Store orders with 'CDS' prefix (e.g., CDS251229874674, CDS260121226285) that are authentic MAO orders from the Manhattan Active Omni system.

Currently, the `isMaoOrder` check at line 421 in `order-management-hub.tsx` only identifies orders starting with 'W'. This causes demo data modifications to overwrite important fields (channel, payment data, gift with purchase) for CDS orders, even though these orders have their own complete and accurate data from the Manhattan OMS specification.

The fix is to expand the MAO order detection to include both 'W' and 'CDS' prefixes, ensuring all authentic MAO orders are excluded from demo data modifications.

## Relevant Files

### Existing Files to Modify
- **src/components/order-management-hub.tsx** (line 421) - Contains the `isMaoOrder` check that needs to be expanded to include CDS prefix detection. This check is used in three places:
  - Line 424: Skip financial field modifications (customerRedeemAmount, orderDeliveryFee, customerPayAmount)
  - Line 436: Skip channel field modifications (web/lazada/shopee)
  - Line 442: Skip gift with purchase modifications for items

### Reference Files
- **src/lib/mock-data.ts** (lines 9322-9700, 9732-10800) - Contains the CDS MAO orders (CDS251229874674, CDS260121226285) that should be protected from demo data modifications

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Backup Current Implementation
- Read the current `order-management-hub.tsx` file around line 421
- Document the current logic for MAO order detection
- Identify all places where `isMaoOrder` variable is used

### 2. Update MAO Order Detection Logic
- Locate line 421 in `src/components/order-management-hub.tsx`
- Change the condition from:
  ```typescript
  const isMaoOrder = apiOrder.id?.startsWith('W') || apiOrder.order_no?.startsWith('W')
  ```
  to:
  ```typescript
  const isMaoOrder = apiOrder.id?.startsWith('W') || apiOrder.order_no?.startsWith('W') ||
                     apiOrder.id?.startsWith('CDS') || apiOrder.order_no?.startsWith('CDS')
  ```
- Update the comment above line 421 to reflect that both 'W' and 'CDS' prefixes are recognized as MAO orders

### 3. Validate the Fix
- Run the development server to ensure no TypeScript errors
- Check that the code compiles successfully
- Verify that the logic now protects CDS orders from demo data modifications in:
  - Financial fields (line 424)
  - Channel field (line 436)
  - Gift with purchase field (line 442)

### 4. Test with Mock Data
- Verify that CDS orders (CDS251229874674, CDS260121226285) retain their original data
- Confirm that channel field is not overwritten for CDS orders
- Confirm that payment details are preserved for CDS orders
- Ensure W-prefixed orders continue to work as before

## Validation Commands
Execute these commands to validate the chore is complete:

- `npm run build` - Test to ensure the TypeScript code compiles without errors
- `grep -n "isMaoOrder" src/components/order-management-hub.tsx` - Verify the change is present at line 421
- `npm run dev` - Start development server and verify no runtime errors (Ctrl+C after confirming it starts)

## Notes
- This is a minimal, surgical change affecting only one line of code (plus comment update)
- The change protects authentic MAO orders with CDS prefix from having their real data overwritten by demo/mock data generation logic
- This ensures data integrity for Central Department Store orders imported from Manhattan Active Omni
- No other logic changes are required since the `isMaoOrder` variable is already used correctly in all three conditional blocks
