/**
 * ATC Configuration Page
 *
 * Main page for configuring Availability to Commerce (ATC) rules.
 * Includes inventory supply configuration and ATC rule settings.
 */

"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard-shell"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Save, RotateCcw, CheckCircle, Loader2 } from "lucide-react"
import { InventorySupplySection } from "@/components/atc-config/inventory-supply-section"
import { ATCRuleSection } from "@/components/atc-config/atc-rule-section"
import { RulePreview } from "@/components/atc-config/rule-preview"
import {
  fetchATCConfigurations,
  saveATCConfiguration,
  getDefaultATCConfiguration,
} from "@/lib/atc-config-service"
import type { ATCConfiguration } from "@/types/atc-config"

export default function ATCConfigPage() {
  const { toast } = useToast()

  // Loading and error states
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Configuration state
  const [config, setConfig] = useState<ATCConfiguration>(() => {
    const defaultConfig = getDefaultATCConfiguration()
    return {
      ...defaultConfig,
      id: "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  })

  // Load existing configurations on mount
  useEffect(() => {
    loadConfigurations()
  }, [])

  const loadConfigurations = async () => {
    try {
      setLoading(true)
      const configs = await fetchATCConfigurations()

      // Load the first active configuration, or the first draft, or create new
      const activeConfig = configs.find((c) => c.status === "active")
      const draftConfig = configs.find((c) => c.status === "draft")
      const configToLoad = activeConfig || draftConfig || null

      if (configToLoad) {
        setConfig(configToLoad)
      } else {
        // Use default config
        const defaultConfig = getDefaultATCConfiguration()
        setConfig({
          ...defaultConfig,
          id: "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      }
    } catch (err) {
      console.error("Error loading configurations:", err)
      setError("Failed to load configurations")
      toast({
        title: "Error",
        description: "Failed to load configurations. Using default configuration.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (publish: boolean = false) => {
    try {
      setSaving(true)

      // Update status if publishing
      const configToSave = {
        ...config,
        status: publish ? ("active" as const) : config.status,
        version: config.version + (publish ? 1 : 0),
      }

      const savedConfig = await saveATCConfiguration(configToSave)

      if (savedConfig) {
        setConfig(savedConfig)
        toast({
          title: "Success",
          description: publish
            ? "Configuration published successfully"
            : "Configuration saved as draft",
        })
      } else {
        throw new Error("Failed to save configuration")
      }
    } catch (err) {
      console.error("Error saving configuration:", err)
      toast({
        title: "Error",
        description: "Failed to save configuration. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    const defaultConfig = getDefaultATCConfiguration()
    setConfig({
      ...defaultConfig,
      id: config.id, // Keep the same ID
      created_at: config.created_at,
      updated_at: new Date().toISOString(),
    })

    toast({
      title: "Reset to Default",
      description: "Configuration has been reset to default values",
    })
  }

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ATC Configuration</h1>
          <p className="text-muted-foreground">
            Configure Availability to Commerce rules for inventory management
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleReset} disabled={saving}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Default
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSave(false)}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Draft
          </Button>
          <Button onClick={() => handleSave(true)} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            Publish
          </Button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid gap-8 grid-cols-1 xl:grid-cols-3">
        {/* Left Column - Configuration Sections */}
        <div className="xl:col-span-2 space-y-8">
          {/* Inventory Supply Section */}
          <InventorySupplySection
            warehouseConfig={config.inventory_supply.sources.warehouse}
            storeConfig={config.inventory_supply.sources.store}
            supplierConfig={config.inventory_supply.sources.supplier}
            onHandConfig={config.inventory_supply.on_hand}
            allocationConfig={config.inventory_supply.allocation}
            onWarehouseChange={(warehouseConfig) =>
              setConfig({
                ...config,
                inventory_supply: {
                  ...config.inventory_supply,
                  sources: {
                    ...config.inventory_supply.sources,
                    warehouse: warehouseConfig,
                  },
                },
              })
            }
            onStoreChange={(storeConfig) =>
              setConfig({
                ...config,
                inventory_supply: {
                  ...config.inventory_supply,
                  sources: {
                    ...config.inventory_supply.sources,
                    store: storeConfig,
                  },
                },
              })
            }
            onSupplierChange={(supplierConfig) =>
              setConfig({
                ...config,
                inventory_supply: {
                  ...config.inventory_supply,
                  sources: {
                    ...config.inventory_supply.sources,
                    supplier: supplierConfig,
                  },
                },
              })
            }
            onOnHandChange={(onHandConfig) =>
              setConfig({
                ...config,
                inventory_supply: {
                  ...config.inventory_supply,
                  on_hand: onHandConfig,
                },
              })
            }
            onAllocationChange={(allocationConfig) =>
              setConfig({
                ...config,
                inventory_supply: {
                  ...config.inventory_supply,
                  allocation: allocationConfig,
                },
              })
            }
          />

          {/* ATC Rule Section */}
          <ATCRuleSection
            mode={config.atc_rules.mode}
            itemConditions={config.atc_rules.conditions.item}
            locationConditions={config.atc_rules.conditions.location}
            supplyTypeConditions={config.atc_rules.conditions.supply_type}
            networkView={config.atc_rules.views.network}
            locationView={config.atc_rules.views.location}
            onModeChange={(mode) =>
              setConfig({
                ...config,
                atc_rules: {
                  ...config.atc_rules,
                  mode,
                },
              })
            }
            onItemConditionsChange={(itemConditions) =>
              setConfig({
                ...config,
                atc_rules: {
                  ...config.atc_rules,
                  conditions: {
                    ...config.atc_rules.conditions,
                    item: itemConditions,
                  },
                },
              })
            }
            onLocationConditionsChange={(locationConditions) =>
              setConfig({
                ...config,
                atc_rules: {
                  ...config.atc_rules,
                  conditions: {
                    ...config.atc_rules.conditions,
                    location: locationConditions,
                  },
                },
              })
            }
            onSupplyTypeConditionsChange={(supplyTypeConditions) =>
              setConfig({
                ...config,
                atc_rules: {
                  ...config.atc_rules,
                  conditions: {
                    ...config.atc_rules.conditions,
                    supply_type: supplyTypeConditions,
                  },
                },
              })
            }
            onNetworkViewChange={(networkView) =>
              setConfig({
                ...config,
                atc_rules: {
                  ...config.atc_rules,
                  views: {
                    ...config.atc_rules.views,
                    network: networkView,
                  },
                },
              })
            }
            onLocationViewChange={(locationView) =>
              setConfig({
                ...config,
                atc_rules: {
                  ...config.atc_rules,
                  views: {
                    ...config.atc_rules.views,
                    location: locationView,
                  },
                },
              })
            }
          />
        </div>

        {/* Right Column - Preview */}
        <div className="xl:col-span-1">
          <RulePreview config={config} />
        </div>
      </div>
    </DashboardShell>
  )
}
