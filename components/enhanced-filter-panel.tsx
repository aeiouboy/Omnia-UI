"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  CalendarIcon, 
  Search, 
  X, 
  Filter, 
  Save,
  Bookmark,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Zap,
  Star
} from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
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

interface SavedFilter {
  id: string
  name: string
  filters: AdvancedFilterValues
  createdAt: Date
  isQuickFilter?: boolean
  icon?: string
  description?: string
}

interface EnhancedFilterPanelProps {
  isOpen: boolean
  onClose: () => void
  onApplyFilters: (filters: AdvancedFilterValues) => void
  onResetFilters: () => void
  initialValues?: Partial<AdvancedFilterValues>
  quickFilters?: SavedFilter[]
}

export function EnhancedFilterPanel({
  isOpen,
  onClose,
  onApplyFilters,
  onResetFilters,
  initialValues = {},
  quickFilters = []
}: EnhancedFilterPanelProps) {
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

  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([
    {
      id: "sla-critical",
      name: "SLA Critical",
      description: "Orders exceeding SLA with high priority",
      filters: { ...filters, exceedSLA: true, orderStatus: "PROCESSING" },
      createdAt: new Date(),
      isQuickFilter: true,
      icon: "AlertCircle"
    },
    {
      id: "today-orders",
      name: "Today's Orders", 
      description: "All orders placed today",
      filters: { ...filters, orderDateFrom: new Date(), orderDateTo: new Date() },
      createdAt: new Date(),
      isQuickFilter: true,
      icon: "Clock"
    },
    {
      id: "high-value",
      name: "High Value",
      description: "Premium orders requiring attention", 
      filters: { ...filters, paymentStatus: "PAID" },
      createdAt: new Date(),
      isQuickFilter: true,
      icon: "TrendingUp"
    }
  ])

  const [isApplying, setIsApplying] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState("filters")
  const [searchTerm, setSearchTerm] = useState("")

  // Smart suggestions based on current input
  const smartSuggestions = useMemo(() => {
    const suggestions = []
    
    if (filters.orderNumber) {
      suggestions.push({
        type: "order",
        text: `Search similar orders to ${filters.orderNumber}`,
        action: () => handleInputChange("orderNumber", filters.orderNumber.slice(0, -2) + "*")
      })
    }
    
    if (filters.customerName) {
      suggestions.push({
        type: "customer", 
        text: `Find all orders for ${filters.customerName}`,
        action: () => {
          setFilters(prev => ({ ...prev, email: "", phoneNumber: "" }))
        }
      })
    }

    if (filters.exceedSLA && !filters.orderDateFrom) {
      suggestions.push({
        type: "date",
        text: "Add date range for better SLA analysis",
        action: () => {
          const today = new Date()
          const yesterday = new Date(today)
          yesterday.setDate(yesterday.getDate() - 1)
          handleInputChange("orderDateFrom", yesterday)
          handleInputChange("orderDateTo", today)
        }
      })
    }

    return suggestions
  }, [filters])

  const hasActiveFilters = useCallback(() => {
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
  }, [filters])

  const handleInputChange = useCallback((field: keyof AdvancedFilterValues, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleApplyFilters = useCallback(() => {
    setIsApplying(true)

    setTimeout(() => {
      onApplyFilters(filters)
      setIsApplying(false)
      setShowSuccess(true)

      if (hasActiveFilters()) {
        toast({
          title: "Filters Applied",
          description: `${getFilterSummary().length} filter(s) active`,
          variant: "default",
        })
      }

      setTimeout(() => setShowSuccess(false), 2000)
    }, 300)
  }, [filters, onApplyFilters, hasActiveFilters])

  const handleResetFilters = useCallback(() => {
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
    toast({
      title: "Filters Cleared",
      description: "All filters have been reset",
      variant: "default",
    })
  }, [onResetFilters])

  const handleQuickFilter = useCallback((savedFilter: SavedFilter) => {
    setFilters(savedFilter.filters)
    handleApplyFilters()
    toast({
      title: "Quick Filter Applied",
      description: savedFilter.description || savedFilter.name,
      variant: "default",
    })
  }, [handleApplyFilters])

  const getFilterSummary = useCallback(() => {
    const activeFilters = []
    if (filters.orderNumber) activeFilters.push(`Order: ${filters.orderNumber}`)
    if (filters.customerName) activeFilters.push(`Customer: ${filters.customerName}`)
    if (filters.phoneNumber) activeFilters.push(`Phone: ${filters.phoneNumber}`)
    if (filters.email) activeFilters.push(`Email: ${filters.email}`)
    if (filters.orderDateFrom) activeFilters.push(`From: ${format(filters.orderDateFrom, "dd/MM")}`)
    if (filters.orderDateTo) activeFilters.push(`To: ${format(filters.orderDateTo, "dd/MM")}`)
    if (filters.orderStatus !== "all-status") activeFilters.push(`Status: ${filters.orderStatus}`)
    if (filters.exceedSLA) activeFilters.push("SLA Breach")
    if (filters.sellingChannel !== "all-channels") activeFilters.push(`Channel: ${filters.sellingChannel}`)
    if (filters.paymentStatus !== "all-payment") activeFilters.push(`Payment: ${filters.paymentStatus}`)
    if (filters.fulfillmentLocationId) activeFilters.push(`Location: ${filters.fulfillmentLocationId}`)
    if (filters.items) activeFilters.push(`Items: ${filters.items}`)
    return activeFilters
  }, [filters])

  const getFilterIcon = (iconName: string) => {
    const icons = {
      AlertCircle: AlertCircle,
      Clock: Clock,
      TrendingUp: TrendingUp,
      CheckCircle: CheckCircle,
      Star: Star
    }
    const Icon = icons[iconName as keyof typeof icons] || Filter
    return <Icon className="h-4 w-4" />
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        handleApplyFilters()
      } else if (e.key === "Escape") {
        e.preventDefault()
        onClose()
      } else if (e.key === "r" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        handleResetFilters()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, handleApplyFilters, handleResetFilters, onClose])

  if (!isOpen) return null

  const activeFilterCount = getFilterSummary().length

  return (
    <Card className="w-full max-w-6xl mx-auto shadow-xl border-l-4 border-l-blue-500 bg-gradient-to-br from-white to-blue-50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Filter className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">Smart Filter Panel</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {activeFilterCount > 0 ? `${activeFilterCount} active filter${activeFilterCount > 1 ? 's' : ''}` : 'Configure your search criteria'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {showSuccess && (
              <div className="flex items-center text-green-600">
                <CheckCircle className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">Applied!</span>
              </div>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="min-h-[44px] min-w-[44px]"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Active Filter Summary */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mt-3 p-3 bg-blue-50 rounded-lg">
            {getFilterSummary().map((filter, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {filter}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="quick" className="flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span>Quick Filters</span>
            </TabsTrigger>
            <TabsTrigger value="filters" className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Advanced</span>
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center space-x-2">
              <Bookmark className="h-4 w-4" />
              <span>Saved</span>
            </TabsTrigger>
          </TabsList>

          {/* Quick Filters Tab */}
          <TabsContent value="quick" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {savedFilters.filter(f => f.isQuickFilter).map((filter) => (
                <Card key={filter.id} className="cursor-pointer hover:shadow-md transition-all duration-200 border-l-4 border-l-blue-400">
                  <CardContent className="p-4" onClick={() => handleQuickFilter(filter)}>
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                        {getFilterIcon(filter.icon || "Filter")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1">{filter.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{filter.description}</p>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            Quick Apply
                          </Badge>
                          <Button size="sm" className="h-8">
                            Apply
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Smart Suggestions */}
            {smartSuggestions.length > 0 && (
              <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="font-medium text-yellow-800 mb-2 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Smart Suggestions
                </h4>
                <div className="space-y-2">
                  {smartSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={suggestion.action}
                      className="block w-full text-left text-sm text-yellow-700 hover:text-yellow-900 hover:bg-yellow-100 p-2 rounded transition-colors"
                    >
                      {suggestion.text}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Advanced Filters Tab */}
          <TabsContent value="filters" className="space-y-6 mt-6">
            <div className="space-y-4">
              {/* Customer Information Section */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Customer Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Order Number */}
                  <div className="space-y-2">
                    <Label htmlFor="orderNumber" className="text-sm font-medium text-gray-700">
                      Order Number
                    </Label>
                    <Input
                      id="orderNumber"
                      value={filters.orderNumber}
                      onChange={(e) => handleInputChange("orderNumber", e.target.value)}
                      placeholder="Enter order number"
                      className="min-h-[44px]"
                    />
                  </div>

                  {/* Customer Name */}
                  <div className="space-y-2">
                    <Label htmlFor="customerName" className="text-sm font-medium text-gray-700">
                      Customer Name
                    </Label>
                    <Input
                      id="customerName"
                      value={filters.customerName}
                      onChange={(e) => handleInputChange("customerName", e.target.value)}
                      placeholder="Enter customer name"
                      className="min-h-[44px]"
                    />
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">
                      Phone Number
                    </Label>
                    <Input
                      id="phoneNumber"
                      value={filters.phoneNumber}
                      onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                      placeholder="Enter phone number"
                      className="min-h-[44px]"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email
                    </Label>
                    <Input
                      id="email"
                      value={filters.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="Enter email address"
                      className="min-h-[44px]"
                    />
                  </div>
                </div>
              </div>

              {/* Date and Location Section */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Date & Location</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Order Date From */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Order Date From</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal min-h-[44px]",
                            !filters.orderDateFrom && "text-muted-foreground"
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

                  {/* Order Date To */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Order Date To</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal min-h-[44px]",
                            !filters.orderDateTo && "text-muted-foreground"
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

                  {/* Fulfillment Location */}
                  <div className="space-y-2">
                    <Label htmlFor="fulfillmentLocationId" className="text-sm font-medium text-gray-700">
                      Fulfillment Location
                    </Label>
                    <Input
                      id="fulfillmentLocationId"
                      value={filters.fulfillmentLocationId}
                      onChange={(e) => handleInputChange("fulfillmentLocationId", e.target.value)}
                      placeholder="Enter store/location"
                      className="min-h-[44px]"
                    />
                  </div>
                </div>
              </div>

              {/* Payment and Items Section */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Payment & Items</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Payment Status */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Payment Status</Label>
                    <Select value={filters.paymentStatus} onValueChange={(value) => handleInputChange("paymentStatus", value)}>
                      <SelectTrigger className="min-h-[44px]">
                        <SelectValue placeholder="Select payment status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-payment">All Payment Status</SelectItem>
                        <SelectItem value="PAID">Paid</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="FAILED">Failed</SelectItem>
                        <SelectItem value="REFUNDED">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Items Search */}
                  <div className="space-y-2">
                    <Label htmlFor="items" className="text-sm font-medium text-gray-700">
                      Search Items
                    </Label>
                    <Input
                      id="items"
                      value={filters.items}
                      onChange={(e) => handleInputChange("items", e.target.value)}
                      placeholder="Search by product name or SKU"
                      className="min-h-[44px]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SLA Exceed Checkbox */}
            <div className="flex items-center space-x-2 p-4 bg-red-50 rounded-lg border border-red-200">
              <Checkbox
                id="exceedSLA"
                checked={filters.exceedSLA}
                onCheckedChange={(checked) => handleInputChange("exceedSLA", checked)}
                className="min-h-[44px] min-w-[44px]"
              />
              <div className="flex-1">
                <Label htmlFor="exceedSLA" className="text-sm font-medium text-red-800 cursor-pointer">
                  SLA Breach Filter
                </Label>
                <p className="text-xs text-red-600 mt-1">Show only orders that have exceeded SLA thresholds</p>
              </div>
            </div>
          </TabsContent>

          {/* Saved Filters Tab */}
          <TabsContent value="saved" className="space-y-4 mt-6">
            <div className="text-center py-8">
              <Bookmark className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Saved Filters</h3>
              <p className="text-gray-600 mb-4">Save your frequently used filter combinations for quick access</p>
              <Button variant="outline" disabled>
                <Save className="h-4 w-4 mr-2" />
                Save Current Filters
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-gray-200">
          <div className="flex-1 flex gap-3">
            <Button
              onClick={handleApplyFilters}
              disabled={isApplying}
              className="flex-1 min-h-[44px] bg-blue-600 hover:bg-blue-700"
            >
              {isApplying ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Applying...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Apply Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                </>
              )}
            </Button>
            <Button
              onClick={handleResetFilters}
              variant="outline"
              className="min-h-[44px] px-6"
              disabled={!hasActiveFilters()}
            >
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>

        {/* Keyboard Shortcuts Help */}
        <div className="mt-4 text-xs text-gray-500 text-center">
          <span className="font-mono bg-gray-100 px-2 py-1 rounded">⌘+Enter</span> Apply • 
          <span className="font-mono bg-gray-100 px-2 py-1 rounded ml-2">⌘+R</span> Reset • 
          <span className="font-mono bg-gray-100 px-2 py-1 rounded ml-2">Esc</span> Close
        </div>
      </CardContent>
    </Card>
  )
}
