import { DashboardShell } from "@/components/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard-header"
import { MarketplaceIntegrationDashboard } from "@/components/marketplace-integration-dashboard"
import { Button } from "@/components/ui/button"
import { Plus, RefreshCw } from "lucide-react"

export default function MarketplacePage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Marketplace Integration">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync All
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Channel
          </Button>
        </div>
      </DashboardHeader>
      <div className="p-6">
        <MarketplaceIntegrationDashboard />
      </div>
    </DashboardShell>
  )
}
