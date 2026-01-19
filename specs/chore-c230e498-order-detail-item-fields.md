# Chore: Add new fields to order detail item expandable section

## Metadata
adw_id: `c230e498`
prompt: `Add new fields to order detail item expandable section in order-detail-view.tsx: weight, actualWeight, route, bookingSlotFrom, bookingSlotTo`

## Chore Description
This chore adds five new fields to the order item expandable section in the Order Detail View. The fields are split between two columns:

**Pricing & Promotions column:**
- `weight` - Product weight in kg
- `actualWeight` - Actual measured weight in kg

**Fulfillment & Shipping column:**
- `route` - Delivery route name (e.g., 'สายรถหนองบอน')
- `bookingSlotFrom` - ISO datetime string for booking slot start
- `bookingSlotTo` - ISO datetime string for booking slot end

The implementation requires updating the `ApiOrderItem` interface, adding UI fields in the appropriate columns, and updating mock data generation to include these new fields.

## Relevant Files
Use these files to complete the chore:

- **`src/components/order-management-hub.tsx`** (lines 92-135) - Contains the `ApiOrderItem` interface that needs new field definitions. This is the source of truth for the order item type.

- **`src/components/order-detail-view.tsx`** (lines 773-904) - Contains the item expandable section with two relevant columns:
  - Pricing & Promotions (lines 773-830) - Add weight fields after Gift with Purchase
  - Fulfillment & Shipping (lines 832-904) - Add route and booking slot fields after Bundle Ref

- **`src/lib/utils.ts`** - Contains datetime formatting utilities like `formatGMT7DateTime()` that should be used for booking slot display

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update ApiOrderItem Interface
- Open `src/components/order-management-hub.tsx`
- Locate the `ApiOrderItem` interface (around line 92-135)
- Add the following optional fields after `priceBreakdown`:
  ```typescript
  weight?: number  // Product weight in kg
  actualWeight?: number  // Actual measured weight in kg
  route?: string  // Delivery route name, e.g., 'สายรถหนองบอน'
  bookingSlotFrom?: string  // ISO datetime string, e.g., '2026-01-12T14:00:00'
  bookingSlotTo?: string  // ISO datetime string, e.g., '2026-01-12T15:00:00'
  ```

### 2. Add Weight Fields to Pricing & Promotions Column
- Open `src/components/order-detail-view.tsx`
- Locate the Pricing & Promotions column (around line 773-830)
- After the Gift with Purchase field (around line 827-828), add:
  ```tsx
  <div className="flex justify-between">
    <span className="text-gray-500">Weight</span>
    <span className="text-gray-900 font-medium">{item.weight || 0} kg</span>
  </div>
  <div className="flex justify-between">
    <span className="text-gray-500">Weight (Actual)</span>
    <span className="text-gray-900 font-medium">{item.actualWeight || 0} kg</span>
  </div>
  ```

### 3. Add Route and Booking Slot Fields to Fulfillment & Shipping Column
- In the same file, locate the Fulfillment & Shipping column (around line 832-904)
- After the Bundle Ref field (around line 858-859), before the ETA field, add:
  ```tsx
  <div className="flex justify-between">
    <span className="text-gray-500">Route</span>
    <span className="text-gray-900 font-medium">{item.route || 'N/A'}</span>
  </div>
  <div className="flex justify-between">
    <span className="text-gray-500">Booking Slot From</span>
    <span className="text-gray-900 font-medium text-xs">
      {item.bookingSlotFrom ? formatGMT7DateTime(item.bookingSlotFrom) : 'N/A'}
    </span>
  </div>
  <div className="flex justify-between">
    <span className="text-gray-500">Booking Slot To</span>
    <span className="text-gray-900 font-medium text-xs">
      {item.bookingSlotFrom ? formatGMT7DateTime(item.bookingSlotTo) : 'N/A'}
    </span>
  </div>
  ```
- Ensure `formatGMT7DateTime` is imported from `@/lib/utils` at the top of the file

### 4. Update Mock Data Generation (if applicable)
- Search for any mock data generation in `order-management-hub.tsx` that creates `ApiOrderItem` objects
- If mock data exists, add the new fields with sample values:
  - `weight`: Random value between 0.1 and 5.0 kg (e.g., `parseFloat((Math.random() * 4.9 + 0.1).toFixed(2))`)
  - `actualWeight`: Slightly different from weight (e.g., `weight + (Math.random() * 0.2 - 0.1)`)
  - `route`: Sample Thai route names from array: `['สายรถหนองบอน', 'สายรถบางนา', 'สายรถลาดพร้าว', 'สายรถรามคำแหง', 'สายรถพระราม 9']`
  - `bookingSlotFrom`: ISO datetime string based on order date
  - `bookingSlotTo`: 1-2 hours after bookingSlotFrom

### 5. Validate the Implementation
- Run the development server
- Navigate to Order Management Hub
- Click on an order to open Order Detail View
- Expand an item in the Items tab
- Verify all new fields appear correctly:
  - Weight and Weight (Actual) in Pricing & Promotions column
  - Route, Booking Slot From, and Booking Slot To in Fulfillment & Shipping column

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure no TypeScript compilation errors
- `pnpm lint` - Ensure no linting errors
- `pnpm dev` - Start development server and manually test the UI

## Notes
- The datetime formatting should use the existing `formatGMT7DateTime` utility from `@/lib/utils.ts` for consistency with the rest of the application
- Weight values should display with unit "kg" suffix
- Route field should show 'N/A' if not provided
- Booking slot fields should show 'N/A' if not provided, otherwise format as readable datetime
- Follow existing styling patterns (text-gray-500 for labels, text-gray-900 font-medium for values)
- The `bookingSlotTo` condition in step 3 intentionally checks `bookingSlotFrom` for both fields to ensure consistent display
