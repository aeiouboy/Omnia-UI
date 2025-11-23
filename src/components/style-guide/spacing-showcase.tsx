"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function SpacingShowcase() {
  const spacingValues = [
    { name: "0", value: "0px", rem: "0rem" },
    { name: "0.5", value: "2px", rem: "0.125rem" },
    { name: "1", value: "4px", rem: "0.25rem" },
    { name: "2", value: "8px", rem: "0.5rem" },
    { name: "3", value: "12px", rem: "0.75rem" },
    { name: "4", value: "16px", rem: "1rem" },
    { name: "5", value: "20px", rem: "1.25rem" },
    { name: "6", value: "24px", rem: "1.5rem" },
    { name: "8", value: "32px", rem: "2rem" },
    { name: "10", value: "40px", rem: "2.5rem" },
    { name: "12", value: "48px", rem: "3rem" },
    { name: "16", value: "64px", rem: "4rem" },
    { name: "20", value: "80px", rem: "5rem" },
    { name: "24", value: "96px", rem: "6rem" },
  ]

  return (
    <div className="space-y-6">
      {/* Spacing Scale */}
      <Card>
        <CardHeader>
          <CardTitle>Spacing Scale</CardTitle>
          <CardDescription>Tailwind spacing values with rem/px equivalents</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {spacingValues.map((spacing) => (
            <div key={spacing.name} className="flex items-center gap-4 border-b border-enterprise-border last:border-0 pb-4 last:pb-0">
              <div className="flex-shrink-0 w-20">
                <code className="text-sm font-mono text-enterprise-text-light bg-enterprise-light px-2 py-1 rounded">
                  {spacing.name}
                </code>
              </div>
              <div className="flex items-center gap-2 flex-1">
                <div
                  className="bg-status-info"
                  style={{ width: spacing.value, height: "24px" }}
                />
                <span className="text-sm text-enterprise-text">{spacing.value}</span>
                <span className="text-sm text-enterprise-text-light">({spacing.rem})</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Margin Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Margin (m-*)</CardTitle>
          <CardDescription>Margin utilities for spacing around elements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="border border-enterprise-border rounded p-2">
              <code className="text-xs font-mono text-enterprise-text-light">m-4</code>
              <div className="m-4 bg-status-info/20 p-4 border-2 border-status-info rounded">
                Margin on all sides: 16px
              </div>
            </div>
            <div className="border border-enterprise-border rounded p-2">
              <code className="text-xs font-mono text-enterprise-text-light">mx-6 my-3</code>
              <div className="mx-6 my-3 bg-status-success/20 p-4 border-2 border-status-success rounded">
                Horizontal margin: 24px, Vertical margin: 12px
              </div>
            </div>
            <div className="border border-enterprise-border rounded p-2">
              <code className="text-xs font-mono text-enterprise-text-light">mt-8 mb-4</code>
              <div className="mt-8 mb-4 bg-status-warning/20 p-4 border-2 border-status-warning rounded">
                Top margin: 32px, Bottom margin: 16px
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Padding Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Padding (p-*)</CardTitle>
          <CardDescription>Padding utilities for spacing inside elements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <code className="text-xs font-mono text-enterprise-text-light">p-4</code>
              <div className="p-4 bg-status-info/20 border-2 border-status-info rounded mt-2">
                Padding on all sides: 16px
              </div>
            </div>
            <div>
              <code className="text-xs font-mono text-enterprise-text-light">px-8 py-2</code>
              <div className="px-8 py-2 bg-status-success/20 border-2 border-status-success rounded mt-2">
                Horizontal padding: 32px, Vertical padding: 8px
              </div>
            </div>
            <div>
              <code className="text-xs font-mono text-enterprise-text-light">pt-6 pb-3</code>
              <div className="pt-6 pb-3 bg-status-warning/20 border-2 border-status-warning rounded mt-2">
                Top padding: 24px, Bottom padding: 12px
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gap Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Gap (gap-*)</CardTitle>
          <CardDescription>Gap utilities for flex and grid layouts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <code className="text-xs font-mono text-enterprise-text-light mb-2 block">gap-2</code>
              <div className="flex gap-2">
                <div className="bg-status-info p-4 rounded text-white text-sm">Item 1</div>
                <div className="bg-status-info p-4 rounded text-white text-sm">Item 2</div>
                <div className="bg-status-info p-4 rounded text-white text-sm">Item 3</div>
              </div>
              <p className="text-xs text-enterprise-text-light mt-1">Gap: 8px</p>
            </div>
            <div>
              <code className="text-xs font-mono text-enterprise-text-light mb-2 block">gap-4</code>
              <div className="flex gap-4">
                <div className="bg-status-success p-4 rounded text-white text-sm">Item 1</div>
                <div className="bg-status-success p-4 rounded text-white text-sm">Item 2</div>
                <div className="bg-status-success p-4 rounded text-white text-sm">Item 3</div>
              </div>
              <p className="text-xs text-enterprise-text-light mt-1">Gap: 16px</p>
            </div>
            <div>
              <code className="text-xs font-mono text-enterprise-text-light mb-2 block">gap-6</code>
              <div className="flex gap-6">
                <div className="bg-status-warning p-4 rounded text-white text-sm">Item 1</div>
                <div className="bg-status-warning p-4 rounded text-white text-sm">Item 2</div>
                <div className="bg-status-warning p-4 rounded text-white text-sm">Item 3</div>
              </div>
              <p className="text-xs text-enterprise-text-light mt-1">Gap: 24px</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
