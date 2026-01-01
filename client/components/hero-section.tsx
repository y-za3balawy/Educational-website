"use client"

import { useEffect, useState, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"

interface SliderImage {
  _id: string
  image: { url: string }
  title?: string
  order: number
  isActive: boolean
}

interface HeroSettings {
  sliderImages?: SliderImage[]
  sliderAutoPlay: boolean
  sliderInterval: number
  backgroundImage?: { url: string }
  imagePosition: string
  imageSize: string
  overlayOpacity: number
  // Text content
  badge: string
  headline: string
  subheadline: string
  description: string
  ctaText: string
  ctaLink: string
}

const defaultHero: HeroSettings = {
  sliderImages: [],
  sliderAutoPlay: true,
  sliderInterval: 5000,
  imagePosition: "center",
  imageSize: "cover",
  overlayOpacity: 40,
  badge: "Students love our engaging classes!",
  headline: "Welcome to IG Business Hub",
  subheadline: "",
  description: "Explore resources, courses, and materials for IGCSE Business and Economics.",
  ctaText: "Learn",
  ctaLink: "/past-papers"
}

export function HeroSection() {
  const [hero, setHero] = useState<HeroSettings>(defaultHero)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Get active slides sorted by order
  const activeSlides = (hero.sliderImages || [])
    .filter(s => s.isActive)
    .sort((a, b) => a.order - b.order)

  const nextSlide = useCallback(() => {
    if (activeSlides.length > 1) {
      setCurrentSlide(prev => (prev + 1) % activeSlides.length)
    }
  }, [activeSlides.length])

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await api.getPublicSettings()
        const data = res.data as { hero?: HeroSettings }
        if (data?.hero) {
          console.log('Hero settings loaded:', data.hero)
          console.log('Slider images:', data.hero.sliderImages)
          setHero({ ...defaultHero, ...data.hero })
        }
      } catch (error) {
        console.error("Failed to fetch hero settings:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchSettings()
  }, [])

  // Auto-play slider
  useEffect(() => {
    if (!hero.sliderAutoPlay || activeSlides.length <= 1) return
    
    const interval = setInterval(nextSlide, hero.sliderInterval || 5000)
    return () => clearInterval(interval)
  }, [hero.sliderAutoPlay, hero.sliderInterval, activeSlides.length, nextSlide])

  // Generate image position class
  const getImagePositionClass = () => {
    switch (hero.imagePosition) {
      case "left": return "object-left"
      case "center": return "object-center"
      case "right": return "object-right"
      default: return "object-center"
    }
  }

  // Generate image size class
  const getImageSizeClass = () => {
    switch (hero.imageSize) {
      case "cover": return "object-cover"
      case "contain": return "object-contain"
      default: return "object-cover"
    }
  }

  // Generate overlay style
  const getOverlayStyle = () => {
    const opacity = hero.overlayOpacity / 100
    return { background: `rgba(0, 0, 0, ${opacity})` }
  }

  // Get current image URL
  const getCurrentImageUrl = () => {
    if (activeSlides.length > 0) {
      return activeSlides[currentSlide]?.image?.url
    }
    return hero.backgroundImage?.url
  }

  const currentImageUrl = getCurrentImageUrl()

  if (isLoading) {
    return (
      <section className="relative h-screen flex items-center justify-center bg-black">
        <div className="animate-pulse text-white/50">Loading...</div>
      </section>
    )
  }

  return (
    <section className="relative h-screen flex items-center overflow-hidden bg-black">
      {/* Background Image / Slider */}
      {currentImageUrl && (
        <div className="absolute inset-0 z-0">
          <Image
            src={currentImageUrl}
            alt="Hero Background"
            fill
            className={`${getImageSizeClass()} ${getImagePositionClass()} transition-opacity duration-500`}
            priority
            unoptimized
            onError={(e) => {
              console.error('Hero image failed to load:', currentImageUrl)
              e.currentTarget.style.display = 'none'
            }}
          />
          <div className="absolute inset-0" style={getOverlayStyle()} />
        </div>
      )}

      {/* Text Content Overlay */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 w-full">
        <div className="max-w-xl">
          {/* Badge */}
          {hero.badge && (
            <div className="flex items-center gap-1 text-yellow-400 text-sm mb-4">
              <Star className="h-4 w-4 fill-current" />
              <Star className="h-4 w-4 fill-current" />
              <Star className="h-4 w-4 fill-current" />
              <Star className="h-4 w-4 fill-current" />
              <Star className="h-4 w-4 fill-current" />
              <span className="text-white ml-2">{hero.badge}</span>
            </div>
          )}

          {/* Headline */}
          {hero.headline && (
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
              {hero.headline}
            </h1>
          )}

          {/* Subheadline */}
          {hero.subheadline && (
            <h2 className="text-2xl md:text-3xl text-white/90 mb-4">
              {hero.subheadline}
            </h2>
          )}

          {/* Description */}
          {hero.description && (
            <p className="text-white/80 text-lg mb-8 max-w-md">
              {hero.description}
            </p>
          )}

          {/* CTA Button */}
          {hero.ctaText && (
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white px-8">
              <Link href={hero.ctaLink || "/past-papers"}>
                {hero.ctaText}
              </Link>
            </Button>
          )}
        </div>
      </div>



      {/* Slider Navigation Dots */}
      {activeSlides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {activeSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide ? 'bg-white w-6' : 'bg-white/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Fallback when no images */}
      {!currentImageUrl && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black z-0" />
      )}
    </section>
  )
}
