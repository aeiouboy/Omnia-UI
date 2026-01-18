# Order Management Filter Layout

## ADW Command
```bash
uv run adws/adw_chore_implement.py 'Improve Order Management filter layout at src/components/order-management-hub.tsx:
1. Reorganize Main Filters section - group related filters together (Status dropdowns in one row, Date fields in another)
2. Make the search input field wider to accommodate longer order numbers
3. Align Order Date From and Order Date To fields horizontally with equal width
4. Add visual separation between filter groups
5. Consider making filter dropdowns consistent width for visual alignment'
```

## Issue Description
The Order Management page has multiple filters that could be better organized for improved usability and visual consistency.

## Files to Modify
- `src/components/order-management-hub.tsx`

## Expected Outcome
- Better organized filter groups
- Wider search input for long order numbers
- Consistent dropdown widths
- Clear visual separation between filter groups
