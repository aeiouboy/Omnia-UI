"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { UserNav } from "@/components/user-nav"
import { SideNav } from "@/components/side-nav"
import { RefreshCw, Menu, LayoutDashboard, Search, Package, AlertTriangle, Palette } from "lucide-react"
import { BottomNav } from "@/components/ui/bottom-nav"
import { useSidebar } from "@/contexts/sidebar-context"
import { cn, formatGMT7TimeString, getCurrentTimeString } from "@/lib/utils"
import { getBangkokTimeString } from "@/lib/timezone-utils"
import { getEscalationStats } from "@/lib/escalation-service"

interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  const { isCollapsed, isMobile, setIsMobileOpen } = useSidebar()
  
  // State for client-side time to prevent hydration mismatch
  const [currentTime, setCurrentTime] = useState<string>("")
  const [isMounted, setIsMounted] = useState(false)
  
  // Get current time with multiple fallbacks
  const getCurrentTime = () => {
    try {
      return formatGMT7TimeString()
    } catch (error) {
      console.warn("Error getting GMT+7 time with formatGMT7TimeString, trying getCurrentTimeString:", error)
      try {
        return getCurrentTimeString()
      } catch (error2) {
        console.warn("Error getting GMT+7 time with getCurrentTimeString, trying getBangkokTimeString:", error2)
        try {
          return getBangkokTimeString()
        } catch (error3) {
          console.warn("Error getting GMT+7 time with getBangkokTimeString, using basic fallback:", error3)
          return new Date().toLocaleTimeString("en-US", { hour12: false })
        }
      }
    }
  }
  
  // State for escalation badge count
  const [escalationBadgeCount, setEscalationBadgeCount] = useState<number>(0)

  // Client-side time update to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true)
    setCurrentTime(getCurrentTime())
    
    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(getCurrentTime())
    }, 1000)
    
    return () => clearInterval(timeInterval)
  }, [])

  // Load escalation stats for badge count
  useEffect(() => {
    const loadEscalationStats = async () => {
      try {
        const stats = await getEscalationStats()
        // Show count of pending + failed escalations (actionable items)
        const actionableCount = stats.pending + stats.failed
        setEscalationBadgeCount(actionableCount)
      } catch (error) {
        console.warn("Failed to load escalation stats for badge:", error)
        setEscalationBadgeCount(0)
      }
    }

    loadEscalationStats()
    
    // Refresh badge count every 30 seconds
    const interval = setInterval(loadEscalationStats, 30000)
    
    return () => clearInterval(interval)
  }, [])

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
      badge: escalationBadgeCount
    },
    {
      href: "/style-guide",
      label: "Style",
      icon: <Palette className="h-5 w-5" />
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
                <h1 className="text-base font-bold text-white drop-shadow-sm">Central Group OMS</h1>
                <p className="text-xs text-white/90 drop-shadow-sm">Enterprise Command Center</p>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-4">
              <button className="flex items-center justify-center w-8 h-8 text-white/90 hover:text-white hover:bg-white/10 rounded transition-colors" title="Refresh">
                <RefreshCw className="h-4 w-4" />
              </button>
              <div className="text-sm hidden sm:block text-white/80">
                <span className="text-white/70">Last updated:</span> <span className="text-white/90">{isMounted ? currentTime : "--:--:--"}</span>
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
