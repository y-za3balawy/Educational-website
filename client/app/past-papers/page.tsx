"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { FileText, Download, Eye, Loader2, Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"

interface PastPaper {
  _id: string
  title: string
  year: number
  session: string
  board: string
  level: string
  subLevel?: string
  subject: string
  paperNumber?: string
  paperType: string
  paperUrl: string
  markSchemeUrl?: string
  viewCount: number
  downloadCount: number
}

export default function PastPapersPage() {
  const [papers, setPapers] = useState<PastPaper[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    subject: "all",
    board: "all",
    level: "all",
    subLevel: "all",
    session: "all",
    year: "all"
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    async function fetchPapers() {
      try {
        setLoading(true)
        const params: Record<string, string> = { limit: "100" }
        if (filters.subject !== "all") params.subject = filters.subject
        if (filters.board !== "all") params.board = filters.board
        if (filters.level !== "all") params.level = filters.level
        if (filters.subLevel !== "all") params.subLevel = filters.subLevel
        if (filters.session !== "all") params.session = filters.session
        if (filters.year !== "all") params.year = filters.year
        
        const response = await api.getPastPapers(params)
        setPapers((response.data as { papers: PastPaper[] })?.papers || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load past papers")
      } finally {
        setLoading(false)
      }
    }
    fetchPapers()
  }, [filters])

  const formatSession = (session: string) => session === "may" ? "May" : "January"
  const formatLevel = (level: string, subLevel?: string) => {
    if (level === "alevel") {
      return subLevel ? `A-Level (${subLevel.toUpperCase()})` : "A-Level"
    }
    return "O-Level"
  }

  const clearFilters = () => {
    setFilters({ subject: "all", board: "all", level: "all", subLevel: "all", session: "all", year: "all" })
  }

  const activeFilterCount = Object.values(filters).filter(v => v !== "all").length

  // Group papers by subject, then by level
  const groupedPapers = papers.reduce((acc, paper) => {
    const key = `${paper.subject}-${paper.level}${paper.subLevel ? `-${paper.subLevel}` : ''}`
    if (!acc[key]) acc[key] = { subject: paper.subject, level: paper.level, subLevel: paper.subLevel, papers: [] }
    acc[key].papers.push(paper)
    return acc
  }, {} as Record<string, { subject: string; level: string; subLevel?: string; papers: PastPaper[] }>)

  const years = [...new Set(papers.map(p => p.year))].sort((a, b) => b - a)

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Past Papers & Mark Schemes</h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Access Business and Economics past examination papers with detailed mark schemes for O-Level and A-Level preparation.
            </p>
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1">{activeFilterCount}</Badge>
              )}
            </Button>
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground">
                <X className="h-4 w-4" />Clear all
              </Button>
            )}
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-card border border-border rounded-xl p-4 mb-8">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1 text-muted-foreground">Subject</label>
                  <select
                    value={filters.subject}
                    onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-muted border-0 text-sm"
                  >
                    <option value="all">All Subjects</option>
                    <option value="business">Business</option>
                    <option value="economics">Economics</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-muted-foreground">Board</label>
                  <select
                    value={filters.board}
                    onChange={(e) => setFilters({ ...filters, board: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-muted border-0 text-sm"
                  >
                    <option value="all">All Boards</option>
                    <option value="cambridge">Cambridge</option>
                    <option value="edexcel">Edexcel</option>
                    <option value="oxford">Oxford</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-muted-foreground">Level</label>
                  <select
                    value={filters.level}
                    onChange={(e) => setFilters({ ...filters, level: e.target.value, subLevel: "all" })}
                    className="w-full px-3 py-2 rounded-lg bg-muted border-0 text-sm"
                  >
                    <option value="all">All Levels</option>
                    <option value="olevel">O-Level</option>
                    <option value="alevel">A-Level</option>
                  </select>
                </div>
                {filters.level === "alevel" && (
                  <div>
                    <label className="block text-xs font-medium mb-1 text-muted-foreground">A-Level Type</label>
                    <select
                      value={filters.subLevel}
                      onChange={(e) => setFilters({ ...filters, subLevel: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-muted border-0 text-sm"
                    >
                      <option value="all">AS & A2</option>
                      <option value="as">AS Level</option>
                      <option value="a2">A2 Level</option>
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium mb-1 text-muted-foreground">Session</label>
                  <select
                    value={filters.session}
                    onChange={(e) => setFilters({ ...filters, session: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-muted border-0 text-sm"
                  >
                    <option value="all">All Sessions</option>
                    <option value="may">May</option>
                    <option value="january">January</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-muted-foreground">Year</label>
                  <select
                    value={filters.year}
                    onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-muted border-0 text-sm"
                  >
                    <option value="all">All Years</option>
                    {[2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018].map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">{error}</p>
            </div>
          ) : papers.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border rounded-xl">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">No past papers found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your filters or check back later</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.values(groupedPapers).map((group) => (
                <div key={`${group.subject}-${group.level}-${group.subLevel}`}>
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-3">
                    <span className="capitalize">{group.subject}</span>
                    <Badge variant="outline">{formatLevel(group.level, group.subLevel)}</Badge>
                    <span className="h-px flex-1 bg-border"></span>
                    <span className="text-sm text-muted-foreground font-normal">{group.papers.length} papers</span>
                  </h2>

                  <div className="grid gap-3">
                    {group.papers.map((paper) => (
                      <div
                        key={paper._id}
                        className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium">{paper.title}</h3>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">{paper.board.toUpperCase()}</Badge>
                              <span className="text-sm text-muted-foreground">
                                {formatSession(paper.session)} {paper.year}
                              </span>
                              {paper.paperNumber && (
                                <span className="text-sm text-muted-foreground">• Paper {paper.paperNumber}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => window.open(paper.paperUrl, "_blank")}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="hidden sm:inline">Question Paper</span>
                            <span className="sm:hidden">Paper</span>
                          </Button>
                          {paper.markSchemeUrl && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2"
                              onClick={() => window.open(paper.markSchemeUrl, "_blank")}
                            >
                              <Download className="h-4 w-4" />
                              <span className="hidden sm:inline">Mark Scheme</span>
                              <span className="sm:hidden">MS</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
