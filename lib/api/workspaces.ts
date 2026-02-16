/**
 * Workspace management API client.
 * Handles CRUD operations for user workspaces.
 */

import apiClient from './client';

export interface Workspace {
    id: string;
    user_id: string;
    name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
}

export interface CreateWorkspaceData {
    name: string;
    description?: string;
}

export interface UpdateWorkspaceData {
    name?: string;
    description?: string;
}

export const workspaces = {
    /**
     * Create a new workspace
     */
    async createWorkspace(data: CreateWorkspaceData): Promise<Workspace> {
        const response = await apiClient.post<Workspace>('/workspaces', data);
        return response.data;
    },

    /**
     * List all workspaces for current user
     */
    async listWorkspaces(): Promise<Workspace[]> {
        const response = await apiClient.get<Workspace[]>('/workspaces');
        return response.data;
    },

    /**
     * Get a specific workspace by ID
     */
    async getWorkspace(workspaceId: string): Promise<Workspace> {
        const response = await apiClient.get<Workspace>(`/workspaces/${workspaceId}`);
        return response.data;
    },

    /**
     * Update a workspace
     */
    async updateWorkspace(
        workspaceId: string,
        data: UpdateWorkspaceData
    ): Promise<Workspace> {
        const response = await apiClient.put<Workspace>(
            `/workspaces/${workspaceId}`,
            data
        );
        return response.data;
    },

    /**
     * Delete a workspace
     */
    async deleteWorkspace(workspaceId: string): Promise<void> {
        await apiClient.delete(`/workspaces/${workspaceId}`);
    },
};
