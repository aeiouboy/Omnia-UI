/**
 * Audit Trail Types for Order Detail Page
 * Comprehensive audit event tracking for OMS functionality
 */

/**
 * Enum for all possible audit action types
 */
export enum AuditActionType {
  ORDER_CREATED = "ORDER_CREATED",
  STATUS_CHANGED = "STATUS_CHANGED",
  ITEM_ADDED = "ITEM_ADDED",
  ITEM_REMOVED = "ITEM_REMOVED",
  ITEM_MODIFIED = "ITEM_MODIFIED",
  PAYMENT_UPDATED = "PAYMENT_UPDATED",
  FULFILLMENT_UPDATE = "FULFILLMENT_UPDATE",
  SLA_BREACH = "SLA_BREACH",
  ESCALATED = "ESCALATED",
  NOTE_ADDED = "NOTE_ADDED",
  SYSTEM_EVENT = "SYSTEM_EVENT",
}

/**
 * Enum for audit type categories (Manhattan OMS style)
 */
export enum AuditType {
  ORDER = "ORDER",
  FULFILLMENT = "FULFILLMENT",
  INVENTORY = "INVENTORY",
  PAYMENT = "PAYMENT",
  CUSTOMER = "CUSTOMER",
  SYSTEM = "SYSTEM",
}

/**
 * Source of the audit event
 */
export type AuditEventSource = "API" | "MANUAL" | "INTEGRATION" | "WEBHOOK" | "SYSTEM"

/**
 * Represents a single field change within an audit event
 */
export interface AuditEventChange {
  field: string
  oldValue: string | number | boolean | null
  newValue: string | number | boolean | null
}

/**
 * Actor who performed the action
 */
export interface AuditEventActor {
  id: string
  name: string
  type: "USER" | "SYSTEM" | "API" | "WEBHOOK"
}

/**
 * Main audit event interface
 */
export interface AuditEvent {
  id: string
  orderId: string
  actionType: AuditActionType
  auditType: AuditType
  description: string
  timestamp: string // ISO 8601 format
  source: AuditEventSource
  actor: AuditEventActor
  changes?: AuditEventChange[]
  metadata?: Record<string, unknown>
}

/**
 * Configuration for action type display (icon and colors)
 */
export interface AuditActionConfig {
  label: string
  bgColor: string
  textColor: string
  iconName: string
}

/**
 * Mapping of action types to their display configuration (Manhattan-style labels)
 */
export const AUDIT_ACTION_CONFIG: Record<AuditActionType, AuditActionConfig> = {
  [AuditActionType.ORDER_CREATED]: {
    label: "Created",
    bgColor: "bg-green-100",
    textColor: "text-green-800",
    iconName: "Plus",
  },
  [AuditActionType.STATUS_CHANGED]: {
    label: "Status Changed",
    bgColor: "bg-blue-100",
    textColor: "text-blue-800",
    iconName: "RefreshCw",
  },
  [AuditActionType.ITEM_ADDED]: {
    label: "Line Added",
    bgColor: "bg-green-100",
    textColor: "text-green-800",
    iconName: "PackagePlus",
  },
  [AuditActionType.ITEM_REMOVED]: {
    label: "Line Removed",
    bgColor: "bg-red-100",
    textColor: "text-red-800",
    iconName: "PackageMinus",
  },
  [AuditActionType.ITEM_MODIFIED]: {
    label: "Line Modified",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-800",
    iconName: "Edit",
  },
  [AuditActionType.PAYMENT_UPDATED]: {
    label: "Payment Modified",
    bgColor: "bg-purple-100",
    textColor: "text-purple-800",
    iconName: "CreditCard",
  },
  [AuditActionType.FULFILLMENT_UPDATE]: {
    label: "Fulfillment Updated",
    bgColor: "bg-cyan-100",
    textColor: "text-cyan-800",
    iconName: "Truck",
  },
  [AuditActionType.SLA_BREACH]: {
    label: "SLA Breached",
    bgColor: "bg-red-100",
    textColor: "text-red-800",
    iconName: "AlertTriangle",
  },
  [AuditActionType.ESCALATED]: {
    label: "Escalated",
    bgColor: "bg-orange-100",
    textColor: "text-orange-800",
    iconName: "AlertCircle",
  },
  [AuditActionType.NOTE_ADDED]: {
    label: "Note Added",
    bgColor: "bg-gray-100",
    textColor: "text-gray-800",
    iconName: "MessageSquare",
  },
  [AuditActionType.SYSTEM_EVENT]: {
    label: "System Event",
    bgColor: "bg-slate-100",
    textColor: "text-slate-800",
    iconName: "Settings",
  },
}

/**
 * Configuration for audit type display (Manhattan OMS style)
 */
export interface AuditTypeConfig {
  label: string
  bgColor: string
  textColor: string
}

/**
 * Mapping of audit types to their display configuration
 */
export const AUDIT_TYPE_CONFIG: Record<AuditType, AuditTypeConfig> = {
  [AuditType.ORDER]: {
    label: "ORDER",
    bgColor: "bg-blue-100",
    textColor: "text-blue-800",
  },
  [AuditType.FULFILLMENT]: {
    label: "FULFILLMENT",
    bgColor: "bg-cyan-100",
    textColor: "text-cyan-800",
  },
  [AuditType.INVENTORY]: {
    label: "INVENTORY",
    bgColor: "bg-green-100",
    textColor: "text-green-800",
  },
  [AuditType.PAYMENT]: {
    label: "PAYMENT",
    bgColor: "bg-purple-100",
    textColor: "text-purple-800",
  },
  [AuditType.CUSTOMER]: {
    label: "CUSTOMER",
    bgColor: "bg-amber-100",
    textColor: "text-amber-800",
  },
  [AuditType.SYSTEM]: {
    label: "SYSTEM",
    bgColor: "bg-gray-100",
    textColor: "text-gray-800",
  },
}

/**
 * Mapping of action types to their audit type category
 */
export const ACTION_TYPE_TO_AUDIT_TYPE: Record<AuditActionType, AuditType> = {
  [AuditActionType.ORDER_CREATED]: AuditType.ORDER,
  [AuditActionType.STATUS_CHANGED]: AuditType.ORDER,
  [AuditActionType.ITEM_ADDED]: AuditType.ORDER,
  [AuditActionType.ITEM_REMOVED]: AuditType.ORDER,
  [AuditActionType.ITEM_MODIFIED]: AuditType.ORDER,
  [AuditActionType.ESCALATED]: AuditType.ORDER,
  [AuditActionType.NOTE_ADDED]: AuditType.ORDER,
  [AuditActionType.FULFILLMENT_UPDATE]: AuditType.FULFILLMENT,
  [AuditActionType.PAYMENT_UPDATED]: AuditType.PAYMENT,
  [AuditActionType.SLA_BREACH]: AuditType.SYSTEM,
  [AuditActionType.SYSTEM_EVENT]: AuditType.SYSTEM,
}

/**
 * Filter options for audit trail
 * @deprecated Use ManhattanAuditTrailFilters for new Manhattan-style audit trail
 */
export interface AuditTrailFilters {
  dateRange?: {
    from: Date | undefined
    to: Date | undefined
  }
  auditType?: AuditType | "all"
  source?: AuditEventSource | "all"
  search?: string
}

/**
 * Manhattan Associates OMS style audit event
 * Used for the redesigned audit trail tab matching Manhattan OMS layout
 */
export interface ManhattanAuditEvent {
  id: string
  orderId: string
  updatedBy: string        // User or system name (e.g., 'apiuser4TMS')
  updatedOn: string        // Timestamp with timezone (e.g., '01/09/2026 16:13 ICT')
  entityName: string       // Entity type (e.g., 'Order', 'QuantityDetail')
  entityId: string         // Entity identifier (can be long)
  changedParameter: string // Change description
  oldValue: string | null  // Previous value
  newValue: string | null  // New value
}

/**
 * Entity name categories for filter dropdown
 */
export type EntityNameCategory = 'All' | 'Order' | 'Fulfillment' | 'Payment' | 'System'

/**
 * Filter options for Manhattan-style audit trail
 */
export interface ManhattanAuditTrailFilters {
  entityCategory: EntityNameCategory
  auditDate: Date | undefined
  orderLineId: string
}

/**
 * Fulfillment status types for timeline display
 * Includes Click & Collect statuses for store pickup orders
 */
export type FulfillmentStatusType =
  | 'Picking'
  | 'Packing'
  | 'Packed'
  | 'Ready To Ship'
  | 'Pending CC Received'  // Store notified, waiting to receive goods from warehouse
  | 'CC Received'          // Store has received the goods
  | 'Ready to Collect'     // Customer notified, goods ready for pickup
  | 'CC Collected'         // Customer has collected the order

/**
 * Fulfillment status event for timeline display
 */
export interface FulfillmentStatusEvent {
  id: string
  status: FulfillmentStatusType
  timestamp: string // ISO format (YYYY-MM-DDTHH:mm:ss)
  details?: string // Optional description like "Item SKU-001 picked"
}

/**
 * Tracking event status types
 */
export type TrackingEventStatus = 'Shipment pickedup' | 'Hub / Intransit - destination arrived' | 'Out for Delivery' | 'Delivered'

/**
 * Shipment delivery status types (Manhattan OMS style)
 */
export type ShipmentStatus = 'DELIVERED' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'PICKED_UP' | 'PENDING'

/**
 * Ship-to address information for tracking
 */
export interface ShipToAddress {
  email: string
  name: string
  address: string
  fullAddress: string // District, City, Postal code
  allocationType: 'Delivery' | 'Pickup' | 'Merge'
  phone: string
}

/**
 * Individual tracking event within a shipment
 */
export interface TrackingEvent {
  status: TrackingEventStatus
  timestamp: string // ISO format
  location?: string // Optional location info
}

/**
 * Shipment tracking information grouped by tracking number
 */
export interface TrackingShipment {
  trackingNumber: string
  carrier?: string
  events: TrackingEvent[]
  // Manhattan OMS enhanced fields
  status: ShipmentStatus
  eta: string // DD/MM/YYYY format
  shippedOn: string // DD/MM/YYYY format
  relNo: string // Release order number
  shippedFrom: string // Origin store name
  subdistrict: string // Thai subdistrict name
  shipToAddress: ShipToAddress
  trackingUrl: string // External carrier tracking link
}

/**
 * Product item for Click & Collect Ship to Store scenario
 */
export interface CCProductItem {
  productName: string
  sku: string
  shippedQty: number
  orderedQty: number
  uom: string
}

/**
 * Click & Collect tracking shipment with extended fields
 * Extends TrackingShipment with additional C&C specific data
 */
export interface CCTrackingShipment extends TrackingShipment {
  productItems?: CCProductItem[] // Only for Merge allocation type (Ship to Store)
}
