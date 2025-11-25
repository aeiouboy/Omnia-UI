/**
 * Condition Cards Component
 *
 * Reusable condition card components for ATC rule configuration:
 * - Item Condition (category, product type, SKU pattern)
 * - Location Condition (stores, regions, zones)
 * - Supply Type Condition (type, lead time, priority)
 */

"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, X, Package2, MapPin, Truck } from "lucide-react"
import type { ItemCondition, LocationCondition, SupplyTypeCondition } from "@/types/atc-config"

interface ItemConditionCardProps {
  conditions: ItemCondition[]
  onChange: (conditions: ItemCondition[]) => void
}

export function ItemConditionCard({ conditions, onChange }: ItemConditionCardProps) {
  const [newCategory, setNewCategory] = useState("")
  const [newProductType, setNewProductType] = useState("")
  const [skuPattern, setSkuPattern] = useState(conditions[0]?.sku_pattern || "")

  const activeCondition = conditions[0] || {
    id: "item-1",
    category: [],
    product_type: [],
    sku_pattern: "",
    status: [],
  }

  const addCategory = () => {
    if (newCategory.trim()) {
      const updated = { ...activeCondition }
      updated.category = [...updated.category, newCategory.trim()]
      onChange([updated])
      setNewCategory("")
    }
  }

  const removeCategory = (category: string) => {
    const updated = { ...activeCondition }
    updated.category = updated.category.filter((c) => c !== category)
    onChange([updated])
  }

  const addProductType = () => {
    if (newProductType.trim()) {
      const updated = { ...activeCondition }
      updated.product_type = [...updated.product_type, newProductType.trim()]
      onChange([updated])
      setNewProductType("")
    }
  }

  const removeProductType = (type: string) => {
    const updated = { ...activeCondition }
    updated.product_type = updated.product_type.filter((t) => t !== type)
    onChange([updated])
  }

  const updateSkuPattern = (pattern: string) => {
    const updated = { ...activeCondition }
    updated.sku_pattern = pattern
    onChange([updated])
    setSkuPattern(pattern)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Package2 className="h-5 w-5 text-blue-600" />
          <CardTitle>Item Condition</CardTitle>
        </div>
        <CardDescription>Filter by product category, type, and SKU pattern</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Category Filters */}
        <div className="space-y-2">
          <Label>Item Categories</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Add category..."
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addCategory()}
            />
            <Button type="button" size="sm" onClick={addCategory}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeCondition.category.map((cat) => (
              <Badge key={cat} variant="secondary" className="gap-1">
                {cat}
                <button
                  type="button"
                  onClick={() => removeCategory(cat)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        {/* Product Type Filters */}
        <div className="space-y-2">
          <Label>Product Types</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Add product type..."
              value={newProductType}
              onChange={(e) => setNewProductType(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addProductType()}
            />
            <Button type="button" size="sm" onClick={addProductType}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeCondition.product_type.map((type) => (
              <Badge key={type} variant="secondary" className="gap-1">
                {type}
                <button
                  type="button"
                  onClick={() => removeProductType(type)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        {/* SKU Pattern */}
        <div className="space-y-2">
          <Label htmlFor="sku-pattern">SKU Pattern (Regex)</Label>
          <Input
            id="sku-pattern"
            placeholder="e.g., ^FOOD-.*"
            value={skuPattern}
            onChange={(e) => updateSkuPattern(e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            Use regex pattern to match SKUs (e.g., ^FOOD-.* for all food items)
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

interface LocationConditionCardProps {
  conditions: LocationCondition[]
  onChange: (conditions: LocationCondition[]) => void
}

export function LocationConditionCard({ conditions, onChange }: LocationConditionCardProps) {
  const [newStore, setNewStore] = useState("")
  const [newRegion, setNewRegion] = useState("")
  const [newZone, setNewZone] = useState("")

  const activeCondition = conditions[0] || {
    id: "location-1",
    stores: [],
    regions: [],
    zones: [],
    warehouses: [],
  }

  const addStore = () => {
    if (newStore.trim()) {
      const updated = { ...activeCondition }
      updated.stores = [...updated.stores, newStore.trim()]
      onChange([updated])
      setNewStore("")
    }
  }

  const removeStore = (store: string) => {
    const updated = { ...activeCondition }
    updated.stores = updated.stores.filter((s) => s !== store)
    onChange([updated])
  }

  const addRegion = () => {
    if (newRegion.trim()) {
      const updated = { ...activeCondition }
      updated.regions = [...updated.regions, newRegion.trim()]
      onChange([updated])
      setNewRegion("")
    }
  }

  const removeRegion = (region: string) => {
    const updated = { ...activeCondition }
    updated.regions = updated.regions.filter((r) => r !== region)
    onChange([updated])
  }

  const addZone = () => {
    if (newZone.trim()) {
      const updated = { ...activeCondition }
      updated.zones = [...updated.zones, newZone.trim()]
      onChange([updated])
      setNewZone("")
    }
  }

  const removeZone = (zone: string) => {
    const updated = { ...activeCondition }
    updated.zones = updated.zones.filter((z) => z !== zone)
    onChange([updated])
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-green-600" />
          <CardTitle>Location Condition</CardTitle>
        </div>
        <CardDescription>Filter by store, region, and delivery zone</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Store Selection */}
        <div className="space-y-2">
          <Label>Stores</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Add store..."
              value={newStore}
              onChange={(e) => setNewStore(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addStore()}
            />
            <Button type="button" size="sm" onClick={addStore}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeCondition.stores.map((store) => (
              <Badge key={store} variant="secondary" className="gap-1">
                {store}
                <button
                  type="button"
                  onClick={() => removeStore(store)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        {/* Region Selection */}
        <div className="space-y-2">
          <Label>Regions</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Add region..."
              value={newRegion}
              onChange={(e) => setNewRegion(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addRegion()}
            />
            <Button type="button" size="sm" onClick={addRegion}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeCondition.regions.map((region) => (
              <Badge key={region} variant="secondary" className="gap-1">
                {region}
                <button
                  type="button"
                  onClick={() => removeRegion(region)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        {/* Zone Selection */}
        <div className="space-y-2">
          <Label>Delivery Zones</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Add zone..."
              value={newZone}
              onChange={(e) => setNewZone(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addZone()}
            />
            <Button type="button" size="sm" onClick={addZone}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeCondition.zones.map((zone) => (
              <Badge key={zone} variant="secondary" className="gap-1">
                {zone}
                <button
                  type="button"
                  onClick={() => removeZone(zone)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface SupplyTypeConditionCardProps {
  conditions: SupplyTypeCondition[]
  onChange: (conditions: SupplyTypeCondition[]) => void
}

export function SupplyTypeConditionCard({
  conditions,
  onChange,
}: SupplyTypeConditionCardProps) {
  const activeCondition = conditions[0] || {
    id: "supply-1",
    type: "warehouse" as const,
    lead_time: 0,
    priority: 1,
  }

  const updateType = (type: "warehouse" | "store" | "supplier" | "preorder") => {
    const updated = { ...activeCondition, type }
    onChange([updated])
  }

  const updateLeadTime = (leadTime: number) => {
    const updated = { ...activeCondition, lead_time: leadTime }
    onChange([updated])
  }

  const updatePriority = (priority: number) => {
    const updated = { ...activeCondition, priority }
    onChange([updated])
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-purple-600" />
          <CardTitle>Supply Type Condition</CardTitle>
        </div>
        <CardDescription>Configure supply type, lead time, and priority</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Supply Type */}
        <div className="space-y-2">
          <Label htmlFor="supply-type">Supply Type</Label>
          <Select value={activeCondition.type} onValueChange={updateType}>
            <SelectTrigger id="supply-type">
              <SelectValue placeholder="Select supply type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="warehouse">Warehouse</SelectItem>
              <SelectItem value="store">Store</SelectItem>
              <SelectItem value="supplier">Supplier</SelectItem>
              <SelectItem value="preorder">PreOrder</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lead Time */}
        <div className="space-y-2">
          <Label htmlFor="lead-time">Lead Time (days)</Label>
          <Input
            id="lead-time"
            type="number"
            min={0}
            value={activeCondition.lead_time}
            onChange={(e) => updateLeadTime(parseInt(e.target.value) || 0)}
          />
          <p className="text-sm text-muted-foreground">
            Expected delivery time for this supply type
          </p>
        </div>

        {/* Priority */}
        <div className="space-y-2">
          <Label htmlFor="supply-priority">Priority</Label>
          <Input
            id="supply-priority"
            type="number"
            min={1}
            max={10}
            value={activeCondition.priority}
            onChange={(e) => updatePriority(parseInt(e.target.value) || 1)}
          />
          <p className="text-sm text-muted-foreground">
            Higher priority supply types are allocated first
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
