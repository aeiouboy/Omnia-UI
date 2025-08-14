"use client"

import { useState, useEffect } from "react"
import { DashboardService } from "@/lib/dashboard-service"
import { Skeleton } from "@/components/ui/skeleton"

export function FulfillmentTab() {
  const [loading, setLoading] = useState(true)
  const [fulfillmentData, setFulfillmentData] = useState({
    onTimeFulfillment: 0,
    avgFulfillmentTime: 0,
    itemsFulfilled: 0,
  })
  const [branchData, setBranchData] = useState([])
  const [channelData, setChannelData] = useState([])

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const [performance, branches, channels] = await Promise.all([
          DashboardService.getFulfillmentPerformance(),
          DashboardService.getFulfillmentByBranch(),
          DashboardService.getFulfillmentByChannel(),
        ])

        setFulfillmentData(performance)
        setBranchData(branches)
        setChannelData(channels)
      } catch (error) {
        console.error("Error loading fulfillment data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-[150px]" />
          <Skeleton className="h-[150px]" />
          <Skeleton className="h-[150px]" />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[300px]" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-5 md:grid-cols-3">
        <div className="bg-white rounded-lg shadow-sm border border-medium-gray p-5">
          <h3 className="font-semibold text-green-900 mb-2">On-Time Fulfillment</h3>
          <p className="text-3xl font-bold text-green-600">{fulfillmentData.onTimeFulfillment.toFixed(1)}%</p>
          <p className="text-sm text-green-700">+2.4% จากเดือนที่แล้ว</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-medium-gray p-5">
          <h3 className="font-semibold text-blue-900 mb-2">Avg Fulfillment Time</h3>
          <p className="text-3xl font-bold text-blue-600">{fulfillmentData.avgFulfillmentTime.toFixed(1)} min</p>
          <p className="text-sm text-blue-700">-1.2 min จากเดือนที่แล้ว</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-medium-gray p-5">
          <h3 className="font-semibold text-amber-900 mb-2">Items Fulfilled Today</h3>
          <p className="text-3xl font-bold text-amber-600">{fulfillmentData.itemsFulfilled.toLocaleString()}</p>
          <p className="text-sm text-amber-700">+5.4% จากเมื่อวาน</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-white rounded-lg shadow-sm border border-medium-gray p-6">
          <h3 className="text-lg font-semibold mb-4">📍 Fulfillment by Branch</h3>
          <div className="space-y-3">
            {branchData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm">{item.branch}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${item.fulfillment_rate >= 95 ? "bg-green-500" : "bg-amber-500"}`}
                      style={{ width: `${item.fulfillment_rate}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{item.fulfillment_rate.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-medium-gray p-6">
          <h3 className="text-lg font-semibold mb-4">🛒 Fulfillment by Channel</h3>
          <div className="space-y-3">
            {channelData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm">{item.channel}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${item.fulfillment_rate >= 90 ? "bg-green-500" : "bg-amber-500"}`}
                      style={{ width: `${item.fulfillment_rate}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{item.fulfillment_rate.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
