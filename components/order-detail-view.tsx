"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
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
  Search,
  ShoppingBag,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"

interface OrderDetailViewProps {
  orderId: string
}

// Mock data - in real app this would come from API
const getOrderDetails = (orderId: string) => {
  return {
    id: orderId,
    orderNo: "CG-TOPS-2025052301-A847F2",
    status: "DELIVERED", // Changed from "PROCESSING" to "DELIVERED"
    priority: "HIGH",
    orderType: "SAME_DAY",
    channel: "GRAB",
    businessUnit: "TOPS",
    storeName: "Tops Central World",
    storeCode: "TOPS-CW-001",

    // Customer Information
    customer: {
      name: "John Smith",
      email: "john.smith@email.com",
      phone: "+66 89 123 4567",
      customerId: "CUST-789456",
      membershipLevel: "GOLD", // This can be "GOLD", "SILVER", or "REGULAR"
    },

    // Order Details
    orderDate: "2025-05-23T10:23:00Z",
    requestedDeliveryDate: "2025-05-23T15:00:00Z",
    estimatedDeliveryTime: "2025-05-23T14:30:00Z",

    // Billing & Payment
    billing: {
      method: "COD",
      subtotal: 385.0,
      tax: 26.95,
      deliveryFee: 35.0,
      discount: 0.0,
      total: 450.0,
      currency: "THB",
    },

    // Delivery Address
    deliveryAddress: {
      name: "John Smith",
      phone: "+66 89 123 4567",
      address: "123/45 Sukhumvit Road, Klongtoey",
      district: "Klongtoey",
      province: "Bangkok",
      postalCode: "10110",
      coordinates: "13.7563, 100.5018",
      instructions: "Please call before delivery. Building entrance on Sukhumvit side.",
    },

    // Items
    items: [
      {
        sku: "TOPS-FRESH-001",
        name: "ผักโขมอินทรีย์ 250กรัม - เกรดพรีเมี่ยม",
        quantity: 2,
        unitPrice: 85.0,
        totalPrice: 170.0,
        category: "FRESH_PRODUCE",
        weight: "0.5kg",
        temperature: "2-4°C",
        expiryDate: "2025-05-25",
        barcode: "8851234567890",
        location: "A-12-03",
        status: "PICKED",
        style: "",
        color: "",
        size: "",
        promotions: "",
        promotionId: "",
        promotionType: "",
        giftWithPurchase: false,
        giftWrapped: false,
        eta: "2025-05-25",
      },
      {
        sku: "TOPS-DAIRY-001",
        name: "นมสดออร์แกนิค 1ลิตร",
        quantity: 1,
        unitPrice: 125.0,
        totalPrice: 125.0,
        category: "DAIRY",
        weight: "1.0kg",
        temperature: "0-4°C",
        expiryDate: "2025-05-30",
        barcode: "8851234567891",
        location: "B-05-12",
        status: "PICKED",
        style: "",
        color: "",
        size: "",
        promotions: "",
        promotionId: "",
        promotionType: "",
        giftWithPurchase: false,
        giftWrapped: false,
        eta: "2025-05-25",
      },
      {
        sku: "TOPS-BAKERY-001",
        name: "ขนมปังโฮลวีท",
        quantity: 1,
        unitPrice: 90.0,
        totalPrice: 90.0,
        category: "BAKERY",
        weight: "0.4kg",
        temperature: "Room Temp",
        expiryDate: "2025-05-26",
        barcode: "8851234567892",
        location: "C-08-15",
        status: "PICKED",
        style: "",
        color: "",
        size: "",
        promotions: "",
        promotionId: "",
        promotionType: "",
        giftWithPurchase: false,
        giftWrapped: false,
        eta: "2025-05-25",
      },
    ],

    // SLA Information
    sla: {
      targetMinutes: 5,
      elapsedMinutes: 7,
      status: "COMPLIANT", // เปลี่ยนจาก "COMPLETED" เป็น "COMPLIANT"
      breachReason: "", // เอา breach reason ออกเพราะ status เป็น COMPLIANT แล้ว
      escalationLevel: 0,
    },

    // Fulfillment Information
    fulfillment: {
      method: "STORE_PICKUP",
      assignedPicker: "สมชาย ใจดี",
      pickerPhone: "+66 89 555 1234",
      pickingStartTime: "2025-05-23T10:25:00Z",
      pickingCompletedTime: "2025-05-23T10:28:00Z",
      packingStartTime: "2025-05-23T10:28:00Z",
      packingCompletedTime: "2025-05-23T10:35:00Z",
      readyForPickupTime: "2025-05-23T10:35:00Z",
    },

    // Delivery Information
    delivery: {
      carrier: "Grab Express",
      trackingNumber: "GE-2025052301-789",
      driverName: "สมศักดิ์ รวดเร็ว",
      driverPhone: "+66 89 777 8888",
      vehicleType: "MOTORCYCLE",
      licensePlate: "กข-1234",
      estimatedArrival: "2025-05-23T14:30:00Z",
      deliveryInstructions: "Call customer 5 minutes before arrival",
    },

    // Order Timeline
    timeline: [
      {
        timestamp: "2025-05-23T10:23:00Z",
        status: "ORDER_CREATED",
        description: "Order received from Grab platform",
        actor: "SYSTEM",
      },
      {
        timestamp: "2025-05-23T10:24:00Z",
        status: "PAYMENT_CONFIRMED",
        description: "COD payment method confirmed",
        actor: "SYSTEM",
      },
      {
        timestamp: "2025-05-23T10:25:00Z",
        status: "ASSIGNED_TO_STORE",
        description: "Order assigned to Tops Central World",
        actor: "AUTO_ASSIGNMENT",
      },
      {
        timestamp: "2025-05-23T10:25:00Z",
        status: "PICKING_STARTED",
        description: "Picking started by สมชาย ใจดี",
        actor: "สมชาย ใจดี",
      },
      {
        timestamp: "2025-05-23T10:28:00Z",
        status: "PICKING_COMPLETED",
        description: "All items picked successfully",
        actor: "สมชาย ใจดี",
      },
      {
        timestamp: "2025-05-23T10:28:00Z",
        status: "PACKING_STARTED",
        description: "Order packing in progress",
        actor: "สมชาย ใจดี",
      },
      {
        timestamp: "2025-05-23T10:35:00Z",
        status: "PACKING_COMPLETED",
        description: "Order packed and ready for delivery",
        actor: "สมชาย ใจดี",
      },
      {
        timestamp: "2025-05-23T10:40:00Z",
        status: "SHIPPED",
        description: "Order picked up by Grab Express",
        actor: "SYSTEM",
      },
      {
        timestamp: "2025-05-23T11:15:00Z",
        status: "DELIVERED",
        description: "Order delivered to customer",
        actor: "สมศักดิ์ รวดเร็ว",
      },
    ],

    // Notes & Comments
    notes: [
      {
        id: 1,
        timestamp: "2025-05-23T10:26:00Z",
        author: "สมชาย ใจดี",
        type: "PICKER_NOTE",
        message: "ผักโขมมีคุณภาพดี เลือกใบที่สดที่สุดให้ลูกค้า",
      },
      {
        id: 2,
        timestamp: "2025-05-23T10:27:00Z",
        author: "SYSTEM",
        type: "SLA_WARNING",
        message: "Order approaching SLA threshold - 4 minutes elapsed",
      },
    ],
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "CREATED":
      return <ShoppingBag className="h-4 w-4 text-dark-gray" />
    case "PROCESSING":
      return <Package className="h-4 w-4 text-info" />
    case "SHIPPED":
      return <Truck className="h-4 w-4 text-corporate-blue" />
    case "DELIVERED":
      return <CheckCircle className="h-4 w-4 text-success" />
    default:
      return <Package className="h-4 w-4 text-gray-500" />
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "CREATED":
      return <Badge variant="outline">CREATED</Badge>
    case "PROCESSING":
      return <Badge className="bg-info text-white">PROCESSING</Badge>
    case "SHIPPED":
      return <Badge className="bg-corporate-blue text-white">SHIPPED</Badge>
    case "DELIVERED":
      return <Badge className="bg-success text-white">DELIVERED</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

function getPriorityBadge(priority: string) {
  switch (priority) {
    case "HIGH":
      return <Badge className="bg-red-500">High Priority</Badge>
    case "MEDIUM":
      return <Badge className="bg-yellow-500">Medium Priority</Badge>
    case "LOW":
      return <Badge variant="outline">Low Priority</Badge>
    default:
      return <Badge variant="outline">{priority}</Badge>
  }
}

function getChannelBadge(channel: string) {
  switch (channel) {
    case "GRAB":
      return <Badge className="bg-green-500">Grab</Badge>
    case "LAZADA":
      return <Badge className="bg-blue-500">Lazada</Badge>
    case "SHOPEE":
      return <Badge className="bg-orange-500">Shopee</Badge>
    default:
      return <Badge variant="outline">{channel}</Badge>
  }
}

export function OrderDetailView({ orderId }: OrderDetailViewProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [itemSearchTerm, setItemSearchTerm] = useState("")
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})

  const order = getOrderDetails(orderId)

  const filteredItems = order.items.filter(
    (item) =>
      item.name.toLowerCase().includes(itemSearchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(itemSearchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(itemSearchTerm.toLowerCase()),
  )

  const toggleItemExpansion = (sku: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [sku]: !prev[sku],
    }))
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-enterprise-dark">Order Details</h1>
            <p className="text-sm text-enterprise-text-light">Order #{order.orderNo}</p>
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
        </div>
      </div>

      {/* SLA Alert */}
      {order.sla.status === "BREACH" && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-700">
            <strong>SLA Breach:</strong> This order has exceeded the {order.sla.targetMinutes}-minute processing target
            by {order.sla.elapsedMinutes - order.sla.targetMinutes} minutes. Reason: {order.sla.breachReason}
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
                <div className="flex items-center">
                  {getStatusIcon(order.status)}
                  <span className="ml-2 text-body text-deep-navy">{order.status}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-enterprise-text-light">Priority</p>
                <div className="mt-1">{getPriorityBadge(order.priority)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-enterprise-text-light">Channel</p>
                <div className="mt-1">{getChannelBadge(order.channel)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-enterprise-text-light">Total Amount</p>
                <p className="text-lg font-semibold mt-1">฿{order.billing.total.toFixed(2)}</p>
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
          <TabsTrigger value="items">Items ({order.items.length})</TabsTrigger>
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
                  <p className="font-medium">{order.customer.name}</p>
                </div>
                <div>
                  <p className="text-sm text-enterprise-text-light">Customer ID</p>
                  <p className="font-mono text-sm">{order.customer.customerId}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-enterprise-text-light" />
                    <span className="text-sm">{order.customer.email}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-enterprise-text-light" />
                    <span className="text-sm">{order.customer.phone}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-enterprise-text-light">Membership</p>
                  {order.customer.membershipLevel === "GOLD" ? (
                    <Badge className="bg-amber-500 text-white">The 1 Exclusive</Badge>
                  ) : order.customer.membershipLevel === "SILVER" ? (
                    <Badge className="bg-slate-500 text-white">The 1 Plus</Badge>
                  ) : (
                    <Badge className="bg-blue-500 text-white">The 1</Badge>
                  )}
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
                  <p className="text-sm text-enterprise-text-light">Order Number</p>
                  <p className="font-mono text-sm">{order.orderNo}</p>
                </div>
                <div>
                  <p className="text-sm text-enterprise-text-light">Business Unit</p>
                  <p className="font-medium">{order.businessUnit}</p>
                </div>
                <div>
                  <p className="text-sm text-enterprise-text-light">Store</p>
                  <p className="font-medium">{order.storeName}</p>
                  <p className="text-xs text-enterprise-text-light">{order.storeCode}</p>
                </div>
                <div>
                  <p className="text-sm text-enterprise-text-light">Order Type</p>
                  <Badge variant="outline">{order.orderType}</Badge>
                </div>
                <div>
                  <p className="text-sm text-enterprise-text-light">Order Date</p>
                  <p className="text-sm">{new Date(order.orderDate).toLocaleString()}</p>
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
                  <p className="font-medium">{order.deliveryAddress.name}</p>
                </div>
                <div>
                  <p className="text-sm text-enterprise-text-light">Phone</p>
                  <p className="text-sm">{order.deliveryAddress.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-enterprise-text-light">Address</p>
                  <p className="text-sm">{order.deliveryAddress.address}</p>
                  <p className="text-sm">
                    {order.deliveryAddress.district}, {order.deliveryAddress.province}{" "}
                    {order.deliveryAddress.postalCode}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-enterprise-text-light">Special Instructions</p>
                  <p className="text-sm italic">{order.deliveryAddress.instructions}</p>
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
                  <Badge variant="outline">{order.billing.method}</Badge>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Subtotal</span>
                    <span className="text-sm">฿{order.billing.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Tax</span>
                    <span className="text-sm">฿{order.billing.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Delivery Fee</span>
                    <span className="text-sm">฿{order.billing.deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Discount</span>
                    <span className="text-sm">-฿{order.billing.discount.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>฿{order.billing.total.toFixed(2)}</span>
                  </div>
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
                  <CardDescription>{order.items.length} items in this order</CardDescription>
                </div>
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-dark-gray" />
                  <Input
                    type="search"
                    placeholder="Search items..."
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
                  {filteredItems.map((item) => (
                    <Card key={item.sku} className="border border-gray-200 overflow-hidden">
                      {/* Item Header - Always visible */}
                      <div
                        className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                        onClick={() => toggleItemExpansion(item.sku)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-md overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                            <img
                              src={
                                item.sku === "TOPS-FRESH-001"
                                  ? `/placeholder.svg?height=48&width=48&query=organic spinach vegetables fresh green leafy`
                                  : item.sku === "TOPS-DAIRY-001"
                                    ? `/placeholder.svg?height=48&width=48&query=organic milk bottle dairy fresh`
                                    : item.sku === "TOPS-BAKERY-001"
                                      ? `/placeholder.svg?height=48&width=48&query=whole wheat bread loaf bakery`
                                      : `/placeholder.svg?height=48&width=48&query=${encodeURIComponent(item.category.toLowerCase())}`
                              }
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="font-medium text-sm">{item.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-xs text-gray-500">SKU: {item.sku}</p>
                              <Badge className="bg-green-500 text-xs">{item.status}</Badge>
                              <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                              <p className="text-xs font-medium">฿{item.totalPrice.toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {item.category}
                          </Badge>
                          {expandedItems[item.sku] ? (
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-chevron-up"
                              >
                                <path d="m18 15-6-6-6 6" />
                              </svg>
                              <span className="sr-only">Collapse</span>
                            </Button>
                          ) : (
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-chevron-down"
                              >
                                <path d="m6 9 6 6 6-6" />
                              </svg>
                              <span className="sr-only">Expand</span>
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Expanded Content */}
                      {expandedItems[item.sku] && (
                        <div className="border-t border-gray-200">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Product Basic Info */}
                            <div className="p-4 border-b md:border-b-0 md:border-r border-gray-200">
                              <h4 className="font-medium text-sm mb-3">Product Details</h4>
                              <div className="mt-4 grid grid-cols-2 gap-2">
                                <div>
                                  <p className="text-xs text-gray-500 font-medium">Style:</p>
                                  <p className="text-xs">{item.style || "-"}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 font-medium">Color:</p>
                                  <p className="text-xs">{item.color || "-"}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 font-medium">Size:</p>
                                  <p className="text-xs">{item.size || "-"}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 font-medium">Weight:</p>
                                  <p className="text-xs">{item.weight}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 font-medium">Temperature:</p>
                                  <p className="text-xs">{item.temperature}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 font-medium">Expiry:</p>
                                  <p className="text-xs">{item.expiryDate}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 font-medium">Location:</p>
                                  <p className="text-xs font-mono">{item.location}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 font-medium">UOM:</p>
                                  <p className="text-xs">PCS</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 font-medium">Barcode:</p>
                                  <p className="text-xs font-mono">{item.barcode}</p>
                                </div>
                              </div>
                            </div>

                            {/* Pricing & Promotions */}
                            <div className="p-4 border-b md:border-b-0 md:border-r border-gray-200">
                              <h4 className="font-medium text-sm mb-3">Pricing & Promotions</h4>
                              <div className="space-y-3">
                                <div>
                                  <p className="text-xs text-gray-500 font-medium">PRICE:</p>
                                  <p className className="text-sm font-medium">
                                    ฿{item.unitPrice.toFixed(2)}
                                  </p>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <p className="text-xs text-gray-500 font-medium">Quantity:</p>
                                    <p className="text-xs">{item.quantity}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 font-medium">Total:</p>
                                    <p className="text-xs font-medium">฿{item.totalPrice.toFixed(2)}</p>
                                  </div>
                                </div>

                                <Separator />

                                <div>
                                  <p className="text-xs text-gray-500 font-medium">
                                    Promotions & Coupons & Appeasements
                                  </p>
                                  <div className="mt-1 bg-gray-50 p-2 rounded-md">
                                    <p className="text-xs">{item.promotions || "No active promotions"}</p>
                                  </div>
                                </div>

                                <div>
                                  <p className="text-xs text-gray-500 font-medium">Promotion ID:</p>
                                  <p className="">{item.promotionId || "-"}</p>
                                </div>

                                <div>
                                  <p className="text-xs text-gray-500 font-medium">Promotion Type:</p>
                                  <p className="text-xs">{item.promotionType || "-"}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <p className="text-xs text-gray-500 font-medium">Gift with purchase:</p>
                                    <p className="text-xs">{item.giftWithPurchase ? "Yes" : "No"}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 font-medium">Gift wrapped:</p>
                                    <p className="text-xs">{item.giftWrapped ? "Yes" : "No"}</p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Fulfillment & Shipping */}
                            <div className="p-4">
                              <h4 className="font-medium text-sm mb-3">Fulfillment & Shipping</h4>

                              <div className="space-y-3">
                                <div>
                                  <p className="text-xs text-gray-500 font-medium">Shipping Method:</p>
                                  <p className="text-xs">Standard Delivery</p>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <p className="text-xs text-gray-500 font-medium">ETA:</p>
                                    <p className="text-xs">{item.eta || item.expiryDate}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 font-medium">Supply Type:</p>
                                    <p className="text-xs">On Hand Available</p>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <p className="text-xs text-gray-500 font-medium">Booking slot from:</p>
                                    <p className="text-xs">{new Date(order.orderDate).toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 font-medium">Booking slot to:</p>
                                    <p className="text-xs">{new Date(order.requestedDeliveryDate).toLocaleString()}</p>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <p className="text-xs text-gray-500 font-medium">Bundle:</p>
                                    <p className="text-xs">No</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 font-medium">Bundle Ref ID:</p>
                                    <p className="text-xs">-</p>
                                  </div>
                                </div>

                                <Separator />

                                <div>
                                  <h5 className="text-xs font-medium mb-2">Fulfillment Status</h5>
                                  <div className="grid grid-cols-4 gap-2 bg-gray-50 p-2 rounded-md">
                                    <div className="text-center">
                                      <p className="text-xs text-gray-500">Ordered</p>
                                      <p className="text-sm font-medium">{item.quantity}</p>
                                    </div>
                                    <div className="text-center">
                                      <p className="text-xs text-gray-500">Allocated</p>
                                      <p className="text-sm font-medium">{item.quantity}</p>
                                    </div>
                                    <div className="text-center">
                                      <p className="text-xs text-gray-500">Released</p>
                                      <p className="text-sm font-medium">{item.quantity}</p>
                                    </div>
                                    <div className="text-center">
                                      <p className="text-xs text-gray-500">Fulfilled</p>
                                      <p className="text-sm font-medium">
                                        {item.status === "PICKED" ? item.quantity : 0}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <h5 className="text-xs font-medium mb-2">Price Breakdown</h5>
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                      <span>Subtotal</span>
                                      <span>฿{item.totalPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                      <span>Discount</span>
                                      <span>฿0.00</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                      <span>Charges</span>
                                      <span>฿0.00</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                      <span>Taxes</span>
                                      <span>฿0.00</span>
                                    </div>
                                    <Separator className="my-1" />
                                    <div className="flex justify-between text-xs font-medium">
                                      <span>Total</span>
                                      <span>฿{item.totalPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500">
                                      <span>Informational Taxes</span>
                                      <span>฿{(item.totalPrice * 0.07).toFixed(2)}</span>
                                    </div>
                                  </div>
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
                <div className="text-center py-8 text-muted-foreground">No items found matching your search</div>
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
                  <Badge variant="outline">{order.fulfillment.method}</Badge>
                </div>
                <div>
                  <p className="text-sm text-enterprise-text-light">Assigned Picker</p>
                  <p className="font-medium">{order.fulfillment.assignedPicker}</p>
                  <p className="text-sm text-enterprise-text-light">{order.fulfillment.pickerPhone}</p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-enterprise-text-light">Picking Started</p>
                    <p className="text-sm">{new Date(order.fulfillment.pickingStartTime).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-enterprise-text-light">Picking Completed</p>
                    <p className="text-sm">{new Date(order.fulfillment.pickingCompletedTime).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-enterprise-text-light">Packing Started</p>
                    <p className="text-sm">{new Date(order.fulfillment.packingStartTime).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-enterprise-text-light">Packing Status</p>
                    <Badge className="bg-yellow-500">In Progress</Badge>
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
                  <p className="text-lg font-semibold">{order.sla.targetMinutes} minutes</p>
                </div>
                <div>
                  <p className="text-sm text-enterprise-text-light">Elapsed Time</p>
                  <p className="text-lg font-semibold text-red-500">{order.sla.elapsedMinutes} minutes</p>
                </div>
                <div>
                  <p className="text-sm text-enterprise-text-light">SLA Status</p>
                  <Badge className="bg-green-500">COMPLIANT</Badge>
                </div>
                <div>
                  <p className="text-sm text-enterprise-text-light">Escalation Level</p>
                  <Badge className="bg-gray-500">Level {order.sla.escalationLevel}</Badge>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-enterprise-text-light">Carrier</p>
                    <p className="font-medium">{order.delivery.carrier}</p>
                  </div>
                  <div>
                    <p className="text-sm text-enterprise-text-light">Tracking Number</p>
                    <p className="font-mono text-sm">{order.delivery.trackingNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-enterprise-text-light">Vehicle Type</p>
                    <Badge variant="outline">{order.delivery.vehicleType}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-enterprise-text-light">License Plate</p>
                    <p className="font-mono text-sm">{order.delivery.licensePlate}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-enterprise-text-light">Driver</p>
                    <p className="font-medium">{order.delivery.driverName}</p>
                    <p className="text-sm text-enterprise-text-light">{order.delivery.driverPhone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-enterprise-text-light">Estimated Arrival</p>
                    <p className="text-sm">{new Date(order.delivery.estimatedArrival).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-enterprise-text-light">Delivery Instructions</p>
                    <p className="text-sm italic">{order.delivery.deliveryInstructions}</p>
                  </div>
                </div>
              </div>
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
              <div className="space-y-4">
                {order.timeline.map((event, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-grow">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{event.description}</p>
                        <p className="text-xs text-enterprise-text-light">
                          {new Date(event.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {event.status}
                        </Badge>
                        <span className="text-xs text-enterprise-text-light">by {event.actor}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
              <div className="space-y-4">
                {order.notes.map((note) => (
                  <div key={note.id} className="border-l-4 border-blue-200 pl-4 py-2">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {note.type}
                        </Badge>
                        <span className="text-sm font-medium">{note.author}</span>
                      </div>
                      <span className="text-xs text-enterprise-text-light">
                        {new Date(note.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm">{note.message}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
