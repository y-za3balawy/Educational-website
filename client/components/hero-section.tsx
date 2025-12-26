"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, BookOpen, FileText, Brain } from "lucide-react"
import { api } from "@/lib/api"

interface HeroSettings {
  backgroundImage?: { url: string }
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

const defaultHero: HeroSettings = {
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
}

export function HeroSection() {
  const [hero, setHero] = useState<HeroSettings>(defaultHero)

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await api.getPublicSettings()
        const data = res.data as { hero?: HeroSettings }
        if (data?.hero) {
          setHero({ ...defaultHero, ...data.hero })
        }
      } catch (error) {
        console.error("Failed to fetch hero settings:", error)
      }
    }
    fetchSettings()
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 pb-16 px-6 overflow-hidden">
      {/* Background Image */}
      {hero.backgroundImage?.url && (
        <div className="absolute inset-0 z-0">
          <Image
            src={hero.backgroundImage.url}
            alt="Hero Background"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/70" />
        </div>
      )}
      
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              {hero.badge}
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-balance">
              {hero.headline} <span className="text-primary">{hero.subheadline}</span>
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
              {hero.description}
            </p>

            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="gap-2">
                <Link href={hero.ctaLink}>
                  {hero.ctaText}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href={hero.secondaryCtaLink}>{hero.secondaryCtaText}</Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-6 hover:border-primary/50 transition-colors">
                <FileText className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-semibold mb-2">Past Papers</h3>
                <p className="text-sm text-muted-foreground">Complete collection with detailed mark schemes</p>
              </div>
              <div className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-6 hover:border-primary/50 transition-colors">
                <Brain className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-semibold mb-2">Interactive Quizzes</h3>
                <p className="text-sm text-muted-foreground">Test your knowledge with instant feedback</p>
              </div>
            </div>
            <div className="space-y-4 mt-8">
              <div className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-6 hover:border-primary/50 transition-colors">
                <BookOpen className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-semibold mb-2">Study Resources</h3>
                <p className="text-sm text-muted-foreground">Curated notes and learning materials</p>
              </div>
              <div className="bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-xl p-6">
                <div className="text-3xl font-bold text-primary mb-2">{hero.statsNumber}</div>
                <p className="text-sm text-muted-foreground">{hero.statsLabel}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
