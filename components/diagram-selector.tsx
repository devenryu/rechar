"use client"

import { Network, GitBranch, Workflow, Users, Map, Zap, TreePine, Target } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface DiagramSelectorProps {
  onDiagramSelect: (diagramType: string) => void
}

const diagramTypes = [
  {
    id: "flowchart",
    name: "Flowchart",
    description: "Process flows and decision trees",
    icon: Workflow,
    color: "bg-blue-100 text-blue-600",
  },
  {
    id: "mindmap",
    name: "Mind Map",
    description: "Brainstorming and idea organization",
    icon: TreePine,
    color: "bg-purple-100 text-purple-600",
  },
  {
    id: "orgchart",
    name: "Organization Chart",
    description: "Company structure and hierarchy",
    icon: Users,
    color: "bg-orange-100 text-orange-600",
  },
  {
    id: "sequence",
    name: "Sequence Diagram",
    description: "System interactions over time",
    icon: Zap,
    color: "bg-yellow-100 text-yellow-600",
  },
  {
    id: "network",
    name: "Network Diagram",
    description: "System architecture and connections",
    icon: Network,
    color: "bg-green-100 text-green-600",
  },
  {
    id: "gantt",
    name: "Gantt Chart",
    description: "Project timelines and schedules",
    icon: Target,
    color: "bg-red-100 text-red-600",
  },
  {
    id: "gitgraph",
    name: "Git Graph",
    description: "Version control branching",
    icon: GitBranch,
    color: "bg-indigo-100 text-indigo-600",
  },
  {
    id: "journey",
    name: "User Journey",
    description: "User experience mapping",
    icon: Map,
    color: "bg-pink-100 text-pink-600",
  },
]

export default function DiagramSelector({ onDiagramSelect }: DiagramSelectorProps) {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Diagram Type</h2>
        <p className="text-lg text-gray-600">Select the visualization that best represents your process or structure</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {diagramTypes.map((diagram) => {
          const IconComponent = diagram.icon
          return (
            <Card
              key={diagram.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 border-gray-200 hover:border-green-300 group"
              onClick={() => onDiagramSelect(diagram.id)}
            >
              <CardHeader className="text-center pb-4">
                <div
                  className={`w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 ${diagram.color} group-hover:scale-110 transition-transform duration-200`}
                >
                  <IconComponent className="w-8 h-8" />
                </div>
                <CardTitle className="text-lg">{diagram.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-center pt-0">
                <CardDescription className="mb-4">{diagram.description}</CardDescription>
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
