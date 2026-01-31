"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Ban,
  ChevronDown,
  PackageOpen,
  Search,
  Package,
  Truck,
  MapPin,
  User,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  Edit,
  MessageSquare,
  Calendar,
  DollarSign,
  ShoppingBag,
  X,
  Copy,
  Check,
  History,
  Home,
  Store,
  StickyNote,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Order, ApiCustomer, ApiShippingAddress, ApiPaymentInfo, ApiSLAInfo, ApiMetadata, ApiOrderItem } from "./order-management-hub" // Assuming Order and its sub-types are exported
import { formatGMT7DateTime } from "@/lib/utils"
import { formatCurrency } from "@/lib/currency-utils"
import { DeliveryMethod } from "@/types/delivery"
import { ChannelBadge, PaymentStatusBadge, OrderStatusBadge, OnHoldBadge, ReturnStatusBadge, DeliveryTypeCodeBadge, getDeliveryTypeCodeLabel } from "./order-badges";
// import { SLABadge } from "./order-badges"; // Disabled SLA elements
import { AuditTrailTab } from "./order-detail/audit-trail-tab"
import { FulfillmentTimeline } from "./order-detail/fulfillment-timeline"
import { TrackingTab } from "./order-detail/tracking-tab"
import { PaymentsTab } from "./order-detail/payments-tab"
import { CancelOrderDialog } from "./order-detail/cancel-order-dialog"
import { isOrderCancellable, getCancelDisabledReason } from "@/lib/order-status-utils"
import { getCancelReasonById } from "@/lib/cancel-reasons"

interface OrderDetailViewProps {
  order?: Order | null;
  onClose?: () => void;
  orderId?: string;
}

// Note interface for order notes
interface Note {
  id: string
  orderId: string
  content: string
  createdBy: string // Auto-populated from currentUser.email (e.g., "buabsupattra@central.co.th")
  createdAt: string // Auto-populated: "01/13/2026 13:13 +07" format
}

// Helper function to format timestamp like "01/13/2026 13:13 +07"
const formatGMT7Timestamp = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }

  const formatter = new Intl.DateTimeFormat('en-US', options)
  const parts = formatter.formatToParts(date)

  const month = parts.find(p => p.type === 'month')?.value
  const day = parts.find(p => p.type === 'day')?.value
  const year = parts.find(p => p.type === 'year')?.value
  const hour = parts.find(p => p.type === 'hour')?.value
  const minute = parts.find(p => p.type === 'minute')?.value

  return `${month}/${day}/${year} ${hour}:${minute} +07`
}

// Helper function to map delivery codes to custom labels
const getCustomDeliveryLabel = (code?: string): string => {
  if (!code) return 'Standard';
  const c = code.toUpperCase();
  if (c.includes('EXP') || c.includes('FAST') || c.includes('1 HR')) return 'Express';
  return 'Standard';
}

// Home Delivery Section Component
interface HomeDeliverySectionProps {
  delivery: DeliveryMethod;
  deliveryLabel?: string;
}

function HomeDeliverySection({ delivery, deliveryLabel }: HomeDeliverySectionProps) {
  const details = delivery.homeDelivery;
  if (!details) return null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Home className="h-5 w-5 text-blue-600" />
          <h4 className="font-medium text-gray-900">Home Delivery</h4>
          <Badge className="bg-blue-100 text-blue-800 border-blue-300">{deliveryLabel || 'Standard'}</Badge>
        </div>
        <span className="text-sm text-gray-500">{delivery.itemCount} item{delivery.itemCount !== 1 ? 's' : ''}</span>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-enterprise-text-light">Recipient</p>
          <p className="font-medium">{details.recipient}</p>
        </div>
        <div>
          <p className="text-sm text-enterprise-text-light">Phone</p>
          <p className="text-sm">{details.phone}</p>
        </div>
        <div className="sm:col-span-2">
          <p className="text-sm text-enterprise-text-light">Address</p>
          <p className="text-sm">{details.address}</p>
        </div>
        <div>
          <p className="text-sm text-enterprise-text-light">District</p>
          <p className="text-sm">{details.district}</p>
        </div>
        <div>
          <p className="text-sm text-enterprise-text-light">City / Postal Code</p>
          <p className="text-sm">{details.city}, {details.postalCode}</p>
        </div>
        {details.specialInstructions && (
          <div className="sm:col-span-2">
            <p className="text-sm text-enterprise-text-light">Special Instructions</p>
            <p className="text-sm italic">{details.specialInstructions}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Click & Collect Section Component
interface ClickCollectSectionProps {
  delivery: DeliveryMethod;
  deliveryLabel?: string;
}

function ClickCollectSection({ delivery, deliveryLabel }: ClickCollectSectionProps) {
  const details = delivery.clickCollect;
  if (!details) return null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Store className="h-5 w-5 text-purple-600" />
          <h4 className="font-medium text-gray-900">Click & Collect</h4>
          <Badge className="bg-purple-100 text-purple-800 border-purple-300">{deliveryLabel || 'Standard'}</Badge>
        </div>
        <span className="text-sm text-gray-500">{delivery.itemCount} item{delivery.itemCount !== 1 ? 's' : ''}</span>
      </div>

      {/* Details - Simplified single-column layout with 5 essential fields */}
      <div className="grid grid-cols-1 gap-4">
        {/* 1. Recipient Name */}
        <div>
          <p className="text-sm text-enterprise-text-light">Recipient Name</p>
          <p className="font-medium">{details.recipientName}</p>
        </div>
        {/* 2. Phone */}
        <div>
          <p className="text-sm text-enterprise-text-light">Phone</p>
          <p className="text-sm">{details.phone}</p>
        </div>
        {/* 3. Rel No. */}
        <div>
          <p className="text-sm text-enterprise-text-light">Rel No.</p>
          <p className="font-mono text-sm">{details.relNo}</p>
        </div>
        {/* 4. Store Pickup */}
        <div>
          <p className="text-sm text-enterprise-text-light">Store Pickup</p>
          <p className="font-medium">{details.storeName}</p>
        </div>
        {/* 5. Store Contact */}
        <div>
          <p className="text-sm text-enterprise-text-light">Store Contact</p>
          <p className="text-sm">{details.storePhone}</p>
        </div>
      </div>
    </div>
  );
}


// Helper function to format order created timestamp
const formatOrderCreatedDate = (dateString?: string): string => {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
  } catch {
    return '-'
  }
}

// Helper function to map customerTypeId to descriptive labels
// DEPRECATED: Use order.customer.customerType instead of order.customerTypeId
// const getCustomerTypeLabel = (customerTypeId: string | undefined | null): string => {
//   if (!customerTypeId) return '-';

//   const clusterMapping: Record<string, string> = {
//     'cluster_1': 'Standard',
//     'cluster_2': 'Premium',
//     'cluster_3': 'Prime',
//     'cluster_4': 'VIP',
//   };

//   // Check if the ID is a cluster_X format
//   const clusterId = customerTypeId.toLowerCase().split(' ')[0]; // Handle "cluster_3 - Prime" format
//   if (clusterMapping[clusterId]) {
//     return `${clusterId} - ${clusterMapping[clusterId]}`;
//   }

//   // For non-cluster IDs, return as-is
//   return customerTypeId;
// };

export function OrderDetailView({ order, onClose, orderId }: OrderDetailViewProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("overview")
  const [itemSearchTerm, setItemSearchTerm] = useState("")
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})
  const [copiedOrderId, setCopiedOrderId] = useState(false)
  const [allItemsExpanded, setAllItemsExpanded] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  // Notes feature state
  const [showNotesPanel, setShowNotesPanel] = useState(false)
  const [notes, setNotes] = useState<Note[]>([])
  const [newNote, setNewNote] = useState("")
  const [currentUser, setCurrentUser] = useState<{ email: string } | null>(null)

  // Determine if order can be cancelled based on its status
  const canCancelOrder = order?.status
    ? isOrderCancellable(order.status)
    : false

  // Compute note count for badge
  const noteCount = notes.length

  // Fetch notes and user on mount
  useEffect(() => {
    if (order?.id) {
      fetchNotes()
      fetchCurrentUser()
    }
  }, [order?.id])

  const fetchNotes = async () => {
    // TODO: Replace with actual API call
    // For now, using mock data
    const mockNotes: Note[] = [
      {
        id: '1',
        orderId: order?.id || '',
        content: 'Customer requested gift wrapping',
        createdBy: 'buabsupattra@central.co.th',
        createdAt: '01/13/2026 13:13 +07',
      },
      {
        id: '2',
        orderId: order?.id || '',
        content: 'Address verified with customer',
        createdBy: 'jane.smith@central.co.th',
        createdAt: '01/13/2026 10:15 +07',
      },
    ]
    setNotes(mockNotes)
  }

  const fetchCurrentUser = async () => {
    // TODO: Replace with actual user session fetch
    // For now, using mock user
    setCurrentUser({ email: 'user@central.co.th' })
  }

  const handleSaveNote = async () => {
    if (!newNote.trim()) return

    try {
      const noteData = {
        orderId: order?.id || '',
        content: newNote.trim(),
        createdBy: currentUser?.email || 'system@central.co.th', // Auto-populated
        createdAt: formatGMT7Timestamp(new Date()), // Auto-populated: "01/13/2026 13:13 +07"
      }

      // TODO: Replace with actual API call
      // const response = await fetch(`/api/orders/${order?.id}/notes`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(noteData),
      // })
      // if (!response.ok) throw new Error('Failed to save note')
      // const savedNote = await response.json()

      // For now, create note locally with generated ID
      const savedNote: Note = {
        id: Date.now().toString(),
        ...noteData,
      }

      // Update local state (add to beginning - newest first)
      setNotes([savedNote, ...notes])

      // Reset form
      setNewNote("")

      toast({
        title: 'Note saved successfully',
        variant: 'default',
      })
    } catch (error) {
      toast({
        title: 'Failed to save note',
        variant: 'destructive',
      })
      console.error(error)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/orders/${order?.id}/notes/${noteId}`, {
      //   method: 'DELETE',
      // })
      // if (!response.ok) throw new Error('Failed to delete note')

      // Update local state
      setNotes(notes.filter(note => note.id !== noteId))

      toast({
        title: 'Note deleted successfully',
        variant: 'default',
      })
    } catch (error) {
      toast({
        title: 'Failed to delete note',
        variant: 'destructive',
      })
      console.error(error)
    }
  }

  const toggleItemExpansion = (sku: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [sku]: !prev[sku],
    }))
  }

  const toggleAllItems = () => {
    if (allItemsExpanded) {
      setExpandedItems({})
    } else {
      const allExpanded: Record<string, boolean> = {}
      order?.items?.forEach((item: ApiOrderItem) => {
        allExpanded[item.product_sku] = true
      })
      setExpandedItems(allExpanded)
    }
    setAllItemsExpanded(!allItemsExpanded)
  }

  const copyOrderIdToClipboard = async () => {
    if (order?.id) {
      try {
        await navigator.clipboard.writeText(order.id)
        setCopiedOrderId(true)
        toast({
          title: "Copied to clipboard",
          description: `Order ID ${order.id} copied successfully`,
          variant: "default",
        })
        setTimeout(() => setCopiedOrderId(false), 2000)
      } catch (err) {
        toast({
          title: "Copy failed",
          description: "Failed to copy order ID to clipboard",
          variant: "destructive",
        })
      }
    }
  }

  const handleCancelOrder = async (reasonId: string) => {
    setIsCancelling(true)
    try {
      // Note: In a real implementation, this would call an API to cancel the order
      // For now, we simulate the cancellation with a delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      const reason = getCancelReasonById(reasonId)
      toast({
        title: "Order Cancelled",
        description: `Order ${order?.order_no} has been cancelled. Reason: ${reason?.shortDescription || reasonId}`,
        variant: "default",
      })
      setShowCancelDialog(false)
      // Note: In production, refresh order data here or update local state
    } catch (error) {
      toast({
        title: "Cancellation Failed",
        description: "Failed to cancel the order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCancelling(false)
    }
  }

  const filteredItems = order?.items
    ? order.items.filter((item: ApiOrderItem) => {
      const searchTerm = itemSearchTerm.toLowerCase();
      const productName = (item.product_name || '').toLowerCase();
      const productSku = (item.product_sku || '').toLowerCase();
      // product_details might contain description, but we don't have its type yet.
      // For now, we'll only filter by name and SKU.
      return (
        productName.includes(searchTerm) ||
        productSku.includes(searchTerm)
      );
    })
    : [];

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* <Button variant="outline" size="sm" onClick={onClose} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Orders</span>
              <span className="sm:hidden">Back</span>
            </Button> */}
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-enterprise-dark truncate">Order Details</h1>
              <p className="text-xs sm:text-sm text-enterprise-text-light">Order #{order?.order_no || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowCancelDialog(true)}
              disabled={!canCancelOrder || isCancelling}
              className={!canCancelOrder ? "opacity-50 cursor-not-allowed" : ""}
              title={!canCancelOrder ? getCancelDisabledReason(order?.status || '') : "Cancel this order"}
            >
              <Ban className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setShowNotesPanel(true)}
              title="Order notes"
            >
              <StickyNote className="h-5 w-5" />
              {noteCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {noteCount}
                </Badge>
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Action Buttons - Mobile First Design */}
        {/* <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <div className="grid grid-cols-2 sm:flex gap-2 sm:gap-3 flex-1">
            <Button variant="outline" size="sm" className="justify-center">
              <Download className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Export</span>
              <span className="sm:hidden text-xs">Export</span>
            </Button>
            <Button variant="outline" size="sm" className="justify-center">
              <Edit className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Edit Order</span>
              <span className="sm:hidden text-xs">Edit</span>
            </Button>
            <Button size="sm" className="bg-blue-500 hover:bg-blue-600 justify-center col-span-2 sm:col-span-1">
              <RefreshCw className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Process Order</span>
              <span className="sm:hidden text-xs">Process</span>
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={onClose} className="hidden sm:flex">
            <X className="h-4 w-4" />
          </Button>
        </div> */}
      </div>

      {/* SLA Alert - DISABLED */}
      {/* {
        order?.sla_info?.status === "BREACH" && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-700">
              <strong>SLA Breach:</strong> This order has exceeded the {order.sla_info.target_minutes}-minute processing target
              by {order.sla_info.elapsed_minutes - order.sla_info.target_minutes} minutes.
            </AlertDescription>
          </Alert>
        )
      } */}

      {/* Quick Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="space-y-2">
              <p className="text-xs sm:text-sm text-enterprise-text-light">Status</p>
              <div><OrderStatusBadge status={order?.status || 'N/A'} /></div>
            </div>
          </CardContent>
        </Card>

        {/* <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="space-y-2">
              <p className="text-xs sm:text-sm text-enterprise-text-light">Priority</p>
              <div><PriorityBadge priority={order?.metadata?.priority || 'N/A'} /></div>
            </div>
          </CardContent>
        </Card> */}

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="space-y-2">
              <p className="text-xs sm:text-sm text-enterprise-text-light">Channel</p>
              <div><ChannelBadge channel={order?.channel || 'N/A'} /></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-enterprise-text-light">Total Amount</p>
                <p className="text-base sm:text-lg font-semibold mt-1 truncate">{formatCurrency(order?.total_amount)}</p>
              </div>
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
        <TabsList className="bg-white border border-enterprise-border grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 h-auto p-1">
          <TabsTrigger value="overview" className="text-xs sm:text-sm px-2 py-2 whitespace-nowrap">Overview</TabsTrigger>
          <TabsTrigger value="items" className="text-xs sm:text-sm px-2 py-2 whitespace-nowrap">Items ({order?.items?.length || 0})</TabsTrigger>
          <TabsTrigger value="payments" className="text-xs sm:text-sm px-2 py-2 whitespace-nowrap">Payments</TabsTrigger>
          <TabsTrigger value="fulfillment" className="text-xs sm:text-sm px-2 py-2 whitespace-nowrap">Fulfillment</TabsTrigger>
          {/* <TabsTrigger value="delivery" className="text-xs sm:text-sm px-2 py-2 whitespace-nowrap">Delivery</TabsTrigger> */}
          <TabsTrigger value="tracking" className="text-xs sm:text-sm px-2 py-2 whitespace-nowrap">Tracking</TabsTrigger>
          {/* <TabsTrigger value="timeline" className="text-xs sm:text-sm px-2 py-2 whitespace-nowrap">Timeline</TabsTrigger> */}
          <TabsTrigger value="audit" className="text-xs sm:text-sm px-2 py-2 whitespace-nowrap flex items-center gap-1">
            <History className="h-3 w-3 hidden sm:inline" />
            Audit Trail
          </TabsTrigger>
          {/* <TabsTrigger value="notes" className="text-xs sm:text-sm px-2 py-2 whitespace-nowrap">Notes</TabsTrigger> */}
        </TabsList>

        <TabsContent value="overview" className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-enterprise-text-light">Name</p>
                    <p className="font-medium">{order?.customer?.name || '-'}</p>
                  </div>
                  {/* <div>
                    <p className="text-sm text-enterprise-text-light">Customer ID</p>
                    <p className="font-mono text-sm">{order?.customer?.id || '-'}</p>
                  </div> */}
                  <div>
                    <p className="text-sm text-enterprise-text-light">Customer Type</p>
                    <p className="text-sm">{order?.customer?.customerType || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-enterprise-text-light">Cust Ref</p>
                    <p className="font-mono text-sm">{order?.customer?.custRef || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-enterprise-text-light">Email</p>
                    <p className="text-sm">{order?.customer?.email || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-enterprise-text-light">Phone Number</p>
                    <p className="text-sm">{order?.customer?.phone || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-enterprise-text-light">The1 Member</p>
                    <p className="font-mono text-sm">{order?.customer?.T1Number || '-'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-enterprise-text-light">Order ID</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-sm">{order?.id || '-'}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyOrderIdToClipboard}
                        className="h-6 px-2"
                        title="Copy Order ID to clipboard"
                      >
                        {copiedOrderId ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                  {/* <div>
                    <p className="text-sm text-enterprise-text-light">Payment Status</p>
                    <PaymentStatusBadge status={order?.payment_info?.status || '-'} />
                  </div> */}
                  {/* <div>
                    <p className="text-sm text-enterprise-text-light">Short Order ID</p>
                    <p className="font-mono text-sm">{order?.order_no || '-'}</p>
                  </div> */}
                  <div>
                    <p className="text-sm text-enterprise-text-light">Store No.</p>
                    <p className="font-medium">{order?.metadata?.store_no || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-enterprise-text-light">Order Created</p>
                    <p className="text-sm">{formatOrderCreatedDate(order?.metadata?.order_created)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-enterprise-text-light">Order Date</p>
                    <p className="text-sm">{order?.order_date ? new Date(order.order_date).toLocaleString() : '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-enterprise-text-light">Business Unit</p>
                    <p className="font-medium">{order?.business_unit || '-'}</p>
                  </div>
                  {/* <div>
                    <p className="text-sm text-enterprise-text-light">Order Type</p>
                    <Badge variant="outline">{order?.order_type || '-'}</Badge>
                  </div> */}
                  <div>
                    <p className="text-sm text-enterprise-text-light">Full Tax Invoice</p>
                    <p className="text-sm">{order?.fullTaxInvoice ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-enterprise-text-light">Selling Channel</p>
                    <p className="text-sm">{order?.sellingChannel || order?.channel || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-enterprise-text-light">Allow Substitution</p>
                    <p className="text-sm">{order?.allow_substitution ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-enterprise-text-light">Tax ID</p>
                    <p className="font-mono text-sm">{order?.taxId || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-enterprise-text-light">Company Name</p>
                    <p className="text-sm">{order?.companyName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-enterprise-text-light">Branch No.</p>
                    <p className="font-mono text-sm">{order?.branchNo || '-'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Delivery Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Delivery Type Code - Commented out as per request
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-sm text-enterprise-text-light">Delivery Type</span>
                  <div className="flex items-center gap-2">
                    <DeliveryTypeCodeBadge deliveryTypeCode={order?.deliveryTypeCode} />
                    <span className="text-xs text-muted-foreground">
                      {getDeliveryTypeCodeLabel(order?.deliveryTypeCode)}
                    </span>
                  </div>
                </div> */}
                {order?.deliveryMethods && order.deliveryMethods.length > 0 ? (
                  <>
                    {/* Find home delivery and click collect methods */}
                    {(() => {
                      const homeDelivery = order.deliveryMethods.find(d => d.type === 'HOME_DELIVERY');
                      const clickCollect = order.deliveryMethods.find(d => d.type === 'CLICK_COLLECT');
                      const isMixed = homeDelivery && clickCollect;

                      return (
                        <>
                          {/* Home Delivery Section */}
                          {homeDelivery && (
                            <div className={isMixed ? 'border-b border-gray-200 pb-4 mb-4' : ''}>
                              <HomeDeliverySection
                                delivery={homeDelivery}
                                deliveryLabel={getCustomDeliveryLabel(order?.deliveryTypeCode)}
                              />
                            </div>
                          )}

                          {/* AND Divider for Mixed Orders */}
                          {isMixed && (
                            <div className="flex items-center gap-3 py-2">
                              <div className="flex-1 h-px bg-gray-300" />
                              <span className="text-sm font-medium text-gray-500">AND</span>
                              <div className="flex-1 h-px bg-gray-300" />
                            </div>
                          )}

                          {/* Click & Collect Section */}
                          {clickCollect && (
                            <ClickCollectSection
                              delivery={clickCollect}
                              deliveryLabel={getCustomDeliveryLabel(order?.deliveryTypeCode)}
                            />
                          )}
                        </>
                      );
                    })()}
                  </>
                ) : (
                  <div className="text-center py-4">
                    <MapPin className="mx-auto h-8 w-8 text-gray-300" />
                    <p className="mt-2 text-sm text-muted-foreground">No delivery information available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                  <Badge
                    variant="outline"
                    className={order?.payment_info?.status === 'PAID'
                      ? 'bg-green-100 text-green-800 border-green-300'
                      : 'bg-gray-100 text-gray-800 border-gray-300'}
                  >
                    {order?.payment_info?.status === 'PAID' ? 'PAID' : 'PENDING'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-enterprise-text-light">Subtotal</span>
                  <span className="text-sm font-mono">{formatCurrency(order?.payment_info?.subtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-enterprise-text-light">Discounts</span>
                  <span className="text-sm font-mono text-red-600">-{formatCurrency(order?.payment_info?.discounts)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-enterprise-text-light">Charges</span>
                  <span className="text-sm font-mono">{formatCurrency(order?.payment_info?.charges)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-enterprise-text-light">Shipping Fee</span>
                  <span className="text-sm font-mono">{formatCurrency(order?.orderDeliveryFee)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-enterprise-text-light">Amount Included Taxes</span>
                  <span className="text-sm font-mono">{formatCurrency(order?.payment_info?.amountIncludedTaxes)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-enterprise-text-light">Amount Excluded Taxes</span>
                  <span className="text-sm font-mono">{formatCurrency(order?.payment_info?.amountExcludedTaxes)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-enterprise-text-light">Taxes</span>
                  <span className="text-sm font-mono">{formatCurrency(order?.payment_info?.taxes)}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center font-semibold">
                  <span>Total</span>
                  <span className="text-lg font-mono">{formatCurrency(order?.total_amount)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="items" className="space-y-4">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="text-lg sm:text-xl">Order Items</CardTitle>
                    <CardDescription className="text-sm">{order?.items?.length || 0} items in this order</CardDescription>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-72">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="search"
                        placeholder="Search items..."
                        className="pl-10 h-10 text-sm w-full"
                        value={itemSearchTerm}
                        onChange={(e) => setItemSearchTerm(e.target.value)}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleAllItems}
                      className="whitespace-nowrap"
                    >
                      {allItemsExpanded ? 'Collapse All' : 'Expand All'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              {filteredItems.length > 0 ? (
                <div className="space-y-3">
                  {filteredItems.map((item: ApiOrderItem, index) => {
                    // Helper function to get fulfillment status badge color
                    const getFulfillmentBadgeClass = (status?: string) => {
                      switch (status) {
                        case 'Picked': return 'bg-green-100 text-green-800 border-green-300'
                        case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
                        case 'Shipped': return 'bg-blue-100 text-blue-800 border-blue-300'
                        case 'Packed': return 'bg-purple-100 text-purple-800 border-purple-300'
                        default: return 'bg-gray-100 text-gray-800 border-gray-300'
                      }
                    }

                    return (
                      <Card key={item.id || `${item.product_sku}-${index}`} className="border border-gray-200 overflow-hidden hover:shadow-sm transition-shadow">
                        {/* Enhanced Item Header */}
                        <div
                          className="p-3 sm:p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => toggleItemExpansion(item.product_sku)}
                        >
                          <div className="flex gap-3 sm:gap-4">
                            {/* Product Image - Larger on desktop */}
                            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                              <img
                                src={`https://via.placeholder.com/80x80/f3f4f6/9ca3af?text=${encodeURIComponent('📦')}`}
                                alt={item.product_name || 'Product image'}
                                className="object-cover w-full h-full"
                              />
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start gap-2">
                                <div className="flex-1 min-w-0">
                                  {/* Fulfillment Status Badge */}
                                  {/* {item.fulfillmentStatus && (
                                    <Badge className={`mb-1 text-xs ${getFulfillmentBadgeClass(item.fulfillmentStatus)}`}>
                                      {item.fulfillmentStatus}
                                    </Badge>
                                  )} */}
                                  {/* Product Name */}
                                  <h4 className="font-medium text-sm sm:text-base text-gray-900 leading-tight" style={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                  }}>
                                    {item.thaiName ? `${item.thaiName} ${item.product_name}` : item.product_name || 'N/A'}
                                  </h4>
                                  {/* SKU and Barcode */}
                                  <div className="flex flex-wrap items-center gap-2 mt-1">
                                    <p className="text-xs text-gray-500 font-mono">
                                      SKU: {item.product_sku || 'N/A'}
                                    </p>
                                    {/* {item.barcode && (
                                      <p className="text-xs text-gray-400 font-mono">
                                        | Barcode: {item.barcode}
                                      </p>
                                    )} */}
                                  </div>
                                </div>
                                <ChevronDown
                                  className={`h-5 w-5 text-gray-400 transition-transform flex-shrink-0 mt-1 ${expandedItems[item.product_sku] ? "rotate-180" : ""
                                    }`}
                                />
                              </div>

                              {/* Price and Quantity */}
                              <div className="flex justify-between items-end mt-3">
                                <div className="flex items-center gap-4">
                                  <div>
                                    <p className="text-xs text-gray-500">Qty:</p>
                                    <p className="text-sm font-medium">{item.quantity}</p>
                                  </div>
                                  {/* {item.bundleRef && (
                                    <div>
                                      <p className="text-xs text-gray-500">Bundle Ref:</p>
                                      <p className="text-sm font-mono">{item.bundleRef}</p>
                                    </div>
                                  )} */}
                                </div>
                                <div className="text-right">
                                  <p className="text-lg sm:text-xl font-bold text-green-600">
                                    {formatCurrency(item.unit_price || 0)}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    each
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Collapsible Item Details - 3 Column Layout */}
                        {expandedItems[item.product_sku] && (() => {
                          const isPackUOM = ['PACK', 'BOX', 'SET', 'CASE', 'CTN', 'CARTON'].includes(item.uom?.toUpperCase() || '')
                          return (
                            <div className="border-t border-gray-100 bg-gray-50">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-4">
                                {/* Column 1 - Product Details */}
                                <div className="p-3 sm:p-4">
                                  <div className="bg-gray-100 px-3 py-2 rounded-t-md mb-3">
                                    <h5 className="text-xs text-gray-600 uppercase tracking-wide font-semibold">Product Details</h5>
                                  </div>
                                  <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">UOM</span>
                                      <span className="text-gray-900 font-medium">{item.uom || 'EA'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">Supply Type ID</span>
                                      <span className="text-gray-900 font-medium">{item.supplyTypeId || 'N/A'}</span>
                                    </div>
                                    {/* <div className="flex justify-between">
                                      <span className="text-gray-500">Location</span>
                                      <span className="text-gray-900 font-mono text-xs">{item.location || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">Barcode</span>
                                      <span className="text-gray-900 font-mono text-xs">{item.barcode || 'N/A'}</span>
                                    </div> */}
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">Substitution</span>
                                      <span className="text-gray-900 font-medium">{item.substitution ? 'Yes' : 'No'}</span>
                                    </div>
                                    {/* <div className="flex justify-between">
                                      <span className="text-gray-500">Bundle</span>
                                      <span className="text-gray-900 font-medium">{item.bundle ? 'Yes' : 'No'}</span>
                                    </div> */}
                                    {/* <div className="flex justify-between">
                                      <span className="text-gray-500">Bundle Ref Id</span>
                                      <span className="text-gray-900 font-medium">{item.bundleRef || 'N/A'}</span>
                                    </div> */}
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">Packed Ordered Qty</span>
                                      <span className="text-gray-900 font-medium">{item.packedOrderedQty || item.quantity}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">Gift Wrapped</span>
                                      <span className="text-gray-900 font-medium">{item.giftWrapped ? 'Yes' : 'No'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">Gift Message</span>
                                      <span className="text-gray-900 font-medium italic">
                                        {item.giftWrapped && item.giftWrappedMessage ? item.giftWrappedMessage : '-'}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">Secret Code</span>
                                      <span className="text-gray-900 font-medium">{item.secretCode || 'N/A'}</span>
                                    </div>
                                    {/* <div className="flex justify-between">
                                      <span className="text-gray-500">Style</span>
                                      <span className="text-gray-900 font-medium">{item.style || 'N/A'}</span>
                                    </div> */}
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">Color</span>
                                      <span className="text-gray-900 font-medium">{item.color || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">Size</span>
                                      <span className="text-gray-900 font-medium">{item.size || 'N/A'}</span>
                                    </div>
                                    {/* <div className="flex justify-between">
                                      <span className="text-gray-500">Reason</span>
                                      <span className="text-gray-900 font-medium">{item.reason || 'N/A'}</span>
                                    </div> */}
                                    {/* <div className="flex justify-between">
                                      <span className="text-gray-500">Temperature</span>
                                      <span className="text-gray-900 font-medium">{item.temperature || 'N/A'}</span>
                                    </div> */}
                                    {/* <div className="flex justify-between">
                                      <span className="text-gray-500">Expiry</span>
                                      <span className="text-gray-900 font-medium">{item.expiry || 'N/A'}</span>
                                    </div> */}
                                    {/* <div className="flex justify-between">
                                      <span className="text-gray-500">Brand</span>
                                      <span className="text-gray-900 font-medium">{item.product_details?.brand || 'N/A'}</span>
                                    </div> */}
                                  </div>
                                </div>

                                {/* Column 2 - Pricing & Promotions */}
                                <div className="p-3 sm:p-4 border-t md:border-t-0 md:border-l border-gray-200">
                                  <div className="bg-gray-100 px-3 py-2 rounded-t-md mb-3">
                                    <h5 className="text-xs text-gray-600 uppercase tracking-wide font-semibold">Pricing & Promotions</h5>
                                  </div>
                                  <div className="space-y-3 text-sm">
                                    {/* Weight-based conditional display */}
                                    {(() => {
                                      const hasWeight = item.weight && item.weight > 0;
                                      return (
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                          {/* Row 1 */}
                                          <div className="flex justify-between">
                                            <span className="text-gray-500">Price</span>
                                            <span className="text-green-600 font-medium">{formatCurrency(item.unit_price)}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            {hasWeight ? (
                                              <>
                                                <span className="text-gray-500">Weight</span>
                                                <span className="text-gray-900 font-medium">{item.weight} kg</span>
                                              </>
                                            ) : (
                                              <>
                                                <span className="text-gray-500">Qty</span>
                                                <span className="text-gray-900 font-medium">{item.quantity}</span>
                                              </>
                                            )}
                                          </div>
                                          {/* Row 2 */}
                                          <div className="flex justify-between">
                                            {hasWeight ? (
                                              <>
                                                <span className="text-gray-500">Weight (Actual)</span>
                                                <span className="text-gray-900 font-medium">{item.actualWeight || item.weight} kg</span>
                                              </>
                                            ) : (
                                              <>
                                                <span className="text-gray-500">Total</span>
                                                <span className="text-green-600 font-medium">{formatCurrency(item.total_price)}</span>
                                              </>
                                            )}
                                          </div>
                                          <div className="flex justify-between">
                                            {hasWeight ? (
                                              <>
                                                <span className="text-gray-500">Total</span>
                                                <span className="text-green-600 font-medium">{formatCurrency(item.total_price)}</span>
                                              </>
                                            ) : (
                                              <span></span>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })()}

                                    {/* Promotions & Coupons Section */}
                                    <div className="pt-2 border-t border-gray-200">
                                      <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold mb-2">Promotions & Coupons</p>
                                      {/* Item-level Promotions */}
                                      {item.promotions && item.promotions.length > 0 && (
                                        <div className="space-y-2">
                                          {item.promotions.map((promo, idx) => (
                                            <div key={promo.promotionId || `promo-${item.product_sku}-${idx}`} className="bg-white p-2 rounded border border-gray-200 text-xs">
                                              <div className="flex justify-between">
                                                <span className="text-gray-500">Discount</span>
                                                <span className="text-red-600 font-medium">{formatCurrency(promo.discountAmount)}</span>
                                              </div>
                                              <div className="flex justify-between">
                                                <span className="text-gray-500">{promo.couponId ? 'Coupon ID' : 'Promo ID'}</span>
                                                <span className="text-gray-900 font-mono">{promo.couponId || promo.promotionId}</span>
                                              </div>
                                              <div className="flex justify-between">
                                                <span className="text-gray-500">{promo.couponName ? 'Coupon Name' : 'Type'}</span>
                                                <span className="text-gray-900">{promo.couponName || promo.promotionType}</span>
                                              </div>
                                              {promo.secretCode && !promo.couponId && (
                                                <div className="flex justify-between">
                                                  <span className="text-gray-500">Code</span>
                                                  <span className="text-gray-900 font-mono">{promo.secretCode}</span>
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                      {/* Empty state when no promotions */}
                                      {!(item.promotions && item.promotions.length > 0) && (
                                        <p className="text-gray-400 text-xs">No promotions or coupons applied</p>
                                      )}
                                    </div>

                                    <div className="flex justify-between pt-2">
                                      <span className="text-gray-500">Gift with Purchase</span>
                                      <span className="text-gray-900 font-medium">{item.giftWithPurchase ? 'Yes' : 'No'}</span>
                                    </div>
                                    {item.giftWithPurchase && (
                                      <div className="flex justify-between pt-2">
                                        <span className="text-gray-500">Gift with purchase item</span>
                                        <span className="text-gray-900 font-medium">{item.giftWithPurchase}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Column 3 - Shipping & Delivery */}
                                <div className="p-3 sm:p-4 border-t md:border-t-0 md:border-l border-gray-200">
                                  <div className="bg-gray-100 px-3 py-2 rounded-t-md mb-3">
                                    <h5 className="text-xs text-gray-600 uppercase tracking-wide font-semibold">Shipping & Delivery</h5>
                                  </div>
                                  <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">Shipping Method</span>
                                      <span className="text-gray-900 font-medium">{item.shippingMethod || 'Standard'}</span>
                                    </div>
                                    {/* <div className="flex justify-between items-center">
                                      <span className="text-gray-500">Fulfillment Status</span>
                                      {item.fulfillmentStatus && (
                                        <Badge className={`text-xs ${getFulfillmentBadgeClass(item.fulfillmentStatus)}`}>
                                          {item.fulfillmentStatus}
                                        </Badge>
                                      )}
                                    </div> */}
                                    {/* <div className="flex justify-between">
                                      <span className="text-gray-500">Bundle</span>
                                      <span className="text-gray-900 font-medium">{item.bundle ? 'Yes' : 'No'}</span>
                                    </div> */}
                                    {/* {item.bundleRef && (
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">Bundle Ref</span>
                                        <span className="text-gray-900 font-mono text-xs">{item.bundleRef}</span>
                                      </div>
                                    )} */}
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">Route</span>
                                      <span className="text-gray-900 font-medium">{item.route || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">Booking Slot From</span>
                                      <span className="text-gray-900 font-medium text-xs">
                                        {item.bookingSlotFrom ? formatGMT7DateTime(item.bookingSlotFrom) : 'N/A'}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">Booking Slot To</span>
                                      <span className="text-gray-900 font-medium text-xs">
                                        {item.bookingSlotFrom ? formatGMT7DateTime(item.bookingSlotTo) : 'N/A'}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500">ETA</span>
                                      <span className="text-gray-900 text-xs text-right">
                                        {item.eta ? `${item.eta.from.split(' ').slice(0, 3).join(' ')} - ${item.eta.to.split(' ').slice(0, 3).join(' ')}` : 'N/A'}
                                      </span>
                                    </div>

                                    {/* Price Breakdown Section */}
                                    {item.priceBreakdown && (
                                      <div className="pt-2 border-t border-gray-200">
                                        <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold mb-2">Price Breakdown</p>
                                        <div className="space-y-1 text-xs">
                                          <div className="flex justify-between">
                                            <span className="text-gray-500">Subtotal</span>
                                            <span className="text-gray-900">{formatCurrency(item.priceBreakdown.subtotal)}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-gray-500">Discount</span>
                                            <span className="text-red-600">-{formatCurrency(item.priceBreakdown.discount)}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-gray-500">Charges</span>
                                            <span className="text-gray-900">{formatCurrency(item.priceBreakdown.charges)}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-gray-500">Amount Excl. Tax</span>
                                            <span className="text-gray-900">{formatCurrency(item.priceBreakdown.amountExcludedTaxes)}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-gray-500">Taxes (7%)</span>
                                            <span className="text-gray-900">{formatCurrency(item.priceBreakdown.taxes)}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-gray-500">Amount Incl. Tax</span>
                                            <span className="text-gray-900">{formatCurrency(item.priceBreakdown.amountIncludedTaxes)}</span>
                                          </div>
                                          <div className="flex justify-between pt-1 border-t border-gray-300">
                                            <span className="text-gray-700 font-semibold">Total</span>
                                            <span className="text-green-600 font-semibold">{formatCurrency(item.priceBreakdown.total)}</span>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })()}
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <PackageOpen className="mx-auto h-16 w-16 text-gray-300" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No items found</h3>
                  <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                    {itemSearchTerm ? 'No items match your search. Try different keywords.' : 'This order has no items to display.'}
                  </p>
                  {itemSearchTerm && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => setItemSearchTerm('')}
                    >
                      Clear search
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          {order && <PaymentsTab order={order} />}
        </TabsContent>

        <TabsContent value="fulfillment" className="space-y-4">
          {/* Fulfillment Timeline */}
          <FulfillmentTimeline orderId={order?.id || ""} orderData={order} />
        </TabsContent>

        {/* <TabsContent value="delivery" className="space-y-4">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Truck className="h-5 w-5" />
                Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-4 sm:px-6">
              {false ? ( // No delivery info in API payload
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-enterprise-text-light">Carrier</p>
                      <p className="font-medium">{(order as any)?.delivery?.carrier || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-enterprise-text-light">Tracking Number</p>
                      <p className="font-mono text-sm">{(order as any)?.delivery?.trackingNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-enterprise-text-light">Vehicle Type</p>
                      <Badge variant="outline">{(order as any)?.delivery?.vehicleType || 'N/A'}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-enterprise-text-light">License Plate</p>
                      <p className="font-mono text-sm">{(order as any)?.delivery?.licensePlate || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-enterprise-text-light">Driver</p>
                      <p className="font-medium">{(order as any)?.delivery?.driverName || 'N/A'}</p>
                      <p className="text-sm text-enterprise-text-light">{(order as any)?.delivery?.driverPhone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-enterprise-text-light">Estimated Arrival</p>
                      <p className="text-sm">{(order as any)?.delivery?.estimatedArrival ? new Date((order as any).delivery.estimatedArrival).toLocaleString() : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-enterprise-text-light">Delivery Instructions</p>
                      <p className="text-sm italic">{(order as any)?.delivery?.deliveryInstructions || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Truck className="mx-auto h-12 w-12 text-gray-300" />
                  <p className="mt-4 text-sm text-muted-foreground">No delivery information available for this order.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent> */}

        <TabsContent value="tracking" className="space-y-4">
          <TrackingTab orderId={order?.id || ""} orderData={order} />
        </TabsContent>

        {/* <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Calendar className="h-5 w-5" />
                Order Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              {false ? ( // No timeline info in API payload
                <div className="space-y-4">
                  {(order as any)?.timeline?.map((event: any, index: any) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div className="flex-grow">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{event.description || 'N/A'}</p>
                          <p className="text-xs text-enterprise-text-light">
                            {event.timestamp ? new Date(event.timestamp).toLocaleString() : 'N/A'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {event.status || 'N/A'}
                          </Badge>
                          <span className="text-xs text-enterprise-text-light">by {event.actor || 'System'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-gray-300" />
                  <p className="mt-4 text-sm text-muted-foreground">No timeline events available for this order.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent> */}

        <TabsContent value="audit" className="space-y-4">
          <AuditTrailTab
            orderId={order?.id || ""}
            orderData={order}
          />
        </TabsContent>

        {/* <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <MessageSquare className="h-5 w-5" />
                Notes & Comments
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              {false ? ( // No notes info in API payload
                <div className="space-y-4">
                  {(order as any)?.notes?.map((note: any) => (
                    <div key={note.id} className="border-l-4 border-blue-200 pl-4 py-2">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {note.type || 'General'}
                          </Badge>
                          <span className="text-sm font-medium">{note.author || 'N/A'}</span>
                        </div>
                        <span className="text-xs text-enterprise-text-light">
                          {note.timestamp ? new Date(note.timestamp).toLocaleString() : 'N/A'}
                        </span>
                      </div>
                      <p className="text-sm">{note.message || 'No message content.'}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-300" />
                  <p className="mt-4 text-sm text-muted-foreground">No notes or comments for this order.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent> */}
      </Tabs>

      <CancelOrderDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        orderNo={order?.order_no || ''}
        onConfirm={handleCancelOrder}
        loading={isCancelling}
      />

      {/* Notes Panel - Slide-Out from Right */}
      <Sheet open={showNotesPanel} onOpenChange={setShowNotesPanel}>
        <SheetContent side="right" className="w-[600px] sm:max-w-[95vw] flex flex-col p-0">
          <SheetHeader className="px-6 py-4 border-b">
            <SheetTitle className="flex items-center gap-2">
              <StickyNote className="h-5 w-5" />
              Order Notes
            </SheetTitle>
          </SheetHeader>

          {/* Notes Table */}
          <div className="flex-1 overflow-auto px-6 py-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">No.</TableHead>
                  <TableHead>NOTE</TableHead>
                  <TableHead className="w-[180px]">CREATED BY</TableHead>
                  <TableHead className="w-[140px]">CREATED ON</TableHead>
                  <TableHead className="w-[40px]">+</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Add Form Row - ALWAYS AT TOP */}
                <TableRow className="bg-muted/30">
                  <TableCell className="text-center text-muted-foreground align-top">
                    {/* Empty - auto-numbered after save */}
                  </TableCell>
                  <TableCell className="align-top pt-3">
                    <Textarea
                      placeholder="Type your note here..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="min-h-[60px] resize-none text-sm"
                      maxLength={500}
                    />
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm align-top">
                    {/* Empty - auto-populated on save */}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm align-top">
                    {/* Empty - auto-populated on save */}
                  </TableCell>
                  <TableCell className="align-top pt-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setNewNote("")}
                      className="h-8 w-8"
                      title="Clear form"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>

                {/* Existing Notes */}
                {notes.map((note, index) => (
                  <TableRow key={note.id}>
                    <TableCell className="text-center text-sm font-medium align-top">
                      {index + 1}
                    </TableCell>
                    <TableCell className="align-top">
                      <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground align-top">
                      {note.createdBy}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground align-top">
                      {note.createdAt}
                    </TableCell>
                    <TableCell className="align-top">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteNote(note.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        title="Delete note"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

                {/* Empty State */}
                {notes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground text-sm">
                      No notes yet. Add your first note above.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Footer with CANCEL and SAVE buttons */}
          <div className="border-t px-6 py-4 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setNewNote("")}
            >
              CANCEL
            </Button>
            <Button
              onClick={handleSaveNote}
              disabled={!newNote.trim()}
            >
              SAVE
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div >
  );
}
