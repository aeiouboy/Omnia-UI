"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Search, Package, Menu, X, AlertTriangle, Palette, Scale, BarChart3, ChevronDown, ChevronRight, Dot } from "lucide-react"
import { useSidebar } from "@/contexts/sidebar-context"
import { useSwipe } from "@/hooks/use-swipe"
import { useEdgeSwipe } from "@/hooks/use-edge-swipe"
import { useState, useEffect } from "react"

export function SideNav() {
  const pathname = usePathname()
  const { isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen, isMobile } = useSidebar()
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({})

  const navItems = [
    {
      title: "Order Analysis",
      href: "/orders/analysis",
      icon: BarChart3,
    },
    {
      title: "Order Management",
      href: "/orders",
      icon: Search,
    },
    {
      title: "Inventory Management",
      href: "/inventory-new",
      icon: Package,
      submenu: [
        {
          title: "Inventory",
          href: "/inventory-new/supply",
        },
        {
          title: "Stock Card",
          href: "/inventory-new/stores",
        },
        {
          title: "Stock Config",
          href: "/stock-config",
        }
      ]
    },
    {
      title: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      disabled: true,
    },
    {
      title: "Inventory",
      href: "/inventory",
      icon: Package,
      disabled: true,
    },
    {
      title: "ATC Config",
      href: "/atc-config",
      icon: Scale,
      disabled: true,
    },
    {
      title: "Escalations",
      href: "/escalations",
      icon: AlertTriangle,
      disabled: true,
    },
    {
      title: "Style Guide",
      href: "/style-guide",
      icon: Palette,
      disabled: true,
    },
  ]

  // Automatically open menus if a child is active
  useEffect(() => {
    const newOpenMenus = { ...openMenus }

    const checkAndOpenMenus = (items: any[]) => {
      items.forEach(item => {
        if (item.submenu) {
          // Check if any child or grandchild matches current path
          const isChildActive = item.submenu.some((sub: any) => {
            if (pathname === sub.href) return true
            if (sub.submenu) {
              return sub.submenu.some((nested: any) => pathname === nested.href)
            }
            return false
          })
          const isParentActive = pathname === item.href

          if (isChildActive || isParentActive) {
            newOpenMenus[item.title] = true
          }

          // Recursively check nested submenus
          checkAndOpenMenus(item.submenu)
        }
      })
    }

    checkAndOpenMenus(navItems)
    setOpenMenus(newOpenMenus)
  }, [pathname])

  const toggleMenu = (title: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [title]: !prev[title]
    }))
  }

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

  const renderNavItem = (item: any, level: number = 0) => {
    const isActive = pathname === item.href
    const hasSubmenu = item.submenu && item.submenu.length > 0
    const isOpen = openMenus[item.title]

    // Check if any child or grandchild is active
    const isChildActive = hasSubmenu && item.submenu.some((sub: any) => {
      if (pathname === sub.href) return true
      if (sub.submenu) {
        return sub.submenu.some((nested: any) => pathname === nested.href)
      }
      return false
    })

    if (hasSubmenu) {
      return (
        <div key={item.title} className="space-y-1">
          <button
            onClick={() => {
              if (isCollapsed && level === 0) setIsCollapsed(false)
              toggleMenu(item.title)
            }}
            className={cn(
              "w-full flex items-center justify-between rounded-md text-sm font-medium transition-colors relative",
              level === 0 && isCollapsed ? "justify-center p-2" : level === 0 ? "px-3 py-2" : "px-2 py-1.5",
              (isActive || isChildActive)
                ? "bg-enterprise-light text-enterprise-dark"
                : "text-enterprise-text-light hover:bg-enterprise-light hover:text-enterprise-dark",
            )}
            title={isCollapsed && level === 0 ? item.title : undefined}
            style={level > 0 ? { marginLeft: `${level * 12}px` } : undefined}
          >
            <div className="flex items-center gap-2">
              {level === 0 && <item.icon className={cn("flex-shrink-0", isCollapsed ? "h-5 w-5" : "h-4 w-4")} />}
              {!(isCollapsed && level === 0) && <span>{item.title}</span>}
            </div>
            {!isCollapsed && !(isCollapsed && level === 0) && (
              <div className="text-gray-400">
                {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              </div>
            )}
          </button>

          {/* Submenu items */}
          {isOpen && !isCollapsed && (
            <div className={cn("space-y-1", level === 0 ? "ml-4 pl-3 border-l text-sm" : "ml-2 pl-2 border-l")}>
              {item.submenu.map((sub: any) => renderNavItem(sub, level + 1))}
            </div>
          )}
        </div>
      )
    }

    // Regular Item (leaf node)
    // Handle disabled items
    if (item.disabled) {
      return (
        <div
          key={item.href}
          className={cn(
            "flex items-center rounded-md text-sm font-medium transition-colors relative cursor-not-allowed opacity-50",
            level === 0 && isCollapsed ? "justify-center p-2" : level === 0 ? "gap-3 px-3 py-2" : "gap-2 px-2 py-1.5",
            "text-gray-400",
          )}
          title={isCollapsed && level === 0 ? `${item.title} (disabled)` : `${item.title} (disabled)`}
          style={level > 0 ? { marginLeft: `${level * 12}px` } : undefined}
        >
          {level === 0 && <item.icon className={cn("flex-shrink-0", isCollapsed ? "h-5 w-5" : "h-4 w-4")} />}
          {!(isCollapsed && level === 0) && (
            <>
              {level > 0 && <Dot className="h-3 w-3 flex-shrink-0" />}
              <span className="text-sm font-medium truncate">{item.title}</span>
            </>
          )}
        </div>
      )
    }

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={handleLinkClick}
        className={cn(
          "flex items-center rounded-md text-sm font-medium transition-colors relative",
          level === 0 && isCollapsed ? "justify-center p-2" : level === 0 ? "gap-3 px-3 py-2" : "gap-2 px-2 py-1.5",
          isActive
            ? "bg-blue-50 text-blue-700 font-medium"
            : "text-gray-500 hover:text-gray-900 hover:bg-gray-100",
        )}
        title={isCollapsed && level === 0 ? item.title : undefined}
        style={level > 0 ? { marginLeft: `${level * 12}px` } : undefined}
      >
        {level === 0 && <item.icon className={cn("flex-shrink-0", isCollapsed ? "h-5 w-5" : "h-4 w-4")} />}
        {!(isCollapsed && level === 0) && (
          <>
            {level > 0 && <Dot className="h-3 w-3 flex-shrink-0" />}
            <span className="text-sm font-medium truncate">{item.title}</span>
          </>
        )}
        {isCollapsed && level === 0 && isActive && (
          <div className="absolute right-0 w-1 h-8 bg-enterprise-dark rounded-l-md"></div>
        )}
      </Link>
    )
  }

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
          <div className="py-4 h-full w-full overflow-hidden flex flex-col">
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
            <nav className="space-y-1 px-3 flex-1 overflow-y-auto">
              {navItems.map((item) => renderNavItem(item))}
            </nav>

            {/* Swipe Hint */}
            <div className="p-4 border-t">
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
      <div className="py-4 h-full w-full overflow-hidden flex flex-col">
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
        <nav className="space-y-1 px-3 flex-1 overflow-y-auto">
          {navItems.map((item) => renderNavItem(item))}
        </nav>
      </div>
    </div>
  )
}
