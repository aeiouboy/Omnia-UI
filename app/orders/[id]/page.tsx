import { DashboardShell } from "@/components/dashboard-shell"
import { OrderDetailView } from "@/components/order-detail-view"

interface OrderDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params
  return (
    <DashboardShell>
      <OrderDetailView orderId={id} />
    </DashboardShell>
  )
}
