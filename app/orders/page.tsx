import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { OrderManagementHub } from "@/components/order-management-hub"

export default function OrdersPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Order Management" text="View and manage orders across all channels." />
      <OrderManagementHub />
    </DashboardShell>
  )
}
