"use client"

import { useState, useMemo } from "react"
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import type { FileParseResult, ParsedStockConfigRow } from "@/types/stock-config"

interface ValidationResultsTableProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  parseResult: FileParseResult | null
}

type FilterTab = "all" | "valid" | "errors"

export function ValidationResultsTable({
  open,
  onOpenChange,
  parseResult,
}: ValidationResultsTableProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>("all")
  const [page, setPage] = useState(1)
  const pageSize = 10

  const filteredRows = useMemo(() => {
    if (!parseResult) return []

    switch (activeTab) {
      case "valid":
        return parseResult.rows.filter((row) => row.isValid)
      case "errors":
        return parseResult.rows.filter((row) => !row.isValid)
      default:
        return parseResult.rows
    }
  }, [parseResult, activeTab])

  const totalPages = Math.ceil(filteredRows.length / pageSize)
  const paginatedRows = filteredRows.slice((page - 1) * pageSize, page * pageSize)

  const handleTabChange = (value: string) => {
    setActiveTab(value as FilterTab)
    setPage(1) // Reset to first page on tab change
  }

  if (!parseResult) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Validation Results: {parseResult.filename}
          </DialogTitle>
          <DialogDescription>
            Review the parsed data and validation results before uploading
          </DialogDescription>
        </DialogHeader>

        {/* Summary Header */}
        <div className="flex items-center justify-between py-3 border-b">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Total:</span>
              <Badge variant="outline">{parseResult.totalRows}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-gray-500">Valid:</span>
              <Badge className="bg-green-100 text-green-800">{parseResult.validRows}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-gray-500">Invalid:</span>
              <Badge className="bg-red-100 text-red-800">{parseResult.invalidRows}</Badge>
            </div>
            {parseResult.warnings.length > 0 && (
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-gray-500">Warnings:</span>
                <Badge className="bg-yellow-100 text-yellow-800">{parseResult.warnings.length}</Badge>
              </div>
            )}
          </div>
        </div>

        {/* Tabs for filtering */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <TabsList>
            <TabsTrigger value="all">All ({parseResult.totalRows})</TabsTrigger>
            <TabsTrigger value="valid">Valid Only ({parseResult.validRows})</TabsTrigger>
            <TabsTrigger value="errors">Errors Only ({parseResult.invalidRows})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="flex-1 min-h-0 overflow-auto mt-2">
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Row #</TableHead>
                    <TableHead>Location ID</TableHead>
                    <TableHead>Item ID</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead>Supply Type</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead className="w-24 text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No records to display
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedRows.map((row) => (
                      <TableRow
                        key={row.rowNumber}
                        className={
                          !row.isValid
                            ? "bg-red-50"
                            : row.warnings.length > 0
                              ? "bg-yellow-50"
                              : ""
                        }
                      >
                        <TableCell className="font-mono text-sm">{row.rowNumber}</TableCell>
                        <TableCell>
                          <CellWithValidation value={row.locationId} errors={row.errors} field="locationId" />
                        </TableCell>
                        <TableCell>
                          <CellWithValidation value={row.itemId} errors={row.errors} field="itemId" />
                        </TableCell>
                        <TableCell className="text-right">
                          <CellWithValidation
                            value={row.quantity !== null ? row.quantity.toLocaleString() : "-"}
                            errors={row.errors}
                            field="quantity"
                          />
                        </TableCell>
                        <TableCell>
                          <CellWithValidation value={row.supplyTypeId || "-"} errors={row.errors} field="supplyTypeId" />
                        </TableCell>
                        <TableCell>
                          <CellWithValidation value={row.frequency || "-"} errors={row.errors} field="frequency" />
                        </TableCell>
                        <TableCell>
                          <CellWithValidation value={row.startDate || "-"} errors={row.errors} field="startDate" warnings={row.warnings} />
                        </TableCell>
                        <TableCell>
                          <CellWithValidation value={row.endDate || "-"} errors={row.errors} field="endDate" warnings={row.warnings} />
                        </TableCell>
                        <TableCell className="text-center">
                          <RowStatusBadge row={row} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, filteredRows.length)} of {filteredRows.length} rows
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
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

interface CellWithValidationProps {
  value: string
  errors: ParsedStockConfigRow["errors"]
  warnings?: ParsedStockConfigRow["warnings"]
  field: string
}

function CellWithValidation({ value, errors, warnings = [], field }: CellWithValidationProps) {
  const fieldErrors = errors.filter((e) => e.field === field)
  const fieldWarnings = warnings.filter((w) => w.field === field)

  if (fieldErrors.length === 0 && fieldWarnings.length === 0) {
    return <span>{value}</span>
  }

  const hasError = fieldErrors.length > 0

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`inline-flex items-center gap-1 ${hasError ? "text-red-600" : "text-yellow-600"}`}>
            {value}
            {hasError ? (
              <AlertCircle className="h-3 w-3" />
            ) : (
              <AlertTriangle className="h-3 w-3" />
            )}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            {fieldErrors.map((error, index) => (
              <p key={`error-${index}`} className="text-red-200">{error.message}</p>
            ))}
            {fieldWarnings.map((warning, index) => (
              <p key={`warning-${index}`} className="text-yellow-200">{warning.message}</p>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function RowStatusBadge({ row }: { row: ParsedStockConfigRow }) {
  if (!row.isValid) {
    return (
      <Badge className="bg-red-100 text-red-800">
        <AlertCircle className="h-3 w-3 mr-1" />
        Error
      </Badge>
    )
  }

  if (row.warnings.length > 0) {
    return (
      <Badge className="bg-yellow-100 text-yellow-800">
        <AlertTriangle className="h-3 w-3 mr-1" />
        Warning
      </Badge>
    )
  }

  return (
    <Badge className="bg-green-100 text-green-800">
      <CheckCircle className="h-3 w-3 mr-1" />
      Valid
    </Badge>
  )
}
