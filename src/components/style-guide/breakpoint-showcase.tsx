"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function BreakpointShowcase() {
  const [viewport, setViewport] = useState({ width: 0, height: 0 })
  const [currentBreakpoint, setCurrentBreakpoint] = useState("")

  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      setViewport({ width, height })

      // Determine current breakpoint
      if (width < 640) {
        setCurrentBreakpoint("Mobile (< 640px)")
      } else if (width >= 640 && width < 768) {
        setCurrentBreakpoint("sm (640px - 767px)")
      } else if (width >= 768 && width < 1024) {
        setCurrentBreakpoint("md (768px - 1023px)")
      } else if (width >= 1024 && width < 1280) {
        setCurrentBreakpoint("lg (1024px - 1279px)")
      } else if (width >= 1280 && width < 1536) {
        setCurrentBreakpoint("xl (1280px - 1535px)")
      } else {
        setCurrentBreakpoint("2xl (≥ 1536px)")
      }
    }

    updateViewport()
    window.addEventListener("resize", updateViewport)
    return () => window.removeEventListener("resize", updateViewport)
  }, [])

  const breakpoints = [
    {
      name: "Mobile",
      prefix: "default",
      minWidth: "0px",
      description: "Mobile-first default styles",
      color: "bg-status-critical",
    },
    {
      name: "Small",
      prefix: "sm:",
      minWidth: "640px",
      description: "Small devices (landscape phones)",
      color: "bg-status-warning",
    },
    {
      name: "Medium",
      prefix: "md:",
      minWidth: "768px",
      description: "Medium devices (tablets)",
      color: "bg-status-info",
    },
    {
      name: "Large",
      prefix: "lg:",
      minWidth: "1024px",
      description: "Large devices (desktops)",
      color: "bg-status-success",
    },
    {
      name: "Extra Large",
      prefix: "xl:",
      minWidth: "1280px",
      description: "Extra large devices (large desktops)",
      color: "bg-tops-green",
    },
    {
      name: "2X Large",
      prefix: "2xl:",
      minWidth: "1536px",
      description: "2X large devices (larger desktops)",
      color: "bg-supersports-blue",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Current Viewport */}
      <Card className="border-2 border-status-info">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Current Viewport</span>
            <Badge variant="outline" className="text-sm">
              {currentBreakpoint}
            </Badge>
          </CardTitle>
          <CardDescription>Live viewport size indicator</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-enterprise-light p-6 rounded-lg text-center">
            <div className="text-4xl font-bold text-enterprise-dark mb-2">
              {viewport.width} × {viewport.height}
            </div>
            <p className="text-sm text-enterprise-text-light">Width × Height (pixels)</p>
          </div>
        </CardContent>
      </Card>

      {/* Breakpoints Table */}
      <Card>
        <CardHeader>
          <CardTitle>Responsive Breakpoints</CardTitle>
          <CardDescription>Tailwind CSS breakpoint system (mobile-first)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {breakpoints.map((breakpoint) => (
              <div
                key={breakpoint.name}
                className="flex items-center gap-4 p-4 border border-enterprise-border rounded-lg hover:bg-enterprise-light transition-colors"
              >
                <div className={`w-3 h-3 rounded-full ${breakpoint.color}`} />
                <div className="flex-1">
                  <div className="flex items-baseline gap-2 mb-1">
                    <h3 className="font-semibold text-enterprise-text">{breakpoint.name}</h3>
                    <code className="text-xs font-mono text-enterprise-text-light bg-enterprise-light px-2 py-1 rounded">
                      {breakpoint.prefix}
                    </code>
                  </div>
                  <p className="text-sm text-enterprise-text-light">{breakpoint.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-enterprise-text">{breakpoint.minWidth}</p>
                  <p className="text-xs text-enterprise-text-light">min-width</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Responsive Grid Example */}
      <Card>
        <CardHeader>
          <CardTitle>Responsive Grid Example</CardTitle>
          <CardDescription>Mobile-first grid pattern: grid-cols-1 sm:grid-cols-2 lg:grid-cols-3</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="bg-status-info/20 border-2 border-status-info rounded-lg p-6 text-center"
              >
                <div className="text-2xl font-bold text-status-info">Item {item}</div>
                <p className="text-xs text-enterprise-text-light mt-2">
                  <span className="sm:hidden">1 column (mobile)</span>
                  <span className="hidden sm:inline lg:hidden">2 columns (sm)</span>
                  <span className="hidden lg:inline">3 columns (lg)</span>
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Responsive Text Example */}
      <Card>
        <CardHeader>
          <CardTitle>Responsive Text Sizes</CardTitle>
          <CardDescription>Text scales based on viewport: text-sm md:text-base lg:text-lg</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-enterprise-light rounded-lg">
              <p className="text-sm md:text-base lg:text-lg text-enterprise-text font-medium">
                This text changes size based on your viewport width. Try resizing your browser to see it in action.
              </p>
              <p className="text-xs text-enterprise-text-light mt-2">
                <span className="md:hidden">Currently: text-sm (mobile)</span>
                <span className="hidden md:inline lg:hidden">Currently: text-base (md)</span>
                <span className="hidden lg:inline">Currently: text-lg (lg)</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile-First Approach */}
      <Card>
        <CardHeader>
          <CardTitle>Mobile-First Design Approach</CardTitle>
          <CardDescription>Best practices for responsive design</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-enterprise-text">
            <div className="flex items-start gap-3">
              <div className="bg-status-success text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                ✓
              </div>
              <div>
                <p className="font-semibold">Start with mobile styles first</p>
                <p className="text-enterprise-text-light">Base styles apply to all screen sizes, then add complexity for larger screens</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-status-success text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                ✓
              </div>
              <div>
                <p className="font-semibold">Use min-width breakpoints</p>
                <p className="text-enterprise-text-light">All Tailwind breakpoints use min-width media queries</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-status-success text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                ✓
              </div>
              <div>
                <p className="font-semibold">Minimum 44px touch targets</p>
                <p className="text-enterprise-text-light">Ensure interactive elements are large enough for touch on mobile devices</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-status-success text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                ✓
              </div>
              <div>
                <p className="font-semibold">Test across all breakpoints</p>
                <p className="text-enterprise-text-light">Always verify layout and functionality at mobile, tablet, and desktop sizes</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
