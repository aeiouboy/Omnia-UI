# Chore: Refine Order Items Tab Header to Match Manhattan OMS

## Metadata
adw_id: `cf70de22`
prompt: `Refine Order Items Tab header to match Manhattan OMS screenshot exactly.

  **CURRENT**: Header shows product name, SKU, Barcode, Qty, and price per unit.

  **ENHANCEMENTS NEEDED**:

  1. **Add Line Item Total Price to Header**:
     - Display total price prominently on the right side of header (larger font, bold, green color)
     - Show 'price each' below the total in smaller text
     - Format: '฿52.50' (large) with '฿52.50 each' (small) below

  2. **Add Thai Product Names**:
     - Update mock data to include thaiName field for products
     - Display format: 'Thai Name English Name' (e.g., 'สิงห์น้ำดื่ม 600มล. Singha Drinking Water 600ml.')
     - If thaiName not available, show English name only

  3. **Add Bundle Ref Field**:
     - Add bundleRef to Fulfillment & Shipping column (after Bundle field)
     - Display bundle reference number or 'N/A' if not applicable

  **FILES TO MODIFY**:
  - src/components/order-detail-view.tsx (Items tab header section)
  - src/lib/mock-data.ts (add thaiName to product items)`

## Chore Description
Enhance the Order Items Tab header in the Order Detail View to match the Manhattan OMS design exactly. The current header displays basic product information (name, SKU, barcode, quantity, price per unit) but needs three key enhancements:

1. **Line Item Total Price**: Add a prominent total price display on the right side of the header with large, bold, green text showing the total (e.g., '฿52.50') with smaller text below showing the unit price (e.g., '฿52.50 each').

2. **Thai Product Names**: Add support for bilingual product names by including a `thaiName` field in the product data structure and displaying it as "Thai Name English Name" format (e.g., 'สิงห์น้ำดื่ม 600มล. Singha Drinking Water 600ml.').

3. **Bundle Ref Field**: Display the bundle reference number in the Fulfillment & Shipping column (currently located in the expanded detail section), right after the Bundle field.

## Relevant Files

### Files to Modify
- **src/components/order-detail-view.tsx** (lines 628-712) - Items tab header section where the product card header is rendered. This section contains the product image, name, SKU, barcode, quantity, and price display that needs to be enhanced.
  - Reason: Contains the JSX that renders each item card's header with product information
  - Current price display is at lines 703-708 showing unit price only
  - Product name display at lines 668-675 needs to support Thai names

- **src/lib/mock-data.ts** (lines 194-210) - Product definitions array where products are defined with name, SKU, category, and price
  - Reason: Needs to add `thaiName` field to each product definition for bilingual support
  - Product array at lines 194-210 contains 15 products that need Thai names added

- **src/components/order-management-hub.tsx** (lines 80-114) - TypeScript interface `ApiOrderItem` definition
  - Reason: May need to add `thaiName` field to the interface if not already present (bundleRef already exists at line 107)
  - Contains the type definitions for order items

### Related Files (for reference)
- **src/components/order-detail-view.tsx** (lines 818-845) - Fulfillment & Shipping column in expanded details
  - Reason: Contains the Bundle Ref display logic in the expanded section that needs to be moved to the header

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update TypeScript Interface (if needed)
- Read `src/components/order-management-hub.tsx` to check if `ApiOrderItem` interface includes `thaiName` field
- If not present, add `thaiName?: string` optional field to the `ApiOrderItem` interface
- Verify `bundleRef` field already exists in the interface (should be at line ~107)

### 2. Add Thai Names to Mock Product Data
- Open `src/lib/mock-data.ts` and locate the `products` array (lines 194-210)
- Add `thaiName` field to each product with appropriate Thai translations:
  - Fresh Milk 1L → "นมสด 1ลิตร"
  - Chicken Breast 500g → "อกไก่ 500กรัม"
  - Jasmine Rice 5kg → "ข้าวหอมมะลิ 5กิโลกรัม"
  - Green Apples → "แอปเปิ้ลเขียว"
  - Coca Cola 1.5L → "โค้ก 1.5ลิตร"
  - Chocolate Cookies → "คุกกี้ช็อกโกแลต"
  - Whole Wheat Bread → "ขนมปังโฮลวีท"
  - Frozen Pizza → "พิซซ่าแช่แข็ง"
  - Organic Eggs 10pcs → "ไข่ออร์แกนิค 10ฟอง"
  - Fresh Salmon 300g → "ปลาแซลมอนสด 300กรัม"
  - Potato Chips → "มันฝรั่งทอด"
  - Orange Juice 1L → "น้ำส้ม 1ลิตร"
  - Bananas 1kg → "กล้วย 1กิโลกรัม"
  - Croissant 6pcs → "ครัวซองต์ 6ชิ้น"
  - Ice Cream Vanilla → "ไอศกรีมวานิลลา"
- Update the item generation logic (around line 286) to include `thaiName` field when creating order items from the products array

### 3. Enhance Item Header Price Display
- Open `src/components/order-detail-view.tsx` and locate the price display section (lines 695-709)
- Replace the current single price display with a two-tier layout:
  - **Top level**: Total price (unit_price × quantity) in large, bold, green text (text-lg sm:text-xl font-bold text-green-600)
  - **Bottom level**: Unit price with "per unit" label in smaller gray text (text-xs text-gray-500)
- Format:
  ```jsx
  <div className="text-right">
    <p className="text-lg sm:text-xl font-bold text-green-600">
      ฿{((item.unit_price || 0) * item.quantity).toFixed(2)}
    </p>
    <p className="text-xs text-gray-500">
      ฿{(item.unit_price || 0).toFixed(2)} each
    </p>
  </div>
  ```

### 4. Add Thai Name Support to Product Display
- In `src/components/order-detail-view.tsx`, locate the product name display (lines 668-675)
- Update the display logic to show Thai name + English name if `thaiName` is available:
  ```jsx
  <h4 className="font-medium text-sm sm:text-base text-gray-900 leading-tight" style={{...}}>
    {item.thaiName ? `${item.thaiName} ${item.product_name}` : item.product_name || 'N/A'}
  </h4>
  ```
- Ensure the text truncation styles remain intact to handle longer bilingual names

### 5. Add Bundle Ref to Header Section
- In the item header section (after the Quantity display, around line 695), add Bundle Ref display
- Create a new div to show Bundle Ref when it exists:
  ```jsx
  {item.bundleRef && (
    <div>
      <p className="text-xs text-gray-500">Bundle Ref:</p>
      <p className="text-sm font-mono">{item.bundleRef}</p>
    </div>
  )}
  ```
- Position it between the Quantity field and the Total Price section for visual balance
- Keep the existing Bundle Ref display in the expanded Fulfillment & Shipping column (lines 840-845) for detailed view

### 6. Validate and Test Changes
- Build the application to ensure no TypeScript errors: `npm run build` or `pnpm build`
- Check that all three enhancements are visible in the Order Items tab header:
  - ✓ Line item total price displayed prominently in green with unit price below
  - ✓ Thai product names display correctly in "Thai English" format
  - ✓ Bundle Ref appears in the header when present
- Verify responsive behavior on mobile (sm:) and desktop screen sizes
- Test with items that have bundleRef vs items without to ensure conditional display works
- Ensure the layout remains clean and doesn't break with long Thai product names

## Validation Commands
Execute these commands to validate the chore is complete:

1. **TypeScript Compilation Check**:
   ```bash
   pnpm build
   ```
   - Ensures no type errors from interface changes or missing fields

2. **Development Server Test**:
   ```bash
   pnpm dev
   ```
   - Navigate to an order detail page and open the Items tab
   - Verify the three enhancements are visible and styled correctly

3. **Visual Inspection Checklist**:
   - [ ] Total price displayed in large green text on right side of header
   - [ ] Unit price shown below total in smaller text with "each" label
   - [ ] Thai product names appear before English names (format: "Thai English")
   - [ ] Bundle Ref field appears in header when item has bundleRef value
   - [ ] Layout remains clean and responsive on mobile and desktop
   - [ ] Long product names truncate properly with ellipsis

4. **Mock Data Validation**:
   ```bash
   grep -A 5 "thaiName:" src/lib/mock-data.ts | head -20
   ```
   - Verify that products now include thaiName field with Thai translations

## Notes
- The Bundle Ref field should remain in both the header AND the expanded Fulfillment & Shipping section for consistency
- Thai names should use authentic Thai script for realistic testing
- The total price calculation is `unit_price × quantity` to show the line item total
- Color coding (green for total price) matches financial UI conventions for positive amounts
- The header enhancements should not break the existing expand/collapse functionality
- Consider that some items may not have `thaiName` or `bundleRef` - use optional chaining and fallback to avoid errors
