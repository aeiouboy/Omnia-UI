import { NextResponse } from "next/server"
import { seedDatabase } from "@/lib/seed-database"

export async function POST() {
  try {
    const result = await seedDatabase()

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      data: result,
    })
  } catch (error) {
    console.error("Seeding error:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Failed to seed database",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST method to seed the database",
  })
}
