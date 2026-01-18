# Chore: Fix Gift with Purchase Display Bug in Order Detail View

## Metadata
adw_id: `708b86eb`
prompt: `Fix Gift with Purchase display bug in Order Detail View. Issues: 1) MAO source data shows 'Gift with purchase: False' but Omnia-UI incorrectly displays 'Yes' - investigate the data mapping in order-detail-view.tsx and order-management-hub.tsx to find where the boolean value is being incorrectly interpreted or hardcoded, 2) When Gift with Purchase is 'No' or 'False', the Gift with Purchase item details section should be hidden completely - currently it still shows. Search for 'gift' in src/components/ and src/lib/mock-data.ts to find: (a) how gift_with_purchase field is mapped from API response, (b) where the display logic determines Yes/No text, (c) the conditional rendering logic for the gift items detail section. Fix both issues: correct the boolean-to-text mapping and add conditional rendering to hide gift details when gift_with_purchase is false/No. Test with the order W1156251121946800 from mock data.`

## Chore Description
Fix the Gift with Purchase display in the Order Detail View component. There are two issues to address:

1. **Display Logic Issue**: The `giftWithPurchase` field can be:
   - A boolean (`false`) - should display "No"
   - A string (e.g., `"Free Sample Gift"`) - should display "Yes"
   - `null` or `undefined` - should display "No" (or hide completely)

   The current ternary logic `item.giftWithPurchase ? 'Yes' : 'No'` handles these cases correctly for boolean values. However, the user wants the entire "Gift with Purchase" section to be **hidden completely** when there is no gift, rather than showing "Gift with Purchase: No".

2. **Conditional Rendering Issue**: Currently the code shows:
   - Line 1009-1012: Always displays "Gift with Purchase: Yes/No"
   - Line 1013-1018: Only displays "Gift with purchase item" when truthy

   The fix should hide the **entire Gift with Purchase section** (both the Yes/No indicator and the item details) when `giftWithPurchase` is falsy (false, null, undefined).

3. **Type Definition Update**: The `ApiOrderItem` interface has `giftWithPurchase?: string | null` but the MAO data uses `giftWithPurchase: false` (boolean). The type should be updated to include `boolean`.

## Relevant Files
Use these files to complete the chore:

- **src/components/order-detail-view.tsx** (lines 1009-1018): Contains the Gift with Purchase display logic that needs to be updated to conditionally render only when there is a gift
- **src/components/order-management-hub.tsx** (line 129): Contains the `ApiOrderItem` interface with the `giftWithPurchase` type definition that needs to include `boolean`
- **src/lib/mock-data.ts**: Contains the MAO order W1156251121946800 test data with `giftWithPurchase: false` for verification

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Type Definition
- Open `src/components/order-management-hub.tsx`
- Find line 129: `giftWithPurchase?: string | null`
- Change to: `giftWithPurchase?: string | boolean | null`
- This allows the field to accept boolean `false` as well as string values and null

### 2. Update Gift with Purchase Display Logic
- Open `src/components/order-detail-view.tsx`
- Locate lines 1009-1018 (the Gift with Purchase section)
- Wrap the entire Gift with Purchase section (both the Yes/No display and the item details) in a conditional that only renders when `item.giftWithPurchase` is truthy
- The result should be:
  ```tsx
  {item.giftWithPurchase && (
    <>
      <div className="flex justify-between pt-2">
        <span className="text-gray-500">Gift with Purchase</span>
        <span className="text-gray-900 font-medium">Yes</span>
      </div>
      <div className="flex justify-between pt-2">
        <span className="text-gray-500">Gift with purchase item</span>
        <span className="text-gray-900 font-medium">{item.giftWithPurchase}</span>
      </div>
    </>
  )}
  ```
- Note: Since we only show when truthy, the Yes/No ternary is no longer needed - it will always be "Yes" when shown

### 3. Validate Type Safety
- Run TypeScript compiler to ensure no type errors
- Command: `pnpm build` (or `pnpm tsc --noEmit`)

### 4. Visual Validation with Development Server
- Start the development server: `pnpm dev`
- Navigate to order W1156251121946800 in the Order Search
- Verify that "Gift with Purchase" section is NOT displayed for any line items (all have `giftWithPurchase: false`)
- Optionally test with an order that has `giftWithPurchase` set to a string value to ensure it displays correctly

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure TypeScript compilation succeeds with no errors
- `pnpm dev` - Start development server for visual validation
- Navigate to order W1156251121946800 and verify:
  - No "Gift with Purchase" section appears for any line item
  - The Promotions & Offers section still displays correctly without the gift fields
- For positive test: Check other orders with `giftWithPurchase: "Free Sample Gift"` (e.g., in demo/sample orders) to ensure they still display the gift section correctly

## Notes
- The `giftWithPurchase` field has mixed types in the codebase:
  - MAO order data: uses `boolean` (`false`)
  - Generated mock data: uses `string | null` (`'Free Sample Gift'` or `null`)
  - Demo orders: uses `string` (`'Free Sample Perfume'`, `'Silk Care Kit'`, etc.)
- The type definition update ensures TypeScript accepts all valid values
- The conditional rendering simplifies the UI by only showing gift information when it's relevant
- This change affects the "Promotions & Offers" column (Column 2) of the expanded line item details in the Order Detail View
