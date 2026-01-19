# Chore: Update selling channel values in orders mock data

## Metadata
adw_id: `f6c56d0f`
prompt: `Update selling channel values in orders mock data: Change 1: Update available selling channels; Change 2: Update ORD-SCENARIO-001 selling channel; Change 3: Verify order badges and display`

## Chore Description
Update the selling channel values in the orders mock data system to align with the new simplified channel structure. The current channels array contains legacy values (GrabMart, LINE MAN, FoodDelivery, Tops Online, ShopeeFood) and needs to be updated to the new standard (web, lazada, shopee). Additionally, the scenario test order ORD-SCENARIO-001 currently uses "Tops Online" as its selling channel and should be updated to "web". Finally, the channel badge component and filter dropdowns need to be verified/updated to properly display the new channel values.

## Relevant Files

### Files to Modify

- **src/lib/mock-data.ts** (line ~195)
  - Contains the `channels` array used for random order generation
  - Current values: `["GrabMart", "LINE MAN", "FoodDelivery", "Tops Online", "ShopeeFood"]`
  - Needs update to: `["web", "lazada", "shopee"]`

- **src/lib/mock-data.ts** (line ~2570, ~2641)
  - Contains `scenarioOrder` object with ORD-SCENARIO-001 test order
  - Current `channel`: "Tops Online" (line ~2570)
  - Current `sellingChannel`: "Tops Online" (line ~2641)
  - Both need update to: "web"

### Files to Verify/Update

- **src/components/order-badges.tsx** (lines ~6-47)
  - Contains `channelTheme` object with channel color mappings
  - Current mappings: GRAB, LAZADA, SHOPEE, TIKTOK, SHOPIFY, INSTORE, FOODPANDA, LINEMAN
  - Need to add mappings for: WEB, or update to use lowercase channel names
  - Uses `ChannelBadge` component (lines 49-72) that normalizes channel to uppercase

- **src/components/order-management-hub.tsx**
  - Verify channel filter options show the new channel values
  - Check if any hardcoded channel references exist

- **src/components/advanced-filter-panel.tsx** (lines ~337-350)
  - Contains selling channel dropdown filter
  - Current options: grab, lazada, shopee, tiktok, shopify, instore
  - Should be updated to: web, lazada, shopee (or all-channels default)

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update the channels array in mock-data.ts
- Navigate to `src/lib/mock-data.ts` around line 195
- Find the `channels` array declaration
- Replace current values `["GrabMart", "LINE MAN", "FoodDelivery", "Tops Online", "ShopeeFood"]`
- With new values: `["web", "lazada", "shopee"]`

### 2. Update ORD-SCENARIO-001 channel field
- Navigate to `src/lib/mock-data.ts` around line 2570
- Find `scenarioOrder` object
- Update `channel: "Tops Online"` to `channel: "web"`

### 3. Update ORD-SCENARIO-001 sellingChannel field
- Navigate to `src/lib/mock-data.ts` around line 2641
- Find `sellingChannel: "Tops Online"` in scenarioOrder
- Update to `sellingChannel: "web"`

### 4. Update ChannelBadge component in order-badges.tsx
- Navigate to `src/components/order-badges.tsx` lines 6-47
- Add "WEB" mapping to `channelTheme` object:
  - Suggested styling: `bg-indigo-500`, `text-white`, `border-indigo-500`
- This ensures "web" channel displays with proper color badge

### 5. Update channel filter options in advanced-filter-panel.tsx
- Navigate to `src/components/advanced-filter-panel.tsx` lines 341-349
- Update the SelectItem values for selling channel dropdown
- Current: grab, lazada, shopee, tiktok, shopify, instore
- New: web, lazada, shopee (keep "all-channels" as default)

### 6. Verify channel filters in order-management-hub.tsx
- Search for any hardcoded channel references
- Ensure Quick Filters don't have legacy channel values
- Verify channel filter logic uses the new values

## Validation Commands
Execute these commands to validate the chore is complete:

```bash
# Build the project to check for TypeScript errors
pnpm build

# Run linter to check code quality
pnpm lint

# Start dev server and manually verify
pnpm dev
# Then navigate to http://localhost:3000/orders
# Check that:
# - Random orders show web/lazada/shopee channels
# - ORD-SCENARIO-001 shows web channel
# - Channel badges display correctly with colors
# - Channel filter dropdown shows web/lazada/shopee options
```

## Notes

- **Channel Badge Component**: The `ChannelBadge` component (order-badges.tsx:49-72) uses `channel?.toUpperCase()` for normalization, so the mapping should use uppercase keys (WEB, LAZADA, SHOPEE) even though mock data uses lowercase values
- **Backward Compatibility**: Any existing orders with old channel values in the database may not display correctly after this change if they don't match the new badge mappings
- **Color Scheme**: Suggested color for "web" channel is indigo/purple to differentiate from lazada (blue) and shopee (orange)
- **Filter Default**: Keep "all-channels" as the default filter option to allow viewing orders from all channels
