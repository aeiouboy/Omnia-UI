#!/usr/bin/env python3
"""
Retail Field Mapping Script
Maps API fields to database columns using retail domain knowledge.
"""

import re
import json
import csv
import sys
import subprocess
from pathlib import Path

# Retail Domain Synonyms - API field -> DB column
RETAIL_SYNONYMS = {
    # Item/Product identifiers -> item_id
    'ItemBarcode': 'item_id', 'Barcode': 'item_id', 'SKU': 'item_id',
    'ProductCode': 'item_id', 'ArticleNumber': 'item_id', 'ArticleNo': 'item_id',
    'ProductId': 'item_id', 'ItemCode': 'item_id', 'UPC': 'item_id',
    'EAN': 'item_id', 'GTIN': 'item_id', 'PLU': 'item_id', 'ItemSKU': 'item_id',
    'MaterialNo': 'item_id', 'PartNumber': 'item_id',

    # Quantity fields
    'Qty': 'quantity', 'QtyOrdered': 'quantity', 'OrderedQty': 'quantity',
    'OrderQty': 'quantity', 'RequestedQty': 'quantity',
    'FulfilledQty': 'fulfilled_quantity', 'ShippedQty': 'fulfilled_quantity',
    'DeliveredQty': 'fulfilled_quantity',
    'CancelledQty': 'cancelled_quantity', 'CanceledQty': 'cancelled_quantity',
    'VoidedQty': 'cancelled_quantity',

    # Price fields
    'Price': 'unit_price', 'SalePrice': 'unit_price', 'SellingPrice': 'unit_price',
    'ListPrice': 'original_unit_price', 'OriginalPrice': 'original_unit_price',
    'MSRP': 'original_unit_price', 'RetailPrice': 'original_unit_price',
    'LineTotal': 'order_line_total', 'ExtendedPrice': 'order_line_total',
    'LineSubTotal': 'order_line_sub_total', 'NetLineAmount': 'order_line_sub_total',
    'TotalAmount': 'order_total', 'GrandTotal': 'order_total',
    'SubTotal': 'order_sub_total', 'NetTotal': 'order_sub_total',
    'TaxAmount': 'total_taxes', 'VATAmount': 'total_taxes', 'GSTAmount': 'total_taxes',
    'DiscountAmount': 'total_discounts', 'PromoDiscount': 'total_discounts',
    'ShippingFee': 'total_charges', 'DeliveryFee': 'total_charges',

    # Location fields
    'StoreId': 'location_id', 'StoreCode': 'location_id', 'BranchId': 'location_id',
    'BranchCode': 'location_id', 'OutletId': 'location_id',
    'WarehouseId': 'ship_from_location_id', 'WarehouseCode': 'ship_from_location_id',
    'DCId': 'ship_from_location_id', 'FulfillmentLocationId': 'ship_from_location_id',
    'DeliveryLocationId': 'ship_to_location_id', 'PickupLocationId': 'ship_to_location_id',

    # Customer fields
    'CustomerName': 'customer_first_name', 'BuyerName': 'customer_first_name',
    'ConsigneeName': 'customer_first_name', 'RecipientName': 'customer_first_name',
    'CustomerMobile': 'customer_phone', 'ContactPhone': 'customer_phone',
    'MobileNo': 'customer_phone', 'PhoneNo': 'customer_phone', 'Tel': 'customer_phone',
    'CustomerEmail': 'customer_email', 'ContactEmail': 'customer_email',

    # Order reference fields
    'OrderNo': 'order_id', 'OrderNumber': 'order_id', 'SalesOrderId': 'order_id',
    'SONumber': 'order_id',
    'PONumber': 'alternate_order_id', 'PurchaseOrderNo': 'alternate_order_id',
    'ExternalOrderId': 'alternate_order_id', 'ChannelOrderId': 'alternate_order_id',
    'MarketplaceOrderId': 'alternate_order_id',

    # Shipping fields
    'ShipMethod': 'shipping_method_id', 'ShippingMethod': 'shipping_method_id',
    'CarrierName': 'carrier_code', 'Carrier': 'carrier_code', 'CourierCode': 'carrier_code',
    'AWB': 'tracking_number', 'TrackingNo': 'tracking_number',
    'WaybillNo': 'tracking_number', 'ConsignmentNo': 'tracking_number',

    # Payment fields
    'CardNo': 'account_number', 'CardNumber': 'account_number',
    'MaskedCardNo': 'account_display_number', 'Last4Digits': 'account_display_number',
    'CardHolderName': 'name_on_card', 'NameOnCard': 'name_on_card',
    'CVV': 'gift_card_pin', 'SecurityCode': 'gift_card_pin', 'PIN': 'gift_card_pin',
    'AuthCode': 'reconciliation_id', 'ApprovalCode': 'reconciliation_id',
    'TransactionId': 'payment_transaction_id', 'TxnId': 'payment_transaction_id',
    'ReferenceId': 'transaction_reference_id', 'RefNo': 'transaction_reference_id',
    'ReceiptNo': 'transaction_reference_id',

    # Description fields
    'ItemName': 'item_description', 'ProductName': 'item_description',
    'Description': 'item_description', 'ItemDescription': 'item_description',

    # Image fields
    'ImageUrl': 'small_image_uri', 'ImageURL': 'small_image_uri',
    'ProductImage': 'small_image_uri', 'ThumbnailUrl': 'small_image_uri',

    # Boolean flags
    'IsGift': 'is_gift', 'IsGiftItem': 'is_gift', 'GiftFlag': 'is_gift',
    'IsCancelled': 'is_cancelled', 'IsCanceled': 'is_cancelled', 'CancelFlag': 'is_cancelled',
    'IsOnHold': 'is_on_hold', 'OnHold': 'is_on_hold', 'HoldFlag': 'is_on_hold',
    'IsPreOrder': 'is_pre_order', 'PreOrder': 'is_pre_order',

    # Weight fields
    'Weight': 'request_weight', 'ItemWeight': 'request_weight',
    'NetWeight': 'actual_weight', 'ActualWeight': 'actual_weight',

    # UOM fields
    'UnitOfMeasure': 'uom', 'Unit': 'uom', 'SalesUnit': 'uom',
    'BaseUnit': 'original_uom', 'StockUnit': 'original_uom',
}

# ERD Tables with columns
ERD_TABLES = {
    'orders': ['order_id', 'customer_id', 'customer_email', 'customer_first_name',
               'customer_last_name', 'customer_phone', 'currency_code', 'org_id',
               'alternate_order_id', 'max_fulfillment_status_id', 'min_fulfillment_status_id',
               'order_sub_total', 'order_total', 'total_charges', 'total_discounts',
               'total_taxes', 'is_on_hold', 'is_cancelled', 'order_status',
               'fulfillment_status', 'payment_status', 'order_hold', 'order_charge_detail',
               'order_type', 'created_at', 'updated_at', 'created_by', 'updated_by',
               'cancel_allowed', 'selling_channel'],
    'order_lines': ['order_id', 'order_line_id', 'item_id', 'item_description',
                    'quantity', 'unit_price', 'original_unit_price', 'order_line_sub_total',
                    'order_line_total', 'uom', 'original_uom', 'is_gift', 'is_cancelled',
                    'is_pre_order', 'fulfillment_status', 'shipping_method_id',
                    'ship_to_location_id', 'ship_from_address_id', 'small_image_uri',
                    'request_weight', 'actual_weight', 'total_discounts', 'total_charges',
                    'created_at', 'updated_at', 'created_by', 'updated_by', 'delivery_method',
                    'max_fulfillment_status_id', 'min_fulfillment_status_id',
                    'release_group_id', 'fulfillment_group_id', 'promised_delivery_date'],
    'payment_methods': ['payment_method_id', 'payment_id', 'order_id', 'account_number',
                        'account_display_number', 'name_on_card', 'gift_card_pin', 'amount',
                        'currency_code', 'transaction_reference_id', 'org_id', 'gateway_id',
                        'created_at', 'updated_at', 'created_by', 'updated_by',
                        'card_expiry_month', 'card_expiry_year', 'is_suspended', 'is_voided',
                        'billing_address', 'payment_type', 'card_type', 'actions', 'messages',
                        'extended', 'conversion_rate', 'current_auth_amount',
                        'current_settled_amount', 'current_refund_amount', 'current_failed_amount'],
    'payment_transactions': ['payment_transaction_id', 'payment_method_id', 'order_id',
                             'requested_amount', 'processed_amount', 'transaction_date',
                             'request_id', 'request_token', 'reconciliation_id',
                             'is_valid_for_refund', 'is_active', 'status', 'transaction_type',
                             'created_at', 'updated_at', 'created_by', 'updated_by', 'org_id'],
    'payments': ['payment_id', 'order_id', 'customer_id', 'org_id', 'payment_group_id',
                 'status_id', 'is_cancelled', 'is_anonymized', 'purge_date', 'actions',
                 'created_at', 'updated_at', 'created_by', 'updated_by', 'message'],
    'allocations': ['allocation_id', 'order_id', 'order_line_id', 'item_id', 'quantity',
                    'uom', 'ship_from_location_id', 'carrier_code', 'allocation_type',
                    'status_id', 'org_id', 'created_at', 'updated_at', 'created_by',
                    'updated_by', 'inventory_segment_id', 'service_level_code',
                    'committed_ship_date', 'committed_delivery_date', 'ship_to_location_id'],
    'releases': ['release_id', 'order_id', 'release_type', 'ship_from_location_id',
                 'carrier_code', 'delivery_method_id', 'created_at', 'updated_at',
                 'created_by', 'updated_by', 'org_id', 'ship_to_location_id', 'ship_via_id',
                 'service_level_code', 'effective_rank', 'process'],
    'release_lines': ['release_line_id', 'release_id', 'order_id', 'order_line_id',
                      'item_id', 'quantity', 'fulfilled_quantity', 'cancelled_quantity',
                      'created_at', 'updated_at', 'created_by', 'updated_by', 'uom',
                      'effective_rank', 'process', 'allocation_id', 'org_id'],
    'fulfillment_details': ['fulfillment_id', 'release_id', 'release_line_id', 'order_id',
                            'order_line_id', 'item_id', 'quantity', 'status_id',
                            'created_at', 'updated_at', 'created_by', 'updated_by',
                            'event_type_id', 'uom', 'fulfillment_group_id'],
    'order_tracking': ['tracking_number', 'carrier_code', 'tracking_date', 'city', 'state',
                       'postal_code', 'country', 'status', 'tracking_url', 'created_at',
                       'updated_at', 'created_by', 'updated_by', 'order_id', 'order_line_id',
                       'tracking_detail_id', 'status_sub_type', 'status_description'],
    'quantity_details': ['quantity_detail_id', 'order_id', 'order_line_id', 'item_id',
                         'quantity', 'uom', 'status_id', 'process', 'reason',
                         'substitution_ratio', 'web_url', 'created_at', 'updated_at',
                         'created_by', 'updated_by', 'substitution_type', 'org_id'],
    'promising_details': ['promising_request_id', 'item_id', 'quantity',
                          'ship_from_location_id', 'ship_to_location_id',
                          'delivery_method_id', 'created_at', 'updated_at', 'uom'],
}


def camel_to_snake(name):
    """Convert CamelCase to snake_case"""
    name = name.replace('URI', 'Uri').replace('URL', 'Url').replace('ID', 'Id')
    name = name.replace('UOM', 'Uom').replace('PIN', 'Pin')
    s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
    return re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()


def determine_table(field_path):
    """Determine target table based on API field path"""
    path_lower = field_path.lower()

    if 'paymenttransactiondetail' in path_lower:
        return 'payment_methods'
    if 'paymenttransaction' in path_lower:
        return 'payment_transactions'
    if 'paymentmethod' in path_lower:
        return 'payment_methods'
    if 'payment[' in path_lower:
        return 'payments'
    if 'releaseline' in path_lower:
        return 'release_lines'
    if 'release[' in path_lower:
        return 'releases'
    if 'fulfillmentdetail' in path_lower:
        return 'fulfillment_details'
    if 'allocation' in path_lower:
        return 'allocations'
    if 'quantitydetail' in path_lower:
        return 'quantity_details'
    if 'ordertracking' in path_lower:
        return 'order_tracking'
    if 'orderlinepromising' in path_lower or 'promisinginfo' in path_lower:
        return 'promising_details'
    if 'orderline' in path_lower:
        return 'order_lines'
    return 'orders'


def find_column(field_name, table):
    """Find matching database column for a field"""
    clean = field_name.replace('[]', '').split('.')[-1]
    columns = ERD_TABLES.get(table, [])

    # Check retail synonyms first
    if clean in RETAIL_SYNONYMS:
        mapped = RETAIL_SYNONYMS[clean]
        if mapped in columns:
            return mapped, f"Retail synonym: {clean} -> {mapped}"

    # Direct snake_case match
    snake = camel_to_snake(clean)
    if snake in columns:
        return snake, ""

    # Try variations
    for var in [snake, snake.replace('_id', ''), snake + '_id',
                'is_' + snake, snake.replace('is_', '')]:
        if var in columns:
            return var, ""

    return None, ""


def extract_fields_from_doc(doc_path):
    """Extract API fields from document"""
    # Convert doc to text using textutil (macOS)
    result = subprocess.run(
        ['textutil', '-convert', 'txt', '-stdout', doc_path],
        capture_output=True, text=True
    )
    content = result.stdout

    # Decode quoted-printable if needed
    content = re.sub(r'=\n', '', content)
    content = re.sub(r'=3D', '=', content)

    # Extract table rows from HTML content
    rows = re.findall(r'<tr[^>]*>(.*?)</tr>', content, re.DOTALL | re.IGNORECASE)

    fields = []
    for row in rows:
        cells = re.findall(r'<td[^>]*>(.*?)</td>', row, re.DOTALL | re.IGNORECASE)
        if len(cells) >= 5:
            def extract_text(cell):
                text = re.sub(r'<[^>]+>', '', cell)
                return re.sub(r'\s+', ' ', text).strip()

            num = extract_text(cells[0])
            field_name = extract_text(cells[1])
            mapping_type = extract_text(cells[2])
            mapping_table = extract_text(cells[3])
            mapping_field = extract_text(cells[4])
            remarks = extract_text(cells[5]) if len(cells) > 5 else ""

            if field_name and (num.isdigit() or '.' in num):
                fields.append({
                    'num': num,
                    'field_name': field_name,
                    'mapping_type': mapping_type,
                    'mapping_table': mapping_table,
                    'mapping_field': mapping_field,
                    'remarks': remarks
                })

    return fields


def main():
    if len(sys.argv) < 4:
        print("Usage: python3 map_fields.py <source_doc> <erd_file> <output_folder>")
        print("Example: python3 map_fields.py api-spec.doc erd.wsd ./output")
        sys.exit(1)

    source_doc = sys.argv[1]
    erd_file = sys.argv[2]
    output_folder = Path(sys.argv[3])
    output_folder.mkdir(parents=True, exist_ok=True)

    print(f"=== Retail Field Mapping ===")
    print(f"Source: {source_doc}")
    print(f"ERD: {erd_file}")
    print(f"Output: {output_folder}")
    print()

    # Extract fields from document
    print("Extracting fields from document...")
    fields = extract_fields_from_doc(source_doc)
    print(f"Found {len(fields)} fields")

    # Process mappings
    print("Applying retail domain mappings...")
    enhanced = []
    retail_mappings = []

    for f in fields:
        # Use original mapping if exists
        if f['mapping_table'] and f['mapping_table'].strip():
            enhanced.append(f)
            continue

        # Find new mapping
        table = determine_table(f['field_name'])
        column, remark = find_column(f['field_name'], table)

        if column:
            if remark:
                retail_mappings.append(f"{f['field_name']} -> {table}.{column}")
            enhanced.append({
                'num': f['num'],
                'field_name': f['field_name'],
                'mapping_type': 'Direct',
                'mapping_table': table,
                'mapping_field': column,
                'remarks': remark or f['remarks']
            })
        else:
            enhanced.append({
                'num': f['num'],
                'field_name': f['field_name'],
                'mapping_type': '',
                'mapping_table': '',
                'mapping_field': '',
                'remarks': f['remarks']
            })

    # Write CSV
    csv_path = output_folder / 'field-mappings.csv'
    with open(csv_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['#', 'Field Name', 'Mapping Type',
                         'Mapping APIs / Database Table', 'Mapping Field Name', 'Remarks'])
        for m in enhanced:
            writer.writerow([m['num'], m['field_name'], m['mapping_type'],
                             m['mapping_table'], m['mapping_field'], m['remarks']])

    # Write JSON
    json_path = output_folder / 'field-mappings.json'
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(enhanced, f, indent=2, ensure_ascii=False)

    # Print statistics
    mapped = [m for m in enhanced if m['mapping_field']]
    unmapped = [m for m in enhanced if not m['mapping_field']]

    print()
    print("=== RESULTS ===")
    print(f"Total fields: {len(enhanced)}")
    print(f"Mapped fields: {len(mapped)} ({len(mapped)/len(enhanced)*100:.1f}%)")
    print(f"Unmapped fields: {len(unmapped)}")

    print()
    print("=== MAPPINGS BY TABLE ===")
    tables = {}
    for m in mapped:
        t = m['mapping_table']
        tables[t] = tables.get(t, 0) + 1
    for t, c in sorted(tables.items(), key=lambda x: -x[1]):
        print(f"  {t}: {c}")

    if retail_mappings:
        print()
        print("=== RETAIL SYNONYM MAPPINGS ===")
        for rm in retail_mappings[:20]:
            print(f"  {rm}")
        if len(retail_mappings) > 20:
            print(f"  ... and {len(retail_mappings) - 20} more")

    print()
    print(f"CSV saved: {csv_path}")
    print(f"JSON saved: {json_path}")


if __name__ == '__main__':
    main()
