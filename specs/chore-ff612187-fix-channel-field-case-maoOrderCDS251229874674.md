# Chore: Fix Channel Field Case in maoOrderCDS251229874674

## Metadata
adw_id: `ff612187`
prompt: `Fix channel field case in maoOrderCDS251229874674: change channel: 'Web' to channel: 'web' (lowercase) at line 9440 in src/lib/mock-data.ts to ensure consistent display with other orders.`

## Chore Description
The mock order `maoOrderCDS251229874674` currently has an inconsistent `channel` field value using uppercase 'Web' instead of lowercase 'web'. This inconsistency may cause display issues, filtering problems, or case-sensitive comparisons to fail in the application. All other orders in the mock data use lowercase 'web' for the channel field, so this single uppercase instance needs to be corrected to maintain data consistency.

## Context from Codebase Analysis
- **Uppercase instances**: Only 1 occurrence at line 9440 (`channel: 'Web'`)
- **Lowercase instances**: 3+ occurrences throughout the file (`channel: 'web'`)
- **Standard pattern**: Lowercase 'web' is the established convention
- **Impact**: Channel field is used extensively across 30+ component files for filtering, display, and analytics

## Relevant Files

- **src/lib/mock-data.ts** (line 9440) - Contains the maoOrderCDS251229874674 order object with the incorrect uppercase 'Web' value that needs to be changed to lowercase 'web'

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Channel Field Case
- Open `src/lib/mock-data.ts` at line 9440
- Change `channel: 'Web',` to `channel: 'web',` (lowercase)
- Ensure no other changes are made to the file
- Verify the edit matches the established lowercase pattern used in other orders

### 2. Verify Consistency Across Mock Data
- Confirm no other uppercase 'Web' instances exist in the channel field
- Validate that the change aligns with the lowercase convention used at lines 3682, 10550, and 10880

### 3. Test Application Build
- Run TypeScript compilation to ensure no type errors introduced
- Verify the application builds successfully
- Confirm no runtime errors occur

### 4. Validate the Change
- Review the git diff to confirm only the single line change at line 9440
- Ensure the change is minimal and surgical
- Verify the sellingChannel field (line 9439) remains unchanged as 'Web' (it may use different casing convention)

## Validation Commands
Execute these commands to validate the chore is complete:

- `npm run build` - Ensure TypeScript compilation succeeds and application builds without errors
- `git diff src/lib/mock-data.ts` - Verify only line 9440 changed from 'Web' to 'web'
- `grep -n "channel: 'Web'" src/lib/mock-data.ts` - Should return no results (no uppercase 'Web' in channel field)
- `grep -n "channel: 'web'" src/lib/mock-data.ts` - Should show consistent lowercase usage across all orders

## Notes

### Case Sensitivity Considerations
The `channel` field is used throughout the application for:
- Channel performance analytics (charts and filters)
- Order filtering and search functionality
- Display labels and badges
- Data aggregation and grouping

Using consistent lowercase ensures all these features work correctly without case-sensitive comparison issues.

### Related Fields
Note that `sellingChannel` (line 9439) uses uppercase 'Web' and should NOT be changed. Only the `channel` field (line 9440) needs to be updated. These may have different casing conventions.

### Testing Recommendation
After making the change, visually verify in the UI that:
- Order CDS251229874674 displays correctly in the order list
- Channel filters work properly with this order
- Channel analytics include this order in the 'web' channel metrics
