# Chore: Organization Profile Selection Feature

## Metadata
adw_id: `e9b3ff74`
prompt: `Implement Organization profile selection feature in the app header/navbar that allows users to select their Business Unit (BU) organization. Requirements: 1) Create a dropdown selector in the header (near profile section) with organization options: CRC, CFR, CFM, DS - styled with 'Select Organization...' placeholder and green highlight for selected option. 2) Store selected organization in global context that persists across navigation and in localStorage. 3) Filter Integration - Orders module and Inventory module should filter data by selected organization/BU, passing the filter to relevant API calls. 4) Place ORGANIZATION dropdown in header to the left of PROFILE selector using Radix UI Select with consistent styling. 5) Default to first organization or show all if none selected. Analyze existing header/navbar components, profile patterns, and current filter implementations before building.`

## Chore Description
This chore implements a global organization (Business Unit) selection feature in the application header that allows users to filter their view by organization. The feature includes:

1. **UI Component**: A Radix UI Select dropdown in the header positioned to the left of the user profile selector
2. **Organization Options**: CRC, CFR, CFM, DS business units with "Select Organization..." placeholder
3. **Global State Management**: React Context to manage selected organization state across the application
4. **Persistence**: localStorage integration to remember user's selection across sessions
5. **Filter Integration**: Automatic filtering of Orders and Inventory modules based on selected organization
6. **API Integration**: Pass organization filter to relevant API calls in `/api/orders/*` and inventory services
7. **Styling**: Consistent with existing header components, green highlight for selected option

The implementation follows existing patterns from:
- UserNav component for dropdown UI structure
- SidebarContext for global state management
- Order Management Hub for filter implementation patterns
- Dashboard Shell for header layout integration

## Relevant Files
Use these files to complete the chore:

### Core Implementation Files
- **src/contexts/organization-context.tsx** - NEW: Global context for organization selection with localStorage persistence
- **src/components/organization-selector.tsx** - NEW: Radix UI Select dropdown component for organization selection
- **src/components/dashboard-shell.tsx** - MODIFY: Add OrganizationSelector to header layout (line 156-163)
- **app/layout.tsx** - MODIFY: Wrap app with OrganizationProvider context

### API Integration Files
- **app/api/orders/route.ts** - MODIFY: Add businessUnit filter parameter support (already has businessUnit at line 16)
- **app/api/orders/external/route.ts** - MODIFY: Pass organization filter to external API calls
- **app/api/orders/counts/route.ts** - MODIFY: Filter counts by organization
- **app/api/orders/summary/route.ts** - MODIFY: Filter summary by organization

### Component Integration Files
- **src/components/order-management-hub.tsx** - MODIFY: Use organization context to filter orders
- **app/inventory/page.tsx** - MODIFY: Use organization context to filter inventory items
- **src/lib/inventory-service.ts** - MODIFY: Add organization parameter to fetchInventoryData function

### Type Definition Files
- **src/types/organization.ts** - NEW: TypeScript types for organization/BU definitions

### New Files

#### src/types/organization.ts
TypeScript type definitions for organization/business unit structure:
- Organization type enum (CRC, CFR, CFM, DS)
- OrganizationContext interface
- Helper type guards and utilities

#### src/contexts/organization-context.tsx
React Context implementation with:
- State management for selected organization
- localStorage persistence logic
- useOrganization custom hook
- OrganizationProvider wrapper component

#### src/components/organization-selector.tsx
Radix UI Select component with:
- Organization dropdown UI
- Green highlight styling for selected option
- Consistent styling with UserNav component
- "Select Organization..." placeholder
- Integration with organization context

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Create Organization Type Definitions
- Create `src/types/organization.ts` with organization enum and types
- Define Organization type: 'CRC' | 'CFR' | 'CFM' | 'DS' | 'ALL'
- Define OrganizationContextType interface with selectedOrganization, setOrganization, isLoading
- Export organization display names mapping (CRC → "CRC", CFR → "CFR", etc.)

### 2. Implement Organization Context Provider
- Create `src/contexts/organization-context.tsx` following SidebarContext pattern
- Implement OrganizationProvider component with useState for organization state
- Add localStorage persistence: read on mount, save on change
- Implement useOrganization custom hook with error handling
- Default to 'ALL' if no localStorage value exists
- Export OrganizationProvider and useOrganization hook

### 3. Create Organization Selector Component
- Create `src/components/organization-selector.tsx` using Radix UI Select
- Follow UserNav component styling patterns for consistency
- Implement dropdown with organization options: All Organizations, CRC, CFR, CFM, DS
- Add green highlight (bg-green-100 text-green-800) for selected option
- Use "Select Organization..." as placeholder text
- Connect to organization context via useOrganization hook
- Style Select trigger to match header theme (white text, hover effects)

### 4. Integrate Organization Selector into Header
- Modify `src/components/dashboard-shell.tsx` header section
- Import OrganizationSelector component
- Position OrganizationSelector in header between time display and UserNav (line ~156-163)
- Add proper spacing and responsive classes (hidden on mobile: `hidden sm:block`)
- Ensure consistent styling with other header elements

### 5. Wrap Application with Organization Provider
- Modify `app/layout.tsx` RootLayout component
- Import OrganizationProvider from contexts
- Wrap children with OrganizationProvider inside SidebarProvider
- Structure: `<SidebarProvider><OrganizationProvider>{children}</OrganizationProvider></SidebarProvider>`

### 6. Integrate Organization Filter in Orders API
- Modify `app/api/orders/route.ts` GET handler
- Add organization filter logic using existing businessUnit parameter (line 16)
- Map organization selection to businessUnit field in query
- Handle 'ALL' organization by not applying businessUnit filter
- Apply filter to Supabase query and mock data filtering

### 7. Integrate Organization Filter in External Orders API
- Modify `app/api/orders/external/route.ts` to accept organization query parameter
- Pass organization as businessUnit to external API calls
- Update API client calls to include businessUnit parameter
- Handle 'ALL' organization by omitting parameter

### 8. Integrate Organization Filter in Order Counts API
- Modify `app/api/orders/counts/route.ts` to filter counts by organization
- Use businessUnit field to filter breach/approaching/submitted/on-hold counts
- Ensure counts reflect only selected organization's orders

### 9. Integrate Organization Filter in Orders UI
- Modify `src/components/order-management-hub.tsx` to use organization context
- Import and use useOrganization hook at component top
- Add selectedOrganization to API fetch parameters
- Update fetchOrders function to include organization in query string
- Ensure search/filter operations respect organization context

### 10. Integrate Organization Filter in Inventory UI
- Modify `app/inventory/page.tsx` to use organization context
- Import and use useOrganization hook
- Pass selectedOrganization to fetchInventoryData calls
- Update inventory service functions to accept organization parameter
- Modify `src/lib/inventory-service.ts` fetchInventoryData to filter by organization/businessUnit

### 11. Test Organization Selection Flow
- Verify dropdown appears in header to left of profile
- Test selecting each organization (CRC, CFR, CFM, DS, ALL)
- Verify green highlight appears on selected option
- Check localStorage persists selection across page refresh
- Verify Orders page filters by selected organization
- Verify Inventory page filters by selected organization
- Test responsive behavior on mobile (selector hidden, functionality works)

### 12. Validate Integration and Styling
- Run `pnpm dev` to test application locally
- Check console for any TypeScript errors
- Verify API calls include correct businessUnit parameter
- Test navigation between pages maintains organization selection
- Verify styling matches existing header components
- Check accessibility: keyboard navigation, aria labels
- Ensure no hydration errors from localStorage usage

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Verify no TypeScript compilation errors
- `pnpm lint` - Check for ESLint violations
- `grep -r "useOrganization" src/components/` - Verify hook is used in order-management-hub.tsx and inventory page.tsx
- `grep "OrganizationProvider" app/layout.tsx` - Confirm provider is added to root layout
- `grep "OrganizationSelector" src/components/dashboard-shell.tsx` - Confirm selector is in header
- `ls src/contexts/organization-context.tsx` - Verify context file exists
- `ls src/components/organization-selector.tsx` - Verify component file exists
- `ls src/types/organization.ts` - Verify types file exists

## Notes

### Technical Considerations
1. **localStorage Hydration**: Use `useEffect` to read from localStorage to prevent Next.js hydration mismatches
2. **API Compatibility**: The orders API already supports `businessUnit` parameter (line 16 in route.ts), so we're extending existing functionality
3. **Responsive Design**: Hide selector on mobile to save space, but maintain functionality
4. **Type Safety**: Ensure all organization values are type-safe across components and APIs
5. **Backward Compatibility**: Default to 'ALL' to show all data when no organization selected

### UX Considerations
1. **Default State**: Show "All Organizations" by default on first visit
2. **Persistence**: Remember user selection across sessions via localStorage
3. **Visual Feedback**: Green highlight (brand color) for selected organization
4. **Positioning**: Left of profile for logical grouping with user-specific controls
5. **Placeholder**: "Select Organization..." guides first-time users

### Future Enhancements (Out of Scope)
- Organization-based role permissions (show only authorized organizations)
- Multi-organization selection for comparison views
- Organization-specific theming or branding
- Analytics tracking for organization switching behavior
