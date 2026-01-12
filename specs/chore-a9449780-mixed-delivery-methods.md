# Chore: Mixed Delivery Methods in Order Detail Overview

## Metadata
adw_id: `a9449780`
prompt: `Redesign the Delivery Address section in Order Detail Overview tab (src/components/order-detail-view.tsx) to support mixed delivery methods in a single order. Customer can choose different delivery methods for different items: some items for Home Delivery and some items for Click & Collect.`

## Chore Description
Redesign the "Delivery Address" card in the Order Detail Overview tab to support mixed delivery methods within a single order. The current implementation only shows a single delivery address, but customers should be able to split their order with some items for Home Delivery and others for Click & Collect (in-store pickup).

The new "Delivery Information" section will:
1. Support three delivery scenarios: Home Delivery only, Click & Collect only, or Mixed (both methods)
2. Display appropriate sections based on which delivery methods are used
3. Show item counts for each delivery method
4. Include distinct visual styling with icons and badges for each method
5. Handle mixed orders with clear visual separation and an "AND" divider

## Relevant Files
Use these files to complete the chore:

- **src/components/order-detail-view.tsx** - Main file to modify. Contains the Order Detail View component with the current "Delivery Address" card (lines 366-393) that needs to be replaced with the new "Delivery Information" section.

- **src/lib/mock-data.ts** - Mock data generator file. The `mockApiOrders` array (lines 7-160) needs to be extended with `deliveryMethods` field containing delivery method data for each order.

- **src/components/order-management-hub.tsx** - Contains the `Order` interface (lines 123-147) and related type definitions (`ApiShippingAddress`, `ApiCustomer`). The `Order` interface needs to be extended with the new `deliveryMethods` field.

- **src/types/audit.ts** - Reference for how to structure TypeScript interfaces in this codebase.

### New Files
- **src/types/delivery.ts** - New file to create containing `DeliveryMethod`, `HomeDeliveryDetails`, and `ClickCollectDetails` type definitions.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Create Delivery Types File
- Create new file `src/types/delivery.ts`
- Define `DeliveryMethodType` type: `'HOME_DELIVERY' | 'CLICK_COLLECT'`
- Define `HomeDeliveryDetails` interface with fields:
  - `recipient: string`
  - `phone: string`
  - `address: string`
  - `district: string`
  - `city: string`
  - `postalCode: string`
  - `specialInstructions?: string`
- Define `ClickCollectDetails` interface with fields:
  - `storeName: string`
  - `storeAddress: string`
  - `pickupDate: string`
  - `timeSlot: string`
  - `collectionCode: string`
  - `storePhone: string`
- Define `DeliveryMethod` interface with fields:
  - `type: DeliveryMethodType`
  - `itemCount: number`
  - `homeDelivery?: HomeDeliveryDetails` (present when type is HOME_DELIVERY)
  - `clickCollect?: ClickCollectDetails` (present when type is CLICK_COLLECT)

### 2. Update Order Interface
- In `src/components/order-management-hub.tsx`, add import for `DeliveryMethod` type
- Extend the `Order` interface (line 123-147) to include:
  - `deliveryMethods?: DeliveryMethod[]`
- Export the `Order` interface if not already exported (it is already exported)

### 3. Update Mock Data Generator
- In `src/lib/mock-data.ts`, add import for delivery types
- Add constants for:
  - Store names for Click & Collect: `['Central Ladprao', 'Central World', 'Central Bangna', 'Central Westgate', 'Central Pinklao', 'Tops Central Plaza Ladprao', 'Tops Central World', 'Tops Sukhumvit 39']`
  - Time slots: `['09:00 - 12:00', '12:00 - 15:00', '15:00 - 18:00', '18:00 - 21:00']`
- Create helper function `generateCollectionCode()` returning format `CC-XXXXXX` (6 random digits)
- Create helper function `generateDeliveryMethods(itemCount: number)` that:
  - Uses random distribution: 50% Home Delivery only, 25% Click & Collect only, 25% Mixed
  - For mixed orders, randomly splits itemCount between methods (ensuring sum equals total)
  - Generates appropriate details for each method type
  - Returns array of DeliveryMethod objects
- Update `mockApiOrders` generation (lines 7-160) to include `deliveryMethods` field using the new generator

### 4. Create Delivery Information Component Sections
- In `src/components/order-detail-view.tsx`, add imports:
  - `Home, Store` icons from lucide-react
  - `DeliveryMethod` type from `@/types/delivery`
- Create `HomeDeliverySection` component:
  - Props: `delivery: DeliveryMethod` (with homeDelivery details)
  - Header with Home icon, "Home Delivery" title, blue "DELIVERY" badge, and item count
  - Fields: Recipient, Phone, Address, District/City, Special Instructions
  - Use consistent styling with other Overview cards
- Create `ClickCollectSection` component:
  - Props: `delivery: DeliveryMethod` (with clickCollect details)
  - Header with Store icon, "Click & Collect" title, purple "PICKUP" badge, and item count
  - Fields: Store Name, Store Address, Pickup Date, Time Slot, Collection Code, Store Contact
  - Use consistent styling with other Overview cards

### 5. Replace Delivery Address Card
- In the Overview TabsContent (lines 233-444), locate the Delivery Address Card (lines 366-393)
- Replace with new Delivery Information Card that:
  - Uses MapPin icon and "Delivery Information" title
  - Checks `order?.deliveryMethods` array
  - Renders appropriate sections based on delivery method types present
  - For mixed orders: displays HomeDeliverySection, then a divider with "AND" text, then ClickCollectSection
  - For single method orders: displays only the relevant section
  - Falls back to showing "No delivery information available" if no delivery methods
- Apply visual separation for mixed orders:
  - Use `border-b border-gray-200 pb-4 mb-4` for first section
  - Add centered "AND" text with horizontal lines on either side
  - Second section follows without additional top border
- Ensure responsive layout (sections stack vertically on all screen sizes)

### 6. Validate Implementation
- Run `pnpm build` to ensure no TypeScript errors
- Run `pnpm dev` to start development server
- Navigate to Order Management Hub and select an order to view details
- Verify the Overview tab shows the new Delivery Information section
- Test with different orders to see all three scenarios (Home Delivery only, Click & Collect only, Mixed)
- Verify responsive layout works on mobile viewports

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure TypeScript compilation succeeds with no errors
- `pnpm lint` - Ensure no ESLint errors
- `pnpm dev` - Start development server and manually verify:
  1. Open http://localhost:3000
  2. Navigate to Order Management Hub
  3. Click on an order to open Order Detail View
  4. Verify Overview tab shows new Delivery Information section
  5. Check multiple orders to see different delivery method scenarios
  6. Test responsive layout by resizing browser window

## Notes
- The mock data distribution (50% Home Delivery, 25% Click & Collect, 25% Mixed) ensures good coverage for testing all scenarios
- Store names for pickup include both "Central" and "Tops" stores as specified
- The "AND" divider in mixed orders provides clear visual separation between delivery methods
- Item counts should always sum to the total number of items in the order
- Collection codes follow the format CC-XXXXXX where X is a digit (0-9)
- Pickup dates should be generated as future dates (1-7 days from order date)
- Time slots are realistic retail pickup windows
- The design maintains consistency with existing Overview tab card styling (Customer Information, Order Information, Payment Information)
