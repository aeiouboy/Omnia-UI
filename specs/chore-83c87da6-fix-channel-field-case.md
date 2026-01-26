# Chore: Fix Channel Field Case in maoOrderCDS260121226285

## Metadata
adw_id: `83c87da6`
prompt: `Fix channel field case in maoOrderCDS260121226285: change channel: 'Web' to channel: 'web' (lowercase) at line 10550 in src/lib/mock-data.ts to ensure consistent display in the order table.`

## Chore Description
The `maoOrderCDS260121226285` mock order object has an inconsistent `channel` field value. It uses `'Web'` (capitalized) while other similar mock orders in the codebase use `'web'` (lowercase). This inconsistency can cause display issues in the order table where channel values may be compared or filtered case-sensitively.

The fix requires changing line 10550 from `channel: 'Web'` to `channel: 'web'` to match the established pattern used by other mock orders (e.g., `maoOrderW1156251121946800` at line 3682 and `maoOrderW1156260115052036` at line 10880).

**Note:** A similar inconsistency exists at line 9440 for `maoOrderCDS251229874674`. This chore focuses only on the specified order, but the same fix may be needed for the other order in a separate chore.

## Relevant Files
Use these files to complete the chore:

- **src/lib/mock-data.ts** - Contains the mock order data. Line 10550 has the `channel: 'Web'` that needs to be changed to lowercase `'web'`.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Channel Field Case
- Open `src/lib/mock-data.ts`
- Locate line 10550 within the `maoOrderCDS260121226285` object definition
- Change `channel: 'Web',` to `channel: 'web',`

### 2. Validate the Change
- Run TypeScript compilation to ensure no type errors
- Verify the change is isolated to the specified line

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure the project builds without TypeScript errors
- `grep -n "channel: 'Web'" src/lib/mock-data.ts` - Should return only line 9440 (the other CDS order not in scope)
- `grep -n "channel: 'web'" src/lib/mock-data.ts` - Should now include line 10550 along with lines 3682 and 10880

## Notes
- The `sellingChannel` field on line 10549 also uses `'Web'` (capitalized), but this chore only addresses the `channel` field as specified in the prompt
- There is another mock order (`maoOrderCDS251229874674`) with the same inconsistency at line 9440 - this should be addressed in a separate chore if needed
- The channel field is used for display and potentially filtering in the order management table, so consistency is important for reliable UI behavior
