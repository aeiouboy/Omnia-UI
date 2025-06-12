"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal } from "lucide-react"

interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  isLoading?: boolean
}

export function PaginationControls({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
}: PaginationControlsProps) {
  const [pageInput, setPageInput] = useState("")
  const [showPageInput, setShowPageInput] = useState(false)
  
  // Ensure all values are defined with safe defaults
  const safeCurrentPage = Math.max(1, currentPage || 1)
  const safeTotalPages = Math.max(0, totalPages || 0)
  const safePageSize = Math.max(1, pageSize || 25)
  const safeTotalItems = Math.max(0, totalItems || 0)
  
  const startItem = safeTotalItems > 0 ? (safeCurrentPage - 1) * safePageSize + 1 : 0
  const endItem = Math.min(safeCurrentPage * safePageSize, safeTotalItems)

  // Handle direct page input
  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const pageNum = parseInt(pageInput)
    if (pageNum >= 1 && pageNum <= safeTotalPages) {
      onPageChange(pageNum)
      setPageInput("")
      setShowPageInput(false)
    }
  }

  // Generate page numbers to show with better logic for many pages
  const getPageNumbers = () => {
    const delta = 1 // Reduced for more compact display
    const range = []
    const rangeWithDots = []

    if (safeTotalPages <= 7) {
      // Show all pages if total is small
      for (let i = 1; i <= safeTotalPages; i++) {
        range.push(i)
      }
    } else {
      // Always include first page
      range.push(1)

      // Add pages around current page
      const startPage = Math.max(2, safeCurrentPage - delta)
      const endPage = Math.min(safeTotalPages - 1, safeCurrentPage + delta)

      // Add gap if needed before current range
      if (startPage > 2) {
        range.push("...")
      }

      // Add current range
      for (let i = startPage; i <= endPage; i++) {
        range.push(i)
      }

      // Add gap if needed after current range
      if (endPage < safeTotalPages - 1) {
        range.push("...")
      }

      // Always include last page
      if (safeTotalPages > 1) {
        range.push(safeTotalPages)
      }
    }

    return range
  }

  // Quick jump options for large datasets
  const getQuickJumpOptions = () => {
    const options = []
    const step = Math.max(1, Math.floor(safeTotalPages / 10))
    
    for (let i = step; i < safeTotalPages; i += step) {
      if (i !== safeCurrentPage && Math.abs(i - safeCurrentPage) > 2) {
        options.push(i)
      }
    }
    
    return options.slice(0, 3) // Limit to 3 quick jump options
  }

  const pageNumbers = getPageNumbers()
  const quickJumpOptions = getQuickJumpOptions()

  return (
    <div className="space-y-4">
      {/* Top row - Items info and page size */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Showing {startItem.toLocaleString()} to {endItem.toLocaleString()} of {safeTotalItems.toLocaleString()} orders
          </div>
          {safeTotalPages > 50 && (
            <div className="text-xs text-muted-foreground bg-amber-50 px-2 py-1 rounded border border-amber-200">
              Large dataset: {safeTotalPages.toLocaleString()} pages
            </div>
          )}
        </div>
        
        {/* Page size selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Show:</span>
          <Select value={safePageSize.toString()} onValueChange={(value) => onPageSizeChange(Number(value))}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
              <SelectItem value="200">200</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bottom row - Navigation */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Main pagination controls */}
        <div className="flex items-center gap-1">
          {/* First page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={safeCurrentPage === 1 || isLoading}
            className="min-h-[44px] min-w-[44px] p-0"
            title="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          {/* Previous page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(safeCurrentPage - 1)}
            disabled={safeCurrentPage === 1 || isLoading}
            className="min-h-[44px] min-w-[44px] p-0"
            title="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {pageNumbers.map((page, index) => (
              <div key={index}>
                {page === "..." ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPageInput(!showPageInput)}
                    className="min-h-[44px] min-w-[44px] p-0 hover:bg-gray-100"
                    title="Jump to page"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    variant={safeCurrentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(page as number)}
                    disabled={isLoading}
                    className="min-h-[44px] min-w-[44px] p-0"
                  >
                    {page}
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Next page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(safeCurrentPage + 1)}
            disabled={safeCurrentPage === safeTotalPages || isLoading}
            className="min-h-[44px] min-w-[44px] p-0"
            title="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Last page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(safeTotalPages)}
            disabled={currentPage === totalPages || isLoading}
            className="min-h-[44px] min-w-[44px] p-0"
            title="Last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Page input and quick jumps */}
        <div className="flex items-center gap-2">
          {/* Quick jump buttons for large datasets */}
          {safeTotalPages > 20 && quickJumpOptions.length > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground mr-1">Jump:</span>
              {quickJumpOptions.map((page) => (
                <Button
                  key={page}
                  variant="ghost"
                  size="sm"
                  onClick={() => onPageChange(page)}
                  disabled={isLoading}
                  className="min-h-[44px] px-3 text-xs"
                  title={`Jump to page ${page}`}
                >
                  {page}
                </Button>
              ))}
            </div>
          )}

          {/* Direct page input */}
          {showPageInput && (
            <form onSubmit={handlePageInputSubmit} className="flex items-center gap-1">
              <Input
                type="number"
                min="1"
                max={safeTotalPages}
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                placeholder={`1-${safeTotalPages}`}
                className="w-20 min-h-[44px] text-sm"
                autoFocus
              />
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="min-h-[44px] px-3 text-xs"
                disabled={!pageInput || isLoading}
              >
                Go
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowPageInput(false)
                  setPageInput("")
                }}
                className="min-h-[44px] px-3 text-xs"
              >
                ×
              </Button>
            </form>
          )}

          {/* Toggle page input button */}
          {!showPageInput && safeTotalPages > 10 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPageInput(true)}
              className="min-h-[44px] px-4 text-xs"
              title="Jump to specific page"
            >
              Go to...
            </Button>
          )}

          {/* Current page indicator */}
          <div className="text-sm text-muted-foreground bg-gray-50 px-2 py-1 rounded border">
            Page {safeCurrentPage.toLocaleString()} of {safeTotalPages.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  )
}
