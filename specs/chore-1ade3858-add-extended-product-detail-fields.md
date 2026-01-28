# Chore: Add Extended Product Detail Fields to Items Tab

## Metadata
adw_id: `1ade3858`
prompt: `Implement Version 1 from wf_specs/wf-product-detail-extended-fields.md - Add 7 new fields (Secret Code, Style, Color, Size, Reason, Temperature, Expiry) to the Product Details section in the Items tab. Simple inline addition below existing fields using same styling pattern.`

## Chore Description
Add 7 new product attribute fields to the Product Details section in the Order Detail → Items tab. This implements **Version 1 (Inline Addition)** from the wireframe specification, which adds fields vertically below existing fields with minimal code changes. The new fields are:

1. **Secret Code** - Product secret/internal code
2. **Style** - Product style variant
3. **Color** - Product color
4. **Size** - Product size (XS, S, M, L, XL, etc.)
5. **Reason** - Order/item reason (e.g., return reason, special handling)
6. **Temperature** - Temperature requirement (Frozen, Chilled, Ambient, Hot)
7. **Expiry** - Product expiry date

The implementation follows the existing styling pattern (`<div className="flex justify-between">` with gray-500/gray-900 text colors) and adds the fields after the Gift Message field (line 877).

## Relevant Files
Use these files to complete the chore:

- **`wf_specs/wf-product-detail-extended-fields.md`** - Wireframe specification with Version 1 implementation details, data types, and visual layout
- **`src/components/order-detail-view.tsx`** (Lines 831-883) - Main component where Product Details section is rendered; need to add 7 new field displays after line 877
- **`src/components/order-management-hub.tsx`** (Lines 98-150) - Contains `ApiOrderItem` interface definition; need to extend with 7 new optional fields
- **`src/lib/mock-data.ts`** - Mock data generation service; need to add sample values for the 7 new fields to support development/testing

### New Files
No new files required - all changes are additions to existing files.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Extend TypeScript Interface for ApiOrderItem
- Open `src/components/order-management-hub.tsx`
- Locate the `ApiOrderItem` interface (around line 98)
- Add 7 new optional fields after the existing fields (around line 150):
  ```typescript
  // Extended Product Detail Fields (Added: chore-1ade3858)
  secretCode?: string          // Internal/secret product code
  style?: string               // Product style variant
  color?: string               // Product color
  size?: string                // Product size (XS, S, M, L, XL, etc.)
  reason?: string              // Order/item reason
  temperature?: 'FROZEN' | 'CHILLED' | 'AMBIENT' | 'HOT' | string  // Temperature requirement
  expiry?: string              // ISO date string for expiry date
  ```
- Verify TypeScript compilation passes after changes

### 2. Add Field Displays to Order Detail View Component
- Open `src/components/order-detail-view.tsx`
- Navigate to the Product Details section (lines 831-883)
- Locate the Gift Message field (line 872-877) - this is the last field
- Add 7 new field displays immediately after line 877, following the exact same styling pattern:
  ```tsx
  <div className="flex justify-between">
    <span className="text-gray-500">Secret Code</span>
    <span className="text-gray-900 font-medium">{item.secretCode || 'N/A'}</span>
  </div>
  <div className="flex justify-between">
    <span className="text-gray-500">Style</span>
    <span className="text-gray-900 font-medium">{item.style || 'N/A'}</span>
  </div>
  <div className="flex justify-between">
    <span className="text-gray-500">Color</span>
    <span className="text-gray-900 font-medium">{item.color || 'N/A'}</span>
  </div>
  <div className="flex justify-between">
    <span className="text-gray-500">Size</span>
    <span className="text-gray-900 font-medium">{item.size || 'N/A'}</span>
  </div>
  <div className="flex justify-between">
    <span className="text-gray-500">Reason</span>
    <span className="text-gray-900 font-medium">{item.reason || 'N/A'}</span>
  </div>
  <div className="flex justify-between">
    <span className="text-gray-500">Temperature</span>
    <span className="text-gray-900 font-medium">{item.temperature || 'N/A'}</span>
  </div>
  <div className="flex justify-between">
    <span className="text-gray-500">Expiry</span>
    <span className="text-gray-900 font-medium">{item.expiry || 'N/A'}</span>
  </div>
  ```
- Ensure all fields use consistent styling: `text-gray-500` for labels, `text-gray-900 font-medium` for values
- Ensure all fields have fallback values ('N/A') when data is missing

### 3. Add Mock Data Values for Testing
- Open `src/lib/mock-data.ts`
- Locate the function that generates mock order items (search for `product_name` or `ApiOrderItem` usage)
- Add realistic sample values for the 7 new fields to some order items:
  - **secretCode**: `'SC-12345'`, `'SC-67890'`, `'SC-ABCDE'`
  - **style**: `'Classic'`, `'Modern'`, `'Vintage'`, `'Casual'`
  - **color**: `'Navy Blue'`, `'Black'`, `'White'`, `'Red'`, `'Green'`
  - **size**: `'XS'`, `'S'`, `'M'`, `'L'`, `'XL'`, `'XXL'`
  - **reason**: `'Standard'`, `'Return'`, `'Exchange'`, `'Special Handling'`
  - **temperature**: `'FROZEN'`, `'CHILLED'`, `'AMBIENT'`, `'HOT'`
  - **expiry**: Use future dates in ISO format, e.g., `'2026-12-31'`, `'2027-06-30'`
- Ensure some items have values and some don't (to test N/A fallback display)
- Keep mock data realistic and varied for different product types

### 4. Test TypeScript Compilation
- Run `npm run build` to verify TypeScript compilation succeeds
- Fix any type errors that appear related to the new fields
- Ensure no existing functionality is broken by the changes

### 5. Verify Visual Display in Development Mode
- Run `npm run dev` to start the development server
- Navigate to `http://localhost:3000/orders`
- Click on an order to open the Order Detail modal
- Switch to the **Items** tab
- Expand an item card to view Product Details
- Verify all 7 new fields appear below the Gift Message field
- Verify fields show values when present in mock data
- Verify fields show 'N/A' when data is missing
- Check responsive layout on mobile/tablet screen sizes
- Test expand/collapse functionality still works correctly

### 6. Validate Implementation Against Specification
- Re-read `wf_specs/wf-product-detail-extended-fields.md` Version 1 section
- Confirm all 7 fields are displayed in the correct order
- Confirm styling matches existing pattern (flex justify-between, gray-500/gray-900 colors)
- Confirm fallback values ('N/A') are used for missing data
- Confirm TypeScript types are properly defined with optional fields
- Document any deviations from the specification (should be none for Version 1)

## Validation Commands
Execute these commands to validate the chore is complete:

- `npm run build` - Verify production build succeeds with no TypeScript errors
- `npm run lint` - Ensure ESLint passes with no new warnings
- `npm run dev` - Start development server and manually test:
  1. Navigate to http://localhost:3000/orders
  2. Click any order to open detail modal
  3. Go to Items tab
  4. Expand item card
  5. Verify all 7 new fields appear in Product Details section
  6. Verify styling matches existing fields
  7. Verify 'N/A' appears when data is missing
  8. Test on mobile viewport (Chrome DevTools responsive mode)

## Notes

### Implementation Approach
- This is Version 1 (Inline Addition) - the simplest, lowest-risk approach
- All 7 fields are added vertically below existing fields
- No layout restructuring or sub-sections (that's Version 2)
- No visual badges or two-column grid (that's Version 3)

### Future Enhancements
- **Version 2**: Could reorganize into logical sub-sections (Basic Info, Variants & Attributes, Handling & Storage, Options)
- **Version 3**: Could add two-column grid layout with temperature badges, color swatches, and size indicators
- See `wf_specs/wf-product-detail-extended-fields.md` for detailed enhancement specifications

### Design Decisions
- **Fallback Value**: Using 'N/A' for consistency with existing fields (Bundle Ref Id, Gift Message use similar patterns)
- **Temperature Field**: Plain text display without badges in Version 1 (badges in Version 3)
- **Expiry Field**: Plain ISO date string display without formatting in Version 1 (formatted display in Version 2/3)
- **Optional Fields**: All fields are optional to maintain backward compatibility with existing API data

### Food Safety Consideration
- Temperature and Expiry fields are critical for retail food operations
- Version 2/3 could provide enhanced visibility with color-coded badges and formatted dates
- Current Version 1 provides basic visibility for compliance tracking
