"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  Upload,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  FolderArchive,
  FileX,
  Loader2,
  Eye,
  RotateCcw,
} from "lucide-react"
import { FileUploadModal } from "@/components/stock-config/file-upload-modal"
import { ValidationResultsTable } from "@/components/stock-config/validation-results-table"
import { StockConfigTable } from "@/components/stock-config/stock-config-table"
import { ProcessingProgressModal } from "@/components/stock-config/processing-progress-modal"
import { PostProcessingReport } from "@/components/stock-config/post-processing-report"
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

  // Post-processing report state
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [reportFile, setReportFile] = useState<StockConfigFile | null>(null)
  const [reportResults, setReportResults] = useState<ProcessingResult[]>([])

  // Filter state
  const [activeTab, setActiveTab] = useState<SupplyTab>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<SortField>("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  // Pagination state
  const [page, setPage] = useState(1)
  const [pageSize] = useState(25)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  // Build filters
  const filters: StockConfigFilters = useMemo(() => ({
    supplyType: activeTab === "all" ? "all" : activeTab,
    searchQuery,
    page,
    pageSize,
    sortBy: sortField,
    sortOrder,
  }), [activeTab, searchQuery, page, pageSize, sortField, sortOrder])

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

  // Handlers
  const handleRefresh = () => {
    loadData(false)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
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

  // Summary stats
  const summaryStats = useMemo(() => {
    const pending = fileHistory.filter((f) => f.folder === "pending" || f.processingStatus === "processing").length
    const processed = fileHistory.filter((f) => f.folder === "arch" || f.processingStatus === "completed").length
    const errors = fileHistory.filter((f) => f.folder === "err" || f.processingStatus === "error" || f.processingStatus === "partial").length
    return { pending, processed, errors, total: stockConfigs.length }
  }, [fileHistory, stockConfigs])

  const getFileStatusBadge = (file: StockConfigFile) => {
    // Use processingStatus if available
    const status = file.processingStatus || file.status

    switch (status) {
      case "validating":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Validating
          </Badge>
        )
      case "processing":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Processing... {file.processingProgress || 0}%
          </Badge>
        )
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        )
      case "partial":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            Partial
          </Badge>
        )
      case "error":
        return (
          <Badge className="bg-red-100 text-red-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case "validated":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Validated
          </Badge>
        )
      case "processed":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Processed
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getFolderIcon = (file: StockConfigFile) => {
    const status = file.processingStatus || file.status

    switch (status) {
      case "completed":
      case "processed":
        return <FolderArchive className="h-4 w-4 text-green-600" />
      case "error":
        return <FileX className="h-4 w-4 text-red-600" />
      case "partial":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case "processing":
      case "validating":
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
      default:
        return <FileSpreadsheet className="h-4 w-4 text-gray-600" />
    }
  }

  const canViewReport = (file: StockConfigFile) => {
    const status = file.processingStatus || file.status
    return ["completed", "partial", "error"].includes(status) && file.processingResults && file.processingResults.length > 0
  }

  const canRetry = (file: StockConfigFile) => {
    const status = file.processingStatus || file.status
    return ["partial", "error"].includes(status) && file.processingResults && file.processingResults.some((r) => r.status === "error")
  }

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
              <div className="text-2xl font-bold">{totalItems}</div>
              <p className="text-xs text-muted-foreground">Active stock configs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Files</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{summaryStats.pending}</div>
              <p className="text-xs text-muted-foreground">Awaiting processing</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processed Files</CardTitle>
              <FolderArchive className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{summaryStats.processed}</div>
              <p className="text-xs text-muted-foreground">In archive folder</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Error Files</CardTitle>
              <FileX className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{summaryStats.errors}</div>
              <p className="text-xs text-muted-foreground">Failed to process</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs and Stock Config Table */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <TabsList>
              <TabsTrigger value="all">All Configs</TabsTrigger>
              <TabsTrigger value="PreOrder">PreOrder</TabsTrigger>
              <TabsTrigger value="OnHand">OnHand</TabsTrigger>
            </TabsList>
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by Location ID, Item ID, or SKU..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-9"
              />
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
                      Showing {stockConfigs.length} of {totalItems} configurations
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <StockConfigTable
                  items={stockConfigs}
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Upload History
            </CardTitle>
            <CardDescription>
              Recent file uploads and their processing status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {fileHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No files have been uploaded yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {fileHistory.slice(0, 10).map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      {getFolderIcon(file)}
                      <div>
                        <p className="font-medium text-sm">{file.filename}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(file.uploadDate).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {file.processedAt && (
                            <span className="ml-2">
                              • Processed: {new Date(file.processedAt).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm">
                        <p>{file.recordCount} records</p>
                        {file.successCount !== undefined || file.errorCount !== undefined ? (
                          <p className="text-xs text-muted-foreground">
                            <span className="text-green-600">{file.successCount || 0} success</span>
                            {", "}
                            <span className={file.errorCount && file.errorCount > 0 ? "text-red-600" : "text-muted-foreground"}>
                              {file.errorCount || 0} errors
                            </span>
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            {file.validRecords} valid, {file.invalidRecords} invalid
                          </p>
                        )}
                      </div>
                      {getFileStatusBadge(file)}
                      <div className="flex items-center gap-1">
                        {canViewReport(file) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewFileReport(file)}
                            title="View Report"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {canRetry(file) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (file.processingResults) {
                                setReportFile(file)
                                setReportResults(file.processingResults)
                                setReportModalOpen(true)
                              }
                            }}
                            title="Retry Failed Rows"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
