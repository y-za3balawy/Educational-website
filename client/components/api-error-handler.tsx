"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { toast } from '@/lib/toast'
import { ApiError, ErrorCodes } from '@/lib/errors'

/**
 * Global API Error Handler Component
 * Subscribes to API errors and shows toast notifications
 */
export function ApiErrorHandler({ children }: { children: React.ReactNode }) {
    const router = useRouter()

    useEffect(() => {
        // Subscribe to API errors
        const unsubscribe = api.onError((error: ApiError) => {
            // Show toast for all errors
            toast.error(error)

            // Redirect to login for auth errors
            if (error.isAuthError && error.requiresReauth()) {
                // Small delay to let toast show
                setTimeout(() => {
                    router.push('/login')
                }, 1500)
            }
        })

        return () => {
            unsubscribe()
        }
    }, [router])

    return <>{children}</>
}
