# Chore: Validate Stock Config CSV Format Support

## Metadata
adw_id: `8f65ec69`
prompt: `Analyze and ensure stock config file upload supports the following CSV/Excel format:

  Columns:
  - ItemId (barcode, e.g., 8850590937000)
  - LocationId (store code, e.g., CFM0103)
  - SupplyTypeId ('On Hand Available', 'PreOrder')
  - Frequency ('Daily', 'One-time')
  - Quantity (integer)
  - StartDate (datetime: YYYY-MM-DD HH:MM:SS)
  - EndDate (datetime: YYYY-MM-DD HH:MM:SS)

  Tasks:
  1. Check src/types/stock-config.ts - verify ParsedStockConfigRow type has all required fields
  2. Check src/lib/stock-config-service.ts - verify parseStockConfigFile() correctly parses all columns
  3. Check validateFilePreSubmission() handles validation for all fields including datetime format
  4. Ensure the file-upload-modal.tsx validation summary correctly reports errors for invalid data
  5. Add any missing fields or validation rules needed to support this exact format

  Focus on the parsing and validation logic. Do not change the UI layout.`

## Chore Description
This chore ensures that the stock configuration file upload feature correctly supports the exact CSV/Excel format specified by the business requirements. The current implementation has several mismatches:

1. **Supply Type Values**: The current code expects `"Preorder"` and `"OnHand"`, but the spec requires `"PreOrder"` (capital O) and `"On Hand Available"` (with spaces)
2. **Frequency Values**: The current code expects `"Onetime"` and `"Daily"`, but the spec requires `"One-time"` (with hyphen) and `"Daily"` (matching)
3. **Date Format**: The current code validates `YYYY-MM-DD` format only, but the spec requires `YYYY-MM-DD HH:MM:SS` (datetime with time component)
4. **Field Mapping**: Need to verify all column name variations are properly mapped during parsing

The goal is to update parsing, validation, and type definitions to match the exact business specification without changing the UI components.

## Relevant Files
Use these files to complete the chore:

- **src/types/stock-config.ts** (lines 13-20, 141-155) - Type definitions for SupplyTypeID, Frequency, and ParsedStockConfigRow need updates to support new values
- **src/lib/stock-config-service.ts** (lines 226-251) - Header mapping function needs to ensure all column names map correctly (ItemId, LocationId, SupplyTypeId, etc.)
- **src/lib/stock-config-service.ts** (lines 256-369) - parseRow() function needs updates for datetime parsing and new enum values
- **src/lib/stock-config-service.ts** (lines 374-379) - isValidDate() function needs to support datetime format `YYYY-MM-DD HH:MM:SS`
- **src/lib/stock-config-service.ts** (lines 685-759) - validateFilePreSubmission() function needs to validate datetime format and new enum values
- **src/lib/stock-config-service.ts** (lines 305-318) - Supply type validation needs to accept new values
- **src/lib/stock-config-service.ts** (lines 312-318) - Frequency validation needs to accept new values
- **src/components/stock-config/file-upload-modal.tsx** (lines 363-444) - Validation summary display should work correctly with updated validation (no code changes needed, just verification)

### New Files
None - all changes will be made to existing files.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Type Definitions for Business Spec Values
- Update `SupplyTypeID` type in `src/types/stock-config.ts` to support `"PreOrder"` and `"On Hand Available"` (in addition to or replacing current values)
- Update `Frequency` type in `src/types/stock-config.ts` to support `"One-time"` instead of `"Onetime"`
- Consider backward compatibility: decide whether to replace old values or support both old and new values
- Update the interface comments to document the new format requirements

### 2. Enhance Date Validation for Datetime Format
- Update `isValidDate()` function in `src/lib/stock-config-service.ts` to support both formats:
  - `YYYY-MM-DD` (date only)
  - `YYYY-MM-DD HH:MM:SS` (datetime)
- Add regex pattern for datetime format validation
- Ensure parsed dates are valid after regex check
- Update function comments to document both supported formats

### 3. Update Header Mapping for Column Names
- Review `mapHeaders()` function in `src/lib/stock-config-service.ts` (lines 226-251)
- Ensure these column name variations are mapped correctly:
  - `ItemId`, `itemid`, `item_id`, `item` → `itemId`
  - `LocationId`, `locationid`, `location_id`, `location` → `locationId`
  - `SupplyTypeId`, `supplytypeid`, `supply_type_id`, `supplytype` → `supplyTypeId`
  - `Frequency`, `frequency`, `freq` → `frequency`
  - `StartDate`, `startdate`, `start_date` → `startDate`
  - `EndDate`, `enddate`, `end_date` → `endDate`
- Verify case-insensitive matching works for all variations

### 4. Update Supply Type Validation Logic
- Update supply type validation in `parseRow()` function (lines 305-310)
- Change valid values array to: `["PreOrder", "On Hand Available"]`
- Update error message to reflect new valid values
- Update the same validation in `validateFilePreSubmission()` (line 713)
- Ensure both functions use consistent validation rules

### 5. Update Frequency Validation Logic
- Update frequency validation in `parseRow()` function (lines 312-318)
- Change valid values array to: `["One-time", "Daily"]`
- Update error message to reflect new valid values
- Update the same validation in `validateFilePreSubmission()` (line 718)
- Ensure both functions use consistent validation rules

### 6. Update Date Format Validation in parseRow()
- Update date validation in `parseRow()` function (lines 328-346)
- Use the enhanced `isValidDate()` function that supports both formats
- Update error messages to indicate both formats are accepted
- Ensure datetime values are properly stored in ParsedStockConfigRow

### 7. Update Date Format Validation in validateFilePreSubmission()
- Update date validation in `validateFilePreSubmission()` function (lines 723-737)
- Use the enhanced `isValidDate()` function
- Update error messages to match parseRow() validation
- Ensure consistent validation across both functions

### 8. Update Error Message Templates
- Update `ERROR_MESSAGE_TEMPLATES` constant (lines 650-660) if needed
- Ensure `INVALID_SUPPLY_TYPE` message reflects new values: "Supply Type must be PreOrder or On Hand Available"
- Ensure `INVALID_FREQUENCY` message reflects new values: "Frequency must be One-time or Daily"
- Ensure `INVALID_DATE_FORMAT` message indicates both formats are accepted: "Date must be in YYYY-MM-DD or YYYY-MM-DD HH:MM:SS format"

### 9. Update Mock Data for Testing
- Update mock data in `src/lib/stock-config-service.ts` (lines 34-99) to use new enum values
- Change `supplyTypeId` from `"Preorder"/"OnHand"` to `"PreOrder"/"On Hand Available"`
- Change `frequency` from `"Onetime"` to `"One-time"`
- Add test data with datetime format for startDate/endDate
- Ensure mock data provides good test coverage for the new format

### 10. Verify File Upload Modal Integration
- Review `file-upload-modal.tsx` to ensure it correctly displays validation errors
- Check that validation summary (lines 363-444) shows errors for all field types
- Verify the error display in CollapsibleContent (lines 423-442) shows field names and messages correctly
- No code changes needed - just verify current implementation works with updated validation
- Test that validation badges (lines 385-408) correctly reflect validation status

### 11. Comprehensive Testing and Validation
- Create a test CSV file with the exact format from the spec:
  ```csv
  ItemId,LocationId,SupplyTypeId,Frequency,Quantity,StartDate,EndDate
  8850590937000,CFM0103,PreOrder,One-time,100,2024-01-15 10:00:00,2024-02-15 10:00:00
  8850590937001,CFM0104,On Hand Available,Daily,50,2024-01-01 00:00:00,2024-12-31 23:59:59
  ```
- Test file upload through the UI
- Verify parsing correctly reads all columns
- Verify validation accepts valid datetime formats
- Verify validation rejects invalid data with appropriate error messages
- Test both date formats: `YYYY-MM-DD` and `YYYY-MM-DD HH:MM:SS`
- Verify validation summary displays correct counts and error details

## Validation Commands
Execute these commands to validate the chore is complete:

- `npm run dev` - Start development server and verify no TypeScript compilation errors
- **Manual Test 1**: Upload a CSV file with the exact format from the spec (PreOrder, On Hand Available, One-time, datetime format) and verify it parses successfully
- **Manual Test 2**: Upload a CSV with invalid SupplyTypeId values (e.g., "Preorder" or "OnHand") and verify validation errors appear
- **Manual Test 3**: Upload a CSV with invalid Frequency values (e.g., "Onetime") and verify validation errors appear
- **Manual Test 4**: Upload a CSV with both date formats (YYYY-MM-DD and YYYY-MM-DD HH:MM:SS) and verify both are accepted
- **Manual Test 5**: Upload a CSV with invalid datetime format (e.g., "2024-01-15 10:00") and verify validation error appears
- **Check Types**: Review `src/types/stock-config.ts` to confirm SupplyTypeID and Frequency types match spec
- **Check Validation**: Review validation error messages in UI to confirm they reference correct values (PreOrder, On Hand Available, One-time, Daily)
- `npm run build` - Verify production build succeeds with no errors

## Notes
- **Backward Compatibility Consideration**: Determine if old values ("Preorder", "OnHand", "Onetime") should still be supported alongside new values, or if we should enforce strict adherence to the new spec
- **Datetime Timezone**: The datetime format `YYYY-MM-DD HH:MM:SS` doesn't include timezone information. Consider documenting the assumed timezone (likely GMT+7 based on CLAUDE.md)
- **SafetyStock Field**: The spec doesn't mention SafetyStock, but it exists in the current implementation. Verify if this field should be required, optional, or removed
- **SKU Field**: The spec doesn't mention SKU field separately from ItemId. Verify if SKU should be a separate required field or if ItemId serves as the SKU
- **Field Order**: The spec lists fields in a specific order. Verify if the CSV parser requires fields in this exact order or if it's flexible (current implementation uses header mapping, so order shouldn't matter)
- **UI Layout**: As specified, no changes to the UI layout should be made. The validation summary component should continue to work with the updated validation logic without modifications
