"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Database, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react"

export default function SeedPage() {
  const [seeding, setSeeding] = useState(false)
  const [seeded, setSeeded] = useState(false)
  const { toast } = useToast()

  const handleSeedDatabase = async () => {
    setSeeding(true)

    try {
      const response = await fetch("/api/seed-database", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const result = await response.json()

      if (result.success) {
        setSeeded(true)
        toast({
          title: "✅ Database seeded successfully",
          description: `Created ${result.data.orders?.length || 0} orders and ${result.data.escalations?.length || 0} escalation records`,
          duration: 5000,
        })
      } else {
        throw new Error(result.message || "Failed to seed database")
      }
    } catch (error) {
      console.error("Seeding error:", error)
      toast({
        title: "❌ Failed to seed database",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
        duration: 8000,
      })
    } finally {
      setSeeding(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Database Seeding</h1>
          <p className="text-gray-600 mt-2">Initialize your Supabase database with sample data</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Seed Database
            </CardTitle>
            <CardDescription>
              This will populate your Supabase database with sample orders and escalation data. Any existing data will
              be cleared first.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Warning</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    This action will delete all existing orders and escalation records in your database and replace them
                    with sample data.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">What will be created:</h4>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• 5 sample orders with different statuses and channels</li>
                <li>• 2 sample escalation records</li>
                <li>• Orders with SLA breach and near-breach scenarios</li>
                <li>• Complete order data including customer info and items</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleSeedDatabase} disabled={seeding} className="flex-1">
                {seeding ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Seeding Database...
                  </>
                ) : seeded ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Database Seeded
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4 mr-2" />
                    Seed Database
                  </>
                )}
              </Button>
            </div>

            {seeded && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-800">Success!</h4>
                    <p className="text-sm text-green-700 mt-1">
                      Your database has been seeded with sample data. You can now view the Executive Dashboard and Order
                      Management pages to see the live data.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <p>After seeding the database, you can:</p>
              <ul className="space-y-2 ml-4">
                <li>
                  • Visit the{" "}
                  <a href="/dashboard" className="text-blue-600 hover:underline">
                    Executive Dashboard
                  </a>{" "}
                  to see live SLA alerts
                </li>
                <li>
                  • Check the{" "}
                  <a href="/orders" className="text-blue-600 hover:underline">
                    Order Management
                  </a>{" "}
                  page for order filtering
                </li>
                <li>• Test the escalation functionality with real database integration</li>
                <li>• View real-time data updates from Supabase</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
