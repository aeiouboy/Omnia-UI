# Chore: Create Config Stock Page with File Upload

## Metadata
adw_id: `8e888dd3`
prompt: `Create a new Config Stock page at /app/stock-config/page.tsx for managing inventory stock configuration (Preorder, Override OnHand, and Safety Stock) with file upload capability similar to Google Drive.`

## Chore Description
Create a comprehensive Stock Configuration page that allows users to manage inventory stock levels through bulk file uploads. The page will support three stock types:

1. **Preorder Stock** - Limited quantity one-time sales with SupplyTypeID 'Preorder' and Frequency 'Onetime'
2. **Override Stock (OnHand)** - Daily stock overrides with configurable date ranges for when DaaS sends/cancels config to MAO
3. **Safety Stock** - Buffer stock for damaged/defective items (setting safety_stock = 999999 effectively blocks sales)

The UI will feature Google Drive-style file upload with drag-and-drop functionality, file validation preview, and folder organization (arch/ for processed files, err/ for error files).

## Relevant Files
Use these files to complete the chore:

### Existing Files to Reference
- `src/components/ui/dialog.tsx` - Modal dialog component for file upload modal
- `src/components/ui/table.tsx` - Table component for displaying stock configurations and validation results
- `src/components/ui/tabs.tsx` - Tab navigation for filtering by supply type
- `src/components/ui/card.tsx` - Card layout for sections
- `src/components/ui/button.tsx` - Action buttons
- `src/components/ui/input.tsx` - File input with native file upload support
- `src/components/ui/badge.tsx` - Status badges for file processing status
- `src/components/ui/select.tsx` - Dropdown for supply type selection
- `src/components/ui/skeleton.tsx` - Loading skeletons
- `src/components/ui/alert.tsx` - Alert messages for validation errors
- `src/components/dashboard-shell.tsx` - Page wrapper for consistent layout
- `src/types/inventory.ts` - Existing inventory types to extend
- `src/lib/inventory-service.ts` - Service layer pattern reference
- `app/inventory/page.tsx` - Reference for table/list page patterns
- `app/atc-config/page.tsx` - Reference for complex configuration page patterns
- `package.json` - Contains `xlsx` v0.18.5 for Excel/CSV parsing

### New Files to Create
- `app/stock-config/page.tsx` - Main Config Stock page component
- `src/types/stock-config.ts` - TypeScript interfaces for stock configuration
- `src/lib/stock-config-service.ts` - Service layer for stock config operations
- `src/components/stock-config/file-upload-modal.tsx` - Google Drive-style file upload modal with drag-drop
- `src/components/stock-config/validation-results-table.tsx` - Table showing file validation results
- `src/components/stock-config/stock-config-table.tsx` - Main stock configuration list table

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Create TypeScript Type Definitions
- Create `src/types/stock-config.ts` with interfaces for:
  - `SupplyTypeID`: Union type `'Preorder' | 'OnHand'`
  - `Frequency`: Union type `'Onetime' | 'Daily'`
  - `StockConfigItem`: Interface with LocationID, ItemID, SKU, Quantity, SupplyTypeID, Frequency, SafetyStock, StartDate (optional), EndDate (optional)
  - `StockConfigFile`: Interface with id, filename, status ('pending' | 'validated' | 'processed' | 'error'), uploadDate, recordCount, validRecords, invalidRecords, folder ('pending' | 'arch' | 'err')
  - `ValidationResult`: Interface with row, field, message, severity ('error' | 'warning')
  - `StockConfigFilters`: Interface for filtering (supplyType, frequency, searchQuery, page, pageSize)

### 2. Create Stock Config Service Layer
- Create `src/lib/stock-config-service.ts` with:
  - `parseStockConfigFile(file: File)`: Parse CSV/Excel files using xlsx library
  - `validateStockConfigData(data: StockConfigItem[])`: Validate each row and return ValidationResult[]
  - `getStockConfigs(filters: StockConfigFilters)`: Fetch stock configurations with pagination
  - `saveStockConfig(items: StockConfigItem[])`: Save validated configurations
  - `archiveFile(fileId: string)`: Move file to arch/ folder
  - `markFileError(fileId: string)`: Move file to err/ folder
  - Mock data support following existing inventory-service.ts patterns

### 3. Create File Upload Modal Component
- Create `src/components/stock-config/file-upload-modal.tsx` with:
  - Google Drive-style drag-and-drop zone with "Drag files here" text
  - Visual feedback when files are dragged over (border color change, background highlight)
  - "Choose files to upload" button as alternative to drag-drop
  - File type validation (accept .csv, .xlsx, .xls only)
  - File preview showing filename, size, type before upload
  - Parse and validate file on selection
  - Show validation progress indicator
  - Display validation summary (X valid, Y invalid records)
  - "Review" button to see detailed validation results
  - "Upload" button to process valid records
  - "Cancel" button to close modal

### 4. Create Validation Results Table Component
- Create `src/components/stock-config/validation-results-table.tsx` with:
  - Table displaying parsed file contents
  - Columns: Row#, LocationID, ItemID/SKU, Quantity, SupplyTypeID, Frequency, SafetyStock, StartDate, EndDate, Status
  - Row highlighting for errors (red) and warnings (yellow)
  - Error/warning messages displayed inline or in tooltip
  - Summary header showing total/valid/invalid counts
  - Filter toggle to show "All" / "Errors Only" / "Valid Only"
  - Pagination for large files

### 5. Create Stock Config Table Component
- Create `src/components/stock-config/stock-config-table.tsx` with:
  - Main table displaying all stock configurations
  - Columns: LocationID, ItemID, SKU, Quantity, Supply Type, Frequency, Safety Stock, Start Date, End Date, Actions
  - Sortable columns (click header to sort)
  - Row actions: View, Edit (future), Delete (future)
  - Empty state when no configurations exist
  - Loading skeleton state

### 6. Create Main Config Stock Page
- Create `app/stock-config/page.tsx` with:
  - DashboardShell wrapper for consistent layout
  - Page header with title "Stock Configuration" and description
  - Action buttons: "Upload Config" (opens file upload modal)
  - Tabs for filtering: "All", "Preorder", "OnHand"
  - Search input for filtering by LocationID or ItemID
  - StockConfigTable component for displaying configurations
  - FileUploadModal component (controlled by state)
  - ValidationResultsTable shown after file parsing
  - File history section showing uploaded files (pending, arch/, err/)
  - Badge indicators for file status (Pending, Processed, Error)
  - Responsive layout following existing patterns

### 7. Add Page Navigation
- Update sidebar navigation in `src/components/app-sidebar.tsx` to add "Stock Config" menu item under Inventory section
- Icon: Use Settings or FileSpreadsheet from lucide-react
- Route: `/stock-config`

### 8. Validate Implementation
- Run `pnpm dev` to start development server
- Test page loads at `/stock-config`
- Test file upload modal opens and closes correctly
- Test drag-and-drop visual feedback
- Test file selection via button
- Test CSV/Excel file parsing
- Test validation results display
- Test stock config table rendering
- Test tab filtering (All/Preorder/OnHand)
- Test search functionality
- Run `pnpm build` to ensure no TypeScript/ESLint errors

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm dev` - Start development server and navigate to `/stock-config` to verify page renders
- `pnpm build` - Ensure no TypeScript or ESLint errors in production build
- `pnpm lint` - Run linter to check code quality

## Notes
- The `xlsx` package (v0.18.5) is already available in package.json for parsing CSV/Excel files
- Follow existing patterns from `app/inventory/page.tsx` for table/list layouts
- Follow patterns from `app/atc-config/page.tsx` for complex configuration pages
- Use existing UI components from `src/components/ui/` to maintain consistency
- File upload uses native HTML5 drag-and-drop API with React state management
- Safety stock value of 999999 effectively blocks sales (on_hand becomes 0)
- StartDate and EndDate are only applicable for OnHand supply type
- The arch/ and err/ folder structure is conceptual for file status tracking (not actual filesystem folders in frontend)
