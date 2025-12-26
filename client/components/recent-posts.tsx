"use client"

import Link from "next/link"
import { ArrowRight, Calendar, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"

interface Post {
  _id: string
  title: string
  content: string
  topic?: string
  level: string
  createdAt: string
}

export function RecentPosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await api.getPosts({ limit: "3" })
        setPosts((response.data as { posts: Post[] })?.posts || [])
      } catch (err) {
        console.error("Failed to fetch posts:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  // Fallback data if API fails or no posts
  const fallbackPosts = [
    { _id: "1", title: "Understanding Cell Division: Mitosis vs Meiosis", content: "A comprehensive guide to understanding the key differences between mitosis and meiosis, with exam tips.", createdAt: new Date().toISOString(), topic: "Cell Biology", level: "igcse" },
    { _id: "2", title: "Photosynthesis: Key Concepts for IGCSE", content: "Master the light-dependent and light-independent reactions with this detailed breakdown.", createdAt: new Date().toISOString(), topic: "Plant Biology", level: "igcse" },
    { _id: "3", title: "Human Circulatory System Explained", content: "Everything you need to know about the heart, blood vessels, and blood for your IGCSE exam.", createdAt: new Date().toISOString(), topic: "Human Biology", level: "igcse" },
  ]

  const displayPosts = posts.length > 0 ? posts : fallbackPosts

  return (
    <section className="py-20 px-6 bg-card/50">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold mb-2">Latest Posts</h2>
            <p className="text-muted-foreground">Tips, guides, and exam preparation resources</p>
          </div>
          <Button asChild variant="ghost" className="gap-2 hidden md:flex">
            <Link href="/posts">
              View all posts
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {displayPosts.map((post) => (
              <Link
                key={post._id}
                href={`/posts/${post._id}`}
                className="group bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all hover:-translate-y-1"
              >
                <div className="text-xs text-primary font-medium mb-3">{post.topic || post.level}</div>
                <h3 className="font-semibold text-lg mb-3 group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {post.content.substring(0, 100)}...
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {formatDate(post.createdAt)}
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8 text-center md:hidden">
          <Button asChild variant="ghost" className="gap-2">
            <Link href="/posts">
              View all posts
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
