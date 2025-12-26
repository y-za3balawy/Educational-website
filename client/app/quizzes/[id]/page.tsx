"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle, RotateCcw, Loader2, Clock, Target } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { api } from "@/lib/api"

interface Question {
  _id: string
  text: string
  type: string
  options?: { text: string; _id: string }[]
  points: number
  explanation?: string
}

interface Quiz {
  _id: string
  title: string
  description?: string
  topic: string
  duration: number
  totalPoints: number
  instructions?: string
  questions: Question[]
}

interface QuizSession {
  questions: Question[]
  quiz: { id: string; title: string; duration: number; totalPoints: number }
}

export default function QuizPage() {
  const params = useParams()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [session, setSession] = useState<QuizSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [started, setStarted] = useState(false)
  
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [quizComplete, setQuizComplete] = useState(false)
  const [correctAnswers, setCorrectAnswers] = useState<number[]>([])

  useEffect(() => {
    async function fetchQuiz() {
      try {
        const response = await api.getQuiz(params.id as string)
        setQuiz((response.data as { quiz: Quiz })?.quiz || null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load quiz")
      } finally {
        setLoading(false)
      }
    }
    if (params.id) {
      fetchQuiz()
    }
  }, [params.id])

  const handleStartQuiz = async () => {
    try {
      setLoading(true)
      const response = await api.startQuiz(params.id as string)
      const data = response.data as QuizSession
      setSession(data)
      setAnswers(new Array(data.questions.length).fill(null))
      // Store correct answers (index of correct option)
      const correct = data.questions.map(q => {
        if (q.options) {
          return q.options.findIndex((opt: { text: string; _id: string }) => (opt as unknown as { isCorrect?: boolean }).isCorrect)
        }
        return -1
      })
      setCorrectAnswers(correct)
      setStarted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start quiz")
    } finally {
      setLoading(false)
    }
  }

  const questions = session?.questions || quiz?.questions || []
  const question = questions[currentQuestion]

  const handleAnswer = (index: number) => {
    if (showResult) return
    setSelectedAnswer(index)
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = index
    setAnswers(newAnswers)
  }

  const handleCheck = () => {
    setShowResult(true)
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(answers[currentQuestion + 1])
      setShowResult(false)
    } else {
      setQuizComplete(true)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
      setSelectedAnswer(answers[currentQuestion - 1])
      setShowResult(answers[currentQuestion - 1] !== null)
    }
  }

  const handleRestart = () => {
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setAnswers(new Array(questions.length).fill(null))
    setQuizComplete(false)
    setStarted(false)
    setSession(null)
  }

  // Calculate score based on correct answers
  const score = answers.filter((answer, index) => answer === correctAnswers[index]).length
  const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-24 pb-16 px-6">
          <div className="max-w-2xl mx-auto flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-24 pb-16 px-6">
          <div className="max-w-2xl mx-auto text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Quiz Not Found</h1>
            <p className="text-muted-foreground mb-6">{error || "The quiz you're looking for doesn't exist."}</p>
            <Button asChild>
              <Link href="/quizzes">Back to Quizzes</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Quiz intro screen
  if (!started) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-24 pb-16 px-6">
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <Link href="/quizzes" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" />
                Back to Quizzes
              </Link>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-8">
              <h1 className="text-2xl font-bold mb-2">{quiz.title}</h1>
              {quiz.description && <p className="text-muted-foreground mb-6">{quiz.description}</p>}
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Clock className="h-4 w-4" />
                    Duration
                  </div>
                  <div className="font-semibold">{quiz.duration} minutes</div>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Target className="h-4 w-4" />
                    Questions
                  </div>
                  <div className="font-semibold">{quiz.questions?.length || 0} questions</div>
                </div>
              </div>

              {quiz.instructions && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
                  <h3 className="font-medium mb-2">Instructions</h3>
                  <p className="text-sm text-muted-foreground">{quiz.instructions}</p>
                </div>
              )}

              <Button onClick={handleStartQuiz} className="w-full" size="lg">
                Start Quiz
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Quiz complete screen
  if (quizComplete) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-24 pb-16 px-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <div className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center ${
                percentage >= 70 ? "bg-green-500/10" : percentage >= 50 ? "bg-yellow-500/10" : "bg-red-500/10"
              }`}>
                <span className={`text-4xl font-bold ${
                  percentage >= 70 ? "text-green-500" : percentage >= 50 ? "text-yellow-500" : "text-red-500"
                }`}>
                  {percentage}%
                </span>
              </div>

              <h2 className="text-2xl font-bold mb-2">Quiz Complete!</h2>
              <p className="text-muted-foreground mb-6">
                You scored {score} out of {questions.length} questions correctly.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={handleRestart} variant="outline" className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Try Again
                </Button>
                <Button asChild>
                  <Link href="/quizzes">Back to Quizzes</Link>
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Quiz question screen
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl font-bold">{quiz.title}</h1>
              <span className="text-sm text-muted-foreground">
                Question {currentQuestion + 1} of {questions.length}
              </span>
            </div>

            <div className="h-2 bg-secondary rounded-full mb-8">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              />
            </div>

            <h2 className="text-lg font-medium mb-6">{question?.text}</h2>

            <div className="space-y-3 mb-6">
              {question?.options?.map((option, index) => (
                <button
                  key={option._id || index}
                  onClick={() => handleAnswer(index)}
                  disabled={showResult}
                  className={`w-full p-4 rounded-xl text-left transition-all flex items-center gap-3 ${
                    showResult
                      ? index === correctAnswers[currentQuestion]
                        ? "bg-green-500/10 border-2 border-green-500"
                        : index === selectedAnswer
                          ? "bg-red-500/10 border-2 border-red-500"
                          : "bg-secondary border-2 border-transparent"
                      : selectedAnswer === index
                        ? "bg-primary/10 border-2 border-primary"
                        : "bg-secondary border-2 border-transparent hover:border-primary/50"
                  }`}
                >
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    showResult
                      ? index === correctAnswers[currentQuestion]
                        ? "bg-green-500 text-white"
                        : index === selectedAnswer
                          ? "bg-red-500 text-white"
                          : "bg-muted text-muted-foreground"
                      : selectedAnswer === index
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="flex-1">{option.text}</span>
                  {showResult && index === correctAnswers[currentQuestion] && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                  {showResult && index === selectedAnswer && index !== correctAnswers[currentQuestion] && <XCircle className="h-5 w-5 text-red-500" />}
                </button>
              ))}
            </div>

            {showResult && question?.explanation && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Explanation: </span>
                  {question.explanation}
                </p>
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>

              {!showResult ? (
                <Button onClick={handleCheck} disabled={selectedAnswer === null}>
                  Check Answer
                </Button>
              ) : (
                <Button onClick={handleNext} className="gap-2">
                  {currentQuestion === questions.length - 1 ? "Finish" : "Next"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="flex justify-center gap-2 flex-wrap">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentQuestion(index)
                  setSelectedAnswer(answers[index])
                  setShowResult(answers[index] !== null)
                }}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                  index === currentQuestion
                    ? "bg-primary text-primary-foreground"
                    : answers[index] !== null
                      ? answers[index] === correctAnswers[index]
                        ? "bg-green-500/20 text-green-500"
                        : "bg-red-500/20 text-red-500"
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
