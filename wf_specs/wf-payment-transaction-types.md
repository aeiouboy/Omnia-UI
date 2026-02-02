# Wireframe: Payment Transaction Types

**ADW ID**: wf-payment-transaction-types
**Page**: `/orders` → Order Details → Payments Tab
**Feature**: Add Payment Transaction Type display (Authorization, Settlement, Refunded)

## Current State

The Payments tab currently displays:
1. **Order Payment Header** - Total amount with payment status badge (PAID/PENDING)
2. **Payment Methods** - Collapsible cards showing payment method, status, card details
3. **Billing Information** - Name and address

### Current Payment Method Card Structure
```
┌─────────────────────────────────────────────────────────────┐
│ [Icon] CREDIT_CARD    [PAID]                    ฿20,300.00 ▼│
├─────────────────────────────────────────────────────────────┤
│ CREDIT CARD:        411111XXXXXX1111                        │
│ Expiry Date:        8/2029                                  │
│ Amount to be charged: ฿20,300.00                            │
│ Amount charged:       ฿20,300.00                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Version 1: Transaction Type Badge (Minimal)

**Approach**: Add a transaction type badge next to the payment status badge.

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ [Icon] CREDIT_CARD  [PAID] [SETTLEMENT]         ฿20,300.00 ▼│
├─────────────────────────────────────────────────────────────┤
│ CREDIT CARD:          411111XXXXXX1111                      │
│ Expiry Date:          8/2029                                │
│ Transaction Type:     Settlement                            │
│ Amount to be charged: ฿20,300.00                            │
│ Amount charged:       ฿20,300.00                            │
└─────────────────────────────────────────────────────────────┘
```

### Badge Color Scheme
| Transaction Type | Badge Style |
|-----------------|-------------|
| Authorization | `bg-blue-100 text-blue-700` |
| Settlement | `bg-green-100 text-green-700` |
| Refunded | `bg-orange-100 text-orange-700` |

### Data Requirements
```typescript
interface PaymentMethod {
  // existing fields...
  transactionType: 'AUTHORIZATION' | 'SETTLEMENT' | 'REFUNDED';
}
```

### Pros
- Minimal UI change
- Quick to implement
- Non-breaking change

### Cons
- Limited visibility for transaction history
- Cannot show multiple transaction states

---

## Version 2: Transaction Timeline (Detailed)

**Approach**: Add a transaction history timeline within each payment method card showing the progression: Authorization → Settlement → Refunded (if applicable).

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ [Icon] CREDIT_CARD    [PAID]                    ฿20,300.00 ▼│
├─────────────────────────────────────────────────────────────┤
│ CREDIT CARD:          411111XXXXXX1111                      │
│ Expiry Date:          8/2029                                │
│ Amount to be charged: ฿20,300.00                            │
│ Amount charged:       ฿20,300.00                            │
│                                                             │
│ ─── Transaction History ───────────────────────────────────│
│                                                             │
│  ● Authorization     ฿20,300.00    21/01/2026 10:30:15     │
│  │  Reference: AUTH-2026012100001                          │
│  │                                                          │
│  ● Settlement        ฿20,300.00    21/01/2026 14:22:08     │
│  │  Reference: SETT-2026012100001                          │
│  │                                                          │
│  ○ Refunded          (pending)                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Transaction Status Indicators
| Status | Indicator | Color |
|--------|-----------|-------|
| Completed | ● (filled circle) | Green |
| Pending | ○ (empty circle) | Gray |
| Failed | ✕ (cross) | Red |

### Data Requirements
```typescript
interface TransactionEvent {
  type: 'AUTHORIZATION' | 'SETTLEMENT' | 'REFUNDED';
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  amount: number;
  timestamp: string;
  referenceId?: string;
}

interface PaymentMethod {
  // existing fields...
  transactions: TransactionEvent[];
}
```

### Pros
- Complete transaction visibility
- Shows progression of payment lifecycle
- Useful for customer support and auditing

### Cons
- More complex implementation
- Requires additional API data
- Takes more vertical space

---

## Version 3: Separate Transaction Section (Comprehensive)

**Approach**: Add a new "Payment Transactions" card/section below Payment Methods that lists all transactions in a table format with filtering capability.

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Order Payment              [PAID]               ฿20,300.00  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Payment Methods (1)                                         │
├─────────────────────────────────────────────────────────────┤
│ [Icon] CREDIT_CARD    [PAID]                    ฿20,300.00 ▼│
│ ... (existing card details) ...                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Payment Transactions                                        │
│                                                             │
│ Filter: [All Types ▼] [All Status ▼]                       │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Type          │ Amount     │ Status    │ Date          │ │
│ ├───────────────┼────────────┼───────────┼───────────────┤ │
│ │ Authorization │ ฿20,300.00 │ ✓ Success │ 21/01 10:30   │ │
│ │ Settlement    │ ฿20,300.00 │ ✓ Success │ 21/01 14:22   │ │
│ │ Refunded      │ ฿5,000.00  │ ⏳ Pending│ 22/01 09:15   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Total Authorized: ฿20,300.00                                │
│ Total Settled:    ฿20,300.00                                │
│ Total Refunded:   ฿5,000.00                                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Billing Information                                         │
│ ...                                                         │
└─────────────────────────────────────────────────────────────┘
```

### Mobile Responsive Layout
```
┌───────────────────────────────┐
│ Payment Transactions          │
│                               │
│ [All Types ▼] [All Status ▼] │
│                               │
│ ┌───────────────────────────┐ │
│ │ Authorization             │ │
│ │ ฿20,300.00   ✓ Success    │ │
│ │ 21/01/2026 10:30:15       │ │
│ └───────────────────────────┘ │
│ ┌───────────────────────────┐ │
│ │ Settlement                │ │
│ │ ฿20,300.00   ✓ Success    │ │
│ │ 21/01/2026 14:22:08       │ │
│ └───────────────────────────┘ │
│ ┌───────────────────────────┐ │
│ │ Refunded                  │ │
│ │ ฿5,000.00    ⏳ Pending   │ │
│ │ 22/01/2026 09:15:00       │ │
│ └───────────────────────────┘ │
│                               │
│ Summary                       │
│ Authorized:  ฿20,300.00      │
│ Settled:     ฿20,300.00      │
│ Refunded:    ฿5,000.00       │
└───────────────────────────────┘
```

### Data Requirements
```typescript
interface PaymentTransaction {
  id: string;
  type: 'AUTHORIZATION' | 'SETTLEMENT' | 'REFUNDED';
  amount: number;
  currency: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  timestamp: string;
  referenceId: string;
  paymentMethodId: string; // links to payment method
  metadata?: {
    gatewayResponse?: string;
    errorCode?: string;
    errorMessage?: string;
  };
}

// API Response
interface PaymentTransactionsResponse {
  transactions: PaymentTransaction[];
  summary: {
    totalAuthorized: number;
    totalSettled: number;
    totalRefunded: number;
  };
}
```

### Filter Options
| Filter | Options |
|--------|---------|
| Transaction Type | All Types, Authorization, Settlement, Refunded |
| Status | All Status, Success, Pending, Failed |

### Status Icons
| Status | Icon | Color |
|--------|------|-------|
| Success | ✓ | Green (`text-green-600`) |
| Pending | ⏳ | Yellow (`text-yellow-600`) |
| Failed | ✕ | Red (`text-red-600`) |

### Pros
- Most comprehensive view
- Filterable for specific transaction types
- Shows summary totals
- Scalable for complex payment scenarios (partial refunds, multiple settlements)

### Cons
- Most complex implementation
- Requires new API endpoint or data structure
- More screen real estate needed

---

## Recommendation

**For MVP/Quick Win**: Version 1 (Badge)
- Fast to implement
- Minimal risk
- Can be enhanced later

**For Production/Full Feature**: Version 3 (Separate Section)
- Complete transaction visibility
- Supports complex scenarios (partial refunds)
- Better for customer support operations

---

## Implementation Notes

### Files to Modify
- `src/components/order-detail/payments-tab.tsx` - Main component
- `src/types/payment.ts` - Add transaction type definitions
- `src/lib/mock-data.ts` - Add mock transaction data (if using mocks)

### New Components (Version 3)
- `src/components/order-detail/payment-transactions-table.tsx`
- `src/components/order-detail/transaction-type-badge.tsx`

### API Considerations
- Check if external API provides transaction history
- May need to aggregate from payment gateway logs
- Consider caching strategy for transaction data
