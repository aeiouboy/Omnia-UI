# Chore: Fix React Key Prop Warnings in Audit Trail Tab

## Metadata
adw_id: `4ac51f96`
prompt: `Fix the React key prop warning in the Audit Trail tab component (src/components/order-detail/audit-trail-tab.tsx).

  ISSUE:
  Console shows: 'Each child in a list should have a unique key prop'

  REQUIREMENTS:
  1. Find all list renderings in audit-trail-tab.tsx that are missing unique key props
  2. Add proper key props using event.id or index as fallback
  3. Check the expandable row rendering - ensure the expanded row has a unique key
  4. Ensure no duplicate keys when rows are expanded/collapsed
  5. Run pnpm build to verify no TypeScript errors
  6. Run pnpm lint to check for any remaining issues

  The warning likely appears in:
  - Main audit events table rows mapping
  - Expanded row field changes mapping
  - Filter dropdown options rendering`

## Chore Description
Fix React key prop warnings that appear in the browser console when rendering the Audit Trail tab component. The component renders lists of audit events in both desktop table and mobile card views, with expandable rows showing field changes. React requires unique key props for all list items to efficiently track and update elements. The missing key props are causing console warnings and could potentially impact performance.

The audit trail component has several list rendering locations:
1. **Loading skeletons** - Simple array map without critical key needs
2. **Desktop table view** - Main audit events mapping with fragment wrappers
3. **Expanded row field changes** - Change details in desktop view
4. **Mobile card view** - Card-based audit events rendering
5. **Mobile expanded changes** - Change details in mobile view
6. **Filter dropdowns** - SelectItem components in action type filter

## Relevant Files
Use these files to complete the chore:

- **src/components/order-detail/audit-trail-tab.tsx** (lines 400-484, 491-577) - Main file containing all the list rendering issues:
  - Lines 236-239: Loading skeleton map (has key, OK)
  - Lines 320-324: Action type filter SelectItem map (missing key)
  - Lines 400-484: Desktop table view with fragment wrapper for main row + expanded row
  - Lines 458-476: Expanded row field changes map in desktop view (missing unique key)
  - Lines 491-577: Mobile card view rendering
  - Lines 553-571: Expanded changes in mobile view (missing unique key)

- **src/types/audit.ts** - Type definitions to understand the data structure (event.id, change fields)

- **package.json** - To verify build and lint scripts are available

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Analyze Current Key Prop Usage
- Read the audit-trail-tab.tsx file carefully to identify all `.map()` calls
- Check which list renderings already have key props
- Identify the data structure of events and changes to determine best key values
- Verify that event.id is unique and stable for each audit event
- Check if changes array items have unique identifiers or if index should be used

### 2. Fix Desktop Table View Keys
- Line 400-482: The main desktop table uses a fragment wrapper (`<>...</>`) for both the main row and expanded row
  - Current issue: Fragment wrapper without key prop
  - Solution: Replace fragments with `<React.Fragment key={...}>` or use array with proper keys
  - Main row should use `key={event.id}`
  - Expanded row should use `key={\`\${event.id}-expanded\``}` (already correct at line 453)
- Verify no duplicate keys when rows expand/collapse

### 3. Fix Expanded Row Field Changes Keys (Desktop)
- Lines 458-476: Field changes mapping in expanded desktop view
- Current code: `event.changes.map((change: any, idx: number) => (...))` with `key={idx}`
- Issue: Using array index as key, but no better identifier available
- Solution: Create composite key using `key={\`\${event.id}-change-\${idx}\`}` for guaranteed uniqueness
- This prevents key collisions between different events

### 4. Fix Mobile Card View Keys
- Lines 491-577: Mobile card view rendering
- Main card wrapper at line 497 has `key={event.id}` (already correct)
- Verify no nested list rendering issues inside the card

### 5. Fix Mobile Expanded Changes Keys
- Lines 553-571: Field changes in mobile view
- Current code: `event.changes.map((change: any, idx: number) => (...))` with `key={idx}`
- Same issue as desktop: array index alone is not unique across events
- Solution: Use composite key `key={\`\${event.id}-mobile-change-\${idx}\`}`

### 6. Fix Filter Dropdown Keys
- Lines 320-324: Action type filter SelectItem components
- Current code: `Object.entries(AUDIT_ACTION_CONFIG).map(([type, config]) => (...))`
- Has `key={type}` already - verify this is working correctly
- Check if there are any other filter dropdowns with similar issues
- Source filter (lines 329-340) also has SelectItem components - verify keys

### 7. Run Build and Lint Validation
- Execute `pnpm build` to ensure no TypeScript compilation errors
- Execute `pnpm lint` to check for any ESLint warnings
- Check browser console in development mode to verify warnings are resolved
- Test expanding/collapsing rows to ensure no duplicate key warnings appear

### 8. Test in Browser
- Start development server with `pnpm dev`
- Navigate to an order detail page with audit trail tab
- Open browser console and check for React key warnings
- Test the following interactions:
  - Expand and collapse different audit events
  - Apply filters (date, action type, source, search)
  - Switch between desktop and mobile views (resize browser)
  - Verify no console warnings appear during any interaction

## Validation Commands
Execute these commands to validate the chore is complete:

```bash
# Check for TypeScript errors
pnpm build

# Check for ESLint issues
pnpm lint

# Start dev server and manually test (stop with Ctrl+C after testing)
pnpm dev

# Search for any remaining map() calls without keys (should return nothing problematic)
grep -n "\.map(" src/components/order-detail/audit-trail-tab.tsx
```

## Notes
- The most critical fix is the fragment wrapper in the desktop table view (lines 400-482) which causes the "each child in a list should have a unique key prop" warning
- Using composite keys like `${event.id}-change-${idx}` ensures uniqueness even when the same change index appears across multiple events
- Array index as key is acceptable ONLY when the list is static and will never be reordered, filtered, or have items added/removed
- React fragments (`<>...</>`) can accept keys using the full syntax: `<React.Fragment key={...}>...</React.Fragment>`
- The expanded row already has the correct key pattern at line 453: `key={\`\${event.id}-expanded\`}`
