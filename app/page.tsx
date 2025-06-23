import { DashboardShell } from "@/components/dashboard-shell"
import { ExecutiveDashboard } from "@/components/executive-dashboard/index"

export default function Home() {
  return (
    <DashboardShell>
      <ExecutiveDashboard />
    </DashboardShell>
  )
}
