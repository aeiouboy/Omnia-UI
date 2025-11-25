'use client'

import { useState } from 'react'
import { RegionalAvailability, RegionConfig, GeoArea, DeliveryZone } from '@/types/atc-config'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Globe, Trash2, Plus } from 'lucide-react'

interface RegionalAvailabilityCardProps {
  value: RegionalAvailability
  onChange: (value: RegionalAvailability) => void
}

const THAILAND_REGIONS = [
  'Bangkok',
  'Central',
  'Eastern',
  'Northeastern',
  'Northern',
  'Southern',
  'Western',
]

const CHANNELS = ['GrabMart', 'Line Man', 'Shopee', 'Lazada', 'Website']

/**
 * RegionalAvailabilityCard Component
 *
 * Advanced configuration card for regional and geographic availability rules including:
 * - Region selection with channel configuration
 * - Geographic restriction areas
 * - Delivery zone configuration with priority
 */
export function RegionalAvailabilityCard({ value, onChange }: RegionalAvailabilityCardProps) {
  const [geoDialogOpen, setGeoDialogOpen] = useState(false)
  const [zoneDialogOpen, setZoneDialogOpen] = useState(false)

  const updateField = <K extends keyof RegionalAvailability>(
    field: K,
    val: RegionalAvailability[K]
  ) => {
    onChange({ ...value, [field]: val })
  }

  const toggleRegion = (regionName: string) => {
    const regions = value.regional_coverage || []
    const existingIndex = regions.findIndex((r) => r.region_name === regionName)

    if (existingIndex >= 0) {
      // Remove region
      const updated = regions.filter((_, i) => i !== existingIndex)
      updateField('regional_coverage', updated)
      updateField('regions', value.regions.filter((r) => r !== regionName))
    } else {
      // Add region
      const newRegion: RegionConfig = {
        region_id: `region-${Date.now()}`,
        region_name: regionName,
        enabled: true,
        available_channels: [],
      }
      updateField('regional_coverage', [...regions, newRegion])
      updateField('regions', [...value.regions, regionName])
    }
  }

  const updateRegionChannels = (regionIndex: number, channels: string[]) => {
    const regions = [...(value.regional_coverage || [])]
    regions[regionIndex] = { ...regions[regionIndex], available_channels: channels }
    updateField('regional_coverage', regions)
  }

  const toggleRegionEnabled = (regionIndex: number) => {
    const regions = [...(value.regional_coverage || [])]
    regions[regionIndex] = { ...regions[regionIndex], enabled: !regions[regionIndex].enabled }
    updateField('regional_coverage', regions)
  }

  const addGeoArea = (newArea: Omit<GeoArea, 'id'>) => {
    const areas = value.geo_areas || []
    const area: GeoArea = {
      id: `geo-${Date.now()}`,
      ...newArea,
    }
    updateField('geo_areas', [...areas, area])
    updateField('geographic_restrictions', [...value.geographic_restrictions, area.name])
    setGeoDialogOpen(false)
  }

  const removeGeoArea = (areaId: string) => {
    const areas = value.geo_areas || []
    const removed = areas.find((a) => a.id === areaId)
    updateField('geo_areas', areas.filter((a) => a.id !== areaId))
    if (removed) {
      updateField('geographic_restrictions', value.geographic_restrictions.filter((r) => r !== removed.name))
    }
  }

  const addDeliveryZone = (newZone: Omit<DeliveryZone, 'id'>) => {
    const zones = value.delivery_zone_config || []
    const zone: DeliveryZone = {
      id: `zone-${Date.now()}`,
      ...newZone,
    }
    updateField('delivery_zone_config', [...zones, zone])
    updateField('delivery_zones', [...value.delivery_zones, zone.name])
    setZoneDialogOpen(false)
  }

  const removeDeliveryZone = (zoneId: string) => {
    const zones = value.delivery_zone_config || []
    const removed = zones.find((z) => z.id === zoneId)
    updateField('delivery_zone_config', zones.filter((z) => z.id !== zoneId))
    if (removed) {
      updateField('delivery_zones', value.delivery_zones.filter((d) => d !== removed.name))
    }
  }

  const updateZonePriority = (zoneId: string, priority: number) => {
    const zones = [...(value.delivery_zone_config || [])]
    const index = zones.findIndex((z) => z.id === zoneId)
    if (index >= 0) {
      zones[index] = { ...zones[index], priority }
      updateField('delivery_zone_config', zones)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          <CardTitle>Regional Availability</CardTitle>
        </div>
        <CardDescription>
          Configure regional coverage, geographic restrictions, and delivery zones
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable Regional Availability */}
        <div className="flex items-center justify-between">
          <Label htmlFor="regional-enabled">Enable Regional Availability Rules</Label>
          <Switch
            id="regional-enabled"
            checked={value.enabled}
            onCheckedChange={(checked) => updateField('enabled', checked)}
          />
        </div>

        {value.enabled && (
          <Tabs defaultValue="regions" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="regions">Regions</TabsTrigger>
              <TabsTrigger value="restrictions">Restrictions</TabsTrigger>
              <TabsTrigger value="zones">Delivery Zones</TabsTrigger>
            </TabsList>

            {/* Regions Tab */}
            <TabsContent value="regions" className="space-y-4">
              <div className="space-y-4">
                {THAILAND_REGIONS.map((region) => {
                  const regionConfig = value.regional_coverage?.find((r) => r.region_name === region)
                  const isSelected = !!regionConfig

                  return (
                    <Card key={region} className={!isSelected ? 'opacity-50' : ''}>
                      <CardContent className="pt-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleRegion(region)}
                            />
                            <Label className="text-base font-medium">{region}</Label>
                          </div>
                          {isSelected && regionConfig && (
                            <Switch
                              checked={regionConfig.enabled}
                              onCheckedChange={() => {
                                const index = value.regional_coverage?.findIndex(
                                  (r) => r.region_name === region
                                )
                                if (index !== undefined && index >= 0) {
                                  toggleRegionEnabled(index)
                                }
                              }}
                            />
                          )}
                        </div>

                        {isSelected && regionConfig && (
                          <div className="space-y-2 pl-6">
                            <Label className="text-sm">Available Channels</Label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {CHANNELS.map((channel) => (
                                <div key={channel} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`${region}-${channel}`}
                                    checked={regionConfig.available_channels.includes(channel)}
                                    onCheckedChange={(checked) => {
                                      const index = value.regional_coverage?.findIndex(
                                        (r) => r.region_name === region
                                      )
                                      if (index !== undefined && index >= 0) {
                                        const current = regionConfig.available_channels
                                        const updated = checked
                                          ? [...current, channel]
                                          : current.filter((c) => c !== channel)
                                        updateRegionChannels(index, updated)
                                      }
                                    }}
                                  />
                                  <label
                                    htmlFor={`${region}-${channel}`}
                                    className="text-sm cursor-pointer"
                                  >
                                    {channel}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>

            {/* Geographic Restrictions Tab */}
            <TabsContent value="restrictions" className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Geographic Restrictions</Label>
                <GeoAreaDialog open={geoDialogOpen} onOpenChange={setGeoDialogOpen} onAdd={addGeoArea} />
              </div>

              {value.geo_areas && value.geo_areas.length > 0 ? (
                <div className="space-y-2">
                  {value.geo_areas.map((area) => (
                    <div key={area.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{area.name}</div>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline">{area.type}</Badge>
                          <Badge variant={area.restriction_type === 'blocked' ? 'destructive' : 'default'}>
                            {area.restriction_type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{area.value}</span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeGeoArea(area.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No geographic restrictions configured
                </div>
              )}
            </TabsContent>

            {/* Delivery Zones Tab */}
            <TabsContent value="zones" className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Delivery Zones</Label>
                <DeliveryZoneDialog open={zoneDialogOpen} onOpenChange={setZoneDialogOpen} onAdd={addDeliveryZone} />
              </div>

              {value.delivery_zone_config && value.delivery_zone_config.length > 0 ? (
                <div className="space-y-2">
                  {value.delivery_zone_config
                    .sort((a, b) => a.priority - b.priority)
                    .map((zone) => (
                      <div key={zone.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{zone.name}</span>
                            <Badge variant={zone.enabled ? 'default' : 'secondary'}>
                              {zone.enabled ? 'Enabled' : 'Disabled'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Label className="text-xs">Priority:</Label>
                            <Input
                              type="number"
                              min="1"
                              value={zone.priority}
                              onChange={(e) => updateZonePriority(zone.id, parseInt(e.target.value) || 1)}
                              className="w-20 h-7 text-xs"
                            />
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeDeliveryZone(zone.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No delivery zones configured
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}

// Dialog for adding geographic area
function GeoAreaDialog({ open, onOpenChange, onAdd }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (area: Omit<GeoArea, 'id'>) => void
}) {
  const [name, setName] = useState('')
  const [type, setType] = useState<GeoArea['type']>('city')
  const [value, setValue] = useState('')
  const [restrictionType, setRestrictionType] = useState<'blocked' | 'allowed'>('blocked')

  const handleAdd = () => {
    if (name && value) {
      onAdd({ name, type, value, restriction_type: restrictionType })
      setName('')
      setValue('')
      setType('city')
      setRestrictionType('blocked')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Restriction
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Geographic Restriction</DialogTitle>
          <DialogDescription>Define a geographic area to restrict or allow</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Area Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Downtown Bangkok" />
          </div>
          <div className="space-y-2">
            <Label>Area Type</Label>
            <Select value={type} onValueChange={(v: GeoArea['type']) => setType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="city">City</SelectItem>
                <SelectItem value="province">Province</SelectItem>
                <SelectItem value="district">District</SelectItem>
                <SelectItem value="postal_code">Postal Code</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Value</Label>
            <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="e.g., 10110" />
          </div>
          <div className="space-y-2">
            <Label>Restriction Type</Label>
            <Select value={restrictionType} onValueChange={(v: 'blocked' | 'allowed') => setRestrictionType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blocked">Blocked</SelectItem>
                <SelectItem value="allowed">Allowed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleAdd} disabled={!name || !value}>
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Dialog for adding delivery zone
function DeliveryZoneDialog({ open, onOpenChange, onAdd }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (zone: Omit<DeliveryZone, 'id'>) => void
}) {
  const [name, setName] = useState('')
  const [priority, setPriority] = useState(1)
  const [enabled, setEnabled] = useState(true)

  const handleAdd = () => {
    if (name) {
      onAdd({ name, priority, areas: [], enabled })
      setName('')
      setPriority(1)
      setEnabled(true)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Zone
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Delivery Zone</DialogTitle>
          <DialogDescription>Define a delivery zone with priority</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Zone Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Inner City" />
          </div>
          <div className="space-y-2">
            <Label>Priority</Label>
            <Input
              type="number"
              min="1"
              value={priority}
              onChange={(e) => setPriority(parseInt(e.target.value) || 1)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Enabled</Label>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleAdd} disabled={!name}>
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
