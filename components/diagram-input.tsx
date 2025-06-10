"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Upload, MessageSquare, FileText, Loader2, Code, Lightbulb } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface DiagramInputProps {
  diagramType: string
  onDiagramProcessed: (data: any) => void
}

const diagramExamples = {
  flowchart: `graph TD
    A[Start] --> B{Decision?}
    B -->|Yes| C[Process A]
    B -->|No| D[Process B]
    C --> E[End]
    D --> E`,
  mindmap: `mindmap
  root((Central Idea))
    Branch 1
      Sub-idea 1
      Sub-idea 2
    Branch 2
      Sub-idea 3
      Sub-idea 4`,
  orgchart: `graph TD
    CEO[CEO] --> CTO[CTO]
    CEO --> CFO[CFO]
    CTO --> Dev1[Developer 1]
    CTO --> Dev2[Developer 2]
    CFO --> Acc1[Accountant]`,
  sequence: `sequenceDiagram
    participant A as User
    participant B as System
    A->>B: Login Request
    B->>A: Authentication
    A->>B: Data Request
    B->>A: Data Response`,
  network: `graph LR
    A[Server] --> B[Router]
    B --> C[Switch]
    C --> D[Computer 1]
    C --> E[Computer 2]`,
  gantt: `gantt
    title Project Timeline
    dateFormat YYYY-MM-DD
    section Phase 1
    Task 1: 2024-01-01, 30d
    Task 2: after task1, 20d
    section Phase 2
    Task 3: 2024-02-15, 25d`,
  gitgraph: `gitGraph
    commit
    branch develop
    checkout develop
    commit
    commit
    checkout main
    merge develop`,
  journey: `journey
    title User Shopping Journey
    section Discovery
      Visit Website: 5: User
      Browse Products: 4: User
    section Purchase
      Add to Cart: 3: User
      Checkout: 2: User
      Payment: 1: User`,
}

export default function DiagramInput({ diagramType, onDiagramProcessed }: DiagramInputProps) {
  const [apiStatus, setApiStatus] = useState<"checking" | "available" | "unavailable">("checking")
  const [isProcessing, setIsProcessing] = useState(false)
  const [chatInput, setChatInput] = useState("")
  const [mermaidCode, setMermaidCode] = useState(diagramExamples[diagramType as keyof typeof diagramExamples] || "")
  const [error, setError] = useState("")
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Check if API is available
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        setApiStatus(data.xaiConfigured ? "available" : "unavailable")
      })
      .catch(() => {
        setApiStatus("unavailable")
      })
  }, [])

  useEffect(() => {
    // Update example when diagram type changes
    setMermaidCode(diagramExamples[diagramType as keyof typeof diagramExamples] || "")
  }, [diagramType])

  const processDiagramWithAI = async (description: string) => {
    setIsProcessing(true)
    setError("")

    try {
      const response = await fetch("/api/process-diagram", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description,
          diagramType,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to process diagram description")
      }

      const result = await response.json()
      onDiagramProcessed(result.processedData)
    } catch (err) {
      setError("Failed to process diagram description. Please try again.")
      console.error("Error processing diagram:", err)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleChatSubmit = () => {
    if (!chatInput.trim()) return
    processDiagramWithAI(chatInput)
  }

  const handleMermaidSubmit = () => {
    if (!mermaidCode.trim()) return

    const processedData = {
      mermaidCode: mermaidCode.trim(),
      title: `${diagramType.charAt(0).toUpperCase() + diagramType.slice(1)} Diagram`,
      description: `Custom ${diagramType} diagram`,
      diagramType,
    }

    onDiagramProcessed(processedData)
  }

  const handleFileUpload = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setMermaidCode(content)
    }
    reader.readAsText(file)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFileUpload(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      handleFileUpload(files[0])
    }
  }

  const loadExample = () => {
    setMermaidCode(diagramExamples[diagramType as keyof typeof diagramExamples] || "")
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Create Your Diagram</h2>
        <p className="text-lg text-gray-600">
          Describe your diagram, write Mermaid code, or upload a file to get started
        </p>
      </div>

      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      {apiStatus === "unavailable" && (
        <Alert className="mb-6 border-yellow-200 bg-yellow-50">
          <AlertDescription className="text-yellow-700">
            AI processing is not available. You can still create diagrams using Mermaid syntax.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="describe" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="describe" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Describe
          </TabsTrigger>
          <TabsTrigger value="code" className="flex items-center gap-2">
            <Code className="w-4 h-4" />
            Mermaid Code
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload File
          </TabsTrigger>
        </TabsList>

        <TabsContent value="describe">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Describe Your Diagram
              </CardTitle>
              <CardDescription>Tell the AI what you want to visualize in natural language</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder={`Example: Create a ${diagramType} showing the process of user registration, including email verification and account setup steps.`}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                rows={6}
                className="resize-none"
              />
              <Button
                onClick={handleChatSubmit}
                disabled={!chatInput.trim() || isProcessing || apiStatus === "unavailable"}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Generate Diagram"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="code">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                Mermaid Code Editor
              </CardTitle>
              <CardDescription>
                Write or edit Mermaid syntax directly
                <Button variant="link" onClick={loadExample} className="ml-2 p-0 h-auto">
                  <Lightbulb className="w-4 h-4 mr-1" />
                  Load Example
                </Button>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter your Mermaid diagram code here..."
                value={mermaidCode}
                onChange={(e) => setMermaidCode(e.target.value)}
                rows={12}
                className="resize-none font-mono text-sm"
              />
              <Button
                onClick={handleMermaidSubmit}
                disabled={!mermaidCode.trim()}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Create Diagram
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Upload Mermaid File
              </CardTitle>
              <CardDescription>Upload a .mmd or .txt file containing Mermaid code</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive ? "border-green-400 bg-green-50" : "border-gray-300 hover:border-green-400"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">Drop your Mermaid file here</p>
                <p className="text-gray-500 mb-4">or</p>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="border-green-600 text-green-600 hover:bg-green-50"
                >
                  Browse Files
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".mmd,.txt,.md"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
              {mermaidCode && (
                <div className="mt-4">
                  <Button onClick={handleMermaidSubmit} className="w-full bg-green-600 hover:bg-green-700">
                    Create Diagram from File
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {isProcessing && (
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 text-green-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>AI is creating your diagram...</span>
          </div>
        </div>
      )}
    </div>
  )
}
