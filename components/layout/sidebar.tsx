"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  BarChart3,
  Plus,
  Home,
  Settings,
  HelpCircle,
  LogOut,
  User,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  Network,
  GitBranch,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  currentView: string
  onViewChange: (view: string) => void
}

export default function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const { user, signOut } = useAuth()

  const navigation = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: Home,
      description: "Overview & analytics",
    },
    {
      id: "create",
      name: "Create Chart",
      icon: Plus,
      description: "New visualization",
      highlight: true,
    },
    {
      id: "charts",
      name: "My Charts",
      icon: BarChart3,
      description: "Saved charts",
    },
    {
      id: "create-diagram",
      name: "Create Diagram",
      icon: Network,
      description: "New diagram",
    },
    {
      id: "diagrams",
      name: "My Diagrams",
      icon: GitBranch,
      description: "Saved diagrams",
    },
  ]

  const handleSignOut = async () => {
    await signOut()
    onViewChange("landing")
  }

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-white border-r border-gray-200 transition-all duration-300 shadow-sm",
        collapsed ? "w-16" : "w-72",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        {!collapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <FileSpreadsheet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Rechart</h1>
              <p className="text-xs text-gray-500 font-medium">Professional</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 p-0 hover:bg-gray-100"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = currentView === item.id
          return (
            <div key={item.id} className="relative">
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start h-12 relative group",
                  isActive
                    ? "bg-green-600 text-white hover:bg-green-700 shadow-md"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                  collapsed && "px-3",
                  item.highlight && !isActive && "ring-2 ring-green-200 bg-green-50 hover:bg-green-100",
                )}
                onClick={() => onViewChange(item.id)}
              >
                <Icon className={cn("w-5 h-5 shrink-0", !collapsed && "mr-3")} />
                {!collapsed && (
                  <div className="flex-1 text-left">
                    <div className="font-medium">{item.name}</div>
                    <div className={cn("text-xs opacity-75", isActive ? "text-green-100" : "text-gray-500")}>
                      {item.description}
                    </div>
                  </div>
                )}
              </Button>

              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {item.name}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* User Menu */}
      {user && (
        <div className="p-4 border-t border-gray-100">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn("w-full justify-start h-14 p-3 hover:bg-gray-100", collapsed && "justify-center")}
              >
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarFallback className="bg-green-100 text-green-600 text-sm font-semibold">
                    {user.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="ml-3 text-left flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{user.email?.split("@")[0]}</p>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <p className="text-xs text-gray-500">Free Plan</p>
                    </div>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user.email}</p>
                <p className="text-xs text-gray-500">Free Plan</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="w-4 h-4 mr-2" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                Preferences
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HelpCircle className="w-4 h-4 mr-2" />
                Help & Support
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  )
}
