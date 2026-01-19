"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Loader2 } from "lucide-react"
import { getCancelReasonsByType, type CancelReason } from "@/lib/cancel-reasons"

export interface CancelOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderNo: string
  onConfirm: (reasonId: string) => Promise<void>
  loading?: boolean
}

export function CancelOrderDialog({
  open,
  onOpenChange,
  orderNo,
  onConfirm,
  loading = false,
}: CancelOrderDialogProps) {
  const [selectedReasonId, setSelectedReasonId] = useState<string>("")
  const reasonsByType = getCancelReasonsByType()

  const handleConfirm = async () => {
    if (selectedReasonId) {
      await onConfirm(selectedReasonId)
      setSelectedReasonId("")
    }
  }

  const canConfirm = selectedReasonId !== "" && !loading

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Cancel Order</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this order? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Order Number Display */}
          <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
            <p className="text-sm text-gray-600">Order Number</p>
            <p className="font-mono font-semibold text-lg">{orderNo}</p>
          </div>

          {/* Warning Alert */}
          <Alert variant="destructive" className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertTitle className="text-orange-800">Warning</AlertTitle>
            <AlertDescription className="text-orange-700">
              Cancelling this order will process a refund and stop all fulfillment activities.
            </AlertDescription>
          </Alert>

          {/* Cancel Reason Selection */}
          <div className="space-y-2">
            <Label htmlFor="cancel-reason" className="text-sm font-medium">
              Cancel Reason <span className="text-red-500">*</span>
            </Label>
            <Select
              value={selectedReasonId}
              onValueChange={setSelectedReasonId}
              disabled={loading}
            >
              <SelectTrigger id="cancel-reason">
                <SelectValue placeholder="Select a reason for cancellation" />
              </SelectTrigger>
              <SelectContent>
                {/* Return Reasons Section */}
                {reasonsByType.RETURN.length > 0 && (
                  <>
                    <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50 sticky top-0">
                      Customer Initiated
                    </div>
                    {reasonsByType.RETURN.map((reason: CancelReason) => (
                      <SelectItem key={reason.id} value={reason.id} className="pl-8">
                        <div className="flex flex-col">
                          <span className="font-medium">{reason.shortDescription}</span>
                          <span className="text-xs text-gray-500">{reason.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </>
                )}

                {/* Short Reasons Section */}
                {reasonsByType.SHORT.length > 0 && (
                  <>
                    <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50 sticky top-0 mt-1">
                      System/Store Initiated
                    </div>
                    {reasonsByType.SHORT.map((reason: CancelReason) => (
                      <SelectItem key={reason.id} value={reason.id} className="pl-8">
                        <div className="flex flex-col">
                          <span className="font-medium">{reason.shortDescription}</span>
                          <span className="text-xs text-gray-500">{reason.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Select the most appropriate reason for this order cancellation
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onOpenChange(false)
              setSelectedReasonId("")
            }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="min-w-[120px]"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cancelling...
              </>
            ) : (
              "Confirm Cancel"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
