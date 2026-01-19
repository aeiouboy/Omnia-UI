# Chore: Order Line Splitting Implementation

## Metadata
adw_id: `69503bbd`
prompt: `Implement order line splitting logic to normalize all order line items to 1 quantity unit per line.`

## Chore Description

Implement order line splitting logic to normalize all order line items so that each line represents exactly 1 quantity unit. When users place orders with multiple quantities (e.g., Item A: 3 qty, Item B: 2 qty, Item C: 1.25 kg), the system should split these into individual order lines where each line represents exactly 1 unit.

**Example Transformation:**
- **Input:** `Order lines [{item: 'A', qty: 3}, {item: 'B', qty: 2}, {item: 'C', qty: 1.25}]`
- **Output:** `Order lines [{item: 'A', qty: 1}, {item: 'A', qty: 1}, {item: 'A', qty: 1}, {item: 'B', qty: 1}, {item: 'B', qty: 1}, {item: 'C', qty: 1.25}]`

The implementation must handle edge cases including decimal quantities (weight-based items), zero quantities, null/undefined quantities, and preserve original order line metadata across split lines.

## Relevant Files

### Existing Files to Modify

#### `src/components/order-management-hub.tsx` (Line ~93)
- **Why:** Contains the primary `ApiOrderItem` interface definition used throughout the application
- **Action:** Add optional fields to track split relationships (parentLineId, splitIndex, splitReason)

#### `src/lib/mock-data.ts`
- **Why:** Contains mock order data with sample order lines used for development and testing
- **Action:** Update mock data to include items with quantities > 1 for testing split logic

#### `app/api/orders/external/route.ts`
- **Why:** External API integration layer that fetches order data and applies transformations
- **Action:** Apply order line splitting transformation to all order responses before returning to client

#### `src/components/order-detail-view.tsx` (Line ~629-1033)
- **Why:** Order detail display component that renders order line items in the Items tab
- **Action:** Update UI to properly display split order lines with visual grouping indicators

### New Files to Create

#### `src/lib/order-utils.ts`
- **Why:** New utility module for order-related transformation functions
- **Action:** Implement `splitOrderLines()` function with comprehensive splitting logic

#### `src/lib/__tests__/order-utils.test.ts`
- **Why:** Unit tests to validate order line splitting logic across various scenarios
- **Action:** Add test cases for integer quantities, decimal quantities, edge cases

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Analyze Current Order Line Data Structure
- Read `src/components/order-management-hub.tsx` lines 93-130 to understand `ApiOrderItem` interface
- Read `src/lib/mock-data.ts` to find sample order line data structures
- Document all fields that must be preserved during splitting (SKU, price, discounts, metadata)
- Identify which fields should remain unique per split line vs. copied from parent

### 2. Extend ApiOrderItem Type Definition
- Add `parentLineId?: string` field to track original order line ID for split items
- Add `splitIndex?: number` field to indicate the position in the split sequence (0-based)
- Add `splitReason?: string` field to document why the line was split (e.g., "quantity-normalization")
- Update `src/components/order-management-hub.tsx` interface definition
- Ensure backward compatibility - all new fields must be optional

### 3. Create Order Utils Module with Split Function
- Create new file `src/lib/order-utils.ts`
- Implement `splitOrderLines(items: ApiOrderItem[]): ApiOrderItem[]` function
- **Splitting Logic:**
  - For items with `quantity > 1` and integer quantity: Split into N lines with `quantity = 1`
  - For items with decimal quantity (e.g., 1.25 kg): Keep as single line (weight-based items)
  - For items with `quantity <= 0`: Return empty array (filter out invalid items)
  - For items with null/undefined quantity: Default to 1 and don't split
- **Metadata Preservation:**
  - Copy all original fields to each split line (SKU, price, promotions, etc.)
  - Generate unique IDs for split lines: `{originalId}-{splitIndex}`
  - Set `parentLineId` to original item ID on all split lines
  - Set `splitIndex` to position in sequence (0, 1, 2, ...)
  - Set `splitReason` to "quantity-normalization"
- **Price Calculation:**
  - Set `quantity = 1` on split lines
  - Set `unit_price` to original unit price (same for all split lines)
  - Set `total_price = unit_price` for each split line (individual line total)

### 4. Update External API Route Transformation
- Import `splitOrderLines` function in `app/api/orders/external/route.ts`
- Apply splitting transformation to order items after data fetching
- Apply transformation at line ~302 (after channel normalization) in the success response path
- Apply transformation in all fallback paths (mock data, error responses)
- Log splitting statistics: total items before/after, number of splits applied
- Ensure transformation happens before returning response to client

### 5. Update Mock Data with Test Cases
- Add sample orders with quantities > 1 to `src/lib/mock-data.ts`
- Include test cases: qty=2, qty=3, qty=5
- Include weight-based item with decimal quantity (e.g., 1.75 kg) that should NOT split
- Include edge case: qty=0 (should be filtered)
- Include edge case: null/undefined quantity (should default to 1)

### 6. Update Order Detail View Component
- Modify `src/components/order-detail-view.tsx` Items tab rendering (lines 664-1010)
- **Visual Grouping:**
  - Group split lines by `parentLineId` for visual organization
  - Add visual separator between different product groups
  - Show "(1 of N)" indicator on split line items
- **Display Updates:**
  - Update quantity display to show "1 of {originalQty}" for split lines
  - Update item count header to reflect split line count vs. original count
  - Add tooltip or subtitle showing original quantity when hovering split lines
- **Search and Filter:**
  - Ensure search functionality works across split lines
  - When one split line matches search, show all related split lines

### 7. Handle Backward Compatibility
- Ensure components without split logic still work (graceful degradation)
- Add feature flag `ENABLE_ORDER_LINE_SPLITTING` environment variable (default: true)
- Check flag before applying split transformation
- Update all `ApiOrderItem` references across codebase to handle new optional fields

### 8. Implement Unit Tests
- Create `src/lib/__tests__/order-utils.test.ts`
- **Test Cases:**
  - Single item with qty=1 (no split expected)
  - Single item with qty=3 (split into 3 lines with qty=1 each)
  - Single item with qty=1.5 (no split - decimal quantity)
  - Single item with qty=0 (filtered out)
  - Single item with null quantity (defaults to 1, no split)
  - Multiple items with mixed quantities
  - Metadata preservation (SKU, price, promotions copied correctly)
  - parentLineId and splitIndex correctly assigned
  - Total price calculation on split lines (unit_price * 1)

### 9. Validate End-to-End Integration
- Run development server: `pnpm dev`
- Navigate to order detail page with items having quantity > 1
- Verify split lines appear correctly with proper grouping
- Verify quantity display shows "1 of N" for split lines
- Verify price calculations are correct per split line
- Verify search functionality works with split lines
- Test with mock data orders (quantity test cases)
- Check browser console for any errors

## Validation Commands

Execute these commands to validate the chore is complete:

```bash
# 1. Type checking - ensure no TypeScript errors
pnpm build

# 2. Linting - check code quality
pnpm lint

# 3. Run unit tests (if test framework is configured)
pnpm test

# 4. Start development server and manually test
pnpm dev
# Then navigate to http://localhost:3000 and test:
# - Open order details for orders with qty > 1 items
# - Verify split lines appear with (1 of N) indicators
# - Test search functionality with split lines
# - Verify price calculations are correct

# 5. Check for any console errors
# Open browser DevTools and verify no errors

# 6. Verify mock data includes test cases
grep -n "quantity.*[2-9]" src/lib/mock-data.ts
```

## Notes

### Decimal Quantity Handling
Weight-based items (e.g., 1.25 kg of meat, 2.5 kg of rice) should NOT be split as they represent continuous quantities rather than discrete units. The splitting logic should only apply to integer quantities representing discrete items.

### Performance Considerations
- Order line splitting increases array size, which could impact rendering performance
- Consider pagination for orders with many items and high quantities
- Memoization may be needed for expensive calculations in order detail view

### Data Integrity
- Original order total should remain unchanged (sum of split line totals equals original total)
- `parentLineId` enables tracing split lines back to source
- Do NOT modify external API - apply transformation after data fetch

### UI/UX Considerations
- Split lines should be visually grouped to avoid user confusion
- Clear indication of "1 of N" helps users understand the relationship
- Hover tooltips can provide additional context about the original quantity

### Future Enhancements
- Add split reason codes for different splitting scenarios
- Support manual line splitting/merging in UI
- Add audit trail for when lines are split
- Support split lines for partial fulfillment scenarios
