"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Package, Truck, CheckCircle, Clock, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

const orders = [
  {
    id: "ORD-2025-0523-001",
    orderNo: "2552268XVPUQ6",
    customer: "John Smith",
    email: "john.smith@example.com",
    phoneNumber: "0891234567",
    channel: "SHOPEE",
    status: "FULFILLED",
    businessUnit: "TOPS",
    items: 3,
    total: "฿1,052.00",
    date: "02/20/2025 10:58 ICT",
    sellingLocationId: "Central World",
    returnStatus: "",
    onHold: false,
    orderType: "HGH-HD-STD",
    paymentStatus: "PAID",
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
    items: 2,
    total: "฿1,250.00",
    date: "Today, 09:45 AM",
    sellingLocationId: "Sukhumvit",
    returnStatus: "",
    onHold: false,
    orderType: "HGH-HD-STD",
    paymentStatus: "PAID",
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
    items: 5,
    total: "฿3,450.00",
    date: "Yesterday, 15:30 PM",
    sellingLocationId: "Tops Sukhumvit",
    returnStatus: "NONE",
    onHold: false,
    orderType: "HGH-HD-STD",
    paymentStatus: "PAID",
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
    items: 1,
    total: "฿750.00",
    date: "Yesterday, 14:22 PM",
    sellingLocationId: "Central Warehouse",
    returnStatus: "",
    onHold: true,
    orderType: "STD-HD",
    paymentStatus: "PENDING",
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
    items: 2,
    total: "฿320.00",
    date: "Yesterday, 13:15 PM",
    sellingLocationId: "Tops Pattaya",
    returnStatus: "",
    onHold: false,
    orderType: "HGH-HD-STD",
    paymentStatus: "PAID",
    confirmed: true,
    allowSubstitution: false,
    createdDate: "02/18/2025 13:15 ICT",
  },
]

function getStatusIcon(status: string) {
  switch (status) {
    case "CREATED":
      return <ShoppingCart className="h-4 w-4 text-dark-gray" />
    case "PROCESSING":
      return <Package className="h-4 w-4 text-info" />
    case "SHIPPED":
      return <Truck className="h-4 w-4 text-corporate-blue" />
    case "DELIVERED":
      return <CheckCircle className="h-4 w-4 text-success" />
    case "FULFILLED":
      return <CheckCircle className="h-4 w-4 text-success" />
    default:
      return <ShoppingCart className="h-4 w-4 text-dark-gray" />
  }
}

function getChannelIcon(channel: string) {
  switch (channel) {
    case "GRAB":
      return (
        <Badge variant="outline" className="bg-[#e6f7ef] text-success border-[#c2e8d7] font-mono text-xs">
          GRAB
        </Badge>
      )
    case "LAZADA":
      return (
        <Badge variant="outline" className="bg-[#e6f1fc] text-info border-[#c2d8f0] font-mono text-xs">
          LAZADA
        </Badge>
      )
    case "SHOPEE":
      return (
        <Badge variant="outline" className="bg-[#fef3e6] text-warning border-[#f5e0c5] font-mono text-xs">
          SHOPEE
        </Badge>
      )
    case "TIKTOK":
      return (
        <Badge variant="outline" className="bg-[#f1f1f1] text-dark-gray border-[#e0e0e0] font-mono text-xs">
          TIKTOK
        </Badge>
      )
    default:
      return (
        <Badge variant="outline" className="font-mono text-xs">
          OTHER
        </Badge>
      )
  }
}

function getSLABadge(targetMinutes: number, elapsedMinutes: number, status: string) {
  if (status === "DELIVERED" || status === "FULFILLED") {
    return (
      <Badge variant="outline" className="bg-[#e6f7ef] text-success border-[#c2e8d7] font-mono text-xs">
        COMPLETE
      </Badge>
    )
  }

  const remainingMinutes = targetMinutes - elapsedMinutes

  if (status === "BREACH" || remainingMinutes < 0) {
    return (
      <div className="flex items-center">
        <AlertTriangle className="h-3 w-3 text-critical mr-1" />
        <span className="text-critical font-mono text-xs">{Math.abs(remainingMinutes)}m BREACH</span>
      </div>
    )
  } else if (remainingMinutes < targetMinutes * 0.2) {
    return (
      <div className="flex items-center">
        <Clock className="h-3 w-3 text-warning mr-1" />
        <span className="text-warning font-mono text-xs">{remainingMinutes}m LEFT</span>
      </div>
    )
  } else {
    return (
      <div className="flex items-center">
        <Clock className="h-3 w-3 text-info mr-1" />
        <span className="text-info font-mono text-xs">{remainingMinutes}m LEFT</span>
      </div>
    )
  }
}

export function OrdersTable() {
  return (
    <div className="overflow-hidden rounded-md border border-medium-gray">
      <Table>
        <TableHeader className="bg-light-gray">
          <TableRow className="hover:bg-light-gray/80">
            <TableHead className="font-label text-deep-navy">ORDER NUMBER</TableHead>
            <TableHead className="font-label text-deep-navy">CUSTOMER NAME</TableHead>
            <TableHead className="font-label text-deep-navy">EMAIL</TableHead>
            <TableHead className="font-label text-deep-navy">PHONE NUMBER</TableHead>
            <TableHead className="font-label text-deep-navy">ORDER TOTAL</TableHead>
            <TableHead className="font-label text-deep-navy">SELLING LOCATION ID</TableHead>
            <TableHead className="font-label text-deep-navy">ORDER STATUS</TableHead>
            <TableHead className="font-label text-deep-navy">RETURN STATUS</TableHead>
            <TableHead className="font-label text-deep-navy">ON HOLD</TableHead>
            <TableHead className="font-label text-deep-navy">ORDER TYPE</TableHead>
            <TableHead className="font-label text-deep-navy">PAYMENT STATUS</TableHead>
            <TableHead className="font-label text-deep-navy">CONFIRMED</TableHead>
            <TableHead className="font-label text-deep-navy">SELLING CHANNEL</TableHead>
            <TableHead className="font-label text-deep-navy">ALLOW SUBSTITUTION</TableHead>
            <TableHead className="font-label text-deep-navy">CREATED DATE</TableHead>
            <TableHead className="font-label text-deep-navy text-right">ACTIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id} className="hover:bg-light-gray/50">
              <TableCell className="font-mono text-xs text-deep-navy">{order.orderNo}</TableCell>
              <TableCell className="text-body text-deep-navy">{order.customer}</TableCell>
              <TableCell className="text-body text-deep-navy">{order.email}</TableCell>
              <TableCell className="text-body text-deep-navy">{order.phoneNumber}</TableCell>
              <TableCell className="text-body text-deep-navy">{order.total}</TableCell>
              <TableCell className="text-body text-deep-navy">{order.sellingLocationId}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  {getStatusIcon(order.status)}
                  <span className="ml-2 text-body text-deep-navy">{order.status}</span>
                </div>
              </TableCell>
              <TableCell className="text-body text-deep-navy">-</TableCell>
              <TableCell className="text-body text-deep-navy">-</TableCell>
              <TableCell className="text-body text-deep-navy">{order.orderType}</TableCell>
              <TableCell className="text-body text-deep-navy">{order.paymentStatus}</TableCell>
              <TableCell className="text-body text-deep-navy">-</TableCell>
              <TableCell>{order.channel}</TableCell>
              <TableCell className="text-body text-deep-navy">-</TableCell>
              <TableCell className="text-body text-deep-navy font-mono text-xs">{order.createdDate}</TableCell>
              <TableCell className="text-right">
                <Button
                  size="sm"
                  variant="outline"
                  className="min-h-[44px] text-xs border-corporate-blue text-corporate-blue hover:bg-corporate-blue/10"
                >
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
