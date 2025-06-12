"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface ChartCardProps {
  title: string
  children: React.ReactNode
  isLoading: boolean
  height?: string
  priority?: 'hero' | 'important' | 'supporting'
  status?: 'excellent' | 'good' | 'warning' | 'critical'
}

export function ChartCard({ 
  title, 
  children, 
  isLoading,
  height = "h-[400px]",
  priority = 'supporting',
  status = 'good'
}: ChartCardProps) {
  // Priority-based styling
  const getPriorityStyles = () => {
    switch (priority) {
      case 'hero':
        return 'shadow-lg border-l-4'
      case 'important':
        return 'shadow-md border-l-2'
      default:
        return 'shadow-sm'
    }
  }

  // Status-based colors - Clean white backgrounds
  const getStatusStyles = () => {
    switch (status) {
      case 'excellent':
        return {
          border: 'border-l-emerald-500',
          bg: 'bg-white'
        }
      case 'good':
        return {
          border: 'border-l-green-500',
          bg: 'bg-white'
        }
      case 'warning':
        return {
          border: 'border-l-amber-500',
          bg: 'bg-white'
        }
      case 'critical':
        return {
          border: 'border-l-red-500',
          bg: 'bg-white'
        }
      default:
        return {
          border: '',
          bg: 'bg-white'
        }
    }
  }

  const priorityStyles = getPriorityStyles()
  const statusStyles = getStatusStyles()

  const cardClasses = [
    priorityStyles,
    statusStyles.border,
    statusStyles.bg,
    'min-h-[120px] touch-manipulation border border-gray-200 rounded-xl'
  ].join(' ')

  return (
    <Card className={cardClasses}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          {isLoading ? <Skeleton className="h-6 w-40" /> : title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className={`${height} flex items-center justify-center`}>
            <div className="space-y-6 w-full animate-pulse">
              {/* Enhanced content-aware skeleton based on priority */}
              {priority === 'hero' && (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <Skeleton className="h-7 w-3/4 rounded-lg" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                  <div className="relative">
                    <Skeleton className="h-80 w-full rounded-xl" />
                    {/* Simulated chart bars */}
                    <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                      <Skeleton className="h-12 w-8 rounded-t" />
                      <Skeleton className="h-20 w-8 rounded-t" />
                      <Skeleton className="h-16 w-8 rounded-t" />
                      <Skeleton className="h-24 w-8 rounded-t" />
                    </div>
                  </div>
                  <div className="flex justify-between pt-2">
                    <Skeleton className="h-4 w-24 rounded" />
                    <Skeleton className="h-4 w-24 rounded" />
                    <Skeleton className="h-4 w-24 rounded" />
                  </div>
                </>
              )}
              {priority === 'important' && (
                <>
                  <Skeleton className="h-6 w-2/3 rounded-lg mb-3" />
                  <div className="relative">
                    <Skeleton className="h-64 w-full rounded-xl" />
                    {/* Simulated dual-axis chart */}
                    <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                      <div className="flex space-x-1">
                        <Skeleton className="h-8 w-4 rounded-t bg-blue-200" />
                        <Skeleton className="h-6 w-4 rounded-t bg-green-200" />
                      </div>
                      <div className="flex space-x-1">
                        <Skeleton className="h-12 w-4 rounded-t bg-blue-200" />
                        <Skeleton className="h-10 w-4 rounded-t bg-green-200" />
                      </div>
                      <div className="flex space-x-1">
                        <Skeleton className="h-6 w-4 rounded-t bg-blue-200" />
                        <Skeleton className="h-8 w-4 rounded-t bg-green-200" />
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-4 pt-2">
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-3 w-3 rounded-full bg-blue-200" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-3 w-3 rounded-full bg-green-200" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                </>
              )}
              {priority === 'supporting' && (
                <>
                  <Skeleton className="h-5 w-1/2 rounded-lg mb-3" />
                  <div className="relative">
                    <Skeleton className="h-48 w-full rounded-lg" />
                    {/* Simulated simple chart */}
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                      <Skeleton className="h-6 w-6 rounded" />
                      <Skeleton className="h-10 w-6 rounded" />
                      <Skeleton className="h-8 w-6 rounded" />
                      <Skeleton className="h-12 w-6 rounded" />
                    </div>
                  </div>
                  <Skeleton className="h-3 w-32 rounded mt-3" />
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="min-h-[44px]">
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  )
}