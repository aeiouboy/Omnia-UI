# Chore: Store No. Field Fallback Fix

## Metadata
adw_id: `17ad20f8`
prompt: `Fix Store No. field in Order Detail View to not fallback to store_name (src/components/order-detail-view.tsx): The Store No. field currently has fallback logic that displays store_name when store_no is empty. For MAO orders, Store No. should display '-' when empty, NOT fallback to store_name. Search for 'Store No' in the Order Information section and change the display logic from 'order?.metadata?.store_no || order?.metadata?.store_name || "-"' to just 'order?.metadata?.store_no || order?.storeNo || "-"' (remove the store_name fallback). The store_name is a different field representing the fulfillment location name, not the store number.`

## Chore Description
The Store No. field in the Order Detail View currently has incorrect fallback logic. When `store_no` is empty, it falls back to displaying `store_name`, which is semantically incorrect. The `store_no` field represents the store number (a numeric/code identifier), while `store_name` represents the fulfillment location name (a descriptive text field). For MAO orders where Store No. is not available, the field should simply display '-' rather than falling back to a different field.

This fix ensures that:
1. Store No. displays only actual store number values (`store_no` or `storeNo`)
2. When no store number is available, it displays '-' instead of incorrectly showing store name
3. The field maintains semantic integrity by not conflating store number with store name

## Relevant Files
Use these files to complete the chore:

- **src/components/order-detail-view.tsx** (line 477) - Contains the Store No. field with incorrect fallback logic in the Order Information card. This is the only file that needs to be modified.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Read Current Implementation
- Read the order-detail-view.tsx file to confirm current state
- Locate the Store No. field in the Order Information section (around line 476-478)
- Verify the current fallback logic: `order?.metadata?.store_no || order?.metadata?.store_name || '-'`

### 2. Update Store No. Field Logic
- Navigate to line 477 in src/components/order-detail-view.tsx
- Change the display logic from:
  ```tsx
  <p className="font-medium">{order?.metadata?.store_no || order?.metadata?.store_name || '-'}</p>
  ```
  to:
  ```tsx
  <p className="font-medium">{order?.metadata?.store_no || order?.storeNo || '-'}</p>
  ```
- This removes the `store_name` fallback and uses only `store_no`, `storeNo`, or '-'

### 3. Validate the Changes
- Build the application to ensure no TypeScript errors
- Verify that the change maintains proper typing
- Test with both orders that have `store_no` and orders that don't (MAO orders)

## Validation Commands
Execute these commands to validate the chore is complete:

```bash
# 1. Verify the code change
grep -n "Store No\." src/components/order-detail-view.tsx -A 1

# 2. Ensure TypeScript compiles without errors
pnpm build

# 3. Check for any remaining references to the old pattern (should return no results)
grep -r "metadata?.store_no || order?.metadata?.store_name" src/
```

## Notes
- This is a simple one-line fix to correct semantic field usage
- The `storeNo` fallback (without metadata prefix) is kept for backward compatibility with alternative order data structures
- This change aligns with the recent fix documented in chore-5e5284ab where Store No. values were removed from MAO orders in mock data
- The `store_name` field should continue to be used in other contexts where the fulfillment location name is needed, just not as a fallback for Store No.
