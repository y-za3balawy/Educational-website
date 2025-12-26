"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import {
  Search,
  MoreVertical,
  User,
  Shield,
  ShieldCheck,
  Mail,
  Calendar,
  Loader2
} from "lucide-react"

interface UserData {
  _id: string
  firstName: string
  lastName: string
  email: string
  role: string
  board?: string
  grade?: string
  isVerified: boolean
  createdAt: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [actionMenu, setActionMenu] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    try {
      const res = await api.getUsers({ limit: "100" })
      setUsers((res.data as { users: UserData[] })?.users || [])
    } catch (error) {
      console.error("Failed to fetch users:", error)
      // Mock data for demo
      setUsers([
        { _id: "1", firstName: "John", lastName: "Doe", email: "john@example.com", role: "student", board: "cambridge", grade: "extended", isVerified: true, createdAt: new Date().toISOString() },
        { _id: "2", firstName: "Jane", lastName: "Smith", email: "jane@example.com", role: "student", board: "edexcel", grade: "core", isVerified: true, createdAt: new Date().toISOString() },
        { _id: "3", firstName: "Admin", lastName: "User", email: "admin@example.com", role: "admin", isVerified: true, createdAt: new Date().toISOString() },
      ])
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(search.toLowerCase()) ||
      user.lastName.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const roleColors: Record<string, string> = {
    superAdmin: "bg-red-500/10 text-red-500",
    admin: "bg-purple-500/10 text-purple-500",
    student: "bg-blue-500/10 text-blue-500",
    parent: "bg-green-500/10 text-green-500"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-muted-foreground">Manage user accounts and permissions</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="px-3 py-1 bg-muted rounded-lg">
            <span className="text-muted-foreground">Total:</span> <span className="font-medium">{users.length}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex gap-2">
          {["all", "student", "parent", "admin"].map((role) => (
            <Button
              key={role}
              variant={roleFilter === role ? "default" : "outline"}
              size="sm"
              onClick={() => setRoleFilter(role)}
            >
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium">User</th>
                  <th className="text-left px-4 py-3 text-sm font-medium hidden md:table-cell">Email</th>
                  <th className="text-left px-4 py-3 text-sm font-medium">Role</th>
                  <th className="text-left px-4 py-3 text-sm font-medium hidden lg:table-cell">Board/Level</th>
                  <th className="text-left px-4 py-3 text-sm font-medium hidden lg:table-cell">Joined</th>
                  <th className="text-right px-4 py-3 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{user.firstName} {user.lastName}</div>
                          <div className="text-xs text-muted-foreground md:hidden">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${roleColors[user.role] || "bg-muted"}`}>
                        {user.role === "admin" || user.role === "superAdmin" ? (
                          <ShieldCheck className="h-3 w-3" />
                        ) : (
                          <Shield className="h-3 w-3" />
                        )}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell">
                      {user.board && user.grade ? (
                        <span>{user.board} / {user.grade}</span>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setActionMenu(actionMenu === user._id ? null : user._id)}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                        {actionMenu === user._id && (
                          <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg py-1 z-10 min-w-[140px]">
                            <button className="w-full px-4 py-2 text-sm text-left hover:bg-muted">
                              View Profile
                            </button>
                            <button className="w-full px-4 py-2 text-sm text-left hover:bg-muted">
                              Edit User
                            </button>
                            <button className="w-full px-4 py-2 text-sm text-left hover:bg-muted text-destructive">
                              Suspend User
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
