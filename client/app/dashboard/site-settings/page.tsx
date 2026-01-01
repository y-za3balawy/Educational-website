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
import { Loader2, Save, Upload, Plus, Trash2, Mail, Globe, Image as ImageIcon, Star, Eye, EyeOff, User } from "lucide-react"

interface SliderImage {
  _id?: string
  image: { url: string; publicId?: string }
  title: string
  order: number
  isActive: boolean
}

interface Review {
  _id?: string
  image: { url: string; publicId?: string }
  studentName: string
  caption: string
  order: number
  isActive: boolean
}

interface HeroSettings {
  sliderImages?: SliderImage[]
  sliderAutoPlay: boolean
  sliderInterval: number
  imagePosition: string
  imageSize: string
  overlayOpacity: number
  overlayDirection: string
  badge: string
  headline: string
  subheadline: string
  description: string
  ctaText: string
  ctaLink: string
}

interface AboutSettings {
  heroHeadline: string
  heroDescription: string
  profileImage?: { url: string }
  places: string[]
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
}

export default function SiteSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [hero, setHero] = useState<HeroSettings>({
    sliderImages: [], sliderAutoPlay: true, sliderInterval: 5000,
    imagePosition: "center", imageSize: "cover", overlayOpacity: 30, overlayDirection: "full",
    badge: "", headline: "", subheadline: "", description: "", ctaText: "", ctaLink: ""
  })
  
  const [about, setAbout] = useState<AboutSettings>({
    heroHeadline: "", heroDescription: "", places: []
  })
  const [newPlace, setNewPlace] = useState("")
  const [aboutImage, setAboutImage] = useState<File | null>(null)
  
  const [contact, setContact] = useState<ContactSettings>({
    email: "", phone: "", address: "", workingHours: "", responseTime: ""
  })
  
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])
  const [newSliderImage, setNewSliderImage] = useState<File | null>(null)
  const [newSliderTitle, setNewSliderTitle] = useState("")
  
  const [reviews, setReviews] = useState<{
    sectionTitle: string; sectionSubtitle: string; showSection: boolean; items: Review[]
  }>({ sectionTitle: "Student Reviews", sectionSubtitle: "What our students say about us", showSection: true, items: [] })
  const [newReviewImage, setNewReviewImage] = useState<File | null>(null)
  const [newReviewName, setNewReviewName] = useState("")
  const [newReviewCaption, setNewReviewCaption] = useState("")

  useEffect(() => { fetchSettings() }, [])

  async function fetchSettings() {
    try {
      const res = await api.getAllSettings()
      const data = res.data as { settings: Record<string, unknown> }
      if (data.settings) {
        const s = data.settings as { hero?: HeroSettings; about?: AboutSettings; contact?: ContactSettings; socialLinks?: SocialLink[]; reviews?: typeof reviews }
        if (s.hero) setHero({ ...hero, ...s.hero, sliderImages: s.hero.sliderImages || [], badge: s.hero.badge || "", headline: s.hero.headline || "", subheadline: s.hero.subheadline || "", description: s.hero.description || "", ctaText: s.hero.ctaText || "", ctaLink: s.hero.ctaLink || "" })
        if (s.about) setAbout({ heroHeadline: s.about.heroHeadline || "", heroDescription: s.about.heroDescription || "", profileImage: s.about.profileImage, places: s.about.places || [] })
        if (s.contact) setContact({ email: s.contact.email || "", phone: s.contact.phone || "", address: s.contact.address || "", workingHours: s.contact.workingHours || "", responseTime: s.contact.responseTime || "" })
        setSocialLinks(s.socialLinks || [])
        if (s.reviews) setReviews({ ...reviews, ...s.reviews })
      }
    } catch (error) { console.error("Failed to fetch settings:", error) }
    finally { setLoading(false) }
  }

  // Slider functions
  async function handleAddSliderImage() {
    if (!newSliderImage) { toast.error("Please select an image"); return }
    console.log("Adding slider image:", newSliderImage.name, newSliderImage.size)
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append("sliderImage", newSliderImage)
      formData.append("title", newSliderTitle)
      console.log("Sending FormData to API...")
      const res = await api.addSliderImage(formData)
      console.log("API Response:", res)
      const data = res.data as { slide: SliderImage }
      setHero(prev => ({ ...prev, sliderImages: [...(prev.sliderImages || []), data.slide] }))
      toast.success("Slider image added!")
      setNewSliderImage(null); setNewSliderTitle("")
      const fileInput = document.getElementById('newSliderImageInput') as HTMLInputElement
      if (fileInput) fileInput.value = ''
    } catch (error) { 
      console.error("Failed to add slider image:", error)
      toast.error("Failed to add image. Please try again.") 
    } finally { setSaving(false) }
  }

  async function handleDeleteSliderImage(slideId: string) {
    if (!confirm("Delete this image?")) return
    setSaving(true)
    try {
      await api.deleteSliderImage(slideId)
      setHero(prev => ({ ...prev, sliderImages: (prev.sliderImages || []).filter(s => s._id !== slideId) }))
      toast.success("Image deleted!")
    } catch (error) { 
      console.error("Failed to delete slider image:", error)
      toast.error("Failed to delete image") 
    } finally { setSaving(false) }
  }

  async function handleToggleSliderActive(slideId: string, isActive: boolean) {
    setSaving(true)
    try {
      await api.updateSliderImage(slideId, { isActive: !isActive })
      setHero(prev => ({ ...prev, sliderImages: (prev.sliderImages || []).map(s => s._id === slideId ? { ...s, isActive: !isActive } : s) }))
      toast.success(isActive ? "Image hidden" : "Image visible")
    } catch {} finally { setSaving(false) }
  }

  async function handleSaveHeroSettings() {
    setSaving(true)
    try {
      await api.updateHeroSection({ sliderAutoPlay: hero.sliderAutoPlay, sliderInterval: hero.sliderInterval, imagePosition: hero.imagePosition, imageSize: hero.imageSize, overlayOpacity: hero.overlayOpacity, overlayDirection: hero.overlayDirection, badge: hero.badge, headline: hero.headline, subheadline: hero.subheadline, description: hero.description, ctaText: hero.ctaText, ctaLink: hero.ctaLink })
      toast.success("Settings saved!")
    } catch {} finally { setSaving(false) }
  }

  // About functions
  async function handleSaveAbout() {
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append("heroHeadline", about.heroHeadline)
      formData.append("heroDescription", about.heroDescription)
      formData.append("places", JSON.stringify(about.places))
      if (aboutImage) formData.append("profileImage", aboutImage)
      await api.updateAboutContent(formData)
      toast.success("About page updated!")
      setAboutImage(null)
      const fileInput = document.getElementById('aboutImageInput') as HTMLInputElement
      if (fileInput) fileInput.value = ''
    } catch {} finally { setSaving(false) }
  }

  function addPlace() {
    if (!newPlace.trim()) return
    setAbout(prev => ({ ...prev, places: [...prev.places, newPlace.trim()] }))
    setNewPlace("")
  }

  function removePlace(index: number) {
    setAbout(prev => ({ ...prev, places: prev.places.filter((_, i) => i !== index) }))
  }

  // Contact functions
  async function handleSaveContact() {
    setSaving(true)
    try {
      await api.updateContactInfo(contact as unknown as Record<string, unknown>)
      toast.success("Contact info updated!")
    } catch {} finally { setSaving(false) }
  }

  // Social functions
  async function handleSaveSocial() {
    setSaving(true)
    try {
      await api.updateSocialLinks(socialLinks)
      toast.success("Social links updated!")
    } catch {} finally { setSaving(false) }
  }

  function addSocialLink() { setSocialLinks([...socialLinks, { platform: "", url: "" }]) }
  function removeSocialLink(index: number) { setSocialLinks(socialLinks.filter((_, i) => i !== index)) }

  // Reviews functions
  async function handleSaveReviewsSection() {
    setSaving(true)
    try {
      await api.updateReviewsSection({ sectionTitle: reviews.sectionTitle, sectionSubtitle: reviews.sectionSubtitle, showSection: reviews.showSection })
      toast.success("Reviews section updated!")
    } catch {} finally { setSaving(false) }
  }

  async function handleAddReview() {
    if (!newReviewImage) { toast.error("Please select an image"); return }
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append("reviewImage", newReviewImage)
      formData.append("studentName", newReviewName)
      formData.append("caption", newReviewCaption)
      const res = await api.addReview(formData)
      const data = res.data as { review: Review }
      setReviews(prev => ({ ...prev, items: [...prev.items, data.review] }))
      toast.success("Review added!")
      setNewReviewImage(null); setNewReviewName(""); setNewReviewCaption("")
      const fileInput = document.getElementById('newReviewImageInput') as HTMLInputElement
      if (fileInput) fileInput.value = ''
    } catch {} finally { setSaving(false) }
  }

  async function handleDeleteReview(reviewId: string) {
    if (!confirm("Delete this review?")) return
    setSaving(true)
    try {
      await api.deleteReview(reviewId)
      setReviews(prev => ({ ...prev, items: prev.items.filter(r => r._id !== reviewId) }))
      toast.success("Review deleted!")
    } catch {} finally { setSaving(false) }
  }

  async function handleToggleReviewActive(reviewId: string, isActive: boolean) {
    setSaving(true)
    try {
      await api.updateReview(reviewId, { isActive: !isActive })
      setReviews(prev => ({ ...prev, items: prev.items.map(r => r._id === reviewId ? { ...r, isActive: !isActive } : r) }))
      toast.success(isActive ? "Review hidden" : "Review visible")
    } catch {} finally { setSaving(false) }
  }

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Site Settings</h1>
        <p className="text-muted-foreground">Manage your website content and configuration</p>
      </div>

      <Tabs defaultValue="slider" className="space-y-6">
        <TabsList className="flex-wrap">
          <TabsTrigger value="slider"><ImageIcon className="h-4 w-4 mr-2" />Hero Slider</TabsTrigger>
          <TabsTrigger value="about"><User className="h-4 w-4 mr-2" />About Page</TabsTrigger>
          <TabsTrigger value="reviews"><Star className="h-4 w-4 mr-2" />Reviews</TabsTrigger>
          <TabsTrigger value="contact"><Mail className="h-4 w-4 mr-2" />Contact Info</TabsTrigger>
          <TabsTrigger value="social"><Globe className="h-4 w-4 mr-2" />Social Links</TabsTrigger>
        </TabsList>

        {/* Hero Slider Tab */}
        <TabsContent value="slider" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hero Text Content</CardTitle>
              <CardDescription>Edit the text that appears on the hero slider</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Badge Text</Label>
                  <Input value={hero.badge} onChange={(e) => setHero({ ...hero, badge: e.target.value })} placeholder="Students love our classes!" />
                </div>
                <div className="space-y-2">
                  <Label>Headline</Label>
                  <Input value={hero.headline} onChange={(e) => setHero({ ...hero, headline: e.target.value })} placeholder="Welcome to IG Business Hub" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Subheadline</Label>
                <Input value={hero.subheadline} onChange={(e) => setHero({ ...hero, subheadline: e.target.value })} placeholder="with Mr. Mahmoud Said" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={hero.description} onChange={(e) => setHero({ ...hero, description: e.target.value })} placeholder="Explore resources..." rows={3} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Button Text</Label>
                  <Input value={hero.ctaText} onChange={(e) => setHero({ ...hero, ctaText: e.target.value })} placeholder="Learn More" />
                </div>
                <div className="space-y-2">
                  <Label>Button Link</Label>
                  <Input value={hero.ctaLink} onChange={(e) => setHero({ ...hero, ctaLink: e.target.value })} placeholder="/past-papers" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add Slider Image</CardTitle>
              <CardDescription>Upload images for the home page slider</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-48 h-32 rounded-lg bg-muted flex items-center justify-center overflow-hidden border-2 border-dashed border-border">
                    {newSliderImage ? <img src={URL.createObjectURL(newSliderImage)} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="h-10 w-10 text-muted-foreground" />}
                  </div>
                  <label className="mt-2 block">
                    <span className="text-sm text-primary cursor-pointer hover:underline flex items-center gap-1"><Upload className="h-4 w-4" />Select Image</span>
                    <input id="newSliderImageInput" type="file" accept="image/*" className="hidden" onChange={(e) => setNewSliderImage(e.target.files?.[0] || null)} />
                  </label>
                </div>
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <Label>Title (optional)</Label>
                    <Input value={newSliderTitle} onChange={(e) => setNewSliderTitle(e.target.value)} placeholder="Image title" />
                  </div>
                  <Button onClick={handleAddSliderImage} disabled={saving || !newSliderImage}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}Add Image
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Slider Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Image Position</Label>
                  <select value={hero.imagePosition} onChange={(e) => setHero({ ...hero, imagePosition: e.target.value })} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm">
                    <option value="left">Left</option><option value="center">Center</option><option value="right">Right</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Image Size</Label>
                  <select value={hero.imageSize} onChange={(e) => setHero({ ...hero, imageSize: e.target.value })} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm">
                    <option value="cover">Cover</option><option value="contain">Contain</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Overlay: {hero.overlayOpacity}%</Label>
                  <input type="range" min="0" max="80" value={hero.overlayOpacity} onChange={(e) => setHero({ ...hero, overlayOpacity: parseInt(e.target.value) })} className="w-full" />
                </div>
                <div className="space-y-2">
                  <Label>Interval (sec)</Label>
                  <Input type="number" min="2" max="15" value={hero.sliderInterval / 1000} onChange={(e) => setHero({ ...hero, sliderInterval: parseInt(e.target.value) * 1000 })} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="sliderAutoPlay" checked={hero.sliderAutoPlay} onChange={(e) => setHero({ ...hero, sliderAutoPlay: e.target.checked })} className="rounded" />
                <Label htmlFor="sliderAutoPlay">Auto-play slider</Label>
              </div>
              <Button onClick={handleSaveHeroSettings} disabled={saving} size="sm">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}Save Settings
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Slider Images ({hero.sliderImages?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {!hero.sliderImages?.length ? <p className="text-sm text-muted-foreground text-center py-8">No images added yet.</p> : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {hero.sliderImages.map((slide) => (
                    <div key={slide._id} className={`relative group rounded-lg overflow-hidden border ${slide.isActive ? 'border-border' : 'border-destructive/50 opacity-50'}`}>
                      <div className="aspect-video"><img src={slide.image.url} alt={slide.title || 'Slide'} className="w-full h-full object-cover" /></div>
                      {slide.title && <div className="p-2 bg-card"><p className="text-xs font-medium truncate">{slide.title}</p></div>}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button size="sm" variant="secondary" onClick={() => handleToggleSliderActive(slide._id!, slide.isActive)}>{slide.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteSliderImage(slide._id!)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* About Page Tab */}
        <TabsContent value="about" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">About Page Content</CardTitle>
              <CardDescription>Edit the about page hero section</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 rounded-lg bg-muted flex items-center justify-center overflow-hidden border-2 border-dashed border-border">
                    {aboutImage ? (
                      <img src={URL.createObjectURL(aboutImage)} alt="" className="w-full h-full object-cover" />
                    ) : about.profileImage?.url ? (
                      <img src={about.profileImage.url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-10 w-10 text-muted-foreground" />
                    )}
                  </div>
                  <label className="mt-2 block">
                    <span className="text-sm text-primary cursor-pointer hover:underline flex items-center gap-1"><Upload className="h-4 w-4" />Change Image</span>
                    <input id="aboutImageInput" type="file" accept="image/*" className="hidden" onChange={(e) => setAboutImage(e.target.files?.[0] || null)} />
                  </label>
                </div>
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <Label>Headline</Label>
                    <Input value={about.heroHeadline} onChange={(e) => setAbout({ ...about, heroHeadline: e.target.value })} placeholder="Welcome to Mr. Mahmoud's Hub" />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea value={about.heroDescription} onChange={(e) => setAbout({ ...about, heroDescription: e.target.value })} placeholder="As an IGCSE Business teacher..." rows={5} />
                  </div>
                </div>
              </div>
              <Button onClick={handleSaveAbout} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}Save About Content
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Course Places ({about.places.length})</CardTitle>
              <CardDescription>Manage the list of places where courses are available</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input value={newPlace} onChange={(e) => setNewPlace(e.target.value)} placeholder="Add new place..." onKeyDown={(e) => e.key === 'Enter' && addPlace()} />
                <Button onClick={addPlace} disabled={!newPlace.trim()}><Plus className="h-4 w-4 mr-2" />Add</Button>
              </div>
              {about.places.length === 0 ? <p className="text-sm text-muted-foreground text-center py-4">No places added yet.</p> : (
                <div className="space-y-2">
                  {about.places.map((place, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span>{place}</span>
                      <Button size="sm" variant="ghost" onClick={() => removePlace(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  ))}
                </div>
              )}
              <Button onClick={handleSaveAbout} disabled={saving} className="mt-4">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}Save Places
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Reviews Section Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <input type="checkbox" id="showReviewsSection" checked={reviews.showSection} onChange={(e) => setReviews({ ...reviews, showSection: e.target.checked })} className="rounded" />
                <Label htmlFor="showReviewsSection">Show reviews section</Label>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Section Title</Label>
                  <Input value={reviews.sectionTitle} onChange={(e) => setReviews({ ...reviews, sectionTitle: e.target.value })} placeholder="Student Reviews" />
                </div>
                <div className="space-y-2">
                  <Label>Section Subtitle</Label>
                  <Input value={reviews.sectionSubtitle} onChange={(e) => setReviews({ ...reviews, sectionSubtitle: e.target.value })} placeholder="What our students say" />
                </div>
              </div>
              <Button onClick={handleSaveReviewsSection} disabled={saving} size="sm">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}Save Settings
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add New Review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-40 h-32 rounded-lg bg-muted flex items-center justify-center overflow-hidden border-2 border-dashed border-border">
                    {newReviewImage ? <img src={URL.createObjectURL(newReviewImage)} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="h-10 w-10 text-muted-foreground" />}
                  </div>
                  <label className="mt-2 block">
                    <span className="text-sm text-primary cursor-pointer hover:underline flex items-center gap-1"><Upload className="h-4 w-4" />Select Image</span>
                    <input id="newReviewImageInput" type="file" accept="image/*" className="hidden" onChange={(e) => setNewReviewImage(e.target.files?.[0] || null)} />
                  </label>
                </div>
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <Label>Student Name (optional)</Label>
                    <Input value={newReviewName} onChange={(e) => setNewReviewName(e.target.value)} placeholder="Student name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Caption (optional)</Label>
                    <Input value={newReviewCaption} onChange={(e) => setNewReviewCaption(e.target.value)} placeholder="Brief caption" />
                  </div>
                  <Button onClick={handleAddReview} disabled={saving || !newReviewImage}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}Add Review
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Existing Reviews ({reviews.items.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {reviews.items.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">No reviews added yet.</p> : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {reviews.items.map((review) => (
                    <div key={review._id} className={`relative group rounded-lg overflow-hidden border ${review.isActive ? 'border-border' : 'border-destructive/50 opacity-50'}`}>
                      <div className="aspect-[4/3]"><img src={review.image.url} alt={review.studentName || 'Review'} className="w-full h-full object-cover" /></div>
                      {(review.studentName || review.caption) && <div className="p-2 bg-card">{review.studentName && <p className="text-xs font-medium truncate">{review.studentName}</p>}{review.caption && <p className="text-xs text-muted-foreground truncate">{review.caption}</p>}</div>}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button size="sm" variant="secondary" onClick={() => handleToggleReviewActive(review._id!, review.isActive)}>{review.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteReview(review._id!)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
              <CardDescription>This information appears on the contact page and footer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} placeholder="contact@example.com" />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} placeholder="+1234567890" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Textarea value={contact.address} onChange={(e) => setContact({ ...contact, address: e.target.value })} placeholder="Your address" rows={2} />
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
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}Save Contact Info
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Tab */}
        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Social Links</CardTitle>
              <CardDescription>Add your social media profiles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {socialLinks.map((link, index) => (
                <div key={index} className="flex gap-4 items-end">
                  <div className="flex-1 space-y-2">
                    <Label>Platform</Label>
                    <Input value={link.platform} onChange={(e) => { const updated = [...socialLinks]; updated[index].platform = e.target.value; setSocialLinks(updated) }} placeholder="Facebook, Twitter, etc." />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label>URL</Label>
                    <Input value={link.url} onChange={(e) => { const updated = [...socialLinks]; updated[index].url = e.target.value; setSocialLinks(updated) }} placeholder="https://..." />
                  </div>
                  <Button variant="destructive" size="icon" onClick={() => removeSocialLink(index)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
              <div className="flex gap-4">
                <Button variant="outline" onClick={addSocialLink}><Plus className="h-4 w-4 mr-2" />Add Link</Button>
                <Button onClick={handleSaveSocial} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}Save Social Links
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
