# Wireframe Specification: Gift & GWP Features in Items Tab (Version 2 - Enhanced)

**ADW ID:** f8a2d7c4-v2-enhanced
**Feature:** Gift Information in Items Tab with Visual GWP Grouping & Tab Color Indicators
**Purpose:** Streamline warehouse gift order preparation with clear visual hierarchy and tab indicators
**Created:** 2026-02-01
**Status:** Draft
**Parent Spec:** wf-f8a2d7c4-gift-features-order-preparation.md

---

## Key Improvements from Original Version 2

### 1. Enhanced GWP Visual Hierarchy
- **Main Item:** Full card display with clear separation
- **GWP Section:** Indented with arrow `↳` and explicit "Gift with Purchase" wording
- **GWP Items:** Compact cards with lighter background (`bg-gray-50/bg-gray-900`)
- **Better Spacing:** Clear visual separation between main items and their GWP items

### 2. Items Tab Color Indicator
- **Purple/Pink Tab:** When order has gift wrap OR gift message (at least 1 item)
- **Gray Tab:** When order has no gift features
- **Purpose:** Instant visual identification of gift orders at a glance

### 3. Gift Information Location
- **Moved to Items Tab:** Gift panel appears at top of Items tab (not Overview)
- **Conditional Display:** Only shows when gift features present
- **Collapsible:** Can collapse to maximize item list space

---

## Tab Color Indicator System

### Visual Design

**Gift Order (Has Gift Features):**
```
┌─────────────────────────────────────────────────────────────┐
│ [Overview] [Items (6) 🎁] [Payments] [Fulfillment] [...]   │
│             ^^^^^^^^^                                        │
│             Purple/pink background with gift icon           │
└─────────────────────────────────────────────────────────────┘
```

**Regular Order (No Gift Features):**
```
┌─────────────────────────────────────────────────────────────┐
│ [Overview] [Items (6)] [Payments] [Fulfillment] [...]       │
│             ^^^^^^^^^                                        │
│             Gray/default background, no icon                │
└─────────────────────────────────────────────────────────────┘
```

### Tab Styling Rules

**Condition:** `hasGiftWrap === true || giftMessage !== null`

**If TRUE (Gift Order):**
```css
Items Tab {
  background: bg-purple-100 dark:bg-purple-900/30
  text: text-purple-700 dark:text-purple-300
  icon: 🎁 (after item count)
  border: border-purple-300 dark:border-purple-700
}
```

**If FALSE (Regular Order):**
```css
Items Tab {
  background: bg-gray-100 dark:bg-gray-800
  text: text-gray-700 dark:text-gray-300
  icon: none
  border: default
}
```

### Implementation Code

```typescript
const hasGiftFeatures = order.hasGiftWrap || !!order.giftMessage

<Tabs>
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger
      value="items"
      className={cn(
        "relative",
        hasGiftFeatures && [
          "bg-purple-100 dark:bg-purple-900/30",
          "text-purple-700 dark:text-purple-300",
          "border-purple-300 dark:border-purple-700"
        ]
      )}
    >
      Items ({order.lineItems.length})
      {hasGiftFeatures && <span className="ml-1">🎁</span>}
    </TabsTrigger>
    <TabsTrigger value="payments">Payments</TabsTrigger>
    {/* ... other tabs */}
  </TabsList>
</Tabs>
```

---

## Version 2A: Minimal Implementation (Quick Win)

### Scope
- Gift Information panel at top of Items tab
- Tab color indicator based on gift features
- Enhanced GWP visual hierarchy with "Gift with Purchase" wording
- Compact GWP item cards with lighter background

### Data Model Changes

```typescript
interface Order {
  // Existing fields...

  // Gift-related fields
  hasGiftWrap?: boolean
  giftMessage?: string
}

interface OrderLineItem {
  // Existing fields...

  // Promotional fields
  isGiftWithPurchase?: boolean
  promotionType?: 'FREE_GIFT' | 'BUNDLE' | 'DISCOUNT' | null
}
```

### UI Changes

#### 2A.1 Tab Bar with Color Indicator

```
┌─────────────────────────────────────────────────────────────┐
│ Order Details                                        [✕]     │
│ Order #CDS260130806823                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ [Overview] [Items (6) 🎁] [Payments] [Fulfillment] [...]   │
│             ╔═══════════╗                                    │
│             ║ PURPLE BG ║  ← Gift order indicator           │
│             ╚═══════════╝                                    │
└─────────────────────────────────────────────────────────────┘
```

**Color Coding:**
- **Purple/Pink:** `bg-purple-100 text-purple-700 border-purple-300` (light mode)
- **Purple/Pink Dark:** `dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700`
- **Gift Icon:** 🎁 appears after item count only if gift features present

#### 2A.2 Items Tab - Gift Information Panel

```
┌─────────────────────────────────────────────────────────────┐
│ Items (6) 🎁                                  [Expand All]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ 🎁 Gift Information              [Collapse ▲]      │    │
│ │                                                     │    │
│ │ Gift Wrapped    ✅ Yes                              │    │
│ │                                                     │    │
│ │ Gift Message    "Happy Birthday! Enjoy your special │    │
│ │                 day. Love, Mom"                     │    │
│ │                 [Copy Message] [Print Card]         │    │
│ │                                                     │    │
│ └─────────────────────────────────────────────────────┘    │
│                                                             │
│ Order Items                                  [Search...]    │
│ 6 items in this order                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ MAIN ITEM                                                   │
│ ┌───────────────────────────────────────────────────────┐ │
│ │ [IMG]  Lipstick Loveshine Candy Glow Valentines       │ │
│ │        ลิปสติก Loveshine Candy Glow วาเลนไทน์         │ │
│ │        SKU: CDS26769646                        [v]    │ │
│ │                                                       │ │
│ │        Qty: 2                         ฿1,850.00       │ │
│ │                                       each            │ │
│ └───────────────────────────────────────────────────────┘ │
│                                                             │
│   ↳ Gift with Purchase                                      │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐ │
│   │ [GWP] MYSLF EAU DE PARFUM 1.2 mL    Qty: 1  ฿0.00  │ │
│   │       SKU: CDS10174760                              │ │
│   └─────────────────────────────────────────────────────┘ │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐ │
│   │ [GWP] YSL All Hours Glow Foundation Qty: 2  ฿0.00  │ │
│   │       SKU: CDS23578005                              │ │
│   └─────────────────────────────────────────────────────┘ │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐ │
│   │ [GWP] Libre EDP 1.2 mL              Qty: 1  ฿0.00  │ │
│   │       SKU: CDS23619029                              │ │
│   └─────────────────────────────────────────────────────┘ │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐ │
│   │ [GWP] Libre EDP 1.2 mL              Qty: 2  ฿0.00  │ │
│   │       SKU: CDS23619029                              │ │
│   └─────────────────────────────────────────────────────┘ │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐ │
│   │ [GWP] Ang Pao Packet Set            Qty: 1  ฿0.00  │ │
│   │       SKU: CDS27800461                              │ │
│   └─────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Visual Hierarchy Styling:**

**Main Item Card:**
```css
{
  background: bg-white dark:bg-gray-800
  border: border-2 border-gray-300 dark:border-gray-700
  padding: p-4
  rounded: rounded-lg
  shadow: shadow-sm
}
```

**GWP Section Header:**
```
↳ Gift with Purchase
```
```css
{
  margin-left: ml-8 (indent 32px)
  color: text-purple-600 dark:text-purple-400
  font: text-sm font-semibold
  icon: ↳ (arrow showing relationship)
}
```

**GWP Item Compact Card:**
```css
{
  background: bg-gray-50 dark:bg-gray-900/50
  border: border border-gray-200 dark:border-gray-800
  padding: p-3 (less than main item)
  margin-left: ml-8 (indent to match header)
  rounded: rounded-md
  shadow: none (flat appearance)
  height: h-auto (compact)
}
```

**GWP Badge:**
```css
{
  background: bg-purple-100 dark:bg-purple-900
  text: text-purple-700 dark:text-purple-300
  border: border-purple-300 dark:border-purple-700
  font: text-xs font-bold uppercase
  padding: px-2 py-0.5
  rounded: rounded-full
}
```

#### 2A.3 Empty State (No Gift Features)

**Tab Appearance:**
```
[Items (6)]  ← Gray background, no icon
```

**Items Tab Content:**
```
┌─────────────────────────────────────────────────────────────┐
│ Items (3)                                     [Expand All]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Order Items                                  [Search...]    │
│ 3 items in this order                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌───────────────────────────────────────────────────────┐ │
│ │ [IMG]  Premium Skincare Set                           │ │
│ │        SKU: ABC123                            [v]     │ │
│ │        Qty: 1                         ฿2,500.00       │ │
│ │                                       each            │ │
│ └───────────────────────────────────────────────────────┘ │
│                                                             │
│   ↳ Gift with Purchase                                      │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐ │
│   │ [GWP] Free Sample Kit               Qty: 1  ฿0.00  │ │
│   │       SKU: XYZ789                                   │ │
│   └─────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Note:** No Gift Information panel shows (order has GWP items but no gift wrap/message)

### Implementation Complexity
- **Effort:** Low (3-5 hours)
- **Files Changed:** 2 files
  - `src/types/order.ts` - Add optional gift fields
  - `src/components/order-detail-view.tsx` - Tab indicator + gift panel + GWP styling
- **Risk:** Low - purely additive UI changes

---

## Version 2B: Enhanced with Item Counts & Relationships

### Scope
- Everything from Version 2A
- Enhanced gift panel with item counts
- Show which specific items need gift wrapping
- Promotion name/details
- Summary statistics

### Data Model Changes

```typescript
interface Order {
  // V2A fields...
  hasGiftWrap?: boolean
  giftMessage?: string

  // V2B new fields
  giftWrappedItemIds?: string[]  // Array of lineId that need wrapping
}

interface OrderLineItem {
  // V2A fields...
  isGiftWithPurchase?: boolean
  promotionType?: 'FREE_GIFT' | 'BUNDLE' | 'DISCOUNT' | null

  // V2B new fields
  gwpQualifyingItemId?: string   // Links GWP to main item
  gwpPromotionName?: string      // e.g., "YSL Valentine's - Buy 1 Get 5"
}
```

### UI Changes

#### 2B.1 Tab Bar (Same as 2A)

```
[Overview] [Items (6) 🎁] [Payments] [Fulfillment] [Tracking]
            ╔═══════════╗
            ║ PURPLE BG ║  ← Indicates gift features present
            ╚═══════════╝
```

#### 2B.2 Enhanced Gift Information Panel

```
┌─────────────────────────────────────────────────────────────┐
│ Items (6) 🎁                                  [Expand All]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ 🎁 Gift Information              [Collapse ▲]      │    │
│ │                                                     │    │
│ │ Gift Wrapped    ✅ Yes (2 items to wrap)            │    │
│ │ Items to wrap:  • Lipstick Loveshine Candy Glow    │    │
│ │                 • YSL All Hours Glow Foundation     │    │
│ │                                                     │    │
│ │ Gift Message    "Happy Birthday! Enjoy your special │    │
│ │                 day. Love, Mom"                     │    │
│ │                 [Copy Message] [Print Card]         │    │
│ │                                                     │    │
│ │ Free Gifts      5 promotional items included        │    │
│ │                 (See items marked [GWP] below)      │    │
│ │                                                     │    │
│ └─────────────────────────────────────────────────────┘    │
│                                                             │
│ Order Items                    [Search...] [View: Grouped ▼]│
│ 6 items (1 paid + 5 free gifts)                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 🎁 MAIN ITEM - GIFT WRAPPED                                │
│ ┌───────────────────────────────────────────────────────┐ │
│ │ [IMG]  Lipstick Loveshine Candy Glow Valentines       │ │
│ │        ลิปสติก Loveshine Candy Glow วาเลนไทน์         │ │
│ │        SKU: CDS26769646                        [v]    │ │
│ │                                                       │ │
│ │        🎁 Needs Gift Wrap                             │ │
│ │        Qty: 2                         ฿1,850.00       │ │
│ │                                       each            │ │
│ └───────────────────────────────────────────────────────┘ │
│                                                             │
│   ↳ Gift with Purchase (5 items)                            │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐ │
│   │ [GWP] MYSLF EAU DE PARFUM 1.2 mL    Qty: 1  ฿0.00  │ │
│   │       SKU: CDS10174760                              │ │
│   └─────────────────────────────────────────────────────┘ │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐ │
│   │ [GWP] YSL All Hours Glow Foundation Qty: 2  ฿0.00  │ │
│   │       SKU: CDS23578005                              │ │
│   │       🎁 Needs Gift Wrap                            │ │
│   └─────────────────────────────────────────────────────┘ │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐ │
│   │ [GWP] Libre EDP 1.2 mL              Qty: 1  ฿0.00  │ │
│   │       SKU: CDS23619029                              │ │
│   └─────────────────────────────────────────────────────┘ │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐ │
│   │ [GWP] Libre EDP 1.2 mL              Qty: 2  ฿0.00  │ │
│   │       SKU: CDS23619029                              │ │
│   └─────────────────────────────────────────────────────┘ │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐ │
│   │ [GWP] Ang Pao Packet Set            Qty: 1  ฿0.00  │ │
│   │       SKU: CDS27800461                              │ │
│   └─────────────────────────────────────────────────────┘ │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐ │
│   │ 💡 Promotion: "YSL Valentine's Special"            │ │
│   │    Buy 1 Lipstick, Get 5 Free Gifts                │ │
│   │    All free gifts must be packed with main item    │ │
│   └─────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Enhanced Elements:**

**Gift Wrap Indicator on Items:**
```
🎁 Needs Gift Wrap
```
```css
{
  background: bg-purple-50 dark:bg-purple-950/30
  text: text-purple-700 dark:text-purple-300
  font: text-sm font-medium
  padding: px-2 py-1
  rounded: rounded-md
  border-left: border-l-4 border-purple-500
}
```

**Promotion Banner:**
```css
{
  background: bg-purple-50 dark:bg-purple-950/20
  border: border border-purple-200 dark:border-purple-800
  padding: p-3
  margin-left: ml-8 (indent with GWP items)
  rounded: rounded-md
  icon: 💡 (before text)
  font-title: font-semibold text-purple-700 dark:text-purple-300
  font-desc: text-sm text-gray-600 dark:text-gray-400
}
```

**GWP Section Header with Count:**
```
↳ Gift with Purchase (5 items)
```
```css
{
  margin-left: ml-8
  color: text-purple-600 dark:text-purple-400
  font: text-sm font-semibold
  count: text-gray-500 (lighter than main text)
}
```

#### 2B.3 View Dropdown Options

**Add [View: ...] dropdown next to search:**

```
[View: Grouped ▼]
```

**Options:**
- **Grouped** (default) - GWP items grouped under qualifying items
- **Flat List** - All items in simple list
- **Gift Items Only** - Filter to items needing gift wrap
- **Free Gifts Only** - Filter to GWP items only

**View Switching Logic:**

```typescript
const [viewMode, setViewMode] = useState<'grouped' | 'flat' | 'gift-only' | 'gwp-only'>('grouped')

const filteredItems = useMemo(() => {
  switch (viewMode) {
    case 'grouped':
      return groupItemsByGWP(order.lineItems)
    case 'flat':
      return order.lineItems
    case 'gift-only':
      return order.lineItems.filter(item =>
        order.giftWrappedItemIds?.includes(item.lineId)
      )
    case 'gwp-only':
      return order.lineItems.filter(item => item.isGiftWithPurchase)
    default:
      return order.lineItems
  }
}, [order.lineItems, viewMode])
```

### Implementation Complexity
- **Effort:** Medium (8-12 hours)
- **Files Changed:** 4 files
  - `src/types/order.ts` - Add relationship fields
  - `src/components/order-detail-view.tsx` - Enhanced panel + view switching
  - `src/lib/mock-data.ts` - Add sample relationships
  - `src/lib/order-utils.ts` - Grouping helper functions
- **Risk:** Medium - requires grouping logic and state management

---

## Version 2C: Full Featured with Interactive Checklist

### Scope
- Everything from Version 2A & 2B
- Interactive packing checklist in gift panel
- Step-by-step packing view
- Progress tracking
- Print-ready packing slip
- Special instructions

### Data Model Changes

```typescript
interface Order {
  // V2A & V2B fields...
  hasGiftWrap?: boolean
  giftMessage?: string
  giftWrappedItemIds?: string[]

  // V2C new fields
  giftWrapType?: 'STANDARD' | 'PREMIUM' | 'LUXURY'
  giftCardRequired?: boolean
  giftReceipt?: boolean  // Hide prices on receipt
  specialInstructions?: string
}

interface OrderLineItem {
  // V2A & V2B fields...
  isGiftWithPurchase?: boolean
  promotionType?: 'FREE_GIFT' | 'BUNDLE' | 'DISCOUNT' | null
  gwpQualifyingItemId?: string
  gwpPromotionName?: string

  // V2C new fields
  packingPriority?: number  // 1 = pack first, higher = later
  requiresSpecialHandling?: boolean
}

interface PackingChecklist {
  orderId: string
  checklistItems: {
    id: string
    description: string
    itemIds: string[]
    completed: boolean
    completedAt?: Date
    completedBy?: string
  }[]
  progress: {
    completed: number
    total: number
    percentage: number
  }
}
```

### UI Changes

#### 2C.1 Tab Bar with Enhanced Indicator

```
┌─────────────────────────────────────────────────────────────┐
│ Order Details                   [Print Packing Slip] [✕]    │
│ Order #CDS260130806823                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ [Overview] [Items (6) 🎁] [Payments] [Fulfillment] [...]   │
│             ╔═══════════╗                                    │
│             ║ PURPLE BG ║  ← Gift order with checklist      │
│             ║ + badge   ║                                    │
│             ╚═══════════╝                                    │
└─────────────────────────────────────────────────────────────┘
```

**Progress Badge on Tab:**
```
Items (6) 🎁 [3/8]
          └── Progress indicator
```

#### 2C.2 Gift Information Panel with Checklist

```
┌─────────────────────────────────────────────────────────────┐
│ Items (6) 🎁 [3/8]               [Print Slip] [Expand All]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ 🎁 Gift Preparation Checklist    [Collapse ▲]      │    │
│ │                                                     │    │
│ │ Gift Wrapped    ✅ Yes - Premium Wrapping           │    │
│ │                 🎀 2 items need wrapping            │    │
│ │                                                     │    │
│ │ Gift Message    "Happy Birthday! Enjoy your special │    │
│ │                 day. Love, Mom"                     │    │
│ │                 [Copy Message] [Print Card]         │    │
│ │                                                     │    │
│ │ Gift Receipt    ✅ Yes (prices hidden)              │    │
│ │                                                     │    │
│ │ Special Notes   "Please use floral wrapping paper.  │    │
│ │                 Include birthday card."             │    │
│ │                                                     │    │
│ │ Free Gifts      5 promotional items included        │    │
│ │                                                     │    │
│ │ ┌───────────────────────────────────────────────┐  │    │
│ │ │ 📋 Packing Steps          Progress: 3/8 (38%) │  │    │
│ │ │ ▓▓▓▓▓░░░░░░░░░░░                              │  │    │
│ │ │                                               │  │    │
│ │ │ ✅ 1. Pick main item (Lipstick x2)            │  │    │
│ │ │    Completed at 10:23 AM by User123          │  │    │
│ │ │                                               │  │    │
│ │ │ ✅ 2. Pick all 5 free gifts                   │  │    │
│ │ │    Completed at 10:25 AM by User123          │  │    │
│ │ │                                               │  │    │
│ │ │ ✅ 3. Prepare premium gift wrap materials     │  │    │
│ │ │    Completed at 10:27 AM by User456          │  │    │
│ │ │                                               │  │    │
│ │ │ ☐ 4. Wrap 2 Lipstick items with floral paper │  │    │
│ │ │    [Mark Complete]                            │  │    │
│ │ │                                               │  │    │
│ │ │ ☐ 5. Print gift message card                 │  │    │
│ │ │    [Mark Complete]                            │  │    │
│ │ │                                               │  │    │
│ │ │ ☐ 6. Pack all GWP items with main item       │  │    │
│ │ │    [Mark Complete]                            │  │    │
│ │ │                                               │  │    │
│ │ │ ☐ 7. Include gift receipt (no prices)        │  │    │
│ │ │    [Mark Complete]                            │  │    │
│ │ │                                               │  │    │
│ │ │ ☐ 8. Final quality check                     │  │    │
│ │ │    [Mark Complete]                            │  │    │
│ │ │                                               │  │    │
│ │ │ [Mark All Complete] [Reset Checklist]         │  │    │
│ │ └───────────────────────────────────────────────┘  │    │
│ │                                                     │    │
│ │ ⏱️ Estimated Prep Time: +15 minutes                 │    │
│ │                                                     │    │
│ └─────────────────────────────────────────────────────┘    │
│                                                             │
│ Order Items        [Search...] [View: Packing Steps ▼]     │
│ 6 items (1 paid + 5 free gifts) • 2 need gift wrap         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ STEP 1: PICK MAIN ITEM                              ✅      │
│ ┌───────────────────────────────────────────────────────┐ │
│ │ [IMG]  Lipstick Loveshine Candy Glow Valentines       │ │
│ │        ลิปสติก Loveshine Candy Glow วาเลนไทน์         │ │
│ │        SKU: CDS26769646                        [v]    │ │
│ │                                                       │ │
│ │        🎁 NEEDS PREMIUM GIFT WRAP                     │ │
│ │        📦 Picked: 10:23 AM by User123                 │ │
│ │        Qty: 2                         ฿1,850.00       │ │
│ │                                       each            │ │
│ └───────────────────────────────────────────────────────┘ │
│                                                             │
│ STEP 2: PICK FREE GIFTS                             ✅      │
│                                                             │
│   ↳ Gift with Purchase (5 items)                            │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐ │
│   │ [GWP] MYSLF EAU DE PARFUM 1.2 mL    Qty: 1  ฿0.00  │ │
│   │       SKU: CDS10174760                              │ │
│   │       📦 Picked: 10:25 AM                           │ │
│   └─────────────────────────────────────────────────────┘ │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐ │
│   │ [GWP] YSL All Hours Glow Foundation Qty: 2  ฿0.00  │ │
│   │       SKU: CDS23578005                              │ │
│   │       📦 Picked: 10:25 AM                           │ │
│   └─────────────────────────────────────────────────────┘ │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐ │
│   │ [GWP] Libre EDP 1.2 mL              Qty: 1  ฿0.00  │ │
│   │       SKU: CDS23619029                              │ │
│   │       📦 Picked: 10:25 AM                           │ │
│   └─────────────────────────────────────────────────────┘ │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐ │
│   │ [GWP] Libre EDP 1.2 mL              Qty: 2  ฿0.00  │ │
│   │       SKU: CDS23619029                              │ │
│   │       📦 Picked: 10:25 AM                           │ │
│   └─────────────────────────────────────────────────────┘ │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐ │
│   │ [GWP] Ang Pao Packet Set            Qty: 1  ฿0.00  │ │
│   │       SKU: CDS27800461                              │ │
│   │       📦 Picked: 10:25 AM                           │ │
│   └─────────────────────────────────────────────────────┘ │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐ │
│   │ 💡 Promotion: "YSL Valentine's Special"            │ │
│   │    Buy 1 Lipstick, Get 5 Free Gifts                │ │
│   │    All free gifts must be packed with main item    │ │
│   └─────────────────────────────────────────────────────┘ │
│                                                             │
│ ─────────────────────────────────────────────────────────  │
│                                                             │
│ STEP 3: PREPARE WRAPPING MATERIALS                 ✅      │
│ • Premium wrapping paper (floral pattern)                   │
│ • Gift message card stock                                   │
│ • Ribbon and decorative elements                            │
│ ✅ Prepared: 10:27 AM by User456                            │
│                                                             │
│ ─────────────────────────────────────────────────────────  │
│                                                             │
│ STEP 4: GIFT WRAPPING                              ☐       │
│ • Wrap 2 Lipstick items individually with floral paper      │
│ • Ensure wrapping is neat and presentable                   │
│ [Mark Step 4 Complete]                                      │
│                                                             │
│ ─────────────────────────────────────────────────────────  │
│                                                             │
│ STEPS 5-8: REMAINING TASKS                                  │
│ ☐ Print gift message card                                   │
│ ☐ Pack all GWP items with main item                         │
│ ☐ Include gift receipt (no prices)                          │
│ ☐ Final quality check                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**View Dropdown Options (Enhanced):**

```
[View: Packing Steps ▼]
```

**Options:**
- **Packing Steps** - Numbered steps with completion status
- **Grouped** - GWP items grouped under qualifying items
- **Flat List** - All items in simple list
- **Gift Items Only** - Filter to gift-wrapped items
- **Free Gifts Only** - Filter to GWP items only

**Styling for Completed Steps:**

```css
/* Completed checklist item */
.checklist-item-completed {
  background: bg-green-50 dark:bg-green-950/20
  border-left: border-l-4 border-green-500
  text-decoration: line-through (for description)
  opacity: 0.7
}

/* Picked item indicator */
.item-picked {
  background: bg-green-50 dark:bg-green-950/30
  text: text-green-700 dark:text-green-300
  icon: 📦 (before text)
  font: text-xs
}

/* Step header completed */
.step-header-completed {
  color: text-green-600 dark:text-green-400
  icon: ✅ (checkmark)
}

/* Step header pending */
.step-header-pending {
  color: text-gray-600 dark:text-gray-400
  icon: ☐ (empty checkbox)
}
```

#### 2C.3 Print Packing Slip

**New button in header: [Print Packing Slip]**

**Packing Slip Layout (Print View):**

```
═══════════════════════════════════════════════════════════════
                    CENTRAL GROUP OMS
                   GIFT ORDER PACKING SLIP
═══════════════════════════════════════════════════════════════

Order: CDS260130806823                  Date: 30/01/2026 07:17
Customer: สุทิศา ทับเอี่ยม              Channel: Web
Status: In Progress (3/8 steps complete)

⚠️  SPECIAL HANDLING REQUIRED - GIFT ORDER

───────────────────────────────────────────────────────────────
🎁 GIFT PREPARATION REQUIREMENTS
───────────────────────────────────────────────────────────────

Gift Wrapping:   ✅ YES - Premium Wrapping with Floral Paper
Gift Message:    "Happy Birthday! Enjoy your special day.
                 Love, Mom"
Gift Receipt:    ✅ YES (Hide all prices)
Special Notes:   Please use floral wrapping paper.
                 Include birthday card.
Free Gifts:      5 promotional items (pack with main item)

───────────────────────────────────────────────────────────────
STEP 1: PICK MAIN ITEM
───────────────────────────────────────────────────────────────

  ✅ Lipstick Loveshine Candy Glow Valentines Limited E
     SKU: CDS26769646
     Qty: 2 units
     🎁 PREMIUM GIFT WRAP REQUIRED
     📦 Picked: 10:23 AM by User123

───────────────────────────────────────────────────────────────
STEP 2: PICK FREE GIFT ITEMS (PACK WITH MAIN ITEM)
───────────────────────────────────────────────────────────────

  ✅ MYSLF EAU DE PARFUM 1.2 mL (x1)
     SKU: CDS10174760
     📦 Picked: 10:25 AM by User123

  ✅ YSL All Hours Glow Foundation LC1 1 mL (x2)
     SKU: CDS23578005
     📦 Picked: 10:25 AM by User123

  ✅ Libre EDP 1.2 mL (x1)
     SKU: CDS23619029
     📦 Picked: 10:25 AM by User123

  ✅ Libre EDP 1.2 mL (x2)
     SKU: CDS23619029
     📦 Picked: 10:25 AM by User123

  ✅ Ang Pao Packet Set (x1)
     SKU: CDS27800461
     📦 Picked: 10:25 AM by User123

  💡 Promotion: "YSL Valentine's Special - Buy 1 Get 5"
     All free gifts must be packed together with Lipstick

───────────────────────────────────────────────────────────────
STEP 3: PREPARE WRAPPING MATERIALS
───────────────────────────────────────────────────────────────

✅ Prepare premium gift wrapping materials
   📦 Prepared: 10:27 AM by User456
   - Floral wrapping paper
   - Gift message card stock
   - Ribbon and decorative elements

───────────────────────────────────────────────────────────────
STEP 4: GIFT WRAPPING
───────────────────────────────────────────────────────────────

☐ Wrap 2 Lipstick items individually
☐ Use FLORAL wrapping paper (per customer request)
☐ Ensure wrapping is neat and presentable

───────────────────────────────────────────────────────────────
STEP 5: PRINT GIFT MESSAGE
───────────────────────────────────────────────────────────────

☐ Print gift message on card:
  "Happy Birthday! Enjoy your special day. Love, Mom"
☐ Include birthday card (per special instructions)

───────────────────────────────────────────────────────────────
STEP 6: PACK ITEMS
───────────────────────────────────────────────────────────────

☐ Pack wrapped Lipstick with all 5 free gifts together
☐ Ensure all items are secure and protected

───────────────────────────────────────────────────────────────
STEP 7: INCLUDE GIFT RECEIPT
───────────────────────────────────────────────────────────────

☐ Print GIFT RECEIPT (no prices shown)
☐ Include in package

───────────────────────────────────────────────────────────────
STEP 8: FINAL QUALITY CHECK
───────────────────────────────────────────────────────────────

☐ Verify all items included (1 main + 5 GWP)
☐ Verify gift wrap quality
☐ Verify gift message card included
☐ Verify gift receipt included
☐ Verify special instructions followed

───────────────────────────────────────────────────────────────
DELIVERY INFORMATION
───────────────────────────────────────────────────────────────

Recipient: สุทิศา ทับเอี่ยม
Phone: 0855500085
Address: 98/242 หมู่บ้านคาซ่าวิลล์ 2 ซ.15/2
         ถ.ราชพฤกษ์-รัตนาธิเบศร์
District: ท่าอิฐ
City: ปากเกร็ด, 11120

Courier: Flash Express
Tracking: FEX0842601001855

───────────────────────────────────────────────────────────────

Progress: 3/8 steps complete (38%)
Estimated Completion Time: +12 minutes remaining

Packed By: ________________    Date: _______________

Quality Check: ____________    Date: _______________

═══════════════════════════════════════════════════════════════
```

### Implementation Complexity
- **Effort:** High (20-30 hours)
- **Files Changed:** 10+ files
  - `src/types/order.ts` - Add all V2C fields
  - `src/types/packing.ts` - New packing checklist types
  - `src/components/order-detail-view.tsx` - Tab indicator + enhanced Items tab
  - `src/components/order-detail/gift-checklist-panel.tsx` - New checklist component
  - `src/components/order-detail/packing-slip-print.tsx` - New print component
  - `src/lib/mock-data.ts` - Add V2C sample data with checklist
  - `src/lib/order-utils.ts` - Grouping and sorting logic
  - `src/lib/packing-utils.ts` - New packing checklist utilities
  - `src/hooks/use-packing-checklist.ts` - State management hook
  - `src/styles/print.css` - Print-specific styles
- **Risk:** High - complex state, progress tracking, multi-user considerations

---

## Comparison Matrix: All Versions

| Feature | V2A (Minimal) | V2B (Enhanced) | V2C (Full) |
|---------|---------------|----------------|------------|
| **Tab Color Indicator** | ✅ Purple if gift | ✅ Purple if gift | ✅ Purple + progress badge |
| **Gift Panel in Items** | ✅ Basic display | ✅ With item lists | ✅ With checklist |
| **"Gift with Purchase" Wording** | ✅ Arrow + text | ✅ Arrow + text + count | ✅ Arrow + text + count |
| **GWP Compact Cards** | ✅ Lighter bg | ✅ Lighter bg | ✅ Lighter bg + picked status |
| **Visual Hierarchy** | ✅ Indented | ✅ Indented | ✅ Indented + numbered steps |
| **Item Counts** | ❌ Basic count | ✅ Detailed counts | ✅ Detailed + picked counts |
| **Gift Wrap Indicators** | ❌ Panel only | ✅ On items | ✅ On items + checklist |
| **Promotion Details** | ❌ Not shown | ✅ Promotion banner | ✅ Banner + checklist |
| **View Options** | 1 (grouped) | 4 options | 5 options |
| **Interactive Checklist** | ❌ None | ❌ None | ✅ Full interactive |
| **Progress Tracking** | ❌ None | ❌ None | ✅ Real-time with timestamps |
| **Print Packing Slip** | ❌ None | ❌ None | ✅ Print-optimized |
| **Special Instructions** | ❌ Not shown | ❌ Not shown | ✅ Displayed |
| **Picked Status** | ❌ Not tracked | ❌ Not tracked | ✅ With user + time |
| **Implementation Time** | 3-5 hours | 8-12 hours | 20-30 hours |
| **Files Changed** | 2 files | 4 files | 10+ files |
| **Risk Level** | Low | Medium | High |

---

## Key Visual Design Standards

### Tab Color System

```typescript
// Gift order detection
const hasGiftFeatures = order.hasGiftWrap || !!order.giftMessage

// Tab styling
<TabsTrigger
  value="items"
  className={cn(
    hasGiftFeatures && [
      "bg-purple-100 dark:bg-purple-900/30",
      "text-purple-700 dark:text-purple-300",
      "border-purple-300 dark:border-purple-700",
      "font-semibold"
    ]
  )}
>
  Items ({order.lineItems.length})
  {hasGiftFeatures && <span className="ml-1">🎁</span>}
  {checklist && (
    <span className="ml-1 text-xs">
      [{checklist.progress.completed}/{checklist.progress.total}]
    </span>
  )}
</TabsTrigger>
```

### GWP Visual Hierarchy

**1. Main Item Card:**
```css
.main-item-card {
  @apply bg-white dark:bg-gray-800;
  @apply border-2 border-gray-300 dark:border-gray-700;
  @apply p-4 rounded-lg shadow-sm;
  @apply mb-4;
}
```

**2. GWP Section Header:**
```css
.gwp-section-header {
  @apply ml-8 mb-2;
  @apply text-sm font-semibold;
  @apply text-purple-600 dark:text-purple-400;
  @apply flex items-center gap-2;
}

.gwp-section-header::before {
  content: "↳";
  @apply text-purple-500;
}
```

**3. GWP Compact Card:**
```css
.gwp-item-card {
  @apply bg-gray-50 dark:bg-gray-900/50;
  @apply border border-gray-200 dark:border-gray-800;
  @apply p-3 rounded-md;
  @apply ml-8 mb-2;
  @apply flex items-center justify-between;
}
```

**4. GWP Badge:**
```css
.gwp-badge {
  @apply bg-purple-100 dark:bg-purple-900;
  @apply text-purple-700 dark:text-purple-300;
  @apply border border-purple-300 dark:border-purple-700;
  @apply text-xs font-bold uppercase;
  @apply px-2 py-0.5 rounded-full;
}
```

### Spacing Standards

```css
/* Indentation for GWP items */
.gwp-indent {
  @apply ml-8;  /* 32px left margin */
}

/* Spacing between main item and GWP section */
.item-gwp-gap {
  @apply mt-3 mb-4;
}

/* Spacing between GWP items */
.gwp-item-gap {
  @apply mb-2;
}

/* Promotion banner spacing */
.promotion-banner {
  @apply mt-3 ml-8;
}
```

---

## Success Metrics

### Version 2A
- ✅ 100% of gift orders identifiable by purple tab at a glance
- ✅ "Gift with Purchase" wording clear to warehouse staff
- ✅ GWP items visually distinct from main items
- ✅ Zero confusion about which items are free vs paid

### Version 2B
- ✅ 90%+ staff understand gift wrap requirements without training
- ✅ 50% reduction in "forgot to include GWP item" errors
- ✅ Tab color indicator noticed within 1 second
- ✅ Item counts in gift panel match actual items

### Version 2C
- ✅ 80%+ staff use packing checklist feature
- ✅ Average gift order prep time reduced by 25%
- ✅ Zero missing gift message incidents
- ✅ 90%+ checklist completion rate
- ✅ Progress tracking improves multi-shift handoffs

---

## Implementation Notes

### Component Structure

```typescript
// Version 2A - Minimal
<Tabs value={activeTab}>
  <TabsList>
    <TabsTrigger
      value="items"
      className={hasGiftFeatures && giftTabStyles}
    >
      Items ({itemCount}) {hasGiftFeatures && '🎁'}
    </TabsTrigger>
  </TabsList>

  <TabsContent value="items">
    {hasGiftFeatures && (
      <GiftInfoPanel collapsible>
        <GiftWrapInfo />
        <GiftMessageDisplay />
      </GiftInfoPanel>
    )}

    <ItemsList>
      {groupedItems.map(group => (
        <>
          <MainItemCard item={group.main} />
          {group.gwpItems.length > 0 && (
            <GWPSection header="↳ Gift with Purchase">
              {group.gwpItems.map(gwp => (
                <GWPCompactCard item={gwp} />
              ))}
            </GWPSection>
          )}
        </>
      ))}
    </ItemsList>
  </TabsContent>
</Tabs>

// Version 2B - Enhanced
// ... (adds view switching, counts, promotion banners)

// Version 2C - Full
// ... (adds interactive checklist, progress tracking, print)
```

### State Management

**Version 2A:**
```typescript
const [isPanelCollapsed, setIsPanelCollapsed] = useState(false)
const hasGiftFeatures = order.hasGiftWrap || !!order.giftMessage
```

**Version 2B:**
```typescript
const [viewMode, setViewMode] = useState<ViewMode>('grouped')
const groupedItems = useMemo(() =>
  groupItemsByGWP(order.lineItems),
  [order.lineItems]
)
```

**Version 2C:**
```typescript
const {
  checklist,
  progress,
  markStepComplete,
  resetChecklist
} = usePackingChecklist(order.id)

const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())

// Persist to localStorage
useEffect(() => {
  localStorage.setItem(
    `checklist-${order.id}`,
    JSON.stringify(checklist)
  )
}, [checklist, order.id])
```

---

## Files to Create/Modify

### Version 2A Files
```
src/types/order.ts                              (modify - add gift fields)
src/components/order-detail-view.tsx            (modify - tab indicator + gift panel)
src/lib/mock-data.ts                            (modify - add gift sample data)
```

### Version 2B Additional Files
```
src/lib/order-utils.ts                          (modify - grouping logic)
src/components/order-detail/gift-info-panel.tsx (new - extracted component)
src/components/order-detail/gwp-section.tsx     (new - GWP grouping component)
```

### Version 2C Additional Files
```
src/types/packing.ts                            (new - checklist types)
src/components/order-detail/gift-checklist-panel.tsx    (new)
src/components/order-detail/packing-slip-print.tsx      (new)
src/lib/packing-utils.ts                        (new - utilities)
src/hooks/use-packing-checklist.ts              (new - state hook)
src/styles/print.css                            (new - print styles)
```

---

## Sample Data

### Version 2A Sample
```typescript
{
  orderId: "CDS260130806823",
  hasGiftWrap: true,
  giftMessage: "Happy Birthday! Enjoy your special day. Love, Mom",
  lineItems: [
    {
      lineId: "LINE-CDS26080-005",
      productName: "Lipstick Loveshine Candy Glow Valentines Limited E",
      thaiName: "ลิปสติก Loveshine Candy Glow วาเลนไทน์ ลิมิเต็ด",
      sku: "CDS26769646",
      isGiftWithPurchase: false,
      unitPrice: 1850,
      quantity: 2
    },
    {
      lineId: "LINE-CDS26080-001",
      productName: "GET FREE - MYSLF EAU DE PARFUM 1.2 mL",
      thaiName: "ของแถม - MYSLF EAU DE PARFUM 1.2 มล.",
      sku: "CDS10174760",
      isGiftWithPurchase: true,
      promotionType: "FREE_GIFT",
      unitPrice: 0,
      quantity: 1
    },
    {
      lineId: "LINE-CDS26080-002",
      productName: "GET FREE - YSL All Hours Glow Foundation LC1 1 mL",
      thaiName: "ของแถม - YSL All Hours Glow Foundation LC1 1 มล.",
      sku: "CDS23578005",
      isGiftWithPurchase: true,
      promotionType: "FREE_GIFT",
      unitPrice: 0,
      quantity: 2
    },
    {
      lineId: "LINE-CDS26080-003",
      productName: "GET FREE - Libre EDP 1.2 mL",
      thaiName: "ของแถม - Libre EDP 1.2 มล.",
      sku: "CDS23619029",
      isGiftWithPurchase: true,
      promotionType: "FREE_GIFT",
      unitPrice: 0,
      quantity: 1
    },
    {
      lineId: "LINE-CDS26080-004",
      productName: "GET FREE - Libre EDP 1.2 mL",
      thaiName: "ของแถม - Libre EDP 1.2 มล.",
      sku: "CDS23619029",
      isGiftWithPurchase: true,
      promotionType: "FREE_GIFT",
      unitPrice: 0,
      quantity: 2
    },
    {
      lineId: "LINE-CDS26080-006",
      productName: "GET FREE - Ang Pao Packet Set",
      thaiName: "ของแถม - ชุดซองอังเปา",
      sku: "CDS27800461",
      isGiftWithPurchase: true,
      promotionType: "FREE_GIFT",
      unitPrice: 0,
      quantity: 1
    }
  ]
}
```

### Version 2B Sample with Relationships
```typescript
{
  orderId: "CDS260130806823",
  hasGiftWrap: true,
  giftMessage: "Happy Birthday! Enjoy your special day. Love, Mom",
  giftWrappedItemIds: ["LINE-CDS26080-005", "LINE-CDS26080-002"],
  lineItems: [
    {
      lineId: "LINE-CDS26080-005",
      productName: "Lipstick Loveshine Candy Glow Valentines Limited E",
      isGiftWithPurchase: false,
      unitPrice: 1850,
      quantity: 2
    },
    {
      lineId: "LINE-CDS26080-001",
      productName: "GET FREE - MYSLF EAU DE PARFUM 1.2 mL",
      isGiftWithPurchase: true,
      promotionType: "FREE_GIFT",
      gwpQualifyingItemId: "LINE-CDS26080-005",
      gwpPromotionName: "YSL Valentine's Special - Buy 1 Get 5",
      unitPrice: 0,
      quantity: 1
    },
    {
      lineId: "LINE-CDS26080-002",
      productName: "GET FREE - YSL All Hours Glow Foundation LC1 1 mL",
      isGiftWithPurchase: true,
      promotionType: "FREE_GIFT",
      gwpQualifyingItemId: "LINE-CDS26080-005",
      gwpPromotionName: "YSL Valentine's Special - Buy 1 Get 5",
      unitPrice: 0,
      quantity: 2
    }
    // ... other GWP items
  ]
}
```

### Version 2C Full Sample
```typescript
{
  orderId: "CDS260130806823",
  hasGiftWrap: true,
  giftMessage: "Happy Birthday! Enjoy your special day. Love, Mom",
  giftWrappedItemIds: ["LINE-CDS26080-005", "LINE-CDS26080-002"],
  giftWrapType: "PREMIUM",
  giftCardRequired: true,
  giftReceipt: true,
  specialInstructions: "Please use floral wrapping paper. Include birthday card.",
  lineItems: [
    {
      lineId: "LINE-CDS26080-005",
      productName: "Lipstick Loveshine Candy Glow Valentines Limited E",
      isGiftWithPurchase: false,
      unitPrice: 1850,
      quantity: 2,
      packingPriority: 1
    },
    {
      lineId: "LINE-CDS26080-001",
      productName: "GET FREE - MYSLF EAU DE PARFUM 1.2 mL",
      isGiftWithPurchase: true,
      promotionType: "FREE_GIFT",
      gwpQualifyingItemId: "LINE-CDS26080-005",
      gwpPromotionName: "YSL Valentine's Special - Buy 1 Get 5",
      unitPrice: 0,
      quantity: 1,
      packingPriority: 2
    }
    // ... other items
  ],
  packingChecklist: {
    orderId: "CDS260130806823",
    checklistItems: [
      {
        id: "pick-main",
        description: "Pick main item (Lipstick x2)",
        itemIds: ["LINE-CDS26080-005"],
        completed: true,
        completedAt: new Date("2026-01-30T10:23:00"),
        completedBy: "User123"
      },
      {
        id: "pick-gwp",
        description: "Pick all 5 free gifts",
        itemIds: ["LINE-CDS26080-001", "LINE-CDS26080-002", "LINE-CDS26080-003", "LINE-CDS26080-004", "LINE-CDS26080-006"],
        completed: true,
        completedAt: new Date("2026-01-30T10:25:00"),
        completedBy: "User123"
      },
      {
        id: "prepare-materials",
        description: "Prepare premium gift wrap materials",
        itemIds: [],
        completed: true,
        completedAt: new Date("2026-01-30T10:27:00"),
        completedBy: "User456"
      },
      {
        id: "wrap",
        description: "Wrap 2 Lipstick items with floral paper",
        itemIds: ["LINE-CDS26080-005"],
        completed: false
      },
      {
        id: "message",
        description: "Print gift message card",
        itemIds: [],
        completed: false
      },
      {
        id: "pack-gwp",
        description: "Pack all GWP items with main item",
        itemIds: ["LINE-CDS26080-001", "LINE-CDS26080-002", "LINE-CDS26080-003", "LINE-CDS26080-004", "LINE-CDS26080-006"],
        completed: false
      },
      {
        id: "receipt",
        description: "Include gift receipt (no prices)",
        itemIds: [],
        completed: false
      },
      {
        id: "qc",
        description: "Final quality check",
        itemIds: [],
        completed: false
      }
    ],
    progress: {
      completed: 3,
      total: 8,
      percentage: 37.5
    }
  }
}
```

---

**End of Wireframe Specification - Version 2 Enhanced**
