"use client"

import { useAuth } from "@/lib/auth-context"
import { useEffect, useState } from "react"
import Link from "next/link"
import { api } from "@/lib/api"
import {
  FileText,
  HelpCircle,
  Users,
  TrendingUp,
  Eye,
  Download,
  Plus,
  ArrowRight,
  ScrollText
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface Stats {
  totalQuizzes: number
  totalPapers: number
  totalPosts: number
  totalUsers: number
  recentActivity: Array<{
    type: string
    title: string
    date: string
  }>
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<Stats>({
    totalQuizzes: 0,
    totalPapers: 0,
    totalPosts: 0,
    totalUsers: 0,
    recentActivity: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch counts from API
        const [quizzesRes, papersRes, postsRes] = await Promise.all([
          api.getQuizzes({ limit: "1" }),
          api.getPastPapers({ limit: "1" }),
          api.getPosts({ limit: "1" })
        ])
        
        setStats({
          totalQuizzes: (quizzesRes.data as { pagination?: { total?: number } })?.pagination?.total || 0,
          totalPapers: (papersRes.data as { pagination?: { total?: number } })?.pagination?.total || 0,
          totalPosts: (postsRes.data as { pagination?: { total?: number } })?.pagination?.total || 0,
          totalUsers: 0,
          recentActivity: [
            { type: "quiz", title: "Cell Biology Quiz", date: "2 hours ago" },
            { type: "paper", title: "Cambridge 2024 Paper 2", date: "5 hours ago" },
            { type: "post", title: "Study Tips for IGCSE", date: "1 day ago" },
          ]
        })
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const statCards = [
    { label: "Total Quizzes", value: stats.totalQuizzes, icon: HelpCircle, color: "text-green-500", bg: "bg-green-500/10", href: "/dashboard/quizzes" },
    { label: "Past Papers", value: stats.totalPapers, icon: ScrollText, color: "text-blue-500", bg: "bg-blue-500/10", href: "/dashboard/past-papers" },
    { label: "Posts", value: stats.totalPosts, icon: FileText, color: "text-purple-500", bg: "bg-purple-500/10", href: "/dashboard/posts" },
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-orange-500", bg: "bg-orange-500/10", href: "/dashboard/users" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user?.firstName}! 👋</h1>
          <p className="text-muted-foreground">Here's what's happening with your platform</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/dashboard/quizzes/new"><Plus className="h-4 w-4 mr-2" />New Quiz</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/posts/new"><Plus className="h-4 w-4 mr-2" />New Post</Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Link key={stat.label} href={stat.href} className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
            <div className="text-2xl font-bold">{loading ? "..." : stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
          <div className="space-y-4">
            {stats.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    activity.type === "quiz" ? "bg-green-500/10" : 
                    activity.type === "paper" ? "bg-blue-500/10" : "bg-purple-500/10"
                  }`}>
                    {activity.type === "quiz" ? <HelpCircle className="h-4 w-4 text-green-500" /> :
                     activity.type === "paper" ? <ScrollText className="h-4 w-4 text-blue-500" /> :
                     <FileText className="h-4 w-4 text-purple-500" />}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{activity.title}</div>
                    <div className="text-xs text-muted-foreground">{activity.date}</div>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/dashboard/quizzes/new">
                <HelpCircle className="h-4 w-4 mr-2" />Create Quiz
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/dashboard/past-papers/new">
                <ScrollText className="h-4 w-4 mr-2" />Upload Past Paper
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/dashboard/posts/new">
                <FileText className="h-4 w-4 mr-2" />Write Post
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/dashboard/users">
                <Users className="h-4 w-4 mr-2" />Manage Users
              </Link>
            </Button>
          </div>

          {/* Platform Stats */}
          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="text-sm font-medium mb-3">Platform Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Eye className="h-4 w-4" /> Total Views
                </span>
                <span className="font-medium">12,450</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Download className="h-4 w-4" /> Downloads
                </span>
                <span className="font-medium">3,280</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" /> Growth
                </span>
                <span className="font-medium text-green-500">+12%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
