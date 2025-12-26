"use client"

import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, AlertCircle, RefreshCw, FileQuestion, WifiOff } from 'lucide-react'
import { ApiError, ErrorCodes, getErrorMessage } from '@/lib/errors'

interface LoadingStateProps {
    message?: string
    size?: 'sm' | 'md' | 'lg'
}

/**
 * Loading state component
 */
export function LoadingState({ message = 'Loading...', size = 'md' }: LoadingStateProps) {
    const sizes = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12'
    }
    
    return (
        <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className={`${sizes[size]} animate-spin text-primary mb-3`} />
            <p className="text-muted-foreground text-sm">{message}</p>
        </div>
    )
}

interface ErrorStateProps {
    error: Error | ApiError | string | null
    onRetry?: () => void
    title?: string
    compact?: boolean
}

/**
 * Error state component with retry support
 */
export function ErrorState({ error, onRetry, title, compact = false }: ErrorStateProps) {
    const message = typeof error === 'string' ? error : getErrorMessage(error)
    const isNetworkError = error instanceof ApiError && error.isNetworkError
    const Icon = isNetworkError ? WifiOff : AlertCircle
    
    if (compact) {
        return (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm">
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1">{message}</span>
                {onRetry && (
                    <Button variant="ghost" size="sm" onClick={onRetry} className="h-7 px-2">
                        <RefreshCw className="h-3 w-3" />
                    </Button>
                )}
            </div>
        )
    }
    
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="w-14 h-14 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                <Icon className="w-7 h-7 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold mb-1">{title || 'Something went wrong'}</h3>
            <p className="text-muted-foreground text-center max-w-sm mb-4">{message}</p>
            {onRetry && (
                <Button variant="outline" onClick={onRetry}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                </Button>
            )}
        </div>
    )
}

interface EmptyStateProps {
    title?: string
    message?: string
    icon?: ReactNode
    action?: ReactNode
}

/**
 * Empty state component
 */
export function EmptyState({ 
    title = 'No results found', 
    message = 'There are no items to display.',
    icon,
    action 
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mb-4">
                {icon || <FileQuestion className="w-7 h-7 text-muted-foreground" />}
            </div>
            <h3 className="text-lg font-semibold mb-1">{title}</h3>
            <p className="text-muted-foreground text-center max-w-sm mb-4">{message}</p>
            {action}
        </div>
    )
}

interface AsyncStateProps<T> {
    loading: boolean
    error: Error | ApiError | string | null
    data: T | null | undefined
    onRetry?: () => void
    loadingMessage?: string
    emptyTitle?: string
    emptyMessage?: string
    emptyAction?: ReactNode
    children: (data: T) => ReactNode
    isEmpty?: (data: T) => boolean
}

/**
 * Unified async state handler component
 * Handles loading, error, empty, and success states
 */
export function AsyncState<T>({
    loading,
    error,
    data,
    onRetry,
    loadingMessage,
    emptyTitle,
    emptyMessage,
    emptyAction,
    children,
    isEmpty = (d) => Array.isArray(d) ? d.length === 0 : !d
}: AsyncStateProps<T>) {
    if (loading) {
        return <LoadingState message={loadingMessage} />
    }
    
    if (error) {
        return <ErrorState error={error} onRetry={onRetry} />
    }
    
    if (!data || isEmpty(data)) {
        return (
            <EmptyState 
                title={emptyTitle} 
                message={emptyMessage} 
                action={emptyAction} 
            />
        )
    }
    
    return <>{children(data)}</>
}

/**
 * Inline error message for forms
 */
export function InlineError({ message }: { message?: string }) {
    if (!message) return null
    return (
        <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {message}
        </p>
    )
}

/**
 * Toast-style error notification
 */
export function ErrorToast({ 
    message, 
    onDismiss,
    code 
}: { 
    message: string
    onDismiss?: () => void
    code?: string 
}) {
    return (
        <div className="fixed bottom-4 right-4 max-w-sm bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-start gap-3 animate-in slide-in-from-bottom-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
                <p className="font-medium">{message}</p>
                {code && <p className="text-xs text-red-200 mt-1">Code: {code}</p>}
            </div>
            {onDismiss && (
                <button onClick={onDismiss} className="text-red-200 hover:text-white">
                    ×
                </button>
            )}
        </div>
    )
}
