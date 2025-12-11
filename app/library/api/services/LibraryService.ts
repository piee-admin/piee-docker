/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class LibraryService {
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
    /**
     * List Models
     * @param q
     * @param tag
     * @param limit
     * @param offset
     * @returns any Successful Response
     * @throws ApiError
     */
    public static listModelsLibraryModelsGet(
        q?: (string | null),
        tag?: (string | null),
        limit: number = 30,
        offset?: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/library/models/',
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
     * Create Model
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static createModelLibraryModelsPost(
        requestBody: Record<string, any>,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/library/models/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Model
     * @param slugOrId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getModelLibraryModelsSlugOrIdGet(
        slugOrId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/library/models/{slug_or_id}',
            path: {
                'slug_or_id': slugOrId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
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
    /**
     * List Videos
     * @param q
     * @param tag
     * @param limit
     * @param offset
     * @returns any Successful Response
     * @throws ApiError
     */
    public static listVideosLibraryVideosGet(
        q?: (string | null),
        tag?: (string | null),
        limit: number = 30,
        offset?: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/library/videos/',
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
     * Create Video
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static createVideoLibraryVideosPost(
        requestBody: Record<string, any>,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/library/videos/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Video
     * @param slugOrId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getVideoLibraryVideosSlugOrIdGet(
        slugOrId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/library/videos/{slug_or_id}',
            path: {
                'slug_or_id': slugOrId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
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
