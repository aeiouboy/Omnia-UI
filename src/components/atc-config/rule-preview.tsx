/**
 * Rule Preview Component
 *
 * Displays a summary of configured ATC rules including:
 * - Active inventory sources
 * - Configured conditions
 * - View settings
 */

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, XCircle, Warehouse, Store, Package, Eye } from "lucide-react"
import type { ATCConfiguration } from "@/types/atc-config"

interface RulePreviewProps {
  config: Omit<ATCConfiguration, "id" | "created_at" | "updated_at">
}

export function RulePreview({ config }: RulePreviewProps) {
  const { inventory_supply, atc_rules } = config

  // Count active sources
  const activeSources = [
    inventory_supply.sources.warehouse.enabled && "Warehouse",
    inventory_supply.sources.store.enabled && "Store",
    inventory_supply.sources.supplier.enabled && "Supplier",
  ].filter(Boolean)

  // Count active conditions
  const hasItemConditions =
    atc_rules.conditions.item.length > 0 &&
    (atc_rules.conditions.item[0].category.length > 0 ||
      atc_rules.conditions.item[0].product_type.length > 0 ||
      atc_rules.conditions.item[0].sku_pattern !== "")

  const hasLocationConditions =
    atc_rules.conditions.location.length > 0 &&
    (atc_rules.conditions.location[0].stores.length > 0 ||
      atc_rules.conditions.location[0].regions.length > 0 ||
      atc_rules.conditions.location[0].zones.length > 0)

  const hasSupplyTypeConditions = atc_rules.conditions.supply_type.length > 0

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-blue-600" />
          <CardTitle>Configuration Preview</CardTitle>
        </div>
        <CardDescription>Summary of current ATC configuration</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Configuration Status */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Status</span>
            <Badge
              variant={config.status === "active" ? "default" : "secondary"}
              className={
                config.status === "active"
                  ? "bg-green-100 text-green-800"
                  : config.status === "draft"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
              }
            >
              {config.status.toUpperCase()}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">Version {config.version}</p>
        </div>

        <Separator />

        {/* Inventory Sources */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Active Inventory Sources</h4>
          <div className="space-y-2">
            {inventory_supply.sources.warehouse.enabled && (
              <div className="flex items-center gap-2">
                <Warehouse className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Warehouse</span>
                <Badge variant="outline" className="ml-auto">
                  Priority {inventory_supply.sources.warehouse.priority}
                </Badge>
              </div>
            )}
            {inventory_supply.sources.store.enabled && (
              <div className="flex items-center gap-2">
                <Store className="h-4 w-4 text-green-600" />
                <span className="text-sm">Store</span>
                <Badge variant="outline" className="ml-auto">
                  Priority {inventory_supply.sources.store.priority}
                </Badge>
              </div>
            )}
            {inventory_supply.sources.supplier.enabled && (
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-purple-600" />
                <span className="text-sm">Supplier</span>
                <Badge variant="outline" className="ml-auto">
                  Priority {inventory_supply.sources.supplier.priority}
                </Badge>
              </div>
            )}
            {activeSources.length === 0 && (
              <p className="text-sm text-muted-foreground">No sources enabled</p>
            )}
          </div>
        </div>

        <Separator />

        {/* On Hand Settings */}
        <div>
          <h4 className="text-sm font-semibold mb-3">On Hand Inventory</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Available</span>
              {inventory_supply.on_hand.available_enabled ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-gray-400" />
              )}
            </div>
            <div className="flex items-center justify-between">
              <span>PreOrder</span>
              {inventory_supply.on_hand.preorder_enabled ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-gray-400" />
              )}
            </div>
            <div className="flex items-center justify-between">
              <span>Threshold</span>
              <span className="text-muted-foreground">
                {inventory_supply.on_hand.threshold}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Buffer</span>
              <span className="text-muted-foreground">
                {inventory_supply.on_hand.buffer}
              </span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Allocation Strategy */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Allocation Strategy</h4>
          <div className="space-y-2">
            <Badge variant="secondary" className="text-xs">
              {inventory_supply.allocation.strategy}
            </Badge>
            <div className="flex items-center justify-between text-sm">
              <span>Reservation</span>
              {inventory_supply.allocation.reservation_enabled ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-gray-400" />
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* ATC Rules */}
        <div>
          <h4 className="text-sm font-semibold mb-3">ATC Rules</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Mode</span>
              <Badge variant={atc_rules.mode === "inclusion" ? "default" : "secondary"}>
                {atc_rules.mode.toUpperCase()}
              </Badge>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span>Item Conditions</span>
              {hasItemConditions ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-gray-400" />
              )}
            </div>

            <div className="flex items-center justify-between text-sm">
              <span>Location Conditions</span>
              {hasLocationConditions ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-gray-400" />
              )}
            </div>

            <div className="flex items-center justify-between text-sm">
              <span>Supply Type Conditions</span>
              {hasSupplyTypeConditions ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-gray-400" />
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* View Configuration */}
        <div>
          <h4 className="text-sm font-semibold mb-3">View Settings</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Network Full Sync</span>
              {atc_rules.views.network.full_sync ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-gray-400" />
              )}
            </div>
            <div className="flex items-center justify-between">
              <span>Location Delta Sync</span>
              {atc_rules.views.location.delta_sync ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-gray-400" />
              )}
            </div>
            <div className="flex items-center justify-between">
              <span>Sync Frequency</span>
              <span className="text-muted-foreground">
                {atc_rules.views.network.sync_frequency.interval_minutes} min
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
