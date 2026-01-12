# Chore: Add 3 New Fields to Items Tab Expanded Details

## Metadata
adw_id: `c517b450`
prompt: `Add 3 new fields to Items tab expanded details section.

  **NEW FIELDS TO ADD** (src/components/order-detail-view.tsx Items tab ~line 580-720):

  1. **Supply Type ID** in Product Details section:
     - Values: 'On Hand Available' or 'Pre-Order'
     - Show for all items

  2. **Shipping Method** in Fulfillment & Shipping section (update existing field values):
     - For Click & Collect orders: 'Standard Pickup' or '1H Delivery'
     - For Home Delivery orders: 'Standard Delivery', '3H Delivery', 'Next Day', 'Express'

  3. **Gift Wrapped Message** in Product Details section:
     - Text field showing gift message (e.g., 'Happy Birthday!', 'Congratulations!')
     - Only show this field when Gift Wrapped is 'Yes'

  **MOCK DATA UPDATES** (src/lib/mock-data.ts generateOrderItems function):

  Add to item generation:
  - supplyTypeId: randomly select 'On Hand Available' (80%) or 'Pre-Order' (20%)
  - Update shippingMethod logic:
    - If order is Click & Collect: randomly 'Standard Pickup' or '1H Delivery'
    - If order is Home Delivery: randomly 'Standard Delivery', '3H Delivery', 'Next Day', 'Express'
  - giftWrappedMessage: when giftWrapped is true, generate messages like 'Happy Birthday!', 'Congratulations!', 'Best Wishes!', 'With Love', 'Thank You!'

  **UI IMPLEMENTATION**:
  - Add Supply Type ID field after UOM in Product Details column
  - Update Shipping Method to show correct values based on delivery type
  - Add Gift Wrapped Message field right after Gift Wrapped field, only render when giftWrapped is true
  - Use same styling as existing fields (label in muted color, value in normal text)`

## Chore Description
Add three new fields to the Items tab expanded details section in the Order Detail View:

1. **Supply Type ID**: A field indicating whether an item is available immediately ("On Hand Available") or needs to be ordered ("Pre-Order"). This field should appear in the Product Details column after UOM and be shown for all items.

2. **Shipping Method** (enhanced): Update the existing shipping method field to display context-appropriate values:
   - For Click & Collect orders: "Standard Pickup" or "1H Delivery"
   - For Home Delivery orders: "Standard Delivery", "3H Delivery", "Next Day", or "Express"

3. **Gift Wrapped Message**: A conditional field that only appears when an item is gift wrapped (giftWrapped = true). Shows personalized messages like "Happy Birthday!", "Congratulations!", etc.

## Relevant Files
Use these files to complete the chore:

- **src/components/order-management-hub.tsx** (lines 80-121) - Contains the `ApiOrderItem` interface definition that needs to be extended with `supplyTypeId` and `giftWrappedMessage` fields
- **src/components/order-detail-view.tsx** (lines 723-900) - Contains the Items tab expanded details section with the 3-column layout (Product Details, Pricing & Promotions, Fulfillment & Shipping) where new fields need to be added
- **src/lib/mock-data.ts** (lines 230-324) - Contains the order items generation logic where new field generation needs to be added

### New Files
None required - all changes are to existing files.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update ApiOrderItem Interface
- Open `src/components/order-management-hub.tsx`
- Add `supplyTypeId?: 'On Hand Available' | 'Pre-Order'` field after line 96 (after `giftWrapped`)
- Add `giftWrappedMessage?: string` field after `giftWrapped` definition

### 2. Update Mock Data Generation in mock-data.ts
- Open `src/lib/mock-data.ts`
- Around line 247 (after `giftWrapped` generation), add `supplyTypeId` generation:
  ```typescript
  const supplyTypeId = Math.random() < 0.8 ? 'On Hand Available' : 'Pre-Order'
  ```
- Around line 247, add `giftWrappedMessage` generation (only when giftWrapped is true):
  ```typescript
  const giftMessages = ['Happy Birthday!', 'Congratulations!', 'Best Wishes!', 'With Love', 'Thank You!']
  const giftWrappedMessage = giftWrapped ? giftMessages[Math.floor(Math.random() * giftMessages.length)] : undefined
  ```
- Update `shippingMethod` logic at line 250 to be context-aware (note: since items are generated before delivery methods are determined, we need to pass delivery type information or use a random approach based on probability):
  ```typescript
  // 50% chance of Click & Collect style shipping, 50% Home Delivery style
  const isClickCollectShipping = Math.random() < 0.5
  const clickCollectShippingOptions = ['Standard Pickup', '1H Delivery']
  const homeDeliveryShippingOptions = ['Standard Delivery', '3H Delivery', 'Next Day', 'Express']
  const shippingMethod = isClickCollectShipping
    ? clickCollectShippingOptions[Math.floor(Math.random() * clickCollectShippingOptions.length)]
    : homeDeliveryShippingOptions[Math.floor(Math.random() * homeDeliveryShippingOptions.length)]
  ```
- Add `supplyTypeId` and `giftWrappedMessage` to the returned item object (around lines 302-307)

### 3. Update Items Tab UI in order-detail-view.tsx
- Open `src/components/order-detail-view.tsx`
- In the Product Details column (around line 731-764), add Supply Type ID field after UOM:
  ```tsx
  <div className="flex justify-between">
    <span className="text-gray-500">Supply Type ID</span>
    <span className="text-gray-900 font-medium">{item.supplyTypeId || 'N/A'}</span>
  </div>
  ```
- In the same Product Details column, add Gift Wrapped Message right after the Gift Wrapped field (conditionally rendered):
  ```tsx
  {item.giftWrapped && item.giftWrappedMessage && (
    <div className="flex justify-between">
      <span className="text-gray-500">Gift Message</span>
      <span className="text-gray-900 font-medium italic">{item.giftWrappedMessage}</span>
    </div>
  )}
  ```
- The Shipping Method field already exists in the Fulfillment & Shipping column (line 833-835) and will automatically show the updated values from mock data

### 4. Validate Implementation
- Run the development server: `pnpm dev`
- Navigate to Order Management Hub, select any order
- Go to Items tab, expand an item to view details
- Verify:
  - Supply Type ID shows in Product Details column (after UOM)
  - Gift Wrapped Message appears when Gift Wrapped is "Yes"
  - Shipping Method shows appropriate values based on context
- Run `pnpm build` to ensure no TypeScript errors

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure the TypeScript builds without errors
- `pnpm dev` - Start development server and manually verify:
  1. Open http://localhost:3000
  2. Navigate to Order Management
  3. Click on any order to open Order Detail View
  4. Click on "Items" tab
  5. Click on any item row to expand details
  6. Verify "Supply Type ID" appears after UOM in Product Details section
  7. Verify items with "Gift Wrapped: Yes" show "Gift Message" field
  8. Verify "Shipping Method" shows varied values (Standard Pickup, 1H Delivery, Standard Delivery, 3H Delivery, Next Day, Express)

## Notes
- The shipping method values are generated randomly with 50/50 split between Click & Collect style and Home Delivery style options, since items are generated before delivery method context is determined
- Gift Wrapped Message is conditionally rendered - only appears when `giftWrapped` is true AND a message exists
- Supply Type ID uses 80/20 probability split favoring "On Hand Available" to reflect realistic inventory availability
- All new fields follow the existing styling pattern: muted gray label, normal/medium weight value
