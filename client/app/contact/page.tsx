"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api } from "@/lib/api"
import { toast } from "@/lib/toast"
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from "lucide-react"

export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    senderType: "student",
    subject: "",
    message: "",
    category: "general",
    level: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await api.submitContact(formData)
      setSubmitted(true)
      toast.success("Message sent successfully!")
    } catch {
      // Error handled by global handler
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-16">
          <Card className="max-w-lg mx-auto text-center">
            <CardContent className="pt-12 pb-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Message Sent!</h2>
              <p className="text-muted-foreground mb-6">
                Thank you for contacting us. We&apos;ll get back to you as soon as possible.
              </p>
              <Button onClick={() => { setSubmitted(false); setFormData({ name: "", email: "", phone: "", senderType: "student", subject: "", message: "", category: "general", level: "" }) }}>
                Send Another Message
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Have questions about our courses, need help with your studies, or want to provide feedback? We&apos;re here to help!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Mail className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold">Email</h3>
                      <p className="text-sm text-muted-foreground">support@bioigcse.com</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Phone className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold">Phone</h3>
                      <p className="text-sm text-muted-foreground">+20 123 456 7890</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <MapPin className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold">Location</h3>
                      <p className="text-sm text-muted-foreground">Cairo, Egypt</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Clock className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold">Response Time</h3>
                      <p className="text-sm text-muted-foreground">Within 24 hours</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
                <CardDescription>Fill out the form below and we&apos;ll get back to you soon.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone (Optional)</Label>
                      <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="senderType">I am a</Label>
                      <Select value={formData.senderType} onValueChange={(v) => setFormData({ ...formData, senderType: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="parent">Parent</SelectItem>
                          <SelectItem value="teacher">Teacher</SelectItem>
                          <SelectItem value="school">School Representative</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Inquiry</SelectItem>
                          <SelectItem value="enrollment">Enrollment</SelectItem>
                          <SelectItem value="academic">Academic Help</SelectItem>
                          <SelectItem value="technical">Technical Issue</SelectItem>
                          <SelectItem value="feedback">Feedback</SelectItem>
                          <SelectItem value="complaint">Complaint</SelectItem>
                          <SelectItem value="billing">Billing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="level">Education Level</Label>
                      <Select value={formData.level} onValueChange={(v) => setFormData({ ...formData, level: v })}>
                        <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="igcse">IGCSE</SelectItem>
                          <SelectItem value="olevel">O-Level</SelectItem>
                          <SelectItem value="alevel">A-Level</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input id="subject" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} placeholder="Brief description of your inquiry" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea id="message" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} placeholder="Please provide details about your inquiry..." rows={5} required />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Sending..." : <><Send className="h-4 w-4 mr-2" />Send Message</>}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
