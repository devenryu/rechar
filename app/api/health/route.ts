import { NextResponse } from "next/server"

export async function GET() {
  // Check if API key is configured
  const xaiConfigured = !!process.env.XAI_API_KEY

  // Check if we can connect to the API
  let apiConnected = false
  let availableModels = []

  if (xaiConfigured) {
    try {
      // Try to make a simple request to check connectivity
      const response = await fetch("https://api.x.ai/v1/models", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.XAI_API_KEY}`,
        },
      })

      if (response.ok) {
        apiConnected = true
        const data = await response.json()
        availableModels = data.data.map((model: any) => model.id)
      }
    } catch (error) {
      console.error("Error checking API connectivity:", error)
    }
  }

  return NextResponse.json({
    status: "ok",
    xaiConfigured,
    apiConnected,
    availableModels,
    timestamp: new Date().toISOString(),
  })
}
