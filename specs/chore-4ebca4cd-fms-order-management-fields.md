# Chore: Enhance Order Management Hub with FMS-compatible fields and filters

## Metadata
adw_id: `4ebca4cd`
prompt: `Enhance Order Management Hub with FMS-compatible fields and filters`

## Chore Description
Add fields from the Financial Management System (FMS) Order Fulfillment page to the Omnia-UI Order Management Hub for consistency and reporting. This includes:
1. Adding 6 new table columns (Order Type, Delivery Type, Request Tax, Delivery Time Slot, Delivered Time, Settlement Type)
2. Expanding Payment Method filter with FMS values
3. Adding 5 new filters (Order Type, Delivery Type, Request Tax, Settlement Type, Date Type selector)
4. Updating data interfaces with new fields
5. Including new fields in CSV export

## Relevant Files
Use these files to complete the chore:

### Primary Files to Modify
- `src/components/order-management-hub.tsx` - Main component containing the orders table, filters, and export functionality. This file contains:
  - `Order` and `ApiOrder` interfaces (lines 132-190)
  - Filter state variables (lines 454-473)
  - `filteredOrders` filtering logic (lines 1001-1249)
  - `exportOrdersToCSV` function (lines 1252-1348)
  - `renderOrderTable` function (lines 1378-1480)
  - Filter UI components (lines 1634-1895)

- `src/components/order-badges.tsx` - Badge components for order status display. May need new badges for:
  - Delivery Type badge
  - Settlement Type badge
  - Request Tax badge (checkmark/X icon)

- `src/types/delivery.ts` - Delivery types that can be extended for new delivery type values

### New Files
- No new files needed - all changes are modifications to existing files

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Data Interfaces
- Add new fields to `ApiOrder` interface in `order-management-hub.tsx`:
  ```typescript
  // FMS Extended Fields
  orderType?: 'Large format' | 'Tops daily CFR' | 'Tops daily CFM' | 'Subscription' | 'Retail'
  deliveryType?: 'Standard Delivery' | 'Express Delivery' | 'Click & Collect'
  deliveryTimeSlot?: {
    date: string
    from: string
    to: string
  }
  deliveredTime?: string
  settlementType?: 'Auto Settle' | 'Manual Settle'
  paymentDate?: string
  deliveryDate?: string
  ```
- Add same fields to `Order` interface
- Note: `fullTaxInvoice` already exists in Order interface as `fullTaxInvoice?: boolean`

### 2. Update Filter State Variables
- Add new filter state variables after line 473:
  ```typescript
  const [deliveryTypeFilter, setDeliveryTypeFilter] = useState("all-delivery-type")
  const [requestTaxFilter, setRequestTaxFilter] = useState("all-request-tax")
  const [settlementTypeFilter, setSettlementTypeFilter] = useState("all-settlement-type")
  const [dateTypeFilter, setDateTypeFilter] = useState("order-date") // 'order-date' | 'payment-date' | 'delivery-date' | 'shipping-slot'
  ```
- Update `orderTypeFilter` options to include FMS values

### 3. Expand Payment Method Filter Options
- Update the Payment Method filter in the advanced filters section (around line 1862-1876) with FMS values:
  - Cash on Delivery
  - Credit Card on Delivery
  - 2C2P Credit-Card
  - QR Payment
  - T1C Redeem Payment

### 4. Add New Filter UI Components
- Add Date Type selector in the date range section (around line 1714-1767)
- Add Delivery Type filter dropdown
- Add Request Tax filter (Yes/No)
- Add Settlement Type filter dropdown
- Update Order Type filter with FMS values: 'Large format', 'Tops daily CFR', 'Tops daily CFM', 'Subscription', 'Retail'

### 5. Update Filter Logic in filteredOrders
- Add filtering logic for new filters in the `filteredOrders` filter function (lines 1001-1249):
  - Delivery Type filter
  - Request Tax filter (based on `fullTaxInvoice` boolean)
  - Settlement Type filter
  - Update date filter to respect `dateTypeFilter` selection

### 6. Update generateActiveFilters
- Add display strings for new active filters in `generateActiveFilters` useMemo (lines 816-845)

### 7. Update removeFilter Function
- Add cases for removing new filters in `removeFilter` function (lines 776-813)

### 8. Update handleResetAllFilters
- Add reset logic for new filter states in `handleResetAllFilters` function (lines 848-868)

### 9. Add New Badge Components
- Add `DeliveryTypeBadge` component in `order-badges.tsx`:
  - STD (Standard) - Blue badge
  - EXP (Express) - Orange badge
  - CC (Click & Collect) - Green badge
- Add `SettlementTypeBadge` component:
  - Auto Settle - Green badge
  - Manual Settle - Yellow badge
- Add `RequestTaxBadge` component:
  - Checkmark icon for true
  - X icon for false

### 10. Update Table Header and Columns
- Add new columns to `renderOrderTable` function (lines 1378-1480):
  - After "Selling Channel" column, add:
    - Order Type
    - Delivery Type
    - Request Tax
    - Delivery Time Slot
    - Delivered Time
    - Settlement Type

### 11. Update mapOrderToTableRow Function
- Add new fields mapping in `mapOrderToTableRow` function (lines 921-943):
  ```typescript
  orderType: order.order_type ?? "",
  deliveryType: order.deliveryType ?? "",
  requestTax: order.fullTaxInvoice ?? false,
  deliveryTimeSlot: order.deliveryTimeSlot ?? null,
  deliveredTime: order.deliveredTime ?? "",
  settlementType: order.settlementType ?? "",
  ```

### 12. Update CSV Export
- Add new columns to CSV headers array (line 1293-1309)
- Add new fields mapping in CSV rows (lines 1312-1328):
  - Order Type
  - Delivery Type
  - Request Tax (Yes/No)
  - Delivery Time Slot (formatted)
  - Delivered Time (formatted)
  - Settlement Type

### 13. Add Mock Data Support (Development Mode)
- Update `mapApiResponseToOrders` function to add mock FMS fields in development mode (around lines 256-281):
  ```typescript
  // Add mock FMS data for development
  if (process.env.NODE_ENV === 'development') {
    const orderTypes = ['Large format', 'Tops daily CFR', 'Tops daily CFM', 'Subscription', 'Retail']
    const deliveryTypes = ['Standard Delivery', 'Express Delivery', 'Click & Collect']
    const settlementTypes = ['Auto Settle', 'Manual Settle']

    demoOrder.orderType = orderTypes[index % orderTypes.length]
    demoOrder.deliveryType = deliveryTypes[index % deliveryTypes.length]
    demoOrder.settlementType = settlementTypes[index % settlementTypes.length]
    demoOrder.fullTaxInvoice = index % 2 === 0
    // ... add time slot and delivered time mock data
  }
  ```

### 14. Validate the Implementation
- Run `pnpm dev` to start development server
- Test all new filters work correctly
- Test CSV export includes new fields
- Test table displays new columns with correct data
- Verify mobile responsiveness

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm lint` - Verify no ESLint errors
- `pnpm build` - Verify production build succeeds
- `pnpm dev` - Start development server and manually test:
  - New filter dropdowns appear and function
  - New table columns display correctly
  - CSV export includes all new fields
  - Date type selector changes date filter behavior

## Notes
- The `fullTaxInvoice` field already exists in the Order interface and can be reused for Request Tax display
- Delivery Type abbreviations (STD, EXP, CC) are for display only; internal values use full wording
- The Date Type selector affects how the From/To date filters work - switching between filtering by Order Date, Payment Date, Delivery Date, or Shipping Slot
- Mock data should only be added in development mode to facilitate testing
- Maintain existing filter logic patterns and responsive design approach
- Use consistent badge styling from existing badge components
