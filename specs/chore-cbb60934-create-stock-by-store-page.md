# Chore: Create Stock by Store Sub-page

## Metadata
adw_id: `cbb60934`
prompt: `Create new Stock by Store sub-page (app/inventory/stores/page.tsx) that displays all inventory grouped by store. Show aggregated stock status per Tops store with total products, low stock items, critical stock items. Purpose: identify which store's stock needs adjustment first. Include link from main inventory page.`

## Chore Description
Create a new Stock by Store sub-page that provides a store-centric view of inventory management. This page will display aggregated inventory metrics for each of the 8 Tops stores, allowing operations teams to quickly identify which stores require immediate attention based on stock levels. The page will show total products, low stock items, and critical stock items per store, with the ability to drill down into store-specific inventory details.

## Relevant Files

### Existing Files to Modify
- **app/inventory/page.tsx** - Main inventory page that needs a navigation link/button to the new Stock by Store page
- **src/lib/inventory-service.ts** - Already contains `fetchStorePerformance()` function that provides store-level aggregated data
- **src/lib/mock-inventory-data.ts** - Contains `mockStorePerformance` data and `TOPS_STORES` array
- **src/types/inventory.ts** - Contains `StorePerformance`, `TopsStore`, and `StorePerformanceResponse` type definitions

### New Files to Create

#### app/inventory/stores/page.tsx
New page component that displays inventory grouped by store with aggregated metrics for each Tops location.

#### app/inventory/stores/[storeName]/page.tsx (optional enhancement)
Optional drill-down page to view all inventory items for a specific store.

## Step by Step Tasks

### 1. Create Stock by Store Page Component
- Create new file: `app/inventory/stores/page.tsx`
- Implement client component with "use client" directive
- Import necessary dependencies (React, Next.js, UI components, types)
- Import `fetchStorePerformance` from `@/lib/inventory-service`
- Use DashboardShell layout wrapper for consistency

### 2. Implement Data Fetching Logic
- Add state management for store performance data loading
- Fetch store performance data using `fetchStorePerformance()` on component mount
- Implement loading state with skeleton UI
- Implement error handling with retry capability
- Add refresh functionality to reload store data

### 3. Design Store Cards Layout
- Create responsive grid layout (1 column mobile, 2 columns tablet, 3-4 columns desktop)
- Design store performance cards showing:
  - Store name (TopsStore)
  - Total products count
  - Low stock items count (with warning styling)
  - Critical stock items count (with danger styling)
  - Health score percentage (if available)
  - Total inventory value (formatted as Thai Baht)
- Add visual indicators (icons, badges, colors) for stock status
- Make cards clickable to navigate to store-specific inventory view

### 4. Add Sorting and Filtering Capabilities
- Implement sort options: by store name, by health score, by critical items count
- Add quick filter buttons: All stores, Stores with critical items, Stores with low stock
- Add search functionality to filter stores by name
- Persist sort/filter state in component state

### 5. Create Summary Statistics Section
- Add KPI cards at the top showing:
  - Total stores count
  - Total products across all stores
  - Total low stock items across all stores
  - Total critical stock items across all stores
- Use same card styling as main inventory page for consistency

### 6. Add Navigation from Main Inventory Page
- Open `app/inventory/page.tsx`
- Add "View by Store" or "Stock by Store" button in the header section
- Position button next to existing "Export" button
- Use `useRouter` to navigate to `/inventory/stores`
- Add `Store` icon from lucide-react for visual clarity

### 7. Implement Optional Store Drill-Down (Enhancement)
- If implementing drill-down, create `app/inventory/stores/[storeName]/page.tsx`
- Use dynamic route parameter to filter inventory by store
- Reuse existing inventory table components with store filter applied
- Add breadcrumb navigation: Inventory > Stock by Store > {StoreName}

### 8. Add Responsive Design and Mobile Optimization
- Ensure grid layout adapts to screen sizes
- Use Tailwind responsive classes (sm:, md:, lg:, xl:)
- Test touch interactions for mobile devices
- Ensure cards have minimum 44px touch targets
- Add pull-to-refresh capability (optional)

### 9. Style and Polish UI
- Match design system and color palette from existing inventory pages
- Use consistent card styling with CardHeader, CardContent components
- Add hover states and transitions to store cards
- Ensure proper spacing and alignment
- Add loading skeletons that match card layout
- Use Badge components for stock status indicators

### 10. Validate Implementation
- Test data loading from both Supabase and mock data sources
- Verify all 8 Tops stores are displayed correctly
- Test sorting and filtering functionality
- Verify navigation between pages works correctly
- Test responsive behavior on different screen sizes
- Check that stock counts accurately reflect inventory status
- Validate that clicking store cards navigates to filtered inventory view

## Validation Commands
Execute these commands to validate the chore is complete:

- `npm run dev` - Start development server and manually test the new page at http://localhost:3000/inventory/stores
- `npm run build` - Test to ensure the code compiles without TypeScript or linting errors
- Manual testing checklist:
  - Navigate to /inventory and verify "Stock by Store" button appears in header
  - Click button and verify navigation to /inventory/stores
  - Verify all 8 Tops stores display with correct metrics
  - Test sorting functionality (by name, health score, critical items)
  - Test filtering functionality (all, critical, low stock)
  - Click on a store card and verify navigation works
  - Test responsive layout on mobile, tablet, and desktop viewports
  - Verify data loads correctly from mock data source
  - Test refresh functionality
  - Check that back navigation returns to main inventory page

## Notes

### Design Considerations
- The page should follow the same design language as the main inventory page for consistency
- Store cards should be visually distinct and easy to scan quickly
- Critical and low stock counts should be prominently displayed with appropriate color coding
- Consider adding a mini chart or progress bar showing health score percentage

### Data Source
- Initially uses `fetchStorePerformance()` which returns mock data from `mockStorePerformance`
- When Supabase is configured, the service will aggregate real inventory data by store
- Store performance calculation will need to be implemented in the database layer in the future

### Future Enhancements
- Add trend indicators showing if stock levels are improving or declining
- Implement store comparison view to compare multiple stores side-by-side
- Add export functionality for store performance reports
- Integrate with executive dashboard to show critical store alerts
- Add ability to trigger restock orders directly from store cards

### Accessibility
- Ensure proper ARIA labels for interactive elements
- Maintain proper heading hierarchy (h1, h2, h3)
- Ensure sufficient color contrast for all text and badges
- Support keyboard navigation for all interactive elements

### Performance
- Store data should be cached appropriately to avoid excessive API calls
- Consider implementing pagination if store count grows beyond 8 locations
- Lazy load store drill-down data only when card is clicked
