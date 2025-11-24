# Chore: Fix Analytics Tab Data Display Issues

## Metadata
adw_id: `fe47a360`
prompt: `Fix Analytics tab data display issues:

1. Problem: Analytics tab shows 'Unknown Product' and incorrect data
2. Root cause: Field name mismatch between DashboardService.getTopProducts() and AnalyticsTab component
3. DashboardService returns: {product, sku, units_sold, revenue, growth}
4. AnalyticsTab expects: {name, sku, units, revenue}
5. Find where executive dashboard fetches analytics data and passes to AnalyticsTab
6. Add data transformation to map fields correctly:
   - product → name
   - units_sold → units
7. Ensure mock data from DashboardService.getTopProducts() displays correctly:
   - Premium Jasmine Rice 5kg (SKU: PRD-3456, 1250 units, ฿187,500)
   - Organic Bananas (SKU: PRD-5678, 980 units, ฿49,000)
   - Men's Cotton T-Shirt (SKU: PRD-1234, 750 units, ฿262,500)
8. Fix Revenue by Food Category chart to show actual data
9. Test Analytics tab displays proper mock data
10. No console errors

Files likely involved:
- src/components/executive-dashboard/index.tsx or analytics-tab.tsx
- src/lib/dashboard-service.ts (already has proper mock data)

The Analytics tab should display realistic product data from mock data, not 'Unknown Product'.`

## Chore Description
The Analytics tab in the Executive Dashboard is displaying 'Unknown Product' and incorrect data due to a field name mismatch between the data fetching functions and the component interface. The root cause is that:

1. **DashboardService.getTopProducts()** returns mock data with fields: `{product, sku, units_sold, revenue, growth}`
2. **AnalyticsTab component** expects data with fields: `{name, sku, units, revenue}`
3. **fetchTopProducts() in executive-dashboard.tsx** returns data with fields: `{name, sku, units, revenue}` from API orders

The issue occurs because the executive dashboard is NOT using the mock data from DashboardService - instead, it's using a separate `fetchTopProducts()` function that processes order items. When there are no order items in the API response, this function returns empty data, causing the Analytics tab to show no products or 'Unknown Product'.

Additionally, the Revenue by Category chart is similarly affected by the `fetchRevenueByCategory()` function returning empty data when there are no order items.

## Relevant Files
Use these files to complete the chore:

- **src/components/executive-dashboard.tsx** (lines 2600-2691) - Contains fetchTopProducts() and fetchRevenueByCategory() functions that need to fall back to mock data when API data is empty
- **src/components/executive-dashboard/analytics-tab.tsx** (lines 1-152) - The component that displays the analytics data; interface defines expected fields
- **src/lib/dashboard-service.ts** (lines 242-477) - Contains getTopProducts() with proper mock data that should be used as fallback
- **src/components/executive-dashboard/utils.ts** (lines 381-440) - Contains calculateTopProducts() and calculateRevenueByCategory() helper functions

### New Files
No new files need to be created.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Add Mock Data Fallback to fetchTopProducts()
- Open `src/components/executive-dashboard.tsx` and locate the `fetchTopProducts` function (around line 2600)
- Add import for DashboardService at the top of the file: `import { DashboardService } from "@/lib/dashboard-service"`
- Modify the function to use DashboardService.getTopProducts() as fallback when API returns no data
- Transform the DashboardService response to match the expected interface:
  ```typescript
  // If no API data, use mock data from DashboardService
  if (result.length === 0) {
    const mockProducts = await DashboardService.getTopProducts()
    return mockProducts.map(p => ({
      name: p.product,      // Transform: product → name
      sku: p.sku,
      units: p.units_sold,  // Transform: units_sold → units
      revenue: p.revenue
    }))
  }
  ```
- Ensure the mock data is properly transformed to match AnalyticsTab's ProductData interface

### 2. Add Mock Data Fallback to fetchRevenueByCategory()
- In the same file, locate the `fetchRevenueByCategory` function (around line 2649)
- Modify the function to generate realistic mock category data when API returns empty results
- Add realistic food categories (Produce, Dairy, Meat & Seafood, Bakery, Beverages) with proportional revenue distribution
- Example fallback data structure:
  ```typescript
  if (result.length === 0) {
    return [
      { name: 'Produce', value: 250000 },
      { name: 'Dairy & Eggs', value: 180000 },
      { name: 'Meat & Seafood', value: 320000 },
      { name: 'Bakery', value: 150000 },
      { name: 'Beverages', value: 200000 }
    ]
  }
  ```

### 3. Verify AnalyticsTab Component Interface
- Open `src/components/executive-dashboard/analytics-tab.tsx`
- Confirm the ProductData interface expects: `{name, sku, units, revenue}` (lines 8-13)
- Confirm the CategoryData interface expects: `{category, revenue, value?}` (lines 15-19)
- Verify that the component uses `product.name`, `product.units`, etc. in the rendering (lines 51-131)
- No changes needed to this file - just verification

### 4. Test Data Flow
- Read the executive-dashboard.tsx file around lines 1400-1418 to verify how data flows to state
- Confirm that `setTopProducts(topProductsData)` receives the correctly transformed data
- Confirm that `setRevenueByCategory(revenueCategoryData)` receives the correctly structured data
- Verify that the state variables match what AnalyticsTab expects

### 5. Test with Development Server
- Start the development server: `pnpm dev`
- Navigate to the Executive Dashboard
- Switch to the Analytics tab
- Verify that the Top Products section shows:
  - Premium Jasmine Rice 5kg (SKU: PRD-3456, 1250 units, ฿187,500)
  - Organic Bananas (SKU: PRD-5678, 980 units, ฿49,000)
  - Men's Cotton T-Shirt (SKU: PRD-1234, 750 units, ฿262,500)
  - Smartphone (SKU: PRD-8901, 320 units, ฿4,800,000)
  - Running Shoes (SKU: PRD-4567, 280 units, ฿546,000)
- Verify that the Revenue by Food Category pie chart shows the mock category data
- Check browser console for any errors

### 6. Validate No Regressions
- Test that when real API data IS available, it is used instead of mock data
- Verify that the transformation doesn't break when processing real order items
- Confirm that loading states work correctly
- Ensure no TypeScript errors are introduced

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm dev` - Start development server and manually test Analytics tab
- Check browser console for errors when viewing Analytics tab
- Verify in browser DevTools Network tab that API calls are being made
- `npx tsc --noEmit` - Verify no TypeScript compilation errors
- `pnpm lint` - Ensure no linting errors introduced

## Notes

**Key Technical Details:**
- The executive dashboard does NOT currently use AnalyticsTab component - it renders the analytics inline
- The issue is that fetchTopProducts() and fetchRevenueByCategory() return empty arrays when there are no order items in the API response
- DashboardService.getTopProducts() already has perfect mock data, we just need to use it as a fallback
- Field mapping is critical: `product → name` and `units_sold → units`

**Mock Data Source:**
- DashboardService.getTopProducts() in `src/lib/dashboard-service.ts` lines 250-286 contains the correct mock data
- This mock data is already being returned when the order_items table doesn't exist in Supabase
- We need to also use this mock data when the API returns no order items

**Testing Strategy:**
- Primary test: View Analytics tab with no API order items - should show mock data
- Secondary test: View Analytics tab with API order items - should show real data
- Verify no console errors in either scenario
- Confirm proper formatting of currency (฿) and numbers

**Performance Considerations:**
- DashboardService.getTopProducts() is already async and handles errors gracefully
- The fallback should only trigger when result.length === 0
- No additional API calls should be made - DashboardService returns mock data directly when needed
