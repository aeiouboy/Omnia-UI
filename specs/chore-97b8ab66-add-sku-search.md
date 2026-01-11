# Chore: Add SKU Search Functionality

## Metadata
adw_id: `97b8ab66`
prompt: `Add SKU search functionality to find orders containing items with matching SKU. Users need to search for orders by item SKU. When a user enters a SKU in the search box, the system should return all orders that contain at least one item with a matching SKU.`

## Chore Description
This chore adds SKU search capability to the Order Management Hub. Currently, the search box only searches by order number, customer name, email, and phone. After this change, users can also search for orders by item SKU (e.g., 'PANTRY-001', 'FROZEN-001', 'MEAT-002'). The search will be case-insensitive and support partial matches, returning all orders that contain at least one item with a matching SKU.

## Relevant Files
Use these files to complete the chore:

- **src/components/order-management-hub.tsx** - Main component containing the search filtering logic. The `filteredOrders` filter function (lines 912-1066) needs to be updated to also search within order items by SKU. The search placeholder (line 1319) also needs updating.

- **src/lib/mock-data.ts** - Contains the `getMockOrders` function (lines 697-748) which filters mock data. The search filter (lines 717-724) needs to be extended to also match against item SKUs.

- **app/api/orders/external/route.ts** - External API proxy that passes search parameters. Currently passes `search` param to external API (line 169). This is a passthrough and may not need changes if the external API supports SKU search, but we document it for awareness.

- **app/api/orders/route.ts** - Internal orders API. The Supabase query search (lines 278-281) may need updating if server-side SKU search is needed. However, primary filtering happens client-side.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Frontend Search Filtering Logic
- Edit `src/components/order-management-hub.tsx`
- Locate the `filteredOrders` filter function around line 912
- In the search term matching block (lines 914-925), add SKU matching logic:
  ```typescript
  // Add SKU search to existing conditions
  const matchesSku = order.items?.some(item =>
    item.product_sku?.toLowerCase().includes(searchLower)
  )
  ```
- Update the `matchesSearch` condition to include `matchesSku`

### 2. Update Search Placeholder Text
- In `src/components/order-management-hub.tsx`, locate the Input placeholder around line 1318
- Change placeholder from `"Search by order #, customer name, email, phone..."` to `"Search by order #, customer, SKU..."`
- Keep the text concise while indicating SKU search is supported

### 3. Update Mock Data Search Filter
- Edit `src/lib/mock-data.ts`
- Locate the `getMockOrders` function around line 697
- In the search filter block (lines 717-724), add SKU matching:
  ```typescript
  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    filtered = filtered.filter(order =>
      order.order_no.toLowerCase().includes(searchLower) ||
      order.customer.name.toLowerCase().includes(searchLower) ||
      order.customer.email.toLowerCase().includes(searchLower) ||
      order.items?.some(item =>
        item.product_sku?.toLowerCase().includes(searchLower)
      )
    )
  }
  ```

### 4. Validate the Implementation
- Run `pnpm dev` to start the development server
- Navigate to the Order Management Hub
- Test searching with a SKU like 'SKU-' or a specific product SKU
- Verify orders containing matching SKUs appear in results
- Verify existing search functionality (order #, customer name, email, phone) still works

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm lint` - Ensure no linting errors are introduced
- `pnpm build` - Ensure the build succeeds without errors
- `pnpm dev` - Start dev server and manually test:
  1. Search for 'SKU-' and verify orders with matching item SKUs appear
  2. Search for an order number and verify it still works
  3. Search for a customer name and verify it still works
  4. Check the placeholder text includes 'SKU'

## Notes
- The `items` array in orders uses `product_sku` as the SKU field (see `ApiOrderItem` interface at line 85 in order-management-hub.tsx)
- Mock data generates SKUs in format like 'SKU-XXXXXX' (6 digits) - see mock-data.ts line 1874
- The external API (app/api/orders/external/route.ts) already passes the `search` parameter to the partner API. If the partner API supports SKU search server-side, this would work automatically. However, client-side filtering is the primary mechanism for this feature.
- Both frontend and mock data need updating for consistent behavior across data sources
