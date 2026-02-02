# Chore: Remove Order Line Split Logic

## Metadata
adw_id: `17105b9b`
prompt: `Remove the split order line logic that splits order lines into 1 quantity per order line. Find all locations in the codebase where order lines are being split or duplicated based on quantity (creating multiple lines with qty=1 instead of keeping original quantity). Remove this splitting behavior and preserve the original order line quantities as-is from the API response. Search for patterns like quantity splitting, line duplication, forEach loops creating multiple items from qty, or any logic that transforms a single order line with qty N into N separate lines.`

## Chore Description

Remove the order line splitting logic that was implemented to normalize order lines to quantity=1 per line. This feature is no longer needed and adds unnecessary complexity. The system should preserve original order line quantities exactly as they come from the API response.

**Current Behavior (to be removed):**
- Order lines with `qty > 1` are split into N separate lines with `qty=1` each
- Split lines have `parentLineId`, `splitIndex`, and `splitReason` metadata
- Example: `{item: 'A', qty: 3}` becomes 3 lines: `{qty:1}, {qty:1}, {qty:1}`

**Desired Behavior:**
- Order lines keep their original quantities unchanged
- No splitting, no `parentLineId`/`splitIndex`/`splitReason` fields needed
- Example: `{item: 'A', qty: 3}` remains `{item: 'A', qty: 3}`

## Relevant Files

### Files to Modify

#### `src/lib/order-utils.ts`
- **Why:** Contains the core splitting logic (`splitOrderLines`, `splitOrderLineItem`, helper functions)
- **Action:** Remove all splitting functions OR convert `splitOrderLines` to a passthrough function

#### `src/lib/__tests__/order-utils.test.ts`
- **Why:** Contains unit tests for the splitting functions
- **Action:** Remove or update tests to reflect the new passthrough behavior

#### `src/components/order-management-hub.tsx` (Lines 148-151)
- **Why:** Contains the `ApiOrderItem` interface with split-related optional fields (`parentLineId`, `splitIndex`, `splitReason`)
- **Action:** Remove the split-related fields from the interface (optional - can leave for backward compatibility)

#### `src/lib/mock-data.ts`
- **Why:** Contains pre-split mock order data with `parentLineId`, `splitIndex`, `splitReason` fields
- **Action:** Consolidate split mock order lines back into single lines with original quantities

### Files to Review (No Changes Expected)

#### `src/components/order-detail-view.tsx`
- **Why:** Displays order items - verify no split-specific rendering logic exists
- **Confirmed:** No split-specific logic found (no "1 of N" indicators, no parentLineId handling in UI)

#### `app/api/orders/external/route.ts`
- **Why:** API route that might apply split transformation
- **Action:** Verify `splitOrderLines` is not imported or called here

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Order Utils Module
- Read `src/lib/order-utils.ts` to confirm the current implementation
- Modify `splitOrderLines` function to be a simple passthrough:
  ```typescript
  export function splitOrderLines(items: ApiOrderItem[]): ApiOrderItem[] {
    if (!Array.isArray(items) || items.length === 0) {
      return []
    }
    return items
  }
  ```
- Keep the function signature intact to avoid breaking any imports
- Remove or comment out the `splitOrderLineItem` internal function
- Keep helper functions (`groupSplitLinesByParent`, `getOriginalQuantity`, `isSplitLine`, `hasSplitChildren`) for backward compatibility but they will no longer produce meaningful results

### 2. Update Unit Tests
- Modify `src/lib/__tests__/order-utils.test.ts` to reflect new passthrough behavior
- Update test expectations:
  - Items with qty=2 should remain as 1 item with qty=2 (not split into 2)
  - Items with qty=3 should remain as 1 item with qty=3 (not split into 3)
  - All items should preserve their original `id` (no `-0`, `-1` suffixes)
  - No `parentLineId`, `splitIndex`, or `splitReason` should be added
- Remove tests that specifically validate splitting behavior
- Add new test: "should preserve original quantities without modification"

### 3. Update Mock Data
- Read `src/lib/mock-data.ts` to find all pre-split order lines
- For each product group with split lines, consolidate back to a single line:
  - Find all items with same `parentLineId` (e.g., `LINE-W115625-001`)
  - Create single item with:
    - `id`: The original parentLineId (e.g., `LINE-W115625-001`)
    - `quantity`: Count of split items (e.g., 3 split lines → qty=3)
    - `total_price`: `unit_price * quantity`
    - Remove: `parentLineId`, `splitIndex`, `splitReason` fields
- Split lines to consolidate (based on search results):
  - `LINE-W115625-001` (3 items → qty=3): Bon Aroma Coffee
  - `LINE-W115625-002` (2 items → qty=2): Betagro Egg Tofu
  - `LINE-W115625-004` (4 items → qty=4): Unknown product
  - `LINE-W115625-006` (4 items → qty=4): Unknown product
  - `LINE-W115625-007` (2 items → qty=2): Unknown product
  - `LINE-W115626-002` (2 items → qty=2): Unknown product
  - `LINE-W115626-005` (3 items → qty=3): Unknown product

### 4. Verify No Active Usage in Components
- Search for imports of `splitOrderLines` in `/app` and `/src/components` directories
- Confirm the function is not actively called anywhere
- If found, update those locations to remove the call (data should flow through unchanged)

### 5. Clean Up Type Definition (Optional)
- In `src/components/order-management-hub.tsx`, the split fields (`parentLineId`, `splitIndex`, `splitReason`) can be:
  - **Option A (Recommended):** Leave as optional fields for backward compatibility with any existing data
  - **Option B:** Remove the fields and update any references
- The fields are at lines 148-151 of the `ApiOrderItem` interface

### 6. Validate Build and Tests
- Run TypeScript compilation to ensure no type errors
- Run linter to check code quality
- Run unit tests to verify passthrough behavior
- Start dev server and manually verify order detail view shows correct quantities

## Validation Commands

Execute these commands to validate the chore is complete:

```bash
# 1. Type checking - ensure no TypeScript errors
pnpm build

# 2. Linting - check code quality
pnpm lint

# 3. Run unit tests (verify passthrough behavior)
pnpm test src/lib/__tests__/order-utils.test.ts

# 4. Search for any remaining split logic usage
grep -rn "splitOrderLines" --include="*.ts" --include="*.tsx" src/ app/
# Expected: Only in order-utils.ts and its test file

# 5. Verify no active splitting patterns
grep -rn "parentLineId\|splitIndex\|splitReason" --include="*.ts" --include="*.tsx" src/components/ app/
# Expected: Only type definitions, no active usage in rendering logic

# 6. Start dev server and test manually
pnpm dev
# Navigate to order detail view and verify:
# - Items show original quantities (qty=3, not 3 separate qty=1 items)
# - No "1 of N" or "(Split line X)" indicators
# - Total prices are calculated correctly (unit_price * quantity)
```

## Notes

### Backward Compatibility
- The `splitOrderLines` function signature is preserved to avoid breaking any imports
- The function now acts as a simple passthrough returning items unchanged
- Helper functions (`isSplitLine`, `hasSplitChildren`, etc.) are kept but will return false/empty for non-split data
- Type definitions for split fields are kept as optional for any legacy data

### Mock Data Consolidation
- The mock data currently has ~17 split order lines that need consolidation
- Each product group should be merged back into a single line
- Ensure total_price = unit_price × quantity after consolidation

### Testing Strategy
- Unit tests should verify:
  - Items pass through unchanged
  - No modification to IDs
  - No addition of split metadata
  - Original quantities preserved
  - Empty/null array handling still works

### Related Specifications
- Original implementation spec: `specs/chore-69503bbd-order-line-splitting.md`
- Quantity indicator removal spec: `specs/chore-e752abc1-remove-quantity-indicator.md`
