# Chore: Add MAO Order Line Fields to Omnia-UI Order Detail View

## Metadata
adw_id: `e4367f23`
prompt: `Add MAO order line fields to Omnia-UI order detail view (src/components/order-detail-view.tsx): 1) Add to Product Details section next to Substitution field: Bundle (Yes/No), Bundle Ref Id (value or N/A), Packed Ordered Qty (always visible, remove isPackUOM condition). 2) Add Gift with purchase item field after Gift with purchase field (show when giftWithPurchase is true). 3) Ensure OrderItem interface in src/types/inventory.ts has: bundle boolean, bundleRefId string, giftWithPurchaseItem string, packedOrderedQty number. 4) Update mock data in src/lib/mock-data.ts order W1156251121946800 with sample values for these fields. Reference MAO order W1156251121946800 field structure.`

## Chore Description

This chore adds missing MAO (Manhattan Active Omni) order line fields to the Omnia-UI order detail view to ensure all order item fields from the MAO system are properly displayed in the UI. The changes involve:

1. **UI Updates**: Add three new fields to the Product Details section in the order detail view:
   - **Bundle**: Display "Yes" or "No" based on the bundle boolean
   - **Bundle Ref Id**: Display the bundle reference ID or "N/A" if not present
   - **Packed Ordered Qty**: Always display this field (removing the conditional display that only showed it for pack UOM types)

2. **UI Enhancement**: Add a new field for Gift with Purchase Item that displays after the Gift with Purchase field when a gift with purchase is present.

3. **Type System Updates**: Ensure the OrderItem interface (ApiOrderItem in order-management-hub.tsx) includes all necessary MAO fields. Note: The interface is actually in `src/components/order-management-hub.tsx`, not `src/types/inventory.ts`.

4. **Mock Data Updates**: Update the mock data for order W1156251121946800 to include realistic values for the new fields based on the actual MAO system data structure.

## Relevant Files

### Existing Files to Modify

- **src/components/order-detail-view.tsx** (lines 758-810)
  - Product Details section where Bundle, Bundle Ref Id, and Packed Ordered Qty fields need to be added
  - Currently shows Substitution field, Gift Wrapped, and Gift Message
  - Need to add Bundle fields next to Substitution
  - Need to remove isPackUOM condition from Packed Ordered Qty display

- **src/components/order-detail-view.tsx** (lines 905-914)
  - Pricing & Promotions section where Gift with Purchase Item field needs to be added
  - Currently shows Gift with Purchase as Yes/No
  - Need to add Gift with Purchase Item field that shows the item name when giftWithPurchase is true

- **src/components/order-management-hub.tsx** (lines 98-150)
  - Contains the ApiOrderItem interface definition
  - Already has: bundle?: boolean, bundleRef?: string, packedOrderedQty?: number
  - Already has: giftWithPurchase?: string | boolean | null
  - All required fields are already present in the interface

- **src/lib/mock-data.ts** (starting at line 2604)
  - Contains MAO order W1156251121946800 mock data
  - Order items array starts at line 2618 (maoOrderW1156251121946800Items)
  - Currently has bundle: false in items
  - Need to add realistic values for bundle, bundleRefId, giftWithPurchaseItem, and ensure packedOrderedQty is present

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Product Details Section - Add Bundle Fields
- Open `src/components/order-detail-view.tsx`
- Locate the Product Details section (around line 768)
- Add three new fields after the Substitution field (line 791-794):
  - Bundle: Display "Yes" if item.bundle is true, "No" otherwise
  - Bundle Ref Id: Display item.bundleRef if present, otherwise "N/A"
  - Packed Ordered Qty: Display item.packedOrderedQty or fallback to item.quantity
- Follow the existing pattern for field display (text-gray-500 label, text-gray-900 value)

### 2. Remove Conditional Display for Packed Ordered Qty
- In the same Product Details section (around line 777-782)
- Currently Packed Ordered Qty is only shown when `isPackUOM` is true
- Remove the conditional logic and always display Packed Ordered Qty
- Move it to the new location after Bundle Ref Id

### 3. Add Gift with Purchase Item Field
- Locate the Pricing & Promotions section (around line 905-914)
- Find the "Gift with Purchase" field display (line 905-908)
- Add a new conditional field immediately after it:
  - Only display when item.giftWithPurchase is truthy
  - Label: "Gift with purchase item"
  - Value: Display the giftWithPurchase value (it contains the gift item description)
- Follow the existing pattern for conditional field display

### 4. Verify Type System
- Open `src/components/order-management-hub.tsx`
- Verify the ApiOrderItem interface (lines 98-150) contains:
  - bundle?: boolean (line 119)
  - bundleRef?: string (line 120)
  - giftWithPurchase?: string | boolean | null (line 131)
  - packedOrderedQty?: number (line 110)
- All required fields are already present - no changes needed
- Note: bundleRefId is not needed as bundleRef is the correct field name

### 5. Update Mock Data for Order W1156251121946800
- Open `src/lib/mock-data.ts`
- Locate the maoOrderW1156251121946800Items array (starting at line 2618)
- Update sample items to include realistic MAO field values:
  - Add bundleRef to at least 2 items (e.g., "BUNDLE-001", "BUNDLE-002")
  - Set bundle: true for items with bundleRef
  - Ensure packedOrderedQty is present on all items (can equal quantity for non-pack items)
  - Add giftWithPurchase: "Free Gift Bag" or similar to at least 1 item for testing
- Reference the existing item structure for consistency

### 6. Validate Display Logic
- Review the updated order-detail-view.tsx file
- Verify all new fields follow the consistent display pattern:
  - Two-column layout with label and value
  - Proper spacing (space-y-3)
  - Correct text colors (text-gray-500 for labels, text-gray-900 for values)
  - Conditional display logic is correct
- Ensure the isPackUOM variable is still used elsewhere if needed, or remove it if no longer used

### 7. Test Data Flow
- Review how item data flows from mock-data.ts through the Order interface to order-detail-view.tsx
- Verify that the ApiOrderItem interface fields match what's displayed in the UI
- Ensure no type mismatches between bundleRef and bundleRefId (use bundleRef consistently)

## Validation Commands

Execute these commands to validate the chore is complete:

```bash
# 1. TypeScript compilation check - ensure no type errors
cd /Users/naruechon/Omnia-UI
npm run build

# 2. Verify the new fields are present in order-detail-view.tsx
grep -n "Bundle" src/components/order-detail-view.tsx
grep -n "Bundle Ref" src/components/order-detail-view.tsx
grep -n "Packed Ordered Qty" src/components/order-detail-view.tsx
grep -n "Gift with purchase item" src/components/order-detail-view.tsx

# 3. Verify mock data has been updated
grep -n "bundleRef" src/lib/mock-data.ts | head -10
grep -n "giftWithPurchase" src/lib/mock-data.ts | head -10
grep -n "bundle: true" src/lib/mock-data.ts | head -5

# 4. Start dev server and manually test the order detail page
npm run dev
# Navigate to order W1156251121946800 and verify:
# - Bundle field shows Yes/No correctly
# - Bundle Ref Id shows value or N/A
# - Packed Ordered Qty is always visible
# - Gift with purchase item shows when applicable
```

## Notes

### Field Name Clarification
- The prompt mentions "bundleRefId" but the actual field in ApiOrderItem is "bundleRef" (line 120)
- Use "bundleRef" consistently throughout the implementation
- Display label in UI should be "Bundle Ref Id" for clarity

### Interface Location
- The prompt mentions updating OrderItem in `src/types/inventory.ts`
- The actual interface is ApiOrderItem in `src/components/order-management-hub.tsx`
- No changes to src/types/inventory.ts are needed as it contains different inventory-related types

### Display Logic
- "Packed Ordered Qty" is currently shown only when isPackUOM is true (line 777-782)
- The prompt requests this field to always be visible, so remove the conditional logic
- The field should display item.packedOrderedQty if present, otherwise fallback to item.quantity

### Gift with Purchase
- The giftWithPurchase field has type: string | boolean | null
- When it's a string, it contains the gift item description
- Current display shows Yes/No; new field should show the actual gift item description
- Only show "Gift with purchase item" field when giftWithPurchase is truthy (not null or false)

### Mock Data Pattern
- Order W1156251121946800 has 17 line items
- Sample items include: Bon Aroma Coffee (3 splits), Betagro Egg Tofu (2 splits), etc.
- Add variety: some items with bundles, some without
- Ensure at least one item has a gift with purchase value for testing
