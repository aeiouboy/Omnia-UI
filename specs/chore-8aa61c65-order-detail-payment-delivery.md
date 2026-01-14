# Chore: Order Detail Page - Payment & Delivery Enhancements

## Metadata
adw_id: `8aa61c65`
prompt: `Add new fields to Order Detail page: Shipping Fee in Payment Information section (after Charge field, Thai Baht format), Delivery Type in Delivery Address section (supporting RT-HD-EXP, RT-CC-STD, MKP-HD-STD, RT-HD-STD, RT-CC-EXP values)`

## Chore Description
This chore adds two new fields to the Order Detail page to enhance visibility into shipping costs and delivery methods:

1. **Shipping Fee Field (Payment Information Section)**: Add a new line item showing the shipping fee immediately after the "Charges" field in the Payment Information card. The shipping fee should be formatted as Thai Baht currency (฿) and sourced from the order's `orderDeliveryFee` field.

2. **Delivery Type Field (Delivery Information Section)**: Add a "Delivery Type" field to display the order-level delivery type code. The system must support five delivery type values:
   - `RT-HD-EXP` - Retail Home Delivery Express
   - `RT-CC-STD` - Retail Click & Collect Standard
   - `MKP-HD-STD` - Marketplace Home Delivery Standard
   - `RT-HD-STD` - Retail Home Delivery Standard
   - `RT-CC-EXP` - Retail Click & Collect Express

## Relevant Files
Use these files to complete the chore:

- **src/components/order-detail-view.tsx** - Main component containing both Payment Information and Delivery Information cards. Lines 543-590 contain the Payment Information section; lines 491-541 contain the Delivery Information section.
- **src/components/order-management-hub.tsx** - Contains the `Order` interface definition (lines 205-243) with existing `deliveryType` (FMSDeliveryType) and `orderDeliveryFee` fields that can be leveraged.
- **src/types/delivery.ts** - Contains delivery-related type definitions (`DeliveryMethod`, `HomeDeliveryDetails`, `ClickCollectDetails`).

### New Files
- None required - all changes are modifications to existing files.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Add Delivery Type Code Type Definition
- Open `src/components/order-management-hub.tsx`
- Add a new type `DeliveryTypeCode` after line 156 with the five supported values: `'RT-HD-EXP' | 'RT-CC-STD' | 'MKP-HD-STD' | 'RT-HD-STD' | 'RT-CC-EXP'`
- Update the `Order` interface to include a new optional field `deliveryTypeCode?: DeliveryTypeCode` for the order-level delivery type code

### 2. Add Shipping Fee to Payment Information Section
- Open `src/components/order-detail-view.tsx`
- Locate the Payment Information card (around lines 543-590)
- Add a new row for "Shipping Fee" immediately AFTER the "Charges" row (line 571)
- Use the order's `orderDeliveryFee` field as the data source
- Format as Thai Baht currency: `฿{order?.orderDeliveryFee?.toFixed(2) || '0.00'}`
- Use the same styling pattern as existing rows:
  ```tsx
  <div className="flex justify-between items-center">
    <span className="text-sm text-enterprise-text-light">Shipping Fee</span>
    <span className="text-sm font-mono">฿{order?.orderDeliveryFee?.toFixed(2) || '0.00'}</span>
  </div>
  ```

### 3. Add Delivery Type to Delivery Information Section
- Locate the Delivery Information card in `order-detail-view.tsx` (around lines 491-541)
- Add a "Delivery Type" field at the top of the delivery section, before the Home Delivery or Click & Collect sections
- Create a helper function or inline mapping to display friendly labels for delivery type codes:
  - `RT-HD-EXP` → "Retail Home Delivery Express"
  - `RT-CC-STD` → "Retail Click & Collect Standard"
  - `MKP-HD-STD` → "Marketplace Home Delivery Standard"
  - `RT-HD-STD` → "Retail Home Delivery Standard"
  - `RT-CC-EXP` → "Retail Click & Collect Express"
- Display both the code and the friendly label for clarity
- Add appropriate styling with a badge for visual distinction
- Handle missing/undefined delivery type gracefully with a dash '-' or 'N/A'

### 4. Create DeliveryTypeBadge Component (Optional Enhancement)
- Consider creating a `DeliveryTypeBadge` component in `src/components/order-badges.tsx` for consistent styling
- Use color coding to distinguish delivery types:
  - Express deliveries (RT-HD-EXP, RT-CC-EXP): Orange/amber theme
  - Standard deliveries (RT-HD-STD, RT-CC-STD, MKP-HD-STD): Blue/gray theme
  - Marketplace (MKP-*): Purple theme

### 5. Validate TypeScript Compilation
- Run `pnpm build` to ensure no TypeScript errors
- Fix any type errors that arise from the new fields
- Ensure all imports are correctly added

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure the project builds without TypeScript or compilation errors
- `pnpm lint` - Verify no ESLint violations were introduced
- `pnpm dev` - Start dev server and manually verify:
  1. Navigate to any order detail page (e.g., `/orders/[id]`)
  2. Verify "Shipping Fee" appears in the Payment Information section after "Charges"
  3. Verify "Delivery Type" appears in the Delivery Information section
  4. Verify both fields display appropriate formatting and handle missing data gracefully

## Notes
- The `orderDeliveryFee` field already exists in the `Order` interface, so no API changes are required for shipping fee
- The existing `deliveryType` field uses `FMSDeliveryType` which has values like 'Standard Delivery' and 'Express Delivery' - the new `deliveryTypeCode` field uses the more specific channel-based codes (RT-HD-EXP, etc.)
- If the API doesn't yet return the `deliveryTypeCode` field, consider deriving it from existing fields (`channel`, `deliveryType`, `deliveryMethods`) or displaying a placeholder until backend support is added
- Currency formatting uses Thai Baht (฿) with 2 decimal places, consistent with existing payment fields
