"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ReviewsSection } from "@/components/reviews-section"
import { Loader2 } from "lucide-react"
import { api } from "@/lib/api"
import Image from "next/image"

interface AboutContent {
  name: string
  title: string
  profileImage?: { url: string }
  heroDescription: string
  heroHeadline: string
  places: string[]
}

const DEFAULT_PLACES = [
  "Golden gate school",
  "Maverick's international school",
  "Utopia international school",
  "AAA centre based in MADINATY",
  "Success canter based in MADINATY",
  "IG way based in REHAB",
  "CLICK COURSES in middle east",
  "IG A STAR platform",
  "COURSEILLA (new IG centre)",
  "Courses creator in (UDMY)",
  "Online courses creator for (social media platforms)",
  "achievers platform (Qatar and Kuwait)",
  "Scholar centre based in DOKI",
  "Trust Centre (based in UAE)",
  "Drs4us (online IG centre)"
]

export default function AboutPage() {
  const [about, setAbout] = useState<AboutContent | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchContent() {
      try {
        const res = await api.getAboutContent()
        const data = res.data as { about: AboutContent }
        setAbout(data.about)
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

  const places = about?.places?.length ? about.places : DEFAULT_PLACES
  const heroHeadline = about?.heroHeadline || "Welcome to Mr. Mahmoud's Hub"
  const heroDescription = about?.heroDescription || "As an IGCSE Business teacher with nine years of experience, I have had the pleasure of guiding students through the intricacies of the Cambridge, Edexcel, and Oxford examination boards."

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative min-h-screen bg-black">
        <div className="grid lg:grid-cols-2 min-h-screen">
          <div className="relative h-[50vh] lg:h-auto">
            {about?.profileImage?.url ? (
              <Image
                src={about.profileImage.url}
                alt={about.name || "Mr. Mahmoud"}
                fill
                className="object-cover object-top"
                priority
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent lg:hidden" />
          </div>

          <div className="relative flex flex-col justify-center px-8 py-12 lg:px-16 lg:py-24 bg-black/90 lg:bg-transparent">
            <div className="max-w-xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-white mb-8 leading-tight">
                {heroHeadline}
              </h1>
              <p className="text-white/80 text-base md:text-lg leading-relaxed">
                {heroDescription}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Places Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-background to-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">PLACES</h2>
            <p className="text-muted-foreground">Where our courses are available</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {places.map((place, index) => (
              <div 
                key={index} 
                className="group p-4 rounded-xl bg-card border border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary group-hover:scale-125 transition-transform" />
                  <span className="text-foreground group-hover:text-primary transition-colors">
                    {place}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ReviewsSection />
      <Footer />
    </div>
  )
}
