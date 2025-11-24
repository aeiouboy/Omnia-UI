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
  order?: Order | null;
  onClose?: () => void;
  orderId?: string;
}


export function OrderDetailView({ order, onClose, orderId }: OrderDetailViewProps) {
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
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={onClose} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Orders</span>
              <span className="sm:hidden">Back</span>
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-enterprise-dark truncate">Order Details</h1>
              <p className="text-xs sm:text-sm text-enterprise-text-light">Order #{order?.order_no || 'N/A'}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onClose} className="sm:hidden">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Action Buttons - Mobile First Design */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="space-y-2">
              <p className="text-xs sm:text-sm text-enterprise-text-light">Status</p>
              <div><OrderStatusBadge status={order?.status || 'N/A'} /></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="space-y-2">
              <p className="text-xs sm:text-sm text-enterprise-text-light">Priority</p>
              <div><PriorityBadge priority={order?.metadata?.priority || 'N/A'} /></div>
            </div>
          </CardContent>
        </Card>

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
                <p className="text-base sm:text-lg font-semibold mt-1 truncate">฿{order?.total_amount?.toFixed(2) || '0.00'}</p>
              </div>
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
        <TabsList className="bg-white border border-enterprise-border grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 h-auto p-1">
          <TabsTrigger value="overview" className="text-xs sm:text-sm px-2 py-2 whitespace-nowrap">Overview</TabsTrigger>
          <TabsTrigger value="items" className="text-xs sm:text-sm px-2 py-2 whitespace-nowrap">Items ({order?.items?.length || 0})</TabsTrigger>
          <TabsTrigger value="fulfillment" className="text-xs sm:text-sm px-2 py-2 whitespace-nowrap">Fulfillment</TabsTrigger>
          <TabsTrigger value="delivery" className="text-xs sm:text-sm px-2 py-2 whitespace-nowrap">Delivery</TabsTrigger>
          <TabsTrigger value="timeline" className="text-xs sm:text-sm px-2 py-2 whitespace-nowrap">Timeline</TabsTrigger>
          <TabsTrigger value="notes" className="text-xs sm:text-sm px-2 py-2 whitespace-nowrap">Notes</TabsTrigger>
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
            <CardHeader className="pb-4">
              <div className="flex flex-col space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="text-lg sm:text-xl">Order Items</CardTitle>
                    <CardDescription className="text-sm">{order?.items?.length || 0} items in this order</CardDescription>
                  </div>
                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="search"
                      placeholder="Search items..."
                      className="pl-10 h-10 text-sm w-full"
                      value={itemSearchTerm}
                      onChange={(e) => setItemSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              {filteredItems.length > 0 ? (
                <div className="space-y-3">
                  {filteredItems.map((item: ApiOrderItem) => (
                    <Card key={item.product_sku} className="border border-gray-200 overflow-hidden hover:shadow-sm transition-shadow">
                      {/* Mobile-optimized Item Header */}
                      <div
                        className="p-3 sm:p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => toggleItemExpansion(item.product_sku)}
                      >
                        <div className="flex gap-3">
                          {/* Product Image */}
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
                                <h4 className="font-medium text-sm sm:text-base text-gray-900 leading-tight" style={{
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden'
                                }}>
                                  {item.product_name || 'N/A'}
                                </h4>
                                <p className="text-xs sm:text-sm text-gray-500 mt-1 font-mono">
                                  SKU: {item.product_sku || 'N/A'}
                                </p>
                              </div>
                              <ChevronDown
                                className={`h-5 w-5 text-gray-400 transition-transform flex-shrink-0 mt-1 ${
                                  expandedItems[item.product_sku] ? "rotate-180" : ""
                                }`}
                              />
                            </div>
                            
                            {/* Price and Quantity */}
                            <div className="flex justify-between items-center mt-3">
                              <div className="flex items-center gap-4">
                                <div className="text-center">
                                  <p className="text-xs text-gray-500">Qty</p>
                                  <p className="text-sm font-medium">{item.quantity}</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-xs text-gray-500">Unit Price</p>
                                  <p className="text-sm font-medium">฿{(item.unit_price || 0).toFixed(2)}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-500">Total</p>
                                <p className="text-base font-semibold text-green-600">
                                  ฿{(item.total_price || 0).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Collapsible Item Details */}
                      {expandedItems[item.product_sku] && (
                        <div className="px-3 pb-3 sm:px-4 sm:pb-4 border-t border-gray-100 bg-gray-50">
                          <div className="pt-3 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                              <div className="space-y-2">
                                <div>
                                  <p className="font-medium text-gray-600 text-xs uppercase tracking-wide">Product ID</p>
                                  <p className="text-gray-900 font-mono text-sm">{item.product_id}</p>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-600 text-xs uppercase tracking-wide">Category</p>
                                  <p className="text-gray-900">{item.product_details?.category || 'N/A'}</p>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div>
                                  <p className="font-medium text-gray-600 text-xs uppercase tracking-wide">Brand</p>
                                  <p className="text-gray-900">{item.product_details?.brand || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-600 text-xs uppercase tracking-wide">Description</p>
                                  <p className="text-gray-900 text-sm leading-relaxed">
                                    {item.product_details?.description || 'No description available'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </Card>
                  ))}
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

        <TabsContent value="fulfillment" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl">Fulfillment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 px-4 sm:px-6">
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
              <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl">SLA Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 px-4 sm:px-6">
                <div>
                  <p className="text-sm text-enterprise-text-light">Target Processing Time</p>
                  <p className="text-lg font-semibold">
                    {order?.sla_info?.target_minutes 
                      ? `${Math.floor(order.sla_info.target_minutes / 60)} minutes`
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-enterprise-text-light">Elapsed Time</p>
                  <p className="text-lg font-semibold text-red-500">
                    {order?.sla_info?.elapsed_minutes 
                      ? `${Math.floor(order.sla_info.elapsed_minutes / 60)} minutes`
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-enterprise-text-light">SLA Status</p>
                  <SLABadge
                    targetMinutes={order?.sla_info?.target_minutes || 0}
                    elapsedMinutes={order?.sla_info?.elapsed_minutes || 0}
                    status={order?.status || 'N/A'}
                    slaStatus={order?.sla_info?.status}
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
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
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
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
