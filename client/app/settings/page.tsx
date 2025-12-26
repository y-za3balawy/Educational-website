"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { 
  Lock, 
  Mail, 
  LogOut, 
  Globe, 
  Moon, 
  Bell,
  Trash2,
  Eye,
  Loader2,
  AlertTriangle,
  Check
} from "lucide-react"

export default function SettingsPage() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: ""
  })
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  // Preferences state
  const [notifications, setNotifications] = useState(true)
  const [language, setLanguage] = useState("en")

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  const handlePasswordChange = async () => {
    setPasswordError(null)
    
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setPasswordError("New passwords do not match")
      return
    }
    
    if (passwordData.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters")
      return
    }

    setChangingPassword(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/v1/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          confirmNewPassword: passwordData.confirmNewPassword
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to change password")
      }
      
      setPasswordSuccess(true)
      setPasswordData({ currentPassword: "", newPassword: "", confirmNewPassword: "" })
      setTimeout(() => setPasswordSuccess(false), 3000)
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : "Failed to change password")
    } finally {
      setChangingPassword(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const handleDeleteAccount = async () => {
    // Implement account deletion
    alert("Account deletion would be implemented here")
    setShowDeleteConfirm(false)
  }

  if (loading || !mounted) {
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
          <h1 className="text-3xl font-bold mb-8">Settings</h1>

          {/* Account Settings */}
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Lock className="h-5 w-5" /> Account Settings
            </h2>

            {/* Change Password */}
            <div className="mb-6 pb-6 border-b border-border">
              <h3 className="font-medium mb-4">Change Password</h3>
              
              {passwordError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm mb-4">
                  {passwordError}
                </div>
              )}
              
              {passwordSuccess && (
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-sm mb-4 flex items-center gap-2">
                  <Check className="h-4 w-4" /> Password changed successfully
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <Input 
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    placeholder="••••••••"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input 
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm New Password</Label>
                    <Input 
                      type="password"
                      value={passwordData.confirmNewPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmNewPassword: e.target.value})}
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <Button onClick={handlePasswordChange} disabled={changingPassword}>
                  {changingPassword ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Update Password
                </Button>
              </div>
            </div>

            {/* Update Email */}
            <div className="mb-6 pb-6 border-b border-border">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <Mail className="h-4 w-4" /> Email Address
              </h3>
              <p className="text-sm text-muted-foreground mb-2">Current: {user.email}</p>
              <Button variant="outline" size="sm">Change Email</Button>
            </div>

            {/* Logout */}
            <div>
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <LogOut className="h-4 w-4" /> Session
              </h3>
              <Button variant="outline" onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold mb-6">Preferences</h2>

            <div className="space-y-6">
              {/* Language */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Language</p>
                    <p className="text-sm text-muted-foreground">Select your preferred language</p>
                  </div>
                </div>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="en">English</option>
                  <option value="ar">العربية</option>
                </select>
              </div>

              {/* Theme */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Moon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Theme</p>
                    <p className="text-sm text-muted-foreground">Choose light or dark mode</p>
                  </div>
                </div>
                <select
                  value={resolvedTheme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>

              {/* Notifications */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive email notifications</p>
                  </div>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>
            </div>
          </div>

          {/* Privacy & Security */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Eye className="h-5 w-5" /> Privacy & Security
            </h2>

            <div className="space-y-6">
              {/* Data Visibility */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Profile Visibility</p>
                  <p className="text-sm text-muted-foreground">Control who can see your profile</p>
                </div>
                <select className="h-10 px-3 rounded-md border border-input bg-background text-sm">
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>

              {/* Delete Account */}
              <div className="pt-6 border-t border-border">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-red-500">Delete Account</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    {!showDeleteConfirm ? (
                      <Button variant="destructive" size="sm" onClick={() => setShowDeleteConfirm(true)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)}>
                          Cancel
                        </Button>
                        <Button variant="destructive" size="sm" onClick={handleDeleteAccount}>
                          Confirm Delete
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
