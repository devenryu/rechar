"use client"

import { BarChart3, LineChart, PieChart, AreaChart, ScatterChart, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ChartSelectorProps {
  onChartSelect: (chartType: string) => void
}

const chartTypes = [
  {
    id: "bar",
    name: "Bar Chart",
    description: "Compare values across categories",
    icon: BarChart3,
    color: "bg-blue-100 text-blue-600",
  },
  {
    id: "line",
    name: "Line Chart",
    description: "Show trends over time",
    icon: LineChart,
    color: "bg-green-100 text-green-600",
  },
  {
    id: "pie",
    name: "Pie Chart",
    description: "Display parts of a whole",
    icon: PieChart,
    color: "bg-purple-100 text-purple-600",
  },
  {
    id: "area",
    name: "Area Chart",
    description: "Show cumulative values over time",
    icon: AreaChart,
    color: "bg-orange-100 text-orange-600",
  },
  {
    id: "scatter",
    name: "Scatter Plot",
    description: "Show correlation between variables",
    icon: ScatterChart,
    color: "bg-red-100 text-red-600",
  },
  {
    id: "trend",
    name: "Trend Chart",
    description: "Highlight patterns and trends",
    icon: TrendingUp,
    color: "bg-indigo-100 text-indigo-600",
  },
]

export default function ChartSelector({ onChartSelect }: ChartSelectorProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Chart Type</h2>
        <p className="text-lg text-gray-600">Select the visualization that best represents your data</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {chartTypes.map((chart) => {
          const IconComponent = chart.icon
          return (
            <Card
              key={chart.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 border-gray-200 hover:border-green-300"
              onClick={() => onChartSelect(chart.id)}
            >
              <CardHeader className="text-center">
                <div className={`w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4 ${chart.color}`}>
                  <IconComponent className="w-8 h-8" />
                </div>
                <CardTitle className="text-xl">{chart.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="mb-4">{chart.description}</CardDescription>
                <Button variant="outline" className="w-full border-green-600 text-green-600 hover:bg-green-50">
                  Select
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
