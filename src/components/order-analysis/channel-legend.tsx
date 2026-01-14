"use client"

import { CHANNEL_COLORS, CHANNEL_NAMES, type ChannelName } from "@/types/order-analysis"

interface ChannelLegendProps {
  className?: string
}

/**
 * Shared legend component for order analysis charts
 * Displays channel colors and names in a horizontal layout
 */
export function ChannelLegend({ className = "" }: ChannelLegendProps) {
  return (
    <div className={`flex flex-wrap items-center justify-center gap-4 ${className}`}>
      {CHANNEL_NAMES.map((channel) => (
        <div key={channel} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-sm shrink-0"
            style={{ backgroundColor: CHANNEL_COLORS[channel] }}
          />
          <span className="text-sm text-muted-foreground">{channel}</span>
        </div>
      ))}
    </div>
  )
}

export default ChannelLegend
