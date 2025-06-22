import { Skeleton } from "@/components/ui/skeleton"

export function OverviewTabSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Channel Performance Chart Skeleton */}
      <div className="bg-card rounded-lg border p-6">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-[400px] w-full" />
      </div>
      
      {/* Alerts Section Skeleton */}
      <div className="bg-card rounded-lg border p-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}

export function OrdersTabSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Hourly Order Summary Skeleton */}
      <div className="bg-card rounded-lg border p-6">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-[300px] w-full" />
      </div>
      
      {/* Daily Orders Chart Skeleton */}
      <div className="bg-card rounded-lg border p-6">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-[300px] w-full" />
      </div>
      
      {/* Recent Orders Table Skeleton */}
      <div className="bg-card rounded-lg border p-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}

export function FulfillmentTabSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Store Fulfillment Performance Skeleton */}
      <div className="bg-card rounded-lg border p-6">
        <Skeleton className="h-6 w-64 mb-4" />
        <Skeleton className="h-[400px] w-full" />
      </div>
      
      {/* Channel Performance Skeleton */}
      <div className="bg-card rounded-lg border p-6">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    </div>
  )
}

export function AnalyticsTabSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Top Products Chart Skeleton */}
      <div className="bg-card rounded-lg border p-6">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-[400px] w-full" />
      </div>
      
      {/* Revenue by Category Skeleton */}
      <div className="bg-card rounded-lg border p-6">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    </div>
  )
}