"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { api } from "@/lib/api"
import { toast } from "@/lib/toast"
import { 
  Search, Mail, MailOpen, Clock, AlertCircle, CheckCircle, 
  XCircle, Trash2, RefreshCw, Filter, ChevronLeft, ChevronRight,
  Inbox, MessageSquare
} from "lucide-react"

interface Contact {
  _id: string
  name: string
  email: string
  subject: string
  message: string
  senderType: string
  category: string
  priority: string
  status: string
  createdAt: string
  assignedTo?: { firstName: string; lastName: string }
}

interface Stats {
  total: number
  today: number
  unresolved: number
  byStatus: Record<string, number>
}

const statusColors: Record<string, string> = {
  new: "bg-blue-500",
  in_progress: "bg-yellow-500",
  awaiting_reply: "bg-purple-500",
  resolved: "bg-green-500",
  closed: "bg-gray-500",
  spam: "bg-red-500"
}

const priorityColors: Record<string, string> = {
  low: "text-gray-500",
  normal: "text-blue-500",
  high: "text-orange-500",
  urgent: "text-red-500"
}

export default function MessagesPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string[]>([])
  const [filters, setFilters] = useState({ status: "", category: "", priority: "", search: "" })
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchContacts = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = { page: String(page), limit: "20" }
      if (filters.status) params.status = filters.status
      if (filters.category) params.category = filters.category
      if (filters.priority) params.priority = filters.priority
      if (filters.search) params.search = filters.search

      const [contactsRes, statsRes] = await Promise.all([
        api.getContacts(params),
        api.getContactStats()
      ])

      const contactsData = contactsRes.data as { contacts: Contact[]; pagination: { totalPages: number } }
      const statsData = statsRes.data as Stats

      setContacts(contactsData.contacts || [])
      setTotalPages(contactsData.pagination?.totalPages || 1)
      setStats(statsData)
    } catch {
      // Error handled globally
    } finally {
      setLoading(false)
    }
  }, [page, filters])

  useEffect(() => { fetchContacts() }, [fetchContacts])

  const handleBulkAction = async (action: string) => {
    if (selected.length === 0) return
    try {
      if (action === "delete") {
        for (const id of selected) await api.deleteContact(id)
        toast.success(`${selected.length} messages deleted`)
      } else {
        await api.bulkUpdateContacts({ ids: selected, status: action })
        toast.success(`${selected.length} messages updated`)
      }
      setSelected([])
      fetchContacts()
    } catch {
      // Error handled globally
    }
  }

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const toggleSelectAll = () => {
    setSelected(prev => prev.length === contacts.length ? [] : contacts.map(c => c._id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="text-muted-foreground">Manage contact form submissions</p>
        </div>
        <Button onClick={fetchContacts} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <Inbox className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total Messages</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.today}</p>
                  <p className="text-xs text-muted-foreground">Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.unresolved}</p>
                  <p className="text-xs text-muted-foreground">Unresolved</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <Mail className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.byStatus?.new || 0}</p>
                  <p className="text-xs text-muted-foreground">New</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Filter className="h-4 w-4" />Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search messages..." className="pl-9" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
            </div>
            <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="awaiting_reply">Awaiting Reply</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.category} onValueChange={(v) => setFilters({ ...filters, category: v })}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="enrollment">Enrollment</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="feedback">Feedback</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.priority} onValueChange={(v) => setFilters({ ...filters, priority: v })}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Priority" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selected.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          <span className="text-sm font-medium">{selected.length} selected</span>
          <Button size="sm" variant="outline" onClick={() => handleBulkAction("resolved")}>
            <CheckCircle className="h-4 w-4 mr-1" />Mark Resolved
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleBulkAction("closed")}>
            <XCircle className="h-4 w-4 mr-1" />Close
          </Button>
          <Button size="sm" variant="destructive" onClick={() => handleBulkAction("delete")}>
            <Trash2 className="h-4 w-4 mr-1" />Delete
          </Button>
        </div>
      )}

      {/* Messages List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : contacts.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No messages found</div>
          ) : (
            <div className="divide-y">
              <div className="flex items-center gap-3 p-3 bg-muted/50">
                <Checkbox checked={selected.length === contacts.length && contacts.length > 0} onCheckedChange={toggleSelectAll} />
                <span className="text-xs text-muted-foreground">Select All</span>
              </div>
              {contacts.map((contact) => (
                <div key={contact._id} className="flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors">
                  <Checkbox checked={selected.includes(contact._id)} onCheckedChange={() => toggleSelect(contact._id)} />
                  <div className={`mt-1 ${contact.status === "new" ? "" : "opacity-60"}`}>
                    {contact.status === "new" ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
                  </div>
                  <Link href={`/dashboard/messages/${contact._id}`} className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-medium ${contact.status === "new" ? "" : "text-muted-foreground"}`}>
                        {contact.name}
                      </span>
                      <span className="text-xs text-muted-foreground">&lt;{contact.email}&gt;</span>
                      <Badge variant="outline" className="text-xs">{contact.senderType}</Badge>
                    </div>
                    <p className={`text-sm ${contact.status === "new" ? "font-medium" : ""}`}>{contact.subject}</p>
                    <p className="text-xs text-muted-foreground truncate">{contact.message}</p>
                  </Link>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${statusColors[contact.status]}`} />
                      <span className={`text-xs ${priorityColors[contact.priority]}`}>{contact.priority}</span>
                    </div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(contact.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
