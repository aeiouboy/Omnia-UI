# Chore: Header Text Cleanup - Remove Organization and Profile Labels

## Metadata
adw_id: `0e049998`
prompt: `Remove 'Organization' and 'Profile' words from header component while maintaining all functionality and responsive design. This is a simple text removal task - just find and remove these two words from header displays. Follow requirements from docs/task/inv-1-header-cleanup.md`

## Chore Description
Remove the display labels "Organization" and "Profile" from the header component in the dashboard shell. These labels appear above the organization selector dropdown and user profile avatar in the top header bar. The task is to remove only the text labels while keeping all underlying functionality (organization selector, user navigation dropdown) intact and maintaining the responsive layout.

## Relevant Files
Use these files to complete the chore:

- **`src/components/dashboard-shell.tsx`** - Main file containing both labels:
  - Line 166: `<span>Organization</span>` label above OrganizationSelector
  - Line 171: `<span>Profile</span>` label above UserNav
  - These are small uppercase labels styled with `text-[10px] font-semibold uppercase tracking-wider text-white/60`

- **`src/components/user-nav.tsx`** - Contains "Profile" text inside the dropdown menu (line 38)
  - This is a menu item label, NOT a header label - review if this should also be removed based on requirements

- **`docs/task/inv-1-header-cleanup.md`** - Task requirements document for reference

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Remove Organization Label from Dashboard Shell
- Open `src/components/dashboard-shell.tsx`
- Locate line 166 with the "Organization" span element
- Remove the entire span line: `<span className="text-[10px] font-semibold uppercase tracking-wider text-white/60 mb-1">Organization</span>`
- Keep the `<div className="hidden sm:flex flex-col">` wrapper and `<OrganizationSelector />` component intact

### 2. Remove Profile Label from Dashboard Shell
- In the same file `src/components/dashboard-shell.tsx`
- Locate line 171 with the "Profile" span element
- Remove the entire span line: `<span className="text-[10px] font-semibold uppercase tracking-wider text-white/60 mb-1 hidden sm:block">Profile</span>`
- Keep the `<div className="flex flex-col items-end">` wrapper and `<UserNav />` component intact

### 3. Clean Up Container Structure (Optional)
- After removing labels, the flex-col containers may no longer be needed
- Consider simplifying the wrapping divs if they now only contain a single child
- For Organization: change `<div className="hidden sm:flex flex-col">` to `<div className="hidden sm:block">`
- For Profile: change `<div className="flex flex-col items-end">` to `<div>`
- Ensure spacing and alignment remain correct after simplification

### 4. Verify User Nav Profile Menu Item
- Open `src/components/user-nav.tsx`
- Line 38 contains "Profile" as a dropdown menu item label
- Per requirements, this is inside a dropdown menu, NOT a header display label
- **Keep this "Profile" text** as it's a functional menu item, not a header label

### 5. Validate Build and Lint
- Run `pnpm lint` to check for any TypeScript or ESLint errors
- Run `pnpm build` to verify production build succeeds
- Fix any errors before proceeding

### 6. Visual Testing
- Run `pnpm dev` to start development server
- Navigate to dashboard pages to verify:
  - Organization selector still appears and functions
  - User avatar/profile dropdown still works
  - Layout spacing looks correct without labels
  - Mobile responsive design is maintained (labels were hidden on mobile anyway)

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm lint` - Verify no linting errors introduced
- `pnpm build` - Ensure production build succeeds without errors
- `grep -n "Organization" src/components/dashboard-shell.tsx` - Should return only component imports, not label text
- `grep -n '"Profile"' src/components/dashboard-shell.tsx` - Should return no matches
- `pnpm dev` - Start dev server and visually verify header layout

## Notes
- The "Organization" and "Profile" labels in the header were small uppercase labels (10px) that provided context for the selectors
- Removing them simplifies the header UI while maintaining all functionality
- The "Profile" text inside the UserNav dropdown menu (user-nav.tsx line 38) should be preserved as it's a functional menu item, not a header display label
- Mobile responsiveness is unaffected since both labels were already hidden on mobile (`hidden sm:block` classes)
- The OrganizationSelector and UserNav components remain fully functional
