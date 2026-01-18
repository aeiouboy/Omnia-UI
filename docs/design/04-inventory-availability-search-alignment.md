# Inventory Availability Search Field Alignment

## ADW Command
```bash
uv run adws/adw_chore_implement.py 'Improve Inventory Availability search field layout at app/inventory-new/supply/page.tsx:
1. Make all search input fields (Store ID, Store Name, Product ID, Product Name) equal width
2. Fix truncated placeholder text - show full text Search Product Name instead of Search Product Na...
3. Align the Supply Type and View Type dropdowns with search fields
4. Add subtle visual grouping - Store fields together, Product fields together
5. Make Clear All button more prominent when filters are active'
```

## Issue Description
The Inventory Availability page has multiple search fields with inconsistent widths and truncated placeholder text.

## Files to Modify
- `app/inventory-new/supply/page.tsx`

## Expected Outcome
- Equal width search fields
- Full placeholder text visible
- Better visual grouping of related fields
- More prominent Clear All button
