# Chore: Rename 'Order Dashboard' to 'Order Analysis'

## Metadata
adw_id: `60e6f4cd`
prompt: `Rename 'Order Dashboard' to 'Order Analysis' in the side navigation menu and page header. Update the menu item label, page title, and any related header text to use 'Order Analysis' instead of 'Order Dashboard'.`

## Chore Description
Update all user-facing occurrences of "Order Dashboard" to "Order Analysis" to ensure consistent naming across the application. This affects the side navigation menu item label and the page header title displayed on the order analysis page. The change is primarily cosmetic but important for maintaining consistent terminology throughout the user interface.

## Relevant Files
Use these files to complete the chore:

- **src/components/side-nav.tsx** (lines 17-22) - Contains the navigation menu item with title "Order Dashboard" that links to `/orders/analysis`. This needs to be updated to "Order Analysis".

- **app/order-analysis/page.tsx** (line 61) - Contains the page header with `<h1>` displaying "Order Analysis". This file already uses the correct terminology and serves as a reference for the desired naming convention.

- **app/orders/analysis/page.tsx** (line 52) - Contains the page header with `<h1>` displaying "Order Dashboard". This is an alternate route that needs to be updated to "Order Analysis" to match the primary route.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Side Navigation Menu Item
- Open `src/components/side-nav.tsx`
- Locate the `navItems` array (around line 17)
- Find the navigation item with title "Order Dashboard" (line 19)
- Change the title from `"Order Dashboard"` to `"Order Analysis"`
- Verify the href remains `/orders/analysis` (no change needed)

### 2. Update Alternate Route Page Header
- Open `app/orders/analysis/page.tsx`
- Locate the page header section (around line 50-56)
- Find the `<h1>` element displaying "Order Dashboard" (line 52)
- Change the text from `Order Dashboard` to `Order Analysis`
- Optionally update the description text to match the primary route if needed

### 3. Validate Consistency Across Both Routes
- Verify that both routes (`/order-analysis` and `/orders/analysis`) now display "Order Analysis" as the page title
- Ensure the side navigation menu displays "Order Analysis"
- Check that the navigation item correctly highlights when either route is active

## Validation Commands
Execute these commands to validate the chore is complete:

- `npm run dev` - Start the development server and visually verify:
  - Side navigation menu shows "Order Analysis" (not "Order Dashboard")
  - Navigate to `/order-analysis` and confirm page header shows "Order Analysis"
  - Navigate to `/orders/analysis` and confirm page header shows "Order Analysis"
  - Verify the navigation menu item highlights correctly on both routes

- `npm run build` - Ensure the production build completes without TypeScript or linting errors related to the changes

- `grep -r "Order Dashboard" src/components/side-nav.tsx app/order-analysis/page.tsx app/orders/analysis/page.tsx` - Should return no matches in the changed files (excluding comments and CLAUDE.md documentation)

## Notes
- This is a terminology update for consistency across the UI
- The route paths (`/orders/analysis` and `/order-analysis`) remain unchanged
- Both page routes should display identical "Order Analysis" branding
- CLAUDE.md documentation files may still reference "Order Dashboard" in historical context - these do not need to be updated as they are for context tracking purposes
- Focus only on user-facing text in the production code
