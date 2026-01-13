import { Package } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface InventoryEmptyStateProps {
  message?: string
}

export function InventoryEmptyState({
  message = "Please select a view to display inventory"
}: InventoryEmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <Package className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <p className="text-lg font-medium text-muted-foreground">
          {message}
        </p>
        <p className="text-sm text-muted-foreground/70 mt-2">
          Select a view from the dropdown above to see inventory data
        </p>
      </CardContent>
    </Card>
  )
}
