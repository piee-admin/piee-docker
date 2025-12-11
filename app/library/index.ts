// app/library/index.ts

import {
  PromptsService,
  ModelsService,
  ImagesService,
  VideosService,
  InteractionsService,
} from "./client";

// Shared type for list queries
type ListQuery = {
  q?: string | null;
  tag?: string | null;
  limit?: number;
  offset?: number;
};

export const library = {
  // -----------------------------
  // PROMPTS
  // -----------------------------
  prompts: {
    list: (params?: ListQuery) =>
      PromptsService.listPromptsLibraryPromptsGet(
        params?.q ?? null,
        params?.tag ?? null,
        params?.limit ?? 30,
        params?.offset ?? 0
      ),

    create: (payload: any) =>
      PromptsService.createPromptLibraryPromptsPost(payload),

    get: (slugOrId: string) =>
      PromptsService.getPromptLibraryPromptsSlugOrIdGet(slugOrId),

    update: (id: string, payload: any) =>
      PromptsService.updatePromptLibraryPromptsIdPatch(id, payload),

    delete: (id: string) =>
      PromptsService.deletePromptLibraryPromptsIdDelete(id),
  },

  // -----------------------------
  // MODELS
  // -----------------------------
  models: {
    list: (params?: ListQuery) =>
      ModelsService.listModelsLibraryModelsGet(
        params?.q ?? null,
        params?.tag ?? null,
        params?.limit ?? 30,
        params?.offset ?? 0
      ),

    create: (payload: any) =>
      ModelsService.createModelLibraryModelsPost(payload),

    get: (slugOrId: string) =>
      ModelsService.getModelLibraryModelsSlugOrIdGet(slugOrId),
  },

  // -----------------------------
  // IMAGES
  // -----------------------------
  images: {
    list: (params?: ListQuery) =>
      ImagesService.listImagesLibraryImagesGet(
        params?.q ?? null,
        params?.tag ?? null,
        params?.limit ?? 30,
        params?.offset ?? 0
      ),

    create: (payload: any) =>
      ImagesService.createImageLibraryImagesPost(payload),

    get: (slugOrId: string) =>
      ImagesService.getImageLibraryImagesSlugOrIdGet(slugOrId),
  },

  // -----------------------------
  // VIDEOS
  // -----------------------------
  videos: {
    list: (params?: ListQuery) =>
      VideosService.listVideosLibraryVideosGet(
        params?.q ?? null,
        params?.tag ?? null,
        params?.limit ?? 30,
        params?.offset ?? 0
      ),

    create: (payload: any) =>
      VideosService.createVideoLibraryVideosPost(payload),

    get: (slugOrId: string) =>
      VideosService.getVideoLibraryVideosSlugOrIdGet(slugOrId),
  },

  // -----------------------------
  // INTERACTIONS
  // -----------------------------
  interactions: {
    like: (payload: any) =>
      InteractionsService.likeLibraryInteractionsLikesPost(payload),

    unlike: (payload: any) =>
      InteractionsService.unlikeLibraryInteractionsLikesDelete(payload),

    view: (payload: any) =>
      InteractionsService.addViewLibraryInteractionsViewsPost(payload),

    share: (payload: any) =>
      InteractionsService.addShareLibraryInteractionsSharesPost(payload),
  },
};
