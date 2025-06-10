import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest, { params }: { params: { token: string } }) {
  try {
    const { token } = params
    const { searchParams } = new URL(request.url)
    const isEmbed = searchParams.get("embed") === "true"

    // Get shared resource
    const { data: sharedResource, error: shareError } = await supabase
      .from("shared_resources")
      .select("*")
      .eq("share_token", token)
      .eq("is_public", true)
      .single()

    if (shareError || !sharedResource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 })
    }

    // Check if embedding is allowed
    if (isEmbed && !sharedResource.allow_embed) {
      return NextResponse.json({ error: "Embedding not allowed" }, { status: 403 })
    }

    // Get the actual resource data
    let resourceData
    if (sharedResource.resource_type === "chart") {
      const { data: chart, error: chartError } = await supabase
        .from("charts")
        .select("*")
        .eq("id", sharedResource.resource_id)
        .single()

      if (chartError || !chart) {
        return NextResponse.json({ error: "Chart not found" }, { status: 404 })
      }
      resourceData = chart
    } else {
      const { data: diagram, error: diagramError } = await supabase
        .from("diagrams")
        .select("*")
        .eq("id", sharedResource.resource_id)
        .single()

      if (diagramError || !diagram) {
        return NextResponse.json({ error: "Diagram not found" }, { status: 404 })
      }
      resourceData = diagram
    }

    return NextResponse.json({
      resource: resourceData,
      resourceType: sharedResource.resource_type,
      isEmbed,
    })
  } catch (error) {
    console.error("Error fetching shared resource:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
