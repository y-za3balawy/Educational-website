"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { api } from "./api"

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  isVerified: boolean
  avatar?: { url: string }
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = async () => {
    try {
      const token = api.getToken()
      if (!token) {
        setUser(null)
        return
      }
      const response = await api.getMe()
      const userData = (response.data as { user: User })?.user
      setUser(userData || null)
    } catch {
      setUser(null)
      api.logout()
    }
  }

  useEffect(() => {
    refreshUser().finally(() => setLoading(false))
  }, [])

  const login = async (email: string, password: string) => {
    const response = await api.login(email, password)
    const userData = (response.data as { user: User })?.user
    setUser(userData || null)
  }

  const logout = () => {
    api.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
