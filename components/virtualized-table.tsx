"use client"

import React, { forwardRef, useCallback, useRef, useImperativeHandle, useMemo } from "react"
import { FixedSizeList as List, ListChildComponentProps } from "react-window"
import { cn } from "@/lib/utils"

export interface VirtualizedTableColumn<T> {
  key: string
  header: string
  width?: number
  minWidth?: number
  className?: string
  render: (item: T, index: number) => React.ReactNode
}

export interface VirtualizedTableProps<T> {
  data: T[]
  columns: VirtualizedTableColumn<T>[]
  height: number
  rowHeight?: number
  overscanCount?: number
  className?: string
  headerClassName?: string
  rowClassName?: string | ((item: T, index: number) => string)
  onRowClick?: (item: T, index: number) => void
  emptyMessage?: string
  getRowId?: (item: T, index: number) => string
  onScroll?: (scrollInfo: { scrollOffset: number; scrollDirection: 'forward' | 'backward' }) => void
  initialScrollOffset?: number
}

export interface VirtualizedTableRef {
  scrollToItem: (index: number, align?: "start" | "center" | "end" | "auto") => void
  scrollToOffset: (offset: number) => void
  getScrollOffset: () => number
}

function VirtualizedTableInner<T>(
  props: VirtualizedTableProps<T>,
  ref: React.Ref<VirtualizedTableRef>
) {
  const {
    data,
    columns,
    height,
    rowHeight = 50,
    overscanCount = 5,
    className,
    headerClassName,
    rowClassName,
    onRowClick,
    emptyMessage = "No data available",
    getRowId,
    onScroll,
    initialScrollOffset = 0,
  } = props

  const listRef = useRef<List>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Expose methods to parent components
  useImperativeHandle(ref, () => ({
    scrollToItem: (index: number, align?: "start" | "center" | "end" | "auto") => {
      listRef.current?.scrollToItem(index, align)
    },
    scrollToOffset: (offset: number) => {
      listRef.current?.scrollTo(offset)
    },
    getScrollOffset: () => {
      // Access internal state of react-window List
      const list = listRef.current as any
      return list?.state?.scrollOffset || 0
    },
  }))

  // Calculate total width with proper minimum widths
  const totalWidth = columns.reduce((sum, col) => {
    const colWidth = col.width || col.minWidth || 150
    return sum + colWidth
  }, 0)
  
  // Ensure minimum width for proper display
  const minTableWidth = Math.max(totalWidth, 1200)

  // Memoize column style calculations
  const columnStyles = useMemo(() => {
    return columns.map(column => ({
      width: column.width || column.minWidth || 150,
      minWidth: column.minWidth || column.width || 150,
    }))
  }, [columns])

  // Row renderer with optimizations
  const Row = useCallback(
    ({ index, style }: ListChildComponentProps) => {
      if (!data[index]) {
        console.warn(`⚠️ No data for row ${index}`)
        return (
          <div style={style} className="flex items-center justify-center bg-red-50">
            <span>Missing data for row {index}</span>
          </div>
        )
      }
      
      const item = data[index]
      const rowKey = getRowId ? getRowId(item, index) : index.toString()
      
      const handleClick = () => {
        if (onRowClick) {
          onRowClick(item, index)
        }
      }

      const computedRowClassName = 
        typeof rowClassName === "function" 
          ? rowClassName(item, index) 
          : rowClassName

      return (
        <div
          key={rowKey}
          className={cn(
            "flex items-center border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150",
            computedRowClassName,
            onRowClick && "cursor-pointer"
          )}
          onClick={handleClick}
          style={{ 
            ...style, 
            width: minTableWidth,
            minWidth: minTableWidth
          }}
          role="row"
        >
          {columns.map((column, colIndex) => (
            <div
              key={column.key}
              className={cn(
                "px-4 py-2 overflow-hidden text-ellipsis whitespace-nowrap flex-shrink-0",
                column.className
              )}
              style={columnStyles[colIndex]}
            >
              {column.render(item, index)}
            </div>
          ))}
        </div>
      )
    },
    [data, columns, columnStyles, onRowClick, rowClassName, getRowId, minTableWidth]
  )

  // Handle scroll events
  const handleScroll = useCallback((scrollInfo: { 
    scrollLeft: number; 
    scrollOffset: number; 
    scrollDirection: 'forward' | 'backward' 
  }) => {
    // Call parent's onScroll handler if provided
    if (onScroll) {
      onScroll({ 
        scrollOffset: scrollInfo.scrollOffset, 
        scrollDirection: scrollInfo.scrollDirection 
      })
    }
  }, [onScroll])

  if (data.length === 0) {
    return (
      <div className={cn("flex items-center justify-center", className)} style={{ height }}>
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={cn("virtualized-table", className)} style={{ height, position: 'relative' }}>
      {/* Header */}
      <div 
        className="overflow-hidden sticky top-0 z-10 bg-white"
        style={{ 
          height: 56,
          borderBottom: '2px solid #dee2e6',
          width: '100%'
        }}
      >
        <div
          ref={headerRef}
          className={cn(
            "overflow-x-hidden overflow-y-hidden",
            headerClassName
          )}
          style={{ 
            height: 56
          }}
        >
          <div 
            className="flex bg-gray-100" 
            style={{ 
              width: minTableWidth,
              minWidth: minTableWidth,
              height: 56
            }}
          >
            {columns.map((column) => (
              <div
                key={column.key}
                className={cn(
                  "px-4 py-3 font-semibold text-sm text-gray-700 flex-shrink-0 flex items-center",
                  column.className
                )}
                style={{
                  width: column.width || column.minWidth || 150,
                  minWidth: column.minWidth || column.width || 150,
                }}
              >
                {column.header}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Body - Single container for both scrolls */}
      <div 
        ref={containerRef}
        style={{ 
          height: height - 56,
          width: '100%',
          overflowX: 'auto',
          overflowY: 'hidden'
        }}
        onScroll={(e) => {
          // Sync header scroll with body scroll
          if (headerRef.current) {
            headerRef.current.scrollLeft = e.currentTarget.scrollLeft
          }
        }}
      >
        <List
          ref={listRef}
          height={height - 56}
          itemCount={data.length}
          itemSize={rowHeight}
          width={minTableWidth}
          overscanCount={overscanCount}
          onScroll={handleScroll}
          initialScrollOffset={initialScrollOffset}
        >
          {Row}
        </List>
      </div>
    </div>
  )
}

// Export with proper typing
export const VirtualizedTable = forwardRef(VirtualizedTableInner) as <T>(
  props: VirtualizedTableProps<T> & { ref?: React.Ref<VirtualizedTableRef> }
) => React.ReactElement