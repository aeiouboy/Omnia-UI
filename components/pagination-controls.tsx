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
  
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  // Handle direct page input
  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const pageNum = parseInt(pageInput)
    if (pageNum >= 1 && pageNum <= totalPages) {
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

    if (totalPages <= 7) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        range.push(i)
      }
    } else {
      // Always include first page
      range.push(1)

      // Add pages around current page
      const startPage = Math.max(2, currentPage - delta)
      const endPage = Math.min(totalPages - 1, currentPage + delta)

      // Add gap if needed before current range
      if (startPage > 2) {
        range.push("...")
      }

      // Add current range
      for (let i = startPage; i <= endPage; i++) {
        range.push(i)
      }

      // Add gap if needed after current range
      if (endPage < totalPages - 1) {
        range.push("...")
      }

      // Always include last page
      if (totalPages > 1) {
        range.push(totalPages)
      }
    }

    return range
  }

  // Quick jump options for large datasets
  const getQuickJumpOptions = () => {
    const options = []
    const step = Math.max(1, Math.floor(totalPages / 10))
    
    for (let i = step; i < totalPages; i += step) {
      if (i !== currentPage && Math.abs(i - currentPage) > 2) {
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
            Showing {startItem.toLocaleString()} to {endItem.toLocaleString()} of {totalItems.toLocaleString()} orders
          </div>
          {totalPages > 50 && (
            <div className="text-xs text-muted-foreground bg-amber-50 px-2 py-1 rounded border border-amber-200">
              Large dataset: {totalPages.toLocaleString()} pages
            </div>
          )}
        </div>
        
        {/* Page size selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Show:</span>
          <Select value={pageSize.toString()} onValueChange={(value) => onPageSizeChange(Number(value))}>
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
            disabled={currentPage === 1 || isLoading}
            className="h-8 w-8 p-0"
            title="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          {/* Previous page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1 || isLoading}
            className="h-8 w-8 p-0"
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
                    className="h-8 w-8 p-0 hover:bg-gray-100"
                    title="Jump to page"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(page as number)}
                    disabled={isLoading}
                    className="h-8 w-8 p-0"
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
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isLoading}
            className="h-8 w-8 p-0"
            title="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Last page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages || isLoading}
            className="h-8 w-8 p-0"
            title="Last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Page input and quick jumps */}
        <div className="flex items-center gap-2">
          {/* Quick jump buttons for large datasets */}
          {totalPages > 20 && quickJumpOptions.length > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground mr-1">Jump:</span>
              {quickJumpOptions.map((page) => (
                <Button
                  key={page}
                  variant="ghost"
                  size="sm"
                  onClick={() => onPageChange(page)}
                  disabled={isLoading}
                  className="h-6 px-2 text-xs"
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
                max={totalPages}
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                placeholder={`1-${totalPages}`}
                className="w-20 h-8 text-sm"
                autoFocus
              />
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="h-8 px-2 text-xs"
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
                className="h-8 px-2 text-xs"
              >
                ×
              </Button>
            </form>
          )}

          {/* Toggle page input button */}
          {!showPageInput && totalPages > 10 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPageInput(true)}
              className="h-8 px-3 text-xs"
              title="Jump to specific page"
            >
              Go to...
            </Button>
          )}

          {/* Current page indicator */}
          <div className="text-sm text-muted-foreground bg-gray-50 px-2 py-1 rounded border">
            Page {currentPage.toLocaleString()} of {totalPages.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  )
}
