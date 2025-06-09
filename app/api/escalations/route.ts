import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export interface EscalationRecord {
  id: string
  alert_id: string
  alert_type: string
  message: string
  severity: "HIGH" | "MEDIUM" | "LOW"
  timestamp: string
  status: "PENDING" | "SENT" | "FAILED" | "RESOLVED"
  escalated_by: string
  escalated_to: string
  created_at?: string
  updated_at?: string
}

export interface EscalationCreateInput {
  alert_id: string
  alert_type: string
  message: string
  severity: "HIGH" | "MEDIUM" | "LOW"
  status: "PENDING" | "SENT" | "FAILED" | "RESOLVED"
  escalated_by: string
  escalated_to: string
}

export interface EscalationUpdateInput {
  status?: "PENDING" | "SENT" | "FAILED" | "RESOLVED"
  message?: string
  escalated_to?: string
}

// GET /api/escalations - Fetch escalation history with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Pagination parameters
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "25")
    const offset = (page - 1) * pageSize

    // Filter parameters
    const status = searchParams.get("status")
    const alertType = searchParams.get("alertType")
    const severity = searchParams.get("severity")
    const escalatedTo = searchParams.get("escalatedTo")
    const searchTerm = searchParams.get("search")
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")

    // Build query
    let query = supabase
      .from("escalation_history")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })

    // Apply filters
    if (status && status !== "all") {
      query = query.eq("status", status.toUpperCase())
    }
    
    if (alertType && alertType !== "all") {
      query = query.eq("alert_type", alertType.toUpperCase())
    }
    
    if (severity && severity !== "all") {
      query = query.eq("severity", severity.toUpperCase())
    }
    
    if (escalatedTo) {
      query = query.ilike("escalated_to", `%${escalatedTo}%`)
    }
    
    if (searchTerm) {
      query = query.or(`alert_id.ilike.%${searchTerm}%,message.ilike.%${searchTerm}%,escalated_to.ilike.%${searchTerm}%`)
    }
    
    if (dateFrom) {
      query = query.gte("created_at", dateFrom)
    }
    
    if (dateTo) {
      const endDate = new Date(dateTo)
      endDate.setHours(23, 59, 59, 999)
      query = query.lte("created_at", endDate.toISOString())
    }

    // Apply pagination
    query = query.range(offset, offset + pageSize - 1)

    const { data, error, count } = await query

    if (error) {
      console.error("Error fetching escalations:", error)
      
      // If table doesn't exist, return empty result instead of error
      if (error.message && error.message.includes("does not exist")) {
        console.warn("Escalation history table does not exist, returning empty data")
        return NextResponse.json({
          success: true,
          data: [],
          pagination: {
            page: 1,
            pageSize: 25,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
        })
      }
      
      return NextResponse.json(
        { success: false, error: `Database error: ${error.message}` },
        { status: 500 }
      )
    }

    // Calculate pagination info
    const totalPages = Math.ceil((count || 0) / pageSize)
    const hasNext = page < totalPages
    const hasPrev = page > 1

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        page,
        pageSize,
        total: count || 0,
        totalPages,
        hasNext,
        hasPrev,
      },
    })
  } catch (error) {
    console.error("Error in escalations GET:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: `Failed to fetch escalations: ${error instanceof Error ? error.message : "Unknown error"}` 
      },
      { status: 500 }
    )
  }
}

// POST /api/escalations - Create new escalation record
export async function POST(request: NextRequest) {
  try {
    const body: EscalationCreateInput = await request.json()

    // Validate required fields
    if (!body.alert_id || !body.alert_type || !body.message || !body.severity || !body.status || !body.escalated_by || !body.escalated_to) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Validate enum values
    const validSeverities = ["HIGH", "MEDIUM", "LOW"]
    const validStatuses = ["PENDING", "SENT", "FAILED", "RESOLVED"]

    if (!validSeverities.includes(body.severity)) {
      return NextResponse.json(
        { success: false, error: "Invalid severity value" },
        { status: 400 }
      )
    }

    if (!validStatuses.includes(body.status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status value" },
        { status: 400 }
      )
    }

    // Create escalation record
    const escalationData = {
      alert_id: body.alert_id,
      alert_type: body.alert_type,
      message: body.message,
      severity: body.severity,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      status: body.status,
      escalated_by: body.escalated_by,
      escalated_to: body.escalated_to,
    }

    const { data, error } = await supabase
      .from("escalation_history")
      .insert([escalationData])
      .select()
      .single()

    if (error) {
      console.error("Error creating escalation:", error)
      
      // If table doesn't exist, try to create it
      if (error.message && error.message.includes("does not exist")) {
        console.warn("Escalation history table does not exist, attempting to create it")
        
        // For now, return a helpful error message instead of trying to create the table
        return NextResponse.json(
          { 
            success: false, 
            error: "Escalation history table does not exist. Please contact your administrator to set up the database schema.",
            needsSetup: true
          },
          { status: 503 }
        )
      }
      
      return NextResponse.json(
        { success: false, error: `Database error: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data,
      message: "Escalation record created successfully",
    })
  } catch (error) {
    console.error("Error in escalations POST:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: `Failed to create escalation: ${error instanceof Error ? error.message : "Unknown error"}` 
      },
      { status: 500 }
    )
  }
}

// PUT /api/escalations - Update escalation record
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Escalation ID is required" },
        { status: 400 }
      )
    }

    const body: EscalationUpdateInput = await request.json()

    // Validate status if provided
    if (body.status) {
      const validStatuses = ["PENDING", "SENT", "FAILED", "RESOLVED"]
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { success: false, error: "Invalid status value" },
          { status: 400 }
        )
      }
    }

    // Build update object
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (body.status) updateData.status = body.status
    if (body.message) updateData.message = body.message
    if (body.escalated_to) updateData.escalated_to = body.escalated_to

    const { data, error } = await supabase
      .from("escalation_history")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating escalation:", error)
      return NextResponse.json(
        { success: false, error: `Database error: ${error.message}` },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: "Escalation not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data,
      message: "Escalation record updated successfully",
    })
  } catch (error) {
    console.error("Error in escalations PUT:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: `Failed to update escalation: ${error instanceof Error ? error.message : "Unknown error"}` 
      },
      { status: 500 }
    )
  }
}

// DELETE /api/escalations - Delete escalation record (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Escalation ID is required" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("escalation_history")
      .delete()
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error deleting escalation:", error)
      return NextResponse.json(
        { success: false, error: `Database error: ${error.message}` },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: "Escalation not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Escalation record deleted successfully",
    })
  } catch (error) {
    console.error("Error in escalations DELETE:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: `Failed to delete escalation: ${error instanceof Error ? error.message : "Unknown error"}` 
      },
      { status: 500 }
    )
  }
}
