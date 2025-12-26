"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  FileText,
  HelpCircle,
  ScrollText,
  Users,
  Settings,
  ChevronLeft,
  TrendingUp,
  BarChart3,
  Plus,
  MessageSquare,
  Globe
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface AdminSidebarProps {
  collapsed?: boolean
  onToggle?: () => void
}

const menuItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Quizzes", href: "/dashboard/quizzes", icon: HelpCircle },
  { name: "Past Papers", href: "/dashboard/past-papers", icon: ScrollText },
  { name: "Posts", href: "/dashboard/posts", icon: FileText },
  { name: "Messages", href: "/dashboard/messages", icon: MessageSquare },
  { name: "Users", href: "/dashboard/users", icon: Users },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Site Settings", href: "/dashboard/site-settings", icon: Globe },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className={cn(
      "fixed left-0 top-0 z-40 h-screen bg-card border-r border-border transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Link href="/" className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            {!collapsed && <span className="font-semibold">Mr. Mahmoud Said</span>}
          </Link>
          <Button variant="ghost" size="icon" onClick={onToggle} className="h-8 w-8">
            <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
          </Button>
        </div>

        {/* Quick Actions */}
        {!collapsed && (
          <div className="p-4 border-b border-border">
            <p className="text-xs text-muted-foreground mb-2">Quick Actions</p>
            <div className="grid grid-cols-2 gap-2">
              <Button asChild size="sm" variant="outline" className="h-8 text-xs">
                <Link href="/dashboard/quizzes/new"><Plus className="h-3 w-3 mr-1" />Quiz</Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="h-8 text-xs">
                <Link href="/dashboard/posts/new"><Plus className="h-3 w-3 mr-1" />Post</Link>
              </Button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  collapsed && "justify-center px-2"
                )}
                title={collapsed ? item.name : undefined}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          {!collapsed && (
            <p className="text-xs text-muted-foreground text-center">
              Admin Dashboard v1.0
            </p>
          )}
        </div>
      </div>
    </aside>
  )
}
