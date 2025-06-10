"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, Save, Code, Share2 } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { supabase } from "@/lib/supabase"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import ExportShareModal from "@/components/export-share-modal"
import mermaid from "mermaid"

interface DiagramRendererProps {
  diagramType: string
  data: any
  onStartOver: () => void
  savedDiagram?: any
}

export default function DiagramRenderer({ diagramType, data, onStartOver, savedDiagram }: DiagramRendererProps) {
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [saveTitle, setSaveTitle] = useState(data?.title || "")
  const [saveDescription, setSaveDescription] = useState(data?.description || "")
  const [saving, setSaving] = useState(false)
  const [showCode, setShowCode] = useState(false)
  const [diagramError, setDiagramError] = useState("")
  const diagramRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()

  useEffect(() => {
    // Initialize Mermaid
    mermaid.initialize({
      startOnLoad: false,
      theme: "default",
      securityLevel: "loose",
      fontFamily: "Inter, system-ui, sans-serif",
    })

    renderDiagram()
  }, [data])

  const renderDiagram = async () => {
    if (!diagramRef.current || !data?.mermaidCode) return

    try {
      setDiagramError("")

      // Clear previous content
      diagramRef.current.innerHTML = ""

      // Generate unique ID for this diagram
      const diagramId = `diagram-${Date.now()}`

      // Validate and render the diagram
      const { svg } = await mermaid.render(diagramId, data.mermaidCode)

      // Insert the SVG
      diagramRef.current.innerHTML = svg

      // Style the SVG
      const svgElement = diagramRef.current.querySelector("svg")
      if (svgElement) {
        svgElement.style.maxWidth = "100%"
        svgElement.style.height = "auto"
        svgElement.style.display = "block"
        svgElement.style.margin = "0 auto"
      }
    } catch (error) {
      console.error("Error rendering diagram:", error)
      setDiagramError("Failed to render diagram. Please check your Mermaid syntax.")
      diagramRef.current.innerHTML = `
        <div class="text-center text-red-600 p-8">
          <p class="font-medium">Error rendering diagram</p>
          <p class="text-sm mt-2">Please check your Mermaid syntax and try again.</p>
        </div>
      `
    }
  }

  const handleSaveDiagram = async () => {
    if (!user) return

    setSaving(true)
    try {
      const diagramData = {
        user_id: user.id,
        title: saveTitle,
        description: saveDescription || null,
        diagram_type: diagramType,
        mermaid_code: data.mermaidCode,
        diagram_data: data,
      }

      if (savedDiagram?.id) {
        // Update existing diagram
        const { error } = await supabase.from("diagrams").update(diagramData).eq("id", savedDiagram.id)
        if (error) throw error
      } else {
        // Create new diagram
        const { error } = await supabase.from("diagrams").insert([diagramData])
        if (error) throw error
      }

      setShowSaveDialog(false)
    } catch (error) {
      console.error("Error saving diagram:", error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Diagram</h2>
          <p className="text-lg text-gray-600">
            {data?.title || `${diagramType.charAt(0).toUpperCase() + diagramType.slice(1)} Diagram`}
          </p>
        </div>
        <div className="flex gap-3">
          {user && (
            <Button onClick={() => setShowSaveDialog(true)} className="bg-green-600 hover:bg-green-700">
              <Save className="w-4 h-4 mr-2" />
              {savedDiagram?.id ? "Update" : "Save"} Diagram
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => setShowCode(!showCode)}
            className="border-gray-600 text-gray-600 hover:bg-gray-50"
          >
            <Code className="w-4 h-4 mr-2" />
            {showCode ? "Hide" : "Show"} Code
          </Button>
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
            Create New
          </Button>
        </div>
      </div>

      {/* Code Panel */}
      {showCode && (
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg text-blue-800">Mermaid Code</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-white p-4 rounded-lg border text-sm overflow-x-auto">
              <code>{data.mermaidCode}</code>
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Diagram Display */}
      <Card className="border-gray-200 shadow-lg" ref={diagramRef}>
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <CardTitle className="text-xl text-gray-900">{data?.title || "Diagram Visualization"}</CardTitle>
          {data?.description && <CardDescription className="text-gray-600">{data.description}</CardDescription>}
        </CardHeader>
        <CardContent className="p-8">
          {diagramError ? (
            <div className="text-center text-red-600 p-8">
              <p className="font-medium">Error rendering diagram</p>
              <p className="text-sm mt-2">{diagramError}</p>
            </div>
          ) : (
            <div className="text-center min-h-[200px] flex items-center justify-center">
              <div className="text-gray-500">Loading diagram...</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{savedDiagram?.id ? "Update" : "Save"} Diagram</CardTitle>
              <CardDescription>Give your diagram a title and description</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="diagram-title">Title</Label>
                <Input
                  id="diagram-title"
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                  placeholder="Enter diagram title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="diagram-description">Description (optional)</Label>
                <Textarea
                  id="diagram-description"
                  value={saveDescription}
                  onChange={(e) => setSaveDescription(e.target.value)}
                  placeholder="Enter diagram description"
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleSaveDiagram}
                  disabled={!saveTitle.trim() || saving}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {saving ? "Saving..." : savedDiagram?.id ? "Update" : "Save"}
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
        elementRef={diagramRef}
        resourceId={savedDiagram?.id || ""}
        resourceType="diagram"
        title={data?.title || "Diagram"}
      />
    </div>
  )
}
