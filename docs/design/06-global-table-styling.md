# Global Table Styling Consistency

## ADW Command
```bash
uv run adws/adw_chore_implement.py 'Standardize table styling across all pages:
1. Ensure consistent row height across Order Management, Inventory Availability, and Stock Card tables
2. Standardize badge/pill styling for status indicators (On Hand, Pre-Order, PAID, PENDING, etc.)
3. Make sortable column headers visually consistent with sort indicator placement
4. Add hover state for clickable rows in Stock Card
5. Ensure numeric columns (quantities, totals) are right-aligned consistently
Files: src/components/order-management-hub.tsx, app/inventory-new/supply/page.tsx, src/components/inventory/stock-by-store-table.tsx'
```

## Issue Description
Tables across different pages have inconsistent styling for rows, badges, and column alignment.

## Files to Modify
- `src/components/order-management-hub.tsx`
- `app/inventory-new/supply/page.tsx`
- `src/components/inventory/stock-by-store-table.tsx`

## Expected Outcome
- Consistent row heights across all tables
- Standardized badge styling
- Consistent sort indicator design
- Right-aligned numeric columns
- Clear hover states for interactive rows
