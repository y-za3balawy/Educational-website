"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { api } from "@/lib/api"
import { toast } from "@/lib/toast"
import { 
  ArrowLeft, Mail, User, Phone, Clock, Tag, AlertCircle,
  Send, StickyNote, Trash2, CheckCircle, MessageSquare
} from "lucide-react"

interface Response {
  _id: string
  message: string
  respondedBy?: { firstName: string; lastName: string }
  respondedAt: string
  isInternal: boolean
  sentViaEmail: boolean
}

interface Note {
  _id: string
  note: string
  addedBy?: { firstName: string; lastName: string }
  addedAt: string
}

interface Contact {
  _id: string
  name: string
  email: string
  phone?: string
  senderType: string
  subject: string
  message: string
  category: string
  priority: string
  status: string
  level?: string
  createdAt: string
  firstResponseAt?: string
  resolvedAt?: string
  responses: Response[]
  internalNotes: Note[]
  relatedPost?: { _id: string; title: string }
  relatedQuiz?: { _id: string; title: string }
}

const statusOptions = [
  { value: "new", label: "New" },
  { value: "in_progress", label: "In Progress" },
  { value: "awaiting_reply", label: "Awaiting Reply" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
  { value: "spam", label: "Spam" }
]

const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" }
]

export default function MessageDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [contact, setContact] = useState<Contact | null>(null)
  const [loading, setLoading] = useState(true)
  const [replyText, setReplyText] = useState("")
  const [noteText, setNoteText] = useState("")
  const [sendEmail, setSendEmail] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const fetchContact = useCallback(async () => {
    try {
      const res = await api.getContact(params.id as string)
      setContact((res.data as { contact: Contact }).contact)
    } catch {
      router.push("/dashboard/messages")
    } finally {
      setLoading(false)
    }
  }, [params.id, router])

  useEffect(() => { fetchContact() }, [fetchContact])

  const handleStatusChange = async (status: string) => {
    try {
      await api.updateContact(params.id as string, { status })
      setContact(prev => prev ? { ...prev, status } : null)
      toast.success("Status updated")
    } catch {
      // Error handled globally
    }
  }

  const handlePriorityChange = async (priority: string) => {
    try {
      await api.updateContact(params.id as string, { priority })
      setContact(prev => prev ? { ...prev, priority } : null)
      toast.success("Priority updated")
    } catch {
      // Error handled globally
    }
  }

  const handleSendReply = async () => {
    if (!replyText.trim()) return
    setSubmitting(true)
    try {
      await api.addContactResponse(params.id as string, { message: replyText, sendEmail })
      toast.success(sendEmail ? "Reply sent via email" : "Reply added")
      setReplyText("")
      fetchContact()
    } catch {
      // Error handled globally
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddNote = async () => {
    if (!noteText.trim()) return
    setSubmitting(true)
    try {
      await api.addContactNote(params.id as string, noteText)
      toast.success("Note added")
      setNoteText("")
      fetchContact()
    } catch {
      // Error handled globally
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this message?")) return
    try {
      await api.deleteContact(params.id as string)
      toast.success("Message deleted")
      router.push("/dashboard/messages")
    } catch {
      // Error handled globally
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading...</div>
  }

  if (!contact) {
    return <div className="p-8 text-center text-muted-foreground">Message not found</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/messages"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold">{contact.subject}</h1>
            <p className="text-sm text-muted-foreground">From {contact.name}</p>
          </div>
        </div>
        <Button variant="destructive" size="sm" onClick={handleDelete}>
          <Trash2 className="h-4 w-4 mr-2" />Delete
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Original Message */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />Original Message
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{contact.message}</p>
              </div>
            </CardContent>
          </Card>

          {/* Responses */}
          {contact.responses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Conversation History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {contact.responses.map((response) => (
                  <div key={response._id} className={`p-3 rounded-lg ${response.isInternal ? "bg-yellow-50 border border-yellow-200" : "bg-muted"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        {response.respondedBy ? `${response.respondedBy.firstName} ${response.respondedBy.lastName}` : "System"}
                        {response.isInternal && <Badge variant="outline" className="ml-2 text-xs">Internal</Badge>}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(response.respondedAt).toLocaleString()}
                        {response.sentViaEmail && <Mail className="h-3 w-3 inline ml-1" />}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{response.message}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Reply Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Send className="h-4 w-4" />Send Reply
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea placeholder="Type your reply..." value={replyText} onChange={(e) => setReplyText(e.target.value)} rows={4} />
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} className="rounded" />
                  Send via email to {contact.email}
                </label>
                <Button onClick={handleSendReply} disabled={!replyText.trim() || submitting}>
                  <Send className="h-4 w-4 mr-2" />{submitting ? "Sending..." : "Send Reply"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Internal Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <StickyNote className="h-4 w-4" />Internal Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {contact.internalNotes.length > 0 && (
                <div className="space-y-2 mb-4">
                  {contact.internalNotes.map((note) => (
                    <div key={note._id} className="p-2 bg-muted rounded text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-xs">
                          {note.addedBy ? `${note.addedBy.firstName} ${note.addedBy.lastName}` : "Unknown"}
                        </span>
                        <span className="text-xs text-muted-foreground">{new Date(note.addedAt).toLocaleString()}</span>
                      </div>
                      <p>{note.note}</p>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Textarea placeholder="Add internal note..." value={noteText} onChange={(e) => setNoteText(e.target.value)} rows={2} className="flex-1" />
                <Button onClick={handleAddNote} disabled={!noteText.trim() || submitting} variant="outline">
                  <StickyNote className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{contact.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${contact.email}`} className="text-primary hover:underline">{contact.email}</a>
              </div>
              {contact.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{contact.phone}</span>
                </div>
              )}
              <Separator />
              <div className="flex items-center gap-2 text-sm">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <Badge variant="outline">{contact.senderType}</Badge>
                <Badge variant="outline">{contact.category}</Badge>
              </div>
              {contact.level && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Level:</span>
                  <Badge variant="secondary">{contact.level.toUpperCase()}</Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status & Priority */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Status & Priority</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Status</label>
                <Select value={contact.status} onValueChange={handleStatusChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Priority</label>
                <Select value={contact.priority} onValueChange={handlePriorityChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Received</p>
                  <p>{new Date(contact.createdAt).toLocaleString()}</p>
                </div>
              </div>
              {contact.firstResponseAt && (
                <div className="flex items-center gap-2 text-sm">
                  <Send className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">First Response</p>
                    <p>{new Date(contact.firstResponseAt).toLocaleString()}</p>
                  </div>
                </div>
              )}
              {contact.resolvedAt && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Resolved</p>
                    <p>{new Date(contact.resolvedAt).toLocaleString()}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Related Content */}
          {(contact.relatedPost || contact.relatedQuiz) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Related Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {contact.relatedPost && (
                  <Link href={`/posts/${contact.relatedPost._id}`} className="block text-sm text-primary hover:underline">
                    📄 {contact.relatedPost.title}
                  </Link>
                )}
                {contact.relatedQuiz && (
                  <Link href={`/quizzes/${contact.relatedQuiz._id}`} className="block text-sm text-primary hover:underline">
                    📝 {contact.relatedQuiz.title}
                  </Link>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full" onClick={() => handleStatusChange("resolved")}>
                <CheckCircle className="h-4 w-4 mr-2" />Mark as Resolved
              </Button>
              <Button variant="outline" size="sm" className="w-full" onClick={() => handleStatusChange("spam")}>
                Mark as Spam
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
