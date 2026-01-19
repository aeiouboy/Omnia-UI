/**
 * Not Found Page for Inventory Product Detail
 *
 * Displayed when a product ID doesn't exist.
 */

import Link from "next/link"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PackageX, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <DashboardShell>
      <div className="container mx-auto p-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-muted p-6">
                <PackageX className="h-16 w-16 text-muted-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl">Product Not Found</CardTitle>
            <CardDescription className="text-base">
              The product you're looking for doesn't exist or has been removed from inventory.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Link href="/inventory-new">
              <Button className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Inventory
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
