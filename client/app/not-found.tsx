import { Button } from '@/components/ui/button'
import { FileQuestion, Home, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

/**
 * Next.js 404 Not Found Page
 */
export default function NotFoundPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background">
            <div className="text-center max-w-md">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileQuestion className="w-10 h-10 text-muted-foreground" />
                </div>
                <h1 className="text-6xl font-bold text-primary mb-2">404</h1>
                <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
                <p className="text-muted-foreground mb-8">
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <div className="flex gap-3 justify-center">
                    <Button variant="outline" asChild>
                        <Link href="javascript:history.back()">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Go Back
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/">
                            <Home className="w-4 h-4 mr-2" />
                            Go Home
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
