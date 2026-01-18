# Stock Card Filter Consistency

## ADW Command
```bash
uv run adws/adw_chore_implement.py 'Improve Stock Card page filter consistency at app/inventory-new/stores/page.tsx:
1. Make All Views dropdown width consistent with search fields
2. Align Store ID and Store Name search fields with equal width
3. Add visual indicator showing current filter state
4. Consider adding a Total Stores: X indicator similar to Inventory Availability record count display'
```

## Issue Description
The Stock Card page filters need consistency improvements to match the Inventory Availability page design patterns.

## Files to Modify
- `app/inventory-new/stores/page.tsx`
- `src/components/inventory/stock-by-store-table.tsx`

## Expected Outcome
- Consistent filter field widths
- Visual feedback for active filters
- Store count indicator for better context
