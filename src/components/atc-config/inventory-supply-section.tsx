/**
 * Inventory Supply Section Component
 *
 * Top section of ATC Configuration page showing:
 * - Inventory source configuration (Warehouse, Store, Supplier)
 * - On Hand inventory settings
 * - Allocation strategy settings
 */

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Warehouse, Store, Package } from "lucide-react"
import type { SourceConfig, OnHandConfig, AllocationConfig } from "@/types/atc-config"

interface InventorySupplySectionProps {
  warehouseConfig: SourceConfig
  storeConfig: SourceConfig
  supplierConfig: SourceConfig
  onHandConfig: OnHandConfig
  allocationConfig: AllocationConfig
  onWarehouseChange: (config: SourceConfig) => void
  onStoreChange: (config: SourceConfig) => void
  onSupplierChange: (config: SourceConfig) => void
  onOnHandChange: (config: OnHandConfig) => void
  onAllocationChange: (config: AllocationConfig) => void
}

export function InventorySupplySection({
  warehouseConfig,
  storeConfig,
  supplierConfig,
  onHandConfig,
  allocationConfig,
  onWarehouseChange,
  onStoreChange,
  onSupplierChange,
  onOnHandChange,
  onAllocationChange,
}: InventorySupplySectionProps) {
  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Inventory Supply Configuration</h2>
        <p className="text-muted-foreground">
          Configure inventory sources, on-hand settings, and allocation strategy
        </p>
      </div>

      {/* Inventory Sources */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Warehouse Source */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Warehouse className="h-5 w-5 text-blue-600" />
              <CardTitle>Warehouse</CardTitle>
            </div>
            <CardDescription>Central warehouse inventory source</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="warehouse-enabled">Enable Source</Label>
              <Switch
                id="warehouse-enabled"
                checked={warehouseConfig.enabled}
                onCheckedChange={(checked) =>
                  onWarehouseChange({ ...warehouseConfig, enabled: checked })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="warehouse-priority">Priority (1-3)</Label>
              <Input
                id="warehouse-priority"
                type="number"
                min={1}
                max={3}
                value={warehouseConfig.priority}
                onChange={(e) =>
                  onWarehouseChange({
                    ...warehouseConfig,
                    priority: parseInt(e.target.value) || 1,
                  })
                }
                disabled={!warehouseConfig.enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="warehouse-initial">Initial Adjustment</Label>
              <Switch
                id="warehouse-initial"
                checked={warehouseConfig.initial_adjustment}
                onCheckedChange={(checked) =>
                  onWarehouseChange({ ...warehouseConfig, initial_adjustment: checked })
                }
                disabled={!warehouseConfig.enabled}
              />
            </div>
          </CardContent>
        </Card>

        {/* Store Source */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Store className="h-5 w-5 text-green-600" />
              <CardTitle>Store</CardTitle>
            </div>
            <CardDescription>Store-level inventory source</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="store-enabled">Enable Source</Label>
              <Switch
                id="store-enabled"
                checked={storeConfig.enabled}
                onCheckedChange={(checked) =>
                  onStoreChange({ ...storeConfig, enabled: checked })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="store-priority">Priority (1-3)</Label>
              <Input
                id="store-priority"
                type="number"
                min={1}
                max={3}
                value={storeConfig.priority}
                onChange={(e) =>
                  onStoreChange({
                    ...storeConfig,
                    priority: parseInt(e.target.value) || 2,
                  })
                }
                disabled={!storeConfig.enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="store-initial">Initial Adjustment</Label>
              <Switch
                id="store-initial"
                checked={storeConfig.initial_adjustment}
                onCheckedChange={(checked) =>
                  onStoreChange({ ...storeConfig, initial_adjustment: checked })
                }
                disabled={!storeConfig.enabled}
              />
            </div>
          </CardContent>
        </Card>

        {/* Supplier Source */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-purple-600" />
              <CardTitle>Supplier</CardTitle>
            </div>
            <CardDescription>External supplier inventory source</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="supplier-enabled">Enable Source</Label>
              <Switch
                id="supplier-enabled"
                checked={supplierConfig.enabled}
                onCheckedChange={(checked) =>
                  onSupplierChange({ ...supplierConfig, enabled: checked })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier-priority">Priority (1-3)</Label>
              <Input
                id="supplier-priority"
                type="number"
                min={1}
                max={3}
                value={supplierConfig.priority}
                onChange={(e) =>
                  onSupplierChange({
                    ...supplierConfig,
                    priority: parseInt(e.target.value) || 3,
                  })
                }
                disabled={!supplierConfig.enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="supplier-initial">Initial Adjustment</Label>
              <Switch
                id="supplier-initial"
                checked={supplierConfig.initial_adjustment}
                onCheckedChange={(checked) =>
                  onSupplierChange({ ...supplierConfig, initial_adjustment: checked })
                }
                disabled={!supplierConfig.enabled}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* On Hand Settings & Allocation Strategy */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* On Hand Inventory */}
        <Card>
          <CardHeader>
            <CardTitle>On Hand Inventory</CardTitle>
            <CardDescription>Available inventory type settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="onhand-available">On Hand Available</Label>
              <Switch
                id="onhand-available"
                checked={onHandConfig.available_enabled}
                onCheckedChange={(checked) =>
                  onOnHandChange({ ...onHandConfig, available_enabled: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="onhand-preorder">PreOrder</Label>
              <Switch
                id="onhand-preorder"
                checked={onHandConfig.preorder_enabled}
                onCheckedChange={(checked) =>
                  onOnHandChange({ ...onHandConfig, preorder_enabled: checked })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="onhand-threshold">Threshold</Label>
              <Input
                id="onhand-threshold"
                type="number"
                min={0}
                value={onHandConfig.threshold}
                onChange={(e) =>
                  onOnHandChange({
                    ...onHandConfig,
                    threshold: parseInt(e.target.value) || 0,
                  })
                }
              />
              <p className="text-sm text-muted-foreground">
                Minimum stock level before alerts
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="onhand-buffer">Buffer</Label>
              <Input
                id="onhand-buffer"
                type="number"
                min={0}
                value={onHandConfig.buffer}
                onChange={(e) =>
                  onOnHandChange({
                    ...onHandConfig,
                    buffer: parseInt(e.target.value) || 0,
                  })
                }
              />
              <p className="text-sm text-muted-foreground">
                Safety stock buffer amount
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Allocation Strategy */}
        <Card>
          <CardHeader>
            <CardTitle>Supply Allocation</CardTitle>
            <CardDescription>Allocation strategy and priority settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="allocation-strategy">Allocation Strategy</Label>
              <Select
                value={allocationConfig.strategy}
                onValueChange={(value: "FIFO" | "LIFO" | "Priority") =>
                  onAllocationChange({ ...allocationConfig, strategy: value })
                }
              >
                <SelectTrigger id="allocation-strategy">
                  <SelectValue placeholder="Select strategy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FIFO">FIFO (First In First Out)</SelectItem>
                  <SelectItem value="LIFO">LIFO (Last In First Out)</SelectItem>
                  <SelectItem value="Priority">Priority-based</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {allocationConfig.strategy === "FIFO" && "Oldest inventory allocated first"}
                {allocationConfig.strategy === "LIFO" && "Newest inventory allocated first"}
                {allocationConfig.strategy === "Priority" && "Allocation based on priority rules"}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="allocation-reservation">Enable Reservation</Label>
              <Switch
                id="allocation-reservation"
                checked={allocationConfig.reservation_enabled}
                onCheckedChange={(checked) =>
                  onAllocationChange({ ...allocationConfig, reservation_enabled: checked })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Priority Rules</Label>
              <p className="text-sm text-muted-foreground">
                {allocationConfig.priority_rules.length} rule(s) configured
              </p>
              {/* TODO: Add priority rules editor in Phase 2 */}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
