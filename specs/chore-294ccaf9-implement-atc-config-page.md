# Chore: Implement ATC Configuration Page

## Metadata
adw_id: `294ccaf9`
prompt: `Implement ATC Configuration page with UI following specs/feature-atc-config-page.md - Create the page structure, inventory supply section, ATC rule configuration section with all conditions, and add ATC Config to sidebar navigation menu`

## Chore Description
Implement a complete Availability to Commerce (ATC) Configuration page that allows administrators to configure inventory supply rules and availability rules for commerce operations. This implementation follows Phase 1 (MVP) requirements from the feature specification, including:

1. Basic page structure with two main sections (Inventory Supply and ATC Rules)
2. Inventory Supply section UI with source configuration (Warehouse, Store, Supplier)
3. ATC Rule configuration section with core conditions (Item, Location, Supply Type)
4. Save/Load functionality using Supabase
5. Add "ATC Config" menu item to sidebar navigation

The page follows the existing Omnia UI design patterns, uses Radix UI components, Tailwind CSS styling, and integrates with the Supabase backend for data persistence.

## Relevant Files

### Existing Files to Reference
- **specs/feature-atc-config-page.md** - Complete feature specification with data models, UI requirements, and implementation phases
- **src/components/side-nav.tsx** (lines 15-41) - Sidebar navigation menu where we'll add the ATC Config link
- **app/inventory/page.tsx** - Reference implementation for similar configuration page structure with tabs, cards, and data management
- **src/components/ui/sidebar.tsx** - Sidebar UI components used throughout the application
- **src/components/ui/card.tsx** - Card components for section layouts
- **src/components/ui/tabs.tsx** - Tab components for organizing condition cards
- **src/components/ui/switch.tsx** - Toggle switch components for enable/disable features
- **src/components/ui/select.tsx** - Dropdown select components
- **src/components/ui/button.tsx** - Button components for actions
- **src/components/ui/input.tsx** - Input components for configuration values
- **src/components/ui/badge.tsx** - Badge components for status indicators
- **src/lib/inventory-service.ts** - Reference service implementation pattern for API interactions
- **app/layout.tsx** - Root layout with SidebarProvider
- **tailwind.config.ts** - Tailwind configuration for design system

### New Files to Create

#### h3 Main Page File
- **app/atc-config/page.tsx** - Main ATC Configuration page component with DashboardShell layout, state management, and integration of all sections

#### h3 Component Files
- **src/components/atc-config/inventory-supply-section.tsx** - Top section component for inventory supply configuration (Warehouse, Store, Supplier sources)
- **src/components/atc-config/atc-rule-section.tsx** - Bottom section component for ATC rules with inclusion/exclusion mode toggle
- **src/components/atc-config/condition-cards.tsx** - Reusable condition card components for Item, Location, and Supply Type conditions
- **src/components/atc-config/rule-preview.tsx** - Preview panel component to display configured rules summary

#### h3 Service and Type Files
- **src/lib/atc-config-service.ts** - Service layer for CRUD operations with Supabase, configuration persistence, and data fetching
- **src/types/atc-config.ts** - TypeScript interfaces and types for ATC configuration data models

#### h3 API Routes
- **app/api/atc-config/route.ts** - API endpoint for GET (list all) and POST (create new configuration)
- **app/api/atc-config/[id]/route.ts** - API endpoint for GET (specific config), PUT (update), and DELETE operations

#### h3 Database Migration (Documentation)
- **supabase/migrations/create_atc_config_tables.sql** - SQL migration file for creating atc_configurations and atc_configuration_history tables

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Create TypeScript Type Definitions
- Create `src/types/atc-config.ts` with all interfaces from the specification
- Define ATCConfiguration, SourceConfig, OnHandConfig, AllocationConfig interfaces
- Define condition interfaces: ItemCondition, LocationCondition, SupplyTypeCondition
- Define NetworkViewConfig and LocationViewConfig interfaces
- Export all types for use in components and services

### 2. Create Database Migration File
- Create `supabase/migrations/create_atc_config_tables.sql`
- Add SQL for creating `atc_configurations` table with JSONB config_data column
- Add SQL for creating `atc_configuration_history` table for versioning
- Add indexes for status and config_id columns
- Include RLS (Row Level Security) policies if needed

### 3. Create ATC Configuration Service
- Create `src/lib/atc-config-service.ts` with CRUD functions
- Implement `fetchATCConfigurations()` - GET all configurations
- Implement `fetchATCConfiguration(id)` - GET specific configuration
- Implement `saveATCConfiguration(config)` - POST/PUT configuration
- Implement `deleteATCConfiguration(id)` - DELETE configuration
- Use Supabase client pattern similar to inventory-service.ts
- Add error handling and proper TypeScript typing

### 4. Create API Route Handlers
- Create `app/api/atc-config/route.ts` with GET and POST handlers
- Create `app/api/atc-config/[id]/route.ts` with GET, PUT, DELETE handlers
- Add CORS headers following existing API route patterns
- Integrate with atc-config-service functions
- Add proper error responses and status codes
- Add request validation for required fields

### 5. Create Inventory Supply Section Component
- Create `src/components/atc-config/inventory-supply-section.tsx`
- Build UI with three source cards (Warehouse, Store, Supplier)
- Add enable/disable toggle switches for each source
- Add priority number inputs (1-3)
- Add initial/adjustment checkboxes
- Add On Hand settings card with threshold and buffer inputs
- Add Allocation strategy dropdown (FIFO, LIFO, Priority)
- Use Card, Switch, Input, Select components from UI library
- Add state management with React useState hooks

### 6. Create Condition Cards Component
- Create `src/components/atc-config/condition-cards.tsx`
- Implement ItemConditionCard with category filters, product type selectors, SKU pattern input
- Implement LocationConditionCard with store multi-select, region selectors
- Implement SupplyTypeConditionCard with type dropdown, lead time, priority inputs
- Use Tabs component to organize condition cards
- Use Card, Input, Select components with proper labels
- Add validation for required fields

### 7. Create ATC Rule Section Component
- Create `src/components/atc-config/atc-rule-section.tsx`
- Add Inclusion/Exclusion mode toggle at the top
- Integrate ConditionCards component with tabs layout
- Add Network View and Location View configuration cards
- Add Full Sync toggles and threshold alert settings
- Use Grid layout for responsive design
- Pass configuration state up to parent via callbacks

### 8. Create Rule Preview Component
- Create `src/components/atc-config/rule-preview.tsx`
- Display summary of configured inventory sources
- Show active conditions with badges
- Display view configuration settings
- Add collapsible sections for detailed preview
- Style with Card component and proper spacing

### 9. Create Main ATC Config Page
- Create `app/atc-config/page.tsx` as a client component ("use client")
- Import DashboardShell for consistent layout
- Set up state management for entire configuration object
- Create two-section layout: Inventory Supply (top) and ATC Rules (bottom)
- Integrate InventorySupplySection, ATCRuleSection, and RulePreview components
- Add action buttons: Save Draft, Publish, Reset to Default
- Implement save functionality calling API routes
- Add loading states and error handling with toast notifications
- Add page header with title "ATC Configuration" and description

### 10. Update Sidebar Navigation
- Open `src/components/side-nav.tsx`
- Import Scale icon from lucide-react for ATC Config
- Add new navigation item to navItems array:
  ```
  {
    title: "ATC Config",
    href: "/atc-config",
    icon: Scale,
  }
  ```
- Insert after "Inventory" and before "Escalations" in the array
- Verify the pathname highlighting works correctly

### 11. Add Mobile Responsiveness
- Review all created components for mobile-first design
- Ensure grid layouts collapse to single column on mobile (grid-cols-1)
- Use responsive breakpoints: sm:grid-cols-2, lg:grid-cols-3
- Test touch target sizes (minimum 44px for interactive elements)
- Verify card layouts stack properly on small screens
- Add horizontal scroll for tables if needed

### 12. Implement Form Validation
- Add validation rules to all input fields in configuration sections
- Validate priority numbers are 1-3 and unique across sources
- Validate threshold and buffer are positive numbers
- Validate required fields before save operations
- Display validation error messages with proper styling
- Disable Save button if validation fails

### 13. Add Default Configuration Template
- Create a default configuration object in atc-config-service.ts
- Use sensible defaults: Warehouse enabled with priority 1, Store priority 2, Supplier priority 3
- Set default thresholds and allocation strategy (FIFO)
- Use this template for "Reset to Default" functionality
- Use this template for initial page load if no configs exist

### 14. Test API Integration
- Test GET /api/atc-config returns empty array initially
- Test POST /api/atc-config creates new configuration
- Test GET /api/atc-config/:id retrieves specific configuration
- Test PUT /api/atc-config/:id updates existing configuration
- Verify JSONB storage and retrieval works correctly
- Test error handling for invalid IDs and malformed data

### 15. Add Loading and Error States
- Add loading skeleton components while fetching configurations
- Display loading spinners during save operations
- Show error alerts for failed API calls with retry options
- Add empty state message when no configurations exist
- Use toast notifications for success messages
- Implement proper error boundaries if needed

### 16. Style and Polish UI
- Apply consistent spacing and padding throughout
- Use enterprise color palette from Tailwind config
- Ensure proper contrast for accessibility
- Add hover states for interactive elements
- Add focus states for keyboard navigation
- Review typography hierarchy (headings, labels, body text)
- Add subtle animations for state transitions

### 17. Add Documentation Comments
- Add JSDoc comments to all exported functions in service layer
- Document component props with TypeScript interface comments
- Add inline comments for complex logic and calculations
- Document API route request/response formats
- Update CLAUDE.md with ATC Config section if needed

### 18. Final Testing and Validation
- Run `pnpm dev` and navigate to /atc-config
- Verify sidebar shows "ATC Config" menu item with Scale icon
- Test creating a new configuration with all sections
- Test saving configuration and verify it persists
- Test loading saved configuration from database
- Test all form inputs and validation rules
- Test responsive design on mobile, tablet, and desktop
- Verify no console errors or warnings
- Test navigation between pages maintains state

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm dev` - Start development server and verify no compilation errors
- Navigate to `http://localhost:3000/atc-config` - Verify page loads successfully
- Test sidebar navigation - Verify "ATC Config" appears and clicking navigates to the page
- Verify UI renders correctly - Check both Inventory Supply and ATC Rule sections display
- Test form interactions - Toggle switches, fill inputs, select dropdowns
- Test save functionality - Create a configuration and verify it persists to database
- `pnpm build` - Ensure production build completes without TypeScript or ESLint errors
- Check browser console - Verify no errors or warnings during page interaction
- Test responsive design - Resize browser window to mobile, tablet, desktop sizes
- Verify database - Query Supabase to confirm atc_configurations table exists and data is stored

## Notes

### Implementation Priority
This chore implements **Phase 1 (MVP)** from the feature specification:
- ✅ Basic page structure
- ✅ Inventory Supply section UI
- ✅ Item, Location, Supply Type conditions (core conditions only)
- ✅ Save/Load functionality
- ✅ Add to sidebar menu

**NOT included in this chore (future phases):**
- ❌ Advanced conditions (Protection, Commerce, Regional) - Phase 2
- ❌ Network/Location view detailed configuration - Phase 2
- ❌ Rule testing functionality - Phase 2
- ❌ Version history - Phase 2
- ❌ Visual flow diagram - Phase 3
- ❌ Import/Export - Phase 3
- ❌ Conflict detection - Phase 3
- ❌ Impact analysis - Phase 3

### Design System Consistency
- Follow existing patterns from Inventory page (app/inventory/page.tsx)
- Use DashboardShell for consistent page layout
- Use existing UI components from src/components/ui/
- Follow mobile-first responsive design approach
- Use enterprise color palette from Tailwind config

### Supabase Integration
- If Supabase credentials are missing, the mock client will automatically be used
- The dual database strategy allows the page to function with mock data
- Real persistence will work once Supabase is properly configured
- Consider adding mock data generator for development/testing

### Performance Considerations
- Use React.memo for expensive components if needed
- Implement debouncing for auto-save functionality (future enhancement)
- Consider pagination if configuration list grows large
- Use proper React key props for dynamic lists

### Accessibility
- Ensure all form inputs have proper labels
- Use semantic HTML elements
- Add ARIA labels where needed
- Ensure keyboard navigation works throughout
- Maintain minimum touch target sizes (44px)
- Test with screen readers if possible
