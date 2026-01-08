"use client"

import { useState, useMemo, useCallback, Fragment } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Download,
  RefreshCw,
} from "lucide-react"
import type { ProcessingResult } from "@/types/stock-config"
import {
  generateErrorReport,
  generateErrorsOnlyReport,
} from "@/lib/stock-config-service"

interface PostProcessingReportProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filename: string
  results: ProcessingResult[]
  onRetryFailed: (failedResults: ProcessingResult[]) => void
}

type FilterTab = "all" | "success" | "errors"

export function PostProcessingReport({
  open,
  onOpenChange,
  filename,
  results,
  onRetryFailed,
}: PostProcessingReportProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>("all")
  const [page, setPage] = useState(1)
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
  const pageSize = 15

  // Calculate summary stats
  const stats = useMemo(() => {
    const successCount = results.filter((r) => r.status === "success").length
    const errorCount = results.filter((r) => r.status === "error").length
    return {
      total: results.length,
      success: successCount,
      errors: errorCount,
    }
  }, [results])

  // Filter results based on active tab
  const filteredResults = useMemo(() => {
    switch (activeTab) {
      case "success":
        return results.filter((r) => r.status === "success")
      case "errors":
        return results.filter((r) => r.status === "error")
      default:
        return results
    }
  }, [results, activeTab])

  // Paginate results
  const totalPages = Math.ceil(filteredResults.length / pageSize)
  const paginatedResults = filteredResults.slice((page - 1) * pageSize, page * pageSize)

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value as FilterTab)
    setPage(1)
    setExpandedRows(new Set())
  }, [])

  const toggleRowExpansion = useCallback((rowNumber: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(rowNumber)) {
        next.delete(rowNumber)
      } else {
        next.add(rowNumber)
      }
      return next
    })
  }, [])

  const handleDownloadFullReport = useCallback(() => {
    const blob = generateErrorReport(results)
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `processing-report-${filename.replace(/\.[^/.]+$/, "")}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [results, filename])

  const handleDownloadErrorsOnly = useCallback(() => {
    const blob = generateErrorsOnlyReport(results)
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `errors-only-${filename.replace(/\.[^/.]+$/, "")}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [results, filename])

  const handleRetryFailed = useCallback(() => {
    const failedResults = results.filter((r) => r.status === "error")
    onRetryFailed(failedResults)
  }, [results, onRetryFailed])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Processing Report: {filename}</DialogTitle>
          <DialogDescription>
            Review the processing results for all rows in the uploaded file
          </DialogDescription>
        </DialogHeader>

        {/* Summary Section */}
        <div className="grid grid-cols-3 gap-4 py-4 border-b">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-500">Total Rows</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-3xl font-bold text-green-600">{stats.success}</p>
            <p className="text-sm text-gray-500">Successful</p>
          </div>
          <div className={`text-center p-4 rounded-lg ${stats.errors > 0 ? "bg-red-50" : "bg-gray-50"}`}>
            <p className={`text-3xl font-bold ${stats.errors > 0 ? "text-red-600" : "text-gray-400"}`}>
              {stats.errors}
            </p>
            <p className="text-sm text-gray-500">Failed</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleDownloadFullReport}>
              <Download className="h-4 w-4 mr-2" />
              Download Full Report
            </Button>
            {stats.errors > 0 && (
              <Button variant="outline" size="sm" onClick={handleDownloadErrorsOnly}>
                <Download className="h-4 w-4 mr-2" />
                Download Errors Only
              </Button>
            )}
          </div>
          {stats.errors > 0 && (
            <Button onClick={handleRetryFailed}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Failed File ({stats.errors})
            </Button>
          )}
        </div>

        {/* Filter Tabs and Table */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 flex flex-col overflow-hidden">
          <TabsList>
            <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
            <TabsTrigger value="success">Success ({stats.success})</TabsTrigger>
            <TabsTrigger value="errors">Errors ({stats.errors})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="flex-1 overflow-auto mt-4">
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead className="w-16">Row #</TableHead>
                    <TableHead>Item ID</TableHead>
                    <TableHead>Location ID</TableHead>
                    <TableHead className="w-24 text-center">Status</TableHead>
                    <TableHead>Error Message</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedResults.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No records to display
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedResults.map((result) => (
                      <Fragment key={result.rowNumber}>
                        <TableRow
                          className={`cursor-pointer hover:bg-muted/50 ${
                            result.status === "error" ? "bg-red-50/50" : "bg-green-50/50"
                          }`}
                          onClick={() => toggleRowExpansion(result.rowNumber)}
                        >
                          <TableCell>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <ChevronDown
                                className={`h-4 w-4 transition-transform ${
                                  expandedRows.has(result.rowNumber) ? "rotate-180" : ""
                                }`}
                              />
                            </Button>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{result.rowNumber}</TableCell>
                          <TableCell className="font-medium">{result.item}</TableCell>
                          <TableCell>{result.location}</TableCell>
                          <TableCell className="text-center">
                            {result.status === "success" ? (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Success
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Error
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                            {result.errorMessage || "-"}
                          </TableCell>
                        </TableRow>
                        {expandedRows.has(result.rowNumber) && (
                          <TableRow className="bg-muted/30">
                            <TableCell colSpan={6} className="p-0">
                              <div className="p-4 space-y-3">
                                <h4 className="font-medium text-sm">Full Row Data</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Quantity:</span>{" "}
                                    <span className="font-medium">
                                      {result.originalData.quantity?.toLocaleString() || "-"}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Supply Type:</span>{" "}
                                    <span className="font-medium">{result.originalData.supplyTypeId || "-"}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Frequency:</span>{" "}
                                    <span className="font-medium">{result.originalData.frequency || "-"}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Start Date:</span>{" "}
                                    <span className="font-medium">{result.originalData.startDate || "-"}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">End Date:</span>{" "}
                                    <span className="font-medium">{result.originalData.endDate || "-"}</span>
                                  </div>
                                  {result.errorCode && (
                                    <div>
                                      <span className="text-muted-foreground">Error Code:</span>{" "}
                                      <Badge variant="outline" className="text-red-600 border-red-300">
                                        {result.errorCode}
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                                {result.errorMessage && (
                                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                                    <p className="text-sm text-red-800">
                                      <AlertCircle className="h-4 w-4 inline mr-2" />
                                      {result.errorMessage}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pb-2">
                <p className="text-sm text-muted-foreground">
                  Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, filteredResults.length)} of{" "}
                  {filteredResults.length} rows
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1}>
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
