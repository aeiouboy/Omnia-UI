# Stock Card & Navigation - Complete Clickable Fields Mapping

**Status**: ✅ **COMPREHENSIVE** - All Clickable Navigation Elements Documented

---

## 📋 Overview

This document maps all clickable fields and elements within the Stock Card submenu and its navigational hierarchy, showing which fields can be clicked to open other pages.

**Navigation Hierarchy**:
```
Stock Card (/inventory-new/stores)
├── Store Rows (Clickable) → Store Detail (/inventory-new?store={name})
│   └── Product Rows (Clickable) → Product Detail (/inventory-new/{productId}?store={name})
│       └── Order References (Clickable) → Order Management (/orders/{orderId})
```

---

## 🔗 Level 1: Stock Card Page (/inventory-new/stores)

### Clickable Fields That Open Pages

| # | Element | Type | Action | Navigation Target | Data |
|---|---------|------|--------|-------------------|------|
| 1 | Store Name Row | Row (clickable) | Click entire row | `/inventory-new?store={storeName}` | Opens store inventory detail |
| 2 | Store ID in Row | Row (clickable) | Click row (any column) | `/inventory-new?store={storeName}` | Same as store name (entire row) |
| 3 | Total Products (number) | Row (clickable) | Click row | `/inventory-new?store={storeName}` | Entire row navigates to store |
| 4 | Low Stock (number) | Row (clickable) | Click row | `/inventory-new?store={storeName}` | Entire row navigates to store |
| 5 | Out of Stock (number) | Row (clickable) | Click row | `/inventory-new?store={storeName}` | Entire row navigates to store |

### Sample Store Rows (All Clickable)

```
1. Tops Central Plaza ลาดพร้าว (CFR3841) → /inventory-new?store=Tops%20Central%20Plaza%20%E0%B8%A5%E0%B8%B2%E0%B8%94%E0%B8%9E%E0%B8%A3%E0%B9%89%E0%B8%B2%E0%B8%A7
2. Tops Central World (CFR1819) → /inventory-new?store=Tops%20Central%20World
3. Tops สุขุมวิท 39 (CFR2669) → /inventory-new?store=Tops%20%E0%B8%AA%E0%B8%B8%E0%B8%82%E0%B8%B8%E0%B8%A1%E0%B8%A7%E0%B8%B4%E0%B8%97%2039
4. Tops ทองหล่อ (CFR7914) → /inventory-new?store=Tops%20%E0%B8%97%E0%B8%AD%E0%B8%87%E0%B8%AB%E0%B8%A5%E0%B9%88%E0%B8%AD
5. Tops สีลม คอมเพล็กซ์ (CFR6299) → /inventory-new?store=Tops%20%E0%B8%AA%E0%B8%B5%E0%B8%A5%E0%B8%A1%20%E0%B8%84%E0%B8%AD%E0%B8%A1%E0%B9%80%E0%B8%9E%E0%B8%A5%E0%B9%87%E0%B8%81%E0%B8%A0%E0%B9%8C
6. Tops เอกมัย (CFR4284) → /inventory-new?store=Tops%20%E0%B9%80%E0%B8%AD%E0%B8%81%E0%B8%A1%E0%B8%B1%E0%B8%A2
7. Tops พร้อมพงษ์ (CFR6180) → /inventory-new?store=Tops%20%E0%B8%9E%E0%B8%A3%E0%B9%89%E0%B8%AD%E0%B8%A1%E0%B8%9E%E0%B8%87%E0%B8%A9%E0%B9%8C
8. Tops จตุจักร (CFR7820) → /inventory-new?store=Tops%20%E0%B8%88%E0%B8%95%E0%B8%B8%E0%B8%88%E0%B8%B1%E0%B8%81%E0%B8%A3
```

### Non-Clickable Fields (No Navigation)

| Element | Type | Purpose |
|---------|------|---------|
| View Type Dropdown | Dropdown filter | Filters current page data |
| Search Store ID | Text input | Searches current page data |
| Search Store Name | Text input | Searches current page data |
| Clear All Button | Filter button | Clears filters on current page |
| Column Headers | Sortable | Sorts current page data |
| Refresh Button | Refresh button | Reloads current page data |

---

## 🔗 Level 2: Store Detail Page (/inventory-new?store={storeName})

**URL Examples**:
- `/inventory-new?store=Tops%20Central%20World` (store=Tops Central World)
- `/inventory-new?store=Tops%20%E0%B8%AA%E0%B8%B8%E0%B8%82%E0%B8%B8%E0%B8%A1%E0%B8%A7%E0%B8%B4%E0%B8%97%2039` (store with Thai name)

### Clickable Fields That Open Pages

| # | Element | Type | Action | Navigation Target | Data |
|---|---------|------|--------|-------------------|------|
| 1 | Product Name (row) | Row (clickable) | Click entire product row | `/inventory-new/{productId}?store={storeName}` | Opens product detail |
| 2 | Product Image | Row (clickable) | Click row (includes image) | `/inventory-new/{productId}?store={storeName}` | Entire row navigates to product |
| 3 | Barcode (number) | Row (clickable) | Click row | `/inventory-new/{productId}?store={storeName}` | Entire row navigates to product |
| 4 | Brand Name | Row (clickable) | Click row | `/inventory-new/{productId}?store={storeName}` | Entire row navigates to product |
| 5 | Item Type | Row (clickable) | Click row | `/inventory-new/{productId}?store={storeName}` | Entire row navigates to product |
| 6 | Stock Status Badge | Row (clickable) | Click row | `/inventory-new/{productId}?store={storeName}` | Entire row navigates to product |
| 7 | Available/Total Qty | Row (clickable) | Click row | `/inventory-new/{productId}?store={storeName}` | Entire row navigates to product |

### Sample Product Rows (All Clickable)

**Store**: Tops Central World
**Sample Product Navigations**:

```
1. Betagen Fermented Milk 400ml (885000000001)
   → /inventory-new/AUTO-ECOM-TH-CFR-LOCD-STD-1?store=Tops%20Central%20World

2. Betagro Chicken Breast Skinless (2000001000002)
   → /inventory-new/AUTO-ECOM-TH-CFR-LOCD-STD-2?store=Tops%20Central%20World

3. Cavendish Bananas (2000001000001)
   → /inventory-new/AUTO-ECOM-TH-CFR-LOCD-STD-3?store=Tops%20Central%20World

4. Kikkoman Soy Sauce (885000000017)
   → /inventory-new/AUTO-ECOM-TH-CFR-LOCD-STD-4?store=Tops%20Central%20World

5. S-Pure Chicken Beast Fillet (885000000025)
   → /inventory-new/AUTO-ECOM-TH-CFR-LOCD-STD-5?store=Tops%20Central%20World

6. Schwepes Manao Soda (8851959000001)
   → /inventory-new/AUTO-ECOM-TH-CFR-LOCD-STD-6?store=Tops%20Central%20World

7. Tipco Orange Juice (8851011000001)
   → /inventory-new/AUTO-ECOM-TH-CFR-LOCD-STD-7?store=Tops%20Central%20World
```

### Non-Clickable Fields (No Navigation)

| Element | Type | Purpose |
|---------|------|---------|
| Back to Store Overview | Button | Returns to stock card page |
| Search Product Name | Text input | Filters products on current page |
| Search Barcode | Text input | Filters products on current page |
| Item Types Filter | Dropdown | Filters products on current page |
| Stock Config Filter | Dropdown | Filters products on current page |
| Brands Filter | Dropdown | Filters products on current page |
| Tab Headers (All/Low/Out) | Tabs | Switches between product tabs |
| Refresh Button | Button | Reloads current page |

---

## 🔗 Level 3: Product Detail Page (/inventory-new/{productId}?store={storeName})

**URL Examples**:
- `/inventory-new/AUTO-ECOM-TH-CFR-LOCD-STD-1?store=Tops%20Central%20World`

### Clickable Fields That Open Pages

| # | Element | Type | Action | Navigation Target | Data |
|---|---------|------|--------|-------------------|------|
| 1 | Order Reference (ORD-XXXX) | Link (blue text) | Click order link | `/orders/{orderId}` | Navigates to Order Management |
| 2 | Transfer Reference (TRF-XXXX) | Link (blue text) | Click transfer link | `/orders/{transferId}` | Navigates to Order/Transfer details |

### Sample Clickable Order/Transfer References

**Product**: Betagen Fermented Milk 400ml
**Store**: Tops Central World

```
Recent Transactions with Clickable References:
1. Order fulfillment(ORD-4445) → /orders/4445
   - Stock Out: -39 units on Jan 15, 2026, 02:08 AM

2. Order cancellation(ORD-6075) → /orders/6075
   - Return: +5 units on Jan 13, 2026, 09:34 PM

3. Customer return(ORD-1326) → /orders/1326
   - Return: +19 units on Jan 12, 2026, 01:40 AM

4. Promotional sale(ORD-6099) → /orders/6099
   - Stock Out: -55 units on Jan 10, 2026, 05:55 AM

5. Regional rebalancing(TRF-1757) → Transfer details
   - transfer: +26 units on Jan 8, 2026, 11:15 PM
```

### Non-Clickable Fields (No Navigation)

| Element | Type | Purpose |
|---------|------|---------|
| Back to Inventory | Button | Returns to store inventory page |
| Export CSV | Button | Exports transaction data |
| Stock Breakdown Cards | Cards | Display stock allocation info |
| Stock Level History | Chart | Displays 30-day trend |
| Transaction Search | Text input | Filters transaction table |
| Transaction Type Filter | Dropdown | Filters transactions |
| Date Range Filter | Textbox | Filters transactions |

---

## 📊 Complete Navigation Mapping Table

| Level | Page | URL Pattern | Clickable Element | Opens | Count |
|-------|------|-------------|-------------------|-------|-------|
| 1 | Stock Card | `/inventory-new/stores` | Store rows | Level 2 | 8 stores |
| 2 | Store Detail | `/inventory-new?store={name}` | Product rows | Level 3 | ~7 products |
| 3 | Product Detail | `/inventory-new/{productId}?store={name}` | Order refs | Level 4 | Variable |
| 4 | Order Management | `/orders/{orderId}` | — | — | Final page |

---

## 🎯 Clickable Fields Summary

### Total Clickable Navigation Elements

| Level | Page Name | Clickable Elements | Opens |
|-------|-----------|-------------------|-------|
| **1** | Stock Card | 8 store rows (× 5 columns each) = 40 clickable cells | Store details |
| **2** | Store Detail | ~7 product rows (× 7 columns each) = ~49 clickable cells | Product details |
| **3** | Product Detail | Variable order/transfer refs (4-10 per product) | Order management |
| **TOTAL** | — | **89+ clickable navigation elements** | **4-level deep hierarchy** |

---

## 🔍 Clickable Element Characteristics

### Row-Level Clicking
- **Entire rows are clickable** in Stock Card and Store Detail pages
- Any column within a row navigates to the same destination
- Visual feedback: `cursor-pointer` on hover, hover background color change
- Clicking anywhere in the row triggers navigation

### Link-Level Clicking
- **Order/Transfer references** are styled as links (blue text, underlined)
- Clicking extracts the reference ID and navigates to Order Management
- Format: `(ORD-{id})` or `(TRF-{id})`

### Non-Clickable Elements
- Column headers (sort only)
- Filter inputs and dropdowns
- Buttons (Refresh, Export, Back)
- Input fields for search/filtering

---

## 📱 User Navigation Flow

### Typical User Journey (Clickable Path)

```
1. START: Stock Card Page (/inventory-new/stores)
   └─ User clicks on store row

2. NAVIGATE TO: Store Detail (/inventory-new?store=Tops Central World)
   └─ Shows 7 products for that store
   └─ User clicks on product row

3. NAVIGATE TO: Product Detail (/inventory-new/AUTO-ECOM-TH-CFR-LOCD-STD-1?store=...)
   └─ Shows stock breakdown, history, recent transactions
   └─ User sees order references in transactions table
   └─ User clicks on (ORD-4445) link

4. NAVIGATE TO: Order Management (/orders/4445)
   └─ Final destination: Order detail view
```

---

## 🔗 URL Structure and Query Parameters

### Stock Card Level
```
URL: /inventory-new/stores
No parameters needed
```

### Store Detail Level
```
URL: /inventory-new?store={storeName}
Parameters:
  - store: "Tops Central World" (encoded in URL)
```

### Product Detail Level
```
URL: /inventory-new/{productId}?store={storeName}
Parameters:
  - {productId}: "AUTO-ECOM-TH-CFR-LOCD-STD-1" (path param)
  - store: "Tops Central World" (query param)
```

### Order Management Level
```
URL: /orders/{orderId}
Parameters:
  - {orderId}: "4445" (path param)
```

---

## 📝 Implementation Notes

### Click Handlers
- Row click handlers use `useRouter()` from Next.js
- Navigation via `router.push()` with encoded URLs
- Store name URL-encoded with `encodeURIComponent()`
- Product ID extracted from component state

### Scroll Position
- Navigation between pages does NOT preserve scroll position
- Each page loads at top of content
- Browser back button returns to previous page (preserves scroll)

### Navigation Context
- Store name propagated through URL query parameter
- Allows product detail page to show "back to store" navigation
- Maintains context across multiple pages

---

## ✨ Features

✅ 8 clickable store rows
✅ ~7 clickable product rows per store
✅ Variable order/transfer reference links
✅ 4-level deep navigation hierarchy
✅ URL parameter persistence
✅ Row-level click handlers
✅ Link-level click handlers
✅ Visual feedback (cursor, hover effects)
✅ Back navigation support

---

## Document Information

- **Version**: 1.0
- **Created**: 2026-01-20
- **Total Clickable Elements**: 89+
- **Navigation Levels**: 4
- **Status**: ✅ Complete & Verified

**Related Pages**:
- `/inventory-new/stores` - Stock Card
- `/inventory-new?store={name}` - Store Detail
- `/inventory-new/{productId}?store={name}` - Product Detail
- `/orders/{orderId}` - Order Management
