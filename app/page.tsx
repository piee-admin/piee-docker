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
import Login from "./Login";
// Updated icons
import { Brush, Code, Film, Music2, Cpu, FileText, Package, Github } from "lucide-react"; // Added Github

// --- GitHub Repo Link ---
// !! REPLACE THIS with your actual GitHub repository URL
const GITHUB_URL = "https://github.com/piee-dev/piee-core";

export function Header() {
  const { user, logOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openLogin, setOpenLogin] = useState(false);

  // Updated navItems: Removed Pricing, Added GitHub
  const navItems = [
    { name: "Features", link: "#features" },
    { name: "FAQ", link: "#faq" },
    { name: "GitHub", link: GITHUB_URL },
  ];

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
const Hero = () => (
  <section className="relative pt-24 pb-32 text-center">
    <div className="container mx-auto px-4 max-w-4xl">
      <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
        Drop anything. <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-500">Done in a blink.</span>
      </h1>
      <p className="mt-6 text-lg md:text-xl text-muted-foreground">
        Meet <span className="font-semibold text-primary">PIEE</span>, the universal 
        <span className="font-semibold"> open-source </span> 
        creative command palette.
        Compress images, trim videos, and format code with a single shortcut.
      </p>
      <div className="mt-10 flex justify-center gap-4 flex-wrap">
        <Button size="lg" className="px-8 py-6 font-bold">Download Beta</Button>
        <Button asChild variant="outline" size="lg" className="px-8 py-6 font-bold">
          <Link href={GITHUB_URL} target="_blank">
            <Github className="mr-2 h-5 w-5" />
            Star on GitHub
          </Link>
        </Button>
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
  <section id="features" className="py-20 bg-muted/30">
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

export default function Page() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Features />
        {/* Added FAQ Section here */}
        <FAQ /> 
        <CTA />
      </main>
    </>
  );
}