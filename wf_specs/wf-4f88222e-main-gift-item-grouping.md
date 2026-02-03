# Wireframe Specification: Main Item & Gift Item Grouping

**ADW ID:** 4f88222e
**Feature:** Visual grouping of main items with their associated gift items (GWP)
**Purpose:** Show clear relationship between main products and their "Gift with Purchase" items
**Created:** 2026-02-02
**Status:** Draft
**Related Specs:** wf-f8a2d7c4-v2-gift-gwp-items-tab.md

---

## User Requirement

> User ต้องการ grouping items ระหว่าง main items และ gift items โดย gift item จะมี:
> - `giftWithPurchase: true`
> - `giftWithPurchaseItem: {main item SKU}`
>
> User ต้องการเห็น relationship ระหว่างสินค้าหลักกับสินค้าที่แถม ให้ group อยู่ด้วยกันหรือใกล้กัน หรือสื่อให้เห็น relationship ชัดเจน

---

## Current State Analysis

### Current Data Structure

```typescript
interface OrderLineItem {
  // Current fields from mock data
  giftWithPurchase?: boolean | string  // "true" or main item SKU
  giftWithPurchaseItem?: string        // Main item SKU reference
}
```

**Example from current implementation:**
```typescript
// Main item
{
  sku: "CDS26769646",
  productName: "Lipstick Loveshine Candy Glow",
  giftWithPurchase: false,
  unitPrice: 1850
}

// Gift item linked to main item
{
  sku: "CDS10174760",
  productName: "GET FREE - MYSLF EAU DE PARFUM",
  giftWithPurchase: true,
  giftWithPurchaseItem: "CDS26769646",  // References main item SKU
  unitPrice: 0
}
```

### Current UI Display (Flat List)

```
┌─────────────────────────────────────────────────────────────┐
│ Items (6)                                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌───────────────────────────────────────────────────────┐ │
│ │ Lipstick Loveshine Candy Glow         Qty: 2  ฿1,850  │ │
│ │ Gift with Purchase: No                                 │ │
│ └───────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌───────────────────────────────────────────────────────┐ │
│ │ MYSLF EAU DE PARFUM 1.2 mL            Qty: 1  ฿0      │ │
│ │ Gift with Purchase: Yes                                │ │
│ │ Gift with purchase item: CDS26769646                   │ │
│ └───────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌───────────────────────────────────────────────────────┐ │
│ │ YSL Foundation                        Qty: 2  ฿0      │ │
│ │ Gift with Purchase: Yes                                │ │
│ │ Gift with purchase item: CDS26769646                   │ │
│ └───────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌───────────────────────────────────────────────────────┐ │
│ │ Libre EDP 1.2 mL                      Qty: 1  ฿0      │ │
│ │ Gift with Purchase: Yes                                │ │
│ │ Gift with purchase item: CDS26769646                   │ │
│ └───────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Problem:** Items are displayed in a flat list with no visual grouping. User must read "Gift with purchase item: CDS26769646" and mentally match it to the main item.

---

## Proposed Solution: Visual Grouping

### Option A: Indented Hierarchy with Connector Line (Recommended)

```
┌─────────────────────────────────────────────────────────────┐
│ Items (6)                             [View: Grouped ▼]     │
│ 1 paid item + 5 gifts                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ MAIN ITEM                                                   │
│ ┌───────────────────────────────────────────────────────┐ │
│ │ [IMG]  Lipstick Loveshine Candy Glow Valentines       │ │
│ │        SKU: CDS26769646                        [v]    │ │
│ │        Qty: 2                         ฿1,850.00       │ │
│ └───────────────────────────────────────────────────────┘ │
│ │                                                          │
│ │  ↳ Gift with Purchase (5 items)                         │
│ │                                                          │
│ │  ┌─────────────────────────────────────────────────┐   │
│ │  │ [GWP]  MYSLF EAU DE PARFUM 1.2 mL   Qty: 1 ฿0  │   │
│ │  │        SKU: CDS10174760                         │   │
│ │  └─────────────────────────────────────────────────┘   │
│ │                                                          │
│ │  ┌─────────────────────────────────────────────────┐   │
│ │  │ [GWP]  YSL Foundation LC1 1 mL      Qty: 2 ฿0  │   │
│ │  │        SKU: CDS23578005                         │   │
│ │  └─────────────────────────────────────────────────┘   │
│ │                                                          │
│ │  ┌─────────────────────────────────────────────────┐   │
│ │  │ [GWP]  Libre EDP 1.2 mL             Qty: 1 ฿0  │   │
│ │  │        SKU: CDS23619029                         │   │
│ │  └─────────────────────────────────────────────────┘   │
│ │                                                          │
│ │  ┌─────────────────────────────────────────────────┐   │
│ │  │ [GWP]  Libre EDP 1.2 mL             Qty: 2 ฿0  │   │
│ │  │        SKU: CDS23619029                         │   │
│ │  └─────────────────────────────────────────────────┘   │
│ │                                                          │
│ │  ┌─────────────────────────────────────────────────┐   │
│ │  │ [GWP]  Ang Pao Packet Set           Qty: 1 ฿0  │   │
│ │  │        SKU: CDS27800461                         │   │
│ └──└─────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Key Visual Elements:**
1. **Connector Line**: Left border line (`│`) connecting main item to all GWP items
2. **Section Header**: `↳ Gift with Purchase (5 items)` with arrow showing relationship
3. **Indentation**: GWP items indented `ml-8` (32px) from main item
4. **GWP Badge**: `[GWP]` purple badge before product name
5. **Background Differentiation**: GWP cards use lighter `bg-gray-50` background
6. **Item Count**: Summary shows "1 paid item + 5 gifts"

---

### Option B: Card-in-Card Nested Design

```
┌─────────────────────────────────────────────────────────────┐
│ Items (6)                             [View: Grouped ▼]     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌───────────────────────────────────────────────────────┐ │
│ │ MAIN ITEM                                              │ │
│ │ ┌─────────────────────────────────────────────────┐  │ │
│ │ │ [IMG]  Lipstick Loveshine Candy Glow            │  │ │
│ │ │        SKU: CDS26769646                         │  │ │
│ │ │        Qty: 2                    ฿1,850.00      │  │ │
│ │ └─────────────────────────────────────────────────┘  │ │
│ │                                                        │ │
│ │ GIFT WITH PURCHASE (5 items linked to this item)       │ │
│ │ ┌─────────────────────────────────────────────────┐  │ │
│ │ │ 🎁 MYSLF EAU DE PARFUM 1.2 mL    Qty: 1   ฿0   │  │ │
│ │ └─────────────────────────────────────────────────┘  │ │
│ │ ┌─────────────────────────────────────────────────┐  │ │
│ │ │ 🎁 YSL Foundation LC1 1 mL       Qty: 2   ฿0   │  │ │
│ │ └─────────────────────────────────────────────────┘  │ │
│ │ ┌─────────────────────────────────────────────────┐  │ │
│ │ │ 🎁 Libre EDP 1.2 mL              Qty: 1   ฿0   │  │ │
│ │ └─────────────────────────────────────────────────┘  │ │
│ │ ┌─────────────────────────────────────────────────┐  │ │
│ │ │ 🎁 Libre EDP 1.2 mL              Qty: 2   ฿0   │  │ │
│ │ └─────────────────────────────────────────────────┘  │ │
│ │ ┌─────────────────────────────────────────────────┐  │ │
│ │ │ 🎁 Ang Pao Packet Set            Qty: 1   ฿0   │  │ │
│ │ └─────────────────────────────────────────────────┘  │ │
│ └───────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Key Visual Elements:**
1. **Container Card**: Outer card wraps main item + all related gifts
2. **Section Labels**: "MAIN ITEM" and "GIFT WITH PURCHASE" headers
3. **Gift Icon**: 🎁 emoji prefix on all gift items
4. **Visual Containment**: Everything inside one bordered container

---

### Option C: Accordion/Collapsible Gift Section

```
┌─────────────────────────────────────────────────────────────┐
│ Items (6)                             [View: Grouped ▼]     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌───────────────────────────────────────────────────────┐ │
│ │ [IMG]  Lipstick Loveshine Candy Glow Valentines       │ │
│ │        SKU: CDS26769646                        [v]    │ │
│ │        Qty: 2                         ฿1,850.00       │ │
│ │                                                       │ │
│ │ ┌─────────────────────────────────────────────────┐  │ │
│ │ │ 🎁 Gift with Purchase (5 items)          [▼]    │  │ │
│ │ ├─────────────────────────────────────────────────┤  │ │
│ │ │ • MYSLF EAU DE PARFUM 1.2 mL        Qty: 1     │  │ │
│ │ │ • YSL Foundation LC1 1 mL           Qty: 2     │  │ │
│ │ │ • Libre EDP 1.2 mL                  Qty: 1     │  │ │
│ │ │ • Libre EDP 1.2 mL                  Qty: 2     │  │ │
│ │ │ • Ang Pao Packet Set                Qty: 1     │  │ │
│ │ └─────────────────────────────────────────────────┘  │ │
│ └───────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Collapsed State:**
```
│ ┌─────────────────────────────────────────────────────┐  │
│ │ 🎁 Gift with Purchase (5 items)          [▶]    │  │
│ └─────────────────────────────────────────────────────┘  │
```

---

## Recommended Implementation: Option A (Indented Hierarchy)

### Why Option A?
1. **Clear Visual Hierarchy**: Indentation + connector line shows parent-child relationship
2. **Consistent with Existing Specs**: Aligns with wf-f8a2d7c4-v2 GWP styling
3. **Scannable**: Users can quickly identify main vs gift items
4. **Accessible**: Works well with screen readers (proper heading levels)
5. **Mobile-Friendly**: Indentation scales well on smaller screens

---

## Detailed Wireframe: Option A Implementation

### Desktop View (>768px)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Items Tab                                                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Order Items                              [Search...]  [View: Grouped ▼]│
│  Summary: 1 paid item (฿3,700.00) + 5 free gifts                        │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                                                                    │ │
│  │  [IMG]   Lipstick Loveshine Candy Glow Valentines Limited E       │ │
│  │          ลิปสติก Loveshine Candy Glow วาเลนไทน์ ลิมิเต็ด           │ │
│  │          SKU: CDS26769646                                   [v]   │ │
│  │                                                                    │ │
│  │          Status: Allocated                                        │ │
│  │          Quantity: 2 units                                        │ │
│  │          Unit Price: ฿1,850.00                                    │ │
│  │          Subtotal: ฿3,700.00                                      │ │
│  │                                                                    │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│  │                                                                      │
│  │   ↳ Gift with Purchase (5 items)                                    │
│  │                                                                      │
│  │   ┌────────────────────────────────────────────────────────────┐   │
│  │   │ [GWP]  MYSLF EAU DE PARFUM 1.2 mL                          │   │
│  │   │        SKU: CDS10174760                                    │   │
│  │   │        Qty: 1                              Status: Allocated│   │
│  │   └────────────────────────────────────────────────────────────┘   │
│  │                                                                      │
│  │   ┌────────────────────────────────────────────────────────────┐   │
│  │   │ [GWP]  YSL All Hours Glow Foundation LC1 1 mL              │   │
│  │   │        SKU: CDS23578005                                    │   │
│  │   │        Qty: 2                              Status: Allocated│   │
│  │   └────────────────────────────────────────────────────────────┘   │
│  │                                                                      │
│  │   ┌────────────────────────────────────────────────────────────┐   │
│  │   │ [GWP]  Libre EDP 1.2 mL                                    │   │
│  │   │        SKU: CDS23619029                                    │   │
│  │   │        Qty: 1                              Status: Allocated│   │
│  │   └────────────────────────────────────────────────────────────┘   │
│  │                                                                      │
│  │   ┌────────────────────────────────────────────────────────────┐   │
│  │   │ [GWP]  Libre EDP 1.2 mL                                    │   │
│  │   │        SKU: CDS23619029                                    │   │
│  │   │        Qty: 2                              Status: Allocated│   │
│  │   └────────────────────────────────────────────────────────────┘   │
│  │                                                                      │
│  │   ┌────────────────────────────────────────────────────────────┐   │
│  │   │ [GWP]  Ang Pao Packet Set                                  │   │
│  │   │        SKU: CDS27800461                                    │   │
│  │   │        Qty: 1                              Status: Allocated│   │
│  └───└────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Mobile View (<768px)

```
┌─────────────────────────────────┐
│ Items (6)         [View: ▼]     │
│ 1 paid + 5 gifts                │
├─────────────────────────────────┤
│                                 │
│ MAIN ITEM                       │
│ ┌─────────────────────────────┐ │
│ │ Lipstick Loveshine Candy    │ │
│ │ Glow Valentines Limited E   │ │
│ │                             │ │
│ │ SKU: CDS26769646            │ │
│ │ Qty: 2    Price: ฿1,850.00  │ │
│ │ Subtotal: ฿3,700.00         │ │
│ └─────────────────────────────┘ │
│                                 │
│ ↳ Gift with Purchase (5)        │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🎁 MYSLF EAU DE PARFUM      │ │
│ │    SKU: CDS10174760         │ │
│ │    Qty: 1                   │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🎁 YSL Foundation LC1       │ │
│ │    SKU: CDS23578005         │ │
│ │    Qty: 2                   │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🎁 Libre EDP 1.2 mL         │ │
│ │    SKU: CDS23619029         │ │
│ │    Qty: 1                   │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🎁 Libre EDP 1.2 mL         │ │
│ │    SKU: CDS23619029         │ │
│ │    Qty: 2                   │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🎁 Ang Pao Packet Set       │ │
│ │    SKU: CDS27800461         │ │
│ │    Qty: 1                   │ │
│ └─────────────────────────────┘ │
│                                 │
└─────────────────────────────────┘
```

---

## Styling Specifications

### Main Item Card

```css
.main-item-card {
  @apply bg-white dark:bg-gray-800;
  @apply border border-gray-200 dark:border-gray-700;
  @apply rounded-lg shadow-sm;
  @apply p-4;
}
```

### GWP Section Header

```css
.gwp-section-header {
  @apply ml-8 my-3;
  @apply text-sm font-semibold;
  @apply text-purple-600 dark:text-purple-400;
  @apply flex items-center gap-2;
}

/* Arrow icon before text */
.gwp-section-header::before {
  content: "↳";
  @apply text-lg;
}
```

### GWP Item Card

```css
.gwp-item-card {
  @apply ml-8;  /* Indent 32px */
  @apply bg-gray-50 dark:bg-gray-900/50;
  @apply border border-gray-200 dark:border-gray-800;
  @apply rounded-md;
  @apply p-3;
  @apply mb-2;
}
```

### GWP Badge

```css
.gwp-badge {
  @apply inline-flex items-center;
  @apply px-2 py-0.5;
  @apply bg-purple-100 dark:bg-purple-900/50;
  @apply text-purple-700 dark:text-purple-300;
  @apply text-xs font-bold uppercase;
  @apply rounded-full;
  @apply mr-2;
}
```

### Connector Line (Optional Enhancement)

```css
.gwp-connector {
  @apply border-l-2 border-purple-300 dark:border-purple-700;
  @apply ml-4;
  @apply pl-4;
}
```

---

## Implementation Logic

### Grouping Algorithm

```typescript
interface GroupedItems {
  mainItem: OrderLineItem
  giftItems: OrderLineItem[]
}

function groupItemsByGWP(items: OrderLineItem[]): GroupedItems[] {
  const groups: Map<string, GroupedItems> = new Map()
  const standaloneItems: OrderLineItem[] = []

  // First pass: identify main items and gift items
  items.forEach(item => {
    if (item.giftWithPurchase && item.giftWithPurchaseItem) {
      // This is a gift item linked to a main item via SKU
      const mainSku = item.giftWithPurchaseItem

      if (!groups.has(mainSku)) {
        // Find main item by SKU
        const mainItem = items.find(i => i.sku === mainSku && !i.giftWithPurchase)
        if (mainItem) {
          groups.set(mainSku, { mainItem, giftItems: [] })
        }
      }

      const group = groups.get(mainSku)
      if (group) {
        group.giftItems.push(item)
      }
    } else if (!item.giftWithPurchase) {
      // This is a main item - check if already in a group
      if (!groups.has(item.sku)) {
        groups.set(item.sku, { mainItem: item, giftItems: [] })
      }
    }
  })

  // Convert map to array, maintaining order
  return Array.from(groups.values())
}
```

### Component Structure

```tsx
// order-detail-view.tsx - Items Tab

const GroupedItemsList = ({ items }: { items: OrderLineItem[] }) => {
  const groupedItems = useMemo(() => groupItemsByGWP(items), [items])

  return (
    <div className="space-y-6">
      {groupedItems.map((group, index) => (
        <div key={group.mainItem.lineId || index} className="item-group">
          {/* Main Item Card */}
          <MainItemCard item={group.mainItem} />

          {/* GWP Section (if has gift items) */}
          {group.giftItems.length > 0 && (
            <div className="gwp-connector">
              <div className="gwp-section-header">
                ↳ Gift with Purchase ({group.giftItems.length} items)
              </div>

              <div className="space-y-2">
                {group.giftItems.map((giftItem) => (
                  <GWPItemCard key={giftItem.lineId} item={giftItem} />
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// GWP Item Card Component
const GWPItemCard = ({ item }: { item: OrderLineItem }) => (
  <div className="gwp-item-card">
    <div className="flex items-start gap-3">
      <span className="gwp-badge">GWP</span>
      <div className="flex-1">
        <p className="font-medium text-sm">{item.productName}</p>
        <p className="text-xs text-gray-500">SKU: {item.sku}</p>
      </div>
      <div className="text-right">
        <p className="text-sm">Qty: {item.quantity}</p>
        <p className="text-xs text-gray-500">฿0.00</p>
      </div>
    </div>
  </div>
)
```

---

## View Toggle Options

Add a dropdown to switch between views:

```
[View: Grouped ▼]
  - Grouped (default)     // Main items with GWP nested
  - Flat List            // Traditional flat list
  - Gifts Only           // Filter to GWP items only
```

```tsx
const [viewMode, setViewMode] = useState<'grouped' | 'flat' | 'gifts-only'>('grouped')

// Render based on view mode
{viewMode === 'grouped' && <GroupedItemsList items={items} />}
{viewMode === 'flat' && <FlatItemsList items={items} />}
{viewMode === 'gifts-only' && <FlatItemsList items={items.filter(i => i.giftWithPurchase)} />}
```

---

## Data Model Reference

### Current Fields Used

| Field | Type | Description |
|-------|------|-------------|
| `giftWithPurchase` | `boolean \| string` | `true` if item is a gift |
| `giftWithPurchaseItem` | `string` | SKU of the main item this gift belongs to |

### Example Data Relationship

```typescript
// Main Item
{
  sku: "CDS26769646",
  productName: "Lipstick Loveshine Candy Glow",
  giftWithPurchase: false,
  giftWithPurchaseItem: undefined,
  unitPrice: 1850,
  quantity: 2
}

// Gift Items (linked to main via giftWithPurchaseItem)
{
  sku: "CDS10174760",
  productName: "MYSLF EAU DE PARFUM 1.2 mL",
  giftWithPurchase: true,
  giftWithPurchaseItem: "CDS26769646",  // Links to main item SKU
  unitPrice: 0,
  quantity: 1
},
{
  sku: "CDS23578005",
  productName: "YSL Foundation LC1 1 mL",
  giftWithPurchase: true,
  giftWithPurchaseItem: "CDS26769646",  // Same main item
  unitPrice: 0,
  quantity: 2
}
```

---

## Implementation Files

| File | Changes |
|------|---------|
| `src/components/order-detail-view.tsx` | Add grouping logic, GWP section, view toggle |
| `src/lib/order-utils.ts` | Add `groupItemsByGWP()` function |

---

## Success Criteria

1. **Visual Clarity**: Users can instantly see which gifts belong to which main item
2. **Relationship Display**: Arrow/connector clearly shows parent-child relationship
3. **Badge Identification**: `[GWP]` badge makes gift items scannable
4. **Count Summary**: Header shows "X paid items + Y gifts" summary
5. **Responsive**: Grouping works on both desktop and mobile
6. **Performance**: No impact on load time with large order items

---

## Edge Cases

### 1. Gift Item Without Main Item Reference

If `giftWithPurchaseItem` is empty but `giftWithPurchase` is true:
- Display as standalone gift item at end of list
- Show warning badge: "Unlinked Gift"

### 2. Multiple Main Items with Same SKU

If order has multiple line items with same SKU:
- Group gifts under the first occurrence
- Or split by line ID if available

### 3. Order with No Gifts

If no items have `giftWithPurchase: true`:
- Display flat list (no grouping needed)
- Hide view toggle dropdown

### 4. All Items are Gifts

If all items are gifts (no main item found):
- Display flat list with GWP badges on all
- Show warning: "No main item found for gifts"

---

## Future Enhancements

1. **Promotion Name Display**: Show promotion name (e.g., "Buy 1 Get 5 Free")
2. **Collapsible Groups**: Allow expanding/collapsing GWP sections
3. **Drag to Reorder**: Allow reordering within groups
4. **Print Packing Slip**: Include grouping in printed documents

---

**End of Wireframe Specification**
