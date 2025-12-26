"use client"

import { useState, useCallback, useEffect, useRef } from 'react'
import { ApiError, getErrorMessage } from '@/lib/errors'

interface AsyncState<T> {
    data: T | null
    loading: boolean
    error: ApiError | Error | null
}

interface UseAsyncOptions {
    immediate?: boolean
    onSuccess?: (data: unknown) => void
    onError?: (error: ApiError | Error) => void
}

/**
 * Hook for handling async operations with loading, error, and data states
 */
export function useAsync<T, Args extends unknown[] = []>(
    asyncFn: (...args: Args) => Promise<T>,
    options: UseAsyncOptions = {}
) {
    const { immediate = false, onSuccess, onError } = options
    const [state, setState] = useState<AsyncState<T>>({
        data: null,
        loading: immediate,
        error: null
    })
    
    const mountedRef = useRef(true)
    const lastCallId = useRef(0)

    useEffect(() => {
        mountedRef.current = true
        return () => {
            mountedRef.current = false
        }
    }, [])

    const execute = useCallback(async (...args: Args): Promise<T | null> => {
        const callId = ++lastCallId.current
        
        setState(prev => ({ ...prev, loading: true, error: null }))
        
        try {
            const result = await asyncFn(...args)
            
            // Only update state if this is the latest call and component is mounted
            if (mountedRef.current && callId === lastCallId.current) {
                setState({ data: result, loading: false, error: null })
                onSuccess?.(result)
            }
            
            return result
        } catch (err) {
            const error = err instanceof ApiError || err instanceof Error 
                ? err 
                : new Error(String(err))
            
            if (mountedRef.current && callId === lastCallId.current) {
                setState({ data: null, loading: false, error })
                onError?.(error)
            }
            
            return null
        }
    }, [asyncFn, onSuccess, onError])

    const reset = useCallback(() => {
        setState({ data: null, loading: false, error: null })
    }, [])

    const setData = useCallback((data: T | null) => {
        setState(prev => ({ ...prev, data }))
    }, [])

    return {
        ...state,
        execute,
        reset,
        setData,
        errorMessage: state.error ? getErrorMessage(state.error) : null
    }
}

/**
 * Hook for fetching data on mount with automatic refetch support
 */
export function useFetch<T>(
    fetchFn: () => Promise<T>,
    deps: unknown[] = []
) {
    const { data, loading, error, execute, errorMessage } = useAsync(fetchFn, {
        immediate: true
    })

    useEffect(() => {
        execute()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps)

    return {
        data,
        loading,
        error,
        errorMessage,
        refetch: execute
    }
}

/**
 * Hook for mutations (create, update, delete) with optimistic updates support
 */
export function useMutation<T, Args extends unknown[] = []>(
    mutationFn: (...args: Args) => Promise<T>,
    options: UseAsyncOptions & {
        successMessage?: string
    } = {}
) {
    const { successMessage, ...asyncOptions } = options
    const { data, loading, error, execute, reset, errorMessage } = useAsync(mutationFn, asyncOptions)

    const mutate = useCallback(async (...args: Args) => {
        const result = await execute(...args)
        return result
    }, [execute])

    return {
        data,
        loading,
        error,
        errorMessage,
        mutate,
        reset,
        isSuccess: data !== null && !error
    }
}

/**
 * Hook for handling form submission with validation errors
 */
export function useFormSubmit<T, FormData>(
    submitFn: (data: FormData) => Promise<T>,
    options: {
        onSuccess?: (data: T) => void
        onError?: (error: ApiError | Error) => void
        resetOnSuccess?: boolean
    } = {}
) {
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
    
    const { data, loading, error, execute, reset, errorMessage } = useAsync(submitFn, {
        onSuccess: (result) => {
            setFieldErrors({})
            options.onSuccess?.(result as T)
        },
        onError: (err) => {
            if (err instanceof ApiError) {
                setFieldErrors(err.getFieldErrors())
            }
            options.onError?.(err)
        }
    })

    const submit = useCallback(async (formData: FormData) => {
        setFieldErrors({})
        return execute(formData)
    }, [execute])

    const clearFieldError = useCallback((field: string) => {
        setFieldErrors(prev => {
            const next = { ...prev }
            delete next[field]
            return next
        })
    }, [])

    return {
        data,
        loading,
        error,
        errorMessage,
        fieldErrors,
        submit,
        reset,
        clearFieldError,
        isSuccess: data !== null && !error
    }
}
