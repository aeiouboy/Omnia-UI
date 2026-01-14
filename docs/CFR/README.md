# CFR Implementation Prompts

This directory contains prompts for `adw_chore_implement` to implement CFR (Central Food Retail) features.

## Prompt Overview

| # | File | Feature Area | Priority |
|---|------|--------------|----------|
| 1 | [prompt-01-order-filter-validation.md](./prompt-01-order-filter-validation.md) | Order Filter & Export | Independent |
| 2 | [prompt-02-order-detail-enhancements.md](./prompt-02-order-detail-enhancements.md) | Order Detail Fields | Independent |
| 3 | [prompt-03-inventory-view-type-gate.md](./prompt-03-inventory-view-type-gate.md) | Inventory View Type Gate | **Foundation** |
| 4 | [prompt-04-inventory-detail-enhancements.md](./prompt-04-inventory-detail-enhancements.md) | Inventory Detail UOM | Depends on #3 |
| 5 | [prompt-05-stock-card-modifications.md](./prompt-05-stock-card-modifications.md) | Stock Card Changes | Depends on #3 |
| 6 | [prompt-06-inventory-detail-by-store.md](./prompt-06-inventory-detail-by-store.md) | Inventory by Store | Depends on #3, #5 |
| 7 | [prompt-07-stock-config-channel.md](./prompt-07-stock-config-channel.md) | Stock Config Channel | Independent |
| 8 | [prompt-08-order-analysis-summary.md](./prompt-08-order-analysis-summary.md) | Order Analysis Charts | Independent |

## Execution Order Recommendation

### Phase 1: Foundation (Run First)
1. **Prompt 3** - View Type Gate (Foundation for all inventory features)

### Phase 2: Parallel Execution
These can run in parallel:
- **Prompt 1** - Order Filter Validation
- **Prompt 2** - Order Detail Enhancements
- **Prompt 7** - Stock Config Channel
- **Prompt 8** - Order Analysis Summary

### Phase 3: Inventory Features (Sequential)
Run after Phase 1 completes:
1. **Prompt 4** - Inventory Detail UOM
2. **Prompt 5** - Stock Card Modifications
3. **Prompt 6** - Inventory Detail by Store

## Usage

```bash
# Run a single prompt
./adws/adw_chore_implement.py "$(cat docs/CFR/prompt-01-order-filter-validation.md)"

# Or copy prompt content directly
./adws/adw_chore_implement.py "Implement order page filtering validation..."
```

## Key Changes Summary

### Order Module
- Disable ALL Quick Filters
- Validate basic + advanced filtering
- 6-month export date restriction
- Add Shipping Fee and Delivery Type fields

### Inventory Module
- View Type selection gate (must select first)
- Remove Channel filter (applied by View Type)
- Add UOM field to detail pages
- Validate all transaction types in filters

### Stock Card
- Disable grid view (table only)
- Add Store ID column
- Disable Store Status
- View Type inherited from Inventory page

### Stock Config
- Add Channel field (TOL, MKP, QC)
- Multi-channel = multiple rows

### Order Analysis
- Stacked bar charts for Order/Day and Revenue/Day
- 5 channels: Grab, Line Man, Gokoo, TOL, MKP
- Export button with CSV output
- Export columns: Date, Total Amount, Order Count by Channel (TOL, MKP, QC)

## Reference

Created: 2026-01-14
Last Updated: 2026-01-14
