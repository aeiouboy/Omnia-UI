import { Layers } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface InventoryViewSelectorProps {
  value: string | undefined
  onValueChange: (value: string) => void
}

// View code options (stock configuration views)
const VIEW_CODE_OPTIONS = [
  "ECOM-TH-CFR-LOCD-STD",
  "ECOM-TH-DSS-NW-ALL",
  "ECOM-TH-DSS-NW-STD",
  "ECOM-TH-DSS-LOCD-EXP",
  "ECOM-TH-SSP-NW-STD",
  "MKP-TH-SSP-NW-STD",
  "MKP-TH-CFR-LOCD-STD",
  "ECOM-TH-SSP-NW-ALL",
  "MKP-TH-CFR-MANUAL-SYNC",
  "CMG-ECOM-TH-STD",
  "CMG-MKP-SHOPEE-TH-NTW-STD",
  "CMG-MKP-LAZADA-TH-LOC-STD",
  "CMG-MKP-MIRAKL-TH-NTW-STD",
] as const

export function InventoryViewSelector({
  value,
  onValueChange,
}: InventoryViewSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <Select value={value || ""} onValueChange={onValueChange}>
        <SelectTrigger className="w-[240px] h-10 bg-primary/5 border-primary/20 font-medium">
          <SelectValue placeholder="Select a view..." />
        </SelectTrigger>
        <SelectContent>
          {VIEW_CODE_OPTIONS.map((viewCode) => (
            <SelectItem key={viewCode} value={viewCode}>
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                {viewCode}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
