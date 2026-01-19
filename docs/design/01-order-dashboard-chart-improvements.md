# Order Dashboard Chart Improvements

## ADW Command
```bash
uv run adws/adw_chore_implement.py 'Improve Order Dashboard charts at app/orders/analysis/page.tsx and src/components/order-analysis-view.tsx:
1. Ensure chart legends (TOL, MKP) are fully visible and not cut off at the bottom
2. Add consistent padding/margin below charts for legend visibility
3. Consider moving legends to the top-right of each chart for better visibility
4. Ensure Revenue by Channel chart is fully visible without scrolling
Files: src/components/order-analysis/stacked-order-chart.tsx, src/components/order-analysis/stacked-revenue-chart.tsx'
```

## Issue Description
The Order Dashboard page has stacked bar charts for Orders by Channel and Revenue by Channel. The chart legends may be cut off at the bottom of the viewport.

## Files to Modify
- `app/orders/analysis/page.tsx`
- `src/components/order-analysis-view.tsx`
- `src/components/order-analysis/stacked-order-chart.tsx`
- `src/components/order-analysis/stacked-revenue-chart.tsx`

## Expected Outcome
- Chart legends fully visible without scrolling
- Consistent spacing below charts
- Better legend placement for improved readability
