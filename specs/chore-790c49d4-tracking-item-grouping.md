---
description: Group products under their specific delivery/tracking shipment in the Order Detail page Tracking tab.
---

# Tracking Item Grouping

## Background
Currently, the "Tracking" tab in the Order Detail page lists tracking shipments (Home Delivery or Click & Collect) but does not show which specific items are contained in each shipment. Users need to know the contents of each package, especially for split shipments.

## Objective
Enhance the Tracking tab to display the list of items associated with each tracking shipment/package.

## Requirements
1.  **Data Structure**: Ensure each tracking shipment entry (`TrackingShipment`) contains a list of items (`items`) that belong to it.
2.  **UI Display**:
    *   In the `TrackingTab` component, for each shipment card, display a list/table of items contained in that shipment.
    *   **Position**: Inside the shipment card, below the shipment details (and above events if any, or logically placed).
    *   **Columns**:
        *   Product Name (show Thai name if available, else English)
        *   SKU
        *   Shipped Qty (if available, else use quantity)
        *   Ordered Qty
        *   UOM
3.  **Visual Reference**: A table or list view similar to the provided screenshot (Card with Tracking Info -> Product List).

## Technical Implementation Plan

### 1. Update Types (`src/types/audit.ts`)
*   Modify `TrackingShipment` interface to include an optional `items` array.
*   The item type should be based on `ApiOrderItem` or a subset relevant for tracking (Name, SKU, Qty, UOM).
*   *Note*: `CCTrackingShipment` already has `productItems`, consider unifying or extending this.

### 2. Update Mock Data Generation (`src/lib/mock-data.ts`)
*   Update `generateTrackingData` function.
*   Logic:
    *   When creating tracking shipments, distribute the `orderData.items` among them.
    *   If there are multiple shipments (e.g., Mixed Delivery), assign items based on their `shippingMethod` or split logic.
    *   Ensure every item from the order is assigned to a shipment.
    *   For the mock, we can randomly split items or assign them sequentially if specific split data isn't available.

### 3. Update Tracking Tab UI (`src/components/order-detail/tracking-tab.tsx`)
*   Create a new sub-component `ShipmentItemsTable` (or similar).
*   Render this component within the `TrackingTab` loop for each shipment.
*   The table should display:
    *   **Product**: Image (optional but nice), Name.
    *   **SKU**: `product_sku`.
    *   **Qty**: `quantity` (Ordered), and `shippedQty` (if we have it, otherwise same as quantity).
    *   **UOM**: `uom`.

## Verification Steps
1.  Open an Order Detail page (e.g., ORD-0100 which describes mixed delivery).
2.  Go to the **Tracking** tab.
3.  Verify that each Tracking Card (Home Delivery / Click & Collect) shows a list of items.
4.  Check that the item details (Name, SKU, Qty, UOM) are correct.
5.  Ensure the UI matches the design (clean table/list within the card).
