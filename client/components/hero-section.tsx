import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BookOpen, FileText, Brain } from "lucide-react"

export function HeroSection() {
  return (
    <section className="min-h-screen flex items-center justify-center pt-20 pb-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Now accepting new students
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-balance">
              Master <span className="text-primary">Business & Economics</span> with Mr. Mahmoud Said
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
              Access comprehensive study materials, past papers with mark schemes, interactive quizzes, and personalized
              teaching for Cambridge, Edexcel, and Oxford O-Level & A-Level examinations.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="gap-2">
                <Link href="/past-papers">
                  Browse Past Papers
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors">
                <FileText className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-semibold mb-2">Past Papers</h3>
                <p className="text-sm text-muted-foreground">Complete collection with detailed mark schemes</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors">
                <Brain className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-semibold mb-2">Interactive Quizzes</h3>
                <p className="text-sm text-muted-foreground">Test your knowledge with instant feedback</p>
              </div>
            </div>
            <div className="space-y-4 mt-8">
              <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors">
                <BookOpen className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-semibold mb-2">Study Resources</h3>
                <p className="text-sm text-muted-foreground">Curated notes and learning materials</p>
              </div>
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-6">
                <div className="text-3xl font-bold text-primary mb-2">500+</div>
                <p className="text-sm text-muted-foreground">Students taught successfully</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
