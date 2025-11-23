"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Copy } from "lucide-react"

interface ComponentShowcaseProps {
  title: string
  description?: string
  preview: React.ReactNode
  code: string
}

export function ComponentShowcase({ title, description, preview, code }: ComponentShowcaseProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Live Preview */}
        <div className="p-6 border border-enterprise-border rounded-md bg-white">
          {preview}
        </div>

        {/* Code Snippet */}
        <div className="relative">
          <Button
            size="sm"
            variant="ghost"
            className="absolute right-2 top-2 z-10 h-8 w-8 p-0"
            onClick={copyToClipboard}
          >
            {copied ? (
              <Check className="h-4 w-4 text-status-success" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
          <pre className="overflow-x-auto p-4 bg-enterprise-dark text-white rounded-md text-sm font-mono">
            <code>{code}</code>
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}
