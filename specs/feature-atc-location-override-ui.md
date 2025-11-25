# Feature: ATC Configuration - Location Override UI Components

## Overview
Implement the missing Network View and Location View configuration UI components for the ATC Configuration page. These components allow administrators to configure location-specific overrides and network-wide synchronization settings.

## Scope
This is a focused implementation to complete the Phase 2 Location Override functionality that was planned but not fully implemented.

## Requirements

### 1. Network View Configuration Component

**File**: `src/components/atc-config/network-view-config.tsx`

**Purpose**: Configure system-wide synchronization settings for ATC rules across all locations.

**Features**:
- Full sync toggle with warning message
- Threshold alert configuration
  - Enable/disable toggle
  - Threshold value input (number or percentage)
  - Threshold type selector (percentage/absolute)
  - Alert channel multi-select (email, SMS, MS Teams)
- Sync frequency configuration
  - Interval slider (1-60 minutes)
  - Batch size input
  - Retry attempts input
- Monitoring settings toggle
  - Track sync duration
  - Alert on failure

**UI Design**:
```tsx
<Card>
  <CardHeader>
    <CardTitle>Network View Configuration</CardTitle>
    <CardDescription>System-wide synchronization settings</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="space-y-6">
      {/* Full Sync Toggle */}
      <div className="flex items-center justify-between">
        <Label>Full Sync Mode</Label>
        <Switch />
      </div>
      {fullSync && (
        <Alert variant="warning">
          Full sync will update all locations. This may take several minutes.
        </Alert>
      )}

      {/* Threshold Alerts */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Threshold Alerts</Label>
          <Switch />
        </div>
        {thresholdEnabled && (
          <>
            <Input type="number" placeholder="Threshold value" />
            <Select> {/* percentage/absolute */} </Select>
            <MultiSelect options={alertChannels} /> {/* email, sms, teams */}
          </>
        )}
      </div>

      {/* Sync Frequency */}
      <div className="space-y-4">
        <Label>Sync Frequency</Label>
        <div className="flex items-center gap-4">
          <Slider min={1} max={60} />
          <span>{syncInterval} minutes</span>
        </div>
        <Input type="number" placeholder="Batch size" />
        <Input type="number" placeholder="Retry attempts" />
      </div>

      {/* Monitoring */}
      <div className="space-y-2">
        <Label>Monitoring</Label>
        <Checkbox>Track sync duration</Checkbox>
        <Checkbox>Alert on failure</Checkbox>
      </div>
    </div>
  </CardContent>
</Card>
```

**TypeScript Interface** (already exists in `atc-config.ts`):
```typescript
interface NetworkViewConfig {
  full_sync: boolean
  threshold_alert: {
    enabled: boolean
    threshold_value: number
    threshold_type: 'percentage' | 'absolute'
    alert_channels: string[]
  }
  sync_frequency: {
    interval_minutes: number
    batch_size: number
    retry_attempts: number
  }
  monitoring: {
    enabled: boolean
    track_sync_duration: boolean
    alert_on_failure: boolean
  }
}
```

### 2. Location View Configuration Component

**File**: `src/components/atc-config/location-view-config.tsx`

**Purpose**: Configure location-specific overrides for individual stores or warehouses.

**Features**:
- Full sync vs Delta sync toggle
- Delta sync field selection (multi-select)
- Conflict resolution strategy dropdown
- Location overrides table with CRUD operations
- Add/Edit/Delete location overrides
- Override types: enable, disable, custom
- Effective date range picker

**UI Design**:
```tsx
<Card>
  <CardHeader>
    <CardTitle>Location View Configuration</CardTitle>
    <CardDescription>Store-specific overrides and delta sync</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="space-y-6">
      {/* Sync Type Toggle */}
      <div className="space-y-4">
        <Label>Sync Type</Label>
        <RadioGroup>
          <RadioGroupItem value="full">Full Sync</RadioGroupItem>
          <RadioGroupItem value="delta">Delta Sync</RadioGroupItem>
        </RadioGroup>

        {deltaSync && (
          <>
            <Label>Sync Fields</Label>
            <MultiSelect options={syncFields} />

            <Label>Conflict Resolution</Label>
            <Select>
              <SelectItem value="latest_wins">Latest Wins</SelectItem>
              <SelectItem value="manual_review">Manual Review</SelectItem>
              <SelectItem value="priority_based">Priority Based</SelectItem>
            </Select>
          </>
        )}
      </div>

      {/* Location Overrides Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Location Overrides</Label>
          <Button onClick={addOverride}>
            <Plus className="mr-2 h-4 w-4" />
            Add Override
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Location</TableHead>
              <TableHead>Override Type</TableHead>
              <TableHead>Enabled</TableHead>
              <TableHead>Threshold</TableHead>
              <TableHead>Effective From</TableHead>
              <TableHead>Effective Until</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {overrides.map(override => (
              <TableRow key={override.id}>
                <TableCell>{override.location_name}</TableCell>
                <TableCell>
                  <Badge>{override.override_type}</Badge>
                </TableCell>
                <TableCell>
                  <Switch checked={override.sync_enabled} />
                </TableCell>
                <TableCell>{override.threshold}</TableCell>
                <TableCell>{override.effective_from}</TableCell>
                <TableCell>{override.effective_until || 'Indefinite'}</TableCell>
                <TableCell>
                  <Button variant="ghost" onClick={() => editOverride(override)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" onClick={() => deleteOverride(override.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  </CardContent>
</Card>

{/* Add/Edit Override Dialog */}
<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>{editingOverride ? 'Edit' : 'Add'} Location Override</DialogTitle>
    </DialogHeader>
    <div className="space-y-4">
      <div>
        <Label>Location</Label>
        <Select>
          {stores.map(store => (
            <SelectItem key={store.id} value={store.id}>
              {store.name}
            </SelectItem>
          ))}
        </Select>
      </div>

      <div>
        <Label>Override Type</Label>
        <Select>
          <SelectItem value="enable">Enable</SelectItem>
          <SelectItem value="disable">Disable</SelectItem>
          <SelectItem value="custom">Custom Rules</SelectItem>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <Label>Enable Sync</Label>
        <Switch />
      </div>

      <div>
        <Label>Threshold</Label>
        <Input type="number" placeholder="Override threshold" />
      </div>

      <div>
        <Label>Effective Date Range</Label>
        <DateRangePicker />
      </div>

      {overrideType === 'custom' && (
        <div>
          <Label>Custom Rules (JSON)</Label>
          <Textarea placeholder='{"key": "value"}' rows={6} />
        </div>
      )}
    </div>
    <DialogFooter>
      <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
      <Button onClick={saveOverride}>Save Override</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**TypeScript Interface** (enhance existing in `atc-config.ts`):
```typescript
interface LocationOverride {
  id: string
  location_id: string
  location_name: string
  override_type: 'enable' | 'disable' | 'custom'
  sync_enabled: boolean
  threshold: number
  effective_from: string
  effective_until?: string
  custom_rules?: Partial<ATCConfiguration>
}

interface LocationViewConfig {
  full_sync: boolean
  delta_sync: boolean
  delta_sync_fields?: string[]
  conflict_resolution_strategy?: 'latest_wins' | 'manual_review' | 'priority_based'
  location_overrides: LocationOverride[]
}
```

### 3. Integration with Main ATC Rule Section

**File**: `src/components/atc-config/atc-rule-section.tsx`

**Current placeholder code to replace**:
```tsx
// OLD (lines ~240-252):
<div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
  Location-specific overrides can be configured in Phase 2
</div>
```

**NEW**:
```tsx
import { NetworkViewConfig } from './network-view-config'
import { LocationViewConfig } from './location-view-config'

// In the Network View tab:
<NetworkViewConfig
  value={networkView}
  onChange={(updated) => onChange({ ...config, views: { ...config.views, network: updated } })}
/>

// In the Location View tab:
<LocationViewConfig
  value={locationView}
  onChange={(updated) => onChange({ ...config, views: { ...config.views, location: updated } })}
/>
```

### 4. Update Channel List

**File**: `src/components/atc-config/commerce-characteristic-card.tsx`

**Change line ~24**:
```typescript
// OLD:
const AVAILABLE_CHANNELS = ['GrabMart', 'Line Man', 'Shopee', 'Lazada', 'Website', 'Mobile App']

// NEW:
const AVAILABLE_CHANNELS = ['Tops Online', 'Lazada', 'Shopee', 'Grab', 'LINE MAN', 'Gookoo']
```

## Implementation Checklist

### Files to Create:
- [ ] `src/components/atc-config/network-view-config.tsx` (250-300 lines)
- [ ] `src/components/atc-config/location-view-config.tsx` (400-450 lines)

### Files to Update:
- [ ] `src/components/atc-config/atc-rule-section.tsx` - Replace placeholders with new components
- [ ] `src/components/atc-config/commerce-characteristic-card.tsx` - Update channel list
- [ ] `src/types/atc-config.ts` - Enhance LocationOverride interface if needed

### UI Components to Use:
- Card, CardHeader, CardContent, CardTitle, CardDescription
- Switch, Checkbox, RadioGroup
- Input, Select, MultiSelect
- Slider
- Button, Badge
- Table, TableHeader, TableBody, TableRow, TableHead, TableCell
- Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
- Alert
- DateRangePicker (or use Input type="date")
- Textarea (for custom rules JSON)

## Mock Store Data

For location selection in overrides, use these Tops store locations:
```typescript
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
```

## Validation

After implementation, verify:
1. Network View Config component renders without errors
2. Location View Config component renders without errors
3. Can add/edit/delete location overrides
4. Table displays overrides correctly
5. Dialog opens/closes properly
6. All form inputs work correctly
7. Channel list shows: Tops Online, Lazada, Shopee, Grab, LINE MAN, Gookoo
8. Mobile-responsive design maintained
9. No TypeScript errors
10. Integration with main page works

## Design Consistency

- Follow existing Omnia UI patterns
- Use consistent spacing (space-y-4, space-y-6)
- Match styling from other condition cards
- Use same card/form layouts as Phase 1 components
- Maintain mobile-first responsive design

## Notes

- These components complete the Phase 2 Location Override functionality
- Infrastructure (types, database schema) already exists
- Focus on UI/UX for configuration management
- Use mock data for store locations (Supabase integration can be added later)
- Ensure proper TypeScript typing throughout
