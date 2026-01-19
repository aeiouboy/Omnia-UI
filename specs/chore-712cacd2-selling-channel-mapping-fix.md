# Chore: Fix Selling Channel Mapping for External API Orders

## Metadata
adw_id: `712cacd2`
prompt: `Fix selling channel mapping for orders fetched from external API: Root Cause: Orders are fetched from external API which returns old channel values (GrabMart, LINE MAN, FoodDelivery, etc.). We need to map these to the new standard (web, lazada, shopee).`

## Chore Description
The external API returns orders with legacy channel values (GrabMart, LINE MAN, FoodDelivery, Tops Online, ShopeeFood, etc.) that don't match the new standardized channel structure (web, lazada, shopee). This chore creates a comprehensive mapping solution that:
1. Normalizes all legacy channel values to the new three-channel standard
2. Applies mapping at the API response processing layer for consistency
3. Updates the channel badge component to handle legacy values gracefully
4. Ensures filter dropdown reflects only the new channel structure

## Relevant Files

### Files to Modify
- **src/lib/channel-utils.ts** (NEW FILE) - Centralized channel mapping utilities
- **app/api/orders/external/route.ts** - Apply channel mapping to API responses
- **src/components/order-badges.tsx** - Add legacy channel fallback handling
- **src/components/advanced-filter-panel.tsx** - Update filter options (already correct)

### Files to Review
- **src/lib/mock-data.ts** - Ensure mock data uses new channel values (already correct)

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Create Channel Mapping Utility
- Create new file: `src/lib/channel-utils.ts`
- Implement `mapLegacyChannel()` function that maps:
  - **web channels**: GrabMart, LINE MAN, FoodDelivery, Tops Online, ShopeeFood, GOKOO, GRAB, LINEMAN → "web"
  - **lazada channels**: Lazada, LAZADA, lazada-something → "lazada"
  - **shopee channels**: Shopee, SHOPEE, shopee-something → "shopee"
- Implement `normalizeChannel()` function for case-insensitive channel normalization
- Add comprehensive JSDoc comments for the mapping logic
- Export both functions for use across the codebase

### 2. Apply Channel Mapping in API Response Processing
- In `app/api/orders/external/route.ts`:
  - Import `mapLegacyChannel()` from channel-utils
  - After fetching data from external API (line 287), map each order's channel value
  - Apply mapping to both `order.channel` and `order.sellingChannel` fields
  - Ensure mock data fallback paths also apply channel mapping
- Test that orders from external API display correct normalized channels

### 3. Update Channel Badge Component for Legacy Fallback
- In `src/components/order-badges.tsx`:
  - Import `mapLegacyChannel()` from channel-utils
  - Update `ChannelBadge` component to normalize incoming channel value
  - Keep existing `channelTheme` configuration for web/lazada/shopee
  - Add fallback handling: if normalized channel not in theme, use gray default
  - Ensure badge displays the NEW channel name (web/lazada/shopee), not legacy name
- Verify badges show correct colors for all three channels

### 4. Validate Filter Dropdown Configuration
- In `src/components/advanced-filter-panel.tsx`:
  - Confirm channel filter options are already: web, lazada, shopee (lines 343-345)
  - Verify default value is "all-channels" (line 56)
  - Ensure filter applies correctly with normalized channel values
- No changes needed if already configured correctly

### 5. Update Order Management Hub Channel Filtering
- In `src/components/order-management-hub.tsx`:
  - Import `mapLegacyChannel()` from channel-utils
  - Apply channel mapping when processing filter values
  - Ensure channel comparison uses normalized values
  - Verify channel quick filters work with legacy data

### 6. Validate Mock Data Consistency
- In `src/lib/mock-data.ts`:
  - Confirm mock orders already use new channel values: web, lazada, shopee (line 195)
  - Verify scenario test order uses "web" (line 2570, 2641)
  - Ensure all mock data adheres to new three-channel standard
- No changes needed if already using new channels

## Validation Commands
Execute these commands to validate the chore is complete:

```bash
# Verify TypeScript compilation
pnpm build

# Check for TypeScript errors
pnpm lint

# Start dev server to test manually
pnpm dev
```

Manual validation steps:
1. Load orders from external API - verify channels display as web/lazada/shopee
2. Check channel badges show correct colors (indigo for web, blue for lazada, orange for shopee)
3. Test channel filter - verify only web/lazada/shopee options appear
4. Test filtering by each channel - verify correct results display
5. Check mock data fallback - verify channels still normalize correctly

## Notes
**Channel Mapping Strategy**:
- Legacy channels from API (GrabMart, LINE MAN, FoodDelivery, etc.) are all delivery platforms that fall under "web" channel
- Only marketplace platforms (Lazada, Shopee) get their own dedicated channels
- This mapping preserves data while standardizing the UI/UX

**Implementation Priority**:
1. Foundation: Create mapping utility first (single source of truth)
2. API Layer: Apply mapping at data ingestion point
3. Components: Update display components to use normalized values
4. Validation: Ensure filters and badges work consistently

**Backward Compatibility**:
- Channel mapping is lossless - all legacy values map to new standard
- No data loss occurs during normalization
- UI always shows new channel names regardless of API source

**Testing Considerations**:
- Test with both external API and mock data
- Verify all legacy channel values (GrabMart, LINE MAN, FoodDelivery, Tops Online, ShopeeFood, GOKOO) map to "web"
- Verify Lazada variants map to "lazada"
- Verify Shopee variants map to "shopee"
