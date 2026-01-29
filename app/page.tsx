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
    { name: "All Tools", link: "/dashboard/tools" },
    { name: "Explore", link: "/library/prompt" },
    { name: "Support", link: "https://buymeacoffee.com/pieeapp" },
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
  <section className="relative pt-24 pb-32 text-center h-screen flex justify-center items-center">

    <div className="container mx-auto px-4 max-w-4xl">
      <img
            src="/images/piee-dashboard-new-s.png"
            alt="PIEE Library Preview"
            className="w-full h-auto object-cover z-100"
          />
      <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
        Search. Create. Reuse.
        <br />
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-500">
          Everything AI starts here.
        </span>
      </h1>

      <p className="mt-6 text-lg md:text-xl text-muted-foreground">
        Meet <span className="font-semibold text-primary">PIEE</span> — the home
        for AI prompts, models, and workflows.
        <br />
        Discover what works, save it, and build on top of it.
      </p>
    </div>
    <GradientBarsPreview />
  </section>
);



const DashboardImageHero = () => (
  <section className="relative pt-16 pb-12">
    <div className="container mx-auto px-4 max-w-6xl">

      <h1 className="scroll-m-20 text-center text-4xl md:text-9xl font-extrabold tracking-tight relative z-10 md:-mb-8">
        Library
      </h1>

      <div className="relative w-full rounded-2xl overflow-hidden">
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

        <div className="relative w-full overflow-hidden rounded-2xl border bg-muted/20 z-10 shadow-xl">
          <img
            src="/images/piee-dashboard-s.png"
            alt="PIEE Library Preview"
            className="w-full h-auto object-cover"
          />

          <div className="absolute bottom-4 w-full text-center text-sm md:text-base text-muted-foreground">
            Think Pinterest for AI ideas — built with GitHub-level structure.
          </div>
        </div>
      </div>
    </div>
  </section>
);



// --- Features (Unchanged from last step) ---
const features = [
  {
    icon: LayoutDashboardIcon,
    title: "Prompt Library",
    description:
      "Discover high-quality prompts across domains. Save, reuse, and build on what works.",
  },
  {
    icon: Cpu,
    title: "Model-Aware Prompts",
    description:
      "Prompts designed for specific models — no guessing, no broken outputs.",
  },
  {
    icon: Code,
    title: "Versioned Workflows",
    description:
      "Treat prompts like code. Iterate, improve, and evolve over time.",
  },
  {
    icon: Film,
    title: "Media-Ready Prompts",
    description:
      "Image, video, audio, and text prompts built for real production use.",
  },
  {
    icon: FileText,
    title: "Fast Discovery",
    description:
      "Search by intent, category, and tags to find what works in seconds.",
  },
  {
    icon: Package,
    title: "Built for Scale",
    description:
      "From personal libraries to team-wide prompt systems.",
  },
];

const Features = () => (
  <section id="features" className="py-26 bg-muted/30">
    <div className="container mx-auto px-4 text-center">
      <h2 className="text-3xl md:text-4xl font-bold mb-6">
        The Internet’s Best AI Work — Organized
      </h2>
      <p className="text-muted-foreground mb-10 max-w-2xl mx-auto">
        PIEE is where prompts, models, and workflows live — curated, reusable,
        and built to scale.
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
    q: "Is the PIEE library free?",
    a: "Yes. The prompt library is completely free to explore, search, and use. You can discover prompts, models, and workflows without any cost. Advanced features and enterprise use cases will evolve separately."
  },
  {
    q: "What is PIEE actually built for?",
    a: "PIEE is a prompt infrastructure for experts and teams. It helps you search, create, organize, and reuse prompts, models, and workflows in a structured, scalable way — similar to how GitHub organizes code or Pinterest organizes ideas."
  },
  {
    q: "How does PIEE handle data security and privacy?",
    a: "PIEE is designed with strong data isolation and security in mind. Your prompts, private libraries, and workflows are never shared publicly unless you choose to. Enterprise-grade access controls and future self-hosting options are part of the roadmap."
  },
  {
    q: "What types of prompts does PIEE support?",
    a: "PIEE supports prompts for text, image, video, and audio generation. Prompts are model-aware, meaning they are designed to work reliably with specific AI models instead of generic one-size-fits-all inputs."
  },
  {
    q: "Who is PIEE for?",
    a: "PIEE is built for solo creators, indie hackers, students, and startup teams who work seriously with AI. If you reuse prompts, experiment with models, or build AI-powered workflows, PIEE is designed for you."
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
          <Link href="/faq">
            <ArrowRight /> How PIEE Works
          </Link>
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
  <section
    id="cta"
    className="py-24 text-center bg-gradient-to-r from-primary to-violet-600 text-primary-foreground"
  >
    <div className="container mx-auto px-4">
      <h2 className="text-4xl font-bold mb-4">
        Stop Switching. Start Finishing.
      </h2>
      <p className="text-primary-foreground/80 mb-8 text-lg">
        Join early builders shaping how AI work is created, shared, and scaled.
      </p>
      <Button size="lg" variant="secondary">
        Join Waitlist
      </Button>
    </div>
  </section>
);



export function EntropyDemo() {
  return (
    <div className="flex flex-col items-center justify-center bg-black text-white min-h-screen w-full p-8">
      <Entropy className="rounded-lg" />
      <p className="mt-6 text-sm text-gray-400 text-center max-w-md">
        A glimpse into how PIEE thinks — structured chaos, refined into systems.
      </p>
    </div>
  );
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
            AI prompt infrastructure focused on speed, privacy, and real workflows.
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
        © {new Date().getFullYear()} PIEE — Built in public by the PIEE team.
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