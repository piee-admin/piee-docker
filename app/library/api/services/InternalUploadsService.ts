/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class InternalUploadsService {
    /**
     * Internal Upload
     * @param filePath
     * @returns any Successful Response
     * @throws ApiError
     */
    public static internalUploadInternalUploadPost(
        filePath: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/internal/upload',
            query: {
                'file_path': filePath,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
