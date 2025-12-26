"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { toast } from "@/lib/toast"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus, Trash2, GripVertical, Loader2 } from "lucide-react"
import Link from "next/link"

interface Question {
  id: string
  type: "mcq" | "trueFalse" | "essay"
  text: string
  options: { text: string; isCorrect: boolean }[]
  points: number
  explanation?: string
}

export default function NewQuizPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [quiz, setQuiz] = useState({
    title: "",
    description: "",
    topic: "",
    chapter: "",
    board: "cambridge",
    level: "igcse",
    duration: 30,
    passingScore: 60,
    maxAttempts: 3,
    shuffleQuestions: false,
    showResults: true,
    showCorrectAnswers: true,
    instructions: ""
  })
  const [questions, setQuestions] = useState<Question[]>([])

  function addQuestion(type: Question["type"]) {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type,
      text: "",
      options: type === "mcq" 
        ? [{ text: "", isCorrect: false }, { text: "", isCorrect: false }, { text: "", isCorrect: false }, { text: "", isCorrect: false }]
        : type === "trueFalse"
        ? [{ text: "True", isCorrect: false }, { text: "False", isCorrect: false }]
        : [],
      points: 1,
      explanation: ""
    }
    setQuestions([...questions, newQuestion])
  }

  function updateQuestion(id: string, updates: Partial<Question>) {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q))
  }

  function removeQuestion(id: string) {
    setQuestions(questions.filter(q => q.id !== id))
  }

  function updateOption(questionId: string, optionIndex: number, text: string) {
    setQuestions(questions.map(q => {
      if (q.id !== questionId) return q
      const newOptions = [...q.options]
      newOptions[optionIndex] = { ...newOptions[optionIndex], text }
      return { ...q, options: newOptions }
    }))
  }

  function setCorrectOption(questionId: string, optionIndex: number) {
    setQuestions(questions.map(q => {
      if (q.id !== questionId) return q
      const newOptions = q.options.map((opt, i) => ({ ...opt, isCorrect: i === optionIndex }))
      return { ...q, options: newOptions }
    }))
  }

  async function handleSave(publish: boolean = false) {
    if (saving) return // Prevent double submission
    if (!quiz.title || !quiz.topic) {
      toast.warning("Please enter a quiz title and topic")
      return
    }
    if (publish && questions.length === 0) {
      toast.warning("Please add at least one question before publishing")
      return
    }
    setSaving(true)
    try {
      // Create quiz - filter out empty strings
      const quizData: Record<string, unknown> = {
        title: quiz.title,
        topic: quiz.topic,
        board: quiz.board,
        level: quiz.level,
        duration: quiz.duration,
        passingScore: quiz.passingScore,
        maxAttempts: quiz.maxAttempts,
        shuffleQuestions: quiz.shuffleQuestions,
        showResults: quiz.showResults,
        showCorrectAnswers: quiz.showCorrectAnswers,
      }
      if (quiz.description) quizData.description = quiz.description
      if (quiz.chapter) quizData.chapter = quiz.chapter
      if (quiz.instructions) quizData.instructions = quiz.instructions
      
      // Always create as draft first
      const res = await api.createQuiz(quizData)
      const quizId = (res.data as { quiz: { _id: string } })?.quiz?._id

      if (!quizId) {
        throw new Error("Failed to create quiz")
      }

      // Add questions
      for (const q of questions) {
        const questionData: Record<string, unknown> = {
          type: q.type,
          text: q.text,
          points: q.points,
        }
        if (q.explanation) questionData.explanation = q.explanation
        if (q.type !== "essay") {
          questionData.options = q.options.map(o => ({ text: o.text, isCorrect: o.isCorrect }))
        }
        await api.addQuestion(quizId, questionData)
      }

      // Publish after questions are added
      if (publish && questions.length > 0) {
        await api.publishQuiz(quizId)
      }

      toast.success(publish ? "Quiz published successfully!" : "Quiz saved as draft")
      router.push("/dashboard/quizzes")
    } catch {
      // Error handled by global handler
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/quizzes"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Create New Quiz</h1>
          <p className="text-muted-foreground">Add questions and configure quiz settings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSave(false)} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Save Draft
          </Button>
          <Button onClick={() => handleSave(true)} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Publish
          </Button>
        </div>
      </div>

      {/* Quiz Details */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h2 className="font-semibold">Quiz Details</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input
              type="text"
              value={quiz.title}
              onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
              className="w-full px-3 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., Cell Biology Quiz"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={quiz.description}
              onChange={(e) => setQuiz({ ...quiz, description: e.target.value })}
              className="w-full px-3 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px]"
              placeholder="Brief description of the quiz..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Topic</label>
            <input
              type="text"
              value={quiz.topic}
              onChange={(e) => setQuiz({ ...quiz, topic: e.target.value })}
              className="w-full px-3 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., Cell Biology"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Chapter</label>
            <input
              type="text"
              value={quiz.chapter}
              onChange={(e) => setQuiz({ ...quiz, chapter: e.target.value })}
              className="w-full px-3 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., Chapter 1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Board</label>
            <select
              value={quiz.board}
              onChange={(e) => setQuiz({ ...quiz, board: e.target.value })}
              className="w-full px-3 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="cambridge">Cambridge</option>
              <option value="edexcel">Edexcel</option>
              <option value="all">All Boards</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Level</label>
            <select
              value={quiz.level}
              onChange={(e) => setQuiz({ ...quiz, level: e.target.value })}
              className="w-full px-3 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="igcse">IGCSE</option>
              <option value="olevel">O Level</option>
              <option value="alevel">A Level</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
            <input
              type="number"
              value={quiz.duration}
              onChange={(e) => setQuiz({ ...quiz, duration: parseInt(e.target.value) || 30 })}
              className="w-full px-3 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Passing Score (%)</label>
            <input
              type="number"
              value={quiz.passingScore}
              onChange={(e) => setQuiz({ ...quiz, passingScore: parseInt(e.target.value) || 60 })}
              className="w-full px-3 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-4 pt-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={quiz.shuffleQuestions}
              onChange={(e) => setQuiz({ ...quiz, shuffleQuestions: e.target.checked })}
              className="rounded"
            />
            Shuffle Questions
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={quiz.showResults}
              onChange={(e) => setQuiz({ ...quiz, showResults: e.target.checked })}
              className="rounded"
            />
            Show Results
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={quiz.showCorrectAnswers}
              onChange={(e) => setQuiz({ ...quiz, showCorrectAnswers: e.target.checked })}
              className="rounded"
            />
            Show Correct Answers
          </label>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Questions ({questions.length})</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => addQuestion("mcq")}>
              <Plus className="h-4 w-4 mr-1" /> MCQ
            </Button>
            <Button variant="outline" size="sm" onClick={() => addQuestion("trueFalse")}>
              <Plus className="h-4 w-4 mr-1" /> True/False
            </Button>
            <Button variant="outline" size="sm" onClick={() => addQuestion("essay")}>
              <Plus className="h-4 w-4 mr-1" /> Essay
            </Button>
          </div>
        </div>

        {questions.length === 0 ? (
          <div className="bg-card border border-border border-dashed rounded-xl p-8 text-center">
            <p className="text-muted-foreground mb-4">No questions added yet</p>
            <Button variant="outline" onClick={() => addQuestion("mcq")}>
              <Plus className="h-4 w-4 mr-2" /> Add First Question
            </Button>
          </div>
        ) : (
          questions.map((q, index) => (
            <div key={q.id} className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-start gap-3">
                <div className="cursor-move text-muted-foreground">
                  <GripVertical className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Question {index + 1}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 bg-muted rounded">{q.type.toUpperCase()}</span>
                      <input
                        type="number"
                        value={q.points}
                        onChange={(e) => updateQuestion(q.id, { points: parseInt(e.target.value) || 1 })}
                        className="w-16 px-2 py-1 bg-muted rounded text-xs text-center"
                        placeholder="Points"
                      />
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeQuestion(q.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <textarea
                    value={q.text}
                    onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
                    className="w-full px-3 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[60px]"
                    placeholder="Enter your question..."
                  />
                  {q.type !== "essay" && (
                    <div className="space-y-2">
                      {q.options.map((opt, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${q.id}`}
                            checked={opt.isCorrect}
                            onChange={() => setCorrectOption(q.id, optIndex)}
                            className="text-primary"
                          />
                          <input
                            type="text"
                            value={opt.text}
                            onChange={(e) => updateOption(q.id, optIndex, e.target.value)}
                            className="flex-1 px-3 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder={`Option ${optIndex + 1}`}
                            disabled={q.type === "trueFalse"}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  <input
                    type="text"
                    value={q.explanation || ""}
                    onChange={(e) => updateQuestion(q.id, { explanation: e.target.value })}
                    className="w-full px-3 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Explanation (optional)"
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
