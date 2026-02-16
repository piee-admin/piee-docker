// lib/api/files.ts
import { authFetch } from './core';

export const filesApi = {
    upload: async (file: File, workspaceId?: string) => {
        const formData = new FormData();
        formData.append('file', file);
        if (workspaceId) formData.append('workspace_id', workspaceId);

        const res = await authFetch('/api/v1/files/upload', {
            method: 'POST',
            body: formData,
        });

        if (!res.ok) {
            const error = await res.json().catch(() => ({ detail: 'Upload failed' }));
            throw new Error(error.detail || 'Upload failed');
        }

        return res.json();
    },

    list: async (workspaceId?: string) => {
        const url = workspaceId ? `/api/v1/files/?workspace_id=${workspaceId}` : '/api/v1/files/';
        const res = await authFetch(url);
        return res.json();
    },

    getMetadata: async (fileId: string) => {
        const res = await authFetch(`/api/v1/files/${fileId}`);
        return res.json();
    },

    delete: async (fileId: string) => {
        const res = await authFetch(`/api/v1/files/${fileId}`, { method: 'DELETE' });
        if (!res.ok && res.status !== 204) throw new Error('Failed to delete file');
    },

    getDownloadUrl: (fileId: string) => {
        const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        return `${BASE_URL}/api/v1/files/${fileId}/download`;
    },

    getStats: async () => {
        const res = await authFetch('/api/v1/files/stats');
        return res.json();
    }
};

