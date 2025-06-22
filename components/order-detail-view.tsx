"use client"

import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
import { Order, ApiCustomer, ApiSLAInfo } from "./order-management-hub" // Assuming Order and its sub-types are exported
import { ChannelBadge, PriorityBadge, PaymentStatusBadge, OrderStatusBadge, OnHoldBadge, ReturnStatusBadge, SLABadge } from "./order-badges";
import { formatElapsedTime } from "@/lib/sla-utils";
import { formatCurrencyInt } from "@/lib/currency-utils";

interface OrderDetailViewProps {
  order: Order | null;
  onClose: () => void;
  open?: boolean;
}


export function OrderDetailView({ order, onClose, open = true }: OrderDetailViewProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("overview")
  const [itemSearchTerm, setItemSearchTerm] = useState("")
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})
  const [copiedOrderId, setCopiedOrderId] = useState(false)

  // Debug logging
  console.log('📄 OrderDetailView received order:', {
    id: order?.id,
    total: order?.total,
    total_amount: order?.total_amount,
    hasOrder: !!order,
    orderKeys: order ? Object.keys(order) : []
  })

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
    ? order.items.filter((item: any) => {
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
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Details - #{order?.order_no || 'N/A'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 sm:space-y-6">
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="grid grid-cols-2 sm:flex gap-2 sm:gap-3 flex-1">
          <Button variant="outline"  className="justify-center">
            <Download className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Export</span>
            <span className="sm:hidden text-xs">Export</span>
          </Button>
          <Button variant="outline"  className="justify-center">
            <Edit className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Edit Order</span>
            <span className="sm:hidden text-xs">Edit</span>
          </Button>
          <Button  className="bg-blue-500 hover:bg-blue-600 justify-center col-span-2 sm:col-span-1">
            <RefreshCw className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Process Order</span>
            <span className="sm:hidden text-xs">Process</span>
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
                <p className="text-base sm:text-lg font-semibold mt-1 truncate">{formatCurrencyInt(order?.total)}</p>
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
                  <p className="font-medium">{order?.customer?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-enterprise-text-light">Customer ID</p>
                  <p className="font-mono text-sm">{order?.customer?.id}</p>
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
                  <p className="text-sm">{(order as any)?.shipping_address?.street || 'N/A'}</p>
                  <p className="text-sm">
                    {(order as any)?.shipping_address?.city && (order as any)?.shipping_address?.state 
                      ? `${(order as any).shipping_address.city}, ${(order as any).shipping_address.state} ${(order as any).shipping_address?.postal_code || ''}`
                      : 'N/A'}
                  </p>
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
                  <Badge variant="outline">{(order as any)?.payment_info?.method || 'Cash'}</Badge>
                </div>
                <div>
                  <p className="text-sm text-enterprise-text-light">Payment Status</p>
                  <PaymentStatusBadge status={(order as any)?.payment_info?.status || 'PAID'} />
                </div>
                <div>
                  <p className="text-sm text-enterprise-text-light">Transaction ID</p>
                  <p className="font-mono text-sm">{(order as any)?.payment_info?.transaction_id || 'N/A'}</p>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatCurrencyInt(order?.total)}</span>
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
                  {filteredItems.map((item: any) => (
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
                                  <p className="text-sm font-medium">{formatCurrencyInt(item.unit_price)}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-500">Total</p>
                                <p className="text-base font-semibold text-green-600">
                                  {formatCurrencyInt(item.total_price)}
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
                  <p className="text-lg font-semibold">{order?.sla_info?.target_minutes ? Math.round(order.sla_info.target_minutes / 60) : 'N/A'} minutes</p>
                </div>
                <div>
                  <p className="text-sm text-enterprise-text-light">Elapsed Time</p>
                  <p className="text-lg font-semibold text-red-500">{order?.sla_info?.elapsed_minutes ? formatElapsedTime(order.sla_info.elapsed_minutes) : 'N/A'}</p>
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
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Truck className="h-5 w-5" />
                ข้อมูลการจัดส่ง
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-4 sm:px-6">
              {true ? ( // Show sample delivery info
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-enterprise-text-light">บริษัทจัดส่ง</p>
                      <p className="font-medium">Grab Express</p>
                    </div>
                    <div>
                      <p className="text-sm text-enterprise-text-light">หมายเลขติดตาม</p>
                      <p className="font-mono text-sm">GRAB{order?.id?.slice(-6) || '123456'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-enterprise-text-light">ประเภทยานพาหนะ</p>
                      <Badge variant="outline">รถจักรยานยนต์</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-enterprise-text-light">ทะเบียนรถ</p>
                      <p className="font-mono text-sm">กบ {Math.floor(Math.random() * 9000) + 1000}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-enterprise-text-light">ไรเดอร์</p>
                      <p className="font-medium">คุณ{['สมชาย', 'นันท์', 'วิชัย', 'สมศักดิ์', 'พิชัย'][Math.floor(Math.random() * 5)]} (ไรเดอร์ Grab)</p>
                      <p className="text-sm text-enterprise-text-light">+66 {Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-enterprise-text-light">เวลาถึงคาดการณ์</p>
                      <p className="text-sm">{(() => {
                        const eta = new Date()
                        eta.setMinutes(eta.getMinutes() + Math.floor(Math.random() * 30) + 15)
                        return eta.toLocaleString('th-TH')
                      })()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-enterprise-text-light">คำแนะนำการจัดส่ง</p>
                      <p className="text-sm italic">กรุณาโทรหาก่อนส่งของ / ฝากหน้าประตู</p>
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
                ไทม์ไลน์คำสั่งซื้อ
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              {true ? ( // Show sample timeline data
                <div className="space-y-4">
                  {(() => {
                    // Generate sample timeline events in Thai
                    const events = [
                      {
                        description: "ได้รับคำสั่งซื้อจากลูกค้า",
                        status: "สำเร็จ",
                        actor: "ระบบ Grab",
                        timestamp: order?.order_date ? new Date(order.order_date) : new Date(),
                        color: "bg-green-500"
                      },
                      {
                        description: "ยืนยันการชำระเงิน",
                        status: "สำเร็จ", 
                        actor: "ระบบการเงิน",
                        timestamp: order?.order_date ? new Date(new Date(order.order_date).getTime() + 2 * 60000) : new Date(Date.now() + 2 * 60000),
                        color: "bg-green-500"
                      },
                      {
                        description: "ร้านค้ารับคำสั่งซื้อ",
                        status: "สำเร็จ",
                        actor: order?.metadata?.store_name || "ร้านค้า",
                        timestamp: order?.order_date ? new Date(new Date(order.order_date).getTime() + 5 * 60000) : new Date(Date.now() + 5 * 60000),
                        color: "bg-green-500"
                      },
                      {
                        description: "เริ่มเตรียมอาหาร/สินค้า",
                        status: "กำลังดำเนินการ",
                        actor: order?.metadata?.store_name || "ร้านค้า",
                        timestamp: order?.order_date ? new Date(new Date(order.order_date).getTime() + 8 * 60000) : new Date(Date.now() + 8 * 60000),
                        color: "bg-orange-500"
                      },
                      {
                        description: "อาหาร/สินค้าพร้อมส่ง",
                        status: "รอไรเดอร์",
                        actor: order?.metadata?.store_name || "ร้านค้า", 
                        timestamp: order?.order_date ? new Date(new Date(order.order_date).getTime() + 15 * 60000) : new Date(Date.now() + 15 * 60000),
                        color: "bg-yellow-500"
                      },
                      {
                        description: "ไรเดอร์รับสินค้าจากร้าน",
                        status: "กำลังจัดส่ง",
                        actor: "คุณสมชาย (ไรเดอร์ Grab)",
                        timestamp: order?.order_date ? new Date(new Date(order.order_date).getTime() + 18 * 60000) : new Date(Date.now() + 18 * 60000),
                        color: "bg-blue-500"
                      },
                      {
                        description: "อยู่ระหว่างการจัดส่ง",
                        status: "กำลังจัดส่ง",
                        actor: "คุณสมชาย (ไรเดอร์ Grab)",
                        timestamp: order?.order_date ? new Date(new Date(order.order_date).getTime() + 25 * 60000) : new Date(Date.now() + 25 * 60000),
                        color: "bg-blue-500"
                      }
                    ]
                    
                    return events.map((event, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className={`flex-shrink-0 w-3 h-3 ${event.color} rounded-full mt-2 ring-2 ring-white shadow-md`}></div>
                        <div className="flex-grow">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-gray-900">{event.description}</p>
                            <p className="text-xs text-enterprise-text-light">
                              {event.timestamp.toLocaleString('th-TH')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {event.status}
                            </Badge>
                            <span className="text-xs text-enterprise-text-light">โดย {event.actor}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  })()}
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
      </DialogContent>
    </Dialog>
  );
}
