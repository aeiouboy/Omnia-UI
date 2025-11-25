# Chore: Implement ATC Configuration Advanced Features (Phase 2 & 3)

## Metadata
adw_id: `59e7a7a0`
prompt: `Implement ATC Configuration advanced features (Phase 2 & 3) following specs/feature-atc-config-advanced-phases.md - Add advanced condition cards (Inventory Protection, Commerce Characteristic, Regional Availability), Network/Location view configuration, Rule testing functionality, Version history, Visual flow diagram, Import/Export, Conflict detection, and Impact analysis`

## Chore Description
This chore implements the advanced features for the ATC Configuration page, building upon the Phase 1 MVP implementation. The work is divided into two phases:

**Phase 2 (Advanced Rule Configuration & Testing):**
- Advanced condition cards (Inventory Protection, Commerce Characteristic, Regional Availability)
- Enhanced Network/Location view configuration with sync settings
- Rule testing functionality with test case builder and result visualization
- Version history with comparison and restore capabilities

**Phase 3 (Advanced Analytics & Visualization):**
- Visual flow diagram representing the OMS architecture
- Import/Export functionality for configuration management
- Conflict detection system for overlapping or contradictory rules
- Impact analysis for estimating configuration change effects

All features follow the existing Omnia UI design patterns, mobile-first responsive design, and dual database strategy (Supabase with mock data fallback).

## Relevant Files

### Existing Files to Extend

- **`app/atc-config/page.tsx`** - Main page component that orchestrates all sections. Will integrate new advanced features components.
- **`src/types/atc-config.ts`** - Type definitions. Already includes basic types for inventory protection, commerce characteristic, and regional availability. Will extend with new interfaces for testing, version comparison, conflicts, and impact analysis.
- **`src/lib/atc-config-service.ts`** - Service layer for database operations. Will add methods for version management, export/import, and conflict detection.
- **`src/components/atc-config/condition-cards.tsx`** - Contains basic condition cards (Item, Location, Supply Type). Will be extended with new advanced condition cards.
- **`src/components/atc-config/atc-rule-section.tsx`** - ATC rules section component. Will integrate new advanced condition cards.
- **`supabase/migrations/create_atc_config_tables.sql`** - Database schema. Will add new tables for test cases, conflicts, and impact analyses.

### New Files to Create

#### Phase 2 Components
- **`src/components/atc-config/inventory-protection-card.tsx`** - Advanced inventory protection configuration card
- **`src/components/atc-config/commerce-characteristic-card.tsx`** - Commerce channel and characteristic configuration
- **`src/components/atc-config/regional-availability-card.tsx`** - Regional and geographic availability rules
- **`src/components/atc-config/network-view-config.tsx`** - Enhanced network view with sync configuration
- **`src/components/atc-config/location-view-config.tsx`** - Enhanced location view with delta sync and overrides
- **`src/components/atc-config/rule-tester.tsx`** - Interactive rule testing component with test case builder
- **`src/components/atc-config/version-history.tsx`** - Version timeline with comparison and restore
- **`src/components/atc-config/config-diff-viewer.tsx`** - Shared component for displaying configuration differences
- **`src/components/atc-config/time-slot-picker.tsx`** - Reusable time slot picker for commerce characteristics

#### Phase 3 Components
- **`src/components/atc-config/visual-flow-diagram.tsx`** - Interactive SVG/D3 flow diagram of OMS architecture
- **`src/components/atc-config/import-export-panel.tsx`** - Configuration import/export with format selection
- **`src/components/atc-config/conflict-detector.tsx`** - Real-time conflict detection and resolution wizard
- **`src/components/atc-config/impact-analyzer.tsx`** - Impact analysis with charts and projections

#### Service Layer Extensions
- **`src/lib/atc-rule-engine.ts`** - Rule evaluation logic, conflict detection algorithms, and rule matching engine
- **`src/lib/atc-validation.ts`** - Configuration validation, import validation, and schema validation
- **`src/lib/atc-testing-service.ts`** - Test case execution, result comparison, and test report generation
- **`src/lib/atc-impact-analyzer.ts`** - Impact calculation, revenue estimation, and store/channel analysis

#### API Routes
- **`app/api/atc-config/[id]/test/route.ts`** - POST endpoint for testing configuration
- **`app/api/atc-config/[id]/versions/route.ts`** - GET endpoint for version history
- **`app/api/atc-config/[id]/versions/[vid]/route.ts`** - GET specific version, POST restore version
- **`app/api/atc-config/[id]/conflicts/route.ts`** - GET conflicts, POST resolve conflict
- **`app/api/atc-config/export/route.ts`** - POST endpoint for exporting configuration
- **`app/api/atc-config/import/validate/route.ts`** - POST endpoint for validating import
- **`app/api/atc-config/import/execute/route.ts`** - POST endpoint for executing import
- **`app/api/atc-config/[id]/analyze-impact/route.ts`** - POST endpoint for impact analysis
- **`app/api/atc-config/[id]/flow-diagram/route.ts`** - GET endpoint for flow diagram data

#### Database Migration
- **`supabase/migrations/add_atc_advanced_tables.sql`** - New tables for test cases, conflicts, and impact analyses

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Database Schema with Advanced Tables
- Read existing migration file `supabase/migrations/create_atc_config_tables.sql`
- Create new migration `supabase/migrations/add_atc_advanced_tables.sql`
- Add `atc_test_cases` table with test_name, test_data, expected_result, last_run_result
- Add `atc_configuration_conflicts` table with conflict_type, severity, conflict_data, resolved flags
- Add `atc_impact_analyses` table with analysis_type and analysis_data JSONB
- Add indexes for performance (config_id lookups)
- Add changes_summary and restored_from columns to atc_configuration_history

### 2. Extend Type Definitions for Advanced Features
- Open `src/types/atc-config.ts`
- Enhance existing InventoryProtection interface with safety_stock_settings, reserved_inventory config, and protection_threshold
- Enhance existing CommerceCharacteristic interface with channel_rules, customer_segments, and time_based_rules
- Enhance existing RegionalAvailability interface with regional_coverage, geographic_restrictions, and delivery_zones
- Add new interfaces: TestCase, RuleTestRequest, RuleTestResult, MatchedRule
- Add new interfaces: ConfigVersion, RuleConflict, ImportValidation, ImportConflict
- Add new interfaces: ImpactAnalysis, StoreImpact, ChannelImpact, ExportFormat
- Add TimeSlot, ChannelRule, RegionConfig, GeoArea, DeliveryZone interfaces
- Enhance NetworkViewConfig with sync_frequency, batch_size, retry_attempts, monitoring settings
- Enhance LocationViewConfig with delta_sync fields and conflict_resolution strategy

### 3. Create Shared UI Components
- Create `src/components/atc-config/time-slot-picker.tsx` with day/hour selection and visual display
- Create `src/components/atc-config/config-diff-viewer.tsx` with side-by-side comparison, highlighting changes (added/modified/removed)
- Ensure both components use existing Radix UI primitives and Tailwind styling
- Make components fully responsive (mobile-first design)

### 4. Implement Phase 2 Advanced Condition Cards
- Create `src/components/atc-config/inventory-protection-card.tsx`:
  - Safety stock threshold input (percentage or absolute)
  - Product category multi-select
  - Reserved inventory type checkboxes (pre-order, hold, pending)
  - Auto-release toggle with time input
  - Protection threshold configuration
- Create `src/components/atc-config/commerce-characteristic-card.tsx`:
  - Channel selection table with priority/allocation inputs
  - Order type filter checkboxes (delivery, pickup, dine-in)
  - Customer segment configuration (VIP, regular, new)
  - Time-based rules using TimeSlotPicker component
  - Peak/off-peak hour differentiation
- Create `src/components/atc-config/regional-availability-card.tsx`:
  - Region selection with enabled/disabled toggle per region
  - Available channels per region multi-select
  - Geographic restriction area list with add/remove
  - Delivery zone configurator (optional map integration placeholder)
  - Zone priority drag-and-drop list
- Update `src/components/atc-config/condition-cards.tsx` to import and conditionally render the new advanced cards
- Update `src/components/atc-config/atc-rule-section.tsx` to integrate advanced condition cards with proper state management

### 5. Implement Enhanced Network/Location View Configuration
- Create `src/components/atc-config/network-view-config.tsx`:
  - Full sync toggle with warning message
  - Threshold alert configuration (enabled, value, type)
  - Alert channel multi-select (email, SMS, teams)
  - Sync frequency slider (1-60 minutes)
  - Batch size number input
  - Retry attempts input
  - Monitoring toggle
- Create `src/components/atc-config/location-view-config.tsx`:
  - Full sync vs delta sync toggle
  - Sync field selection checkboxes
  - Conflict resolution strategy dropdown (latest_wins, manual_review)
  - Location override table with columns: location, override_type, effective_dates, actions
  - Add override dialog with location picker, override type, date range, custom rules
  - Override list with edit/delete actions
- Update `app/atc-config/page.tsx` to integrate enhanced view configuration components

### 6. Implement Rule Engine and Validation Services
- Create `src/lib/atc-rule-engine.ts`:
  - evaluateRule() function to match rules against test data
  - detectConflicts() function to find overlapping/contradictory rules
  - matchRules() function to determine which rules apply to a given context
  - validateRulePriority() to check for unreachable rules
  - Implement overlap detection for item conditions (same SKU in multiple rules)
  - Implement contradiction detection for availability settings
  - Implement ambiguity detection for priority rules
- Create `src/lib/atc-validation.ts`:
  - validateConfiguration() for complete config validation
  - validateImport() for import data validation
  - validateSchema() using Zod or similar schema validation
  - checkMandatoryFields() helper
  - checkValueRanges() helper
  - Export validation error types and messages

### 7. Implement Testing Service and Rule Tester Component
- Create `src/lib/atc-testing-service.ts`:
  - executeTestCase() to run a single test case against configuration
  - compareResults() to match expected vs actual results
  - generateTestReport() to create test summary
  - saveTestCase() and loadTestCases() for persistence
- Create `src/components/atc-config/rule-tester.tsx`:
  - Test case builder form (product data, location data, inventory data, context)
  - Quick test button with sample data pre-filled
  - Batch test with CSV upload (file input, parse CSV)
  - Test result display with pass/fail status, matched rules list, failed conditions
  - Visual rule flow diagram showing evaluation path
  - Save/load test cases functionality
  - Export test results button (download JSON/CSV)
- Create API route `app/api/atc-config/[id]/test/route.ts`:
  - POST handler accepting RuleTestRequest
  - Call atc-testing-service to execute tests
  - Return RuleTestResult array
  - Handle errors gracefully

### 8. Implement Version History System
- Update `src/lib/atc-config-service.ts`:
  - Enhance createConfigurationHistory() to store changes_summary (added, modified, removed fields)
  - Add getConfigurationVersions() to fetch version history
  - Add getConfigurationVersion() to fetch specific version
  - Add restoreConfigurationVersion() to restore from history
  - Add compareVersions() to generate diff between versions
- Create `src/components/atc-config/version-history.tsx`:
  - Version timeline view (vertical timeline with version cards)
  - Version card showing: version number, timestamp, user, change description
  - Version comparison button (opens ConfigDiffViewer)
  - Restore version button with confirmation dialog
  - Change summary visualization (added/modified/removed counts)
  - Filter/search versions
- Create API routes:
  - `app/api/atc-config/[id]/versions/route.ts` - GET handler for version list
  - `app/api/atc-config/[id]/versions/[vid]/route.ts` - GET specific version, POST restore
- Update `app/atc-config/page.tsx` to add "Version History" button that opens drawer/dialog with VersionHistory component

### 9. Implement Impact Analyzer Service and Component
- Create `src/lib/atc-impact-analyzer.ts`:
  - calculateImpact() to determine affected items, locations, channels
  - estimateRevenueImpact() (placeholder with mock calculation)
  - analyzeStoreImpact() to determine per-store effects
  - analyzeChannelImpact() to determine per-channel effects
  - generateImpactReport() to create summary
- Create `src/components/atc-config/impact-analyzer.tsx`:
  - Before/after comparison section
  - Affected items summary (total, newly_available, newly_unavailable, unchanged)
  - Affected locations summary with store list
  - Item availability heatmap by store (use Recharts HeatMapGrid if available, or table)
  - Channel impact bar chart (Recharts BarChart)
  - Revenue impact projection card (potential increase/decrease, net impact, confidence)
  - Affected SKU list table with filters
  - Export impact report button (download PDF/Excel)
  - Simulation mode toggle (what-if analysis)
- Create API route `app/api/atc-config/[id]/analyze-impact/route.ts`:
  - POST handler accepting configuration changes
  - Call atc-impact-analyzer service
  - Return ImpactAnalysis object
- Update `app/atc-config/page.tsx` to add "Analyze Impact" button that opens drawer/dialog with ImpactAnalyzer component

### 10. Implement Conflict Detection System
- Create `src/components/atc-config/conflict-detector.tsx`:
  - Real-time conflict detection on configuration changes (useEffect hook)
  - Conflict list display with severity indicators (error=red, warning=yellow, info=blue)
  - Conflict card showing: type, description, rules_involved, affected_items count
  - Detailed conflict explanation expandable section
  - Suggested resolution actions (quick fix buttons)
  - Auto-fix button for simple conflicts (with confirmation)
  - Conflict resolution wizard for complex conflicts (multi-step dialog)
- Create API routes:
  - `app/api/atc-config/[id]/conflicts/route.ts` - GET conflicts, POST resolve conflict
  - GET handler calls atc-rule-engine.detectConflicts()
  - POST handler applies resolution and marks conflict as resolved
- Update `app/atc-config/page.tsx` to integrate ConflictDetector:
  - Show conflict badge in header with count
  - Display conflicts in sidebar or dedicated panel
  - Block publish if critical conflicts exist

### 11. Implement Import/Export Functionality
- Update `src/lib/atc-config-service.ts`:
  - Add exportConfiguration() to serialize config to JSON/YAML/Excel
  - Add validateImport() to check format and schema
  - Add detectImportConflicts() to find conflicts with existing config
  - Add executeImport() to apply imported configuration
- Create `src/components/atc-config/import-export-panel.tsx`:
  - Export section:
    - Format selection radio buttons (JSON, YAML, Excel)
    - Include metadata checkbox
    - Include history checkbox
    - Encrypt checkbox (with key input if enabled)
    - Export button (triggers download)
  - Import section:
    - File upload input (drag-and-drop zone)
    - Format auto-detection
    - Preview import data
    - Conflict detection display (using ImportConflict interface)
    - Conflict resolution options (keep_current, use_imported, merge)
    - Import button (with confirmation)
    - Rollback button (undo last import)
  - Import audit log table showing past imports
- Create API routes:
  - `app/api/atc-config/export/route.ts` - POST handler to export configuration
  - `app/api/atc-config/import/validate/route.ts` - POST handler to validate import
  - `app/api/atc-config/import/execute/route.ts` - POST handler to execute import
- Update `app/atc-config/page.tsx` to add "Import/Export" button that opens drawer/dialog with ImportExportPanel component

### 12. Implement Visual Flow Diagram
- Create `src/lib/flow-diagram-data.ts` helper to generate diagram node/edge data from configuration
- Create `src/components/atc-config/visual-flow-diagram.tsx`:
  - Use React Flow library for diagram rendering (add to package.json)
  - Define OMS flow nodes: Inventory Sources → On Hand → Allocation → ATC Rules → Commerce
  - Highlight active nodes based on configuration (enabled sources, active rules)
  - Show data flow with animated arrows (React Flow animated edges)
  - Make nodes clickable to edit related configuration section (emit onClick events)
  - Add zoom/pan controls (React Flow controls)
  - Export diagram as PNG button (use html-to-image library)
  - Responsive layout that works on mobile
- Create API route `app/api/atc-config/[id]/flow-diagram/route.ts`:
  - GET handler to return diagram data (nodes, edges, highlights)
- Update `app/atc-config/page.tsx` to add "View Flow" button that opens full-screen dialog with VisualFlowDiagram component
- Ensure diagram matches OMS overview from specs/feature-atc-config-page.md

### 13. Install Required Dependencies
- Run `pnpm add reactflow` for visual flow diagram
- Run `pnpm add html-to-image` for diagram export
- Run `pnpm add js-yaml` for YAML import/export
- Run `pnpm add xlsx` for Excel import/export
- Run `pnpm add @types/js-yaml @types/xlsx -D` for TypeScript support
- Verify package.json is updated

### 14. Update Main Page Layout for Advanced Features
- Open `app/atc-config/page.tsx`
- Add state for managing advanced feature dialogs (version history, rule tester, impact analyzer, import/export, flow diagram)
- Add action buttons to page header:
  - "Version History" button
  - "Test Rules" button
  - "Analyze Impact" button
  - "Import/Export" button
  - "View Flow" button
  - Keep existing: Save Draft, Publish, Reset to Default
- Add conflict detector to sidebar or dedicated panel
- Integrate dialogs/drawers for each advanced feature
- Ensure responsive layout maintains usability on mobile
- Update component to handle new props passed to child components

### 15. Create Comprehensive API Route Tests
- Create basic test structure for new API routes
- Test `POST /api/atc-config/:id/test` with sample test cases
- Test `GET /api/atc-config/:id/versions` returns history
- Test `POST /api/atc-config/:id/restore/:vid` restores version
- Test `GET /api/atc-config/:id/conflicts` detects conflicts
- Test `POST /api/atc-config/export` generates correct formats
- Test `POST /api/atc-config/import/validate` catches invalid imports
- Test `POST /api/atc-config/import/execute` imports successfully
- Test `POST /api/atc-config/:id/analyze-impact` returns analysis
- Use Bash tool to run tests if test suite is available

### 16. Validate All Features End-to-End
- Start development server with `pnpm dev`
- Navigate to `/atc-config` and verify page loads
- Test Phase 2 features:
  - Configure advanced condition cards (Inventory Protection, Commerce Characteristic, Regional Availability)
  - Configure Network/Location view with sync settings
  - Create test cases and run rule tests
  - View version history and compare versions
  - Restore previous version
- Test Phase 3 features:
  - Open visual flow diagram and interact with nodes
  - Export configuration in all formats (JSON, YAML, Excel)
  - Import configuration and resolve conflicts
  - View conflict detection in real-time
  - Run impact analysis and view results
- Verify mobile responsiveness on all new components
- Verify no console errors or warnings
- Verify all new features work with mock data (Supabase unavailable scenario)

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm dev` - Start development server and manually test all features at http://localhost:3000/atc-config
- `pnpm build` - Ensure no TypeScript or ESLint errors in production build
- `pnpm lint` - Check for linting issues in new code
- `git status` - Verify all new files are tracked and no unexpected changes
- Manual testing checklist:
  - [ ] All advanced condition cards render and accept input
  - [ ] Network/Location view configuration saves and loads
  - [ ] Rule testing executes and shows results
  - [ ] Version history displays and restore works
  - [ ] Visual flow diagram renders and highlights active sections
  - [ ] Export downloads files in all formats
  - [ ] Import validates and imports successfully
  - [ ] Conflict detection shows conflicts in real-time
  - [ ] Impact analysis shows before/after comparison
  - [ ] All features work on mobile viewport
  - [ ] Mock data mode works when Supabase unavailable

## Notes

### Dependencies Between Features
- Config Diff Viewer and Time Slot Picker must be implemented before components that use them
- atc-rule-engine.ts must be completed before conflict detection and rule testing
- atc-validation.ts must be completed before import/export validation
- Database schema must be migrated before API routes that use new tables

### Performance Considerations
- Impact analysis may be computationally expensive; implement loading states and consider background processing
- Conflict detection should be debounced to avoid excessive recalculation
- Version history should be paginated for configurations with many versions
- Visual flow diagram should use lazy loading for large configurations

### Mobile-First Design
- All dialogs/drawers should be full-screen on mobile
- Complex forms should stack vertically on small screens
- Charts should be scrollable horizontally on mobile
- Touch targets should be at least 44px for usability

### Mock Data Strategy
- All services must gracefully handle Supabase unavailability
- Mock data should be realistic and representative
- API routes should return appropriate mock responses when database unavailable
- Loading/error states should be consistent across features

### Phase Implementation Order
Implement Phase 2 features first (steps 1-8), then Phase 3 features (steps 9-12), then integration (steps 13-16). This ensures foundational features are stable before adding advanced analytics.

### Code Quality Standards
- Follow existing Omnia UI patterns and conventions
- Use TypeScript strict mode (no `any` types unless absolutely necessary)
- Add JSDoc comments to all public functions
- Use consistent naming conventions (camelCase for variables/functions, PascalCase for components)
- Ensure all components are exported correctly
- Add proper error boundaries where appropriate
