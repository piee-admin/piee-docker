import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PIEE",
    short_name: "PIEE",
    description: "Organize, manage, and optimize your AI prompts.",
    start_url: "/dashboard",
    display: "standalone",
    display_override: ["fullscreen", "minimal-ui"],
    orientation: 'portrait',
    background_color: "#000000",
    theme_color: "#000000",
    icons: [
      {
        src: "favicon.ico",
        sizes: "64x64 32x32 24x24 16x16",
        type: "image/x-icon"
      },
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
