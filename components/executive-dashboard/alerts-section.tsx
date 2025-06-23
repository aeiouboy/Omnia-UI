"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ChannelBadge } from "@/components/order-badges"
import { AlertTriangle, Clock, AlertCircle } from "lucide-react"
import { 
  formatOverTime,
  formatRemainingTime,
  formatElapsedTime
} from "@/lib/sla-utils"
import { OrderAlert } from "./types"

interface AlertsSectionProps {
  orderAlerts: OrderAlert[]
  approachingSla: OrderAlert[]
  isLoading: boolean
  onEscalate?: () => void
  isEscalating?: boolean
}

export function AlertsSection({
  orderAlerts,
  approachingSla,
  isLoading,
  onEscalate,
  isEscalating = false
}: AlertsSectionProps) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <CardTitle className="text-lg">Order Alerts</CardTitle>
          </div>
          <div className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
            {orderAlerts.length + approachingSla.length} Active Alerts
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <>
            {/* SLA Breach Section */}
            {orderAlerts.length > 0 && (
              <SLABreachSection 
                alerts={orderAlerts} 
                onEscalate={onEscalate}
                isEscalating={isEscalating}
              />
            )}

            {/* Approaching SLA Section */}
            {approachingSla.length > 0 && (
              <ApproachingSLASection alerts={approachingSla} />
            )}

            {/* No Alerts */}
            {(orderAlerts.length === 0 && approachingSla.length === 0) && (
              <NoAlertsMessage />
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {/* Skeleton for SLA Breach Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-16 ml-auto" />
        </div>
        
        <div className="border-l-4 border-gray-200 bg-white p-4 rounded-r-lg shadow-sm">
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[...Array(6)].map((_, i) => (
              <div key={i}>
                <Skeleton className="h-3 w-12 mb-1" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Skeleton for Approaching SLA Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-32" />
        </div>
        
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <div className="text-right">
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SLABreachSection({ 
  alerts, 
  onEscalate,
  isEscalating 
}: { 
  alerts: OrderAlert[]
  onEscalate?: () => void
  isEscalating?: boolean
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <span className="font-semibold text-red-800 text-sm">SLA BREACH</span>
        {onEscalate && (
          <Button 
            variant="destructive" 
            size="sm"
            className="ml-auto"
            onClick={onEscalate}
            disabled={isEscalating}
          >
            {isEscalating ? 'Escalating...' : 'Escalate'}
          </Button>
        )}
      </div>
      
      {alerts.slice(0, 1).map((alert, index) => (
        <div key={index} className="border-l-4 border-red-500 bg-white p-4 rounded-r-lg shadow-sm">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600 mb-1">Order ID:</p>
              <p className="font-mono font-semibold text-xs">{alert.id || '-'}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Order Number:</p>
              <p className="font-mono font-semibold">{alert.order_number || '-'}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Customer:</p>
              <p className="font-medium truncate">{alert.customer_name || '-'}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Store Location:</p>
              <p className="font-medium truncate">{alert.location || '-'}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Channel:</p>
              <ChannelBadge channel={alert.channel} />
            </div>
            <div>
              <p className="text-gray-600 mb-1">Target:</p>
              <p className="font-medium">{Math.round((alert.target_minutes || 300) / 60)} min</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Elapsed:</p>
              <p className="font-medium text-red-600">{formatElapsedTime(alert.elapsed_minutes || 0)}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Time Over:</p>
              <p className="font-bold text-red-600">
                {formatOverTime(alert.overTime || 0)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function ApproachingSLASection({ alerts }: { alerts: OrderAlert[] }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 bg-yellow-50 px-3 py-2 rounded-lg">
        <Clock className="h-4 w-4 text-yellow-600" />
        <span className="font-semibold text-yellow-800 text-sm">APPROACHING SLA ({alerts.length})</span>
      </div>
      
      {alerts.slice(0, 4).map((alert, index) => (
        <div key={index} className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-yellow-600" />
                <span className="font-mono text-xs font-medium text-gray-600">ID: {alert.id || '-'}</span>
                <span className="font-mono text-sm font-medium">#{alert.order_number || '-'}</span>
                <ChannelBadge channel={alert.channel} />
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-600">
                <span className="truncate max-w-[150px]">{alert.customer_name || '-'}</span>
                <span className="truncate max-w-[150px]">{alert.location || '-'}</span>
              </div>
            </div>
            <div className="text-right ml-2">
              <p className="font-bold text-yellow-700">
                {formatRemainingTime(alert.remaining || 0)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function NoAlertsMessage() {
  return (
    <div className="text-center py-8 text-gray-500">
      <AlertCircle className="mx-auto h-12 w-12 text-gray-300 mb-3" />
      <p className="font-medium">No alerts at this time</p>
      <p className="text-xs text-gray-400 mt-1">All orders are within SLA compliance</p>
    </div>
  )
}
