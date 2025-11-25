/**
 * ATC Configuration API Routes
 *
 * GET /api/atc-config - List all ATC configurations
 * POST /api/atc-config - Create new ATC configuration
 */

import { NextRequest, NextResponse } from "next/server"
import {
  fetchATCConfigurations,
  saveATCConfiguration,
} from "@/lib/atc-config-service"
import type { ATCConfiguration } from "@/types/atc-config"

/**
 * GET /api/atc-config
 * Fetch all ATC configurations
 */
export async function GET(request: NextRequest) {
  try {
    const configurations = await fetchATCConfigurations()

    return NextResponse.json(
      {
        success: true,
        data: configurations,
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    )
  } catch (error) {
    console.error("[ATC Config API] Error in GET:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Failed to fetch configurations: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    )
  }
}

/**
 * POST /api/atc-config
 * Create new ATC configuration
 */
export async function POST(request: NextRequest) {
  try {
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
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        }
      )
    }

    // Save configuration
    const savedConfig = await saveATCConfiguration(body)

    if (!savedConfig) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to save configuration",
        },
        {
          status: 500,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        }
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: savedConfig,
        message: "Configuration created successfully",
      },
      {
        status: 201,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    )
  } catch (error) {
    console.error("[ATC Config API] Error in POST:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Failed to create configuration: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
