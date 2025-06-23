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
      <div className="p-3">
        {/* Header Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {alertLevel === 'critical' ? (
              <AlertTriangle className="h-5 w-5 text-red-600" />
            ) : (
              <Clock className="h-5 w-5 text-amber-600" />
            )}
            
            <div className="flex-1">
              <h3 className={`font-semibold text-base ${
                alertLevel === 'critical' ? 'text-red-800' : 'text-amber-800'
              }`}>
                {hasBreaches ? 'SLA Breach Alert' : 'SLA Warning'}
              </h3>
              
              {/* Show first breach details in collapsed view - Compact for operations */}
              {slaBreaches.length > 0 && !isExpanded && (
                <div className="mt-2 flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <span className="font-bold font-mono text-lg">{slaBreaches[0].order_number}</span>
                    <span className="text-xs text-gray-500">#{slaBreaches[0].id}</span>
                    <ChannelBadge channel={slaBreaches[0].channel} />
                    <span className="text-sm text-gray-700">• {slaBreaches[0].location}</span>
                  </div>
                  
                  <div className="ml-auto flex items-center gap-3">
                    <span className="bg-red-100 px-2 py-1 rounded text-sm font-bold text-red-700">
                      {(() => {
                        const overSeconds = slaBreaches[0].elapsed_minutes - slaBreaches[0].target_minutes;
                        const overMinutes = Math.floor(overSeconds / 60);
                        if (overMinutes > 60) {
                          return `${Math.floor(overMinutes / 60)}h ${overMinutes % 60}m over`;
                        }
                        return `${overMinutes}m over`;
                      })()}
                    </span>
                    {slaBreaches.length > 1 && (
                      <span className="text-sm text-red-600 font-medium">
                        +{slaBreaches.length - 1} more
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              {/* Summary when no specific breach shown */}
              {(slaBreaches.length === 0 || isExpanded) && (
                <p className={`text-sm mt-1 ${
                  alertLevel === 'critical' ? 'text-red-700' : 'text-amber-700'
                }`}>
                  {slaBreaches.length > 0 && (
                    <span className="font-semibold">{slaBreaches.length} order{slaBreaches.length > 1 ? 's' : ''} breached SLA</span>
                  )}
                  {slaBreaches.length > 0 && approachingAlerts.length > 0 && ' • '}
                  {approachingAlerts.length > 0 && (
                    <span>{approachingAlerts.length} approaching deadline</span>
                  )}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Quick Escalate Button */}
            <Button
              variant={alertLevel === 'critical' ? 'destructive' : 'default'}
              size="sm"
              onClick={onEscalate}
              disabled={isEscalating}
              className="h-8 px-3 text-sm"
            >
              <Send className="h-3 w-3 mr-1" />
              {isEscalating ? 'Escalating...' : 'Escalate'}
            </Button>

            {/* Expand/Collapse */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8"
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
                className="h-8 w-8 text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-3 space-y-2">
            {/* SLA Breaches */}
            {slaBreaches.length > 0 && (
              <div>
                <h4 className="font-semibold text-red-700 mb-2 text-sm uppercase">
                  Breached Orders ({slaBreaches.length})
                </h4>
                <div className="space-y-2">
                  {slaBreaches.slice(0, 5).map((alert, index) => (
                    <div key={alert.id} className="bg-white rounded border border-red-200 hover:border-red-400 transition-colors p-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <span className="font-bold font-mono">{alert.order_number}</span>
                          <span className="text-xs text-gray-500">#{alert.id}</span>
                          <ChannelBadge channel={alert.channel} />
                          <span className="text-sm text-gray-700">{alert.location}</span>
                          <span className="text-sm text-gray-500">• {alert.customer_name}</span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500">
                            {Math.floor(alert.elapsed_minutes / 60)}m ago
                          </span>
                          <span className="bg-red-100 px-2 py-1 rounded text-sm font-bold text-red-700">
                            {(() => {
                              const overSeconds = alert.elapsed_minutes - alert.target_minutes;
                              const overMinutes = Math.floor(overSeconds / 60);
                              if (overMinutes > 60) {
                                return `${Math.floor(overMinutes / 60)}h ${overMinutes % 60}m over`;
                              }
                              return `${overMinutes}m over`;
                            })()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {slaBreaches.length > 5 && (
                    <div className="text-center py-3">
                      <Button variant="outline" size="sm" className="text-red-600">
                        View All {slaBreaches.length} Breached Orders
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Approaching SLA */}
            {approachingAlerts.length > 0 && (
              <div>
                <h4 className="font-semibold text-amber-700 mb-2 text-sm uppercase">
                  Approaching Deadline ({approachingAlerts.length})
                </h4>
                <div className="space-y-2">
                  {approachingAlerts.slice(0, 5).map((alert, index) => (
                    <div key={alert.id} className="bg-white rounded border border-amber-200 hover:border-amber-400 transition-colors p-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <span className="font-bold font-mono">{alert.order_number}</span>
                          <span className="text-xs text-gray-500">#{alert.id}</span>
                          <ChannelBadge channel={alert.channel} />
                          <span className="text-sm text-gray-700">{alert.location}</span>
                          <span className="text-sm text-gray-500">• {alert.customer_name}</span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500">
                            {Math.floor(alert.elapsed_minutes / 60)}m ago
                          </span>
                          <span className="bg-amber-100 px-2 py-1 rounded text-sm font-bold text-amber-700">
                            {(() => {
                              const remainingSeconds = alert.target_minutes - alert.elapsed_minutes;
                              const remainingMinutes = Math.floor(remainingSeconds / 60);
                              if (remainingMinutes < 0) return "0m left";
                              if (remainingMinutes < 60) {
                                return `${remainingMinutes}m left`;
                              }
                              return `${Math.floor(remainingMinutes / 60)}h ${remainingMinutes % 60}m left`;
                            })()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {approachingAlerts.length > 5 && (
                    <div className="text-center py-3">
                      <Button variant="outline" size="sm" className="text-amber-600">
                        View All {approachingAlerts.length} Approaching Orders
                      </Button>
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
