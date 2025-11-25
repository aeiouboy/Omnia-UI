/**
 * ATC Configuration Service Layer
 *
 * Provides CRUD operations for ATC (Availability to Commerce) configuration data.
 * Supports dual data strategy: Supabase database (primary) with fallback to mock data.
 * Follows the same pattern as inventory-service.ts.
 */

import { supabase } from "./supabase"
import type {
  ATCConfiguration,
  ATCConfigurationHistory,
  SourceConfig,
  OnHandConfig,
  AllocationConfig,
} from "@/types/atc-config"

/**
 * Check if Supabase is available and properly configured
 */
function isSupabaseAvailable(): boolean {
  return (
    supabase !== null &&
    typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
    process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== "" &&
    typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0 &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== ""
  )
}

/**
 * Default ATC configuration template
 * Used for "Reset to Default" and initial configuration
 */
export function getDefaultATCConfiguration(): Omit<
  ATCConfiguration,
  "id" | "created_at" | "updated_at"
> {
  return {
    name: "Default Configuration",
    version: 1,
    status: "draft",
    inventory_supply: {
      sources: {
        warehouse: {
          enabled: true,
          priority: 1,
          initial_adjustment: true,
          replacement_rules: [],
        },
        store: {
          enabled: true,
          priority: 2,
          initial_adjustment: false,
          replacement_rules: [],
        },
        supplier: {
          enabled: true,
          priority: 3,
          initial_adjustment: false,
          replacement_rules: [],
        },
      },
      on_hand: {
        available_enabled: true,
        preorder_enabled: false,
        threshold: 10,
        buffer: 5,
      },
      allocation: {
        strategy: "FIFO",
        priority_rules: [],
        reservation_enabled: false,
      },
    },
    atc_rules: {
      mode: "inclusion",
      conditions: {
        item: [],
        location: [],
        supply_type: [],
        inventory_protection: {
          enabled: false,
          safety_stock: 0,
          reserved_inventory: false,
          protection_threshold: 0,
        },
        commerce_characteristic: {
          enabled: false,
          channels: [],
          order_types: [],
          customer_segments: [],
        },
        regional_availability: {
          enabled: false,
          regions: [],
          geographic_restrictions: [],
          delivery_zones: [],
        },
      },
      views: {
        network: {
          full_sync: true,
          threshold_alert: {
            enabled: true,
            threshold_value: 10,
            threshold_type: 'absolute',
            alert_channels: ['email'],
          },
          sync_frequency: {
            interval_minutes: 5,
            batch_size: 100,
            retry_attempts: 3,
          },
          monitoring: {
            enabled: false,
            track_sync_duration: false,
            alert_on_failure: false,
          },
        },
        location: {
          full_sync: false,
          delta_sync: true,
          location_overrides: [],
        },
      },
    },
  }
}

/**
 * Generate mock ATC configurations for development/testing
 */
function generateMockConfigurations(): ATCConfiguration[] {
  const now = new Date().toISOString()
  const defaultConfig = getDefaultATCConfiguration()

  return [
    {
      ...defaultConfig,
      id: "mock-config-1",
      name: "Production Configuration",
      version: 3,
      status: "active",
      created_at: now,
      updated_at: now,
    },
    {
      ...defaultConfig,
      id: "mock-config-2",
      name: "Test Configuration",
      version: 1,
      status: "draft",
      created_at: now,
      updated_at: now,
      inventory_supply: {
        sources: {
          warehouse: {
            enabled: true,
            priority: 1,
            initial_adjustment: true,
            replacement_rules: [],
          },
          store: {
            enabled: false,
            priority: 2,
            initial_adjustment: false,
            replacement_rules: [],
          },
          supplier: {
            enabled: false,
            priority: 3,
            initial_adjustment: false,
            replacement_rules: [],
          },
        },
        on_hand: {
          available_enabled: true,
          preorder_enabled: true,
          threshold: 20,
          buffer: 10,
        },
        allocation: {
          strategy: "Priority",
          priority_rules: [],
          reservation_enabled: true,
        },
      },
    },
  ]
}

/**
 * Fetch all ATC configurations
 * @returns Promise with array of configurations
 */
export async function fetchATCConfigurations(): Promise<ATCConfiguration[]> {
  if (!isSupabaseAvailable()) {
    console.log("[ATC Config Service] Using mock data (Supabase unavailable)")
    return generateMockConfigurations()
  }

  try {
    const { data, error } = await supabase
      .from("atc_configurations")
      .select("*")
      .order("updated_at", { ascending: false })

    if (error) {
      console.error("[ATC Config Service] Error fetching configurations:", error)
      return generateMockConfigurations()
    }

    if (!data || data.length === 0) {
      console.log("[ATC Config Service] No configurations found, using mock data")
      return generateMockConfigurations()
    }

    // Parse config_data JSONB and merge with row data
    const configurations: ATCConfiguration[] = data.map((row: any) => ({
      id: row.id,
      created_at: row.created_at,
      updated_at: row.updated_at,
      ...row.config_data,
    }))

    return configurations
  } catch (err) {
    console.error("[ATC Config Service] Exception fetching configurations:", err)
    return generateMockConfigurations()
  }
}

/**
 * Fetch a specific ATC configuration by ID
 * @param id - Configuration ID
 * @returns Promise with configuration or null
 */
export async function fetchATCConfiguration(
  id: string
): Promise<ATCConfiguration | null> {
  if (!isSupabaseAvailable()) {
    console.log("[ATC Config Service] Using mock data (Supabase unavailable)")
    const mockConfigs = generateMockConfigurations()
    return mockConfigs.find((c) => c.id === id) || null
  }

  try {
    const { data, error } = await supabase
      .from("atc_configurations")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      console.error("[ATC Config Service] Error fetching configuration:", error)
      return null
    }

    if (!data) {
      return null
    }

    // Parse config_data JSONB and merge with row data
    const configuration: ATCConfiguration = {
      id: (data as any).id,
      created_at: (data as any).created_at,
      updated_at: (data as any).updated_at,
      ...(data as any).config_data,
    }

    return configuration
  } catch (err) {
    console.error("[ATC Config Service] Exception fetching configuration:", err)
    return null
  }
}

/**
 * Save ATC configuration (create new or update existing)
 * @param config - Configuration object
 * @returns Promise with saved configuration or null on error
 */
export async function saveATCConfiguration(
  config: ATCConfiguration
): Promise<ATCConfiguration | null> {
  if (!isSupabaseAvailable()) {
    console.log(
      "[ATC Config Service] Mock mode - cannot save (Supabase unavailable)"
    )
    // Return the config as-is to simulate success in mock mode
    return {
      ...config,
      id: config.id || `mock-${Date.now()}`,
      created_at: config.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }

  try {
    // Extract database fields
    const { id, created_at, updated_at, ...configData } = config

    // Prepare config_data JSONB
    const dbRecord = {
      id: id || undefined, // Let DB generate if not provided
      name: configData.name,
      version: configData.version,
      status: configData.status,
      config_data: configData,
    }

    // Check if updating existing or creating new
    if (id) {
      // Update existing configuration
      const { data, error } = await (supabase
        .from("atc_configurations") as any)
        .update(dbRecord)
        .eq("id", id)
        .select()
        .single()

      if (error) {
        console.error("[ATC Config Service] Error updating configuration:", error)
        return null
      }

      // Create history entry
      await createConfigurationHistory(id, configData.version, configData)

      return {
        id: (data as any).id,
        created_at: (data as any).created_at,
        updated_at: (data as any).updated_at,
        ...(data as any).config_data,
      }
    } else {
      // Create new configuration
      const { data, error } = await (supabase
        .from("atc_configurations") as any)
        .insert(dbRecord)
        .select()
        .single()

      if (error) {
        console.error("[ATC Config Service] Error creating configuration:", error)
        return null
      }

      // Create initial history entry
      await createConfigurationHistory((data as any).id, configData.version, configData)

      return {
        id: (data as any).id,
        created_at: (data as any).created_at,
        updated_at: (data as any).updated_at,
        ...(data as any).config_data,
      }
    }
  } catch (err) {
    console.error("[ATC Config Service] Exception saving configuration:", err)
    return null
  }
}

/**
 * Delete ATC configuration
 * @param id - Configuration ID
 * @returns Promise with success boolean
 */
export async function deleteATCConfiguration(id: string): Promise<boolean> {
  if (!isSupabaseAvailable()) {
    console.log(
      "[ATC Config Service] Mock mode - cannot delete (Supabase unavailable)"
    )
    return true // Simulate success in mock mode
  }

  try {
    const { error } = await supabase
      .from("atc_configurations")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("[ATC Config Service] Error deleting configuration:", error)
      return false
    }

    return true
  } catch (err) {
    console.error("[ATC Config Service] Exception deleting configuration:", err)
    return false
  }
}

/**
 * Create configuration history entry
 * @param configId - Configuration ID
 * @param version - Version number
 * @param configData - Configuration data
 * @param changeDescription - Optional description of changes
 */
async function createConfigurationHistory(
  configId: string,
  version: number,
  configData: Omit<ATCConfiguration, "id" | "created_at" | "updated_at">,
  changeDescription?: string
): Promise<void> {
  if (!isSupabaseAvailable()) {
    return
  }

  try {
    await (supabase.from("atc_configuration_history") as any).insert({
      config_id: configId,
      version: version,
      config_data: configData,
      change_description: changeDescription,
    })
  } catch (err) {
    console.error("[ATC Config Service] Error creating history entry:", err)
  }
}

/**
 * Fetch configuration history
 * @param configId - Configuration ID
 * @returns Promise with array of history entries
 */
export async function fetchConfigurationHistory(
  configId: string
): Promise<ATCConfigurationHistory[]> {
  if (!isSupabaseAvailable()) {
    return []
  }

  try {
    const { data, error } = await supabase
      .from("atc_configuration_history")
      .select("*")
      .eq("config_id", configId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[ATC Config Service] Error fetching history:", error)
      return []
    }

    return data || []
  } catch (err) {
    console.error("[ATC Config Service] Exception fetching history:", err)
    return []
  }
}
