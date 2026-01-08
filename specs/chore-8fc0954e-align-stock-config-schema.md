# Chore: Align Stock Config Mockup Data Structure with Actual File Schema

## Metadata
adw_id: `8fc0954e`
prompt: `Validate and align stock config mockup data structure with actual file schema.`

## Chore Description
The current stock configuration types and mock data include fields (`sku` and `safetyStock`) that do not exist in the actual file schema. The actual uploaded files only contain 7 columns:

| Column | Type | Example |
|--------|------|---------|
| ItemId | numeric | 48705813 |
| LocationId | string | CFM6686 |
| SupplyTypeId | string | 'On Hand Available' or 'PreOrder' |
| Frequency | string | 'Daily' or 'One-time' |
| Quantity | number | 100 |
| StartDate | datetime | 2024-01-20 10:00:00 |
| EndDate | datetime | 2024-02-20 18:00:00 |

This chore removes the extraneous fields from the type definitions and mock data, and updates the LocationId format to match the realistic CFM + 4-digit pattern.

## Relevant Files
Use these files to complete the chore:

- **src/types/stock-config.ts** - Contains `StockConfigItem` and `ParsedStockConfigRow` types with `sku` and `safetyStock` fields that need removal
- **src/lib/stock-config-service.ts** - Contains mock data with `sku` and `safetyStock` fields, header mappings, parsing logic, and validation that references these fields

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update StockConfigItem Type
- Remove `sku: string` field from `StockConfigItem` interface (line 33)
- Remove `safetyStock: number` field from `StockConfigItem` interface (line 37)
- Remove related comments about auto-generation and defaults

### 2. Update ParsedStockConfigRow Type
- Remove `sku: string` field from `ParsedStockConfigRow` interface (line 153)
- Remove `safetyStock: number | null` field from `ParsedStockConfigRow` interface (line 157)

### 3. Update Mock Stock Configs
- Remove `sku` field from all 5 mock items in `mockStockConfigs` array
- Remove `safetyStock` field from all 5 mock items
- Update `locationId` values to use realistic CFM + 4-digit format (e.g., CFM6686, CFM7234)
- Keep mock data minimal (5 items is appropriate)

### 4. Update Header Mapping Function
- Remove `sku` mapping from `fieldMappings` object in `mapHeaders()` function (line 238)
- Remove `safetyStock` mapping from `fieldMappings` object (line 242)

### 5. Update parseRow Function
- Remove `getValue("sku")` call and `sku` variable
- Remove `getValue("safetyStock")` call and `safetyStockStr` variable
- Remove `safetyStock` parsing logic
- Remove SKU auto-generation logic (`const skuValue = sku || \`SKU-${itemId}\``)
- Remove safetyStock validation (lines 364-368)
- Remove safetyStock warning for 999999 value (lines 392-395)
- Remove `sku` and `safetyStock` from returned `ParsedStockConfigRow` object

### 6. Update validateStockConfigData Function
- No changes needed - this function doesn't validate sku or safetyStock

### 7. Update getStockConfigs Search Filter
- Remove `item.sku.toLowerCase().includes(query)` from search filter (line 505)

### 8. Update processRow Function
- Remove reference to `row.sku` in VALID_ITEMS check (line 877)

### 9. Update generateErrorReport Function
- Remove "SKU" column from headers array (line 954)
- Remove "Safety Stock" column from headers array (line 958)
- Remove `escapeCSV(row.sku)` from csvRow (line 975)
- Remove `row.safetyStock ?? ""` from csvRow (line 978)

### 10. Update VALID_ITEMS Mock List
- Remove SKU-prefixed items from VALID_ITEMS array (lines 680-681) since SKU field no longer exists
- Update to use numeric ItemId format if needed for validation simulation

### 11. Validate Changes
- Run `pnpm build` to ensure no TypeScript compilation errors
- Run `pnpm lint` to check for any linting issues

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure TypeScript compiles without errors related to removed fields
- `pnpm lint` - Ensure no linting errors
- `grep -r "safetyStock" src/` - Should return no matches in stock-config files
- `grep -r "\.sku" src/types/stock-config.ts src/lib/stock-config-service.ts` - Should return no matches

## Notes
- The `sku` field was previously auto-generated from ItemId if not provided - this logic is removed entirely
- The `safetyStock` field defaulted to 0 - this logic is removed entirely
- Backward compatibility types for SupplyTypeID ("Preorder", "OnHand") and Frequency ("Onetime") are preserved
- The actual file validation only needs to check the 7 columns that exist in real files
- Mock data should remain minimal (5-10 rows as specified) - current 5 items is appropriate
