import type { Metadata } from "next"
import { DashboardShell } from "@/components/dashboard-shell"
import { StyleGuideContent } from "@/components/style-guide/style-guide-content"

export const metadata: Metadata = {
  title: "Style Guide | Central Group OMS",
  description: "Comprehensive style guide and design system documentation for frontend developers",
}

export default function StyleGuidePage() {
  return (
    <DashboardShell>
      <StyleGuideContent />
    </DashboardShell>
  )
}
