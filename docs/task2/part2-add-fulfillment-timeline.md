# Part 2: Add Fulfillment Timeline for MAO Order W1156251121946800

## Overview
Add fulfillment timeline data to the existing `maoOrderW1156251121946800` order to display order progression in the Fulfillment tab of the order detail view.

## Order Context
- **Order ID**: W1156251121946800
- **Order Date**: 21/11/2025
- **Delivery Type**: RT-HD-EXP (3H Delivery - 3 Hour Express)
- **Final Status**: DELIVERED
- **Delivery Date**: 21/11/2025 (same day - 3H delivery)
- **Store**: Tops Central World

## Fulfillment Status Progression
For 3H Express delivery, the timeline should show rapid progression:

1. **Picking** - 11:00 - Items being picked from shelves
2. **Packing** - 11:30 - Items being packed
3. **Packed** - 11:45 - Packing completed
4. **Ready to Ship** - 11:50 - Awaiting carrier pickup
5. **Shipped** - 12:00 - Carrier picked up shipment
6. **Out for Delivery** - 12:15 - On the way to customer
7. **Delivered** - 13:30 - Successfully delivered

## Required Changes

### File: `src/lib/mock-data.ts`

#### Step 1: Create Fulfillment Timeline Generator Function

After the `generateMAOOrderW1156251121946800AuditTrail()` function, add:

```typescript
export function generateMAOOrderW1156251121946800FulfillmentTimeline(): FulfillmentStatusEvent[] {
  const orderDate = '2025-11-21'

  return [
    {
      id: 'FUL-W115625-001',
      status: 'Picking',
      timestamp: `${orderDate}T11:00:00+07:00`,
      details: 'Items being picked from shelves at Tops Central World'
    },
    {
      id: 'FUL-W115625-002',
      status: 'Packing',
      timestamp: `${orderDate}T11:30:00+07:00`,
      details: 'Items being packed for delivery'
    },
    {
      id: 'FUL-W115625-003',
      status: 'Packed',
      timestamp: `${orderDate}T11:45:00+07:00`,
      details: 'Packing completed - package ready'
    },
    {
      id: 'FUL-W115625-004',
      status: 'Ready to Ship',
      timestamp: `${orderDate}T11:50:00+07:00`,
      details: 'Awaiting carrier pickup - Lalamove CRC'
    },
    {
      id: 'FUL-W115625-005',
      status: 'Shipped',
      timestamp: `${orderDate}T12:00:00+07:00`,
      details: 'Carrier picked up shipment from store'
    },
    {
      id: 'FUL-W115625-006',
      status: 'Out for Delivery',
      timestamp: `${orderDate}T12:15:00+07:00`,
      details: 'Package is out for delivery to customer'
    },
    {
      id: 'FUL-W115625-007',
      status: 'Delivered',
      timestamp: `${orderDate}T13:30:00+07:00`,
      details: 'Successfully delivered to customer - Signed by WEERAPAT'
    }
  ]
}
```

#### Step 2: Add Fulfillment Timeline to Order Object

In the `maoOrderW1156251121946800` order object, add the `fulfillmentTimeline` field:

```typescript
export const maoOrderW1156251121946800: Order = {
  // ... existing order fields ...

  // Add this field after other arrays (after paymentDetails or deliveryMethods)
  fulfillmentTimeline: generateMAOOrderW1156251121946800FulfillmentTimeline(),

  // ... rest of order fields ...
}
```

## Type Reference

The fulfillment timeline uses these types from `src/types/audit.ts`:

```typescript
export type FulfillmentStatusType =
  | 'Picking'
  | 'Packing'
  | 'Packed'
  | 'Ready to Ship'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled'

export interface FulfillmentStatusEvent {
  id: string
  status: FulfillmentStatusType
  timestamp: string // ISO format with GMT+7 timezone
  details?: string
}
```

## Component Usage

The fulfillment timeline is displayed in:
- **File**: `src/components/order-detail/fulfillment-timeline.tsx`
- **Usage**: The component reads from `order.fulfillmentTimeline`
- **Display**: Shows vertical timeline with status icons and timestamps

## Important Notes
1. **Timestamp Format**: Use ISO format with GMT+7 timezone (Asia/Bangkok)
2. **Status Order**: Must follow chronological order (oldest first)
3. **ID Format**: Use `FUL-{OrderNo}-{SequenceNumber}` pattern
4. **Realistic Timing**: For 3H Express, the entire process completes within 2.5 hours
5. **Details Field**: Provide meaningful context for each status change

## Validation
After making changes:
1. Run `pnpm build` to verify no TypeScript errors
2. Start dev server with `pnpm dev`
3. Navigate to http://localhost:3000/orders
4. Search for order W1156251121946800
5. Click on the order to open detail view
6. Click on "Fulfillment" tab
7. Verify timeline shows all 7 events in correct order with proper timestamps
8. Verify status icons and colors display correctly (green for completed steps)
