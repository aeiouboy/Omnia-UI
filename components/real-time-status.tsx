"use client"

import React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Zap
} from "lucide-react"
import { cn } from "@/lib/utils"

interface RealTimeStatusProps {
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'error'
  lastUpdateTime: Date | null
  optimisticUpdatesCount: number
  onReconnect?: () => void
  className?: string
}

export function RealTimeStatus({
  connectionStatus,
  lastUpdateTime,
  optimisticUpdatesCount,
  onReconnect,
  className
}: RealTimeStatusProps) {
  const getStatusInfo = () => {
    switch (connectionStatus) {
      case 'connected':
        return {
          icon: Wifi,
          text: 'Live',
          color: 'bg-green-500',
          textColor: 'text-green-700',
          bgColor: 'bg-green-50',
          variant: 'default' as const
        }
      case 'connecting':
        return {
          icon: RefreshCw,
          text: 'Connecting',
          color: 'bg-blue-500',
          textColor: 'text-blue-700',
          bgColor: 'bg-blue-50',
          variant: 'secondary' as const,
          animate: true
        }
      case 'disconnected':
        return {
          icon: WifiOff,
          text: 'Offline',
          color: 'bg-gray-500',
          textColor: 'text-gray-700',
          bgColor: 'bg-gray-50',
          variant: 'outline' as const
        }
      case 'error':
        return {
          icon: AlertCircle,
          text: 'Error',
          color: 'bg-red-500',
          textColor: 'text-red-700',
          bgColor: 'bg-red-50',
          variant: 'destructive' as const
        }
      default:
        return {
          icon: WifiOff,
          text: 'Unknown',
          color: 'bg-gray-500',
          textColor: 'text-gray-700',
          bgColor: 'bg-gray-50',
          variant: 'outline' as const
        }
    }
  }

  const statusInfo = getStatusInfo()
  const StatusIcon = statusInfo.icon

  const formatLastUpdate = (date: Date | null) => {
    if (!date) return 'Never'
    
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (seconds < 60) return `${seconds}s ago`
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return date.toLocaleDateString()
  }

  return null
}

// Real-time updates summary component
interface UpdatesSummaryProps {
  updates: Array<{
    id: string
    type: string
    timestamp: Date
    optimistic?: boolean
  }>
  className?: string
}

export function UpdatesSummary({ updates, className }: UpdatesSummaryProps) {
  const recentUpdates = updates
    .filter(update => {
      const now = new Date()
      const updateTime = new Date(update.timestamp)
      return (now.getTime() - updateTime.getTime()) < 300000 // Last 5 minutes
    })
    .slice(-3) // Show last 3 updates

  if (recentUpdates.length === 0) {
    return (
      <div className={cn("text-xs text-gray-500", className)}>
        No recent updates
      </div>
    )
  }

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case 'order_status_change':
        return <CheckCircle className="h-3 w-3 text-green-600" />
      case 'sla_breach':
        return <AlertCircle className="h-3 w-3 text-red-600" />
      case 'new_order':
        return <Zap className="h-3 w-3 text-blue-600" />
      default:
        return <CheckCircle className="h-3 w-3 text-gray-600" />
    }
  }

  const getUpdateText = (type: string) => {
    switch (type) {
      case 'order_status_change':
        return 'Status updated'
      case 'sla_breach':
        return 'SLA breach'
      case 'new_order':
        return 'New order'
      case 'payment_update':
        return 'Payment updated'
      case 'escalation_resolved':
        return 'Escalation resolved'
      default:
        return 'Update received'
    }
  }

  return (
    <div className={cn("space-y-1", className)}>
      <div className="text-xs font-medium text-gray-700 mb-2 transition-all duration-300">Recent Updates</div>
      {recentUpdates.map((update, index) => (
        <div 
          key={update.id} 
          className="flex items-center space-x-2 text-xs animate-fade-in transition-all duration-300 hover:bg-gray-50 rounded-md p-1"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="transition-transform duration-200 hover:scale-110">
            {getUpdateIcon(update.type)}
          </div>
          <span className={cn(
            "flex-1 transition-all duration-300",
            update.optimistic ? "text-gray-500 italic animate-pulse" : "text-gray-700"
          )}>
            {getUpdateText(update.type)}
            {update.optimistic && " (processing)"}
          </span>
          <span className="text-gray-500 transition-opacity duration-300">
            {formatLastUpdate(update.timestamp)}
          </span>
        </div>
      ))}
    </div>
  )
}

function formatLastUpdate(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)

  if (seconds < 60) return `${seconds}s`
  if (minutes < 60) return `${minutes}m`
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}