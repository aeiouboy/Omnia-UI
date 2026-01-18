# Chore: Update Inventory Supply Mock Data to Match MAO Structure

## Metadata
adw_id: `23512edb`
prompt: `Update Inventory Supply mock data (src/lib/mock-inventory-data.ts) to match MAO Supply Details structure. MAO STORE LOCATIONS: Use CDS prefix store IDs matching MAO: CDS10101 (Head Office), CDS10102 (Chidlom), CDS10103 (Silom Complex), CDS10104 (Lardprao), CDS10105 (Ramindra), CDS10107 (Rangsit), CDS10110 (Pinklao), CDS10112 (Kad Suan Kaew), CDS10114 (Central World), CDS10116 (Bangna), CDS10117 (Rama III), CDS10120 (Rama II), CDS10121 (Phuket), CDS10123 (Central World Plaza 2), CDS10125 (Chaengwattana), CDS10127 (Pattaya), CDS10130 (Lardprao 2), CDS10133 (Jewelry Trade Center), CDS10136 (Central Festival Chiangmai), CDS10137 (Central Festival Hadyai). MAO VIEW TYPES: Add all 14 MAO view types - ECOM-TH-CFR-LOCD-STD, ECOM-TH-DSS-NW-ALL, ECOM-TH-DSS-NW-STD, ECOM-TH-DSS-LOCD-EXP, ECOM-TH-SSP-NW-STD, MKP-TH-SSP-NW-STD, MKP-TH-CFR-LOCD-STD, ECOM-TH-SSP-NW-ALL, MKP-TH-CFR-MANUAL-SYNC, CMG-ECOM-TH-STD, CMG-MKP-SHOPEE-TH-NTW-STD, CMG-MKP-LAZADA-TH-LOC-STD, CMG-MKP-MIRAKL-TH-NTW-STD. MOCK DATA DISTRIBUTION: Ensure each product appears at MULTIPLE stores (same item at 3-5 different stores) to properly test Item ID search showing all stores. FILTER TESTING SCENARIOS: 1) Location ID only search returns all items at that store, 2) Item ID only search returns that item across ALL stores carrying it, 3) Combined Location+Item returns specific item at specific store, 4) View Type filters results after search. Also update VIEW_TYPE_CONFIG in src/types/view-type-config.ts to include all 14 MAO view types.`

## Chore Description
Update the mock inventory data and view type configuration to align with MAO (Manhattan Active Omni) Supply Details structure. This involves:

1. **Store Locations**: Replace current store IDs with MAO-standard CDS-prefixed store IDs (CDS10101-CDS10137) representing Central Group's physical store locations across Thailand.

2. **View Types**: Expand VIEW_TYPE_CONFIG from current 5 view types to all 14 MAO view types including ECOM, MKP, and CMG prefixed configurations.

3. **Multi-Store Product Distribution**: Restructure mock data so each product appears at 3-5 different stores, enabling proper testing of "Item ID search shows all stores carrying that item" functionality.

4. **Filter Testing Support**: Ensure data supports all four filtering scenarios: Location-only, Item-only, Combined Location+Item, and View Type refinement after search.

## Relevant Files
Use these files to complete the chore:

- **src/types/view-type-config.ts** - Contains VIEW_TYPE_CONFIG array with view type definitions. Currently has 5 view types, needs expansion to 14 MAO view types.
- **src/lib/mock-inventory-data.ts** - Contains mock inventory items, store definitions, and data generation functions. Needs CDS store mapping and multi-store product distribution.
- **src/types/inventory.ts** - Contains TopsStore type definition which may need updating to include new CDS store names.

### New Files
- None required - all changes are modifications to existing files.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update VIEW_TYPE_CONFIG with All 14 MAO View Types
- Open `src/types/view-type-config.ts`
- Add the 14 MAO view types to VIEW_TYPE_CONFIG array:
  - ECOM-TH-CFR-LOCD-STD (CFR - TOL)
  - ECOM-TH-DSS-NW-ALL (DS - ALL)
  - ECOM-TH-DSS-NW-STD (DS - STD)
  - ECOM-TH-DSS-LOCD-EXP (DS - EXP)
  - ECOM-TH-SSP-NW-STD (SSP - STD)
  - MKP-TH-SSP-NW-STD (MKP SSP - STD)
  - MKP-TH-CFR-LOCD-STD (MKP CFR - STD)
  - ECOM-TH-SSP-NW-ALL (SSP - ALL)
  - MKP-TH-CFR-MANUAL-SYNC (MKP CFR - MANUAL)
  - CMG-ECOM-TH-STD (CMG ECOM - STD)
  - CMG-MKP-SHOPEE-TH-NTW-STD (CMG MKP Shopee)
  - CMG-MKP-LAZADA-TH-LOC-STD (CMG MKP Lazada)
  - CMG-MKP-MIRAKL-TH-NTW-STD (CMG MKP Mirakl)
- Add appropriate BusinessUnit and Channel mappings for each view type
- Add new BusinessUnit types if needed (e.g., "SSP", "CMG")
- Add new ViewTypeChannel types if needed

### 2. Update CDS Store Locations Mapping
- Open `src/lib/mock-inventory-data.ts`
- Create new constant `MAO_CDS_STORES` with all 20 MAO store locations:
  ```typescript
  export const MAO_CDS_STORES = {
    CDS10101: "Head Office",
    CDS10102: "Chidlom",
    CDS10103: "Silom Complex",
    CDS10104: "Lardprao",
    CDS10105: "Ramindra",
    CDS10107: "Rangsit",
    CDS10110: "Pinklao",
    CDS10112: "Kad Suan Kaew",
    CDS10114: "Central World",
    CDS10116: "Bangna",
    CDS10117: "Rama III",
    CDS10120: "Rama II",
    CDS10121: "Phuket",
    CDS10123: "Central World Plaza 2",
    CDS10125: "Chaengwattana",
    CDS10127: "Pattaya",
    CDS10130: "Lardprao 2",
    CDS10133: "Jewelry Trade Center",
    CDS10136: "Central Festival Chiangmai",
    CDS10137: "Central Festival Hadyai"
  } as const
  ```
- Update existing CDS_STORES array to use MAO store IDs
- Update ensureWarehouseLocationsAndNewFields function to use MAO store IDs

### 3. Update TopsStore Type Definition
- Open `src/types/inventory.ts`
- Update TopsStore type union to include new CDS store names matching MAO format
- Ensure backward compatibility with existing Tops store names

### 4. Restructure Mock Data for Multi-Store Product Distribution
- In `src/lib/mock-inventory-data.ts`, modify the mockInventoryItemsBase array
- For each product, create 3-5 entries at different store locations
- Example structure for a product:
  ```typescript
  // Product PROD-001 "Fresh Vegetables Mix" at multiple stores
  { id: "INV-001-CDS10102", productId: "PROD-001", productName: "Fresh Vegetables Mix", storeId: "CDS10102", storeName: "CDS Chidlom", ... },
  { id: "INV-001-CDS10114", productId: "PROD-001", productName: "Fresh Vegetables Mix", storeId: "CDS10114", storeName: "CDS Central World", ... },
  { id: "INV-001-CDS10116", productId: "PROD-001", productName: "Fresh Vegetables Mix", storeId: "CDS10116", storeName: "CDS Bangna", ... },
  ```
- Vary stock levels, status, and timestamps across different stores for the same product
- Ensure logical distribution (e.g., high-demand stores have higher stock levels)

### 5. Update VIEW_OPTIONS Array
- In `src/lib/mock-inventory-data.ts`, update the VIEW_OPTIONS constant to include all 14 MAO view types
- Ensure VIEW_OPTIONS matches VIEW_TYPE_CONFIG in view-type-config.ts

### 6. Update Helper Functions for MAO Compatibility
- Modify `ensureWarehouseLocationsAndNewFields()` to use MAO store IDs
- Update `getViewForProduct()` to support all 14 view types
- Ensure store ID generation uses CDS prefix format consistently

### 7. Validate Filter Testing Scenarios
- Verify mock data supports:
  - **Location ID only**: Search by CDS10114 returns all products at Central World
  - **Item ID only**: Search by PROD-001 returns Fresh Vegetables Mix at all 3-5 stores
  - **Combined**: Search by CDS10114 + PROD-001 returns single record
  - **View Type filter**: After search, selecting view type filters results

### 8. Build Validation
- Run `pnpm build` to ensure no TypeScript errors
- Verify all type definitions are correctly updated

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Verify TypeScript compilation succeeds with no errors
- `pnpm lint` - Check for any linting issues in modified files
- `pnpm dev` - Start development server and manually verify:
  1. Navigate to Inventory Supply page
  2. Search by Item ID → should show that item at multiple stores
  3. Search by Location ID → should show all items at that store
  4. Apply View Type filter after search → should filter results

## Notes
- The existing Tops store names (Tops Central World, Tops สุขุมวิท 39, etc.) should remain for CFR/grocery items
- CDS store IDs (CDS10101-CDS10137) are primarily for DS (Department Store) items matching MAO structure
- Multi-store product distribution is critical for testing the bug fix where Item ID search was only showing one store
- View Type acts as a secondary filter after Location ID or Item ID search, not as an independent trigger for data display
- Consider performance implications when expanding mock data - keep total records reasonable (<500 items)
