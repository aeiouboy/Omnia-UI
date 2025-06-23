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
            
            <div className="flex-1">
              <h3 className={`font-bold text-lg ${
                alertLevel === 'critical' ? 'text-red-800' : 'text-amber-800'
              }`}>
                {hasBreaches ? '🚨 SLA BREACH - ACTION REQUIRED' : '⚠️ SLA WARNING'}
              </h3>
              
              {/* Show first breach details in collapsed view - Operations focused */}
              {slaBreaches.length > 0 && !isExpanded && (
                <div className="mt-3 bg-white rounded-lg p-3 border-2 border-red-300">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      {/* Primary: Order identification */}
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold font-mono text-red-700">{slaBreaches[0].order_number}</span>
                        <span className="text-sm text-gray-500">ID: {slaBreaches[0].id}</span>
                        <ChannelBadge channel={slaBreaches[0].channel} />
                      </div>
                      
                      {/* Secondary: Location and customer */}
                      <div className="flex items-center gap-4 text-sm">
                        <span className="font-semibold text-gray-900">📍 {slaBreaches[0].location}</span>
                        <span className="text-gray-600">👤 {slaBreaches[0].customer_name}</span>
                      </div>
                    </div>
                    
                    {/* Critical: Time breach */}
                    <div className="text-right">
                      <div className="bg-red-100 px-3 py-1 rounded-lg">
                        <div className="text-xs text-red-600 font-medium">OVERDUE BY</div>
                        <div className="text-2xl font-bold text-red-700">
                          {(() => {
                            // API returns seconds despite field name
                            const overSeconds = slaBreaches[0].elapsed_minutes - slaBreaches[0].target_minutes;
                            const overMinutes = Math.floor(overSeconds / 60);
                            if (overMinutes > 60) {
                              const hours = Math.floor(overMinutes / 60);
                              const mins = overMinutes % 60;
                              return `${hours}h ${mins}m`;
                            }
                            return `${overMinutes}m`;
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Additional orders indicator */}
                  {slaBreaches.length > 1 && (
                    <div className="mt-2 pt-2 border-t border-gray-200 text-sm text-red-600 font-medium">
                      ⚠️ +{slaBreaches.length - 1} more order{slaBreaches.length > 2 ? 's' : ''} breached
                    </div>
                  )}
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
                <h4 className="font-bold text-red-700 mb-3 text-lg">
                  🚨 BREACHED ORDERS - IMMEDIATE ACTION REQUIRED
                </h4>
                <div className="space-y-3">
                  {slaBreaches.slice(0, 5).map((alert, index) => (
                    <div key={alert.id} className="bg-white rounded-lg border-2 border-red-200 hover:border-red-400 transition-colors">
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            {/* Order Header */}
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-xl font-bold font-mono">{alert.order_number}</span>
                              <span className="text-sm text-gray-500">#{alert.id}</span>
                              <ChannelBadge channel={alert.channel} />
                            </div>
                            
                            {/* Location and Customer Grid */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Store:</span>
                                <span className="ml-2 font-semibold">{alert.location}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Customer:</span>
                                <span className="ml-2">{alert.customer_name}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Time Breach Display */}
                          <div className="ml-4">
                            <div className="bg-red-100 px-4 py-2 rounded-lg text-center">
                              <div className="text-xs text-red-600 font-medium uppercase">Overdue</div>
                              <div className="text-2xl font-bold text-red-700">
                                {(() => {
                                  // API returns seconds despite field name
                                  const overSeconds = alert.elapsed_minutes - alert.target_minutes;
                                  const overMinutes = Math.floor(overSeconds / 60);
                                  if (overMinutes > 60) {
                                    const hours = Math.floor(overMinutes / 60);
                                    const mins = overMinutes % 60;
                                    return `${hours}h ${mins}m`;
                                  }
                                  return `${overMinutes}m`;
                                })()}
                              </div>
                              <div className="text-xs text-red-500">
                                Target: {Math.floor(alert.target_minutes / 60)}m
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Action Bar */}
                        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                          <div className="text-xs text-gray-500">
                            Order placed {Math.floor(alert.elapsed_minutes / 60)} minutes ago
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-red-600 hover:bg-red-50 border-red-300"
                            onClick={() => {/* TODO: View order details */}}
                          >
                            View Details →
                          </Button>
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
                <h4 className="font-bold text-amber-700 mb-3 text-lg">
                  ⚠️ APPROACHING DEADLINE - MONITOR CLOSELY
                </h4>
                <div className="space-y-3">
                  {approachingAlerts.slice(0, 5).map((alert, index) => (
                    <div key={alert.id} className="bg-white rounded-lg border-2 border-amber-200 hover:border-amber-400 transition-colors">
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            {/* Order Header */}
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-xl font-bold font-mono">{alert.order_number}</span>
                              <span className="text-sm text-gray-500">#{alert.id}</span>
                              <ChannelBadge channel={alert.channel} />
                            </div>
                            
                            {/* Location and Customer Grid */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Store:</span>
                                <span className="ml-2 font-semibold">{alert.location}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Customer:</span>
                                <span className="ml-2">{alert.customer_name}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Time Remaining Display */}
                          <div className="ml-4">
                            <div className="bg-amber-100 px-4 py-2 rounded-lg text-center">
                              <div className="text-xs text-amber-600 font-medium uppercase">Time Left</div>
                              <div className="text-2xl font-bold text-amber-700">
                                {(() => {
                                  // API returns seconds despite field name
                                  const remainingSeconds = alert.target_minutes - alert.elapsed_minutes;
                                  const remainingMinutes = Math.floor(remainingSeconds / 60);
                                  if (remainingMinutes < 0) return "0m";
                                  if (remainingMinutes < 60) {
                                    return `${remainingMinutes}m`;
                                  }
                                  const hours = Math.floor(remainingMinutes / 60);
                                  const mins = remainingMinutes % 60;
                                  return `${hours}h ${mins}m`;
                                })()}
                              </div>
                              <div className="text-xs text-amber-500">
                                Target: {Math.floor(alert.target_minutes / 60)}m
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Action Bar */}
                        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                          <div className="text-xs text-gray-500">
                            Order placed {Math.floor(alert.elapsed_minutes / 60)} minutes ago
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-amber-600 hover:bg-amber-50 border-amber-300"
                            onClick={() => {/* TODO: View order details */}}
                          >
                            Monitor Order →
                          </Button>
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
