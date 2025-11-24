"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import { AlertTriangle, MessageSquare, Check, Search, Filter, Clock, Bell } from "lucide-react"
import { 
  fetchEscalationHistory, 
  createEscalationRecord, 
  updateEscalationStatus,
  getAlertMessage,
  getSeverityFromAlertType,
  createTeamsMessagePayload,
  withRetry,
  type EscalationFilters,
  type EscalationResponse
} from "@/lib/escalation-service"
import { EscalationRecord } from "@/app/api/escalations/route"

// Define types for escalation history
type EscalationStatus = "PENDING" | "SENT" | "FAILED" | "RESOLVED"

export function EscalationManagement() {
  const { toast } = useToast()
  const [successDialogOpen, setSuccessDialogOpen] = useState(false)
  const [escalationDetails, setEscalationDetails] = useState({
    timestamp: "",
    orderNumber: "",
    branch: "",
    alertType: "",
  })
  const [isEscalating, setIsEscalating] = useState(false)

  // State for escalation history - now from real data
  const [escalationHistory, setEscalationHistory] = useState<EscalationRecord[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [historyError, setHistoryError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 25,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  })

  // Filter state for escalation history
  const [historyFilter, setHistoryFilter] = useState("all")
  const [historySearchTerm, setHistorySearchTerm] = useState("")

  // Add this after other useState declarations
  const [retryCountdowns, setRetryCountdowns] = useState<Record<string, number>>({})

  // Load escalation history
  const loadEscalationHistory = async () => {
    setIsLoadingHistory(true)
    setHistoryError(null)
    
    try {
      const filters: EscalationFilters = {}
      
      if (historyFilter !== "all") {
        filters.status = historyFilter.toUpperCase()
      }
      
      if (historySearchTerm) {
        filters.search = historySearchTerm
      }

      const response = await fetchEscalationHistory(pagination.page, pagination.pageSize, filters)
      setEscalationHistory(response.data)
      setPagination(response.pagination)
    } catch (error) {
      console.error("Error loading escalation history:", error)
      setHistoryError(error instanceof Error ? error.message : "Failed to load escalation history")
      setEscalationHistory([])
    } finally {
      setIsLoadingHistory(false)
    }
  }

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPagination(prev => ({ ...prev, page: 1 })) // Reset to first page when search changes
      loadEscalationHistory()
    }, 300) // 300ms debounce

    return () => clearTimeout(timeoutId)
  }, [historySearchTerm])

  // Effect for filter changes (immediate reload)
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 })) // Reset to first page when filter changes
    loadEscalationHistory()
  }, [historyFilter])

  // Effect for pagination changes
  useEffect(() => {
    loadEscalationHistory()
  }, [pagination.page, pagination.pageSize])

  const handleEscalation = async (orderNumber: string, alertType: string, branch: string) => {
    setIsEscalating(true)

    // สร้าง timestamp
    const timestamp = new Date().toLocaleString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })

    // Format timestamp for database record (YYYY-MM-DD HH:MM:SS)
    const dbTimestamp = new Date().toISOString().replace("T", " ").substring(0, 19)

    // Set escalation details for the success dialog
    setEscalationDetails({
      timestamp,
      orderNumber,
      branch,
      alertType,
    })

    try {
      let createdEscalation: any = null
      let dbStorageWorking = true

      // Try to create escalation record in database first
      try {
        const escalationData = {
          alert_id: orderNumber,
          alert_type: alertType,
          message: getAlertMessage(alertType, orderNumber),
          severity: getSeverityFromAlertType(alertType),
          status: "PENDING" as const,
          escalated_by: "Executive Dashboard",
          escalated_to: branch,
        }

        createdEscalation = await createEscalationRecord(escalationData)
      } catch (dbError) {
        console.warn("Database storage failed, but continuing with Teams notification:", dbError)
        dbStorageWorking = false
      }

      // สร้าง Adaptive Card สำหรับ MS Teams
      const teamsMessage = createTeamsMessagePayload(orderNumber, alertType, branch, timestamp)

      // ส่งข้อมูลไปยัง API route ของเรา
      const response = await fetch("/api/teams-webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(teamsMessage),
      })

      const result = await response.json()

      if (!response.ok) {
        // Update escalation status to FAILED if Teams webhook fails (only if DB is working)
        if (dbStorageWorking && createdEscalation) {
          try {
            await updateEscalationStatus(createdEscalation.id, { status: "FAILED" })
          } catch (updateError) {
            console.warn("Failed to update escalation status:", updateError)
          }
        }
        throw new Error(result.message || `Failed to send to MS Teams: ${response.statusText}`)
      }

      // Update escalation status to SENT if Teams webhook succeeds (only if DB is working)
      if (dbStorageWorking && createdEscalation) {
        try {
          await updateEscalationStatus(createdEscalation.id, { status: "SENT" })
        } catch (updateError) {
          console.warn("Failed to update escalation status:", updateError)
        }
      }

      // Refresh escalation history to show the new record (only if DB is working)
      if (dbStorageWorking) {
        await loadEscalationHistory()
      }

      // Show success dialog
      setSuccessDialogOpen(true)

      // Also show toast notification
      toast({
        title: "Order escalated to branch",
        description: `Notification sent to ${branch} MS Teams channel at ${timestamp}${!dbStorageWorking ? " (History not saved - database not configured)" : ""}`,
        duration: 5000,
      })
    } catch (error) {
      console.error("Error in escalation process:", error)

      // Refresh escalation history to show any created record with FAILED status
      await loadEscalationHistory()

      // Show error toast
      toast({
        title: "Failed to escalate to MS Teams",
        description: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsEscalating(false)
    }
  }


  // Function to handle resolving an escalation
  const handleResolveEscalation = async (id: string) => {
    try {
      // Update escalation status in database
      await updateEscalationStatus(id, { status: "RESOLVED" })
      
      // Refresh escalation history to show updated status
      await loadEscalationHistory()

      toast({
        title: "Escalation resolved",
        description: `Escalation ${id} has been marked as resolved`,
        duration: 3000,
      })
    } catch (error) {
      console.error("Error resolving escalation:", error)
      toast({
        title: "Failed to resolve escalation",
        description: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
        duration: 5000,
      })
    }
  }

  // Since filtering is now done server-side, we just use the escalation history directly
  const filteredEscalationHistory = escalationHistory

  // Add this after other useEffect or before the return statement
  useEffect(() => {
    // Create interval only if we have active countdowns
    const hasActiveCountdowns = Object.keys(retryCountdowns).length > 0

    if (!hasActiveCountdowns) return

    const interval = setInterval(() => {
      setRetryCountdowns((current) => {
        const updated = { ...current }
        let hasChanges = false

        // Update each countdown
        Object.keys(updated).forEach((id) => {
          if (updated[id] > 0) {
            updated[id] -= 1
            hasChanges = true
          }
        })

        // If no changes were made, return the current state to avoid re-render
        return hasChanges ? updated : current
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [retryCountdowns])

  return (
    <div className="space-y-6">
      {/* Alert Bar */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-center">
          <Bell className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-amber-800">ระบบแจ้งเตือนการ Escalation</h3>
            <p className="text-sm text-amber-700 mt-0.5">
              การแจ้งเตือนจะถูกส่งไปยัง MS Teams ของแต่ละสาขาโดยอัตโนมัติ กรุณาตรวจสอบสถานะการส่งในตาราง Escalation History
            </p>
          </div>
        </div>
      </div>

      {/* Database Setup Notice */}
      {escalationHistory.length === 0 && !isLoadingHistory && !historyError && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-blue-800">Database Setup Notice</h3>
              <p className="text-sm text-blue-700 mt-0.5">
                The escalation history database table may not be set up yet. Escalations will still work with MS Teams notifications, but history may not be saved until the database is properly configured.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm border border-medium-gray p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold text-enterprise-dark">Escalation Management</h1>
            <p className="text-sm text-enterprise-text-light mt-1">
              Monitor and manage alert escalations across all business units
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="h-9"
              onClick={() => {
                setIsEscalating(true)
                handleEscalation("TEST-ORDER-001", "SLA_BREACH", "Test Branch").finally(() => setIsEscalating(false))
              }}
              disabled={isEscalating}
            >
              {isEscalating ? (
                <>
                  <span className="animate-spin mr-1">⏳</span>
                  Testing...
                </>
              ) : (
                <>
                  <MessageSquare className="h-3.5 w-3.5 mr-1" />
                  Test Escalation
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Escalations</p>
              <p className="text-2xl font-bold">{escalationHistory.length}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-full">
              <MessageSquare className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Sent Successfully</p>
              <p className="text-2xl font-bold text-green-600">
                {escalationHistory.filter((r) => r.status === "SENT").length}
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-full">
              <Check className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Failed</p>
              <p className="text-2xl font-bold text-red-600">
                {escalationHistory.filter((r) => r.status === "FAILED").length}
              </p>
            </div>
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Resolved</p>
              <p className="text-2xl font-bold text-blue-600">
                {escalationHistory.filter((r) => r.status === "RESOLVED").length}
              </p>
            </div>
            <div className="p-2 bg-blue-100 rounded-full">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Escalation History */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-medium text-deep-navy">Escalation History</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search escalations..."
                  className="pl-8 h-9 md:w-[200px] lg:w-[300px]"
                  value={historySearchTerm}
                  onChange={(e) => setHistorySearchTerm(e.target.value)}
                />
              </div>
              <Select value={historyFilter} onValueChange={setHistoryFilter}>
                <SelectTrigger className="w-[150px] h-9 text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="SENT">Sent</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="h-9">
                <Filter className="h-3.5 w-3.5 mr-1" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Loading state */}
          {isLoadingHistory && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2 text-muted-foreground">Loading escalation history...</span>
            </div>
          )}

          {/* Error state */}
          {historyError && (
            <div className="p-6 text-center">
              <div className="text-red-600 mb-2">Failed to load escalation history</div>
              <div className="text-sm text-muted-foreground mb-4">{historyError}</div>
              <Button onClick={loadEscalationHistory} variant="outline" size="sm">
                Retry
              </Button>
            </div>
          )}

          {/* Table content */}
          {!isLoadingHistory && !historyError && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
              <thead>
                <tr className="bg-light-gray">
                  <th className="px-4 py-3 text-left font-medium">Escalation ID</th>
                  <th className="px-4 py-3 text-left font-medium">Alert ID</th>
                  <th className="px-4 py-3 text-left font-medium">Type</th>
                  <th className="px-4 py-3 text-left font-medium">Message</th>
                  <th className="px-4 py-3 text-left font-medium">Severity</th>
                  <th className="px-4 py-3 text-left font-medium">Escalated To</th>
                  <th className="px-4 py-3 text-left font-medium">Time</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEscalationHistory.length > 0 ? (
                  filteredEscalationHistory.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs">{record.id}</td>
                      <td className="px-4 py-3 font-mono text-xs">{record.alert_id}</td>
                      <td className="px-4 py-3">{record.alert_type}</td>
                      <td className="px-4 py-3 max-w-xs truncate">{record.message}</td>
                      <td className="px-4 py-3">
                        <Badge
                          className={
                            record.severity === "HIGH"
                              ? "bg-red-100 text-red-800"
                              : record.severity === "MEDIUM"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-blue-100 text-blue-800"
                          }
                        >
                          {record.severity}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">{record.escalated_to}</td>
                      <td className="px-4 py-3 text-xs">{record.timestamp || record.created_at}</td>
                      <td className="px-4 py-3">
                        <Badge
                          className={
                            record.status === "SENT"
                              ? "bg-green-100 text-green-800"
                              : record.status === "FAILED"
                                ? "bg-red-100 text-red-800"
                                : record.status === "RESOLVED"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-amber-100 text-amber-800"
                          }
                        >
                          {record.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {record.status !== "RESOLVED" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => handleResolveEscalation(record.id)}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Resolve
                            </Button>
                          )}
                          {record.status === "FAILED" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              onClick={() => {
                                // Start the countdown for this record
                                setRetryCountdowns((prev) => ({ ...prev, [record.id]: 60 }))

                                // Proceed with escalation
                                setIsEscalating(true)
                                handleEscalation(record.alert_id, record.alert_type, record.escalated_to).finally(() => {
                                  setIsEscalating(false)
                                })
                              }}
                              disabled={isEscalating || Boolean(retryCountdowns[record.id] && retryCountdowns[record.id] > 0)}
                            >
                              {isEscalating ? (
                                <span className="animate-spin mr-1">⏳</span>
                              ) : retryCountdowns[record.id] && retryCountdowns[record.id] > 0 ? (
                                <Clock className="h-4 w-4 mr-1" />
                              ) : (
                                <MessageSquare className="h-4 w-4 mr-1" />
                              )}
                              {retryCountdowns[record.id] && retryCountdowns[record.id] > 0
                                ? `รอ (${retryCountdowns[record.id]}s)`
                                : "Retry"}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                      No escalation records found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
              </table>
            </div>
          )}

          {/* Pagination controls */}
          {!isLoadingHistory && !historyError && pagination.totalPages > 1 && (
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {((pagination.page - 1) * pagination.pageSize) + 1} to {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total} escalations
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={!pagination.hasPrev}
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={!pagination.hasNext}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Success Dialog */}
      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-green-600">
              <Check className="h-5 w-5 mr-2" />
              Escalation Successful
            </DialogTitle>
            <DialogDescription>The alert has been successfully escalated to the branch team.</DialogDescription>
          </DialogHeader>

          <div className="bg-green-50 p-4 rounded-md mt-2">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Alert ID:</span>
                <span className="text-sm font-mono">{escalationDetails.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Escalated to:</span>
                <span className="text-sm">{escalationDetails.branch}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Alert Type:</span>
                <span className="text-sm">{escalationDetails.alertType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Timestamp:</span>
                <span className="text-sm">{escalationDetails.timestamp}</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
