'use client'

import type { NetworkViewConfig } from '@/types/atc-config'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'

interface NetworkViewConfigProps {
  value: NetworkViewConfig
  onChange: (value: NetworkViewConfig) => void
}

const ALERT_CHANNELS = ['email', 'sms', 'teams']

/**
 * NetworkViewConfig Component
 *
 * Provides UI for configuring network-wide synchronization settings including:
 * - Full sync mode with warning alert
 * - Threshold alert configuration (value, type, channels)
 * - Sync frequency settings (interval, batch size, retry attempts)
 * - Monitoring options (track duration, alert on failure)
 */
export function NetworkViewConfig({ value, onChange }: NetworkViewConfigProps) {
  const updateField = <K extends keyof NetworkViewConfig>(
    field: K,
    val: NetworkViewConfig[K]
  ) => {
    onChange({ ...value, [field]: val })
  }

  const updateThresholdAlert = (updates: Partial<NetworkViewConfig['threshold_alert']>) => {
    updateField('threshold_alert', { ...value.threshold_alert, ...updates })
  }

  const updateSyncFrequency = (updates: Partial<NetworkViewConfig['sync_frequency']>) => {
    updateField('sync_frequency', { ...value.sync_frequency, ...updates })
  }

  const updateMonitoring = (updates: Partial<NetworkViewConfig['monitoring']>) => {
    updateField('monitoring', { ...value.monitoring, ...updates })
  }

  const toggleAlertChannel = (channel: string) => {
    const channels = value.threshold_alert.alert_channels
    const updated = channels.includes(channel)
      ? channels.filter((c) => c !== channel)
      : [...channels, channel]
    updateThresholdAlert({ alert_channels: updated })
  }

  return (
    <div className="space-y-6">
      {/* Full Sync Toggle */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="full-sync">Full Sync Mode</Label>
            <p className="text-sm text-muted-foreground">
              Synchronize all locations with complete data refresh
            </p>
          </div>
          <Switch
            id="full-sync"
            checked={value.full_sync}
            onCheckedChange={(checked) => updateField('full_sync', checked)}
          />
        </div>
        {value.full_sync && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Full sync will update all locations. This may take several minutes and could impact performance.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Threshold Alerts Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="threshold-alert-enabled">Threshold Alerts</Label>
            <p className="text-sm text-muted-foreground">
              Get notified when inventory falls below threshold
            </p>
          </div>
          <Switch
            id="threshold-alert-enabled"
            checked={value.threshold_alert.enabled}
            onCheckedChange={(checked) => updateThresholdAlert({ enabled: checked })}
          />
        </div>

        {value.threshold_alert.enabled && (
          <div className="space-y-4 pl-4 border-l-2 border-muted">
            <div className="space-y-2">
              <Label htmlFor="threshold-value">Threshold Value</Label>
              <Input
                id="threshold-value"
                type="number"
                min={0}
                value={value.threshold_alert.threshold_value}
                onChange={(e) =>
                  updateThresholdAlert({
                    threshold_value: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="Enter threshold value"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="threshold-type">Threshold Type</Label>
              <Select
                value={value.threshold_alert.threshold_type}
                onValueChange={(val: 'percentage' | 'absolute') =>
                  updateThresholdAlert({ threshold_type: val })
                }
              >
                <SelectTrigger id="threshold-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="absolute">Absolute Value</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Alert Channels</Label>
              <div className="grid grid-cols-3 gap-2">
                {ALERT_CHANNELS.map((channel) => (
                  <div key={channel} className="flex items-center space-x-2">
                    <Checkbox
                      id={`alert-channel-${channel}`}
                      checked={value.threshold_alert.alert_channels.includes(channel)}
                      onCheckedChange={() => toggleAlertChannel(channel)}
                    />
                    <label
                      htmlFor={`alert-channel-${channel}`}
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer capitalize"
                    >
                      {channel === 'teams' ? 'MS Teams' : channel}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sync Frequency Section */}
      <div className="space-y-4">
        <div>
          <Label>Sync Frequency</Label>
          <p className="text-sm text-muted-foreground">
            Configure how often to synchronize inventory data
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="sync-interval">Sync Interval</Label>
            <span className="text-sm font-medium">
              {value.sync_frequency.interval_minutes} minutes
            </span>
          </div>
          <Slider
            id="sync-interval"
            min={1}
            max={60}
            step={1}
            value={[value.sync_frequency.interval_minutes]}
            onValueChange={(values) =>
              updateSyncFrequency({ interval_minutes: values[0] })
            }
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="batch-size">Batch Size</Label>
            <Input
              id="batch-size"
              type="number"
              min={1}
              value={value.sync_frequency.batch_size}
              onChange={(e) =>
                updateSyncFrequency({
                  batch_size: parseInt(e.target.value) || 100,
                })
              }
              placeholder="Items per batch"
            />
            <p className="text-xs text-muted-foreground">
              Number of items to sync per batch
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="retry-attempts">Retry Attempts</Label>
            <Input
              id="retry-attempts"
              type="number"
              min={0}
              max={10}
              value={value.sync_frequency.retry_attempts}
              onChange={(e) =>
                updateSyncFrequency({
                  retry_attempts: parseInt(e.target.value) || 3,
                })
              }
              placeholder="Retry count"
            />
            <p className="text-xs text-muted-foreground">
              Number of retry attempts on failure
            </p>
          </div>
        </div>
      </div>

      {/* Monitoring Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="monitoring-enabled">Monitoring</Label>
            <p className="text-sm text-muted-foreground">
              Enable monitoring and alerting features
            </p>
          </div>
          <Switch
            id="monitoring-enabled"
            checked={value.monitoring.enabled}
            onCheckedChange={(checked) => updateMonitoring({ enabled: checked })}
          />
        </div>

        {value.monitoring.enabled && (
          <div className="space-y-3 pl-4 border-l-2 border-muted">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="track-sync-duration"
                checked={value.monitoring.track_sync_duration}
                onCheckedChange={(checked) =>
                  updateMonitoring({ track_sync_duration: checked as boolean })
                }
              />
              <label
                htmlFor="track-sync-duration"
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Track sync duration
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="alert-on-failure"
                checked={value.monitoring.alert_on_failure}
                onCheckedChange={(checked) =>
                  updateMonitoring({ alert_on_failure: checked as boolean })
                }
              />
              <label
                htmlFor="alert-on-failure"
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Alert on sync failure
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
