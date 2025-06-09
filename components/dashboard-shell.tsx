"use client"

import type React from "react"
import { UserNav } from "@/components/user-nav"
import { SideNav } from "@/components/side-nav"
import { RefreshCw, Menu, LayoutDashboard, Search, Package, AlertTriangle } from "lucide-react"
import { BottomNav } from "@/components/ui/bottom-nav"
import { useSidebar } from "@/contexts/sidebar-context"
import { cn, formatGMT7TimeString } from "@/lib/utils"

interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  const { isCollapsed, isMobile, setIsMobileOpen } = useSidebar()
  const currentTime = formatGMT7TimeString()

  const bottomNavItems = [
    {
      href: "/",
      label: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />
    },
    {
      href: "/orders", 
      label: "Orders",
      icon: <Search className="h-5 w-5" />
    },
    {
      href: "/inventory",
      label: "Inventory", 
      icon: <Package className="h-5 w-5" />
    },
    {
      href: "/escalations",
      label: "Alerts",
      icon: <AlertTriangle className="h-5 w-5" />,
      badge: 2 // Example badge for alerts
    }
  ]

  return (
    <div className="min-h-screen">
      <SideNav />
      <div
        className={cn(
          "flex flex-col flex-1 transition-all duration-300 ease-in-out",
          !isMobile && (isCollapsed ? "md:ml-16" : "md:ml-64"),
        )}
      >
        <header className="sticky top-0 z-40 bg-enterprise-dark text-white shadow-md">
          <div className="flex h-16 items-center px-6 gap-4">
            <div className="flex items-center gap-2">
              {isMobile && (
                <button
                  onClick={() => setIsMobileOpen(true)}
                  className="mr-2 p-1 rounded-md hover:bg-white/10 transition-colors"
                  aria-label="Open sidebar"
                >
                  <Menu className="h-5 w-5" />
                </button>
              )}
              <div className="bg-white/10 p-1 rounded">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="8" y1="21" x2="16" y2="21"></line>
                  <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">Central Group OMS</h1>
                <p className="text-xs text-gray-100">Enterprise Command Center</p>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-4">
              <button className="flex items-center gap-1 text-sm">
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </button>
              <div className="text-sm hidden sm:block">
                <span className="text-gray-200">Last updated:</span> {currentTime}
              </div>
              <UserNav />
            </div>
          </div>
        </header>
        <main className="flex-1 bg-enterprise-light p-6 pb-20 md:pb-6">{children}</main>
        <footer className="bg-enterprise-dark text-white border-t border-enterprise-border hidden md:block">
          <div className="flex h-12 items-center justify-center px-6">
            <div className="text-xs text-gray-300">Enterprise OMS v1.0 © 2025 Central Group. All rights reserved.</div>
          </div>
        </footer>
      </div>
      <BottomNav items={bottomNavItems} />
    </div>
  )
}
