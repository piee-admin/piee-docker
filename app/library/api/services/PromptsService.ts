/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PromptsService {
    /**
     * List public prompts
     * @param q
     * @param tag
     * @param limit
     * @param offset
     * @returns any Successful Response
     * @throws ApiError
     */
    public static listPromptsLibraryPromptsGet(
        q?: (string | null),
        tag?: (string | null),
        limit: number = 30,
        offset?: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/library/prompts/',
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
     * Create prompt
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static createPromptLibraryPromptsPost(
        requestBody: Record<string, any>,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/library/prompts/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List prompts created by user
     * @returns any Successful Response
     * @throws ApiError
     */
    public static listMyPromptsLibraryPromptsMeGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/library/prompts/me',
        });
    }
    /**
     * Get prompt by id or slug
     * @param slugOrId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getPromptLibraryPromptsSlugOrIdGet(
        slugOrId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/library/prompts/{slug_or_id}',
            path: {
                'slug_or_id': slugOrId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update prompt
     * @param id
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static updatePromptLibraryPromptsIdPatch(
        id: string,
        requestBody: Record<string, any>,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/library/prompts/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete prompt
     * @param id
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deletePromptLibraryPromptsIdDelete(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/library/prompts/{id}',
            path: {
                'id': id,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
