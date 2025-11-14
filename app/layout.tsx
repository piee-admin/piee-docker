
import type { Metadata } from "next";
import { Montserrat, Poppins, Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner"
import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";
import PageViewTracker from "@/components/PageViewTracker";
import { Suspense } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CommandPalette } from "@/components/command-palette";
// --- Google Fonts ---
const poppins = Poppins({
  weight: ["400", "700"],   // optional, choose weights you need
  subsets: ["latin"],
  variable: "--font-poppins", // optional if you want to use CSS variable
});
const montserrat = Montserrat({
  subsets: ["latin"],          // font subset
  weight: ["400", "500", "700"], // optional weights
  variable: "--font-montserrat",  // optional CSS variable
});

const inter = Inter({
  subsets: ["latin"],          // font subset
  weight: ["400", "500", "700"], // optional weights
  variable: "--font-inter",      // optional CSS variable
});

export const metadata: Metadata = {
  title: "PIEE — The Universal Open-Source Creative Command Palette",
  description:
    "Compress images, trim videos, and format code with a single shortcut — instantly, locally, and open-source.",
};


// --- Root Layout ---
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <html
      lang="en"
      className={`${inter.className}  w-full`}
      suppressHydrationWarning
    >
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />

        <meta property="og:title" content="PIEE — The Universal Open-Source Creative Command Palette" />
        <meta property="og:description" content="Compress images, trim videos, and format code with a single shortcut — instantly, locally, and open-source." />
        <meta property="og:url" content="https://piee.app" />
        <meta property="og:site_name" content="PIEE" />
        <meta property="og:image" content="https://piee.app/api/og" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="PIEE — The Universal Creative Command Palette" />
        <meta property="og:type" content="website" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="PIEE — The Universal Open-Source Creative Command Palette" />
        <meta name="twitter:description" content="Compress images, trim videos, and format code with a single shortcut — locally and open-source." />
        <meta name="twitter:image" content="https://piee.app/api/og" />

      </head>
      <body className="min-h-screen w-full bg-background text-foreground antialiased">

        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <CommandPalette />
          </AuthProvider>
          <Suspense fallback={null}>
            <PageViewTracker />
          </Suspense>
          <GoogleAnalytics gaId="G-VPDZFWSGWY" />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>

  );
}


/**icons: {
    icon: "/favicon.ico",
    apple: "/icons/icon-192x192.png",
  },
  openGraph: {
    title: "PIEE - AI Prompt Management Platform",
    description:
      "Create, store, and collaborate on AI prompts effortlessly with PIEE — the platform for teams and developers.",
    url: "https://piee.app",
    siteName: "PIEE",
    images: [
      {
        url: "https://piee.app/api/og",
        width: 1200,
        height: 630,
        alt: "PIEE OG Image",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PIEE - AI Prompt Management Platform",
    description:
      "Create, store, and collaborate on AI prompts effortlessly with PIEE — the GitHub-style platform for developers.",
    images: ["https://piee.app/api/og"],
  }, */