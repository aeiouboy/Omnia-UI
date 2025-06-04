"use client"

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  {
    name: "Grab",
    store: 4.2,
    warehouse: 6.1,
    target: 5,
  },
  {
    name: "Lazada",
    store: 12.3,
    warehouse: 8.5,
    target: 15,
  },
  {
    name: "Shopee",
    store: 14.1,
    warehouse: 9.2,
    target: 15,
  },
  {
    name: "TikTok",
    store: 18.2,
    warehouse: 12.3,
    target: 20,
  },
  {
    name: "Shopify",
    store: 15.8,
    warehouse: 10.1,
    target: 15,
  },
  {
    name: "In-store",
    store: 8.9,
    warehouse: 7.2,
    target: 10,
  },
]

export function PerformanceChart() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-medium-gray p-6">
      <h3 className="text-lg font-medium text-deep-navy mb-4">Processing Time by Channel</h3>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fill: "#475569", fontSize: 12 }} axisLine={{ stroke: "#e2e8f0" }} />
          <YAxis
            label={{
              value: "Minutes",
              angle: -90,
              position: "insideLeft",
              style: { fill: "#475569", fontSize: 12 },
            }}
            tick={{ fill: "#475569", fontSize: 12 }}
            axisLine={{ stroke: "#e2e8f0" }}
          />
          <Tooltip
            formatter={(value) => [`${value} min`, "Processing Time"]}
            labelFormatter={(label) => `Channel: ${label}`}
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "4px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          />
          <Legend
            wrapperStyle={{
              paddingTop: "20px",
              fontSize: "12px",
            }}
          />
          <Bar dataKey="store" name="Store Fulfillment" fill="#0369a1" radius={[4, 4, 0, 0]} />
          <Bar dataKey="warehouse" name="Warehouse Fulfillment" fill="#334155" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
