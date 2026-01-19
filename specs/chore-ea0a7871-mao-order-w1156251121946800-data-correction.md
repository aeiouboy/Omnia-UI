# Chore: MAO Order W1156251121946800 Comprehensive Data Correction

## Metadata
adw_id: `ea0a7871`
prompt: `COMPREHENSIVE MAO ORDER DATA CORRECTION: Update ALL mock data fields to exactly match MAO system for order W1156251121946800 - covering Overview, Items, Payments, Fulfillment, and Tracking tabs`

## Chore Description
The mock data for MAO order W1156251121946800 in `src/lib/mock-data.ts` contains fabricated data that doesn't match the actual MAO (Manhattan Active Omnia) system. This comprehensive update will correct ALL fields across all tabs (Overview, Items, Payments, Fulfillment, and Tracking) to match the verified MAO data captured via Playwright on 2026-01-18.

Key corrections include:
- Customer information (name, email, phone, T1 number, tax ID)
- Shipping address (street, subdistrict, city, state, postal code)
- Order flags (fullTaxInvoice, allowSubstitution, t1Member)
- Payment information (card number, transaction ID, amounts)
- Billing information (billing name and address - new fields)
- Fulfillment timeline (new pre-defined timeline array)
- Tracking data (tracking number, shipped from, ETA, release number, subdistrict)
- Item details (correct SKUs, product names, UOMs, unit prices)

## Relevant Files
Use these files to complete the chore:

- **src/lib/mock-data.ts** (lines 2317-3465) - Primary file containing the MAO order mock data
  - `maoOrderW1156251121946800Items` array (lines 2317-3299) - Line items with incorrect SKUs and product names
  - `maoOrderW1156251121946800` object (lines 3302-3462) - Main order object with incorrect customer, shipping, payment, and tracking data
  - `generateFulfillmentTimeline` function (lines 1700-1780) - Needs modification to support pre-defined fulfillment timeline

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Customer Object (Overview Tab)
- Locate lines 3312-3320 in `src/lib/mock-data.ts`
- Replace the `customer` object with:
```typescript
customer: {
  id: 'CUST-W115625-001',
  name: 'WEERAPAT WIRUNTANGTRAKUL',
  email: 'wee.wirun@gmail.com',
  phone: '0804411221',
  customerType: 'INDIVIDUAL',
  custRef: '2403601305',
  T1Number: '8048068914',
  taxId: '1100900457471',
  customerTypeId: 'cluster_3 - Prime'
}
```

### 2. Update Shipping Address (Overview Tab)
- Locate lines 3321-3327 in `src/lib/mock-data.ts`
- Replace the `shipping_address` object with:
```typescript
shipping_address: {
  street: '59/20 หมู่ 11 หมู่บ้านยูเทรียมพลัสวัน ซอยวัดพระเงิน',
  subdistrict: 'Bang Muang',
  city: 'Bang Yai',
  state: 'Nonthaburi',
  postal_code: '11140',
  country: 'TH'
}
```

### 3. Update Order Flags (Overview Tab)
- Locate the following fields in `maoOrderW1156251121946800`:
  - `fullTaxInvoice` (line 3449): change from `false` to `true`
  - `allowSubstitution` (line 3451): change from `false` to `true`
  - `allow_substitution` (line 3452): change from `false` to `true`
  - `t1Member` (line 3455): change from `'T1-9876543210'` to `'8048068914'`
  - `customerTypeId` (line 3450): change from `'CT-IND'` to `'cluster_3 - Prime'`

### 4. Add Billing Information (Payments Tab - New Fields)
- Add `billingName` and `billingAddress` fields after `confirmedDate` (around line 3456):
```typescript
billingName: 'วีรภัทร วิรุฬห์ตั้งตระกูล',
billingAddress: {
  street: '59/20 หมู่ 11 หมู่บ้านยูเทรียมพลัสวัน',
  subdistrict: 'Bang Muang',
  city: 'Bang Yai',
  state: 'Nonthaburi',
  postal_code: '11140',
  country: 'TH'
}
```

### 5. Add Fulfillment Timeline (Fulfillment Tab - New Field)
- Add `fulfillmentTimeline` array to `maoOrderW1156251121946800` object (before the closing brace):
```typescript
fulfillmentTimeline: [
  {
    id: 'FUL-HD-W1156251121946800-001',
    status: 'Picking',
    timestamp: '2025-11-21T10:45:30',
    details: 'Items being picked from store'
  },
  {
    id: 'FUL-HD-W1156251121946800-002',
    status: 'Picked',
    timestamp: '2025-11-21T11:06:35',
    details: 'All items picked'
  },
  {
    id: 'FUL-HD-W1156251121946800-003',
    status: 'Packed',
    timestamp: '2025-11-21T11:29:32',
    details: 'Order packed and ready'
  },
  {
    id: 'FUL-HD-W1156251121946800-004',
    status: 'Ready To Ship',
    timestamp: '2025-11-21T11:30:33',
    details: 'Order ready for carrier pickup'
  }
]
```

### 6. Modify generateFulfillmentTimeline Function
- Locate the function at line 1700 in `src/lib/mock-data.ts`
- Add a check at the beginning of the function (after line 1704) to return pre-defined timeline if available:
```typescript
// If order has pre-defined fulfillmentTimeline, use it
if (orderData?.fulfillmentTimeline && Array.isArray(orderData.fulfillmentTimeline)) {
  return orderData.fulfillmentTimeline
}
```

### 7. Update Tracking Data (Tracking Tab)
- Locate lines 3457-3461 in `src/lib/mock-data.ts`
- Update the tracking fields:
  - `trackingNumber`: change from `'TRK-W115625-001'` to `'TRKW1156251121946800'`
  - `eta`: change from `'21 Nov 2025 12:00 - 13:00'` to `'11/21/2025'`
  - `relNo`: change from `'REL-2025-W115625'` to `'W11562511219468001'`
- Add new field after `relNo`:
  - `subdistrict: 'Bang Muang'`

### 8. Update Delivery Methods Recipient (Fulfillment Tab)
- Locate the `deliveryMethods` array (lines 3418-3432)
- Update `homeDelivery` object:
  - `recipient`: change from `'คุณสมชาย ใจดี'` to `'WEERAPAT WIRUNTANGTRAKUL'`
  - `phone`: change from `'+66891234567'` to `'0804411221'`
  - `address`: change from `'123/45 หมู่บ้านเมืองทอง ถนนแจ้งวัฒนะ'` to `'59/20 หมู่ 11 หมู่บ้านยูเทรียมพลัสวัน ซอยวัดพระเงิน'`
  - `district`: change from `'ปากเกร็ด'` to `'Bang Muang'`
  - `city`: change from `'นนทบุรี'` to `'Bang Yai'`
  - `postalCode`: change from `'11120'` to `'11140'`

### 9. Update Item SKUs and Product Names (Items Tab)
Update the following items in `maoOrderW1156251121946800Items`:

**Item 1: Bon Aroma Coffee (3 split lines: LINE-W115625-001-0, -1, -2)**
- `product_sku`: change from `'8851123456789'` to `'5904277114444'`
- `product_name`: change from `'Bon Aroma Classic Roast Coffee 200g'` to `'Bon Aroma Gold Freeze Dried Coffee 100g'`
- `thaiName`: change to `'บอน อโรมา โกลด์ กาแฟผงสำเร็จรูปฟรีซดราย 100ก.'`
- `barcode`: change to `'5904277114444'`
- `uom`: change from `'EA'` to `'SBTL'`

**Item 2: Betagro Egg Tofu (2 split lines: LINE-W115625-002-0, -1)**
- `product_sku`: change from `'8858998123456'` to `'8852043003485'`
- `product_name`: change from `'Betagro Egg Tofu 300g'` to `'Betagro Egg Tofu 120g'`
- `thaiName`: change to `'เบทาโกร เต้าหู้ไข่ 120ก.'`
- `barcode`: change to `'8852043003485'`
- `uom`: change from `'EA'` to `'STUB'`

**Item 3: Smarter Dental Floss (1 line: LINE-W115625-003)**
- `product_sku`: change from `'8851234567890'` to `'8853474057764'`
- `product_name`: change from `'Smarter Dental Floss 50m'` to `'Smarter Dental Floss Picks 50pcs'`
- `thaiName`: change to `'สมาร์ทเทอร์ ไหมขัดฟันพร้อมด้าม 50ชิ้น'`
- `barcode`: change to `'8853474057764'`
- `unit_price`: change from `65` to `45`
- `total_price`: change from `65` to `45`
- `uom`: change from `'EA'` to `'SPAC'`
- Update `priceBreakdown` accordingly

**Item 4: Tops Frozen Salmon (4 split lines: LINE-W115625-004-0, -1, -2, -3)**
- `product_sku`: change from `'8852345678901'` to `'8853474080366'`
- `product_name`: change from `'Tops Frozen Salmon Steak 200g'` to `'Tops Frozen Salmon Steak 150g'`
- `thaiName`: change to `'ท็อปส์ สเต็กแซลมอนแช่แข็ง 150ก.'`
- `barcode`: change to `'8853474080366'`
- `uom`: change from `'EA'` to `'SPCS'`

**Item 5: N&P Hom Banana (1 line: LINE-W115625-005)**
- `product_sku`: change from `'8853456789012'` to `'8858738405534'`
- `product_name`: change from `'N&P Hom Banana 1kg'` to `'N&P Hom Banana Pack 2(C'`
- `thaiName`: change to `'เอ็น แอนด์ พี กล้วยหอม แพ็ค 2(C'`
- `barcode`: change to `'8858738405534'`
- `unit_price`: change from `55` to `28`
- `total_price`: change from `55` to `28`
- `uom`: change from `'KG'` to `'SPAC'`
- Update `priceBreakdown` accordingly

**Item 6: Thammachart Seafood (4 split lines: LINE-W115625-006-0, -1, -2, -3)**
- `product_sku`: change from `'8854567890123'` to `'8858781403990'`
- `product_name`: change from `'Thammachart Seafood Salmon Fillet 200g'` to `'Thammachart Seafood Frozen Atlantic Salmon Steak'`
- `thaiName`: change to `'ธรรมชาติซีฟู้ด สเต็กแซลมอนแอตแลนติกแช่แข็ง'`
- `barcode`: change to `'8858781403990'`
- `uom`: change from `'EA'` to `'SPCS'`

**Item 7: Cubic Wheat Loaf (2 split lines: LINE-W115625-007-0, -1)**
- `product_sku`: change from `'8855678901234'` to `'8858894100014'`
- `product_name`: change from `'Cubic Wheat Loaf 400g'` to `'Cubic Original Wheat Loaf(C'`
- `thaiName`: change to `'คิวบิก ขนมปังโฮลวีทออริจินัล(C'`
- `barcode`: change to `'8858894100014'`
- `uom`: change from `'EA'` to `'SPCS'`

### 10. Validate Build
- Run `pnpm build` to ensure no TypeScript errors
- Run `pnpm lint` to ensure code style compliance

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure TypeScript compilation succeeds with no errors
- `pnpm lint` - Ensure code style compliance
- `grep -n "WEERAPAT WIRUNTANGTRAKUL" src/lib/mock-data.ts` - Verify customer name updated
- `grep -n "wee.wirun@gmail.com" src/lib/mock-data.ts` - Verify email updated
- `grep -n "8048068914" src/lib/mock-data.ts` - Verify T1 number updated
- `grep -n "5904277114444" src/lib/mock-data.ts` - Verify Bon Aroma SKU updated
- `grep -n "8852043003485" src/lib/mock-data.ts` - Verify Betagro SKU updated
- `grep -n "525667XXXXXX4575" src/lib/mock-data.ts` - Verify card number present
- `grep -n "TRKW1156251121946800" src/lib/mock-data.ts` - Verify tracking number updated
- `grep -n "Bang Muang" src/lib/mock-data.ts` - Verify subdistrict present
- `grep -n "fulfillmentTimeline" src/lib/mock-data.ts` - Verify fulfillment timeline added

## Validation Checklist
- [ ] pnpm build passes
- [ ] Overview: Customer = 'WEERAPAT WIRUNTANGTRAKUL'
- [ ] Overview: Email = 'wee.wirun@gmail.com'
- [ ] Overview: The1 = '8048068914'
- [ ] Items: Bon Aroma SKU = '5904277114444'
- [ ] Items: Betagro SKU = '8852043003485'
- [ ] Payments: Card = '525667XXXXXX4575'
- [ ] Fulfillment: Shows Picking at 2025-11-21T10:45:30
- [ ] Fulfillment: Shows Ready To Ship at 2025-11-21T11:30:33
- [ ] Tracking: Tracking# = 'TRKW1156251121946800'
- [ ] Tracking: Subdistrict = 'Bang Muang'

## Notes
- The order has 7 unique products but 17 line items due to quantity splitting (each unit is a separate line item)
- Payment info (card number, transaction ID) is already correct in current mock data - verify and preserve
- The fulfillmentTimeline is a new field that requires modifying the generateFulfillmentTimeline function to check for pre-defined timelines
- All Thai text should be preserved for localization purposes
- UOM changes (EA to SBTL, STUB, SPAC, SPCS) reflect actual MAO system values
- Order totals remain the same: Subtotal 1850, Discounts 917, Total 933, Taxes 32.53
