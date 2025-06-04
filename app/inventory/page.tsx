import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { InventoryManagement } from "@/components/inventory-management"
import { Button } from "@/components/ui/button"
import { PlusCircle, Upload, Download } from "lucide-react"

export default function InventoryPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Inventory Management" text="Manage inventory across all locations.">
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </DashboardHeader>
      <InventoryManagement />
    </DashboardShell>
  )
}
