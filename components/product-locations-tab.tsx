"use client"

import { useState, useEffect } from "react"
import { ExternalLink } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { InventoryService, type LocationInventory } from "@/lib/inventory-service"

interface ProductLocationsTabProps {
  productId: number
}

export function ProductLocationsTab({ productId }: ProductLocationsTabProps) {
  const [locations, setLocations] = useState<LocationInventory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadLocationData() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await InventoryService.getInventoryByLocation(productId)
        setLocations(data)
      } catch (err) {
        console.error("Failed to load location data:", err)
        setError("Failed to load location data. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    loadLocationData()
  }, [productId])

  if (isLoading) {
    return <div className="py-8 text-center text-muted-foreground">Loading location data...</div>
  }

  if (error) {
    return <div className="py-8 text-center text-red-500">{error}</div>
  }

  if (locations.length === 0) {
    return <div className="py-8 text-center text-muted-foreground">No location data available</div>
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Location Inventory</h3>
      <div className="space-y-4">
        {locations.map((location) => (
          <Card key={location.location_id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h4 className="text-base font-medium">{location.location_name}</h4>
                    <p className="text-sm text-muted-foreground">Location ID: {location.location_code}</p>
                  </div>
                  <div className="flex items-center mt-2 md:mt-0 space-x-4">
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Available</div>
                      <div className="text-lg font-medium text-green-600">{location.available}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Reserved</div>
                      <div className="text-lg font-medium text-blue-600">{location.reserved}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="border-t px-4 py-2 bg-muted/50 flex justify-end">
                <Button variant="ghost" size="sm">
                  View Location Details
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
