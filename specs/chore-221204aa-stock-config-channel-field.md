# Chore: Stock Config - Channel Field Addition

## Metadata
adw_id: `221204aa`
prompt: `Add Channel field to Stock Configuration with support for TOL, MKP, QC channels. Multi-channel configs create separate rows per channel.`

## Chore Description
Add a new Channel field to the Stock Configuration module. This field allows users to specify which sales channel(s) a stock configuration applies to. The supported channels are:

| Channel Code | Description |
|--------------|-------------|
| TOL | Tops Online |
| MKP | Marketplace |
| QC | Quality Control / Quick Commerce |

**Multi-Channel Handling**: When a user creates a stock configuration for multiple channels, the system should create separate configuration rows for each selected channel. For example, if an item is configured for TOL and MKP, two separate rows are created in the system.

## Relevant Files
Use these files to complete the chore:

### Type Definitions
- **`src/types/stock-config.ts`** - Core type definitions for stock configuration. Must add `Channel` type and update `StockConfigItem`, `ParsedStockConfigRow`, and `StockConfigFilters` interfaces.

### Service Layer
- **`src/lib/stock-config-service.ts`** - Service functions for data fetching, file parsing, and validation. Must update:
  - Mock data to include channel field
  - Header mapping for file parsing
  - Row parsing to extract channel
  - Validation logic for channel values
  - Filter logic to support channel filtering
  - CSV export templates to include channel

### Main Page
- **`app/stock-config/page.tsx`** - Main stock configuration page. Must update:
  - Add channel filter state and UI control
  - Update filter object to include channel
  - Pass channel filter to components

### Components
- **`src/components/stock-config/stock-config-table.tsx`** - Data table component. Must add:
  - Channel column to table header
  - Channel badge rendering in table body
  - Loading skeleton for channel column

- **`src/components/stock-config/file-upload-modal.tsx`** - File upload modal. No changes needed (channel is parsed from file).

### New Files
No new files needed - all changes are modifications to existing files.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Type Definitions
- Add `Channel` type with values: `"TOL" | "MKP" | "QC"`
- Add `channel?: Channel` property to `StockConfigItem` interface (after `frequency`)
- Add `channel: string` property to `ParsedStockConfigRow` interface
- Add `channel?: Channel | "all"` property to `StockConfigFilters` interface
- Add `"channel"` to the `sortBy` union type in `StockConfigFilters`

### 2. Update Service Layer - Mock Data & Header Mapping
- Add `channel` field to each mock stock config item with realistic values
- Add `channel` to the `fieldMappings` object in `mapHeaders()` function with aliases: `["channel", "channel_code", "channelcode", "sales_channel"]`

### 3. Update Service Layer - Row Parsing
- Extract `channel` value in `parseRow()` function using `getValue("channel")`
- Add validation for channel field: must be one of `["TOL", "MKP", "QC"]` if provided
- Add channel to the returned `ParsedStockConfigRow` object

### 4. Update Service Layer - Filter Logic
- Update `getStockConfigs()` function to filter by channel when `filters?.channel` is provided and not "all"

### 5. Update Service Layer - Validation Functions
- Update `validateFilePreSubmission()` to validate channel values
- Add channel validation error message to `ERROR_MESSAGE_TEMPLATES` with code `INVALID_CHANNEL`
- Update `ErrorCode` type to include `"INVALID_CHANNEL"`

### 6. Update Service Layer - CSV Export
- Update `generateErrorReport()` to include Channel column
- Update `generateErrorsOnlyReport()` to include Channel column

### 7. Update Stock Config Table Component
- Add Channel column header (after Frequency column)
- Add `getChannelBadge()` helper function with colors:
  - TOL: `bg-blue-100 text-blue-800`
  - MKP: `bg-orange-100 text-orange-800`
  - QC: `bg-green-100 text-green-800`
- Add Channel cell rendering using `getChannelBadge()`
- Add Channel column to loading skeleton
- Make Channel column sortable

### 8. Update Main Page - Add Channel Filter
- Add `channelFilter` state with type `"all" | "TOL" | "MKP" | "QC"` initialized to `"all"`
- Add `handleChannelChange` handler function
- Add channel to the `filters` useMemo object
- Add Channel dropdown Select component in the filters row (before Frequency dropdown)

### 9. Verify TypeScript Compilation
- Run `pnpm build` to verify no TypeScript errors
- Fix any type errors that arise

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Verify TypeScript compilation succeeds with no errors
- `pnpm lint` - Verify no linting errors
- `pnpm dev` - Start dev server and manually verify:
  1. Channel column appears in stock config table
  2. Channel filter dropdown works correctly
  3. Channel badges display with correct colors
  4. Sorting by channel works

## Notes
- Channel field is optional for backward compatibility with existing configurations
- When parsing files without a Channel column, the field should be empty/undefined (not throw an error)
- The UI should show a dash (`-`) for configurations without a channel value
- Multi-channel upload handling: During file upload, if a row contains multiple comma-separated channels, the backend should split them into separate rows. This is a future enhancement - for now, each row should have exactly one channel value.
