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

const selfURL = process.env.NEXT_PUBLIC_SELF_URL!;

// --- Metadata ---
export const metadata = {
  title: "PIEE - Organize, Manage, and Optimize Your AI Prompts",
  description:
    "The ultimate platform for AI enthusiasts, developers, and teams to create, store, and collaborate on prompts — both public and private — seamlessly.",
  openGraph: {
    title: "PIEE - AI Prompt Management Platform",
    description:
      "Create, store, and collaborate on AI prompts effortlessly with PIE — the platform for teams and developers.",
    url: `https://${selfURL}`,
    siteName: "PIEE",
    images: [
      {
        url: `https://${selfURL}/api/og`,
        width: 1200,
        height: 630,
        alt: "OG Image for PIE - AI Prompt Management Platform",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PIEE - AI Prompt Management Platform",
    description:
      "Create, store, and collaborate on AI prompts effortlessly with PIE — the GitHub-style platform for teams and developers.",
    images: [
      `https://${selfURL}/api/og`,
    ],
  },
};



// --- Root Layout ---
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log(selfURL)
  return (
    <html
  lang="en"
  className={`${inter.className}  w-full`}
  suppressHydrationWarning
>
  <head />
  <body className="min-h-screen w-full bg-background text-foreground antialiased">
     <AuthProvider>
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
       <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
      <GoogleAnalytics gaId="G-VPDZFWSGWY" />
      <Toaster />
    </ThemeProvider>
    </AuthProvider>
  </body>
</html>

  );
}
