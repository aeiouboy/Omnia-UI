# Mock Data Specification: Manhattan OMS Order Status
## Order CDS260121226285

**Source**: Manhattan OMS Contact Center
**URL**: `https://crcpp.omni.manh.com/customerengagementfacade/app/orderstatus?orderId=CDS260121226285&selectedOrg=DS`
**Captured**: 2026-01-22

---

## Customer Information

| Field | Value | Type |
|-------|-------|------|
| Customer Name | ธนวัฒน์ สิงห์แพรก | string (Thai) |
| Phone | 0922643514 | string |
| Email | thanawat4596@gmail.com | string |
| Registration Status | Not Registered | string |

---

## Order Header

| Field | Value | Type | Notes |
|-------|-------|------|-------|
| Order No. | CDS260121226285 | string | Primary identifier |
| Created | 01/21/2026 11:49 +07 | datetime | GMT+7 timezone |
| Order Type | RT-HD-STD | string | Retail-Home Delivery-Standard |
| Full Tax Invoice | false | boolean | |
| Customer Type Id | General | string | |
| The1 Member | 8031630388 | string | Loyalty program ID |
| Selling Channel | Web | string | |
| Allow Substitution | false | boolean | |
| Cust Ref | 2400777864 | string | Customer reference |
| Tax Id | (empty) | string | Optional for tax invoice |
| Company Name | (empty) | string | Optional for B2B |
| Branch No. | (empty) | string | Optional for B2B |
| Store No. | (empty) | string | |
| Related Cases | undefined | string | Link to case management |
| Captured Date | 01/21/2026 11:49 +07 | datetime | |
| Order Status | DELIVERED | enum | DELIVERED, IN_PROCESS, etc. |

---

## Payment Information

| Field | Value | Type | Notes |
|-------|-------|------|-------|
| Payment Method | CREDIT CARD | string | |
| Card Number (Masked) | 525669XXXXXX0005 | string | First 6 + last 4 digits |
| Expiry Date | **/****  | string | Masked |
| Amount to be Charged | ฿4,551.25 | currency | THB |
| Amount Charged | ฿4,551.25 | currency | THB |
| Payment Status | PAID | enum | PAID, PENDING, etc. |
| Billing Address | 88/10 ม.1 ซ.ชัยพรวิถี 14 ถ.ชัยพรวิถี (รบกวนกดปุ่มเปิดประตูขวามือเข้ามาวางข้างในให้หน่อยนะคะ),-,-, หนองปรือ,บางละมุง,ชลบุรี,TH,20150 | string | Thai address format |
| Billing Name | ธนวัฒน์ สิงห์แพรก | string | |

---

## Order Summary (Promotions & Coupons)

| Field | Value | Type |
|-------|-------|------|
| Order Promotions | 0 | number |
| Order Appeasements | 0 | number |
| Order Coupons Applied | 0 | number |

---

## Line Items (14 Total)

### Item 1
| Field | Value | Type |
|-------|-------|------|
| Product Name | Girl T-Shirt Short Sleeves Round Neck Kuromi Viole | string |
| SKU | CDS23576490 | string |
| ETA | 01/23/2026 | date |
| Style | (empty) | string |
| Color | (empty) | string |
| Size | (empty) | string |
| Price | ฿395.00 | currency |
| Quantity | 1 | number |
| UOM | PCS | string |
| Shipping Method | Standard Delivery | string |
| SupplyTypeId | On Hand Available | string |
| Bundle | false | boolean |
| Bundle Ref Id | (empty) | string |
| Packed Ordered Qty | 0 | number |
| Gift with purchase | false | boolean |
| Gift wrapped | (empty) | boolean |
| Secret code | (empty) | string |
| Promotions | 1 | number |
| Coupons | 1 | number |
| Appeasements | 0 | number |

#### Item 1 Quantity Tracking
| Stage | Quantity |
|-------|----------|
| Ordered | 1 |
| Allocated | 1 |
| Released | 1 |
| Fulfilled | 1 |
| Delivered | 1 |

#### Item 1 Pricing
| Field | Value |
|-------|-------|
| Subtotal | ฿395.00 |
| Discount | ฿128.07 |
| Charges | ฿0.00 |
| Taxes | ฿0.00 |
| Total | ฿266.93 |
| Informational Taxes | ฿17.46 |

### Item 2
| Field | Value | Type |
|-------|-------|------|
| Product Name | Girl Pants Wide Legs Kuromi Denim | string |
| SKU | CDS23576551 | string |
| ETA | 01/23/2026 | date |
| Price | ฿645.00 | currency |
| UOM | PCS | string |
| Shipping Method | Standard Delivery | string |
| SupplyTypeId | On Hand Available | string |
| Promotions | 1 | number |
| Coupons | 1 | number |

#### Item 2 Pricing
| Field | Value |
|-------|-------|
| Subtotal | ฿645.00 |
| Discount | ฿209.13 |
| Charges | ฿0.00 |
| Taxes | ฿0.00 |
| Total | ฿435.87 |
| Informational Taxes | ฿28.51 |

### Additional Items (from shipments)
| SKU | Product Name | Qty |
|-----|--------------|-----|
| CDS23582996 | Girl Pants Hello Kitty Blue | 1 |
| CDS23583115 | Girl Leggings Hello Kitty Red | 1 |
| CDS24077910 | Girl Dress Cap Sleeves Hello Kitty Blue | 1 |
| CDS24097840 | Girl Toddler Dress Short Sleeves Gingham Cinnamoro | 1 |
| CDS24098465 | Girl T-Shirt Puff Sleeves Cinnamoroll Light Blue | 1 |
| CDS24097574 | Girl Toddler T-Shirt Puff Sleeves Hello Kitty Whit | 1 |
| CDS24097635 | Girl Toddler Shorts Hello Kitty Cherry Blossom Pin | 1 |
| CDS24098083 | Girl Dress Short Sleeves Gingham Hello Kitty Cherr | 1 |
| CDS24098281 | Girl T-Shirt Short Sleeves Round Neck Hello Kitty | 1 |
| CDS24820752 | Girl Toddler Pyjamas Set Dress Long Sleeves With R | 1 |
| CDS24820776 | Girl Toddler Pyjamas Set Dress Long Sleeves With R | 1 |

---

## Order Total Summary

| Field | Value |
|-------|-------|
| Item Subtotal | ฿9,460.00 |
| Total Discounts | -฿4,908.75 |
| Estimated S&H | +฿0.00 |
| Other Charges* | +฿0.00 |
| Estimated Taxes | +฿0.00 |
| **Order Total** | **฿4,551.25** |
| Informational Taxes | ฿297.70 |

*Includes various service charges for the order

---

## Promotions Dialog Data

| Field | Value |
|-------|-------|
| Total Promotions | 18 |
| Total Promotions Value | ฿3,225.00 |
| Pagination | 1-10 of 13 items with promotions |

### Sample Promotion Entry
| Field | Value |
|-------|-------|
| Promotion Name | Discount |
| Discount Amount | ฿29.32 |

---

## Status Summary

### Completed Shipments (3)

#### Shipment 1 - DHL
| Field | Value | Type |
|-------|-------|------|
| Status | DELIVERED | enum |
| Tracking Number | DHL0842601006994 | string |
| ETA | 01/23/2026 | date |
| Shipped On | 01/21/2026 | date |
| Rel No. | CDS2601212262851 | string |
| Shipped From | Central Online Warehouse | string |
| Subdistrict | หนองปรือ | string (Thai) |
| CRC Tracking Link | https://www.dhl.com/th-en/home/tracking.html?tracking-id=DHL0842601006994 | URL |
| Allocation Type | Delivery | enum |

##### Ship to Address
| Field | Value |
|-------|-------|
| Email | thanawat4596@gmail.com |
| Name | คุณ อภิญญา สิงห์แพรก |
| Address Line 1 | 88/10 ม.1 ซ.ชัยพรวิถี 14 ถ.ชัยพรวิถี |
| Address Line 2 | (รบกวนกดปุ่มเปิดประตูขวามือเข้ามาวางข้างในให้หน่อยนะคะ) |
| City/District | บางละมุง, ชลบุรี 20150 |
| Phone | 0922643514 |

##### Shipment 1 Items
| SKU | Product Name | Shipped Qty | Ordered Qty |
|-----|--------------|-------------|-------------|
| CDS23582996 | Girl Pants Hello Kitty Blue | 1 | 1 |
| CDS23583115 | Girl Leggings Hello Kitty Red | 1 | 1 |
| CDS24077910 | Girl Dress Cap Sleeves Hello Kitty Blue | 1 | 1 |
| CDS24097840 | Girl Toddler Dress Short Sleeves Gingham Cinnamoro | 1 | 1 |
| CDS24098465 | Girl T-Shirt Puff Sleeves Cinnamoroll Light Blue | 1 | 1 |

#### Shipment 2 - Kerry Express
| Field | Value | Type |
|-------|-------|------|
| Status | DELIVERED | enum |
| Tracking Number | KNJ0202601010946 | string |
| ETA | 01/23/2026 | date |
| Shipped On | 01/21/2026 | date |
| Rel No. | CDS2601212262853 | string |
| Shipped From | Bangna | string |
| CRC Tracking Link | https://th.kex-express.com/th/track/?track=KNJ0202601010946 | URL |
| Allocation Type | Delivery | enum |

##### Shipment 2 Items
| SKU | Product Name | Shipped Qty | Ordered Qty |
|-----|--------------|-------------|-------------|
| CDS23576490 | Girl T-Shirt Short Sleeves Round Neck Kuromi Viole | 1 | 1 |
| CDS23576551 | Girl Pants Wide Legs Kuromi Denim | 1 | 1 |
| CDS24098083 | Girl Dress Short Sleeves Gingham Hello Kitty Cherr | 1 | 1 |
| CDS24098281 | Girl T-Shirt Short Sleeves Round Neck Hello Kitty | 1 | 1 |
| CDS24820752 | Girl Toddler Pyjamas Set Dress Long Sleeves With R | 1 | 1 |
| CDS24820776 | Girl Toddler Pyjamas Set Dress Long Sleeves With R | 1 | 1 |

#### Shipment 3 - Kerry Express
| Field | Value | Type |
|-------|-------|------|
| Status | DELIVERED | enum |
| Tracking Number | KNJ0202601010865 | string |
| ETA | 01/23/2026 | date |
| Shipped On | 01/21/2026 | date |
| Rel No. | CDS2601212262852 | string |
| Shipped From | Lardprao | string |
| CRC Tracking Link | https://th.kex-express.com/th/track/?track=KNJ0202601010865 | URL |
| Allocation Type | Delivery | enum |

##### Shipment 3 Items
| SKU | Product Name | Shipped Qty | Ordered Qty |
|-----|--------------|-------------|-------------|
| CDS24097574 | Girl Toddler T-Shirt Puff Sleeves Hello Kitty Whit | 1 | 1 |
| CDS24097635 | Girl Toddler Shorts Hello Kitty Cherry Blossom Pin | 1 | 1 |

### In Process Shipments
- Count: 0

### Planned Shipments
- Count: 0

---

## Payments and Settlements (3 Invoices)

### Invoice 1
| Field | Value | Type |
|-------|-------|------|
| Invoice Type | Shipment | string |
| Invoice No. | 17689833173984144989 | string (20 digits) |
| Invoice Status | Closed | enum |
| Invoice Date | 01/21/2026 | date |
| Invoice Amount | ฿1,875.25 | currency |

#### Invoice 1 Items
| SKU | Product Name | Qty | Unit Price | Subtotal | Discount | Charges | Taxes | Total | Info Taxes |
|-----|--------------|-----|------------|----------|----------|---------|-------|-------|------------|
| CDS23582996 | Girl Pants Hello Kitty Blue | 1 | ฿1,290.00 | ฿1,290.00 | ฿854.13 | ฿0.00 | ฿0.00 | ฿435.87 | ฿28.51 |
| CDS23583115 | Girl Leggings Hello Kitty Red | 1 | ฿790.00 | ฿790.00 | ฿523.07 | ฿0.00 | ฿0.00 | ฿266.93 | ฿17.46 |
| CDS24077910 | Girl Dress Cap Sleeves Hello Kitty Blue | 1 | ฿1,390.00 | ฿1,390.00 | ฿920.35 | ฿0.00 | ฿0.00 | ฿469.65 | ฿30.72 |
| CDS24097840 | Girl Toddler Dress Short Sleeves Gingham Cinnamoro | 1 | ฿645.00 | ฿645.00 | ฿209.13 | ฿0.00 | ฿0.00 | ฿435.87 | ฿28.51 |
| CDS24098465 | Girl T-Shirt Puff Sleeves Cinnamoroll Light Blue | 1 | ฿395.00 | ฿395.00 | ฿128.07 | ฿0.00 | ฿0.00 | ฿266.93 | ฿17.46 |

#### Invoice 1 Payment
| Field | Value |
|-------|-------|
| Card Number | 525669XXXXXX0005 |
| Transaction Date | (empty) |
| Amount Charged | ฿1,875.25 |
| Item Subtotal | ฿4,510.00 |
| Total Discounts | -฿2,634.75 |
| Total Charges | +฿0.00 |
| Total Taxes | +฿0.00 |
| Shipment Total | ฿1,875.25 |
| Informational Taxes | ฿122.66 |

### Invoice 2
| Field | Value | Type |
|-------|-------|------|
| Invoice Type | Shipment | string |
| Invoice No. | 17689839997298882773 | string (20 digits) |
| Invoice Status | Closed | enum |
| Invoice Date | 01/21/2026 | date |
| Invoice Amount | ฿567.64 | currency |

#### Invoice 2 Items
| SKU | Product Name | Qty | Unit Price | Subtotal | Discount | Total | Info Taxes |
|-----|--------------|-----|------------|----------|----------|-------|------------|
| CDS24097574 | Girl Toddler T-Shirt Puff Sleeves Hello Kitty Whit | 1 | ฿345.00 | ฿345.00 | ฿111.86 | ฿233.14 | ฿15.25 |
| CDS24097635 | Girl Toddler Shorts Hello Kitty Cherry Blossom Pin | 1 | ฿495.00 | ฿495.00 | ฿160.50 | ฿334.50 | ฿21.88 |

#### Invoice 2 Payment
| Field | Value |
|-------|-------|
| Item Subtotal | ฿840.00 |
| Total Discounts | -฿272.36 |
| Shipment Total | ฿567.64 |
| Informational Taxes | ฿37.13 |

### Invoice 3
| Field | Value | Type |
|-------|-------|------|
| Invoice Type | Shipment | string |
| Invoice No. | 17689858488467027983 | string (20 digits) |
| Invoice Status | Closed | enum |
| Invoice Date | 01/21/2026 | date |
| Invoice Amount | ฿2,108.36 | currency |

#### Invoice 3 Items
| SKU | Product Name | Qty | Unit Price | Subtotal | Discount | Total | Info Taxes |
|-----|--------------|-----|------------|----------|----------|-------|------------|
| CDS23576490 | Girl T-Shirt Short Sleeves Round Neck Kuromi Viole | 1 | ฿395.00 | ฿395.00 | ฿128.07 | ฿266.93 | ฿17.46 |
| CDS23576551 | Girl Pants Wide Legs Kuromi Denim | 1 | ฿645.00 | ฿645.00 | ฿209.13 | ฿435.87 | ฿28.51 |
| CDS24098083 | Girl Dress Short Sleeves Gingham Hello Kitty Cherr | 1 | ฿695.00 | ฿695.00 | ฿225.37 | ฿469.63 | ฿30.72 |
| CDS24098281 | Girl T-Shirt Short Sleeves Round Neck Hello Kitty | 1 | ฿395.00 | ฿395.00 | ฿128.07 | ฿266.93 | ฿17.46 |
| CDS24820752 | Girl Toddler Pyjamas Set Dress Long Sleeves With R | 1 | ฿990.00 | ฿990.00 | ฿655.50 | ฿334.50 | ฿21.88 |
| CDS24820776 | Girl Toddler Pyjamas Set Dress Long Sleeves With R | 1 | ฿990.00 | ฿990.00 | ฿655.50 | ฿334.50 | ฿21.88 |

#### Invoice 3 Payment
| Field | Value |
|-------|-------|
| Item Subtotal | ฿4,110.00 |
| Total Discounts | -฿2,001.64 |
| Shipment Total | ฿2,108.36 |
| Informational Taxes | ฿137.91 |

---

## Package Appeasement Options

| Field | Value |
|-------|-------|
| Include Charges | true (checkbox checked) |
| APPEASE Button | Available for each shipment |

---

## Navigation Elements

| Element | Type | Notes |
|---------|------|-------|
| Home | sidebar link | Main navigation |
| Item Search | sidebar link | Search items |
| Orders | sidebar link | Order list |
| Standard UI | dropdown | UI mode selector |
| DS | dropdown | Organization selector |
| User Profile | Naruechon Woraphatphawan | Current user |

---

## Visual Reference Files

| File | Description |
|------|-------------|
| order-CDS260121226285-overview.png | Main order view |
| order-CDS260121226285-full.png | Full page screenshot |
| order-CDS260121226285-promotions.png | Promotions dialog |
| order-CDS260121226285-snapshot.md | Accessibility snapshot |

---

## Key Observations

1. **Multi-Shipment Order**: Order split into 3 shipments from different warehouses (Central Online Warehouse, Bangna, Lardprao)
2. **Multiple Carriers**: DHL and Kerry Express (KEX) used for delivery
3. **Heavy Discounts**: Total discount of ฿4,908.75 (52% off original ฿9,460.00)
4. **Promotions**: 18 total promotions with combined value of ฿3,225.00
5. **Product Category**: Children's clothing (Hello Kitty, Kuromi, Cinnamoroll themed)
6. **Payment**: Single credit card payment split across 3 invoices matching shipments
7. **Invoice Structure**: Shipment-based invoicing with detailed line-item breakdown
