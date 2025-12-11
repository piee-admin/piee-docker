// app/library/client.ts

import { OpenAPI } from "./api";
import {
  PromptsService,
  ModelsService,
  ImagesService,
  VideosService,
  InteractionsService,
  LibraryService,
  UploadsService,
} from "./api";

// Configure global API base URL
OpenAPI.BASE = process.env.NEXT_PUBLIC_BASEURL!;
OpenAPI.WITH_CREDENTIALS = true;

export {
  PromptsService,
  ModelsService,
  ImagesService,
  VideosService,
  InteractionsService,
  LibraryService,
  UploadsService,
};
