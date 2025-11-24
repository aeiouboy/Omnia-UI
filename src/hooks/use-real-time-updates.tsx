"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { toast } from "@/hooks/use-toast"

interface UpdateEvent {
  id: string
  type: 'order_status_change' | 'sla_breach' | 'new_order' | 'payment_update' | 'escalation_resolved'
  data: any
  timestamp: Date
  optimistic?: boolean
}

interface OptimisticUpdate {
  id: string
  type: string
  originalData: any
  optimisticData: any
  timestamp: Date
  confirmed: boolean
  rollbackFn?: () => void
}

interface RealTimeUpdatesConfig {
  endpoint?: string
  pollInterval?: number
  maxRetries?: number
  enableOptimistic?: boolean
  onUpdate?: (event: UpdateEvent) => void
  onError?: (error: Error) => void
}

export function useRealTimeUpdates(config: RealTimeUpdatesConfig = {}) {
  const {
    endpoint = undefined,
    pollInterval = 5000, // 5 seconds
    maxRetries = 3,
    enableOptimistic = true,
    onUpdate,
    onError
  } = config

  const [isConnected, setIsConnected] = useState(false)
  const [updates, setUpdates] = useState<UpdateEvent[]>([])
  const [optimisticUpdates, setOptimisticUpdates] = useState<OptimisticUpdate[]>([])
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected' | 'error'>('disconnected')

  const retryCountRef = useRef(0)
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const abortControllerRef = useRef<AbortController | undefined>(undefined)

  // Optimistic update function
  const applyOptimisticUpdate = useCallback((
    id: string,
    type: string,
    optimisticData: any,
    rollbackFn?: () => void
  ) => {
    if (!enableOptimistic) return

    const optimisticUpdate: OptimisticUpdate = {
      id,
      type,
      originalData: null, // Store original data if needed
      optimisticData,
      timestamp: new Date(),
      confirmed: false,
      rollbackFn
    }

    setOptimisticUpdates(prev => [...prev, optimisticUpdate])

    // Create optimistic event
    const optimisticEvent: UpdateEvent = {
      id,
      type: type as any,
      data: optimisticData,
      timestamp: new Date(),
      optimistic: true
    }

    setUpdates(prev => [...prev, optimisticEvent])
    onUpdate?.(optimisticEvent)

    // Show optimistic feedback
    toast({
      title: "Processing...",
      description: "Your change is being applied",
      variant: "default",
    })

    return optimisticUpdate
  }, [enableOptimistic, onUpdate])

  // Confirm optimistic update
  const confirmOptimisticUpdate = useCallback((id: string, confirmedData?: any) => {
    setOptimisticUpdates(prev => 
      prev.map(update => 
        update.id === id 
          ? { ...update, confirmed: true, optimisticData: confirmedData || update.optimisticData }
          : update
      )
    )

    // Update the actual event data
    setUpdates(prev => 
      prev.map(event => 
        event.id === id 
          ? { ...event, data: confirmedData || event.data, optimistic: false }
          : event
      )
    )

    toast({
      title: "Updated",
      description: "Your change has been confirmed",
      variant: "default",
    })
  }, [])

  // Rollback optimistic update
  const rollbackOptimisticUpdate = useCallback((id: string, reason?: string) => {
    const update = optimisticUpdates.find(u => u.id === id)
    if (update?.rollbackFn) {
      update.rollbackFn()
    }

    setOptimisticUpdates(prev => prev.filter(u => u.id !== id))
    setUpdates(prev => prev.filter(e => e.id !== id))

    toast({
      title: "Update Failed",
      description: reason || "Your change could not be applied",
      variant: "destructive",
    })
  }, [optimisticUpdates])

  // Store previous orders data for change detection
  const previousOrdersRef = useRef<any[]>([])

  // Fetch latest updates by polling the orders API
  const fetchUpdates = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()

    try {
      setConnectionStatus('connecting')

      // Use the orders API to detect changes instead of a non-existent real-time endpoint
      const ordersEndpoint = '/api/orders/external'
      
      // Get current date range (today only for real-time updates)
      const today = new Date()
      const todayStart = new Date(today)
      todayStart.setHours(0, 0, 0, 0)
      const todayEnd = new Date(today)
      todayEnd.setHours(23, 59, 59, 999)

      const params = new URLSearchParams({
        page: '1',
        pageSize: '100', // Smaller page size for real-time polling
        dateFrom: todayStart.toISOString().split('T')[0],
        dateTo: todayEnd.toISOString().split('T')[0],
      })

      const response = await fetch(`${ordersEndpoint}?${params}`, {
        signal: abortControllerRef.current.signal,
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.success && data.data?.data) {
        const currentOrders = data.data.data
        const previousOrders = previousOrdersRef.current

        // Detect changes by comparing with previous orders
        const newUpdates: UpdateEvent[] = []

        if (previousOrders.length > 0) {
          // Check for new orders
          const newOrders = currentOrders.filter((order: any) => 
            !previousOrders.find(prev => prev.id === order.id)
          )

          // Check for status changes
          const statusChanges = currentOrders.filter((order: any) => {
            const prevOrder = previousOrders.find(prev => prev.id === order.id)
            return prevOrder && prevOrder.status !== order.status
          })

          // Check for SLA breaches (orders that weren't breached before but are now)
          const slaBreaches = currentOrders.filter((order: any) => {
            const prevOrder = previousOrders.find(prev => prev.id === order.id)
            if (!prevOrder) return false
            
            const wasBreached = prevOrder.sla_info?.status === 'BREACH'
            const isNowBreached = order.sla_info?.status === 'BREACH'
            return !wasBreached && isNowBreached
          })

          // Create update events
          newOrders.forEach((order: any) => {
            newUpdates.push({
              id: `new_order_${order.id}`,
              type: 'new_order',
              data: {
                orderNumber: order.order_no || order.id,
                channel: order.channel,
                status: order.status,
                customer: order.customer?.name || 'Unknown'
              },
              timestamp: new Date()
            })
          })

          statusChanges.forEach((order: any) => {
            newUpdates.push({
              id: `status_change_${order.id}`,
              type: 'order_status_change',
              data: {
                orderNumber: order.order_no || order.id,
                channel: order.channel,
                status: order.status,
                previousStatus: previousOrders.find(prev => prev.id === order.id)?.status
              },
              timestamp: new Date()
            })
          })

          slaBreaches.forEach((order: any) => {
            newUpdates.push({
              id: `sla_breach_${order.id}`,
              type: 'sla_breach',
              data: {
                orderNumber: order.order_no || order.id,
                channel: order.channel,
                status: order.status,
                elapsedMinutes: order.sla_info?.elapsed_minutes || 0,
                targetMinutes: order.sla_info?.target_minutes || 300
              },
              timestamp: new Date()
            })
          })
        }

        // Store current orders for next comparison
        previousOrdersRef.current = currentOrders

        // Process new updates
        if (newUpdates.length > 0) {
          setUpdates(prev => [...prev, ...newUpdates])
          setLastUpdateTime(new Date())

          // Process each update
          newUpdates.forEach(update => {
            // Check if this update confirms an optimistic update
            const matchingOptimistic = optimisticUpdates.find(opt => 
              opt.type === update.type && opt.id === update.id
            )

            if (matchingOptimistic) {
              confirmOptimisticUpdate(update.id, update.data)
            } else {
              onUpdate?.(update)
            }

            // Show real-time notification
            showUpdateNotification(update)
          })
        }
      }

      // Smooth transition to connected state
      setTimeout(() => {
        setIsConnected(true)
        setConnectionStatus('connected')
        retryCountRef.current = 0
        console.log('✅ Real-time connection established - "Live" status active')
      }, 200) // Small delay for smoother visual transition

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return // Request was aborted, don't treat as error
      }

      console.error('Real-time update fetch failed:', error)
      // Smooth transition to error state
      setTimeout(() => {
        setIsConnected(false)
        setConnectionStatus('error')
        console.log('❌ Real-time connection error - status updated')
      }, 100)
      
      retryCountRef.current++
      if (retryCountRef.current <= maxRetries) {
        console.log(`Retrying real-time updates (${retryCountRef.current}/${maxRetries})`)
        setTimeout(fetchUpdates, Math.min(1000 * Math.pow(2, retryCountRef.current), 30000))
      } else {
        onError?.(error as Error)
      }
    }
  }, [lastUpdateTime, maxRetries, onUpdate, onError, optimisticUpdates, confirmOptimisticUpdate])

  // Show notification for real-time updates
  const showUpdateNotification = useCallback((update: UpdateEvent) => {
    const notifications = {
      'order_status_change': {
        title: 'Order Status Updated',
        description: `Order ${update.data.orderNumber} is now ${update.data.status}`,
        variant: 'default' as const
      },
      'sla_breach': {
        title: 'SLA Breach Alert',
        description: `Order ${update.data.orderNumber} has exceeded SLA threshold`,
        variant: 'destructive' as const
      },
      'new_order': {
        title: 'New Order Received',
        description: `Order ${update.data.orderNumber} from ${update.data.channel}`,
        variant: 'default' as const
      },
      'payment_update': {
        title: 'Payment Updated',
        description: `Payment status changed to ${update.data.status}`,
        variant: 'default' as const
      },
      'escalation_resolved': {
        title: 'Escalation Resolved',
        description: `Escalation for order ${update.data.orderNumber} has been resolved`,
        variant: 'default' as const
      }
    }

    const notification = notifications[update.type]
    if (notification) {
      toast(notification)
    }
  }, [])

  // Start real-time updates
  const connect = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    console.log(`🔄 Starting real-time updates with ${pollInterval}ms interval`)
    setConnectionStatus('connecting')
    fetchUpdates() // Initial fetch

    intervalRef.current = setInterval(fetchUpdates, pollInterval)
  }, [fetchUpdates, pollInterval])

  // Stop real-time updates
  const disconnect = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = undefined
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Smooth transition to disconnected state
    setTimeout(() => {
      setIsConnected(false)
      setConnectionStatus('disconnected')
      console.log('🔌 Real-time connection disconnected')
    }, 100)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  // Auto-connect on mount - always connect since we use the fixed orders API
  useEffect(() => {
    console.log('🚀 Real-time updates hook mounted, auto-connecting...')
    connect()
  }, [connect])

  // Real-time action wrapper with optimistic updates
  const performAction = useCallback(async (
    actionFn: () => Promise<any>,
    optimisticData: any,
    actionId: string,
    actionType: string,
    rollbackFn?: () => void
  ) => {
    let optimisticUpdate: OptimisticUpdate | undefined

    try {
      // Apply optimistic update immediately
      optimisticUpdate = applyOptimisticUpdate(actionId, actionType, optimisticData, rollbackFn)

      // Perform the actual action
      const result = await actionFn()

      // Confirm optimistic update with real result
      confirmOptimisticUpdate(actionId, result)

      return result
    } catch (error) {
      // Rollback optimistic update on failure
      if (optimisticUpdate) {
        rollbackOptimisticUpdate(actionId, (error as Error).message)
      }
      throw error
    }
  }, [applyOptimisticUpdate, confirmOptimisticUpdate, rollbackOptimisticUpdate])

  return {
    // Connection state
    isConnected,
    connectionStatus,
    lastUpdateTime,

    // Updates
    updates,
    optimisticUpdates,

    // Connection control
    connect,
    disconnect,

    // Optimistic updates
    applyOptimisticUpdate,
    confirmOptimisticUpdate,
    rollbackOptimisticUpdate,
    performAction,

    // Utility
    clearUpdates: () => setUpdates([]),
    getUnconfirmedUpdates: () => optimisticUpdates.filter(u => !u.confirmed)
  }
}
