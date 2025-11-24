# Chore: Implement Fallback to Mock Data When API Fails

## Metadata
adw_id: `f696d9c2`
prompt: `Implement fallback to mock data when API fails`

## Chore Description
Implement graceful degradation by adding fallback logic to all API route handlers that returns realistic mock data when external API authentication fails. This ensures the application remains functional for development, testing, and demonstrations even when API credentials are unavailable or the external API is down. The fallback should be transparent to users, with proper structure matching real API responses exactly.

**Key Requirements:**
- Try API authentication first, fall back to mock data on failure
- Log warnings (not errors) when using mock data
- Return proper pagination and response structure
- Add environment variable `USE_MOCK_DATA=true` to force mock data
- No console errors when using mock data
- User should not see difference between real API and mock data
- Ensure alerts NEVER use mock data (safety requirement)

## Relevant Files
Use these files to complete the chore:

**API Route Handlers:**
- `app/api/orders/route.ts` - Main orders endpoint (Supabase-based, needs mock data fallback)
- `app/api/orders/external/route.ts` - External API proxy endpoint (already has empty fallback, needs full mock data)
- `app/api/orders/details/[id]/route.ts` - Order details endpoint (needs mock data fallback)
- `app/api/escalations/route.ts` - Escalation history endpoint (needs mock data fallback)

**Mock Data Services:**
- `src/lib/mock-data.ts` - Contains existing mock order data generators (`mockApiOrders`, `getMockOrders()`, `getMockOrderCounts()`)
- `src/lib/mock-inventory-data.ts` - Contains inventory mock data (reference for structure)

**Testing Components:**
- `src/components/executive-dashboard.tsx` - Primary consumer of API data
- `src/components/order-management-hub.tsx` - Order listing and filtering
- `app/escalations/page.tsx` - Escalation history display

**Reference Files:**
- `CLAUDE.md` - Contains critical alert rules (NEVER use mock data for alerts)
- `.env.example` - Should document new `USE_MOCK_DATA` variable

### New Files
None - all changes are modifications to existing files.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Add Environment Variable Support
- Add `USE_MOCK_DATA` to `.env.example` with documentation
- Document that this forces mock data even when API credentials are present
- Useful for testing, demos, and development

### 2. Create Mock Escalation Generator
- Add `generateMockEscalations()` function to `src/lib/mock-data.ts`
- Generate realistic escalation records with proper structure matching database schema
- Include various statuses: PENDING, SENT, FAILED, RESOLVED
- Include different alert types: SLA_BREACH, SLA_APPROACHING, HIGH_VOLUME, etc.
- Include different severities: HIGH, MEDIUM, LOW
- Ensure proper timestamp formatting and pagination support

### 3. Update External Orders API Route (`app/api/orders/external/route.ts`)
- Check `process.env.USE_MOCK_DATA === "true"` at the start of GET handler
- If true, skip API call and return mock data immediately
- Import `getMockOrders()` from `src/lib/mock-data.ts`
- Replace empty fallback responses with full mock data from `getMockOrders()`
- Apply filters from query parameters (status, channel, search, dateFrom, dateTo, pagination)
- Log warning message: "⚠️ Using mock data - API authentication unavailable"
- Ensure response structure matches real API exactly:
  ```typescript
  {
    success: true,
    data: {
      data: [...orders],
      pagination: { page, pageSize, total, hasNext, hasPrev }
    },
    mockData: true  // Flag to indicate mock data in use
  }
  ```
- Test with various filter combinations

### 4. Update Order Details API Route (`app/api/orders/details/[id]/route.ts`)
- Check `process.env.USE_MOCK_DATA === "true"` at start
- Import `mockApiOrders` from `src/lib/mock-data.ts`
- On authentication failure or forced mock mode, find order by ID in mock data
- Return single order with proper structure or null if not found
- Log warning: "⚠️ Using mock data for order details - API unavailable"
- Ensure response structure matches:
  ```typescript
  {
    success: true,
    data: order || null,
    mockData: true
  }
  ```

### 5. Update Internal Orders API Route (`app/api/orders/route.ts`)
- This uses Supabase, not external API
- Check if Supabase client is in mock mode (from `src/lib/supabase.ts`)
- If Supabase unavailable or `USE_MOCK_DATA=true`, use mock data
- Import `getMockOrders()` from `src/lib/mock-data.ts`
- Apply all filters and pagination from query parameters
- Transform mock data to match Supabase response format
- Log warning: "⚠️ Using mock data - Supabase unavailable"
- Return proper paginated response structure

### 6. Update Escalations API Route (`app/api/escalations/route.ts`)
- Check `process.env.USE_MOCK_DATA === "true"` at start of GET handler
- Import `generateMockEscalations()` from `src/lib/mock-data.ts`
- If Supabase table doesn't exist or mock mode enabled, return mock escalations
- Apply filters: status, alertType, severity, escalatedTo, search, dateFrom, dateTo
- Implement client-side pagination on mock data
- Change error log to warning: "⚠️ Using mock escalation data"
- For POST requests in mock mode, return success with generated ID
- For PUT/DELETE in mock mode, return success acknowledgment
- Ensure response structure matches database responses exactly

### 7. Verify Alert Safety Rules
- Review `src/components/executive-dashboard.tsx` critical alerts section
- Ensure alerts component checks for `mockData: true` flag in API responses
- If mock data detected, return EMPTY alerts array instead of mock alerts
- Add comment: "// CRITICAL: Never show alerts from mock data - safety requirement"
- Test that SLA breach alerts are NOT shown when using mock data
- This prevents false escalations during development/testing

### 8. Update Error Messages to Be User-Friendly
- Replace technical error messages with user-friendly ones:
  - "Authentication failed" → "Unable to connect to order system"
  - "Database error" → "Unable to load data at this time"
  - "API Error: 500" → "Service temporarily unavailable"
- Keep technical details in server logs only
- Add helpful context in development mode

### 9. Testing - Mock Data Mode
- Set `USE_MOCK_DATA=true` in `.env.local`
- Start development server with `npm run dev`
- Verify Executive Dashboard loads without errors
- Check that KPIs, charts, and recent orders display mock data
- Verify Order Management Hub shows paginated mock orders
- Test filtering (status, channel, search) works with mock data
- Verify Escalations page shows mock escalation history
- Check browser console - should show warnings, NO errors
- Verify alerts section is EMPTY (not showing mock alerts)

### 10. Testing - API Failure Simulation
- Remove/rename API credentials in `.env.local`:
  - Comment out `PARTNER_CLIENT_ID`
  - Comment out `PARTNER_CLIENT_SECRET`
- Restart server and verify fallback to mock data
- Check console shows authentication warnings, not errors
- Verify all pages work exactly as with forced mock mode
- Test that data structure matches real API format

### 11. Testing - Real API Mode
- Restore proper API credentials
- Set `USE_MOCK_DATA=false` or remove variable
- Restart server and verify real API data loads
- Check that `mockData: true` flag is NOT present in responses
- Verify pagination works with real API
- Ensure alerts are shown when using real data

### 12. Documentation and Code Comments
- Add JSDoc comments to all new mock data functions
- Document the fallback logic flow in each route handler
- Update `CLAUDE.md` with fallback behavior documentation
- Add usage examples for `USE_MOCK_DATA` environment variable
- Document alert safety rules clearly

## Validation Commands
Execute these commands to validate the chore is complete:

**Build Test:**
```bash
npm run build
```
Expected: No TypeScript errors, successful build

**Linting:**
```bash
npm run lint
```
Expected: No ESLint errors

**Test Mock Data Mode:**
```bash
# In .env.local, set USE_MOCK_DATA=true
npm run dev
# Open http://localhost:3000
# Verify Executive Dashboard loads
# Verify Order Management Hub loads
# Verify Escalations page loads
# Check console - should see warnings but NO errors
# Check alerts banner - should be EMPTY
```

**Test API Failure Mode:**
```bash
# In .env.local, comment out PARTNER_CLIENT_ID and PARTNER_CLIENT_SECRET
npm run dev
# Verify same behavior as mock mode
# Check console shows authentication warnings
# Verify all pages functional
```

**Test Real API Mode:**
```bash
# In .env.local, restore API credentials and remove/set USE_MOCK_DATA=false
npm run dev
# Verify real data loads
# Verify alerts can be shown (when real breaches exist)
# Check response objects don't have mockData flag
```

**Manual Verification Checklist:**
- [ ] Executive Dashboard displays mock data without errors
- [ ] Order list shows paginated mock orders
- [ ] Filtering works (status, channel, search, date range)
- [ ] Order details page works for mock orders
- [ ] Escalations page shows mock history
- [ ] Console shows warnings, NOT errors
- [ ] Alerts banner is EMPTY when using mock data
- [ ] Real API mode still works when credentials present
- [ ] Response structures match exactly between mock and real data
- [ ] User cannot visually distinguish mock from real data

## Notes

**Critical Safety Rule:**
The CLAUDE.md file specifies: "ABSOLUTELY FORBIDDEN - Mock data must NEVER be used for: Critical Alerts (SLA breaches, approaching deadlines)". This implementation must enforce this by checking the `mockData` flag in API responses and returning empty alerts when mock data is detected.

**Mock Data Quality:**
The mock data generators in `src/lib/mock-data.ts` already provide realistic data with:
- Proper Tops store names
- Realistic SLA calculations
- Varied order statuses and channels
- Proper pagination support
- GMT+7 timestamps

**Environment Variable Usage:**
The `USE_MOCK_DATA` variable provides:
1. **Development**: Test UI without API dependencies
2. **Demos**: Show realistic data without credentials
3. **Testing**: Consistent test data across environments
4. **Fallback**: Automatic degradation when API unavailable

**Response Structure Consistency:**
All mock data responses must match real API structure exactly:
- Same field names and types
- Same nesting structure
- Same pagination metadata
- Same error response format
- Added `mockData: true` flag for client-side detection

**User Experience:**
When using mock data, users should experience:
- ✅ Fully functional dashboard and order management
- ✅ All UI features working (filtering, sorting, pagination)
- ✅ Realistic-looking data
- ✅ No error messages or broken states
- ⚠️ Warning in console (for developers)
- ❌ No critical alerts (safety requirement)
