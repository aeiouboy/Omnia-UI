# Chore: Add Visual Feedback to View Type Select When Date Range is Selected

## Metadata
adw_id: `5a8c4eab`
prompt: `Add visual feedback on Stock Card page (app/inventory-new/stores/page.tsx) when user selects date range before view type. Currently, date pickers show orange border when view type is selected but dates are missing. Add the same orange border styling to the View Type Select component when dates are selected but view type is NOT selected (still All Views or empty). Use the same styling pattern: border-orange-400 ring-1 ring-orange-400. The condition should be: hasValidDateRange is true AND hasViewTypeFilter is false. This provides bidirectional visual hints guiding users to complete both required selections.`

## Chore Description
This chore adds bidirectional visual feedback to the Stock Card page's mandatory filter selection. Currently, the date picker buttons show orange borders when a view type is selected but the date range is incomplete. This chore adds the inverse feedback: the View Type Select component will show orange borders when a date range is selected but the view type remains unselected (showing "All Views").

This creates a symmetrical visual guidance system that helps users complete both required selections regardless of which order they choose to fill them in. The orange border serves as a clear visual indicator that a selection is required to proceed.

Key changes:
1. Add conditional orange border styling to the View Type Select component
2. Apply styling when `hasValidDateRange` is true AND `hasViewTypeFilter` is false
3. Use the same styling pattern as the date pickers: `border-orange-400 ring-1 ring-orange-400`

## Relevant Files
Use these files to complete the chore:

- **app/inventory-new/stores/page.tsx** - The Stock Card page that needs modification. This is the primary file to edit. The View Type Select component is around lines 426-441. The orange border styling pattern for date pickers is on lines 452 and 482.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Locate the View Type Select Component
- Find the View Type Select component (around lines 426-441)
- Identify the `SelectTrigger` component where styling needs to be applied
- Note the current styling: `className="w-[280px] h-10 bg-primary/5 border-primary/30"`

### 2. Add Conditional Orange Border Styling
- Modify the `SelectTrigger` className to include conditional orange border styling
- Add the condition: when `hasValidDateRange && !hasViewTypeFilter`
- Apply the same styling pattern used by date pickers: `border-orange-400 ring-1 ring-orange-400`
- Use template literal syntax to conditionally apply the styling
- Example pattern: `className={\`w-[280px] h-10 bg-primary/5 border-primary/30 ${hasValidDateRange && !hasViewTypeFilter ? "border-orange-400 ring-1 ring-orange-400" : ""}\`}`

### 3. Verify Styling Consistency
- Ensure the orange border styling matches the date picker implementation exactly
- Verify the condition logic is correct: `hasValidDateRange && !hasViewTypeFilter`
- Check that the base styling (`w-[280px] h-10 bg-primary/5 border-primary/30`) is preserved
- Ensure the conditional styling only applies when dates are selected but view type is not

### 4. Test Visual Feedback
- Verify the orange border appears when date range is selected and view type is "All Views"
- Verify the orange border disappears when a view type is selected
- Verify the orange border disappears when date range is cleared
- Ensure the bidirectional feedback works: date pickers show orange when view type selected but no dates, view type shows orange when dates selected but no view type

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure the project builds without TypeScript errors
- `pnpm lint` - Ensure no linting errors are introduced
- `pnpm dev` - Start development server and manually verify:
  1. Navigate to `/inventory-new/stores`
  2. Verify View Type Select has no orange border initially
  3. Select a date range (From and To dates) - verify View Type Select now shows orange border
  4. Select a specific view type - verify orange border disappears from View Type Select
  5. Clear the view type (back to "All Views") - verify orange border reappears on View Type Select
  6. Clear the date range - verify orange border disappears from View Type Select
  7. Select a view type first, then verify date pickers show orange borders (existing behavior)
  8. Complete both selections and verify no orange borders are shown
  9. Test both selection orders: view type first, dates first - verify appropriate orange borders guide user

## Notes
- This creates a symmetrical visual feedback system where either incomplete selection shows orange borders on the missing field
- The orange border serves as a visual prompt guiding users to complete both required selections
- The styling pattern (`border-orange-400 ring-1 ring-orange-400`) is consistent with the existing date picker implementation
- The condition `hasValidDateRange && !hasViewTypeFilter` ensures the orange border only appears when dates are selected but view type is not
- This enhancement improves UX by providing clear visual guidance regardless of the order users choose to fill in the filters
- No new components or files are needed - this is a pure styling enhancement
