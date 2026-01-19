"use client"

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
import { Skeleton } from "@/components/ui/skeleton"
import {
  FileSpreadsheet,
  FolderArchive,
  FileX,
  AlertCircle,
  Loader2,
  CheckCircle,
  Clock,
  User,
  Download,
} from "lucide-react"
import type { StockConfigFile } from "@/types/stock-config"

interface UploadHistoryTableProps {
  fileHistory: StockConfigFile[]
  loading?: boolean
  onDownload?: (file: StockConfigFile) => void
}

export function UploadHistoryTable({
  fileHistory,
  loading = false,
  onDownload,
}: UploadHistoryTableProps) {
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

  // Loading skeleton
  if (loading) {
    return (
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>File Name</TableHead>
              <TableHead>Upload Date</TableHead>
              <TableHead className="hidden lg:table-cell">Records</TableHead>
              <TableHead className="hidden md:table-cell">Uploaded By</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-20 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(3)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-40" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Skeleton className="h-4 w-28" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-24" />
                </TableCell>
                <TableCell className="text-center">
                  <Skeleton className="h-8 w-8 mx-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  // Empty state
  if (fileHistory.length === 0) {
    return (
      <div className="border rounded-lg p-12 text-center">
        <FileSpreadsheet className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No upload history
        </h3>
        <p className="text-sm text-gray-500">
          Files you upload will appear here
        </p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>File Name</TableHead>
            <TableHead>Upload Date</TableHead>
            <TableHead className="hidden lg:table-cell">Records</TableHead>
            <TableHead className="hidden md:table-cell">Uploaded By</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-20 text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fileHistory.map((file) => (
            <TableRow
              key={file.id}
              className="hover:bg-accent/50 transition-colors"
            >
              {/* File Name */}
              <TableCell>
                <div className="flex items-center gap-2">
                  {getFolderIcon(file)}
                  <span className="font-medium text-sm">{file.filename}</span>
                </div>
              </TableCell>

              {/* Upload Date */}
              <TableCell>
                <div className="text-sm">
                  {new Date(file.uploadDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                  <div className="text-xs text-muted-foreground">
                    {new Date(file.uploadDate).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </TableCell>

              {/* Records */}
              <TableCell className="hidden lg:table-cell">
                <div className="flex flex-col gap-1">
                  <div className="text-sm font-medium">
                    {file.recordCount || 0}
                  </div>
                  <div className="text-xs">
                    <span className="text-green-600">
                      {file.validRecords || 0} valid
                    </span>
                    {" / "}
                    <span className={file.invalidRecords && file.invalidRecords > 0 ? "text-red-600" : "text-gray-600"}>
                      {file.invalidRecords || 0} invalid
                    </span>
                  </div>
                </div>
              </TableCell>

              {/* Uploaded By */}
              <TableCell className="hidden md:table-cell">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-gray-600" />
                  <span>{file.uploadedBy || '-'}</span>
                </div>
              </TableCell>

              {/* Status */}
              <TableCell>
                {getFileStatusBadge(file)}
              </TableCell>

              {/* Actions */}
              <TableCell className="text-center">
                {onDownload && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDownload(file)
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <Download className="h-4 w-4" />
                    <span className="sr-only">Download file</span>
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
