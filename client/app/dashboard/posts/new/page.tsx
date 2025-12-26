"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { toast } from "@/lib/toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Upload, X, Image, Loader2, Calendar, Search, Tag } from "lucide-react"
import Link from "next/link"

export default function NewPostPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [mediaFiles, setMediaFiles] = useState<File[]>([])
  const [featuredImage, setFeaturedImage] = useState<File | null>(null)
  const [showSchedule, setShowSchedule] = useState(false)
  const [tagInput, setTagInput] = useState("")
  const [post, setPost] = useState({
    title: "",
    content: "",
    excerpt: "",
    topic: "",
    tags: [] as string[],
    targetAudience: "all",
    board: "all",
    level: "all",
    scheduledAt: "",
    metaTitle: "",
    metaDescription: ""
  })

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    setMediaFiles([...mediaFiles, ...files])
  }

  function removeFile(index: number) {
    setMediaFiles(mediaFiles.filter((_, i) => i !== index))
  }

  function addTag() {
    const tag = tagInput.trim()
    if (tag && !post.tags.includes(tag)) {
      setPost({ ...post, tags: [...post.tags, tag] })
      setTagInput("")
    }
  }

  function removeTag(tag: string) {
    setPost({ ...post, tags: post.tags.filter(t => t !== tag) })
  }

  async function handleSubmit(action: 'draft' | 'publish' | 'schedule') {
    if (!post.title || !post.content) {
      toast.warning("Please enter a title and content")
      return
    }
    if (action === 'schedule' && !post.scheduledAt) {
      toast.warning("Please select a schedule date")
      return
    }
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append("title", post.title)
      formData.append("content", post.content)
      if (post.excerpt) formData.append("excerpt", post.excerpt)
      formData.append("topic", post.topic)
      formData.append("tags", post.tags.join(","))
      formData.append("targetAudience", post.targetAudience)
      formData.append("board", post.board)
      formData.append("level", post.level)
      
      if (post.metaTitle) formData.append("metaTitle", post.metaTitle)
      if (post.metaDescription) formData.append("metaDescription", post.metaDescription)
      
      if (action === 'publish') {
        formData.append("isPublished", "true")
        formData.append("status", "published")
      } else if (action === 'schedule') {
        formData.append("scheduledAt", post.scheduledAt)
        formData.append("status", "scheduled")
      } else {
        formData.append("status", "draft")
      }
      
      mediaFiles.forEach(file => formData.append("media", file))
      if (featuredImage) formData.append("featuredImage", featuredImage)

      await api.createPost(formData)
      toast.success(
        action === 'publish' ? "Post published!" : 
        action === 'schedule' ? "Post scheduled!" : 
        "Draft saved!"
      )
      router.push("/dashboard/posts")
    } catch {
      // Error handled by global handler
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/posts"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Create New Post</h1>
          <p className="text-muted-foreground">Write a blog post or announcement</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSubmit('draft')} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Save Draft
          </Button>
          <Button variant="outline" onClick={() => setShowSchedule(!showSchedule)} disabled={saving}>
            <Calendar className="h-4 w-4 mr-2" />Schedule
          </Button>
          <Button onClick={() => handleSubmit('publish')} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Publish
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  type="text"
                  value={post.title}
                  onChange={(e) => setPost({ ...post, title: e.target.value })}
                  className="w-full px-3 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter post title..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Content *</label>
                <textarea
                  value={post.content}
                  onChange={(e) => setPost({ ...post, content: e.target.value })}
                  className="w-full px-3 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[300px]"
                  placeholder="Write your post content here..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Excerpt (Optional)</label>
                <textarea
                  value={post.excerpt}
                  onChange={(e) => setPost({ ...post, excerpt: e.target.value })}
                  className="w-full px-3 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Brief summary for previews..."
                  rows={2}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground mt-1">{post.excerpt.length}/500</p>
              </div>
            </CardContent>
          </Card>

          {/* Media Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Media</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Featured Image</label>
                  {featuredImage ? (
                    <div className="relative inline-block">
                      <img src={URL.createObjectURL(featuredImage)} alt="" className="w-40 h-24 object-cover rounded-lg" />
                      <button onClick={() => setFeaturedImage(null)} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="w-40 h-24 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/50">
                      <Image className="h-6 w-6 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground mt-1">Add Featured</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => setFeaturedImage(e.target.files?.[0] || null)} />
                    </label>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Additional Media</label>
                  <div className="flex flex-wrap gap-3">
                    {mediaFiles.map((file, index) => (
                      <div key={index} className="relative group">
                        <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                          {file.type.startsWith("image/") ? (
                            <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-center p-2">
                              <Image className="h-6 w-6 mx-auto text-muted-foreground" />
                              <span className="text-xs text-muted-foreground truncate block">{file.name}</span>
                            </div>
                          )}
                        </div>
                        <button onClick={() => removeFile(index)} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <label className="w-24 h-24 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/50">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground mt-1">Add</span>
                      <input type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleFileChange} />
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2"><Search className="h-4 w-4" />SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Meta Title</label>
                <input
                  type="text"
                  value={post.metaTitle}
                  onChange={(e) => setPost({ ...post, metaTitle: e.target.value })}
                  className="w-full px-3 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="SEO title (defaults to post title)"
                  maxLength={70}
                />
                <p className="text-xs text-muted-foreground mt-1">{post.metaTitle.length}/70</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Meta Description</label>
                <textarea
                  value={post.metaDescription}
                  onChange={(e) => setPost({ ...post, metaDescription: e.target.value })}
                  className="w-full px-3 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Brief description for search engines..."
                  rows={2}
                  maxLength={160}
                />
                <p className="text-xs text-muted-foreground mt-1">{post.metaDescription.length}/160</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Schedule */}
          {showSchedule && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2"><Calendar className="h-4 w-4" />Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <input
                  type="datetime-local"
                  value={post.scheduledAt}
                  onChange={(e) => setPost({ ...post, scheduledAt: e.target.value })}
                  className="w-full px-3 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  min={new Date().toISOString().slice(0, 16)}
                />
                {post.scheduledAt && (
                  <Button className="w-full mt-3" onClick={() => handleSubmit('schedule')} disabled={saving}>
                    Schedule Post
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2"><Tag className="h-4 w-4" />Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-3 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Add tag..."
                />
                <Button size="sm" variant="outline" onClick={addTag}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {post.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-destructive"><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Topic</label>
                <input
                  type="text"
                  value={post.topic}
                  onChange={(e) => setPost({ ...post, topic: e.target.value })}
                  className="w-full px-3 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Study Tips"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Target Audience</label>
                <select
                  value={post.targetAudience}
                  onChange={(e) => setPost({ ...post, targetAudience: e.target.value })}
                  className="w-full px-3 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">Everyone</option>
                  <option value="students">Students Only</option>
                  <option value="parents">Parents Only</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Board</label>
                <select
                  value={post.board}
                  onChange={(e) => setPost({ ...post, board: e.target.value })}
                  className="w-full px-3 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Boards</option>
                  <option value="cambridge">Cambridge</option>
                  <option value="edexcel">Edexcel</option>
                  <option value="oxford">Oxford</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Level</label>
                <select
                  value={post.level}
                  onChange={(e) => setPost({ ...post, level: e.target.value })}
                  className="w-full px-3 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Levels</option>
                  <option value="igcse">IGCSE</option>
                  <option value="olevel">O Level</option>
                  <option value="alevel">A Level</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
