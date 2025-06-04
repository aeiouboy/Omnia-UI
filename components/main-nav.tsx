"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  BarChart3,
  Truck,
  RefreshCcw,
  Users,
  AlertTriangle,
} from "lucide-react"

export function MainNav() {
  const pathname = usePathname()

  return (
    <div className="flex items-center space-x-4 lg:space-x-6">
      <Link href="/" className="flex items-center space-x-2">
        <div className="h-8 w-8 rounded-md bg-deep-navy flex items-center justify-center">
          <ShoppingCart className="h-4 w-4 text-white" />
        </div>
        <span className="font-bold text-xl hidden md:inline-block text-deep-navy">Central OMS</span>
      </Link>
      <nav className="flex items-center space-x-4 lg:space-x-6 ml-6">
        <Link
          href="/"
          className={cn(
            "flex items-center text-sm font-medium transition-colors hover:text-deep-navy",
            pathname === "/" ? "text-deep-navy" : "text-steel-gray",
          )}
        >
          <LayoutDashboard className="h-4 w-4 mr-2" />
          <span className="hidden md:inline-block">Dashboard</span>
        </Link>
        <Link
          href="/orders"
          className={cn(
            "flex items-center text-sm font-medium transition-colors hover:text-deep-navy",
            pathname?.startsWith("/orders") ? "text-deep-navy" : "text-steel-gray",
          )}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          <span className="hidden md:inline-block">Orders</span>
        </Link>
        <Link
          href="/inventory"
          className={cn(
            "flex items-center text-sm font-medium transition-colors hover:text-deep-navy",
            pathname?.startsWith("/inventory") ? "text-deep-navy" : "text-steel-gray",
          )}
        >
          <Package className="h-4 w-4 mr-2" />
          <span className="hidden md:inline-block">Inventory</span>
        </Link>
        <Link
          href="/fulfillment"
          className={cn(
            "flex items-center text-sm font-medium transition-colors hover:text-deep-navy",
            pathname?.startsWith("/fulfillment") ? "text-deep-navy" : "text-steel-gray",
          )}
        >
          <Truck className="h-4 w-4 mr-2" />
          <span className="hidden md:inline-block">Fulfillment</span>
        </Link>
        <Link
          href="/marketplace"
          className={cn(
            "flex items-center text-sm font-medium transition-colors hover:text-deep-navy",
            pathname?.startsWith("/marketplace") ? "text-deep-navy" : "text-steel-gray",
          )}
        >
          <RefreshCcw className="h-4 w-4 mr-2" />
          <span className="hidden md:inline-block">Marketplace</span>
        </Link>
        <Link
          href="/analytics"
          className={cn(
            "flex items-center text-sm font-medium transition-colors hover:text-deep-navy",
            pathname?.startsWith("/analytics") ? "text-deep-navy" : "text-steel-gray",
          )}
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          <span className="hidden md:inline-block">Analytics</span>
        </Link>
        <Link
          href="/customers"
          className={cn(
            "flex items-center text-sm font-medium transition-colors hover:text-deep-navy",
            pathname?.startsWith("/customers") ? "text-deep-navy" : "text-steel-gray",
          )}
        >
          <Users className="h-4 w-4 mr-2" />
          <span className="hidden md:inline-block">Customers</span>
        </Link>
        <Link
          href="/alerts"
          className={cn(
            "flex items-center text-sm font-medium transition-colors hover:text-deep-navy",
            pathname?.startsWith("/alerts") ? "text-deep-navy" : "text-steel-gray",
          )}
        >
          <AlertTriangle className="h-4 w-4 mr-2" />
          <span className="hidden md:inline-block">Alerts</span>
        </Link>
      </nav>
    </div>
  )
}
