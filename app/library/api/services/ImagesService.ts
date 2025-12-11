/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ImagesService {
    /**
     * List Images
     * @param q
     * @param tag
     * @param limit
     * @param offset
     * @returns any Successful Response
     * @throws ApiError
     */
    public static listImagesLibraryImagesGet(
        q?: (string | null),
        tag?: (string | null),
        limit: number = 30,
        offset?: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/library/images/',
            query: {
                'q': q,
                'tag': tag,
                'limit': limit,
                'offset': offset,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Image
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static createImageLibraryImagesPost(
        requestBody: Record<string, any>,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/library/images/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Image
     * @param slugOrId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getImageLibraryImagesSlugOrIdGet(
        slugOrId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/library/images/{slug_or_id}',
            path: {
                'slug_or_id': slugOrId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
