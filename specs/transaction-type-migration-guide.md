# Transaction Type Migration Guide

## Overview

This document describes the migration from old technical transaction type values to new display-friendly values across the Omnia-UI inventory management system.

## Migration Summary

| Old Value    | New Value       | Direction | Description                                      |
|--------------|-----------------|-----------|--------------------------------------------------|
| `stock_in`   | `Initial sync`  | +         | Initial inventory sync from source system        |
| `stock_out`  | `Order Ship`    | -         | Inventory deduction when order ships             |
| `adjustment` | `Adjust In`     | +         | Positive inventory adjustment (increase stock)   |
| `adjustment` | `Adjust out`    | -         | Negative inventory adjustment (decrease stock)   |
| `return`     | *(removed)*     | -         | Merged into Replacement                          |
| `transfer`   | *(removed)*     | -         | No longer a separate type                        |
| `allocation` | `Replacement`   | +/-       | Stock replacement or substitution transaction    |

**Note on case sensitivity:** "Adjust In" uses uppercase 'I' while "Adjust out" uses lowercase 'o'. This is intentional and must be preserved.

## Files Changed

### Core Type Definitions
- **src/types/inventory.ts**: Updated `TransactionType` union type and JSDoc documentation

### UI Components
- **src/components/inventory/transaction-history-section.tsx**: Updated `transactionTypeConfig` mapping, filter dropdowns, and reference ID linking logic
- **src/components/recent-transactions-table.tsx**: Updated `TRANSACTION_TYPE_MAPPING`, filter dropdowns, and order link logic

### Mock Data Generation
- **src/lib/mock-inventory-data.ts**: Updated `generateMockTransactions()` and `generateTransactionNotes()` functions

### Export Utilities
- **src/lib/export-utils.ts**: Updated `formatTransactionType()` and quantity sign logic

## Breaking Changes

1. **Type Definition Change**: The `TransactionType` union type now uses different string literals
2. **Removed Types**: `return`, `transfer`, and `allocation` are no longer valid transaction types
3. **Split Types**: Old `adjustment` is now split into `Adjust In` (positive) and `Adjust out` (negative)
4. **Interface Fields**: `transferFrom`, `transferTo`, and `allocationType` fields on `StockTransaction` are no longer used

## Backward Compatibility

This migration does NOT include backward compatibility for stored data. If any external systems or databases reference the old transaction type values, they will need to be migrated separately.

## Reference ID Prefixes

New transaction types use the following reference ID prefixes:
- `Initial sync`: `SYNC-` prefix
- `Adjust In`: `ADJ-` prefix
- `Adjust out`: `ADJ-` prefix
- `Replacement`: `REP-` prefix
- `Order Ship`: `ORD-` prefix

## Testing Checklist

- [ ] Transaction History Section displays new transaction types correctly
- [ ] Filter dropdown shows new transaction type options
- [ ] Filtering by each new transaction type works
- [ ] Transaction badges show correct colors and icons
- [ ] Quantity signs (+/-) display correctly
- [ ] Order reference links work for "Order Ship" transactions
- [ ] CSV export includes new transaction type labels
- [ ] Excel export includes new transaction type values
- [ ] Mock data generates transactions with new types
- [ ] No console errors related to transaction types
- [ ] TypeScript compilation succeeds with no errors

## Icon and Color Mapping

| Transaction Type | Icon            | Badge Color        |
|------------------|-----------------|-------------------|
| Initial sync     | ArrowUp         | Green (bg-green-100) |
| Order Ship       | ArrowDown       | Red (bg-red-100)    |
| Adjust In        | RefreshCw       | Blue (bg-blue-100)  |
| Adjust out       | RefreshCw       | Blue (bg-blue-100)  |
| Replacement      | ArrowLeftRight  | Purple (bg-purple-100) |
