# Wireframe Specification: Gift Items Sub-Tab Evolution

**ADW ID:** 9b3e5f21
**Feature:** Gift-Focused Sub-Tab on Items Tab
**Base:** Evolution from wf-f8a2d7c4 Version 2
**Purpose:** Provide dedicated gift preparation view with progressive feature enhancement
**Created:** 2026-02-01
**Status:** Draft

---

## Background

Building on **wf-f8a2d7c4 Version 2** (Gift features with GWP relationship tracking), this specification explores adding a **dedicated sub-tab** within the Items tab to separate gift-related item views from the standard item list.

### Original Version 2 Limitations

The original Version 2 showed all items in a single view with GWP grouping:
- **Problem 1:** Mixed view can be cluttered for orders with many items
- **Problem 2:** Warehouse staff doing gift prep need focused view without non-gift items
- **Problem 3:** No quick filter to see only items needing gift wrap
- **Problem 4:** GWP relationships buried in expanded item details

### Solution: Sub-Tab Architecture

Add a **tabbed interface** within the Items tab:
```
Items (6) Tab
  ├─ All Items (default sub-tab)
  ├─ Gift Prep (new sub-tab)
  └─ Quick Filters (optional)
```

This allows:
- **Focused view** for gift preparation tasks
- **Separation** between standard picking and gift handling
- **Progressive disclosure** of complexity based on user role

---

## Version 2A: Simple Gift Prep Sub-Tab

### Scope
- Add "Gift Prep" sub-tab showing only gift-related items
- Filter to items needing wrap + their GWP items
- Simplified view optimized for warehouse gift prep staff

### UI Structure

#### Items Tab with Sub-Tabs

```
┌─────────────────────────────────────────────────────────────┐
│ [Overview] [Items (6)] [Payments] [Fulfillment] [Tracking]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌───────────────────────────────────────────────────────┐  │
│ │ [All Items (6)] [Gift Prep (3)] 🎁                    │  │
│ └───────────────────────────────────────────────────────┘  │
│                                                             │
│ ... (Tab content below) ...                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Sub-Tab Behavior:**
- **All Items (6):** Shows all order items (existing V2 grouped view)
- **Gift Prep (3):** Shows only items needing gift prep + their GWP items
- Gift emoji 🎁 indicator on "Gift Prep" tab
- Badge count shows number of items in that view

#### Gift Prep Sub-Tab Content

**When order has gift requirements:**

```
┌─────────────────────────────────────────────────────────────┐
│ [All Items (6)] [Gift Prep (3)] 🎁                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 🎁 Gift Preparation Items                                   │
│ 3 items require gift handling                               │
│                                                             │
│ ┌───────────────────────────────────────────────────────┐ │
│ │ 📦 Gift Information                                    │ │
│ │                                                        │ │
│ │ Gift Wrapped:    ✅ Yes (2 items below)                │ │
│ │ Gift Message:    "Happy Birthday! Enjoy your special   │ │
│ │                  day. Love, Mom"                       │ │
│ │                  [Copy] [Print Card]                   │ │
│ └───────────────────────────────────────────────────────┘ │
│                                                             │
│ Items to Gift Wrap:                                         │
│ ┌───────────────────────────────────────────────────────┐ │
│ │ 🎁 Lipstick Loveshine Candy Glow Valentines           │ │
│ │    ลิปสติก Loveshine Candy Glow วาเลนไทน์             │ │
│ │    SKU: CDS26769646                            [v]    │ │
│ │                                                       │ │
│ │    Qty: 2                              ฿1,850.00      │ │
│ │    📍 Aisle 12, Shelf B3               each           │ │
│ │                                                       │ │
│ │    ⚠️  WRAP WITH PREMIUM PAPER                        │ │
│ └───────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌───────────────────────────────────────────────────────┐ │
│ │ 🎁 YSL All Hours Glow Foundation LC1                  │ │
│ │    SKU: CDS23578005                            [v]    │ │
│ │                                                       │ │
│ │    Qty: 1                              ฿2,500.00      │ │
│ │    📍 Aisle 8, Shelf C1                each           │ │
│ │                                                       │ │
│ │    ⚠️  WRAP WITH STANDARD PAPER                       │ │
│ └───────────────────────────────────────────────────────┘ │
│                                                             │
│ Free Gift Items (Pack with wrapped items):                  │
│ ┌───────────────────────────────────────────────────────┐ │
│ │ [GWP] Ang Pao Packet Set                              │ │
│ │       ของแถม - ชุดซองอังเปา                           │ │
│ │       SKU: CDS27800461                                │ │
│ │       📍 Promo Bay B                   ฿0.00          │ │
│ │                                                       │ │
│ │       ⭐ Include with Lipstick order                  │ │
│ └───────────────────────────────────────────────────────┘ │
│                                                             │
│ [Print Gift Prep Sheet] [Mark All Complete]                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**When order has NO gift requirements:**

```
┌─────────────────────────────────────────────────────────────┐
│ [All Items (6)] [Gift Prep] 🎁                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│        ┌────────────────────────────────────┐              │
│        │                                    │              │
│        │         📦                         │              │
│        │                                    │              │
│        │   No Gift Preparation Needed       │              │
│        │                                    │              │
│        │   This order does not require      │              │
│        │   gift wrapping or special         │              │
│        │   handling.                        │              │
│        │                                    │              │
│        │   [View All Items →]               │              │
│        │                                    │              │
│        └────────────────────────────────────┘              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Gift Prep Tab Badge Logic:**
- Show badge only if `hasGiftWrap === true` OR `giftMessage` exists
- Badge count = items needing wrap + GWP items linked to those items
- If no gift items, tab still exists but shows empty state

### Data Requirements

**No new data fields** - Uses existing V2 data model:
```typescript
interface Order {
  hasGiftWrap?: boolean
  giftMessage?: string
  giftWrappedItemIds?: string[]  // Array of lineId
}

interface OrderLineItem {
  isGiftWithPurchase?: boolean
  gwpQualifyingItemId?: string
  gwpPromotionName?: string
}
```

### Implementation Complexity
- **Effort:** Low (4-6 hours)
- **Files Changed:** 2 files
  - `src/components/order-detail-view.tsx` - Add sub-tab UI
  - `src/lib/order-utils.ts` - Add filter function `getGiftPrepItems()`
- **Risk:** Low - purely UI reorganization

---

## Version 2B: Enhanced with Quick Actions

### Scope
- Everything from Version 2A
- Add quick action buttons on Gift Prep tab
- Checklist-style completion tracking
- Print optimized gift prep sheet

### UI Enhancements

#### Gift Prep Sub-Tab with Quick Actions Header

```
┌─────────────────────────────────────────────────────────────┐
│ [All Items (6)] [Gift Prep (3)] 🎁                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 🎁 Gift Preparation Items                                   │
│ 3 items require gift handling                               │
│                                                             │
│ ┌───────────────────────────────────────────────────────┐ │
│ │ Quick Actions                                          │ │
│ │                                                        │ │
│ │ [📋 Print Prep Sheet] [📝 Copy Message] [✓ Complete]  │ │
│ │                                                        │ │
│ │ Progress: ●○○○ 1/4 tasks completed                    │ │
│ └───────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌───────────────────────────────────────────────────────┐ │
│ │ ✅ Task 1: Print Gift Message Card                     │ │
│ │                                                        │ │
│ │ "Happy Birthday! Enjoy your special day. Love, Mom"    │ │
│ │                                                        │ │
│ │ [Copy Message] [Print Card] [Mark Complete ✓]         │ │
│ └───────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌───────────────────────────────────────────────────────┐ │
│ │ ☐ Task 2: Wrap Items (2 items)                        │ │
│ │                                                        │ │
│ │ ┌─────────────────────────────────────────────────┐  │ │
│ │ │ ☐ Lipstick Loveshine (x2)                       │  │ │
│ │ │   📍 Aisle 12, Shelf B3                         │  │ │
│ │ │   🎁 Premium wrap, floral paper                 │  │ │
│ │ │   [Wrapped ✓]                                   │  │ │
│ │ └─────────────────────────────────────────────────┘  │ │
│ │                                                        │ │
│ │ ┌─────────────────────────────────────────────────┐  │ │
│ │ │ ☐ YSL Foundation (x1)                           │  │ │
│ │ │   📍 Aisle 8, Shelf C1                          │  │ │
│ │ │   🎁 Standard wrap                              │  │ │
│ │ │   [Wrapped ✓]                                   │  │ │
│ │ └─────────────────────────────────────────────────┘  │ │
│ │                                                        │ │
│ │ [All Items Wrapped ✓]                                  │ │
│ └───────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌───────────────────────────────────────────────────────┐ │
│ │ ☐ Task 3: Include Free Gifts (1 item)                 │ │
│ │                                                        │ │
│ │ ┌─────────────────────────────────────────────────┐  │ │
│ │ │ [GWP] Ang Pao Packet Set                        │  │ │
│ │ │       📍 Promo Bay B                            │  │ │
│ │ │       ⭐ Pack with Lipstick                     │  │ │
│ │ │       [Included ✓]                              │  │ │
│ │ └─────────────────────────────────────────────────┘  │ │
│ │                                                        │ │
│ │ [All GWP Items Included ✓]                             │ │
│ └───────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌───────────────────────────────────────────────────────┐ │
│ │ ☐ Task 4: Final Quality Check                         │ │
│ │                                                        │ │
│ │ ☐ Gift message card included                          │ │
│ │ ☐ All items wrapped correctly                         │ │
│ │ ☐ All GWP items included                              │ │
│ │ ☐ Gift receipt (no prices)                            │ │
│ │                                                        │ │
│ │ [Quality Check Complete ✓]                             │ │
│ └───────────────────────────────────────────────────────┘ │
│                                                             │
│ [Reset Progress] [Print Final Checklist]                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Task-Based Workflow

**Task 1: Print Gift Message**
- Auto-completed when "Print Card" clicked
- Message copyable for manual card writing
- Progress indicator updates immediately

**Task 2: Wrap Items**
- Shows each item needing wrap as sub-checklist
- Individual "Wrapped ✓" buttons per item
- Group complete when all items marked wrapped

**Task 3: Include Free Gifts**
- Lists all GWP items linked to gift-wrapped items
- Shows which main item each GWP should pack with
- Individual "Included ✓" buttons

**Task 4: Final Quality Check**
- 4-item checklist before marking order ready
- Ensures nothing forgotten
- Final confirmation step

### Print Gift Prep Sheet

**New feature: Printer-optimized view**

```
═══════════════════════════════════════════════════════════════
                    GIFT PREPARATION SHEET
═══════════════════════════════════════════════════════════════

Order: CDS260130806823                  Date: 30/01/2026 07:17
Customer: สุทิศา ทับเอี่ยม

───────────────────────────────────────────────────────────────
TASK 1: PRINT GIFT MESSAGE CARD
───────────────────────────────────────────────────────────────

Message:
"Happy Birthday! Enjoy your special day. Love, Mom"

☐ Message card printed and ready

───────────────────────────────────────────────────────────────
TASK 2: WRAP ITEMS
───────────────────────────────────────────────────────────────

☐ Lipstick Loveshine Candy Glow Valentines (Qty: 2)
  SKU: CDS26769646
  Location: Aisle 12, Shelf B3
  Wrap Type: PREMIUM (use floral paper)

☐ YSL All Hours Glow Foundation LC1 (Qty: 1)
  SKU: CDS23578005
  Location: Aisle 8, Shelf C1
  Wrap Type: STANDARD

───────────────────────────────────────────────────────────────
TASK 3: INCLUDE FREE GIFTS
───────────────────────────────────────────────────────────────

☐ Ang Pao Packet Set (Qty: 1)
  SKU: CDS27800461
  Location: Promo Bay B
  ⭐ MUST PACK WITH: Lipstick Loveshine

───────────────────────────────────────────────────────────────
TASK 4: FINAL QUALITY CHECK
───────────────────────────────────────────────────────────────

☐ Gift message card included
☐ All 2 items wrapped correctly
☐ All 1 GWP items included
☐ Gift receipt printed (no prices shown)

───────────────────────────────────────────────────────────────

Prepared By: ________________    Date: _______________

Quality Check: ______________    Date: _______________

═══════════════════════════════════════════════════════════════
```

### Data Requirements

**Additional fields for tracking:**
```typescript
interface GiftPrepProgress {
  orderId: string
  messagePrinted: boolean
  itemsWrapped: string[]  // Array of wrapped item lineIds
  gwpItemsIncluded: string[]  // Array of included GWP lineIds
  qualityCheckComplete: boolean
  completedAt?: Date
  completedBy?: string
}
```

**Storage Options:**
- **localStorage:** Quick MVP, works offline
- **Session state:** Lost on refresh, simplest
- **API backend:** Persistent, multi-user safe

### Implementation Complexity
- **Effort:** Medium (8-12 hours)
- **Files Changed:** 5 files
  - `src/components/order-detail-view.tsx` - Enhanced Gift Prep tab
  - `src/components/order-detail/gift-prep-checklist.tsx` - New component
  - `src/components/order-detail/gift-prep-print.tsx` - Print view
  - `src/lib/order-utils.ts` - Progress tracking helpers
  - `src/styles/print.css` - Print styles
- **Risk:** Low-Medium - Adds state management complexity

---

## Version 2C: Advanced with Split View & Analytics

### Scope
- Everything from Version 2B
- Add split-screen view (list + detail panel)
- Gift prep time estimation
- Historical data tracking
- Batch operations for multiple gift orders

### UI Structure

#### Split View Layout

```
┌─────────────────────────────────────────────────────────────┐
│ [All Items (6)] [Gift Prep (3)] 🎁                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ [List View] [Split View] [Detail View]    Estimated: 15min │
│                                                             │
├──────────────────────────┬──────────────────────────────────┤
│ ITEMS TO WRAP (2)        │ SELECTED: Lipstick Loveshine    │
│                          │                                  │
│ ┌──────────────────────┐ │ ┌──────────────────────────────┐ │
│ │ ✅ Lipstick Love...  │ │ │ 🎁 Lipstick Loveshine        │ │
│ │ SKU: CDS26769646     │ │ │    Candy Glow Valentines     │ │
│ │ Qty: 2 • Premium     │ │ │                              │ │
│ │ ⏱️  Est: 8 min       │ │ │ SKU: CDS26769646             │ │
│ └──────────────────────┘ │ │ Quantity: 2                  │ │
│                          │ │ Location: Aisle 12, Shelf B3  │ │
│ ┌──────────────────────┐ │ │                              │ │
│ │ ☐ YSL Foundation     │ │ │ ┌──────────────────────────┐ │ │
│ │ SKU: CDS23578005     │ │ │ │ Wrap Specification       │ │ │
│ │ Qty: 1 • Standard    │ │ │ │                          │ │ │
│ │ ⏱️  Est: 5 min       │ │ │ │ Type: Premium            │ │ │
│ └──────────────────────┘ │ │ │ Paper: Floral pattern    │ │ │
│                          │ │ │ Ribbon: Gold satin       │ │ │
│ FREE GIFTS (1)           │ │ │ Card: Birthday card      │ │ │
│                          │ │ │                          │ │ │
│ ┌──────────────────────┐ │ │ │ Est. Time: 8 minutes     │ │ │
│ │ ☐ Ang Pao Packet     │ │ │ └──────────────────────────┘ │ │
│ │ SKU: CDS27800461     │ │ │                              │ │
│ │ ⭐ With Lipstick     │ │ │ ┌──────────────────────────┐ │ │
│ │ ⏱️  Est: 2 min       │ │ │ │ Attached Free Gifts (1)  │ │ │
│ └──────────────────────┘ │ │ │                          │ │ │
│                          │ │ │ • Ang Pao Packet Set     │ │ │
│ ⏱️  Total: 15 minutes    │ │ │   Promo Bay B            │ │ │
│                          │ │ │   ☐ Included             │ │ │
│ [Print All] [Complete]   │ │ └──────────────────────────┘ │ │
│                          │ │                              │ │
│                          │ │ ┌──────────────────────────┐ │ │
│                          │ │ │ Gift Message             │ │ │
│                          │ │ │                          │ │ │
│                          │ │ │ "Happy Birthday! Enjoy   │ │ │
│                          │ │ │ your special day.        │ │ │
│                          │ │ │ Love, Mom"               │ │ │
│                          │ │ │                          │ │ │
│                          │ │ │ [Copy] [Print Card]      │ │ │
│                          │ │ └──────────────────────────┘ │ │
│                          │ │                              │ │
│                          │ │ [Mark Item Wrapped ✓]        │ │
│                          │ │ [Mark GWP Included ✓]        │ │
│                          │ └──────────────────────────────┘ │
└──────────────────────────┴──────────────────────────────────┘
```

**Left Panel: Compact List**
- Shows all gift prep items
- Checkboxes for completion status
- Time estimates per item
- Quick status indicators
- Click to select and show in right panel

**Right Panel: Detailed View**
- Full item details
- Wrap specifications
- Linked GWP items
- Gift message
- Quick action buttons
- Instructions and notes

### Time Estimation Feature

**Automatic Time Calculation:**
```typescript
interface GiftPrepTimeEstimate {
  itemWrapTime: number      // Minutes per item to wrap
  wrapTypeMultiplier: {
    STANDARD: 1.0,
    PREMIUM: 1.5,
    LUXURY: 2.0
  }
  messageCardTime: 2        // Fixed 2 minutes
  gwpHandlingTime: 1        // 1 minute per GWP item
  qualityCheckTime: 3       // Fixed 3 minutes
}
```

**Example Calculation:**
- 2x Lipstick (Premium wrap): 2 × 5min × 1.5 = **15 min**
- 1x Foundation (Standard wrap): 1 × 5min × 1.0 = **5 min**
- 1x GWP item: 1 × 1min = **1 min**
- Gift message card: **2 min**
- Quality check: **3 min**
- **Total: 26 minutes**

Display in header: `⏱️ Estimated: 26 min`

### Analytics Dashboard

**New section at top of Gift Prep tab:**

```
┌─────────────────────────────────────────────────────────────┐
│ Gift Prep Analytics (Today)                                 │
│                                                             │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│ │ Completed│ │  Pending │ │  Avg Time│ │  Success │       │
│ │    12    │ │     3    │ │  18 min  │ │   98%    │       │
│ │  orders  │ │  orders  │ │ per order│ │   rate   │       │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                             │
│ 🏆 Personal Best: 12 min (yesterday, Order #W1156...)       │
│ 📊 Team Average: 22 min per gift order                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Tracking Metrics:**
- Orders completed today
- Average time per order
- Success rate (completed without errors)
- Personal best time
- Team benchmarks

### Batch Operations

**For orders with multiple gift items or processing multiple orders:**

```
┌─────────────────────────────────────────────────────────────┐
│ Batch Actions                                               │
│                                                             │
│ ☐ Select All (3 items)                                      │
│                                                             │
│ Selected: 2 items                                           │
│                                                             │
│ [Print All Labels] [Mark All Wrapped] [Export to Excel]     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Batch Features:**
- Select multiple items at once
- Print all labels together
- Mark batch as complete
- Export to spreadsheet for records

### View Mode Toggle

**Three view modes:**
1. **List View** (compact) - Shows items in list only
2. **Split View** (default) - List + detail panel
3. **Detail View** (full width) - Shows one item at a time with full details

Toggle buttons at top of tab switch between modes.

### Historical Data Tracking

**Store completion data:**
```typescript
interface GiftPrepHistory {
  orderId: string
  completedAt: Date
  completedBy: string
  actualTimeMinutes: number
  estimatedTimeMinutes: number
  itemsWrapped: number
  gwpItemsIncluded: number
  qualityCheckPassed: boolean
}
```

**Benefits:**
- Improve time estimates over time
- Track individual/team performance
- Identify bottlenecks
- Quality assurance trending

### Data Requirements

**New types:**
```typescript
interface GiftPrepSettings {
  defaultWrapTime: number           // Base minutes per item
  wrapTypeMultipliers: Record<string, number>
  enableAnalytics: boolean
  enableTimeTracking: boolean
  autoStartTimer: boolean
}

interface GiftPrepAnalytics {
  date: string
  completedOrders: number
  pendingOrders: number
  averageTimeMinutes: number
  successRate: number
  personalBestMinutes: number
  teamAverageMinutes: number
}
```

### Implementation Complexity
- **Effort:** High (16-24 hours)
- **Files Changed:** 10+ files
  - `src/components/order-detail-view.tsx` - Split view layout
  - `src/components/order-detail/gift-prep-split-view.tsx` - New layout
  - `src/components/order-detail/gift-prep-list-panel.tsx` - Left panel
  - `src/components/order-detail/gift-prep-detail-panel.tsx` - Right panel
  - `src/components/order-detail/gift-prep-analytics.tsx` - Analytics widget
  - `src/lib/gift-prep-time-estimator.ts` - Time calculation
  - `src/lib/gift-prep-analytics.ts` - Analytics utilities
  - `src/hooks/use-gift-prep-timer.ts` - Timer hook
  - `src/hooks/use-gift-prep-analytics.ts` - Analytics hook
  - `src/types/gift-prep.ts` - All gift prep types
  - `app/api/gift-prep/history/route.ts` - History API
  - `app/api/gift-prep/analytics/route.ts` - Analytics API
- **Risk:** High - Complex state management, timing logic, analytics

---

## Comparison Matrix

| Feature | Version 2A | Version 2B | Version 2C |
|---------|-----------|-----------|-----------|
| **Sub-Tab Structure** | ✅ Simple | ✅ Simple | ✅ Advanced |
| **Gift Item Filtering** | ✅ Basic | ✅ Basic | ✅ Enhanced |
| **Task Checklist** | ❌ None | ✅ 4-step workflow | ✅ Interactive |
| **Progress Tracking** | ❌ None | ✅ Local state | ✅ Persistent API |
| **Print Prep Sheet** | ✅ Basic | ✅ Detailed | ✅ Print + Export |
| **Quick Actions** | ❌ None | ✅ Copy/Print/Mark | ✅ Batch operations |
| **Split View** | ❌ Single view | ❌ Single view | ✅ List + Detail |
| **Time Estimation** | ❌ None | ❌ None | ✅ Per-item + total |
| **Analytics Dashboard** | ❌ None | ❌ None | ✅ Personal + team |
| **Historical Tracking** | ❌ None | ❌ None | ✅ Full history |
| **Batch Operations** | ❌ None | ❌ None | ✅ Multi-select |
| **View Modes** | ❌ One mode | ❌ One mode | ✅ 3 view modes |
| **Implementation Time** | 4-6 hours | 8-12 hours | 16-24 hours |
| **Complexity** | Low | Medium | High |
| **User Roles** | All users | Gift prep staff | Power users + managers |

---

## User Flow Comparison

### Version 2A Flow (Simplest)
1. Click Items tab
2. Click "Gift Prep" sub-tab
3. View filtered list of gift items
4. Reference while preparing items manually
5. Return to "All Items" when done

**Time:** ~30 seconds to access info

### Version 2B Flow (Task-Based)
1. Click Items tab → Gift Prep sub-tab
2. Print gift message card (Task 1 ✓)
3. Pick and wrap items one by one (Task 2)
   - Check off each item as wrapped
4. Include GWP items (Task 3)
   - Check off each GWP as included
5. Final quality check (Task 4)
6. Print final checklist for records

**Time:** ~3-4 minutes of interaction + 15 min prep work

### Version 2C Flow (Power User)
1. Click Items tab → Gift Prep sub-tab
2. View analytics (check personal/team stats)
3. Switch to Split View mode
4. Click first item in left list
5. Review details in right panel
6. Start timer (auto-tracked)
7. Mark actions as completed in right panel
8. Click next item, repeat
9. Use batch actions to print all labels
10. Review completion stats when done

**Time:** ~5-7 minutes of interaction + 15 min prep work
**Benefits:** Data-driven, trackable, optimized workflow

---

## Recommended Approach

### Phase 1: Version 2A (Week 1)
**Goal:** Validate sub-tab concept
- Quick implementation to test UX
- Gather user feedback on filtered view
- Measure adoption rate

**Success Metrics:**
- 80%+ of warehouse staff use Gift Prep tab
- Time to find gift items reduced by 50%
- Positive feedback on separation of concerns

### Phase 2: Version 2B (Week 2-3)
**Goal:** Add workflow structure
- Based on V2A feedback, add checklist
- Test task-based workflow with real orders
- Measure completion rates and errors

**Success Metrics:**
- 95%+ task completion rate
- 30% reduction in forgotten items
- Print feature used on 70%+ of gift orders

### Phase 3: Version 2C (Week 4-8)
**Goal:** Optimize for power users
- Add split view after users comfortable with V2B
- Introduce analytics gradually
- Track time savings and quality improvements

**Success Metrics:**
- 40% reduction in gift prep time
- 99%+ quality check pass rate
- Analytics viewed by 60%+ of users
- Personal best times improving week-over-week

---

## Technical Implementation Notes

### Sub-Tab Component Architecture

```typescript
// Parent component structure
<TabsContainer>
  <TabsList>
    <Tab value="all">All Items (6)</Tab>
    <Tab value="gift-prep">
      Gift Prep (3) 🎁
    </Tab>
  </TabsList>

  <TabsContent value="all">
    <AllItemsView items={allItems} />
  </TabsContent>

  <TabsContent value="gift-prep">
    {version === '2A' && <GiftPrepSimpleView />}
    {version === '2B' && <GiftPrepChecklistView />}
    {version === '2C' && <GiftPrepSplitView />}
  </TabsContent>
</TabsContainer>
```

### Gift Item Filtering Logic

```typescript
function getGiftPrepItems(order: Order): OrderLineItem[] {
  const giftWrappedItems = order.lineItems.filter(item =>
    order.giftWrappedItemIds?.includes(item.lineId)
  )

  const gwpForGiftItems = order.lineItems.filter(item =>
    item.gwpQualifyingItemId &&
    order.giftWrappedItemIds?.includes(item.gwpQualifyingItemId)
  )

  return [...giftWrappedItems, ...gwpForGiftItems]
}
```

### State Management (V2B)

```typescript
// Use React Context for gift prep progress
const GiftPrepContext = createContext<{
  progress: GiftPrepProgress
  updateProgress: (updates: Partial<GiftPrepProgress>) => void
  resetProgress: () => void
}>()

// Or use Zustand for global state
const useGiftPrepStore = create<GiftPrepState>((set) => ({
  progressByOrder: {},
  updateOrderProgress: (orderId, updates) =>
    set(state => ({
      progressByOrder: {
        ...state.progressByOrder,
        [orderId]: { ...state.progressByOrder[orderId], ...updates }
      }
    }))
}))
```

### Time Tracking (V2C)

```typescript
// Custom hook for time tracking
function useGiftPrepTimer(orderId: string) {
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [elapsed, setElapsed] = useState(0)

  const start = () => setStartTime(new Date())
  const stop = () => {
    if (startTime) {
      const totalMinutes = differenceInMinutes(new Date(), startTime)
      // Save to history
      saveGiftPrepHistory({
        orderId,
        actualTimeMinutes: totalMinutes,
        completedAt: new Date()
      })
    }
  }

  return { elapsed, start, stop }
}
```

### Performance Considerations

**Version 2A:**
- Minimal overhead - just filtering existing data
- No additional API calls
- Works offline

**Version 2B:**
- localStorage for progress (fast, offline-capable)
- Optional API sync for multi-device
- Print generation on-demand

**Version 2C:**
- Debounce analytics updates
- Lazy load historical data
- Cache team statistics
- Virtualize long item lists in split view

---

## Mobile Responsiveness

### Version 2A (Mobile)
```
┌─────────────────────────┐
│ Items (6)               │
├─────────────────────────┤
│ [All] [Gift 🎁]         │
├─────────────────────────┤
│ 🎁 Gift Prep Items      │
│ 3 items                 │
│                         │
│ ┌─────────────────────┐ │
│ │ 📦 Gift Info        │ │
│ │ Wrap: ✅ Yes (2)    │ │
│ │ Message: "Happy..." │ │
│ │ [Copy] [Print]      │ │
│ └─────────────────────┘ │
│                         │
│ Items to Wrap:          │
│ ┌─────────────────────┐ │
│ │ 🎁 Lipstick (x2)    │ │
│ │ Premium wrap        │ │
│ │ [Details ↓]         │ │
│ └─────────────────────┘ │
│                         │
└─────────────────────────┘
```

### Version 2B (Mobile)
- Stacked layout (no split view on mobile)
- Bottom sheet for task checklist
- Swipe-to-complete gestures
- One task visible at a time

### Version 2C (Mobile)
- Force List View on mobile
- Split View disabled (<768px)
- Analytics in modal/bottom sheet
- Simplified batch operations

---

## Accessibility

### Keyboard Navigation
- `Tab` key to navigate between sub-tabs
- `Enter` to toggle checkboxes
- `Ctrl+P` to print prep sheet
- Arrow keys in split view to navigate items

### Screen Readers
```html
<div role="tabpanel" aria-labelledby="gift-prep-tab">
  <h2 id="gift-prep-heading">Gift Preparation Items</h2>
  <p aria-live="polite">3 items require gift handling</p>

  <div role="group" aria-labelledby="task-1-heading">
    <h3 id="task-1-heading">Task 1: Print Gift Message Card</h3>
    <button aria-label="Mark task 1 as complete">
      <span aria-hidden="true">✓</span> Complete
    </button>
  </div>
</div>
```

### Color Contrast
- Gift prep badge: Ensure 4.5:1 contrast ratio
- Checkboxes: Use icons + text labels
- Status indicators: Don't rely on color alone

---

## Open Questions

1. **Sub-Tab Visibility:** Should Gift Prep tab be hidden entirely if order has no gift items, or always visible with empty state?
2. **Progress Persistence:** Should checklist progress sync across devices/users, or stay local?
3. **Time Tracking:** Should timer start automatically when Gift Prep tab opened, or require manual start?
4. **Analytics Scope:** Show individual stats only, or team/warehouse-wide stats too?
5. **Batch Operations:** Should batch actions work across multiple orders, or just within one order?
6. **Print Customization:** Should users be able to customize print template (add/remove sections)?

---

## Integration Points

### With Original wf-f8a2d7c4

**Version 2A** uses:
- All data fields from original V2
- Same GWP relationship structure
- Compatible with existing Overview tab gift section

**Version 2B** adds:
- Progress tracking on top of original V2
- Print feature extends original V2 packing slip concept
- Compatible with original V3 checklist (simpler version)

**Version 2C** extends:
- Analytics build on original V3 historical tracking
- Split view is alternate layout for original V2 grouped view
- Time estimation enhances original V3 prep time estimates

### API Endpoints (for V2C)

```typescript
// Save gift prep progress
POST /api/orders/:orderId/gift-prep/progress
Body: { itemsWrapped: [...], gwpItemsIncluded: [...], ... }

// Get historical data
GET /api/gift-prep/history?userId=123&startDate=2026-01-01

// Get analytics
GET /api/gift-prep/analytics?scope=personal|team&period=today|week|month

// Export batch data
GET /api/gift-prep/export?orderIds=CDS123,CDS456&format=excel|pdf
```

---

## Appendix: Sample Data

### Version 2A - Simple Filtered View
```typescript
const giftPrepData = {
  hasGiftWrap: true,
  giftMessage: "Happy Birthday! Enjoy your special day. Love, Mom",
  giftWrappedItemIds: ["LINE-CDS26080-005"],
  filteredItems: [
    {
      lineId: "LINE-CDS26080-005",
      productName: "Lipstick Loveshine Candy Glow Valentines Limited E",
      quantity: 2,
      unitPrice: 1850,
      warehouseLocation: "Aisle 12, Shelf B3",
      wrapType: "PREMIUM"
    },
    {
      lineId: "LINE-CDS26080-006",
      productName: "GET FREE - Ang Pao Packet Set",
      quantity: 1,
      unitPrice: 0,
      isGiftWithPurchase: true,
      gwpQualifyingItemId: "LINE-CDS26080-005",
      warehouseLocation: "Promo Bay B"
    }
  ]
}
```

### Version 2B - With Progress Tracking
```typescript
const giftPrepProgress = {
  orderId: "CDS260130806823",
  messagePrinted: true,
  itemsWrapped: ["LINE-CDS26080-005"],
  gwpItemsIncluded: [],
  qualityCheckComplete: false,
  tasks: {
    task1: { completed: true, completedAt: "2026-02-01T00:45:00Z" },
    task2: { completed: true, completedAt: "2026-02-01T00:58:00Z" },
    task3: { completed: false },
    task4: { completed: false }
  }
}
```

### Version 2C - Full Analytics Data
```typescript
const analyticsData = {
  personal: {
    today: {
      completedOrders: 12,
      pendingOrders: 3,
      averageTimeMinutes: 18,
      successRate: 0.98,
      personalBestMinutes: 12
    },
    history: [
      {
        orderId: "CDS260130806823",
        completedAt: "2026-02-01T01:05:00Z",
        actualTimeMinutes: 15,
        estimatedTimeMinutes: 18,
        itemsWrapped: 2,
        gwpItemsIncluded: 1,
        qualityCheckPassed: true
      }
    ]
  },
  team: {
    averageTimeMinutes: 22,
    bestPerformer: "User 47",
    bestTime: 11
  }
}
```

---

**End of Wireframe Specification**
