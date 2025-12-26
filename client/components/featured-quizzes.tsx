"use client"

import Link from "next/link"
import { ArrowRight, Clock, HelpCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"

interface Quiz {
  _id: string
  title: string
  duration: number
  level: string
  questions: string[]
}

export function FeaturedQuizzes() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchQuizzes() {
      try {
        const response = await api.getQuizzes({ limit: "3" })
        setQuizzes((response.data as { quizzes: Quiz[] })?.quizzes || [])
      } catch (err) {
        console.error("Failed to fetch quizzes:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchQuizzes()
  }, [])

  const getDifficultyLabel = (level: string) => {
    switch (level) {
      case "igcse": return "Medium"
      case "olevel": return "Easy"
      case "alevel": return "Hard"
      default: return "Medium"
    }
  }

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "igcse": return "bg-yellow-500/10 text-yellow-500"
      case "olevel": return "bg-green-500/10 text-green-500"
      case "alevel": return "bg-red-500/10 text-red-500"
      default: return "bg-yellow-500/10 text-yellow-500"
    }
  }

  // Fallback data
  const fallbackQuizzes = [
    { _id: "1", title: "Cell Structure & Function", questions: Array(15), duration: 10, level: "igcse" },
    { _id: "2", title: "Enzymes & Digestion", questions: Array(12), duration: 8, level: "olevel" },
    { _id: "3", title: "Genetics & Inheritance", questions: Array(20), duration: 15, level: "alevel" },
  ]

  const displayQuizzes = quizzes.length > 0 ? quizzes : fallbackQuizzes

  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold mb-2">Test Your Knowledge</h2>
            <p className="text-muted-foreground">Interactive quizzes with instant feedback</p>
          </div>
          <Button asChild variant="ghost" className="gap-2 hidden md:flex">
            <Link href="/quizzes">
              All quizzes
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {displayQuizzes.map((quiz) => (
              <div
                key={quiz._id}
                className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors"
              >
                <h3 className="font-semibold text-lg mb-4">{quiz.title}</h3>
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <HelpCircle className="h-4 w-4" />
                    {quiz.questions?.length || 0} questions
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {quiz.duration} min
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(quiz.level)}`}>
                    {getDifficultyLabel(quiz.level)}
                  </span>
                  <Button asChild size="sm">
                    <Link href={`/quizzes/${quiz._id}`}>Start Quiz</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center md:hidden">
          <Button asChild variant="ghost" className="gap-2">
            <Link href="/quizzes">
              All quizzes
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
