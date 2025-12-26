"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Loader2,
  FileText,
  Clock,
  Calendar
} from "lucide-react"

interface Post {
  _id: string
  title: string
  content: string
  topic: string
  targetAudience: string
  board: string
  level: string
  status: string
  isPublished: boolean
  views: number
  readingTime: number
  scheduledAt?: string
  createdAt: string
  createdBy: { firstName: string; lastName: string }
}

const statusColors: Record<string, string> = {
  draft: "bg-gray-500",
  scheduled: "bg-blue-500",
  published: "bg-green-500",
  archived: "bg-yellow-500"
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<string>("all")
  const [actionMenu, setActionMenu] = useState<string | null>(null)

  useEffect(() => {
    fetchPosts()
  }, [])

  async function fetchPosts() {
    try {
      const res = await api.getPosts({ limit: "50" })
      setPosts((res.data as { posts: Post[] })?.posts || [])
    } catch (error) {
      console.error("Failed to fetch posts:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this post?")) return
    try {
      await api.deletePost(id)
      setPosts(posts.filter(p => p._id !== id))
    } catch (error) {
      console.error("Failed to delete post:", error)
    }
  }

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(search.toLowerCase()) ||
                          post.topic?.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === "all" || 
                          post.status === filter ||
                          (filter === "published" && post.isPublished) ||
                          (filter === "draft" && !post.isPublished && post.status !== "scheduled")
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Posts</h1>
          <p className="text-muted-foreground">Create and manage blog posts and announcements</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/posts/new"><Plus className="h-4 w-4 mr-2" />New Post</Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "draft", "scheduled", "published", "archived"].map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="bg-card border border-border rounded-xl text-center py-12">
          <p className="text-muted-foreground mb-4">No posts found</p>
          <Button asChild>
            <Link href="/dashboard/posts/new">Create your first post</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <div key={post._id} className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-purple-500/10 rounded-lg hidden sm:block">
                  <FileText className="h-5 w-5 text-purple-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-medium line-clamp-1">{post.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {post.content?.replace(/<[^>]*>/g, '').substring(0, 150)}...
                      </p>
                    </div>
                    <div className="relative flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setActionMenu(actionMenu === post._id ? null : post._id)}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                      {actionMenu === post._id && (
                        <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg py-1 z-10 min-w-[140px]">
                          <Link
                            href={`/posts/${post._id}`}
                            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
                            onClick={() => setActionMenu(null)}
                          >
                            <Eye className="h-4 w-4" /> View
                          </Link>
                          <Link
                            href={`/dashboard/posts/${post._id}/edit`}
                            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
                            onClick={() => setActionMenu(null)}
                          >
                            <Edit className="h-4 w-4" /> Edit
                          </Link>
                          <button
                            onClick={() => { handleDelete(post._id); setActionMenu(null) }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted text-destructive"
                          >
                            <Trash2 className="h-4 w-4" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    {post.topic && <span className="text-xs px-2 py-1 bg-muted rounded">{post.topic}</span>}
                    <span className="text-xs px-2 py-1 bg-muted rounded">{post.targetAudience}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Eye className="h-3 w-3" /> {post.views}
                    </span>
                    {post.readingTime > 0 && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {post.readingTime} min
                      </span>
                    )}
                    <Badge variant="secondary" className={`text-xs text-white ${statusColors[post.status] || statusColors.draft}`}>
                      {post.status || (post.isPublished ? 'published' : 'draft')}
                    </Badge>
                    {post.scheduledAt && post.status === 'scheduled' && (
                      <span className="text-xs text-blue-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {new Date(post.scheduledAt).toLocaleDateString()}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground ml-auto">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
