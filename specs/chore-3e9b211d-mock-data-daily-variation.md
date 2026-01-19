# Chore: Fix Mock Data Daily Variation for Realistic Order Distribution

## Metadata
adw_id: `3e9b211d`
prompt: `Fix mock data generation in /app/api/orders/summary/route.ts transformToSummary function to create realistic daily variation. Current Problem: Lines 257-263 use 'index % 14' which evenly distributes 150 orders across 14 days, resulting in ~10-11 orders per day with similar bar heights. Required Fix: Replace the even distribution with realistic daily variation so bars have visibly different heights.`

## Chore Description
The current mock data generation in the orders summary API route (`/app/api/orders/summary/route.ts`) evenly distributes 150 orders across 14 days using `index % 14`, resulting in approximately 10-11 orders per day with uniform bar heights in visualizations. This creates an unrealistic representation of order data that doesn't demonstrate the system's capability to handle variable daily volumes.

The fix requires modifying the mock date logic in the `transformToSummary` function (lines 278-284) to use a weighted distribution array that creates realistic daily variation - some days with 2-3 orders, others with 20-25 orders, making the chart bars visually distinct and representative of real-world order patterns.

## Relevant Files
Use these files to complete the chore:

- `/app/api/orders/summary/route.ts` - Contains the `transformToSummary` function with mock data generation logic that needs modification

### New Files
None - this is a code modification task

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Read the Current Implementation
- Read `/app/api/orders/summary/route.ts` to understand the existing mock data generation
- Locate lines 278-284 in the `transformToSummary` function
- Verify the current even distribution logic using `index % 14`

### 2. Replace the Mock Date Distribution Logic
- In `transformToSummary` function (around line 278-284)
- Replace the even distribution code with weighted distribution:

**OLD CODE (lines 278-284):**
```typescript
// Mock Date: Distribute orders over the last 14 days to ensure they appear in charts
// Current date is 2026-01-15, match this dynamic reference
const today = new Date()
const dayOffset = index % 14
const mockDate = new Date(today)
mockDate.setDate(today.getDate() - dayOffset)
orderDate = mockDate.toISOString()
```

**NEW CODE:**
```typescript
// Mock Date: Distribute orders with realistic daily variation across 14 days
const today = new Date()
const dailyDistribution = [23, 18, 12, 8, 5, 3, 2, 4, 9, 15, 21, 25, 22, 19]
const dayOffset = index % dailyDistribution.length
const mockDate = new Date(today)
mockDate.setDate(today.getDate() - dailyDistribution[dayOffset])
orderDate = mockDate.toISOString()
```

### 3. Verify the Change
- Ensure the `dailyDistribution` array sums to a logical value (186 total offset days)
- Confirm that `dailyDistribution.length` (14) replaces the hardcoded `14`
- Validate that the modulo operation now uses `dailyDistribution.length` instead of `14`

### 4. Update Comments
- Update the comment to reflect realistic variation rather than even distribution
- Remove or update the reference to "2026-01-15" if no longer relevant

### 5. Test the Implementation
- Start the development server with `pnpm dev`
- Navigate to the orders analysis or summary page
- Verify that bar charts show visibly different heights
- Confirm that some days show 2-3 orders while others show 20-25 orders

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm dev` - Start development server to test the changes
- Navigate to `/orders/analysis` or orders summary page in browser
- Inspect the console logs for mock data generation
- Visually verify bar chart heights have realistic variation (not uniform)

## Notes
- The `dailyDistribution` array creates realistic variation: [23, 18, 12, 8, 5, 3, 2, 4, 9, 15, 21, 25, 22, 19]
  - Range: 2 (minimum) to 25 (maximum) orders per day
  - This creates natural-looking peaks and valleys in order volume
  - The distribution uses 14 days to cover a typical 2-week period
- The change only affects development mode mock data - production API calls are unchanged
- This fix improves the visual demonstration of order analysis capabilities during development and testing
