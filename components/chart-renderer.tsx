"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, Save, Share2 } from "lucide-react"
import { useState, useRef } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { supabase } from "@/lib/supabase"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import ExportShareModal from "@/components/export-share-modal"
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

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend)

interface ChartRendererProps {
  chartType: string
  data: any
  onStartOver: () => void
  savedChart?: any
}

const COLORS = ["#107C41", "#0E6B3A", "#4CAF50", "#8BC34A", "#CDDC39", "#FFC107", "#FF9800", "#FF5722"]

export default function ChartRenderer({ chartType, data, onStartOver, savedChart }: ChartRendererProps) {
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [saveTitle, setSaveTitle] = useState(data?.title || "")
  const [saveDescription, setSaveDescription] = useState(data?.description || "")
  const [saving, setSaving] = useState(false)
  const { user } = useAuth()
  const chartRef = useRef<HTMLDivElement>(null)

  const renderChart = () => {
    console.log("=== CHART RENDERER DEBUG ===")
    console.log("Chart type:", chartType)
    console.log("Full data object:", data)
    console.log("Chart data array:", data?.chartData)
    console.log("Config object:", data?.config)
    console.log("=== END DEBUG ===")

    if (!data || !data.chartData || !Array.isArray(data.chartData) || data.chartData.length === 0) {
      console.error("Invalid chart data:", data)
      return (
        <div className="text-center text-gray-500 p-8">
          <p>No valid data to display.</p>
          <p className="text-sm mt-2">Debug info: {JSON.stringify(data, null, 2)}</p>
        </div>
      )
    }

    const { chartData, config } = data

    if (!config || !config.xKey || !config.yKey) {
      console.error("Invalid config:", config)
      return (
        <div className="text-center text-gray-500 p-8">
          <p>Invalid chart configuration.</p>
          <p className="text-sm mt-2">Config: {JSON.stringify(config, null, 2)}</p>
        </div>
      )
    }

    // Prepare data for Chart.js
    const labels = chartData.map((item: any) => item[config.xKey])
    const values = chartData.map((item: any) => item[config.yKey])

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top" as const,
        },
        title: {
          display: true,
          text: data.title || "Chart",
        },
      },
      scales:
        chartType === "pie"
          ? undefined
          : {
              y: {
                beginAtZero: true,
              },
            },
    }

    switch (chartType) {
      case "bar":
        const barData = {
          labels,
          datasets: [
            {
              label: config.yKey,
              data: values,
              backgroundColor: "#107C41",
              borderColor: "#0E6B3A",
              borderWidth: 1,
            },
          ],
        }
        return (
          <div style={{ height: "400px", width: "100%" }}>
            <Bar data={barData} options={chartOptions} />
          </div>
        )

      case "line":
      case "trend":
        const lineData = {
          labels,
          datasets: [
            {
              label: config.yKey,
              data: values,
              borderColor: "#107C41",
              backgroundColor: "rgba(16, 124, 65, 0.1)",
              borderWidth: 3,
              pointBackgroundColor: "#107C41",
              pointBorderColor: "#0E6B3A",
              pointRadius: 6,
              pointHoverRadius: 8,
              tension: chartType === "trend" ? 0.4 : 0.1,
            },
          ],
        }
        return (
          <div style={{ height: "400px", width: "100%" }}>
            <Line data={lineData} options={chartOptions} />
          </div>
        )

      case "pie":
        const pieData = {
          labels,
          datasets: [
            {
              data: values,
              backgroundColor: COLORS.slice(0, values.length),
              borderColor: COLORS.slice(0, values.length).map((color) =>
                color.replace(")", ", 0.8)").replace("rgb", "rgba"),
              ),
              borderWidth: 2,
            },
          ],
        }
        return (
          <div style={{ height: "400px", width: "100%" }}>
            <Pie data={pieData} options={chartOptions} />
          </div>
        )

      case "area":
        const areaData = {
          labels,
          datasets: [
            {
              label: config.yKey,
              data: values,
              borderColor: "#107C41",
              backgroundColor: "rgba(16, 124, 65, 0.3)",
              borderWidth: 2,
              fill: true,
              pointBackgroundColor: "#107C41",
              pointBorderColor: "#0E6B3A",
              pointRadius: 4,
            },
          ],
        }
        return (
          <div style={{ height: "400px", width: "100%" }}>
            <Line data={areaData} options={chartOptions} />
          </div>
        )

      case "scatter":
        const scatterData = {
          datasets: [
            {
              label: `${config.xKey} vs ${config.yKey}`,
              data: chartData.map((item: any) => ({
                x: item[config.xKey],
                y: item[config.yKey],
              })),
              backgroundColor: "#107C41",
              borderColor: "#0E6B3A",
              pointRadius: 6,
            },
          ],
        }
        const scatterOptions = {
          ...chartOptions,
          scales: {
            x: {
              type: "linear" as const,
              position: "bottom" as const,
            },
            y: {
              beginAtZero: true,
            },
          },
        }
        return (
          <div style={{ height: "400px", width: "100%" }}>
            <Line data={scatterData} options={scatterOptions} />
          </div>
        )

      default:
        return <div className="text-center text-gray-500 p-8">Chart type "{chartType}" not supported</div>
    }
  }

  const handleSaveChart = async () => {
    if (!user) return

    setSaving(true)
    try {
      const chartData = {
        user_id: user.id,
        title: saveTitle,
        description: saveDescription || null,
        chart_type: chartType,
        chart_data: data.chartData,
        config: data.config,
        insights: data.insights || null,
      }

      if (savedChart?.id) {
        // Update existing chart
        const { error } = await supabase.from("charts").update(chartData).eq("id", savedChart.id)

        if (error) throw error
      } else {
        // Create new chart
        const { error } = await supabase.from("charts").insert([chartData])

        if (error) throw error
      }

      setShowSaveDialog(false)
      // You might want to show a success message here
    } catch (error) {
      console.error("Error saving chart:", error)
      // You might want to show an error message here
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Visualization</h2>
          <p className="text-lg text-gray-600">
            {data?.title || `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`}
          </p>
        </div>
        <div className="flex gap-3">
          {user && (
            <Button onClick={() => setShowSaveDialog(true)} className="bg-green-600 hover:bg-green-700">
              <Save className="w-4 h-4 mr-2" />
              {savedChart?.id ? "Update" : "Save"} Chart
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => setShowExportModal(true)}
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Export & Share
          </Button>
          <Button variant="outline" onClick={onStartOver} className="border-gray-300 text-gray-700 hover:bg-gray-50">
            <RefreshCw className="w-4 h-4 mr-2" />
            Create New Chart
          </Button>
        </div>
      </div>

      <Card className="border-gray-200 shadow-lg" ref={chartRef}>
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <CardTitle className="text-xl text-gray-900">{data?.title || "Data Visualization"}</CardTitle>
          {data?.description && <CardDescription className="text-gray-600">{data.description}</CardDescription>}
        </CardHeader>
        <CardContent className="p-6">{renderChart()}</CardContent>
      </Card>

      {data?.insights && (
        <Card className="mt-6 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-lg text-green-800">AI Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-700">{data.insights}</p>
          </CardContent>
        </Card>
      )}

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{savedChart?.id ? "Update" : "Save"} Chart</CardTitle>
              <CardDescription>Give your chart a title and description</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="chart-title">Title</Label>
                <Input
                  id="chart-title"
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                  placeholder="Enter chart title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="chart-description">Description (optional)</Label>
                <Textarea
                  id="chart-description"
                  value={saveDescription}
                  onChange={(e) => setSaveDescription(e.target.value)}
                  placeholder="Enter chart description"
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleSaveChart}
                  disabled={!saveTitle.trim() || saving}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {saving ? "Saving..." : savedChart?.id ? "Update" : "Save"}
                </Button>
                <Button variant="outline" onClick={() => setShowSaveDialog(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Export & Share Modal */}
      <ExportShareModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        elementRef={chartRef}
        resourceId={savedChart?.id || ""}
        resourceType="chart"
        title={data?.title || "Chart"}
      />
    </div>
  )
}
