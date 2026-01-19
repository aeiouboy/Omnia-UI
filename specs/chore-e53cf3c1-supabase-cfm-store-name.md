# Chore: Update Supabase Mock Data to Use CFM Store Name

## Metadata
adw_id: `e53cf3c1`
prompt: `Update src/lib/supabase.ts line 86 to replace 'Tops Central World' with a CFM store name. Import CFM_STORES from mock-inventory-data.ts and use CFM_STORES[0] or hardcode 'Wat Ampawa' as the store_name value in the mock order fallback data.`

## Chore Description
Replace the hardcoded "Tops Central World" store name in the Supabase mock client's order data with a CFM (Central Food Market) store name. This aligns the mock fallback data with the CFM store migration that has been implemented across the codebase. The store name should either use the first entry from the CFM_STORES array (CFM_STORES[0]) or be hardcoded to "Wat Ampawa" (the first CFM store in the MAO_CFM_STORES mapping).

## Relevant Files

- **src/lib/supabase.ts** (line 86)
  - Contains the mock order data with hardcoded "Tops Central World" store name
  - Mock client is used when Supabase credentials are unavailable
  - This is the primary file to be modified

- **src/lib/mock-inventory-data.ts**
  - Exports MAO_CFM_STORES mapping (line 193) with CFM store IDs to store names
  - Exports CFM_STORES array (line 726) - array of all CFM store names
  - First CFM store is "Wat Ampawa" (CFM0103)
  - Reference file for understanding CFM store structure

## Step by Step Tasks

### 1. Import CFM Store Data
- Add import statement at the top of src/lib/supabase.ts to import `CFM_STORES` from `@/lib/mock-inventory-data`
- Import should be placed with other library imports (around lines 1-2)

### 2. Update Mock Order Store Name
- Locate line 86 in src/lib/supabase.ts where `store_name: "Tops Central World"` is defined
- Replace the hardcoded string `"Tops Central World"` with `CFM_STORES[0]` to use the first CFM store dynamically
- Alternative: Replace with hardcoded string `"Wat Ampawa"` for static value

### 3. Verify Import and Usage
- Ensure the import statement is correctly formatted
- Verify that CFM_STORES[0] will resolve to "Wat Ampawa" based on MAO_CFM_STORES mapping
- Confirm no TypeScript errors are introduced

### 4. Validate the Change
- Run the build command to ensure no compilation errors
- Verify that the mock client will return correct CFM store data when Supabase credentials are missing
- Check that no other references to "Tops Central World" exist in the mock data structure

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Verify TypeScript compilation succeeds with no errors
- `grep -n "Tops Central World" src/lib/supabase.ts` - Confirm no instances of old store name remain in file
- `grep -n "CFM_STORES" src/lib/supabase.ts` - Verify the CFM_STORES import and usage are present

## Notes
- The CFM_STORES array is derived from `Object.values(MAO_CFM_STORES)` where MAO_CFM_STORES is a mapping of store IDs to store names
- "Wat Ampawa" corresponds to CFM store ID "CFM0103" and is the first entry in the MAO_CFM_STORES mapping
- This change maintains consistency with the broader CFM store migration documented in the session context (#S211, #S212)
- Using CFM_STORES[0] is preferred over hardcoding as it maintains consistency with the source data structure
