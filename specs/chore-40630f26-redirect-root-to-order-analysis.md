# Chore: Redirect Root Route to Order Analysis

## Metadata
adw_id: `40630f26`
prompt: `Fix root route navigation UX issue: The Dashboard at route '/' is the landing page but its sidebar menu item is disabled (disabled: true in side-nav.tsx line 51). Users cannot click back to Dashboard after navigating away. Solution: Redirect root route '/' to '/orders/analysis' (Order Analysis page) which is the first clickable menu item. Update app/page.tsx to use Next.js redirect() to '/orders/analysis' instead of rendering ExecutiveDashboard directly. This ensures users always land on a navigable page.`

## Chore Description
The root route (`/`) currently renders the Executive Dashboard component, but the Dashboard menu item in the sidebar navigation is disabled (`disabled: true` at line 51 in `side-nav.tsx`). This creates a UX issue where users can land on the Dashboard page initially, but cannot navigate back to it after visiting other pages since the menu item is not clickable.

The fix is to redirect the root route to `/orders/analysis` (Order Analysis page), which is the first enabled menu item in the navigation. This ensures users always land on a page they can navigate back to via the sidebar.

## Relevant Files
Use these files to complete the chore:

- **app/page.tsx** - The root route component that currently renders ExecutiveDashboard. Needs to be updated to redirect to `/orders/analysis` instead.
- **src/components/side-nav.tsx** - Contains the navigation menu structure. Order Analysis at `/orders/analysis` is the first clickable item (line 18-22). Dashboard is disabled at line 51.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Root Route to Redirect
- Open `app/page.tsx`
- Replace the current component that renders `ExecutiveDashboard` with Next.js `redirect()` function
- Import `redirect` from `next/navigation`
- Call `redirect('/orders/analysis')` to perform a server-side redirect
- Remove unused imports (`DashboardShell`, `ExecutiveDashboard`)

**Updated code:**
```tsx
import { redirect } from "next/navigation"

export default function Home() {
  redirect('/orders/analysis')
}
```

### 2. Validate the Changes
- Run the development server to verify the redirect works
- Navigate to `http://localhost:3000/` and confirm it redirects to `/orders/analysis`
- Verify the Order Analysis page loads correctly
- Confirm the sidebar navigation shows Order Analysis as the active page

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Ensure the production build succeeds without errors
- `pnpm dev` - Start development server and verify:
  - Visiting `http://localhost:3000/` redirects to `http://localhost:3000/orders/analysis`
  - The Order Analysis page renders correctly
  - Sidebar shows Order Analysis as active (highlighted)

## Notes
- This is a simple, low-risk change that only affects the root route behavior
- The ExecutiveDashboard component is not deleted - it remains available if the Dashboard route is re-enabled in the future
- The redirect is server-side (using Next.js `redirect()`), so it happens before the page renders, providing a seamless experience
- No changes to the sidebar navigation are needed - the disabled Dashboard item remains as-is for potential future use
