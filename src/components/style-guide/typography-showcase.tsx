"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function TypographyShowcase() {
  const fontFamilies = [
    {
      name: "Inter",
      variable: "var(--font-inter)",
      usage: "Body text and UI elements",
      className: "font-sans",
    },
    {
      name: "Poppins",
      variable: "var(--font-poppins)",
      usage: "Headings and display text",
      className: "font-heading",
    },
    {
      name: "JetBrains Mono",
      variable: "var(--font-jetbrains-mono)",
      usage: "Code blocks and monospace text",
      className: "font-mono",
    },
  ]

  const textSizes = [
    { name: "text-xs", className: "text-xs", size: "0.75rem / 12px" },
    { name: "text-sm", className: "text-sm", size: "0.875rem / 14px" },
    { name: "text-base", className: "text-base", size: "1rem / 16px" },
    { name: "text-lg", className: "text-lg", size: "1.125rem / 18px" },
    { name: "text-xl", className: "text-xl", size: "1.25rem / 20px" },
    { name: "text-2xl", className: "text-2xl", size: "1.5rem / 24px" },
    { name: "text-3xl", className: "text-3xl", size: "1.875rem / 30px" },
    { name: "text-4xl", className: "text-4xl", size: "2.25rem / 36px" },
  ]

  const fontWeights = [
    { name: "font-normal", className: "font-normal", weight: "400" },
    { name: "font-medium", className: "font-medium", weight: "500" },
    { name: "font-semibold", className: "font-semibold", weight: "600" },
    { name: "font-bold", className: "font-bold", weight: "700" },
  ]

  return (
    <div className="space-y-6">
      {/* Font Families */}
      <Card>
        <CardHeader>
          <CardTitle>Font Families</CardTitle>
          <CardDescription>Typography system with CSS variable support</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {fontFamilies.map((font) => (
            <div key={font.name} className="border-b border-enterprise-border last:border-0 pb-4 last:pb-0">
              <div className="flex items-baseline justify-between mb-2">
                <h3 className="font-semibold text-enterprise-text">{font.name}</h3>
                <code className="text-xs font-mono text-enterprise-text-light bg-enterprise-light px-2 py-1 rounded">
                  {font.className}
                </code>
              </div>
              <p className="text-sm text-enterprise-text-light mb-2">{font.usage}</p>
              <p className={`${font.className} text-2xl text-enterprise-text`}>
                The quick brown fox jumps over the lazy dog
              </p>
              <p className="text-xs text-enterprise-text-light mt-1 font-mono">{font.variable}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Text Sizes */}
      <Card>
        <CardHeader>
          <CardTitle>Text Sizes</CardTitle>
          <CardDescription>Tailwind text size utilities with rem/px values</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {textSizes.map((size) => (
            <div key={size.name} className="flex items-center justify-between border-b border-enterprise-border last:border-0 pb-3 last:pb-0">
              <div className="flex items-baseline gap-4 flex-1">
                <code className="text-xs font-mono text-enterprise-text-light bg-enterprise-light px-2 py-1 rounded min-w-[100px]">
                  {size.name}
                </code>
                <p className={`${size.className} text-enterprise-text`}>
                  The quick brown fox jumps over the lazy dog
                </p>
              </div>
              <span className="text-xs text-enterprise-text-light ml-4">{size.size}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Font Weights */}
      <Card>
        <CardHeader>
          <CardTitle>Font Weights</CardTitle>
          <CardDescription>Available font weight utilities</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {fontWeights.map((weight) => (
            <div key={weight.name} className="flex items-center justify-between border-b border-enterprise-border last:border-0 pb-3 last:pb-0">
              <div className="flex items-baseline gap-4 flex-1">
                <code className="text-xs font-mono text-enterprise-text-light bg-enterprise-light px-2 py-1 rounded min-w-[120px]">
                  {weight.name}
                </code>
                <p className={`${weight.className} text-lg text-enterprise-text`}>
                  The quick brown fox jumps over the lazy dog
                </p>
              </div>
              <span className="text-xs text-enterprise-text-light ml-4">Weight: {weight.weight}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
