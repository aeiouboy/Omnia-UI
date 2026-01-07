"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Upload,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  Package,
  Clock,
  FolderArchive,
  FileX,
  CalendarDays,
  CheckCircle,
  AlertCircle,
  List,
  Calendar as CalendarIcon,
  X,
} from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { FileUploadModal } from "@/components/stock-config/file-upload-modal"
import { ValidationResultsTable } from "@/components/stock-config/validation-results-table"
import { StockConfigTable } from "@/components/stock-config/stock-config-table"
import { ProcessingProgressModal } from "@/components/stock-config/processing-progress-modal"
import { PostProcessingReport } from "@/components/stock-config/post-processing-report"
import { UploadHistoryTable } from "@/components/stock-config/upload-history-table"
import {
  getStockConfigs,
  getFileHistory,
  saveStockConfig,
  processFileLineByLine,
  addToFileHistory,
  generateErrorsOnlyReport,
} from "@/lib/stock-config-service"
import type {
  StockConfigItem,
  StockConfigFilters,
  StockConfigFile,
  SupplyTypeID,
  FileParseResult,
  ParsedStockConfigRow,
  ProcessingResult,
  ProcessingStatus,
} from "@/types/stock-config"
import { useToast } from "@/hooks/use-toast"

type SupplyTab = "all" | "PreOrder" | "OnHand"
type SortField = "locationId" | "itemId" | "quantity" | "supplyTypeId" | "createdAt"

export default function StockConfigPage() {
  const { toast } = useToast()

  // State management
  const [stockConfigs, setStockConfigs] = useState<StockConfigItem[]>([])
  const [fileHistory, setFileHistory] = useState<StockConfigFile[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [validationModalOpen, setValidationModalOpen] = useState(false)
  const [currentParseResult, setCurrentParseResult] = useState<FileParseResult | null>(null)

  // Processing workflow state
  const [processingModalOpen, setProcessingModalOpen] = useState(false)
  const [processingFile, setProcessingFile] = useState<StockConfigFile | null>(null)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [processingCurrentRow, setProcessingCurrentRow] = useState(0)
  const [processingSuccessCount, setProcessingSuccessCount] = useState(0)
  const [processingErrorCount, setProcessingErrorCount] = useState(0)
  const [processingComplete, setProcessingComplete] = useState(false)
  const [processingResults, setProcessingResults] = useState<ProcessingResult[]>([])
  const abortControllerRef = useRef<AbortController | null>(null)

  // Ref for scrolling to Upload History section
  const uploadHistorySectionRef = useRef<HTMLDivElement>(null)

  // Post-processing report state
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [reportFile, setReportFile] = useState<StockConfigFile | null>(null)
  const [reportResults, setReportResults] = useState<ProcessingResult[]>([])

  // Filter state
  const [activeTab, setActiveTab] = useState<SupplyTab>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [frequencyFilter, setFrequencyFilter] = useState<"all" | "Daily" | "One-time">("all")
  const [sortField, setSortField] = useState<SortField>("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [uploadHistoryFilter, setUploadHistoryFilter] = useState<"all" | "pending" | "processed" | "error">("all")
  const [uploadHistoryDateRange, setUploadHistoryDateRange] = useState<{
    startDate: Date | undefined
    endDate: Date | undefined
  }>({ startDate: undefined, endDate: undefined })
  const [uploadHistorySearch, setUploadHistorySearch] = useState("")
  const [configDateRange, setConfigDateRange] = useState<{
    startDate: Date | undefined
    endDate: Date | undefined
  }>({ startDate: undefined, endDate: undefined })

  // Pagination state
  const [page, setPage] = useState(1)
  const [pageSize] = useState(25)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  // Build filters
  const filters: StockConfigFilters = useMemo(() => {
    // Map tab values to actual data values
    let supplyType: "all" | SupplyTypeID = "all"
    if (activeTab === "OnHand") {
      supplyType = "On Hand Available"
    } else if (activeTab === "PreOrder") {
      supplyType = "PreOrder"
    }

    return {
      supplyType,
      frequency: frequencyFilter === "all" ? "all" : frequencyFilter,
      searchQuery,
      page,
      pageSize,
      sortBy: sortField,
      sortOrder,
    }
  }, [activeTab, frequencyFilter, searchQuery, page, pageSize, sortField, sortOrder])

  // Load data
  const loadData = useCallback(async (showLoadingState = true) => {
    if (showLoadingState) {
      setLoading(true)
    } else {
      setRefreshing(true)
    }

    try {
      const [configsResponse, historyResponse] = await Promise.all([
        getStockConfigs(filters),
        getFileHistory("all"),
      ])

      setStockConfigs(configsResponse.items)
      setTotalPages(configsResponse.totalPages)
      setTotalItems(configsResponse.total)
      setFileHistory(historyResponse.files)
    } catch (error) {
      console.error("Failed to load stock config data:", error)
      toast({
        title: "Error",
        description: "Failed to load data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [filters, toast])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Filter stock configs by date range
  const filteredStockConfigs = useMemo(() => {
    const { startDate, endDate } = configDateRange
    if (!startDate && !endDate) return stockConfigs

    return stockConfigs.filter((config) => {
      if (!config.startDate) return false

      const configDate = new Date(config.startDate)
      const configDateOnly = new Date(configDate.getFullYear(), configDate.getMonth(), configDate.getDate())

      if (startDate && endDate) {
        const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
        const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
        return configDateOnly >= startDateOnly && configDateOnly <= endDateOnly
      } else if (startDate) {
        const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
        return configDateOnly >= startDateOnly
      } else if (endDate) {
        const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
        return configDateOnly <= endDateOnly
      }
      return true
    })
  }, [stockConfigs, configDateRange])

  // Handlers
  const handleRefresh = () => {
    loadData(false)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setPage(1)
  }

  const handleFrequencyChange = (value: string) => {
    setFrequencyFilter(value as "all" | "Daily" | "One-time")
    setPage(1)
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value as SupplyTab)
    setPage(1)
  }

  const handleSort = (field: SortField, order: "asc" | "desc") => {
    setSortField(field)
    setSortOrder(order)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleUploadComplete = async (result: FileParseResult, validRows: ParsedStockConfigRow[]) => {
    try {
      // Convert parsed rows to stock config items
      const items = validRows.map((row) => ({
        locationId: row.locationId,
        itemId: row.itemId,
        sku: row.sku,
        quantity: row.quantity!,
        supplyTypeId: row.supplyTypeId as SupplyTypeID,
        frequency: row.frequency as "Onetime" | "Daily",
        safetyStock: row.safetyStock!,
        startDate: row.startDate || undefined,
        endDate: row.endDate || undefined,
      }))

      await saveStockConfig(items)

      toast({
        title: "Upload Successful",
        description: `${validRows.length} records have been uploaded successfully.`,
      })

      // Refresh data
      loadData(false)
    } catch (error) {
      console.error("Failed to save stock configs:", error)
      toast({
        title: "Upload Failed",
        description: "Failed to save stock configurations. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleReviewResults = (result: FileParseResult) => {
    setCurrentParseResult(result)
    setUploadModalOpen(false)
    setValidationModalOpen(true)
  }

  // Handle validation modal close - return to upload modal instead of closing everything
  const handleValidationModalClose = (open: boolean) => {
    if (!open && currentParseResult) {
      // User is closing validation modal - return to upload modal
      setValidationModalOpen(false)
      setUploadModalOpen(true)
    } else {
      setValidationModalOpen(open)
    }
  }

  const handleStartProcessing = async (result: FileParseResult) => {
    // Create file record
    const file: StockConfigFile = {
      id: `FILE${Date.now()}`,
      filename: result.filename,
      status: "pending",
      uploadDate: new Date().toISOString(),
      recordCount: result.totalRows,
      validRecords: result.validRows,
      invalidRecords: result.invalidRows,
      folder: "pending",
      uploadedBy: "Current User",
      processingStatus: "processing",
      processingProgress: 0,
      successCount: 0,
      errorCount: 0,
    }

    setProcessingFile(file)
    setProcessingProgress(0)
    setProcessingCurrentRow(0)
    setProcessingSuccessCount(0)
    setProcessingErrorCount(0)
    setProcessingComplete(false)
    setProcessingResults([])
    setProcessingModalOpen(true)

    // Add to file history
    addToFileHistory(file)
    setFileHistory((prev) => [file, ...prev])

    // Start processing
    abortControllerRef.current = new AbortController()

    try {
      const results = await processFileLineByLine(
        result.rows,
        (progress, current, success, errors) => {
          setProcessingProgress(progress)
          setProcessingCurrentRow(current)
          setProcessingSuccessCount(success)
          setProcessingErrorCount(errors)
        },
        abortControllerRef.current.signal
      )

      setProcessingResults(results)
      setProcessingComplete(true)

      // Determine final status
      const successCount = results.filter((r) => r.status === "success").length
      const errorCount = results.filter((r) => r.status === "error").length
      let processingStatus: ProcessingStatus = "completed"
      let folder: "arch" | "err" = "arch"

      if (errorCount === results.length) {
        processingStatus = "error"
        folder = "err"
      } else if (errorCount > 0) {
        processingStatus = "partial"
        folder = "err"
      }

      // Update file in history
      const updatedFile: StockConfigFile = {
        ...file,
        status: processingStatus === "completed" ? "processed" : "error",
        folder,
        processingStatus,
        processingProgress: 100,
        successCount,
        errorCount,
        processedAt: new Date().toISOString(),
        processingResults: results,
      }

      setProcessingFile(updatedFile)
      setFileHistory((prev) =>
        prev.map((f) => (f.id === file.id ? updatedFile : f))
      )

      toast({
        title: processingStatus === "completed" ? "Processing Complete" : "Processing Complete with Errors",
        description:
          processingStatus === "completed"
            ? `All ${successCount} rows processed successfully.`
            : `${successCount} rows succeeded, ${errorCount} rows failed.`,
        variant: processingStatus === "completed" ? "default" : "destructive",
      })
    } catch (error) {
      if ((error as Error).message === "Processing cancelled by user") {
        toast({
          title: "Processing Cancelled",
          description: `Processing was cancelled. ${processingSuccessCount} rows were processed.`,
        })
      } else {
        console.error("Processing error:", error)
        toast({
          title: "Processing Error",
          description: "An error occurred during processing.",
          variant: "destructive",
        })
      }

      // Update file status
      const updatedFile: StockConfigFile = {
        ...file,
        status: "error",
        folder: "err",
        processingStatus: "error",
        errorMessage: (error as Error).message,
      }
      setProcessingFile(updatedFile)
      setFileHistory((prev) =>
        prev.map((f) => (f.id === file.id ? updatedFile : f))
      )
      setProcessingComplete(true)
    }
  }

  const handleCancelProcessing = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }

  const handleViewProcessingReport = () => {
    if (processingFile && processingResults.length > 0) {
      setReportFile(processingFile)
      setReportResults(processingResults)
      setProcessingModalOpen(false)
      setReportModalOpen(true)
    }
  }

  const handleViewFileReport = (file: StockConfigFile) => {
    if (file.processingResults && file.processingResults.length > 0) {
      setReportFile(file)
      setReportResults(file.processingResults)
      setReportModalOpen(true)
    }
  }

  const handleDownloadProcessingErrors = useCallback(() => {
    if (processingResults.length === 0) return

    const blob = generateErrorsOnlyReport(processingResults)
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    const baseFilename = processingFile?.filename?.replace(/\.[^/.]+$/, "") || "stock-config"
    a.download = `errors-${baseFilename}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [processingResults, processingFile?.filename])

  const handleRetryFailedRows = (failedResults: ProcessingResult[]) => {
    // Close report modal and open upload modal so user can upload corrected CSV
    setReportModalOpen(false)
    setUploadModalOpen(true)
  }

  const handleViewConfig = (item: StockConfigItem) => {
    // TODO: Implement view details modal
    console.log("View config:", item)
  }

  const handleDeleteConfig = (item: StockConfigItem) => {
    // TODO: Implement delete confirmation
    console.log("Delete config:", item)
  }

  const handleScrollToUploadHistory = (filter?: "all" | "pending" | "processed" | "error") => {
    if (filter) {
      setUploadHistoryFilter(filter)
    }
    uploadHistorySectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  // Summary stats
  const summaryStats = useMemo(() => {
    const totalConfigs = totalItems
    const dailyConfigs = stockConfigs.filter((config) => config.frequency === "Daily").length
    const oneTimeConfigs = stockConfigs.filter((config) => config.frequency === "One-time" || config.frequency === "Onetime").length
    const pending = fileHistory.filter((f) => f.folder === "pending" || f.processingStatus === "processing").length
    const processed = fileHistory.filter((f) => f.folder === "arch" || f.processingStatus === "completed").length
    const errors = fileHistory.filter((f) => f.folder === "err" || f.processingStatus === "error" || f.processingStatus === "partial").length
    return { totalConfigs, dailyConfigs, oneTimeConfigs, pending, processed, errors }
  }, [fileHistory, stockConfigs, totalItems])

  // Filtered file history based on upload history filter, search, and date range
  const filteredFileHistory = useMemo(() => {
    // First apply status filter
    let filtered = fileHistory
    switch (uploadHistoryFilter) {
      case "pending":
        filtered = fileHistory.filter(
          (f) =>
            f.status === "pending" ||
            f.processingStatus === "processing" ||
            f.processingStatus === "validating"
        )
        break
      case "processed":
        filtered = fileHistory.filter(
          (f) =>
            f.status === "processed" ||
            f.status === "validated" ||
            f.processingStatus === "completed"
        )
        break
      case "error":
        filtered = fileHistory.filter(
          (f) =>
            f.status === "error" ||
            f.processingStatus === "error" ||
            f.processingStatus === "partial"
        )
        break
      case "all":
      default:
        break
    }

    // Then apply search filter
    if (uploadHistorySearch) {
      filtered = filtered.filter((f) =>
        f.filename.toLowerCase().includes(uploadHistorySearch.toLowerCase())
      )
    }

    // Then apply date range filter
    const { startDate, endDate } = uploadHistoryDateRange
    if (startDate || endDate) {
      filtered = filtered.filter((f) => {
        const fileDate = new Date(f.uploadDate)
        // Normalize to start of day for comparison
        const fileDateOnly = new Date(fileDate.getFullYear(), fileDate.getMonth(), fileDate.getDate())

        if (startDate && endDate) {
          const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
          const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
          return fileDateOnly >= startDateOnly && fileDateOnly <= endDateOnly
        } else if (startDate) {
          const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
          return fileDateOnly >= startDateOnly
        } else if (endDate) {
          const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
          return fileDateOnly <= endDateOnly
        }
        return true
      })
    }

    return filtered
  }, [fileHistory, uploadHistoryFilter, uploadHistorySearch, uploadHistoryDateRange])

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Stock Configuration</h1>
            <p className="text-muted-foreground">
              Manage PreOrder, Override OnHand, and Safety Stock configurations
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button onClick={() => setUploadModalOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Config
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Configurations</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryStats.totalConfigs}</div>
              <p className="text-xs text-muted-foreground">Active stock configs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Configs</CardTitle>
              <CalendarDays className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{summaryStats.dailyConfigs}</div>
              <p className="text-xs text-muted-foreground">On Hand Available</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">One-time Configs</CardTitle>
              <Clock className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{summaryStats.oneTimeConfigs}</div>
              <p className="text-xs text-muted-foreground">PreOrder</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 cursor-pointer transition-colors hover:bg-accent/50" onClick={() => handleScrollToUploadHistory("all")}>
              <CardTitle className="text-sm font-medium">Upload Status</CardTitle>
              <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {/* Pending Status */}
                <div
                  className={`flex items-center gap-2 cursor-pointer transition-colors hover:bg-accent/50 -mx-2 px-2 py-1 rounded ${summaryStats.pending === 0 ? "opacity-50 text-muted-foreground" : ""}`}
                  onClick={() => handleScrollToUploadHistory("pending")}
                >
                  <Clock className="h-4 w-4 text-amber-500 flex-shrink-0" />
                  <span className="text-sm font-medium flex-1">Pending</span>
                  <Badge variant={summaryStats.pending > 0 ? "default" : "outline"} className={summaryStats.pending > 0 ? "bg-amber-500 hover:bg-amber-600" : ""}>
                    {summaryStats.pending}
                  </Badge>
                </div>

                {/* Processed Status */}
                <div
                  className={`flex items-center gap-2 cursor-pointer transition-colors hover:bg-accent/50 -mx-2 px-2 py-1 rounded ${summaryStats.processed === 0 ? "opacity-50 text-muted-foreground" : ""}`}
                  onClick={() => handleScrollToUploadHistory("processed")}
                >
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm font-medium flex-1">Processed</span>
                  <Badge variant={summaryStats.processed > 0 ? "default" : "outline"} className={summaryStats.processed > 0 ? "bg-green-600 hover:bg-green-700" : ""}>
                    {summaryStats.processed}
                  </Badge>
                </div>

                {/* Errors Status */}
                <div
                  className={`flex items-center gap-2 cursor-pointer transition-colors hover:bg-accent/50 -mx-2 px-2 py-1 rounded ${summaryStats.errors === 0 ? "opacity-50 text-muted-foreground" : ""}`}
                  onClick={() => handleScrollToUploadHistory("error")}
                >
                  <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                  <span className="text-sm font-medium flex-1">Errors</span>
                  <Badge variant={summaryStats.errors > 0 ? "destructive" : "outline"}>
                    {summaryStats.errors}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs and Stock Config Table */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <div className="flex flex-col gap-4">
            {/* Filters row - search + date range + frequency + supply type tabs */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-end">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by Location ID, Item ID..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-[240px] pl-9 pr-8 h-9"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-0 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-transparent"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Clear search</span>
                  </Button>
                )}
              </div>

              {/* Date Range Filter */}
              <div className="flex items-center gap-2">
                {/* From Date Popover */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-[130px] justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {configDateRange.startDate
                        ? format(configDateRange.startDate, "MMM d, yyyy")
                        : "From"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={configDateRange.startDate}
                      onSelect={(date) =>
                        setConfigDateRange((prev) => ({ ...prev, startDate: date }))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <span className="text-muted-foreground">-</span>

                {/* To Date Popover */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-[130px] justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {configDateRange.endDate
                        ? format(configDateRange.endDate, "MMM d, yyyy")
                        : "To"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={configDateRange.endDate}
                      onSelect={(date) =>
                        setConfigDateRange((prev) => ({ ...prev, endDate: date }))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                {/* Clear Button (show only when dates are set) */}
                {(configDateRange.startDate || configDateRange.endDate) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setConfigDateRange({ startDate: undefined, endDate: undefined })
                    }
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Clear date filter</span>
                  </Button>
                )}
              </div>

              {/* Frequency Dropdown */}
              <Select value={frequencyFilter} onValueChange={handleFrequencyChange}>
                <SelectTrigger className="w-[180px] h-9">
                  <SelectValue placeholder="All Frequencies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Frequencies</SelectItem>
                  <SelectItem value="Daily">Daily</SelectItem>
                  <SelectItem value="One-time">One-time</SelectItem>
                </SelectContent>
              </Select>

              {/* Supply Type Tabs */}
              <TabsList>
                <TabsTrigger value="all">All Configs</TabsTrigger>
                <TabsTrigger value="PreOrder">PreOrder</TabsTrigger>
                <TabsTrigger value="OnHand">OnHand</TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent value={activeTab} className="space-y-4">

            {/* Stock Config Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      {activeTab === "all" && "All Stock Configurations"}
                      {activeTab === "PreOrder" && "PreOrder Configurations"}
                      {activeTab === "OnHand" && "OnHand Configurations"}
                    </CardTitle>
                    <CardDescription>
                      Showing {filteredStockConfigs.length} of {totalItems} configurations
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <StockConfigTable
                  items={filteredStockConfigs}
                  loading={loading}
                  onSort={handleSort}
                  onView={handleViewConfig}
                  onDelete={handleDeleteConfig}
                  sortBy={sortField}
                  sortOrder={sortOrder}
                />

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <p className="text-sm text-muted-foreground">
                      Page {page} of {totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* File History Section */}
        <Card ref={uploadHistorySectionRef}>
          <CardHeader className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5" />
                  Upload History ({filteredFileHistory.length})
                </CardTitle>
                <CardDescription>
                  Recent file uploads and their processing status
                </CardDescription>
              </div>

              {/* Filters row - search + date range + status tabs */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search files..."
                    value={uploadHistorySearch}
                    onChange={(e) => setUploadHistorySearch(e.target.value)}
                    className="w-[180px] pl-9 pr-8 h-9"
                  />
                  {uploadHistorySearch && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setUploadHistorySearch("")}
                      className="absolute right-0 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-transparent"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Clear search</span>
                    </Button>
                  )}
                </div>

                {/* Date Range Filter */}
                <div className="flex items-center gap-2">
                  {/* From Date Popover */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-[130px] justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {uploadHistoryDateRange.startDate
                          ? format(uploadHistoryDateRange.startDate, "MMM d, yyyy")
                          : "From"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={uploadHistoryDateRange.startDate}
                        onSelect={(date) =>
                          setUploadHistoryDateRange((prev) => ({ ...prev, startDate: date }))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <span className="text-muted-foreground">-</span>

                  {/* To Date Popover */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-[130px] justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {uploadHistoryDateRange.endDate
                          ? format(uploadHistoryDateRange.endDate, "MMM d, yyyy")
                          : "To"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={uploadHistoryDateRange.endDate}
                        onSelect={(date) =>
                          setUploadHistoryDateRange((prev) => ({ ...prev, endDate: date }))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  {/* Clear Button (show only when dates are set) */}
                  {(uploadHistoryDateRange.startDate || uploadHistoryDateRange.endDate) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setUploadHistoryDateRange({ startDate: undefined, endDate: undefined })
                      }
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Clear date filter</span>
                    </Button>
                  )}
                </div>

                {/* Status Filter Tabs */}
                <Tabs value={uploadHistoryFilter} onValueChange={(value) => setUploadHistoryFilter(value as "all" | "pending" | "processed" | "error")}>
                  <TabsList>
                    <TabsTrigger value="all">
                      <List className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                      All
                    </TabsTrigger>
                    <TabsTrigger value="pending">
                      <Clock className="h-3.5 w-3.5 mr-1.5 text-amber-600" />
                      Pending
                    </TabsTrigger>
                    <TabsTrigger value="processed">
                      <CheckCircle className="h-3.5 w-3.5 mr-1.5 text-green-600" />
                      Processed
                    </TabsTrigger>
                    <TabsTrigger value="error">
                      <AlertCircle className="h-3.5 w-3.5 mr-1.5 text-red-600" />
                      Error
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={uploadHistoryFilter} onValueChange={(value) => setUploadHistoryFilter(value as "all" | "pending" | "processed" | "error")} className="space-y-4">
              <TabsContent value={uploadHistoryFilter}>
                <UploadHistoryTable fileHistory={filteredFileHistory.slice(0, 10)} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <FileUploadModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        onUploadComplete={handleUploadComplete}
        onReviewResults={handleReviewResults}
        onStartProcessing={handleStartProcessing}
      />

      <ValidationResultsTable
        open={validationModalOpen}
        onOpenChange={handleValidationModalClose}
        parseResult={currentParseResult}
      />

      <ProcessingProgressModal
        open={processingModalOpen}
        onOpenChange={setProcessingModalOpen}
        filename={processingFile?.filename || ""}
        totalRows={processingFile?.recordCount || 0}
        onCancel={handleCancelProcessing}
        progress={processingProgress}
        currentRow={processingCurrentRow}
        successCount={processingSuccessCount}
        errorCount={processingErrorCount}
        isComplete={processingComplete}
        onViewReport={handleViewProcessingReport}
      />

      <PostProcessingReport
        open={reportModalOpen}
        onOpenChange={setReportModalOpen}
        filename={reportFile?.filename || ""}
        results={reportResults}
        onRetryFailed={handleRetryFailedRows}
      />
    </DashboardShell>
  )
}
