# Stock Card - By Product View Wireframe

## Overview

This wireframe specifies the "By Product" view for the Stock Card page (`/inventory-new/stores`). The By Product view displays transaction history for a specific product at a specific store, with filtering and export capabilities similar to the Recent Transactions table on the Product Detail page.

**Route**: `/inventory-new/stores`
**Tab**: By Product (Default)

---

## Page Layout

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  Stock Card                                                                     │
│  View transaction history for a specific product                                │
│                                                      ┌─────────────┬──────────┐ │
│                                                      │ By Product  │ By Store │ │
│                                                      └─────────────┴──────────┘ │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─ MANDATORY FILTERS (Row 1) ─────────────────────────────────────────────────┐│
│  │                                                                              ││
│  │ ┌─ Date Range ──────────────────┐   │   ┌─ Product ───────────────────────┐ ││
│  │ │ [From Date ▼] - [To Date ▼]   │   │   │ [🔍 Product ID] [🔍 Product Name]│ ││
│  │ └───────────────────────────────┘       └──────────────────────────────────┘ ││
│  │                                                                              ││
│  │       │   ┌─ Store ─────────────────────────────────────────────────────────┐││
│  │           │ [🔍 Store ID...] [🔍 Store Name...]                             │││
│  │           └─────────────────────────────────────────────────────────────────┘││
│  └──────────────────────────────────────────────────────────────────────────────┘│
│                                                                                 │
│  ┌─ OPTIONAL FILTERS (Row 2) ──────────────────────────────────────────────────┐│
│  │                                                                              ││
│  │ [🔍 Search in notes...]        [Transaction Type ▼]                         ││
│  │                                                                              ││
│  │                                         [Refresh] [Clear All] [Export CSV]  ││
│  └──────────────────────────────────────────────────────────────────────────────┘│
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─ TRANSACTION HISTORY TABLE ─────────────────────────────────────────────────┐│
│  │                                                                              ││
│  │  Transaction History                                                         ││
│  │  125 transactions found                                                      ││
│  │                                                                              ││
│  │ ┌────────────────┬──────────────────┬──────────┬─────────┬─────────────────┐││
│  │ │ Date & Time    │ Transaction Type │ Quantity │ Balance │ Notes           │││
│  │ ├────────────────┼──────────────────┼──────────┼─────────┼─────────────────┤││
│  │ │ Jan 21, 2026   │ [↑ Stock In]     │   +50    │   450   │ John: Received  │││
│  │ │ 10:30 AM       │                  │          │         │ from warehouse  │││
│  │ ├────────────────┼──────────────────┼──────────┼─────────┼─────────────────┤││
│  │ │ Jan 21, 2026   │ [↓ Stock Out]    │   -25    │   400   │ Order fulfilled │││
│  │ │ 09:15 AM       │                  │          │         │ (ORD-12345)     │││
│  │ ├────────────────┼──────────────────┼──────────┼─────────┼─────────────────┤││
│  │ │ Jan 20, 2026   │ [⟳ Adjustment]   │   +10    │   425   │ Admin: Stock    │││
│  │ │ 04:45 PM       │                  │          │         │ count correction│││
│  │ ├────────────────┼──────────────────┼──────────┼─────────┼─────────────────┤││
│  │ │ Jan 20, 2026   │ [↓ Stock Out]    │   -15    │   415   │ Order fulfilled │││
│  │ │ 02:30 PM       │                  │          │         │ (ORD-12340)     │││
│  │ └────────────────┴──────────────────┴──────────┴─────────┴─────────────────┘││
│  │                                                                              ││
│  │ ┌──────────────────────────────────────────────────────────────────────────┐││
│  │ │ Show [25 ▼] per page    Showing 1-25 of 125 records    [< Prev] [Next >] │││
│  │ └──────────────────────────────────────────────────────────────────────────┘││
│  └──────────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Component Specifications

### 1. Mandatory Filters Section

These filters are **required** before data can be loaded. Fields with orange borders indicate incomplete mandatory filters.

#### Date Range Filter
| Property | Value |
|----------|-------|
| Label | "Date Range" |
| Fields | From Date, To Date (calendar pickers) |
| Format | "MMM d, yyyy" (e.g., "Jan 21, 2026") |
| Validation | Both dates required |
| Visual | Orange border when not selected |

#### Product Search Filter
| Property | Value |
|----------|-------|
| Label | "Product" |
| Fields | Product ID (search), Product Name (search) |
| Minimum | 2 characters required |
| Validation | At least one field must have 2+ characters |
| Visual | Orange border when criteria not met |

#### Store Search Filter
| Property | Value |
|----------|-------|
| Label | "Store" |
| Fields | Store ID (search), Store Name (search) |
| Minimum | 2 characters required |
| Validation | At least one field must have 2+ characters |
| Visual | Orange border when criteria not met |

---

### 2. Optional Filters Section

These filters refine the data after mandatory filters are applied.

#### Notes Search Filter
| Property | Value |
|----------|-------|
| Placeholder | "Search in notes..." |
| Width | min-w-[250px] |
| Search targets | Notes text, reference IDs, person names |
| Debounce | 400ms |

#### Transaction Type Filter
| Property | Value |
|----------|-------|
| Type | Dropdown (Select) |
| Width | w-[180px] |
| Default | "All Types" |
| Options | See Transaction Types table below |

**Transaction Type Options:**
| Value | Label |
|-------|-------|
| all | All Types |
| STOCK_IN | Stock In |
| STOCK_OUT | Stock Out |
| ADJUSTMENT | Adjustment |

---

### 3. Action Buttons

| Button | Icon | Action | Disabled When |
|--------|------|--------|---------------|
| Refresh | RefreshCw | Reload transaction data | Loading or mandatory filters incomplete |
| Clear All | - | Reset all filters to default | All filters already at default |
| Export CSV | Download | Download filtered transactions as CSV | No transactions to export |

---

### 4. Transaction History Table

#### Table Columns

| Column | Width | Alignment | Description |
|--------|-------|-----------|-------------|
| Date & Time | w-[200px] | Left | Formatted as "MMM dd, yyyy hh:mm AM/PM" |
| Transaction Type | w-[140px] | Left | Badge with icon and label |
| Quantity | w-[100px] | Right | Signed number (+/-) with color |
| Balance | w-[100px] | Right | Stock balance after transaction |
| Notes | flex | Left | Person name, note text, order reference link |

#### Transaction Type Badge Styles

| Type | Icon | Badge Color | Quantity Color |
|------|------|-------------|----------------|
| Stock In | ↑ ArrowUp | bg-green-100 text-green-700 | text-green-600 (+) |
| Stock Out | ↓ ArrowDown | bg-red-100 text-red-700 | text-red-600 (-) |
| Adjustment | ⟳ RefreshCw | bg-cyan-100 text-cyan-700 | text-cyan-600 (+/-) |

#### Notes Column Format
```
{PersonName}: {NoteText} (ORD-XXXXX)
                         └─ Clickable link to order detail
```

---

### 5. Pagination

| Component | Description |
|-----------|-------------|
| Page Size Selector | Dropdown: 10, 25, 50, 100 (default: 25) |
| Record Count | "Showing X-Y of Z records" |
| Navigation | Previous/Next buttons with page indicator |

---

## Empty States

### No Mandatory Filters Selected
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                      📦 (Package icon, h-16 w-16)              │
│                                                                 │
│            Select a Product and Store to View Stock Card        │
│                                                                 │
│   Please select Date Range, Product (ID or Name), and Store    │
│   (ID or Name) to view transaction history.                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### No Transactions Found
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                   📋 (ClipboardList icon, h-16 w-16)           │
│                                                                 │
│                     No Transactions Found                       │
│                                                                 │
│        No transactions match your current filter criteria.      │
│        Try adjusting the date range or filters.                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Export CSV Format

The exported CSV file should contain:

**Filename:** `stock-card-{ProductID}-{YYYYMMDD}.csv`

**Columns:**
| Column | Format |
|--------|--------|
| Date | YYYY-MM-DD |
| Time | HH:MM:SS |
| Transaction Type | Stock In / Stock Out / Adjustment |
| Quantity | Signed number |
| Balance | Number |
| Person | Name |
| Notes | Full note text |
| Reference | Order reference if applicable |

---

## Mobile Responsive Design

On mobile devices (< md breakpoint), the table transforms to a card layout:

```
┌─────────────────────────────────────────┐
│ [↑ Stock In]              Jan 21, 2026 │
│                              10:30 AM   │
├─────────────────────────────────────────┤
│  Quantity          Balance             │
│     +50               450              │
├─────────────────────────────────────────┤
│  Notes                                  │
│  John: Received from warehouse          │
└─────────────────────────────────────────┘
```

---

## By Store View (No Changes)

The "By Store" tab remains unchanged from its current implementation:

- View Type dropdown filter
- Store ID / Store Name search filters
- Store Performance table with columns:
  - Store Name
  - Store ID
  - Total Products
  - Low Stock
  - Out of Stock
  - Navigation arrow

---

## Data Flow

1. User selects mandatory filters (Date Range + Product + Store)
2. System validates minimum character requirements (2 chars)
3. Data loads via `fetchProductTransactions()` API
4. Optional filters (Transaction Type, Notes Search) applied client-side
5. Paginated results displayed in table
6. Export button generates CSV from filtered results

---

## Technical Notes

- Reuse existing `exportStockCardToCSV()` function from `/lib/stock-card-export.ts`
- Transaction types map to simplified display: RECEIPT_IN/TRANSFER_IN/RETURN -> Stock In, ISSUE_OUT/TRANSFER_OUT -> Stock Out, ADJUSTMENT_PLUS/ADJUSTMENT_MINUS -> Adjustment
- Notes column includes tooltip for truncated content
- Order references (ORD-XXXXX) are clickable links to order detail page
