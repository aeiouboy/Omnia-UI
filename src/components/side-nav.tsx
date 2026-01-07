"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Search, Package, Menu, X, AlertTriangle, Palette, Scale, FileSpreadsheet } from "lucide-react"
import { useSidebar } from "@/contexts/sidebar-context"
import { useSwipe } from "@/hooks/use-swipe"
import { useEdgeSwipe } from "@/hooks/use-edge-swipe"

export function SideNav() {
  const pathname = usePathname()
  const { isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen, isMobile } = useSidebar()

  const navItems = [
    {
      title: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      title: "Order Search",
      href: "/orders",
      icon: Search,
    },
    {
      title: "Inventory",
      href: "/inventory",
      icon: Package,
    },
    {
      title: "ATC Config",
      href: "/atc-config",
      icon: Scale,
    },
    {
      title: "Stock Config",
      href: "/stock-config",
      icon: FileSpreadsheet,
    },
    {
      title: "Escalations",
      href: "/escalations",
      icon: AlertTriangle,
    },
    {
      title: "Style Guide",
      href: "/style-guide",
      icon: Palette,
    },
  ]

  // Handle mobile link click to close sidebar
  const handleLinkClick = () => {
    if (isMobile) {
      setIsMobileOpen(false)
    }
  }

  // Edge swipe detection for opening sidebar from left edge
  useEdgeSwipe({
    onSwipeFromLeftEdge: () => {
      if (isMobile && !isMobileOpen) {
        setIsMobileOpen(true)
      }
    },
    edgeThreshold: 20,
    swipeThreshold: 50,
  })

  // Swipe detection for the sidebar itself
  const sidebarSwipeRef = useSwipe(
    {
      onSwipeLeft: () => {
        if (isMobile && isMobileOpen) {
          setIsMobileOpen(false)
        }
      },
      onSwipeRight: () => {
        if (isMobile && !isMobileOpen) {
          setIsMobileOpen(true)
        }
      },
    },
    {
      threshold: 50,
      preventDefaultTouchmoveEvent: false,
    },
  )

  if (isMobile) {
    return (
      <>
        {/* Mobile Backdrop */}
        {isMobileOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Mobile Sidebar */}
        <div
          ref={sidebarSwipeRef as React.RefObject<HTMLDivElement>}
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-enterprise-border transform transition-transform duration-300 ease-in-out md:hidden",
            isMobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="py-4 h-full w-full overflow-hidden">
            {/* Close Button */}
            <div className="px-3 mb-4 flex justify-between items-center">
              <span className="font-display font-semibold text-lg text-deep-navy">Central OMS</span>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-2 rounded-md hover:bg-enterprise-light transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close sidebar"
              >
                <X className="h-4 w-4 text-enterprise-text-light" />
              </button>
            </div>

            {/* Navigation Header */}
            <div className="px-3 py-2">
              <h2 className="text-xs uppercase text-enterprise-text-light font-semibold tracking-wider">Navigation</h2>
            </div>

            {/* Navigation Items */}
            <nav className="space-y-1 px-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors relative",
                    pathname === item.href
                      ? "bg-enterprise-light text-enterprise-dark"
                      : "text-enterprise-text-light hover:bg-enterprise-light hover:text-enterprise-dark",
                  )}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm font-medium truncate">{item.title}</span>
                </Link>
              ))}
            </nav>

            {/* Swipe Hint */}
            <div className="absolute bottom-4 left-0 right-0 px-3">
              <div className="text-xs text-enterprise-text-light text-center opacity-60">Swipe left to close</div>
            </div>
          </div>
        </div>
      </>
    )
  }

  // Desktop Sidebar
  return (
    <div
      className={cn(
        "border-r border-enterprise-border bg-white transition-all duration-300 ease-in-out h-screen fixed z-50 hidden md:block",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      <div className="py-4 h-full w-full overflow-hidden">
        {/* Toggle Button */}
        <div className="px-3 mb-4">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center p-2 rounded-md hover:bg-enterprise-light transition-colors"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Menu className="h-4 w-4 text-enterprise-text-light" />
          </button>
        </div>

        {/* Navigation Header */}
        {!isCollapsed && (
          <div className="px-3 py-2">
            <span className="font-display font-semibold text-lg text-deep-navy">Central OMS</span>
            <h2 className="text-xs uppercase text-enterprise-text-light font-semibold tracking-wider">Navigation</h2>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="space-y-1 px-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center rounded-md text-sm font-medium transition-colors relative",
                isCollapsed ? "justify-center p-2" : "gap-3 px-3 py-2",
                pathname === item.href
                  ? "bg-enterprise-light text-enterprise-dark"
                  : "text-enterprise-text-light hover:bg-enterprise-light hover:text-enterprise-dark",
              )}
              title={isCollapsed ? `Go to ${item.title}` : undefined}
            >
              <item.icon className={cn("flex-shrink-0", isCollapsed ? "h-5 w-5" : "h-4 w-4")} />
              {!isCollapsed && <span className="text-sm font-medium truncate">{item.title}</span>}
              {isCollapsed && pathname === item.href && (
                <div className="absolute right-0 w-1 h-8 bg-enterprise-dark rounded-l-md"></div>
              )}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}
