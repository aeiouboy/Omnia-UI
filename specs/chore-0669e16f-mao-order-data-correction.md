# Chore: Fix MAO Order W1156260115052036 Data Inconsistencies

## Metadata
adw_id: `0669e16f`
prompt: `Fix the data inconsistencies in maoOrderW1156260115052036 by matching the EXACT values from the MAO screenshot.`

## Chore Description
The mock data for order W1156260115052036 contains incorrect customer name and address information that doesn't match the MAO (Manhattan OMS) screenshot. The current data appears to be from a different order. This chore corrects the customer information, shipping address, delivery methods, and tax ID to match the exact values shown in the MAO screenshot at `.playwright-mcp/.playwright-mcp/mao-order-status.png`.

## Relevant Files

- **src/lib/mock-data.ts** (lines 3119-3655)
  - Contains the `maoOrderW1156260115052036` constant that needs correction
  - Customer information (lines 3132-3140)
  - Shipping address (lines 3143-3149)
  - Delivery methods (lines 3592-3606)
  - Tax ID field (line 3634)

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Fix Customer ID and Name
- Change `customer.id` from `'2510083814'` to `'3459900070144'`
- Change `customer.name` from `'วิริยงสุดา ศรีทอง'` to `'ศรีสมพร พรหมโชติ'`
- Keep all other customer fields unchanged (email, phone, customerType, custRef, T1Number)

### 2. Fix Shipping Address Street
- Change `shipping_address.street` to `'111/107 หมู่ 1 ซอย โรจนานุจรรย์ ถนนรามอินทรา (ซอย 8)'`
- Current value is: `'111/107 หมู่บ้านมณีรินทร์ พาร์ค (ซ.8) ซ.ท่าอิฐ'`

### 3. Fix Shipping Address State and City
- Change `shipping_address.state` to `'แขวง ท่าแร้ง เขตบางเขน'`
- Current value is: `'นนทบุรี'`
- Change `shipping_address.city` to `'กรุงเทพมหานคร'`
- Current value is: `'เมืองนนทบุรี'`
- Keep `postal_code` as `'11000'` and `country` as `'TH'`

### 4. Fix Delivery Methods Address
- Change `deliveryMethods[0].homeDelivery.address` to `'111/107 หมู่ 1 ซอย โรจนานุจรรย์ ถนนรามอินทรา (ซอย 8)'`
- Change `deliveryMethods[0].homeDelivery.recipient` to `'ศรีสมพร พรหมโชติ'`
- Change `deliveryMethods[0].homeDelivery.district` to `'ท่าแร้ง'` (currently `'ไทรม้า'`)
- Change `deliveryMethods[0].homeDelivery.city` to `'กรุงเทพมหานคร'` (currently `'เมืองนนทบุรี'`)
- Keep `phone` as `'0622424423'`

### 5. Fix Tax ID Field
- The current `taxId` field contains `'3459900070144'` which is actually the customer ID
- Move this value to `customer.id` (done in step 1)
- Set `taxId` to `undefined` since the screenshot doesn't show a separate tax ID

### 6. Build and Validate
- Run `pnpm build` to verify no compilation errors
- Run `pnpm dev` to start the development server
- Navigate to `http://localhost:3000/orders`
- Search for order `W1156260115052036`
- Verify customer name shows: ศรีสมพร พรหมโชติ
- Verify address shows: 111/107 หมู่ 1 ซอย โรจนานุจรรย์ ถนนรามอินทรา (ซอย 8)

## Validation Commands
Execute these commands to validate the chore is complete:

```bash
# Build to check for TypeScript errors
pnpm build

# Start dev server
pnpm dev

# Then in browser:
# 1. Navigate to http://localhost:3000/orders
# 2. Search for: W1156260115052036
# 3. Verify customer name: ศรีสมพร พรหมโชติ
# 4. Verify address: 111/107 หมู่ 1 ซอย โรจนานุจรรย์ ถนนรามอินทรา (ซอย 8)
# 5. Verify customer ID: 3459900070144
```

## Notes
- The MAO screenshot clearly shows different customer information than what's currently in the mock data
- Customer ID 3459900070144 was incorrectly placed in the taxId field; it should be in customer.id
- The shipping address and delivery methods must both be updated to maintain consistency
- This is a data correction task, not a functional change - no component logic needs to be modified
