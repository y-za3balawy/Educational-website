import Link from "next/link"
import { TrendingUp, Mail, Phone } from "lucide-react"

export function Footer() {
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
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-4">Contact</h4>
            <div className="flex flex-col gap-2">
              <a
                href="mailto:contact@bioigcse.com"
                className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                contact@bioigcse.com
              </a>
              <a
                href="tel:+1234567890"
                className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
              >
                <Phone className="h-4 w-4" />
                +123 456 7890
              </a>
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
