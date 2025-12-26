"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { api } from "@/lib/api"
import { toast } from "@/lib/toast"
import { Loader2, Save, Upload, Plus, Trash2, User, Mail, Globe, FileText, Image as ImageIcon } from "lucide-react"

interface Qualification {
  _id?: string
  icon: string
  title: string
  description: string
}

interface HeroSettings {
  backgroundImage?: { url: string; publicId?: string }
  headline: string
  subheadline: string
  description: string
  badge: string
  ctaText: string
  ctaLink: string
  secondaryCtaText: string
  secondaryCtaLink: string
  statsNumber: string
  statsLabel: string
}

interface AboutSettings {
  name: string
  title: string
  shortBio: string
  profileImage?: { url: string; publicId?: string }
  email: string
  phone: string
  location: string
  mainHeading: string
  mainContent: string
  qualifications: Qualification[]
  philosophyHeading: string
  philosophyQuote: string
  ctaText: string
  ctaLink: string
}

interface ContactSettings {
  email: string
  phone: string
  address: string
  workingHours: string
  responseTime: string
}

interface SocialLink {
  _id?: string
  platform: string
  url: string
  icon?: string
}

const iconOptions = ["Award", "GraduationCap", "Users", "BookOpen", "Star", "Trophy", "Target", "Lightbulb"]

export default function SiteSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [heroImage, setHeroImage] = useState<File | null>(null)
  
  const [hero, setHero] = useState<HeroSettings>({
    headline: "Master Business & Economics",
    subheadline: "with Mr. Mahmoud Said",
    description: "Access comprehensive study materials, past papers with mark schemes, and personalized teaching for Cambridge, Edexcel, and Oxford O-Level & A-Level examinations.",
    badge: "Now accepting new students",
    ctaText: "Browse Past Papers",
    ctaLink: "/past-papers",
    secondaryCtaText: "Learn More",
    secondaryCtaLink: "/about",
    statsNumber: "500+",
    statsLabel: "Students taught successfully"
  })
  
  const [about, setAbout] = useState<AboutSettings>({
    name: "", title: "", shortBio: "", email: "", phone: "", location: "",
    mainHeading: "About Me", mainContent: "", qualifications: [],
    philosophyHeading: "Teaching Philosophy", philosophyQuote: "",
    ctaText: "Book a Session", ctaLink: "/contact"
  })
  
  const [contact, setContact] = useState<ContactSettings>({
    email: "", phone: "", address: "", workingHours: "", responseTime: ""
  })
  
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      const res = await api.getAllSettings()
      const data = res.data as { settings: { hero?: HeroSettings; about: AboutSettings; contact: ContactSettings; socialLinks: SocialLink[] } }
      if (data.settings) {
        if (data.settings.hero) setHero({ ...hero, ...data.settings.hero })
        setAbout(data.settings.about || about)
        setContact(data.settings.contact || contact)
        setSocialLinks(data.settings.socialLinks || [])
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveHero() {
    setSaving(true)
    try {
      const formData = new FormData()
      if (heroImage) {
        formData.append("heroImage", heroImage)
      }
      Object.entries(hero).forEach(([key, value]) => {
        if (key !== "backgroundImage" && value !== undefined && value !== null) {
          formData.append(key, String(value))
        }
      })
      await api.updateHeroSection(formData)
      toast.success("Hero section updated!")
      setHeroImage(null)
    } catch {
      // Error handled globally
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveAbout() {
    setSaving(true)
    try {
      if (profileImage) {
        const formData = new FormData()
        formData.append("profileImage", profileImage)
        Object.entries(about).forEach(([key, value]) => {
          if (key === "qualifications") {
            formData.append(key, JSON.stringify(value))
          } else if (value !== undefined && value !== null) {
            formData.append(key, String(value))
          }
        })
        await api.updateAboutContent(formData)
      } else {
        await api.updateAboutContent(about as unknown as Record<string, unknown>)
      }
      toast.success("About page updated!")
      setProfileImage(null)
    } catch {
      // Error handled globally
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveContact() {
    setSaving(true)
    try {
      await api.updateContactInfo(contact as unknown as Record<string, unknown>)
      toast.success("Contact info updated!")
    } catch {
      // Error handled globally
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveSocial() {
    setSaving(true)
    try {
      await api.updateSocialLinks(socialLinks)
      toast.success("Social links updated!")
    } catch {
      // Error handled globally
    } finally {
      setSaving(false)
    }
  }

  function addQualification() {
    setAbout({
      ...about,
      qualifications: [...about.qualifications, { icon: "Award", title: "", description: "" }]
    })
  }

  function removeQualification(index: number) {
    setAbout({
      ...about,
      qualifications: about.qualifications.filter((_, i) => i !== index)
    })
  }

  function updateQualification(index: number, field: keyof Qualification, value: string) {
    const updated = [...about.qualifications]
    updated[index] = { ...updated[index], [field]: value }
    setAbout({ ...about, qualifications: updated })
  }

  function addSocialLink() {
    setSocialLinks([...socialLinks, { platform: "", url: "" }])
  }

  function removeSocialLink(index: number) {
    setSocialLinks(socialLinks.filter((_, i) => i !== index))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Site Settings</h1>
        <p className="text-muted-foreground">Manage your website content and configuration</p>
      </div>

      <Tabs defaultValue="hero" className="space-y-6">
        <TabsList>
          <TabsTrigger value="hero"><ImageIcon className="h-4 w-4 mr-2" />Hero Section</TabsTrigger>
          <TabsTrigger value="about"><User className="h-4 w-4 mr-2" />About Page</TabsTrigger>
          <TabsTrigger value="contact"><Mail className="h-4 w-4 mr-2" />Contact Info</TabsTrigger>
          <TabsTrigger value="social"><Globe className="h-4 w-4 mr-2" />Social Links</TabsTrigger>
        </TabsList>

        {/* Hero Section Tab */}
        <TabsContent value="hero" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hero Background Image</CardTitle>
              <CardDescription>Upload a background image for the home page hero section</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-48 h-32 rounded-lg bg-muted flex items-center justify-center overflow-hidden border-2 border-dashed border-border">
                    {heroImage ? (
                      <img src={URL.createObjectURL(heroImage)} alt="" className="w-full h-full object-cover" />
                    ) : hero.backgroundImage?.url ? (
                      <img src={hero.backgroundImage.url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="h-10 w-10 text-muted-foreground" />
                    )}
                  </div>
                  <label className="mt-2 block">
                    <span className="text-sm text-primary cursor-pointer hover:underline flex items-center gap-1">
                      <Upload className="h-4 w-4" />Upload Image
                    </span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => setHeroImage(e.target.files?.[0] || null)} />
                  </label>
                </div>
                <div className="flex-1 text-sm text-muted-foreground">
                  <p>Recommended: High resolution image (1920x1080 or larger)</p>
                  <p>The image will be displayed behind the hero text with a gradient overlay.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hero Content</CardTitle>
              <CardDescription>Customize the text displayed on the home page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Headline</Label>
                  <Input value={hero.headline} onChange={(e) => setHero({ ...hero, headline: e.target.value })} placeholder="Master Business & Economics" />
                </div>
                <div className="space-y-2">
                  <Label>Subheadline</Label>
                  <Input value={hero.subheadline} onChange={(e) => setHero({ ...hero, subheadline: e.target.value })} placeholder="with Mr. Mahmoud Said" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Badge Text</Label>
                <Input value={hero.badge} onChange={(e) => setHero({ ...hero, badge: e.target.value })} placeholder="Now accepting new students" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={hero.description} onChange={(e) => setHero({ ...hero, description: e.target.value })} rows={3} placeholder="Brief description..." />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Primary Button Text</Label>
                  <Input value={hero.ctaText} onChange={(e) => setHero({ ...hero, ctaText: e.target.value })} placeholder="Browse Past Papers" />
                </div>
                <div className="space-y-2">
                  <Label>Primary Button Link</Label>
                  <Input value={hero.ctaLink} onChange={(e) => setHero({ ...hero, ctaLink: e.target.value })} placeholder="/past-papers" />
                </div>
                <div className="space-y-2">
                  <Label>Secondary Button Text</Label>
                  <Input value={hero.secondaryCtaText} onChange={(e) => setHero({ ...hero, secondaryCtaText: e.target.value })} placeholder="Learn More" />
                </div>
                <div className="space-y-2">
                  <Label>Secondary Button Link</Label>
                  <Input value={hero.secondaryCtaLink} onChange={(e) => setHero({ ...hero, secondaryCtaLink: e.target.value })} placeholder="/about" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Stats Number</Label>
                  <Input value={hero.statsNumber} onChange={(e) => setHero({ ...hero, statsNumber: e.target.value })} placeholder="500+" />
                </div>
                <div className="space-y-2">
                  <Label>Stats Label</Label>
                  <Input value={hero.statsLabel} onChange={(e) => setHero({ ...hero, statsLabel: e.target.value })} placeholder="Students taught successfully" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleSaveHero} disabled={saving} className="w-full sm:w-auto">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save Hero Section
          </Button>
        </TabsContent>

        {/* About Page Tab */}
        <TabsContent value="about" className="space-y-6">
          {/* Profile Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Profile Information</CardTitle>
              <CardDescription>Your personal information displayed on the About page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                    {profileImage ? (
                      <img src={URL.createObjectURL(profileImage)} alt="" className="w-full h-full object-cover" />
                    ) : about.profileImage?.url ? (
                      <img src={about.profileImage.url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-10 w-10 text-muted-foreground" />
                    )}
                  </div>
                  <label className="mt-2 block">
                    <span className="text-xs text-primary cursor-pointer hover:underline flex items-center gap-1">
                      <Upload className="h-3 w-3" />Change Photo
                    </span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => setProfileImage(e.target.files?.[0] || null)} />
                  </label>
                </div>
                <div className="flex-1 grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={about.name} onChange={(e) => setAbout({ ...about, name: e.target.value })} placeholder="Your Name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input value={about.title} onChange={(e) => setAbout({ ...about, title: e.target.value })} placeholder="Biology Teacher" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Short Bio</Label>
                    <Textarea value={about.shortBio} onChange={(e) => setAbout({ ...about, shortBio: e.target.value })} placeholder="Brief description..." rows={2} />
                  </div>
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={about.email} onChange={(e) => setAbout({ ...about, email: e.target.value })} placeholder="email@example.com" />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={about.phone} onChange={(e) => setAbout({ ...about, phone: e.target.value })} placeholder="+1 234 567 890" />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input value={about.location} onChange={(e) => setAbout({ ...about, location: e.target.value })} placeholder="City, Country" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Main Content</CardTitle>
              <CardDescription>The main text content of your About page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Section Heading</Label>
                <Input value={about.mainHeading} onChange={(e) => setAbout({ ...about, mainHeading: e.target.value })} placeholder="About Me" />
              </div>
              <div className="space-y-2">
                <Label>Content (HTML supported)</Label>
                <Textarea value={about.mainContent} onChange={(e) => setAbout({ ...about, mainContent: e.target.value })} placeholder="<p>Your story...</p>" rows={8} />
                <p className="text-xs text-muted-foreground">Use &lt;p&gt; tags for paragraphs</p>
              </div>
            </CardContent>
          </Card>

          {/* Qualifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Qualifications
                <Button size="sm" variant="outline" onClick={addQualification}><Plus className="h-4 w-4 mr-1" />Add</Button>
              </CardTitle>
              <CardDescription>Your qualifications and achievements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {about.qualifications.map((qual, index) => (
                <div key={index} className="flex gap-4 p-4 bg-muted rounded-lg">
                  <div className="space-y-2 w-32">
                    <Label>Icon</Label>
                    <select value={qual.icon} onChange={(e) => updateQualification(index, "icon", e.target.value)} className="w-full px-3 py-2 bg-background rounded-lg text-sm">
                      {iconOptions.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                    </select>
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label>Title</Label>
                    <Input value={qual.title} onChange={(e) => updateQualification(index, "title", e.target.value)} placeholder="Qualification title" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label>Description</Label>
                    <Input value={qual.description} onChange={(e) => updateQualification(index, "description", e.target.value)} placeholder="Brief description" />
                  </div>
                  <Button variant="ghost" size="icon" className="mt-6" onClick={() => removeQualification(index)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              {about.qualifications.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No qualifications added yet</p>
              )}
            </CardContent>
          </Card>

          {/* Philosophy */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Teaching Philosophy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Section Heading</Label>
                <Input value={about.philosophyHeading} onChange={(e) => setAbout({ ...about, philosophyHeading: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Quote</Label>
                <Textarea value={about.philosophyQuote} onChange={(e) => setAbout({ ...about, philosophyQuote: e.target.value })} rows={3} placeholder="Your teaching philosophy..." />
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Call to Action</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Button Text</Label>
                <Input value={about.ctaText} onChange={(e) => setAbout({ ...about, ctaText: e.target.value })} placeholder="Book a Session" />
              </div>
              <div className="space-y-2">
                <Label>Button Link</Label>
                <Input value={about.ctaLink} onChange={(e) => setAbout({ ...about, ctaLink: e.target.value })} placeholder="/contact" />
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleSaveAbout} disabled={saving} className="w-full sm:w-auto">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save About Page
          </Button>
        </TabsContent>

        {/* Contact Info Tab */}
        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
              <CardDescription>Contact details displayed across the site</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} placeholder="support@example.com" />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} placeholder="+1 234 567 890" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input value={contact.address} onChange={(e) => setContact({ ...contact, address: e.target.value })} placeholder="City, Country" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Working Hours</Label>
                  <Input value={contact.workingHours} onChange={(e) => setContact({ ...contact, workingHours: e.target.value })} placeholder="Mon-Fri: 9AM-5PM" />
                </div>
                <div className="space-y-2">
                  <Label>Response Time</Label>
                  <Input value={contact.responseTime} onChange={(e) => setContact({ ...contact, responseTime: e.target.value })} placeholder="Within 24 hours" />
                </div>
              </div>
              <Button onClick={handleSaveContact} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save Contact Info
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Links Tab */}
        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Social Links
                <Button size="sm" variant="outline" onClick={addSocialLink}><Plus className="h-4 w-4 mr-1" />Add Link</Button>
              </CardTitle>
              <CardDescription>Your social media profiles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {socialLinks.map((link, index) => (
                <div key={index} className="flex gap-4 items-end">
                  <div className="flex-1 space-y-2">
                    <Label>Platform</Label>
                    <Input value={link.platform} onChange={(e) => {
                      const updated = [...socialLinks]
                      updated[index].platform = e.target.value
                      setSocialLinks(updated)
                    }} placeholder="Facebook, Twitter, etc." />
                  </div>
                  <div className="flex-[2] space-y-2">
                    <Label>URL</Label>
                    <Input value={link.url} onChange={(e) => {
                      const updated = [...socialLinks]
                      updated[index].url = e.target.value
                      setSocialLinks(updated)
                    }} placeholder="https://..." />
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeSocialLink(index)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              {socialLinks.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No social links added yet</p>
              )}
              <Button onClick={handleSaveSocial} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save Social Links
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
