# Chore: Remove Bundle Ref field and (Split line X) indicator from order detail view

## Metadata
adw_id: `0c48416c`
prompt: `Remove Bundle Ref field and (Split line X) indicator from order detail view Items tab. The Bundle Ref display shows bundle reference numbers like 'Bundle Ref: BDL-3638' and the split line numbering shows '(Split line 1)', '(Split line 2)' etc. Both should be removed from the UI display while keeping the order line splitting logic intact. Target file: src/components/order-detail-view.tsx`

## Chore Description
Remove two UI elements from the Items tab in the order detail view:
1. **Bundle Ref field** - displays bundle reference numbers (e.g., "Bundle Ref: BDL-3638")
2. **Split line indicator** - displays line numbering like "(Split line 1)", "(Split line 2)", etc.

These elements should be removed from the UI display while preserving the underlying order line splitting logic (the data structure and logic for split lines should remain intact - only the visual display elements should be removed).

## Relevant Files
- **src/components/order-detail-view.tsx** - Main file to modify. Contains the Items tab with order item display logic where Bundle Ref and Split line indicators are rendered

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Remove Split Line Indicator from Item Header
- Locate the split line indicator display around line 738-742
- Remove the conditional render block that displays `(Split line {item.splitIndex! + 1})`
- This is in the "Price and Quantity" section of the item header

### 2. Remove Bundle Ref Field from Item Header
- Locate the Bundle Ref display around line 744-749
- Remove the entire conditional block that displays "Bundle Ref:" and the bundle reference value
- This is also in the "Price and Quantity" section of the item header

### 3. Remove Bundle Ref from Expanded Item Details (Column 3)
- Locate the Bundle Ref display in the "Fulfillment & Shipping" column around line 944-949
- Remove the conditional block that shows "Bundle Ref" with its value
- This is in the collapsible item details section

### 4. Verify Order Line Splitting Logic Remains Intact
- Confirm that `item.parentLineId` and `item.splitIndex` data properties are still accessed (only UI removal)
- Confirm that `item.bundleRef` data property is still present in the data structure (only UI removal)
- The underlying data and splitting logic should remain unchanged

## Validation Commands
Execute these commands to validate the chore is complete:

```bash
# Verify no Bundle Ref text remains in the file
grep -n "Bundle Ref" src/components/order-detail-view.tsx
# Expected: No results (or only in comments)

# Verify no Split line text remains in the file
grep -n "Split line" src/components/order-detail-view.tsx
# Expected: No results (or only in comments)

# Build the project to ensure no TypeScript errors
pnpm build

# Run development server to visually verify
pnpm dev
# Then navigate to an order detail view and check Items tab
```

## Notes
- The data properties (`parentLineId`, `splitIndex`, `bundleRef`) should remain in the type definitions and data structures
- Only the visual display elements should be removed
- This is a UI cleanup task - no business logic changes are required
- The order line splitting functionality should continue to work as before, just without the visual indicators
