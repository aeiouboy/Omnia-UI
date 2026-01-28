# Wireframe: Product Info Card for Stock Card By Product Page

## Overview
Add a dynamic **Product Info Card** that displays the **selected product's actual data** on the Stock Card By Product page. When a user clicks on any product row in the table, the card populates with THAT specific product's information from the `InventoryItem` object.

**Location**: `http://localhost:3000/inventory-new` → Select View Type → Click on a Product Row

**Target File**: `app/inventory-new/page.tsx`

## Current Behavior
- Products display in a table with basic info (Image, Name, Barcode, Brand, Item Type, Channel, Config, Stock)
- Clicking a row navigates to `/inventory-new/[id]` detail page
- No inline product info card exists

## Requested Feature
Display a Product Info Card that **dynamically shows the clicked product's actual data**:
1. **Product Image** - `item.imageUrl` (fallback to dark placeholder with `item.brand` or `item.productName`)
2. **Product Name** - `item.productName` as main heading
3. **Category** - `item.category` label
4. **Barcode** - `item.barcode` or `item.productId` with barcode icon
5. **Item Type** - `item.itemType` as badge (Pack Item, Weight, Normal, etc.)
6. **Supply Type** - `item.supplyType` as green badge (On Hand Available / Pre-Order)
7. **Stock Config** - `item.stockConfigStatus` with checkmark (Configured/Unconfigured)
8. **Last Restocked** - `item.lastRestocked` formatted timestamp

**IMPORTANT**: All fields are populated dynamically from the selected `InventoryItem` object - NOT hardcoded values.

---

## Version 1: Inline Card Above Table (Recommended - Matches Reference Design)

### Description
Display a Product Info Card above the products table when a product row is selected. The card follows the exact layout from the reference design with left image and right content sections.

### Visual Layout (Dynamic Data from Selected Product)
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌────────────────────┐    {item.productName}                              │
│  │                    │    ───────────────────────────────────────────      │
│  │    ████████████    │                                                     │
│  │    ████████████    │    {item.category}                                  │
│  │                    │    ─────────────────────────────────────────────    │
│  │   {item.brand}     │                                                     │
│  │                    │    IIII Barcode      ⊕ Item Type       ⊕ Supply Type│
│  │    (dark bg with   │    {item.barcode}   ┌──────────────┐  ┌────────────┐│
│  │     brand/product  │                     │{item.itemType}│  │{item.      ││
│  │     name centered) │                     │              │  │supplyType} ││
│  │                    │                     └──────────────┘  └────────────┘│
│  └────────────────────┘                      (outline badge)   (green badge)│
│                                                                             │
│                            ○ Stock Config                                   │
│                            {item.stockConfigStatus === 'valid' ? '✓' : '○'} │
│                                                                             │
│                            Last Restocked                                   │
│                            {formatDate(item.lastRestocked)}                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  Products Table (existing)                                                  │
│  ...                                                                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Detailed Component Breakdown

**Left Section - Product Image (w-[200px])**
```
┌────────────────────────┐
│                        │
│   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │  bg-gray-900 (dark)
│   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │  rounded-xl
│                        │  aspect-square
│     CK Underwear       │  centered white text
│                        │  (brand or product name)
│                        │
└────────────────────────┘
```

**Right Section - Product Details**
```
Line 1: Product Name (text-2xl font-bold)
Line 2: Category (text-muted-foreground)
Line 3: ──────────────── (separator border-t)
Line 4: Three columns with icons + labels + values
        - Barcode (barcode icon + "Barcode" label + value)
        - Item Type (package icon + "Item Type" label + badge)
        - Supply Type (package icon + "Supply Type" label + green badge + info icon)
Line 5: Stock Config (circle icon + "Stock Config" label)
Line 6: ✓ Configured (checkmark + green text)
Line 7: (spacing)
Line 8: Last Restocked (label in muted)
Line 9: January 12, 2026 at 06:00 PM (formatted date)
```

### Full Page Layout with Transaction History
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  PRODUCT INFO CARD                                                          │
│  ┌────────────────────┐                                                     │
│  │                    │    Calvin Klein Men's Cotton Stretch Boxer          │
│  │   CK Underwear     │    Briefs 3-Pack                                    │
│  │                    │    Fashion                                          │
│  │   (dark image)     │    ────────────────────────────────────────────     │
│  │                    │    Barcode | Item Type | Supply Type                │
│  └────────────────────┘    ...                                              │
│                            Stock Config: ✓ Configured                       │
│                            Last Restocked: January 12, 2026 at 06:00 PM     │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  TRANSACTION HISTORY                                              [Filters] │
├─────────────────────────────────────────────────────────────────────────────┤
│  Date        │ Type      │ Qty  │ Balance │ Reference   │ Channel │ User   │
│  ────────────┼───────────┼──────┼─────────┼─────────────┼─────────┼─────── │
│  Jan 20 10AM │ Stock In  │ +50  │ 150     │ PO-12345    │ -       │ admin  │
│  Jan 19 3PM  │ Stock Out │ -10  │ 100     │ ORD-67890   │ Grab    │ system │
│  Jan 18 9AM  │ Allocation│ -5   │ 110     │ ORD-11111   │ Web     │ system │
│  Jan 17 2PM  │ Transfer  │ +20  │ 115     │ TRF-22222   │ -       │ admin  │
│  ...         │ ...       │ ...  │ ...     │ ...         │ ...     │ ...    │
├─────────────────────────────────────────────────────────────────────────────┤
│  Page 1 of 5                                    [← Previous] [Next →]       │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Transaction History Features
- **Filters**: Date range picker, Transaction type dropdown
- **Columns**: Date, Type (badge), Quantity (+/-), Balance After, Reference ID, Channel, User
- **Pagination**: Standard pagination controls
- **Type Badges**:
  - Stock In → green badge
  - Stock Out → red badge
  - Adjustment → yellow badge
  - Transfer → blue badge
  - Allocation → purple badge

### Interaction Flow
1. User clicks a product row in the table
2. Product Info Card appears above the table with slide-down animation
3. Row remains highlighted in table
4. User can click "✕ Close" or click another row to switch products
5. Clicking same row again closes the card

### Pros
- Non-intrusive - doesn't change table navigation
- Easy to dismiss
- Maintains existing table interaction patterns
- Works well on all screen sizes

### Cons
- Takes vertical space above table
- May require scrolling on smaller screens

### Implementation Notes
- Add `selectedProduct: InventoryItem | null` state
- Modify row click to toggle selection instead of immediate navigation
- Add "View Details" button in card to navigate to full detail page
- Use `Collapsible` component from shadcn/ui for smooth animation

---

## Version 2: Side Panel (Split View)

### Description
Display product info in a right-side panel that slides in when a product is selected. Table shrinks to accommodate the panel.

### Visual Layout
```
┌──────────────────────────────────────────┬──────────────────────────────────┐
│  Products Table                          │  PRODUCT INFO                    │
│  ┌────┬────────────┬─────────┬─────┐    │  ┌────────────────────────────┐  │
│  │Img │ Name       │ Barcode │Stock│    │  │                            │  │
│  ├────┼────────────┼─────────┼─────┤    │  │      [Product Image]       │  │
│  │ 📦 │ Product A  │ 001234  │ 50  │    │  │        CK Underwear        │  │
│  │ 📦 │ Product B  │ 001235  │ 30  │◀───│  │                            │  │
│  │ 📦 │ Product C  │ 001236  │ 25  │    │  └────────────────────────────┘  │
│  │ 📦 │ Product D  │ 001237  │ 100 │    │                                  │
│  └────┴────────────┴─────────┴─────┘    │  Calvin Klein Men's Cotton...    │
│                                          │  Fashion                         │
│                                          │                                  │
│                                          │  IIII Barcode                    │
│                                          │  0088238100001                   │
│                                          │                                  │
│                                          │  ⊕ Item Type      ⊕ Supply Type │
│                                          │  [Pack Item]   [On Hand Avail.] │
│                                          │                                  │
│                                          │  ○ Stock Config                  │
│                                          │  ✓ Configured                    │
│                                          │                                  │
│                                          │  Last Restocked                  │
│                                          │  Jan 12, 2026 at 06:00 PM        │
│                                          │                                  │
│                                          │  [View Full Details →]           │
└──────────────────────────────────────────┴──────────────────────────────────┘
```

### Pros
- Professional split-view UX
- Product info always visible while browsing
- Good for comparing products

### Cons
- More complex layout changes
- Table columns may need to be hidden on smaller screens
- Requires responsive breakpoint handling

### Implementation Notes
- Use CSS Grid or Flexbox for split layout
- Panel width: `w-[400px]` fixed or `w-1/3` responsive
- Add `Sheet` component from shadcn/ui for mobile (slides from right)
- Hide panel columns on mobile, show as bottom sheet instead

---

## Version 3: Expandable Row Detail (Accordion Style)

### Description
Expand the selected row inline to show product info card directly below it, similar to accordion behavior.

### Visual Layout
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Products Table                                                             │
├────┬────────────────────────────────┬─────────────┬────────────┬───────────┤
│Img │ Name                           │ Barcode     │ Item Type  │ Stock     │
├────┼────────────────────────────────┼─────────────┼────────────┼───────────┤
│ 📦 │ Product A                      │ 001234      │ Pack       │ 50        │
├────┴────────────────────────────────┴─────────────┴────────────┴───────────┤
│  ▼ EXPANDED ROW                                                             │
│  ┌──────────────┐                                                           │
│  │  [Product    │   Calvin Klein Men's Cotton Stretch Boxer Briefs 3-Pack  │
│  │   Image]     │   Category: Fashion                                       │
│  │              │                                                           │
│  │  CK Underwear│   Barcode: 0088238100001                                  │
│  └──────────────┘   Item Type: [Pack Item (pieces)]                         │
│                     Supply Type: [On Hand Available] ⓘ                      │
│                     Stock Config: ✓ Configured                              │
│                     Last Restocked: January 12, 2026 at 06:00 PM            │
│                                                                             │
│                     [View Full Details →]                                   │
├────┬────────────────────────────────┬─────────────┬────────────┬───────────┤
│ 📦 │ Product B                      │ 001235      │ Weight     │ 30        │
├────┼────────────────────────────────┼─────────────┼────────────┼───────────┤
│ 📦 │ Product C                      │ 001236      │ Normal     │ 25        │
└────┴────────────────────────────────┴─────────────┴────────────┴───────────┘
```

### Pros
- Context preserved - expanded row stays with its data
- Natural accordion UX pattern
- Works well with existing table structure

### Cons
- More complex table modification
- May look cluttered with multiple expanded rows
- Pagination interaction needs consideration

### Implementation Notes
- Add `expandedRowId: string | null` state
- Use `Collapsible` for expand animation
- Collapse previous row when new row is clicked
- Style expanded area with subtle background color

---

## Data Mapping

Fields from `InventoryItem` interface to display:

| Display Field     | Source Field        | Format/Component                    |
|-------------------|---------------------|-------------------------------------|
| Product Image     | `imageUrl`          | `<Image>` with fallback placeholder |
| Product Name      | `productName`       | `<h2>` heading                      |
| Category          | `category`          | Muted text label                    |
| Barcode           | `barcode` or `productId` | Mono font with barcode icon    |
| Item Type         | `itemType`          | Badge (Pack/Weight/Normal)          |
| Supply Type       | `supplyType`        | Green Badge with info tooltip       |
| Stock Config      | `stockConfigStatus` | Checkmark icon + "Configured" text  |
| Last Restocked    | `lastRestocked`     | Formatted date string               |

### Badge Styling

**Item Type Badges:**
```
weight      → bg-blue-100 text-blue-800 border-blue-200    "Weight Item (kg)"
pack_weight → bg-purple-100 text-purple-800 border-purple-200  "Pack Weight"
pack        → bg-indigo-100 text-indigo-800 border-indigo-200  "Pack Item (pieces)"
normal      → bg-gray-100 text-gray-800 border-gray-200    "Normal Item"
```

**Supply Type Badges:**
```
On Hand Available → bg-green-100 text-green-800 border-green-300
Pre-Order         → bg-amber-100 text-amber-800 border-amber-300
```

**Stock Config Status:**
```
valid       → ✓ Configured (green checkmark)
invalid     → ✗ Invalid (red X)
unconfigured → ○ Not Configured (gray circle)
```

---

## Recommendation

**Recommended: Version 1 (Inline Card Above Table)**

Rationale:
- Least disruptive to existing table UX
- Simple state management (selected product)
- Works consistently across all screen sizes
- Easy to implement and test
- Users can quickly preview product info without losing table context
- "View Full Details" button provides path to complete detail page

---

## Files to Modify

1. **`app/inventory-new/page.tsx`**
   - Add `selectedProduct` state
   - Modify row click handler to toggle selection
   - Add Product Info Card component above table
   - Add Transaction History section below Product Info Card
   - Add "View Full Details" navigation button

2. **`src/components/inventory/product-info-card.tsx`** (NEW)
   - Create reusable Product Info Card component
   - Props: `product: InventoryItem`, `onClose: () => void`, `onViewDetails: () => void`

3. **`src/components/inventory/transaction-history-section.tsx`** (EXISTING)
   - Reuse existing Transaction History component
   - Pass `productId` to fetch transactions for selected product

4. **`src/lib/inventory-service.ts`**
   - Use existing `fetchRecentTransactions(productId, limit)` function

5. **`src/types/inventory.ts`** (if needed)
   - Verify all required fields exist in `InventoryItem` interface

---

## Testing Checklist

### Product Info Card
- [ ] Card appears when clicking a product row
- [ ] Card displays correct product data
- [ ] Close button dismisses the card
- [ ] Clicking another row switches the displayed product
- [ ] Clicking same row toggles card visibility
- [ ] "View Full Details" navigates to `/inventory-new/[id]`
- [ ] Image fallback works when imageUrl is missing
- [ ] All badges display correct colors
- [ ] Stock Config checkmark shows correct status
- [ ] Last Restocked date is properly formatted

### Transaction History
- [ ] Transaction History loads when product is selected
- [ ] Transactions update when switching products
- [ ] Date range filter works correctly
- [ ] Transaction type filter works correctly
- [ ] Pagination controls function properly
- [ ] Type badges show correct colors
- [ ] Quantity shows +/- prefix correctly

### General
- [ ] Responsive layout works on mobile
- [ ] TypeScript compilation passes
- [ ] Production build succeeds
