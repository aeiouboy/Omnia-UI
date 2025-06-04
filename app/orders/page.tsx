import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { OrderManagementHub } from "@/components/order-management-hub"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

export default function OrdersPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Order Management" text="View and manage orders across all channels.">
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Order
        </Button>
      </DashboardHeader>
      <OrderManagementHub />
    </DashboardShell>
  )
}
