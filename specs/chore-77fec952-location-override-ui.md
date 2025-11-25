# Chore: Implement Location Override UI Components for ATC Configuration

## Metadata
adw_id: `77fec952`
prompt: `Implement Location Override UI components for ATC Configuration following specs/feature-atc-location-override-ui.md - Create network-view-config.tsx and location-view-config.tsx components with full CRUD interface for location overrides, integrate with atc-rule-section.tsx, and update channel list to: Tops Online, Lazada, Shopee, Grab, LINE MAN, Gookoo`

## Chore Description
This chore implements the missing Network View and Location View configuration UI components for the ATC Configuration page, completing the Phase 2 Location Override functionality. The implementation includes:

1. **Network View Configuration Component** - System-wide synchronization settings with threshold alerts, sync frequency configuration, and monitoring settings
2. **Location View Configuration Component** - Location-specific overrides with full CRUD interface, delta sync configuration, and conflict resolution strategy
3. **Integration** - Replace placeholder content in atc-rule-section.tsx with new functional components
4. **Channel List Update** - Update AVAILABLE_CHANNELS array to reflect actual commerce channels: Tops Online, Lazada, Shopee, Grab, LINE MAN, Gookoo

The feature spec document (`specs/feature-atc-location-override-ui.md`) provides detailed UI designs, TypeScript interfaces, and implementation requirements. The infrastructure (types, database schema) already exists - this chore focuses on UI/UX implementation.

## Relevant Files

### Existing Files to Update:

- **`src/components/atc-config/atc-rule-section.tsx`** (lines 232-234) - Replace placeholder dashed border div with new NetworkViewConfig and LocationViewConfig components. Add component imports at top of file.

- **`src/components/atc-config/commerce-characteristic-card.tsx`** (line 23) - Update AVAILABLE_CHANNELS constant from `['GrabMart', 'Line Man', 'Shopee', 'Lazada', 'Website', 'Mobile App']` to `['Tops Online', 'Lazada', 'Shopee', 'Grab', 'LINE MAN', 'Gookoo']`

- **`src/types/atc-config.ts`** - Enhance LocationOverride interface (lines 157-162) to add missing fields: `location_name`, `override_type`, `effective_from`, `effective_until`, `custom_rules` as specified in the feature spec

### New Files to Create:

- **`src/components/atc-config/network-view-config.tsx`** (estimated 250-300 lines) - New component implementing network-wide synchronization settings UI with:
  - Full sync toggle with warning alert
  - Threshold alert configuration (enable/disable, value, type, channels)
  - Sync frequency settings (interval slider, batch size, retry attempts)
  - Monitoring toggles (track duration, alert on failure)
  - Proper TypeScript typing using NetworkViewConfig interface

- **`src/components/atc-config/location-view-config.tsx`** (estimated 400-450 lines) - New component implementing location-specific override management UI with:
  - Sync type toggle (Full vs Delta)
  - Delta sync field multi-select
  - Conflict resolution strategy dropdown
  - Location overrides table with sortable columns
  - Add/Edit/Delete dialog for overrides
  - Date range picker for effective dates
  - Custom rules JSON editor for advanced overrides
  - Mock data integration using TOPS_STORES constant

## Step by Step Tasks

### 1. Enhance LocationOverride TypeScript Interface
- Open `src/types/atc-config.ts`
- Locate the LocationOverride interface (lines 157-162)
- Add missing fields as specified in feature spec:
  - `location_name: string`
  - `override_type: 'enable' | 'disable' | 'custom'`
  - `effective_from: string`
  - `effective_until?: string`
  - `custom_rules?: Partial<ATCConfiguration>`
- Ensure interface matches the enhanced spec exactly
- Save file and verify no TypeScript errors

### 2. Create Network View Configuration Component
- Create new file: `src/components/atc-config/network-view-config.tsx`
- Add 'use client' directive at top
- Import required UI components from shadcn/ui:
  - Card, CardHeader, CardContent, CardTitle, CardDescription
  - Switch, Label, Input, Slider, Checkbox, Alert
  - Select, SelectContent, SelectItem, SelectTrigger, SelectValue
- Import NetworkViewConfig type from `@/types/atc-config`
- Import icons from lucide-react (AlertTriangle for warnings)
- Define component props interface with `value` and `onChange`
- Implement component following the UI design in feature spec (lines 33-87):
  - Full Sync toggle with conditional warning alert
  - Threshold Alerts section with nested configuration:
    - Enable/disable toggle
    - Threshold value input (number)
    - Threshold type select (percentage/absolute)
    - Alert channels multi-select (email, SMS, MS Teams)
  - Sync Frequency section:
    - Interval slider (1-60 minutes) with live display
    - Batch size number input
    - Retry attempts number input
  - Monitoring section with checkboxes:
    - Track sync duration
    - Alert on failure
- Add proper state management for all form fields
- Implement onChange handlers that update parent component
- Add helper text for each field explaining purpose
- Use consistent spacing (space-y-4, space-y-6) matching other components
- Export component as default

### 3. Create Location View Configuration Component
- Create new file: `src/components/atc-config/location-view-config.tsx`
- Add 'use client' directive at top
- Import required UI components:
  - Card, CardHeader, CardContent, CardTitle, CardDescription
  - Switch, Label, Input, RadioGroup, RadioGroupItem
  - Button, Badge, Table components, Dialog components
  - Select, Checkbox, Textarea
- Import LocationViewConfig, LocationOverride types
- Import icons: Plus, Pencil, Trash2, Calendar
- Define TOPS_STORES constant array with 8 Tops locations (as specified in spec lines 361-370)
- Define SYNC_FIELDS constant array for delta sync field options:
  - ['quantity', 'price', 'status', 'threshold', 'priority', 'custom_rules']
- Implement main component with state management:
  - syncType state (full/delta)
  - selectedFields state for delta sync
  - conflictStrategy state
  - overrides state (array of LocationOverride objects)
  - dialogOpen state for Add/Edit dialog
  - editingOverride state (current override being edited)
- Implement Sync Type section:
  - RadioGroup with Full Sync and Delta Sync options
  - Conditional rendering of Delta sync configuration:
    - Multi-select for sync fields
    - Select dropdown for conflict resolution strategy (latest_wins, manual_review, priority_based)
- Implement Location Overrides Table:
  - Table header: Location, Override Type, Enabled, Threshold, Effective From, Effective Until, Actions
  - Map through overrides array to render TableRows
  - Display location_name, override_type badge, sync_enabled switch, threshold, dates
  - Action buttons: Edit (Pencil icon) and Delete (Trash2 icon)
  - Add Override button in header with Plus icon
- Implement Add/Edit Override Dialog:
  - Dialog with conditional title ("Add" vs "Edit Location Override")
  - Location select dropdown (populated from TOPS_STORES)
  - Override type select (enable, disable, custom)
  - Enable sync switch
  - Threshold number input
  - Effective date range picker (from/until)
  - Conditional custom rules textarea (shown when override_type === 'custom')
  - Cancel and Save buttons in DialogFooter
- Implement CRUD handlers:
  - addOverride() - Opens dialog with empty form
  - editOverride(override) - Opens dialog with populated form
  - deleteOverride(id) - Removes override from array
  - saveOverride() - Validates and saves override, updates parent via onChange
- Add proper form validation
- Ensure mobile-responsive design
- Export component as default

### 4. Update Channel List in Commerce Characteristic Card
- Open `src/components/atc-config/commerce-characteristic-card.tsx`
- Locate line 23 with AVAILABLE_CHANNELS constant
- Replace existing array:
  ```typescript
  // OLD:
  const AVAILABLE_CHANNELS = ['GrabMart', 'Line Man', 'Shopee', 'Lazada', 'Website', 'Mobile App']

  // NEW:
  const AVAILABLE_CHANNELS = ['Tops Online', 'Lazada', 'Shopee', 'Grab', 'LINE MAN', 'Gookoo']
  ```
- Save file

### 5. Integrate New Components into ATC Rule Section
- Open `src/components/atc-config/atc-rule-section.tsx`
- Add imports at top of file (after line 18):
  ```typescript
  import { NetworkViewConfig as NetworkViewConfigComponent } from './network-view-config'
  import { LocationViewConfig as LocationViewConfigComponent } from './location-view-config'
  ```
  Note: Use component aliases to avoid naming conflict with type imports
- Locate the Network View CardContent section (lines 126-187)
- Replace the basic form fields with:
  ```tsx
  <NetworkViewConfigComponent
    value={networkView}
    onChange={onNetworkViewChange}
  />
  ```
- Locate the Location View CardContent section (lines 201-236)
- Remove the placeholder dashed border div (lines 232-234)
- Replace all CardContent children with:
  ```tsx
  <LocationViewConfigComponent
    value={locationView}
    onChange={onLocationViewChange}
  />
  ```
- Keep the Card structure and headers intact
- Save file

### 6. Test Components in Development Mode
- Run development server: `pnpm dev`
- Navigate to ATC Configuration page in browser
- Test Network View Configuration:
  - Toggle Full Sync switch - verify warning alert appears/disappears
  - Enable Threshold Alert - verify nested fields become enabled
  - Adjust sync interval slider - verify value updates in real-time
  - Toggle monitoring checkboxes - verify state updates
  - Check that all changes propagate to parent component
- Test Location View Configuration:
  - Switch between Full Sync and Delta Sync - verify conditional rendering
  - Select delta sync fields - verify multi-select works
  - Choose conflict resolution strategy - verify dropdown works
  - Click "Add Override" - verify dialog opens
  - Fill out override form completely - verify all fields work
  - Save override - verify it appears in table
  - Edit existing override - verify form pre-populates correctly
  - Delete override - verify it removes from table
  - Test effective date range picker
  - Test custom rules textarea for 'custom' override type
- Test mobile responsiveness:
  - Resize browser to mobile width (< 640px)
  - Verify all cards stack vertically
  - Verify tables are scrollable
  - Verify dialog is mobile-friendly
- Verify no console errors or warnings
- Check TypeScript compilation with `pnpm build`

### 7. Validate Integration and Data Flow
- Verify that Network View changes update parent state correctly
- Verify that Location View changes update parent state correctly
- Check that ATC Configuration page can save all new fields
- Verify channel list shows new values throughout the app
- Test that overrides persist when switching between tabs
- Ensure proper error handling for invalid inputs
- Verify proper TypeScript typing - no `any` types
- Check console for warnings or errors
- Validate against feature spec requirements (lines 334-386)

### 8. Code Quality and Style Consistency
- Review all new code for consistency with existing patterns
- Ensure all components follow mobile-first responsive design
- Verify consistent spacing using Tailwind utility classes (space-y-4, gap-4, etc.)
- Check that all UI components match shadcn/ui usage patterns
- Ensure proper accessibility attributes (labels, aria-labels)
- Add JSDoc comments to exported components and complex functions
- Format code using project formatter
- Remove any unused imports
- Verify no console.log statements in production code

### 9. Final Build Validation
- Run full production build: `pnpm build`
- Verify zero TypeScript errors
- Verify zero ESLint errors
- Check build output for warnings
- Verify bundle size is reasonable
- Test production build locally: `pnpm start`
- Navigate through ATC Configuration page
- Verify all functionality works in production mode

## Validation Commands
Execute these commands to validate the chore is complete:

- `pnpm build` - Build the project and verify no TypeScript or build errors
- `pnpm lint` - Run ESLint to check for code quality issues
- `pnpm dev` - Start development server and manually test all functionality at http://localhost:3000/atc-config
- Visual validation in browser:
  - Test Network View Config component renders correctly
  - Test Location View Config component renders correctly
  - Verify Add/Edit/Delete override dialog functionality
  - Test form validations and state management
  - Verify channel list shows: Tops Online, Lazada, Shopee, Grab, LINE MAN, Gookoo
  - Test mobile responsiveness at various breakpoints
  - Check browser console for errors/warnings
- TypeScript type checking: `pnpm tsc --noEmit` (if available)
- Verify against feature spec checklist (lines 334-343):
  - ✓ network-view-config.tsx created (250-300 lines)
  - ✓ location-view-config.tsx created (400-450 lines)
  - ✓ atc-rule-section.tsx updated with component integration
  - ✓ commerce-characteristic-card.tsx channel list updated
  - ✓ LocationOverride interface enhanced in atc-config.ts

## Notes

### Design Consistency Guidelines
- Follow existing Omnia UI component patterns found in `condition-cards.tsx` and other atc-config components
- Use mobile-first responsive design with consistent breakpoints (sm, md, lg, xl)
- Match spacing conventions: `space-y-4` for form sections, `space-y-6` for card sections
- Use same card/form layouts as Phase 1 components for visual consistency
- Maintain consistent icon usage (lucide-react icons throughout)

### Data Management Notes
- Components use controlled form pattern with `value` and `onChange` props
- All state updates must propagate to parent component via onChange callbacks
- Use mock TOPS_STORES data for location selection (Supabase integration deferred to future phase)
- LocationOverride objects require unique IDs - use crypto.randomUUID() or Date.now() for generation
- Custom rules field accepts partial ATCConfiguration for advanced overrides

### TypeScript Best Practices
- Use explicit type imports from `@/types/atc-config`
- Avoid `any` types - use proper interfaces throughout
- Ensure all event handlers have correct TypeScript signatures
- Use optional chaining (?.) for potentially undefined fields
- Component props should have explicit interface definitions

### Performance Considerations
- Table rendering with large override lists should be performant (currently limited to ~8 stores)
- Dialog open/close should not cause re-renders of parent component
- Form state updates should be debounced if needed for large datasets
- Consider useMemo for expensive calculations if table grows

### Future Enhancements (Out of Scope)
- Supabase integration for persisting location overrides
- Real-time sync status indicators
- Advanced conflict resolution UI with diff viewer
- Bulk import/export of location overrides
- Audit trail for override changes
- Multi-location bulk operations
