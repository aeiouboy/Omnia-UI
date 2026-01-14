# Prompt 6: Inventory Detail by Store Enhancements

Enhance Inventory Detail by Store page:

## Add UOM Field
- Add 'UOM' (Unit of Measure) field after barcode field
- Same as regular Inventory Detail page

## Recent Transactions Validation
- Validate transaction filtering works correctly
- All transaction types should be available in filter

## Keep Product Information Section
- **KEEP 'Product Information' section** on Inventory Detail by Store page
- Display product details as normal

## Remove Store Information Section
- Remove 'Store Information' section (No need store information)
- User already selected store from Stock Card page, so store info is redundant

## Channel Field Inheritance
- 'Channel' field applied from Inventory Detail by Store page
- User selects store since Stock Card page, channel context is maintained
- Do not show redundant channel filter

## Files to investigate:
- app/inventory/stores/[storeId]/ - Store inventory detail
- src/components/inventory/ - Related components
