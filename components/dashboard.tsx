"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth/auth-provider"
import { supabase } from "@/lib/supabase"
import { Plus, BarChart3, LineChart, PieChart, AreaChart, ScatterChart, TrendingUp, Trash2, Eye } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface SavedChart {
  id: string
  title: string
  description: string | null
  chart_type: string
  chart_data: any
  config: any
  insights: string | null
  created_at: string
  updated_at: string
}

interface DashboardProps {
  onCreateNew: () => void
  onViewChart: (chart: SavedChart) => void
}

const chartIcons = {
  bar: BarChart3,
  line: LineChart,
  pie: PieChart,
  area: AreaChart,
  scatter: ScatterChart,
  trend: TrendingUp,
}

export default function Dashboard({ onCreateNew, onViewChart }: DashboardProps) {
  const [charts, setCharts] = useState<SavedChart[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchCharts()
    }
  }, [user])

  const fetchCharts = async () => {
    try {
      const { data, error } = await supabase.from("charts").select("*").order("updated_at", { ascending: false })

      if (error) throw error
      setCharts(data || [])
    } catch (error) {
      console.error("Error fetching charts:", error)
    } finally {
      setLoading(false)
    }
  }

  const deleteChart = async (chartId: string) => {
    try {
      const { error } = await supabase.from("charts").delete().eq("id", chartId)

      if (error) throw error
      setCharts(charts.filter((chart) => chart.id !== chartId))
    } catch (error) {
      console.error("Error deleting chart:", error)
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading your charts...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Dashboard</h1>
          <p className="text-lg text-gray-600">Manage your saved charts and visualizations</p>
        </div>
        <Button onClick={onCreateNew} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Create New Chart
        </Button>
      </div>

      {charts.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No charts yet</h3>
            <p className="text-gray-600 mb-6">Create your first chart to get started with data visualization</p>
            <Button onClick={onCreateNew} className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Chart
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {charts.map((chart) => {
            const IconComponent = chartIcons[chart.chart_type as keyof typeof chartIcons] || BarChart3
            return (
              <Card key={chart.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <IconComponent className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{chart.title}</CardTitle>
                        <Badge variant="secondary" className="mt-1">
                          {chart.chart_type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {chart.description && <CardDescription className="mb-4">{chart.description}</CardDescription>}
                  <div className="text-sm text-gray-500 mb-4">
                    Updated {formatDistanceToNow(new Date(chart.updated_at), { addSuffix: true })}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => onViewChart(chart)} className="flex-1">
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteChart(chart.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
