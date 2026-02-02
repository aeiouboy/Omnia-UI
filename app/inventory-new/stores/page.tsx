"use client"

import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Store,
  Package,
  AlertTriangle,
  Clock,
  Search,
  RefreshCw,
  MapPin,
  ArrowLeft,
  LayoutGrid,
  List,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  TrendingUp,
  Activity,
  Calendar as CalendarIcon,
  X,
  Download,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  Settings,
  Undo2,
  ClipboardList,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  XCircle,
  Filter,
  Globe,
  ShoppingCart,
  Truck,
  Boxes,
  Zap,
} from "lucide-react"
import { TransactionTypeLegend } from "@/components/inventory/transaction-type-legend"
import { fetchStorePerformance } from "@/lib/inventory-service"
import type { StorePerformance } from "@/types/inventory"
import { InventoryEmptyState } from "@/components/inventory/inventory-empty-state"
import {
  generateMockProductTransactions,
  filterTransactionsByType,
  filterTransactionsByNotes,
  type ProductTransaction,
  type ProductTransactionType,
} from "@/lib/stock-card-mock-data"
import { exportStockCardToCSV } from "@/lib/stock-card-export"
import { ProductInfoCard } from "@/components/inventory/product-info-card"
import type { InventoryItem } from "@/types/inventory"

// Minimum characters required for search to trigger
const MIN_SEARCH_CHARS = 2

// View Type options for By Store view filtering - Enhanced with human-readable labels
const STOCK_CARD_VIEW_TYPES = [
  {
    value: "ECOM-TH-CFR-LOCD-STD",
    label: "E-Commerce Standard (CFR)",
    shortLabel: "TOL",
    description: "Central Food Retail - Local Distribution",
    icon: Globe
  },
  {
    value: "ECOM-TH-CFR-LOCD-MKP",
    label: "Marketplace (CFR)",
    shortLabel: "MKP",
    description: "Central Food Retail - Marketplace",
    icon: ShoppingCart
  },
  {
    value: "MKP-TH-CFR-LOCD-STD",
    label: "Quality Control (CFR)",
    shortLabel: "QC",
    description: "Central Food Retail - Quality Control",
    icon: Boxes
  },
  {
    value: "ECOM-TH-DSS-NW-STD",
    label: "Direct Ship Standard",
    shortLabel: "DS-STD",
    description: "Direct Ship - Standard Delivery",
    icon: Truck
  },
  {
    value: "ECOM-TH-DSS-LOCD-EXP",
    label: "Direct Ship Express",
    shortLabel: "DS-EXP",
    description: "Direct Ship - Express Delivery",
    icon: Zap
  },
]

type FilterType = "all" | "critical" | "low"
type ViewMode = "cards" | "table"
type ViewTab = "by-store" | "by-product"
type SortField = "storeName" | "storeId" | "totalProducts" | "lowStockItems" | "criticalStockItems" | "healthScore" | "storeStatus"
type SortOrder = "asc" | "desc"

function getHealthScoreColor(score: number): string {
  if (score >= 80) return "text-green-600"
  if (score >= 60) return "text-yellow-600"
  return "text-red-600"
}

function getHealthScoreBackground(score: number): string {
  if (score >= 80) return "bg-green-100"
  if (score >= 60) return "bg-yellow-100"
  return "bg-red-100"
}

// Transaction type configuration for By Product view
const TRANSACTION_TYPES: { value: ProductTransactionType | "all"; label: string }[] = [
  { value: "all", label: "All Types" },
  { value: "RECEIPT_IN", label: "Receipt (IN)" },
  { value: "ISSUE_OUT", label: "Issue (OUT)" },
  { value: "TRANSFER_IN", label: "Transfer In" },
  { value: "TRANSFER_OUT", label: "Transfer Out" },
  { value: "ADJUSTMENT_PLUS", label: "Adjustment (+)" },
  { value: "ADJUSTMENT_MINUS", label: "Adjustment (-)" },
  { value: "RETURN", label: "Return" },
]

const transactionTypeConfig: Record<
  ProductTransactionType,
  {
    icon: React.ReactNode
    badgeClass: string
    label: string
    quantityClass: string
  }
> = {
  RECEIPT_IN: {
    icon: <ArrowDownToLine className="h-4 w-4" />,
    badgeClass: "bg-green-100 text-green-800 border-green-200",
    label: "Receipt (IN)",
    quantityClass: "text-green-600",
  },
  ISSUE_OUT: {
    icon: <ArrowUpFromLine className="h-4 w-4" />,
    badgeClass: "bg-red-100 text-red-800 border-red-200",
    label: "Issue (OUT)",
    quantityClass: "text-red-600",
  },
  TRANSFER_IN: {
    icon: <ArrowLeftRight className="h-4 w-4" />,
    badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
    label: "Transfer In",
    quantityClass: "text-blue-600",
  },
  TRANSFER_OUT: {
    icon: <ArrowLeftRight className="h-4 w-4" />,
    badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
    label: "Transfer Out",
    quantityClass: "text-blue-600",
  },
  ADJUSTMENT_PLUS: {
    icon: <Settings className="h-4 w-4" />,
    badgeClass: "bg-orange-100 text-orange-800 border-orange-200",
    label: "Adjustment (+)",
    quantityClass: "text-orange-600",
  },
  ADJUSTMENT_MINUS: {
    icon: <Settings className="h-4 w-4" />,
    badgeClass: "bg-orange-100 text-orange-800 border-orange-200",
    label: "Adjustment (-)",
    quantityClass: "text-orange-600",
  },
  RETURN: {
    icon: <Undo2 className="h-4 w-4" />,
    badgeClass: "bg-purple-100 text-purple-800 border-purple-200",
    label: "Return",
    quantityClass: "text-purple-600",
  },
}

// Simplified transaction type for display purposes
type SimplifiedTransactionType = "STOCK_IN" | "STOCK_OUT" | "ADJUSTMENT"

// Mapping from original 7 types to simplified 3 types
const TRANSACTION_TYPE_MAPPING: Record<ProductTransactionType, SimplifiedTransactionType> = {
  RECEIPT_IN: "STOCK_IN",
  ISSUE_OUT: "STOCK_OUT",
  TRANSFER_IN: "STOCK_IN",
  TRANSFER_OUT: "STOCK_OUT",
  ADJUSTMENT_PLUS: "ADJUSTMENT",
  ADJUSTMENT_MINUS: "ADJUSTMENT",
  RETURN: "STOCK_IN",
}

// Simplified type configuration for display
const simplifiedTypeConfig: Record<SimplifiedTransactionType, {
  icon: React.ReactNode
  badgeClass: string
  label: string
  quantityClass: string
}> = {
  STOCK_IN: {
    icon: <ArrowUp className="h-3.5 w-3.5" />,
    badgeClass: "bg-green-100 text-green-700 border-green-200",
    label: "Stock In",
    quantityClass: "text-green-600",
  },
  STOCK_OUT: {
    icon: <ArrowDown className="h-3.5 w-3.5" />,
    badgeClass: "bg-red-100 text-red-700 border-red-200",
    label: "Stock Out",
    quantityClass: "text-red-600",
  },
  ADJUSTMENT: {
    icon: <RefreshCw className="h-3.5 w-3.5" />,
    badgeClass: "bg-cyan-100 text-cyan-700 border-cyan-200",
    label: "Adjustment",
    quantityClass: "text-cyan-600",
  },
}

// Helper to get quantity sign based on simplified type
function getQuantitySign(simplifiedType: SimplifiedTransactionType): "+" | "-" {
  return simplifiedType === "STOCK_IN" ? "+" : "-"
}

// Helper to check if transaction is inbound
function isInboundType(type: ProductTransactionType): boolean {
  return ["RECEIPT_IN", "TRANSFER_IN", "ADJUSTMENT_PLUS", "RETURN"].includes(type)
}

// Format timestamp for display
function formatTransactionDateTime(timestamp: string): string {
  try {
    const date = new Date(timestamp)
    return date.toLocaleString("en-US", {
      timeZone: "Asia/Bangkok",
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  } catch {
    return timestamp
  }
}

import { useOrganization } from "@/contexts/organization-context"
import { useInventoryView } from "@/contexts/inventory-view-context"

export default function StockByStorePage() {
  const router = useRouter()

  // Get inventory view context
  const {
    channels: viewChannels,
    businessUnit: viewBusinessUnit,
    isLoading: isContextLoading,
    selectedViewType,
    setViewType,
    clearViewType,
  } = useInventoryView()

  // Get organization context
  const { selectedOrganization } = useOrganization()

  // State management
  const [storeData, setStoreData] = useState<StorePerformance[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Tab state - By Product is default view
  const [viewTab, setViewTab] = useState<ViewTab>("by-product")

  // Filter state - separate Store ID and Store Name search fields
  const [storeIdSearch, setStoreIdSearch] = useState("")
  const [storeNameSearch, setStoreNameSearch] = useState("")
  // Product search state - new mandatory filters
  const [productIdSearch, setProductIdSearch] = useState("")
  const [productNameSearch, setProductNameSearch] = useState("")
  const [filterType, setFilterType] = useState<FilterType>("all")
  const [viewMode, setViewMode] = useState<ViewMode>("table") // Default to table view

  // Date range state for mandatory date selection
  const [dateRange, setDateRange] = useState<{ startDate: Date | undefined; endDate: Date | undefined }>({
    startDate: undefined,
    endDate: undefined,
  })

  // By Product view state
  const [productTransactionType, setProductTransactionType] = useState<ProductTransactionType | "all">("all")
  const [searchNotes, setSearchNotes] = useState("")
  const [productTransactions, setProductTransactions] = useState<ProductTransaction[]>([])
  const [productViewLoading, setProductViewLoading] = useState(false)
  const [productViewPage, setProductViewPage] = useState(1)
  const [productViewPageSize, setProductViewPageSize] = useState(25)
  const [showProductCard, setShowProductCard] = useState(false)

  // By Product view - Store filter state (mandatory)
  const [byProductStoreIdSearch, setByProductStoreIdSearch] = useState("")
  const [byProductStoreNameSearch, setByProductStoreNameSearch] = useState("")

  // Debounce ref for search inputs
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const notesDebounceRef = useRef<NodeJS.Timeout | null>(null)

  // Sorting state
  const [sortField, setSortField] = useState<SortField>("criticalStockItems")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")

  // Mobile filter sheet state
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  // Optional filters collapse state (auto-expand if user has set optional filters)
  const [optionalFiltersOpen, setOptionalFiltersOpen] = useState(false)

  // Derived validation states for minimum character requirement (Store)
  const hasValidStoreIdSearch = storeIdSearch.trim().length >= MIN_SEARCH_CHARS
  const hasValidStoreNameSearch = storeNameSearch.trim().length >= MIN_SEARCH_CHARS
  const hasValidSearchCriteria = hasValidStoreIdSearch || hasValidStoreNameSearch

  // Product search validation (minimum 2 characters)
  const hasValidProductIdSearch = productIdSearch.trim().length >= MIN_SEARCH_CHARS
  const hasValidProductNameSearch = productNameSearch.trim().length >= MIN_SEARCH_CHARS
  const hasValidProductCriteria = hasValidProductIdSearch || hasValidProductNameSearch

  // By Product view - Store search validation (minimum 2 characters)
  const hasValidByProductStoreIdSearch = byProductStoreIdSearch.trim().length >= MIN_SEARCH_CHARS
  const hasValidByProductStoreNameSearch = byProductStoreNameSearch.trim().length >= MIN_SEARCH_CHARS
  const hasValidByProductStoreCriteria = hasValidByProductStoreIdSearch || hasValidByProductStoreNameSearch

  // Derived validation state for date range
  const hasValidDateRange = dateRange.startDate !== undefined && dateRange.endDate !== undefined

  // By Store view: Has valid View Type selected (not "all")
  const hasViewTypeFilter = selectedViewType && selectedViewType !== "all"

  // All mandatory filters for By Store view: Only View Type selected (Store search is optional)
  const hasAllMandatoryFiltersForStore = hasViewTypeFilter

  // All mandatory filters for By Product view: Date range AND Product criteria AND Store criteria
  const hasAllMandatoryFiltersForProduct = hasValidDateRange && hasValidProductCriteria && hasValidByProductStoreCriteria

  // Load store performance data for By Store view
  const loadData = useCallback(async (showLoadingState = true) => {
    // Guard: Only proceed if View Type AND Store search criteria met
    if (!hasAllMandatoryFiltersForStore) {
      if (!isContextLoading) {
        setLoading(false)
        setStoreData([])
      }
      return
    }

    if (showLoadingState) {
      setLoading(true)
    } else {
      setRefreshing(true)
    }
    setError(null)

    try {
      // Create filters based on current context and View Type
      const filters = {
        businessUnit: selectedOrganization !== 'ALL' ? selectedOrganization : (viewBusinessUnit || undefined),
        channels: viewChannels.length > 0 ? viewChannels : undefined,
        view: (selectedViewType && selectedViewType !== "all") ? selectedViewType : undefined,
        storeIdSearch: hasValidStoreIdSearch ? storeIdSearch : undefined,
        storeNameSearch: hasValidStoreNameSearch ? storeNameSearch : undefined,
      }

      const response = await fetchStorePerformance(filters)
      setStoreData(response.stores)
    } catch (err) {
      console.error("Failed to load store performance data:", err)
      setError("Failed to load store data. Please try again.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [hasAllMandatoryFiltersForStore, isContextLoading, selectedOrganization, viewBusinessUnit, viewChannels, selectedViewType, hasValidStoreIdSearch, storeIdSearch, hasValidStoreNameSearch, storeNameSearch])

  // Load product transactions
  const loadProductTransactions = useCallback(() => {
    if (!hasAllMandatoryFiltersForProduct || !dateRange.startDate || !dateRange.endDate) {
      setProductTransactions([])
      return
    }

    setProductViewLoading(true)

    // Simulate API delay
    setTimeout(() => {
      const productId = productIdSearch || productNameSearch
      const productName = productNameSearch || `Product ${productId}`

      // Generate mock transactions
      const allTransactions = generateMockProductTransactions(
        productId,
        productName,
        dateRange.startDate!,
        dateRange.endDate!
      )

      // Apply transaction type filter
      let filtered = filterTransactionsByType(allTransactions, productTransactionType)

      // Apply notes search filter
      if (searchNotes.trim()) {
        filtered = filterTransactionsByNotes(filtered, searchNotes)
      }

      setProductTransactions(filtered)
      setShowProductCard(true) // Show product info card when data loads

      setProductViewLoading(false)
      setProductViewPage(1) // Reset to first page
    }, 500)
  }, [hasAllMandatoryFiltersForProduct, dateRange, productIdSearch, productNameSearch, productTransactionType, searchNotes])

  // Effect for By Store view - load store performance data
  useEffect(() => {
    if (viewTab === "by-store" && hasAllMandatoryFiltersForStore) {
      loadData(true)
    }
  }, [viewTab, hasAllMandatoryFiltersForStore, selectedViewType, hasValidStoreIdSearch, hasValidStoreNameSearch, storeIdSearch, storeNameSearch])

  // Effect for By Product view data loading
  useEffect(() => {
    if (viewTab === "by-product") {
      loadProductTransactions()
    }
  }, [viewTab, loadProductTransactions])

  // Debounced notes search
  useEffect(() => {
    if (viewTab === "by-product") {
      if (notesDebounceRef.current) {
        clearTimeout(notesDebounceRef.current)
      }
      notesDebounceRef.current = setTimeout(() => {
        loadProductTransactions()
      }, 400)
      return () => {
        if (notesDebounceRef.current) {
          clearTimeout(notesDebounceRef.current)
        }
      }
    }
  }, [searchNotes, viewTab])

  // Auto-expand optional filters when user has set values
  useEffect(() => {
    if (productTransactionType !== "all" || searchNotes.trim()) {
      setOptionalFiltersOpen(true)
    }
  }, [productTransactionType, searchNotes])

  // Calculate summary statistics
  const summary = useMemo(() => {
    return {
      totalStores: storeData.length,
      totalProducts: storeData.reduce((sum, store) => sum + store.totalProducts, 0),
      totalLowStock: storeData.filter((store) => store.lowStockItems > 0).length,
      totalOutOfStock: storeData.filter((store) => store.criticalStockItems > 0).length,
    }
  }, [storeData])

  // Filter and sort stores
  const filteredAndSortedStores = useMemo(() => {
    let filtered = [...storeData]

    // Apply Store ID cross-search filter (searches both storeId and storeName)
    if (hasValidStoreIdSearch) {
      const storeIdLower = storeIdSearch.toLowerCase()
      filtered = filtered.filter((store) =>
        (store.storeId && store.storeId.toLowerCase().includes(storeIdLower)) ||
        (store.storeName && store.storeName.toLowerCase().includes(storeIdLower))
      )
    }

    // Apply Store Name cross-search filter (searches both storeName and storeId)
    if (hasValidStoreNameSearch) {
      const storeNameLower = storeNameSearch.toLowerCase()
      filtered = filtered.filter((store) =>
        (store.storeName && store.storeName.toLowerCase().includes(storeNameLower)) ||
        (store.storeId && store.storeId.toLowerCase().includes(storeNameLower))
      )
    }

    // Apply status filter
    if (filterType === "critical") {
      filtered = filtered.filter((store) => store.criticalStockItems > 0)
    } else if (filterType === "low") {
      filtered = filtered.filter((store) => store.lowStockItems > 0)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const multiplier = sortOrder === "asc" ? 1 : -1

      switch (sortField) {
        case "storeName":
          return multiplier * a.storeName.localeCompare(b.storeName)
        case "storeId":
          return multiplier * (a.storeId || "").localeCompare(b.storeId || "")
        case "totalProducts":
          return multiplier * (a.totalProducts - b.totalProducts)
        case "lowStockItems":
          return multiplier * (a.lowStockItems - b.lowStockItems)
        case "criticalStockItems":
          return multiplier * (a.criticalStockItems - b.criticalStockItems)
        case "healthScore":
          return multiplier * (a.healthScore - b.healthScore)
        case "storeStatus":
          const statusA = a.storeStatus || 'Active'
          const statusB = b.storeStatus || 'Active'
          return multiplier * statusA.localeCompare(statusB)
        default:
          return 0
      }
    })

    return filtered
  }, [storeData, storeIdSearch, storeNameSearch, hasValidStoreIdSearch, hasValidStoreNameSearch, filterType, sortField, sortOrder])

  // Paginated transactions for By Product view
  const paginatedTransactions = useMemo(() => {
    const startIndex = (productViewPage - 1) * productViewPageSize
    return productTransactions.slice(startIndex, startIndex + productViewPageSize)
  }, [productTransactions, productViewPage, productViewPageSize])

  const totalProductPages = Math.ceil(productTransactions.length / productViewPageSize)

  // Create mock InventoryItem from search state for ProductInfoCard
  const mockProductFromSearch = useMemo((): InventoryItem | null => {
    if (!hasAllMandatoryFiltersForProduct) return null

    const productId = productIdSearch || productNameSearch
    const productName = productNameSearch || `Product ${productId}`
    const storeName = byProductStoreNameSearch || byProductStoreIdSearch || "Unknown Store"

    // Use first transaction timestamp if available for last restocked date
    const lastRestocked = productTransactions.length > 0
      ? productTransactions[productTransactions.length - 1].timestamp
      : new Date().toISOString()

    return {
      id: `mock-${productId}`,
      productId,
      productName,
      category: "Pantry",
      storeName,
      storeId: byProductStoreIdSearch || undefined,
      currentStock: 0,
      availableStock: 0,
      reservedStock: 0,
      safetyStock: 0,
      minStockLevel: 0,
      maxStockLevel: 0,
      unitPrice: 0,
      lastRestocked,
      status: "inStock" as const,
      supplier: "Unknown",
      reorderPoint: 0,
      demandForecast: 0,
      imageUrl: "",
      barcode: productIdSearch || undefined,
      itemType: "normal" as const,
      supplyType: "On Hand Available" as const,
      stockConfigStatus: "valid" as const,
    }
  }, [hasAllMandatoryFiltersForProduct, productIdSearch, productNameSearch, byProductStoreIdSearch, byProductStoreNameSearch, productTransactions])

  // Handler for closing the Product Info Card
  const handleCloseProductCard = useCallback(() => {
    setShowProductCard(false)
  }, [])

  // Count completed mandatory filter steps for By Product view
  const completedSteps = useMemo(() => {
    let count = 0
    if (hasValidDateRange) count++
    if (hasValidByProductStoreCriteria) count++
    if (hasValidProductCriteria) count++
    return count
  }, [hasValidDateRange, hasValidByProductStoreCriteria, hasValidProductCriteria])

  // Character counter helper component
  const CharacterCounter = ({ value, minChars, isValid }: { value: string; minChars: number; isValid: boolean }) => (
    <div className={`text-xs mt-1 ${value.length === 0 ? "text-muted-foreground" : isValid ? "text-green-600" : "text-amber-600"}`} role="status" aria-live="polite">
      {value.length}/{minChars} characters
      {value.length > 0 && !isValid && <span className="ml-1">• Enter at least {minChars} characters</span>}
    </div>
  )

  // Filter Step Indicator component
  const FilterStepIndicator = ({ steps }: { steps: Array<{ label: string; completed: boolean }> }) => (
    <div className="flex items-center gap-2" aria-label="Filter completion steps">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center gap-2">
          <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium transition-colors ${
            step.completed
              ? "bg-green-500 text-white"
              : "bg-muted text-muted-foreground border border-amber-400"
          }`} aria-label={`Step ${index + 1}: ${step.label} - ${step.completed ? "complete" : "incomplete"}`}>
            {step.completed ? <CheckCircle className="h-3.5 w-3.5" /> : index + 1}
          </div>
          <span className={`text-xs ${step.completed ? "text-green-600 font-medium" : "text-muted-foreground"}`}>
            {step.label}
          </span>
          {index < steps.length - 1 && (
            <div className={`w-8 h-0.5 ${step.completed ? "bg-green-500" : "bg-muted"}`} />
          )}
        </div>
      ))}
    </div>
  )

  // Clear all filters for By Store view
  const handleClearByStoreFilters = () => {
    clearViewType()
    setStoreIdSearch("")
    setStoreNameSearch("")
    setStoreData([])
  }

  // Handler functions
  const handleRefresh = () => {
    if (viewTab === "by-store") {
      loadData(false)
    } else {
      loadProductTransactions()
    }
  }

  const handleStoreClick = (storeName: string) => {
    // Navigate to main inventory page with store filter
    router.push(`/inventory-new?store=${encodeURIComponent(storeName)}`)
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("desc")
    }
  }

  // CSV Export handler
  const handleExportCSV = () => {
    if (productTransactions.length === 0 || !dateRange.startDate || !dateRange.endDate) return

    const productId = productIdSearch || productNameSearch
    const productName = productNameSearch || `Product ${productId}`

    exportStockCardToCSV(
      productTransactions,
      { productId, productName },
      { startDate: dateRange.startDate, endDate: dateRange.endDate },
      { includeMerchantSku: false }
    )
  }

  // Clear all filters for By Product view
  const handleClearByProductFilters = () => {
    setProductIdSearch("")
    setProductNameSearch("")
    setByProductStoreIdSearch("")
    setByProductStoreNameSearch("")
    setDateRange({ startDate: undefined, endDate: undefined })
    setProductTransactionType("all")
    setSearchNotes("")
    setProductTransactions([])
    setShowProductCard(false) // Hide product card when filters are cleared
  }

  // Sort icon component
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return (
      <span className="ml-1">
        {sortOrder === "asc" ? "↑" : "↓"}
      </span>
    )
  }

  // Error state
  if (error && viewTab === "by-store") {
    return (
      <DashboardShell>
        <div>
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Error Loading Data</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => loadData()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header with Tab Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Stock Card</h1>
            <p className="text-base text-muted-foreground">
              {viewTab === "by-store"
                ? "View inventory performance and stock levels across all store locations"
                : "View transaction history for a specific product"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Enhanced Tab Toggle with Icons */}
            <Tabs value={viewTab} onValueChange={(v) => setViewTab(v as ViewTab)} className="w-fit">
              <TabsList className="grid w-full max-w-md grid-cols-2 h-12 p-1 bg-muted">
                <TabsTrigger
                  value="by-product"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-base font-medium px-6 h-10"
                >
                  <Package className="h-4 w-4 mr-2" aria-hidden="true" />
                  By Product
                </TabsTrigger>
                <TabsTrigger
                  value="by-store"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-base font-medium px-6 h-10"
                >
                  <Store className="h-4 w-4 mr-2" aria-hidden="true" />
                  By Store
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* By Store View Content */}
        {viewTab === "by-store" && (
          <>
            {/* Filters - View Type and Store Search */}
            <div className="flex flex-wrap lg:flex-nowrap items-center gap-4">
              {/* FILTER VALIDATION PATTERN:
                  Orange border indicates mandatory filter that needs completion.
                  - View Type dropdown: Shows orange border when not selected (mandatory)
                  - Store Search: Optional filter for narrowing results */}

              {/* By Store View Filter Validation:
                  - Requires ONLY View Type selected (not "all")
                  - View Type filter: selectedViewType && selectedViewType !== "all"
                  - Store search is OPTIONAL (no longer mandatory)
                  - Orange border shown only on View Type when not selected
                  - fetchStorePerformance() only called when hasAllMandatoryFiltersForStore = true

                  VALIDATION TEST SCENARIOS:
                  1. Initial load: View Type shows orange border, empty state visible
                  2. Select View Type: Orange border removed, data loads
                  3. Store search is optional and filters results when provided */}

              {/* Enhanced View Type Dropdown with Icons */}
              <div className={`${
                !hasViewTypeFilter ? "border border-orange-400 ring-1 ring-orange-400 rounded-md" : ""
              }`}>
                <Select
                  value={selectedViewType || "all"}
                  onValueChange={(v) => {
                    if (v === "all") {
                      clearViewType()
                    } else {
                      setViewType(v)
                    }
                  }}
                >
                  <SelectTrigger className="w-[320px] h-10" aria-label="Select view type">
                    <SelectValue placeholder="Select View Type" />
                  </SelectTrigger>
                  <SelectContent className="w-[320px]">
                    <SelectItem value="all">
                      <span className="flex items-center gap-2">
                        <LayoutGrid className="h-4 w-4 text-muted-foreground" />
                        <span>All View Types</span>
                      </span>
                    </SelectItem>
                    {STOCK_CARD_VIEW_TYPES.map((type) => {
                      const IconComponent = type.icon
                      return (
                        <SelectItem key={type.value} value={type.value}>
                          <span className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4 text-primary" />
                            <span className="flex flex-col">
                              <span className="font-medium">{type.label}</span>
                              <span className="text-xs text-muted-foreground font-mono">{type.value}</span>
                            </span>
                          </span>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Vertical Divider */}
              <div className="h-8 w-px bg-border" />

              {/* Store Search Group (optional filter) */}
              <div className="flex items-center gap-1.5 p-1.5 border border-border/40 rounded-md bg-muted/5">
                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Store</span>

                {/* Store ID Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Store ID"
                    value={storeIdSearch}
                    onChange={(e) => setStoreIdSearch(e.target.value)}
                    className="pl-9 min-w-[140px] h-10"
                  />
                </div>

                {/* Store Name Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Store Name"
                    value={storeNameSearch}
                    onChange={(e) => setStoreNameSearch(e.target.value)}
                    className="pl-9 min-w-[140px] h-10"
                  />
                </div>
              </div>

              {/* Spacer to push buttons to the right */}
              <div className="flex-1" />

              {/* Clear All Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearByStoreFilters}
                disabled={(!selectedViewType || selectedViewType === "all") && !storeIdSearch && !storeNameSearch}
                className="h-10 hover:bg-gray-100 transition-colors"
              >
                Clear All
              </Button>

              {/* Refresh Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadData(false)}
                disabled={loading || !hasAllMandatoryFiltersForStore}
                className="h-10"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>

            {/* Empty State - Show when mandatory filter criteria not met */}
            {!hasAllMandatoryFiltersForStore && (
              <InventoryEmptyState
                message="Select View Type to view stock card"
                subtitle="Choose a view type from the dropdown to load store data."
              />
            )}

            {/* Store Performance Table - Show when filter criteria met */}
            {hasAllMandatoryFiltersForStore && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Store</CardTitle>
                      <CardDescription>
                        {filteredAndSortedStores.length} stores found
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {loading ? (
                    <div className="p-8 text-center">
                      <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                      <p className="text-muted-foreground mt-2">Loading store data...</p>
                    </div>
                  ) : (
                    <>
                      {/* Desktop Table */}
                      <div className="hidden md:block rounded-md border overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead
                                className="w-[300px] cursor-pointer hover:bg-muted/50"
                                onClick={() => handleSort("storeName")}
                              >
                                Store Name <SortIcon field="storeName" />
                              </TableHead>
                              <TableHead
                                className="w-[150px] cursor-pointer hover:bg-muted/50"
                                onClick={() => handleSort("storeId")}
                              >
                                Store ID <SortIcon field="storeId" />
                              </TableHead>
                              <TableHead
                                className="text-center cursor-pointer hover:bg-muted/50"
                                onClick={() => handleSort("totalProducts")}
                              >
                                Total Products <SortIcon field="totalProducts" />
                              </TableHead>
                              <TableHead
                                className="text-center cursor-pointer hover:bg-muted/50"
                                onClick={() => handleSort("lowStockItems")}
                              >
                                Low Stock <SortIcon field="lowStockItems" />
                              </TableHead>
                              <TableHead
                                className="text-center cursor-pointer hover:bg-muted/50"
                                onClick={() => handleSort("criticalStockItems")}
                              >
                                Out of Stock <SortIcon field="criticalStockItems" />
                              </TableHead>
                              <TableHead className="w-[100px]"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredAndSortedStores.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                  No stores match your search criteria.
                                </TableCell>
                              </TableRow>
                            ) : (
                              filteredAndSortedStores.map((store, index) => (
                                <TableRow
                                  key={store.storeId || store.storeName}
                                  className={`cursor-pointer hover:bg-muted/50 transition-colors ${index % 2 === 1 ? 'bg-muted/30' : ''}`}
                                  onClick={() => handleStoreClick(store.storeName)}
                                >
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <MapPin className="h-4 w-4 text-primary" />
                                      <span className="font-medium">{store.storeName}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <span className="text-sm text-muted-foreground font-mono">{store.storeId || "-"}</span>
                                  </TableCell>
                                  <TableCell className="text-center font-semibold">
                                    {store.totalProducts.toLocaleString()}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <Badge
                                      variant="outline"
                                      className={store.lowStockItems > 0 ? "bg-yellow-100 text-yellow-800 border-yellow-200" : ""}
                                    >
                                      {store.lowStockItems}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <Badge
                                      variant="outline"
                                      className={store.criticalStockItems > 0 ? "bg-red-100 text-red-800 border-red-200" : ""}
                                    >
                                      {store.criticalStockItems}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* By Product View Content */}
        {viewTab === "by-product" && (
          <TooltipProvider>
            <div className="space-y-6">
              {/* Desktop Filters - Hidden on mobile */}
              <div className="hidden md:block space-y-4">
                {/* Mandatory Filters Card with Step Indicator */}
                <Card className={`border-2 transition-colors ${
                  hasAllMandatoryFiltersForProduct
                    ? "border-green-500 bg-green-50/30"
                    : "border-amber-400 bg-amber-50/30"
                }`}>
                  <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-lg">Required Filters</CardTitle>
                        <Badge
                          variant="outline"
                          className={`${
                            hasAllMandatoryFiltersForProduct
                              ? "bg-green-100 text-green-700 border-green-300"
                              : "bg-amber-100 text-amber-700 border-amber-300"
                          }`}
                        >
                          {completedSteps} of 3 complete
                        </Badge>
                      </div>
                      <FilterStepIndicator
                        steps={[
                          { label: "Date Range", completed: hasValidDateRange },
                          { label: "Store", completed: hasValidByProductStoreCriteria },
                          { label: "Product", completed: hasValidProductCriteria },
                        ]}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Step 1: Date Range */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={`flex items-center justify-center w-5 h-5 rounded-full text-xs font-medium ${
                          hasValidDateRange ? "bg-green-500 text-white" : "bg-amber-100 text-amber-700 border border-amber-300"
                        }`}>
                          {hasValidDateRange ? <CheckCircle className="h-3 w-3" /> : "1"}
                        </span>
                        <span className="text-sm font-medium">Date Range</span>
                        {hasValidDateRange && <span className="text-xs text-green-600">✓ Complete</span>}
                      </div>
                      <div className="flex items-center gap-2 ml-7">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className={`w-[140px] h-10 justify-start text-left font-normal ${
                                !dateRange.startDate && !hasValidDateRange ? "border-amber-400" : ""
                              }`}
                              aria-label="Select start date"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {dateRange.startDate
                                ? format(dateRange.startDate, "MMM d, yyyy")
                                : "From"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={dateRange.startDate}
                              onSelect={(date) =>
                                setDateRange((prev) => ({ ...prev, startDate: date }))
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <span className="text-muted-foreground">to</span>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className={`w-[140px] h-10 justify-start text-left font-normal ${
                                !dateRange.endDate && !hasValidDateRange ? "border-amber-400" : ""
                              }`}
                              aria-label="Select end date"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {dateRange.endDate
                                ? format(dateRange.endDate, "MMM d, yyyy")
                                : "To"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={dateRange.endDate}
                              onSelect={(date) =>
                                setDateRange((prev) => ({ ...prev, endDate: date }))
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    {/* Step 2: Store */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={`flex items-center justify-center w-5 h-5 rounded-full text-xs font-medium ${
                          hasValidByProductStoreCriteria ? "bg-green-500 text-white" : "bg-amber-100 text-amber-700 border border-amber-300"
                        }`}>
                          {hasValidByProductStoreCriteria ? <CheckCircle className="h-3 w-3" /> : "2"}
                        </span>
                        <span className="text-sm font-medium">Store</span>
                        {hasValidByProductStoreCriteria && <span className="text-xs text-green-600">✓ Complete</span>}
                      </div>
                      <div className="flex flex-col gap-2 ml-7">
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1 max-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Store ID"
                              value={byProductStoreIdSearch}
                              onChange={(e) => setByProductStoreIdSearch(e.target.value)}
                              className={`pl-9 h-10 ${
                                byProductStoreIdSearch && !hasValidByProductStoreIdSearch ? "border-amber-400" : ""
                              }`}
                              aria-label="Store ID search"
                            />
                          </div>
                          <span className="text-muted-foreground text-sm">or</span>
                          <div className="relative flex-1 max-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Store Name"
                              value={byProductStoreNameSearch}
                              onChange={(e) => setByProductStoreNameSearch(e.target.value)}
                              className={`pl-9 h-10 ${
                                byProductStoreNameSearch && !hasValidByProductStoreNameSearch ? "border-amber-400" : ""
                              }`}
                              aria-label="Store name search"
                            />
                          </div>
                        </div>
                        {(byProductStoreIdSearch || byProductStoreNameSearch) && !hasValidByProductStoreCriteria && (
                          <CharacterCounter
                            value={byProductStoreIdSearch || byProductStoreNameSearch}
                            minChars={MIN_SEARCH_CHARS}
                            isValid={hasValidByProductStoreCriteria}
                          />
                        )}
                      </div>
                    </div>

                    {/* Step 3: Product */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={`flex items-center justify-center w-5 h-5 rounded-full text-xs font-medium ${
                          hasValidProductCriteria ? "bg-green-500 text-white" : "bg-amber-100 text-amber-700 border border-amber-300"
                        }`}>
                          {hasValidProductCriteria ? <CheckCircle className="h-3 w-3" /> : "3"}
                        </span>
                        <span className="text-sm font-medium">Product</span>
                        {hasValidProductCriteria && <span className="text-xs text-green-600">✓ Complete</span>}
                      </div>
                      <div className="flex flex-col gap-2 ml-7">
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1 max-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Product ID"
                              value={productIdSearch}
                              onChange={(e) => setProductIdSearch(e.target.value)}
                              className={`pl-9 h-10 ${
                                productIdSearch && !hasValidProductIdSearch ? "border-amber-400" : ""
                              }`}
                              aria-label="Product ID search"
                            />
                          </div>
                          <span className="text-muted-foreground text-sm">or</span>
                          <div className="relative flex-1 max-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Product Name"
                              value={productNameSearch}
                              onChange={(e) => setProductNameSearch(e.target.value)}
                              className={`pl-9 h-10 ${
                                productNameSearch && !hasValidProductNameSearch ? "border-amber-400" : ""
                              }`}
                              aria-label="Product name search"
                            />
                          </div>
                        </div>
                        {(productIdSearch || productNameSearch) && !hasValidProductCriteria && (
                          <CharacterCounter
                            value={productIdSearch || productNameSearch}
                            minChars={MIN_SEARCH_CHARS}
                            isValid={hasValidProductCriteria}
                          />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Optional Filters - Collapsible Section */}
                <Collapsible open={optionalFiltersOpen} onOpenChange={setOptionalFiltersOpen}>
                  <div className="flex items-center gap-4">
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                        <ChevronDown className={`h-4 w-4 transition-transform ${optionalFiltersOpen ? "rotate-180" : ""}`} />
                        <span className="text-sm font-medium">Optional Filters</span>
                        {(productTransactionType !== "all" || searchNotes) && (
                          <Badge variant="secondary" className="text-xs">Active</Badge>
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  <CollapsibleContent className="pt-4">
                    <Card className="border-border/50 bg-muted/10">
                      <CardContent className="pt-4">
                        <div className="flex flex-wrap items-center gap-4">
                          {/* Transaction Type Filter */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground">Transaction Type</label>
                            <Select
                              value={productTransactionType}
                              onValueChange={(v) => setProductTransactionType(v as ProductTransactionType | "all")}
                            >
                              <SelectTrigger className="w-[180px] h-10" aria-label="Filter by transaction type">
                                <SelectValue placeholder="All Types" />
                              </SelectTrigger>
                              <SelectContent>
                                {TRANSACTION_TYPES.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Notes Search */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground">Search Notes</label>
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="Search in notes..."
                                value={searchNotes}
                                onChange={(e) => setSearchNotes(e.target.value)}
                                className="pl-9 w-[240px] h-10"
                                aria-label="Search notes"
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CollapsibleContent>
                </Collapsible>

                {/* Action Buttons Row */}
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={productViewLoading || !hasAllMandatoryFiltersForProduct}
                    className="h-10"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${productViewLoading ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearByProductFilters}
                    disabled={!productIdSearch && !productNameSearch && !byProductStoreIdSearch && !byProductStoreNameSearch && !dateRange.startDate && !dateRange.endDate && productTransactionType === "all" && !searchNotes}
                    className="h-10 hover:bg-gray-100 transition-colors"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportCSV}
                    disabled={productTransactions.length === 0}
                    className="h-10"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </div>

              {/* Mobile: Floating Filter Button */}
              <Button
                variant="outline"
                size="lg"
                className="fixed bottom-4 right-4 shadow-lg md:hidden z-50 h-14 px-6"
                onClick={() => setMobileFiltersOpen(true)}
              >
                <Filter className="h-5 w-5 mr-2" />
                Filters
                {hasAllMandatoryFiltersForProduct && (
                  <CheckCircle className="h-4 w-4 ml-2 text-green-500" />
                )}
                {!hasAllMandatoryFiltersForProduct && completedSteps > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">{completedSteps}/3</Badge>
                )}
              </Button>

              {/* Mobile Filter Sheet */}
              <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Filter Stock Card</SheetTitle>
                    <SheetDescription>
                      Complete all required filters to view transaction history
                    </SheetDescription>
                  </SheetHeader>
                  <div className="space-y-6 py-6">
                    {/* Progress indicator */}
                    <div className="flex items-center justify-center gap-2">
                      <Badge
                        variant="outline"
                        className={`${
                          hasAllMandatoryFiltersForProduct
                            ? "bg-green-100 text-green-700 border-green-300"
                            : "bg-amber-100 text-amber-700 border-amber-300"
                        }`}
                      >
                        {completedSteps} of 3 required filters complete
                      </Badge>
                    </div>

                    {/* Date Range */}
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-sm font-medium">
                        {hasValidDateRange ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <span className="w-4 h-4 rounded-full border-2 border-amber-400 flex items-center justify-center text-xs">1</span>
                        )}
                        Date Range <span className="text-amber-600">*</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="flex-1 h-12 justify-start">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {dateRange.startDate ? format(dateRange.startDate, "MMM d, yyyy") : "From"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={dateRange.startDate}
                              onSelect={(date) => setDateRange((prev) => ({ ...prev, startDate: date }))}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <span className="text-muted-foreground">-</span>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="flex-1 h-12 justify-start">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {dateRange.endDate ? format(dateRange.endDate, "MMM d, yyyy") : "To"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={dateRange.endDate}
                              onSelect={(date) => setDateRange((prev) => ({ ...prev, endDate: date }))}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    {/* Store */}
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-sm font-medium">
                        {hasValidByProductStoreCriteria ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <span className="w-4 h-4 rounded-full border-2 border-amber-400 flex items-center justify-center text-xs">2</span>
                        )}
                        Store <span className="text-amber-600">*</span>
                      </label>
                      <div className="space-y-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Store ID"
                            value={byProductStoreIdSearch}
                            onChange={(e) => setByProductStoreIdSearch(e.target.value)}
                            className="pl-9 h-12"
                          />
                        </div>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Store Name"
                            value={byProductStoreNameSearch}
                            onChange={(e) => setByProductStoreNameSearch(e.target.value)}
                            className="pl-9 h-12"
                          />
                        </div>
                        {(byProductStoreIdSearch || byProductStoreNameSearch) && !hasValidByProductStoreCriteria && (
                          <p className="text-xs text-amber-600">Enter at least 2 characters</p>
                        )}
                      </div>
                    </div>

                    {/* Product */}
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-sm font-medium">
                        {hasValidProductCriteria ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <span className="w-4 h-4 rounded-full border-2 border-amber-400 flex items-center justify-center text-xs">3</span>
                        )}
                        Product <span className="text-amber-600">*</span>
                      </label>
                      <div className="space-y-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Product ID"
                            value={productIdSearch}
                            onChange={(e) => setProductIdSearch(e.target.value)}
                            className="pl-9 h-12"
                          />
                        </div>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Product Name"
                            value={productNameSearch}
                            onChange={(e) => setProductNameSearch(e.target.value)}
                            className="pl-9 h-12"
                          />
                        </div>
                        {(productIdSearch || productNameSearch) && !hasValidProductCriteria && (
                          <p className="text-xs text-amber-600">Enter at least 2 characters</p>
                        )}
                      </div>
                    </div>

                    {/* Optional Filters */}
                    <div className="pt-4 border-t">
                      <label className="text-sm font-medium text-muted-foreground">Optional Filters</label>
                      <div className="mt-3 space-y-3">
                        <Select
                          value={productTransactionType}
                          onValueChange={(v) => setProductTransactionType(v as ProductTransactionType | "all")}
                        >
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Transaction Type" />
                          </SelectTrigger>
                          <SelectContent>
                            {TRANSACTION_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search notes..."
                            value={searchNotes}
                            onChange={(e) => setSearchNotes(e.target.value)}
                            className="pl-9 h-12"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <SheetFooter className="flex-row gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={handleClearByProductFilters}
                      className="flex-1 h-12"
                    >
                      Clear All
                    </Button>
                    <Button
                      onClick={() => setMobileFiltersOpen(false)}
                      disabled={!hasAllMandatoryFiltersForProduct}
                      className="flex-1 h-12"
                    >
                      Apply Filters
                    </Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>

              {/* Enhanced Empty State with Checklist */}
              {!hasAllMandatoryFiltersForProduct && (
                <Card className="border-dashed">
                  <CardContent className="py-12">
                    <div className="flex flex-col items-center">
                      <ClipboardList className="h-16 w-16 text-muted-foreground/50 mb-4" />
                      <p className="text-lg font-medium mb-4">Complete required filters to view stock card</p>
                      <div className="space-y-2">
                        <div className={`flex items-center gap-2 ${hasValidDateRange ? "text-green-600" : "text-amber-600"}`}>
                          {hasValidDateRange ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                          <span>Select date range</span>
                        </div>
                        <div className={`flex items-center gap-2 ${hasValidByProductStoreCriteria ? "text-green-600" : "text-amber-600"}`}>
                          {hasValidByProductStoreCriteria ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                          <span>Enter store ID or name (min. 2 characters)</span>
                        </div>
                        <div className={`flex items-center gap-2 ${hasValidProductCriteria ? "text-green-600" : "text-amber-600"}`}>
                          {hasValidProductCriteria ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                          <span>Enter product ID or name (min. 2 characters)</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Product Info Card - displays above Transaction History when filters are met */}
              {hasAllMandatoryFiltersForProduct && showProductCard && mockProductFromSearch && (
                <ProductInfoCard
                  product={mockProductFromSearch}
                  onClose={handleCloseProductCard}
                  refId={paginatedTransactions[0]?.merchantSku}
                />
              )}

              {/* Transaction History Table */}
              {hasAllMandatoryFiltersForProduct && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Transaction History</CardTitle>
                        <CardDescription>
                          {productTransactions.length} transactions found
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Transaction Type Legend Bar */}
                  <TransactionTypeLegend />

                  <CardContent className="p-0">
                    {productViewLoading ? (
                      /* Skeleton Loading State */
                      <div className="p-4 space-y-3" role="status" aria-label="Loading transactions">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="flex items-center gap-4">
                            <Skeleton className="h-5 w-[140px]" />
                            <Skeleton className="h-6 w-[100px] rounded-full" />
                            <Skeleton className="h-5 w-[60px]" />
                            <Skeleton className="h-5 w-[80px]" />
                            <Skeleton className="h-5 flex-1" />
                          </div>
                        ))}
                        <p className="text-center text-muted-foreground text-sm mt-4">Loading transactions...</p>
                      </div>
                    ) : productTransactions.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16">
                        <ClipboardList className="h-16 w-16 text-muted-foreground/50 mb-4" />
                        <p className="text-lg font-medium text-muted-foreground">
                          No Transactions Found
                        </p>
                        <p className="text-sm text-muted-foreground/70 mt-2">
                          No transactions match your current filter criteria.
                          Try adjusting the date range or filters.
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* Desktop Table */}
                        <div className="hidden md:block rounded-md border overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="text-left min-w-[160px]">Date & Time</TableHead>
                                <TableHead className="text-left w-[180px]">Type</TableHead>
                                <TableHead className="text-center w-[100px]">Qty</TableHead>
                                <TableHead className="text-center w-[120px]">Balance</TableHead>
                                <TableHead className="text-left min-w-[300px]">Notes</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {paginatedTransactions.map((txn, index) => {
                                const simplifiedType = TRANSACTION_TYPE_MAPPING[txn.type]
                                const config = simplifiedTypeConfig[simplifiedType]
                                const quantitySign = getQuantitySign(simplifiedType)

                                // Extract order reference from notes if present (format: "note text (ORD-XXXX)")
                                const orderRefMatch = txn.notes.match(/\((ORD-\d+)\)/)
                                const orderRef = orderRefMatch ? orderRefMatch[1] : null
                                const notesWithoutRef = orderRef ? txn.notes.replace(` (${orderRef})`, "") : txn.notes

                                return (
                                  <TableRow
                                    key={txn.id}
                                    className={index % 2 === 1 ? 'bg-muted/30' : ''}
                                  >
                                    <TableCell className="font-mono text-sm">
                                      {formatTransactionDateTime(txn.timestamp)}
                                    </TableCell>
                                    <TableCell>
                                      <Badge
                                        variant="outline"
                                        className={`${config.badgeClass} flex items-center gap-1 rounded-full px-3 py-1`}
                                      >
                                        {config.icon}
                                        <span>{config.label}</span>
                                      </Badge>
                                    </TableCell>
                                    <TableCell className={`text-right font-semibold ${config.quantityClass}`}>
                                      {quantitySign}{txn.quantity.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                      {txn.balance.toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <div className="cursor-help">
                                            <span className="font-medium">{txn.personName}:</span>{" "}
                                            <span className="text-muted-foreground">{notesWithoutRef}</span>
                                            {orderRef && (
                                              <>
                                                {" "}
                                                <a
                                                  href={`#order-${orderRef}`}
                                                  className="text-blue-600 hover:underline"
                                                  onClick={(e) => e.stopPropagation()}
                                                >
                                                  ({orderRef})
                                                </a>
                                              </>
                                            )}
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-[300px]">
                                          <p><span className="font-medium">{txn.personName}:</span> {txn.notes}</p>
                                          {txn.referenceNo && <p className="text-xs text-muted-foreground mt-1">Ref: {txn.referenceNo}</p>}
                                        </TooltipContent>
                                      </Tooltip>
                                    </TableCell>
                                  </TableRow>
                                )
                              })}
                            </TableBody>
                          </Table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden space-y-3 p-4">
                          {paginatedTransactions.map((txn) => {
                            const simplifiedType = TRANSACTION_TYPE_MAPPING[txn.type]
                            const config = simplifiedTypeConfig[simplifiedType]
                            const quantitySign = getQuantitySign(simplifiedType)

                            // Extract order reference from notes if present
                            const orderRefMatch = txn.notes.match(/\((ORD-\d+)\)/)
                            const orderRef = orderRefMatch ? orderRefMatch[1] : null
                            const notesWithoutRef = orderRef ? txn.notes.replace(` (${orderRef})`, "") : txn.notes

                            return (
                              <Card key={txn.id} className="overflow-hidden">
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between mb-3">
                                    <Badge
                                      variant="outline"
                                      className={`${config.badgeClass} flex items-center gap-1 rounded-full px-3 py-1`}
                                    >
                                      {config.icon}
                                      <span>{config.label}</span>
                                    </Badge>
                                    <span className="text-xs text-muted-foreground font-mono">
                                      {formatTransactionDateTime(txn.timestamp)}
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <div className="text-xs text-muted-foreground">Quantity</div>
                                      <div className={`text-lg font-semibold ${config.quantityClass}`}>
                                        {quantitySign}{txn.quantity.toLocaleString()}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-xs text-muted-foreground">Balance</div>
                                      <div className="text-lg font-semibold">
                                        {txn.balance.toLocaleString()}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Notes Section */}
                                  <div className="mt-3 pt-3 border-t">
                                    <div className="text-xs text-muted-foreground">Notes</div>
                                    <div className="text-sm mt-1">
                                      <span className="font-medium">{txn.personName}:</span>{" "}
                                      <span className="text-muted-foreground">{notesWithoutRef}</span>
                                      {orderRef && (
                                        <>
                                          {" "}
                                          <a
                                            href={`#order-${orderRef}`}
                                            className="text-blue-600 hover:underline"
                                          >
                                            ({orderRef})
                                          </a>
                                        </>
                                      )}
                                    </div>
                                  </div>

                                </CardContent>
                              </Card>
                            )
                          })}
                        </div>

                        {/* Pagination */}
                        {totalProductPages > 1 && (
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">Show</span>
                              <Select
                                value={productViewPageSize.toString()}
                                onValueChange={(v) => {
                                  setProductViewPageSize(parseInt(v))
                                  setProductViewPage(1)
                                }}
                              >
                                <SelectTrigger className="w-[80px] h-9">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="10">10</SelectItem>
                                  <SelectItem value="25">25</SelectItem>
                                  <SelectItem value="50">50</SelectItem>
                                  <SelectItem value="100">100</SelectItem>
                                </SelectContent>
                              </Select>
                              <span className="text-sm text-muted-foreground">per page</span>
                            </div>

                            <div className="text-sm text-muted-foreground">
                              Showing {((productViewPage - 1) * productViewPageSize) + 1} - {Math.min(productViewPage * productViewPageSize, productTransactions.length)} of {productTransactions.length} records
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setProductViewPage((p) => Math.max(1, p - 1))}
                                disabled={productViewPage <= 1}
                                className="h-9"
                              >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Previous
                              </Button>
                              <span className="text-sm text-muted-foreground px-2">
                                Page {productViewPage} of {totalProductPages}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setProductViewPage((p) => Math.min(totalProductPages, p + 1))}
                                disabled={productViewPage >= totalProductPages}
                                className="h-9"
                              >
                                Next
                                <ChevronRight className="h-4 w-4 ml-1" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TooltipProvider>
        )}
      </div>
    </DashboardShell>
  )
}
