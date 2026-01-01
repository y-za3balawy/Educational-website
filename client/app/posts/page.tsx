"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { Calendar, Clock, ArrowRight, Loader2, Search } from "lucide-react"
import { useEffect, useState, useMemo } from "react"
import { api } from "@/lib/api"
import { Input } from "@/components/ui/input"

interface Post {
  _id: string
  title: string
  content: string
  topic?: string
  board: string
  level: string
  createdAt: string
  views: number
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")

  // Extract unique categories from posts
  const categories = useMemo(() => {
    const uniqueTopics = new Set<string>()
    posts.forEach(post => {
      if (post.topic) uniqueTopics.add(post.topic)
      if (post.board) uniqueTopics.add(post.board)
    })
    return ["All", ...Array.from(uniqueTopics)]
  }, [posts])

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true)
        const response = await api.getPosts({ limit: "50" })
        setPosts((response.data as { posts: Post[] })?.posts || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load posts")
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [])

  // Filter posts by category and search
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesCategory = selectedCategory === "All" || 
        post.topic === selectedCategory || 
        post.board === selectedCategory
      const matchesSearch = !searchQuery || 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.topic?.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [posts, selectedCategory, searchQuery])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4">Blog Posts</h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Study guides, exam tips, and explanations to help you succeed in your exams.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Categories */}
          {categories.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    category === selectedCategory
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">{error}</p>
              <p className="text-muted-foreground">Make sure the backend server is running</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchQuery || selectedCategory !== "All" 
                  ? "No posts found matching your criteria." 
                  : "No posts found. Check back later!"}
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredPosts.map((post) => (
                <Link
                  key={post._id}
                  href={`/posts/${post._id}`}
                  className="group bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all flex flex-col md:flex-row gap-6"
                >
                  <div className="flex-1">
                    <div className="text-xs text-primary font-medium mb-3">{post.topic || post.level}</div>
                    <h2 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-muted-foreground mb-4 line-clamp-2">
                      {post.content.substring(0, 150)}...
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(post.createdAt)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {post.views} views
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="text-primary flex items-center gap-1 text-sm font-medium group-hover:gap-2 transition-all">
                      Read more <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
