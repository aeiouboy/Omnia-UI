# Chore: Orders Summary Mock Data Fallback in Development

## Metadata
adw_id: `7af10286`
prompt: `Fix /api/orders/summary endpoint to use mock data fallback when authentication fails in development mode.`

## Chore Description
The `/api/orders/summary` endpoint currently returns an error response when `getAuthToken()` fails, preventing the Order Analysis page from working in development environments where `PARTNER_CLIENT_ID` and `PARTNER_CLIENT_SECRET` are not configured. This chore updates the endpoint to fall back to mock data generation when authentication fails in development mode, matching the pattern used in `/app/api/orders/external/route.ts`.

## Relevant Files
Use these files to complete the chore:

### Existing Files to Modify
- `app/api/orders/summary/route.ts` - The GET handler (lines 52-78) needs to be updated to check `process.env.NODE_ENV` and fall back to mock data generation when authentication fails in development mode

### Reference Files
- `app/api/orders/external/route.ts` - Reference implementation showing the mock data fallback pattern (lines 117-156)

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Authentication Error Handling in GET Handler
- In `app/api/orders/summary/route.ts`, locate the `getAuthToken()` try-catch block (lines 54-78)
- Replace the current error response logic with environment-aware handling:
  - If `process.env.NODE_ENV === 'development'`: Log a warning and continue to mock data generation
  - If `process.env.NODE_ENV !== 'development'`: Return the error response as currently implemented
- Add console warning message: `"⚠️ Authentication failed in development, using mock data"`

### 2. Ensure Mock Data Generation is Reached
- The existing `transformToSummary` function (lines 231-285) already generates mock data when `orders.length === 0` in development mode
- After auth failure in development, skip to the `transformToSummary` call with an empty data structure
- This ensures the platform subdivision logic remains intact

### 3. Test the Development Fallback
- Verify that when API credentials are missing, the endpoint returns mock data in development
- Confirm the warning message appears in console logs
- Validate that the Order Analysis page loads and displays mock data

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure the code compiles without TypeScript errors
- `pnpm dev` - Start development server and navigate to Order Analysis page (`/orders/analysis`)
- Check console logs for the warning message when auth fails
- Verify the page displays mock data instead of an error

## Notes
- The existing `transformToSummary` function already handles mock data generation with proper platform subdivision
- Only the authentication error handling path needs modification
- Production behavior should remain unchanged - auth failures should still return errors
- This matches the established pattern in `/app/api/orders/external/route.ts` for consistency across the codebase
