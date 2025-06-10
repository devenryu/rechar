"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Upload, MessageSquare, FileText, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface DataInputProps {
  chartType: string
  onDataProcessed: (data: any) => void
}

export default function DataInput({ chartType, onDataProcessed }: DataInputProps) {
  const [apiStatus, setApiStatus] = useState<"checking" | "available" | "unavailable">("checking")
  const [isProcessing, setIsProcessing] = useState(false)
  const [chatInput, setChatInput] = useState("")
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

  const processDataWithAI = async (data: string, isCSV = false) => {
    setIsProcessing(true)
    setError("")

    try {
      const response = await fetch("/api/process-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data,
          chartType,
          isCSV,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to process data")
      }

      const result = await response.json()
      onDataProcessed(result.processedData)
    } catch (err) {
      setError("Failed to process data. Please try again.")
      console.error("Error processing data:", err)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleChatSubmit = () => {
    if (!chatInput.trim()) return
    processDataWithAI(chatInput, false)
  }

  const handleFileUpload = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const csvData = e.target?.result as string
      processDataWithAI(csvData, true)
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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Input Your Data</h2>
        <p className="text-lg text-gray-600">Upload a CSV file or describe your data in natural language</p>
      </div>

      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      {apiStatus === "unavailable" && (
        <Alert className="mb-6 border-yellow-200 bg-yellow-50">
          <AlertDescription className="text-yellow-700">
            AI processing is not available. The app will use basic data processing instead.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload CSV
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Describe Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Upload CSV File
              </CardTitle>
              <CardDescription>Drag and drop your CSV file or click to browse</CardDescription>
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
                <p className="text-lg font-medium text-gray-700 mb-2">Drop your CSV file here</p>
                <p className="text-gray-500 mb-4">or</p>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  className="border-green-600 text-green-600 hover:bg-green-50"
                >
                  Browse Files
                </Button>
                <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileSelect} className="hidden" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Describe Your Data
              </CardTitle>
              <CardDescription>Tell the AI about your data in natural language</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Example: I have sales data for 2023 with months (Jan, Feb, Mar...) and revenue values (10000, 15000, 12000...)"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                rows={6}
                className="resize-none"
              />
              <Button
                onClick={handleChatSubmit}
                disabled={!chatInput.trim() || isProcessing}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Process Data"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {isProcessing && (
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 text-green-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>AI is processing your data...</span>
          </div>
        </div>
      )}
    </div>
  )
}
