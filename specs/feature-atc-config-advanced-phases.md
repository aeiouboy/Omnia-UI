# Feature: ATC Configuration - Advanced Features (Phase 2 & 3)

## Overview
This specification covers the advanced features for the ATC Configuration page that build upon the Phase 1 MVP implementation. These features add comprehensive rule management, testing capabilities, and analytics.

## Dependencies
- **Prerequisite**: Phase 1 MVP must be completed
- **Files to extend**:
  - `/app/atc-config/page.tsx`
  - `/src/components/atc-config/*`
  - `/src/lib/atc-config-service.ts`
  - `/src/types/atc-config.ts`

## Phase 2: Advanced Rule Configuration & Testing

### 2.1 Advanced Condition Types

#### Inventory Protection Condition
Add protection rules for safety stock and reserved inventory:

```typescript
interface InventoryProtection {
  id: string
  enabled: boolean
  safety_stock_settings: {
    enabled: boolean
    threshold: number
    threshold_type: 'percentage' | 'absolute'
    apply_to: string[] // product categories
  }
  reserved_inventory: {
    enabled: boolean
    reservation_types: string[] // e.g., 'pre-order', 'hold', 'pending'
    auto_release: boolean
    release_after_minutes: number
  }
  protection_threshold: {
    min_available: number
    buffer_percentage: number
  }
}
```

**Component**: `src/components/atc-config/inventory-protection-card.tsx`
- Toggle to enable/disable protection
- Safety stock threshold input (percentage or absolute value)
- Product category multi-select
- Reserved inventory type checkboxes
- Auto-release toggle with time input
- Protection threshold configuration

#### Commerce Characteristic Condition
Channel-specific rules for different commerce platforms:

```typescript
interface CommerceCharacteristic {
  id: string
  enabled: boolean
  channel_rules: ChannelRule[]
  order_type_filters: string[] // e.g., 'delivery', 'pickup', 'dine-in'
  customer_segments: {
    enabled: boolean
    segments: string[] // e.g., 'vip', 'regular', 'new'
    priority_order: string[]
  }
  time_based_rules: {
    enabled: boolean
    peak_hours: TimeSlot[]
    off_peak_hours: TimeSlot[]
    different_availability: boolean
  }
}

interface ChannelRule {
  channel: string // 'Grab', 'FoodPanda', 'LINE MAN', etc.
  enabled: boolean
  priority: number
  allocation_percentage: number
}

interface TimeSlot {
  day_of_week: number[] // 0-6
  start_time: string // "HH:mm"
  end_time: string // "HH:mm"
}
```

**Component**: `src/components/atc-config/commerce-characteristic-card.tsx`
- Channel selection with priority and allocation settings
- Order type filter checkboxes
- Customer segment configuration
- Time-based availability rules (peak/off-peak hours)
- Visual time slot picker

#### Regional Availability Rule
Geographic restrictions and delivery zone configuration:

```typescript
interface RegionalAvailability {
  id: string
  enabled: boolean
  regional_coverage: {
    regions: RegionConfig[]
    default_available: boolean
  }
  geographic_restrictions: {
    enabled: boolean
    restricted_areas: GeoArea[]
    restriction_reason: string
  }
  delivery_zones: {
    enabled: boolean
    zones: DeliveryZone[]
    zone_priority: string[]
  }
}

interface RegionConfig {
  region_id: string
  region_name: string
  enabled: boolean
  available_channels: string[]
}

interface GeoArea {
  area_id: string
  area_name: string
  coordinates?: { lat: number; lng: number }[]
  postal_codes?: string[]
}

interface DeliveryZone {
  zone_id: string
  zone_name: string
  radius_km: number
  center_point: { lat: number; lng: number }
  delivery_fee: number
  min_order_value: number
}
```

**Component**: `src/components/atc-config/regional-availability-card.tsx`
- Region selection with channel availability
- Geographic restriction area picker
- Delivery zone configurator (map integration optional)
- Zone priority drag-and-drop list

### 2.2 Network & Location View Configuration

#### Network View Settings
System-wide synchronization configuration:

**Component**: `src/components/atc-config/network-view-config.tsx`
```typescript
interface NetworkViewConfig {
  full_sync: boolean
  threshold_alert: {
    enabled: boolean
    threshold_value: number
    threshold_type: 'percentage' | 'absolute'
    alert_channels: string[] // 'email', 'sms', 'teams'
  }
  sync_frequency: {
    interval_minutes: number
    batch_size: number
    retry_attempts: number
  }
  monitoring: {
    enabled: boolean
    track_sync_duration: boolean
    alert_on_failure: boolean
  }
}
```

**UI Features**:
- Full sync toggle with warning message
- Threshold alert configuration
- Sync frequency slider (1-60 minutes)
- Batch size input
- Monitoring toggle
- Alert channel multi-select

#### Location View Settings
Store-specific overrides and delta sync:

**Component**: `src/components/atc-config/location-view-config.tsx`
```typescript
interface LocationViewConfig {
  full_sync: boolean
  delta_sync: {
    enabled: boolean
    sync_fields: string[]
    conflict_resolution: 'latest_wins' | 'manual_review'
  }
  location_overrides: LocationOverride[]
}

interface LocationOverride {
  location_id: string
  location_name: string
  override_type: 'enable' | 'disable' | 'custom'
  custom_rules?: Partial<ATCConfiguration>
  effective_from: string
  effective_until?: string
}
```

**UI Features**:
- Full sync vs delta sync toggle
- Sync field selection
- Conflict resolution strategy dropdown
- Location override table with actions
- Override rule builder dialog
- Effective date range picker

### 2.3 Rule Testing Functionality

**Component**: `src/components/atc-config/rule-tester.tsx`

#### Test Interface
Allow administrators to test ATC rules before publishing:

```typescript
interface RuleTestRequest {
  config_id: string
  test_cases: TestCase[]
}

interface TestCase {
  test_name: string
  product_data: {
    sku: string
    category: string
    item_type: string
  }
  location_data: {
    store_id: string
    region: string
    zone: string
  }
  inventory_data: {
    on_hand: number
    available: number
    reserved: number
    safety_stock: number
  }
  context: {
    channel: string
    order_type: string
    customer_segment: string
    timestamp: string
  }
}

interface RuleTestResult {
  test_case: TestCase
  result: {
    available_to_commerce: boolean
    matched_rules: MatchedRule[]
    failed_conditions: string[]
    recommendation: string
  }
}

interface MatchedRule {
  rule_type: string
  rule_id: string
  condition: string
  result: boolean
}
```

**UI Features**:
- Test case builder form
- Quick test with sample data button
- Batch test with CSV upload
- Test result display with:
  - Pass/fail status
  - Matched rules list
  - Failed condition details
  - Visual rule flow diagram
- Save test cases for regression testing
- Export test results

**API Endpoint**: `POST /api/atc-config/:id/test`

### 2.4 Version History

**Component**: `src/components/atc-config/version-history.tsx`

Track and compare configuration versions:

```typescript
interface ConfigVersion {
  version_id: string
  config_id: string
  version_number: number
  created_at: string
  created_by: string
  change_description: string
  changes_summary: {
    added: string[]
    modified: string[]
    removed: string[]
  }
  config_snapshot: ATCConfiguration
}
```

**UI Features**:
- Version timeline view
- Version comparison (diff view)
- Restore to previous version
- Version annotations
- Change summary visualization
- User attribution

**API Endpoints**:
```
GET /api/atc-config/:id/versions
GET /api/atc-config/:id/versions/:version_id
POST /api/atc-config/:id/restore/:version_id
```

## Phase 3: Advanced Analytics & Visualization

### 3.1 Visual Flow Diagram

**Component**: `src/components/atc-config/visual-flow-diagram.tsx`

Interactive visual representation of the OMS flow:

**Features**:
- SVG-based diagram matching the OMS overview
- Highlight active sections based on configuration
- Show data flow with animated arrows
- Click sections to edit related configuration
- Real-time preview of rule impact
- Export diagram as PNG/PDF

**Libraries**:
- React Flow or D3.js for visualization
- HTML-to-Image for export

### 3.2 Import/Export Configuration

**Component**: `src/components/atc-config/import-export-panel.tsx`

#### Export Functionality
```typescript
interface ExportFormat {
  format: 'json' | 'yaml' | 'excel'
  include_metadata: boolean
  include_history: boolean
  encrypt: boolean
}
```

**Features**:
- Export as JSON (full configuration)
- Export as YAML (human-readable)
- Export as Excel (for business users)
- Include/exclude metadata and history
- Optional encryption for sensitive data
- Generate export report

#### Import Functionality
```typescript
interface ImportValidation {
  format_valid: boolean
  schema_valid: boolean
  conflicts: ImportConflict[]
  warnings: string[]
}

interface ImportConflict {
  field_path: string
  current_value: any
  imported_value: any
  resolution: 'keep_current' | 'use_imported' | 'merge'
}
```

**Features**:
- Import from JSON/YAML/Excel
- Pre-import validation
- Conflict detection and resolution
- Preview before import
- Rollback capability
- Import audit log

**API Endpoints**:
```
POST /api/atc-config/export
POST /api/atc-config/import/validate
POST /api/atc-config/import/execute
```

### 3.3 Conflict Detection

**Component**: `src/components/atc-config/conflict-detector.tsx`

Detect overlapping or contradictory rules:

```typescript
interface RuleConflict {
  conflict_id: string
  severity: 'error' | 'warning' | 'info'
  conflict_type: 'overlap' | 'contradiction' | 'ambiguity'
  rules_involved: string[]
  description: string
  affected_items: {
    count: number
    examples: string[]
  }
  suggestion: string
}
```

**Detection Logic**:
- Overlapping item conditions (same SKU in multiple rules)
- Contradictory availability settings
- Ambiguous priority rules
- Missing fallback configurations
- Unreachable rules (never triggered)

**UI Features**:
- Real-time conflict detection as rules are configured
- Conflict severity indicators (red/yellow/blue)
- Detailed conflict explanation
- Suggested resolution actions
- Auto-fix for simple conflicts
- Conflict resolution wizard

### 3.4 Impact Analysis

**Component**: `src/components/atc-config/impact-analyzer.tsx`

Analyze the impact of configuration changes:

```typescript
interface ImpactAnalysis {
  analysis_id: string
  config_id: string
  analysis_date: string
  affected_items: {
    total_count: number
    newly_available: number
    newly_unavailable: number
    unchanged: number
  }
  affected_locations: {
    total_count: number
    affected_stores: StoreImpact[]
  }
  channel_impact: ChannelImpact[]
  estimated_revenue_impact: {
    potential_increase: number
    potential_decrease: number
    net_impact: number
    confidence: number
  }
}

interface StoreImpact {
  store_id: string
  store_name: string
  impact_type: 'positive' | 'negative' | 'neutral'
  affected_items: number
  estimated_order_impact: number
}

interface ChannelImpact {
  channel: string
  availability_change_percentage: number
  estimated_order_impact: number
}
```

**UI Features**:
- Before/after comparison
- Item availability heatmap by store
- Channel impact bar chart
- Revenue impact projection
- Affected SKU list with filters
- Export impact report
- Simulation mode (what-if analysis)

**API Endpoint**: `POST /api/atc-config/:id/analyze-impact`

## Database Schema Extensions

### Additional Tables for Phase 2/3

```sql
-- Configuration Version History (already planned, enhanced)
ALTER TABLE atc_configuration_history
ADD COLUMN changes_summary JSONB,
ADD COLUMN restored_from UUID REFERENCES atc_configuration_history(id);

-- Configuration Test Cases
CREATE TABLE atc_test_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID REFERENCES atc_configurations(id),
  test_name TEXT NOT NULL,
  test_data JSONB NOT NULL,
  expected_result BOOLEAN,
  last_run_result JSONB,
  last_run_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Configuration Conflicts
CREATE TABLE atc_configuration_conflicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID REFERENCES atc_configurations(id),
  conflict_type TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('error', 'warning', 'info')),
  conflict_data JSONB NOT NULL,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Configuration Impact Analysis
CREATE TABLE atc_impact_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID REFERENCES atc_configurations(id),
  analysis_type TEXT NOT NULL,
  analysis_data JSONB NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_test_cases_config ON atc_test_cases(config_id);
CREATE INDEX idx_conflicts_config ON atc_configuration_conflicts(config_id);
CREATE INDEX idx_impact_config ON atc_impact_analyses(config_id);
```

## API Endpoints Summary

### Phase 2 Endpoints
```
POST   /api/atc-config/:id/test              # Test configuration
GET    /api/atc-config/:id/versions          # Get version history
GET    /api/atc-config/:id/versions/:vid     # Get specific version
POST   /api/atc-config/:id/restore/:vid      # Restore version
GET    /api/atc-config/:id/conflicts         # Get conflicts
POST   /api/atc-config/:id/conflicts/resolve # Resolve conflict
```

### Phase 3 Endpoints
```
POST   /api/atc-config/export                # Export configuration
POST   /api/atc-config/import/validate       # Validate import
POST   /api/atc-config/import/execute        # Execute import
POST   /api/atc-config/:id/analyze-impact    # Impact analysis
GET    /api/atc-config/:id/flow-diagram      # Get flow diagram data
```

## Service Layer Extensions

### Files to Create/Update

1. **`src/lib/atc-rule-engine.ts`** (NEW)
   - Rule evaluation logic
   - Conflict detection algorithms
   - Rule matching engine

2. **`src/lib/atc-validation.ts`** (NEW)
   - Configuration validation
   - Import validation
   - Schema validation

3. **`src/lib/atc-testing-service.ts`** (NEW)
   - Test case execution
   - Result comparison
   - Test report generation

4. **`src/lib/atc-impact-analyzer.ts`** (NEW)
   - Impact calculation
   - Revenue estimation
   - Store/channel analysis

5. **Update `src/lib/atc-config-service.ts`**
   - Add version management methods
   - Add export/import methods
   - Add conflict detection methods

## Component Structure

```
src/components/atc-config/
  # Phase 1 (already in progress)
  inventory-supply-section.tsx
  atc-rule-section.tsx
  condition-cards.tsx

  # Phase 2 Components
  inventory-protection-card.tsx
  commerce-characteristic-card.tsx
  regional-availability-card.tsx
  network-view-config.tsx
  location-view-config.tsx
  rule-tester.tsx
  version-history.tsx

  # Phase 3 Components
  visual-flow-diagram.tsx
  import-export-panel.tsx
  conflict-detector.tsx
  impact-analyzer.tsx

  # Shared Components
  rule-preview.tsx
  config-diff-viewer.tsx
  time-slot-picker.tsx
```

## Implementation Priority

### Phase 2 (Current - Parallel Development)
1. Advanced condition cards (Inventory Protection, Commerce, Regional)
2. Network/Location view configuration
3. Rule testing functionality
4. Version history

### Phase 3 (After Phase 2 Complete)
1. Visual flow diagram
2. Import/Export functionality
3. Conflict detection
4. Impact analysis

## Testing Requirements

### Unit Tests
- Rule evaluation logic
- Conflict detection algorithms
- Import validation
- Impact calculation

### Integration Tests
- API endpoint testing
- Database transaction testing
- Version restore functionality

### E2E Tests
- Complete configuration workflow
- Rule testing workflow
- Import/export workflow
- Conflict resolution workflow

## Success Criteria

### Phase 2
- All advanced conditions can be configured via UI
- Rule testing produces accurate results
- Version history is tracked and restorable
- Network/Location views are configurable

### Phase 3
- Visual flow diagram accurately represents configuration
- Import/Export works for all supported formats
- Conflicts are detected automatically
- Impact analysis provides actionable insights

## Notes
- Build upon Phase 1 MVP foundation
- Maintain consistent design patterns
- Follow mobile-first responsive design
- Use existing Omnia UI components where possible
- Implement progressive enhancement (works without advanced features)
