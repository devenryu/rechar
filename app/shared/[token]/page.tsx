"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileSpreadsheet, AlertCircle } from "lucide-react"
import { useParams, useSearchParams } from "next/navigation"
import mermaid from "mermaid"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { Line, Bar, Pie } from "react-chartjs-2"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend)

export default function SharedResourcePage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const [resource, setResource] = useState<any>(null)
  const [resourceType, setResourceType] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const isEmbed = searchParams.get("embed") === "true"

  useEffect(() => {
    fetchSharedResource()
  }, [params.token])

  const fetchSharedResource = async () => {
    try {
      const response = await fetch(`/api/shared/${params.token}?embed=${isEmbed}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to load resource")
      }

      setResource(data.resource)
      setResourceType(data.resourceType)

      // Initialize Mermaid for diagrams
      if (data.resourceType === "diagram") {
        mermaid.initialize({
          startOnLoad: false,
          theme: "default",
          securityLevel: "loose",
        })
        renderDiagram(data.resource.mermaid_code)
      }
    } catch (err) {
      setError(err.message || "Failed to load shared resource")
    } finally {
      setLoading(false)
    }
  }

  const renderDiagram = async (mermaidCode: string) => {
    try {
      const diagramElement = document.getElementById("shared-diagram")
      if (!diagramElement) return

      const diagramId = `shared-diagram-${Date.now()}`
      const { svg } = await mermaid.render(diagramId, mermaidCode)
      diagramElement.innerHTML = svg

      const svgElement = diagramElement.querySelector("svg")
      if (svgElement) {
        svgElement.style.maxWidth = "100%"
        svgElement.style.height = "auto"
        svgElement.style.display = "block"
        svgElement.style.margin = "0 auto"
      }
    } catch (error) {
      console.error("Error rendering diagram:", error)
      const diagramElement = document.getElementById("shared-diagram")
      if (diagramElement) {
        diagramElement.innerHTML = `
          <div class="text-center text-red-600 p-8">
            <p class="font-medium">Error rendering diagram</p>
          </div>
        `
      }
    }
  }

  const renderChart = () => {
    if (!resource || resourceType !== "chart") return null

    const { chart_data, config, chart_type } = resource
    const labels = chart_data.map((item: any) => item[config.xKey])
    const values = chart_data.map((item: any) => item[config.yKey])

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "top" as const },
        title: { display: true, text: resource.title },
      },
      scales: chart_type === "pie" ? undefined : { y: { beginAtZero: true } },
    }

    const chartData = {
      labels,
      datasets: [
        {
          label: config.yKey,
          data: values,
          backgroundColor: "#107C41",
          borderColor: "#0E6B3A",
          borderWidth: chart_type === "line" ? 3 : 1,
        },
      ],
    }

    switch (chart_type) {
      case "bar":
        return <Bar data={chartData} options={chartOptions} />
      case "line":
      case "trend":
        return <Line data={chartData} options={chartOptions} />
      case "pie":
        return <Pie data={chartData} options={chartOptions} />
      default:
        return <div>Unsupported chart type</div>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading shared resource...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-8">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Resource Not Found</h2>
            <p className="text-gray-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const containerClass = isEmbed ? "p-4" : "min-h-screen bg-gray-50 p-8"

  return (
    <div className={containerClass}>
      {!isEmbed && (
        <div className="max-w-6xl mx-auto mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FileSpreadsheet className="w-8 h-8 text-green-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Rechart</h1>
              <p className="text-gray-600">Shared {resourceType}</p>
            </div>
          </div>
        </div>
      )}

      <div className={isEmbed ? "" : "max-w-6xl mx-auto"}>
        <Card className="border-gray-200 shadow-lg">
          <CardHeader className="bg-gray-50 border-b border-gray-200">
            <CardTitle className="text-xl text-gray-900">{resource?.title}</CardTitle>
            {resource?.description && (
              <CardDescription className="text-gray-600">{resource.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="p-6">
            {resourceType === "chart" ? (
              <div style={{ height: "400px", width: "100%" }}>{renderChart()}</div>
            ) : (
              <div id="shared-diagram" className="text-center min-h-[200px] flex items-center justify-center">
                <div className="text-gray-500">Loading diagram...</div>
              </div>
            )}
          </CardContent>
        </Card>

        {!isEmbed && (
          <div className="text-center mt-8">
            <p className="text-gray-600 mb-4">Create your own visualizations with Rechart</p>
            <Button onClick={() => (window.location.href = "/")} className="bg-green-600 hover:bg-green-700">
              Get Started Free
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
