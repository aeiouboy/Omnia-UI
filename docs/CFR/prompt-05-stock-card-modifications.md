# Prompt 5: Stock Card Page Modifications

Modify Stock Card page per requirements:

## View Mode Changes
- DISABLE grid view on Stock Card page
- Keep ONLY table view
- Remove grid view toggle/button

## Add Store ID Field
- Add 'Store ID' column to Stock Card table
- Make it searchable and sortable

## Disable Store Status
- Remove or disable 'Store status' column/filter from Stock Card page

## View Type Inheritance
- If user accesses Stock Card from store view, do NOT show view type filter again
- View Type is already selected from Inventory Management page
- 'Channel' field automatically applied from View Type selection on first step
- Stock Card displays only stores that match selected View Type conditions

## Files to investigate:
- app/inventory/stores/ - Stock Card page (inventory by store)
- src/components/inventory/ - Stock card components
