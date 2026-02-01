"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  FileSpreadsheet,
  Calendar,
  User,
  CheckCircle,
  AlertCircle,
  Clock,
  Loader2,
  Download,
} from "lucide-react"
import type { StockConfigFile } from "@/types/stock-config"

interface FileDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  file: StockConfigFile | null
  onDownload?: (file: StockConfigFile) => void
}

export function FileDetailModal({
  open,
  onOpenChange,
  file,
  onDownload,
}: FileDetailModalProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  // Early return if no file selected
  if (!file) {
    return null
  }

  const handleDownload = async () => {
    if (!onDownload) return

    setIsDownloading(true)
    try {
      await onDownload(file)
    } finally {
      setIsDownloading(false)
    }
  }

  // Use processingStatus if available, otherwise fallback to status
  const status = file.processingStatus || file.status

  // Determine if file has errors
  const hasErrors =
    (file.invalidRecords && file.invalidRecords > 0) ||
    status === "error" ||
    status === "partial"

  // Get status badge similar to UploadHistoryTable
  const getStatusBadge = () => {
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

  // Format date for display in MM/DD/YYYY format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "-"
    const pad = (n: number) => n.toString().padStart(2, '0')
    const month = pad(date.getMonth() + 1)
    const day = pad(date.getDate())
    const year = date.getFullYear()
    return `${month}/${day}/${year}`
  }

  // Format time for display in HH:mm:ss format
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "-"
    const pad = (n: number) => n.toString().padStart(2, '0')
    const hours = pad(date.getHours())
    const minutes = pad(date.getMinutes())
    const seconds = pad(date.getSeconds())
    return `${hours}:${minutes}:${seconds}`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-blue-600" />
              {file.filename}
            </DialogTitle>
            {onDownload && (
              <Button
                onClick={handleDownload}
                disabled={isDownloading}
                variant="outline"
                size="sm"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download File
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Metadata Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            {/* Upload Date */}
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Upload Date</p>
                <p className="text-sm text-gray-900">
                  {formatDate(file.uploadDate)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatTime(file.uploadDate)}
                </p>
              </div>
            </div>

            {/* Uploaded By */}
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-gray-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Uploaded By</p>
                <p className="text-sm text-gray-900">
                  {file.uploadedBy || "Unknown"}
                </p>
              </div>
            </div>

            {/* Total Records */}
            <div className="flex items-start gap-3">
              <FileSpreadsheet className="h-5 w-5 text-gray-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Total Records
                </p>
                <p className="text-sm text-gray-900">{file.recordCount || 0}</p>
              </div>
            </div>

            {/* Processing Status */}
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-gray-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Status</p>
                {getStatusBadge()}
              </div>
            </div>
          </div>

          {/* Record Counts Section */}
          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-3">Record Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-xs text-gray-600">Valid Records</p>
                  <p className="text-lg font-semibold text-green-700">
                    {file.validRecords || 0}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <div>
                  <p className="text-xs text-gray-600">Invalid Records</p>
                  <p className="text-lg font-semibold text-red-700">
                    {file.invalidRecords || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Processing counts if available */}
            {(file.successCount !== undefined ||
              file.errorCount !== undefined) && (
              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-600">Successfully Processed</p>
                    <p className="text-lg font-semibold text-green-700">
                      {file.successCount || 0}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <div>
                    <p className="text-xs text-gray-600">Processing Errors</p>
                    <p className="text-lg font-semibold text-red-700">
                      {file.errorCount || 0}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Error Summary Section - Only show if file has errors */}
          {hasErrors && (
            <div className="border-2 border-red-200 rounded-lg p-4 bg-red-50">
              <div className="flex items-start gap-2 mb-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-red-900">
                    Error Summary
                  </h3>
                  <p className="text-xs text-red-700 mt-1">
                    {file.invalidRecords || file.errorCount || 0} record(s) with
                    errors
                  </p>
                </div>
              </div>

              {/* Error Message */}
              {file.errorMessage && (
                <div className="mb-3 p-3 bg-white rounded border border-red-200">
                  <p className="text-xs font-medium text-gray-700 mb-1">
                    Error Message:
                  </p>
                  <p className="text-sm text-red-800">{file.errorMessage}</p>
                </div>
              )}

              {/* Processing Results with Errors */}
              {file.processingResults &&
                file.processingResults.length > 0 &&
                file.processingResults.some(
                  (result) => result.status === "error"
                ) && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-gray-700 mb-2">
                      Error Details:
                    </p>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {file.processingResults
                        .filter((result) => result.status === "error")
                        .slice(0, 10)
                        .map((result, index) => (
                          <div
                            key={index}
                            className="p-2 bg-white rounded border border-red-200 text-xs"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-gray-700">
                                Row {result.rowNumber}
                              </span>
                              {result.errorCode && (
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-red-100 text-red-800 border-red-300"
                                >
                                  {result.errorCode}
                                </Badge>
                              )}
                            </div>
                            <p className="text-gray-600">
                              Item: {result.item || "N/A"} | Location:{" "}
                              {result.location || "N/A"}
                            </p>
                            {result.errorMessage && (
                              <p className="text-red-700 mt-1">
                                {result.errorMessage}
                              </p>
                            )}
                          </div>
                        ))}
                      {file.processingResults.filter(
                        (result) => result.status === "error"
                      ).length > 10 && (
                        <p className="text-xs text-gray-600 text-center py-2">
                          ... and{" "}
                          {file.processingResults.filter(
                            (result) => result.status === "error"
                          ).length - 10}{" "}
                          more error(s)
                        </p>
                      )}
                    </div>
                  </div>
                )}

              {/* Error Report URL */}
              {file.errorReportUrl && (
                <div className="mt-3">
                  <a
                    href={file.errorReportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    Download Full Error Report
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Processed At timestamp if available */}
          {file.processedAt && (
            <div className="text-xs text-muted-foreground">
              Processed at: {formatDate(file.processedAt)} at{" "}
              {formatTime(file.processedAt)}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
