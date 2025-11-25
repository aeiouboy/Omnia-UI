/**
 * ATC (Availability to Commerce) Configuration Type Definitions
 *
 * These interfaces define the data models for configuring inventory supply rules
 * and availability rules for commerce operations in the Omnia OMS system.
 */

/**
 * Replacement rule for inventory source configuration
 */
export interface ReplacementRule {
  id: string
  from_source: 'warehouse' | 'store' | 'supplier'
  to_source: 'warehouse' | 'store' | 'supplier'
  condition: string
}

/**
 * Configuration for a single inventory source (Warehouse, Store, or Supplier)
 */
export interface SourceConfig {
  enabled: boolean
  priority: number
  initial_adjustment: boolean
  replacement_rules: ReplacementRule[]
}

/**
 * On-hand inventory configuration
 */
export interface OnHandConfig {
  available_enabled: boolean
  preorder_enabled: boolean
  threshold: number
  buffer: number
}

/**
 * Priority rule for allocation strategy
 */
export interface PriorityRule {
  id: string
  name: string
  priority: number
  condition: string
}

/**
 * Supply allocation configuration
 */
export interface AllocationConfig {
  strategy: 'FIFO' | 'LIFO' | 'Priority'
  priority_rules: PriorityRule[]
  reservation_enabled: boolean
}

/**
 * Item condition for ATC rules
 */
export interface ItemCondition {
  id: string
  category: string[]
  product_type: string[]
  sku_pattern: string
  status: string[]
}

/**
 * Location condition for ATC rules
 */
export interface LocationCondition {
  id: string
  stores: string[]
  regions: string[]
  zones: string[]
  warehouses: string[]
}

/**
 * Supply type condition for ATC rules
 */
export interface SupplyTypeCondition {
  id: string
  type: 'warehouse' | 'store' | 'supplier' | 'preorder'
  lead_time: number
  priority: number
}

/**
 * Safety stock settings for inventory protection
 */
export interface SafetyStockSettings {
  type: 'percentage' | 'absolute'
  value: number
  product_categories: string[]
}

/**
 * Reserved inventory configuration
 */
export interface ReservedInventoryConfig {
  types: ('preorder' | 'hold' | 'pending')[]
  auto_release_enabled: boolean
  auto_release_hours: number
}

/**
 * Inventory protection configuration
 */
export interface InventoryProtection {
  enabled: boolean
  safety_stock: number
  reserved_inventory: boolean
  protection_threshold: number
  // Enhanced fields for Phase 2
  safety_stock_settings?: SafetyStockSettings
  reserved_inventory_config?: ReservedInventoryConfig
}

/**
 * Time slot for time-based rules
 */
export interface TimeSlot {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
  start_hour: number
  end_hour: number
}

/**
 * Channel rule configuration
 */
export interface ChannelRule {
  channel: string
  priority: number
  allocation_percentage: number
  enabled: boolean
}

/**
 * Commerce characteristic configuration
 */
export interface CommerceCharacteristic {
  enabled: boolean
  channels: string[]
  order_types: string[]
  customer_segments: string[]
  // Enhanced fields for Phase 2
  channel_rules?: ChannelRule[]
  time_based_rules?: TimeSlot[]
  peak_hours?: TimeSlot[]
  off_peak_hours?: TimeSlot[]
}

/**
 * Location override for location view configuration
 */
export interface LocationOverride {
  id: string
  location_id: string
  location_name: string
  override_type: 'enable' | 'disable' | 'custom'
  sync_enabled: boolean
  threshold: number
  effective_from: string
  effective_until?: string
  custom_rules?: Partial<ATCConfiguration>
}

/**
 * Region configuration
 */
export interface RegionConfig {
  region_id: string
  region_name: string
  enabled: boolean
  available_channels: string[]
}

/**
 * Geographic area restriction
 */
export interface GeoArea {
  id: string
  name: string
  type: 'city' | 'province' | 'district' | 'postal_code'
  value: string
  restriction_type: 'blocked' | 'allowed'
}

/**
 * Delivery zone configuration
 */
export interface DeliveryZone {
  id: string
  name: string
  priority: number
  areas: string[]
  enabled: boolean
}

/**
 * Regional availability configuration
 */
export interface RegionalAvailability {
  enabled: boolean
  regions: string[]
  geographic_restrictions: string[]
  delivery_zones: string[]
  // Enhanced fields for Phase 2
  regional_coverage?: RegionConfig[]
  geo_areas?: GeoArea[]
  delivery_zone_config?: DeliveryZone[]
}

/**
 * Network view configuration
 */
export interface NetworkViewConfig {
  full_sync: boolean
  threshold_alert: {
    enabled: boolean
    threshold_value: number
    threshold_type: 'percentage' | 'absolute'
    alert_channels: string[]
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

/**
 * Location view configuration
 */
export interface LocationViewConfig {
  full_sync: boolean
  delta_sync: boolean
  location_overrides: LocationOverride[]
  // Enhanced fields for Phase 2
  delta_sync_fields?: string[]
  conflict_resolution_strategy?: 'latest_wins' | 'manual_review' | 'priority_based'
}

/**
 * Main ATC configuration interface
 * This is the root configuration object that gets persisted to the database
 */
export interface ATCConfiguration {
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

/**
 * Configuration history entry for versioning
 */
export interface ATCConfigurationHistory {
  id: string
  config_id: string
  version: number
  config_data: Omit<ATCConfiguration, 'id' | 'created_at' | 'updated_at'>
  changed_by?: string
  change_description?: string
  created_at: string
  changes_summary?: {
    added: string[]
    modified: string[]
    removed: string[]
  }
  restored_from?: string
}

/**
 * Version information for comparison
 */
export interface ConfigVersion {
  id: string
  version: number
  created_at: string
  changed_by?: string
  change_description?: string
  changes_summary?: {
    added: string[]
    modified: string[]
    removed: string[]
  }
}

/**
 * Test case for rule testing
 */
export interface TestCase {
  id: string
  config_id: string
  test_name: string
  test_data: {
    product?: {
      sku: string
      category: string
      product_type: string
      status: string
    }
    location?: {
      store_id?: string
      region?: string
      zone?: string
      warehouse_id?: string
    }
    inventory?: {
      available_qty: number
      reserved_qty: number
      safety_stock: number
    }
    context?: {
      channel: string
      order_type: string
      customer_segment: string
      timestamp: string
    }
  }
  expected_result: {
    should_match: boolean
    matched_rules?: string[]
    availability?: {
      is_available: boolean
      quantity: number
      source: string
    }
  }
  last_run_result?: {
    passed: boolean
    actual_result: unknown
    timestamp: string
  }
  created_at: string
  updated_at: string
}

/**
 * Rule test request
 */
export interface RuleTestRequest {
  test_data: TestCase['test_data']
  expected_result?: TestCase['expected_result']
}

/**
 * Matched rule in test result
 */
export interface MatchedRule {
  rule_id: string
  rule_type: 'item' | 'location' | 'supply_type' | 'inventory_protection' | 'commerce' | 'regional'
  priority: number
  conditions_met: string[]
}

/**
 * Rule test result
 */
export interface RuleTestResult {
  passed: boolean
  matched_rules: MatchedRule[]
  availability: {
    is_available: boolean
    quantity: number
    source: string
    reasons: string[]
  }
  execution_time_ms: number
  timestamp: string
}

/**
 * Rule conflict
 */
export interface RuleConflict {
  id: string
  config_id: string
  conflict_type: 'overlap' | 'contradiction' | 'ambiguity' | 'unreachable'
  severity: 'error' | 'warning' | 'info'
  description: string
  rules_involved: string[]
  affected_items: {
    count: number
    examples: string[]
  }
  suggested_resolution: string
  resolved: boolean
  resolution_notes?: string
  created_at: string
}

/**
 * Import validation result
 */
export interface ImportValidation {
  valid: boolean
  format: 'json' | 'yaml' | 'excel'
  errors: {
    field: string
    message: string
    severity: 'error' | 'warning'
  }[]
  conflicts: ImportConflict[]
  summary: {
    total_rules: number
    valid_rules: number
    invalid_rules: number
  }
}

/**
 * Import conflict
 */
export interface ImportConflict {
  type: 'duplicate' | 'override' | 'incompatible'
  existing_rule: string
  imported_rule: string
  description: string
  resolution_options: ('keep_current' | 'use_imported' | 'merge')[]
}

/**
 * Store impact analysis
 */
export interface StoreImpact {
  store_id: string
  store_name: string
  affected_items: number
  newly_available: number
  newly_unavailable: number
  impact_score: number
}

/**
 * Channel impact analysis
 */
export interface ChannelImpact {
  channel: string
  affected_items: number
  potential_orders_increase: number
  potential_orders_decrease: number
  net_impact: number
}

/**
 * Impact analysis result
 */
export interface ImpactAnalysis {
  id: string
  config_id: string
  analysis_type: 'pre_publish' | 'simulation' | 'historical'
  summary: {
    total_items_affected: number
    newly_available: number
    newly_unavailable: number
    unchanged: number
  }
  store_impact: StoreImpact[]
  channel_impact: ChannelImpact[]
  revenue_impact: {
    potential_increase: number
    potential_decrease: number
    net_impact: number
    confidence_level: 'high' | 'medium' | 'low'
  }
  affected_skus: {
    sku: string
    name: string
    before_status: 'available' | 'unavailable'
    after_status: 'available' | 'unavailable'
    affected_locations: number
  }[]
  created_at: string
}

/**
 * Export format
 */
export type ExportFormat = 'json' | 'yaml' | 'excel'

/**
 * Export options
 */
export interface ExportOptions {
  format: ExportFormat
  include_metadata: boolean
  include_history: boolean
  encrypt: boolean
  encryption_key?: string
}
