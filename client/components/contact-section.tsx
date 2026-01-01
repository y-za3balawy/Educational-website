"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api } from "@/lib/api"
import { toast } from "@/lib/toast"
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, Loader2 } from "lucide-react"

interface ContactInfo {
  email: string
  phone: string
  address: string
  workingHours: string
  responseTime: string
}

export function ContactSection() {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    email: "",
    phone: "",
    address: "",
    workingHours: "",
    responseTime: ""
  })
  const [loadingInfo, setLoadingInfo] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    senderType: "student",
    subject: "",
    message: "",
    category: "cambridge",
    level: ""
  })

  useEffect(() => {
    async function fetchContactInfo() {
      try {
        const res = await api.getPublicSettings()
        const data = res.data as { contact?: ContactInfo }
        if (data?.contact) {
          setContactInfo({
            email: data.contact.email || "",
            phone: data.contact.phone || "",
            address: data.contact.address || "",
            workingHours: data.contact.workingHours || "",
            responseTime: data.contact.responseTime || ""
          })
        }
      } catch (error) {
        console.error("Failed to fetch contact info:", error)
      } finally {
        setLoadingInfo(false)
      }
    }
    fetchContactInfo()
  }, [])

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

  const resetForm = () => {
    setSubmitted(false)
    setFormData({
      name: "",
      email: "",
      phone: "",
      senderType: "student",
      subject: "",
      message: "",
      category: "general",
      level: ""
    })
  }

  return (
    <section id="contact" className="py-16 px-6 bg-muted/30">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Sign up For Business Course</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have questions about our courses, need help with your studies, or want to provide feedback? We&apos;re here to help!
          </p>
        </div>

        {submitted ? (
          <Card className="max-w-lg mx-auto text-center">
            <CardContent className="pt-12 pb-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Message Sent!</h3>
              <p className="text-muted-foreground mb-6">
                Thank you for contacting us. We&apos;ll get back to you as soon as possible.
              </p>
              <Button onClick={resetForm}>Send Another Message</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="space-y-4">
              {loadingInfo ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  {contactInfo.email && (
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <Mail className="h-5 w-5 text-primary mt-1" />
                          <div>
                            <h3 className="font-semibold">Email</h3>
                            <a href={`mailto:${contactInfo.email}`} className="text-sm text-muted-foreground hover:text-primary">
                              {contactInfo.email}
                            </a>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  {contactInfo.phone && (
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <Phone className="h-5 w-5 text-primary mt-1" />
                          <div>
                            <h3 className="font-semibold">Phone</h3>
                            <a href={`tel:${contactInfo.phone}`} className="text-sm text-muted-foreground hover:text-primary">
                              {contactInfo.phone}
                            </a>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  {contactInfo.address && (
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <MapPin className="h-5 w-5 text-primary mt-1" />
                          <div>
                            <h3 className="font-semibold">Location</h3>
                            <p className="text-sm text-muted-foreground">{contactInfo.address}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  {contactInfo.workingHours && (
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <Clock className="h-5 w-5 text-primary mt-1" />
                          <div>
                            <h3 className="font-semibold">Working Hours</h3>
                            <p className="text-sm text-muted-foreground">{contactInfo.workingHours}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  {contactInfo.responseTime && (
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <Clock className="h-5 w-5 text-primary mt-1" />
                          <div>
                            <h3 className="font-semibold">Response Time</h3>
                            <p className="text-sm text-muted-foreground">{contactInfo.responseTime}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
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
                      <Label htmlFor="contact-name">Full Name *</Label>
                      <Input id="contact-name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-email">Email *</Label>
                      <Input id="contact-email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact-phone">Phone (Optional)</Label>
                      <Input id="contact-phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-senderType">I am a</Label>
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
                      <Label htmlFor="contact-category">Exam Board</Label>
                      <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cambridge">Cambridge</SelectItem>
                          <SelectItem value="edexcel">Edexcel</SelectItem>
                          <SelectItem value="oxford">Oxford</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-level">Education Level</Label>
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
                    <Label htmlFor="contact-subject">Subject *</Label>
                    <Input id="contact-subject" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} placeholder="Brief description of your inquiry" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-message">Message *</Label>
                    <Textarea id="contact-message" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} placeholder="Please provide details about your inquiry..." rows={4} required />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Sending..." : <><Send className="h-4 w-4 mr-2" />Send Message</>}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </section>
  )
}
