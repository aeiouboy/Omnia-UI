"use client"

import { CCTrackingShipment } from "@/types/audit"

interface CCShipmentDetailsSectionProps {
  shipment: CCTrackingShipment
}

/**
 * Get status color classes based on shipment status for C&C
 */
function getStatusColor(status: string): { text: string; dot: string } {
  // PICKED_UP and FULFILLED are shown in green for C&C
  if (status === 'PICKED_UP' || status === 'DELIVERED') {
    return { text: 'text-green-600', dot: 'bg-green-600' }
  }
  switch (status) {
    case 'IN_TRANSIT':
      return { text: 'text-blue-600', dot: 'bg-blue-600' }
    case 'OUT_FOR_DELIVERY':
      return { text: 'text-orange-600', dot: 'bg-orange-600' }
    case 'PENDING':
    default:
      return { text: 'text-gray-600', dot: 'bg-gray-600' }
  }
}

/**
 * Format status for display
 */
function formatStatus(status: string, allocationType: string): string {
  if (allocationType === 'Pickup' && status === 'PICKED_UP') {
    return 'PICKED UP'
  }
  if (allocationType === 'Merge' && status === 'DELIVERED') {
    return 'FULFILLED'
  }
  return status.replace(/_/g, ' ')
}

/**
 * Click & Collect Shipment Details Section
 * Handles both Pickup and Merge allocation types
 */
export function CCShipmentDetailsSection({ shipment }: CCShipmentDetailsSectionProps) {
  const statusColors = getStatusColor(shipment.status)
  const shipTo = shipment.shipToAddress || (shipment as any).shipToStore
  const allocationType = shipTo?.allocationType || 'Pickup'
  const isPickup = allocationType === 'Pickup'
  const isMerge = allocationType === 'Merge'

  return (
    <div className="space-y-4">
      {/* Two-column layout for shipment info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column - Shipment Details */}
        <div className="space-y-2">
          {/* Status with color indicator */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground w-24">Status:</span>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${statusColors.dot}`}></span>
              <span className={`text-sm font-medium ${statusColors.text}`}>
                {formatStatus(shipment.status, allocationType)}
              </span>
            </div>
          </div>

          {/* Tracking Number - Show for both Pickup and Merge */}
          <div className="flex items-start gap-2">
            <span className="text-sm text-muted-foreground w-24">Tracking No:</span>
            <span className="text-sm font-mono">{shipment.trackingNumber}</span>
          </div>

          {/* ETA - Show for both Pickup and Merge */}
          {shipment.eta && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground w-24">ETA:</span>
              <span className="text-sm">{shipment.eta}</span>
            </div>
          )}

          {/* Shipped On - Only show for Merge */}
          {isMerge && shipment.shippedOn && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground w-24">Shipped on:</span>
              <span className="text-sm">{shipment.shippedOn}</span>
            </div>
          )}

          {/* Rel No. */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground w-24">Rel No.:</span>
            <span className="text-sm font-mono">{shipment.relNo}</span>
          </div>

          {/* Shipped From / Picked From */}
          <div className="flex items-start gap-2">
            <span className="text-sm text-muted-foreground w-24">
              {isPickup ? 'Picked from:' : 'Shipped from:'}
            </span>
            <span className="text-sm">{shipment.shippedFrom}</span>
          </div>

          {/* Subdistrict */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground w-24">Subdistrict:</span>
            <span className="text-sm">{shipment.subdistrict}</span>
          </div>
        </div>

        {/* Right Column - Store/Customer Details */}
        <div className="space-y-2">
          {/* Email */}
          <div className="flex items-start gap-2">
            <span className="text-sm text-muted-foreground w-28">Email:</span>
            <span className="text-sm break-all">{shipTo?.email || '-'}</span>
          </div>

          {/* Store Name (for both Pickup and Merge) */}
          <div className="flex items-start gap-2">
            <span className="text-sm text-muted-foreground w-28">Store name:</span>
            <span className="text-sm">{shipTo?.name || '-'}</span>
          </div>

          {/* Store Address */}
          <div className="flex items-start gap-2">
            <span className="text-sm text-muted-foreground w-28">Store address:</span>
            <span className="text-sm">{shipTo?.address || '-'}</span>
          </div>

          {/* Full Address */}
          <div className="flex items-start gap-2">
            <span className="text-sm text-muted-foreground w-28">Full address:</span>
            <span className="text-sm">{shipTo?.fullAddress || '-'}</span>
          </div>

          {/* Allocation Type */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground w-28">Allocation Type:</span>
            <span className="text-sm font-medium">{allocationType}</span>
          </div>

          {/* Phone */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground w-28">Phone:</span>
            <span className="text-sm font-mono">{shipTo?.phone || '-'}</span>
          </div>
        </div>
      </div>

    </div>
  )
}
