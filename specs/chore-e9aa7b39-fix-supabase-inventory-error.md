# Chore: Fix Supabase Query Error in Inventory Detail Page

## Metadata
adw_id: `e9aa7b39`
prompt: `Fix Supabase query error in inventory detail page:

1. Fix error in src/lib/inventory-service.ts fetchInventoryItemById function
2. Add proper error handling for Supabase queries
3. Implement fallback to mock data when Supabase fails:
   - If Supabase query fails, use mock inventory data
   - Find product by ID from mock data
   - Return proper data structure
4. Update inventory-service.ts functions to handle errors:
   - fetchInventoryData() - fallback to mock data
   - fetchInventorySummary() - calculate from mock data
   - fetchInventoryItemById() - return mock item by ID
5. Check if Supabase client is available before querying
6. Use environment variable to detect if Supabase is configured
7. No console errors when Supabase is not configured
8. Ensure app/inventory/[id]/page.tsx works with mock data
9. Test detail page loads without errors
10. User should see product details even without Supabase

The inventory system should work seamlessly with or without Supabase.`

## Chore Description

The inventory detail page is experiencing Supabase query errors when attempting to load individual product details. The current implementation in `src/lib/inventory-service.ts` doesn't properly handle scenarios where Supabase is not configured or when database queries fail. This chore implements comprehensive error handling and fallback mechanisms to ensure the inventory system works seamlessly with or without Supabase configuration.

**Current Issues:**
- `fetchInventoryItemById()` fails when Supabase credentials are missing
- Error messages are logged to console even when fallback is expected behavior
- No graceful degradation when database is unavailable
- Inconsistent error handling across inventory service functions

**Expected Outcome:**
- All inventory pages load successfully with or without Supabase
- No console errors when using mock data fallback
- Seamless user experience regardless of backend configuration
- Proper data structure returned from both database and mock data sources

## Relevant Files

Use these files to complete the chore:

- **`src/lib/inventory-service.ts`** - Main inventory service layer where the error occurs. Contains all data fetching functions that need error handling improvements:
  - `fetchInventoryItemById()` - Primary function with the query error
  - `fetchInventoryData()` - Already has fallback logic but may need refinement
  - `fetchInventorySummary()` - Depends on fetchInventoryData, needs verification
  - `fetchStockHistory()` - Mock data only, needs consistent error handling
  - `fetchRecentTransactions()` - Mock data only, needs consistent error handling
  - `isSupabaseAvailable()` - Helper function for checking Supabase configuration

- **`src/lib/supabase.ts`** - Supabase client configuration with mock client fallback. Provides the `supabase` client that can be `null` or a mock client when credentials are missing. Need to understand how this affects query behavior.

- **`src/lib/mock-inventory-data.ts`** - Mock data source containing:
  - `mockInventoryItems[]` - 24 realistic inventory items across all categories
  - `generateMockStockHistory()` - Generator for stock history data
  - `generateMockTransactions()` - Generator for transaction history
  - Used as fallback when Supabase is unavailable

- **`app/inventory/[id]/page.tsx`** - Dynamic route page that calls the failing functions. This is the entry point that triggers the error. Calls:
  - `fetchInventoryItemById(id)` - Main data fetch
  - `fetchStockHistory(item.id)` - Secondary data
  - `fetchRecentTransactions(item.id, 10)` - Secondary data

- **`src/types/inventory.ts`** - Type definitions for inventory domain. Ensures type consistency between database schema (`InventoryItemDB`) and application format (`InventoryItem`).

### New Files

No new files need to be created. All changes will be made to existing service layer.

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

### 1. Analyze Current Error in fetchInventoryItemById

- Read `src/lib/inventory-service.ts` focusing on lines 350-380 (fetchInventoryItemById function)
- Identify the exact Supabase query that's failing
- Check if the `.or()` query method is being called correctly
- Verify if the `.single()` method handles errors properly
- Document the current error handling pattern vs. successful patterns in other functions

### 2. Improve isSupabaseAvailable Check

- Review current `isSupabaseAvailable()` implementation at line 33-35
- Enhance to check if `supabase` is not null AND has proper client methods
- Add validation to ensure the client is functional, not just present
- Consider checking for mock client vs. real client distinction
- Update the function to handle edge cases (undefined, null, mock client)

### 3. Fix fetchInventoryItemById Error Handling

- Update `fetchInventoryItemById()` function (lines 350-380) with proper try-catch structure
- Improve Supabase availability check before querying
- Fix the `.or()` query syntax - ensure it matches working patterns from `fetchInventoryData()`
- Handle PGRST116 (not found) error code separately from other errors
- Change error logging from `console.error` to `console.warn` for expected fallback scenarios
- Add explicit fallback to mock data with proper item lookup by ID or productId
- Return null only when item is not found in both database AND mock data
- Ensure proper data structure conversion using `convertDBItemToInventoryItem()`

### 4. Refine Error Handling in fetchInventoryData

- Review `fetchInventoryData()` function (lines 146-222)
- Verify try-catch properly wraps all Supabase operations
- Ensure consistent error messaging (use `console.warn` not `console.error` for fallback)
- Confirm mock data fallback applies correct filters
- Validate pagination logic works correctly for both data sources
- Test that empty results return proper structure with zero items, not null

### 5. Update fetchInventorySummary Error Handling

- Review `fetchInventorySummary()` function (lines 328-342)
- Since it depends on `fetchInventoryData()`, verify it handles empty/error responses
- Add explicit try-catch around the data aggregation logic
- Ensure calculations don't fail on empty datasets
- Return sensible defaults (zeros) if no data is available
- Add fallback to direct mock data calculations if fetchInventoryData fails

### 6. Improve Console Logging Strategy

- Review all `console.error()` calls in inventory-service.ts
- Replace `console.error()` with `console.warn()` for expected fallback scenarios
- Use `console.error()` only for truly unexpected failures
- Add `console.info()` messages to indicate when using mock data intentionally
- Ensure no error-level logs appear during normal operation with mock data
- Follow the pattern from `fetchStorePerformance()` (line 236) which uses `console.info()`

### 7. Test Supabase Configuration Detection

- Test the application with Supabase environment variables UNSET
- Verify `isSupabaseAvailable()` returns false
- Confirm no Supabase queries are attempted
- Validate mock data is used immediately without query attempts
- Check that no error messages appear in console

### 8. Test Database Query Fallback Scenarios

- Test the application with INVALID Supabase credentials (simulated query failures)
- Verify queries fail gracefully and fall back to mock data
- Confirm appropriate warning messages appear in console
- Validate that user sees no difference in functionality
- Test all inventory service functions handle failures consistently

### 9. Verify Inventory Detail Page Functionality

- Navigate to `/inventory` page and verify it loads
- Click on a product card to navigate to `/inventory/[id]` detail page
- Confirm product details load without errors
- Verify stock history chart displays correctly
- Confirm recent transactions table shows data
- Test with multiple different product IDs from mock data
- Verify "not found" behavior for invalid IDs (should return 404)

### 10. Test Complete User Workflow

- Test full workflow: Inventory list → Detail view → Back navigation
- Apply filters on inventory list, verify detail pages still work
- Test direct URL access to detail pages (e.g., `/inventory/INV-001`)
- Verify all data displays correctly: images, stats, charts, tables
- Confirm responsive design works on different screen sizes
- Test with browser console open to verify no error messages

### 11. Code Quality Review

- Ensure all functions have consistent error handling patterns
- Verify TypeScript types are correct (no `any` types)
- Confirm all Promises are properly awaited
- Check that async/await error handling is consistent
- Validate code follows the existing patterns in escalation-service.ts
- Ensure code comments accurately describe the behavior

## Validation Commands

Execute these commands to validate the chore is complete:

### TypeScript Compilation Check
```bash
npm run build
```
- Validates: No TypeScript errors in inventory-service.ts or related files

### Development Server Test
```bash
npm run dev
```
- Then navigate to:
  - `http://localhost:3000/inventory` - List page should load
  - `http://localhost:3000/inventory/INV-001` - Detail page should load
  - `http://localhost:3000/inventory/PROD-001` - Detail page by product ID should load
  - `http://localhost:3000/inventory/INVALID` - Should show 404
- Validates: All pages load without console errors

### Console Log Verification
With development server running and browser console open:
```bash
# Open browser DevTools console (F12)
# Navigate through inventory pages
# Verify:
# - No error-level messages (red) appear
# - Only info-level messages about mock data (blue) appear when Supabase is not configured
# - Warning messages (yellow) only appear for database fallback scenarios
```

### Environment Variable Test
```bash
# Test without Supabase credentials
unset NEXT_PUBLIC_SUPABASE_URL
unset NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
# Navigate to inventory pages - should work with mock data, no errors
```

### Mock Data Fallback Test
```bash
# Test with invalid Supabase credentials to force fallback
export NEXT_PUBLIC_SUPABASE_URL="https://invalid.supabase.co"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="invalid_key_123"
npm run dev
# Navigate to inventory pages - should gracefully fall back to mock data
```

## Notes

### Design Pattern Consistency

This chore follows the **Dual Data Strategy** pattern established in the codebase:
- **Primary**: Supabase database (when configured)
- **Fallback**: Mock data (always available)

Reference implementation: `src/lib/escalation-service.ts` which demonstrates:
- Proper `isSupabaseAvailable()` checking
- Graceful error handling with try-catch
- Seamless fallback to mock data
- Appropriate console logging levels

### Mock Data Coverage

The mock data in `mock-inventory-data.ts` provides:
- 24 inventory items across 10 categories
- All 8 Tops store locations
- Various stock status levels (healthy, low, critical)
- Realistic product data with prices, suppliers, barcodes

This ensures comprehensive testing without requiring database setup.

### Error Handling Philosophy

Per the existing codebase patterns:
- **Expected behavior** (mock data fallback) → `console.info()` or `console.warn()`
- **Unexpected failure** (actual errors) → `console.error()`
- **User experience** → Should be identical regardless of data source

### Future Enhancements

Not included in this chore, but noted for future work:
- Database schema creation guide for inventory_items table
- Migration scripts for Supabase setup
- Real-time stock updates via WebSocket
- Integration with order system for automatic stock adjustments
- Performance optimization with caching layer

### Testing Strategy

Priority test cases:
1. **No Supabase** - Most common dev scenario, must work perfectly
2. **Invalid credentials** - Must fail gracefully, not crash
3. **Valid database but no data** - Should return empty results, not errors
4. **Mixed scenarios** - Some queries succeed, some fail
5. **Edge cases** - Invalid IDs, null values, malformed data
