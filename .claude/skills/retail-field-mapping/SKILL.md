---
name: retail-field-mapping
description: Map API fields to database columns using retail/inventory/order management domain knowledge. Understands terminology like ItemBarcode->item_id, SKU->item_id, Qty->quantity, etc.
---

# Retail Field Mapping Skill

Map API specification fields to database columns using retail domain knowledge.

## When to Use

Use this skill when:
- Mapping API fields to database schemas
- Working with order management, inventory, or retail systems
- Need to understand retail terminology synonyms

## Usage

```bash
python3 .claude/skills/retail-field-mapping/scripts/map_fields.py <source_doc> <erd_file> <output_folder>
```

## Example

```bash
python3 .claude/skills/retail-field-mapping/scripts/map_fields.py \
  "/path/to/api-spec.doc" \
  "/path/to/erd.wsd" \
  "/path/to/output"
```

## Retail Terminology Reference

### Item/Product Identifiers → `item_id`
ItemBarcode, Barcode, SKU, ProductCode, ArticleNumber, ProductId, ItemCode, UPC, EAN, GTIN, PLU

### Quantity Fields
| API Term | DB Column |
|----------|-----------|
| Qty, QtyOrdered, OrderedQty | quantity |
| FulfilledQty, ShippedQty | fulfilled_quantity |
| CancelledQty, CanceledQty | cancelled_quantity |

### Price Fields
| API Term | DB Column |
|----------|-----------|
| Price, SalePrice, UnitPrice | unit_price |
| ListPrice, MSRP, RetailPrice | original_unit_price |
| LineTotal, ExtendedPrice | order_line_total |
| TotalAmount, GrandTotal | order_total |

### Location Fields
| API Term | DB Column |
|----------|-----------|
| StoreId, BranchId, OutletId | location_id |
| WarehouseId, DCId | ship_from_location_id |
| DeliveryLocationId | ship_to_location_id |

### Customer Fields
| API Term | DB Column |
|----------|-----------|
| CustomerName, BuyerName | customer_first_name |
| CustomerMobile, PhoneNo | customer_phone |
| CustomerEmail | customer_email |

### Payment Fields
| API Term | DB Column |
|----------|-----------|
| CardNo, CardNumber | account_number |
| CardHolderName | name_on_card |
| AuthCode, ApprovalCode | reconciliation_id |
| TransactionId, TxnId | payment_transaction_id |
| ReferenceId, RefNo | transaction_reference_id |

### Shipping Fields
| API Term | DB Column |
|----------|-----------|
| AWB, TrackingNo, WaybillNo | tracking_number |
| CarrierName, CourierCode | carrier_code |
| ShipMethod | shipping_method_id |

## Table Detection Rules

The script automatically detects target tables from API paths:
- `PaymentMethod[].*` → payment_methods
- `PaymentTransaction[].*` → payment_transactions
- `Payment[].*` → payments
- `OrderLine[].*` → order_lines
- `Allocation[].*` → allocations
- `Release[].*` → releases
- `ReleaseLine[].*` → release_lines
- Top-level fields → orders

## Output

Generates:
- `field-mappings.csv` - CSV with columns: #, Field Name, Mapping Type, Table, Column, Remarks
- `field-mappings.json` - JSON format of mappings
- Statistics printed to console
