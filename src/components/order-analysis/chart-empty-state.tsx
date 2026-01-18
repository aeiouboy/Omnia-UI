import { BarChart3 } from "lucide-react"

export function ChartEmptyState() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg z-10">
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground/50" />
        </div>
        <p className="text-sm text-muted-foreground">
          No data available for selected period
        </p>
      </div>
    </div>
  )
}
