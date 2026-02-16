// lib/api/auth.ts
import { authFetch } from './core';

export const authApi = {
    register: async (email, password) => {
        const res = await authFetch('/api/v1/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        return res.json();
    },

    login: async (email, password) => {
        const res = await authFetch('/api/v1/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (data.access_token) {
            localStorage.setItem('piee_token', data.access_token);
        }
        return data;
    },

    logout: async () => {
        await authFetch('/api/v1/auth/logout', { method: 'POST' });
        localStorage.removeItem('piee_token');
    },

    me: async () => {
        const res = await authFetch('/api/v1/auth/me');
        if (!res.ok) throw new Error('Failed to fetch user session');
        return res.json();
    }
};
