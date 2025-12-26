"use client"

import { useState, useEffect, useCallback } from "react"
import { api } from "@/lib/api"
import { toast } from "@/lib/toast"
import {
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  Download,
  HelpCircle,
  FileText,
  ScrollText,
  Calendar,
  RefreshCw,
  Loader2,
  BarChart3,
  Activity
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface OverviewStats {
  totalViews: { value: number; change: number; trend: 'up' | 'down' }
  totalDownloads: { value: number; change: number; trend: 'up' | 'down' }
  newUsers: { value: number; change: number; trend: 'up' | 'down' }
  quizCompletions: { value: number; change: number; trend: 'up' | 'down' }
  totals: { users: number; quizzes: number; posts: number; papers: number }
}

interface TrafficData {
  date: string
  users: number
  submissions: number
  views: number
}

interface TopContent {
  id: string
  title: string
  type: 'quiz' | 'paper' | 'post'
  views: number
  engagement: number
  engagementLabel: string
  avgScore?: number
}

interface ActivityItem {
  type: string
  action: string
  user: string
  time: string
  timeFormatted: string
  details?: string
  score?: number
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [overview, setOverview] = useState<OverviewStats | null>(null)
  const [traffic, setTraffic] = useState<TrafficData[]>([])
  const [topContent, setTopContent] = useState<TopContent[]>([])
  const [activity, setActivity] = useState<ActivityItem[]>([])

  const fetchData = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true)
    else setLoading(true)

    try {
      const [overviewRes, trafficRes, contentRes, activityRes] = await Promise.all([
        api.getAnalyticsOverview(period),
        api.getAnalyticsTraffic(period),
        api.getAnalyticsTopContent(10),
        api.getAnalyticsActivity(10)
      ])

      if (overviewRes.data) setOverview(overviewRes.data as OverviewStats)
      if (trafficRes.data) setTraffic(trafficRes.data as TrafficData[])
      if (contentRes.data) setTopContent(contentRes.data as TopContent[])
      if (activityRes.data) setActivity(activityRes.data as ActivityItem[])
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [period])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleRefresh = () => {
    fetchData(true)
    toast.success('Analytics refreshed')
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toLocaleString()
  }

  const stats = overview ? [
    { 
      label: "Total Views", 
      value: formatNumber(overview.totalViews.value), 
      change: `${overview.totalViews.change >= 0 ? '+' : ''}${overview.totalViews.change}%`, 
      trend: overview.totalViews.trend, 
      icon: Eye 
    },
    { 
      label: "Downloads", 
      value: formatNumber(overview.totalDownloads.value), 
      change: `${overview.totalDownloads.change >= 0 ? '+' : ''}${overview.totalDownloads.change}%`, 
      trend: overview.totalDownloads.trend, 
      icon: Download 
    },
    { 
      label: "New Users", 
      value: formatNumber(overview.newUsers.value), 
      change: `${overview.newUsers.change >= 0 ? '+' : ''}${overview.newUsers.change}%`, 
      trend: overview.newUsers.trend, 
      icon: Users 
    },
    { 
      label: "Quiz Completions", 
      value: formatNumber(overview.quizCompletions.value), 
      change: `${overview.quizCompletions.change >= 0 ? '+' : ''}${overview.quizCompletions.change}%`, 
      trend: overview.quizCompletions.trend, 
      icon: HelpCircle 
    },
  ] : []

  // Calculate max value for chart scaling
  const maxTrafficValue = Math.max(...traffic.map(d => d.views), 1)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Track your platform performance</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div className="flex gap-1 bg-muted rounded-lg p-1">
              {(["7d", "30d", "90d"] as const).map((p) => (
                <Button
                  key={p}
                  variant={period === p ? "default" : "ghost"}
                  size="sm"
                  className="h-7 px-3"
                  onClick={() => setPeriod(p)}
                >
                  {p === "7d" ? "7 Days" : p === "30d" ? "30 Days" : "90 Days"}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      {overview && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-muted/30 rounded-xl">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{overview.totals.users}</div>
            <div className="text-xs text-muted-foreground">Total Users</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">{overview.totals.quizzes}</div>
            <div className="text-xs text-muted-foreground">Active Quizzes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">{overview.totals.papers}</div>
            <div className="text-xs text-muted-foreground">Past Papers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-500">{overview.totals.posts}</div>
            <div className="text-xs text-muted-foreground">Published Posts</div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <span className={`text-xs font-medium flex items-center gap-1 ${
                stat.trend === "up" ? "text-green-500" : "text-red-500"
              }`}>
                {stat.trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {stat.change}
              </span>
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Traffic Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Traffic Overview
            </h2>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-primary"></span>
                Views
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                Users
              </span>
            </div>
          </div>
          
          {traffic.length > 0 ? (
            <div className="h-64 flex items-end gap-1">
              {traffic.map((day, index) => (
                <div 
                  key={day.date} 
                  className="flex-1 flex flex-col items-center gap-1 group"
                  title={`${day.date}: ${day.views} views, ${day.users} users`}
                >
                  <div className="w-full flex flex-col gap-0.5" style={{ height: '200px' }}>
                    <div 
                      className="w-full bg-primary/80 rounded-t transition-all hover:bg-primary"
                      style={{ 
                        height: `${(day.views / maxTrafficValue) * 100}%`,
                        minHeight: day.views > 0 ? '4px' : '0'
                      }}
                    />
                  </div>
                  {(index % Math.ceil(traffic.length / 7) === 0 || index === traffic.length - 1) && (
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(day.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
              <div className="text-center text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No traffic data available</p>
              </div>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Recent Activity
          </h2>
          {activity.length > 0 ? (
            <div className="space-y-4 max-h-[280px] overflow-y-auto">
              {activity.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className={`h-2 w-2 rounded-full mt-2 ${
                    item.type === 'user_registered' ? 'bg-green-500' :
                    item.type === 'quiz_completed' ? 'bg-blue-500' :
                    'bg-primary'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{item.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.user} • {item.timeFormatted}
                    </p>
                    {item.details && (
                      <p className="text-xs text-muted-foreground truncate">{item.details}</p>
                    )}
                  </div>
                  {item.score !== undefined && (
                    <span className="text-xs font-medium text-green-500">{Math.round(item.score)}%</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent activity</p>
            </div>
          )}
        </div>
      </div>

      {/* Top Content */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Top Performing Content</h2>
        {topContent.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 text-sm font-medium">Content</th>
                  <th className="text-left py-3 text-sm font-medium">Type</th>
                  <th className="text-right py-3 text-sm font-medium">Views</th>
                  <th className="text-right py-3 text-sm font-medium">Engagement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {topContent.map((content) => (
                  <tr key={content.id} className="hover:bg-muted/30">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          content.type === "quiz" ? "bg-green-500/10" :
                          content.type === "paper" ? "bg-blue-500/10" : "bg-purple-500/10"
                        }`}>
                          {content.type === "quiz" ? <HelpCircle className="h-4 w-4 text-green-500" /> :
                           content.type === "paper" ? <ScrollText className="h-4 w-4 text-blue-500" /> :
                           <FileText className="h-4 w-4 text-purple-500" />}
                        </div>
                        <span className="font-medium text-sm truncate max-w-[200px]">{content.title}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="text-xs px-2 py-1 bg-muted rounded capitalize">{content.type}</span>
                    </td>
                    <td className="py-3 text-right text-sm">{content.views.toLocaleString()}</td>
                    <td className="py-3 text-right text-sm text-muted-foreground">
                      {content.engagement} {content.engagementLabel}
                      {content.avgScore !== undefined && (
                        <span className="ml-2 text-green-500">({content.avgScore}% avg)</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No content data available</p>
          </div>
        )}
      </div>
    </div>
  )
}
