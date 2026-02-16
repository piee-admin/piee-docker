// lib/auth/client.ts
import { authApi } from '../api/auth';

export const authClient = {
    login: async (email, password) => {
        return authApi.login(email, password);
    },

    logout: async () => {
        return authApi.logout();
    },

    getSession: async () => {
        try {
            return await authApi.me();
        } catch (e) {
            return null;
        }
    }
};
