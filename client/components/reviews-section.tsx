"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { api } from "@/lib/api"
import { Star, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Review {
  _id: string
  image: { url: string }
  studentName?: string
  caption?: string
}

interface ReviewsData {
  sectionTitle: string
  sectionSubtitle: string
  showSection: boolean
  items: Review[]
}

export function ReviewsSection() {
  const [reviews, setReviews] = useState<ReviewsData | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await api.getPublicSettings()
        const data = res.data as { reviews?: ReviewsData }
        if (data?.reviews && data.reviews.showSection && data.reviews.items?.length > 0) {
          setReviews(data.reviews)
        }
      } catch (error) {
        console.error("Failed to fetch reviews:", error)
      }
    }
    fetchReviews()
  }, [])

  if (!reviews || !reviews.showSection || reviews.items.length === 0) {
    return null
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.items.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.items.length) % reviews.items.length)
  }

  // Show 3 items at a time on desktop, 1 on mobile
  const getVisibleItems = () => {
    const items = reviews.items
    if (items.length <= 3) return items
    
    const visible = []
    for (let i = 0; i < Math.min(3, items.length); i++) {
      visible.push(items[(currentIndex + i) % items.length])
    }
    return visible
  }

  return (
    <section className="py-16 px-6 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <h2 className="text-3xl font-bold mb-3">{reviews.sectionTitle}</h2>
          <p className="text-muted-foreground">{reviews.sectionSubtitle}</p>
        </div>

        <div className="relative">
          {/* Navigation Buttons */}
          {reviews.items.length > 3 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 hidden md:flex"
                onClick={prevSlide}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 hidden md:flex"
                onClick={nextSlide}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Reviews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getVisibleItems().map((review, index) => (
              <div
                key={review._id || index}
                className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg"
              >
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src={review.image.url}
                    alt={review.studentName || `Review ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
                {(review.studentName || review.caption) && (
                  <div className="p-4">
                    {review.studentName && (
                      <p className="font-semibold text-sm">{review.studentName}</p>
                    )}
                    {review.caption && (
                      <p className="text-sm text-muted-foreground mt-1">{review.caption}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile Navigation */}
          {reviews.items.length > 1 && (
            <div className="flex justify-center gap-2 mt-6 md:hidden">
              <Button variant="outline" size="icon" onClick={prevSlide}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextSlide}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Dots Indicator */}
          {reviews.items.length > 3 && (
            <div className="flex justify-center gap-2 mt-6">
              {reviews.items.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? "bg-primary" : "bg-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
