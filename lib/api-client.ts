/**
 * Centralized API client with authentication
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export class APIClient {
    private static getHeaders(): HeadersInit {
        // In production, get token from auth context/cookies
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

        return {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        };
    }

    static async get<T>(path: string): Promise<T> {
        const response = await fetch(`${API_BASE}${path}`, {
            method: 'GET',
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        return response.json();
    }



    static async post<T>(path: string, data: any): Promise<T> {
        const response = await fetch(`${API_BASE}${path}`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: response.statusText }));
            throw new Error(error.detail || 'API Error');
        }

        return response.json();
    }

    static async put<T>(path: string, data: any): Promise<T> {
        const response = await fetch(`${API_BASE}${path}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: response.statusText }));
            throw new Error(error.detail || 'API Error');
        }

        return response.json();
    }

    static async delete(path: string): Promise<void> {
        const response = await fetch(`${API_BASE}${path}`, {
            method: 'DELETE',
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }
    }
}

// Type definitions
export interface Organization {
    id: string;
    name: string;
    slug: string;
    created_at: string;
}

export interface Prompt {
    id: string;
    org_id: string;
    name: string;
    slug: string;
    description?: string;
    created_at: string;
    versions: PromptVersion[];
}

export interface PromptVersion {
    id: string;
    prompt_id: string;
    version: number;
    content: string;
    model: string;
    provider: string;
    parameters?: string;
    created_at: string;
}

export interface Generation {
    id: string;
    org_id: string;
    prompt_id?: string;
    user_id?: string;
    input_variables?: string;
    output_text: string;
    model: string;
    tokens_prompt: number;
    tokens_completion: number;
    cost: number;
    latency_ms: number;
    created_at: string;
}

export interface ProviderKey {
    id: string;
    org_id: string;
    provider: string;
    key_name: string;
    key_prefix: string;
    is_active: boolean;
    created_at: string;
    last_used_at?: string;
}

export interface User {
    id: string;
    email: string;
    full_name?: string;
    company_name?: string;
    role?: string;
    avatar_url?: string;
    onboarding_completed: boolean;
    onboarding_step: number;
    is_active: boolean;
    created_at: string;
}

export interface OnboardingStatus {
    completed: boolean;
    current_step: number;
    steps: {
        profile: boolean;
        organization: boolean;
        provider_key: boolean;
        first_prompt: boolean;
    };
}

export interface CompleteProfileData {
    full_name: string;
    company_name?: string;
    role?: string;
}

// API Methods
export const apiClient = {
    // Onboarding
    onboarding: {
        getStatus: () => APIClient.get<OnboardingStatus>('/api/v1/onboarding/status'),
        completeProfile: (data: CompleteProfileData) =>
            APIClient.post('/api/v1/onboarding/complete-profile', data),
        skipOnboarding: () =>
            APIClient.post('/api/v1/onboarding/skip-onboarding', {}),
        completeOnboarding: () =>
            APIClient.post('/api/v1/onboarding/complete-onboarding', {}),
        updateStep: (step: number) =>
            APIClient.post('/api/v1/onboarding/update-step', { step }),
    },

    // Organizations
    organizations: {
        list: () => APIClient.get<Organization[]>('/api/v1/organizations'),
        create: (name: string) => APIClient.post<Organization>('/api/v1/organizations', { name }),
        update: (orgId: string, name: string) => APIClient.put<Organization>(`/api/v1/organizations/${orgId}`, { name }),
    },

    // Prompts
    prompts: {
        list: (orgId: string) => APIClient.get<Prompt[]>(`/api/v1/prompts/${orgId}`),
        create: (orgId: string, data: { name: string, description?: string }) =>
            APIClient.post<Prompt>(`/api/v1/prompts/${orgId}`, data),
    },

    // Generations
    generations: {
        list: (orgId: string) => APIClient.get<Generation[]>(`/api/v1/generations/${orgId}`),
    },

    // Executions
    executions: {
        create: (orgId: string, promptId: string, data: { variables?: Record<string, any>, model_override?: string }) =>
            APIClient.post<Generation>(`/api/v1/executions/${orgId}/${promptId}/execute`, data),
    },

    // Provider Keys
    providerKeys: {
        list: (orgId: string) => APIClient.get<ProviderKey[]>(`/api/v1/provider-keys/${orgId}`),
    },

    // Audit Logs
    audit: {
        list: (params?: {
            skip?: number,
            limit?: number,
            action?: string,
            user_id?: string,
            start_date?: string,
            end_date?: string
        }) => {
            const queryParams = new URLSearchParams();
            if (params) {
                Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined) queryParams.append(key, String(value));
                });
            }
            return APIClient.get<any[]>(`/api/v1/audit?${queryParams.toString()}`);
        },
        export: (start_date?: string, end_date?: string) => {
            const queryParams = new URLSearchParams();
            if (start_date) queryParams.append('start_date', start_date);
            if (end_date) queryParams.append('end_date', end_date);
            return APIClient.get<any[]>(`/api/v1/audit/export?${queryParams.toString()}`);
        }
    }
};

