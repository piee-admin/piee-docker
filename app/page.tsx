"use client";

import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
  NavbarButton,
} from "@/components/ui/resizable-navbar";
import { motion } from "motion/react";
import { BorderTrail } from "@/components/motion-primitives/border-trail";

import { Entropy } from "@/components/ui/entropy"
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useAuth } from "./context/AuthContext";
import Login from "../components/Login";
// Updated icons
import { Brush, Code, Film, Music2, Cpu, FileText, Package, Github, Plus, Settings, LayoutDashboardIcon, Download, ArrowLeft, ArrowRight, Coffee, Heart } from "lucide-react"; // Added Github
import { GradientBars } from "@/components/ui/gradient-bars";
import { TextReveal } from "@/components/ui/text-reveal";
import { navMain, navSecondary, projects, NavSection } from "@/config/nav"; // ← adjust your path

// --- GitHub Repo Link ---
// !! REPLACE THIS with your actual GitHub repository URL
const REPO_URL = "https://github.com/piee-dev/piee-core";
const API_URL = "https://api.github.com/repos/piee-dev/piee-core";



export function StarOnGitHub() {
  const [stars, setStars] = useState<number | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchStars() {
      try {
        const res = await fetch(API_URL, {
          headers: { Accept: "application/vnd.github.v3+json" },
          cache: "no-store",
        });
        if (!res.ok) throw new Error("GitHub API failed");
        const data = await res.json();
        setStars(data.stargazers_count ?? null);
      } catch {
        setError(true);
      }
    }
    fetchStars();
  }, []);

  return (
    <a
      href={REPO_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Star PIEE Core on GitHub"
      className="inline-flex items-center"
    >
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2 rounded-full border border-border/50 px-3 py-1 text-sm font-medium hover:bg-muted transition-all cursor-pointer"
      >
        <Github className="h-4 w-4" />
        <span>Star</span>
        {!error && stars !== null && (
          <span className="ml-1 bg-primary/10 text-primary px-2 py-[1px] rounded-full text-xs font-semibold">
            {stars}
          </span>
        )}
      </Button>
    </a>
  );
}

export function Header() {
  const buyMeUrl = "https://buymeacoffee.com/pieeapp";

  const { user, logOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openLogin, setOpenLogin] = useState(false);

  // Updated navItems: Removed Pricing, Added GitHub
  const navItems = [
    { name: "Features", link: "#features" },
    { name: "FAQ", link: "#faq" },
    { name: "Library", link: '/library/prompt' },
    { name: "Support", link: buyMeUrl }
  ];

  /**const navItems = [
    { name: "Features", link: "#features" },
    { name: "FAQ", link: "#faq" },
    { name: "GitHub", link: REPO_URL },
    { name: "Support", link: buyMeUrl }
  ]; */

  const handleLoginSuccess = () => {
    setOpenLogin(false);
    setIsMobileMenuOpen(false);
  };

  /**-<div className="hidden sm:flex items-center gap-4">
            {!user ? (
              <NavbarButton variant="secondary" onClick={() => setOpenLogin(true)}>
                Login
              </NavbarButton>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="cursor-pointer">
                    <AvatarImage src={user?.photoURL || ""} />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={logOut}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div> */

  return (
    <header className="sticky top-0 z-50 w-full">
      <Navbar>
        <NavBody>
          <NavbarLogo />
          <NavItems items={navItems} />
          
        </NavBody>

        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>
          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {navItems.map((item, i) => {
              const isExternal = item.link.startsWith("http");
              return (
                <a
                  key={i}
                  href={item.link}
                  target={isExternal ? "_blank" : "_self"}
                  rel={isExternal ? "noopener noreferrer" : ""}
                  className="flex items-center gap-2 py-2 text-neutral-700 dark:text-neutral-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name === "GitHub" && <Github className="h-4 w-4" />}
                  {item.name}
                </a>
              );
            })}
            {!user ? (
              <NavbarButton
                variant="secondary"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setOpenLogin(true);
                }}
              >
                Login
              </NavbarButton>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="cursor-pointer mx-auto">
                    <AvatarImage src={user?.photoURL || ""} />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={logOut}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </MobileNavMenu>
        </MobileNav>
      </Navbar>

      <Dialog open={openLogin} onOpenChange={setOpenLogin}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Login</DialogTitle>
          </DialogHeader>
          <Login onSuccess={handleLoginSuccess} />
        </DialogContent>
      </Dialog>
    </header>
  );
}

// --- Hero (Updated for "PIEE" + Open Source) ---
export const Hero = () => (
  <section className="relative pt-24 pb-32 text-center">
    {/* 🌟 Centered StarOnGitHub */}
    <div className="flex justify-center mb-6">
      <StarOnGitHub />
    </div>

    <div className="container mx-auto px-4 max-w-4xl">
      {/* 🧠 Heading */}
      <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
        Drop anything.{" "}
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-500">
          Automagically done in a blink.
        </span>
      </h1>

      {/* 💬 Subtitle */}
      <p className="mt-6 text-lg md:text-xl text-muted-foreground">
        Meet <span className="font-semibold text-primary">PIEE</span>, the
        universal{" "}
        <span className="font-semibold">open-source</span> creative command
        palette. Compress images, trim videos, and format code with a single
        shortcut.
      </p>

      {/* ⚡ Action Buttons */}

    </div>
  </section>
);



const DashboardImageHero = () => (
  <section className="relative pt-16 pb-12">
    <div className="container mx-auto px-4 max-w-6xl">

      {/* Title */}
      <h1
        className="
          scroll-m-20 
          text-center 
          text-4xl md:text-9xl font-extrabold 
          tracking-tight text-balance
          relative z-10
          md:-mb-8
        "
      >
        Dashboard
      </h1>

      {/* WRAPPER – clips glow to rounded radius */}
      <div
        className="
          relative w-full 
          rounded-2xl 
          overflow-hidden
        "
      >
        {/* BorderTrail with OKLCH color */}
        <BorderTrail
          size={200}
          className="absolute inset-0 pointer-events-none"
          style={{
            boxShadow: `
              0 0 50px 20px oklch(60.6% 0.25 292.717 / 0.4),
              0 0 80px 40px oklch(60.6% 0.25 292.717 / 0.25),
              0 0 120px 70px oklch(60.6% 0.25 292.717 / 0.15)
            `,
          }}
        />

        {/* Image Card */}
        <div
          className="
            relative w-full overflow-hidden rounded-2xl
            border bg-muted/20 z-10 shadow-xl
          "
        >
          <img
            src="/images/piee-dashboard-s.png"
            alt="Dashboard Preview"
            className="w-full h-auto object-cover"
          />

          {/* Bottom gradient */}
          <div
            className="
              pointer-events-none
              absolute bottom-0 left-0 w-full h-full
              bg-gradient-to-t
              from-white/60 via-white/30 to-transparent
              dark:from-black/60 dark:via-black/30 dark:to-transparent
            "
          />

          {/* Top shadow onto h1 */}
          <div
            className="
              pointer-events-none
              absolute top-0 left-0 w-full h-24
              bg-gradient-to-b
              from-black/20 to-transparent
              dark:from-white/10 dark:to-transparent
            "
          />
        </div>
      </div>

    </div>
  </section>
);


// --- Features (Unchanged from last step) ---
const features = [
  {
    icon: Film,
    title: "Rapid Video Compression",
    description: "Drop a .mov or .mp4. Get a 'Play Anywhere' preset (1080p, 720p) transcoded in seconds, not minutes.",
  },
  {
    icon: Brush,
    title: "Instant Image Optimization",
    description: "Convert PNGs to WebP, resize JPEGs, or compress images instantly. No app required.",
  },
  {
    icon: FileText,
    title: "PDF & Text Tools",
    description: "Merge or split PDFs, or run OCR on a document to extract text. All offline and instant.",
  },
  {
    icon: Code,
    title: "Code & Data Formatting",
    description: "Paste messy JSON or CSV. Get a prettified, minified, or deduped result copied to your clipboard.",
  },
  {
    icon: Music2,
    title: "Audio Normalization",
    description: "Drop a .wav or .mp3 to automatically normalize volume and trim silence for clean exports.",
  },
  {
    icon: Cpu,
    title: "On-Demand AI",
    description: "Select text and get an instant summary, explanation, or lint, powered by fast, local AI.",
  },
];

const Features = () => (
  <section id="features" className="py-70 bg-muted/30">
    <div className="container mx-auto px-4 text-center">
      <h2 className="text-3xl md:text-4xl font-bold mb-6">
        Your Toolkit. One Shortcut Away.
      </h2>
      <p className="text-muted-foreground mb-10 max-w-2xl mx-auto">
        PIEE auto-detects your file or clipboard content and runs the perfect micro-tool.
        It's offline-first, privacy-focused, and built for pure speed.
      </p>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <Card key={i} className="bg-background/70 hover:shadow-lg transition-all">
            <CardHeader className="flex flex-col items-center text-center">
              <div className="p-3 bg-primary/10 rounded-full mb-3">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>{f.title}</CardTitle>
              <CardDescription>{f.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

// --- NEW FAQ Section ---
const faqItems = [
  {
    q: "Is \"PIEE\" really open-source?",
    a: "Yes! PIEE is 100% open-source under the MIT License. We believe in transparency and community collaboration. You can check out the entire codebase, contribute features, and report issues on our GitHub."
  },
  {
    q: "How does PIEE handle my data and privacy?",
    a: "PIEE is built \"offline-first.\" All core tools (like video compression, image optimization, and PDF merging) run directly on your machine using WebAssembly. No data ever leaves your computer for these tasks, ensuring complete privacy."
  },
  {
    q: "What exactly is a \"creative command palette\"?",
    a: "It's one universal shortcut (like ⌘+Space or Ctrl+Space) that opens a single box. You can drop any file, text, or link into it, and PIEE instantly figures out what you want to do and does it—no more switching between 10 different apps for small tasks."
  },
  {
    q: "What file types are supported in the beta?",
    a: "The initial beta is focused on: Video (.mp4, .mov), Images (.png, .jpg), Documents (.pdf, .txt), Data (.json, .csv), and Audio (.mp3, .wav). We are expanding this list rapidly based on community feedback."
  }
];

const FAQ = () => (
  <section id="faq" className="py-20">
    <div className="container mx-auto px-4 max-w-3xl">
      <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center">
        Frequently Asked Questions
      </h2>
      <div className="flex justify-center">
        <Button asChild>
          <Link href='/faq'><ArrowRight /> Get Full FAQ</Link>
        </Button>
      </div>
      <Accordion type="single" collapsible className="w-full">
        {faqItems.map((item, i) => (
          <AccordionItem key={i} value={`item-${i + 1}`}>
            <AccordionTrigger className="text-left">{item.q}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {item.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </section>
);


// --- CTA (Unchanged) ---
const CTA = () => (
  <section id="cta" className="py-24 text-center bg-gradient-to-r from-primary to-violet-600 text-primary-foreground">
    <div className="container mx-auto px-4">
      <h2 className="text-4xl font-bold mb-4">Stop Switching. Start Finishing.</h2>
      <p className="text-primary-foreground/80 mb-8 text-lg">
        Join the waitlist for PIEE and be the first to get access to the
        universal creative command palette.
      </p>
      <Button size="lg" variant="secondary">Join Waitlist</Button>
    </div>
  </section>
);


export function EntropyDemo() {
  return (
    <div className="flex flex-col items-center justify-center bg-black text-white min-h-screen w-full p-8">
      <div className="flex flex-col items-center">
        <Entropy className="rounded-lg" />
        <div className="mt-6 text-center">
          <div className="space-y-4 font-mono text-[14px] leading-relaxed">
            <p className="italic text-gray-400/80 tracking-wide">
              &ldquo;Order and chaos dance &mdash;
              <span className="opacity-70">digital poetry in motion.&rdquo;</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const GradientBarsPreview = () => {
  return (
    <div className=" flex flex-col items-center">
      <GradientBars />
    </div>
  );
};

const SupportSection = () => {
  const buyMeUrl = "https://buymeacoffee.com/pieeapp";
  return (
    <section className="flex flex-col items-center container mx-auto px-6 py-24 max-w-3xl">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-6">
          Support PIEE ❤️
        </h1>

        <p className="text-muted-foreground text-lg md:text-xl mb-10 leading-relaxed">
          PIEE is built with love, late nights, and countless cups of coffee.
          <br />
          If PIEE helps you build faster or inspires you — supporting the project keeps
          it alive, improves development, and accelerates new features. 
          <br />
          - Jayash Bhandary
        </p>

        {/* CTA BUTTON */}
        <div className="flex justify-center">
          <a
            href={buyMeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2 py-4 rounded-xl bg-amber-400 text-black font-medium text-lg shadow hover:opacity-95 transition"
          >
            <Coffee className="w-6 h-6" />
            Buy Me a Coffee
          </a>
        </div>

        
      </section>
  )
}

export const Footer = () => {
  return (
    <footer className="border-t bg-muted/30 mt-10">
      <div className="container mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* BRAND */}
        <div>
          <NavbarLogo />
          <p className="text-sm mt-2 text-muted-foreground">
            AI-powered creative + developer suite.  
            Build faster, create smarter.
          </p>
        </div>

        {/* MAIN NAV SECTIONS */}
        <div className="col-span-2 grid grid-cols-2 gap-6">
          {navMain.map((section: NavSection) => (
            <div key={section.title}>
              <h3 className="font-semibold mb-3">{section.title}</h3>

              {/* Section Items */}
              <ul className="space-y-2">
                {section.items ? (
                  section.items.map((item) => (
                    <li key={item.title}>
                      <Link
                        href={item.url}
                        className="text-sm text-muted-foreground hover:text-foreground"
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))
                ) : (
                  <li>
                    <Link 
                      href={section.url}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      {section.title}
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>

        {/* OTHER LINKS */}
        <div>
          <h3 className="font-semibold mb-3">More</h3>
          <ul className="space-y-2">
            {navSecondary.map((item) => (
              <li key={item.title}>
                <Link
                  href={item.url}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {item.title}
                </Link>
              </li>
            ))}

            {projects.length > 0 && (
              <>
                <h3 className="font-semibold mt-4 mb-1">Projects</h3>
                {projects.map((p) => (
                  <li key={p.name}>
                    <Link
                      href={p.url}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      {p.name}
                    </Link>
                  </li>
                ))}
              </>
            )}
          </ul>
        </div>
      </div>

      {/* COPYRIGHT */}
      <div className="border-t mt-10 py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} PIEE — Built by PIEE Team.
      </div>
    </footer>
  );
}

export default function Page() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <DashboardImageHero />
        <Features />
        {/* Added FAQ Section here */}
        <EntropyDemo />
        <FAQ />
        <SupportSection />
        <Footer />
        <GradientBarsPreview />
      </main>
    </>
  );
}

/**<Button asChild size="lg" className="px-8 py-6 font-bold">
          <Link href={REPO_URL} target="_blank">
            <Download className="mr-2 h-5 w-5" />
            Download Beta
          </Link>
        </Button>
 */