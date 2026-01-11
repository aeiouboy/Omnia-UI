# Chore: Manhattan OMS Tracking Tab Enhancement

## Metadata
adw_id: `1f304d83`
prompt: `Enhance the Tracking tab in Order Detail page (src/components/order-detail/tracking-tab.tsx) to display detailed shipment information matching Manhattan OMS design. Currently the tab only shows tracking numbers with carrier events timeline. Add the following shipment details per tracking number in a two-column layout:

  LEFT COLUMN - Shipment Details:
  - Status: Display delivery status (DELIVERED, IN_TRANSIT, etc.) with color indicator (green for DELIVERED)
  - Tracking number: Full tracking number
  - ETA: Estimated time of arrival date (DD/MM/YYYY format)
  - Shipped on: Ship date (DD/MM/YYYY format)
  - Rel No.: Reference number / Release order number
  - Shipped from: Origin store name (e.g., Tops RCA)
  - Subdistrict: Origin subdistrict name in Thai

  RIGHT COLUMN - Ship to Address:
  - Email: Customer email
  - Name: Recipient name (Thai supported)
  - Address: Street address
  - Full address: District, City, Postal code
  - Allocation Type: Delivery type (e.g., Delivery, Pickup)
  - Phone: Contact phone number

  BOTTOM SECTION:
  - CRC tracking link: Clickable external tracking URL (e.g., Lalamove, Kerry, Flash Express tracking links)

  IMPLEMENTATION REQUIREMENTS:
  1. Update TrackingShipment interface in src/types/audit.ts to add new fields: status, eta, shippedOn, relNo, shippedFrom, subdistrict, shipToAddress (with email, name, address, fullAddress, allocationType, phone), trackingUrl
  2. Update generateTrackingData() in src/lib/mock-data.ts to generate realistic Thai addresses and shipment details
  3. Modify tracking-tab.tsx to display the two-column shipment details above the existing events timeline
  4. Use plain text styling matching Manhattan OMS (no colored badges except status indicator)
  5. Keep existing events timeline display below the shipment details
  6. Make layout responsive - stack columns on mobile`

## Chore Description
Enhance the Tracking tab component to display comprehensive shipment information in a Manhattan OMS-style layout. The current implementation only shows tracking numbers with carrier event timelines. This enhancement adds:

1. **Two-column shipment details layout** above each tracking timeline:
   - Left column: Shipment metadata (status, tracking number, ETA, shipped date, release number, origin store, subdistrict)
   - Right column: Ship-to address information (email, name, address, allocation type, phone)

2. **Status indicator**: Color-coded delivery status (green for DELIVERED, blue for IN_TRANSIT, etc.)

3. **External tracking link**: Clickable URL to carrier's tracking page

4. **Responsive design**: Two-column layout on desktop, stacked on mobile

## Relevant Files
Use these files to complete the chore:

- **src/types/audit.ts** (lines 294-298): Contains `TrackingShipment` and `TrackingEvent` interfaces that need to be extended with new fields for shipment details, ship-to address, and tracking URL
- **src/lib/mock-data.ts** (lines 1281-1365): Contains `generateTrackingData()` function that generates mock shipment data. Must be updated to generate realistic Thai addresses and all new shipment fields
- **src/components/order-detail/tracking-tab.tsx**: The main component that displays tracking information. Must be updated to render the two-column shipment details layout above the existing events timeline

### New Files
No new files needed.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Add ShipToAddress Interface in audit.ts
- Add new `ShipToAddress` interface with fields: email, name, address, fullAddress, allocationType, phone
- Add new `ShipmentStatus` type for delivery statuses: 'DELIVERED' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'PICKED_UP' | 'PENDING'

### 2. Extend TrackingShipment Interface in audit.ts
- Add `status: ShipmentStatus` field
- Add `eta: string` field (DD/MM/YYYY format)
- Add `shippedOn: string` field (DD/MM/YYYY format)
- Add `relNo: string` field (release order number)
- Add `shippedFrom: string` field (origin store name)
- Add `subdistrict: string` field (Thai subdistrict name)
- Add `shipToAddress: ShipToAddress` field
- Add `trackingUrl: string` field (external tracking link)

### 3. Update generateTrackingData() in mock-data.ts
- Add arrays for realistic Thai data:
  - Thai store names (e.g., 'Tops RCA', 'Tops สุขุมวิท 39', 'Tops ทองหล่อ')
  - Thai subdistrict names (e.g., 'ดินแดง', 'วัฒนา', 'จตุจักร')
  - Thai recipient names (e.g., 'สมชาย วงศ์สุวรรณ')
  - Thai addresses (e.g., '123/45 ซอยสุขุมวิท 39')
  - Districts and cities (e.g., 'วัฒนา, กรุงเทพมหานคร')
- Add carrier tracking URL templates:
  - Kerry Express: `https://th.kerryexpress.com/th/track/?track={trackingNumber}`
  - Flash Express: `https://www.flashexpress.co.th/tracking/?trackingNumber={trackingNumber}`
  - J&T Express: `https://www.jtexpress.co.th/tracking?awb={trackingNumber}`
  - Thailand Post: `https://track.thailandpost.co.th/?trackNumber={trackingNumber}`
- Derive shipment status from events (check if 'Delivered' event exists)
- Calculate ETA based on shipped date and carrier typical delivery time
- Generate random release number (e.g., 'REL-2024-001234')
- Generate random allocation type ('Delivery' or 'Pickup')
- Generate random Thai phone numbers (format: 08X-XXX-XXXX)
- Generate random email addresses

### 4. Create ShipmentDetailsSection Subcomponent in tracking-tab.tsx
- Create a new component section for displaying two-column shipment details
- Left column layout:
  - Status with color indicator (small dot before text)
  - Tracking number
  - ETA
  - Shipped on
  - Rel No.
  - Shipped from
  - Subdistrict
- Right column layout:
  - Email
  - Name
  - Address
  - Full address (district, city, postal)
  - Allocation Type
  - Phone
- Use plain text styling (no badges except status indicator)
- Use responsive grid: `grid-cols-1 md:grid-cols-2`

### 5. Add Tracking Link Section in tracking-tab.tsx
- Add external tracking link below shipment details
- Use `ExternalLink` icon from lucide-react
- Link opens in new tab (`target="_blank" rel="noopener noreferrer"`)
- Display as "Track Shipment" with carrier name

### 6. Integrate New Sections into TrackingTab Component
- Import `ExternalLink` from lucide-react
- Add ShipmentDetailsSection above the existing events timeline
- Add tracking link section below shipment details, above events
- Add separator between details and events timeline
- Ensure proper spacing and visual hierarchy

### 7. Apply Status Color Logic
- Create helper function `getStatusColor(status: ShipmentStatus)`
- Return appropriate Tailwind classes:
  - DELIVERED: `text-green-600` with green dot
  - IN_TRANSIT: `text-blue-600` with blue dot
  - OUT_FOR_DELIVERY: `text-orange-600` with orange dot
  - PICKED_UP: `text-cyan-600` with cyan dot
  - PENDING: `text-gray-600` with gray dot

### 8. Validate Implementation
- Run `pnpm dev` to start development server
- Navigate to order detail page and verify tracking tab displays:
  - Two-column layout with all shipment details
  - Correct status colors
  - Thai text displaying correctly
  - Clickable tracking links
  - Responsive layout on mobile
- Run `pnpm build` to verify no TypeScript errors
- Run `pnpm lint` to verify no ESLint issues

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Verify TypeScript compilation succeeds with no errors
- `pnpm lint` - Verify no ESLint errors
- `pnpm dev` - Start dev server and manually verify:
  - Open browser to http://localhost:3000
  - Navigate to any order detail page
  - Click on "Tracking" tab
  - Verify two-column layout displays shipment details
  - Verify status indicator shows correct color
  - Verify tracking link is clickable and opens correct carrier URL
  - Resize browser to mobile width and verify columns stack

## Notes
- All date formats should use DD/MM/YYYY as specified (Thai convention)
- Thai text must display correctly (UTF-8 encoding)
- Status indicator should be a small colored dot (not a badge) to match Manhattan OMS plain text style
- The existing events timeline should remain unchanged below the new shipment details section
- External tracking URLs should use HTTPS and open in new tab with proper security attributes
