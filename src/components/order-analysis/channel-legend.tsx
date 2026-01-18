"use client"

import { CHANNEL_COLORS, CHANNEL_COLORS_REVENUE, CHANNEL_NAMES, type ChannelName } from "@/types/order-analysis"

interface ChannelLegendProps {
  className?: string
  /** Select color scheme variant (both use same colors for visual consistency) */
  variant?: 'orders' | 'revenue'
}

/**
 * Shared legend component for order analysis charts
 * Displays channel colors and names in a horizontal layout
 * Only shows TOL and MKP channels
 */
export function ChannelLegend({ className = "", variant = 'orders' }: ChannelLegendProps) {
  const colors = variant === 'revenue' ? CHANNEL_COLORS_REVENUE : CHANNEL_COLORS

  return (
    <div className={`flex flex-wrap items-center justify-start gap-3 ${className}`}>
      {CHANNEL_NAMES.map((channel) => (
        <div key={channel} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-sm shrink-0"
            style={{ backgroundColor: colors[channel] }}
          />
          <span className="text-sm text-muted-foreground">{channel}</span>
        </div>
      ))}
    </div>
  )
}

export default ChannelLegend
