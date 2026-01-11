# Chore: Enhance Order Items Tab to Match Manhattan OMS Design

## Metadata
adw_id: `99d308b7`
prompt: `Enhance Order Items Tab to match Manhattan OMS design with comprehensive product details.`

## Chore Description
Redesign the Order Items tab in the order detail view to match Manhattan OMS design patterns. The current implementation shows basic item cards with product image, name, SKU, quantity, unit price, and total, with an expanded section showing product ID, category, brand, and description.

The target state requires:
1. Enhanced item header row with fulfillment status badge, Thai+English product names, barcode, and "Expand All" button
2. Expanded section with 3-column layout showing Product Details, Pricing & Promotions, and Fulfillment & Shipping
3. Extended mock data with new fields: UOM, barcode, promotions, gift wrapping, price breakdown, etc.
4. Responsive design that stacks columns on mobile

## Relevant Files
Use these files to complete the chore:

- **src/components/order-detail-view.tsx** (lines 579-722) - Main component containing the Items tab. The existing implementation uses `filteredItems.map()` to render item cards with expand/collapse functionality via `expandedItems` state and `toggleItemExpansion` function.

- **src/lib/mock-data.ts** (lines 194-249) - Contains product definitions and `generateMockOrders` function that creates order items with structure: `id`, `product_id`, `product_name`, `product_sku`, `quantity`, `unit_price`, `total_price`, `product_details`. New Manhattan-style fields need to be added here.

- **src/components/order-management-hub.tsx** (lines 80-89) - Defines the `ApiOrderItem` interface that is exported and used by `order-detail-view.tsx`. This interface needs to be extended with new Manhattan OMS fields.

- **src/types/audit.ts** - Contains type definitions for the order detail page. Can be used as reference for type patterns or extended if needed.

- **src/components/ui/badge.tsx** - Badge component with variants (default, secondary, destructive, outline). Will use custom className for green fulfillment status badge styling.

### New Files
- **src/types/order-item.ts** (optional) - If the extended interface becomes too large, consider creating a dedicated types file for order item types.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Extend ApiOrderItem Interface
- Open `src/components/order-management-hub.tsx`
- Add new fields to `ApiOrderItem` interface:
  ```typescript
  // Manhattan OMS Enhanced Fields
  uom?: string;  // Unit of Measure: PACK, SCAN, SBOX, EA, KG, etc.
  packedOrderedQty?: number;
  location?: string;  // Store code e.g., CFM5252
  barcode?: string;  // 13-digit barcode
  giftWrapped?: boolean;
  substitution?: boolean;
  fulfillmentStatus?: 'Picked' | 'Pending' | 'Shipped' | 'Packed';
  shippingMethod?: string;  // Standard Delivery, Express, etc.
  bundle?: boolean;
  bundleRef?: string;
  eta?: {
    from: string;  // DD Mon YYYY HH:MM:SS format
    to: string;
  };
  promotions?: {
    discountAmount: number;  // Negative value e.g., -0.50
    promotionId: string;
    promotionType: string;  // Discount, Product Discount Promotion
    secretCode?: string;
  }[];
  giftWithPurchase?: string | null;  // null or gift description
  priceBreakdown?: {
    subtotal: number;
    discount: number;
    charges: number;
    amountIncludedTaxes: number;
    amountExcludedTaxes: number;
    taxes: number;
    total: number;
  };
  ```

### 2. Update Mock Data Generator
- Open `src/lib/mock-data.ts`
- In the `generateMockOrders` function (around line 229-249), extend the order item generation:
- Add UOM options array: `['PACK', 'SCAN', 'SBOX', 'EA', 'KG', 'PCS', 'BOX', 'BTL']`
- Add fulfillment status options: `['Picked', 'Pending', 'Shipped', 'Packed']`
- Add shipping method options: `['Standard Delivery', 'Express Delivery', 'Same Day']`
- Generate random barcode: `Math.floor(Math.random() * 9000000000000) + 1000000000000` (13 digits)
- Generate location codes: `'CFM' + Math.floor(Math.random() * 9000 + 1000)`
- Calculate price breakdown from existing subtotal/discount values
- Add promotions array with 0-2 random promotions
- Set giftWrapped and substitution randomly (10-20% true)
- Set bundle randomly (5% true with bundleRef)
- Generate ETA date range (1-7 days from now)

### 3. Add "Expand All" State and Button
- Open `src/components/order-detail-view.tsx`
- Add new state for expand all: `const [allItemsExpanded, setAllItemsExpanded] = useState(false)`
- Add toggle function to expand/collapse all items:
  ```typescript
  const toggleAllItems = () => {
    if (allItemsExpanded) {
      setExpandedItems({});
    } else {
      const allExpanded: Record<string, boolean> = {};
      filteredItems.forEach((item: ApiOrderItem) => {
        allExpanded[item.product_sku] = true;
      });
      setExpandedItems(allExpanded);
    }
    setAllItemsExpanded(!allItemsExpanded);
  };
  ```
- In the CardHeader (line 583-599), add "Expand All" button next to search input

### 4. Enhance Item Header Row Design
- Update the item header section (lines 607-665) to match Manhattan OMS:
- Increase image size to 80x80 on desktop (h-20 w-20)
- Update product name to support Thai + English format (will use existing name, mock data already supports this)
- Add "SKU:" prefix and Barcode display below product name
- Add "Qty:" prefix before quantity value
- Add Fulfillment Status badge (green for Picked, yellow for Pending, blue for Shipped, purple for Packed)
- Move price to right side with larger/bold font and "per unit" text below
- Keep ChevronDown for expand/collapse

### 5. Redesign Expanded Section with 3-Column Layout
- Replace existing expanded section (lines 668-696) with 3-column grid layout
- Implement responsive design: `grid-cols-1 md:grid-cols-3`
- **Column 1 - Product Details:**
  - UOM value with label
  - Packed Ordered Qty
  - Location (store code)
  - Barcode
  - Gift Wrapped (Yes/No)
  - Substitution (Yes/No)
- **Column 2 - Pricing & Promotions:**
  - Price (unit price)
  - Total (line total)
  - Qty
  - Promotions & Coupons section header
  - Map over promotions array displaying: discount amount, promotion ID, type, secret code
  - Gift with Purchase row
- **Column 3 - Fulfillment & Shipping:**
  - Shipping Method
  - Fulfillment Status badge
  - Bundle (Yes/No)
  - Bundle Ref
  - ETA (date range format)
  - Price Breakdown section with right-aligned values:
    - Subtotal, Discount, Charges, Amount Included Taxes, Amount Excluded Taxes, Taxes, Total (green/bold)

### 6. Add Section Styling
- Add subtle background to section headers: `bg-gray-50 px-3 py-2 rounded-t-md`
- Use consistent label styling: `text-xs text-gray-500 uppercase tracking-wide`
- Use consistent value styling: `text-sm text-gray-900 font-medium`
- Price breakdown section uses right-aligned layout with border-top for total row
- Total row uses green color: `text-green-600 font-semibold`

### 7. Verify TypeScript Compatibility
- Ensure all new fields are optional (`?:`) to maintain backwards compatibility
- Ensure mock data always provides values for display (use fallback defaults in UI)
- Check that the build compiles without TypeScript errors

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure TypeScript compiles without errors
- `pnpm lint` - Ensure no ESLint errors
- `pnpm dev` - Start dev server and manually verify:
  1. Navigate to an order detail page
  2. Click the "Items" tab
  3. Verify "Expand All" button appears and works
  4. Verify item header shows: image, name, SKU with prefix, barcode, Qty with prefix, fulfillment badge, price
  5. Click expand on an item and verify 3-column layout displays correctly
  6. Verify mobile responsive design (columns stack on small screens)
  7. Verify all new fields display with proper formatting
  8. Verify price breakdown section has right-aligned values and green total

## Notes
- The existing `expandedItems` state and `toggleItemExpansion` function should be preserved
- Badge component uses className for custom colors (green: `bg-green-100 text-green-800`)
- Maintain existing search functionality for filtering items
- Keep the empty state component (PackageOpen icon) unchanged
- Product names in mock data are already English; for true Thai+English support, mock data could be enhanced but this is optional for MVP
- The price breakdown values in mock data can be calculated from existing subtotal/discounts logic already in mock-data.ts (lines 252-260)
