"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Loader2
} from "lucide-react"

interface Quiz {
  _id: string
  title: string
  topic: string
  level: string
  board: string
  duration: number
  totalPoints: number
  isPublished: boolean
  isDraft: boolean
  createdAt: string
  questions: string[]
}

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all")
  const [actionMenu, setActionMenu] = useState<string | null>(null)

  useEffect(() => {
    fetchQuizzes()
  }, [])

  async function fetchQuizzes() {
    try {
      const res = await api.getQuizzes({ limit: "50" })
      setQuizzes((res.data as { quizzes: Quiz[] })?.quizzes || [])
    } catch (error) {
      console.error("Failed to fetch quizzes:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this quiz?")) return
    try {
      await api.deleteQuiz(id)
      setQuizzes(quizzes.filter(q => q._id !== id))
    } catch (error) {
      console.error("Failed to delete quiz:", error)
    }
  }

  async function handlePublish(id: string) {
    try {
      await api.publishQuiz(id)
      fetchQuizzes()
    } catch (error) {
      console.error("Failed to publish quiz:", error)
    }
  }

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(search.toLowerCase()) ||
                          quiz.topic?.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === "all" || 
                          (filter === "published" && quiz.isPublished) ||
                          (filter === "draft" && !quiz.isPublished)
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Quizzes</h1>
          <p className="text-muted-foreground">Create and manage quizzes for students</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/quizzes/new"><Plus className="h-4 w-4 mr-2" />Create Quiz</Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search quizzes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "published", "draft"] as const).map((f) => (
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

      {/* Quizzes Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No quizzes found</p>
            <Button asChild>
              <Link href="/dashboard/quizzes/new">Create your first quiz</Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium">Title</th>
                  <th className="text-left px-4 py-3 text-sm font-medium hidden md:table-cell">Topic</th>
                  <th className="text-left px-4 py-3 text-sm font-medium hidden lg:table-cell">Level</th>
                  <th className="text-left px-4 py-3 text-sm font-medium hidden lg:table-cell">Questions</th>
                  <th className="text-left px-4 py-3 text-sm font-medium">Status</th>
                  <th className="text-right px-4 py-3 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredQuizzes.map((quiz) => (
                  <tr key={quiz._id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="font-medium">{quiz.title}</div>
                      <div className="text-xs text-muted-foreground md:hidden">{quiz.topic}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">{quiz.topic || "-"}</td>
                    <td className="px-4 py-3 text-sm hidden lg:table-cell">
                      <span className="px-2 py-1 bg-muted rounded text-xs">{quiz.level || "-"}</span>
                    </td>
                    <td className="px-4 py-3 text-sm hidden lg:table-cell">{quiz.questions?.length || 0}</td>
                    <td className="px-4 py-3">
                      {quiz.isPublished ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-500 rounded text-xs">
                          <CheckCircle className="h-3 w-3" /> Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/10 text-yellow-500 rounded text-xs">
                          <XCircle className="h-3 w-3" /> Draft
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1 relative">
                        <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                          <Link href={`/dashboard/quizzes/${quiz._id}`}><Eye className="h-4 w-4" /></Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                          <Link href={`/dashboard/quizzes/${quiz._id}/edit`}><Edit className="h-4 w-4" /></Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setActionMenu(actionMenu === quiz._id ? null : quiz._id)}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                        {actionMenu === quiz._id && (
                          <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg py-1 z-10 min-w-[140px]">
                            <button
                              onClick={() => { handlePublish(quiz._id); setActionMenu(null) }}
                              className="w-full px-4 py-2 text-sm text-left hover:bg-muted"
                            >
                              {quiz.isPublished ? "Unpublish" : "Publish"}
                            </button>
                            <button
                              onClick={() => { handleDelete(quiz._id); setActionMenu(null) }}
                              className="w-full px-4 py-2 text-sm text-left hover:bg-muted text-destructive"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
