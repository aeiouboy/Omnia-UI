# Prompt 2: Order Detail Page - Payment & Delivery Enhancements

Add new fields to Order Detail page:

## Payment Information Section
- Add 'Shipping Fee' field AFTER the 'Charge' field
- Display shipping fee based on sell channel
- Format as currency (Thai Baht)

## Delivery Address Section
- Add 'Delivery Type' field to show delivery type at order level
- Support these delivery type values:
  - RT-HD-EXP (Retail Home Delivery Express)
  - RT-CC-STD (Retail Click & Collect Standard)
  - MKP-HD-STD (Marketplace Home Delivery Standard)
  - RT-HD-STD (Retail Home Delivery Standard)
  - RT-CC-EXP (Retail Click & Collect Express)

## Files to investigate:
- app/orders/[id]/ - Order detail page
- src/components/order-detail/ - Order detail components
- src/types/ - Type definitions for orders
