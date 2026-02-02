# Chore: Manhattan OMNI Mock Data Generator

## Metadata
adw_id: `783bdb6f`
prompt: `Analyze the Manhattan OMNI order data specification at /Users/naruechon/Omnia-UI/mock_specs/mock-01440766-manhattan-omni-order-status.md and create mock order data for Omnia-UI system.`

## Chore Description
Create a mock data generator that maps Manhattan OMNI order fields to existing Omnia-UI order schema. This involves:
1. Mapping Manhattan OMNI fields to existing Omnia-UI ApiOrder/Order interface fields
2. Generating realistic mock data based on the sample order CDS260120221340
3. Implementing gift-with-purchase relationships (3 free gifts + 1 main item)
4. Using Thai Baht (THB) currency and GMT+7 timezone
5. Documenting field mappings and any skipped fields

## Field Mapping Analysis

### Existing Omnia-UI Order Schema (from `src/components/order-management-hub.tsx`)

The existing `ApiOrder` and `Order` interfaces define the schema that Manhattan OMNI data must map to.

### Manhattan OMNI → Omnia-UI Field Mapping

#### Customer Information
| Manhattan OMNI Field | Omnia-UI Field | Type | Notes |
|---------------------|----------------|------|-------|
| `customer_name` | `customer.name` | String | Direct map |
| `phone` | `customer.phone` | String | Direct map |
| `email` | `customer.email` | String | Direct map |
| `customer_reference` | `customer.custRef` | String | Direct map |
| `customer_type_id` | `customer.customerType` | String | Direct map |
| `the1_member` | `customer.T1Number` | String | Map boolean to T1 number or empty |

#### Order Header
| Manhattan OMNI Field | Omnia-UI Field | Type | Notes |
|---------------------|----------------|------|-------|
| `order_number` | `order_no` | String | Direct map (also used as `id`) |
| `order_status` | `status` | String | Direct map |
| `created_date` | `order_date` | String | Convert to ISO format |
| `order_type` | `orderType` | FMSOrderType | Map RT-CC-STD to existing enum |
| `selling_channel` | `channel` | String | Map "Web" to existing channels |
| `store_number` | `metadata.store_no` | String | Direct map |
| `allow_substitution` | `allowSubstitution` | Boolean | Direct map |
| `full_tax_invoice` | `fullTaxInvoice` | Boolean | Direct map |
| `organization_name` | `organization` | String | Direct map |
| `captured_date` | `metadata.created_at` | String | Convert to ISO format |

#### Payment Information
| Manhattan OMNI Field | Omnia-UI Field | Type | Notes |
|---------------------|----------------|------|-------|
| `payment_status` | `payment_info.status` | String | Direct map |
| `payment_method` | `payment_info.method` | String | Direct map |
| `amount_charged` | `total_amount` | Number | Parse currency to number |
| `amount_to_be_charged` | `payment_info.subtotal` | Number | Parse currency to number |
| `transaction_date` | `paymentDate` | String | Convert to ISO format |
| `invoice_number` | `payment_info.transaction_id` | String | Direct map |
| `informational_taxes` | `payment_info.informationalTaxes` | Number | Parse currency to number |

#### Billing Address
| Manhattan OMNI Field | Omnia-UI Field | Type | Notes |
|---------------------|----------------|------|-------|
| `billing_name` | `billingName` | String | Direct map |
| `billing_address_line1` | `billingAddress.street` | String | Direct map |
| `billing_address_city` | `billingAddress.city` | String | Direct map |
| `billing_address_country` | `billingAddress.country` | String | Direct map |

#### Line Items
| Manhattan OMNI Field | Omnia-UI Field | Type | Notes |
|---------------------|----------------|------|-------|
| `item_name` | `items[].product_name` | String | Direct map |
| `sku` | `items[].product_sku` | String | Also map to `product_id` |
| `quantity_ordered` | `items[].quantity` | Number | Direct map |
| `price` | `items[].unit_price` | Number | Parse currency to number |
| `line_total` | `items[].total_price` | Number | Parse currency to number |
| `fulfillment_status` | `items[].fulfillmentStatus` | String | Direct map |
| `uom` | `items[].uom` | String | Direct map |
| `eta` | `items[].eta` | Object | Convert date format |
| `shipping_method` | `items[].shippingMethod` | String | Direct map |
| `secret_code` | `items[].secretCode` | String | Direct map |
| `gift_with_purchase` | `items[].giftWithPurchase` | Boolean/String | Map to string/null |
| `style` | `items[].style` | String | Direct map |
| `color` | `items[].color` | String | Direct map |
| `size` | `items[].size` | String | Direct map |
| `bundle` | `items[].bundle` | Boolean | Direct map |
| `bundle_ref_id` | `items[].bundleRef` | String | Direct map |
| `line_subtotal` | `items[].priceBreakdown.subtotal` | Number | Parse currency |
| `line_discount` | `items[].priceBreakdown.discount` | Number | Parse currency |
| `line_charges` | `items[].priceBreakdown.charges` | Number | Parse currency |
| `line_taxes` | `items[].priceBreakdown.taxes` | Number | Parse currency |
| `line_informational_taxes` | `items[].priceBreakdown.informationalTaxes` | Number | Parse currency |

#### Shipment Information
| Manhattan OMNI Field | Omnia-UI Field | Type | Notes |
|---------------------|----------------|------|-------|
| `tracking_number` | `deliveryMethods[].clickCollect.relNo` | String | Map to release number |
| `picked_from` / `shipped_from` | `deliveryMethods[].clickCollect.storeName` | String | Map to store |
| `ship_to_type` | `deliveryMethods[].type` | String | Map to CLICK_COLLECT or HOME_DELIVERY |
| `store_name` | `deliveryMethods[].clickCollect.storeName` | String | Direct map |
| `store_address_line1` | `deliveryMethods[].clickCollect.storeAddress` | String | Direct map |
| `store_phone` | `deliveryMethods[].clickCollect.storePhone` | String | Direct map |
| `picked_on` | `deliveryMethods[].clickCollect.pickupDate` | String | Convert format |
| `allocation_type` | `deliveryMethods[].clickCollect.allocationType` | String | Direct map |

#### Order Financial Summary
| Manhattan OMNI Field | Omnia-UI Field | Type | Notes |
|---------------------|----------------|------|-------|
| `item_subtotal` | `pricingBreakdown.subtotal` | Number | Parse currency |
| `total_discounts` | `pricingBreakdown.discount` | Number | Parse currency |
| `estimated_shipping_handling` | `pricingBreakdown.shippingHandling` | Number | Parse currency |
| `other_charges` | `pricingBreakdown.charges` | Number | Parse currency |
| `estimated_taxes` | `pricingBreakdown.taxes` | Number | Parse currency |
| `order_total` | `pricingBreakdown.total` | Number | Parse currency |
| `informational_taxes` | `pricingBreakdown.informationalTaxes` | Number | Parse currency |

### Fields NOT Mapped (Manhattan OMNI → Omnia-UI)

These Manhattan OMNI fields don't have corresponding fields in Omnia-UI and will be skipped:

| Manhattan OMNI Field | Reason for Skipping |
|---------------------|---------------------|
| `ui_mode` | UI configuration, not order data |
| `user_name` | User session data, not order data |
| `nav_items` | Navigation UI, not order data |
| `registration_status` | Customer registration UI state |
| `related_cases` | Case management integration (undefined in sample) |
| `tax_id` | Empty in sample, no corresponding field |
| `company_name` | Empty in sample, no corresponding field |
| `branch_number` | Empty in sample, no corresponding field |
| `order_promotions_count` | Summary count, not needed |
| `order_appeasements_count` | Summary count, not needed |
| `order_coupons_count` | Summary count, not needed |
| `item_promotions_count` | Summary count, not needed |
| `item_coupons_count` | Summary count, not needed |
| `item_appeasements_count` | Summary count, not needed |
| `packed_ordered_qty` | Computed from quantity |
| `number_of_pack` | Packaging detail |
| `pack_item_description` | Packaging detail |
| `actual_weight` | Operational detail |
| `promotion_id` | Empty in sample |
| `promotion_type` | Empty in sample |
| `route` | Delivery route name (operational) |
| `booking_slot_from` | Empty in sample |
| `booking_slot_to` | Empty in sample |
| `supply_type_id` | Empty in sample |
| `gift_wrapped` | Empty in sample |
| `quantity_allocated` | Fulfillment tracking detail |
| `quantity_released` | Fulfillment tracking detail |
| `quantity_picked_up` | Fulfillment tracking detail |
| `in_process_count` | Summary count |
| `planned_shipments_count` | Summary count |
| `release_number` | Shipment detail |
| `subdistrict` | Address detail |
| `crc_tracking_link` | Tracking URL |
| `recipient_email` | Duplicate of customer email |
| `invoice_type` | Always "Shipment" |
| `invoice_status` | Always "Closed" |
| `invoice_date` | Duplicate of transaction date |
| `invoice_amount` | Duplicate of order total |

## Relevant Files
Use these files to complete the chore:

- **`/Users/naruechon/Omnia-UI/mock_specs/mock-01440766-manhattan-omni-order-status.md`** - Manhattan OMNI data specification (source)
- **`/Users/naruechon/Omnia-UI/src/lib/mock-data.ts`** - Main mock data generator file (target for new generator function)
- **`/Users/naruechon/Omnia-UI/src/components/order-management-hub.tsx`** - Contains ApiOrder, Order, ApiOrderItem interfaces
- **`/Users/naruechon/Omnia-UI/app/api/orders/external/route.ts`** - API route that calls getMockOrders()
- **`/Users/naruechon/Omnia-UI/types/delivery.ts`** - DeliveryMethod interface definitions
- **`/Users/naruechon/Omnia-UI/types/payment.ts`** - PaymentTransaction, PricingBreakdown interfaces

### New Files

- **`/Users/naruechon/Omnia-UI/src/lib/manhattan-omni-mock-data.ts`** - New generator for Manhattan OMNI style orders

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Read Existing Type Definitions
- Read `types/delivery.ts` to understand DeliveryMethod interface
- Read `types/payment.ts` to understand PaymentTransaction, PricingBreakdown interfaces
- Confirm field mapping against existing interfaces

### 2. Create Manhattan OMNI Mock Data Generator
- Create new file `src/lib/manhattan-omni-mock-data.ts`
- Implement currency parser function for "THB X,XXX.XX" format
- Implement date converter for "MM/DD/YYYY HH:MM +TZ" format
- Create base order structure matching sample CDS260120221340
- Implement gift-with-purchase logic:
  - Main item: CDS24737203 (Libre Gift Set, THB 5,200.00, gift_with_purchase: false)
  - Gift 1: CDS10174760 (MYSLF EDP, THB 0.00, gift_with_purchase: true, linked to CDS24737203)
  - Gift 2: CDS16319509 (YSL Pureshot, THB 0.00, gift_with_purchase: true, linked to CDS24737203)
  - Gift 3: CDS23619029 (Libre EDP, THB 0.00, gift_with_purchase: true, linked to CDS24737203)

### 3. Implement Order Generator Function
- Create `generateManhattanOmniOrder()` function
- Accept parameters for customization (order number, customer details, etc.)
- Generate realistic Thai customer names and addresses
- Support order types: RT-CC-STD, RT-HD-STD, RT-HD-EXP, MKP-HD-STD
- Generate shipment data with Click & Collect store information

### 4. Create Sample Manhattan OMNI Orders
- Generate the exact sample order CDS260120221340 from spec
- Generate additional 9 variant orders with different:
  - Order types (RT-CC-STD, RT-HD-STD, RT-HD-EXP, etc.)
  - Payment methods (Bank Transfer, Credit Card, QR PromptPay)
  - Customer information
  - Item combinations with/without gifts
- Export as `manhattanOmniMockOrders` array

### 5. Integrate with Existing Mock Data System
- Add `getManhattanOmniMockOrders()` function to main mock-data.ts
- Export Manhattan OMNI orders alongside existing mockApiOrders
- Ensure orders appear when filtering by channel="omni" or searching for "CDS" prefix

### 6. Add Documentation
- Add JSDoc comments to all functions
- Document field mapping decisions inline
- Add section in mock-data.ts header explaining Manhattan OMNI integration

### 7. Validate Implementation
- Verify all mapped fields match Omnia-UI interface types
- Test order renders correctly in OrderManagementHub
- Verify gift-with-purchase items display properly
- Check currency formatting (THB with comma separators)
- Verify timestamp formatting (MM/DD/YYYY HH:mm:ss GMT+7)

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure no TypeScript errors with new mock data generator
- `pnpm lint` - Check for linting issues in new code
- `pnpm dev` - Start dev server and verify orders display in Order Management Hub
- Search for "CDS260120221340" in Order Management Hub to find sample order
- Filter by order type "RT-CC-STD" to see Click & Collect orders
- Verify gift items show THB 0.00 price and gift indicator

## Notes

### Currency Handling
- Manhattan OMNI uses "THB X,XXX.XX" format with comma separators
- Omnia-UI stores amounts as Number type
- Use `parseTHBCurrency()` helper to convert

### Date/Time Format
- Manhattan OMNI: "MM/DD/YYYY HH:MM +07"
- Omnia-UI: ISO 8601 for storage, MM/DD/YYYY HH:mm:ss for display
- Implement `parseManhattanDateTime()` helper

### Gift-with-Purchase Pattern
The Manhattan OMNI gift-with-purchase model uses:
- `gift_with_purchase: true/false` - Boolean flag
- `gift_with_purchase_item: "SKU"` - Reference to triggering item

Omnia-UI's existing `giftWithPurchase` field is `string | boolean | null`:
- `null` or `false` - Not a gift
- String value - Gift description (e.g., "Free Travel Kit")

For Manhattan OMNI mapping:
- Gift items: Set to parent SKU as string (e.g., "Gift with CDS24737203")
- Main items: Set to `null` or `false`

### Order Type Mapping
Manhattan OMNI uses order type codes that match Omnia-UI's `FMSOrderType`:
- RT-CC-STD → RT-CC-STD (Retail Click & Collect Standard)
- RT-HD-STD → RT-HD-STD (Retail Home Delivery Standard)
- RT-HD-EXP → RT-HD-EXP (Retail Home Delivery Express)
- MKP-HD-STD → MKP-HD-STD (Marketplace Home Delivery Standard)
- Return Order → Return Order

### Channel Mapping
Manhattan OMNI `selling_channel: "Web"` should map to lowercase `channel: "web"` to match existing Omnia-UI channel values.
