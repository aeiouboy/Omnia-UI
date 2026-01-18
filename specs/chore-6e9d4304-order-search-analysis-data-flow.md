# Chore: Analyze Order Search to Order Analysis Data Flow

## Status: ✅ COMPLETED

## Metadata
adw_id: `6e9d4304`
prompt: `Analyze the data flow between Order Search (order-management-hub.tsx) and Order Analysis page to investigate how to connect real order data for analysis.`

## Chore Description
Research and document the data flow architecture between the Order Search page (Order Management Hub) and the Order Analysis page. Currently, these two pages use different API endpoints and may have different data sources. This analysis will identify the gaps and propose an implementation approach to enable Order Analysis to consume real order data from the same source as Order Search.

## Relevant Files
Use these files to complete the chore:

### Data Sources & API Routes
- **`app/api/orders/external/route.ts`** - Primary API endpoint for Order Management Hub. Fetches from external merchant orders API with mock fallback. Returns full `ApiOrder` objects with detailed fields including items, customer, payment info, SLA, and metadata.
- **`app/api/orders/summary/route.ts`** - Lightweight API endpoint for Order Analysis. Uses same external API but transforms to `OrderSummary` format. Key difference: applies synthetic mock data in development mode with random channel/date distribution.

### Hooks & Data Aggregation
- **`src/hooks/use-order-analysis.ts`** - Custom hook that fetches from `/api/orders/summary` and aggregates orders by date and channel (TOL/MKP). Contains `aggregateOrdersByDateAndChannel()` function for transforming order data into chart-ready format.

### Components
- **`src/components/order-management-hub.tsx`** - Order Search UI component. Fetches orders via `/api/orders/external` endpoint with pagination, filtering, and detailed order view.
- **`src/components/order-analysis-view.tsx`** - Order Analysis UI component. Uses `useOrderAnalysis` hook and displays stacked bar charts for order count and revenue by channel.

### Type Definitions
- **`src/types/order-analysis.ts`** - Defines `OrderSummary`, `ChannelDailySummary`, `RevenueDailySummary`, and `OrderAnalysisData` interfaces.

### Supporting Files
- **`src/lib/mock-data.ts`** - Mock data generation including `getMockOrders()` function used by `/api/orders/external`.
- **`src/lib/channel-utils.ts`** - Channel normalization utilities (`mapLegacyChannel()`).

## Analysis Findings

### 1. Order Management Hub Data Flow
**Endpoint**: `/api/orders/external`
**Source**: External API `https://dev-pmpapis.central.co.th/pmp/v2/grabmart/v1/merchant/orders`

**Data Structure** (ApiOrder):
```typescript
{
  id: string
  order_no: string
  customer: ApiCustomer
  order_date: string
  channel: string              // 'web', 'lazada', 'shopee' (from mock/API)
  business_unit: string
  order_type: string
  total_amount: number
  shipping_address: ApiShippingAddress
  payment_info: ApiPaymentInfo
  sla_info: ApiSLAInfo
  metadata: ApiMetadata
  items: ApiOrderItem[]
  status: string
  on_hold?: boolean
  deliveryType?: FMSDeliveryType  // 'Standard Delivery', 'Express Delivery', 'Click & Collect'
  // ... additional FMS and MAO fields
}
```

**Query Parameters Supported**:
- `page`, `pageSize`, `status`, `channel`, `businessUnit`, `search`
- `dateFrom`, `dateTo` (YYYY-MM-DD format)
- Advanced filters: `orderNumber`, `customerName`, `phoneNumber`, `email`, etc.

**Mock Data Behavior**:
- Uses `getMockOrders()` from `src/lib/mock-data.ts`
- Generates 150 orders with varied channels and dates
- Applies `mapLegacyChannel()` for channel normalization

### 2. Order Analysis Data Flow
**Endpoint**: `/api/orders/summary`
**Source**: Same external API but with different transformation

**Data Structure** (OrderSummary - lightweight):
```typescript
{
  id: string
  order_no: string
  status: string
  channel: string
  total_amount: number
  order_date: string
  sla_info: { target_minutes, elapsed_minutes, status }
  delivery_type?: string  // 'standard', 'express', 'click_collect'
}
```

**Key Difference**:
The `/api/orders/summary` route applies its OWN mock data generation in development:
```typescript
// Line 257-269: Generates synthetic mock data
orders = Array.from({ length: 150 }).map((_, i) => ({
  channel: sellingChannels[index % sellingChannels.length],  // ['Web', 'Grab', 'Lineman', 'Gokoo', 'Shopee', 'Lazada']
  order_date: mockDate.toISOString()  // Uses dailyDistribution pattern
}))
```

This creates **different mock data** than `/api/orders/external`, causing data inconsistency.

### 3. Data Transformation in use-order-analysis.ts

The hook fetches from `/api/orders/summary` and aggregates:

**Channel Normalization** (lines 25-44):
```typescript
function normalizeChannelName(channel: string): ChannelName {
  // 'shopee', 'lazada' → 'MKP'
  // 'web', 'grab', 'line', 'man', 'food', 'tops', 'gokoo' → 'TOL'
}
```

**Aggregation** (lines 78-178):
- Groups orders by date and channel
- Calculates daily order counts and revenue for TOL and MKP
- Produces granular breakdowns: `TOL_Standard`, `TOL_Express`, `TOL_CC`, `MKP_Shopee`, `MKP_Lazada`

### 4. Field Compatibility Analysis

| Field | ApiOrder (External) | OrderSummary (Summary) | Compatibility |
|-------|---------------------|------------------------|---------------|
| `id` | ✅ | ✅ | Same |
| `order_no` | ✅ | ✅ | Same |
| `status` | ✅ | ✅ | Same |
| `channel` | ✅ (normalized) | ✅ | Same |
| `total_amount` | ✅ | ✅ | Same |
| `order_date` | ✅ | ✅ | Same |
| `delivery_type` | `FMSDeliveryType` | `string` | Need mapping |
| `items` | ✅ Full array | ❌ Not included | Not needed for analysis |

### 5. Identified Gaps

1. **Separate Mock Data Generation**: `/api/orders/summary` generates its own mock data (150 orders with random distribution) instead of using the same mock data as `/api/orders/external`.

2. **Channel Value Mismatch**:
   - External API mock uses: `['web', 'lazada', 'shopee']`
   - Summary API mock uses: `['Web', 'Grab', 'Lineman', 'Gokoo', 'Shopee', 'Lazada']`

3. **Date Distribution Mismatch**: Summary API applies `dailyDistribution` pattern that doesn't match external API's 7-day random distribution.

4. **No Shared Data Layer**: Both endpoints independently fetch and transform data without sharing the underlying order source.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Unify Mock Data Sources
- Modify `/api/orders/summary/route.ts` to use `getMockOrders()` from `src/lib/mock-data.ts` instead of generating its own mock data
- Import `getMockOrders` from `@/lib/mock-data`
- Replace the inline mock data generation (lines 257-269) with a call to `getMockOrders()`
- Ensure consistent channel values between both endpoints

### 2. Align Channel Normalization
- Ensure `/api/orders/summary` applies `mapLegacyChannel()` from `@/lib/channel-utils` (like external route does)
- Update `normalizeChannelName()` in `use-order-analysis.ts` to handle all channel values returned by both endpoints
- Map channel values: `'web'→'TOL'`, `'lazada'→'MKP'`, `'shopee'→'MKP'`

### 3. Transform Full Orders to Summary Format
- Create a shared transformation function `transformOrderToSummary(order: ApiOrder): OrderSummary`
- Place this in a shared utility file (e.g., `src/lib/order-transform.ts`)
- Ensure delivery_type mapping from `FMSDeliveryType` to lowercase values

### 4. Update Summary API Route
- Refactor `transformToSummary()` in `/api/orders/summary/route.ts` to use the shared transformation
- When falling back to mock data, use `getMockOrders()` and apply the shared transformation
- Remove duplicate mock data generation logic

### 5. Add Integration Option for Analysis Hook
- Add an optional `useExternalApi` parameter to `useOrderAnalysis` hook
- When enabled, fetch from `/api/orders/external` and transform to summary format client-side
- This allows future flexibility to choose data source

### 6. Validate Data Consistency
- Run both pages side-by-side and verify order counts match
- Ensure channel distribution in charts reflects actual order data
- Verify date range filtering produces consistent results

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure no TypeScript errors after changes
- `pnpm dev` - Start development server
- Navigate to `/order-search` and `/orders/analysis` - Compare order counts for same date range
- Check browser console for API responses - Verify both endpoints return consistent channel values
- Export CSV from Order Analysis - Verify data matches Order Search totals

## Implementation Approaches

### Option A: Modify Order Analysis to Use External API (Recommended)
**Pros**: Single source of truth, consistent data, minimal backend changes
**Cons**: Slightly larger payload (includes items, customer details not needed for charts)

**Changes Required**:
1. Create `src/lib/order-transform.ts` with `transformOrdersToSummary()` function
2. Update `use-order-analysis.ts` to fetch from `/api/orders/external`
3. Apply transformation on client-side before aggregation
4. Remove or deprecate `/api/orders/summary` endpoint

### Option B: Unify Mock Data in Summary API
**Pros**: Smaller changes, keeps lightweight summary endpoint
**Cons**: Two endpoints to maintain, potential future drift

**Changes Required**:
1. Import `getMockOrders` in `/api/orders/summary/route.ts`
2. Transform mock orders to summary format
3. Apply consistent channel normalization

### Option C: Create Shared Data Layer Service
**Pros**: Clean architecture, single data fetching layer
**Cons**: Larger refactoring effort, may be over-engineering

**Changes Required**:
1. Create `src/services/orders-service.ts`
2. Centralize all order fetching logic
3. Provide methods: `getFullOrders()`, `getOrderSummaries()`, `getOrderAnalysis()`
4. Update both components to use the service

## Notes

- The current implementation works but has data inconsistency between Order Search and Order Analysis in development mode due to separate mock data generation.
- In production (when external API is available), both endpoints fetch from the same source, so the inconsistency is less apparent.
- The recommended approach (Option A) provides the cleanest solution by eliminating the duplicate summary endpoint.
- Consider adding a `mockData: boolean` flag in API responses to help debugging data source issues.
- The `delivery_type` field mapping is important for the granular breakdown (TOL_Standard, TOL_Express, TOL_CC) to work correctly.

---

## Implementation Summary (Completed 2026-01-16)

**Approach Used**: Option B - Unify Mock Data in Summary API (with shared transformation utilities)

### Changes Made:

1. **Created `src/lib/order-transform.ts`** - Shared transformation utilities:
   - `transformOrderToSummary()` - Converts full order to OrderSummary format
   - `transformOrdersToSummary()` - Batch conversion for arrays
   - `normalizeDeliveryType()` - Maps FMS delivery types to lowercase values
   - `mapChannelToAnalysis()` - Maps standard channels to TOL/MKP

2. **Updated `/api/orders/summary/route.ts`**:
   - Now imports `getMockOrders` from `@/lib/mock-data`
   - Uses `transformOrdersToSummary()` for consistent transformation
   - Passes date filters to mock data generation for consistent filtering
   - Removed duplicate inline mock data generation

3. **Updated `src/hooks/use-order-analysis.ts`**:
   - Now imports `mapLegacyChannel` from `@/lib/channel-utils`
   - `normalizeChannelName()` uses shared channel normalization
   - Ensures consistent TOL/MKP mapping with other components

### Data Flow After Changes:

```
Order Search                      Order Analysis
     │                                  │
     ▼                                  ▼
/api/orders/external          /api/orders/summary
     │                                  │
     └────── getMockOrders() ◄──────────┘
                   │
                   ▼
        transformOrdersToSummary()
        (shared transformation)
                   │
                   ▼
          mapLegacyChannel()
          (consistent channels)
```

### Validation:
- `pnpm build` - ✅ Passed with no TypeScript errors
- Both endpoints now use the same mock data source
- Channel normalization is consistent across all components
