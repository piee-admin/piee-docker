"use client";

import Link from "next/link";
import { Navbar, NavBody, NavbarLogo } from "@/components/ui/resizable-navbar";
import { Button } from "@/components/ui/button";
import { Coffee, HeartHandshake, Rocket, Star } from "lucide-react";

export default function Support() {
  const buyMeUrl = "https://buymeacoffee.com/pieeapp";

  return (
    <div className="min-h-screen flex flex-col bg-background text-center relative">

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur">
        <Navbar>
          <NavBody>
            <NavbarLogo />
          </NavBody>
        </Navbar>
      </header>

      {/* HERO */}
      <section className="container mx-auto px-6 py-24 max-w-3xl">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
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
            className="inline-flex items-center gap-3 px-6 py-4 rounded-xl bg-amber-400 text-black font-semibold text-lg shadow hover:opacity-95 transition"
          >
            <Coffee className="w-6 h-6" />
            Buy Me a Coffee
          </a>
        </div>

        {/* Motivation Section */}
        <div className="mt-20 grid gap-10 text-left">
          <div className="p-6 rounded-2xl border bg-card shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Rocket className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-semibold">Help PIEE Grow</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Your support speeds up development, funds new modules, and helps bring PIEE’s vision
              closer to reality — a powerful infrastructure for creators, developers, and automation lovers.
            </p>
          </div>

          <div className="p-6 rounded-2xl border bg-card shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <HeartHandshake className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-semibold">Support Independent Development</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              PIEE is built independently — no big company behind it. Your contribution directly supports
              time spent building, fixing bugs, researching, designing, and improving the entire ecosystem.
            </p>
          </div>

          <div className="p-6 rounded-2xl border bg-card shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Star className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-semibold">Get Better Features Faster</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              The more support PIEE receives, the more time can be invested into advanced features,
              documentation, community tools, and long-term upgrades.
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-xl mx-auto text-left">
          <h2 className="text-2xl font-bold mb-4">FAQ</h2>

          <details className="p-4 rounded-lg border bg-card mb-3">
            <summary className="font-medium cursor-pointer">
              What does my donation support?
            </summary>
            <p className="mt-2 text-muted-foreground text-sm">
              Server costs, development time, research, and future upgrades for PIEE.
            </p>
          </details>

          <details className="p-4 rounded-lg border bg-card mb-3">
            <summary className="font-medium cursor-pointer">
              Can I donate monthly?
            </summary>
            <p className="mt-2 text-muted-foreground text-sm">
              Yes! BuyMeACoffee supports both one-time and monthly donations.
            </p>
          </details>

          <details className="p-4 rounded-lg border bg-card">
            <summary className="font-medium cursor-pointer">Is donating required?</summary>
            <p className="mt-2 text-muted-foreground text-sm">
              Not at all. PIEE remains free and open — donations just help keep the project alive and evolving.
            </p>
          </details>
        </div>

        {/* SECOND CTA */}
        <div className="mt-16 flex justify-center">
          <a
            href={buyMeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-6 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-lg shadow hover:opacity-90 transition"
          >
            <Coffee className="w-6 h-6" />
            Support PIEE
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t py-8 text-sm text-muted-foreground">
        <p>Made with ❤️ by Jayash</p>
      </footer>
    </div>
  );
}
