"use client"

import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  ChevronDown, // Added from the removed line
  PackageOpen, // Added from the removed line
  Search,
  Package,
  Truck,
  MapPin,
  User,
  CreditCard,
  Phone,
  Mail,
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
  Check
} from "lucide-react";
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Order, ApiCustomer, ApiShippingAddress, ApiPaymentInfo, ApiSLAInfo, ApiMetadata, ApiOrderItem } from "./order-management-hub" // Assuming Order and its sub-types are exported
import { ChannelBadge, PriorityBadge, PaymentStatusBadge, OrderStatusBadge, OnHoldBadge, ReturnStatusBadge, SLABadge } from "./order-badges";

interface OrderDetailViewProps {
  order: Order | null;
  onClose: () => void;
}


export function OrderDetailView({ order, onClose }: OrderDetailViewProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("overview")
  const [itemSearchTerm, setItemSearchTerm] = useState("")
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})
  const [copiedOrderId, setCopiedOrderId] = useState(false)

  const toggleItemExpansion = (sku: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [sku]: !prev[sku],
    }))
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onClose} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-enterprise-dark">Order Details</h1>
            <p className="text-sm text-enterprise-text-light">Order #{order?.order_no || 'N/A'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit Order
          </Button>
          <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
            <RefreshCw className="h-4 w-4 mr-2" />
            Process Order
          </Button>
          <Button variant="outline" size="sm" onClick={onClose} className="ml-2">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* SLA Alert */}
      {order?.sla_info?.status === "BREACH" && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-700">
            <strong>SLA Breach:</strong> This order has exceeded the {order.sla_info.target_minutes}-minute processing target
            by {order.sla_info.elapsed_minutes - order.sla_info.target_minutes} minutes.
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-enterprise-text-light">Status</p>
                <div className="mt-1"><OrderStatusBadge status={order?.status || 'N/A'} /></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-enterprise-text-light">Priority</p>
                <div className="mt-1"><PriorityBadge priority={order?.metadata?.priority || 'N/A'} /></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-enterprise-text-light">Channel</p>
                <div className="mt-1"><ChannelBadge channel={order?.channel || 'N/A'} /></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-enterprise-text-light">Total Amount</p>
                <p className="text-lg font-semibold mt-1">฿{order?.total_amount?.toFixed(2) || '0.00'}</p>
              </div>
              <DollarSign className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
        <TabsList className="bg-white border border-enterprise-border">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="items">Items ({order?.items.length})</TabsTrigger>
          <TabsTrigger value="fulfillment">Fulfillment</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-enterprise-text-light">Name</p>
                  <p className="font-medium">{order?.customer.name}</p>
                </div>
                <div>
                  <p className="text-sm text-enterprise-text-light">Customer ID</p>
                  <p className="font-mono text-sm">{order?.customer.id}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-enterprise-text-light" />
                    <span className="text-sm">{order?.customer?.email || 'N/A'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-enterprise-text-light" />
                    <span className="text-sm">{order?.customer?.phone || 'N/A'}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-enterprise-text-light">T1 Number</p>
                  <p className="font-mono text-sm">{order?.customer?.T1Number || 'N/A'}</p>
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
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-enterprise-text-light">Order Number (ID)</p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm">{order?.id}</p>
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
                <div>
                  <p className="text-sm text-enterprise-text-light">Short Order</p>
                  <p className="font-mono text-sm">{order?.order_no}</p>
                </div>
                <div>
                  <p className="text-sm text-enterprise-text-light">Business Unit</p>
                  <p className="font-medium">{order?.business_unit}</p>
                </div>
                <div>
                  <p className="text-sm text-enterprise-text-light">Store</p>
                  <p className="font-medium">{order?.metadata?.store_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-enterprise-text-light">Order Type</p>
                  <Badge variant="outline">{order?.order_type}</Badge>
                </div>
                <div>
                  <p className="text-sm text-enterprise-text-light">Order Date</p>
                  <p className="text-sm">{order?.order_date ? new Date(order.order_date).toLocaleString() : 'N/A'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-enterprise-text-light">Recipient</p>
                  <p className="font-medium">{order?.customer?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-enterprise-text-light">Phone</p>
                  <p className="text-sm">{order?.customer?.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-enterprise-text-light">Address</p>
                  <p className="text-sm">{order?.shipping_address?.street || 'N/A'}</p>
                  <p className="text-sm">{[order?.shipping_address?.city, order?.shipping_address?.state, order?.shipping_address?.postal_code].filter(Boolean).join(', ') || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-enterprise-text-light">Special Instructions</p>
                  <p className="text-sm italic">{'N/A' /* Field not in payload/type */}</p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-enterprise-text-light">Payment Method</p>
                  <Badge variant="outline">{order?.payment_info?.method || 'N/A'}</Badge>
                </div>
                <div>
                  <p className="text-sm text-enterprise-text-light">Payment Status</p>
                  <PaymentStatusBadge status={order?.payment_info?.status || 'N/A'} />
                </div>
                <div>
                  <p className="text-sm text-enterprise-text-light">Transaction ID</p>
                  <p className="font-mono text-sm">{order?.payment_info?.transaction_id || 'N/A'}</p>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>฿{order?.total_amount?.toFixed(2) || '0.00'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="items" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <CardTitle>Order Items</CardTitle>
                  <CardDescription>{order?.items?.length || 0} items in this order</CardDescription>
                </div>
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-dark-gray" />
                  <Input
                    type="search"
                    placeholder="Search items by name or SKU..."
                    className="pl-8 w-full border-medium-gray text-deep-navy"
                    value={itemSearchTerm}
                    onChange={(e) => setItemSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredItems.length > 0 ? (
                <div className="space-y-4">
                  {filteredItems.map((item: ApiOrderItem) => (
                    <Card key={item.product_sku} className="border border-gray-200 overflow-hidden">
                      {/* Item Header - Always visible */}
                      <div
                        className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                        onClick={() => toggleItemExpansion(item.product_sku)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-md overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                            {/* Placeholder for image - item.product_details.imageUrl might exist */}
                            <img
                              src="https://via.placeholder.com/48x48/f3f4f6/9ca3af?text=📦" 
                              alt={item.product_name || 'Item image'}
                              width={48}
                              height={48}
                              className="object-cover w-full h-full"
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-deep-navy">{item.product_name || 'N/A'}</p>
                            <p className="text-sm text-dark-gray">SKU: {item.product_sku || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="text-sm text-dark-gray">Qty: {item.quantity}</p>
                          <p className="text-sm font-medium text-deep-navy">
                            ฿{(item.total_price || 0).toFixed(2)}
                          </p>
                          <ChevronDown
                            className={`h-5 w-5 text-dark-gray transition-transform ${
                              expandedItems[item.product_sku] ? "rotate-180" : ""
                            }`}
                          />
                        </div>
                      </div>
                      {/* Collapsible Item Details */}
                      {expandedItems[item.product_sku] && (
                        <div className="p-4 border-t border-gray-200 bg-light-gray">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="font-medium text-medium-gray">Product ID</p>
                              <p className="text-deep-navy">{item.product_id}</p>
                            </div>
                            <div>
                              <p className="font-medium text-medium-gray">Unit Price</p>
                              <p className="text-deep-navy">฿{(item.unit_price || 0).toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="font-medium text-medium-gray">Description</p>
                              <p className="text-deep-navy">{item.product_details?.description || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="font-medium text-medium-gray">Category</p>
                              <p className="text-deep-navy">{item.product_details?.category || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="font-medium text-medium-gray">Brand</p>
                              <p className="text-deep-navy">{item.product_details?.brand || 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <PackageOpen className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No items found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {itemSearchTerm ? 'Try adjusting your search term.' : 'This order has no items.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fulfillment" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Fulfillment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-enterprise-text-light">Fulfillment Method</p>
                  <Badge variant="outline">{'N/A' /* No fulfillment_info in payload */}</Badge>
                </div>
                <div>
                  <p className="text-sm text-enterprise-text-light">Assigned Picker</p>
                  <p className="font-medium">{'N/A' /* No fulfillment_info in payload */}</p>
                  <p className="text-sm text-enterprise-text-light">{'N/A' /* No fulfillment_info in payload */}</p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-enterprise-text-light">Picking Started</p>
                    <p className="text-sm">{'N/A' /* No fulfillment_info in payload */}</p>
                  </div>
                  <div>
                    <p className="text-sm text-enterprise-text-light">Picking Completed</p>
                    <p className="text-sm">{'N/A' /* No fulfillment_info in payload */}</p>
                  </div>
                  <div>
                    <p className="text-sm text-enterprise-text-light">Packing Started</p>
                    <p className="text-sm">{'N/A' /* No fulfillment_info in payload */}</p>
                  </div>
                  <div>
                    <p className="text-sm text-enterprise-text-light">Packing Status</p>
                    <Badge variant="outline">{'N/A' /* No fulfillment_info in payload */}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SLA Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-enterprise-text-light">Target Processing Time</p>
                  <p className="text-lg font-semibold">{order?.sla_info?.target_minutes || 'N/A'} minutes</p>
                </div>
                <div>
                  <p className="text-sm text-enterprise-text-light">Elapsed Time</p>
                  <p className="text-lg font-semibold text-red-500">{order?.sla_info?.elapsed_minutes || 'N/A'} minutes</p>
                </div>
                <div>
                  <p className="text-sm text-enterprise-text-light">SLA Status</p>
                  <SLABadge
                    targetMinutes={order?.sla_info?.target_minutes || 0}
                    elapsedMinutes={order?.sla_info?.elapsed_minutes || 0}
                    status={order?.status || 'N/A'}
                  />
                </div>
                <div>
                  <p className="text-sm text-enterprise-text-light">Escalation Level</p>
                  <Badge variant="outline">{'N/A' /* No escalation_level in sla_info */}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="delivery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {false ? ( // No delivery info in API payload
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-enterprise-text-light">Carrier</p>
                      <p className="font-medium">{order.delivery.carrier || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-enterprise-text-light">Tracking Number</p>
                      <p className="font-mono text-sm">{order.delivery.trackingNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-enterprise-text-light">Vehicle Type</p>
                      <Badge variant="outline">{order.delivery.vehicleType || 'N/A'}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-enterprise-text-light">License Plate</p>
                      <p className="font-mono text-sm">{order.delivery.licensePlate || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-enterprise-text-light">Driver</p>
                      <p className="font-medium">{order.delivery.driverName || 'N/A'}</p>
                      <p className="text-sm text-enterprise-text-light">{order.delivery.driverPhone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-enterprise-text-light">Estimated Arrival</p>
                      <p className="text-sm">{order.delivery.estimatedArrival ? new Date(order.delivery.estimatedArrival).toLocaleString() : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-enterprise-text-light">Delivery Instructions</p>
                      <p className="text-sm italic">{order.delivery.deliveryInstructions || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No delivery information available.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Order Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              {false ? ( // No timeline info in API payload
                <div className="space-y-4">
                  {order.timeline.map((event: any, index: any) => (
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
                <p className="text-sm text-muted-foreground">No timeline events available for this order.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Notes & Comments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {false ? ( // No notes info in API payload
                <div className="space-y-4">
                  {order.notes.map((note: any) => (
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
                <p className="text-sm text-muted-foreground">No notes or comments for this order.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
