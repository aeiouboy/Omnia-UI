"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Truck, Store } from "lucide-react"
import { FulfillmentStatusEvent } from "@/types/audit"
import { DeliveryMethodType, DeliveryMethod } from "@/types/delivery"
import { generateFulfillmentTimeline } from "@/lib/mock-data"

interface FulfillmentTimelineProps {
  orderId: string
  orderData?: any
}

/**
 * Extract delivery methods from order data
 */
function getDeliveryMethods(orderData?: any): DeliveryMethod[] {
  if (!orderData?.deliveryMethods || !Array.isArray(orderData.deliveryMethods)) {
    return []
  }
  return orderData.deliveryMethods
}

/**
 * Check if order has multiple delivery methods (mixed delivery)
 */
function hasMultipleDeliveryMethods(orderData?: any): boolean {
  const methods = getDeliveryMethods(orderData)
  return methods.length > 1
}

/**
 * Get array of delivery method types present in the order
 */
function getDeliveryMethodTypes(orderData?: any): DeliveryMethodType[] {
  const methods = getDeliveryMethods(orderData)
  return methods.map((m) => m.type)
}

/**
 * Reusable timeline renderer component
 */
interface TimelineRendererProps {
  events: FulfillmentStatusEvent[]
}

function TimelineRenderer({ events }: TimelineRendererProps) {
  return (
    <div className="relative">
      {events.map((event, index) => (
        <div key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
          {/* Vertical timeline line */}
          {index < events.length - 1 && (
            <div className="absolute left-[9px] top-5 h-full w-0.5 bg-gray-200 dark:bg-gray-700" />
          )}

          {/* Circle indicator */}
          <div className="relative z-10 flex-shrink-0">
            <div className="h-5 w-5 rounded-full border-2 border-gray-400 bg-white dark:bg-gray-900 flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-gray-400" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-4">
              {/* Status name - plain text */}
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {event.status}
                </span>
                {event.details && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {event.details}
                  </p>
                )}
              </div>

              {/* Timestamp in YYYY-MM-DDTHH:mm:ss format */}
              <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                {event.timestamp}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Empty state component for a delivery type
 */
interface EmptyDeliveryStateProps {
  deliveryType: "Home Delivery" | "Click & Collect"
}

function EmptyDeliveryState({ deliveryType }: EmptyDeliveryStateProps) {
  return (
    <div className="text-center py-8">
      <Package className="mx-auto h-10 w-10 text-gray-300" />
      <p className="mt-3 text-sm text-muted-foreground">
        No fulfillment events for {deliveryType} items yet.
      </p>
    </div>
  )
}

export function FulfillmentTimeline({ orderId, orderData }: FulfillmentTimelineProps) {
  // Memoize delivery method detection
  const hasMixedDelivery = useMemo(() => hasMultipleDeliveryMethods(orderData), [orderData])
  const deliveryMethodTypes = useMemo(() => getDeliveryMethodTypes(orderData), [orderData])
  const deliveryMethods = useMemo(() => getDeliveryMethods(orderData), [orderData])

  // Generate fulfillment timeline data for single delivery method orders
  const events = useMemo(() => {
    if (!orderId || hasMixedDelivery) return []
    return generateFulfillmentTimeline(orderId, orderData) as FulfillmentStatusEvent[]
  }, [orderId, orderData, hasMixedDelivery])

  // Generate Home Delivery events for mixed delivery orders
  const homeDeliveryEvents = useMemo(() => {
    if (!orderId || !hasMixedDelivery || !deliveryMethodTypes.includes("HOME_DELIVERY")) return []
    return generateFulfillmentTimeline(orderId, orderData, "HOME_DELIVERY") as FulfillmentStatusEvent[]
  }, [orderId, orderData, hasMixedDelivery, deliveryMethodTypes])

  // Generate Click & Collect events for mixed delivery orders
  const clickCollectEvents = useMemo(() => {
    if (!orderId || !hasMixedDelivery || !deliveryMethodTypes.includes("CLICK_COLLECT")) return []
    return generateFulfillmentTimeline(orderId, orderData, "CLICK_COLLECT") as FulfillmentStatusEvent[]
  }, [orderId, orderData, hasMixedDelivery, deliveryMethodTypes])

  // Get item counts for each delivery method
  const homeDeliveryMethod = deliveryMethods.find((m) => m.type === "HOME_DELIVERY")
  const clickCollectMethod = deliveryMethods.find((m) => m.type === "CLICK_COLLECT")
  const storeName = clickCollectMethod?.clickCollect?.storeName

  // Single delivery method rendering (original behavior)
  if (!hasMixedDelivery) {
    if (events.length === 0) {
      return (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Package className="h-5 w-5" />
              Fulfillment Status
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-4 text-sm text-muted-foreground">
                No fulfillment events available for this order.
              </p>
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Package className="h-5 w-5" />
            Fulfillment Status
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <TimelineRenderer events={events} />
        </CardContent>
      </Card>
    )
  }

  // Mixed delivery method rendering - separate cards for each delivery type
  return (
    <div className="space-y-4">
      {/* Home Delivery Card */}
      {deliveryMethodTypes.includes("HOME_DELIVERY") && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Truck className="h-5 w-5" />
              <span>Fulfillment Status - Home Delivery</span>
              {homeDeliveryMethod?.itemCount && (
                <span className="text-sm font-normal text-muted-foreground">
                  ({homeDeliveryMethod.itemCount} item{homeDeliveryMethod.itemCount > 1 ? "s" : ""})
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            {homeDeliveryEvents.length > 0 ? (
              <TimelineRenderer events={homeDeliveryEvents} />
            ) : (
              <EmptyDeliveryState deliveryType="Home Delivery" />
            )}
          </CardContent>
        </Card>
      )}

      {/* Click & Collect Card */}
      {deliveryMethodTypes.includes("CLICK_COLLECT") && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-1">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Store className="h-5 w-5" />
                <span>Fulfillment Status - Click &amp; Collect</span>
                {clickCollectMethod?.itemCount && (
                  <span className="text-sm font-normal text-muted-foreground">
                    ({clickCollectMethod.itemCount} item{clickCollectMethod.itemCount > 1 ? "s" : ""})
                  </span>
                )}
              </CardTitle>
              {storeName && (
                <p className="text-sm text-muted-foreground ml-7">
                  Pickup at: {storeName}
                </p>
              )}
            </div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            {clickCollectEvents.length > 0 ? (
              <TimelineRenderer events={clickCollectEvents} />
            ) : (
              <EmptyDeliveryState deliveryType="Click & Collect" />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
