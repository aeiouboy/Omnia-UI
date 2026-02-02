# Payment Tab UI Redesign Wireframe

**Status:** Draft
**Created:** 2026-01-31
**ADW ID:** skill
**Feature:** Payment Tab User Experience Redesign

---

## Executive Summary

This wireframe proposes 3 progressive redesign versions for the Payments tab to improve user-friendliness, information hierarchy, and visual clarity. The current implementation is functional but has opportunities for better organization and scanability.

### Current UI Analysis

**Data Structure (Important!):**
- Order CDS260121226285 has **1 payment method** (CREDIT_CARD)
- But **3 settlement transactions** charging the same card for different item groups
- This is split settlement: same payment method, multiple transactions

**Current UI Treatment:**
- Shows 3 separate payment cards (misleading - looks like 3 different payment methods)
- Card details repeated in first payment only (correct)
- Each settlement shown as independent "payment method" (incorrect terminology)

**Strengths:**
- ✅ Collapsible cards allow detailed drill-down per transaction
- ✅ Transaction type badges (AUTHORIZATION) provide status visibility
- ✅ Settled items table shows item-level allocation
- ✅ Clear payment status at top (PAID with green background)
- ✅ First settlement shows card details, others don't repeat them

**Pain Points:**
- ❌ **CRITICAL**: Labels say "Payment Methods (3)" when it's actually "1 method, 3 settlements"
- ❌ No clear indication that all 3 transactions are the SAME card
- ❌ Dense information presentation with small text
- ❌ Excessive vertical spacing between sections
- ❌ Duplicate information (Amount to be charged = Amount charged)
- ❌ Nested collapsibles make navigation cumbersome
- ❌ Transaction type information redundant with badge display
- ❌ No transaction IDs shown (hard to reference specific settlement)
- ❌ Subtotal row in table adds unnecessary visual weight
- ❌ Billing Information section feels disconnected from payment flow

---

## Data Model Clarification

**IMPORTANT:** Understanding the distinction between payment methods and settlement transactions is critical for this redesign.

### The Actual Data Structure

**Order CDS260121226285 has:**
- **1 Payment Method**: CREDIT_CARD (card ending in 0005)
- **3 Settlement Transactions**: Multiple charges to the same card

```typescript
paymentDetails: [
  {
    id: 'PAY-001',
    method: 'CREDIT_CARD',           // Same method
    cardNumber: '525669XXXXXX0005',   // Same card
    transactionId: '...4989',         // Different transaction
    amount: 1875.25,
    settledItems: [/* 6 items */]
  },
  {
    id: 'PAY-002',
    method: 'CREDIT_CARD',           // Same method!
    cardNumber: '525669XXXXXX0005',   // Same card!
    transactionId: '...4990',         // Different transaction
    amount: 567.64,
    settledItems: [/* 1 item */]
  },
  {
    id: 'PAY-003',
    method: 'CREDIT_CARD',           // Same method!
    cardNumber: '525669XXXXXX0005',   // Same card!
    transactionId: '...4991',         // Different transaction
    amount: 2108.36,
    settledItems: [/* 6 items */]
  }
]
```

### Why This Matters for UI Design

**Current UI Problem:**
- Header says "Payment Methods (3)" - **INCORRECT**
- Shows 3 cards that look like different payment methods - **MISLEADING**
- Users might think customer used 3 different cards - **CONFUSING**

**Correct UI Approach:**
- Header should say "Settlement Transactions (3)"
- Show payment method ONCE at top
- Show 3 settlement transactions below
- Make it clear all settlements use the SAME card

### Real-World Scenarios

This split settlement pattern occurs when:
- Items fulfilled from different warehouses (separate charges per shipment)
- Partial inventory availability (charge for available items first)
- Payment gateway splitting large transactions
- Marketplace orders with different sellers
- Pre-order vs immediate availability scenarios

---

## Version 1: Simplified Information Hierarchy (Minimal Changes)

**Approach:** Clean up redundant information and improve text hierarchy without major structural changes.

### Changes from Current UI

1. **Rename and restructure header:**
   - Change "Order Payment" to "Bill Information"
   - Remove total amount (฿4,551.25) from header
   - Keep billing name and address in this section

2. **Reorganize Payment Method section:**
   - Move payment status badge [PAID] to right side of header
   - Remove "Gateway: KBank" field
   - Show payment method details separately from settlements

3. **Remove redundant fields:**
   - Remove "Amount to be charged" (duplicate of "Amount charged")
   - Remove separate "Transaction Type: Authorization" text (already shown as badge)
   - Remove "CREDIT CARD:" label (redundant with card icon)

4. **Improve card details presentation:**
   - Show card details in Payment Method section (not repeated per settlement)
   - Group card number and expiry on same line: `525669XXXXXX0005 • **/****`
   - Use lighter gray background for collapsed state

5. **Simplify settled items table:**
   - Remove subtotal row from table (already visible in card header)
   - Add mismatch warning only when needed

### ASCII Wireframe - Version 1

```
┌─────────────────────────────────────────────────────────────────┐
│ Bill Information                                                  │
├─────────────────────────────────────────────────────────────────┤
│ Billing: ธนวัฒน์ สิงห์แพรก • 88/10 ม.1 บางละมุง, ชลบุรี 20150   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Payment Method                                             [PAID]│
├─────────────────────────────────────────────────────────────────┤
│ 💳 CREDIT_CARD         Card: 525669XXXXXX0005 • Exp: **/****    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Settlement Transactions (3 settlements • 13 items total)         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│ ┌───────────────────────────────────────────────────────────┐   │
│ │ Settlement #1 (6 items)  [AUTHORIZATION]        ฿1,875.25 ▼ │   │
│ └───────────────────────────────────────────────────────────┘   │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ ┌─────────────────────────────────────────────────────┐ │   │
│   │ │ Product Name              SKU          Qty   Amount  │ │   │
│   │ ├─────────────────────────────────────────────────────┤ │   │
│   │ │ Girl T-Shirt Kuromi...    CDS23576490   1   ฿266.93 │ │   │
│   │ │ Girl Pants Kuromi...      CDS23576551   1   ฿435.87 │ │   │
│   │ │ Girl Pants Hello Kitty... CDS23582996   1   ฿435.87 │ │   │
│   │ │ Toddler T-Shirt Grey...   CDS24013116   1   ฿233.01 │ │   │
│   │ │ Toddler Shorts Blue       CDS24077910   1   ฿266.93 │ │   │
│   │ │ Toddler T-Shirt Stripe... CDS24147863   1   ฿236.64 │ │   │
│   │ └─────────────────────────────────────────────────────┘ │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│ ┌───────────────────────────────────────────────────────────┐   │
│ │ Settlement #2 (1 item)   [AUTHORIZATION]          ฿567.64 ▼ │   │
│ └───────────────────────────────────────────────────────────┘   │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ ┌─────────────────────────────────────────────────────┐ │   │
│   │ │ Girl Dress Cinnamoroll... CDS24089123   1   ฿567.64 │ │   │
│   │ └─────────────────────────────────────────────────────┘ │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│ ┌───────────────────────────────────────────────────────────┐   │
│ │ Settlement #3 (6 items)  [AUTHORIZATION]      ฿2,108.36 ▶   │   │
│ └───────────────────────────────────────────────────────────┘   │
│   (collapsed)                                                    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Implementation Notes - Version 1

**Files to modify:**
- `src/components/order-detail/payments-tab.tsx`
- `src/components/order-detail/settled-items-table.tsx`

**Changes:**
1. **CRITICAL**: Rename "Order Payment" section to "Bill Information"
2. **CRITICAL**: Remove total amount from Bill Information header
3. **CRITICAL**: Change "Payment Methods (3)" to "Settlement Transactions (3 settlements • 13 items total)"
4. Add separate "Payment Method" section showing card details ONCE
5. Move payment status [PAID] badge to right side of Payment Method header
6. Remove "Gateway: KBank" field from Payment Method section
7. Remove transaction ID field from settlement headers
8. Remove redundant "Amount to be charged" field
9. Remove "Transaction Type: Authorization" text row (keep badge only)
10. Combine card number and expiry on one line in payment method section
11. Remove table footer (subtotal row)
12. Add item count summary below table: "6 items • ฿1,875.25"
13. Use compact horizontal layout for billing name and address
14. Change card headers from "CREDIT_CARD" to "Settlement #1", "Settlement #2", etc.

**Estimated effort:** 3-4 hours (increased due to structural changes)

---

## Version 2: Visual Hierarchy Enhancement (Medium Changes)

**Approach:** Restructure layout with better visual grouping, iconography, and progressive disclosure.

### Key Improvements over Version 1

1. **Visual payment summary cards:**
   - Larger, more prominent payment method cards
   - Color-coded left border by transaction type (yellow=auth, green=settlement)
   - Payment method icon dynamically changes (💳 credit card, 🏦 bank, 🎫 voucher)

2. **Inline item count badges:**
   - Show item count directly in collapsed state: "Settlement #1 (6 items)"
   - Transaction ID visible in collapsed state
   - Quick scan without expanding

3. **Two-column layout for billing:**
   - Billing Name (left) | Billing Address (right)
   - Better space utilization

4. **Condensed table view:**
   - Combine product name and SKU on same line with monospace badge
   - Product Name • `SKU` format
   - Reduces table width requirement

5. **Payment timeline visualization:**
   - Show payment sequence with connecting lines
   - Useful for understanding payment order in split scenarios

### ASCII Wireframe - Version 2

```
┌─────────────────────────────────────────────────────────────────┐
│ 💰 Bill Information                                              │
├─────────────────────────────────────────────────────────────────┤
│ ┌───────────────────────────┬───────────────────────────────┐   │
│ │ Name:                     │ Address:                      │   │
│ │ ธนวัฒน์ สิงห์แพรก         │ 88/10 ม.1 ซ.ชัยพรวิถี 14     │   │
│ │                           │ บางละมุง, ชลบุรี 20150       │   │
│ └───────────────────────────┴───────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 💳 Payment Method: CREDIT_CARD • 525669XXXXXX0005        [PAID] │
│    Total: ฿4,551.25 across 3 settlements                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Settlement Transactions (3 settlements • 13 items)               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ ┃ Settlement #1 (6 items)  [AUTHORIZATION]        ฿1,875.25 ▼   │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│   Status: Authorized                                             │
│                                                                   │
│   Items Settled:                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ • Girl T-Shirt Kuromi • CDS23576490 × 1      ฿266.93   │   │
│   │ • Girl Pants Kuromi • CDS23576551 × 1         ฿435.87   │   │
│   │ • Girl Pants Hello Kitty • CDS23582996 × 1    ฿435.87   │   │
│   │ • Toddler T-Shirt Grey • CDS24013116 × 1      ฿233.01   │   │
│   │ • Toddler Shorts Blue • CDS24077910 × 1       ฿266.93   │   │
│   │ • Toddler T-Shirt Stripe • CDS24147863 × 1    ฿236.64   │   │
│   └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
      │
      ↓ Same CREDIT_CARD
      │
┌─────────────────────────────────────────────────────────────────┐
│ ┃ Settlement #2 (1 item)   [AUTHORIZATION]          ฿567.64 ▼   │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│   Status: Authorized                                             │
│                                                                   │
│   Items Settled:                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ • Girl Dress Cinnamoroll • CDS24089123 × 1    ฿567.64   │   │
│   └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
      │
      ↓ Same CREDIT_CARD
      │
┌─────────────────────────────────────────────────────────────────┐
│ ┃ Settlement #3 (6 items)  [AUTHORIZATION]        ฿2,108.36 ▶   │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│   (collapsed - 6 items)                                          │
└─────────────────────────────────────────────────────────────────┘
```

### Component Structure - Version 2

**New Component:** `PaymentMethodCard`
- Shows payment method details (card number, gateway, total)
- Displayed once at top (not repeated per settlement)
- Props: `method`, `totalAmount`

**New Component:** `SettlementCard`
- Self-contained settlement transaction visualization
- Props: `settlement`, `index`, `total`, `defaultExpanded`
- Handles own collapse state
- Shows settlement sequence (#1, #2, #3)
- Displays transaction ID and timestamp

**Modified Component:** `PaymentsTab`
- Billing section moved to top with two-column layout
- Payment method section shows once (not per settlement)
- Settlement summary header: "3 settlements • 13 items"
- Timeline connector between settlement cards

**Modified Component:** `SettledItemsList` (replaces table)
- Bullet list format instead of table
- Product name • SKU • Qty • Amount on one line
- More compact, easier to scan

### Implementation Notes - Version 2

**Files to modify:**
- `src/components/order-detail/payments-tab.tsx` - Restructure layout
- `src/components/order-detail/payment-card.tsx` - New component
- `src/components/order-detail/settled-items-list.tsx` - New compact list component

**New features:**
1. Payment sequence numbering (1/3, 2/3, 3/3)
2. Item count in collapsed state
3. Timeline connectors between payments
4. Left border color coding by transaction type
5. Two-column billing layout
6. Compact bullet list for settled items
7. Dynamic payment method icons

**Estimated effort:** 1-2 days

---

## Version 3: Advanced Payment Dashboard (Major Redesign)

**Approach:** Complete reimagining as a payment operations dashboard with analytics, better status tracking, and action-oriented design.

### Key Improvements over Version 2

1. **Payment summary dashboard:**
   - Top KPI cards: Total Paid, Items Settled, Settlements Count, Transaction Status
   - Visual breakdown chart (pie/donut) showing settlement distribution
   - Clear indication: 1 payment method, multiple settlements

2. **Tab-based settlement detail view:**
   - Tab per settlement transaction (Settlement #1, #2, #3)
   - Avoids vertical scrolling for split settlements
   - Each tab shows full details for that specific settlement
   - Payment method info shown once at top (not repeated per tab)

3. **Enhanced transaction status tracking:**
   - Timeline showing: Authorized → Captured → Settled
   - Visual progress indicator
   - Timestamps for each stage

4. **Smart item grouping:**
   - Group items by category (Tops, Dresses, Pants)
   - Show discount impact per payment
   - Visual indicators for promotional items

5. **Action-oriented design:**
   - Quick actions: Refund, Resend Receipt, View Invoice
   - Contextual help tooltips
   - Export payment details button

6. **Advanced billing section:**
   - Verification status indicators
   - Edit billing information button
   - Tax invoice request status

### ASCII Wireframe - Version 3

```
┌─────────────────────────────────────────────────────────────────┐
│ 💰 Bill Information Overview                                     │
├─────────────────────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐    │
│ │ Items    │ │Settlements│ │ Status   │ │ Total Amount     │    │
│ │ Settled  │ │ Count    │ │ Paid     │ │                  │    │
│ │ 13       │ │ 3        │ │ ✓        │ │ ฿4,551.25        │    │
│ └──────────┘ └──────────┘ └──────────┘ └──────────────────┘    │
│                                                                   │
│ Settlement Distribution:         Quick Actions:                  │
│    ┌─────────┐                   [↓ Export] [📄 Invoice]        │
│    │  ⬤ 41%  │  Settlement 1     [✉️ Resend Receipt]            │
│    │  ⬤ 12%  │  Settlement 2                                    │
│    │  ⬤ 47%  │  Settlement 3                                    │
│    └─────────┘                                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 💳 Payment Method: CREDIT_CARD                            [PAID] │
├─────────────────────────────────────────────────────────────────┤
│ Card: 525669XXXXXX0005 • Type: Visa • Exp: **/****             │
│ Total Charged: ฿4,551.25 (3 settlements)                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 📋 Settlement Details                                            │
├─────────────────────────────────────────────────────────────────┤
│ ┌──────────────┬──────────────┬──────────────┐                  │
│ │ Settlement 1 │ Settlement 2 │ Settlement 3 │                  │
│ └──────────────┴──────────────┴──────────────┘                  │
│                                                                   │
│ ┌─────────────────────────────────────────────────────────┐     │
│ │ Settlement #1                        [PAID] ฿1,875.25   │     │
│ ├─────────────────────────────────────────────────────────┤     │
│ │                                                           │     │
│ │ Transaction ID: 17689833173984144989                     │     │
│ │ Date/Time: 01/21/2026 11:49:23 AM                       │     │
│ │ Invoice: 17689833173984144989                           │     │
│ │                                                           │     │
│ │ Transaction Timeline:                                    │     │
│ │ ● Authorized    01/21/2026 11:49:23 AM                  │     │
│ │ ○ Captured      Pending                                 │     │
│ │ ○ Settled       Pending                                 │     │
│ │                                                           │     │
│ │ Items Charged (6 items):                                │     │
│ │ ┌───────────────────────────────────────────────────┐   │     │
│ │ │ 👕 Tops & T-Shirts (3 items)         ฿736.58     │   │     │
│ │ │   • Girl T-Shirt Kuromi Viole                     │   │     │
│ │ │     CDS23576490 × 1              ฿266.93 (-32%)  │   │     │
│ │ │   • Toddler T-Shirt Grey                          │   │     │
│ │ │     CDS24013116 × 1              ฿233.01 (-41%)  │   │     │
│ │ │   • Toddler T-Shirt Stripe                        │   │     │
│ │ │     CDS24147863 × 1              ฿236.64 (-40%)  │   │     │
│ │ ├───────────────────────────────────────────────────┤   │     │
│ │ │ 👖 Pants & Bottoms (3 items)         ฿1,138.67   │   │     │
│ │ │   • Girl Pants Kuromi Denim                       │   │     │
│ │ │     CDS23576551 × 1              ฿435.87 (-32%)  │   │     │
│ │ │   • Girl Pants Hello Kitty                        │   │     │
│ │ │     CDS23582996 × 1              ฿435.87 (-32%)  │   │     │
│ │ │   • Toddler Shorts Blue                           │   │     │
│ │ │     CDS24077910 × 1              ฿266.93 (-32%)  │   │     │
│ │ └───────────────────────────────────────────────────┘   │     │
│ │                                                           │     │
│ │ Settlement Summary:                                      │     │
│ │ • Original Amount:  ฿3,028.10                           │     │
│ │ • Discounts:       -฿1,152.85 (38%)                     │     │
│ │ • Amount Charged:   ฿1,875.25                           │     │
│ │                                                           │     │
│ │ [💰 Refund Items] [📧 Resend Receipt]                   │     │
│ └─────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 📍 Billing & Tax Information                                     │
├─────────────────────────────────────────────────────────────────┤
│ ✓ Verified                                   [✏️ Edit Details]   │
│                                                                   │
│ Billing Name:        ธนวัฒน์ สิงห์แพรก                           │
│ Billing Address:     88/10 ม.1 ซ.ชัยพรวิถี 14 ถ.ชัยพรวิถี      │
│                      บางละมุง, ชลบุรี 20150                     │
│                                                                   │
│ Tax Invoice:         Not Requested                               │
│ Receipt Status:      ✓ Sent to thanawat4596@gmail.com          │
│                        01/21/2026 11:50 AM                       │
│                                                                   │
│ [📄 Request Tax Invoice] [📧 Resend Receipt]                     │
└─────────────────────────────────────────────────────────────────┘
```

### Component Architecture - Version 3

**New Components:**

1. **`PaymentOverviewDashboard`**
   - KPI cards (Total, Items, Methods, Status)
   - Payment distribution visualization
   - Quick actions toolbar

2. **`PaymentDetailTabs`**
   - Tab navigation for each payment
   - Prevents vertical scroll overload
   - Each tab self-contained

3. **`TransactionTimeline`**
   - Visual progress: Authorized → Captured → Settled
   - Timestamp for each stage
   - Color-coded status indicators

4. **`GroupedItemsList`**
   - Smart categorization (Tops, Dresses, Pants)
   - Collapsible categories
   - Discount percentages per item
   - Subtotals per category

5. **`BillingVerificationCard`**
   - Verification status badge
   - Edit functionality
   - Tax invoice request
   - Receipt status tracking

### Data Requirements - Version 3

**Additional fields needed:**

```typescript
interface EnhancedPaymentTransaction {
  // Existing fields...

  // New fields for Version 3
  cardType?: 'Visa' | 'Mastercard' | 'AMEX' | 'JCB'
  authorizationTimestamp?: string
  captureTimestamp?: string
  settlementTimestamp?: string
  originalAmount?: number  // Before discounts
  receiptSentTo?: string
  receiptSentAt?: string
  taxInvoiceRequested?: boolean
  billingVerified?: boolean
}

interface GroupedItems {
  category: 'Tops' | 'Dresses' | 'Pants' | 'Other'
  items: SettledItem[]
  subtotal: number
  originalSubtotal: number
  discountPercentage: number
}
```

### Implementation Notes - Version 3

**Files to create:**
- `src/components/order-detail/payment-overview-dashboard.tsx`
- `src/components/order-detail/payment-detail-tabs.tsx`
- `src/components/order-detail/transaction-timeline.tsx`
- `src/components/order-detail/grouped-items-list.tsx`
- `src/components/order-detail/billing-verification-card.tsx`

**Files to modify:**
- `src/components/order-detail/payments-tab.tsx` - Complete restructure
- `src/types/payment.ts` - Add enhanced transaction fields
- `src/lib/payment-utils.ts` - New utility for item categorization

**New utilities:**
1. Item categorization logic (group by product type)
2. Discount percentage calculator
3. Transaction timeline status resolver
4. Payment distribution calculator for chart

**Estimated effort:** 1 week

---

## Comparison Matrix

| Feature | Current | Version 1 | Version 2 | Version 3 |
|---------|---------|-----------|-----------|-----------|
| **Payment vs Settlement Clarity** | ❌ Confusing | ✅ Clear | ✅ Very Clear | ✅ Crystal Clear |
| **Information Density** | High | Medium | Medium | Low (dashboard) |
| **Visual Hierarchy** | Weak | Better | Strong | Excellent |
| **Scanability** | Poor | Good | Very Good | Excellent |
| **Mobile Friendly** | Fair | Fair | Good | Excellent |
| **Development Effort** | - | Low-Med | Medium | High |
| **User Cognitive Load** | High | Medium | Low | Very Low |
| **Accessibility** | Basic | Basic | Good | Excellent |
| **Analytics Integration** | None | None | Limited | Full |
| **Action-Oriented** | No | No | Limited | Yes |
| **Transaction Traceability** | Poor | Good | Excellent | Excellent |
| **Future-Proof** | Limited | Limited | Good | Excellent |

---

## Recommendations

### Immediate Implementation (Next Sprint)
**Choose Version 1** - Quick wins with minimal risk
- Removes redundant information immediately improving clarity
- 2-3 hour implementation time
- No architectural changes
- Better user experience with low effort

### Medium-Term Goal (Q1 2026)
**Plan for Version 2** - Balanced approach
- Significant UX improvement without full redesign
- Introduces better patterns (timeline, cards)
- Manageable 1-2 day effort
- Sets foundation for future enhancements

### Long-Term Vision (Q2-Q3 2026)
**Build toward Version 3** - Complete transformation
- Requires product design input and user research
- May need API changes for enhanced transaction data
- Consider A/B testing against Version 2
- Positions payment tab as operational dashboard

---

## User Stories

### Version 1
**As an operations user**, I want to quickly see payment details without redundant information, so I can process orders faster.

**Acceptance Criteria:**
- ✅ Duplicate "Amount to be charged" field removed
- ✅ Transaction type badge is sole indicator (text removed)
- ✅ Card details show only when present
- ✅ Item count summary appears below table
- ✅ Billing information positioned near payment header

### Version 2
**As a customer service agent**, I want to understand settlement allocation at a glance, so I can answer customer questions about split settlements quickly.

**Acceptance Criteria:**
- ✅ Payment method shown once at top (card details not repeated)
- ✅ Settlement sequence clearly numbered (#1, #2, #3)
- ✅ Item count visible in collapsed state
- ✅ Visual timeline connects multiple settlements
- ✅ Left border color indicates transaction status
- ✅ Billing information uses two-column layout
- ✅ Clear indication: 1 payment method, 3 settlements

### Version 3
**As a finance team member**, I want a comprehensive payment dashboard with analytics and actions, so I can manage settlement operations efficiently.

**Acceptance Criteria:**
- ✅ KPI cards show settlement overview metrics
- ✅ Settlement distribution chart visualizes split allocation
- ✅ Payment method displayed once (not repeated per settlement)
- ✅ Tab navigation separates settlement details
- ✅ Transaction timeline shows auth → capture → settlement
- ✅ Items grouped by category with discount percentages
- ✅ Quick actions available (Refund, Export, Invoice)
- ✅ Billing verification status displayed
- ✅ Receipt tracking shows sent status
- ✅ Clear differentiation: 1 payment method vs 3 settlement transactions

---

## Technical Considerations

### Version 1
**Dependencies:** None
**Breaking Changes:** None
**Migration:** Not required
**Testing:** Regression testing on existing payment flows

### Version 2
**Dependencies:**
- May need Timeline component (or build custom)
- Card component enhancement

**Breaking Changes:** Settled items table → list format
**Migration:** Update mock data with payment timestamps
**Testing:**
- Visual regression testing
- Multi-payment scenarios
- Responsive breakpoints

### Version 3
**Dependencies:**
- Chart library (Recharts already available)
- Enhanced payment type system
- Item categorization service

**Breaking Changes:**
- Payment data structure expansion
- Tab-based navigation pattern

**Migration:**
- API changes for enhanced transaction data
- Database schema updates for receipt tracking
- Item category taxonomy setup

**Testing:**
- Full E2E testing of all payment scenarios
- Analytics accuracy verification
- Action button workflows (refund, receipt resend)

---

## Design Tokens

### Colors - Transaction Status
```css
--tx-authorization: #EAB308  /* Yellow for authorized */
--tx-settlement: #22C55E     /* Green for settled */
--tx-refunded: #64748B       /* Gray for refunded */
--tx-failed: #EF4444         /* Red for failed */
```

### Spacing - Payment Cards
```css
--payment-card-gap: 16px         /* Version 1-2 */
--payment-card-gap-v3: 24px      /* Version 3 dashboard */
--payment-card-padding: 16px     /* Internal padding */
--billing-section-margin: 24px   /* After header */
```

### Typography
```css
--payment-amount-size: 20px      /* Large amount display */
--payment-method-size: 16px      /* Payment method name */
--item-name-size: 14px           /* Product name in list */
--sku-size: 13px                 /* SKU monospace */
```

---

## Accessibility Checklist

### All Versions
- [ ] ARIA labels for all interactive elements
- [ ] Keyboard navigation for collapse/expand
- [ ] Screen reader announcements for payment status
- [ ] Sufficient color contrast (WCAG AA minimum)
- [ ] Focus indicators visible and clear

### Version 3 Specific
- [ ] Chart data available as table alternative
- [ ] Tab navigation keyboard accessible
- [ ] Action buttons have descriptive labels
- [ ] Timeline progress screen reader friendly
- [ ] KPI cards announce values correctly

---

## Mobile Responsiveness

### Version 1
- Stack payment cards vertically (already done)
- Billing name/address stack on mobile
- Table remains scrollable horizontally

### Version 2
- Payment sequence numbers more prominent on mobile
- Timeline connectors become horizontal
- Two-column billing becomes single column < 640px
- Bullet list wraps gracefully

### Version 3
- KPI cards: 2×2 grid on mobile
- Tabs become horizontal scroll
- Grouped items categories collapsible by default
- Quick actions become dropdown menu
- Chart switches to bar format (vertical)

---

## Performance Considerations

### Version 1
- No performance impact (removes elements)
- May actually improve render time

### Version 2
- Timeline connectors: CSS-based (no JS overhead)
- Payment cards: Lazy render when > 5 payments
- Item list: Same performance as current table

### Version 3
- Chart library: Lazy load when tab visible
- Tab navigation: Render active tab only
- Item categorization: Memoize calculation
- KPI calculations: Use useMemo hook
- Consider virtualization if > 10 payments

---

## Future Enhancements

### Beyond Version 3

1. **Payment History Timeline**
   - Show all historical transactions for order
   - Including voids, refunds, adjustments

2. **Real-time Payment Status**
   - WebSocket updates for payment state changes
   - Live authorization → settlement tracking

3. **Payment Analytics Dashboard**
   - Separate page for payment operations analysis
   - Trends, success rates, average transaction times

4. **Smart Refund Calculator**
   - Select items to refund
   - Automatically calculate proportional refund amount
   - Preview refund impact

5. **Payment Method Recommendations**
   - Suggest optimal payment split based on cart
   - ML-based fraud risk indicators

---

## Appendix: Current Pain Point Examples

### Example 1: Redundant Information
```
Current UI shows:
- Transaction Type: Authorization (text)
- [AUTHORIZATION] badge
- Amount to be charged: ฿1,875.25
- Amount charged: ฿1,875.25

Version 1 shows only:
- [AUTHORIZATION] badge
- Amount charged: ฿1,875.25
```

### Example 2: Hidden Item Count
```
Current UI:
User must expand payment card to see item count

Version 2:
CREDIT_CARD (6 items) - visible in collapsed state
```

### Example 3: Payment Allocation Confusion
```
Current UI:
Three separate payment cards, no indication of sequence or relationship

Version 2:
Payment 1/3 → Payment 2/3 → Payment 3/3
Visual timeline shows payment flow
```

---

## Conclusion

This wireframe provides three progressive enhancement levels for the Payments tab redesign:

- **Version 1** delivers quick wins by removing redundancy and improving information hierarchy
- **Version 2** introduces better visual structure with timelines, sequences, and smarter layouts
- **Version 3** transforms the tab into a complete payment operations dashboard

**Recommended approach:** Implement Version 1 immediately, plan Version 2 for next quarter, and use Version 3 as long-term vision for user research and design validation.

