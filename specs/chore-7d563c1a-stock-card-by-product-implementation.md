# Chore: Implement Stock Card By Product View with Mandatory Filters and Transaction History

## Metadata
adw_id: `7d563c1a`
prompt: `Implement Stock Card By Product view according to specs/wireframe-stock-card-by-product-transaction-view.md - includes mandatory filters (Date Range, Product, Store with 2-char validation and orange borders), optional filters (Notes search, Transaction Type dropdown), transaction history table with color-coded badges, pagination, CSV export, and mobile responsive card layout`

## Chore Description

Implement a complete Stock Card "By Product" view that displays transaction history for a specific product at a specific store. The implementation follows the wireframe specification document and transforms the current By Product view from a placeholder to a fully functional transaction history interface.

**Key Features:**
1. **Mandatory Filters** with visual validation (orange borders when incomplete):
   - Date Range picker (From/To dates required)
   - Product search (Product ID or Product Name, minimum 2 characters)
   - Store search (Store ID or Store Name, minimum 2 characters)

2. **Optional Filters** for data refinement:
   - Transaction Type dropdown (8 types mapped to 3 simplified display types)
   - Notes search with debouncing (searches notes, references, person names)

3. **Transaction History Table** with rich formatting:
   - Color-coded transaction type badges with icons
   - Signed quantities (+/- with semantic colors)
   - Running balance display
   - Person names and notes with order reference links
   - Responsive mobile card layout

4. **Pagination & Export**:
   - Configurable page sizes (10/25/50/100)
   - CSV export with comprehensive transaction data
   - Record count indicators

**Current State:**
The By Product view currently exists in `/app/inventory-new/stores/page.tsx` with basic filter structure and mock data integration. The foundation is in place with:
- Tab toggle between By Product and By Store views
- Date range, Product, and Store filter inputs with orange border validation
- Transaction type and notes search filters
- Mock data generation via `generateMockProductTransactions()`
- CSV export handler using `exportStockCardToCSV()`
- Basic transaction table with simplified type mapping

**What Needs to be Done:**
While the structure is present, this chore requires verifying and completing the implementation to ensure it fully matches the wireframe specification, particularly:
- Verify all mandatory filter validation logic
- Ensure transaction table displays all required columns correctly
- Confirm mobile responsive card layout implementation
- Test pagination functionality
- Validate CSV export format matches spec
- Ensure empty states display correctly

## Relevant Files

**Core Implementation Files:**
- **`/app/inventory-new/stores/page.tsx`** (Primary file - 1300 lines)
  - Contains the Stock Card page with dual-tab view (By Product / By Store)
  - Implements mandatory filter validation with orange border visual feedback
  - Transaction history table with color-coded badges and pagination
  - Mobile responsive card layout
  - CSV export functionality
  - **Status**: Implementation largely complete, needs verification and potential refinements

**Data & Utility Files:**
- **`/src/lib/stock-card-mock-data.ts`** (429 lines)
  - Provides `ProductTransaction` interface definition
  - Exports transaction type definitions (`ProductTransactionType`)
  - `generateMockProductTransactions()` function for mock data generation
  - Filter utilities: `filterTransactionsByType()`, `filterTransactionsByNotes()`
  - Store data constants (`STORE_DATA`)
  - **Status**: Complete and working

- **`/src/lib/stock-card-export.ts`** (133 lines)
  - `exportStockCardToCSV()` function for CSV file generation
  - Transaction type label mapping
  - CSV formatting and escaping utilities
  - Filename generation with product ID and date
  - **Status**: Complete and working

**Specification Reference:**
- **`/specs/wireframe-stock-card-by-product-transaction-view.md`**
  - Detailed wireframe specification with all requirements
  - Component specifications for filters, table, pagination
  - Empty state definitions
  - Mobile responsive design requirements
  - CSV export format specification

**UI Component Dependencies:**
- `/src/components/ui/card.tsx` - Card components
- `/src/components/ui/badge.tsx` - Badge components for transaction types
- `/src/components/ui/button.tsx` - Buttons for actions
- `/src/components/ui/input.tsx` - Search input fields
- `/src/components/ui/select.tsx` - Dropdown selects
- `/src/components/ui/table.tsx` - Table components
- `/src/components/ui/calendar.tsx` - Date picker calendar
- `/src/components/ui/popover.tsx` - Popover for date pickers
- `/src/components/ui/tooltip.tsx` - Tooltips for truncated content
- `/src/components/ui/tabs.tsx` - Tab toggle between views

## Step by Step Tasks

### 1. Review Current Implementation Against Wireframe Spec
- Read `/app/inventory-new/stores/page.tsx` focusing on By Product view section (lines 840-1296)
- Compare implementation against wireframe spec requirements
- Create a checklist of features implemented vs. missing
- Document any deviations from specification

### 2. Verify Mandatory Filter Validation Logic
- Confirm date range validation (`hasValidDateRange`) works correctly
- Verify Product search validation (`hasValidProductCriteria`) enforces 2-character minimum
- Verify Store search validation (`hasValidByProductStoreCriteria`) enforces 2-character minimum
- Test orange border visual feedback on incomplete filters (`border-orange-400 ring-1 ring-orange-400`)
- Ensure `hasAllMandatoryFiltersForProduct` correctly gates data loading

### 3. Validate Transaction History Table Implementation
- Verify all 5 table columns render correctly:
  - Date & Time (w-[200px], formatted with `formatTransactionDateTime()`)
  - Transaction Type (w-[140px], badges with icons)
  - Quantity (w-[100px], right-aligned, signed with colors)
  - Balance (w-[100px], right-aligned)
  - Notes (flex width, truncated with tooltips)
- Confirm simplified transaction type mapping (7 types → 3 display types):
  - RECEIPT_IN/TRANSFER_IN/RETURN → Stock In (green, ArrowUp icon)
  - ISSUE_OUT/TRANSFER_OUT → Stock Out (red, ArrowDown icon)
  - ADJUSTMENT_PLUS/ADJUSTMENT_MINUS → Adjustment (cyan, RefreshCw icon)
- Test order reference link extraction and rendering from notes (ORD-XXXXX format)
- Verify tooltip shows full notes content for truncated text
- Confirm alternating row background colors (`bg-muted/30` on odd rows)

### 4. Test Mobile Responsive Card Layout
- Verify card layout switches at `md` breakpoint (< 768px)
- Confirm mobile card structure matches wireframe:
  - Badge and date/time in header
  - Quantity and Balance in two-column grid
  - Notes section with border-top separator
  - Person name formatting and order reference links work in mobile view
- Test touch interaction and scrolling on mobile viewport

### 5. Validate Pagination Functionality
- Confirm page size selector works (10/25/50/100 options, default 25)
- Test Previous/Next navigation buttons
- Verify "Showing X-Y of Z records" count displays correctly
- Ensure pagination resets to page 1 when filters change
- Test pagination hides when total pages <= 1
- Verify `paginatedTransactions` useMemo correctly slices data

### 6. Verify CSV Export Functionality
- Test CSV export button enabled/disabled states
- Confirm export only triggers when `hasAllMandatoryFiltersForProduct` is true
- Verify filename format: `stock-card-{ProductID}-{YYYYMMDD}.csv`
- Check CSV includes metadata header comments (product info, date range)
- Validate CSV column headers match spec:
  - Date & Time, Transaction Type, Quantity, Balance, Reference No, Notes
- Confirm transaction data exports correctly with proper formatting
- Test CSV downloads successfully in browser

### 7. Test Optional Filters Behavior
- Verify Transaction Type dropdown filters data correctly (all 8 types + "all")
- Test Notes search filter with debouncing (400ms)
- Confirm notes search searches across: notes text, reference IDs, person names
- Ensure optional filters work independently and in combination
- Verify filters apply on top of mandatory filters

### 8. Validate Empty States
- Test "No mandatory filters selected" empty state:
  - Shows Package icon (h-16 w-16) with correct message
  - Displays when `!hasAllMandatoryFiltersForProduct`
  - Shows helpful subtitle about 2-character requirement
- Test "No transactions found" empty state:
  - Shows ClipboardList icon (h-16 w-16)
  - Displays when filters are set but no data matches
  - Shows helpful message to adjust filters

### 9. Test Clear All and Refresh Buttons
- Verify Clear All button functionality:
  - Resets all mandatory filters (date range, product, store)
  - Resets optional filters (transaction type, notes search)
  - Clears transaction data
  - Button disabled when all filters already at default
  - Includes `hover:bg-gray-100` hover effect per UI standards
- Test Refresh button:
  - Reloads transaction data with current filters
  - Shows loading spinner during refresh
  - Disabled when mandatory filters incomplete or loading
  - Works correctly with debounced notes search

### 10. Verify Loading States and Error Handling
- Test loading skeleton/spinner displays during data fetch
- Verify `productViewLoading` state controls loading UI
- Confirm loading doesn't block user interaction with filters
- Test error scenarios (though current implementation uses mock data)
- Ensure graceful degradation if mock data generation fails

### 11. Cross-Browser and Accessibility Testing
- Test in Chrome, Firefox, Safari (if available)
- Verify keyboard navigation works for all interactive elements
- Test screen reader compatibility for badges, tooltips, and table
- Confirm color contrast meets accessibility standards for badges
- Validate focus states visible for all interactive elements

### 12. Performance Optimization Review
- Verify all expensive computations use `useMemo`:
  - `paginatedTransactions` calculation
  - Filter validation booleans
- Confirm debouncing implemented for notes search (400ms)
- Check for unnecessary re-renders during typing
- Validate table renders efficiently with pagination

### 13. Documentation and Code Quality
- Ensure code comments explain complex logic
- Verify TypeScript types are properly used (no `any` types)
- Confirm consistent code formatting and naming conventions
- Update CLAUDE.md if new patterns or standards emerge from implementation
- Add inline documentation for business logic (especially filter validation)

### 14. Final Integration Testing
- Test tab switching between By Product and By Store views
  - Verify state isolation between tabs
  - Confirm each tab maintains its own filter state
- Test workflow from start to finish:
  1. Select mandatory filters (date range, product, store)
  2. Apply optional filters (transaction type, notes)
  3. Browse paginated results
  4. Export to CSV
  5. Clear filters and repeat
- Verify no console errors or warnings
- Check network requests (though using mock data)
- Confirm smooth transitions and animations

## Validation Commands

Execute these commands to validate the chore is complete:

### Build Validation
```bash
pnpm build
```
**Expected**: Build completes without TypeScript errors, ESLint warnings, or build failures. Specifically check for no errors in `/app/inventory-new/stores/page.tsx`.

### Development Server Test
```bash
pnpm dev
```
**Expected**: Server starts successfully, navigate to `http://localhost:3000/inventory-new/stores`, verify By Product view loads without console errors.

### TypeScript Type Check
```bash
pnpm tsc --noEmit
```
**Expected**: No type errors, especially in stock card related files.

### Lint Check
```bash
pnpm lint
```
**Expected**: No ESLint errors or warnings in modified files.

### Manual Testing Checklist
Navigate to: `http://localhost:3000/inventory-new/stores`

1. **Tab Toggle**:
   - [ ] By Product tab is default active tab
   - [ ] Can switch to By Store tab and back
   - [ ] Tab content changes correctly

2. **Mandatory Filters**:
   - [ ] Date range shows orange border when empty
   - [ ] Product search shows orange border when < 2 characters
   - [ ] Store search shows orange border when < 2 characters
   - [ ] Orange borders disappear when criteria met
   - [ ] Empty state shows when filters incomplete

3. **Data Loading**:
   - [ ] Transactions load after all mandatory filters satisfied
   - [ ] Loading spinner appears during data fetch
   - [ ] Transaction count displays correctly

4. **Transaction Table**:
   - [ ] All 5 columns display correctly
   - [ ] Transaction types show correct badges and icons
   - [ ] Quantities show +/- signs with correct colors
   - [ ] Balance displays correctly
   - [ ] Notes truncate with tooltips
   - [ ] Order references are clickable links
   - [ ] Alternating row backgrounds work

5. **Optional Filters**:
   - [ ] Transaction type dropdown filters correctly
   - [ ] Notes search filters with debouncing
   - [ ] Can use filters in combination

6. **Pagination**:
   - [ ] Page size selector works (10/25/50/100)
   - [ ] Previous/Next buttons work correctly
   - [ ] Record count shows correct range
   - [ ] Pagination resets when filters change

7. **Actions**:
   - [ ] Refresh button reloads data
   - [ ] Clear All resets all filters
   - [ ] Export CSV downloads file with correct format

8. **Mobile Responsive** (resize browser to < 768px):
   - [ ] Table switches to card layout
   - [ ] Cards display all information correctly
   - [ ] Touch interactions work smoothly

9. **Empty States**:
   - [ ] No filters shows correct empty state
   - [ ] No results shows correct empty state

10. **Console Check**:
    - [ ] No errors in browser console
    - [ ] No warnings in browser console

### File Verification
```bash
# Verify core files exist and have expected structure
ls -la /app/inventory-new/stores/page.tsx
ls -la /src/lib/stock-card-mock-data.ts
ls -la /src/lib/stock-card-export.ts
ls -la /specs/wireframe-stock-card-by-product-transaction-view.md
```
**Expected**: All files exist with appropriate sizes (page.tsx ~1300 lines, mock-data.ts ~429 lines, export.ts ~133 lines)

### Code Quality Check
```bash
# Check for any TODO or FIXME comments in stock card files
grep -n "TODO\|FIXME" app/inventory-new/stores/page.tsx src/lib/stock-card-*.ts
```
**Expected**: No unresolved TODOs or FIXMEs related to this chore

## Notes

### Implementation Status
Based on the code review, the Stock Card By Product view implementation appears to be **largely complete** with all major features in place:

✅ **Completed Features:**
- Mandatory filters with orange border validation
- Date range pickers with Calendar component
- Product and Store search inputs with 2-char validation
- Transaction type dropdown filter
- Notes search with debouncing
- Transaction history table with all columns
- Simplified transaction type mapping (7→3 types)
- Color-coded badges with icons
- Order reference link extraction and rendering
- Mobile responsive card layout
- Pagination with configurable page sizes
- CSV export functionality
- Clear All and Refresh buttons
- Empty states for both scenarios
- Loading states with spinner

### Key Design Decisions Already Implemented

1. **Filter Validation**: Uses derived state booleans (`hasValidProductCriteria`, `hasValidByProductStoreCriteria`, `hasValidDateRange`) to control orange border visual feedback and data loading gates.

2. **Transaction Type Mapping**: Implements two-layer type system:
   - 7 detailed types (`ProductTransactionType`) for filtering
   - 3 simplified types for display (Stock In/Out/Adjustment) via `TRANSACTION_TYPE_MAPPING`

3. **Debouncing**: Notes search uses `notesDebounceRef` with 400ms delay to prevent excessive filtering during typing.

4. **Pagination**: Client-side pagination via `paginatedTransactions` useMemo, automatically resets to page 1 when filter state changes.

5. **Mobile Responsiveness**: Uses Tailwind `hidden md:block` for table, `md:hidden` for cards to switch layouts at 768px breakpoint.

6. **CSV Export**: Leverages existing `exportStockCardToCSV()` utility with metadata headers and proper field escaping.

### Potential Enhancements (Future Considerations)

While not required for this chore, consider these potential improvements:

- **Real API Integration**: Replace mock data with actual backend calls when API endpoints available
- **Persistent Filter State**: Store filter state in URL parameters for shareability (similar to Order Management Hub pattern)
- **Advanced Sorting**: Add column sorting to transaction table
- **Date Range Presets**: Quick selection buttons (Today, Last 7 Days, Last 30 Days)
- **Bulk Export**: Option to export all transactions regardless of pagination
- **Print Layout**: Optimize table for printing/PDF generation
- **Transaction Details Modal**: Click row to see full transaction details
- **Performance Metrics**: Add instrumentation for filter performance monitoring

### Testing Recommendations

1. **Focus Testing Areas**:
   - Mandatory filter validation edge cases (exactly 2 characters, special characters)
   - Date range boundary conditions (same day, year boundaries)
   - Pagination with different data volumes (< 10 items, > 100 items)
   - Mobile layout at various breakpoints (tablets, small phones)
   - CSV export with special characters in notes (commas, quotes, newlines)

2. **Cross-Browser Priority**: Chrome/Edge (primary), Safari (mobile), Firefox (secondary)

3. **Accessibility**: Use keyboard-only navigation and screen reader to verify all interactive elements accessible

### Success Criteria

This chore is considered **complete** when:

1. ✅ All mandatory filters enforce 2-character minimum with orange visual feedback
2. ✅ Transaction table displays all columns with correct formatting and colors
3. ✅ Mobile card layout renders correctly below md breakpoint
4. ✅ Pagination works correctly with all page sizes
5. ✅ CSV export generates valid file with correct format
6. ✅ Optional filters (type, notes) refine results correctly
7. ✅ Empty states show appropriate messages
8. ✅ Clear All and Refresh buttons work as expected
9. ✅ No console errors or TypeScript warnings
10. ✅ Build completes successfully with `pnpm build`

### Related Specifications

- **Parent Spec**: `/specs/wireframe-stock-card-by-product-transaction-view.md`
- **Related Features**:
  - Stock Card By Store view (separate tab, no changes required)
  - Recent Transactions table in Product Detail page (similar UI patterns)
- **UI Consistency Standards**: See `CLAUDE.md` section "UI Consistency Standards" for:
  - Search/Filter input widths (`min-w-[160px]`)
  - Empty state icon sizes (`h-16 w-16` for card-level)
  - Clear All button styling (`hover:bg-gray-100`)
  - Dropdown filter widths
