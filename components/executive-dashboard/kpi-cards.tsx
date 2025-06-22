"use client"

import { KpiCard } from "@/components/kpi-card"
import { Package, AlertTriangle, DollarSign, BarChart2 } from "lucide-react"
import { KpiData, KpiLoadingState } from "./types"
import { formatCurrencyInt } from "@/lib/currency-utils"

interface KpiCardsProps {
  kpiData: KpiData
  kpiLoading: KpiLoadingState
}

export function KpiCards({ kpiData, kpiLoading }: KpiCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6">
      <KpiCard
        icon={<Package className="h-6 w-6 text-blue-600" />}
        value={kpiData.ordersProcessing}
        change={0}
        label="Orders Processing"
        isLoading={kpiLoading.ordersProcessing}
      />
      <KpiCard
        icon={<AlertTriangle className="h-6 w-6 text-red-600" />}
        value={kpiData.slaBreaches}
        change={0}
        label="SLA Breaches"
        isLoading={kpiLoading.slaBreaches}
        inverseColor
      />
      <KpiCard
        icon={<DollarSign className="h-6 w-6 text-blue-600" />}
        value={formatCurrencyInt(kpiData?.revenueToday)}
        change={0}
        label="Revenue (7 days)"
        isLoading={kpiLoading.revenueToday}
      />
      <KpiCard
        icon={<BarChart2 className="h-6 w-6 text-indigo-600" />}
        value={`${kpiData.fulfillmentRate}%`}
        change={0}
        label="Fulfillment Rate"
        isLoading={kpiLoading.fulfillmentRate}
      />
    </div>
  )
}
