import { EscalationManagement } from "@/components/escalation-management"
import { DashboardShell } from "@/components/dashboard-shell"

export default function EscalationsPage() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <EscalationManagement />
      </div>
    </DashboardShell>
  )
}
