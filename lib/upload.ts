// lib/upload.ts
import { filesApi } from './api/files';

export async function uploadFileToFastAPI(file: File, token?: string) {
  // We ignore the passed token and use the authenticated filesApi
  // which handles token injection via authFetch
  return filesApi.upload(file);
}
