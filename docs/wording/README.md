# Naming Standardization Prompts

This directory contains ADW prompts for standardizing wording/naming across the Omnia-UI codebase.

## How to Run

Execute each prompt file using:

```bash
uv run adws/adw_chore_implement.py "$(cat docs/wording/01-item-vs-product-terminology.txt)"
```

Or run individually:

```bash
# 1. Item vs Product Terminology
uv run adws/adw_chore_implement.py "$(cat docs/wording/01-item-vs-product-terminology.txt)"

# 2. Quantity Column Names
uv run adws/adw_chore_implement.py "$(cat docs/wording/02-quantity-column-names.txt)"

# 3. Store Table Header
uv run adws/adw_chore_implement.py "$(cat docs/wording/03-store-table-header.txt)"

# 4. Stock Status Internal Naming
uv run adws/adw_chore_implement.py "$(cat docs/wording/04-stock-status-internal-naming.txt)"

# 5. All Option Labels Specificity
uv run adws/adw_chore_implement.py "$(cat docs/wording/05-all-option-labels-specificity.txt)"

# 6. Supply Type Value Standardization
uv run adws/adw_chore_implement.py "$(cat docs/wording/06-supply-type-value-standardization.txt)"

# 7. Channel vs Selling Channel
uv run adws/adw_chore_implement.py "$(cat docs/wording/07-channel-vs-selling-channel.txt)"

# 8. Config Terminology
uv run adws/adw_chore_implement.py "$(cat docs/wording/08-config-terminology.txt)"

# 9. Search Placeholder Consistency
uv run adws/adw_chore_implement.py "$(cat docs/wording/09-search-placeholder-consistency.txt)"

# 10. Stock Status Card Labels
uv run adws/adw_chore_implement.py "$(cat docs/wording/10-stock-status-card-labels.txt)"
```

## Prompt Files

| File | Description | Files Affected |
|------|-------------|----------------|
| `01-item-vs-product-terminology.txt` | Standardize Item ID → Product ID | `app/inventory-new/supply/page.tsx` |
| `02-quantity-column-names.txt` | Standardize quantity column names | `app/inventory-new/supply/page.tsx`, `app/inventory-new/page.tsx` |
| `03-store-table-header.txt` | Store → Store Name | `app/inventory-new/stores/page.tsx`, `src/components/recent-transactions-table.tsx` |
| `04-stock-status-internal-naming.txt` | critical → outOfStock, healthy → inStock | `src/types/inventory.ts`, `src/lib/inventory-service.ts`, `app/inventory-new/page.tsx` |
| `05-all-option-labels-specificity.txt` | Make "All" labels specific | `app/inventory-new/supply/page.tsx`, `app/inventory-new/page.tsx`, `src/components/recent-transactions-table.tsx` |
| `06-supply-type-value-standardization.txt` | On Hand Available → On Hand | `app/inventory-new/supply/page.tsx` |
| `07-channel-vs-selling-channel.txt` | sellingChannel → channel | `src/components/order-management-hub.tsx` |
| `08-config-terminology.txt` | Config dropdown labels | `app/inventory-new/page.tsx` |
| `09-search-placeholder-consistency.txt` | Search placeholder format | `app/inventory-new/supply/page.tsx`, `app/inventory-new/stores/page.tsx`, `app/inventory-new/page.tsx` |
| `10-stock-status-card-labels.txt` | KPI card titles | `app/inventory-new/stores/page.tsx`, `app/inventory-new/page.tsx` |

## Recommended Standard Names

| Concept | Standard Name |
|---------|---------------|
| Product identifier | **Product ID** or **Barcode** |
| Product name | **Product Name** |
| Store identifier | **Store ID** |
| Store name | **Store Name** |
| Available quantity | **Available Qty** |
| Total quantity | **Total Qty** |
| Out of stock status | **Out of Stock** |
| Low stock status | **Low Stock** |
| In stock status | **In Stock** |
| Channel | **Channel** |
| Configuration | **Stock Config** |
