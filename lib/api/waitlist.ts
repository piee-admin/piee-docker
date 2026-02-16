// lib/api/waitlist.ts
import { authFetch } from './core';

export const waitlistApi = {
    join: async (email: string) => {
        const res = await authFetch('/api/v1/waitlist/', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
        return res.json();
    },

    getCount: async () => {
        const res = await authFetch('/api/v1/waitlist/count');
        if (!res.ok) return 0;
        const data = await res.json();
        return data.count || 0;
    }
};
