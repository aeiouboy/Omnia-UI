# Chore: Fix Dashboard Page Order Search Functionality

## Metadata
adw_id: `7d8bb1ce`
prompt: `Fix dashboard page order search functionality:

1. Investigate and fix order search errors on the dashboard/home page
2. Check Executive Dashboard component for search-related bugs
3. Ensure search input properly filters orders
4. Fix any API call errors related to order search
5. Test search functionality with various queries
6. Ensure search works with:
   - Order numbers
   - Customer names
   - Phone numbers
   - Email addresses
7. Add proper error handling for failed searches
8. Ensure loading states work correctly during search
9. Fix any TypeScript errors related to search
10. Test that search results update correctly

Debug the current implementation and fix all search-related issues.`

## Chore Description

The dashboard page (Executive Dashboard) currently does NOT have search functionality, which is intentional per the CLAUDE.md documentation. The documentation explicitly states:

> **Executive Dashboard Filter Rules**:
> - **ABSOLUTELY NO FILTERS** in Executive Dashboard
> - No date range picker, no search box, no status filters
> - Always displays full 7-day data for complete business overview
> - All filtering functionality must be in Order Management Hub only

This chore appears to be based on a misunderstanding. The Executive Dashboard at `/` (`app/page.tsx`) is designed to show comprehensive 7-day overview data without any search or filter capabilities. Search functionality is intentionally located in the **Order Management Hub** component instead.

**Current Architecture:**
- **Executive Dashboard** (`src/components/executive-dashboard/index.tsx`) - NO search/filters by design
- **Order Management Hub** (`src/components/order-management-hub.tsx`) - HAS complete search functionality

**If the issue is:**
1. **User expects search on dashboard** → This is a design decision, not a bug. User should use Order Management Hub for searching.
2. **Order Management Hub search is broken** → Need to investigate that component instead
3. **Console errors related to order fetching** → Need to debug API calls and data fetching logic

This plan will investigate the actual issue and provide fixes based on what's discovered.

## Relevant Files

### Investigation Files
- `app/page.tsx` - Main dashboard entry point, renders ExecutiveDashboard
- `src/components/executive-dashboard/index.tsx` - Main Executive Dashboard component (NO search by design)
- `src/components/executive-dashboard/hooks.ts` - Dashboard data hooks and state management
- `src/components/executive-dashboard/data-fetching.ts` - API data fetching logic
- `src/components/order-management-hub.tsx` - Order Management Hub with search functionality
- `app/api/orders/route.ts` - Orders API endpoint
- `app/api/orders/external/route.ts` - External API proxy endpoint

### Error & Console Log Files
- Browser console logs - Check for JavaScript errors
- Network tab - Check for failed API calls

### Configuration Files
- `CLAUDE.md` - Project documentation with explicit "NO FILTERS" rule for Executive Dashboard
- `.env.local` or `.env` - API configuration

### New Files (if needed)
If the requirement is to add search despite design guidelines:
- `src/components/executive-dashboard/search-bar.tsx` - New search component (only if explicitly required)
- Update documentation in `CLAUDE.md` to reflect new design decision

## Step by Step Tasks

### 1. Investigate Current State and Identify Actual Issue
- Run `npm run dev` to start development server
- Open browser to `http://localhost:3000` (Executive Dashboard)
- Open browser console and check for:
  - JavaScript errors related to orders or search
  - Failed API calls in Network tab
  - Any TypeScript compilation errors
- Navigate to Order Management Hub (if it exists in navigation)
- Test search functionality in Order Management Hub
- Document all errors found with screenshots/logs

### 2. Determine Root Cause
Based on investigation findings:

**Option A: If errors are in Executive Dashboard data fetching**
- Review `src/components/executive-dashboard/data-fetching.ts`
- Check API calls in `fetchOrdersWithCache` function
- Verify error handling in `useDashboardData` hook
- Check console for specific error messages

**Option B: If user actually needs search in Executive Dashboard**
- Confirm this design change with stakeholders
- Document the deviation from CLAUDE.md guidelines
- Plan to add search without breaking "overview" nature of dashboard

**Option C: If errors are in Order Management Hub search**
- Review `src/components/order-management-hub.tsx`
- Check `fetchOrdersFromApi` function for search parameter handling
- Verify search term is properly passed to API
- Check filter logic in lines 245-274

### 3. Fix API Call Errors (if any)
- Check `/app/api/orders/route.ts` for proper request handling
- Verify environment variables are set correctly:
  - `API_BASE_URL`
  - `PARTNER_CLIENT_ID`
  - `PARTNER_CLIENT_SECRET`
- Fix authentication issues in `/lib/auth-client.ts` if token errors occur
- Add proper error boundaries for failed API requests
- Implement retry logic for transient failures

### 4. Fix Search Functionality (if adding to Executive Dashboard)
- Create search input component in Executive Dashboard
- Add state management for search term:
  ```typescript
  const [searchTerm, setSearchTerm] = useState("")
  ```
- Implement client-side filtering for orders:
  - Filter by order number (`order_no`)
  - Filter by customer name (`customer.name`)
  - Filter by phone number (`customer.phone`)
  - Filter by email (`customer.email`)
- Add debouncing to prevent excessive filtering (300ms delay)

### 5. Fix Search in Order Management Hub (if that's the issue)
- Review search parameter handling in `fetchOrdersFromApi`
- Ensure `searchTerm` is properly passed to API via query params
- Check that API endpoint `/api/orders/external` handles `search` parameter
- Test with various search queries:
  - Order number: e.g., "ORD-12345"
  - Customer name: e.g., "John Doe"
  - Phone: e.g., "+66123456789"
  - Email: e.g., "customer@example.com"

### 6. Add Proper Error Handling
- Wrap search logic in try-catch blocks
- Display user-friendly error messages via toast notifications
- Handle edge cases:
  - Empty search results
  - API timeout
  - Malformed search queries
  - Special characters in search term
- Add fallback UI for error states

### 7. Ensure Loading States Work Correctly
- Add loading state for search operations
- Show skeleton loaders during search
- Disable search input during API calls
- Add loading spinner or progress indicator
- Prevent duplicate searches while one is in progress

### 8. Fix TypeScript Errors
- Run `npm run build` to check for TypeScript errors
- Fix type mismatches in search-related code
- Ensure proper typing for:
  - Search filter parameters
  - API response types
  - Order data structures
- Add type guards where necessary

### 9. Test Search Functionality Thoroughly
- **Order Number Search:**
  - Test exact match
  - Test partial match
  - Test with different formats
- **Customer Name Search:**
  - Test full name
  - Test first name only
  - Test last name only
  - Test case-insensitive search
- **Phone Number Search:**
  - Test with country code
  - Test without country code
  - Test with different formats (+66, 0, etc.)
- **Email Search:**
  - Test full email
  - Test partial email (username only)
  - Test domain search
- **Edge Cases:**
  - Empty search (should show all orders)
  - Special characters in search
  - Very long search terms
  - Search with no results

### 10. Validate and Document Changes
- Run full test suite: `npm run build`
- Test in development: `npm run dev`
- Verify no console errors
- Verify no TypeScript errors
- Update `CLAUDE.md` if design decision changed
- Document any new search parameters in API documentation
- Create summary of what was fixed and why

## Validation Commands

Execute these commands to validate the chore is complete:

```bash
# Check for TypeScript compilation errors
npx tsc --noEmit

# Build the project to catch any errors
npm run build

# Start development server for manual testing
npm run dev

# Check for linting errors
npm run lint

# Test API endpoint directly (if applicable)
curl -X GET "http://localhost:3000/api/orders/external?search=test&page=1&pageSize=10"
```

**Manual Testing Checklist:**
1. Navigate to `http://localhost:3000` - Executive Dashboard should load without errors
2. Open browser console - No JavaScript errors should appear
3. Check Network tab - All API calls should succeed (200 status)
4. If search was added to Executive Dashboard:
   - Test search with order number
   - Test search with customer name
   - Test search with phone number
   - Test search with email
   - Verify loading states appear correctly
   - Verify error messages display properly
   - Verify empty search shows all orders
5. If search is in Order Management Hub:
   - Navigate to Order Management Hub page
   - Perform same search tests as above
6. Verify no TypeScript errors in terminal
7. Verify data updates correctly after search

## Notes

**IMPORTANT DESIGN CONSIDERATION:**
Per `CLAUDE.md`, the Executive Dashboard is intentionally designed WITHOUT search or filter capabilities. It always shows the complete 7-day overview. If search functionality is truly needed on the dashboard page, this represents a significant design change that should be:

1. **Documented**: Update `CLAUDE.md` to reflect the new design decision
2. **Justified**: Explain why the "no filters" rule is being changed
3. **Considered carefully**: Adding search may impact performance with large datasets

**Alternative Solution:**
Instead of adding search to Executive Dashboard, consider:
- Adding clear navigation to Order Management Hub where search exists
- Adding a "Search Orders" button that navigates to Order Management Hub
- Keeping Executive Dashboard as high-level overview only

**Performance Considerations:**
- Executive Dashboard loads complete 7-day dataset (potentially 5000+ orders)
- Adding search may require pagination to maintain performance
- Consider implementing virtual scrolling for large result sets
- Cache search results to prevent redundant API calls

**API Integration Notes:**
- External API base URL: `https://dev-pmpapis.central.co.th/pmp/v2/grabmart/v1`
- Authentication: Bearer token from `/auth/poc-orderlist/login`
- Search should work with existing API parameters or implement client-side filtering
- Current API supports search via query parameters in `/merchant/orders` endpoint
