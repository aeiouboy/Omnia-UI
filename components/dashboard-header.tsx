import type React from "react"
interface DashboardHeaderProps {
  heading: string
  text?: string
  children?: React.ReactNode
}

export function DashboardHeader({ heading, text, children }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between px-2">
      <div className="grid gap-1">
        <h1 className="text-2xl font-semibold tracking-tight leading-tight font-heading">{heading}</h1>
        {text && <p className="text-muted-foreground text-base leading-relaxed">{text}</p>}
      </div>
      {children}
    </div>
  )
}
