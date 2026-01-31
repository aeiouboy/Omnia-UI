"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { CalendarIcon, Search, X, CheckCircle } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"

export interface AdvancedFilterValues {
  orderNumber: string
  customerName: string
  phoneNumber: string
  email: string
  orderDateFrom: Date | undefined
  orderDateTo: Date | undefined
  orderStatus: string
  exceedSLA: boolean
  sellingChannel: string
  paymentStatus: string
  fulfillmentLocationId: string
  items: string
}

interface AdvancedFilterPanelProps {
  isOpen: boolean
  onClose: () => void
  onApplyFilters: (filters: AdvancedFilterValues) => void
  onResetFilters: () => void
  initialValues?: Partial<AdvancedFilterValues>
}

export function AdvancedFilterPanel({
  isOpen,
  onClose,
  onApplyFilters,
  onResetFilters,
  initialValues = {},
}: AdvancedFilterPanelProps) {
  const [filters, setFilters] = useState<AdvancedFilterValues>({
    orderNumber: initialValues.orderNumber || "",
    customerName: initialValues.customerName || "",
    phoneNumber: initialValues.phoneNumber || "",
    email: initialValues.email || "",
    orderDateFrom: initialValues.orderDateFrom,
    orderDateTo: initialValues.orderDateTo,
    orderStatus: initialValues.orderStatus || "all-status",
    exceedSLA: initialValues.exceedSLA || false,
    sellingChannel: initialValues.sellingChannel || "all-channels",
    paymentStatus: initialValues.paymentStatus || "all-payment",
    fulfillmentLocationId: initialValues.fulfillmentLocationId || "",
    items: initialValues.items || "",
  })

  const [isApplying, setIsApplying] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const hasActiveFilters = () => {
    return (
      filters.orderNumber !== "" ||
      filters.customerName !== "" ||
      filters.phoneNumber !== "" ||
      filters.email !== "" ||
      filters.orderDateFrom !== undefined ||
      filters.orderDateTo !== undefined ||
      filters.orderStatus !== "all-status" ||
      filters.exceedSLA !== false ||
      filters.sellingChannel !== "all-channels" ||
      filters.paymentStatus !== "all-payment" ||
      filters.fulfillmentLocationId !== "" ||
      filters.items !== ""
    )
  }

  const handleInputChange = (field: keyof AdvancedFilterValues, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleApplyFilters = () => {
    setIsApplying(true)

    // Simulate a small delay to show loading state
    setTimeout(() => {
      onApplyFilters(filters)
      setIsApplying(false)
      setShowSuccess(true)

      // Show a confirmation message
      if (hasActiveFilters()) {
        console.log("Filters applied successfully!")
        toast({
          title: "Filters Applied",
          description: "Your filter criteria have been applied successfully.",
          variant: "default",
        })
      }

      // Hide success indicator after 2 seconds
      setTimeout(() => {
        setShowSuccess(false)
      }, 2000)
    }, 500)
  }

  const handleResetFilters = () => {
    setFilters({
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
    onResetFilters()
  }

  // Add keyboard shortcut for applying filters with Enter key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && isOpen) {
        handleApplyFilters()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, filters])

  if (!isOpen) return null

  const getFilterSummary = () => {
    const activeFilters = []

    if (filters.orderNumber) activeFilters.push(`Order #: ${filters.orderNumber}`)
    if (filters.customerName) activeFilters.push(`Customer: ${filters.customerName}`)
    if (filters.phoneNumber) activeFilters.push(`Phone: ${filters.phoneNumber}`)
    if (filters.email) activeFilters.push(`Email: ${filters.email}`)
    if (filters.orderDateFrom) activeFilters.push(`From: ${filters.orderDateFrom.toLocaleDateString()}`)
    if (filters.orderDateTo) activeFilters.push(`To: ${filters.orderDateTo.toLocaleDateString()}`)
    if (filters.orderStatus !== "all-status") activeFilters.push(`Status: ${filters.orderStatus}`)
    // if (filters.exceedSLA) activeFilters.push("SLA Breached") // Disabled SLA elements
    if (filters.sellingChannel !== "all-channels") activeFilters.push(`Channel: ${filters.sellingChannel}`)
    if (filters.paymentStatus !== "all-payment") activeFilters.push(`Payment: ${filters.paymentStatus}`)
    if (filters.fulfillmentLocationId) activeFilters.push(`Location: ${filters.fulfillmentLocationId}`)
    if (filters.items) activeFilters.push(`Items: ${filters.items}`)

    return activeFilters
  }

  const activeFilterCount = getFilterSummary().length

  return (
    <div className="bg-white border border-medium-gray rounded-md shadow-lg p-4 mb-4 relative z-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-deep-navy">Advanced Order Filter</h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Order number / Short order ID */}
        <div className="space-y-2">
          <Label htmlFor="orderNumber" className="text-xs text-deep-navy">
            Order number / Short order ID
          </Label>
          <Input
            id="orderNumber"
            value={filters.orderNumber}
            onChange={(e) => handleInputChange("orderNumber", e.target.value)}
            className="border-medium-gray"
            placeholder="Enter order number"
          />
        </div>

        {/* Customer name */}
        <div className="space-y-2">
          <Label htmlFor="customerName" className="text-xs text-deep-navy">
            Customer name
          </Label>
          <Input
            id="customerName"
            value={filters.customerName}
            onChange={(e) => handleInputChange("customerName", e.target.value)}
            className="border-medium-gray"
            placeholder="Enter customer name"
          />
        </div>

        {/* Phone number */}
        <div className="space-y-2">
          <Label htmlFor="phoneNumber" className="text-xs text-deep-navy">
            Phone number
          </Label>
          <Input
            id="phoneNumber"
            value={filters.phoneNumber}
            onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
            className="border-medium-gray"
            placeholder="Enter phone number"
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs text-deep-navy">
            Email
          </Label>
          <Input
            id="email"
            value={filters.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className="border-medium-gray"
            placeholder="Enter email address"
          />
        </div>

        {/* Order date from */}
        <div className="space-y-2">
          <Label htmlFor="orderDateFrom" className="text-xs text-deep-navy">
            Order date from
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal border-medium-gray",
                  !filters.orderDateFrom && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.orderDateFrom ? format(filters.orderDateFrom, "dd/MM/yyyy") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={filters.orderDateFrom}
                onSelect={(date) => handleInputChange("orderDateFrom", date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Order date to */}
        <div className="space-y-2">
          <Label htmlFor="orderDateTo" className="text-xs text-deep-navy">
            Order date to
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal border-medium-gray",
                  !filters.orderDateTo && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.orderDateTo ? format(filters.orderDateTo, "dd/MM/yyyy") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={filters.orderDateTo}
                onSelect={(date) => handleInputChange("orderDateTo", date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Order status */}
        <div className="space-y-2">
          <Label htmlFor="orderStatus" className="text-xs text-deep-navy">
            Order status
          </Label>
          <Select value={filters.orderStatus} onValueChange={(value) => handleInputChange("orderStatus", value)}>
            <SelectTrigger className="border-medium-gray">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-status">All Status</SelectItem>
              <SelectItem value="created">Created</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Exceed SLA - DISABLED */}
        {/* <div className="space-y-2">
          <Label htmlFor="exceedSLA" className="text-xs text-deep-navy">
            Exceed SLA
          </Label>
          <div className="flex items-center space-x-2 h-10 px-3 py-2 border border-medium-gray rounded-md">
            <Checkbox
              id="exceedSLA"
              checked={filters.exceedSLA}
              onCheckedChange={(checked) => handleInputChange("exceedSLA", checked === true)}
            />
            <label
              htmlFor="exceedSLA"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Show only SLA breached orders
            </label>
          </div>
        </div> */}

        {/* Selling channel */}
        <div className="space-y-2">
          <Label htmlFor="sellingChannel" className="text-xs text-deep-navy">
            Selling channel
          </Label>
          <Select value={filters.sellingChannel} onValueChange={(value) => handleInputChange("sellingChannel", value)}>
            <SelectTrigger className="border-medium-gray">
              <SelectValue placeholder="Select channel" />
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
        </div>

        {/* Payment status */}
        <div className="space-y-2">
          <Label htmlFor="paymentStatus" className="text-xs text-deep-navy">
            Payment status
          </Label>
          <Select value={filters.paymentStatus} onValueChange={(value) => handleInputChange("paymentStatus", value)}>
            <SelectTrigger className="border-medium-gray">
              <SelectValue placeholder="Select payment status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-payment">All Payment Status</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Fulfillment location ID */}
        <div className="space-y-2">
          <Label htmlFor="fulfillmentLocationId" className="text-xs text-deep-navy">
            Fulfillment location ID
          </Label>
          <Input
            id="fulfillmentLocationId"
            value={filters.fulfillmentLocationId}
            onChange={(e) => handleInputChange("fulfillmentLocationId", e.target.value)}
            className="border-medium-gray"
            placeholder="Enter location ID"
          />
        </div>

        {/* Items */}
        <div className="space-y-2">
          <Label htmlFor="items" className="text-xs text-deep-navy">
            Items
          </Label>
          <Input
            id="items"
            value={filters.items}
            onChange={(e) => handleInputChange("items", e.target.value)}
            className="border-medium-gray"
            placeholder="Enter item name or SKU"
          />
        </div>
      </div>

      {hasActiveFilters() && (
        <div className="mt-6 p-3 bg-light-gray rounded-md">
          <h4 className="text-sm font-medium text-deep-navy mb-2">Filter Preview:</h4>
          <div className="flex flex-wrap gap-2">
            {getFilterSummary().map((filter, index) => (
              <Badge key={`filter-${index}`} variant="secondary" className="bg-white text-deep-navy px-3 py-1">
                {filter}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end mt-6 space-x-4 relative z-10 bg-white pt-4 border-t border-gray-200">
        <Button
          variant="outline"
          onClick={handleResetFilters}
          className="border-medium-gray text-deep-navy hover:bg-light-gray px-6 py-2 h-10"
        >
          Reset
        </Button>
        <Button
          onClick={handleApplyFilters}
          disabled={isApplying}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-2 h-10 text-white font-medium shadow-md border-0 relative z-20 transition-all duration-200 ease-in-out"
          style={{
            backgroundColor: showSuccess ? "#10b981" : "#2563eb",
            minWidth: "160px",
            transform: showSuccess ? "scale(1.05)" : "scale(1)",
          }}
        >
          {isApplying ? (
            <div className="flex items-center">
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              <span>Applying...</span>
            </div>
          ) : showSuccess ? (
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>Applied!</span>
            </div>
          ) : (
            <div className="flex items-center">
              <Search className="h-5 w-5 mr-2" />
              <span>Apply Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
            </div>
          )}
        </Button>
      </div>
    </div>
  )
}
