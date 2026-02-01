"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package } from "lucide-react"
import { generateTimelineStages } from "@/lib/item-fulfillment-utils"
import { FulfillmentTimelineStage } from "@/types/item-fulfillment"

interface FulfillmentProgressTimelineProps {
  orderData?: any
}

/**
 * Order Fulfillment Progress Timeline
 * Displays horizontal timeline with:
 * - Date/Time row ABOVE the progress dots
 * - Progress dots in the middle (filled for completed, empty for pending)
 * - Stage names BELOW the dots
 */
export function FulfillmentProgressTimeline({ orderData }: FulfillmentProgressTimelineProps) {
  // Generate timeline stages from order data
  const stages = useMemo<FulfillmentTimelineStage[]>(() => {
    return generateTimelineStages(orderData)
  }, [orderData])

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Package className="h-4 w-4 sm:h-5 sm:w-5" />
          Fulfillment Status
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        {/* Timeline Container */}
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[400px] px-2">
            {/* Dates Row - ABOVE the dots */}
            <div className="flex justify-between mb-2">
              {stages.map((stage) => (
                <div
                  key={`date-${stage.id}`}
                  className="flex-1 text-center"
                >
                  <span className={`text-xs ${
                    stage.isCompleted
                      ? 'text-gray-700 dark:text-gray-300 font-medium'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}>
                    {stage.dateTime || 'Pending'}
                  </span>
                </div>
              ))}
            </div>

            {/* Progress Dots and Lines Row */}
            <div className="relative flex items-center justify-between py-2">
              {/* Connecting Line (background) */}
              <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-200 dark:bg-gray-700 -translate-y-1/2" />

              {/* Completed portion of line */}
              {stages.findIndex((s) => !s.isCompleted) !== -1 && (
                <div
                  className="absolute left-0 top-1/2 h-0.5 bg-green-500 -translate-y-1/2"
                  style={{
                    width: `${(stages.findIndex((s) => !s.isCompleted) / (stages.length - 1)) * 100}%`
                  }}
                />
              )}
              {stages.every((s) => s.isCompleted) && (
                <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-green-500 -translate-y-1/2" />
              )}

              {/* Dots */}
              {stages.map((stage, index) => (
                <div
                  key={`dot-${stage.id}`}
                  className="relative z-10 flex-1 flex justify-center"
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      stage.isCompleted
                        ? 'bg-green-500 border-green-500'
                        : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    {stage.isCompleted && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Stage Names Row - BELOW the dots */}
            <div className="flex justify-between mt-2">
              {stages.map((stage) => (
                <div
                  key={`name-${stage.id}`}
                  className="flex-1 text-center"
                >
                  <span className={`text-xs sm:text-sm ${
                    stage.isCompleted
                      ? 'text-gray-800 dark:text-gray-200 font-medium'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}>
                    {stage.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
