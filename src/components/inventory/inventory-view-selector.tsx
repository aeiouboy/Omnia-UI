import { Layers } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { VIEW_TYPE_CONFIG, getViewTypeDescription } from "@/types/view-type-config"

interface InventoryViewSelectorProps {
  value: string | undefined
  onValueChange: (value: string) => void
  /** Whether the selector shows a required indicator */
  required?: boolean
}

export function InventoryViewSelector({
  value,
  onValueChange,
  required = true,
}: InventoryViewSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <Select value={value || ""} onValueChange={onValueChange}>
        <SelectTrigger className={`w-[280px] h-10 bg-primary/5 border-primary/20 font-medium ${required && !value ? 'border-orange-400 ring-1 ring-orange-400' : ''}`}>
          <SelectValue placeholder="Select a View Type *" />
        </SelectTrigger>
        <SelectContent>
          {VIEW_TYPE_CONFIG.map((config) => (
            <SelectItem key={config.viewType} value={config.viewType}>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  <span className="font-medium">{config.viewType}</span>
                </div>
                <span className="text-xs text-muted-foreground ml-6">
                  {config.description} ({config.channels.join(", ")})
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {required && !value && (
        <span className="text-xs text-orange-600 font-medium">Required</span>
      )}
    </div>
  )
}
