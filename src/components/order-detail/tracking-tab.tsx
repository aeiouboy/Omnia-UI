"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Truck, Package, ExternalLink, Store } from "lucide-react"
import { TrackingShipment, TrackingEvent, ShipmentStatus, CCTrackingShipment, ShippedItem } from "@/types/audit"
import { generateTrackingData } from "@/lib/mock-data"
import { CCShipmentDetailsSection } from "./cc-shipment-details-section"

interface TrackingTabProps {
  orderId: string
  orderData?: any
}

/**
 * Get status color classes based on shipment status
 */
function getStatusColor(status: ShipmentStatus): { text: string; dot: string } {
  switch (status) {
    case 'DELIVERED':
      return { text: 'text-green-600', dot: 'bg-green-600' }
    case 'IN_TRANSIT':
      return { text: 'text-blue-600', dot: 'bg-blue-600' }
    case 'OUT_FOR_DELIVERY':
      return { text: 'text-orange-600', dot: 'bg-orange-600' }
    case 'PICKED_UP':
      return { text: 'text-cyan-600', dot: 'bg-cyan-600' }
    case 'PENDING':
    default:
      return { text: 'text-gray-600', dot: 'bg-gray-600' }
  }
}

/**
 * Format status for display
 */
function formatStatus(status: ShipmentStatus): string {
  return status.replace(/_/g, ' ')
}

/**
 * Shipment Details Section - Two column layout for shipment info
 */
function ShipmentDetailsSection({ shipment }: { shipment: TrackingShipment }) {
  const statusColors = getStatusColor(shipment.status)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      {/* Left Column - Shipment Details */}
      <div className="space-y-2">
        {/* Status with color indicator */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground w-24">Status:</span>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${statusColors.dot}`}></span>
            <span className={`text-sm font-medium ${statusColors.text}`}>
              {formatStatus(shipment.status)}
            </span>
          </div>
        </div>

        {/* Tracking Number */}
        <div className="flex items-start gap-2">
          <span className="text-sm text-muted-foreground w-24">Tracking No:</span>
          <span className="text-sm font-mono">{shipment.trackingNumber}</span>
        </div>

        {/* ETA */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground w-24">ETA:</span>
          <span className="text-sm">{shipment.eta}</span>
        </div>

        {/* Shipped On */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground w-24">Shipped on:</span>
          <span className="text-sm">{shipment.shippedOn}</span>
        </div>

        {/* Rel No. */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground w-24">Rel No.:</span>
          <span className="text-sm font-mono">{shipment.relNo}</span>
        </div>

        {/* Shipped From */}
        <div className="flex items-start gap-2">
          <span className="text-sm text-muted-foreground w-24">Shipped from:</span>
          <span className="text-sm">{shipment.shippedFrom}</span>
        </div>

        {/* Subdistrict */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground w-24">Subdistrict:</span>
          <span className="text-sm">{shipment.subdistrict}</span>
        </div>
      </div>

      {/* Right Column - Ship To Address */}
      <div className="space-y-2">
        {/* Email */}
        <div className="flex items-start gap-2">
          <span className="text-sm text-muted-foreground w-28">Email:</span>
          <span className="text-sm break-all">{shipment.shipToAddress.email}</span>
        </div>

        {/* Name */}
        <div className="flex items-start gap-2">
          <span className="text-sm text-muted-foreground w-28">Name:</span>
          <span className="text-sm">{shipment.shipToAddress.name}</span>
        </div>

        {/* Address */}
        <div className="flex items-start gap-2">
          <span className="text-sm text-muted-foreground w-28">Address:</span>
          <span className="text-sm">{shipment.shipToAddress.address}</span>
        </div>

        {/* Full Address */}
        <div className="flex items-start gap-2">
          <span className="text-sm text-muted-foreground w-28">Full address:</span>
          <span className="text-sm">{shipment.shipToAddress.fullAddress}</span>
        </div>

        {/* Allocation Type */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground w-28">Allocation Type:</span>
          <span className="text-sm">{shipment.shipToAddress.allocationType}</span>
        </div>

        {/* Phone */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground w-28">Phone:</span>
          <span className="text-sm font-mono">{shipment.shipToAddress.phone}</span>
        </div>
      </div>
    </div>
  )
}

/**
 * Tracking Link Section - External link to carrier tracking page
 */
function TrackingLinkSection({ shipment }: { shipment: TrackingShipment }) {
  return (
    <div className="mb-4">
      <a
        href={shipment.trackingUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
      >
        <ExternalLink className="h-4 w-4" />
        Track Shipment - {shipment.carrier}
      </a>
    </div>
  )
}

/**
 * CRC Tracking Link Section - Displays the CRC tracking link with label
 */
function CRCTrackingLinkSection({ trackingUrl }: { trackingUrl: string }) {
  return (
    <div className="mb-4">
      <div className="flex items-start gap-2">
        <span className="text-sm text-muted-foreground whitespace-nowrap">CRC tracking link:</span>
        <a
          href={trackingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 hover:underline break-all"
        >
          {trackingUrl}
          <ExternalLink className="h-3 w-3 flex-shrink-0" />
        </a>
      </div>
    </div>
  )
}

/**
 * Shipped Items Section - Table showing shipped items with quantities
 */
function ShippedItemsSection({ shippedItems }: { shippedItems: ShippedItem[] }) {
  return (
    <div className="mb-4">
      <h4 className="text-sm font-medium mb-2">Shipped Items</h4>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Product Name</th>
              <th className="text-left py-2 pr-4 font-medium text-muted-foreground">SKU/Barcode</th>
              <th className="text-right py-2 pr-4 font-medium text-muted-foreground">Shipped Qty</th>
              <th className="text-right py-2 pr-4 font-medium text-muted-foreground">Ordered Qty</th>
              <th className="text-left py-2 font-medium text-muted-foreground">UOM</th>
            </tr>
          </thead>
          <tbody>
            {shippedItems.map((item, index) => (
              <tr key={`${item.sku}-${index}`} className="border-b border-gray-100 dark:border-gray-800 last:border-b-0">
                <td className="py-2 pr-4">{item.productName}</td>
                <td className="py-2 pr-4 font-mono text-xs">{item.sku}</td>
                <td className="py-2 pr-4 text-right">{item.shippedQty}</td>
                <td className="py-2 pr-4 text-right">{item.orderedQty}</td>
                <td className="py-2">{item.uom}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function TrackingTab({ orderId, orderData }: TrackingTabProps) {
  // Generate tracking data
  const shipments = useMemo(() => {
    if (!orderId) return []
    return generateTrackingData(orderId, orderData) as CCTrackingShipment[]
  }, [orderId, orderData])

  // Check if order has Click & Collect and/or Home Delivery methods
  const hasClickCollect = orderData?.deliveryMethods?.some((dm: any) => dm.type === 'CLICK_COLLECT') || false
  const hasHomeDelivery = orderData?.deliveryMethods?.some((dm: any) => dm.type === 'HOME_DELIVERY') || false
  const isMixedDelivery = hasClickCollect && hasHomeDelivery

  if (shipments.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Truck className="h-5 w-5" />
            Tracking
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="text-center py-8">
            <Truck className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-4 text-sm text-muted-foreground">
              No tracking information available for this order.
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
          <Truck className="h-5 w-5" />
          Tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <div className="space-y-6 max-h-[600px] overflow-y-auto">
          {shipments.map((shipment, shipmentIndex) => {
            const allocationType = shipment.shipToAddress.allocationType
            const isPickup = allocationType === 'Pickup'
            const isMerge = allocationType === 'Merge'
            const isClickCollectShipment = isPickup || isMerge
            const shipmentType = (shipment as any).shipmentType as 'HOME_DELIVERY' | 'CLICK_COLLECT' | undefined

            // Determine header text based on allocation type
            let headerText = `Tracking Number - ${shipment.trackingNumber}`
            if (isPickup) {
              headerText = 'Pick up at store'
            } else if (isMerge) {
              headerText = 'Ship to Store'
            }

            // Get the appropriate icon for the shipment type
            const ShipmentIcon = isClickCollectShipment ? Store : Truck

            return (
              <div key={shipment.trackingNumber} className="space-y-3">
                {/* Section Header for Mixed Delivery - show delivery type label */}
                {isMixedDelivery && (
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                    {isClickCollectShipment ? (
                      <>
                        <Store className="h-5 w-5 text-purple-600" />
                        <span className="text-base font-semibold text-purple-600">Click & Collect Tracking</span>
                      </>
                    ) : (
                      <>
                        <Truck className="h-5 w-5 text-blue-600" />
                        <span className="text-base font-semibold text-blue-600">Home Delivery Tracking</span>
                      </>
                    )}
                  </div>
                )}

                {/* Header with gray background */}
                <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <ShipmentIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">
                        {headerText}
                      </span>
                    </div>
                    {shipment.carrier && (
                      <span className="text-xs text-muted-foreground">
                        {shipment.carrier}
                      </span>
                    )}
                  </div>
                </div>

                {/* Shipment Details Section - Use C&C component or regular component */}
                {isClickCollectShipment ? (
                  <CCShipmentDetailsSection shipment={shipment} />
                ) : (
                  <ShipmentDetailsSection shipment={shipment} />
                )}

                {/* CRC Tracking Link - Only for Home Delivery with URL */}
                {!isClickCollectShipment && shipment.trackingUrl && (
                  <CRCTrackingLinkSection trackingUrl={shipment.trackingUrl} />
                )}

                {/* Shipped Items Table - Only if shippedItems exists */}
                {shipment.shippedItems && shipment.shippedItems.length > 0 && (
                  <ShippedItemsSection shippedItems={shipment.shippedItems} />
                )}

                {/* External Tracking Link for Click & Collect - Only if URL exists */}
                {isClickCollectShipment && shipment.trackingUrl && (
                  <TrackingLinkSection shipment={shipment} />
                )}

                {/* Separator between details and events - Only show if there are events */}
                {shipment.events.length > 0 && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3" />
                )}

                {/* Events list - Only for shipments with events */}
                {shipment.events.length > 0 && (
                  <div className="pl-2 sm:pl-4 space-y-2">
                    {shipment.events.map((event: TrackingEvent, eventIndex: number) => (
                      <div
                        key={`${shipment.trackingNumber}-${eventIndex}`}
                        className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-4 py-2 border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                      >
                        {/* Status and location - plain text */}
                        <div className="flex-1">
                          <span className="text-sm text-gray-900 dark:text-gray-100">
                            {event.status}
                          </span>
                          {event.location && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {event.location}
                            </p>
                          )}
                        </div>

                        {/* Timestamp in YYYY-MM-DDTHH:mm:ss format */}
                        <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                          {event.timestamp}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Separator between shipments (except last) */}
                {shipmentIndex < shipments.length - 1 && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3" />
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
