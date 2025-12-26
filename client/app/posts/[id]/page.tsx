"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { ArrowLeft, Calendar, Clock, Share2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { api } from "@/lib/api"

interface Post {
  _id: string
  title: string
  content: string
  topic?: string
  board: string
  level: string
  createdAt: string
  views: number
  createdBy?: {
    firstName: string
    lastName: string
  }
}

export default function PostPage() {
  const params = useParams()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPost() {
      try {
        const response = await api.getPost(params.id as string)
        setPost((response.data as { post: Post })?.post || null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load post")
      } finally {
        setLoading(false)
      }
    }
    if (params.id) {
      fetchPost()
    }
  }, [params.id])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-24 pb-16 px-6">
          <div className="max-w-3xl mx-auto flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-24 pb-16 px-6">
          <div className="max-w-3xl mx-auto text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
            <p className="text-muted-foreground mb-6">{error || "The post you're looking for doesn't exist."}</p>
            <Button asChild>
              <Link href="/posts">Back to Posts</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-24 pb-16 px-6">
        <article className="max-w-3xl mx-auto">
          <div className="mb-6">
            <Link
              href="/posts"
              className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Posts
            </Link>
          </div>

          <header className="mb-8">
            {post.topic && <span className="text-sm text-primary font-medium">{post.topic}</span>}
            <h1 className="text-3xl md:text-4xl font-bold mt-2 mb-4 text-balance">{post.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(post.createdAt)}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {post.views} views
              </div>
              {post.createdBy && (
                <span>By {post.createdBy.firstName} {post.createdBy.lastName}</span>
              )}
            </div>
          </header>

          <div className="prose prose-invert prose-headings:text-foreground prose-p:text-muted-foreground max-w-none">
            {post.content.split("\n").map((paragraph, index) => {
              if (!paragraph.trim()) return null
              if (paragraph.startsWith("## ")) {
                return (
                  <h2 key={index} className="text-2xl font-bold mt-8 mb-4 text-foreground">
                    {paragraph.replace("## ", "")}
                  </h2>
                )
              }
              if (paragraph.startsWith("### ")) {
                return (
                  <h3 key={index} className="text-xl font-semibold mt-6 mb-3 text-foreground">
                    {paragraph.replace("### ", "")}
                  </h3>
                )
              }
              return (
                <p key={index} className="text-muted-foreground leading-relaxed mb-4">
                  {paragraph}
                </p>
              )
            })}
          </div>

          <div className="mt-12 pt-8 border-t border-border flex items-center justify-between">
            <Button asChild variant="outline">
              <Link href="/posts">More Posts</Link>
            </Button>
            <Button variant="ghost" className="gap-2">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  )
}
