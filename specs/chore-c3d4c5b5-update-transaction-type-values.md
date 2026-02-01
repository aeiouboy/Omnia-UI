# Chore: Update Transaction Type Values Across Codebase

## Metadata
adw_id: `c3d4c5b5`
prompt: `Analyze and plan updates for Transaction Type values across all related files. The transaction types should be: Initial sync, Adjust In, Adjust out, Replacement, Order Ship. Find all files that define, use, or display transaction types and create a comprehensive plan to update them consistently.`

## Chore Description
This chore updates all transaction type values across the inventory management system to use new standardized values: "Initial sync", "Adjust In", "Adjust out", "Replacement", and "Order Ship". The current system uses technical values like "stock_in", "stock_out", "adjustment", "return", "transfer", and "allocation". This change requires updating type definitions, mock data generators, UI components, display labels, filtering logic, export utilities, and all related documentation to maintain consistency throughout the application.

## Relevant Files
Use these files to complete the chore:

### Core Type Definitions
- **src/types/inventory.ts** (lines 383-469) - Defines `TransactionType` type and `StockTransaction` interface. This is the source of truth for transaction types used throughout the inventory system. Currently defines 6 types: `stock_in`, `stock_out`, `adjustment`, `return`, `transfer`, `allocation`.

- **src/types/atc-config.ts** - Contains ATC configuration types. References `ReplacementRule` interface and replacement-related terminology that may need alignment with new "Replacement" transaction type.

### UI Components
- **src/components/inventory/transaction-history-section.tsx** (lines 96-142) - Transaction History Section component with `transactionTypeConfig` object mapping transaction types to icons, badge classes, labels, and quantity signs. Displays transaction type badges, handles filtering by type, and exports transaction data. SelectItem values for filter dropdown need updating.

- **src/components/recent-transactions-table.tsx** - Recent Transactions Table component likely displays transaction types in a table format. Needs review for transaction type display logic and filtering.

### Mock Data & Services
- **src/lib/mock-inventory-data.ts** (line 2679+) - Contains `generateMockTransactions()` function that generates mock transaction data. Uses TransactionType from inventory types. Includes `generateTransactionNotes()` function (line 2907) with notes mapped by transaction type. Transaction type filtering logic at line 2991+.

- **src/lib/stock-card-mock-data.ts** (lines 10-17) - Defines separate `ProductTransactionType` type with values: `RECEIPT_IN`, `ISSUE_OUT`, `TRANSFER_IN`, `TRANSFER_OUT`, `ADJUSTMENT_PLUS`, `ADJUSTMENT_MINUS`, `RETURN`. Has different transaction type semantics than inventory types. May need alignment or clarification.

- **src/lib/inventory-service.ts** - Inventory service layer that fetches transaction history. May contain transaction type filtering or transformation logic.

- **src/lib/stock-card-export.ts** - Stock card export utilities that may format transaction types for CSV/Excel export.

### Export Utilities
- **src/lib/export-utils.ts** - Contains `exportTransactionsToCSV()` and `exportTransactionsToExcel()` functions. These format transaction data for export and likely include transaction type labels.

### Specifications & Documentation
- **specs/chore-689ab0e3-transaction-history-table-redesign.md** - Transaction History Table redesign spec. May document transaction type display requirements.

- **specs/chore-18db0b79-transaction-history-section.md** - Transaction History Section spec. Likely describes transaction type handling.

- **specs/chore-19af25ea-update-transaction-table-ui.md** - Update Transaction Table UI spec.

- **specs/chore-3a92834f-add-transaction-filtering-clickable-orders.md** - Add transaction filtering and clickable orders spec.

- **docs/inventory-terminology-standards.md** - Inventory terminology standards documentation. Should be updated to reflect new transaction type terminology.

- **CLAUDE.md** - Project instructions for Claude Code. Should document the new transaction type values for future reference.

### New Files

#### specs/transaction-type-migration-guide.md
Create a migration guide documenting:
- Mapping of old values to new values
- Component-by-component changes
- Testing checklist
- Backwards compatibility considerations

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Analyze Current Transaction Type Usage
- Read `src/types/inventory.ts` to understand current TransactionType definition
- Read `src/lib/stock-card-mock-data.ts` to understand ProductTransactionType definition
- Determine if these are separate type systems or should be unified
- Document the mapping from old values to new values:
  - stock_in → Initial sync
  - stock_out → Order Ship
  - adjustment (positive) → Adjust In
  - adjustment (negative) → Adjust out
  - allocation → Replacement (or determine correct mapping)
  - return → (determine if this maps to new types)
  - transfer → (determine if this maps to new types)

### 2. Update Core Type Definitions
- Update `TransactionType` in `src/types/inventory.ts` (line 396) to use new values
- Update the type from union of strings to reflect new transaction types:
  ```typescript
  export type TransactionType = "Initial sync" | "Adjust In" | "Adjust out" | "Replacement" | "Order Ship"
  ```
- Update JSDoc comments (lines 383-395) to document the new transaction types with their meanings
- Review `StockTransaction` interface (lines 419-468) for any hardcoded type references
- Update transaction impact documentation in comments to reflect new type semantics

### 3. Update ProductTransactionType Alignment
- Review `src/lib/stock-card-mock-data.ts` ProductTransactionType definition
- Determine if ProductTransactionType should be unified with TransactionType or kept separate
- If separate, add clear documentation explaining the distinction
- If unified, refactor to use the same TransactionType from inventory.ts
- Update REFERENCE_PREFIXES mapping (lines 62-70) to match new transaction types

### 4. Update Transaction History Section UI Component
- Update `transactionTypeConfig` in `src/components/inventory/transaction-history-section.tsx` (lines 96-142)
- Replace old type keys with new type values maintaining icon and badge associations:
  ```typescript
  const transactionTypeConfig: Record<TransactionType, {...}> = {
    "Initial sync": { icon: <ArrowUp .../>, badgeClass: "bg-green-100...", label: "Initial sync", quantitySign: "+" },
    "Order Ship": { icon: <ArrowDown .../>, badgeClass: "bg-red-100...", label: "Order Ship", quantitySign: "-" },
    "Adjust In": { icon: <RefreshCw .../>, badgeClass: "bg-blue-100...", label: "Adjust In", quantitySign: "+" },
    "Adjust out": { icon: <RefreshCw .../>, badgeClass: "bg-blue-100...", label: "Adjust out", quantitySign: "-" },
    "Replacement": { icon: <ArrowLeftRight .../>, badgeClass: "bg-purple-100...", label: "Replacement", quantitySign: "+/-" },
  }
  ```
- Update SelectItem values in transaction type filter dropdown (lines 434-441)
- Update quantity display logic in `getQuantityDisplay()` function (lines 144-167) to handle new types
- Update reference ID rendering logic in `renderReferenceId()` (lines 290-312) for new type contexts

### 5. Update Mock Data Generation
- Update `generateMockTransactions()` in `src/lib/mock-inventory-data.ts` (line 2679+)
- Update transaction type determination logic (line 2731+) to generate new transaction types
- Update reference ID generation logic (line 2832+) to use appropriate prefixes for new types:
  - "Initial sync" → "SYNC-" prefix
  - "Adjust In" → "ADJ-IN-" prefix
  - "Adjust out" → "ADJ-OUT-" prefix
  - "Replacement" → "REP-" prefix
  - "Order Ship" → "ORD-" prefix
- Update `generateTransactionNotes()` function (line 2907+) with notes array for each new type
- Update transaction type filter logic (line 2991+) to handle new type values

### 6. Update Recent Transactions Table Component
- Review `src/components/recent-transactions-table.tsx` for transaction type display
- Update any transaction type filtering, sorting, or display logic to use new values
- Update any badges, labels, or icons that reference transaction types
- Ensure consistency with transaction-history-section.tsx styling

### 7. Update Export Utilities
- Review `src/lib/export-utils.ts` for transaction type formatting in exports
- Update CSV column headers and data formatting to use new transaction type labels
- Update Excel formatting to use new transaction type values
- Test that exported data shows readable transaction type names

### 8. Update Stock Card Export
- Review `src/lib/stock-card-export.ts` for transaction type export logic
- Align export formatting with main export-utils.ts approach
- Ensure consistency across all export formats

### 9. Update Inventory Service Layer
- Review `src/lib/inventory-service.ts` for transaction type filtering or transformation
- Update any type guards, validators, or filters to recognize new transaction type values
- Update fetchTransactionHistory function parameter types if needed

### 10. Update Documentation and Standards
- Update `docs/inventory-terminology-standards.md` to document new transaction types
- Add section explaining each transaction type's business meaning:
  - "Initial sync" - Initial inventory synchronization from source system
  - "Adjust In" - Positive inventory adjustment (increase stock)
  - "Adjust out" - Negative inventory adjustment (decrease stock)
  - "Replacement" - Stock replacement or substitution transaction
  - "Order Ship" - Inventory deduction when order ships
- Update `CLAUDE.md` with new transaction type values in relevant sections
- Create `specs/transaction-type-migration-guide.md` documenting the change

### 11. Update Related Specifications
- Review and update `specs/chore-689ab0e3-transaction-history-table-redesign.md`
- Review and update `specs/chore-18db0b79-transaction-history-section.md`
- Review and update `specs/chore-19af25ea-update-transaction-table-ui.md`
- Review and update `specs/chore-3a92834f-add-transaction-filtering-clickable-orders.md`
- Add notes about transaction type changes in each relevant spec

### 12. Search and Update Any Remaining References
- Use grep/ripgrep to find any remaining hardcoded transaction type values
- Search for patterns: `"stock_in"`, `"stock_out"`, `"adjustment"`, `"return"`, `"transfer"`, `"allocation"`
- Update test files if any exist that reference transaction types
- Update any markdown documentation with examples using old transaction types

### 13. TypeScript Compilation and Type Validation
- Run `npm run build` to check for TypeScript compilation errors
- Fix any type mismatches or missing type updates
- Ensure all components importing TransactionType compile successfully
- Verify no type assertion workarounds are needed

### 14. Visual and Functional Testing
- Start development server with `npm run dev`
- Navigate to inventory transaction history section
- Test transaction type filter dropdown shows new values
- Verify transaction history table displays new type badges correctly
- Test CSV export contains new transaction type labels
- Test Excel export contains new transaction type values
- Verify no console errors or warnings related to transaction types
- Test filtering by each new transaction type

## Validation Commands
Execute these commands to validate the chore is complete:

- `npm run build` - Verify TypeScript compilation succeeds with no errors
- `npm run lint` - Check for linting errors related to changes
- `grep -r "stock_in\|stock_out\|adjustment\|allocation" src/ --include="*.ts" --include="*.tsx" | grep -v "node_modules" | grep -v "\.next"` - Confirm no old transaction type values remain in source code (excluding comments/docs)
- `npm run dev` - Start development server and manually verify:
  - Transaction History Section displays new transaction types
  - Filter dropdown shows new transaction type options
  - Export functionality (CSV/Excel) uses new labels
  - Mock data generates transactions with new types
  - No console errors related to transaction types

## Notes
- **Case Sensitivity**: Note that "Adjust out" uses lowercase 'o' while "Adjust In" uses uppercase 'I'. Maintain this exact casing throughout the implementation.
- **Type Safety**: This change affects type definitions, so TypeScript will catch many issues during compilation. Pay attention to type errors.
- **Backward Compatibility**: This is a breaking change if any external systems or stored data reference the old transaction type values. Consider if a migration or compatibility layer is needed.
- **Mock Data**: Existing mock data may need regeneration or transformation to use new transaction types.
- **Testing**: Focus testing on transaction filtering, display, and export functionality as these are most impacted.
- **ProductTransactionType Divergence**: The stock-card-mock-data.ts file uses a different transaction type system (RECEIPT_IN, ISSUE_OUT, etc.). Clarify if this should be unified or remain separate for different contexts (stock card vs. inventory).
- **Icon and Color Consistency**: When mapping old types to new types, preserve the existing icon and color associations to maintain visual consistency unless specified otherwise.
