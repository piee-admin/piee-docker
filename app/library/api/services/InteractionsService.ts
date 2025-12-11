/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class InteractionsService {
    /**
     * Like
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static likeLibraryInteractionsLikesPost(
        requestBody: Record<string, any>,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/library/interactions/likes',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Unlike
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static unlikeLibraryInteractionsLikesDelete(
        requestBody: Record<string, any>,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/library/interactions/likes',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Add View
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static addViewLibraryInteractionsViewsPost(
        requestBody: Record<string, any>,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/library/interactions/views',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Add Share
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static addShareLibraryInteractionsSharesPost(
        requestBody: Record<string, any>,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/library/interactions/shares',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
