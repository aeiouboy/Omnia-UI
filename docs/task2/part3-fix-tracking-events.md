# Part 3 Fix: Correct Tracking Events for MAO Order W1156251121946800

## Overview
The tracking events in the current implementation are incorrect. The actual MAO system shows only 2 tracking statuses, not 4. This task corrects the tracking events to match the real MAO data.

## Actual MAO Tracking Events (from screenshot)
Based on the MAO tracking page for W1156251121946800, the tracking shows exactly 2 events:

1. **Out for Delivery** - 2025-11-21T11:39:33 - Package is out for delivery
2. **Delivered** - 2025-11-21T11:51:14 - Package successfully delivered

## Current Implementation Issues
The current implementation has 4 tracking events which is INCORRECT:
- Picked up (12:00) - Does not exist in MAO
- In transit (12:30) - Does not exist in MAO
- Out for delivery (12:45) - Wrong timestamp, should be 11:39:33
- Delivered (13:30) - Wrong timestamp, should be 11:51:14

The correct MAO system only shows these 2 tracking events:
- Out for Delivery (11:39:33)
- Delivered (11:51:14)

## Required Changes

### File: `src/lib/mock-data.ts`

#### Step 1: Replace the Tracking Events Generator Function

Find and completely replace the `generateMAOOrderW1156251121946800TrackingEvents()` function:

```typescript
// Tracking Events Generator for W1156251121946800
// CORRECTED to match actual MAO data - 2 events only
function generateMAOOrderW1156251121946800TrackingEvents(): any[] {
  return [
    {
      id: 'TRK-W115625-001',
      status: 'Out for Delivery',
      timestamp: '2025-11-21T11:39:33+07:00',
      location: 'Bang Yai, Nonthaburi',
      description: 'Package is out for delivery to customer',
      driverName: 'Somchai J.',
      driverPhone: '081-234-5678'
    },
    {
      id: 'TRK-W115625-002',
      status: 'Delivered',
      timestamp: '2025-11-21T11:51:14+07:00',
      location: 'Customer address - Bang Yai',
      description: 'Successfully delivered to customer',
      driverName: 'Somchai J.',
      driverPhone: '081-234-5678',
      signature: 'WEERAPAT',
      deliveryImage: '/api/mock/delivery/W1156251121946800-proof.jpg'
    }
  ]
}
```

#### Step 2: Update Tracking Object estimatedDelivery and actualDelivery

In the `tracking` object of `maoOrderW1156251121946800`, update the delivery timestamps:

```typescript
tracking: {
  trackingNumber: 'TRKW1156251121946800',
  carrier: 'Lalamove CRC',
  carrierLogo: '/api/mock/carriers/lalamove-crc.png',
  status: 'Delivered',
  estimatedDelivery: '2025-11-21T12:00:00+07:00',  // Updated to be after Out for Delivery
  actualDelivery: '2025-11-21T11:51:14+07:00',      // CORRECTED timestamp from MAO
  events: generateMAOOrderW1156251121946800TrackingEvents(),
  driver: {
    name: 'Somchai J.',
    phone: '081-234-5678',
    photo: '/api/mock/drivers/somchai.jpg',
    rating: 4.8
  },
  deliveryAddress: {
    street: '59/20 หมู่บ้านยูเทรียมพลัสวัน ซอยวัดพระเงิน',
    district: 'Bang Muang',
    city: 'Bang Yai',
    postalCode: '11140',
    country: 'TH',
    latitude: 13.8164,
    longitude: 100.4446
  }
}
```

## Key Changes
1. **Reduced from 4 events to 2 events** - MAO system only tracks these 2 stages
2. **Removed events that don't exist in MAO**:
   - "Picked up" - Not shown in MAO tracking
   - "In transit" - Not shown in MAO tracking
3. **Corrected timestamps** to match exact MAO data:
   - Out for Delivery: 11:39:33 (not 12:45)
   - Delivered: 11:51:14 (not 13:30)
4. **Updated actualDelivery timestamp** in tracking object to 11:51:14

## Important Notes
- **Fulfillment ends at "Ready To Ship"**: Everything after is tracking
- **Tracking only shows carrier events**: Out for Delivery → Delivered
- **Exact timestamps from MAO**: Must match the screenshot exactly
- **Total delivery time**: ~12 minutes (11:39:33 to 11:51:14)
- **Driver info**: Same driver (Somchai J.) for both events

## Validation
After making changes:
1. Run `pnpm build` to verify no TypeScript errors
2. Start dev server with `pnpm dev`
3. Navigate to http://localhost:3000/orders
4. Search for order W1156251121946800
5. Click on the order to open detail view
6. Click on "Tracking" tab
7. Verify tracking shows exactly 2 events:
   - Out for Delivery (11:39:33)
   - Delivered (11:51:14)
8. Verify actualDelivery timestamp is 11:51:14
9. Verify no additional tracking events appear
