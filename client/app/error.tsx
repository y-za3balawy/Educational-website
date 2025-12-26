"use client"

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

interface ErrorPageProps {
    error: Error & { digest?: string }
    reset: () => void
}

/**
 * Next.js Error Page - handles route segment errors
 */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
    useEffect(() => {
        // Log error to error reporting service
        console.error('Page error:', error)
    }, [error])

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background">
            <div className="text-center max-w-md">
                <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
                <p className="text-muted-foreground mb-8">
                    We encountered an unexpected error while loading this page. 
                    Please try again or return to the home page.
                </p>
                <div className="flex gap-3 justify-center">
                    <Button variant="outline" onClick={reset}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Try Again
                    </Button>
                    <Button asChild>
                        <Link href="/">
                            <Home className="w-4 h-4 mr-2" />
                            Go Home
                        </Link>
                    </Button>
                </div>
                {process.env.NODE_ENV === 'development' && (
                    <details className="mt-8 text-left bg-muted p-4 rounded-lg text-sm">
                        <summary className="cursor-pointer font-medium mb-2">
                            Error Details (Development Only)
                        </summary>
                        <pre className="overflow-auto text-xs text-red-600 dark:text-red-400 whitespace-pre-wrap">
                            {error.message}
                            {error.stack && `\n\n${error.stack}`}
                        </pre>
                        {error.digest && (
                            <p className="mt-2 text-xs text-muted-foreground">
                                Digest: {error.digest}
                            </p>
                        )}
                    </details>
                )}
            </div>
        </div>
    )
}
