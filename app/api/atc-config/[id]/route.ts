/**
 * ATC Configuration API Routes - Specific Configuration
 *
 * GET /api/atc-config/[id] - Get specific configuration
 * PUT /api/atc-config/[id] - Update configuration
 * DELETE /api/atc-config/[id] - Delete configuration
 */

import { NextRequest, NextResponse } from "next/server"
import {
  fetchATCConfiguration,
  saveATCConfiguration,
  deleteATCConfiguration,
} from "@/lib/atc-config-service"
import type { ATCConfiguration } from "@/types/atc-config"

/**
 * GET /api/atc-config/[id]
 * Fetch specific ATC configuration by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Configuration ID is required",
        },
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        }
      )
    }

    const configuration = await fetchATCConfiguration(id)

    if (!configuration) {
      return NextResponse.json(
        {
          success: false,
          error: "Configuration not found",
        },
        {
          status: 404,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        }
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: configuration,
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    )
  } catch (error) {
    console.error("[ATC Config API] Error in GET [id]:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Failed to fetch configuration: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    )
  }
}

/**
 * PUT /api/atc-config/[id]
 * Update existing ATC configuration
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Configuration ID is required",
        },
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        }
      )
    }

    const body: ATCConfiguration = await request.json()

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        {
          success: false,
          error: "Configuration name is required",
        },
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        }
      )
    }

    if (!body.inventory_supply || !body.atc_rules) {
      return NextResponse.json(
        {
          success: false,
          error: "Configuration must include inventory_supply and atc_rules",
        },
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        }
      )
    }

    // Validate status
    const validStatuses = ["draft", "active", "archived"]
    if (body.status && !validStatuses.includes(body.status)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid status value. Must be: draft, active, or archived",
        },
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        }
      )
    }

    // Ensure ID matches
    body.id = id

    // Save configuration
    const savedConfig = await saveATCConfiguration(body)

    if (!savedConfig) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to update configuration",
        },
        {
          status: 500,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        }
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: savedConfig,
        message: "Configuration updated successfully",
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    )
  } catch (error) {
    console.error("[ATC Config API] Error in PUT [id]:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Failed to update configuration: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    )
  }
}

/**
 * DELETE /api/atc-config/[id]
 * Delete ATC configuration
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Configuration ID is required",
        },
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        }
      )
    }

    const success = await deleteATCConfiguration(id)

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to delete configuration",
        },
        {
          status: 500,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: "Configuration deleted successfully",
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    )
  } catch (error) {
    console.error("[ATC Config API] Error in DELETE [id]:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Failed to delete configuration: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    )
  }
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
