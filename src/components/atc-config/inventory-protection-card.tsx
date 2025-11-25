'use client'

import { InventoryProtection, SafetyStockSettings, ReservedInventoryConfig } from '@/types/atc-config'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Shield } from 'lucide-react'

interface InventoryProtectionCardProps {
  value: InventoryProtection
  onChange: (value: InventoryProtection) => void
}

const PRODUCT_CATEGORIES = [
  'Electronics',
  'Grocery',
  'Fashion',
  'Home & Living',
  'Health & Beauty',
  'Sports & Outdoors',
  'Toys & Games',
  'Books & Media',
]

const RESERVED_TYPES: ('preorder' | 'hold' | 'pending')[] = ['preorder', 'hold', 'pending']

/**
 * InventoryProtectionCard Component
 *
 * Advanced configuration card for inventory protection rules including:
 * - Safety stock threshold (percentage or absolute)
 * - Product category selection
 * - Reserved inventory type configuration
 * - Auto-release settings
 */
export function InventoryProtectionCard({ value, onChange }: InventoryProtectionCardProps) {
  const updateField = <K extends keyof InventoryProtection>(field: K, val: InventoryProtection[K]) => {
    onChange({ ...value, [field]: val })
  }

  const updateSafetyStock = (updates: Partial<SafetyStockSettings>) => {
    onChange({
      ...value,
      safety_stock_settings: {
        type: value.safety_stock_settings?.type || 'percentage',
        value: value.safety_stock_settings?.value || 10,
        product_categories: value.safety_stock_settings?.product_categories || [],
        ...updates,
      },
    })
  }

  const updateReservedConfig = (updates: Partial<ReservedInventoryConfig>) => {
    onChange({
      ...value,
      reserved_inventory_config: {
        types: value.reserved_inventory_config?.types || [],
        auto_release_enabled: value.reserved_inventory_config?.auto_release_enabled || false,
        auto_release_hours: value.reserved_inventory_config?.auto_release_hours || 24,
        ...updates,
      },
    })
  }

  const toggleCategory = (category: string) => {
    const current = value.safety_stock_settings?.product_categories || []
    const updated = current.includes(category)
      ? current.filter((c) => c !== category)
      : [...current, category]
    updateSafetyStock({ product_categories: updated })
  }

  const toggleReservedType = (type: 'preorder' | 'hold' | 'pending') => {
    const current = value.reserved_inventory_config?.types || []
    const updated = current.includes(type) ? current.filter((t) => t !== type) : [...current, type]
    updateReservedConfig({ types: updated })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle>Inventory Protection</CardTitle>
        </div>
        <CardDescription>
          Configure safety stock thresholds and reserved inventory handling
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable Protection */}
        <div className="flex items-center justify-between">
          <Label htmlFor="protection-enabled">Enable Inventory Protection</Label>
          <Switch
            id="protection-enabled"
            checked={value.enabled}
            onCheckedChange={(checked) => updateField('enabled', checked)}
          />
        </div>

        {value.enabled && (
          <>
            {/* Safety Stock Configuration */}
            <div className="space-y-4 pt-4 border-t">
              <div className="font-medium text-sm">Safety Stock Settings</div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Threshold Type</Label>
                  <Select
                    value={value.safety_stock_settings?.type || 'percentage'}
                    onValueChange={(v: 'percentage' | 'absolute') => updateSafetyStock({ type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="absolute">Absolute Value</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>
                    Safety Stock Value{' '}
                    {value.safety_stock_settings?.type === 'percentage' ? '(%)' : '(Units)'}
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={value.safety_stock_settings?.value || 10}
                    onChange={(e) => updateSafetyStock({ value: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              {/* Product Categories */}
              <div className="space-y-2">
                <Label>Product Categories</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {PRODUCT_CATEGORIES.map((category) => {
                    const isSelected =
                      value.safety_stock_settings?.product_categories?.includes(category) || false
                    return (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category}`}
                          checked={isSelected}
                          onCheckedChange={() => toggleCategory(category)}
                        />
                        <label
                          htmlFor={`category-${category}`}
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {category}
                        </label>
                      </div>
                    )
                  })}
                </div>
                {value.safety_stock_settings?.product_categories &&
                  value.safety_stock_settings.product_categories.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {value.safety_stock_settings.product_categories.map((cat) => (
                        <Badge key={cat} variant="secondary">
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  )}
              </div>

              {/* Protection Threshold */}
              <div className="space-y-2">
                <Label>Protection Threshold (Minimum Available)</Label>
                <Input
                  type="number"
                  min="0"
                  value={value.protection_threshold}
                  onChange={(e) =>
                    updateField('protection_threshold', parseFloat(e.target.value) || 0)
                  }
                  placeholder="e.g., 5"
                />
                <p className="text-xs text-muted-foreground">
                  Minimum quantity that must remain available after orders
                </p>
              </div>
            </div>

            {/* Reserved Inventory Configuration */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="font-medium text-sm">Reserved Inventory</div>
                <Switch
                  checked={value.reserved_inventory}
                  onCheckedChange={(checked) => updateField('reserved_inventory', checked)}
                />
              </div>

              {value.reserved_inventory && (
                <>
                  <div className="space-y-2">
                    <Label>Reserved Inventory Types</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {RESERVED_TYPES.map((type) => {
                        const isSelected =
                          value.reserved_inventory_config?.types?.includes(type) || false
                        return (
                          <div key={type} className="flex items-center space-x-2">
                            <Checkbox
                              id={`reserved-${type}`}
                              checked={isSelected}
                              onCheckedChange={() => toggleReservedType(type)}
                            />
                            <label
                              htmlFor={`reserved-${type}`}
                              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer capitalize"
                            >
                              {type}
                            </label>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-release">Auto-Release Reserved Inventory</Label>
                    <Switch
                      id="auto-release"
                      checked={value.reserved_inventory_config?.auto_release_enabled || false}
                      onCheckedChange={(checked) =>
                        updateReservedConfig({ auto_release_enabled: checked })
                      }
                    />
                  </div>

                  {value.reserved_inventory_config?.auto_release_enabled && (
                    <div className="space-y-2">
                      <Label>Auto-Release After (Hours)</Label>
                      <Input
                        type="number"
                        min="1"
                        value={value.reserved_inventory_config.auto_release_hours}
                        onChange={(e) =>
                          updateReservedConfig({
                            auto_release_hours: parseInt(e.target.value) || 24,
                          })
                        }
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
