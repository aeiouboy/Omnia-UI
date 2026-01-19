# Chore: Fix Order Module Data Alignment Issues

## Metadata
adw_id: `73a00128`
prompt: `Fix order module data alignment issues between list and detail views:

  **Issue 1: Invalid Delivery Time Slot times in mock data**
  - Location: src/components/order-management-hub.tsx (mock data generation section around lines 294-350)
  - Problem: Mock data generates invalid time slots like '23:00-25:00' where 25:00 doesn't exist
  - Fix: Update deliveryTimeSlot.to time generation to use valid hours (00-23)
  - Valid time slots should be: 09:00-11:00, 11:00-13:00, 13:00-15:00, 15:00-17:00, 17:00-19:00, 19:00-21:00, 21:00-23:00
  - Do NOT generate times that exceed 23:59

  **Issue 2: Allow Substitution value mismatch between list and detail**
  - Location: src/components/order-management-hub.tsx and src/components/order-detail-view.tsx
  - Problem: Order list 'Allow Substitution' column shows different value than Order Detail 'Allow Substitution' field
  - ORD-0001 example: List shows 'No', Detail shows 'Yes'
  - Fix: Ensure both views read from the same data source field (order.allowSubstitution or order.allow_substitution)
  - Check mapOrderToTableRow function and ensure it maps the correct field
  - The allowSubstitution field in mock data should be used consistently

  **Issue 3: Order Type field naming clarification** (OPTIONAL - only if confusing)
  - Table column 'Order Type' displays FMS order types: Large format, Tops daily CFR, Tops daily CFM, Subscription, Retail
  - Detail view 'Order Type' displays fulfillment type: DELIVERY, PICKUP, etc.
  - These are different fields but same column name
  - Consider: Rename detail view field to 'Fulfillment Type' OR ensure they display the same value
  - Note: This may be intentional design - investigate before changing

  Priority: Fix Issue 1 and Issue 2 first. Issue 3 may be by design.`

## Chore Description
This chore fixes three data alignment and validation issues in the order management module:

1. **Invalid Delivery Time Slots**: The mock data generation creates time slots that exceed 23:59 (e.g., '23:00-25:00'), which is invalid. This needs to be fixed to generate only valid time slots within the 00:00-23:00 range.

2. **Allow Substitution Field Mismatch**: The order list and order detail views show different values for the same order's "Allow Substitution" field because they're reading from different source fields in the order object. The list view correctly maps `order.allow_substitution`, but the detail view reads `order.allowSubstitution`, causing inconsistencies.

3. **Order Type Field Naming Confusion** (Investigation required): The "Order Type" field appears to show different values in the list (FMS order types like "Large format", "Tops daily CFR") versus the detail view (fulfillment types like "DELIVERY", "PICKUP"). This may be intentional or may need clarification.

## Relevant Files
Use these files to complete the chore:

- **src/components/order-management-hub.tsx** (lines 294-350, 1092-1122, 1790)
  - Contains the mock data generation logic for deliveryTimeSlot (Issue 1)
  - Contains the mapOrderToTableRow function that maps order.allow_substitution to allowSubstitution (Issue 2)
  - Contains the table rendering logic that displays allowSubstitution value

- **src/components/order-detail-view.tsx** (line 473)
  - Displays the Allow Substitution field in the detail view
  - Currently reads from order.allowSubstitution which may differ from the mapped value

- **src/lib/mock-data.ts**
  - May contain mock data generation utilities
  - Check if this file has allowSubstitution field generation logic

### New Files
No new files need to be created.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Fix Invalid Delivery Time Slot Generation (Issue 1)
- Locate the deliveryTimeSlot mock data generation in `src/components/order-management-hub.tsx` around lines 343-351
- Identify the code that generates `deliveryTimeSlot.to` value
- Current problematic logic: `to: '${String(slotHour + 2).padStart(2, '0')}:00'` where slotHour can be 23, resulting in 25:00
- Fix the logic to ensure hours stay within 00-23 range:
  - Use modulo operator: `to: '${String((slotHour + 2) % 24).padStart(2, '0')}:00'`
  - OR limit slotHour range to 9-21 to prevent overflow: `const slotHour = 9 + (index % 7) * 2` (creates slots: 09-11, 11-13, 13-15, 15-17, 17-19, 19-21, 21-23)
- Verify the valid time slots match the requirement: 09:00-11:00, 11:00-13:00, 13:00-15:00, 15:00-17:00, 17:00-19:00, 19:00-21:00, 21:00-23:00

### 2. Fix Allow Substitution Field Mapping (Issue 2)
- Review the mapOrderToTableRow function in `src/components/order-management-hub.tsx` around line 1109
- Confirm it correctly maps: `allowSubstitution: order.allow_substitution ?? false`
- Review the table rendering in `src/components/order-management-hub.tsx` around line 1790
- Confirm it displays: `order.allowSubstitution ? "Yes" : "No"` (using the mapped field)
- Open `src/components/order-detail-view.tsx` line 473
- Identify the current code: `order?.allowSubstitution ? 'Yes' : 'No'`
- **Root Cause Analysis**: The detail view is reading from the ORIGINAL order object's `allowSubstitution` field, but the API returns `allow_substitution` (snake_case)
- **Fix Strategy**: The detail view should read from the same snake_case field as the mapping function
- Change line 473 from `order?.allowSubstitution` to `order?.allow_substitution`
- This ensures both views read from the same source field

### 3. Investigate Order Type Field Naming (Issue 3 - Investigation Only)
- Review the table column "Order Type" display logic in `src/components/order-management-hub.tsx`
- Check what field is displayed: likely `order.orderType` from mapOrderToTableRow line 1113
- Review the detail view "Order Type" field in `src/components/order-detail-view.tsx` around line 456-458
- Check what field is displayed: `order?.order_type` (line 457)
- **Findings to document**:
  - Table shows: `orderType` (FMS types: Large format, Tops daily CFR, etc.)
  - Detail shows: `order_type` (Fulfillment types: DELIVERY, PICKUP, etc.)
  - These are TWO DIFFERENT fields with similar names
- **Recommendation**: Rename detail view label from "Order Type" to "Fulfillment Type" to avoid confusion
- **Implementation Decision**: Document findings in validation notes, but do NOT implement changes without user confirmation (marked as OPTIONAL)

### 4. Validate All Fixes
- Start the development server: `pnpm dev`
- Navigate to the Order Management Hub
- Test Issue 1 Fix:
  - Check multiple orders in the table
  - Verify all "Delivery Time Slot" values show valid hours (no 24:00 or 25:00)
  - Verify time slots match the expected pattern: 09:00-11:00, 11:00-13:00, etc.
- Test Issue 2 Fix:
  - Find order ORD-0001 or any order in the list
  - Note the "Allow Substitution" value in the table (should show "Yes" or "No")
  - Click to open the order detail view
  - Verify the "Allow Substitution" field in the detail view matches the table value
  - Test with multiple orders to ensure consistency
- Document Issue 3 findings in validation notes

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm dev` - Start development server and verify no console errors
- Manual Testing:
  - Open http://localhost:3000
  - Navigate to Order Management Hub
  - Verify delivery time slots are all valid (no times > 23:59)
  - Select any order and verify "Allow Substitution" matches between list and detail views
  - Test with orders ORD-0001 through ORD-0010 to ensure consistency
- `grep "25:00" src/components/order-management-hub.tsx` - Should return no matches (confirms no invalid times)
- `grep "allowSubstitution" src/components/order-detail-view.tsx` - Verify it uses `allow_substitution` (snake_case)

## Notes

### Issue 1 - Delivery Time Slot Fix
The recommended fix is to limit slotHour range to 9-21 (7 two-hour slots) instead of using modulo, as this creates more predictable and realistic time slots that match the business requirement exactly.

### Issue 2 - Allow Substitution Fix
The root cause is the API returns `allow_substitution` (snake_case), but the detail view was incorrectly reading `allowSubstitution` (camelCase) from the original order object. The mapping function correctly handles this conversion, but the detail view was bypassing the mapping by reading directly from the original order object.

### Issue 3 - Order Type Naming
This appears to be intentional design where TWO different fields use similar labels:
- `orderType` (FMS type): Business order categorization (Large format, Subscription, etc.)
- `order_type` (Fulfillment type): Delivery method (DELIVERY, PICKUP, etc.)

Consider renaming the detail view field label to "Fulfillment Type" for clarity, but this requires user confirmation as it's marked OPTIONAL in the requirements.

### Testing Priority
Focus validation on Issues 1 and 2 as these are the primary fixes. Issue 3 is informational/investigative only.
