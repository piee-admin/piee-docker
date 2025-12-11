/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Body_upload_file_upload__post } from '../models/Body_upload_file_upload__post';
import type { Body_upload_files_upload_multiple_post } from '../models/Body_upload_files_upload_multiple_post';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UploadsService {
    /**
     * Upload File
     * @param formData
     * @returns any Successful Response
     * @throws ApiError
     */
    public static uploadFileUploadPost(
        formData: Body_upload_file_upload__post,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/upload/',
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Upload Files
     * @param formData
     * @returns any Successful Response
     * @throws ApiError
     */
    public static uploadFilesUploadMultiplePost(
        formData: Body_upload_files_upload_multiple_post,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/upload/multiple',
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Files
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getFilesUploadFilesGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/upload/files',
        });
    }
    /**
     * Delete File
     * @param fileId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteFileUploadFileIdDelete(
        fileId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/upload/{file_id}',
            path: {
                'file_id': fileId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Storage Stats
     * @returns any Successful Response
     * @throws ApiError
     */
    public static storageStatsUploadStatsGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/upload/stats',
        });
    }
    /**
     * Presign File
     * Generate a temporary signed URL for downloading a file.
     * User can set expiry time (max 24 hours).
     * @param fileId
     * @param expiry
     * @returns any Successful Response
     * @throws ApiError
     */
    public static presignFileUploadPresignFileIdGet(
        fileId: string,
        expiry: number = 300,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/upload/presign/{file_id}',
            path: {
                'file_id': fileId,
            },
            query: {
                'expiry': expiry,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
