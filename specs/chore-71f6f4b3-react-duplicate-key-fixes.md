# Chore: Fix React Duplicate Key Errors and System-wide Key Analysis

## Metadata
adw_id: `71f6f4b3`
prompt: `Fix React duplicate key errors and analyze all system components for similar issues`

## Chore Description
This chore addresses critical React duplicate key errors that cause rendering issues and potential bugs. The primary issue is in `order-detail-view.tsx` at line 642 where `item.product_sku` is used as a React key, but SKUs can be duplicated when the same product appears multiple times in an order. This causes React's "Encountered two children with the same key" error.

A comprehensive system-wide analysis has identified 14+ files with potentially problematic key usage patterns, including:
- Using non-unique fields (SKU, name) as keys
- Using index as key in dynamic lists (anti-pattern)
- Missing fallback keys when IDs might not exist

The fix will ensure all React keys are truly unique by combining fields with indexes or using proper unique identifiers, preventing rendering bugs and improving React reconciliation performance.

## Relevant Files
Use these files to complete the chore:

### Files with CRITICAL Issues (Must Fix)
- **src/components/order-detail-view.tsx** (Line 642) - Using `product_sku` as key, but SKUs duplicate within orders
- **src/components/order-detail-view.tsx** (Line 841) - Using `idx` for promotions map without unique promotion ID
- **src/components/executive-dashboard/alerts-section.tsx** (Lines 157, 209) - Using `index` for dynamic alert lists
- **src/components/executive-dashboard.tsx** (Lines 3093, 3124) - Using `index` for alert maps in critical alert system

### Files with MEDIUM Priority Issues
- **src/components/analytics-tab.tsx** (Lines 185, 250) - Using `index` in business unit revenue and top products maps
- **src/components/fetch-summary.tsx** (Lines 433, 513) - Using `index` in error and log maps
- **src/components/enhanced-filter-panel.tsx** (Lines 329, 392) - Using `index` in filter badges and suggestions
- **src/components/advanced-filter-panel.tsx** (Line 406) - Using `index` in filter summary badges
- **src/components/fulfillment-tab.tsx** (Lines 88, 108) - Using `index` in branch and channel data maps
- **src/components/interactive-chart.tsx** (Line 458) - Using `index` in insights map

### Files with LOW Priority Issues (Acceptable in Current Context)
- **src/components/pagination-controls.tsx** (Line 175) - Using `index` in pagination (static context)
- **src/components/atc-config/time-slot-picker.tsx** (Line 145) - Using `index` in time slots
- **src/components/atc-config/config-diff-viewer.tsx** (Line 71) - Using `index` in diff rows
- **src/components/stock-config/upload-history-table.tsx** (Line 140) - Using `i` in skeleton loading (acceptable)
- **src/components/stock-config/stock-config-table.tsx** (Line 114) - Using `i` in skeleton loading (acceptable)

### Files Following GOOD Practices (Reference Examples)
- **src/components/orders-table.tsx** (Line 229) - Correctly using `order.id` as unique key ✓
- **src/components/dashboard-customizer.tsx** (Lines 377, 484, 604) - Correctly using `widget.id` ✓
- **src/components/order-detail-view.tsx** (Line 1119) - Correctly using `note.id` for notes map ✓

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Fix Critical Issue in order-detail-view.tsx (Line 642)
- Change `key={item.product_sku}` to `key={item.id || `${item.product_sku}-${index}`}`
- This combines product_sku with the index to guarantee uniqueness even when the same product appears multiple times
- Update the line from:
  ```tsx
  <Card key={item.product_sku} className="...">
  ```
  To:
  ```tsx
  <Card key={item.id || `${item.product_sku}-${index}`} className="...">
  ```
- Ensure the `.map()` function includes the `index` parameter: `filteredItems.map((item: ApiOrderItem, index) => ...)`

### 2. Fix Promotions Map in order-detail-view.tsx (Line 841)
- Change `key={idx}` to use a unique promotion identifier or combine with parent item
- Update from:
  ```tsx
  {item.promotions.map((promo, idx) => (
    <div key={idx} className="...">
  ```
  To:
  ```tsx
  {item.promotions.map((promo, idx) => (
    <div key={promo.promotionId || `promo-${item.product_sku}-${idx}`} className="...">
  ```

### 3. Fix Executive Dashboard Alerts (executive-dashboard.tsx)
- Update line 3093 from `key={index}` to `key={alert.id || `breach-${index}`}`
- Update line 3124 from `key={index}` to `key={alert.id || `approaching-${index}`}`
- Ensure each alert has a unique identifier, preferably using the order ID if available
- Example fix:
  ```tsx
  {orderAlerts.map((alert, index) => (
    <div key={alert.order?.id || `breach-${index}`} className="...">
  ```

### 4. Fix Alerts Section Component (alerts-section.tsx)
- Update line 157 (breach alerts) from `key={index}` to use alert's order ID:
  ```tsx
  {alerts.map((alert, index) => (
    <div key={alert.order?.id || `alert-breach-${index}`} className="...">
  ```
- Update line 209 (approaching SLA alerts) similarly:
  ```tsx
  {alerts.map((alert, index) => (
    <div key={alert.order?.id || `alert-approaching-${index}`} className="...">
  ```
- Keep skeleton loading at line 111 as-is (using `key={i}` is acceptable for static placeholders)

### 5. Fix Analytics Tab (analytics-tab.tsx)
- Update line 185 (business unit revenue):
  ```tsx
  {businessUnitRevenue.map((item, index) => (
    <div key={item.name || `bu-${index}`} className="...">
  ```
- Update line 250 (top products):
  ```tsx
  {topProducts.map((product, index) => (
    <div key={product.id || product.name || `product-${index}`} className="...">
  ```

### 6. Fix Fetch Summary Component (fetch-summary.tsx)
- Update line 433 (errors map):
  ```tsx
  {data.errors.map((error, index) => (
    <div key={`error-${error.code || index}`} className="...">
  ```
- Update line 513 (logs map):
  ```tsx
  {logs.map((log, index) => (
    <div key={`log-${log.timestamp || index}`} className="...">
  ```

### 7. Fix Filter Panels (enhanced-filter-panel.tsx and advanced-filter-panel.tsx)
- Update enhanced-filter-panel.tsx line 329:
  ```tsx
  {filterSummary.map((filter, index) => (
    <Badge key={`filter-${filter.field}-${filter.value}-${index}`}>
  ```
- Update enhanced-filter-panel.tsx line 392:
  ```tsx
  {smartSuggestions.map((suggestion, index) => (
    <div key={suggestion.id || `suggestion-${index}`} className="...">
  ```
- Update advanced-filter-panel.tsx line 406 similarly for filter badges

### 8. Fix Fulfillment Tab (fulfillment-tab.tsx)
- Update line 88 (branch data):
  ```tsx
  {branchData.map((branch, index) => (
    <div key={branch.id || branch.name || `branch-${index}`} className="...">
  ```
- Update line 108 (channel data):
  ```tsx
  {channelData.map((channel, index) => (
    <div key={channel.name || `channel-${index}`} className="...">
  ```

### 9. Fix Interactive Chart (interactive-chart.tsx)
- Update line 458 (insights map):
  ```tsx
  {insights.map((insight, index) => (
    <div key={insight.id || `insight-${index}`} className="...">
  ```

### 10. Review Low Priority Files
- Check pagination-controls.tsx line 175 - if the pagination items are static page numbers, `key={index}` is acceptable
- Check atc-config files (time-slot-picker.tsx, config-diff-viewer.tsx) - if items are static/stable, current usage is acceptable
- Skeleton loading loops in stock-config files are acceptable (temporary placeholders)

### 11. Add Helper Function for Key Generation (Optional Enhancement)
- Create a utility function in `src/lib/utils.ts`:
  ```typescript
  /**
   * Generate a unique React key combining multiple fallback values
   * @param values - Array of potential key values, first non-empty is used
   * @param prefix - Optional prefix for the key
   * @param index - Fallback index if all values are empty
   */
  export function generateUniqueKey(
    values: (string | number | undefined | null)[],
    prefix: string = 'item',
    index?: number
  ): string {
    for (const value of values) {
      if (value !== undefined && value !== null && value !== '') {
        return `${prefix}-${value}`;
      }
    }
    return `${prefix}-${index ?? Math.random().toString(36).substr(2, 9)}`;
  }
  ```
- Use this helper in components for cleaner code:
  ```tsx
  key={generateUniqueKey([item.id, item.product_sku], 'product', index)}
  ```

### 12. Test All Changes
- Run `pnpm dev` to start the development server
- Monitor the browser console for any React key warnings
- Test the order detail view with orders containing:
  - Multiple items with the same SKU (critical test case)
  - Items with promotions
  - Items with all data fields present
  - Items with missing/null fields
- Test executive dashboard alerts section
- Test analytics charts and fulfillment tables
- Verify NO console errors appear about "Encountered two children with the same key"

### 13. Verify Build Success
- Run `pnpm build` to ensure production build succeeds
- Check build output for any warnings about keys
- Verify no TypeScript errors related to the changes

## Validation Commands
Execute these commands to validate the chore is complete:

```bash
# 1. Start development server and check for console errors
pnpm dev
# Let it run, open browser, navigate to orders with duplicate SKUs
# Check browser console - should see NO key warnings
# Press Ctrl+C to stop

# 2. Search for remaining problematic key patterns
grep -r "key={item.product_sku}" src/components/
# Expected: No results (fixed)

grep -r "key={idx}" src/components/order-detail-view.tsx
# Expected: No results (fixed)

grep -r 'key={index}' src/components/executive-dashboard/alerts-section.tsx
# Expected: Only in skeleton loading loop (line 111), not in alert maps

# 3. Verify all critical files were updated
git diff src/components/order-detail-view.tsx
git diff src/components/executive-dashboard/alerts-section.tsx
git diff src/components/executive-dashboard.tsx
git diff src/components/analytics-tab.tsx
# Each should show the updated key patterns

# 4. Run production build to ensure no errors
pnpm build
# Expected: Build succeeds with no errors or warnings about keys

# 5. Run linter to check for any code issues
pnpm lint
# Expected: No new linting errors from the changes
```

## Notes

### Key Generation Best Practices Applied
1. **Primary Strategy**: Use unique identifiers when available (item.id, order.id, promotion.promotionId)
2. **Fallback Strategy**: Combine multiple fields with index to ensure uniqueness (e.g., `${item.product_sku}-${index}`)
3. **Never Use Index Alone**: Except for static/temporary content like skeleton loading
4. **Template Literal Format**: Use backticks for combining values: `` `${field}-${index}` ``

### Why Index-Only Keys Are Problematic
- Causes bugs when lists are reordered (items swap positions)
- Breaks React reconciliation when items are filtered or sorted
- Performance degradation due to unnecessary re-renders
- Component state can persist to wrong items

### When Index Keys Are Acceptable
- Static content that never changes order
- Temporary placeholder content (skeleton loading)
- Pagination controls with fixed page numbers
- Content that's re-created on every render (not persisted)

### Testing Strategy
- Focus on the order detail view as the primary test case (confirmed bug)
- Test with real-world scenario: order with 2+ items of the same product
- Verify alerts section with multiple breach/approaching alerts
- Check dynamic filter badges that can be added/removed
- Validate analytics charts with data that can be sorted/filtered

### Performance Impact
- Minimal performance impact from the changes
- Actually improves performance by enabling proper React reconciliation
- No additional memory overhead
- More predictable component behavior

### Documentation
- Document the key generation pattern in code comments where complex
- Add JSDoc comments to the generateUniqueKey utility function
- Consider adding a development guide about React key best practices
