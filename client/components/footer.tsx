"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { TrendingUp, Mail, Phone, MapPin } from "lucide-react"
import { api } from "@/lib/api"

interface ContactInfo {
  email: string
  phone: string
  address: string
}

interface SocialLink {
  platform: string
  url: string
}

export function Footer() {
  const [contact, setContact] = useState<ContactInfo>({ email: "", phone: "", address: "" })
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await api.getPublicSettings()
        const data = res.data as { contact?: ContactInfo; socialLinks?: SocialLink[] }
        if (data?.contact) {
          setContact({
            email: data.contact.email || "",
            phone: data.contact.phone || "",
            address: data.contact.address || ""
          })
        }
        if (data?.socialLinks) {
          setSocialLinks(data.socialLinks)
        }
      } catch (error) {
        console.error("Failed to fetch footer settings:", error)
      }
    }
    fetchSettings()
  }, [])

  return (
    <footer className="border-t border-border bg-card">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-6 w-6 text-primary" />
              <span className="font-semibold text-lg">Mr. Mahmoud Said</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
              Helping students excel in Business and Economics with comprehensive resources, past papers, and interactive
              learning materials for Cambridge, Edexcel, and Oxford boards.
            </p>
            {socialLinks.length > 0 && (
              <div className="flex gap-4 mt-4">
                {socialLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.platform}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <h4 className="font-medium mb-4">Quick Links</h4>
            <div className="flex flex-col gap-2">
              <Link href="/past-papers" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Past Papers
              </Link>
              <Link href="/quizzes" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Quizzes
              </Link>
              <Link href="/posts" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Blog Posts
              </Link>
              <Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Contact
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-4">Contact</h4>
            <div className="flex flex-col gap-3">
              {contact.email && (
                <a
                  href={`mailto:${contact.email}`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  {contact.email}
                </a>
              )}
              {contact.phone && (
                <a
                  href={`tel:${contact.phone}`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <Phone className="h-4 w-4" />
                  {contact.phone}
                </a>
              )}
              {contact.address && (
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {contact.address}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Mr. Mahmoud Said. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
