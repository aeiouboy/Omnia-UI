"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"

interface ColorSwatchProps {
  name: string
  value: string
  usage?: string
  className?: string
}

export function ColorSwatch({ name, value, usage, className }: ColorSwatchProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <div
      className="group cursor-pointer border border-enterprise-border rounded-md overflow-hidden hover:shadow-lg transition-shadow"
      onClick={copyToClipboard}
    >
      <div
        className={`h-24 relative ${className}`}
        style={!className ? { backgroundColor: value } : undefined}
      >
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
          {copied ? (
            <div className="bg-white rounded-full p-2">
              <Check className="h-5 w-5 text-status-success" />
            </div>
          ) : (
            <div className="bg-white rounded-full p-2">
              <Copy className="h-5 w-5 text-enterprise-text" />
            </div>
          )}
        </div>
      </div>
      <div className="p-3 bg-white">
        <p className="font-semibold text-sm text-enterprise-text">{name}</p>
        <p className="text-xs text-enterprise-text-light font-mono">{value}</p>
        {usage && <p className="text-xs text-enterprise-text-light mt-1">{usage}</p>}
      </div>
    </div>
  )
}
