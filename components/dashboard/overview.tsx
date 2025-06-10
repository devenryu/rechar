"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth/auth-provider"
import { supabase } from "@/lib/supabase"
import { BarChart3, TrendingUp, PieChart, Plus, Activity, Calendar, Eye, Network, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface DashboardOverviewProps {
  onCreateChart: () => void
  onViewChart: (chart: any) => void
}

export default function DashboardOverview({ onCreateChart, onViewChart }: DashboardOverviewProps) {
  const [stats, setStats] = useState({
    totalCharts: 0,
    totalDiagrams: 0,
    recentCharts: [],
    chartTypes: {},
  })
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      // Fetch charts data
      const { data: charts, error: chartsError } = await supabase
        .from("charts")
        .select("*")
        .order("updated_at", { ascending: false })

      if (chartsError) throw chartsError

      // Try to fetch diagrams data
      let diagrams = []
      try {
        const { data: diagramsData, error: diagramsError } = await supabase
          .from("diagrams")
          .select("*")
          .order("updated_at", { ascending: false })

        if (diagramsError) {
          console.warn("Diagrams table not found:", diagramsError.message)
        } else {
          diagrams = diagramsData || []
        }
      } catch (diagramError) {
        console.warn("Diagrams feature not available:", diagramError)
      }

      const totalCharts = charts?.length || 0
      const totalDiagrams = diagrams.length
      const recentCharts = charts?.slice(0, 5) || []

      const chartTypes =
        charts?.reduce((acc: any, chart) => {
          acc[chart.chart_type] = (acc[chart.chart_type] || 0) + 1
          return acc
        }, {}) || {}

      setStats({
        totalCharts,
        totalDiagrams,
        recentCharts,
        chartTypes,
      })
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const chartTypeIcons = {
    bar: BarChart3,
    line: TrendingUp,
    pie: PieChart,
    area: Activity,
    scatter: Activity,
    trend: TrendingUp,
  }

  const statCards = [
    {
      title: "Total Charts",
      value: stats.totalCharts,
      icon: BarChart3,
      bgColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      title: "Total Diagrams",
      value: stats.totalDiagrams,
      icon: Network,
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      title: "Chart Types",
      value: Object.keys(stats.chartTypes).length,
      icon: PieChart,
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      title: "This Month",
      value: stats.recentCharts.filter(
        (chart: any) => new Date(chart.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      ).length,
      icon: Calendar,
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
    },
  ]

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.email?.split("@")[0]}! 👋
          </h1>
          <p className="text-lg text-gray-600">Here's what's happening with your data visualizations today.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={onCreateChart}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Chart
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const IconComponent = stat.icon
          return (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                    <IconComponent className={`w-6 h-6 ${stat.textColor}`} />
                  </div>
                </div>
                <div>
                  <p className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">{stat.value.toLocaleString()}</p>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Charts */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold">Recent Charts</CardTitle>
                <CardDescription>Your latest data visualizations</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {stats.recentCharts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No charts yet</h3>
                <p className="text-gray-600 mb-6">Create your first chart to get started</p>
                <Button onClick={onCreateChart} className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Chart
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.recentCharts.map((chart: any) => {
                  const IconComponent = chartTypeIcons[chart.chart_type as keyof typeof chartTypeIcons] || BarChart3
                  return (
                    <div
                      key={chart.id}
                      className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all duration-200 group cursor-pointer"
                      onClick={() => onViewChart(chart)}
                    >
                      <div className="flex items-center space-x-4 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors shrink-0">
                          <IconComponent className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate" title={chart.title}>
                            {chart.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <p className="text-sm text-gray-500">
                              {formatDistanceToNow(new Date(chart.updated_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chart Types Distribution */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold">Chart Types</CardTitle>
                <CardDescription>Distribution of your visualizations</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {Object.keys(stats.chartTypes).length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <PieChart className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No chart types yet</h3>
                <p className="text-gray-600">Create charts to see the distribution</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(stats.chartTypes).map(([type, count]: [string, any]) => {
                  const IconComponent = chartTypeIcons[type as keyof typeof chartTypeIcons] || BarChart3
                  const percentage = ((count / stats.totalCharts) * 100).toFixed(1)
                  return (
                    <div
                      key={type}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                          <IconComponent className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium capitalize text-gray-900">{type} Charts</p>
                          <p className="text-sm text-gray-500">{count} charts</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 shrink-0">
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-12 text-right">{percentage}%</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
