import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/hero-section"
import { RecentPosts } from "@/components/recent-posts"
import { FeaturedQuizzes } from "@/components/featured-quizzes"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <HeroSection />
        <RecentPosts />
        <FeaturedQuizzes />
      </main>
      <Footer />
    </div>
  )
}
