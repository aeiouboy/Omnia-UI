/**
 * ATC Rule Engine
 *
 * Core logic for evaluating ATC rules, detecting conflicts, and matching rules
 * against test data.
 */

import {
  ATCConfiguration,
  RuleTestRequest,
  RuleTestResult,
  MatchedRule,
  RuleConflict,
} from '@/types/atc-config'

/**
 * Evaluate a rule configuration against test data
 */
export function evaluateRule(
  config: ATCConfiguration,
  testData: RuleTestRequest['test_data']
): RuleTestResult {
  const startTime = performance.now()
  const matchedRules: MatchedRule[] = []

  // Check item conditions
  if (testData.product && config.atc_rules.conditions.item.length > 0) {
    config.atc_rules.conditions.item.forEach((condition, index) => {
      const conditionsMet: string[] = []

      // Check category match
      if (
        condition.category.length === 0 ||
        condition.category.includes(testData.product!.category)
      ) {
        conditionsMet.push('category')
      }

      // Check product type match
      if (
        condition.product_type.length === 0 ||
        condition.product_type.includes(testData.product!.product_type)
      ) {
        conditionsMet.push('product_type')
      }

      // Check SKU pattern match
      if (
        !condition.sku_pattern ||
        testData.product!.sku.includes(condition.sku_pattern)
      ) {
        conditionsMet.push('sku_pattern')
      }

      // Check status match
      if (
        condition.status.length === 0 ||
        condition.status.includes(testData.product!.status)
      ) {
        conditionsMet.push('status')
      }

      // If all conditions met, add to matched rules
      if (conditionsMet.length === 4) {
        matchedRules.push({
          rule_id: condition.id,
          rule_type: 'item',
          priority: index + 1,
          conditions_met: conditionsMet,
        })
      }
    })
  }

  // Check location conditions
  if (testData.location && config.atc_rules.conditions.location.length > 0) {
    config.atc_rules.conditions.location.forEach((condition, index) => {
      const conditionsMet: string[] = []

      // Check store match
      if (
        testData.location?.store_id &&
        (condition.stores.length === 0 || condition.stores.includes(testData.location.store_id))
      ) {
        conditionsMet.push('store')
      }

      // Check region match
      if (
        testData.location?.region &&
        (condition.regions.length === 0 || condition.regions.includes(testData.location.region))
      ) {
        conditionsMet.push('region')
      }

      // Check zone match
      if (
        testData.location?.zone &&
        (condition.zones.length === 0 || condition.zones.includes(testData.location.zone))
      ) {
        conditionsMet.push('zone')
      }

      // Check warehouse match
      if (
        testData.location?.warehouse_id &&
        (condition.warehouses.length === 0 ||
          condition.warehouses.includes(testData.location.warehouse_id))
      ) {
        conditionsMet.push('warehouse')
      }

      if (conditionsMet.length > 0) {
        matchedRules.push({
          rule_id: condition.id,
          rule_type: 'location',
          priority: index + 1,
          conditions_met: conditionsMet,
        })
      }
    })
  }

  // Check inventory protection
  if (
    testData.inventory &&
    config.atc_rules.conditions.inventory_protection.enabled
  ) {
    const protection = config.atc_rules.conditions.inventory_protection
    const conditionsMet: string[] = []

    // Check safety stock
    if (
      testData.inventory.available_qty >=
      (protection.safety_stock_settings?.value || protection.safety_stock)
    ) {
      conditionsMet.push('safety_stock')
    }

    // Check reserved inventory
    if (protection.reserved_inventory && testData.inventory.reserved_qty > 0) {
      conditionsMet.push('reserved_inventory')
    }

    // Check protection threshold
    if (testData.inventory.available_qty >= protection.protection_threshold) {
      conditionsMet.push('protection_threshold')
    }

    if (conditionsMet.length > 0) {
      matchedRules.push({
        rule_id: 'inventory_protection',
        rule_type: 'inventory_protection',
        priority: 100,
        conditions_met: conditionsMet,
      })
    }
  }

  // Check commerce characteristics
  if (testData.context && config.atc_rules.conditions.commerce_characteristic.enabled) {
    const commerce = config.atc_rules.conditions.commerce_characteristic
    const conditionsMet: string[] = []

    // Check channel
    if (
      commerce.channels.length === 0 ||
      commerce.channels.includes(testData.context.channel)
    ) {
      conditionsMet.push('channel')
    }

    // Check order type
    if (
      commerce.order_types.length === 0 ||
      commerce.order_types.includes(testData.context.order_type)
    ) {
      conditionsMet.push('order_type')
    }

    // Check customer segment
    if (
      commerce.customer_segments.length === 0 ||
      commerce.customer_segments.includes(testData.context.customer_segment)
    ) {
      conditionsMet.push('customer_segment')
    }

    if (conditionsMet.length > 0) {
      matchedRules.push({
        rule_id: 'commerce_characteristic',
        rule_type: 'commerce',
        priority: 90,
        conditions_met: conditionsMet,
      })
    }
  }

  // Determine availability based on matched rules and mode
  const isAvailable = determineAvailability(config, matchedRules, testData)
  const executionTime = performance.now() - startTime

  return {
    passed: isAvailable.is_available,
    matched_rules: matchedRules.sort((a, b) => a.priority - b.priority),
    availability: isAvailable,
    execution_time_ms: executionTime,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Determine availability based on matched rules and configuration mode
 */
function determineAvailability(
  config: ATCConfiguration,
  matchedRules: MatchedRule[],
  testData: RuleTestRequest['test_data']
): RuleTestResult['availability'] {
  const mode = config.atc_rules.mode
  const hasMatches = matchedRules.length > 0
  const reasons: string[] = []

  // Inclusion mode: Item is available if it matches at least one rule
  // Exclusion mode: Item is available if it doesn't match any rule
  let isAvailable = mode === 'inclusion' ? hasMatches : !hasMatches

  // Calculate quantity considering inventory protection
  let quantity = testData.inventory?.available_qty || 0
  const protection = config.atc_rules.conditions.inventory_protection

  if (protection.enabled) {
    const safetyStock = protection.safety_stock_settings?.value || protection.safety_stock
    const reservedQty = testData.inventory?.reserved_qty || 0
    quantity = Math.max(0, quantity - safetyStock - reservedQty)

    if (quantity < protection.protection_threshold) {
      isAvailable = false
      reasons.push('Below protection threshold')
    }
  }

  // Determine source based on matched supply type rules
  let source = 'warehouse'
  const supplyTypeMatch = matchedRules.find((r) => r.rule_type === 'supply_type')
  if (supplyTypeMatch) {
    const supplyRule = config.atc_rules.conditions.supply_type.find(
      (s) => s.id === supplyTypeMatch.rule_id
    )
    if (supplyRule) {
      source = supplyRule.type
    }
  }

  // Add reasons based on mode and matches
  if (mode === 'inclusion') {
    if (hasMatches) {
      reasons.push(`Matched ${matchedRules.length} inclusion rule(s)`)
    } else {
      reasons.push('No matching inclusion rules')
    }
  } else {
    if (hasMatches) {
      reasons.push(`Matched ${matchedRules.length} exclusion rule(s) - item blocked`)
    } else {
      reasons.push('No exclusion rules matched - item available')
    }
  }

  return {
    is_available: isAvailable && quantity > 0,
    quantity,
    source,
    reasons,
  }
}

/**
 * Detect conflicts in a configuration
 */
export function detectConflicts(config: ATCConfiguration): RuleConflict[] {
  const conflicts: RuleConflict[] = []

  // Detect overlapping item rules (same SKU/category in multiple rules)
  const itemOverlaps = detectItemOverlaps(config)
  conflicts.push(...itemOverlaps)

  // Detect contradictory availability settings
  const contradictions = detectContradictions(config)
  conflicts.push(...contradictions)

  // Detect unreachable rules (shadowed by higher priority rules)
  const unreachable = detectUnreachableRules(config)
  conflicts.push(...unreachable)

  return conflicts
}

/**
 * Detect overlapping item conditions
 */
function detectItemOverlaps(config: ATCConfiguration): RuleConflict[] {
  const conflicts: RuleConflict[] = []
  const items = config.atc_rules.conditions.item

  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const rule1 = items[i]
      const rule2 = items[j]

      // Check for category overlap
      const categoryOverlap = rule1.category.some((c) => rule2.category.includes(c))
      const typeOverlap = rule1.product_type.some((t) => rule2.product_type.includes(t))

      if (categoryOverlap && typeOverlap) {
        conflicts.push({
          id: `overlap-${Date.now()}-${i}-${j}`,
          config_id: config.id,
          conflict_type: 'overlap',
          severity: 'warning',
          description: `Rules ${i + 1} and ${j + 1} have overlapping item conditions`,
          rules_involved: [rule1.id, rule2.id],
          affected_items: {
            count: 0, // Would need actual inventory data to calculate
            examples: [],
          },
          suggested_resolution: 'Review and consolidate overlapping rules or adjust priorities',
          resolved: false,
          created_at: new Date().toISOString(),
        })
      }
    }
  }

  return conflicts
}

/**
 * Detect contradictory settings
 */
function detectContradictions(config: ATCConfiguration): RuleConflict[] {
  const conflicts: RuleConflict[] = []

  // Check if inventory protection is enabled but safety stock is 0
  if (
    config.atc_rules.conditions.inventory_protection.enabled &&
    config.atc_rules.conditions.inventory_protection.safety_stock === 0
  ) {
    conflicts.push({
      id: `contradiction-${Date.now()}-protection`,
      config_id: config.id,
      conflict_type: 'contradiction',
      severity: 'warning',
      description: 'Inventory protection is enabled but safety stock is set to 0',
      rules_involved: ['inventory_protection'],
      affected_items: {
        count: 0,
        examples: [],
      },
      suggested_resolution: 'Set a non-zero safety stock value or disable inventory protection',
      resolved: false,
      created_at: new Date().toISOString(),
    })
  }

  return conflicts
}

/**
 * Detect unreachable rules (rules that can never match due to higher priority rules)
 */
function detectUnreachableRules(config: ATCConfiguration): RuleConflict[] {
  const conflicts: RuleConflict[] = []

  // For exclusion mode, check if there are catch-all rules that would block everything
  if (config.atc_rules.mode === 'exclusion') {
    const items = config.atc_rules.conditions.item
    const catchAllIndex = items.findIndex(
      (rule) =>
        rule.category.length === 0 &&
        rule.product_type.length === 0 &&
        !rule.sku_pattern
    )

    if (catchAllIndex >= 0 && catchAllIndex < items.length - 1) {
      conflicts.push({
        id: `unreachable-${Date.now()}-catchall`,
        config_id: config.id,
        conflict_type: 'unreachable',
        severity: 'error',
        description: `Rule ${catchAllIndex + 1} is a catch-all exclusion that makes subsequent rules unreachable`,
        rules_involved: [items[catchAllIndex].id],
        affected_items: {
          count: 0,
          examples: [],
        },
        suggested_resolution: 'Move catch-all rule to the end or make it more specific',
        resolved: false,
        created_at: new Date().toISOString(),
      })
    }
  }

  return conflicts
}

/**
 * Match rules against context to determine applicable rules
 */
export function matchRules(
  config: ATCConfiguration,
  context: RuleTestRequest['test_data']
): MatchedRule[] {
  const result = evaluateRule(config, context)
  return result.matched_rules
}

/**
 * Validate rule priority to check for unreachable rules
 */
export function validateRulePriority(config: ATCConfiguration): {
  valid: boolean
  issues: string[]
} {
  const issues: string[] = []

  // Check for duplicate priorities
  const priorities = config.atc_rules.conditions.item.map((_, i) => i + 1)
  const uniquePriorities = new Set(priorities)
  if (priorities.length !== uniquePriorities.size) {
    issues.push('Duplicate priorities detected in item rules')
  }

  // Check for gaps in priority sequence
  const sortedPriorities = [...priorities].sort((a, b) => a - b)
  for (let i = 1; i < sortedPriorities.length; i++) {
    if (sortedPriorities[i] - sortedPriorities[i - 1] > 1) {
      issues.push(`Gap in priority sequence between ${sortedPriorities[i - 1]} and ${sortedPriorities[i]}`)
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  }
}
