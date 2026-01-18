# Empty State Consistency

## ADW Command
```bash
uv run adws/adw_chore_implement.py 'Standardize empty state designs across Inventory Availability and Stock Card pages:
1. Use consistent icon size and style for empty state illustrations
2. Ensure empty state messages use same typography (font size, weight, color)
3. Add consistent vertical centering for empty state content
4. Consider adding a subtle background color or border to the empty state container
Files: app/inventory-new/supply/page.tsx, app/inventory-new/stores/page.tsx'
```

## Issue Description
Empty states on Inventory Availability and Stock Card pages need visual consistency.

## Files to Modify
- `app/inventory-new/supply/page.tsx`
- `app/inventory-new/stores/page.tsx`

## Expected Outcome
- Matching icon sizes and styles
- Consistent typography for messages
- Proper vertical centering
- Subtle visual container for empty states
