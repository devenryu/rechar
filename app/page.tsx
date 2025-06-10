"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import Sidebar from "@/components/layout/sidebar"
import DashboardOverview from "@/components/dashboard/overview"
import ChartsList from "@/components/dashboard/charts-list"
import ChartSelector from "@/components/chart-selector"
import DataInput from "@/components/data-input"
import ChartRenderer from "@/components/chart-renderer"
import AuthModal from "@/components/auth/auth-modal"
import LandingPage from "@/components/landing-page"
import DiagramSelector from "@/components/diagram-selector"
import DiagramInput from "@/components/diagram-input"
import DiagramRenderer from "@/components/diagram-renderer"
import DiagramsList from "@/components/dashboard/diagrams-list"
import { FileSpreadsheet } from "lucide-react"

export default function HomePage() {
  const [currentView, setCurrentView] = useState<string>("landing")
  const [selectedChartType, setSelectedChartType] = useState<string>("")
  const [processedData, setProcessedData] = useState<any>(null)
  const [viewingChart, setViewingChart] = useState<any>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { user, loading } = useAuth()

  const [selectedDiagramType, setSelectedDiagramType] = useState<string>("")
  const [processedDiagramData, setProcessedDiagramData] = useState<any>(null)
  const [viewingDiagram, setViewingDiagram] = useState<any>(null)

  const handleGetStarted = () => {
    if (user) {
      setCurrentView("dashboard")
    } else {
      setShowAuthModal(true)
    }
  }

  const handleCreateChart = () => {
    setCurrentView("chart-selection")
    setSelectedChartType("")
    setProcessedData(null)
    setViewingChart(null)
  }

  const handleChartSelect = (chartType: string) => {
    setSelectedChartType(chartType)
    setCurrentView("data-input")
  }

  const handleDataProcessed = (data: any) => {
    setProcessedData(data)
    setCurrentView("visualization")
  }

  const handleViewChart = (chart: any) => {
    setViewingChart(chart)
    setSelectedChartType(chart.chart_type)
    setProcessedData({
      chartData: chart.chart_data,
      config: chart.config,
      title: chart.title,
      description: chart.description,
      insights: chart.insights,
    })
    setCurrentView("visualization")
  }

  const handleCreateDiagram = () => {
    setCurrentView("diagram-selection")
    setSelectedDiagramType("")
    setProcessedDiagramData(null)
    setViewingDiagram(null)
  }

  const handleDiagramSelect = (diagramType: string) => {
    setSelectedDiagramType(diagramType)
    setCurrentView("diagram-input")
  }

  const handleDiagramProcessed = (data: any) => {
    setProcessedDiagramData(data)
    setCurrentView("diagram-visualization")
  }

  const handleViewDiagram = (diagram: any) => {
    setViewingDiagram(diagram)
    setSelectedDiagramType(diagram.diagram_type)
    setProcessedDiagramData({
      mermaidCode: diagram.mermaid_code,
      title: diagram.title,
      description: diagram.description,
      diagramType: diagram.diagram_type,
    })
    setCurrentView("diagram-visualization")
  }

  const handleViewChange = (view: string) => {
    setCurrentView(view)
    if (view === "create") {
      handleCreateChart()
    } else if (view === "create-diagram") {
      handleCreateDiagram()
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
            <FileSpreadsheet className="w-7 h-7 text-white animate-pulse" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Loading Rechart</h2>
            <p className="text-gray-600">Preparing your workspace...</p>
          </div>
        </div>
      </div>
    )
  }

  // Landing page for non-authenticated users
  if (!user && currentView === "landing") {
    return (
      <>
        <LandingPage onGetStarted={handleGetStarted} onSignIn={() => setShowAuthModal(true)} />
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </>
    )
  }

  // Authenticated user interface with sidebar
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar currentView={currentView} onViewChange={handleViewChange} />

      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8">
          {currentView === "dashboard" && (
            <DashboardOverview onCreateChart={handleCreateChart} onViewChart={handleViewChart} />
          )}

          {currentView === "charts" && <ChartsList onViewChart={handleViewChart} onCreateChart={handleCreateChart} />}

          {currentView === "chart-selection" && <ChartSelector onChartSelect={handleChartSelect} />}

          {currentView === "data-input" && (
            <DataInput chartType={selectedChartType} onDataProcessed={handleDataProcessed} />
          )}

          {currentView === "visualization" && (
            <ChartRenderer
              chartType={selectedChartType}
              data={processedData}
              onStartOver={() => setCurrentView("dashboard")}
              savedChart={viewingChart}
            />
          )}

          {currentView === "diagram-selection" && <DiagramSelector onDiagramSelect={handleDiagramSelect} />}

          {currentView === "diagram-input" && (
            <DiagramInput diagramType={selectedDiagramType} onDiagramProcessed={handleDiagramProcessed} />
          )}

          {currentView === "diagram-visualization" && (
            <DiagramRenderer
              diagramType={selectedDiagramType}
              data={processedDiagramData}
              onStartOver={() => setCurrentView("dashboard")}
              savedDiagram={viewingDiagram}
            />
          )}

          {currentView === "diagrams" && (
            <DiagramsList onViewDiagram={handleViewDiagram} onCreateDiagram={handleCreateDiagram} />
          )}
        </div>
      </main>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  )
}
