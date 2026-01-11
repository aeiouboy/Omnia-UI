# Chore: Add SKU Search Box and Update Items Tab Fields

## Metadata
adw_id: `ee1adc9e`
prompt: `Add a separate dedicated SKU search box to the Order Management Hub, remove Category field from items, and add Gift Wrapped Message field.`

## Chore Description
This chore involves three changes:
1. **Part 1 - Separate SKU Search Box**: Create a dedicated SKU-specific search input field in the Order Management Hub, separate from the main search box. The main search box currently combines order #, customer, and SKU search. After this change, SKU search will have its own input field, and the main search will only handle order #, customer name, email, and phone.
2. **Part 2a - Remove Category Field**: In the Items tab expanded details section, remove the Category field from the Product Details column.
3. **Part 2b - Add Gift Wrapped Message Field**: Add a Gift Wrapped Message field that displays conditionally when Gift Wrapped is 'Yes' and a gift message exists.

## Relevant Files
Use these files to complete the chore:

- **src/components/order-management-hub.tsx** - Main Order Management Hub component
  - Contains the current search box that combines order #, customer, and SKU search
  - Line ~440: `searchTerm` state variable
  - Line ~912-930: Search term filter logic that includes SKU matching
  - Line ~760-777: `generateActiveFilters` that shows active filter badges
  - Line ~744-757: `removeFilter` function for clearing individual filters
  - Line ~1319-1359: Filter UI section with main search input and dropdowns

- **src/components/order-detail-view.tsx** - Order Detail View component with Items tab
  - Line ~723-911: Expanded item details section with 3-column layout
  - Line ~727-775: Product Details column (Column 1)
  - Line ~767-769: Category field to be removed
  - Line ~754-761: Gift Wrapped field and Gift Message field (already implemented correctly)

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Add SKU Search State Variable
- In `src/components/order-management-hub.tsx`, add a new state variable `skuSearchTerm` after the existing `searchTerm` state (line ~440)
- Initialize with empty string: `const [skuSearchTerm, setSkuSearchTerm] = useState("")`

### 2. Update Main Search Placeholder
- In the main search input (line ~1321-1328), update the placeholder from `"Search by order #, customer, SKU..."` to `"Search by order #, customer name, email, phone..."`

### 3. Add SKU Search Input Field
- After the main search input (line ~1328), add a new Input component for SKU search
- Use similar styling but with `max-w-48` (narrower)
- Placeholder: `"Search by SKU..."`
- Add Search icon on the left side
- Wire it to `skuSearchTerm` state

### 4. Update Filter Logic - Remove SKU from Main Search
- In the `filteredOrders` filter function (line ~912-930), remove the SKU matching logic from the main search term filter
- The main search should only check: order.id, order.order_no, customer.name, customer.email, customer.phone, channel, status

### 5. Add Separate SKU Filter Logic
- Add a new filter condition in the `filteredOrders` function for SKU search
- Check if `skuSearchTerm` has a value
- Match against `order.items` array - check if any item's `product_sku` contains the search term (case-insensitive)
- Both main search and SKU search should use AND logic (if both have values, both must match)

### 6. Update Active Filters Display
- In `generateActiveFilters` (line ~760-777), add logic to show SKU filter as a separate tag
- Format: `SKU: {skuSearchTerm}`
- Only show when `skuSearchTerm` has a value

### 7. Update Remove Filter Function
- In `removeFilter` function (line ~744-757), add handling for SKU filter
- Check if filter starts with "SKU:" and clear `skuSearchTerm` state

### 8. Update Reset All Filters
- In `handleResetAllFilters` function (line ~780-787), add `setSkuSearchTerm("")` to clear SKU search

### 9. Update Clear Filters Button Dependencies
- In the Clear Filters button (line ~1297-1312), add `!skuSearchTerm` to the disabled condition

### 10. Remove Category Field from Items Tab
- In `src/components/order-detail-view.tsx`, locate the Product Details column (lines ~727-775)
- Remove the Category field display (lines ~767-769):
  ```tsx
  <div className="flex justify-between">
    <span className="text-gray-500">Category</span>
    <span className="text-gray-900 font-medium">{item.product_details?.category || 'N/A'}</span>
  </div>
  ```

### 11. Verify Gift Wrapped Message Field
- Confirm the Gift Wrapped Message field is already properly implemented (lines ~756-761)
- The current implementation shows Gift Message only when `item.giftWrapped && item.giftWrappedMessage`
- No changes needed - field is already correctly implemented

### 12. Validate the Changes
- Run the development server
- Test SKU search independently from main search
- Test both filters working together (AND logic)
- Test clearing individual filters
- Test Clear All Filters button
- Verify Category field is removed from Items tab expanded details
- Verify Gift Message field displays correctly when Gift Wrapped is Yes

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm dev` - Start development server, verify no compilation errors
- `pnpm lint` - Run ESLint to check for code quality issues
- `pnpm build` - Build for production to ensure no TypeScript errors

## Manual Validation Steps
1. Navigate to Order Management Hub
2. Type a SKU value (e.g., "PANTRY-001") in the new SKU search box
3. Verify only orders with matching SKU in items are shown
4. Type customer name in main search box
5. Verify AND logic - both SKU and customer must match
6. Verify "SKU: PANTRY-001" appears in active filters
7. Click X on SKU filter badge to clear only SKU filter
8. Click Clear Filters to reset all filters
9. Click on an order to open Order Detail View
10. Go to Items tab and expand an item
11. Verify Category field is NOT shown in Product Details column
12. Verify Gift Message shows when Gift Wrapped is Yes (if applicable)

## Notes
- The Gift Wrapped Message field is already correctly implemented at lines 756-761
- The SKU search should be case-insensitive like the main search
- Layout should be responsive - SKU search box should stack below main search on mobile
