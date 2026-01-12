# Chore: Enhance Click & Collect Section Fields

## Metadata
adw_id: `2d716c89`
prompt: `Enhance Click & Collect section in Order Detail Overview tab (src/components/order-detail-view.tsx) to add customer-centric fields matching Home Delivery style. Update the ClickCollectDetails interface and display.`

## Chore Description
This chore enhances the Click & Collect section in the Order Detail Overview tab to include customer-centric fields that match the Home Delivery section style. The changes involve:

1. **Renaming labels**: "Store Name" becomes "Store Pickup"
2. **Adding new customer-centric fields**: Recipient Name, Phone (customer's phone, not store), and Rel No. (release order number for pickup verification)
3. **Removing obsolete fields**: Store Code, Email, and Full Address
4. **Reordering fields**: Match the Manhattan OMS layout with a logical two-column structure

The goal is to provide a consistent user experience between Home Delivery and Click & Collect sections, with customer information prominently displayed.

## Relevant Files
Use these files to complete the chore:

- **src/types/delivery.ts** (line 27-38): Contains the `ClickCollectDetails` interface that needs new properties (`recipientName`, `phone`, `relNo`) and removal of obsolete properties (`storeCode`, `email`, `fullAddress`)
- **src/lib/mock-data.ts** (lines 136-153, 174-189): Contains the `generateDeliveryMethods()` function that generates Click & Collect mock data - needs to populate new fields and remove obsolete ones
- **src/components/order-detail-view.tsx** (lines 112-183): Contains the `ClickCollectSection` component that renders the Click & Collect UI - needs field label updates, new field additions, field removals, and reordering

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update ClickCollectDetails Interface
- Open `src/types/delivery.ts`
- Add three new properties to the `ClickCollectDetails` interface:
  - `recipientName: string` - Customer name for pickup
  - `phone: string` - Customer phone number (not store phone)
  - `relNo: string` - Release order number for pickup verification
- Remove three obsolete properties:
  - `storeCode?: string`
  - `email?: string`
  - `fullAddress?: string`
- Ensure `storePhone` remains as "Store Contact"

### 2. Add Release Number Generator Function
- Open `src/lib/mock-data.ts`
- Add a new helper function `generateReleaseNumber()` after `generateCollectionCode()` (around line 77):
  ```typescript
  function generateReleaseNumber(): string {
    const year = new Date().getFullYear()
    const digits = String(Math.floor(Math.random() * 1000000)).padStart(6, '0')
    return `REL-${year}-${digits}`
  }
  ```

### 3. Update Click & Collect Mock Data Generation
- In `src/lib/mock-data.ts`, update the Click & Collect data generation in `generateDeliveryMethods()`:
- For **Click & Collect only** section (lines 136-153):
  - Add: `recipientName: customer.name`
  - Add: `phone: customer.phone`
  - Add: `relNo: generateReleaseNumber()`
  - Remove: `storeCode: generateStoreCode(storeName)`
  - Remove: `email: customer.email`
  - Remove: `fullAddress: thaiDistrictFullAddresses[...]`
- For **Mixed delivery** Click & Collect section (lines 174-189):
  - Apply the same changes as above

### 4. Remove Obsolete Helper Function
- In `src/lib/mock-data.ts`, remove or comment out the `generateStoreCode()` function (lines 83-89) as it's no longer needed
- Also consider removing `thaiDistrictFullAddresses` array if not used elsewhere (lines 56-69)

### 5. Update ClickCollectSection Component
- In `src/components/order-detail-view.tsx`, update the `ClickCollectSection` component (lines 112-183):

**Left Column (reorder and update):**
1. Rename "Store Name" label to "Store Pickup" (keep using `details.storeName`)
2. Add "Recipient Name" field displaying `details.recipientName`
3. Add "Phone" field displaying `details.phone`
4. Add "Rel No." field displaying `details.relNo`
5. Keep "Pickup Date" field as is

**Right Column (reorder):**
6. Keep "Store Contact" field (using `details.storePhone`)
7. Keep "Store Address" field (using `details.storeAddress`)
8. Keep "Time Slot" field as is
9. Keep "Collection Code" field as is
10. Keep "Allocation Type" field as is

**Remove fields:**
- Remove "Store Code" field (was `details.storeCode`)
- Remove "Email" field (was `details.email`)
- Remove "Full Address" field (was `details.fullAddress`)

### 6. Update Field Layout in ClickCollectSection
- Ensure the grid layout displays fields in the correct order:
  ```tsx
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Left Column */}
    {/* 1. Store Pickup */}
    {/* 2. Recipient Name */}
    {/* 3. Phone */}
    {/* 4. Rel No. */}
    {/* 5. Pickup Date */}

    {/* Right Column */}
    {/* 6. Store Contact */}
    {/* 7. Store Address */}
    {/* 8. Time Slot */}
    {/* 9. Collection Code */}
    {/* 10. Allocation Type */}
  </div>
  ```

### 7. Validate TypeScript Compilation
- Run `pnpm build` to ensure no TypeScript errors
- Fix any type errors that arise from the interface changes

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure the project builds without TypeScript errors
- `pnpm lint` - Ensure no linting errors
- `pnpm dev` - Start dev server and manually verify:
  1. Navigate to Order Management Hub
  2. Click on an order with Click & Collect delivery method
  3. Verify the Overview tab shows the updated Click & Collect section with:
     - "Store Pickup" label (not "Store Name")
     - "Recipient Name" field present
     - "Phone" field present (customer phone)
     - "Rel No." field present with REL-YYYY-XXXXXX format
     - "Store Code", "Email", and "Full Address" fields removed
     - Fields in correct order matching spec

## Notes
- The `storePhone` field remains as "Store Contact" - this is the store's phone number for pickup inquiries
- The new `phone` field is the customer's phone number for contact
- The `relNo` (Release Number) format is `REL-YYYY-XXXXXX` where YYYY is the current year
- This change aligns Click & Collect with Home Delivery's customer-centric field display
- Both sections now prominently show recipient/customer information at the top
