# Chore: Add Booking Slot Data to MAO Orders

## Metadata
adw_id: `8ba99855`
prompt: `Add Booking Slot data to MAO orders in mock-data.ts. The MAO orders W1156260115052036 and W1156251121946800 currently have bookingSlotFrom: null and bookingSlotTo: null for their line items, but MAO shows this data. Update both MAO orders to include proper booking slot data.`

## Chore Description
The MAO (Manhattan Active Omni) orders W1156260115052036 and W1156251121946800 in the mock data file have `bookingSlotFrom: null` and `bookingSlotTo: null` for all their line items. However, MAO displays booking slot information for these orders. This chore updates both MAO orders to include proper booking slot data consistent with their delivery shipments:

- **W1156260115052036** (January 15, 2026 order): Set booking slot to 21:00-22:00 on 2026-01-15
- **W1156251121946800** (November 21, 2025 order): Set booking slot to 19:00-20:00 on 2025-11-21

All line items within each order should share the same booking slot since they belong to the same delivery shipment.

## Relevant Files
Use these files to complete the chore:

- **src/lib/mock-data.ts** - Contains the MAO order mock data with `maoOrderW1156251121946800Items` (starts at line 2317) and `maoOrderW1156260115052036Items` (starts at line 3474). Each array contains multiple line items with `bookingSlotFrom: null` and `bookingSlotTo: null` that need to be updated.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update maoOrderW1156251121946800Items Booking Slots
- Update all `bookingSlotFrom: null` to `bookingSlotFrom: '2025-11-21T19:00:00+07:00'` for W1156251121946800 line items
- Update all `bookingSlotTo: null` to `bookingSlotTo: '2025-11-21T20:00:00+07:00'` for W1156251121946800 line items
- Line items affected: LINE-W115625-001-0, LINE-W115625-001-1, LINE-W115625-001-2, LINE-W115625-002-0, LINE-W115625-002-1, LINE-W115625-003, LINE-W115625-004-0, LINE-W115625-004-1, LINE-W115625-005, LINE-W115625-006, LINE-W115625-007-0, LINE-W115625-007-1, LINE-W115625-008-0, LINE-W115625-008-1, LINE-W115625-008-2, LINE-W115625-009, LINE-W115625-010

### 2. Update maoOrderW1156260115052036Items Booking Slots
- Update all `bookingSlotFrom: null` to `bookingSlotFrom: '2026-01-15T21:00:00+07:00'` for W1156260115052036 line items
- Update all `bookingSlotTo: null` to `bookingSlotTo: '2026-01-15T22:00:00+07:00'` for W1156260115052036 line items
- Line items affected: LINE-W115626-001, LINE-W115626-002-0, LINE-W115626-002-1, LINE-W115626-003, LINE-W115626-004, LINE-W115626-005-0, LINE-W115626-005-1, LINE-W115626-006, LINE-W115626-007, LINE-W115626-008

### 3. Validate Changes
- Run TypeScript compilation to ensure no type errors
- Verify booking slot format consistency (ISO 8601 with timezone offset)
- Confirm all line items in each order have matching booking slot values

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure the build completes successfully with no TypeScript errors
- `grep -n "bookingSlotFrom: null" src/lib/mock-data.ts | head -20` - Verify that null booking slots have been replaced (should not show W1156251121946800 or W1156260115052036 items)
- `grep -c "bookingSlotFrom: '2025-11-21T19:00:00+07:00'" src/lib/mock-data.ts` - Should return 17 (for all W1156251121946800 line items)
- `grep -c "bookingSlotFrom: '2026-01-15T21:00:00+07:00'" src/lib/mock-data.ts` - Should return 10-12 (for all W1156260115052036 line items)

## Notes
- The booking slot times are in GMT+7 (Asia/Bangkok timezone) as indicated by the `+07:00` offset
- All line items within an order should have identical booking slot values since they are part of the same delivery shipment
- The booking slot times are realistic based on the order dates and typical delivery windows
- W1156251121946800 has 17 line items (after quantity splitting)
- W1156260115052036 has 10-12 line items (after quantity splitting)
