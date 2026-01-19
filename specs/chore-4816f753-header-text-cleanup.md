# Chore: Header Text Cleanup

## Metadata
adw_id: `4816f753`
prompt: `Remove 'Organization' and 'Profile' words from header component while maintaining all functionality and responsive design. Follow the requirements from docs/task/inv-1-header-cleanup.md`

## Chore Description
Remove the text labels "Organization" and "Profile" from the header component in the dashboard shell. These labels appear as small uppercase text above the organization selector dropdown and user profile avatar in the header. The removal should maintain all existing functionality (organization selector, user profile dropdown) and preserve the responsive design that shows these elements on larger screens.

## Relevant Files
Use these files to complete the chore:

- **`src/components/dashboard-shell.tsx`** - Main file containing the header with "Organization" and "Profile" labels at lines 166 and 171. This is where both labels need to be removed.
- **`src/components/organization-selector.tsx`** - Contains the organization selector dropdown. Has a placeholder text "Select Organization..." that should also be cleaned up for consistency.
- **`src/components/user-nav.tsx`** - Contains the user profile dropdown menu with a "Profile" menu item (line 38). Based on the task requirements, this should be evaluated but may be kept as it's inside a dropdown menu, not the header.
- **`docs/task/inv-1-header-cleanup.md`** - Task requirements document specifying the success criteria.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Remove "Organization" Label from Header
- Open `src/components/dashboard-shell.tsx`
- Locate line 166: `<span className="text-[10px] font-semibold uppercase tracking-wider text-white/60 mb-1">Organization</span>`
- Remove this entire `<span>` element
- Keep the `<div className="hidden sm:flex flex-col">` wrapper but remove the `flex-col` class since there's no longer a label above
- Change the div to just `<div className="hidden sm:flex">` or remove the flex-col if no longer needed

### 2. Remove "Profile" Label from Header
- In the same file `src/components/dashboard-shell.tsx`
- Locate line 171: `<span className="text-[10px] font-semibold uppercase tracking-wider text-white/60 mb-1 hidden sm:block">Profile</span>`
- Remove this entire `<span>` element
- Keep the `<div className="flex flex-col items-end">` wrapper but simplify since there's no longer a label
- Change to `<div className="flex items-end">` or `<div>` since flex-col is no longer needed

### 3. Update Organization Selector Placeholder
- Open `src/components/organization-selector.tsx`
- Locate line 30: `<SelectValue placeholder="Select Organization..." />`
- Change placeholder to a simpler text like `"Select..."` or `"All Business Units"` to remove the word "Organization"
- Alternative: Keep the placeholder as-is if it's considered dropdown content rather than header text

### 4. Verify Responsive Design
- Ensure the `hidden sm:flex` class remains on the organization selector wrapper to maintain responsive behavior
- Ensure the UserNav component is still visible on all screen sizes
- Check that layout doesn't break on mobile (organization selector hidden, user nav visible)

### 5. Clean Up Unnecessary Wrapper Classes
- After removing labels, simplify wrapper divs if flex-col is no longer needed
- The organization selector div can change from:
  ```tsx
  <div className="hidden sm:flex flex-col">
  ```
  to:
  ```tsx
  <div className="hidden sm:block">
  ```
- The profile section div can change from:
  ```tsx
  <div className="flex flex-col items-end">
  ```
  to:
  ```tsx
  <div>
  ```

### 6. Validate Changes
- Run the development server
- Verify no console errors
- Test on desktop viewport: organization selector and user avatar should display without labels
- Test on mobile viewport: only user avatar should be visible
- Verify organization selector dropdown still works
- Verify user profile dropdown still works

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm lint` - Ensure no linting errors are introduced
- `pnpm build` - Verify the build completes successfully with no TypeScript errors
- `pnpm dev` - Start development server and visually verify:
  - No "Organization" text appears in header
  - No "Profile" text appears in header
  - Organization selector dropdown works correctly
  - User profile dropdown works correctly
  - Mobile responsive layout is preserved
  - No console errors in browser

## Notes
- The "Profile" text inside the user dropdown menu (`user-nav.tsx` line 38) should be kept as it's part of the dropdown menu content, not the header itself. The task specifically targets header displays.
- The placeholder text in organization-selector.tsx ("Select Organization...") could optionally be changed for consistency, but this is lower priority as it's inside the dropdown component itself.
- The existing comments `{/* Organization selector with label */}` and `{/* Profile section with label */}` should be updated or removed after the labels are removed to maintain code clarity.
