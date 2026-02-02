"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Search,
    RefreshCw,
    Loader2,
} from "lucide-react"
import { fetchInventoryData } from "@/lib/inventory-service"
import type { InventoryItem } from "@/types/inventory"
import { InventoryEmptyState } from "@/components/inventory/inventory-empty-state"
import { PaginationControls } from "@/components/pagination-controls"

// View Types from requirements
const VIEW_TYPES = [
    { value: "ECOM-TH-CFR-LOCD-STD", label: "ECOM-TH-CFR-LOCD-STD", description: "CFR - TOL Channel (TOL)" },
    { value: "ECOM-TH-CFR-LOCD-MKP", label: "ECOM-TH-CFR-LOCD-MKP", description: "CFR - MKP Channel (MKP)" },
    { value: "MKP-TH-CFR-LOCD-STD", label: "MKP-TH-CFR-LOCD-STD", description: "CFR - QC Channel (QC)" },
    { value: "ECOM-TH-DSS-NW-STD", label: "ECOM-TH-DSS-NW-STD", description: "DS - Standard Delivery & Pickup (STD)" },
    { value: "ECOM-TH-DSS-LOCD-EXP", label: "ECOM-TH-DSS-LOCD-EXP", description: "DS - 3H Delivery & 1H Pickup (EXP)" },
]

type SortField = "storeId" | "productId" | "currentStock" | "availableStock" | "supplyType"
type SortOrder = "asc" | "desc"

export default function InventorySupplyPage() {
    const router = useRouter()

    // Filter States
    const [storeId, setStoreId] = useState("")
    const [storeName, setStoreName] = useState("")
    const [productId, setProductId] = useState("")
    const [productName, setProductName] = useState("")
    const [supplyType, setSupplyType] = useState<string>("all")
    const [viewType, setViewType] = useState<string>("all")

    // Pagination States
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(25)

    // Data States
    const [data, setData] = useState<InventoryItem[]>([])
    const [initialLoading, setInitialLoading] = useState(false) // For full skeleton on initial/error retry
    const [filterLoading, setFilterLoading] = useState(false)   // For inline loading during typing
    const [refreshing, setRefreshing] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Debounce timeout ref
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Check if at least one search field has a value (View Type and Supply Type do NOT count)
    const hasValidSearchCriteria = useMemo(() => {
        return (
            storeId.trim() !== "" ||
            storeName.trim() !== "" ||
            productId.trim() !== "" ||
            productName.trim() !== ""
        )
    }, [storeId, storeName, productId, productName])

    // Sorting state
    const [sortField, setSortField] = useState<SortField>("storeId")
    const [sortOrder, setSortOrder] = useState<SortOrder>("asc")

    // Fetch Data - Only when valid search criteria exists
    // loadType: 'initial' for full skeleton, 'filter' for inline loading, 'refresh' for refresh button
    const loadData = async (loadType: 'initial' | 'filter' | 'refresh' = 'initial') => {
        // Don't fetch if no valid search criteria (must have at least one search field)
        const currentHasValidCriteria =
            storeId.trim() !== "" ||
            storeName.trim() !== "" ||
            productId.trim() !== "" ||
            productName.trim() !== ""

        if (!currentHasValidCriteria) {
            setInitialLoading(false)
            setFilterLoading(false)
            setData([])
            return
        }

        // Set appropriate loading state based on load type
        if (loadType === 'initial') {
            setInitialLoading(true)
        } else if (loadType === 'filter') {
            setFilterLoading(true)
        } else {
            setRefreshing(true)
        }
        setError(null)

        try {
            // Fetch all items to perform client-side filtering for this specific view
            const response = await fetchInventoryData({ pageSize: 2000 })
            setData(response.items)
        } catch (error) {
            console.error("Failed to load inventory supply data", error)
            setError("Failed to load inventory data. Please try again.")
        } finally {
            setInitialLoading(false)
            setFilterLoading(false)
            setRefreshing(false)
        }
    }

    // Load data when search criteria changes with debouncing
    useEffect(() => {
        // Clear any existing timeout
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current)
        }

        // Set a new timeout to call loadData after 400ms of no typing
        debounceTimeoutRef.current = setTimeout(() => {
            loadData('filter')
        }, 400)

        // Cleanup on unmount or dependency change
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current)
            }
        }
    }, [storeId, storeName, productId, productName])

    // Reset to page 1 when any filter changes
    useEffect(() => {
        setCurrentPage(1)
    }, [storeId, storeName, productId, productName, supplyType, viewType])

    // Filter Logic
    const filteredData = useMemo(() => {
        // Determine search mode - distinguish between store-based and item-based searches
        // Store filters should ONLY apply when user explicitly provides store criteria
        const hasStoreSearch = storeId.trim() !== "" || storeName.trim() !== ""

        let filtered = data.filter(item => {
            // Store filters - ONLY apply if user provided store criteria
            // When doing item-only search (Product ID or Product Name), show ALL stores with matching items
            if (hasStoreSearch) {
                // Store ID (Location ID) Filter - only search storeId field
                if (storeId) {
                    const storeIdLower = storeId.toLowerCase()
                    const matchesStoreId = item.storeId && item.storeId.toLowerCase().includes(storeIdLower)
                    if (!matchesStoreId) {
                        return false
                    }
                }

                // Store Name Filter - only search storeName field
                if (storeName) {
                    const storeNameLower = storeName.toLowerCase()
                    const matchesStoreName = item.storeName && item.storeName.toLowerCase().includes(storeNameLower)
                    if (!matchesStoreName) {
                        return false
                    }
                }
            }

            // Item filters - always apply when provided
            // Product ID Filter
            if (productId && !item.productId.toLowerCase().includes(productId.toLowerCase())) {
                return false
            }

            // Product Name Filter
            if (productName && (!item.productName || !item.productName.toLowerCase().includes(productName.toLowerCase()))) {
                return false
            }

            // Supply Type Filter
            if (supplyType !== "all" && item.supplyType !== supplyType) {
                return false
            }

            // View Type Filter (Strict)
            // Only filter when viewType is selected AND item has a view property
            // Items without a view property pass through when no specific view is selected
            if (viewType !== "all" && item.view && item.view !== viewType) {
                return false
            }

            return true
        })

        // Apply sorting
        filtered.sort((a, b) => {
            const multiplier = sortOrder === "asc" ? 1 : -1

            switch (sortField) {
                case "storeId":
                    return multiplier * (a.storeId || "").localeCompare(b.storeId || "")
                case "productId":
                    return multiplier * a.productId.localeCompare(b.productId)
                case "currentStock":
                    return multiplier * (a.currentStock - b.currentStock)
                case "availableStock":
                    return multiplier * (a.availableStock - b.availableStock)
                case "supplyType":
                    return multiplier * (a.supplyType || "").localeCompare(b.supplyType || "")
                default:
                    return 0
            }
        })

        return filtered
    }, [data, storeId, storeName, productId, productName, supplyType, viewType, sortField, sortOrder])

    // Pagination logic
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize
        return filteredData.slice(startIndex, startIndex + pageSize)
    }, [filteredData, currentPage, pageSize])

    const totalPages = useMemo(() => {
        return Math.ceil(filteredData.length / pageSize)
    }, [filteredData.length, pageSize])

    const handleClear = () => {
        setStoreId("")
        setStoreName("")
        setProductId("")
        setProductName("")
        setSupplyType("all")
        setViewType("all")
        setCurrentPage(1)
    }

    // Pagination handlers
    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    const handlePageSizeChange = (size: number) => {
        setPageSize(size)
        setCurrentPage(1)
    }

    const handleRefresh = () => {
        loadData('refresh')
    }

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc")
        } else {
            setSortField(field)
            setSortOrder("asc")
        }
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

    // Loading skeleton - only for initial load (not filter changes)
    if (initialLoading) {
        return (
            <DashboardShell>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
                            <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
                        </div>
                    </div>
                    <div className="h-64 bg-gray-200 rounded animate-pulse" />
                </div>
            </DashboardShell>
        )
    }

    // Error state
    if (error) {
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
            <div className="space-y-4">
                {/* Header - Match stores page layout */}
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <h1 className="text-2xl font-semibold tracking-tight">Inventory</h1>
                        <p className="text-muted-foreground mt-1">
                            View and manage inventory supply levels across all stores and items
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={refreshing}
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                            Refresh
                        </Button>
                    </div>
                </div>

                {/* Filter Bar - Grid layout with labels above inputs */}
                <div className="space-y-4">
                    {/* Row 1: Text Search Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground">Store ID</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search Store ID..."
                                    value={storeId}
                                    onChange={(e) => setStoreId(e.target.value)}
                                    className="min-w-[160px] h-9 pl-9 text-sm placeholder:transition-opacity placeholder:duration-200 focus:placeholder:opacity-0"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground">Store Name</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search Store Name..."
                                    value={storeName}
                                    onChange={(e) => setStoreName(e.target.value)}
                                    className="min-w-[160px] h-9 pl-9 text-sm placeholder:transition-opacity placeholder:duration-200 focus:placeholder:opacity-0"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground">Product ID</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search Product ID..."
                                    value={productId}
                                    onChange={(e) => setProductId(e.target.value)}
                                    className="min-w-[160px] h-9 pl-9 text-sm placeholder:transition-opacity placeholder:duration-200 focus:placeholder:opacity-0"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground">Product Name</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search Product Name..."
                                    value={productName}
                                    onChange={(e) => setProductName(e.target.value)}
                                    className="min-w-[160px] h-9 pl-9 text-sm placeholder:transition-opacity placeholder:duration-200 focus:placeholder:opacity-0"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Dropdowns and Actions */}
                    <div className="flex flex-wrap items-end gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground">Supply Type</label>
                            <Select value={supplyType} onValueChange={setSupplyType}>
                                <SelectTrigger className="w-[180px] h-9">
                                    <SelectValue placeholder="All Supply Types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Supply Types</SelectItem>
                                    <SelectItem value="On Hand Available">On Hand</SelectItem>
                                    <SelectItem value="Pre-Order">Pre-Order</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground">View Type</label>
                            <Select value={viewType} onValueChange={setViewType}>
                                <SelectTrigger className="w-[280px] h-9">
                                    <SelectValue placeholder="All View Types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All View Types</SelectItem>
                                    {VIEW_TYPES.map(vt => (
                                        <SelectItem key={vt.value} value={vt.value}>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{vt.label}</span>
                                                <span className="text-xs text-muted-foreground">{vt.description}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex-1" />

                        <div className="flex items-center gap-2">
                            {/* Inline loading indicator for filter changes */}
                            {filterLoading && (
                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Loading...</span>
                                </div>
                            )}

                            {/* Clear All Button */}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClear}
                                disabled={!storeId && !storeName && !productId && !productName && supplyType === "all" && viewType === "all"}
                                className="h-9 hover:bg-gray-100"
                            >
                                Clear All
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Empty State - Show when no valid search criteria */}
                {!hasValidSearchCriteria && (
                    <InventoryEmptyState
                        message={
                            viewType !== "all"
                                ? "Please enter search criteria to view inventory for the selected view type"
                                : "Please enter a Store ID, Store Name, Product ID, or Item Name to search inventory"
                        }
                        subtitle="Use the search fields above to find inventory data"
                    />
                )}

                {/* Results Table - Only show when valid search criteria exists */}
                {hasValidSearchCriteria && (
                    <Card>
                        <CardContent className="p-0">
                            <div className="rounded-md border overflow-x-auto">
                                <Table className="table-auto w-full">
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead
                                                className="whitespace-nowrap cursor-pointer hover:bg-muted/50"
                                                onClick={() => handleSort("storeId")}
                                            >
                                                <div className="flex items-center">
                                                    Store ID
                                                    <SortIcon field="storeId" />
                                                </div>
                                            </TableHead>
                                            <TableHead className="whitespace-nowrap">
                                                Store Name
                                            </TableHead>
                                            <TableHead
                                                className="whitespace-nowrap cursor-pointer hover:bg-muted/50"
                                                onClick={() => handleSort("productId")}
                                            >
                                                <div className="flex items-center">
                                                    Product ID
                                                    <SortIcon field="productId" />
                                                </div>
                                            </TableHead>
                                            <TableHead>
                                                Product Name
                                            </TableHead>
                                            <TableHead
                                                className="whitespace-nowrap text-center cursor-pointer hover:bg-muted/50"
                                                onClick={() => handleSort("supplyType")}
                                            >
                                                <div className="flex items-center justify-center">
                                                    Supply Type
                                                    <SortIcon field="supplyType" />
                                                </div>
                                            </TableHead>
                                            <TableHead
                                                className="whitespace-nowrap text-right cursor-pointer hover:bg-muted/50"
                                                onClick={() => handleSort("availableStock")}
                                            >
                                                <div className="flex items-center justify-end">
                                                    Available Qty
                                                    <SortIcon field="availableStock" />
                                                </div>
                                            </TableHead>
                                            <TableHead
                                                className="whitespace-nowrap text-right cursor-pointer hover:bg-muted/50"
                                                onClick={() => handleSort("currentStock")}
                                            >
                                                <div className="flex items-center justify-end">
                                                    Total Qty
                                                    <SortIcon field="currentStock" />
                                                </div>
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredData.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="h-64">
                                                    <div className="flex flex-col items-center justify-center space-y-3">
                                                        <div className="rounded-full bg-muted p-3">
                                                            <Search className="h-6 w-6 text-muted-foreground" />
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-sm font-medium">No results found</p>
                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                Try adjusting your filters or search terms
                                                            </p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            paginatedData.map((item, index) => (
                                                <TableRow key={item.id} className={`hover:bg-muted/50 transition-colors ${index % 2 === 1 ? 'bg-muted/30' : ''}`}>
                                                    <TableCell className="font-medium text-sm">
                                                        {item.storeId || "—"}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                                        {item.storeName || "—"}
                                                    </TableCell>
                                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                                        {item.productId}
                                                    </TableCell>
                                                    <TableCell className="text-sm">
                                                        {item.productName || "—"}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${item.supplyType === "Pre-Order"
                                                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                                            : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                                            }`}>
                                                            {item.supplyType === "On Hand Available" ? "On Hand" : (item.supplyType || "On Hand")}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <span className={`text-sm font-semibold ${item.availableStock > 0
                                                            ? "text-green-600"
                                                            : "text-red-600"
                                                            }`}>
                                                            {item.availableStock.toLocaleString()}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <span className="text-sm text-muted-foreground">
                                                            {item.currentStock.toLocaleString()}
                                                        </span>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                            {/* Pagination Footer */}
                            <div className="border-t px-4 py-4">
                                <PaginationControls
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    pageSize={pageSize}
                                    totalItems={filteredData.length}
                                    onPageChange={handlePageChange}
                                    onPageSizeChange={handlePageSizeChange}
                                    isLoading={filterLoading}
                                />
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardShell>
    )
}
