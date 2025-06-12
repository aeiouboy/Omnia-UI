"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChannelBadge } from "./order-badges"
import { formatOverTime, formatRemainingTime } from "@/lib/sla-utils"
import { 
  AlertTriangle, 
  Clock, 
  X, 
  Send,
  ChevronDown,
  ChevronUp
} from "lucide-react"

interface SLAAlert {
  id: string
  order_number: string
  customer_name: string
  channel: string
  location: string
  target_minutes: number
  elapsed_minutes: number
  type: 'breach' | 'approaching'
}

interface CriticalAlertsBannerProps {
  slaBreaches: SLAAlert[]
  approachingAlerts: SLAAlert[]
  onEscalate: () => void
  onDismiss?: () => void
  isEscalating?: boolean
}

export function CriticalAlertsBanner({
  slaBreaches,
  approachingAlerts,
  onEscalate,
  onDismiss,
  isEscalating = false
}: CriticalAlertsBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const totalCriticalAlerts = slaBreaches.length + approachingAlerts.length
  
  // Don't render if no alerts
  if (totalCriticalAlerts === 0) {
    return null
  }

  const hasBreaches = slaBreaches.length > 0
  const alertLevel = hasBreaches ? 'critical' : 'warning'
  
  return (
    <Card className={`w-full mb-6 border-l-4 ${
      alertLevel === 'critical' 
        ? 'border-l-red-500 bg-red-50 border-red-200' 
        : 'border-l-amber-500 bg-amber-50 border-amber-200'
    }`}>
      <div className="p-4">
        {/* Header Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {alertLevel === 'critical' ? (
              <AlertTriangle className="h-6 w-6 text-red-600 animate-pulse" />
            ) : (
              <Clock className="h-6 w-6 text-amber-600" />
            )}
            
            <div>
              <h3 className={`font-bold text-lg ${
                alertLevel === 'critical' ? 'text-red-800' : 'text-amber-800'
              }`}>
                {hasBreaches ? 'SLA Breach Alert' : 'SLA Warning'}
              </h3>
              <p className={`text-sm ${
                alertLevel === 'critical' ? 'text-red-700' : 'text-amber-700'
              }`}>
                {slaBreaches.length > 0 && (
                  <span className="font-semibold">{slaBreaches.length} order{slaBreaches.length > 1 ? 's' : ''} breached SLA</span>
                )}
                {slaBreaches.length > 0 && approachingAlerts.length > 0 && ', '}
                {approachingAlerts.length > 0 && (
                  <span>{approachingAlerts.length} approaching deadline</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Quick Escalate Button */}
            <Button
              variant={alertLevel === 'critical' ? 'destructive' : 'default'}
              size="sm"
              onClick={onEscalate}
              disabled={isEscalating}
              className="min-h-[44px] px-6"
            >
              <Send className="h-4 w-4 mr-2" />
              {isEscalating ? 'Escalating...' : 'Escalate Now'}
            </Button>

            {/* Expand/Collapse */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="min-h-[44px] min-w-[44px]"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>

            {/* Dismiss Button */}
            {onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className="min-h-[44px] min-w-[44px] text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-4 space-y-3">
            {/* SLA Breaches */}
            {slaBreaches.length > 0 && (
              <div>
                <h4 className="font-semibold text-red-700 mb-2 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Critical Breaches ({slaBreaches.length})
                </h4>
                <div className="space-y-2">
                  {slaBreaches.slice(0, 3).map((alert, index) => (
                    <div key={alert.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                      <div className="flex items-center space-x-3">
                        <div>
                          <div className="font-medium text-sm">{alert.order_number}</div>
                          <div className="text-xs text-gray-600 flex items-center space-x-2">
                            <span>{alert.customer_name}</span>
                            <ChannelBadge channel={alert.channel} />
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-medium text-red-600">
                          {formatOverTime(alert.elapsed_minutes, alert.target_minutes)}
                        </div>
                        <div className="text-xs text-gray-500">{alert.location}</div>
                      </div>
                    </div>
                  ))}
                  {slaBreaches.length > 3 && (
                    <div className="text-xs text-red-600 text-center py-2">
                      +{slaBreaches.length - 3} more breaches
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Approaching SLA */}
            {approachingAlerts.length > 0 && (
              <div>
                <h4 className="font-semibold text-amber-700 mb-2 flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Approaching Deadline ({approachingAlerts.length})
                </h4>
                <div className="space-y-2">
                  {approachingAlerts.slice(0, 3).map((alert, index) => (
                    <div key={alert.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-200">
                      <div className="flex items-center space-x-3">
                        <div>
                          <div className="font-medium text-sm">{alert.order_number}</div>
                          <div className="text-xs text-gray-600">
                            <ChannelBadge channel={alert.channel} />
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-medium text-amber-600">
                          {formatRemainingTime(alert.target_minutes - alert.elapsed_minutes)}
                        </div>
                      </div>
                    </div>
                  ))}
                  {approachingAlerts.length > 3 && (
                    <div className="text-xs text-amber-600 text-center py-2">
                      +{approachingAlerts.length - 3} more approaching
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}