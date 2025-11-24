# Chore: Add Sidebar Navigation to Inventory Page

## Metadata
adw_id: `53a55a07`
prompt: `Add sidebar navigation to inventory page:

1. Update app/inventory/page.tsx to include sidebar navigation
2. The inventory page should have the same layout structure as other pages (dashboard, orders, escalations)
3. Add the AppSidebar component from src/components/app-sidebar.tsx
4. Wrap the page content with SidebarProvider and SidebarInset
5. Include SidebarTrigger for mobile menu toggle
6. Ensure proper layout structure:
   - SidebarProvider wraps everything
   - AppSidebar component on the left
   - SidebarInset contains the main content
   - Breadcrumb navigation at top
7. Reference app/page.tsx or app/orders/page.tsx for correct layout pattern
8. Maintain all existing inventory page functionality
9. Ensure responsive design (sidebar collapses on mobile)
10. Test navigation between pages works correctly
11. Verify sidebar active state highlights 'Inventory' menu item

The inventory page should have consistent navigation with the rest of the application.`

## Chore Description
The inventory page (`app/inventory/page.tsx`) currently lacks sidebar navigation, making it inconsistent with other pages in the application (dashboard, orders, escalations). This chore updates the inventory page to use the `DashboardShell` component wrapper, which provides:
- Consistent sidebar navigation across all pages
- Mobile-responsive design with collapsible sidebar
- Active state highlighting for the current page
- Breadcrumb navigation
- Unified layout structure matching the rest of the application

## Relevant Files
Use these files to complete the chore:

- **app/inventory/page.tsx** - Main inventory page component that needs to be updated with sidebar navigation
- **src/components/dashboard-shell.tsx** - Shell component that provides sidebar navigation, header, and layout structure (reference for pattern)
- **app/page.tsx** - Dashboard page showing the correct layout pattern with DashboardShell wrapper
- **app/orders/page.tsx** - Orders page showing the correct layout pattern with DashboardShell wrapper
- **app/escalations/page.tsx** - Escalations page showing the correct layout pattern with DashboardShell wrapper
- **src/components/side-nav.tsx** - Sidebar navigation component (if it exists, to verify 'Inventory' menu item exists)
- **src/components/ui/bottom-nav.tsx** - Bottom navigation for mobile (already includes inventory)
- **src/contexts/sidebar-context.tsx** - Sidebar state management context

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Analyze Current Layout Pattern
- Read `app/page.tsx`, `app/orders/page.tsx`, and `app/escalations/page.tsx` to understand the DashboardShell wrapper pattern
- Identify the consistent structure: `DashboardShell` wrapping the main content
- Note that some pages use `DashboardHeader` component for headers with actions
- Understand how the current inventory page structure differs from other pages

### 2. Update Inventory Page Layout
- Modify `app/inventory/page.tsx` to wrap the entire content with `DashboardShell` component
- Import `DashboardShell` from `@/components/dashboard-shell`
- Import `DashboardHeader` from `@/components/dashboard-header` (optional, for consistency)
- Move the existing header section into `DashboardHeader` component or keep inline within DashboardShell
- Ensure all existing inventory functionality remains intact (KPI cards, tabs, table, pagination, search, sorting)

### 3. Verify Sidebar Navigation Item
- Check if `src/components/side-nav.tsx` exists and contains an 'Inventory' menu item
- If not found, check the navigation configuration to ensure inventory is included
- Verify the route matches `/inventory` for active state highlighting
- Confirm the bottom navigation already includes inventory (as seen in dashboard-shell.tsx lines 95-98)

### 4. Maintain Existing Functionality
- Ensure all state management (tabs, search, pagination, sorting) continues to work
- Verify all action buttons (Import, Export, Add Product) remain functional
- Confirm responsive design is maintained (mobile layout with bottom nav, desktop with sidebar)
- Check that loading states and error states still display correctly

### 5. Test Responsive Behavior
- Verify sidebar collapses on mobile (< 768px)
- Confirm mobile menu toggle works correctly
- Test that bottom navigation is visible on mobile
- Ensure desktop sidebar navigation is visible and functional
- Verify the inventory page maintains proper spacing and layout on all screen sizes

### 6. Validate Active State Highlighting
- Navigate to the inventory page and verify the 'Inventory' menu item is highlighted in the sidebar
- Test navigation between pages (dashboard → inventory → orders → escalations)
- Confirm active state updates correctly when navigating between pages
- Verify both sidebar (desktop) and bottom nav (mobile) show correct active states

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm dev` - Start development server and manually test the inventory page
- Navigate to `http://localhost:3000/inventory` and verify:
  - Sidebar is visible on desktop
  - 'Inventory' menu item is highlighted
  - Mobile sidebar collapses and shows bottom navigation
  - All existing functionality works (tabs, search, sorting, pagination)
  - Navigation between pages works correctly
- `pnpm build` - Ensure no TypeScript or build errors
- `pnpm lint` - Verify no linting errors introduced

## Notes
- The application uses `DashboardShell` as the standard layout wrapper, not individual `SidebarProvider` components
- `DashboardShell` already handles `SidebarProvider`, `SideNav`, mobile responsiveness, and bottom navigation
- The inventory page currently has all its content inline; we need to wrap it with `DashboardShell` similar to other pages
- Bottom navigation already includes inventory (confirmed in dashboard-shell.tsx), so we only need to ensure sidebar navigation is consistent
- Maintain the existing page structure and functionality - only add the navigation wrapper, don't refactor the content
