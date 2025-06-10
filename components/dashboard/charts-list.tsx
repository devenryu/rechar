"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/auth/auth-provider"
import { supabase } from "@/lib/supabase"
import {
  BarChart3,
  LineChart,
  PieChart,
  AreaChart,
  ScatterChart,
  TrendingUp,
  Trash2,
  Eye,
  Search,
  Filter,
  Plus,
} from "lucide-react"
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

interface ChartsListProps {
  onViewChart: (chart: SavedChart) => void
  onCreateChart: () => void
}

const chartIcons = {
  bar: BarChart3,
  line: LineChart,
  pie: PieChart,
  area: AreaChart,
  scatter: ScatterChart,
  trend: TrendingUp,
}

export default function ChartsList({ onViewChart, onCreateChart }: ChartsListProps) {
  const [charts, setCharts] = useState<SavedChart[]>([])
  const [filteredCharts, setFilteredCharts] = useState<SavedChart[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchCharts()
    }
  }, [user])

  useEffect(() => {
    filterCharts()
  }, [charts, searchTerm, selectedType])

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

  const filterCharts = () => {
    let filtered = charts

    if (searchTerm) {
      filtered = filtered.filter(
        (chart) =>
          chart.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          chart.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedType !== "all") {
      filtered = filtered.filter((chart) => chart.chart_type === selectedType)
    }

    setFilteredCharts(filtered)
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

  const chartTypes = ["all", ...new Set(charts.map((chart) => chart.chart_type))]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Charts</h1>
          <p className="text-gray-600 mt-1">Manage and organize your data visualizations</p>
        </div>
        <Button onClick={onCreateChart} className="bg-green-600 hover:bg-green-700 shrink-0">
          <Plus className="w-4 h-4 mr-2" />
          Create Chart
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search charts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 min-w-[140px]"
          >
            {chartTypes.map((type) => (
              <option key={type} value={type}>
                {type === "all" ? "All Types" : `${type.charAt(0).toUpperCase() + type.slice(1)}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Charts Grid */}
      {filteredCharts.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {charts.length === 0 ? "No charts yet" : "No charts match your search"}
            </h3>
            <p className="text-gray-600 mb-6">
              {charts.length === 0
                ? "Create your first chart to get started with data visualization"
                : "Try adjusting your search terms or filters"}
            </p>
            {charts.length === 0 && (
              <Button onClick={onCreateChart} className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Chart
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCharts.map((chart) => {
            const IconComponent = chartIcons[chart.chart_type as keyof typeof chartIcons] || BarChart3
            return (
              <Card key={chart.id} className="hover:shadow-lg transition-all duration-200 group">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shrink-0">
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-semibold truncate" title={chart.title}>
                        {chart.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {chart.chart_type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {chart.description && (
                    <CardDescription className="mb-4 line-clamp-2" title={chart.description}>
                      {chart.description}
                    </CardDescription>
                  )}
                  <div className="text-sm text-gray-500 mb-4">
                    Updated {formatDistanceToNow(new Date(chart.updated_at), { addSuffix: true })}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewChart(chart)}
                      className="flex-1 group-hover:border-green-500 group-hover:text-green-600"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteChart(chart.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300"
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
