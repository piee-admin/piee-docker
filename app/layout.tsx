import type { Metadata } from "next";
import { Montserrat, Poppins, Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner"
import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";
import PageViewTracker from "@/components/PageViewTracker";
import { Suspense } from "react";
import { AuthProvider } from "./context/AuthContext";

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
  title: "PIEE - Organize, Manage, and Optimize Your AI Prompts",
  description: "The ultimate platform for AI enthusiasts, developers, and teams to create, store, and collaborate on prompts — both public and private — seamlessly."
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
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        <meta property="og:title" content="PIEE - AI Prompt Management Platform" />
        <meta property="og:description" content="Create, store, and collaborate on AI prompts effortlessly with PIEE — the platform for teams and developers." />
        <meta property="og:url" content="https://piee.app" />
        <meta property="og:site_name" content="PIEE" />
        <meta property="og:image" content="https://piee.app/api/og" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="PIEE OG Image" />
        <meta property="og:type" content="website" />


        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="PIEE - AI Prompt Management Platform" />
        <meta name="twitter:description" content="Create, store, and collaborate on AI prompts effortlessly with PIEE — the GitHub-style platform for developers." />
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