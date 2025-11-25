'use client'

import { useState } from 'react'
import type { LocationViewConfig, LocationOverride } from '@/types/atc-config'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Pencil, Trash2, Calendar } from 'lucide-react'

interface LocationViewConfigProps {
  value: LocationViewConfig
  onChange: (value: LocationViewConfig) => void
}

// Mock store data for location selection
const TOPS_STORES = [
  { id: 'tops-001', name: 'Tops Central Plaza ลาดพร้าว' },
  { id: 'tops-002', name: 'Tops Central World' },
  { id: 'tops-003', name: 'Tops สุขุมวิท 39' },
  { id: 'tops-004', name: 'Tops ทองหล่อ' },
  { id: 'tops-005', name: 'Tops สีลม คอมเพล็กซ์' },
  { id: 'tops-006', name: 'Tops เอกมัย' },
  { id: 'tops-007', name: 'Tops พร้อมพงษ์' },
  { id: 'tops-008', name: 'Tops จตุจักร' },
]

// Available fields for delta sync
const SYNC_FIELDS = [
  { id: 'quantity', label: 'Quantity' },
  { id: 'price', label: 'Price' },
  { id: 'status', label: 'Status' },
  { id: 'threshold', label: 'Threshold' },
  { id: 'priority', label: 'Priority' },
  { id: 'custom_rules', label: 'Custom Rules' },
]

/**
 * LocationViewConfig Component
 *
 * Provides UI for configuring location-specific overrides including:
 * - Full sync vs Delta sync toggle
 * - Delta sync field selection
 * - Conflict resolution strategy
 * - Location overrides table with CRUD operations
 * - Add/Edit/Delete location overrides dialog
 */
export function LocationViewConfig({ value, onChange }: LocationViewConfigProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingOverride, setEditingOverride] = useState<LocationOverride | null>(null)
  const [formData, setFormData] = useState<Partial<LocationOverride>>({})

  const updateField = <K extends keyof LocationViewConfig>(
    field: K,
    val: LocationViewConfig[K]
  ) => {
    onChange({ ...value, [field]: val })
  }

  const toggleDeltaSyncField = (fieldId: string) => {
    const fields = value.delta_sync_fields || []
    const updated = fields.includes(fieldId)
      ? fields.filter((f) => f !== fieldId)
      : [...fields, fieldId]
    updateField('delta_sync_fields', updated)
  }

  const openAddDialog = () => {
    setEditingOverride(null)
    setFormData({
      location_id: '',
      location_name: '',
      override_type: 'enable',
      sync_enabled: true,
      threshold: 0,
      effective_from: new Date().toISOString().split('T')[0],
      effective_until: '',
      custom_rules: undefined,
    })
    setDialogOpen(true)
  }

  const openEditDialog = (override: LocationOverride) => {
    setEditingOverride(override)
    setFormData(override)
    setDialogOpen(true)
  }

  const saveOverride = () => {
    if (!formData.location_id || !formData.location_name) {
      alert('Please select a location')
      return
    }

    const newOverride: LocationOverride = {
      id: editingOverride?.id || `override-${Date.now()}`,
      location_id: formData.location_id || '',
      location_name: formData.location_name || '',
      override_type: formData.override_type || 'enable',
      sync_enabled: formData.sync_enabled ?? true,
      threshold: formData.threshold || 0,
      effective_from: formData.effective_from || new Date().toISOString().split('T')[0],
      effective_until: formData.effective_until,
      custom_rules: formData.custom_rules,
    }

    let overrides = [...value.location_overrides]
    if (editingOverride) {
      // Update existing
      const index = overrides.findIndex((o) => o.id === editingOverride.id)
      if (index !== -1) {
        overrides[index] = newOverride
      }
    } else {
      // Add new
      overrides.push(newOverride)
    }

    updateField('location_overrides', overrides)
    setDialogOpen(false)
    setFormData({})
    setEditingOverride(null)
  }

  const deleteOverride = (id: string) => {
    if (!confirm('Are you sure you want to delete this override?')) return
    const overrides = value.location_overrides.filter((o) => o.id !== id)
    updateField('location_overrides', overrides)
  }

  const handleLocationSelect = (locationId: string) => {
    const store = TOPS_STORES.find((s) => s.id === locationId)
    if (store) {
      setFormData({
        ...formData,
        location_id: store.id,
        location_name: store.name,
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Sync Type Selection */}
      <div className="space-y-4">
        <div>
          <Label>Sync Type</Label>
          <p className="text-sm text-muted-foreground">
            Choose between full synchronization or delta updates
          </p>
        </div>

        <RadioGroup
          value={value.delta_sync ? 'delta' : 'full'}
          onValueChange={(val) => {
            updateField('full_sync', val === 'full')
            updateField('delta_sync', val === 'delta')
          }}
          className="grid grid-cols-2 gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="full" id="sync-full" />
            <label
              htmlFor="sync-full"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Full Sync
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="delta" id="sync-delta" />
            <label
              htmlFor="sync-delta"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Delta Sync
            </label>
          </div>
        </RadioGroup>

        {/* Delta Sync Configuration */}
        {value.delta_sync && (
          <div className="space-y-4 pl-4 border-l-2 border-muted">
            <div className="space-y-2">
              <Label>Sync Fields</Label>
              <p className="text-sm text-muted-foreground">
                Select which fields to include in delta synchronization
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SYNC_FIELDS.map((field) => (
                  <div key={field.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`sync-field-${field.id}`}
                      checked={(value.delta_sync_fields || []).includes(field.id)}
                      onCheckedChange={() => toggleDeltaSyncField(field.id)}
                    />
                    <label
                      htmlFor={`sync-field-${field.id}`}
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {field.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="conflict-strategy">Conflict Resolution Strategy</Label>
              <Select
                value={value.conflict_resolution_strategy || 'latest_wins'}
                onValueChange={(val: 'latest_wins' | 'manual_review' | 'priority_based') =>
                  updateField('conflict_resolution_strategy', val)
                }
              >
                <SelectTrigger id="conflict-strategy">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest_wins">Latest Wins</SelectItem>
                  <SelectItem value="manual_review">Manual Review</SelectItem>
                  <SelectItem value="priority_based">Priority Based</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                How to handle conflicts when multiple updates occur
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Location Overrides Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label>Location Overrides</Label>
            <p className="text-sm text-muted-foreground">
              Configure location-specific sync settings and thresholds
            </p>
          </div>
          <Button onClick={openAddDialog} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Override
          </Button>
        </div>

        {value.location_overrides.length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Location</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Enabled</TableHead>
                    <TableHead>Threshold</TableHead>
                    <TableHead>Effective From</TableHead>
                    <TableHead>Effective Until</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {value.location_overrides.map((override) => (
                    <TableRow key={override.id}>
                      <TableCell className="font-medium">{override.location_name}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            override.override_type === 'enable'
                              ? 'default'
                              : override.override_type === 'disable'
                              ? 'secondary'
                              : 'outline'
                          }
                        >
                          {override.override_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Switch checked={override.sync_enabled} disabled />
                      </TableCell>
                      <TableCell>{override.threshold}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {override.effective_from}
                        </div>
                      </TableCell>
                      <TableCell>
                        {override.effective_until ? (
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3" />
                            {override.effective_until}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">Indefinite</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(override)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteOverride(override.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <div className="border border-dashed rounded-lg p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No location overrides configured. Click "Add Override" to create one.
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Override Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingOverride ? 'Edit' : 'Add'} Location Override
            </DialogTitle>
            <DialogDescription>
              Configure location-specific sync settings and thresholds
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Location Selection */}
            <div className="space-y-2">
              <Label htmlFor="location-select">Location</Label>
              <Select
                value={formData.location_id}
                onValueChange={handleLocationSelect}
              >
                <SelectTrigger id="location-select">
                  <SelectValue placeholder="Select a location..." />
                </SelectTrigger>
                <SelectContent>
                  {TOPS_STORES.map((store) => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Override Type */}
            <div className="space-y-2">
              <Label htmlFor="override-type">Override Type</Label>
              <Select
                value={formData.override_type}
                onValueChange={(val: 'enable' | 'disable' | 'custom') =>
                  setFormData({ ...formData, override_type: val })
                }
              >
                <SelectTrigger id="override-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="enable">Enable</SelectItem>
                  <SelectItem value="disable">Disable</SelectItem>
                  <SelectItem value="custom">Custom Rules</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Enable: Force sync on, Disable: Force sync off, Custom: Apply custom rules
              </p>
            </div>

            {/* Sync Enabled Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sync-enabled">Enable Sync</Label>
                <p className="text-sm text-muted-foreground">
                  Allow synchronization for this location
                </p>
              </div>
              <Switch
                id="sync-enabled"
                checked={formData.sync_enabled ?? true}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, sync_enabled: checked })
                }
              />
            </div>

            {/* Threshold */}
            <div className="space-y-2">
              <Label htmlFor="threshold">Threshold</Label>
              <Input
                id="threshold"
                type="number"
                min={0}
                value={formData.threshold || 0}
                onChange={(e) =>
                  setFormData({ ...formData, threshold: parseInt(e.target.value) || 0 })
                }
                placeholder="Override threshold value"
              />
              <p className="text-xs text-muted-foreground">
                Location-specific threshold for inventory alerts
              </p>
            </div>

            {/* Effective Date Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="effective-from">Effective From</Label>
                <Input
                  id="effective-from"
                  type="date"
                  value={formData.effective_from || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, effective_from: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="effective-until">Effective Until (Optional)</Label>
                <Input
                  id="effective-until"
                  type="date"
                  value={formData.effective_until || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, effective_until: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty for indefinite
                </p>
              </div>
            </div>

            {/* Custom Rules (only shown for 'custom' override type) */}
            {formData.override_type === 'custom' && (
              <div className="space-y-2">
                <Label htmlFor="custom-rules">Custom Rules (JSON)</Label>
                <Textarea
                  id="custom-rules"
                  rows={6}
                  placeholder='{"key": "value"}'
                  value={
                    formData.custom_rules
                      ? JSON.stringify(formData.custom_rules, null, 2)
                      : ''
                  }
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value)
                      setFormData({ ...formData, custom_rules: parsed })
                    } catch {
                      // Invalid JSON, keep as is for now
                    }
                  }}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Advanced: Provide custom ATC configuration rules in JSON format
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveOverride}>
              {editingOverride ? 'Update' : 'Add'} Override
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
