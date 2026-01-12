# Chore: Simplify Click & Collect Section Fields

## Metadata
adw_id: `6b3a083e`
prompt: `Simplify Click & Collect section in Order Detail Overview tab (src/components/order-detail-view.tsx) to show only 5 essential fields.

  KEEP ONLY THESE FIELDS (in order):
  1. Recipient Name - Customer name for pickup
  2. Phone - Customer phone number
  3. Rel No. - Release order number
  4. Store Pickup - Store name (renamed from Store Name)
  5. Store Contact - Store phone number

  REMOVE THESE FIELDS FROM DISPLAY:
  - Store Address
  - Time Slot
  - Collection Code
  - Pickup Date
  - Allocation Type

  Update ClickCollectSection component to display only the 5 fields in a single column layout matching the simplified design.`

## Chore Description
Simplify the Click & Collect section in the Order Detail Overview tab by reducing the number of displayed fields from 10 to 5 essential fields. The component currently shows store, customer, and pickup information in a 2-column grid layout. This chore will streamline the display to show only the most critical information in a single-column layout, improving readability and focusing on customer-centric data.

The component will retain the header (with Store icon, "Click & Collect" title, PICKUP badge, and item count) but simplify the details grid to show only:
1. Recipient Name
2. Phone
3. Rel No.
4. Store Pickup (renamed from Store Name)
5. Store Contact (Store Phone)

## Relevant Files
Use these files to complete the chore:

- **src/components/order-detail-view.tsx** (Lines 107-184) - Contains the `ClickCollectSection` component that needs to be simplified. This is the main file to modify.
  - Currently displays 10 fields in a 2-column grid (`md:grid-cols-2`)
  - Needs to be updated to display only 5 fields in a single-column layout
  - The header section (lines 118-126) should remain unchanged

- **src/types/delivery.ts** (Lines 24-38) - Defines the `ClickCollectDetails` interface
  - No changes needed to the TypeScript interface
  - The interface will continue to support all fields (including those hidden from display)
  - This allows for future feature expansion without breaking changes

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Read and Understand Current Implementation
- Read the `ClickCollectSection` component (lines 107-184 in order-detail-view.tsx)
- Identify all 10 current fields and their styling
- Note the current 2-column grid layout structure

### 2. Update ClickCollectSection Component Layout
- Change the grid from `grid-cols-1 md:grid-cols-2 gap-4` to `grid-cols-1 gap-4` for single-column layout
- Remove all responsive column variations (md:col-span-2, etc.)
- Keep the header section unchanged (lines 118-126)

### 3. Remove Unnecessary Fields from Display
- Remove the following field definitions from the component:
  - Store Address display (currently line ~147-150)
  - Time Slot display (currently line ~157-160)
  - Collection Code display (currently line ~166-170)
  - Pickup Date display (currently line ~172-175)
  - Allocation Type display (currently line ~177-180)

### 4. Reorder and Rename Remaining Fields
- Reorder the 5 remaining fields in the specified order:
  1. **Recipient Name** - Keep as is (`details.recipientName`)
  2. **Phone** - Keep as is (`details.phone`)
  3. **Rel No.** - Keep as is (`details.relNo`)
  4. **Store Pickup** - Rename label from "Store Pickup" (currently uses `details.storeName`)
  5. **Store Contact** - Keep as is (`details.storePhone`)
- Ensure all fields use consistent styling from the original implementation

### 5. Verify Single Column Layout
- Confirm the grid uses `grid-cols-1 gap-4` with no responsive variations
- Ensure all 5 fields are displayed in a single column
- Verify spacing and alignment matches the simplified design

### 6. Test Component Rendering
- Start the development server to verify changes
- Navigate to an order with Click & Collect delivery method
- Confirm only 5 fields are displayed in single-column layout
- Verify the header section remains unchanged with icon, title, badge, and item count

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm dev` - Start development server and manually verify the Click & Collect section displays only 5 fields in single-column layout
- `grep -n "Store Address\|Time Slot\|Collection Code\|Pickup Date\|Allocation Type" src/components/order-detail-view.tsx` - Should return no matches in the ClickCollectSection component (lines 107-184)
- `grep -n "grid-cols-1 md:grid-cols-2" src/components/order-detail-view.tsx` - Should return no matches in the ClickCollectSection component, confirming single-column layout
- `grep -n "Store Pickup" src/components/order-detail-view.tsx` - Should confirm the "Store Pickup" label exists in the component

## Notes
- The TypeScript interface (`ClickCollectDetails`) in `src/types/delivery.ts` should NOT be modified. The interface supports all fields to allow future feature expansion.
- The HomeDeliverySection component should remain completely unchanged.
- The header section of ClickCollectSection (icon, title, badge, item count) must be preserved.
- This change is purely cosmetic/UX focused - no business logic changes required.
- The removed fields are still available in the data model if needed in the future.
