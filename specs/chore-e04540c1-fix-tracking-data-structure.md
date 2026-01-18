# Chore: Fix Tracking Data Structure for MAO Order W1156251121946800

## Metadata
adw_id: `e04540c1`
prompt: `FIX TRACKING DATA STRUCTURE FOR MAO ORDER W1156251121946800: The tracking-tab.tsx component expects each shipment to have a 'shipToAddress' object with 'allocationType' property. Current tracking array in mock-data.ts has flat properties. Fix by restructuring the tracking array entry to match generateTrackingData output format.`

## Chore Description
The `tracking-tab.tsx` component at line 104 accesses `shipment.shipToAddress.email`, line 110 accesses `shipment.shipToAddress.name`, and line 128 accesses `shipment.shipToAddress.allocationType`. The current tracking array in `maoOrderW1156251121946800` (lines 3798-3846 in mock-data.ts) uses flat properties like `recipient`, `phone`, `address`, `district`, `city`, and `trackingEvents`. These do not match the expected `TrackingShipment` interface defined in `src/types/audit.ts` (lines 325-338) which requires:

**Required structure per TrackingShipment interface:**
- `trackingNumber: string`
- `carrier?: string`
- `events: TrackingEvent[]` (not `trackingEvents`)
- `status: ShipmentStatus`
- `eta: string`
- `shippedOn: string`
- `relNo: string`
- `shippedFrom: string`
- `subdistrict: string`
- `shipToAddress: ShipToAddress` (nested object, not flat properties)
- `trackingUrl: string`

**Required ShipToAddress structure (lines 304-311):**
- `email: string`
- `name: string`
- `address: string`
- `fullAddress: string`
- `allocationType: 'Delivery' | 'Pickup' | 'Merge'`
- `phone: string`

**Current incorrect structure:**
```typescript
{
  id: 'SHIP-W1156251121946800-001',
  trackingNumber: 'TRKW1156251121946800',
  carrier: 'Home Delivery',
  status: 'DELIVERED',
  eta: '11/21/2025',
  relNo: 'W11562511219468001',
  shippedFrom: 'Tops Westgate1',
  subdistrict: 'Bang Muang',
  recipient: 'WEERAPAT WIRUNTANGTRAKUL',  // Should be in shipToAddress.name
  phone: '0804411221',                     // Should be in shipToAddress.phone
  address: '59/20 หมู่ 11...',             // Should be in shipToAddress.address
  district: 'Bang Muang',                  // Missing allocationType
  city: 'Bang Yai, 11140',                 // Should be in shipToAddress.fullAddress
  items: 17,
  trackingEvents: [...]                    // Should be 'events' not 'trackingEvents'
}
```

## Relevant Files
Use these files to complete the chore:

- **src/lib/mock-data.ts** (lines 3797-3846) - Contains the malformed tracking array in `maoOrderW1156251121946800` object that needs restructuring
- **src/types/audit.ts** (lines 304-338) - Defines `ShipToAddress`, `TrackingEvent`, and `TrackingShipment` interfaces that the data must conform to
- **src/components/order-detail/tracking-tab.tsx** (lines 104-134) - Component that consumes the tracking data and expects `shipToAddress` nested object

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Tracking Array Structure in mock-data.ts
- Navigate to line 3797 in `src/lib/mock-data.ts`
- Replace the current tracking array (lines 3798-3846) with properly structured data
- Change flat properties (`recipient`, `phone`, `address`, `district`, `city`) to nested `shipToAddress` object
- Rename `trackingEvents` to `events`
- Add `shippedOn` field (currently missing)
- Add `trackingUrl` field (should be empty string for Home Delivery)
- Change event statuses to use string values that work with the component (the component displays status as-is via `event.status`)
- Add `location` field to each event
- Remove extra fields like `id`, `items`, and `details` that are not part of the interface

**New structure to apply:**
```typescript
tracking: [
  {
    trackingNumber: 'TRKW1156251121946800',
    carrier: 'Home Delivery',
    status: 'DELIVERED',
    eta: '11/21/2025',
    relNo: 'W11562511219468001',
    shippedFrom: 'Tops Westgate1',
    subdistrict: 'Bang Muang',
    shippedOn: '21/11/2025',
    shipToAddress: {
      email: 'wee.wirun@gmail.com',
      name: 'WEERAPAT WIRUNTANGTRAKUL',
      address: '59/20 หมู่ 11 หมู่บ้านยูเทรียมพลัสวัน ซอยวัดพระเงิน',
      fullAddress: 'Bang Muang, Bang Yai, Nonthaburi 11140',
      allocationType: 'Delivery',
      phone: '0804411221'
    },
    trackingUrl: '',
    shipmentType: 'HOME_DELIVERY',
    events: [
      { status: 'Order Placed', timestamp: '2025-11-21T10:42:00', location: 'Online' },
      { status: 'Picking', timestamp: '2025-11-21T10:45:30', location: 'Tops Westgate1' },
      { status: 'Picked', timestamp: '2025-11-21T11:06:35', location: 'Tops Westgate1' },
      { status: 'Packed', timestamp: '2025-11-21T11:29:32', location: 'Tops Westgate1' },
      { status: 'Ready To Ship', timestamp: '2025-11-21T11:30:33', location: 'Tops Westgate1' },
      { status: 'Delivered', timestamp: '2025-11-21T13:00:00', location: 'Bang Muang, Bang Yai' }
    ]
  }
]
```

### 2. Validate TypeScript Compilation
- Run `pnpm build` to verify no TypeScript errors
- Ensure the tracking data structure matches the expected types

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Build the project to verify TypeScript compilation succeeds with no type errors

## Notes
- The `TrackingEvent` interface in `src/types/audit.ts` line 317 defines status as `TrackingEventStatus` which is a union of specific strings: `'Shipment pickedup' | 'Hub / Intransit - destination arrived' | 'Out for Delivery' | 'Delivered'`. However, the tracking-tab.tsx component simply displays the status string as-is (line 285: `{event.status}`), so custom status strings like 'Order Placed', 'Picking', etc. will work.
- The `shipmentType` field is part of `CCTrackingShipment` interface (line 357) which extends `TrackingShipment`, so it should be included for proper type compliance.
- The component at line 204 accesses `shipment.shipToAddress.allocationType` to determine if shipment is Click & Collect (`isPickup` or `isMerge`) vs Home Delivery.
