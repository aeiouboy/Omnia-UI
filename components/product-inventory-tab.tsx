"use client"

import { useState, useEffect } from "react"
import { BarChart, LineChart } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { InventoryService, type ProductInventory } from "@/lib/inventory-service"

interface ProductInventoryTabProps {
  productId: number
}

export function ProductInventoryTab({ productId }: ProductInventoryTabProps) {
  const [inventory, setInventory] = useState<ProductInventory | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadInventoryData() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await InventoryService.getProductInventory(productId)
        setInventory(data)
      } catch (err) {
        console.error("Failed to load inventory data:", err)
        setError("Failed to load inventory data. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    loadInventoryData()
  }, [productId])

  if (isLoading) {
    return <div className="py-8 text-center text-muted-foreground">Loading inventory data...</div>
  }

  if (error) {
    return <div className="py-8 text-center text-red-500">{error}</div>
  }

  if (!inventory) {
    return <div className="py-8 text-center text-muted-foreground">No inventory data available</div>
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-2">Available</div>
            <div className="text-3xl font-bold">{inventory.available}</div>
            <div className="text-xs text-muted-foreground mt-1">units</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-2">Reserved</div>
            <div className="text-3xl font-bold">{inventory.reserved}</div>
            <div className="text-xs text-muted-foreground mt-1">units</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-2">Safety Stock</div>
            <div className="text-3xl font-bold">{inventory.safety_stock}</div>
            <div className="text-xs text-muted-foreground mt-1">units</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Inventory Trend</h3>
          <Button variant="outline" size="sm">
            <LineChart className="h-4 w-4 mr-2" />
            View Analytics
          </Button>
        </div>
        <Card>
          <CardContent className="p-6 h-[300px] flex items-center justify-center text-muted-foreground">
            Inventory trend chart will be displayed here
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Inventory Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button variant="outline" className="h-16 justify-start px-4">
            <BarChart className="h-5 w-5 mr-2" />
            Create Purchase Order
          </Button>
          <Button variant="outline" className="h-16 justify-start px-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              <path d="m15 5 4 4" />
            </svg>
            Transfer Inventory
          </Button>
        </div>
      </div>
    </div>
  )
}
