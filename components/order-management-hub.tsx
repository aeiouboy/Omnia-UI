"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  RefreshCw,
  ShoppingBag,
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertTriangle,
  MoreHorizontal,
  X,
  Filter,
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AdvancedFilterPanel, type AdvancedFilterValues } from "./advanced-filter-panel"
import { useToast } from "@/components/ui/use-toast"
// import { OrderService } from "@/services/order-service" // Import the new OrderService

// Updated to match the enterprise data model with all required columns
const orders = [
  {
    id: "ORD-2025-0523-001",
    orderNo: "CG-TOPS-2025052301-A789B0", // เปลี่ยนจาก "2552268XVPUQ6" เป็น pattern ที่สอดคล้องกับอันอื่นๆ
    customer: "John Smith",
    email: "john.smith@example.com",
    phoneNumber: "0891234567",
    channel: "SHOPEE",
    status: "FULFILLED",
    businessUnit: "TOPS",
    orderType: "HGH-HD-STD",
    items: 3,
    total: "฿1,052.00",
    date: "Today, 10:23 AM",
    slaTargetMinutes: 5,
    elapsedMinutes: 7,
    slaStatus: "COMPLIANT",
    storeName: "Central World",
    sellingLocationId: "Central World",
    priority: "HIGH",
    billingMethod: "COD",
    paymentStatus: "PAID",
    fulfillmentLocationId: "TOPS-CW-001",
    itemsList: ["Fresh Milk", "Bread", "Eggs"],
    orderDate: new Date(2025, 4, 23),
    returnStatus: "",
    onHold: false,
    confirmed: true,
    allowSubstitution: false,
    createdDate: "02/20/2025 10:58 ICT",
  },
  {
    id: "ORD-2025-0523-002",
    orderNo: "CG-TOPS-2025052302-B123C4",
    customer: "Sarah Johnson",
    email: "sarah.j@example.com",
    phoneNumber: "0812345678",
    channel: "LAZADA",
    status: "SHIPPED",
    businessUnit: "TOPS",
    orderType: "HGH-HD-STD",
    items: 2,
    total: "฿1,250.00",
    date: "Today, 09:45 AM",
    slaTargetMinutes: 60,
    elapsedMinutes: 45,
    slaStatus: "COMPLIANT",
    storeName: "Central Warehouse",
    sellingLocationId: "Sukhumvit",
    priority: "NORMAL",
    billingMethod: "CARD",
    paymentStatus: "PAID",
    fulfillmentLocationId: "CW-BKK-001",
    itemsList: ["Organic Vegetables", "Chicken Breast"],
    orderDate: new Date(2025, 4, 23),
    returnStatus: "",
    onHold: false,
    confirmed: true,
    allowSubstitution: true,
    createdDate: "02/19/2025 09:45 ICT",
  },
  {
    id: "ORD-2025-0522-001",
    orderNo: "CG-TOPS-2025052201-D456E7",
    customer: "Michael Wong",
    email: "m.wong@example.com",
    phoneNumber: "0823456789",
    channel: "SHOPEE",
    status: "DELIVERED",
    businessUnit: "TOPS",
    orderType: "HGH-HD-STD",
    items: 5,
    total: "฿3,450.00",
    date: "Yesterday, 15:30 PM",
    slaTargetMinutes: 60,
    elapsedMinutes: 55,
    slaStatus: "COMPLIANT",
    storeName: "Tops Sukhumvit",
    sellingLocationId: "Tops Sukhumvit",
    priority: "NORMAL",
    billingMethod: "COD",
    paymentStatus: "PAID",
    fulfillmentLocationId: "TOPS-SKV-001",
    itemsList: ["Rice", "Cooking Oil", "Soy Sauce", "Noodles", "Fish Sauce"],
    orderDate: new Date(2025, 4, 22),
    returnStatus: "NONE",
    onHold: false,
    confirmed: true,
    allowSubstitution: false,
    createdDate: "02/18/2025 15:30 ICT",
  },
  {
    id: "ORD-2025-0522-002",
    orderNo: "CG-CENTRAL-2025052202-F789G0",
    customer: "Lisa Chen",
    email: "lisa.chen@example.com",
    phoneNumber: "0834567890",
    channel: "TIKTOK",
    status: "PROCESSING",
    businessUnit: "CENTRAL",
    orderType: "STD-HD",
    items: 1,
    total: "฿750.00",
    date: "Yesterday, 14:22 PM",
    slaTargetMinutes: 120,
    elapsedMinutes: 60,
    slaStatus: "COMPLIANT",
    storeName: "Central Warehouse",
    sellingLocationId: "Central Warehouse",
    priority: "NORMAL",
    billingMethod: "BANK_TRANSFER",
    paymentStatus: "PENDING",
    fulfillmentLocationId: "CW-BKK-001",
    itemsList: ["Designer Handbag"],
    orderDate: new Date(2025, 4, 22),
    returnStatus: "",
    onHold: true,
    confirmed: false,
    allowSubstitution: true,
    createdDate: "02/18/2025 14:22 ICT",
  },
  {
    id: "ORD-2025-0522-003",
    orderNo: "CG-TOPS-2025052203-H012I3",
    customer: "David Miller",
    email: "d.miller@example.com",
    phoneNumber: "0845678901",
    channel: "GRAB",
    status: "PROCESSING",
    businessUnit: "TOPS",
    orderType: "HGH-HD-STD",
    items: 2,
    total: "฿320.00",
    date: "Yesterday, 13:15 PM",
    slaTargetMinutes: 5,
    elapsedMinutes: 6,
    slaStatus: "BREACH",
    storeName: "Tops Pattaya",
    sellingLocationId: "Tops Pattaya",
    priority: "HIGH",
    billingMethod: "COD",
    paymentStatus: "PAID",
    fulfillmentLocationId: "TOPS-PTY-001",
    itemsList: ["Bottled Water", "Snacks"],
    orderDate: new Date(2025, 4, 22),
    returnStatus: "",
    onHold: false,
    confirmed: true,
    allowSubstitution: false,
    createdDate: "02/18/2025 13:15 ICT",
  },
  {
    id: "ORD-2025-0522-004",
    orderNo: "CG-TOPS-2025052204-J345K6",
    customer: "Emma Wilson",
    email: "emma.w@example.com",
    phoneNumber: "0856789012",
    channel: "SHOPIFY",
    status: "CREATED",
    businessUnit: "TOPS",
    orderType: "STD-HD",
    items: 4,
    total: "฿1,890.00",
    date: "Yesterday, 11:05 AM",
    slaTargetMinutes: 120,
    elapsedMinutes: 30,
    slaStatus: "COMPLIANT",
    storeName: "Unassigned",
    sellingLocationId: "Unassigned",
    priority: "NORMAL",
    billingMethod: "CARD",
    paymentStatus: "PAID",
    fulfillmentLocationId: "",
    itemsList: ["Shampoo", "Conditioner", "Body Wash", "Lotion"],
    orderDate: new Date(2025, 4, 22),
    returnStatus: "",
    onHold: false,
    confirmed: true,
    allowSubstitution: false,
    createdDate: "02/18/2025 11:05 ICT",
  },
  {
    id: "ORD-2025-0523-003",
    orderNo: "CG-TOPS-2025052303-C456D7",
    customer: "Alice Brown",
    email: "alice.brown@example.com",
    phoneNumber: "0867890123",
    channel: "GRAB",
    status: "PROCESSING",
    businessUnit: "TOPS",
    orderType: "HGH-HD-STD",
    items: 2,
    total: "฿450.00",
    date: "Today, 11:30 AM",
    slaTargetMinutes: 5,
    elapsedMinutes: 4,
    slaStatus: "COMPLIANT",
    storeName: "Tops Silom",
    sellingLocationId: "Tops Silom",
    priority: "HIGH",
    billingMethod: "COD",
    paymentStatus: "PAID",
    fulfillmentLocationId: "TOPS-SLM-001",
    itemsList: ["Coffee", "Sandwich"],
    orderDate: new Date(2025, 4, 23),
    returnStatus: "",
    onHold: false,
    confirmed: true,
    allowSubstitution: false,
    createdDate: "02/20/2025 11:30 ICT",
  },
  {
    id: "ORD-2025-0523-004",
    orderNo: "CG-TOPS-2025052304-E789F0",
    customer: "Robert Wilson",
    email: "robert.w@example.com",
    phoneNumber: "0878901234",
    channel: "LAZADA",
    status: "PROCESSING",
    businessUnit: "TOPS",
    orderType: "HGH-HD-STD",
    items: 1,
    total: "฿280.00",
    date: "Today, 12:15 PM",
    slaTargetMinutes: 60,
    elapsedMinutes: 50,
    slaStatus: "COMPLIANT",
    storeName: "Tops Thonglor",
    sellingLocationId: "Tops Thonglor",
    priority: "NORMAL",
    billingMethod: "CARD",
    paymentStatus: "PAID",
    fulfillmentLocationId: "TOPS-TGL-001",
    itemsList: ["Protein Shake"],
    orderDate: new Date(2025, 4, 23),
    returnStatus: "",
    onHold: false,
    confirmed: true,
    allowSubstitution: true,
    createdDate: "02/20/2025 12:15 ICT",
  },
  {
    id: "ORD-2025-0523-005",
    orderNo: "CG-CENTRAL-2025052305-G012H3",
    customer: "Jennifer Lee",
    email: "jennifer.lee@example.com",
    phoneNumber: "0889012345",
    channel: "SHOPEE",
    status: "PROCESSING",
    businessUnit: "CENTRAL",
    orderType: "STD-HD",
    items: 3,
    total: "฿1,200.00",
    date: "Today, 13:45 PM",
    slaTargetMinutes: 120,
    elapsedMinutes: 100,
    slaStatus: "COMPLIANT",
    storeName: "Central Ladprao",
    sellingLocationId: "Central Ladprao",
    priority: "NORMAL",
    billingMethod: "BANK_TRANSFER",
    paymentStatus: "PAID",
    fulfillmentLocationId: "CTL-LDP-001",
    itemsList: ["Dress", "Shoes", "Handbag"],
    orderDate: new Date(2025, 4, 23),
    returnStatus: "",
    onHold: false,
    confirmed: true,
    allowSubstitution: false,
    createdDate: "02/20/2025 13:45 ICT",
  },
  {
    id: "ORD-2025-0523-006",
    orderNo: "CG-TOPS-2025052306-I345J6",
    customer: "Mark Thompson",
    email: "mark.t@example.com",
    phoneNumber: "0890123456",
    channel: "TIKTOK",
    status: "CREATED",
    businessUnit: "TOPS",
    orderType: "HGH-HD-STD",
    items: 4,
    total: "฿680.00",
    date: "Today, 14:20 PM",
    slaTargetMinutes: 5,
    elapsedMinutes: 4,
    slaStatus: "COMPLIANT",
    storeName: "Tops Asoke",
    sellingLocationId: "Tops Asoke",
    priority: "HIGH",
    billingMethod: "COD",
    paymentStatus: "PAID",
    fulfillmentLocationId: "TOPS-ASK-001",
    itemsList: ["Fruits", "Vegetables", "Meat", "Dairy"],
    orderDate: new Date(2025, 4, 23),
    returnStatus: "",
    onHold: false,
    confirmed: true,
    allowSubstitution: true,
    createdDate: "02/20/2025 14:20 ICT",
  },
]

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
    case "FULFILLED":
      return <CheckCircle className="h-4 w-4 text-success" />
    default:
      return <ShoppingBag className="h-4 w-4 text-dark-gray" />
  }
}

function getChannelBadge(channel: string) {
  switch (channel) {
    case "GRAB":
      return (
        <Badge variant="outline" className="bg-[#e6f7ef] text-success border-[#c2e8d7] font-mono text-sm">
          GRAB
        </Badge>
      )
    case "LAZADA":
      return (
        <Badge variant="outline" className="bg-[#e6f1fc] text-info border-[#c2d8f0] font-mono text-sm">
          LAZADA
        </Badge>
      )
    case "SHOPEE":
      return (
        <Badge variant="outline" className="bg-[#fef3e6] text-warning border-[#f5e0c5] font-mono text-sm">
          SHOPEE
        </Badge>
      )
    case "TIKTOK":
      return (
        <Badge variant="outline" className="bg-[#f1f1f1] text-dark-gray border-[#e0e0e0] font-mono text-sm">
          TIKTOK
        </Badge>
      )
    case "SHOPIFY":
      return (
        <Badge variant="outline" className="bg-[#f3e6fc] text-[#9333ea] border-[#e0c5f5] font-mono text-sm">
          SHOPIFY
        </Badge>
      )
    case "INSTORE":
      return (
        <Badge variant="outline" className="bg-[#e6f7f7] text-[#0d9488] border-[#c5e8e5] font-mono text-sm">
          INSTORE
        </Badge>
      )
    default:
      return (
        <Badge variant="outline" className="font-mono text-sm">
          OTHER
        </Badge>
      )
  }
}

function getSLABadge(targetMinutes: number, elapsedMinutes: number, status: string) {
  if (status === "DELIVERED" || status === "FULFILLED") {
    return (
      <Badge variant="outline" className="bg-[#e6f7ef] text-success border-[#c2e8d7] font-mono text-sm">
        COMPLETE
      </Badge>
    )
  }

  const remainingMinutes = targetMinutes - elapsedMinutes

  if (status === "BREACH" || remainingMinutes < 0) {
    return (
      <div className="flex items-center">
        <AlertTriangle className="h-3 w-3 text-red-500 mr-1" />
        <span className="text-red-500 font-mono text-sm font-medium">{Math.abs(remainingMinutes)}m BREACH</span>
      </div>
    )
  } else if (remainingMinutes < targetMinutes * 0.2) {
    return (
      <div className="flex items-center">
        <Clock className="h-3 w-3 text-amber-500 mr-1" />
        <span className="text-amber-500 font-mono text-sm font-medium">{remainingMinutes}m LEFT</span>
      </div>
    )
  } else {
    return (
      <div className="flex items-center">
        <Clock className="h-3 w-3 text-blue-500 mr-1" />
        <span className="text-blue-500 font-mono text-sm font-medium">{remainingMinutes}m LEFT</span>
      </div>
    )
  }
}

function getPriorityBadge(priority: string) {
  switch (priority) {
    case "HIGH":
      return <Badge className="bg-critical text-white border-0 font-mono text-sm">HIGH</Badge>
    case "NORMAL":
      return (
        <Badge variant="outline" className="font-mono text-sm">
          NORMAL
        </Badge>
      )
    case "LOW":
      return (
        <Badge variant="secondary" className="font-mono text-sm">
          LOW
        </Badge>
      )
    default:
      return (
        <Badge variant="outline" className="font-mono text-sm">
          NORMAL
        </Badge>
      )
  }
}

function getOrderTypeBadge(orderType: string) {
  switch (orderType) {
    case "HGH-HD-STD":
      return <Badge className="bg-info text-white border-0 font-mono text-sm">HGH-HD-STD</Badge>
    case "STD-HD":
      return <Badge className="bg-warning text-white border-0 font-mono text-sm">STD-HD</Badge>
    default:
      return (
        <Badge variant="outline" className="font-mono text-sm">
          {orderType}
        </Badge>
      )
  }
}

export function OrderManagementHub() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all-status")
  const [channelFilter, setChannelFilter] = useState("all-channels")
  const [priorityFilter, setPriorityFilter] = useState("all-priority")
  const [slaFilter, setSlaFilter] = useState<"all" | "near-breach" | "breach">("all")
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilterValues>({
    orderNumber: "",
    customerName: "",
    phoneNumber: "",
    email: "",
    orderDateFrom: undefined,
    orderDateTo: undefined,
    orderStatus: "all-status",
    exceedSLA: false,
    sellingChannel: "all-channels",
    paymentStatus: "all-payment",
    fulfillmentLocationId: "",
    items: "",
  })
  const router = useRouter()

  const { toast } = useToast()
  const [slaAlerts, setSlaAlerts] = useState<string[]>([])
  const [lastAlertCheck, setLastAlertCheck] = useState<number>(Date.now())

  // เพิ่ม state สำหรับเก็บผลลัพธ์การคำนวณ SLA
  const [slaStats, setSlaStats] = useState({
    criticalOrders: [] as typeof orders,
    breachedOrders: [] as typeof orders,
    nearBreachOrders: [] as typeof orders,
  })

  const [ordersData, setOrdersData] = useState<typeof orders>(orders) // State to hold orders data from service

  // Fetch orders data from service on component mount
  // useEffect(() => {
  //   const fetchOrders = async () => {
  //     const data = await OrderService.getOrders()
  //     setOrdersData(data)
  //   }

  //   fetchOrders()
  // }, [])

  // แก้ไขฟังก์ชัน checkSLAAlerts ให้ไม่มีการเรียกใช้ setState ภายในฟังก์ชัน
  const checkSLAAlerts = (orders: typeof orders) => {
    const criticalOrders = orders.filter((order) => {
      // ไม่ตรวจสอบ order ที่เสร็จสิ้นแล้ว
      if (order.status === "DELIVERED" || order.status === "FULFILLED") {
        return false
      }

      const remainingMinutes = order.slaTargetMinutes - order.elapsedMinutes
      const criticalThreshold = order.slaTargetMinutes * 0.2 // 20% ของเวลา SLA

      // ถือว่าเป็น critical ถ้าเหลือเวลาน้อยกว่า 20% หรือเกินแล้ว
      return remainingMinutes <= criticalThreshold
    })

    // แยกประเภท order ที่เกิน SLA แล้ว และที่ใกล้เกิน SLA
    const breachedOrders = criticalOrders.filter(
      (order) => order.slaTargetMinutes - order.elapsedMinutes <= 0 || order.slaStatus === "BREACH",
    )

    const nearBreachOrders = criticalOrders.filter(
      (order) => order.slaTargetMinutes - order.elapsedMinutes > 0 && order.slaStatus !== "BREACH",
    )

    const newAlerts = criticalOrders.map((order) => {
      const remainingMinutes = order.slaTargetMinutes - order.elapsedMinutes
      if (remainingMinutes <= 0) {
        return `🚨 Order ${order.orderNo} has exceeded SLA by ${Math.abs(remainingMinutes)} minutes!`
      } else {
        return `⚠️ Order ${order.orderNo} will exceed SLA in ${remainingMinutes} minutes!`
      }
    })

    return { criticalOrders, breachedOrders, nearBreachOrders, newAlerts }
  }

  // ตรวจสอบ SLA alerts และอัพเดท state
  useEffect(() => {
    const updateSLAStats = () => {
      const { criticalOrders, breachedOrders, nearBreachOrders, newAlerts } = checkSLAAlerts(ordersData)

      setSlaStats({ criticalOrders, breachedOrders, nearBreachOrders })

      // ตรวจสอบว่ามี alert ใหม่หรือไม่
      const hasNewAlerts = newAlerts.some((alert) => !slaAlerts.includes(alert))

      if (hasNewAlerts && newAlerts.length > 0) {
        setSlaAlerts(newAlerts)

        // แสดง toast notification สำหรับ alert ใหม่
        const newAlertsOnly = newAlerts.filter((alert) => !slaAlerts.includes(alert))

        if (newAlertsOnly.length > 0) {
          toast({
            title: `⚠️ SLA Alert (${criticalOrders.length} orders)`,
            description:
              newAlertsOnly.length === 1 ? newAlertsOnly[0] : `${newAlertsOnly.length} orders need immediate attention`,
            variant: breachedOrders.length > 0 ? "destructive" : "default",
            duration: 8000,
          })
        }
      } else if (newAlerts.length === 0 && slaAlerts.length > 0) {
        // ถ้าไม่มี alert แล้ว ให้ clear
        setSlaAlerts([])
      }
    }

    // อัพเดทครั้งแรกเมื่อ component mount
    updateSLAStats()

    const interval = setInterval(() => {
      updateSLAStats()
    }, 30000) // ตรวจสอบทุก 30 วินาที

    return () => clearInterval(interval)
  }, [ordersData, slaAlerts, toast])

  const filteredOrders = ordersData.filter((order) => {
    // SLA filter
    if (slaFilter === "near-breach") {
      // ไม่รวม order ที่เสร็จสิ้นแล้ว
      if (order.status === "DELIVERED" || order.status === "FULFILLED") {
        return false
      }

      const remainingMinutes = order.slaTargetMinutes - order.elapsedMinutes
      const criticalThreshold = order.slaTargetMinutes * 0.2 // 20% ของเวลา SLA

      // แสดงเฉพาะ order ที่ใกล้เกิน SLA แต่ยังไม่เกิน
      return remainingMinutes <= criticalThreshold && remainingMinutes > 0 && order.slaStatus !== "BREACH"
    } else if (slaFilter === "breach") {
      // ไม่รวม order ที่เสร็จสิ้นแล้ว
      if (order.status === "DELIVERED" || order.status === "FULFILLED") {
        return false
      }

      const remainingMinutes = order.slaTargetMinutes - order.elapsedMinutes

      // แสดงเฉพาะ order ที่เกิน SLA แล้ว
      return remainingMinutes <= 0 || order.slaStatus === "BREACH"
    }

    // Basic search filter
    const matchesSearch =
      searchTerm === "" ||
      order.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phoneNumber.includes(searchTerm) ||
      order.items.toString().includes(searchTerm) ||
      order.businessUnit.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.total.toLowerCase().includes(searchTerm.toLowerCase())

    // Basic dropdown filters
    const matchesStatus = statusFilter === "all-status" || order.status.toLowerCase() === statusFilter.toLowerCase()
    const matchesChannel =
      channelFilter === "all-channels" || order.channel.toLowerCase() === channelFilter.toLowerCase()
    const matchesPriority =
      priorityFilter === "all-priority" || order.priority.toLowerCase() === priorityFilter.toLowerCase()

    // Advanced filters
    const matchesOrderNumber =
      advancedFilters.orderNumber === "" ||
      order.orderNo.toLowerCase().includes(advancedFilters.orderNumber.toLowerCase())

    const matchesCustomerName =
      advancedFilters.customerName === "" ||
      order.customer.toLowerCase().includes(advancedFilters.customerName.toLowerCase())

    const matchesPhoneNumber =
      advancedFilters.phoneNumber === "" ||
      order.phoneNumber.toLowerCase().includes(advancedFilters.phoneNumber.toLowerCase())

    const matchesEmail =
      advancedFilters.email === "" || order.email.toLowerCase().includes(advancedFilters.email.toLowerCase())

    const matchesOrderDateFrom = !advancedFilters.orderDateFrom || order.orderDate >= advancedFilters.orderDateFrom

    const matchesOrderDateTo = !advancedFilters.orderDateTo || order.orderDate <= advancedFilters.orderDateTo

    const matchesAdvancedStatus =
      advancedFilters.orderStatus === "all-status" ||
      order.status.toLowerCase() === advancedFilters.orderStatus.toLowerCase()

    const matchesExceedSLA =
      !advancedFilters.exceedSLA ||
      (order.slaStatus === "BREACH" && order.status !== "FULFILLED" && order.status !== "DELIVERED")

    const matchesAdvancedChannel =
      advancedFilters.sellingChannel === "all-channels" ||
      order.channel.toLowerCase() === advancedFilters.sellingChannel.toLowerCase()

    const matchesPaymentStatus =
      advancedFilters.paymentStatus === "all-payment" ||
      order.paymentStatus.toLowerCase() === advancedFilters.paymentStatus.toLowerCase()

    const matchesFulfillmentLocationId =
      advancedFilters.fulfillmentLocationId === "" ||
      order.fulfillmentLocationId.toLowerCase().includes(advancedFilters.fulfillmentLocationId.toLowerCase())

    const matchesItems =
      advancedFilters.items === "" ||
      order.itemsList.some((item) => item.toLowerCase().includes(advancedFilters.items.toLowerCase()))

    return (
      matchesSearch &&
      matchesStatus &&
      matchesChannel &&
      matchesPriority &&
      matchesOrderNumber &&
      matchesCustomerName &&
      matchesPhoneNumber &&
      matchesEmail &&
      matchesOrderDateFrom &&
      matchesOrderDateTo &&
      matchesAdvancedStatus &&
      matchesExceedSLA &&
      matchesAdvancedChannel &&
      matchesPaymentStatus &&
      matchesFulfillmentLocationId &&
      matchesItems
    )
  })

  const refreshData = () => {
    // Fetch fresh data from the service
    // OrderService.getOrders().then((data) => {
    //   setOrdersData(data)
    //   const { criticalOrders, breachedOrders, nearBreachOrders, newAlerts } = checkSLAAlerts(data)
    //   setSlaStats({ criticalOrders, breachedOrders, nearBreachOrders })

    //   if (newAlerts.length > 0) {
    //     setSlaAlerts(newAlerts)
    //   } else if (slaAlerts.length > 0) {
    //     setSlaAlerts([])
    //   }
    // })

    // In a real application, this would fetch fresh data from the API
    const { criticalOrders, breachedOrders, nearBreachOrders, newAlerts } = checkSLAAlerts(ordersData)
    setSlaStats({ criticalOrders, breachedOrders, nearBreachOrders })

    if (newAlerts.length > 0) {
      setSlaAlerts(newAlerts)
    } else if (slaAlerts.length > 0) {
      setSlaAlerts([])
    }

    alert("Refreshing data... In a real application, this would fetch the latest orders.")
  }

  const handleApplyAdvancedFilters = (filters: AdvancedFilterValues) => {
    setAdvancedFilters(filters)

    // Update basic filters to match advanced filters
    setStatusFilter(filters.orderStatus)
    setChannelFilter(filters.sellingChannel)

    // Calculate active filters for display
    const newActiveFilters: string[] = []

    if (filters.orderNumber) newActiveFilters.push(`Order #: ${filters.orderNumber}`)
    if (filters.customerName) newActiveFilters.push(`Customer: ${filters.customerName}`)
    if (filters.phoneNumber) newActiveFilters.push(`Phone: ${filters.phoneNumber}`)
    if (filters.email) newActiveFilters.push(`Email: ${filters.email}`)
    if (filters.orderDateFrom) newActiveFilters.push(`From: ${filters.orderDateFrom.toLocaleDateString()}`)
    if (filters.orderDateTo) newActiveFilters.push(`To: ${filters.orderDateTo.toLocaleDateString()}`)
    if (filters.orderStatus !== "all-status") newActiveFilters.push(`Status: ${filters.orderStatus}`)
    if (filters.exceedSLA) newActiveFilters.push("SLA Breached")
    if (filters.sellingChannel !== "all-channels") newActiveFilters.push(`Channel: ${filters.sellingChannel}`)
    if (filters.paymentStatus !== "all-payment") newActiveFilters.push(`Payment: ${filters.paymentStatus}`)
    if (filters.fulfillmentLocationId) newActiveFilters.push(`Location: ${filters.fulfillmentLocationId}`)
    if (filters.items) newActiveFilters.push(`Items: ${filters.items}`)

    setActiveFilters(newActiveFilters)
    setShowAdvancedFilters(false)
  }

  const handleResetAdvancedFilters = () => {
    setAdvancedFilters({
      orderNumber: "",
      customerName: "",
      phoneNumber: "",
      email: "",
      orderDateFrom: undefined,
      orderDateTo: undefined,
      orderStatus: "all-status",
      exceedSLA: false,
      sellingChannel: "all-channels",
      paymentStatus: "all-payment",
      fulfillmentLocationId: "",
      items: "",
    })
    setStatusFilter("all-status")
    setChannelFilter("all-channels")
    setPriorityFilter("all-priority")
    setSlaFilter("all") // รีเซ็ต SLA filter
    setActiveFilters([])
  }

  const removeFilter = (filter: string) => {
    setActiveFilters(activeFilters.filter((f) => f !== filter))

    // Reset the corresponding filter in the advanced filters
    if (filter.startsWith("Order #:")) {
      setAdvancedFilters((prev) => ({ ...prev, orderNumber: "" }))
    } else if (filter.startsWith("Customer:")) {
      setAdvancedFilters((prev) => ({ ...prev, customerName: "" }))
    } else if (filter.startsWith("Phone:")) {
      setAdvancedFilters((prev) => ({ ...prev, phoneNumber: "" }))
    } else if (filter.startsWith("Email:")) {
      setAdvancedFilters((prev) => ({ ...prev, email: "" }))
    } else if (filter.startsWith("From:")) {
      setAdvancedFilters((prev) => ({ ...prev, orderDateFrom: undefined }))
    } else if (filter.startsWith("To:")) {
      setAdvancedFilters((prev) => ({ ...prev, orderDateTo: undefined }))
    } else if (filter.startsWith("Status:")) {
      setAdvancedFilters((prev) => ({ ...prev, orderStatus: "all-status" }))
      setStatusFilter("all-status")
    } else if (filter === "SLA Breached") {
      setAdvancedFilters((prev) => ({ ...prev, exceedSLA: false }))
    } else if (filter.startsWith("Channel:")) {
      setAdvancedFilters((prev) => ({ ...prev, sellingChannel: "all-channels" }))
      setChannelFilter("all-channels")
    } else if (filter.startsWith("Payment:")) {
      setAdvancedFilters((prev) => ({ ...prev, paymentStatus: "all-payment" }))
    } else if (filter.startsWith("Location:")) {
      setAdvancedFilters((prev) => ({ ...prev, fulfillmentLocationId: "" }))
    } else if (filter.startsWith("Items:")) {
      setAdvancedFilters((prev) => ({ ...prev, items: "" }))
    }
  }

  const renderOrderTable = (ordersToShow: typeof orders) => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="bg-light-gray">
          <TableRow className="hover:bg-light-gray/80 border-b border-medium-gray">
            <TableHead className="font-heading text-deep-navy min-w-[150px] text-sm font-semibold">
              ORDER NUMBER
            </TableHead>
            <TableHead className="font-heading text-deep-navy min-w-[100px] text-sm font-semibold">
              ORDER TOTAL
            </TableHead>
            <TableHead className="font-heading text-deep-navy min-w-[140px] text-sm font-semibold">
              SELLING LOCATION ID
            </TableHead>
            <TableHead className="font-heading text-deep-navy min-w-[120px] text-sm font-semibold">
              ORDER STATUS
            </TableHead>
            <TableHead className="font-heading text-deep-navy min-w-[120px] text-sm font-semibold">
              SLA STATUS
            </TableHead>
            <TableHead className="font-heading text-deep-navy min-w-[120px] text-sm font-semibold">
              RETURN STATUS
            </TableHead>
            <TableHead className="font-heading text-deep-navy min-w-[80px] text-sm font-semibold">ON HOLD</TableHead>
            <TableHead className="font-heading text-deep-navy min-w-[120px] text-sm font-semibold">
              PAYMENT STATUS
            </TableHead>
            <TableHead className="font-heading text-deep-navy min-w-[80px] text-sm font-semibold">CONFIRMED</TableHead>
            <TableHead className="font-heading text-deep-navy min-w-[120px] text-sm font-semibold">
              SELLING CHANNEL
            </TableHead>
            <TableHead className="font-heading text-deep-navy min-w-[120px] text-sm font-semibold">
              ALLOW SUBSTITUTION
            </TableHead>
            <TableHead className="font-heading text-deep-navy min-w-[140px] text-sm font-semibold">
              CREATED DATE
            </TableHead>
            <TableHead className="text-right min-w-[100px] text-sm font-semibold font-heading text-deep-navy">
              ACTIONS
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ordersToShow.length > 0 ? (
            ordersToShow.map((order) => (
              <TableRow key={order.id} className="hover:bg-light-gray/50 border-b border-medium-gray">
                <TableCell className="font-mono text-sm text-deep-navy whitespace-nowrap leading-relaxed">
                  <div className="flex items-center">
                    <button
                      onClick={() => router.push(`/orders/${order.id}`)}
                      className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium"
                    >
                      {order.orderNo}
                    </button>
                  </div>
                </TableCell>
                {/* ตัดข้อมูลลูกค้าออก (ชื่อ, อีเมล, เบอร์โทร) */}
                <TableCell className="text-readable text-deep-navy leading-relaxed">{order.total}</TableCell>
                <TableCell className="text-readable text-deep-navy leading-relaxed">
                  {order.sellingLocationId}
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {getStatusIcon(order.status)}
                    <span className="ml-2 text-readable text-deep-navy leading-relaxed">{order.status}</span>
                  </div>
                </TableCell>
                <TableCell>{getSLABadge(order.slaTargetMinutes, order.elapsedMinutes, order.slaStatus)}</TableCell>
                <TableCell className="text-readable text-deep-navy leading-relaxed">
                  {order.returnStatus ? order.returnStatus : "NONE"}
                </TableCell>
                <TableCell className="text-readable text-deep-navy leading-relaxed">
                  {order.onHold ? (
                    <Badge variant="outline" className="bg-[#fef3e6] text-warning border-[#f5e0c5] font-mono text-sm">
                      YES
                    </Badge>
                  ) : (
                    ""
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`font-mono text-sm ${
                      order.paymentStatus === "PAID"
                        ? "bg-[#e6f7ef] text-success border-[#c2e8d7]"
                        : "bg-[#fef3e6] text-warning border-[#f5e0c5]"
                    }`}
                  >
                    {order.paymentStatus}
                  </Badge>
                </TableCell>
                <TableCell className="text-readable text-deep-navy leading-relaxed">
                  {order.confirmed ? <CheckCircle className="h-4 w-4 text-success" /> : ""}
                </TableCell>
                <TableCell>
                  <span className="text-sm">{getChannelBadge(order.channel)}</span>
                </TableCell>
                <TableCell className="text-readable text-deep-navy leading-relaxed">
                  {order.allowSubstitution ? "Yes" : "No"}
                </TableCell>
                <TableCell className="text-readable text-deep-navy font-mono text-sm leading-relaxed">
                  {order.createdDate}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4 text-steel-gray" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="border-medium-gray">
                      <DropdownMenuLabel className="text-deep-navy font-heading">Actions</DropdownMenuLabel>
                      <DropdownMenuItem
                        className="text-body text-deep-navy cursor-pointer"
                        onClick={() => router.push(`/orders/${order.id}`)}
                      >
                        View details
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-body text-deep-navy cursor-pointer">
                        Process order
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-body text-deep-navy cursor-pointer">
                        Print invoice
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-body text-deep-navy cursor-pointer">
                        Print shipping label
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-body text-deep-navy cursor-pointer">
                        Cancel order
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={13} className="text-center py-4 text-muted-foreground">
                No orders found matching your criteria
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )

  return (
    <Card className="shadow-enterprise border-medium-gray">
      <CardHeader className="border-b border-medium-gray pb-6">
        <div className="flex flex-col gap-4">
          {/* Search and filters row */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-dark-gray" />
              <Input
                type="search"
                placeholder="Search by order number, customer name, email, or phone..."
                className="pl-8 w-full border-medium-gray text-deep-navy"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filters section - wrapped in scrollable container */}
            <div className="flex gap-2 overflow-x-auto pb-2 max-w-full">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] border-medium-gray">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-status">All Status</SelectItem>
                  <SelectItem value="created">Created</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="fulfilled">Fulfilled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={channelFilter} onValueChange={setChannelFilter}>
                <SelectTrigger className="w-[120px] border-medium-gray">
                  <SelectValue placeholder="Channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-channels">All Channels</SelectItem>
                  <SelectItem value="grab">Grab</SelectItem>
                  <SelectItem value="lazada">Lazada</SelectItem>
                  <SelectItem value="shopee">Shopee</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="shopify">Shopify</SelectItem>
                  <SelectItem value="instore">In-store</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[120px] border-medium-gray">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-priority">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              {/* SLA Quick Filters */}
              <div className="flex gap-1 flex-shrink-0">
                <Button
                  variant={slaFilter === "near-breach" ? "default" : "outline"}
                  size="sm"
                  className={`border-medium-gray ${
                    slaFilter === "near-breach"
                      ? "bg-amber-500 text-white hover:bg-amber-600"
                      : "text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                  }`}
                  onClick={() => setSlaFilter(slaFilter === "near-breach" ? "all" : "near-breach")}
                >
                  <Clock className="h-4 w-4 mr-1" />
                  Near SLA
                  {slaStats.nearBreachOrders.length > 0 && (
                    <Badge variant="outline" className="ml-1 bg-white text-amber-600 border-amber-300">
                      {slaStats.nearBreachOrders.length}
                    </Badge>
                  )}
                </Button>

                {/* SLA Alert button as a filter */}
                {slaAlerts.length > 0 && (
                  <Button
                    variant={slaFilter === "breach" ? "default" : "outline"}
                    size="sm"
                    className={`border-medium-gray ${
                      slaFilter === "breach"
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : "text-red-600 hover:text-red-700 hover:bg-red-50"
                    }`}
                    onClick={() => setSlaFilter(slaFilter === "breach" ? "all" : "breach")}
                  >
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    SLA Breach
                    {slaStats.breachedOrders.length > 0 && (
                      <Badge variant="outline" className="ml-1 bg-white text-red-600 border-red-300">
                        {slaStats.breachedOrders.length}
                      </Badge>
                    )}
                  </Button>
                )}
              </div>

              <Button
                variant="outline"
                size="icon"
                className={`border-medium-gray ${
                  showAdvancedFilters
                    ? "bg-light-gray text-deep-navy"
                    : "text-steel-gray hover:text-deep-navy hover:bg-light-gray"
                }`}
                title="Advanced Filters"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                <Filter className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="border-medium-gray text-steel-gray hover:text-deep-navy hover:bg-light-gray"
                title="Refresh Data"
                onClick={refreshData}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Active filters row */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter) => (
                <Badge key={filter} variant="outline" className="bg-light-gray text-deep-navy font-mono text-sm">
                  {filter}
                  <button
                    onClick={() => removeFilter(filter)}
                    className="ml-2 text-destructive hover:text-destructive/80"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Advanced filters panel */}
          {showAdvancedFilters && (
            <AdvancedFilterPanel
              isOpen={showAdvancedFilters}
              onClose={() => setShowAdvancedFilters(false)}
              onApplyFilters={handleApplyAdvancedFilters}
              onResetFilters={handleResetAdvancedFilters}
              initialValues={advancedFilters}
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6">{renderOrderTable(filteredOrders)}</CardContent>
    </Card>
  )
}
