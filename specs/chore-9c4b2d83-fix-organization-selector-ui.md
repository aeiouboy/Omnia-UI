# Chore: Fix Organization Selector UI and Integration

## Metadata
adw_id: `9c4b2d83`
prompt: `Fix Organization selector UI and integration issues based on validation feedback. Issues to fix: 1) Add ORGANIZATION label above dropdown, 2) Fix green highlight on selected option, 3) Verify localStorage persistence, 4) Match reference design with labeled columns, 5) Test API integration with businessUnit parameter.`

## Chore Description
This chore addresses UI/UX issues with the Organization selector component in the dashboard header. The primary issues are:

1. **Missing Label**: The dropdown needs an "ORGANIZATION" label above it to match enterprise header patterns
2. **Broken Green Highlight**: The current conditional className approach for green highlighting doesn't work because Radix UI Select doesn't re-render items with updated classes based on external state - it uses `data-[state=checked]` attributes
3. **Layout Mismatch**: The header layout should show two labeled columns - "ORGANIZATION" with dropdown, "PROFILE" with user avatar
4. **Verify Persistence**: Ensure localStorage correctly saves and loads organization selection
5. **Verify API Integration**: Confirm businessUnit parameter is passed to Orders API when organization is selected

## Relevant Files
Use these files to complete the chore:

- `src/components/organization-selector.tsx` - Main component file, needs green highlight fix using Radix UI's `data-[state=checked]` attribute instead of conditional className based on React state
- `src/components/dashboard-shell.tsx` - Header layout component, needs ORGANIZATION label added and layout restructured to show labeled columns
- `src/components/ui/select.tsx` - Base Select component using Radix UI - shows SelectItem uses `data-[disabled]` pattern, need to add `data-[state=checked]` styling
- `src/contexts/organization-context.tsx` - Context provider handling localStorage persistence - verify implementation is correct
- `app/api/orders/external/route.ts` - API route that handles businessUnit parameter filtering - already implemented correctly at line 70
- `src/types/organization.ts` - Organization type definitions - no changes needed

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Fix Green Highlight in SelectItem Using Radix Data Attribute
- Update `src/components/ui/select.tsx` SelectItem component to add `data-[state=checked]:bg-green-100 data-[state=checked]:text-green-800 data-[state=checked]:font-medium` to the className
- This uses Radix UI's built-in `data-state="checked"` attribute that is set on the currently selected item
- Remove the conditional className logic from `organization-selector.tsx` since the styling will now be handled by the base component

### 2. Update OrganizationSelector to Remove Redundant Styling
- In `src/components/organization-selector.tsx`, remove the conditional `selectedOrganization === org && "bg-green-100 text-green-800 font-medium"` from SelectItem
- The green highlight will now be handled automatically by the data attribute in the base Select component

### 3. Add ORGANIZATION Label to Dashboard Header
- In `src/components/dashboard-shell.tsx`, wrap the OrganizationSelector with a labeled container
- Add a div structure with "ORGANIZATION" label in small uppercase text (similar to how enterprise headers show labels)
- Use styling: `text-[10px] font-semibold uppercase tracking-wider text-white/60 mb-1`

### 4. Restructure Header Layout for Labeled Columns
- Update the header's right section to use a flex layout with proper spacing
- Create two labeled column groups: ORGANIZATION + dropdown, and PROFILE + UserNav
- Ensure proper gap between the two column groups
- Hide labels on mobile but keep dropdowns visible

### 5. Verify localStorage Persistence Implementation
- Review `src/contexts/organization-context.tsx` implementation
- Confirm the useEffect hook reads from localStorage on mount
- Confirm setOrganization saves to localStorage when called
- The storage key is 'selected-organization' - this is correct

### 6. Validate API Integration Already Works
- Review `app/api/orders/external/route.ts` lines 32 and 70-173
- The businessUnit parameter is already read from searchParams at line 32
- It's passed to fetchOrdersFromApi at line 70 with proper null check for "ALL"
- It's appended to apiUrl at line 173 when not "ALL"
- No changes needed - just verify the data flow is correct

### 7. Test and Validate
- Run `pnpm dev` and verify the application compiles without errors
- Visually verify the ORGANIZATION label appears above the dropdown
- Verify green highlight appears on the selected item when dropdown is open
- Test localStorage persistence by selecting CFR, refreshing, and confirming CFR is still selected
- Open Network tab and verify businessUnit parameter appears in API calls when organization is selected

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure no TypeScript or build errors
- `pnpm lint` - Ensure no ESLint errors
- Open browser to http://localhost:3000, inspect the organization dropdown and verify green highlight on selected item
- Check browser localStorage for key 'selected-organization' with correct value
- Check Network tab for orders API calls containing `businessUnit=CFR` when CFR is selected

## Notes
- The green highlight fix uses Radix UI's native data attribute approach rather than React state comparison, which is more reliable for Select components
- The `data-[state=checked]` selector is the standard Radix UI pattern for selected items
- The API integration is already fully implemented in the external route - this chore just validates it works correctly
- Consider using green-500 shades if green-100/800 contrast isn't sufficient on the dropdown background
