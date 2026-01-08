/**
 * Stock Configuration File Download API Endpoint
 *
 * Mock implementation that returns a sample CSV file for download.
 * When actual file storage is implemented (e.g., S3, local storage),
 * this endpoint should be updated to fetch and serve the actual files.
 */

import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params

    // Validate fileId
    if (!fileId) {
      return NextResponse.json(
        { error: "File ID is required" },
        { status: 400 }
      )
    }

    // Mock CSV content - represents a sample stock configuration file
    const csvContent = `LocationId,ItemId,SKU,Quantity,SupplyTypeId,Frequency,SafetyStock,StartDate,EndDate
WH-CENTRAL-BKK-01,ITEM-001,SKU001,100,PreOrder,One-time,10,2024-01-01,2024-12-31
WH-CENTRAL-BKK-02,ITEM-002,SKU002,200,On Hand Available,Daily,20,2024-01-01,2024-12-31
WH-TOPS-BKK-01,ITEM-003,SKU003,150,PreOrder,One-time,15,2024-02-01,2024-11-30
WH-TOPS-BKK-02,ITEM-004,SKU004,250,On Hand Available,Daily,25,2024-01-15,2024-12-15
WH-CENTRAL-BKK-03,ITEM-005,SKU005,300,PreOrder,One-time,30,2024-03-01,2024-10-31`

    // Create response with proper headers for file download
    const response = new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="stock-config-${fileId}.csv"`,
        "Cache-Control": "no-cache",
      },
    })

    return response
  } catch (error) {
    console.error("Error downloading file:", error)
    return NextResponse.json(
      { error: "Failed to download file" },
      { status: 500 }
    )
  }
}
