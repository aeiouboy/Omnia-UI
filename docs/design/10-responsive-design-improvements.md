# Responsive Design Improvements

## ADW Command
```bash
uv run adws/adw_chore_implement.py 'Improve responsive behavior for tablet/smaller desktop screens:
1. Order Management: Make table horizontally scrollable with fixed Order Number column
2. Inventory Availability: Stack search fields in 2x2 grid on medium screens
3. Stock Card: Ensure table columns resize gracefully
4. Order Dashboard: Stack KPI cards 2x2 on medium screens instead of 3x1
Files: src/components/order-management-hub.tsx, app/inventory-new/supply/page.tsx, app/inventory-new/stores/page.tsx, src/components/order-analysis-view.tsx'
```

## Issue Description
Pages need better responsive behavior for tablet and smaller desktop screens.

## Files to Modify
- `src/components/order-management-hub.tsx`
- `app/inventory-new/supply/page.tsx`
- `app/inventory-new/stores/page.tsx`
- `src/components/order-analysis-view.tsx`

## Expected Outcome
- Horizontally scrollable tables with sticky columns
- Responsive filter layouts
- Graceful column resizing
- Better KPI card stacking on medium screens
