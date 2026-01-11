# Chore: Update Customer Type Mock Data

## Metadata
adw_id: `e70b4c6f`
prompt: `Update the Customer Type field mock data in src/lib/mock-data.ts to use specific Central Group customer types. Currently the customerType field generates generic values like 'VIP', 'Regular', etc.`

## Chore Description
Update the `customerType` field generation in the mock data generator to use specific Central Group customer type values instead of the current generic values (`RETAIL`, `WHOLESALE`, `VIP`, `CORPORATE`). The new values should represent the actual customer segments used by Central Group's retail systems.

## Relevant Files
Use these files to complete the chore:

- **src/lib/mock-data.ts** - Contains the `mockApiOrders` array generator where `customerType` is defined on lines 93-94. This is the only file that needs modification.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Customer Types Array
- Locate line 93 in `src/lib/mock-data.ts`
- Replace the current `customerTypes` array:
  ```typescript
  const customerTypes = ["RETAIL", "WHOLESALE", "VIP", "CORPORATE"]
  ```
- With the new Central Group customer types:
  ```typescript
  const customerTypes = ['Guest', 'Tier 1 Login', 'Tops Prime', 'General', 'cluster_1', 'cluster_2', 'cluster_3', 'Tops Prime Plus']
  ```
- The random selection logic on line 94 remains unchanged as it already works correctly

### 2. Validate the Change
- Run the development server to ensure no TypeScript or runtime errors
- Verify the mock data generates orders with the new customer type values

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure the build completes without TypeScript errors
- `pnpm dev` - Start development server and verify no runtime errors occur

## Notes
- The `customerType` field is used in the `customer` object within each mock order (line 110)
- The field is also referenced in `customerTypeId` on line 153 which uses a substring of the customer type
- No changes are needed to other files as this is purely a mock data value update
- The new customer types include Thai loyalty program tiers (Tops Prime, Tops Prime Plus), clustering segments (cluster_1-3), and general categories (Guest, General, Tier 1 Login)
