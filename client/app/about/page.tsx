"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { GraduationCap, Award, Users, BookOpen, Mail, MapPin, Phone, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import Link from "next/link"

interface Qualification {
  _id: string
  icon: string
  title: string
  description: string
}

interface AboutContent {
  name: string
  title: string
  shortBio: string
  profileImage?: { url: string }
  email: string
  phone?: string
  location: string
  mainHeading: string
  mainContent: string
  qualifications: Qualification[]
  philosophyHeading: string
  philosophyQuote: string
  ctaText: string
  ctaLink: string
}

interface ContactInfo {
  email: string
  phone?: string
  address?: string
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Award,
  GraduationCap,
  Users,
  BookOpen
}

export default function AboutPage() {
  const [about, setAbout] = useState<AboutContent | null>(null)
  const [contact, setContact] = useState<ContactInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchContent() {
      try {
        const res = await api.getAboutContent()
        const data = res.data as { about: AboutContent; contact: ContactInfo }
        setAbout(data.about)
        setContact(data.contact)
      } catch (error) {
        console.error("Failed to fetch about content:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchContent()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-24 pb-16 px-6 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </div>
    )
  }

  // Fallback content if no settings exist yet
  const content = about || {
    name: "Your Name",
    title: "Biology IGCSE Teacher",
    shortBio: "Passionate about making biology accessible and engaging for all students.",
    email: "contact@bioigcse.com",
    location: "Available Online Worldwide",
    mainHeading: "About Me",
    mainContent: `<p>I am a dedicated Biology teacher with over 10 years of experience specializing in the Cambridge IGCSE curriculum. My passion lies in helping students not just memorize facts, but truly understand the fascinating world of biology.</p>
<p>Throughout my career, I have helped hundreds of students achieve their target grades, with many achieving A* and A grades in their final examinations. My teaching approach combines clear explanations, real-world examples, and interactive learning methods.</p>
<p>I believe that every student has the potential to excel in biology with the right guidance and resources. That is why I created this platform - to provide quality educational materials accessible to all students preparing for their IGCSE biology examinations.</p>`,
    qualifications: [
      { _id: "1", icon: "Award", title: "MSc in Biology Education", description: "Specialized in curriculum development and pedagogy" },
      { _id: "2", icon: "GraduationCap", title: "10+ Years Teaching", description: "Experience with IGCSE, A-Level, and IB curricula" },
      { _id: "3", icon: "Users", title: "500+ Students", description: "Successfully guided through their IGCSE journey" },
      { _id: "4", icon: "BookOpen", title: "Cambridge Certified", description: "Official Cambridge IGCSE examiner and trainer" }
    ],
    philosophyHeading: "Teaching Philosophy",
    philosophyQuote: "Biology is not just about memorizing facts and diagrams. It is about understanding the incredible complexity of life and how everything is interconnected. When students grasp these connections, learning becomes natural and enjoyable.",
    ctaText: "Book a Session",
    ctaLink: "/contact"
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Left Column - Profile */}
            <div className="lg:col-span-1">
              <div className="sticky top-28">
                <div className="bg-card border border-border rounded-xl p-6 mb-6">
                  <div className="w-32 h-32 rounded-full bg-primary/10 mx-auto mb-6 flex items-center justify-center overflow-hidden">
                    {content.profileImage?.url ? (
                      <img src={content.profileImage.url} alt={content.name} className="w-full h-full object-cover" />
                    ) : (
                      <GraduationCap className="h-16 w-16 text-primary" />
                    )}
                  </div>
                  <h1 className="text-2xl font-bold text-center mb-2">{content.name}</h1>
                  <p className="text-primary text-center mb-4">{content.title}</p>
                  <p className="text-sm text-muted-foreground text-center mb-6">
                    {content.shortBio}
                  </p>

                  <div className="space-y-3">
                    <a
                      href={`mailto:${content.email}`}
                      className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Mail className="h-4 w-4" />
                      {content.email}
                    </a>
                    {content.phone && (
                      <a
                        href={`tel:${content.phone}`}
                        className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Phone className="h-4 w-4" />
                        {content.phone}
                      </a>
                    )}
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {content.location}
                    </div>
                  </div>
                </div>

                <Button className="w-full" size="lg" asChild>
                  <Link href={content.ctaLink}>{content.ctaText}</Link>
                </Button>
              </div>
            </div>

            {/* Right Column - Content */}
            <div className="lg:col-span-2 space-y-12">
              <section>
                <h2 className="text-3xl font-bold mb-6">{content.mainHeading}</h2>
                <div 
                  className="prose prose-invert max-w-none text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: content.mainContent }}
                />
              </section>

              {content.qualifications && content.qualifications.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold mb-6">Qualifications & Experience</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {content.qualifications.map((qual) => {
                      const IconComponent = iconMap[qual.icon] || Award
                      return (
                        <div key={qual._id} className="bg-card border border-border rounded-xl p-5">
                          <IconComponent className="h-8 w-8 text-primary mb-3" />
                          <h3 className="font-semibold mb-2">{qual.title}</h3>
                          <p className="text-sm text-muted-foreground">{qual.description}</p>
                        </div>
                      )
                    })}
                  </div>
                </section>
              )}

              {content.philosophyQuote && (
                <section>
                  <h2 className="text-2xl font-bold mb-6">{content.philosophyHeading}</h2>
                  <div className="bg-card border border-border rounded-xl p-6">
                    <blockquote className="text-lg text-muted-foreground italic border-l-4 border-primary pl-4">
                      &ldquo;{content.philosophyQuote}&rdquo;
                    </blockquote>
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
