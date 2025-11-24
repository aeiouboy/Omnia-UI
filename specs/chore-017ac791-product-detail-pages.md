# Chore: Add Product Images and Detail Pages to Inventory System

## Metadata
adw_id: `017ac791`
prompt: `Add product images and detail pages to inventory system:

1. Create product detail page at app/inventory/[id]/page.tsx
2. Add real product images to mock data (use placeholder.com or similar for now)
3. Make table rows clickable to navigate to /inventory/[productId]
4. Detail page should show:
   - Large product image
   - Product name, barcode, category
   - Current stock / minimum stock
   - Status badge (In Stock/Low Stock/Out of Stock)
   - Price
   - Stock history chart
   - Recent transactions
   - Reorder button
   - Edit button
   - Back to inventory button
5. Update inventory data types to include imageUrl field
6. Ensure proper routing and navigation
7. Add loading states for detail page
8. Mobile responsive design

Reference similar e-commerce product detail pages for layout inspiration.`

## Chore Description
Enhance the inventory management system by adding product detail pages with images, comprehensive product information, and stock analytics. This chore will transform the inventory system from a simple table view into a full-featured e-commerce-style product management system with clickable product cards, detailed product views, and visual stock tracking.

## Relevant Files
Use these files to complete the chore:

### Existing Files to Modify

- **src/types/inventory.ts** - Update InventoryItem interface to include imageUrl field
- **src/lib/mock-inventory-data.ts** - Add imageUrl to all mock products with realistic placeholder images
- **app/inventory/page.tsx** - Make table rows clickable and add navigation to detail pages
- **src/lib/inventory-service.ts** - Add new function to fetch single product by ID

### New Files to Create

#### h3 New Files

- **app/inventory/[id]/page.tsx** - Product detail page component with full product information
- **app/inventory/[id]/loading.tsx** - Loading skeleton for detail page
- **src/components/inventory-detail-view.tsx** - Reusable component for product detail view (similar to order-detail-view.tsx pattern)
- **src/components/stock-history-chart.tsx** - Chart component for stock level visualization
- **src/components/recent-transactions-table.tsx** - Table component for recent stock transactions
- **public/images/products/** - Directory for product images (if using local images later)

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update TypeScript Types
- Add `imageUrl` field to `InventoryItem` interface in `src/types/inventory.ts`
- Add `imageUrl` field to `InventoryItemDB` interface for database schema
- Create `StockTransaction` type for transaction history
- Create `StockHistoryPoint` type for chart data

### 2. Update Mock Data with Product Images
- Add `imageUrl` property to all 24+ products in `mockInventoryItems` array
- Use realistic placeholder URLs from placehold.co with category-specific images:
  - Produce: green-themed placeholders
  - Dairy: blue-themed placeholders
  - Bakery: brown/wheat-themed placeholders
  - Meat: red-themed placeholders
  - Seafood: blue/ocean-themed placeholders
  - Beverages: varied color placeholders
  - Snacks: yellow/orange-themed placeholders
  - Household: grey/clean-themed placeholders
- Use format: `https://placehold.co/400x400/[color]/[textcolor]/png?text=[product]`
- Create helper function `generateMockStockHistory()` for stock level history data
- Create helper function `generateMockTransactions()` for transaction history data

### 3. Update Inventory Service Layer
- Update `convertDBItemToInventoryItem()` to include imageUrl mapping
- Create new function `fetchInventoryItemById(id: string)` to get single product
- Create new function `fetchStockHistory(productId: string)` for chart data
- Create new function `fetchRecentTransactions(productId: string)` for transaction table
- Add error handling for product not found scenarios

### 4. Update Inventory List Page (Table View)
- Update table Image column to use `item.imageUrl` instead of placeholder SVG
- Make entire table row clickable using Next.js `useRouter` hook
- Add hover state styling to indicate clickable rows (`hover:bg-muted/50 cursor-pointer`)
- Wrap row content with `onClick` handler to navigate to `/inventory/${item.id}`
- Maintain accessibility with keyboard navigation support
- Add visual indicator (e.g., chevron icon) in last column to show detail view available

### 5. Create Stock History Chart Component
- Create `src/components/stock-history-chart.tsx` using Recharts library
- Display line chart with stock levels over last 30 days
- Show minimum stock level as horizontal reference line (red dashed line)
- Show reorder point as horizontal reference line (yellow dashed line)
- Include legend and tooltips for data points
- Make responsive for mobile devices
- Use same color scheme as existing dashboard charts
- Add loading skeleton state

### 6. Create Recent Transactions Table Component
- Create `src/components/recent-transactions-table.tsx` using shadcn Table components
- Display columns: Date, Type (In/Out), Quantity, Balance, User, Notes
- Show last 10 transactions by default
- Color-code transaction types: green for stock-in, red for stock-out
- Include pagination if more than 10 transactions
- Mobile-responsive with horizontal scroll for small screens
- Add empty state for products with no transactions

### 7. Create Product Detail View Component
- Create `src/components/inventory-detail-view.tsx` following pattern from `order-detail-view.tsx`
- Layout sections:
  - **Header**: Product name, barcode, back button
  - **Image Section**: Large product image (400x400px) with zoom capability
  - **Info Section**: Category, supplier, status badge
  - **Stock Section**: Current/min/max stock with progress bars
  - **Price Section**: Unit price, total value
  - **Chart Section**: Stock history chart component
  - **Transactions Section**: Recent transactions table
  - **Actions Section**: Reorder button, Edit button
- Use Card components for each section
- Implement mobile-first responsive grid layout
- Add proper TypeScript props interface

### 8. Create Detail Page Route
- Create `app/inventory/[id]/page.tsx` as Next.js dynamic route
- Extract product ID from route params
- Fetch product data using `fetchInventoryItemById()`
- Fetch stock history and transactions in parallel
- Handle loading state during data fetch
- Handle error state for product not found (404-style error)
- Return `InventoryDetailView` component with fetched data
- Add metadata for SEO (product name in page title)

### 9. Create Loading State for Detail Page
- Create `app/inventory/[id]/loading.tsx` with skeleton UI
- Match the structure of the detail view component
- Use shadcn Skeleton components for shimmer effect
- Create skeletons for:
  - Product image (400x400px rectangle)
  - Product name and info (text lines)
  - Stock chart (rectangular skeleton)
  - Transactions table (table row skeletons)
  - Action buttons
- Ensure mobile-responsive skeleton layout

### 10. Add Navigation and Routing
- Verify Next.js App Router properly handles dynamic route `/inventory/[id]`
- Test navigation from inventory list to detail page
- Test back button navigation from detail to list
- Ensure URL parameters are preserved during navigation
- Add browser back button support
- Test deep linking (direct URL access to product detail)

### 11. Implement Mobile Responsive Design
- Test detail page on mobile breakpoints (320px, 375px, 428px)
- Ensure image scales appropriately on small screens
- Stack sections vertically on mobile
- Make chart touch-friendly with proper tap targets
- Ensure table scrolls horizontally on small screens
- Test action buttons are accessible (min 44px height)
- Verify all text is readable at mobile sizes

### 12. Add Placeholder SVG Image Fallback
- Update existing `/public/images/placeholder-product.svg` if needed
- Add image error handling with fallback to SVG placeholder
- Use Next.js Image component with `onError` handler
- Ensure placeholder shows when imageUrl is unavailable

### 13. Testing and Validation
- Test navigation from inventory list to product detail
- Verify all product data displays correctly
- Test loading states appear during data fetch
- Test error handling for invalid product IDs
- Verify charts render with correct data
- Test transactions table with mock data
- Verify mobile responsive layout on various screen sizes
- Test back button navigation
- Verify image loading and fallback behavior
- Test action buttons (Reorder, Edit) trigger proper handlers (can be TODO placeholders)

## Validation Commands
Execute these commands to validate the chore is complete:

- `ls -la app/inventory/[id]/` - Verify dynamic route folder and files exist (page.tsx, loading.tsx)
- `ls -la src/components/inventory-detail-view.tsx` - Verify detail view component exists
- `ls -la src/components/stock-history-chart.tsx` - Verify chart component exists
- `ls -la src/components/recent-transactions-table.tsx` - Verify transactions component exists
- `grep -n "imageUrl" src/types/inventory.ts` - Verify imageUrl field added to types
- `grep -n "imageUrl" src/lib/mock-inventory-data.ts` - Verify all products have imageUrl
- `grep -n "fetchInventoryItemById" src/lib/inventory-service.ts` - Verify service function exists
- `pnpm run build` - Ensure no TypeScript errors or build failures
- `pnpm run dev` - Start dev server and manually test navigation

## Notes

### Design Inspiration
Reference e-commerce product detail pages from:
- Amazon product pages (information hierarchy)
- Shopify admin product pages (inventory management feel)
- Existing `order-detail-view.tsx` component for layout patterns

### Image Strategy
- Start with placehold.co placeholder images with category-specific colors
- Use consistent 400x400px square images for uniformity
- Later can be replaced with real product images or Unsplash API images
- Ensure all images use Next.js Image component for optimization

### Chart Library
- Use Recharts (already in project dependencies)
- Follow existing chart patterns from `executive-dashboard.tsx`
- Match color scheme with dashboard for consistency

### Future Enhancements (Out of Scope)
- Actual edit functionality (form to update product details)
- Actual reorder functionality (create purchase order)
- Image upload capability
- Real transaction recording from order fulfillment
- Export product details to PDF
- Print label functionality
- Barcode scanning integration

### Mobile Considerations
- Minimum touch target: 44px height
- Use mobile-first breakpoints: sm (640px), md (768px), lg (1024px)
- Stack layout vertically on mobile
- Horizontal scroll for tables on small screens
- Collapsible sections to reduce vertical scroll on mobile
