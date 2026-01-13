import { type NextRequest, NextResponse } from "next/server"
import { generateMockAllocateTransactions } from "@/lib/mock-inventory-data"

/**
 * GET /api/inventory/[item_id]/allocate-transactions
 *
 * Returns allocate-by-order transactions for a specific inventory item.
 * Currently returns mock data, ready for backend integration.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ item_id: string }> }
) {
  try {
    const { item_id } = await params

    if (!item_id) {
      return NextResponse.json(
        { error: "Missing item_id parameter" },
        { status: 400 }
      )
    }

    // Generate mock data for the item
    const transactions = generateMockAllocateTransactions(item_id)

    // Return response with CORS headers
    return NextResponse.json(
      {
        data: transactions,
        total: transactions.length,
        item_id,
        mockData: true, // Flag to indicate mock data
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      }
    )
  } catch (error) {
    console.error("Error fetching allocate transactions:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch allocate transactions",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS handler for CORS preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}
