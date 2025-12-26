import { toast as sonnerToast } from 'sonner'
import { ApiError, getErrorMessage, ErrorCodes } from './errors'

type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading'

interface ToastOptions {
    description?: string
    duration?: number
    action?: {
        label: string
        onClick: () => void
    }
}

/**
 * Toast utility with consistent styling and error handling
 */
export const toast = {
    /**
     * Show success toast
     */
    success(message: string, options?: ToastOptions) {
        return sonnerToast.success(message, {
            description: options?.description,
            duration: options?.duration || 4000,
            action: options?.action ? {
                label: options.action.label,
                onClick: options.action.onClick
            } : undefined
        })
    },

    /**
     * Show error toast - handles ApiError, Error, or string
     */
    error(error: ApiError | Error | string, options?: ToastOptions) {
        const message = typeof error === 'string' ? error : getErrorMessage(error)
        const description = error instanceof ApiError 
            ? `Code: ${error.code}` 
            : options?.description

        return sonnerToast.error(message, {
            description: process.env.NODE_ENV === 'development' ? description : options?.description,
            duration: options?.duration || 5000,
            action: options?.action ? {
                label: options.action.label,
                onClick: options.action.onClick
            } : undefined
        })
    },

    /**
     * Show warning toast
     */
    warning(message: string, options?: ToastOptions) {
        return sonnerToast.warning(message, {
            description: options?.description,
            duration: options?.duration || 4000,
            action: options?.action ? {
                label: options.action.label,
                onClick: options.action.onClick
            } : undefined
        })
    },

    /**
     * Show info toast
     */
    info(message: string, options?: ToastOptions) {
        return sonnerToast.info(message, {
            description: options?.description,
            duration: options?.duration || 4000,
            action: options?.action ? {
                label: options.action.label,
                onClick: options.action.onClick
            } : undefined
        })
    },

    /**
     * Show loading toast - returns dismiss function
     */
    loading(message: string) {
        return sonnerToast.loading(message)
    },

    /**
     * Dismiss a specific toast or all toasts
     */
    dismiss(toastId?: string | number) {
        sonnerToast.dismiss(toastId)
    },

    /**
     * Promise-based toast for async operations
     */
    promise<T>(
        promise: Promise<T>,
        messages: {
            loading: string
            success: string | ((data: T) => string)
            error: string | ((error: Error) => string)
        }
    ) {
        return sonnerToast.promise(promise, {
            loading: messages.loading,
            success: messages.success,
            error: (err) => {
                if (typeof messages.error === 'function') {
                    return messages.error(err)
                }
                return getErrorMessage(err) || messages.error
            }
        })
    }
}

/**
 * Handle API response with toast notifications
 */
export function handleApiResponse<T>(
    response: { success: boolean; message?: string; data?: T },
    options?: {
        successMessage?: string
        showSuccess?: boolean
    }
): T | undefined {
    if (response.success) {
        if (options?.showSuccess !== false) {
            toast.success(options?.successMessage || response.message || 'Operation successful')
        }
        return response.data
    }
    return undefined
}

/**
 * Handle API error with toast notification
 */
export function handleApiError(error: unknown, fallbackMessage = 'An error occurred') {
    if (error instanceof ApiError) {
        // Don't show toast for auth errors that will redirect
        if (error.requiresReauth()) {
            toast.error('Session expired. Please log in again.')
            return
        }
        toast.error(error)
    } else if (error instanceof Error) {
        toast.error(error.message || fallbackMessage)
    } else {
        toast.error(fallbackMessage)
    }
}
