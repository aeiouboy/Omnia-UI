# Chore: Fix Inventory Page to Use Mock/Database Data

## Metadata
adw_id: `c4e71a20`
prompt: `Fix the inventory page at /inventory to work with mockup data or database data instead of real external API. Ensure the page displays properly with sample inventory data. Check if the page exists, if not create it. Make sure it follows the same design patterns as other pages in the app (Executive Dashboard, Order Management, Escalations).`

## Chore Description
The inventory page at `/app/inventory/page.tsx` currently exists and uses hardcoded mock data directly in the component. This chore involves refactoring the inventory page to:

1. Use a proper data service layer (similar to dashboard-service) that supports both mock data and database data
2. Ensure the page follows consistent design patterns with Executive Dashboard, Order Management Hub, and Escalations pages
3. Maintain the existing UI/UX but improve data architecture
4. Support future integration with Supabase database (dual data strategy)
5. Add proper loading states, error handling, and responsive design

The current page already exists with:
- Mock inventory data for Tops stores (5 sample products)
- Store performance metrics (4 Tops stores)
- Three tabs: Products, Store Performance, and Stock Alerts
- Proper UI components using shadcn/ui

## Relevant Files

### Existing Files to Modify
- **`/app/inventory/page.tsx`** - Main inventory page component (currently contains hardcoded mock data)
  - Needs refactoring to use data service layer
  - Should follow client component pattern from other pages
  - Currently has mock data inline, needs separation of concerns

- **`/src/lib/mock-data.ts`** - Existing mock data service for development
  - Add inventory-specific mock data structures
  - Provides fallback when external APIs unavailable
  - Already used by dashboard components

- **`/src/lib/supabase.ts`** - Supabase client configuration
  - Already has mock client fallback for missing credentials
  - Provides dual data strategy support
  - Should be used for database integration

### Files to Reference for Design Patterns
- **`/src/components/executive-dashboard.tsx`** - Reference for dashboard layout patterns
  - KPI cards arrangement
  - Tab navigation structure
  - Data fetching patterns

- **`/src/components/order-management-hub.tsx`** - Reference for table/list patterns
  - Pagination implementation
  - Filter and search functionality
  - Responsive table design

- **`/src/components/escalation-management.tsx`** - Reference for data service integration
  - Uses `fetchEscalationHistory()` from service layer
  - Loading states and error handling
  - Status filtering and search

- **`/src/components/ui/*.tsx`** - UI component library
  - Card, Badge, Button, Tabs, Progress components
  - Already used correctly in current inventory page
  - Consistent styling with other pages

### New Files to Create

#### `/src/lib/inventory-service.ts`
- Service layer for inventory data operations
- Functions: `fetchInventoryData()`, `fetchStorePerformance()`, `fetchStockAlerts()`
- Support both database and mock data sources
- Implement retry logic and error handling
- Follow same pattern as escalation-service.ts

#### `/src/types/inventory.ts`
- TypeScript type definitions for inventory domain
- Types: `InventoryItem`, `StorePerformance`, `StockAlert`, `InventoryFilters`
- Ensure type safety across components
- Document API response structures

#### `/src/lib/mock-inventory-data.ts` (optional)
- Move mock data from page component to dedicated file
- Separate concerns: data vs. presentation
- Easier to maintain and expand mock data
- Can be imported by inventory-service.ts

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Create TypeScript Type Definitions
- Create `/src/types/inventory.ts` with proper type definitions
- Define `InventoryItem` interface (id, productId, productName, category, store, stock levels, pricing, status)
- Define `StorePerformance` interface (storeName, metrics, health score)
- Define `StockAlert` interface for low/critical stock notifications
- Define `InventoryFilters` for filtering/search parameters
- Export all types for use in service and components

### 2. Create Inventory Service Layer
- Create `/src/lib/inventory-service.ts` following escalation-service.ts pattern
- Implement `fetchInventoryData(filters?: InventoryFilters)` function
  - Check for database connection first (Supabase)
  - Fall back to mock data if unavailable
  - Return properly typed data with error handling
- Implement `fetchStorePerformance()` function for store metrics
- Implement `fetchStockAlerts(severity?: string)` for critical/low stock items
- Add retry logic with exponential backoff for database calls
- Include proper TypeScript typing for all functions

### 3. Move Mock Data to Service Layer
- Extract hardcoded mock data from `/app/inventory/page.tsx`
- Move to `/src/lib/mock-inventory-data.ts` or directly into inventory-service.ts
- Expand mock data to include more realistic scenarios:
  - At least 20 inventory items across different categories
  - All 8 Tops stores from CLAUDE.md requirements
  - Various stock statuses (healthy, low, critical)
  - Realistic pricing and demand forecasts
- Ensure mock data matches type definitions

### 4. Refactor Inventory Page Component
- Update `/app/inventory/page.tsx` to use inventory-service
- Add proper "use client" directive
- Implement loading states using skeleton components
- Add error handling with user-friendly messages
- Remove inline mock data, use service layer instead
- Maintain existing UI structure (KPI cards, tabs, tables)
- Add data refresh capability (manual or auto-refresh)
- Follow responsive design patterns from other pages

### 5. Enhance UI Components and Interactivity
- Add filter functionality (by category, store, status)
- Implement search capability across product names
- Add pagination for large inventory lists (follow order-management-hub pattern)
- Ensure mobile-responsive design (grid layouts, touch targets)
- Add loading skeletons for better UX during data fetch
- Implement proper error boundaries

### 6. Add Database Integration Support
- Define Supabase table schema for inventory data (document in comments)
- Add database query functions in inventory-service.ts (prepared for future)
- Ensure seamless fallback between database and mock data
- Test with Supabase credentials missing (should use mock)
- Test with Supabase credentials present (should use database)
- Follow dual data strategy from CLAUDE.md

### 7. Ensure Design Consistency
- Verify color scheme matches executive dashboard and order management
- Use same card layouts and spacing as other pages
- Ensure badge colors for status are consistent with order statuses
- Match typography and heading styles across pages
- Verify icon usage is consistent (lucide-react icons)
- Test mobile layout matches other pages (breakpoints: sm, md, lg, xl)

### 8. Add Navigation Integration
- Verify page is accessible from main navigation
- Update sidebar navigation if needed (check `/src/components/side-nav.tsx`)
- Add breadcrumb navigation if applicable
- Ensure page title and metadata are set correctly
- Add "Inventory" link to main navigation menu

### 9. Performance Optimization
- Implement data caching for inventory data (consider React Query or SWR)
- Add memoization for expensive computations (stock percentage calculations)
- Lazy load tabs content where appropriate
- Optimize re-renders with proper React hooks (useMemo, useCallback)
- Follow performance patterns from executive dashboard

### 10. Validate and Test
- Run `pnpm dev` to verify page loads without errors
- Test all three tabs (Products, Store Performance, Stock Alerts)
- Verify mock data displays correctly in all components
- Test responsive design on different screen sizes
- Check console for any TypeScript or runtime errors
- Verify navigation works from other pages
- Test loading states by simulating slow network
- Test error states by breaking service temporarily
- Ensure accessibility standards (keyboard navigation, ARIA labels)

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm dev` - Start development server and verify no build errors
- Navigate to `http://localhost:3000/inventory` - Verify page loads
- Test all tabs functionality - Products, Store Performance, Stock Alerts should render
- `pnpm build` - Verify production build succeeds without errors
- Check browser console for errors - Should have zero console errors
- Test responsive design - Resize browser to mobile/tablet/desktop sizes
- Verify navigation - Click to inventory page from main nav
- Check TypeScript types - `pnpm type-check` (if available) or verify in IDE
- Test with Supabase credentials missing - Should use mock data gracefully
- Verify component structure - Should follow design patterns from other dashboard pages

## Notes

### Design Pattern Consistency
The inventory page should follow these established patterns from the codebase:
- **Data Fetching**: Use service layer (inventory-service.ts) similar to escalation-service.ts
- **Error Handling**: Graceful fallback to mock data when database unavailable (like supabase.ts mock client)
- **Loading States**: Use skeleton components during data fetch (like executive dashboard)
- **Pagination**: Follow order-management-hub pattern with configurable page sizes
- **Responsive Design**: Mobile-first with breakpoints (sm:, md:, lg:, xl:)
- **Component Structure**: KPI cards + Tabs + Tables/Lists (like executive dashboard)

### Tops Stores Requirement
Per CLAUDE.md, the inventory page should feature these Tops stores:
- Tops Central Plaza ลาดพร้าว
- Tops Central World
- Tops สุขุมวิท 39
- Tops ทองหล่อ
- Tops สีลม คอมเพล็กซ์
- Tops เอกมัย
- Tops พร้อมพงษ์
- Tops จตุจักร

### Future Database Schema (for reference)
When implementing Supabase integration, consider this table structure:
```sql
CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id VARCHAR(50) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  store_name VARCHAR(255),
  current_stock INTEGER,
  min_stock_level INTEGER,
  max_stock_level INTEGER,
  unit_price DECIMAL(10,2),
  last_restocked TIMESTAMP,
  status VARCHAR(50),
  supplier VARCHAR(255),
  reorder_point INTEGER,
  demand_forecast INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Development vs. Production
- Development: Always use mock data for rapid prototyping
- Production: Check for Supabase credentials and use database if available
- Both modes should provide identical UI/UX experience
