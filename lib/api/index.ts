/**
 * Main API export - consolidates all API clients.
 * Import this file to access all API functionality.
 */

export { default as apiClient } from './client';
export { auth } from './auth';
export { files } from './files';
export { prompts } from './prompts';
export { workspaces } from './workspaces';

// Re-export types
export type { User, LoginResponse } from './auth';
export type { FileMetadata } from './files';
export type { Prompt, CreatePromptData, UpdatePromptData } from './prompts';
export type { Workspace, CreateWorkspaceData, UpdateWorkspaceData } from './workspaces';
