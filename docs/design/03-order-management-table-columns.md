# Order Management Table Column Sizing

## ADW Command
```bash
uv run adws/adw_chore_implement.py 'Optimize Order Management table column widths at src/components/order-management-hub.tsx:
1. Give Order Number column more width to display full order numbers without truncation
2. Reduce width of boolean columns (On Hold, Confirmed, Allow Substitution) - they only show Yes/No
3. Make Order Status and Payment Status columns fixed width to prevent layout shifts
4. Ensure Created Date column has enough width for full date/time display
5. Consider making the table horizontally scrollable on smaller screens'
```

## Issue Description
The Order Management table has 11 columns that may appear cramped. Boolean columns take unnecessary space while important columns like Order Number may be truncated.

## Files to Modify
- `src/components/order-management-hub.tsx`

## Expected Outcome
- Order Number column displays full content
- Boolean columns use minimal width
- Fixed-width status columns prevent layout shifts
- Better table layout on various screen sizes
