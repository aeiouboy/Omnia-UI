# Wireframe: Payment Settlement Item Breakdown

**adw_id:** `payment-settlement-item-breakdown`
**Created:** 2026-01-31
**Status:** Draft
**Priority:** Medium

## Overview

Add expandable item breakdown within each payment settlement/transaction card to show which specific order items were settled by each payment method. This is particularly useful for split payment scenarios where different items or portions of items are charged to different payment transactions.

## Business Context

### Problem Statement
Currently, the Payments tab shows multiple payment transactions but doesn't indicate which specific items (or portions) were settled by each transaction. For split payments across 2-3+ transactions, users cannot determine:
- Which items were charged to which transaction
- How items were split across multiple payments
- Item-level payment allocation details

### Use Cases
1. **Split Payment Analysis**: Customer service needs to identify which items were charged to a specific credit card
2. **Partial Refunds**: Need to know which transaction to refund for specific items
3. **Payment Reconciliation**: Accounting needs item-level breakdown per transaction
4. **Dispute Resolution**: Identify exact items associated with a disputed charge

### Current State Analysis
- **Location**: `src/components/order-detail/payments-tab.tsx`
- **Current Structure**:
  - Payment Methods (3) section displays each transaction as a collapsible card
  - Each card shows: Payment method, status badge, transaction type badge, amount
  - Expanded view shows: Card details, transaction type, amounts
  - **Missing**: No item-level breakdown per transaction

---

## Version 1: Clean Item Cards (Minimal - RECOMMENDED)

### Approach
Add a "Settled Items" section within the expanded payment card showing item cards with product name, SKU, and quantity badge - matching the Fulfillment tab style.

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ [Icon] CREDIT_CARD  [PAID] [SETTLEMENT]         ฿1,875.25 ▼│
├─────────────────────────────────────────────────────────────┤
│ CREDIT CARD:          525669XXXXXX0005                      │
│ Expiry Date:          **/****                               │
│ Transaction Type:     Settlement                            │
│ Amount to be charged: ฿1,875.25                             │
│ Amount charged:       ฿1,875.25                             │
│                                                             │
│ ─── Settled Items (5) ────────────────────────────────────│
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Girl Pants Hello Kitty Blue                          x2││
│ │ CDS23582996 • 2PCS                                      ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Girl Leggings Hello Kitty Red                        x1││
│ │ CDS23583115 • 1PCS                                      ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Toddler Shorts Blue                                  x1││
│ │ CDS24077910 • 1PCS                                      ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Cinnamoroll Dress Pink                               x1││
│ │ CDS24089123 • 1PCS                                      ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Data Requirements
```typescript
interface PaymentTransaction {
  // existing fields...
  transactionType?: TransactionType;
  settledItems?: SettledItem[];
}

interface SettledItem {
  lineId: string;           // References order item ID
  productName: string;      // Item display name
  sku: string;              // Product SKU/ID
  quantity: number;         // Quantity settled by this transaction
  uom?: string;             // Unit of measure (PCS, SBTL, etc.)
}
```

### Design Notes
- **Payment total remains visible**: The ฿1,875.25 amount stays on the payment card header
- **No individual item pricing**: Items show SKU + quantity only, no per-item amounts
- **Visual consistency**: Matches the "Shipped Items" design from Fulfillment tab
- **Clean hierarchy**: Product name bold, metadata (SKU • qty) in gray text

### Pros
- ✅ Clean, card-based design matching Fulfillment tab
- ✅ Shows SKU for reference and verification
- ✅ Clear quantity badge (x1, x2, etc.) on the right
- ✅ Minimal visual complexity
- ✅ Good for basic item tracking
- ✅ Consistent with existing UI patterns
- ✅ Mobile-friendly card layout
- ✅ Payment total clearly visible on card header

### Cons
- ❌ No pricing per item (user only sees payment total)
- ❌ No product images
- ❌ Basic information only (no promotions/discounts)

### Implementation Notes
- Add "Settled Items" section after payment details
- Use light gray background cards (`bg-gray-50`)
- Product name in bold/semibold
- SKU and quantity on second line in gray text
- Quantity badge on right side (`x1`, `x2` format)
- Show item count in header: "Settled Items (5)"
- 4-8px gap between item cards
- Default to expanded state (always visible when payment card expanded)

---

## Version 2: Item Table with Amounts (Detailed)

### Approach
Display settled items in a structured table format showing product details, quantities, and amounts per item.

### Layout
```
┌────────────────────────────────────────────────────────────────────────┐
│ [Icon] CREDIT_CARD  [PAID] [SETTLEMENT]              ฿1,875.25 ▼      │
├────────────────────────────────────────────────────────────────────────┤
│ CREDIT CARD:          525669XXXXXX0005                                 │
│ Expiry Date:          **/****                                          │
│ Transaction Type:     Settlement                                       │
│ Amount to be charged: ฿1,875.25                                        │
│ Amount charged:       ฿1,875.25                                        │
│                                                                        │
│ ─── Settled Items (5) ───────────────────────────────────────────────│
│                                                                        │
│ ┌──────────────────────────────┬──────────────┬─────┬────────────┐   │
│ │ Product Name                 │ SKU          │ Qty │ Amount     │   │
│ ├──────────────────────────────┼──────────────┼─────┼────────────┤   │
│ │ Girl Pants Hello Kitty Blue  │ CDS23582996  │  2  │ ฿478.00   │   │
│ │ Girl Leggings Hello Kitty Red│ CDS23583115  │  1  │ ฿692.88   │   │
│ │ Toddler Shorts Blue          │ CDS24077910  │  1  │ ฿253.75   │   │
│ │ Cinnamoroll Dress Pink       │ CDS24089123  │  1  │ ฿450.62   │   │
│ │                              │              │     │            │   │
│ │ Subtotal                     │              │  5  │ ฿1,875.25 │   │
│ └──────────────────────────────┴──────────────┴─────┴────────────┘   │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### Data Requirements
```typescript
interface SettledItem {
  lineId: string;           // References order item ID
  productName: string;      // Item display name
  sku: string;              // Product SKU/ID (displayed in table)
  thaiName?: string;        // Optional Thai name
  quantity: number;         // Quantity settled
  unitPrice: number;        // Price per unit
  itemAmount: number;       // Total for this item (qty × price)
  discountAmount?: number;  // Item-level discount
  taxAmount?: number;       // Item-level tax
}

interface PaymentTransaction {
  // existing fields...
  settledItems?: SettledItem[];
  settledItemsCount?: number;  // Quick count
  settledItemsTotal?: number;  // Sum of item amounts
}
```

### Pros
- ✅ Complete item-level detail
- ✅ Clear pricing breakdown
- ✅ Professional table format
- ✅ Shows subtotal validation
- ✅ Good for reconciliation

### Cons
- ❌ More complex to implement
- ❌ Takes up more vertical space
- ❌ May need horizontal scroll on mobile

### Implementation Notes
- Use responsive table with 4 columns: Product Name, SKU, Qty, Amount
- Show subtotal row at bottom (SKU column empty)
- Add "View All Items" link if items > 10 (expand/collapse)
- Support sorting by amount, name, or SKU
- Highlight discounted items with strikethrough original price
- On mobile (<768px): Convert to stacked cards with SKU shown below product name
- SKU column uses monospace font for better readability

---

## Version 3: Grouped Item Cards with Visual Hierarchy (Rich)

### Approach
Display settled items as visually rich cards with product images, detailed pricing breakdown, and support for partial item allocation.

### Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ [Icon] CREDIT_CARD  [PAID] [SETTLEMENT]           ฿1,875.25 ▼  │
├─────────────────────────────────────────────────────────────────┤
│ CREDIT CARD:          525669XXXXXX0005                          │
│ Expiry Date:          **/****                                   │
│ Transaction Type:     Settlement                                │
│ Amount to be charged: ฿1,875.25                                 │
│ Amount charged:       ฿1,875.25                                 │
│                                                                 │
│ ─── Settled Items (5 items) ──────────────────────────────────│
│                                                                 │
│ ┌─────────────────────────────────────────────────────────┐   │
│ │ [IMG] Kuromi T-Shirt                          ฿478.00   │   │
│ │       บอน อโรมา โกลด์ กาแฟผงสำเร็จรูปฟรีซดราย            │   │
│ │       SKU: 5904277114444                                │   │
│ │       Quantity: 2 × ฿239.00                             │   │
│ │       Discount: -฿29.32                                 │   │
│ └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────┐   │
│ │ [IMG] Hello Kitty Pants                       ฿692.88   │   │
│ │       เฮลโหล คิตตี้ กางเกง                               │   │
│ │       SKU: 8850487123456                                │   │
│ │       Quantity: 1 × ฿740.76                             │   │
│ │       Discount: -฿47.88  [PROMO: Red Hot]               │   │
│ └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────┐   │
│ │ [IMG] Toddler Shorts (Partial)                ฿253.75   │   │
│ │       เสื้อผ้าเด็ก กางเกงขาสั้น                          │   │
│ │       SKU: 8851234567890                                │   │
│ │       Allocated: 0.7 of 3 units (70%)                   │   │
│ │       [Progress Bar: 70% filled]                        │   │
│ └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│ ... (show more / collapse)                                      │
│                                                                 │
│ ─────────────────────────────────────────────────────────────│
│ Subtotal (5 items)                                 ฿1,875.25   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Data Requirements
```typescript
interface SettledItem {
  lineId: string;
  productId: string;
  productName: string;
  thaiName?: string;
  sku: string;
  barcode?: string;
  imageUrl?: string;

  // Quantity allocation
  settledQuantity: number;     // Qty settled by this transaction
  totalOrderedQuantity: number; // Total qty in order
  isPartialAllocation: boolean; // true if settled < ordered
  allocationPercentage?: number; // % of item settled (0-100)

  // Pricing
  unitPrice: number;
  itemSubtotal: number;        // qty × unitPrice
  discountAmount?: number;
  taxAmount?: number;
  itemTotal: number;           // Final amount for settled qty

  // Promotions
  appliedPromotions?: {
    promotionId: string;
    promotionName: string;
    promotionType: string;
    discountAmount: number;
  }[];
}

interface PaymentTransaction {
  // existing fields...
  settledItems?: SettledItem[];
  settledItemsSummary: {
    totalItems: number;
    totalQuantity: number;
    subtotal: number;
    discounts: number;
    taxes: number;
    total: number;
  };
}
```

### Pros
- ✅ Rich visual experience
- ✅ Shows product images
- ✅ Detailed promotion info
- ✅ Supports partial item allocation
- ✅ Progress indicators for split items
- ✅ Best for complex scenarios

### Cons
- ❌ Most complex implementation
- ❌ Requires image loading
- ❌ Performance impact with many items
- ❌ Takes significant vertical space
- ❌ May overwhelm simple use cases

### Implementation Notes
- Lazy load product images
- Virtual scrolling for 10+ items
- Add "Show X more items" button for items beyond first 5
- Use skeleton loading for images
- Add filter/search for 20+ items
- Show visual indicator for partial allocation (progress bar)
- Badge for promotional items

---

## Comparison Matrix

| Feature | Version 1: Clean Cards | Version 2: Table | Version 3: Rich Cards |
|---------|----------------------|------------------|---------------------|
| **Complexity** | Low | Medium | High |
| **Dev Time** | 2-3 days | 4-5 days | 7-10 days |
| **Visual Appeal** | Clean & Modern | Professional | Rich |
| **Mobile Friendly** | ✅ Excellent | ⚠️ Requires horizontal scroll | ⚠️ Long vertical scroll |
| **Pricing Detail** | ❌ None (payment total only) | ✅ Full per item | ✅ Full + promotions |
| **Partial Allocation** | ❌ No | ⚠️ Text only | ✅ Visual progress |
| **Product Images** | ❌ No | ❌ No | ✅ Yes |
| **Performance** | ✅ Fast | ✅ Fast | ⚠️ Moderate |
| **Use Case** | Item tracking | Reconciliation | Customer service |
| **API Changes** | Minimal | Moderate | Significant |
| **UI Consistency** | ✅ Matches Fulfillment tab | ⚠️ New pattern | ⚠️ New pattern |

---

## Recommended Phased Approach

### Phase 1: Version 1 (MVP)
**Target:** Quick win for basic item tracking
- Implement simple item list
- Add to existing payment card expansion
- No API changes if item data already available
- **Timeline:** 1-2 sprints

### Phase 2: Version 2 (Standard)
**Target:** Professional reconciliation tool
- Upgrade to table format
- Add pricing breakdown
- Subtotal validation
- **Timeline:** 2-3 sprints

### Phase 3: Version 3 (Premium)
**Target:** Rich customer service experience
- Add product images
- Visual partial allocation
- Promotion details
- Search/filter capabilities
- **Timeline:** 3-4 sprints

---

## Data Mapping Requirements

### API Changes Needed
Currently, `PaymentTransaction` interface exists but may not include item-level settlement data. Need to:

1. **Extend Payment API Response**:
   ```typescript
   // Backend should provide settlement allocation
   GET /api/orders/{orderId}/payments

   Response:
   {
     paymentDetails: [
       {
         id: "PAY-001",
         method: "CREDIT_CARD",
         amount: 1875.25,
         settledItems: [
           {
             lineId: "LINE-001",
             productName: "Kuromi T-Shirt",
             quantity: 2,
             amount: 478.00
           },
           // ... more items
         ]
       }
     ]
   }
   ```

2. **Settlement Allocation Logic**:
   - For single payment: All items belong to that transaction
   - For split payment: Backend must specify allocation
   - Default fallback: Pro-rata allocation by amount

3. **Mock Data Updates** (for testing):
   - Update `maoOrderCDS260121226285` to include `settledItems[]` in each `paymentDetails` entry
   - Add partial allocation examples
   - Include promotional item examples

---

## Technical Implementation Notes

### Component Structure
```typescript
// New component for Version 1
components/order-detail/payment-settled-items.tsx
  - SettledItemsList
  - SettledItemCard (clean card matching Fulfillment tab style)

// Enhanced for Version 2
components/order-detail/payment-settled-items-table.tsx
  - SettledItemsTable
  - SettledItemRow

// Premium for Version 3
components/order-detail/payment-settled-items-cards.tsx
  - SettledItemsGrid
  - SettledItemCard
  - PartialAllocationIndicator
```

### State Management
```typescript
// payments-tab.tsx
const [expandedItems, setExpandedItems] = useState<string[]>([]);

// Toggle settled items visibility per payment
const toggleSettledItems = (paymentId: string) => {
  setExpandedItems(prev =>
    prev.includes(paymentId)
      ? prev.filter(id => id !== paymentId)
      : [...prev, paymentId]
  );
};
```

### Mobile Optimization
- **Version 1**: Stack items vertically, no changes needed
- **Version 2**: Convert table to stacked cards on mobile (<640px)
- **Version 3**: Single column card layout, reduce image size

---

## Acceptance Criteria

### Version 1
- [ ] Settled items cards display within expanded payment card
- [ ] Each card shows product name, SKU, quantity badge (x1, x2, etc.)
- [ ] Card styling matches Fulfillment tab ("Shipped Items" style)
- [ ] Light gray background cards with proper spacing
- [ ] Item count displayed in section header "Settled Items (5)"
- [ ] Works with single and split payments
- [ ] No TypeScript errors
- [ ] Mobile responsive (cards stack vertically)
- [ ] UOM display (1PCS, 2PCS, etc.) next to SKU

### Version 2
- [ ] All Version 1 criteria met
- [ ] Table format with 4 columns: Product Name, SKU, Qty, Amount
- [ ] SKU column displays product identifier
- [ ] Subtotal row shows sum validation (SKU column empty)
- [ ] Responsive table layout (mobile converts to stacked cards)
- [ ] Sorting by amount, name, or SKU (optional)
- [ ] Shows discount info if applicable
- [ ] SKU uses monospace font for readability

### Version 3
- [ ] All Version 2 criteria met
- [ ] Product images load correctly
- [ ] Partial allocation shows progress indicator
- [ ] Promotion badges display
- [ ] Thai product names display
- [ ] Lazy loading for images
- [ ] "Show more" pagination for 5+ items
- [ ] Search/filter for 20+ items (optional)

---

## Testing Strategy

### Test Scenarios
1. **Single Payment Order**: All items in one transaction
2. **Split Payment (2 methods)**: Items divided evenly
3. **Split Payment (3 methods)**: Items divided unevenly
4. **Partial Item Allocation**: Same item split across 2 payments
5. **Promotional Items**: Items with discounts/promotions
6. **Large Order**: 20+ items in split payment
7. **Mobile View**: All versions on mobile viewport

### Test Orders
- **CDS260121226285**: 3 payments, 13 items (ideal for Version 3)
- **CDS251229874674**: 2 payments, mixed items
- **W1156251121946800**: Single payment, 7 items (Version 1)

---

## Future Enhancements

### Beyond Version 3
- **Export settled items per payment**: CSV/PDF export
- **Print receipt per transaction**: Individual payment receipts
- **Settlement history timeline**: Show settlement status changes
- **Refund item selection**: Select items from settled list for refund
- **Analytics**: Payment method preference by item category

---

## Questions for Stakeholders

1. **Data Availability**: Does the payment gateway API provide item-level settlement allocation?
2. **Business Rules**: How should partial item allocation be calculated? Pro-rata by amount?
3. **Priority**: Which version provides the most business value for initial release?
4. **Refund Integration**: Will this be used for refund processing workflows?
5. **Performance**: How many items typically per order? Per payment?

---

## Migration Path

### From Current State → Version 1
1. Add `settledItems[]` to `PaymentTransaction` interface
2. Create `SettledItemsList` component
3. Update mock data with settled items
4. Add section to `payments-tab.tsx` collapsible content
5. Style with existing design system

### From Version 1 → Version 2
1. Create `SettledItemsTable` component
2. Add responsive table styles
3. Implement subtotal calculation
4. Add mobile card fallback

### From Version 2 → Version 3
1. Extend data model with images, promotions
2. Create `SettledItemCard` component
3. Implement lazy image loading
4. Add progress indicators
5. Performance testing with large datasets

---

## Wireframe Visual Reference

See screenshot: `current-payment-settlement-view.png` for current implementation baseline.

**Next Steps**:
1. Review 3 versions with product team
2. Select target version based on priority/timeline
3. Validate data availability from payment API
4. Create detailed implementation spec for selected version
