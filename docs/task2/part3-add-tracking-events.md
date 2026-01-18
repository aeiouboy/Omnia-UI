# Part 3: Add Tracking Events for MAO Order W1156251121946800

## Overview
Add shipment tracking data to the existing `maoOrderW1156251121946800` order to display delivery tracking information in the Tracking tab of the order detail view.

## Order Context
- **Order ID**: W1156251121946800
- **Order Date**: 21/11/2025
- **Delivery Type**: RT-HD-EXP (3H Delivery)
- **Carrier**: Lalamove CRC
- **Tracking Number**: TRKW1156251121946800
- **Final Status**: Delivered

## Tracking Progression
For 3H Express delivery via Lalamove CRC:

1. **Picked up** - 12:00 - Carrier picked up from store
2. **In transit** - 12:30 - Package in transit to delivery area
3. **Out for delivery** - 12:45 - Driver heading to customer location
4. **Delivered** - 13:30 - Successfully delivered

## Required Changes

### File: `src/lib/mock-data.ts`

#### Step 1: Create Tracking Events Generator Function

After the `generateMAOOrderW1156251121946800FulfillmentTimeline()` function, add:

```typescript
export function generateMAOOrderW1156251121946800TrackingEvents(): TrackingEvent[] {
  const orderDate = '2025-11-21'

  return [
    {
      id: 'TRK-W115625-001',
      status: 'Picked up',
      timestamp: `${orderDate}T12:00:00+07:00`,
      location: 'Tops Central World, Bangkok',
      description: 'Package picked up by Lalamove CRC driver',
      driverName: 'Somchai J.',
      driverPhone: '081-234-5678'
    },
    {
      id: 'TRK-W115625-002',
      status: 'In transit',
      timestamp: `${orderDate}T12:30:00+07:00`,
      location: 'Pathum Wan District, Bangkok',
      description: 'Package in transit to delivery area',
      driverName: 'Somchai J.',
      driverPhone: '081-234-5678'
    },
    {
      id: 'TRK-W115625-003',
      status: 'Out for delivery',
      timestamp: `${orderDate}T12:45:00+07:00`,
      location: 'Near customer location - Bangkok',
      description: 'Driver heading to customer location for delivery',
      driverName: 'Somchai J.',
      driverPhone: '081-234-5678'
    },
    {
      id: 'TRK-W115625-004',
      status: 'Delivered',
      timestamp: `${orderDate}T13:30:00+07:00`,
      location: 'Customer address - Bangkok',
      description: 'Successfully delivered - Signed by: WEERAPAT',
      driverName: 'Somchai J.',
      driverPhone: '081-234-5678',
      signature: 'WEERAPAT',
      deliveryImage: '/api/mock/delivery/W1156251121946800-proof.jpg'
    }
  ]
}
```

#### Step 2: Add Tracking to Order Object

In the `maoOrderW1156251121946800` order object, add the `tracking` field:

```typescript
export const maoOrderW1156251121946800: Order = {
  // ... existing order fields ...

  // Add this field (typically near delivery information)
  tracking: {
    trackingNumber: 'TRKW1156251121946800',
    carrier: 'Lalamove CRC',
    carrierLogo: '/api/mock/carriers/lalamove-crc.png',
    status: 'Delivered',
    estimatedDelivery: '2025-11-21T14:00:00+07:00',
    actualDelivery: '2025-11-21T13:30:00+07:00',
    events: generateMAOOrderW1156251121946800TrackingEvents(),
    driver: {
      name: 'Somchai J.',
      phone: '081-234-5678',
      photo: '/api/mock/drivers/somchai.jpg',
      rating: 4.8
    },
    deliveryAddress: {
      street: '123 สีลม เขตบางรัก',
      district: 'Pathum Wan',
      city: 'Bangkok',
      postalCode: '10330',
      country: 'TH',
      latitude: 13.7465,
      longitude: 100.5380
    }
  },

  // ... rest of order fields ...
}
```

## Type Reference

The tracking object uses this interface structure:

```typescript
interface TrackingInfo {
  trackingNumber: string
  carrier: string
  carrierLogo?: string
  status: 'Picked up' | 'In transit' | 'Out for delivery' | 'Delivered' | 'Failed'
  estimatedDelivery?: string
  actualDelivery?: string
  events: TrackingEvent[]
  driver?: {
    name: string
    phone: string
    photo?: string
    rating?: number
  }
  deliveryAddress?: {
    street: string
    district: string
    city: string
    postalCode: string
    country: string
    latitude?: number
    longitude?: number
  }
}

interface TrackingEvent {
  id: string
  status: string
  timestamp: string // ISO format with GMT+7 timezone
  location: string
  description: string
  driverName?: string
  driverPhone?: string
  signature?: string
  deliveryImage?: string
}
```

## Component Usage

The tracking information is displayed in:
- **File**: `src/components/order-detail/tracking-tab.tsx`
- **Usage**: Reads from `order.tracking`
- **Display**:
  - Tracking number and carrier info
  - Current status badge
  - Driver information card
  - Timeline of tracking events
  - Delivery address with map

## Important Notes
1. **Timestamp Format**: Use ISO format with GMT+7 timezone
2. **Chronological Order**: Events must be sorted oldest to newest
3. **ID Format**: Use `TRK-{OrderNo}-{SequenceNumber}` pattern
4. **Driver Info**: Same driver for all events (same pickup/delivery)
5. **Realistic Timeline**: For 3H Express, tracking shows 1.5 hour delivery journey
6. **Final Event**: The 'Delivered' event includes signature and deliveryImage fields

## Validation
After making changes:
1. Run `pnpm build` to verify no TypeScript errors
2. Start dev server with `pnpm dev`
3. Navigate to http://localhost:3000/orders
4. Search for order W1156251121946800
5. Click on the order to open detail view
6. Click on "Tracking" tab
7. Verify tracking information displays:
   - Tracking number: TRKW1156251121946800
   - Carrier: Lalamove CRC
   - Driver: Somchai J. (081-234-5678)
   - Status: Delivered
   - 4 tracking events in timeline
   - Delivery address with location
8. Verify timeline shows proper status progression with timestamps

## Complete Order Context
This is the final piece for order W1156251121946800. After this part, the order should have:
- ✅ Split order lines (17 items)
- ✅ Fulfillment timeline (7 events)
- ✅ Tracking events (4 events)
- ✅ Complete MAO data (customer, pricing, promotions)
- ✅ Ready for display in Omnia-UI order detail view
