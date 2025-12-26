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
  Download,
  FileText,
  CheckCircle,
  XCircle,
  Loader2
} from "lucide-react"

interface PastPaper {
  _id: string
  title: string
  year: number
  session: string
  board: string
  level: string
  subLevel?: string
  subject: string
  paperType: string
  paperUrl: string
  markSchemeUrl?: string
  isPublished: boolean
  viewCount: number
  downloadCount: number
  createdAt: string
}

export default function PastPapersPage() {
  const [papers, setPapers] = useState<PastPaper[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "published" | "draft">("all")
  const [filterSubject, setFilterSubject] = useState<string>("all")
  const [filterLevel, setFilterLevel] = useState<string>("all")
  const [actionMenu, setActionMenu] = useState<string | null>(null)

  useEffect(() => {
    fetchPapers()
  }, [])

  async function fetchPapers() {
    try {
      const res = await api.getPastPapers({ limit: "100" })
      setPapers((res.data as { papers: PastPaper[] })?.papers || [])
    } catch (error) {
      console.error("Failed to fetch papers:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this past paper?")) return
    try {
      await api.deletePastPaper(id)
      setPapers(papers.filter(p => p._id !== id))
    } catch (error) {
      console.error("Failed to delete paper:", error)
    }
  }

  const filteredPapers = papers.filter(paper => {
    const matchesSearch = paper.title.toLowerCase().includes(search.toLowerCase()) ||
                          paper.year.toString().includes(search)
    const matchesStatus = filterStatus === "all" || 
                          (filterStatus === "published" && paper.isPublished) ||
                          (filterStatus === "draft" && !paper.isPublished)
    const matchesSubject = filterSubject === "all" || paper.subject === filterSubject
    const matchesLevel = filterLevel === "all" || paper.level === filterLevel
    return matchesSearch && matchesStatus && matchesSubject && matchesLevel
  })

  const formatLevel = (level: string, subLevel?: string) => {
    if (level === "alevel") return subLevel ? `A-Level (${subLevel.toUpperCase()})` : "A-Level"
    return "O-Level"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Past Papers</h1>
          <p className="text-muted-foreground">Upload and manage past papers and mark schemes</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/past-papers/new"><Plus className="h-4 w-4 mr-2" />Upload Paper</Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search papers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <select
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
          className="px-3 py-2 bg-muted rounded-lg text-sm"
        >
          <option value="all">All Subjects</option>
          <option value="business">Business</option>
          <option value="economics">Economics</option>
        </select>
        <select
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
          className="px-3 py-2 bg-muted rounded-lg text-sm"
        >
          <option value="all">All Levels</option>
          <option value="olevel">O-Level</option>
          <option value="alevel">A-Level</option>
        </select>
        <div className="flex gap-2">
          {(["all", "published", "draft"] as const).map((f) => (
            <Button
              key={f}
              variant={filterStatus === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Papers Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredPapers.length === 0 ? (
        <div className="bg-card border border-border rounded-xl text-center py-12">
          <p className="text-muted-foreground mb-4">No past papers found</p>
          <Button asChild>
            <Link href="/dashboard/past-papers/new">Upload your first paper</Link>
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPapers.map((paper) => (
            <div key={paper._id} className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-500" />
                </div>
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setActionMenu(actionMenu === paper._id ? null : paper._id)}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                  {actionMenu === paper._id && (
                    <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg py-1 z-10 min-w-[140px]">
                      <Link
                        href={`/dashboard/past-papers/${paper._id}/edit`}
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
                        onClick={() => setActionMenu(null)}
                      >
                        <Edit className="h-4 w-4" /> Edit
                      </Link>
                      <button
                        onClick={() => { handleDelete(paper._id); setActionMenu(null) }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted text-destructive"
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <h3 className="font-medium mb-2 line-clamp-2">{paper.title}</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="secondary" className="text-xs capitalize">{paper.subject}</Badge>
                <Badge variant="outline" className="text-xs">{formatLevel(paper.level, paper.subLevel)}</Badge>
                <span className="text-xs px-2 py-1 bg-muted rounded">{paper.board.toUpperCase()}</span>
                <span className="text-xs px-2 py-1 bg-muted rounded">{paper.year}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {paper.viewCount}</span>
                <span className="flex items-center gap-1"><Download className="h-3 w-3" /> {paper.downloadCount}</span>
                {paper.isPublished ? (
                  <span className="flex items-center gap-1 text-green-500"><CheckCircle className="h-3 w-3" /> Published</span>
                ) : (
                  <span className="flex items-center gap-1 text-yellow-500"><XCircle className="h-3 w-3" /> Draft</span>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <a href={paper.paperUrl} target="_blank" rel="noopener noreferrer">
                    <FileText className="h-3 w-3 mr-1" /> Paper
                  </a>
                </Button>
                {paper.markSchemeUrl ? (
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <a href={paper.markSchemeUrl} target="_blank" rel="noopener noreferrer">
                      <FileText className="h-3 w-3 mr-1" /> MS
                    </a>
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link href={`/dashboard/past-papers/${paper._id}/mark-scheme`}>
                      <Plus className="h-3 w-3 mr-1" /> MS
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
