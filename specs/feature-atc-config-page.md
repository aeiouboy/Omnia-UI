# Feature: ATC Configuration Page

## Overview
Implement an Availability to Commerce (ATC) configuration page following the Manthantan OMS architecture. This page allows administrators to configure inventory supply rules and availability rules for commerce operations.

## Design Reference
Based on the OMS overview diagram showing:
1. Inventory Supply flow (Warehouse → Store → Supplier)
2. Inventory On Hand management
3. Supply Allocation rules
4. ATC Rule configuration with inclusion/exclusion logic

## Page Structure

### Route
- Path: `/app/atc-config/page.tsx`
- Menu: "ATC Config" in sidebar navigation

### Layout
The page should be organized into two main sections following the diagram flow:

#### Section 1: Inventory Supply Configuration
**Top section of the page - represents the inventory flow**

1. **Inventory Sources**
   - Three source types: Warehouse, Store, Supplier
   - Configuration for each source:
     - Enable/disable toggle
     - Priority order (drag-and-drop or number input)
     - Initial/Adjustment settings
     - Replacement rules

2. **Inventory On Hand Settings**
   - Available inventory types:
     - On Hand Available
     - PreOrder
   - Threshold settings
   - Buffer configuration

3. **Supply Allocation Rules**
   - Allocation strategy dropdown
   - Priority rules
   - Reservation settings

#### Section 2: ATC Rule Configuration
**Bottom section - Availability to Commerce rules**

1. **Rule Types (Inclusion/Exclusion)**
   - Toggle between Inclusion and Exclusion mode
   - Apply to selected conditions

2. **Condition Configuration** (Cards/Tabs layout)

   **a. Item Condition**
   - Item category filters
   - Product type selection
   - SKU patterns
   - Status filters

   **b. Location Condition**
   - Store selection (multi-select)
   - Region selection
   - Zone configuration
   - Warehouse mapping

   **c. Supply Type Condition**
   - Supply type dropdown (Warehouse, Store, Supplier, PreOrder)
   - Lead time configuration
   - Priority settings

   **d. Inventory Protection**
   - Safety stock settings
   - Reserved inventory rules
   - Protection threshold

   **e. Commerce Characteristic**
   - Channel-specific rules (Grab, FoodPanda, etc.)
   - Order type filters
   - Customer segment rules

   **f. Regional Availability Rule**
   - Regional coverage settings
   - Geographic restrictions
   - Delivery zone mapping

3. **View Configuration**

   **Network View:**
   - Full Sync toggle
   - Threshold alert settings
   - Sync frequency configuration

   **Location View:**
   - Full Sync toggle
   - Delta sync settings
   - Location-specific overrides

## UI/UX Requirements

### Design System
- Follow existing Omnia UI design patterns
- Use Radix UI components (Cards, Tabs, Toggles, Select, Multi-Select)
- Tailwind CSS for styling
- Mobile-responsive layout

### Component Structure
```
atc-config/
  page.tsx                          # Main page
src/components/atc-config/
  inventory-supply-section.tsx      # Top section
  atc-rule-section.tsx              # Bottom section
  condition-cards.tsx               # Individual condition configurators
  view-configuration.tsx            # Network/Location view settings
  rule-preview.tsx                  # Preview of configured rules
```

### Key Features

1. **Visual Flow Diagram**
   - Display a simplified version of the OMS flow
   - Highlight active sections
   - Show data flow direction with arrows

2. **Configuration Persistence**
   - Save configurations to Supabase
   - Auto-save draft changes
   - Version history
   - Export/Import configuration JSON

3. **Validation**
   - Real-time validation of rules
   - Conflict detection (e.g., overlapping conditions)
   - Warning messages for risky configurations

4. **Preview & Testing**
   - Rule preview panel
   - Test with sample inventory data
   - Impact analysis (how many items affected)

5. **Action Buttons**
   - Save Draft
   - Publish (activate rules)
   - Reset to Default
   - Export Config
   - Import Config

### Data Model

```typescript
interface ATCConfiguration {
  id: string
  name: string
  version: number
  status: 'draft' | 'active' | 'archived'
  created_at: string
  updated_at: string

  // Inventory Supply Settings
  inventory_supply: {
    sources: {
      warehouse: SourceConfig
      store: SourceConfig
      supplier: SourceConfig
    }
    on_hand: OnHandConfig
    allocation: AllocationConfig
  }

  // ATC Rules
  atc_rules: {
    mode: 'inclusion' | 'exclusion'
    conditions: {
      item: ItemCondition[]
      location: LocationCondition[]
      supply_type: SupplyTypeCondition[]
      inventory_protection: InventoryProtection
      commerce_characteristic: CommerceCharacteristic
      regional_availability: RegionalAvailability
    }
    views: {
      network: NetworkViewConfig
      location: LocationViewConfig
    }
  }
}

interface SourceConfig {
  enabled: boolean
  priority: number
  initial_adjustment: boolean
  replacement_rules: ReplacementRule[]
}

interface OnHandConfig {
  available_enabled: boolean
  preorder_enabled: boolean
  threshold: number
  buffer: number
}

interface AllocationConfig {
  strategy: 'FIFO' | 'LIFO' | 'Priority'
  priority_rules: PriorityRule[]
  reservation_enabled: boolean
}

interface ItemCondition {
  id: string
  category: string[]
  product_type: string[]
  sku_pattern: string
  status: string[]
}

interface LocationCondition {
  id: string
  stores: string[]
  regions: string[]
  zones: string[]
  warehouses: string[]
}

interface SupplyTypeCondition {
  id: string
  type: 'warehouse' | 'store' | 'supplier' | 'preorder'
  lead_time: number
  priority: number
}

interface NetworkViewConfig {
  full_sync: boolean
  threshold_alert: boolean
  threshold_value: number
  sync_frequency: number // minutes
}

interface LocationViewConfig {
  full_sync: boolean
  delta_sync: boolean
  location_overrides: LocationOverride[]
}
```

### Database Schema

Create new Supabase tables:

```sql
-- ATC Configurations table
CREATE TABLE atc_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  status TEXT CHECK (status IN ('draft', 'active', 'archived')),
  config_data JSONB NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ATC Configuration History (for versioning)
CREATE TABLE atc_configuration_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID REFERENCES atc_configurations(id),
  version INTEGER NOT NULL,
  config_data JSONB NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  change_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_atc_config_status ON atc_configurations(status);
CREATE INDEX idx_atc_config_history_config_id ON atc_configuration_history(config_id);
```

## User Flows

### 1. Create New Configuration
1. User navigates to "ATC Config" from sidebar
2. Clicks "New Configuration" button
3. Enters configuration name
4. Configures Inventory Supply settings (top section)
5. Configures ATC Rules (bottom section)
6. Reviews preview of rules
7. Saves as draft or publishes

### 2. Edit Existing Configuration
1. User navigates to "ATC Config"
2. Sees list of existing configurations
3. Selects configuration to edit
4. Makes changes
5. Saves new version or updates draft

### 3. Test Configuration
1. User configures rules
2. Clicks "Test Rules" button
3. Enters sample product/location data
4. System shows whether item would be available to commerce
5. Displays which rules matched/didn't match

## Technical Implementation Notes

### API Endpoints
```typescript
// Create/Update configuration
POST /api/atc-config
PUT /api/atc-config/:id

// Get configurations
GET /api/atc-config (list all)
GET /api/atc-config/:id (get specific)

// Test configuration
POST /api/atc-config/:id/test

// Publish configuration
POST /api/atc-config/:id/publish

// Export/Import
GET /api/atc-config/:id/export
POST /api/atc-config/import
```

### Services
- `src/lib/atc-config-service.ts` - CRUD operations
- `src/lib/atc-rule-engine.ts` - Rule evaluation logic
- `src/lib/atc-validation.ts` - Configuration validation

## Success Metrics
- Configuration can be saved and retrieved
- All rule types can be configured via UI
- Rules can be tested before publishing
- Mobile-responsive design works on tablets
- Configuration export/import works correctly

## Implementation Priority

### Phase 1 (MVP)
- Basic page structure
- Inventory Supply section UI
- Item, Location, Supply Type conditions
- Save/Load functionality
- Add to sidebar menu

### Phase 2
- Advanced conditions (Protection, Commerce, Regional)
- Network/Location view configuration
- Rule testing functionality
- Version history

### Phase 3
- Visual flow diagram
- Import/Export
- Conflict detection
- Impact analysis
