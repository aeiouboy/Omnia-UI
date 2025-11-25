/**
 * ATC Configuration Validation
 *
 * Validation logic for ATC configurations, import data, and schema validation
 */

import { ATCConfiguration, ImportValidation, ImportConflict } from '@/types/atc-config'

/**
 * Validate a complete configuration
 */
export function validateConfiguration(config: ATCConfiguration): {
  valid: boolean
  errors: { field: string; message: string }[]
} {
  const errors: { field: string; message: string }[] = []

  // Validate name
  if (!config.name || config.name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Configuration name is required' })
  }

  // Validate status
  if (!['draft', 'active', 'archived'].includes(config.status)) {
    errors.push({ field: 'status', message: 'Invalid status value' })
  }

  // Validate inventory supply sources
  const sources = config.inventory_supply.sources
  if (!sources.warehouse && !sources.store && !sources.supplier) {
    errors.push({
      field: 'inventory_supply.sources',
      message: 'At least one inventory source must be configured',
    })
  }

  // Validate source priorities are unique
  const priorities = [
    sources.warehouse.enabled ? sources.warehouse.priority : null,
    sources.store.enabled ? sources.store.priority : null,
    sources.supplier.enabled ? sources.supplier.priority : null,
  ].filter((p) => p !== null)

  const uniquePriorities = new Set(priorities)
  if (priorities.length !== uniquePriorities.size) {
    errors.push({
      field: 'inventory_supply.sources',
      message: 'Source priorities must be unique',
    })
  }

  // Validate on-hand configuration
  if (config.inventory_supply.on_hand.threshold < 0) {
    errors.push({
      field: 'inventory_supply.on_hand.threshold',
      message: 'Threshold cannot be negative',
    })
  }

  if (config.inventory_supply.on_hand.buffer < 0) {
    errors.push({
      field: 'inventory_supply.on_hand.buffer',
      message: 'Buffer cannot be negative',
    })
  }

  // Validate allocation strategy
  if (
    config.inventory_supply.allocation.strategy === 'Priority' &&
    config.inventory_supply.allocation.priority_rules.length === 0
  ) {
    errors.push({
      field: 'inventory_supply.allocation',
      message: 'Priority strategy requires at least one priority rule',
    })
  }

  // Validate ATC rules mode
  if (!['inclusion', 'exclusion'].includes(config.atc_rules.mode)) {
    errors.push({ field: 'atc_rules.mode', message: 'Invalid ATC rules mode' })
  }

  // Validate item conditions
  config.atc_rules.conditions.item.forEach((item, index) => {
    if (!item.id) {
      errors.push({
        field: `atc_rules.conditions.item[${index}].id`,
        message: 'Item condition ID is required',
      })
    }
  })

  // Validate location conditions
  config.atc_rules.conditions.location.forEach((location, index) => {
    if (!location.id) {
      errors.push({
        field: `atc_rules.conditions.location[${index}].id`,
        message: 'Location condition ID is required',
      })
    }
  })

  // Validate supply type conditions
  config.atc_rules.conditions.supply_type.forEach((supply, index) => {
    if (!supply.id) {
      errors.push({
        field: `atc_rules.conditions.supply_type[${index}].id`,
        message: 'Supply type condition ID is required',
      })
    }
    if (supply.lead_time < 0) {
      errors.push({
        field: `atc_rules.conditions.supply_type[${index}].lead_time`,
        message: 'Lead time cannot be negative',
      })
    }
  })

  // Validate inventory protection
  const protection = config.atc_rules.conditions.inventory_protection
  if (protection.enabled) {
    if (protection.safety_stock < 0) {
      errors.push({
        field: 'atc_rules.conditions.inventory_protection.safety_stock',
        message: 'Safety stock cannot be negative',
      })
    }
    if (protection.protection_threshold < 0) {
      errors.push({
        field: 'atc_rules.conditions.inventory_protection.protection_threshold',
        message: 'Protection threshold cannot be negative',
      })
    }

    // Validate safety stock settings if present
    if (protection.safety_stock_settings) {
      if (protection.safety_stock_settings.value < 0) {
        errors.push({
          field: 'atc_rules.conditions.inventory_protection.safety_stock_settings.value',
          message: 'Safety stock value cannot be negative',
        })
      }
      if (
        protection.safety_stock_settings.type === 'percentage' &&
        protection.safety_stock_settings.value > 100
      ) {
        errors.push({
          field: 'atc_rules.conditions.inventory_protection.safety_stock_settings.value',
          message: 'Percentage safety stock cannot exceed 100%',
        })
      }
    }

    // Validate reserved inventory config
    if (protection.reserved_inventory_config?.auto_release_enabled) {
      if (protection.reserved_inventory_config.auto_release_hours <= 0) {
        errors.push({
          field: 'atc_rules.conditions.inventory_protection.reserved_inventory_config.auto_release_hours',
          message: 'Auto-release hours must be positive',
        })
      }
    }
  }

  // Validate network view configuration
  const networkView = config.atc_rules.views.network
  if (networkView.sync_frequency && networkView.sync_frequency.interval_minutes <= 0) {
    errors.push({
      field: 'atc_rules.views.network.sync_frequency.interval_minutes',
      message: 'Sync frequency must be positive',
    })
  }
  if (networkView.sync_frequency && networkView.sync_frequency.batch_size <= 0) {
    errors.push({
      field: 'atc_rules.views.network.sync_frequency.batch_size',
      message: 'Batch size must be positive',
    })
  }
  if (networkView.sync_frequency && networkView.sync_frequency.retry_attempts < 0) {
    errors.push({
      field: 'atc_rules.views.network.sync_frequency.retry_attempts',
      message: 'Retry attempts cannot be negative',
    })
  }

  // Validate channel rules
  const commerce = config.atc_rules.conditions.commerce_characteristic
  if (commerce.enabled && commerce.channel_rules) {
    commerce.channel_rules.forEach((rule, index) => {
      if (rule.priority <= 0) {
        errors.push({
          field: `atc_rules.conditions.commerce_characteristic.channel_rules[${index}].priority`,
          message: 'Channel priority must be positive',
        })
      }
      if (rule.allocation_percentage < 0 || rule.allocation_percentage > 100) {
        errors.push({
          field: `atc_rules.conditions.commerce_characteristic.channel_rules[${index}].allocation_percentage`,
          message: 'Allocation percentage must be between 0 and 100',
        })
      }
    })
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate import data
 */
export function validateImport(
  data: unknown,
  format: 'json' | 'yaml' | 'excel',
  existingConfigs: ATCConfiguration[]
): ImportValidation {
  const errors: ImportValidation['errors'] = []
  const conflicts: ImportConflict[] = []

  try {
    // Basic structure validation
    if (!data || typeof data !== 'object') {
      errors.push({
        field: 'root',
        message: 'Invalid data structure',
        severity: 'error',
      })
      return {
        valid: false,
        format,
        errors,
        conflicts,
        summary: { total_rules: 0, valid_rules: 0, invalid_rules: 0 },
      }
    }

    // Try to parse as ATCConfiguration
    const config = data as Partial<ATCConfiguration>

    // Check mandatory fields
    const mandatoryFields = checkMandatoryFields(config)
    errors.push(...mandatoryFields)

    // Check value ranges
    const rangeErrors = checkValueRanges(config)
    errors.push(...rangeErrors)

    // Check for conflicts with existing configurations
    if (config.name) {
      const duplicate = existingConfigs.find((c) => c.name === config.name)
      if (duplicate) {
        conflicts.push({
          type: 'duplicate',
          existing_rule: duplicate.id,
          imported_rule: config.name,
          description: `Configuration with name "${config.name}" already exists`,
          resolution_options: ['keep_current', 'use_imported'],
        })
      }
    }

    // Count rules
    const totalRules =
      (config.atc_rules?.conditions.item?.length || 0) +
      (config.atc_rules?.conditions.location?.length || 0) +
      (config.atc_rules?.conditions.supply_type?.length || 0)

    const invalidRules = errors.filter((e) => e.severity === 'error').length

    return {
      valid: errors.filter((e) => e.severity === 'error').length === 0,
      format,
      errors,
      conflicts,
      summary: {
        total_rules: totalRules,
        valid_rules: totalRules - invalidRules,
        invalid_rules: invalidRules,
      },
    }
  } catch (error) {
    errors.push({
      field: 'root',
      message: `Failed to parse ${format} data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      severity: 'error',
    })

    return {
      valid: false,
      format,
      errors,
      conflicts,
      summary: { total_rules: 0, valid_rules: 0, invalid_rules: 0 },
    }
  }
}

/**
 * Check mandatory fields
 */
export function checkMandatoryFields(
  config: Partial<ATCConfiguration>
): ImportValidation['errors'] {
  const errors: ImportValidation['errors'] = []

  if (!config.name) {
    errors.push({ field: 'name', message: 'Configuration name is required', severity: 'error' })
  }

  if (!config.status) {
    errors.push({ field: 'status', message: 'Status is required', severity: 'warning' })
  }

  if (!config.inventory_supply) {
    errors.push({
      field: 'inventory_supply',
      message: 'Inventory supply configuration is required',
      severity: 'error',
    })
  }

  if (!config.atc_rules) {
    errors.push({
      field: 'atc_rules',
      message: 'ATC rules configuration is required',
      severity: 'error',
    })
  }

  return errors
}

/**
 * Check value ranges
 */
export function checkValueRanges(
  config: Partial<ATCConfiguration>
): ImportValidation['errors'] {
  const errors: ImportValidation['errors'] = []

  // Check inventory supply values
  if (config.inventory_supply) {
    if (config.inventory_supply.on_hand) {
      if (config.inventory_supply.on_hand.threshold < 0) {
        errors.push({
          field: 'inventory_supply.on_hand.threshold',
          message: 'Threshold cannot be negative',
          severity: 'error',
        })
      }
      if (config.inventory_supply.on_hand.buffer < 0) {
        errors.push({
          field: 'inventory_supply.on_hand.buffer',
          message: 'Buffer cannot be negative',
          severity: 'error',
        })
      }
    }
  }

  // Check ATC rules values
  if (config.atc_rules?.conditions.inventory_protection) {
    const protection = config.atc_rules.conditions.inventory_protection
    if (protection.safety_stock < 0) {
      errors.push({
        field: 'atc_rules.conditions.inventory_protection.safety_stock',
        message: 'Safety stock cannot be negative',
        severity: 'error',
      })
    }
  }

  return errors
}

/**
 * Validate schema using runtime type checking
 */
export function validateSchema(data: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Basic type checks
  if (!data || typeof data !== 'object') {
    errors.push('Data must be an object')
    return { valid: false, errors }
  }

  const config = data as Record<string, unknown>

  // Check required properties
  if (typeof config.name !== 'string') {
    errors.push('name must be a string')
  }

  if (
    config.status !== 'draft' &&
    config.status !== 'active' &&
    config.status !== 'archived'
  ) {
    errors.push('status must be "draft", "active", or "archived"')
  }

  if (!config.inventory_supply || typeof config.inventory_supply !== 'object') {
    errors.push('inventory_supply must be an object')
  }

  if (!config.atc_rules || typeof config.atc_rules !== 'object') {
    errors.push('atc_rules must be an object')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
