export interface AppFile {
    id: string;
    user_id: string;
    workspace_id?: string;
    filename: string;
    original_filename: string;
    mime_type: string;
    size_bytes: number;
    created_at: string;

    // Computed fields from backend
    file_name: string;
    size: number;
    public_url: string;
    thumbnail_url: string;
    meta_data?: string; // JSON string
}
