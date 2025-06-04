import { EscalationManagement } from "@/components/escalation-management"
import { DashboardShell } from "@/components/dashboard-shell"
import { BreadcrumbNav } from "@/components/breadcrumb-nav"

export default function EscalationsPage() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <BreadcrumbNav
          items={[
            { label: "Dashboard", href: "/" },
            { label: "Escalations", href: "/escalations" },
          ]}
        />
        <EscalationManagement />
      </div>
    </DashboardShell>
  )
}
