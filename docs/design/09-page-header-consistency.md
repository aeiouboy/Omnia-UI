# Page Header Consistency

## ADW Command
```bash
uv run adws/adw_chore_implement.py 'Standardize page header layout across all pages:
1. Ensure page title and description have consistent spacing from top
2. Align Refresh button position consistently (top-right of content area)
3. Standardize description text length and wrapping behavior
4. Add consistent margin between header and filter section
Files: app/orders/analysis/page.tsx, src/components/order-management-hub.tsx, app/inventory-new/supply/page.tsx, app/inventory-new/stores/page.tsx'
```

## Issue Description
Page headers across different pages have inconsistent spacing and button placement.

## Files to Modify
- `app/orders/analysis/page.tsx`
- `src/components/order-management-hub.tsx`
- `app/inventory-new/supply/page.tsx`
- `app/inventory-new/stores/page.tsx`

## Expected Outcome
- Consistent header spacing across all pages
- Aligned Refresh button positions
- Consistent description text styling
- Uniform margin between header and content
