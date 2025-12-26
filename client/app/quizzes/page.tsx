"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { Clock, HelpCircle, Target, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"

interface Quiz {
  _id: string
  title: string
  description?: string
  topic: string
  level: string
  board: string
  duration: number
  totalPoints: number
  questions: string[]
  isPublished: boolean
}

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchQuizzes() {
      try {
        setLoading(true)
        const response = await api.getQuizzes({ limit: "20" })
        setQuizzes((response.data as { quizzes: Quiz[] })?.quizzes || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load quizzes")
      } finally {
        setLoading(false)
      }
    }
    fetchQuizzes()
  }, [])

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "igcse":
        return "bg-green-500/10 text-green-500"
      case "olevel":
        return "bg-yellow-500/10 text-yellow-500"
      case "alevel":
        return "bg-red-500/10 text-red-500"
      default:
        return "bg-blue-500/10 text-blue-500"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4">Interactive Quizzes</h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Test your biology knowledge with our interactive quizzes. Get instant feedback and track your progress
              across different topics.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <div className="bg-card border border-border rounded-xl p-5 text-center">
              <div className="text-3xl font-bold text-primary mb-1">{quizzes.length}</div>
              <div className="text-sm text-muted-foreground">Total Quizzes</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-5 text-center">
              <div className="text-3xl font-bold text-primary mb-1">
                {quizzes.reduce((acc, q) => acc + (q.questions?.length || 0), 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Questions</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-5 text-center">
              <div className="text-3xl font-bold text-primary mb-1">
                {quizzes.reduce((acc, q) => acc + q.totalPoints, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Points</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-5 text-center">
              <div className="text-3xl font-bold text-primary mb-1">
                {quizzes.filter(q => q.isPublished).length}
              </div>
              <div className="text-sm text-muted-foreground">Published</div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">{error}</p>
              <p className="text-muted-foreground">Make sure the backend server is running and you are logged in</p>
            </div>
          ) : quizzes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No quizzes available yet. Check back later!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {quizzes.map((quiz) => (
                <div
                  key={quiz._id}
                  className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="text-xs text-primary font-medium">{quiz.topic}</span>
                      <h3 className="text-xl font-semibold mt-1">{quiz.title}</h3>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full uppercase ${getDifficultyColor(quiz.level)}`}>
                      {quiz.level}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground mb-6">
                    {quiz.description || `Test your knowledge on ${quiz.topic}`}
                  </p>

                  <div className="flex items-center gap-4 mb-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <HelpCircle className="h-4 w-4" />
                      {quiz.questions?.length || 0} questions
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {quiz.duration} min
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      {quiz.totalPoints} pts
                    </div>
                  </div>

                  <Button asChild className="w-full">
                    <Link href={`/quizzes/${quiz._id}`}>Start Quiz</Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
