# Wireframe Specification: Gift Features in Items Tab (Version 2)

**ADW ID:** f8a2d7c4-v2
**Feature:** Gift Information Consolidated in Items Tab
**Purpose:** Streamline gift order preparation by keeping all item-related information (including gift details) in one location
**Created:** 2026-02-01
**Status:** Draft
**Parent Spec:** wf-f8a2d7c4-gift-features-order-preparation.md

---

## Changes from Version 1

### Key Difference
**Version 1:** Gift Information section displayed on **Overview tab**
**Version 2:** Gift Information section moved to **Items tab** for better workflow

### Rationale
Moving Gift Information to the Items tab provides:
1. **Single Location Workflow:** Warehouse staff don't need to switch between tabs during picking/packing
2. **Contextual Display:** Gift details appear directly above the items that need special handling
3. **Reduced Clicks:** All item-related preparation info in one view
4. **Better Mobile UX:** Less tab switching on small screens

---

## Version 2A: Minimal Implementation (Quick Win)

### Scope
- Add Gift Information panel at top of Items tab
- Add GWP badges to line items
- Remove gift section from Overview tab entirely

### Data Model Changes

```typescript
interface Order {
  // Existing fields...

  // New gift-related fields
  hasGiftWrap?: boolean
  giftMessage?: string
}

interface OrderLineItem {
  // Existing fields...

  // New promotional fields
  isGiftWithPurchase?: boolean
  promotionType?: 'FREE_GIFT' | 'BUNDLE' | 'DISCOUNT' | null
}
```

### UI Changes

#### 2A.1 Items Tab - Gift Information Panel (Top Section)

**Location:** Immediately below "Order Items" header, before item list
**Visibility:** Only show if `hasGiftWrap === true` OR `giftMessage` exists
**Behavior:** Collapsible panel (default: expanded if gift info present)

```
┌─────────────────────────────────────────────────────────────┐
│ Items (6)                                     [Expand All]   │
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
│ ┌───────────────────────────────────────────────────────┐ │
│ │ [IMG]  ของแถม - MYSLF EAU DE PARFUM 1.2 มล.  [GWP]  │ │
│ │        GET FREE - MYSLF EAU DE PARFUM 1.2 mL         │ │
│ │        SKU: CDS10174760                       [v]    │ │
│ │                                                       │ │
│ │        Qty: 1                         ฿0.00          │ │
│ │                                       each           │ │
│ └───────────────────────────────────────────────────────┘ │
│                                                             │
│ [... more items ...]                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Styling:**
- Panel: Light background `bg-purple-50 dark:bg-purple-950/20` with border
- Collapsible with smooth animation
- Gift emoji 🎁 in header
- Green checkmark ✅ for gift wrap, or "No" if not wrapped
- Gift message in italic, serif font for elegance
- Action buttons: Copy (copies text), Print Card (opens print dialog)

#### 2A.2 Empty State (No Gift Info)

**When `hasGiftWrap === false` AND `giftMessage` is empty:**
- DO NOT show Gift Information panel at all
- Items list starts immediately below "Order Items" header
- Standard item display with GWP badges only

```
┌─────────────────────────────────────────────────────────────┐
│ Items (3)                                     [Expand All]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Order Items                                  [Search...]    │
│ 3 items in this order                                       │
├─────────────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────────────────┐ │
│ │ [IMG]  Premium Skincare Set                           │ │
│ │        SKU: ABC123                            [v]     │ │
│ │        Qty: 1                         ฿2,500.00       │ │
│ │                                       each            │ │
│ └───────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 2A.3 GWP Badge (Same as V1)

**Location:** Top-right of product name in each line item

```
┌─────────────────────────────────────────────────────────────┐
│ [IMG]  ของแถม - MYSLF EAU DE PARFUM 1.2 มล.        [GWP]  │
│        GET FREE - MYSLF EAU DE PARFUM 1.2 mL               │
│        SKU: CDS10174760                             [v]     │
│                                                             │
│        Qty: 1                              ฿0.00            │
│                                            each             │
└─────────────────────────────────────────────────────────────┘
```

**GWP Badge Styling:**
- Background: `bg-purple-100 dark:bg-purple-900`
- Text: `text-purple-700 dark:text-purple-300`
- Border: `border border-purple-300 dark:border-purple-700`
- Rounded: `rounded-full px-2 py-0.5`
- Font: `text-xs font-semibold uppercase`
- Text: "GWP" or "FREE"

#### 2A.4 Overview Tab Changes

**What's Removed:**
- Entire Gift Information section removed from Overview tab

**What Stays:**
- Customer Information
- Order Information
- Delivery Information
- Payment Information

**Result:** Overview tab becomes more concise, focused on customer/payment details only

### Implementation Complexity
- **Effort:** Low (2-4 hours)
- **Files Changed:** 2 files
  - `src/types/order.ts` - Add optional fields
  - `src/components/order-detail-view.tsx` - Move gift section to Items tab
- **Risk:** Low - purely additive changes, minimal reorganization

---

## Version 2B: Enhanced with GWP Relationships

### Scope
- Everything from Version 2A
- Add GWP relationship mapping
- Show which items need gift wrapping
- Group related items visually in Items tab
- Add summary counts

### Data Model Changes

```typescript
interface Order {
  // V2A fields...
  hasGiftWrap?: boolean
  giftMessage?: string

  // V2B new fields
  giftWrappedItemIds?: string[]  // Array of lineId that need gift wrapping
}

interface OrderLineItem {
  // V2A fields...
  isGiftWithPurchase?: boolean
  promotionType?: 'FREE_GIFT' | 'BUNDLE' | 'DISCOUNT' | null

  // V2B new fields
  gwpQualifyingItemId?: string   // Links GWP item to main item
  gwpPromotionName?: string      // e.g., "Buy YSL Valentine, Get 5 Free"
}
```

### UI Changes

#### 2B.1 Items Tab - Enhanced Gift Information Panel

```
┌─────────────────────────────────────────────────────────────┐
│ Items (6)                                     [Expand All]   │
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
│ Order Items                    [Search...] [View: Default ▼]│
│ 6 items (1 paid + 5 free gifts)                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 🎁 PAID ITEM - GIFT WRAPPED                                │
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
│   ↳ 🎁 COMES WITH 5 FREE GIFTS:                            │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐ │
│   │ [GWP] MYSLF EAU DE PARFUM 1.2 mL           Qty: 1   │ │
│   │       SKU: CDS10174760                     ฿0.00    │ │
│   └─────────────────────────────────────────────────────┘ │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐ │
│   │ [GWP] YSL All Hours Glow Foundation LC1    Qty: 2   │ │
│   │       SKU: CDS23578005                     ฿0.00    │ │
│   └─────────────────────────────────────────────────────┘ │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐ │
│   │ [GWP] Libre EDP 1.2 mL                     Qty: 1   │ │
│   │       SKU: CDS23619029                     ฿0.00    │ │
│   └─────────────────────────────────────────────────────┘ │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐ │
│   │ [GWP] Libre EDP 1.2 mL                     Qty: 2   │ │
│   │       SKU: CDS23619029                     ฿0.00    │ │
│   └─────────────────────────────────────────────────────┘ │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐ │
│   │ [GWP] Ang Pao Packet Set                   Qty: 1   │ │
│   │       SKU: CDS27800461                     ฿0.00    │ │
│   └─────────────────────────────────────────────────────┘ │
│                                                             │
│   💡 Promotion: "YSL Valentine's - Buy 1 Get 5 Free"       │
│      All free gifts must be packed with main item          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Visual Hierarchy:**
- Gift Information panel: Distinct purple/pink accent
- Main item: Full card with 🎁 icon for gift wrap indicator
- Indented GWP section: Arrow `↳` shows relationship
- GWP items: Compact cards with `bg-gray-50 dark:bg-gray-900/50`
- Promotion banner: Light purple background with bulb icon 💡

#### 2B.2 View Dropdown Options

**Add [View: ...] dropdown next to search:**
- **Default** (selected) - Shows GWP items grouped under qualifying items
- **Flat List** - All items in simple list (original V2A view)
- **Gift Items Only** - Shows only items that need gift wrapping
- **Free Gifts Only** - Shows only GWP items

### Implementation Complexity
- **Effort:** Medium (6-10 hours)
- **Files Changed:** 4 files
  - `src/types/order.ts` - Add relationship fields
  - `src/components/order-detail-view.tsx` - Grouping logic in Items tab
  - `src/lib/mock-data.ts` - Add sample GWP relationships
  - `src/lib/order-utils.ts` - Helper functions for grouping
- **Risk:** Medium - requires grouping logic and view switching

---

## Version 2C: Full Featured with Packing Checklist

### Scope
- Everything from Version 2A & 2B
- Add interactive packing checklist to Gift Information panel
- Show packing steps with item context
- Progress tracking
- Print-friendly packing slip

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
}
```

### UI Changes

#### 2C.1 Items Tab - Gift Information with Checklist

```
┌─────────────────────────────────────────────────────────────┐
│ Items (6)                [Print Packing Slip] [Expand All]  │
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
│ │ ┌───────────────────────────────────────────────┐  │    │
│ │ │ 📋 Packing Steps              Progress: 0/6  │  │    │
│ │ │                                               │  │    │
│ │ │ ☐ 1. Pick main item (Lipstick x2)            │  │    │
│ │ │ ☐ 2. Pick all 5 free gifts                   │  │    │
│ │ │ ☐ 3. Prepare premium gift wrap materials     │  │    │
│ │ │ ☐ 4. Wrap 2 Lipstick items with floral paper │  │    │
│ │ │ ☐ 5. Print gift message card                 │  │    │
│ │ │ ☐ 6. Pack all items together                 │  │    │
│ │ │                                               │  │    │
│ │ │ [Mark All Complete] [Reset]                   │  │    │
│ │ └───────────────────────────────────────────────┘  │    │
│ │                                                     │    │
│ │ Estimated Prep Time: +15 minutes                    │    │
│ │                                                     │    │
│ └─────────────────────────────────────────────────────┘    │
│                                                             │
│ Order Items                    [Search...] [View: Steps ▼] │
│ 6 items (1 paid + 5 free gifts)                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ STEP 1: PICK MAIN ITEM                              ☐      │
│ ┌───────────────────────────────────────────────────────┐ │
│ │ [IMG]  Lipstick Loveshine Candy Glow Valentines       │ │
│ │        ลิปสติก Loveshine Candy Glow วาเลนไทน์         │ │
│ │        SKU: CDS26769646                        [v]    │ │
│ │                                                       │ │
│ │        🎁 NEEDS PREMIUM GIFT WRAP                     │ │
│ │        Qty: 2                         ฿1,850.00       │ │
│ │                                       each            │ │
│ │                                                       │ │
│ │        [✓ Mark Picked]                                │ │
│ └───────────────────────────────────────────────────────┘ │
│                                                             │
│ STEP 2: PICK 5 FREE GIFTS                           ☐      │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐ │
│   │ [GWP] MYSLF EAU DE PARFUM 1.2 mL    Qty: 1  ☐      │ │
│   │       SKU: CDS10174760              ฿0.00           │ │
│   └─────────────────────────────────────────────────────┘ │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐ │
│   │ [GWP] YSL All Hours Glow Foundation Qty: 2  ☐      │ │
│   │       SKU: CDS23578005              ฿0.00           │ │
│   └─────────────────────────────────────────────────────┘ │
│                                                             │
│   [... 3 more GWP items ...]                                │
│                                                             │
│   [Mark All GWP Picked]                                     │
│                                                             │
│   💡 Promotion: All free gifts must pack with Lipstick      │
│                                                             │
│ ─────────────────────────────────────────────────────────  │
│                                                             │
│ STEP 3-6: GIFT PREPARATION                                  │
│ • Prepare premium wrapping materials with floral paper      │
│ • Wrap 2 Lipstick items                                     │
│ • Print gift message card                                   │
│ • Pack all items together                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**View Dropdown Options (Enhanced):**
- **Steps** (default) - Shows numbered packing steps with checkboxes
- **Grouped** - Shows GWP items grouped (V2B view)
- **Flat List** - Simple list without grouping
- **Gift Items Only** - Filter to gift-wrapped items
- **Free Gifts Only** - Filter to GWP items

**Interactive Features:**
- Checkbox per item to mark as picked
- "Mark All Complete" completes entire checklist
- Progress bar updates as steps completed
- Completed items show green checkmark ✅ and timestamp
- Persistent state (saved to localStorage or database)

#### 2C.2 Print Packing Slip

**New button in Items tab header: [Print Packing Slip]**

**Packing Slip Layout (Print View):**

```
═══════════════════════════════════════════════════════════════
                    CENTRAL GROUP OMS
                   GIFT ORDER PACKING SLIP
═══════════════════════════════════════════════════════════════

Order: CDS260130806823                  Date: 30/01/2026 07:17
Customer: สุทิศา ทับเอี่ยม              Channel: Web

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

───────────────────────────────────────────────────────────────
STEP 1: PICK MAIN ITEM
───────────────────────────────────────────────────────────────

  ☐ Lipstick Loveshine Candy Glow Valentines Limited E
     SKU: CDS26769646
     Qty: 2 units
     🎁 PREMIUM GIFT WRAP REQUIRED

───────────────────────────────────────────────────────────────
STEP 2: PICK FREE GIFT ITEMS (PACK WITH MAIN ITEM)
───────────────────────────────────────────────────────────────

  ☐ MYSLF EAU DE PARFUM 1.2 mL (x1)
     SKU: CDS10174760

  ☐ YSL All Hours Glow Foundation LC1 1 mL (x2)
     SKU: CDS23578005

  ☐ Libre EDP 1.2 mL (x1)
     SKU: CDS23619029

  ☐ Libre EDP 1.2 mL (x2)
     SKU: CDS23619029

  ☐ Ang Pao Packet Set (x1)
     SKU: CDS27800461

  💡 Promotion: "YSL Valentine's - Buy 1 Get 5 Free"
     All free gifts must be packed together with Lipstick

───────────────────────────────────────────────────────────────
STEP 3: GIFT WRAPPING
───────────────────────────────────────────────────────────────

☐ Prepare premium gift wrapping materials
☐ Use FLORAL wrapping paper (per customer request)
☐ Wrap 2 Lipstick items individually
☐ Include birthday card with gift message

───────────────────────────────────────────────────────────────
STEP 4: FINAL PACKING
───────────────────────────────────────────────────────────────

☐ Pack wrapped Lipstick with all 5 free gifts together
☐ Print gift message card and include
☐ Print GIFT RECEIPT (no prices shown)
☐ Quality check - verify all items included

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

Packed By: ________________    Date: _______________

Quality Check: ____________    Date: _______________

═══════════════════════════════════════════════════════════════
```

### Implementation Complexity
- **Effort:** High (16-24 hours)
- **Files Changed:** 8 files
  - `src/types/order.ts` - Add all V2C fields
  - `src/types/packing.ts` - New packing checklist types
  - `src/components/order-detail-view.tsx` - Enhanced Items tab
  - `src/components/order-detail/gift-checklist-panel.tsx` - New component
  - `src/components/order-detail/packing-slip-print.tsx` - New print component
  - `src/lib/mock-data.ts` - Add V2C sample data
  - `src/lib/order-utils.ts` - Grouping and sorting logic
  - `src/lib/packing-utils.ts` - New packing checklist utilities
  - `src/styles/print.css` - Print-specific styles
- **Risk:** High - complex state management, print layout

---

## Comparison: Version 1 vs Version 2

| Aspect | Version 1 (Overview) | Version 2 (Items Tab) |
|--------|----------------------|----------------------|
| **Gift Info Location** | Overview tab | Items tab (top panel) |
| **Workflow** | View overview → Switch to Items | All in Items tab |
| **Clicks Required** | 2 tabs minimum | 1 tab only |
| **Context** | Separate from items | With item context |
| **Mobile UX** | More tab switching | Single scrollable view |
| **Warehouse Staff** | Must remember info from Overview | See gift info while picking items |
| **Packing Process** | Back and forth between tabs | Linear workflow |
| **Screen Space** | Smaller item list area | Larger item list (collapsible panel) |
| **Best For** | Management/review workflow | Warehouse/fulfillment workflow |

---

## Comparison Matrix: Version 2 Variants

| Feature | V2A (Minimal) | V2B (Enhanced) | V2C (Full) |
|---------|---------------|----------------|------------|
| **Gift Info Panel in Items Tab** | ✅ Basic display | ✅ With item counts | ✅ With checklist |
| **Gift Message** | ✅ Display + copy | ✅ Display + copy | ✅ Display + copy + print |
| **GWP Badges** | ✅ Simple badge | ✅ Badge + grouping | ✅ Badge + step-by-step |
| **Item Grouping** | ❌ Flat list only | ✅ Grouped view option | ✅ Multiple view options |
| **GWP Relationships** | ❌ Not tracked | ✅ Linked to main item | ✅ Full promotion details |
| **Packing Checklist** | ❌ None | ❌ None | ✅ Interactive with progress |
| **View Options** | 1 (flat list) | 2 (grouped/flat) | 5 (steps/grouped/flat/filters) |
| **Print Packing Slip** | ❌ None | ❌ None | ✅ Print-optimized layout |
| **Progress Tracking** | ❌ None | ❌ None | ✅ Real-time checkboxes |
| **Special Instructions** | ❌ Not shown | ❌ Not shown | ✅ Displayed in panel |
| **Implementation Time** | 2-4 hours | 6-10 hours | 16-24 hours |
| **Files Changed** | 2 files | 4 files | 8+ files |
| **Risk Level** | Low | Medium | High |

---

## Recommended Approach

### Phase 1: Start with Version 2A (Week 1)
**Goal:** Move gift info to Items tab with minimal risk
- Quick implementation of gift panel at top of Items tab
- GWP badges on items
- Collapsible panel for screen space management
- Gather warehouse staff feedback

**Deliverables:**
- Gift Information panel in Items tab (collapsible)
- GWP badges on free gift items
- Remove gift section from Overview tab
- Update 2-3 mock orders with gift data

### Phase 2: Upgrade to Version 2B (Week 2)
**Goal:** Add item relationships based on feedback
- Implement GWP item grouping with qualifying items
- Show which items need gift wrapping
- Add view switching (grouped vs flat)
- Test grouped view with warehouse staff

**Deliverables:**
- Enhanced gift panel with item lists
- Grouped item display with GWP relationships
- View dropdown with 2 options
- GWP relationship data in mock orders

### Phase 3: Full Version 2C (Week 3-4)
**Goal:** Complete packing workflow integration
- Interactive packing checklist
- Print-ready packing slip
- Multiple view options for different workflows
- Progress tracking

**Deliverables:**
- Interactive checklist in gift panel
- 5 view options in dropdown
- Print packing slip feature
- State persistence for checklist progress

---

## Success Metrics

### Version 2A
- ✅ Warehouse staff can see gift requirements without leaving Items tab
- ✅ 90%+ staff prefer Items tab location over Overview tab (user testing)
- ✅ Zero tab-switching during packing workflow
- ✅ Gift panel collapsible to maximize item list space

### Version 2B
- ✅ Grouped view makes GWP relationships clear without training
- ✅ 50% reduction in "forgot to include GWP item" errors
- ✅ 70%+ staff prefer grouped view for gift orders

### Version 2C
- ✅ 80%+ staff use packing checklist feature
- ✅ Average gift order prep time reduced by 20%
- ✅ Zero missing gift message incidents
- ✅ 90%+ checklist completion rate

---

## Technical Notes

### Component Structure

```typescript
// Version 2A - Minimal
<ItemsTab>
  {hasGiftInfo && <GiftInfoPanel collapsible />}
  <ItemsList>
    {items.map(item => (
      <ItemCard gwpBadge={item.isGiftWithPurchase} />
    ))}
  </ItemsList>
</ItemsTab>

// Version 2B - Enhanced
<ItemsTab>
  {hasGiftInfo && <GiftInfoPanel enhanced showItemCounts />}
  <ViewSwitcher options={['grouped', 'flat']} />
  {viewMode === 'grouped' ? (
    <GroupedItemsList gwpRelationships />
  ) : (
    <FlatItemsList />
  )}
</ItemsTab>

// Version 2C - Full Featured
<ItemsTab>
  {hasGiftInfo && (
    <GiftPreparationPanel>
      <GiftInfo />
      <PackingChecklist interactive progress />
    </GiftPreparationPanel>
  )}
  <ViewSwitcher options={['steps', 'grouped', 'flat', 'filters']} />
  {viewMode === 'steps' ? (
    <StepByStepView checklist />
  ) : viewMode === 'grouped' ? (
    <GroupedItemsList />
  ) : (
    <FlatItemsList />
  )}
  <PrintPackingSlipButton />
</ItemsTab>
```

### State Management

**Version 2A:**
```typescript
const [isPanelCollapsed, setIsPanelCollapsed] = useState(false)
```

**Version 2B:**
```typescript
const [viewMode, setViewMode] = useState<'grouped' | 'flat'>('grouped')
const groupedItems = useMemo(() => groupItemsByGWP(items), [items])
```

**Version 2C:**
```typescript
const [checklist, setChecklist] = useState<PackingChecklist>()
const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())

// Persist to localStorage
useEffect(() => {
  localStorage.setItem(`checklist-${orderId}`, JSON.stringify(checklist))
}, [checklist, orderId])
```

### Performance Considerations
- **Lazy Load:** Gift panel renders only when Items tab active
- **Memoization:** Cache grouped items calculation with `useMemo`
- **Print View:** Generate only when user clicks print button
- **Checklist:** Debounce checkbox updates (300ms) to avoid excessive re-renders

### Accessibility
- Gift panel collapsible with keyboard (Enter/Space)
- Checklist checkboxes keyboard navigable (Tab/Shift+Tab)
- ARIA labels: `aria-label="Gift wrapped order"` on 🎁 icon
- Print view fully keyboard accessible

### Mobile Responsiveness
- **Gift Panel:** Full width on mobile, auto-collapse on small screens
- **Checklist:** Bottom sheet on mobile (<640px)
- **View Switcher:** Dropdown instead of tabs on mobile
- **Print:** Show "Print on desktop recommended" tooltip on mobile

---

## Open Questions

1. **Panel Default State:** Should gift panel be collapsed or expanded by default?
   - **Recommendation:** Expanded if gift info exists, hidden if not

2. **View Mode Persistence:** Should selected view mode persist across sessions?
   - **Recommendation:** Save to localStorage per user preference

3. **Checklist Sync:** Should checklist sync across multiple users/devices?
   - **Recommendation:** V2C - sync to database, V2A/V2B - localStorage only

4. **Overview Tab:** Should we keep a link/summary in Overview pointing to Items tab?
   - **Recommendation:** Add "🎁 This is a gift order → View Items tab" banner

5. **Mobile Print:** Should we disable print on mobile or allow with warning?
   - **Recommendation:** Allow with tooltip "Best viewed on desktop"

---

## Files to Create/Modify

### Version 2A Files
```
src/types/order.ts                              (modify - add gift fields)
src/components/order-detail-view.tsx            (modify - move gift to Items tab)
src/lib/mock-data.ts                            (modify - add gift sample data)
```

### Version 2B Additional Files
```
src/lib/order-utils.ts                          (modify - add grouping logic)
src/components/order-detail/gift-info-panel.tsx (new - extracted component)
```

### Version 2C Additional Files
```
src/types/packing.ts                            (new - checklist types)
src/components/order-detail/gift-checklist-panel.tsx    (new)
src/components/order-detail/packing-slip-print.tsx      (new)
src/lib/packing-utils.ts                        (new - utilities)
src/styles/print.css                            (new - print styles)
```

---

## Appendix: Sample Data

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
      isGiftWithPurchase: false,
      unitPrice: 1850,
      quantity: 2
    },
    {
      lineId: "LINE-CDS26080-001",
      productName: "GET FREE - MYSLF EAU DE PARFUM 1.2 mL",
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
  giftWrappedItemIds: ["LINE-CDS26080-005"],
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
    }
  ]
}
```

### Version 2C Full Sample
```typescript
{
  orderId: "CDS260130806823",
  hasGiftWrap: true,
  giftMessage: "Happy Birthday! Enjoy your special day. Love, Mom",
  giftWrappedItemIds: ["LINE-CDS26080-005"],
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
  ],
  packingChecklist: {
    orderId: "CDS260130806823",
    checklistItems: [
      {
        id: "pick-main",
        description: "Pick main item (Lipstick x2)",
        itemIds: ["LINE-CDS26080-005"],
        completed: false
      },
      {
        id: "pick-gwp",
        description: "Pick all 5 GWP items",
        itemIds: ["LINE-CDS26080-001", "LINE-CDS26080-002", "LINE-CDS26080-003", "LINE-CDS26080-004", "LINE-CDS26080-006"],
        completed: false
      },
      {
        id: "wrap",
        description: "Gift wrap Lipstick with premium wrap",
        itemIds: ["LINE-CDS26080-005"],
        completed: false
      },
      {
        id: "message",
        description: "Print and include gift message card",
        itemIds: [],
        completed: false
      },
      {
        id: "pack",
        description: "Pack all items together",
        itemIds: [],
        completed: false
      },
      {
        id: "qc",
        description: "Final quality check",
        itemIds: [],
        completed: false
      }
    ]
  }
}
```

---

**End of Wireframe Specification - Version 2**
