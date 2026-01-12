"use client"

import { CCProductItem } from "@/types/audit"

interface ProductCardProps {
  product: CCProductItem
}

/**
 * Product Card Component for Ship to Store scenario
 * Displays product information with green border styling
 */
export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="border-2 border-green-500 rounded-lg p-3 sm:p-4 bg-white dark:bg-gray-900">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        {/* Product Name - spans 2 columns on mobile, 1 on desktop */}
        <div className="col-span-2 sm:col-span-1">
          <div className="text-xs text-muted-foreground mb-1">Product</div>
          <div className="text-sm font-medium break-words">{product.productName}</div>
        </div>

        {/* SKU */}
        <div>
          <div className="text-xs text-muted-foreground mb-1">SKU</div>
          <div className="text-sm font-mono">{product.sku}</div>
        </div>

        {/* Shipped Qty */}
        <div>
          <div className="text-xs text-muted-foreground mb-1">Shipped Qty</div>
          <div className="text-sm font-semibold text-green-600">{product.shippedQty}</div>
        </div>

        {/* Ordered Qty */}
        <div>
          <div className="text-xs text-muted-foreground mb-1">Ordered Qty</div>
          <div className="text-sm">{product.orderedQty}</div>
        </div>

        {/* UOM */}
        <div>
          <div className="text-xs text-muted-foreground mb-1">UOM</div>
          <div className="text-sm font-medium">{product.uom}</div>
        </div>
      </div>
    </div>
  )
}
