/**
 * ATC Rule Section Component
 *
 * Bottom section of ATC Configuration page showing:
 * - Inclusion/Exclusion mode toggle
 * - Condition cards (Item, Location, Supply Type)
 * - Network and Location view configuration
 */

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Globe, MapPin } from "lucide-react"
import { ItemConditionCard, LocationConditionCard, SupplyTypeConditionCard } from "./condition-cards"
import { NetworkViewConfig as NetworkViewConfigComponent } from "./network-view-config"
import { LocationViewConfig as LocationViewConfigComponent } from "./location-view-config"
import type {
  ItemCondition,
  LocationCondition,
  SupplyTypeCondition,
  NetworkViewConfig,
  LocationViewConfig,
} from "@/types/atc-config"

interface ATCRuleSectionProps {
  mode: "inclusion" | "exclusion"
  itemConditions: ItemCondition[]
  locationConditions: LocationCondition[]
  supplyTypeConditions: SupplyTypeCondition[]
  networkView: NetworkViewConfig
  locationView: LocationViewConfig
  onModeChange: (mode: "inclusion" | "exclusion") => void
  onItemConditionsChange: (conditions: ItemCondition[]) => void
  onLocationConditionsChange: (conditions: LocationCondition[]) => void
  onSupplyTypeConditionsChange: (conditions: SupplyTypeCondition[]) => void
  onNetworkViewChange: (config: NetworkViewConfig) => void
  onLocationViewChange: (config: LocationViewConfig) => void
}

export function ATCRuleSection({
  mode,
  itemConditions,
  locationConditions,
  supplyTypeConditions,
  networkView,
  locationView,
  onModeChange,
  onItemConditionsChange,
  onLocationConditionsChange,
  onSupplyTypeConditionsChange,
  onNetworkViewChange,
  onLocationViewChange,
}: ATCRuleSectionProps) {
  return (
    <div className="space-y-6">
      {/* Section Header with Mode Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">ATC Rule Configuration</h2>
          <p className="text-muted-foreground">
            Configure availability rules with inclusion or exclusion logic
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Label htmlFor="rule-mode" className="font-semibold">
            Rule Mode:
          </Label>
          <div className="flex items-center gap-2">
            <Badge variant={mode === "inclusion" ? "default" : "outline"}>Inclusion</Badge>
            <Switch
              id="rule-mode"
              checked={mode === "exclusion"}
              onCheckedChange={(checked) => onModeChange(checked ? "exclusion" : "inclusion")}
            />
            <Badge variant={mode === "exclusion" ? "default" : "outline"}>Exclusion</Badge>
          </div>
        </div>
      </div>

      {/* Condition Cards in Tabs */}
      <Tabs defaultValue="item" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="item">Item Condition</TabsTrigger>
          <TabsTrigger value="location">Location Condition</TabsTrigger>
          <TabsTrigger value="supply">Supply Type</TabsTrigger>
        </TabsList>

        <TabsContent value="item" className="mt-6">
          <ItemConditionCard
            conditions={itemConditions}
            onChange={onItemConditionsChange}
          />
        </TabsContent>

        <TabsContent value="location" className="mt-6">
          <LocationConditionCard
            conditions={locationConditions}
            onChange={onLocationConditionsChange}
          />
        </TabsContent>

        <TabsContent value="supply" className="mt-6">
          <SupplyTypeConditionCard
            conditions={supplyTypeConditions}
            onChange={onSupplyTypeConditionsChange}
          />
        </TabsContent>
      </Tabs>

      {/* View Configuration */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Network View */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-600" />
              <CardTitle>Network View</CardTitle>
            </div>
            <CardDescription>
              Configure network-wide sync and threshold settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NetworkViewConfigComponent
              value={networkView}
              onChange={onNetworkViewChange}
            />
          </CardContent>
        </Card>

        {/* Location View */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-600" />
              <CardTitle>Location View</CardTitle>
            </div>
            <CardDescription>
              Configure location-specific sync and override settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LocationViewConfigComponent
              value={locationView}
              onChange={onLocationViewChange}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
