"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { toast } from "@/lib/toast"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Upload, FileText, X, Loader2 } from "lucide-react"
import Link from "next/link"

export default function NewPastPaperPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [paperFile, setPaperFile] = useState<File | null>(null)
  const [markSchemeFile, setMarkSchemeFile] = useState<File | null>(null)
  const [paper, setPaper] = useState({
    title: "",
    year: new Date().getFullYear(),
    session: "may",
    board: "cambridge",
    level: "olevel",
    subLevel: "",
    subject: "business",
    paperNumber: "",
    paperType: "theory",
    topics: "",
    isPublished: false
  })

  async function handleSubmit(publish: boolean = false) {
    if (!paper.title || !paperFile) {
      toast.warning("Please enter a title and upload a paper file")
      return
    }
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append("title", paper.title)
      formData.append("year", paper.year.toString())
      formData.append("session", paper.session)
      formData.append("board", paper.board)
      formData.append("level", paper.level)
      formData.append("subject", paper.subject)
      formData.append("paperType", paper.paperType)
      if (paper.paperNumber) formData.append("paperNumber", paper.paperNumber)
      if (paper.level === "alevel" && paper.subLevel) {
        formData.append("subLevel", paper.subLevel)
      }
      if (paper.topics) {
        const topicsArray = paper.topics.split(',').map(t => t.trim()).filter(Boolean)
        topicsArray.forEach(topic => formData.append("topics[]", topic))
      }
      formData.append("isPublished", publish.toString())
      formData.append("document", paperFile)

      const res = await api.createPastPaper(formData)
      
      const paperData = res.data as { paper?: { _id: string } } | undefined
      if (markSchemeFile && paperData?.paper?._id) {
        const msFormData = new FormData()
        msFormData.append("document", markSchemeFile)
        await api.uploadMarkScheme(paperData.paper._id, msFormData)
      }

      toast.success(publish ? "Past paper published!" : "Past paper saved as draft")
      router.push("/dashboard/past-papers")
    } catch {
      // Error handled by global handler
    } finally {
      setSaving(false)
    }
  }

  // Auto-generate title
  function generateTitle() {
    const boardName = paper.board.charAt(0).toUpperCase() + paper.board.slice(1)
    const levelName = paper.level === "alevel" 
      ? `A-Level${paper.subLevel ? ` (${paper.subLevel.toUpperCase()})` : ''}`
      : "O-Level"
    const subjectName = paper.subject.charAt(0).toUpperCase() + paper.subject.slice(1)
    const sessionName = paper.session === "may" ? "May" : "January"
    const paperNum = paper.paperNumber ? ` Paper ${paper.paperNumber}` : ""
    
    setPaper({
      ...paper,
      title: `${boardName} ${levelName} ${subjectName}${paperNum} ${sessionName} ${paper.year}`
    })
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/past-papers"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Upload Past Paper</h1>
          <p className="text-muted-foreground">Add a new past paper with mark scheme</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-6">
        {/* File Uploads */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Paper File (PDF) *</label>
            {paperFile ? (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
                <span className="flex-1 text-sm truncate">{paperFile.name}</span>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPaperFile(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50">
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">Click to upload PDF</span>
                <input type="file" accept=".pdf" className="hidden" onChange={(e) => setPaperFile(e.target.files?.[0] || null)} />
              </label>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Mark Scheme (Optional)</label>
            {markSchemeFile ? (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <FileText className="h-5 w-5 text-green-500" />
                <span className="flex-1 text-sm truncate">{markSchemeFile.name}</span>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMarkSchemeFile(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50">
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">Click to upload PDF</span>
                <input type="file" accept=".pdf" className="hidden" onChange={(e) => setMarkSchemeFile(e.target.files?.[0] || null)} />
              </label>
            )}
          </div>
        </div>

        {/* Paper Details */}
        <div className="space-y-4">
          {/* Subject & Board */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Subject *</label>
              <select
                value={paper.subject}
                onChange={(e) => setPaper({ ...paper, subject: e.target.value })}
                className="w-full px-3 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="business">Business</option>
                <option value="economics">Economics</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Board *</label>
              <select
                value={paper.board}
                onChange={(e) => setPaper({ ...paper, board: e.target.value })}
                className="w-full px-3 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="cambridge">Cambridge</option>
                <option value="edexcel">Edexcel</option>
                <option value="oxford">Oxford</option>
              </select>
            </div>
          </div>

          {/* Level & Sub-Level */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Level *</label>
              <select
                value={paper.level}
                onChange={(e) => setPaper({ ...paper, level: e.target.value, subLevel: e.target.value === "alevel" ? "as" : "" })}
                className="w-full px-3 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="olevel">O-Level</option>
                <option value="alevel">A-Level</option>
              </select>
            </div>
            {paper.level === "alevel" && (
              <div>
                <label className="block text-sm font-medium mb-1">A-Level Type *</label>
                <select
                  value={paper.subLevel}
                  onChange={(e) => setPaper({ ...paper, subLevel: e.target.value })}
                  className="w-full px-3 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="as">AS Level</option>
                  <option value="a2">A2 Level</option>
                </select>
              </div>
            )}
          </div>

          {/* Year, Session, Paper Number */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Year *</label>
              <input
                type="number"
                value={paper.year}
                onChange={(e) => setPaper({ ...paper, year: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Session *</label>
              <select
                value={paper.session}
                onChange={(e) => setPaper({ ...paper, session: e.target.value })}
                className="w-full px-3 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="may">May</option>
                <option value="january">January</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Paper Number</label>
              <input
                type="text"
                value={paper.paperNumber}
                onChange={(e) => setPaper({ ...paper, paperNumber: e.target.value })}
                className="w-full px-3 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., 1, 2, 3"
              />
            </div>
          </div>

          {/* Paper Type */}
          <div>
            <label className="block text-sm font-medium mb-1">Paper Type</label>
            <select
              value={paper.paperType}
              onChange={(e) => setPaper({ ...paper, paperType: e.target.value })}
              className="w-full px-3 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="mcq">Multiple Choice (MCQ)</option>
              <option value="theory">Theory</option>
              <option value="structured">Structured Questions</option>
              <option value="essay">Essay</option>
              <option value="case_study">Case Study</option>
              <option value="data_response">Data Response</option>
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={paper.title}
                onChange={(e) => setPaper({ ...paper, title: e.target.value })}
                className="flex-1 px-3 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., Cambridge O-Level Business Paper 1 May 2024"
              />
              <Button type="button" variant="outline" size="sm" onClick={generateTitle}>
                Auto
              </Button>
            </div>
          </div>

          {/* Topics */}
          <div>
            <label className="block text-sm font-medium mb-1">Topics (comma separated)</label>
            <input
              type="text"
              value={paper.topics}
              onChange={(e) => setPaper({ ...paper, topics: e.target.value })}
              className="w-full px-3 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., Marketing, Finance, Human Resources"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-border">
          <Button variant="outline" onClick={() => handleSubmit(false)} disabled={saving} className="flex-1">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Save as Draft
          </Button>
          <Button onClick={() => handleSubmit(true)} disabled={saving} className="flex-1">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Publish
          </Button>
        </div>
      </div>
    </div>
  )
}
