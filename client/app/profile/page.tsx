"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  User, 
  Mail, 
  Calendar, 
  BookOpen, 
  GraduationCap,
  Camera,
  Loader2,
  Check
} from "lucide-react"

export default function ProfilePage() {
  const { user, loading, refreshUser } = useAuth()
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    grade: "",
    board: ""
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: "",
        grade: "",
        board: ""
      })
    }
  }, [user, loading, router])

  const handleSave = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem("token")
      await fetch("/api/v1/auth/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })
      await refreshUser()
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      setEditing(false)
    } catch (error) {
      console.error("Failed to update profile:", error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">My Profile</h1>

          {/* Profile Header */}
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                  {user.avatar?.url ? (
                    <img src={user.avatar.url} alt="Avatar" className="h-24 w-24 rounded-full object-cover" />
                  ) : (
                    <User className="h-12 w-12 text-primary" />
                  )}
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-primary rounded-full text-primary-foreground hover:bg-primary/90 transition-colors">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-2xl font-semibold">{user.firstName} {user.lastName}</h2>
                <p className="text-muted-foreground">{user.email}</p>
                <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
                  <span className={`px-2 py-1 rounded-full text-xs ${user.isVerified ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"}`}>
                    {user.isVerified ? "Verified" : "Unverified"}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary capitalize">
                    {user.role}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Personal Information</h3>
              {!editing ? (
                <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : "Save"}
                  </Button>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" /> First Name
                </Label>
                {editing ? (
                  <Input 
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  />
                ) : (
                  <p className="font-medium">{user.firstName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" /> Last Name
                </Label>
                {editing ? (
                  <Input 
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  />
                ) : (
                  <p className="font-medium">{user.lastName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" /> Email
                </Label>
                <p className="font-medium">{user.email}</p>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" /> Member Since
                </Label>
                <p className="font-medium">December 2024</p>
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-6">Academic Information</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-muted-foreground">
                  <BookOpen className="h-4 w-4" /> Exam Board
                </Label>
                {editing ? (
                  <select
                    value={formData.board}
                    onChange={(e) => setFormData({...formData, board: e.target.value})}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="">Select board</option>
                    <option value="cambridge">Cambridge</option>
                    <option value="edexcel">Edexcel</option>
                    <option value="oxford">Oxford</option>
                  </select>
                ) : (
                  <p className="font-medium capitalize">{formData.board || "Not set"}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-muted-foreground">
                  <GraduationCap className="h-4 w-4" /> Study Level
                </Label>
                {editing ? (
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({...formData, grade: e.target.value})}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="">Select level</option>
                    <option value="igcse">IGCSE</option>
                    <option value="olevel">O-Level</option>
                    <option value="alevel">A-Level</option>
                  </select>
                ) : (
                  <p className="font-medium uppercase">{formData.grade || "Not set"}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
