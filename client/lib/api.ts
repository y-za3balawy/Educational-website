import { 
    ApiError, 
    ApiErrorResponse, 
    ErrorCodes, 
    parseApiError, 
    createNetworkError 
} from './errors';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
const API_BASE = API_URL;
const UPLOAD_BASE = API_URL;

export interface ApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    code?: string;
    data?: T;
}

type AuthChangeCallback = (user: unknown | null) => void;
type ErrorCallback = (error: ApiError) => void;

class ApiClient {
    private token: string | null = null;
    private authChangeCallbacks: Set<AuthChangeCallback> = new Set();
    private errorCallbacks: Set<ErrorCallback> = new Set();

    /**
     * Subscribe to auth state changes
     */
    onAuthChange(callback: AuthChangeCallback): () => void {
        this.authChangeCallbacks.add(callback);
        return () => this.authChangeCallbacks.delete(callback);
    }

    /**
     * Subscribe to API errors (for global toast notifications)
     */
    onError(callback: ErrorCallback): () => void {
        this.errorCallbacks.add(callback);
        return () => this.errorCallbacks.delete(callback);
    }

    private notifyAuthChange(user: unknown | null) {
        this.authChangeCallbacks.forEach(cb => cb(user));
    }

    private notifyError(error: ApiError) {
        this.errorCallbacks.forEach(cb => cb(error));
    }

    setToken(token: string | null) {
        this.token = token;
        if (typeof window !== 'undefined') {
            if (token) {
                localStorage.setItem('token', token);
            } else {
                localStorage.removeItem('token');
            }
        }
    }

    getToken(): string | null {
        if (this.token) return this.token;
        if (typeof window !== 'undefined') {
            this.token = localStorage.getItem('token');
        }
        return this.token;
    }

    /**
     * Core request method with comprehensive error handling
     */
    private async request<T>(
        endpoint: string, 
        options: RequestInit = {},
        useUploadBase = false
    ): Promise<ApiResponse<T>> {
        const token = this.getToken();
        const baseUrl = useUploadBase ? UPLOAD_BASE : API_BASE;
        
        const headers: HeadersInit = {
            ...(!(options.body instanceof FormData) && { 'Content-Type': 'application/json' }),
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        };

        try {
            const response = await fetch(`${baseUrl}${endpoint}`, {
                ...options,
                headers,
            });

            // Handle non-JSON responses
            const contentType = response.headers.get('content-type');
            if (!contentType?.includes('application/json')) {
                const text = await response.text();
                if (text.includes('<!DOCTYPE') || text.includes('<html')) {
                    throw createNetworkError(new Error('Server returned HTML instead of JSON'));
                }
                throw new ApiError(
                    'Invalid server response',
                    ErrorCodes.INTERNAL_ERROR,
                    response.status
                );
            }

            const data = await response.json();

            if (!response.ok) {
                const error = parseApiError(response, data as ApiErrorResponse);
                
                // Handle auth errors - clear token and notify
                if (error.requiresReauth()) {
                    this.setToken(null);
                    this.notifyAuthChange(null);
                }
                
                // Notify error listeners (for toast)
                this.notifyError(error);
                
                throw error;
            }

            return data;
        } catch (error) {
            // Re-throw ApiErrors as-is (already notified)
            if (error instanceof ApiError) {
                throw error;
            }
            
            // Handle network errors
            if (error instanceof TypeError) {
                const networkError = createNetworkError(error);
                this.notifyError(networkError);
                throw networkError;
            }
            
            // Handle other errors
            const apiError = new ApiError(
                error instanceof Error ? error.message : 'An unexpected error occurred',
                ErrorCodes.INTERNAL_ERROR,
                500
            );
            this.notifyError(apiError);
            throw apiError;
        }
    }

    /**
     * File upload request with progress support
     */
    private async uploadRequest<T>(
        endpoint: string,
        data: FormData,
        method: 'POST' | 'PATCH' = 'POST'
    ): Promise<ApiResponse<T>> {
        const token = this.getToken();
        
        try {
            const response = await fetch(`${UPLOAD_BASE}${endpoint}`, {
                method,
                headers: { ...(token && { Authorization: `Bearer ${token}` }) },
                body: data,
            });

            const text = await response.text();
            let result: ApiResponse<T>;
            
            try {
                result = JSON.parse(text);
            } catch {
                if (text.includes('<!DOCTYPE') || text.includes('<html')) {
                    const error = createNetworkError(new Error('Backend server not reachable'));
                    this.notifyError(error);
                    throw error;
                }
                const error = new ApiError(
                    'Invalid server response',
                    ErrorCodes.INTERNAL_ERROR,
                    response.status
                );
                this.notifyError(error);
                throw error;
            }

            if (!response.ok) {
                const error = parseApiError(response, result as unknown as ApiErrorResponse);
                this.notifyError(error);
                throw error;
            }

            return result;
        } catch (error) {
            if (error instanceof ApiError) throw error;
            if (error instanceof TypeError) {
                const networkError = createNetworkError(error);
                this.notifyError(networkError);
                throw networkError;
            }
            const apiError = new ApiError(
                error instanceof Error ? error.message : 'Upload failed',
                ErrorCodes.UPLOAD_FAILED,
                500
            );
            this.notifyError(apiError);
            throw apiError;
        }
    }

    // ==================== AUTH ====================
    
    async register(userData: { 
        email: string; 
        password: string; 
        confirmPassword: string; 
        firstName: string; 
        lastName: string; 
        role?: string 
    }) {
        const res = await this.request<{ user: unknown; token: string }>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
        if (res.data?.token) {
            this.setToken(res.data.token);
            this.notifyAuthChange(res.data.user);
        }
        return res;
    }

    async login(email: string, password: string) {
        const res = await this.request<{ user: unknown; token: string }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        if (res.data?.token) {
            this.setToken(res.data.token);
            this.notifyAuthChange(res.data.user);
        }
        return res;
    }

    async getMe() {
        return this.request<{ user: unknown }>('/auth/me');
    }

    logout() {
        this.setToken(null);
        this.notifyAuthChange(null);
    }

    // ==================== POSTS ====================
    
    async getPosts(params?: Record<string, string>) {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        return this.request(`/posts${query}`);
    }

    async getPost(id: string) {
        return this.request(`/posts/${id}`);
    }

    async createPost(data: FormData) {
        return this.uploadRequest('/posts', data, 'POST');
    }

    async updatePost(id: string, data: FormData | Record<string, unknown>) {
        if (data instanceof FormData) {
            return this.uploadRequest(`/posts/${id}`, data, 'PATCH');
        }
        return this.request(`/posts/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
    }

    async deletePost(id: string) {
        return this.request(`/posts/${id}`, { method: 'DELETE' });
    }

    // ==================== QUIZZES ====================
    
    async getQuizzes(params?: Record<string, string>) {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        return this.request(`/quizzes${query}`);
    }

    async getQuiz(id: string) {
        return this.request(`/quizzes/${id}`);
    }

    async createQuiz(data: Record<string, unknown>) {
        return this.request('/quizzes', { method: 'POST', body: JSON.stringify(data) });
    }

    async updateQuiz(id: string, data: Record<string, unknown>) {
        return this.request(`/quizzes/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
    }

    async deleteQuiz(id: string) {
        return this.request(`/quizzes/${id}`, { method: 'DELETE' });
    }

    async publishQuiz(id: string) {
        return this.request(`/quizzes/${id}/publish`, { method: 'PATCH' });
    }

    async addQuestion(quizId: string, data: Record<string, unknown>) {
        return this.request(`/quizzes/${quizId}/questions`, { method: 'POST', body: JSON.stringify(data) });
    }

    async updateQuestion(quizId: string, questionId: string, data: Record<string, unknown>) {
        return this.request(`/quizzes/${quizId}/questions/${questionId}`, { method: 'PATCH', body: JSON.stringify(data) });
    }

    async deleteQuestion(quizId: string, questionId: string) {
        return this.request(`/quizzes/${quizId}/questions/${questionId}`, { method: 'DELETE' });
    }

    async startQuiz(id: string) {
        return this.request(`/quizzes/${id}/start`, { method: 'POST' });
    }

    async submitQuiz(id: string, answers: unknown[]) {
        return this.request(`/quizzes/${id}/submit`, {
            method: 'POST',
            body: JSON.stringify({ answers }),
        });
    }

    async getQuizSubmissions(quizId: string, params?: Record<string, string>) {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        return this.request(`/quizzes/${quizId}/submissions${query}`);
    }

    // ==================== PAST PAPERS ====================
    
    async getPastPapers(params?: Record<string, string>) {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        return this.request(`/past-papers${query}`);
    }

    async getPastPaper(id: string) {
        return this.request(`/past-papers/${id}`);
    }

    async createPastPaper(data: FormData) {
        return this.uploadRequest('/past-papers', data, 'POST');
    }

    async updatePastPaper(id: string, data: FormData | Record<string, unknown>) {
        if (data instanceof FormData) {
            return this.uploadRequest(`/past-papers/${id}`, data, 'PATCH');
        }
        return this.request(`/past-papers/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
    }

    async deletePastPaper(id: string) {
        return this.request(`/past-papers/${id}`, { method: 'DELETE' });
    }

    async uploadMarkScheme(paperId: string, data: FormData) {
        return this.uploadRequest(`/past-papers/${paperId}/mark-scheme`, data, 'POST');
    }

    // ==================== ADMIN ====================
    
    async getDashboardStats() {
        return this.request('/admin/stats');
    }

    async getUsers(params?: Record<string, string>) {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        return this.request(`/users${query}`);
    }

    // ==================== ANALYTICS ====================
    
    async getAnalyticsOverview(period: '7d' | '30d' | '90d' = '30d') {
        return this.request(`/analytics/overview?period=${period}`);
    }

    async getAnalyticsTraffic(period: '7d' | '30d' | '90d' = '30d') {
        return this.request(`/analytics/traffic?period=${period}`);
    }

    async getAnalyticsTopContent(limit = 10) {
        return this.request(`/analytics/top-content?limit=${limit}`);
    }

    async getAnalyticsActivity(limit = 10) {
        return this.request(`/analytics/activity?limit=${limit}`);
    }

    async getAnalyticsUsers(period: '7d' | '30d' | '90d' = '30d') {
        return this.request(`/analytics/users?period=${period}`);
    }

    async getAnalyticsQuizzes() {
        return this.request('/analytics/quizzes');
    }

    async getAnalyticsContent() {
        return this.request('/analytics/content');
    }

    // ==================== CONTACTS ====================
    
    async submitContact(data: {
        name: string;
        email: string;
        phone?: string;
        senderType?: string;
        subject: string;
        message: string;
        category?: string;
        level?: string;
    }) {
        return this.request('/contacts', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getContacts(params?: Record<string, string>) {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        return this.request(`/contacts${query}`);
    }

    async getContact(id: string) {
        return this.request(`/contacts/${id}`);
    }

    async updateContact(id: string, data: Record<string, unknown>) {
        return this.request(`/contacts/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async addContactResponse(id: string, data: { message: string; isInternal?: boolean; sendEmail?: boolean }) {
        return this.request(`/contacts/${id}/response`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async addContactNote(id: string, note: string) {
        return this.request(`/contacts/${id}/note`, {
            method: 'POST',
            body: JSON.stringify({ note }),
        });
    }

    async deleteContact(id: string) {
        return this.request(`/contacts/${id}`, { method: 'DELETE' });
    }

    async bulkUpdateContacts(data: { ids: string[]; status?: string; assignedTo?: string; isSpam?: boolean }) {
        return this.request('/contacts/bulk/update', {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async getContactStats() {
        return this.request('/contacts/stats');
    }

    // ==================== SITE SETTINGS ====================
    
    async getPublicSettings() {
        return this.request('/settings/public');
    }

    async getAboutContent() {
        return this.request('/settings/about');
    }

    async getAllSettings() {
        return this.request('/settings');
    }

    async updateSettings(data: Record<string, unknown>) {
        return this.request('/settings', {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async updateAboutContent(data: FormData | Record<string, unknown>) {
        if (data instanceof FormData) {
            return this.uploadRequest('/settings/about', data, 'PATCH');
        }
        return this.request('/settings/about', {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async updateContactInfo(data: Record<string, unknown>) {
        return this.request('/settings/contact', {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async updateSocialLinks(socialLinks: Array<{ platform: string; url: string; icon?: string }>) {
        return this.request('/settings/social', {
            method: 'PATCH',
            body: JSON.stringify({ socialLinks }),
        });
    }

    async uploadLogo(data: FormData) {
        return this.uploadRequest('/settings/logo', data, 'POST');
    }

    async updateHeroSection(data: FormData | Record<string, unknown>) {
        if (data instanceof FormData) {
            return this.uploadRequest('/settings/hero', data, 'PATCH');
        }
        return this.request('/settings/hero', {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    // ==================== REVIEWS ====================
    
    async getReviews() {
        return this.request('/settings/reviews');
    }

    async updateReviewsSection(data: { sectionTitle?: string; sectionSubtitle?: string; showSection?: boolean }) {
        return this.request('/settings/reviews', {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async addReview(data: FormData) {
        return this.uploadRequest('/settings/reviews', data, 'POST');
    }

    async updateReview(reviewId: string, data: FormData | Record<string, unknown>) {
        if (data instanceof FormData) {
            return this.uploadRequest(`/settings/reviews/${reviewId}`, data, 'PATCH');
        }
        return this.request(`/settings/reviews/${reviewId}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async deleteReview(reviewId: string) {
        return this.request(`/settings/reviews/${reviewId}`, { method: 'DELETE' });
    }
}

export const api = new ApiClient();

// Re-export error utilities for convenience
export { ApiError, ErrorCodes, getErrorMessage } from './errors';
export type { ErrorCode } from './errors';
