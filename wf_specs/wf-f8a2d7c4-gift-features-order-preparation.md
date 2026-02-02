# Wireframe Specification: Gift Features for Order Preparation

**ADW ID:** f8a2d7c4
**Feature:** Gift Wrapped, Gift Message, and Gift with Purchase Indicators
**Purpose:** Enable warehouse staff to quickly identify orders requiring special gift preparation and understand item relationships
**Created:** 2026-02-01
**Status:** Draft

---

## Problem Statement

Warehouse staff need to know:
1. **Does this order require gift wrapping?**
2. **Is there a gift message to include?**
3. **Which items are "Gift with Purchase" (GWP) promotional items?**
4. **What is the relationship between GWP items and their qualifying main items?**

This information is critical for proper order fulfillment to ensure:
- Gift wrapping materials are prepared
- Gift messages are printed and included
- GWP items are packed with their corresponding main items
- Order preparation time is accurately estimated

---

## Current System Analysis

### Existing Data Structure (src/lib/mock-data.ts)

**Order Level:**
```typescript
interface Order {
  // ... existing fields
  // No gift-related fields currently exist
}
```

**Line Item Level:**
```typescript
interface OrderLineItem {
  productName: string    // e.g., "GET FREE - MYSLF EAU DE PARFUM 1.2 mL"
  thaiName: string       // e.g., "ของแถม - MYSLF EAU DE PARFUM 1.2 มล."
  unitPrice: number      // GWP items have unitPrice: 0
  // No explicit GWP relationship tracking
}
```

### Current UI Location
- **Order Detail View** (`src/components/order-detail-view.tsx`)
  - Overview Tab: Customer/Order/Delivery/Payment Information
  - Items Tab: Lists all line items with product name, SKU, quantity, price

---

## User Requirements

### R1: Gift Wrapping Indicator
- **Who needs it:** Warehouse packing staff
- **When:** Before starting order preparation
- **What:** Visual indicator if order requires gift wrapping
- **Why:** To prepare wrapping materials and allocate additional time

### R2: Gift Message Display
- **Who needs it:** Warehouse packing staff
- **When:** During order packing
- **What:** Full text of gift message to be printed/included
- **Why:** Ensure personalized message is included with gift

### R3: Gift with Purchase (GWP) Item Identification
- **Who needs it:** Warehouse picking staff
- **When:** During item picking and packing
- **What:** Clear visual badge/tag on promotional items
- **Why:** Distinguish between purchased items and free promotional items

### R4: GWP Item Relationship Mapping
- **Who needs it:** Warehouse packing staff
- **When:** During quality check before shipping
- **What:** Which GWP items must be packed with which qualifying items
- **Why:** Ensure promotional items are not forgotten or packed incorrectly

---

## Version 1: Minimal Implementation (Quick Win)

### Scope
- Add gift indicators to Overview tab
- Add GWP badges to Items tab
- No relationship mapping yet

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

#### 1.1 Overview Tab - Gift Information Section

**Location:** After Payment Information section
**Visibility:** Only show if `hasGiftWrap === true` OR `giftMessage` exists

```
┌─────────────────────────────────────────────────────────────┐
│ 🎁 Gift Information                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Gift Wrapped         ✅ Yes                                 │
│                                                             │
│ Gift Message         "Happy Birthday! Enjoy your special    │
│                      day. Love, Mom"                        │
│                      [Copy Message] button                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Styling:**
- Section header with gift emoji 🎁
- Green checkmark ✅ or "No" for gift wrap
- Gift message in italic text, max 3 lines with "Show More" expansion
- Copy button for easy printing

#### 1.2 Items Tab - GWP Badge

**Location:** On each line item card
**Badge Placement:** Top-right corner of product name

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
- Size: Small chip/pill shape
- Text: "GWP" or "FREE GIFT"

### Implementation Complexity
- **Effort:** Low (2-4 hours)
- **Files Changed:** 2 files
  - `src/types/order.ts` - Add optional fields
  - `src/components/order-detail-view.tsx` - Add gift section + badges
- **Risk:** Low - purely additive changes

---

## Version 2: Enhanced with GWP Relationship Tracking

### Scope
- Everything from Version 1
- Add GWP relationship mapping
- Group related items visually in Items tab
- Add summary of GWP items

### Data Model Changes

```typescript
interface Order {
  // V1 fields...
  hasGiftWrap?: boolean
  giftMessage?: string

  // V2 new fields
  giftWrappedItemIds?: string[]  // Array of lineId that need gift wrapping
}

interface OrderLineItem {
  // V1 fields...
  isGiftWithPurchase?: boolean
  promotionType?: 'FREE_GIFT' | 'BUNDLE' | 'DISCOUNT' | null

  // V2 new fields
  gwpQualifyingItemId?: string   // Links GWP item to main item
  gwpPromotionName?: string      // e.g., "Buy YSL Foundation, Get Free Perfume Sample"
}
```

### UI Changes

#### 2.1 Overview Tab - Enhanced Gift Information

```
┌─────────────────────────────────────────────────────────────┐
│ 🎁 Gift Information                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Gift Wrapped         ✅ Yes (2 items)                       │
│ Items to wrap:       • Lipstick Loveshine Candy Glow       │
│                      • YSL All Hours Glow Foundation        │
│                                                             │
│ Gift Message         "Happy Birthday! Enjoy your special    │
│                      day. Love, Mom"                        │
│                      [Copy Message] [Print]                 │
│                                                             │
│ Free Gift Items      5 promotional items in this order      │
│                      [View Details ↓]                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 2.2 Items Tab - Grouped Display with Relationships

**Show GWP items grouped under their qualifying main item:**

```
┌─────────────────────────────────────────────────────────────┐
│ Order Items                    [Search] [Expand All] [GWP]  │
│ 6 items (1 paid + 5 free gifts)                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 🎁 PAID ITEM - GIFT WRAPPED                                │
│ ┌───────────────────────────────────────────────────────┐ │
│ │ [IMG]  Lipstick Loveshine Candy Glow Valentines       │ │
│ │        ลิปสติก Loveshine Candy Glow วาเลนไทน์         │ │
│ │        SKU: CDS26769646                        [v]    │ │
│ │                                                       │ │
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
│   💡 Promotion: "Buy YSL Valentine's Limited, Get 5 Free"  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Visual Hierarchy:**
- Main item: Full card with gift wrap icon 🎁
- Indented GWP section with arrow `↳`
- GWP items: Compact cards with lighter background
- Promotion banner at bottom explaining the offer

#### 2.3 New Filter/View Button

**Add [GWP] toggle button next to "Expand All":**
- **ON (default):** Show GWP items grouped under qualifying items
- **OFF:** Show all items in flat list (current view)

### Implementation Complexity
- **Effort:** Medium (8-12 hours)
- **Files Changed:** 4 files
  - `src/types/order.ts` - Add relationship fields
  - `src/components/order-detail-view.tsx` - Grouping logic
  - `src/lib/mock-data.ts` - Add sample GWP relationships
  - `src/lib/order-utils.ts` - Helper functions for grouping
- **Risk:** Medium - requires data structure changes and grouping logic

---

## Version 3: Full Featured with Packing Checklist

### Scope
- Everything from Version 1 & 2
- Add interactive packing checklist
- Print-friendly packing slip
- Item preparation timeline
- Integration with Manhattan WMS gift fields

### Data Model Changes

```typescript
interface Order {
  // V1 & V2 fields...
  hasGiftWrap?: boolean
  giftMessage?: string
  giftWrappedItemIds?: string[]

  // V3 new fields
  giftWrapType?: 'STANDARD' | 'PREMIUM' | 'LUXURY'
  giftCardRequired?: boolean
  giftReceipt?: boolean  // Hide prices on receipt
  specialInstructions?: string
}

interface OrderLineItem {
  // V1 & V2 fields...
  isGiftWithPurchase?: boolean
  promotionType?: 'FREE_GIFT' | 'BUNDLE' | 'DISCOUNT' | null
  gwpQualifyingItemId?: string
  gwpPromotionName?: string

  // V3 new fields
  packingPriority?: number  // 1 = pack first, higher = later
  requiresSpecialHandling?: boolean
  fragile?: boolean
  temperatureControlled?: boolean
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

#### 3.1 Overview Tab - Comprehensive Gift Section

```
┌─────────────────────────────────────────────────────────────┐
│ 🎁 Gift Preparation Information                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Gift Wrapped         ✅ Yes - Premium Wrapping              │
│                      🎀 2 items need wrapping               │
│                      [View Items →]                         │
│                                                             │
│ Gift Message         "Happy Birthday! Enjoy your special    │
│                      day. Love, Mom"                        │
│                      [Copy] [Print Card]                    │
│                                                             │
│ Gift Receipt         ✅ Yes (prices hidden)                 │
│                                                             │
│ Special Instructions "Please use floral wrapping paper.     │
│                      Include birthday card."                │
│                                                             │
│ Promotional Items    5 free gifts (must pack with Lipstick) │
│                      [View GWP Details ↓]                   │
│                                                             │
│ Estimated Prep Time  +15 minutes for gift wrapping          │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ 📋 Packing Checklist                        [Print] │    │
│ │                                                     │    │
│ │ ☐ Pick all items (1 paid + 5 free)                 │    │
│ │ ☐ Prepare premium gift wrap materials              │    │
│ │ ☐ Print gift message card                          │    │
│ │ ☐ Wrap 2 items (Lipstick x2)                       │    │
│ │ ☐ Attach 5 GWP items with Lipstick                 │    │
│ │ ☐ Print gift receipt (no prices)                   │    │
│ │ ☐ Include birthday card with floral paper          │    │
│ │ ☐ Final quality check                              │    │
│ │                                                     │    │
│ │ Progress: 0/8 items completed                       │    │
│ └─────────────────────────────────────────────────────┘    │
│                                                             │
│ [Mark All Complete] [Reset Checklist]                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 3.2 Items Tab - Enhanced with Packing Order

```
┌─────────────────────────────────────────────────────────────┐
│ Order Items        [Search] [View: Packing Order ▼] [Print] │
│ 6 items • 1 paid + 5 free gifts • 2 need gift wrapping      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ STEP 1: PICK MAIN ITEM FIRST                                │
│ ┌───────────────────────────────────────────────────────┐ │
│ │ [IMG]  Lipstick Loveshine Candy Glow Valentines       │ │
│ │        ลิปสติก Loveshine Candy Glow วาเลนไทน์         │ │
│ │        SKU: CDS26769646                        [v]    │ │
│ │                                                       │ │
│ │        🎁 NEEDS GIFT WRAP (Premium)                   │ │
│ │        Qty: 2                         ฿1,850.00       │ │
│ │        Location: Aisle 12, Shelf B3   each            │ │
│ │                                                       │ │
│ │        ☐ Picked (2 units)             [Mark Complete] │ │
│ └───────────────────────────────────────────────────────┘ │
│                                                             │
│ STEP 2: ATTACH 5 FREE GIFTS TO MAIN ITEM                    │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐ │
│   │ [GWP] 1. MYSLF EAU DE PARFUM 1.2 mL                 │ │
│   │       SKU: CDS10174760                              │ │
│   │       Location: Promo Bay A           ☐ Picked      │ │
│   └─────────────────────────────────────────────────────┘ │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐ │
│   │ [GWP] 2. YSL All Hours Glow Foundation (x2)         │ │
│   │       SKU: CDS23578005                              │ │
│   │       Location: Promo Bay A           ☐ Picked      │ │
│   └─────────────────────────────────────────────────────┘ │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐ │
│   │ [GWP] 3. Libre EDP 1.2 mL (x1)                      │ │
│   │       SKU: CDS23619029                              │ │
│   │       Location: Promo Bay A           ☐ Picked      │ │
│   └─────────────────────────────────────────────────────┘ │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐ │
│   │ [GWP] 4. Libre EDP 1.2 mL (x2)                      │ │
│   │       SKU: CDS23619029                              │ │
│   │       Location: Promo Bay A           ☐ Picked      │ │
│   └─────────────────────────────────────────────────────┘ │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐ │
│   │ [GWP] 5. Ang Pao Packet Set                         │ │
│   │       SKU: CDS27800461                              │ │
│   │       Location: Promo Bay B           ☐ Picked      │ │
│   └─────────────────────────────────────────────────────┘ │
│                                                             │
│   💡 Promotion: "YSL Valentine's Special - Buy 1 Get 5"    │
│      All 5 gifts must be packed together with Lipstick     │
│                                                             │
│ [Mark All GWP Picked] [Print Picking List]                  │
│                                                             │
│ STEP 3: GIFT WRAP & FINAL PACKING                           │
│ • Wrap Lipstick items with Premium wrap                    │
│ • Print and include gift message card                       │
│ • Pack all GWP items with main item                         │
│ • Include gift receipt (prices hidden)                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**View Dropdown Options:**
- **Packing Order** (default) - Shows numbered steps
- **Grouped by Type** - Main items, then GWP items
- **Flat List** - All items in order

#### 3.3 New "Fulfillment" Tab Enhancement

**Add Gift Preparation sub-section to existing Fulfillment tab:**

```
┌─────────────────────────────────────────────────────────────┐
│ [Overview] [Items] [Payments] [Fulfillment] [Tracking]      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Fulfillment Timeline                                        │
│ ────────────────────────────────────────────────────────    │
│                                                             │
│ ✅ Order Received        30/01/2026 07:17:00               │
│ ✅ Payment Verified      30/01/2026 07:18:00               │
│ 🔄 Picking Items         In Progress                        │
│    ├─ Main Items        ☐ Not Started                      │
│    └─ GWP Items (5)     ☐ Not Started                      │
│ ⏳ Gift Preparation     Pending (+15 min)                   │
│    ├─ Gift Wrapping     ☐ Not Started                      │
│    ├─ Gift Message      ☐ Not Started                      │
│    └─ Quality Check     ☐ Not Started                      │
│ ⏳ Packing              Pending                             │
│ ⏳ Handoff to Courier   Pending                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 3.4 Print-Ready Packing Slip

**New button in header: [Print Packing Slip]**

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
STEP 1: PICK ITEMS
───────────────────────────────────────────────────────────────

Main Item (GIFT WRAP REQUIRED):
  ☐ Lipstick Loveshine Candy Glow Valentines Limited E
     SKU: CDS26769646
     Qty: 2
     Location: Aisle 12, Shelf B3
     🎁 PREMIUM GIFT WRAP - Use floral paper

Free Gift Items (PACK WITH MAIN ITEM):
  ☐ MYSLF EAU DE PARFUM 1.2 mL (x1)
     SKU: CDS10174760 | Location: Promo Bay A

  ☐ YSL All Hours Glow Foundation LC1 1 mL (x2)
     SKU: CDS23578005 | Location: Promo Bay A

  ☐ Libre EDP 1.2 mL (x1)
     SKU: CDS23619029 | Location: Promo Bay A

  ☐ Libre EDP 1.2 mL (x2)
     SKU: CDS23619029 | Location: Promo Bay A

  ☐ Ang Pao Packet Set (x1)
     SKU: CDS27800461 | Location: Promo Bay B

───────────────────────────────────────────────────────────────
STEP 2: GIFT PREPARATION
───────────────────────────────────────────────────────────────

☐ Wrap Lipstick items (2 units) with PREMIUM wrapping paper
☐ Print gift message:
  "Happy Birthday! Enjoy your special day. Love, Mom"
☐ Include birthday card (per special instructions)
☐ Print GIFT RECEIPT (hide prices)

───────────────────────────────────────────────────────────────
STEP 3: FINAL PACKING
───────────────────────────────────────────────────────────────

☐ Pack wrapped Lipstick with all 5 GWP items together
☐ Include printed gift message card
☐ Include gift receipt (NO PRICES SHOWN)
☐ Quality check - verify all items included

───────────────────────────────────────────────────────────────
DELIVERY INFORMATION
───────────────────────────────────────────────────────────────

Recipient: สุทิศา ทับเอี่ยม
Phone: 0855500085
Address: 98/242 หมู่บ้านคาซ่าวิลล์ 2 ซ.15/2
         ถ.ราชพฤกษ์-รัตนาธิเบศร์
District: ท่าอิฐ
City: ปากเกร็ด
Postal Code: 11120

Courier: Flash Express
Tracking: FEX0842601001855 (when available)

───────────────────────────────────────────────────────────────
SPECIAL NOTES
───────────────────────────────────────────────────────────────

⚠️  Please use floral wrapping paper. Include birthday card.

───────────────────────────────────────────────────────────────

Packed By: ________________    Date: _______________

Quality Check: ____________    Date: _______________

═══════════════════════════════════════════════════════════════
```

### Integration with Manhattan WMS

**Manhattan WMS Gift Fields Mapping:**

From Manhattan OMS order status page, these fields should be fetched:
- `giftWrap` → `hasGiftWrap`
- `giftMessage` → `giftMessage`
- `giftWrapType` → `giftWrapType`
- `specialInstructions` → `specialInstructions`
- Line items with `itemType: "PROMOTION"` → `isGiftWithPurchase: true`
- `promotionId` → Link GWP items to qualifying items

**API Integration Points:**
- `GET /merchant/orders/:orderId` - Fetch gift fields
- `POST /merchant/orders/:orderId/gift-checklist` - Save packing progress
- `GET /merchant/orders/:orderId/packing-slip` - Generate print view

### Implementation Complexity
- **Effort:** High (24-32 hours)
- **Files Changed:** 10+ files
  - `src/types/order.ts` - Add all V3 fields
  - `src/types/packing.ts` - New packing checklist types
  - `src/components/order-detail-view.tsx` - Enhanced gift section
  - `src/components/order-detail/gift-preparation-panel.tsx` - New component
  - `src/components/order-detail/packing-checklist.tsx` - New component
  - `src/components/order-detail/packing-slip-print.tsx` - New print component
  - `src/lib/mock-data.ts` - Add V3 sample data
  - `src/lib/order-utils.ts` - Grouping and sorting logic
  - `src/lib/packing-utils.ts` - New packing checklist utilities
  - `app/api/orders/[id]/packing-slip/route.ts` - New API endpoint
  - `src/styles/print.css` - Print-specific styles
- **Risk:** High - complex state management, multiple integrations

---

## Comparison Matrix

| Feature | Version 1 | Version 2 | Version 3 |
|---------|-----------|-----------|-----------|
| **Gift Wrap Indicator** | ✅ Simple yes/no | ✅ With item list | ✅ With wrap type & instructions |
| **Gift Message Display** | ✅ Basic display | ✅ With copy/print | ✅ With card printing |
| **GWP Badges** | ✅ Simple badge | ✅ Badge + grouping | ✅ Badge + step-by-step |
| **GWP Relationships** | ❌ Not tracked | ✅ Linked to main item | ✅ Full promotion details |
| **Packing Checklist** | ❌ None | ❌ None | ✅ Interactive checklist |
| **Print Packing Slip** | ❌ None | ❌ None | ✅ Print-optimized |
| **Warehouse Location** | ❌ Not shown | ❌ Not shown | ✅ Aisle/shelf info |
| **Packing Priority** | ❌ Not tracked | ❌ Not tracked | ✅ Numbered steps |
| **Progress Tracking** | ❌ None | ❌ None | ✅ Real-time updates |
| **Implementation Time** | 2-4 hours | 8-12 hours | 24-32 hours |
| **Data Model Changes** | Minimal | Moderate | Extensive |
| **Risk Level** | Low | Medium | High |

---

## Recommended Approach

### Phase 1: Start with Version 1 (Week 1)
**Goal:** Immediate value with minimal risk
- Quick win to demonstrate gift feature concept
- Gather warehouse staff feedback
- Validate data availability from Manhattan WMS

**Deliverables:**
- Gift information section on Overview tab
- GWP badges on Items tab
- Update mock data with 2-3 gift orders

### Phase 2: Upgrade to Version 2 (Week 2-3)
**Goal:** Add relationship mapping based on feedback
- Implement GWP item grouping
- Test with warehouse staff during pilot
- Refine grouping logic based on usage patterns

**Deliverables:**
- Enhanced gift section with item lists
- Grouped item display with relationships
- GWP relationship data in mock orders

### Phase 3: Full Version 3 (Week 4-6)
**Goal:** Complete warehouse integration
- Full packing checklist functionality
- Print-ready packing slip
- Integration with Manhattan WMS gift fields
- Progress tracking and state management

**Deliverables:**
- Interactive packing checklist
- Print packing slip feature
- Warehouse location integration
- API endpoints for packing progress

---

## Success Metrics

### Version 1
- ✅ Gift orders visually distinguishable within 2 seconds
- ✅ GWP items identifiable without expanding item details
- ✅ Zero warehouse staff confusion about gift requirements

### Version 2
- ✅ Warehouse staff understand GWP relationships without training
- ✅ 50% reduction in "forgot to include GWP item" errors
- ✅ Grouped view preferred by 70%+ of users in survey

### Version 3
- ✅ Average gift order prep time reduced by 20%
- ✅ 90%+ checklist completion rate for gift orders
- ✅ Zero missing gift message incidents
- ✅ 80%+ of staff use packing slip print feature

---

## Technical Notes

### State Management
- Use React `useState` for checklist completion
- Consider localStorage for preserving checklist progress
- Debounce checklist updates to avoid excessive API calls

### Performance Considerations
- Lazy load packing checklist (only when expanded)
- Defer print view generation until user clicks print
- Cache GWP grouping calculations with `useMemo`

### Accessibility
- Ensure gift wrap icon has `aria-label="Gift wrapped"`
- Make checklist keyboard navigable
- Print view should be screen-reader friendly

### Mobile Responsiveness
- Gift section should collapse on mobile (<640px)
- Checklist should use bottom sheet on mobile
- Print feature should warn on mobile (suggest desktop)

---

## Open Questions

1. **Gift Wrap Types:** Does Manhattan WMS support multiple wrap types (Standard/Premium/Luxury)?
2. **Location Data:** Is warehouse location data (Aisle/Shelf) available in Manhattan API?
3. **Checklist Persistence:** Should packing progress be saved to database or just local state?
4. **Multi-User:** Can multiple warehouse staff work on same order checklist simultaneously?
5. **Permissions:** Should only certain roles see packing checklist (e.g., warehouse staff only)?

---

## Files to Create/Modify

### Version 1 Files
```
src/types/order.ts                              (modify - add 2 fields)
src/components/order-detail-view.tsx            (modify - add gift section)
src/lib/mock-data.ts                            (modify - add gift data)
```

### Version 2 Additional Files
```
src/lib/order-utils.ts                          (modify - add grouping logic)
src/components/order-detail/gift-info-card.tsx  (new - extracted component)
```

### Version 3 Additional Files
```
src/types/packing.ts                            (new - checklist types)
src/components/order-detail/packing-checklist.tsx           (new)
src/components/order-detail/gift-preparation-panel.tsx      (new)
src/components/order-detail/packing-slip-print.tsx          (new)
src/lib/packing-utils.ts                        (new - utilities)
app/api/orders/[id]/packing-slip/route.ts       (new - API endpoint)
src/styles/print.css                            (new - print styles)
```

---

## Appendix: Sample Data

### Version 1 Sample Order Data
```typescript
{
  orderId: "CDS260130806823",
  hasGiftWrap: true,
  giftMessage: "Happy Birthday! Enjoy your special day. Love, Mom",
  lineItems: [
    {
      lineId: "LINE-001",
      productName: "Lipstick Loveshine Candy Glow Valentines Limited E",
      isGiftWithPurchase: false,
      unitPrice: 1850,
      quantity: 2
    },
    {
      lineId: "LINE-002",
      productName: "GET FREE - MYSLF EAU DE PARFUM 1.2 mL",
      isGiftWithPurchase: true,
      promotionType: "FREE_GIFT",
      unitPrice: 0,
      quantity: 1
    }
  ]
}
```

### Version 2 Sample with Relationships
```typescript
{
  orderId: "CDS260130806823",
  hasGiftWrap: true,
  giftMessage: "Happy Birthday! Enjoy your special day. Love, Mom",
  giftWrappedItemIds: ["LINE-001"],
  lineItems: [
    {
      lineId: "LINE-001",
      productName: "Lipstick Loveshine Candy Glow Valentines Limited E",
      isGiftWithPurchase: false,
      unitPrice: 1850,
      quantity: 2
    },
    {
      lineId: "LINE-002",
      productName: "GET FREE - MYSLF EAU DE PARFUM 1.2 mL",
      isGiftWithPurchase: true,
      promotionType: "FREE_GIFT",
      gwpQualifyingItemId: "LINE-001",
      gwpPromotionName: "YSL Valentine's Special - Buy 1 Get 5",
      unitPrice: 0,
      quantity: 1
    }
  ]
}
```

### Version 3 Full Sample
```typescript
{
  orderId: "CDS260130806823",
  hasGiftWrap: true,
  giftMessage: "Happy Birthday! Enjoy your special day. Love, Mom",
  giftWrappedItemIds: ["LINE-001"],
  giftWrapType: "PREMIUM",
  giftCardRequired: true,
  giftReceipt: true,
  specialInstructions: "Please use floral wrapping paper. Include birthday card.",
  lineItems: [
    {
      lineId: "LINE-001",
      productName: "Lipstick Loveshine Candy Glow Valentines Limited E",
      isGiftWithPurchase: false,
      unitPrice: 1850,
      quantity: 2,
      packingPriority: 1,
      warehouseLocation: "Aisle 12, Shelf B3"
    },
    {
      lineId: "LINE-002",
      productName: "GET FREE - MYSLF EAU DE PARFUM 1.2 mL",
      isGiftWithPurchase: true,
      promotionType: "FREE_GIFT",
      gwpQualifyingItemId: "LINE-001",
      gwpPromotionName: "YSL Valentine's Special - Buy 1 Get 5",
      unitPrice: 0,
      quantity: 1,
      packingPriority: 2,
      warehouseLocation: "Promo Bay A"
    }
  ],
  packingChecklist: {
    orderId: "CDS260130806823",
    checklistItems: [
      {
        id: "pick-main",
        description: "Pick main items (Lipstick x2)",
        itemIds: ["LINE-001"],
        completed: false
      },
      {
        id: "pick-gwp",
        description: "Pick all 5 GWP items",
        itemIds: ["LINE-002", "LINE-003", "LINE-004", "LINE-005", "LINE-006"],
        completed: false
      },
      {
        id: "wrap",
        description: "Gift wrap Lipstick with premium wrap",
        itemIds: ["LINE-001"],
        completed: false
      },
      {
        id: "message",
        description: "Print and include gift message card",
        itemIds: [],
        completed: false
      },
      {
        id: "receipt",
        description: "Print gift receipt (no prices)",
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

**End of Wireframe Specification**
