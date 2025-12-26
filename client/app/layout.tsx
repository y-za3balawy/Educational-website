import type React from "react"
import type { Metadata } from "next"
import { Inter, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "sonner"
import { AuthProvider } from "@/lib/auth-context"
import { ThemeProvider } from "@/components/theme-provider"
import { ErrorBoundary } from "@/components/error-boundary"
import { ApiErrorHandler } from "@/components/api-error-handler"
import "./globals.css"

const _inter = Inter({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Mr. Mahmoud Said | Business & Economics",
  description: "Master Business and Economics with expert teaching by Mr. Mahmoud Said. Access past papers, mark schemes, quizzes, and study resources for Cambridge, Edexcel, and Oxford boards.",
  generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
        >
          <AuthProvider>
            <ApiErrorHandler>
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </ApiErrorHandler>
          </AuthProvider>
          <Toaster 
            position="top-right"
            expand={false}
            richColors
            closeButton
            theme="system"
            toastOptions={{
              duration: 4000,
              className: 'font-sans'
            }}
          />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
