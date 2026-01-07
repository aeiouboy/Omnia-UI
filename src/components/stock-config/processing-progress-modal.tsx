"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Loader2, CheckCircle, AlertCircle, XCircle } from "lucide-react"

interface ProcessingProgressModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filename: string
  totalRows: number
  onCancel: () => void
  progress: number
  currentRow: number
  successCount: number
  errorCount: number
  isComplete: boolean
  onViewReport: () => void
}

export function ProcessingProgressModal({
  open,
  onOpenChange,
  filename,
  totalRows,
  onCancel,
  progress,
  currentRow,
  successCount,
  errorCount,
  isComplete,
  onViewReport,
}: ProcessingProgressModalProps) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [estimatedTime, setEstimatedTime] = useState<string | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const lastProgressRef = useRef<number>(0)

  // Calculate estimated time remaining
  useEffect(() => {
    if (progress === 0 || isComplete) {
      setEstimatedTime(null)
      return
    }

    if (startTimeRef.current === null && progress > 0) {
      startTimeRef.current = Date.now()
    }

    if (startTimeRef.current && progress > lastProgressRef.current) {
      const elapsedMs = Date.now() - startTimeRef.current
      const progressRate = progress / elapsedMs // progress per ms
      const remainingProgress = 100 - progress
      const remainingMs = remainingProgress / progressRate

      if (remainingMs > 0 && remainingMs < 3600000) {
        // Less than 1 hour
        const remainingSec = Math.ceil(remainingMs / 1000)
        if (remainingSec > 60) {
          const mins = Math.ceil(remainingSec / 60)
          setEstimatedTime(`~${mins} min remaining`)
        } else {
          setEstimatedTime(`~${remainingSec}s remaining`)
        }
      }
    }

    lastProgressRef.current = progress
  }, [progress, isComplete])

  // Reset refs when modal opens
  useEffect(() => {
    if (open) {
      startTimeRef.current = null
      lastProgressRef.current = 0
    }
  }, [open])

  const handleCancelClick = useCallback(() => {
    setShowCancelConfirm(true)
  }, [])

  const handleConfirmCancel = useCallback(() => {
    setShowCancelConfirm(false)
    onCancel()
  }, [onCancel])

  const handleCancelAbort = useCallback(() => {
    setShowCancelConfirm(false)
  }, [])

  const getStatusMessage = () => {
    if (isComplete) {
      if (errorCount === 0) {
        return "Processing completed successfully!"
      } else if (successCount === 0) {
        return "Processing completed with all errors"
      } else {
        return "Processing completed with some errors"
      }
    }
    return `Processing row ${currentRow} of ${totalRows}...`
  }

  const getStatusIcon = () => {
    if (isComplete) {
      if (errorCount === 0) {
        return <CheckCircle className="h-12 w-12 text-green-500" />
      } else if (successCount === 0) {
        return <XCircle className="h-12 w-12 text-red-500" />
      } else {
        return <AlertCircle className="h-12 w-12 text-yellow-500" />
      }
    }
    return <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-w-[95vw] max-h-[90vh] flex flex-col overflow-hidden" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Processing File</DialogTitle>
            <DialogDescription className="truncate pr-8" title={filename}>{filename}</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4 flex-1 overflow-y-auto min-h-0">
            {/* Status Icon */}
            <div className="flex justify-center">{getStatusIcon()}</div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <Progress value={progress} className="h-3" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{getStatusMessage()}</span>
                <span className="font-medium">{progress}%</span>
              </div>
              {estimatedTime && !isComplete && (
                <p className="text-xs text-muted-foreground text-center">{estimatedTime}</p>
              )}
            </div>

            {/* Running Counts */}
            <div className="flex items-center justify-center gap-4">
              <Badge className="bg-green-100 text-green-800 px-3 py-1.5">
                <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                {successCount} succeeded
              </Badge>
              <Badge
                className={`px-3 py-1.5 ${
                  errorCount > 0 ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-600"
                }`}
              >
                <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
                {errorCount} failed
              </Badge>
            </div>

            {/* Totals Summary */}
            <div className="text-center text-sm text-muted-foreground">
              {currentRow} of {totalRows} rows processed
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-wrap justify-end gap-2 pt-2 border-t flex-shrink-0">
            {!isComplete ? (
              <Button variant="outline" onClick={handleCancelClick} size="sm">
                Cancel Processing
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => onOpenChange(false)} size="sm">
                  Close
                </Button>
                <Button onClick={onViewReport} size="sm">View Report</Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Processing?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel the processing? {currentRow} of {totalRows} rows have been
              processed. Rows that have already been processed will be kept.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelAbort}>Continue Processing</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCancel} className="bg-red-600 hover:bg-red-700">
              Cancel Processing
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
