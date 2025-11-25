'use client'

import { useState } from 'react'
import { CommerceCharacteristic, ChannelRule, TimeSlot } from '@/types/atc-config'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TimeSlotPicker } from './time-slot-picker'
import { ShoppingCart, Trash2 } from 'lucide-react'

interface CommerceCharacteristicCardProps {
  value: CommerceCharacteristic
  onChange: (value: CommerceCharacteristic) => void
}

const ORDER_TYPES = ['delivery', 'pickup', 'dine-in', 'curbside', 'ship-to-store']
const CUSTOMER_SEGMENTS = ['VIP', 'Regular', 'New', 'B2B', 'Employee']
const AVAILABLE_CHANNELS = ['GrabMart', 'Line Man', 'Shopee', 'Lazada', 'Website', 'Mobile App']

/**
 * CommerceCharacteristicCard Component
 *
 * Advanced configuration card for commerce channel and characteristic rules including:
 * - Channel selection with priority and allocation
 * - Order type filters
 * - Customer segment configuration
 * - Time-based rules (peak/off-peak hours)
 */
export function CommerceCharacteristicCard({ value, onChange }: CommerceCharacteristicCardProps) {
  const [newChannelName, setNewChannelName] = useState('')

  const updateField = <K extends keyof CommerceCharacteristic>(
    field: K,
    val: CommerceCharacteristic[K]
  ) => {
    onChange({ ...value, [field]: val })
  }

  const toggleOrderType = (type: string) => {
    const updated = value.order_types.includes(type)
      ? value.order_types.filter((t) => t !== type)
      : [...value.order_types, type]
    updateField('order_types', updated)
  }

  const toggleCustomerSegment = (segment: string) => {
    const updated = value.customer_segments.includes(segment)
      ? value.customer_segments.filter((s) => s !== segment)
      : [...value.customer_segments, segment]
    updateField('customer_segments', updated)
  }

  const addChannel = () => {
    if (!newChannelName.trim()) return
    const channelRules = value.channel_rules || []
    const newRule: ChannelRule = {
      channel: newChannelName.trim(),
      priority: channelRules.length + 1,
      allocation_percentage: 100,
      enabled: true,
    }
    updateField('channel_rules', [...channelRules, newRule])
    updateField('channels', [...value.channels, newChannelName.trim()])
    setNewChannelName('')
  }

  const updateChannelRule = (index: number, updates: Partial<ChannelRule>) => {
    const channelRules = [...(value.channel_rules || [])]
    channelRules[index] = { ...channelRules[index], ...updates }
    updateField('channel_rules', channelRules)
  }

  const removeChannel = (index: number) => {
    const channelRules = [...(value.channel_rules || [])]
    const removedChannel = channelRules[index].channel
    channelRules.splice(index, 1)
    updateField('channel_rules', channelRules)
    updateField(
      'channels',
      value.channels.filter((c) => c !== removedChannel)
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-primary" />
          <CardTitle>Commerce Characteristic</CardTitle>
        </div>
        <CardDescription>
          Configure channel priorities, order types, customer segments, and time-based rules
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable Commerce Characteristic */}
        <div className="flex items-center justify-between">
          <Label htmlFor="commerce-enabled">Enable Commerce Characteristic Rules</Label>
          <Switch
            id="commerce-enabled"
            checked={value.enabled}
            onCheckedChange={(checked) => updateField('enabled', checked)}
          />
        </div>

        {value.enabled && (
          <Tabs defaultValue="channels" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
              <TabsTrigger value="channels">Channels</TabsTrigger>
              <TabsTrigger value="types">Order Types</TabsTrigger>
              <TabsTrigger value="segments">Segments</TabsTrigger>
              <TabsTrigger value="time">Time Rules</TabsTrigger>
            </TabsList>

            {/* Channels Tab */}
            <TabsContent value="channels" className="space-y-4">
              <div className="space-y-2">
                <Label>Add Channel</Label>
                <div className="flex gap-2">
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                  >
                    <option value="">Select a channel...</option>
                    {AVAILABLE_CHANNELS.filter((c) => !value.channels.includes(c)).map((channel) => (
                      <option key={channel} value={channel}>
                        {channel}
                      </option>
                    ))}
                  </select>
                  <Button type="button" onClick={addChannel} disabled={!newChannelName}>
                    Add
                  </Button>
                </div>
              </div>

              {value.channel_rules && value.channel_rules.length > 0 && (
                <div className="space-y-2">
                  <Label>Channel Configuration</Label>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2 text-sm font-medium">Channel</th>
                          <th className="text-left p-2 text-sm font-medium">Priority</th>
                          <th className="text-left p-2 text-sm font-medium">Allocation %</th>
                          <th className="text-left p-2 text-sm font-medium">Enabled</th>
                          <th className="text-left p-2 text-sm font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {value.channel_rules.map((rule, index) => (
                          <tr key={index} className="border-b">
                            <td className="p-2 text-sm">{rule.channel}</td>
                            <td className="p-2">
                              <Input
                                type="number"
                                min="1"
                                value={rule.priority}
                                onChange={(e) =>
                                  updateChannelRule(index, {
                                    priority: parseInt(e.target.value) || 1,
                                  })
                                }
                                className="w-20"
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={rule.allocation_percentage}
                                onChange={(e) =>
                                  updateChannelRule(index, {
                                    allocation_percentage: parseInt(e.target.value) || 0,
                                  })
                                }
                                className="w-20"
                              />
                            </td>
                            <td className="p-2">
                              <Switch
                                checked={rule.enabled}
                                onCheckedChange={(checked) =>
                                  updateChannelRule(index, { enabled: checked })
                                }
                              />
                            </td>
                            <td className="p-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeChannel(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Order Types Tab */}
            <TabsContent value="types" className="space-y-4">
              <div className="space-y-2">
                <Label>Allowed Order Types</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ORDER_TYPES.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`order-type-${type}`}
                        checked={value.order_types.includes(type)}
                        onCheckedChange={() => toggleOrderType(type)}
                      />
                      <label
                        htmlFor={`order-type-${type}`}
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer capitalize"
                      >
                        {type.replace('-', ' ')}
                      </label>
                    </div>
                  ))}
                </div>
                {value.order_types.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {value.order_types.map((type) => (
                      <Badge key={type} variant="secondary">
                        {type}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Customer Segments Tab */}
            <TabsContent value="segments" className="space-y-4">
              <div className="space-y-2">
                <Label>Customer Segments</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CUSTOMER_SEGMENTS.map((segment) => (
                    <div key={segment} className="flex items-center space-x-2">
                      <Checkbox
                        id={`segment-${segment}`}
                        checked={value.customer_segments.includes(segment)}
                        onCheckedChange={() => toggleCustomerSegment(segment)}
                      />
                      <label
                        htmlFor={`segment-${segment}`}
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {segment}
                      </label>
                    </div>
                  ))}
                </div>
                {value.customer_segments.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {value.customer_segments.map((seg) => (
                      <Badge key={seg} variant="secondary">
                        {seg}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Time-Based Rules Tab */}
            <TabsContent value="time" className="space-y-4">
              <TimeSlotPicker
                value={value.peak_hours || []}
                onChange={(slots) => updateField('peak_hours', slots)}
                title="Peak Hours"
                description="Define peak business hours with higher demand"
              />

              <TimeSlotPicker
                value={value.off_peak_hours || []}
                onChange={(slots) => updateField('off_peak_hours', slots)}
                title="Off-Peak Hours"
                description="Define off-peak hours with lower demand"
              />
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}
