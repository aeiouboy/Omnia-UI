"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, AlertCircle, Info, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface Alert {
  id: string | number
  title: string
  description: string
  severity: "HIGH" | "MEDIUM" | "LOW"
  time: string
  businessUnit: string
}

export function CriticalAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAlerts() {
      try {
        setLoading(true)
        setError(null)

        // Directly query the database for SLA breached orders
        const { data: slaBreachedOrders, error: slaError } = await supabase
          .from("orders")
          .select("*")
          .eq("sla_status", "BREACH")
          .not("status", "in", '("DELIVERED","FULFILLED")')
          .order("elapsed_minutes", { ascending: false })

        if (slaError) {
          console.error("Error fetching SLA breached orders:", slaError)
          throw slaError
        }

        // Query for near breach orders
        const { data: allActiveOrders, error: activeError } = await supabase
          .from("orders")
          .select("*")
          .not("status", "in", '("DELIVERED","FULFILLED")')
          .neq("sla_status", "BREACH")
          .order("elapsed_minutes", { ascending: false })

        if (activeError) {
          console.error("Error fetching active orders:", activeError)
          throw activeError
        }

        // Filter for orders within 20% of SLA threshold
        const nearBreachOrders = (allActiveOrders || []).filter((order: any) => {
          const slaTargetMinutes = Number(order.sla_target_minutes) || 300 // Default 5 minutes
          const elapsedMinutes = Number(order.elapsed_minutes) || 0
          const remainingMinutes = slaTargetMinutes - elapsedMinutes
          const criticalThreshold = slaTargetMinutes * 0.2
          return remainingMinutes <= criticalThreshold && remainingMinutes > 0
        })

        console.log("SLA Breached Orders:", slaBreachedOrders)
        console.log("Near Breach Orders:", nearBreachOrders)

        // Create alerts array
        const newAlerts: Alert[] = []

        // Add SLA breach alert if there are any breached orders
        if (slaBreachedOrders && slaBreachedOrders.length > 0) {
          // Group by business unit
          const businessUnitGroups = slaBreachedOrders.reduce(
            (groups, order: any) => {
              const unit = order.business_unit || "ALL"
              if (!groups[unit]) groups[unit] = []
              groups[unit].push(order)
              return groups
            },
            {} as Record<string, any[]>,
          )

          // Create an alert for each business unit
          Object.entries(businessUnitGroups).forEach(([unit, orders]) => {
            newAlerts.push({
              id: `sla-breach-${unit}`,
              title: `${unit} SLA Breach Alert`,
              description: `${orders.length} order${orders.length > 1 ? "s" : ""} exceeding SLA threshold`,
              severity: "HIGH",
              time: "Just now",
              businessUnit: unit,
            })
          })
        }

        // Add near breach alert if there are any near breach orders
        if (nearBreachOrders && nearBreachOrders.length > 0) {
          // Group by business unit
          const businessUnitGroups = nearBreachOrders.reduce(
            (groups, order: any) => {
              const unit = order.business_unit || "ALL"
              if (!groups[unit]) groups[unit] = []
              groups[unit].push(order)
              return groups
            },
            {} as Record<string, any[]>,
          )

          // Create an alert for each business unit
          Object.entries(businessUnitGroups).forEach(([unit, orders]) => {
            newAlerts.push({
              id: `near-breach-${unit}`,
              title: `${unit} Near SLA Breach`,
              description: `${orders.length} order${orders.length > 1 ? "s" : ""} approaching SLA threshold`,
              severity: "MEDIUM",
              time: "Just now",
              businessUnit: unit,
            })
          })
        }

        // Check for low stock items (mock for now)
        newAlerts.push({
          id: "low-stock",
          title: "Low Stock Alert",
          description: "5 items below safety stock levels",
          severity: "MEDIUM",
          time: "10 minutes ago",
          businessUnit: "CENTRAL",
        })

        // Add API latency alert
        newAlerts.push({
          id: "api-latency",
          title: "API Latency Warning",
          description: "Lazada integration response time elevated",
          severity: "LOW",
          time: "15 minutes ago",
          businessUnit: "ALL",
        })

        console.log("Generated Alerts:", newAlerts)

        // If no real alerts, add some default ones for demonstration
        if (newAlerts.length === 0) {
          newAlerts.push(
            {
              id: 1,
              title: "Grab Order SLA Breach",
              description: "15 orders exceeding 5-minute SLA threshold",
              severity: "HIGH",
              time: "2 minutes ago",
              businessUnit: "TOPS",
            },
            {
              id: 2,
              title: "Low Stock Alert",
              description: "Critical items below safety stock levels",
              severity: "MEDIUM",
              time: "8 minutes ago",
              businessUnit: "CENTRAL",
            },
            {
              id: 3,
              title: "API Latency Warning",
              description: "Lazada integration response time elevated",
              severity: "LOW",
              time: "15 minutes ago",
              businessUnit: "ALL",
            },
          )
        }

        setAlerts(newAlerts)
      } catch (err) {
        console.error("Error fetching alerts:", err)
        setError("Failed to load alerts")

        // Set default alerts in case of error
        setAlerts([
          {
            id: 1,
            title: "Grab Order SLA Breach",
            description: "15 orders exceeding 5-minute SLA threshold",
            severity: "HIGH",
            time: "2 minutes ago",
            businessUnit: "TOPS",
          },
          {
            id: 2,
            title: "Low Stock Alert",
            description: "Critical items below safety stock levels",
            severity: "MEDIUM",
            time: "8 minutes ago",
            businessUnit: "CENTRAL",
          },
          {
            id: 3,
            title: "API Latency Warning",
            description: "Lazada integration response time elevated",
            severity: "LOW",
            time: "15 minutes ago",
            businessUnit: "ALL",
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchAlerts()

    // Set up polling to refresh alerts every 30 seconds
    const intervalId = setInterval(() => {
      fetchAlerts()
    }, 30000)

    return () => clearInterval(intervalId)
  }, [])

  function getSeverityIcon(severity: string) {
    switch (severity) {
      case "HIGH":
        return <AlertTriangle className="h-5 w-5 text-status-critical" />
      case "MEDIUM":
        return <AlertCircle className="h-5 w-5 text-status-warning" />
      case "LOW":
        return <Info className="h-5 w-5 text-status-info" />
      default:
        return <Info className="h-5 w-5 text-status-info" />
    }
  }

  function getSeverityBadge(severity: string) {
    switch (severity) {
      case "HIGH":
        return <span className="status-badge-high">HIGH</span>
      case "MEDIUM":
        return <span className="status-badge-medium">MEDIUM</span>
      case "LOW":
        return <span className="status-badge-low">LOW</span>
      default:
        return <span className="status-badge-low">LOW</span>
    }
  }

  function getBusinessUnitBadge(unit: string) {
    switch (unit) {
      case "TOPS":
        return (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
            TOPS
          </span>
        )
      case "CENTRAL":
        return (
          <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">
            CENTRAL
          </span>
        )
      case "SUPERSPORTS":
        return (
          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
            SUPERSPORTS
          </span>
        )
      case "ALL":
        return (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
            ALL
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
            {unit}
          </span>
        )
    }
  }

  return (
    <Card>
      <CardHeader className="bg-enterprise-blue text-white py-4 px-6 rounded-t-lg">
        <CardTitle className="text-lg font-medium">Critical Alerts</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-enterprise-blue" />
            <span className="ml-2">Loading alerts...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-status-critical">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>{error}</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        ) : alerts.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Info className="h-8 w-8 mx-auto mb-2" />
            <p>No critical alerts at this time</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-enterprise-border">
              {alerts.map((alert) => (
                <div key={alert.id} className="p-4">
                  <div className="flex items-start mb-2">
                    <div className="flex-shrink-0 mr-3 mt-0.5">{getSeverityIcon(alert.severity)}</div>
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-1">
                        {getSeverityBadge(alert.severity)}
                        <span className="text-xs text-enterprise-text-light">{alert.time}</span>
                      </div>
                      <div className="font-medium">{alert.title}</div>
                      <div className="text-sm text-enterprise-text-light mb-2">{alert.description}</div>
                      <div className="flex items-center justify-between">
                        <div>{getBusinessUnitBadge(alert.businessUnit)}</div>
                        <Button variant="outline" size="sm" className="h-7 text-xs">
                          Investigate
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 text-center border-t border-enterprise-border">
              <Button variant="link" size="sm" className="text-enterprise-text h-auto p-0">
                View All Alerts
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
