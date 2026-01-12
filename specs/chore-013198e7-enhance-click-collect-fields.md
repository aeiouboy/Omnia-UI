# Chore: Enhance Click & Collect Fields for Manhattan OMS Alignment

## Metadata
adw_id: `013198e7`
prompt: `Enhance Click & Collect section in Delivery Information card on Order Detail Overview tab (src/components/order-detail-view.tsx) to display additional fields matching Manhattan OMS design. Currently the Click & Collect section shows: Store Name, Store Contact, Store Address, Pickup Date, Time Slot, Collection Code. ADD the following fields to align with Home Delivery and support Tracking tab data: Email, Store Code, Full Address, Allocation Type.`

## Chore Description
Enhance the Click & Collect section in the Delivery Information card on the Order Detail Overview tab to display additional fields that align with the Manhattan OMS design and maintain data consistency with the Tracking tab.

Currently, the Click & Collect section displays 6 fields:
1. Store Name
2. Store Contact (storePhone)
3. Store Address
4. Pickup Date
5. Time Slot
6. Collection Code

This chore adds 4 new fields to align with Home Delivery section structure and support Tracking tab data:
- **Email**: Customer email for pickup notification
- **Store Code**: Store identifier code (format: 'RBS XXXXX' or 'TOP XXXXX')
- **Full Address**: Complete address with district, city, postal code (Thai format)
- **Allocation Type**: Always 'Pickup' for Click & Collect orders

The final field order for Click & Collect section (matching Manhattan OMS layout):
1. Store Name (existing)
2. Store Code (NEW)
3. Store Contact (existing)
4. Email (NEW)
5. Store Address (existing)
6. Full Address (NEW)
7. Pickup Date (existing)
8. Time Slot (existing)
9. Collection Code (existing)
10. Allocation Type (NEW)

## Relevant Files
Use these files to complete the chore:

- **`src/types/delivery.ts`** - Contains the `ClickCollectDetails` interface that needs to be updated with the 4 new fields: `email`, `storeCode`, `fullAddress`, `allocationType`
- **`src/lib/mock-data.ts`** - Contains the `generateDeliveryMethods()` function that generates mock Click & Collect data. Needs to generate values for the 4 new fields.
- **`src/components/order-detail-view.tsx`** - Contains the `ClickCollectSection` component that renders the Click & Collect details. Needs to display the 4 new fields in the specified order.

### New Files
- None required

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update ClickCollectDetails Interface
- Open `src/types/delivery.ts`
- Add 4 new optional fields to the `ClickCollectDetails` interface:
  - `email?: string` - Customer email for pickup notification
  - `storeCode?: string` - Store identifier code
  - `fullAddress?: string` - Complete address with district, city, postal code
  - `allocationType?: 'Pickup'` - Always 'Pickup' for Click & Collect orders
- Keep existing fields unchanged

### 2. Update generateDeliveryMethods() in mock-data.ts
- Open `src/lib/mock-data.ts`
- Locate the `generateDeliveryMethods()` function (around line 71)
- Add Thai district/city/postal code arrays for generating realistic full addresses:
  ```typescript
  const thaiDistrictAddresses = [
    'Muang, Kamphaeng Phet 62000',
    'Watthana, Bangkok 10110',
    'Chatuchak, Bangkok 10900',
    // ... more Thai district addresses
  ]
  ```
- Update the clickCollect object generation (around lines 112-120 and 145-152) to include:
  - `email`: Use customer email from the function parameter (need to add email to customer parameter)
  - `storeCode`: Generate format 'RBS XXXXX' or 'TOP XXXXX' based on store name (if contains 'Tops' use 'TOP', else 'RBS')
  - `fullAddress`: Pick random Thai district address from array
  - `allocationType`: Always set to 'Pickup'
- Update function parameter type to accept customer email:
  ```typescript
  function generateDeliveryMethods(
    itemCount: number,
    customer: { name: string; phone: string; email?: string },
    shippingAddress: { street: string; city: string; postal_code: string }
  ): DeliveryMethod[]
  ```
- Update the caller in mockApiOrders to pass customer email

### 3. Update ClickCollectSection Component
- Open `src/components/order-detail-view.tsx`
- Locate the `ClickCollectSection` component (around line 107)
- Update the grid to display fields in the specified order with responsive layout `grid-cols-1 md:grid-cols-2`:
  1. Store Name (existing) - left column
  2. Store Code (NEW) - right column
  3. Store Contact (existing) - left column
  4. Email (NEW) - right column
  5. Store Address (existing) - full width `sm:col-span-2`
  6. Full Address (NEW) - full width `sm:col-span-2`
  7. Pickup Date (existing) - left column
  8. Time Slot (existing) - right column
  9. Collection Code (existing) - full width `sm:col-span-2`
  10. Allocation Type (NEW) - full width, display as plain text (not badge)
- Use the same label-value styling as existing fields (plain text, no badges except section header)

### 4. Validate Implementation
- Run the development server: `pnpm dev`
- Navigate to Order Management Hub
- Click on an order with Click & Collect delivery method
- Verify the Overview tab shows Delivery Information card with all 10 fields in correct order
- Verify the new fields display correctly:
  - Email shows customer email format
  - Store Code shows 'RBS XXXXX' or 'TOP XXXXX' format
  - Full Address shows Thai district format
  - Allocation Type shows 'Pickup'
- Verify responsive layout works (1 column on mobile, 2 columns on desktop)
- Run build to ensure no TypeScript errors: `pnpm build`

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Verify no TypeScript/ESLint errors in the build
- `pnpm dev` - Start development server and manually verify:
  1. Open http://localhost:3000
  2. Navigate to Order Management Hub
  3. Select an order with Click & Collect delivery
  4. On Overview tab, verify Delivery Information card shows all 10 Click & Collect fields
  5. Verify field order matches Manhattan OMS layout
  6. Verify responsive layout on mobile and desktop views

## Notes
- The new fields are added as optional to maintain backward compatibility with existing data
- Store Code format uses 'TOP' prefix for Tops stores and 'RBS' for other stores (Robinson stores)
- Full Address uses Thai format: "District, City PostalCode" (e.g., "Muang, Kamphaeng Phet 62000")
- Allocation Type is always 'Pickup' for Click & Collect orders (vs 'Delivery' for Home Delivery)
- These fields will also be used by the Tracking tab for Ship to Store information, ensuring data consistency
- The styling matches the existing plain text label-value format used in Home Delivery section
