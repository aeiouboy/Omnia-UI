# Chore: Fix Stock Config CSV Validation Issues

## Metadata
adw_id: `6fef980d`
prompt: `Fix stock config CSV validation issues found during testing: SKU field should be OPTIONAL, datetime format validation failing for YYYY-MM-DD HH:MM:SS format`

## Chore Description
Fix two validation issues in the stock configuration CSV parser:

1. **SKU Field Required Error**: The `parseRow()` function currently requires the SKU field (lines 297-299), but the user's file format does not include an SKU column. The expected file format is: `ItemId, LocationId, SupplyTypeId, Frequency, Quantity, StartDate, EndDate`. SKU should be optional and auto-generated from ItemId if missing.

2. **Datetime Format Validation Failing**: Dates like `2025-12-18 17:00:00` are being rejected despite the `isValidDate()` regex appearing correct. The issue is likely related to how the xlsx library parses CSV cells containing spaces - the datetime value may be split across multiple cells or have extra whitespace. The regex patterns and parsing need debugging.

**Root Cause Analysis**:
- The xlsx library when parsing CSV may interpret commas inside datetime strings incorrectly, OR the datetime string is being trimmed/modified during parsing
- The `isValidDate()` function at line 380-392 has correct regex patterns but the input may not match expectations

## Relevant Files
Use these files to complete the chore:

- **`src/lib/stock-config-service.ts`** - Contains the `parseRow()` function (line 259-372) with SKU validation that needs to be made optional, and `isValidDate()` function (line 380-392) for datetime validation. Also contains `validateFilePreSubmission()` (line 699-772) which has duplicate SKU validation.

- **`src/types/stock-config.ts`** - Contains `ParsedStockConfigRow` interface (line 145-159) where `sku` field needs to remain but be optional in validation. Also `StockConfigItem` interface (line 29-42) where `sku` is currently required.

- **`test-stock-config.csv`** - Test file with 4 data rows that should all be VALID after the fix. Format: `ItemId,LocationId,SupplyTypeId,Frequency,Quantity,StartDate,EndDate`

### New Files
None required - this is a bug fix in existing code.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Make SKU Field Optional in parseRow()
- In `src/lib/stock-config-service.ts`, locate lines 297-299 in the `parseRow()` function
- Remove the SKU required validation block:
  ```typescript
  if (!sku) {
    errors.push({ row: rowNumber, field: "sku", value: "", message: "SKU is required", severity: "error" })
  }
  ```
- Add logic to auto-generate SKU from ItemId if missing:
  ```typescript
  const skuValue = sku || `SKU-${itemId}`
  ```
- Update the return statement to use `skuValue` instead of `sku`

### 2. Make SKU Field Optional in validateFilePreSubmission()
- In `src/lib/stock-config-service.ts`, locate lines 715-717 in the `validateFilePreSubmission()` function
- Remove the SKU required validation block:
  ```typescript
  if (!row.sku) {
    rowErrors.push({ row: row.rowNumber, field: "sku", value: "", message: getErrorMessage("MISSING_REQUIRED_FIELD", ["SKU"]), severity: "error" })
  }
  ```

### 3. Make SafetyStock Field Optional
- Looking at the test CSV, there is no SafetyStock column in the user's format
- In `parseRow()` around lines 324-328, remove/modify the safetyStock required validation
- Change from error to warning or remove entirely since SafetyStock is not in the user's required columns
- Set a default value of `0` if safetyStock is not provided

### 4. Debug and Fix Datetime Format Validation
- Add console.log debugging to `isValidDate()` function to inspect the actual input value
- Check if the xlsx library is correctly preserving datetime strings with spaces
- In `getValue()` helper function (line 267-272), ensure proper string handling
- Test with the datetime string `2025-12-18 17:00:00` to verify regex matching
- If needed, add `.replace(/\s+/g, ' ').trim()` to normalize whitespace in datetime values
- Consider if xlsx might be converting datetime to Excel serial number - may need to detect and convert

### 5. Handle xlsx Date Serial Number Conversion
- The xlsx library may convert datetime strings like `2025-12-18 17:00:00` to Excel serial date numbers
- In `getValue()` or `parseRow()`, detect if a date value is a number (Excel serial date)
- Add conversion from Excel serial date to ISO format string:
  ```typescript
  // Excel serial date starts from 1900-01-01
  if (typeof value === 'number' && (field === 'startDate' || field === 'endDate')) {
    const date = XLSX.SSF.parse_date_code(value)
    return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')} ${String(date.H).padStart(2, '0')}:${String(date.M).padStart(2, '0')}:${String(date.S).padStart(2, '0')}`
  }
  ```

### 6. Update Type Definitions if Needed
- In `src/types/stock-config.ts`, verify `sku` in `StockConfigItem` interface can be optional
- Update interface if needed:
  ```typescript
  sku?: string  // Optional, auto-generated from ItemId if not provided
  ```
- Similarly for `safetyStock`:
  ```typescript
  safetyStock?: number  // Optional, defaults to 0
  ```

### 7. Validate the Fix
- Run the development server: `pnpm dev`
- Test file upload with `test-stock-config.csv`
- Verify all 4 rows are marked as VALID
- Check that:
  - Row 1: `8850590937000,CFM0103,On Hand Available,Daily,0,2025-12-18 17:00:00,2025-12-18 20:40:00` - VALID
  - Row 2: `8850590937001,CFM0104,PreOrder,One-time,100,2025-01-15 10:00:00,2025-02-15 10:00:00` - VALID
  - Row 3: `8850590937002,CFM0105,On Hand Available,Daily,50,2025-01-01 00:00:00,2025-12-31 23:59:59` - VALID
  - Row 4: `8850590937003,CFM0106,PreOrder,Daily,25,2025-06-01,2025-12-31` - VALID

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure no TypeScript compilation errors
- `pnpm lint` - Ensure no linting errors
- `pnpm dev` - Start development server and manually test CSV upload with `test-stock-config.csv`

## Notes
- The xlsx library may handle CSV datetime parsing differently than expected - the key insight is that CSV cells with spaces in datetime values might need special handling
- The `raw: true` option in `XLSX.utils.sheet_to_json()` could help preserve original string values
- Consider adding unit tests for the `parseRow()` and `isValidDate()` functions after this fix
- The test file has 4 data rows (excluding header), so expected result is 4 valid rows, 0 invalid
