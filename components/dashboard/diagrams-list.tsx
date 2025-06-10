"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/auth/auth-provider"
import { supabase } from "@/lib/supabase"
import {
  Network,
  GitBranch,
  Workflow,
  Users,
  Map,
  Zap,
  TreePine,
  Target,
  Trash2,
  Eye,
  Search,
  Filter,
  Plus,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface SavedDiagram {
  id: string
  title: string
  description: string | null
  diagram_type: string
  mermaid_code: string
  diagram_data: any
  created_at: string
  updated_at: string
}

interface DiagramsListProps {
  onViewDiagram: (diagram: SavedDiagram) => void
  onCreateDiagram: () => void
}

const diagramIcons = {
  flowchart: Workflow,
  mindmap: TreePine,
  orgchart: Users,
  sequence: Zap,
  network: Network,
  gantt: Target,
  gitgraph: GitBranch,
  journey: Map,
}

export default function DiagramsList({ onViewDiagram, onCreateDiagram }: DiagramsListProps) {
  const [diagrams, setDiagrams] = useState<SavedDiagram[]>([])
  const [filteredDiagrams, setFilteredDiagrams] = useState<SavedDiagram[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchDiagrams()
    }
  }, [user])

  useEffect(() => {
    filterDiagrams()
  }, [diagrams, searchTerm, selectedType])

  const fetchDiagrams = async () => {
    try {
      const { data, error } = await supabase.from("diagrams").select("*").order("updated_at", { ascending: false })

      if (error) throw error
      setDiagrams(data || [])
    } catch (error) {
      console.error("Error fetching diagrams:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterDiagrams = () => {
    let filtered = diagrams

    if (searchTerm) {
      filtered = filtered.filter(
        (diagram) =>
          diagram.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          diagram.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedType !== "all") {
      filtered = filtered.filter((diagram) => diagram.diagram_type === selectedType)
    }

    setFilteredDiagrams(filtered)
  }

  const deleteDiagram = async (diagramId: string) => {
    try {
      const { error } = await supabase.from("diagrams").delete().eq("id", diagramId)

      if (error) throw error
      setDiagrams(diagrams.filter((diagram) => diagram.id !== diagramId))
    } catch (error) {
      console.error("Error deleting diagram:", error)
    }
  }

  const diagramTypes = ["all", ...new Set(diagrams.map((diagram) => diagram.diagram_type))]

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
          <h1 className="text-3xl font-bold text-gray-900">My Diagrams</h1>
          <p className="text-gray-600 mt-1">Manage and organize your process diagrams</p>
        </div>
        <Button onClick={onCreateDiagram} className="bg-green-600 hover:bg-green-700 shrink-0">
          <Plus className="w-4 h-4 mr-2" />
          Create Diagram
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search diagrams..."
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
            {diagramTypes.map((type) => (
              <option key={type} value={type}>
                {type === "all" ? "All Types" : `${type.charAt(0).toUpperCase() + type.slice(1)}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Diagrams Grid */}
      {filteredDiagrams.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Network className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {diagrams.length === 0 ? "No diagrams yet" : "No diagrams match your search"}
            </h3>
            <p className="text-gray-600 mb-6">
              {diagrams.length === 0
                ? "Create your first diagram to get started with process visualization"
                : "Try adjusting your search terms or filters"}
            </p>
            {diagrams.length === 0 && (
              <Button onClick={onCreateDiagram} className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Diagram
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDiagrams.map((diagram) => {
            const IconComponent = diagramIcons[diagram.diagram_type as keyof typeof diagramIcons] || Network
            return (
              <Card key={diagram.id} className="hover:shadow-lg transition-all duration-200 group">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shrink-0">
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-semibold truncate" title={diagram.title}>
                        {diagram.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {diagram.diagram_type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {diagram.description && (
                    <CardDescription className="mb-4 line-clamp-2" title={diagram.description}>
                      {diagram.description}
                    </CardDescription>
                  )}
                  <div className="text-sm text-gray-500 mb-4">
                    Updated {formatDistanceToNow(new Date(diagram.updated_at), { addSuffix: true })}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDiagram(diagram)}
                      className="flex-1 group-hover:border-blue-500 group-hover:text-blue-600"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteDiagram(diagram.id)}
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
