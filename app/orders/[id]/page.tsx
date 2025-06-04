import { DashboardShell } from "@/components/dashboard-shell"
import { OrderDetailView } from "@/components/order-detail-view"

interface OrderDetailPageProps {
  params: {
    id: string
  }
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  return (
    <DashboardShell>
      <OrderDetailView orderId={params.id} />
    </DashboardShell>
  )
}
