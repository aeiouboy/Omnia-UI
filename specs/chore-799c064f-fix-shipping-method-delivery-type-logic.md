# Chore: Fix Shipping Method Logic in Mock Data to Match Order Delivery Type

## Metadata
adw_id: `799c064f`
prompt: `Fix Shipping Method logic in mock data to match order delivery type.

  **BUG**: Home Delivery orders are showing 'Standard Pickup' shipping method, which should only appear for Click & Collect orders.

  **REQUIREMENT**:
  - Click & Collect orders: Shipping Method = 'Standard Pickup' or '1H Delivery' only
  - Home Delivery orders: Shipping Method = 'Standard Delivery', '3H Delivery', 'Next Day', 'Express' only

  **FIX** (src/lib/mock-data.ts generateOrderItems function):
  Update the shippingMethod generation logic to check if the order is Click & Collect or Home Delivery:
  - If order has deliveryMethod containing 'PICKUP' or 'Click' → use ['Standard Pickup', '1H Delivery']
  - Otherwise (Home Delivery) → use ['Standard Delivery', '3H Delivery', 'Next Day', 'Express']

  Pass the order's delivery type to generateOrderItems function and use it to determine appropriate shipping method values.`

## Chore Description
The mock data generation currently assigns shipping methods randomly without considering the order's delivery type. This causes incorrect data where Home Delivery orders can show "Standard Pickup" shipping method, which should only appear for Click & Collect orders.

**Current Issue:**
- Lines 255-259 in `src/lib/mock-data.ts`: Shipping method is randomly selected as Click & Collect (50%) or Home Delivery (50%) without checking the actual order delivery method
- This creates data inconsistency where the item-level `shippingMethod` field doesn't match the order-level `deliveryMethods` array

**Expected Behavior:**
- Items in Click & Collect orders should only have shipping methods: 'Standard Pickup' or '1H Delivery'
- Items in Home Delivery orders should only have shipping methods: 'Standard Delivery', '3H Delivery', 'Next Day', 'Express'
- Items in Mixed Delivery orders should have shipping methods matching their assigned delivery method type

## Relevant Files
Use these files to complete the chore:

- **`src/lib/mock-data.ts`** (lines 176-429) - Main file to modify
  - Line 177-343: `generateMockApiOrder()` function generates orders with deliveryMethods
  - Line 227-343: Order items generation happens BEFORE deliveryMethods are created
  - Line 377-381: deliveryMethods are generated AFTER orderItems
  - **Problem**: Items are created before knowing the delivery method

- **`src/types/delivery.ts`** - Type definitions for delivery methods
  - Defines `DeliveryMethodType`, `DeliveryMethod` interface
  - Used to understand data structures

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Refactor Order Generation Sequence
- Move `deliveryMethods` generation BEFORE `orderItems` generation in `generateMockApiOrder()` function
- This allows items to be generated with knowledge of the order's delivery type
- Update lines 227-381 to reorder the generation sequence

### 2. Update Item Generation Logic to Accept Delivery Methods
- Modify the order items generation loop (lines 239-343) to determine shipping method based on deliveryMethods
- For each item, check the order's `deliveryMethods` array to determine appropriate shipping method options
- Logic:
  - If deliveryMethods contains only 'CLICK_COLLECT' → use `clickCollectShippingOptions`
  - If deliveryMethods contains only 'HOME_DELIVERY' → use `homeDeliveryShippingOptions`
  - If deliveryMethods contains both (mixed) → randomly assign based on which delivery method the item belongs to

### 3. Handle Mixed Delivery Scenarios
- For mixed delivery orders (both HOME_DELIVERY and CLICK_COLLECT):
  - Distribute items between delivery methods based on `itemCount` in each delivery method
  - First N items use homeDeliveryShippingOptions (where N = homeDelivery.itemCount)
  - Remaining items use clickCollectShippingOptions
- Ensure the item index (j) is used to determine which delivery method applies

### 4. Remove Random Shipping Method Logic
- Delete lines 255-259 that randomly select shipping methods
- Replace with deterministic logic based on order's deliveryMethods
- Remove the `isClickCollectShipping` random boolean (line 256)

### 5. Validate Mixed Delivery Test Order (ORD-0100)
- Verify the forced mixed delivery order (lines 431-469) correctly distributes shipping methods
- Ensure ORD-0100's first 2 items have home delivery shipping methods
- Ensure remaining items have click & collect shipping methods

## Validation Commands
Execute these commands to validate the chore is complete:

- `npm run dev` - Start development server and verify no TypeScript errors
- Navigate to Order Management Hub and inspect order details
- **Validation Test 1**: Filter for Click & Collect orders and verify all items show only 'Standard Pickup' or '1H Delivery'
- **Validation Test 2**: Filter for Home Delivery orders and verify all items show only 'Standard Delivery', '3H Delivery', 'Next Day', or 'Express'
- **Validation Test 3**: Open order ORD-0100 (mixed delivery) and verify:
  - First 2 items have home delivery shipping methods
  - Remaining items have click & collect shipping methods
- Check browser console for any errors related to delivery methods
- `npm run build` - Verify production build succeeds without errors

## Notes
- The key architectural change is moving `deliveryMethods` generation BEFORE item generation
- This ensures items are created with full knowledge of the order's delivery configuration
- The fix maintains backward compatibility with existing mock data structure
- Special attention needed for mixed delivery orders to correctly distribute shipping methods across items
