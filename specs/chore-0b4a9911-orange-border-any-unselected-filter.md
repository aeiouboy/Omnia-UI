# Chore: Update Orange Border Logic to Show on Any Unselected Required Filter

## Metadata
adw_id: `0b4a9911`
prompt: `Update Stock Card page (app/inventory-new/stores/page.tsx) orange border logic to show on ANY unselected required filter. Current logic only shows orange when ONE is selected but not the other. New logic should be: View Type dropdown shows orange border when hasViewTypeFilter is false (regardless of date selection). Date pickers show orange border when hasValidDateRange is false (regardless of view type selection). This means when nothing is selected, BOTH View Type and Date pickers will have orange borders indicating both are required. Update line 427 SelectTrigger condition to just check if hasViewTypeFilter is false. Update lines 452 and 482 date picker conditions to just check if hasValidDateRange is false. Remove the AND conditions that check the other filter state.`

## Chore Description
This chore refines the visual feedback logic for the Stock Card page's mandatory filter selection. Currently, the orange border only appears when ONE filter is selected but the OTHER is missing. This creates a logic gap: when NEITHER filter is selected (the initial state), no orange borders appear at all, leaving users without clear visual guidance.

The new behavior provides comprehensive visual feedback across all four filter states:
1. **Neither selected** → BOTH show orange borders (NEW - currently missing)
2. **Only View Type selected** → Date pickers show orange (existing)
3. **Only dates selected** → View Type shows orange (existing)
4. **Both selected** → No orange borders (existing)

This is achieved by simplifying the conditional logic to check each filter independently rather than using AND conditions that require checking the opposite filter's state.

**Current Logic:**
- Line 427: View Type shows orange when `hasValidDateRange && !hasViewTypeFilter`
- Lines 452, 482: Date pickers show orange when `hasViewTypeFilter && !hasValidDateRange`

**New Logic:**
- Line 427: View Type shows orange when `!hasViewTypeFilter`
- Lines 452, 482: Date pickers show orange when `!hasValidDateRange`

## Relevant Files
Use these files to complete the chore:

- **app/inventory-new/stores/page.tsx** - The Stock Card page that needs modification. This is the primary file to edit. Three specific lines need updating:
  - Line 427: SelectTrigger className for View Type dropdown
  - Line 452: Button className for "From" date picker
  - Line 482: Button className for "To" date picker

### New Files
No new files needed - this is a pure logic refinement to existing code.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update View Type Select Orange Border Condition (Line 427)
- Locate the View Type Select component's SelectTrigger (line 427)
- Current condition: `hasValidDateRange && !hasViewTypeFilter ? "border-orange-400 ring-1 ring-orange-400" : ""`
- Change to: `!hasViewTypeFilter ? "border-orange-400 ring-1 ring-orange-400" : ""`
- Remove the `hasValidDateRange &&` part from the condition
- This makes the View Type dropdown show orange border whenever it's not selected, regardless of date selection state

### 2. Update "From" Date Picker Orange Border Condition (Line 452)
- Locate the "From" date picker Button component (line 452)
- Current condition: `!hasValidDateRange && hasViewTypeFilter ? "border-orange-400 ring-1 ring-orange-400" : ""`
- Change to: `!hasValidDateRange ? "border-orange-400 ring-1 ring-orange-400" : ""`
- Remove the `&& hasViewTypeFilter` part from the condition
- This makes the "From" date picker show orange border whenever the date range is incomplete, regardless of view type selection state

### 3. Update "To" Date Picker Orange Border Condition (Line 482)
- Locate the "To" date picker Button component (line 482)
- Current condition: `!hasValidDateRange && hasViewTypeFilter ? "border-orange-400 ring-1 ring-orange-400" : ""`
- Change to: `!hasValidDateRange ? "border-orange-400 ring-1 ring-orange-400" : ""`
- Remove the `&& hasViewTypeFilter` part from the condition
- This makes the "To" date picker show orange border whenever the date range is incomplete, regardless of view type selection state

### 4. Verify Logic Consistency
- Ensure all three conditions now use simple negation checks: `!hasViewTypeFilter` and `!hasValidDateRange`
- Verify no other orange border logic exists in the file that might conflict
- Confirm the derived validation states (`hasViewTypeFilter` and `hasValidDateRange`) remain unchanged

### 5. Test All Four Filter States
- Verify orange border behavior across all four possible states:
  1. Neither selected: BOTH View Type AND date pickers show orange
  2. Only View Type selected: date pickers show orange, View Type does not
  3. Only dates selected: View Type shows orange, date pickers do not
  4. Both selected: no orange borders shown

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure the project builds without TypeScript errors
- `pnpm lint` - Ensure no linting errors are introduced
- `pnpm dev` - Start development server and manually verify:
  1. Navigate to `/inventory-new/stores` on initial page load
  2. **State 1 - Neither selected**: Verify BOTH View Type dropdown AND both date pickers show orange borders
  3. **State 2 - Only View Type selected**: Select a view type, verify date pickers show orange, View Type does not
  4. **State 3 - Only dates selected**: Clear view type, select date range, verify View Type shows orange, date pickers do not
  5. **State 4 - Both selected**: Select both view type and date range, verify NO orange borders
  6. Click "Clear All" button and verify returning to State 1 with both filters showing orange
  7. Test various selection orders to confirm consistent visual feedback

## Notes
- This change simplifies the conditional logic from complex AND conditions to simple independent checks
- The new logic provides clearer visual guidance, especially important during initial page load when both filters are required
- The orange border styling (`border-orange-400 ring-1 ring-orange-400`) remains unchanged - only the conditions change
- The derived validation states `hasViewTypeFilter` and `hasValidDateRange` (defined around lines 133-134) remain unchanged
- This enhancement improves UX by ensuring users always see visual indicators for incomplete required selections
- No changes to component structure or state management - purely conditional styling logic updates
- The three-line change provides comprehensive visual feedback across all four possible filter state combinations
