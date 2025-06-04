export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // Extract pagination parameters
    const page = searchParams.get("page") || "1"
    const pageSize = searchParams.get("pageSize") || "10"

    // Build API URL with pagination
    const apiUrl = new URL("https://dev-pmpapis.central.co.th/pmp/v2/grabmart/v1/merchant/orders")
    apiUrl.searchParams.set("page", page)
    apiUrl.searchParams.set("pageSize", pageSize)

    // Add any other query parameters
    for (const [key, value] of searchParams.entries()) {
      if (key !== "page" && key !== "pageSize") {
        apiUrl.searchParams.set(key, value)
      }
    }

    console.log(`🔄 Fetching from API: ${apiUrl.toString()}`)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    const response = await fetch(apiUrl.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.error(`❌ API Error: ${response.status} - ${response.statusText}`)
      return NextResponse.json({
        success: false,
        error: `API Error: ${response.status} - ${response.statusText}`,
        fallback: true,
      })
    }

    const data = await response.json()
    console.log(`✅ API Success: Page ${page}, ${data.data?.length || 0} orders`)

    return NextResponse.json({
      success: true,
      data: data,
    })
  } catch (error) {
    console.error("❌ Server proxy error:", error)

    let errorMessage = "Unknown server error"
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        errorMessage = "Request timeout"
      } else {
        errorMessage = error.message
      }
    }

    return NextResponse.json({
      success: false,
      error: errorMessage,
      fallback: true,
    })
  }
}
