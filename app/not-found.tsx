"use client";

import Link from "next/link";
import { BorderTrail } from "@/components/motion-primitives/border-trail";
import { GradientBars } from "@/components/ui/gradient-bars";
import { Navbar, NavBody, NavbarLogo } from "@/components/ui/resizable-navbar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";

// Bring ALL your nav config
import { navMain, navSecondary } from "@/config/nav";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 w-full">
        <Navbar>
          <NavBody>
            <NavbarLogo />
          </NavBody>
        </Navbar>
      </header>

      {/* MAIN 404 HERO */}
      <section className="relative flex flex-col items-center justify-center text-center py-24 container mx-auto px-4 max-w-3xl">
        <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight mb-4">
          404 — Not Found
        </h1>

        <p className="text-muted-foreground text-lg md:text-xl mb-10 max-w-xl">
          The page you’re looking for doesn’t exist. Use the navigation below to quickly jump to where you need.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Button asChild size="lg">
            <Link href="/">
              <Home className="mr-2 h-5 w-5" />
              Back to Home
            </Link>
          </Button>

          <Button asChild size="lg" variant="secondary">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Dashboard
            </Link>
          </Button>
        </div>
      </section>

      {/* ---------- NAVIGATION GRID ---------- */}
      <section className="container mx-auto px-4 max-w-5xl pb-28">

        {/* MAIN NAV */}
        <h2 className="text-2xl font-bold mb-6">Quick Navigation</h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {navMain.map((section, i) => {
            const Icon = section.icon ?? Home; // fallback icon

            return (
              <div
                key={i}
                className="p-6 rounded-2xl border bg-card hover:shadow-md transition-all"
              >
                {/* Main Section Link */}
                <Link href={section.url} className="flex items-center gap-3">
                  <Icon className="h-6 w-6 text-primary" />
                  <h3 className="font-semibold text-lg">{section.title}</h3>
                </Link>

                {/* Sub Items */}
                {section.items && (
                  <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                    {section.items.map((item, j) => {
                      // Fallback icon for items
                      const SubIcon = item.icon ?? Icon;
                      return (
                        <li key={j}>
                          <Link
                            href={item.url}
                            className="flex items-center gap-2 hover:text-primary transition-colors"
                          >
                            <SubIcon className="h-4 w-4 opacity-60" />
                            {item.title}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>

        {/* SECONDARY NAV */}
        <h2 className="text-2xl font-bold mt-16 mb-6">Support</h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {navSecondary.map((item, i) => {
            const Icon = item.icon ?? Home;

            return (
              <Link
                key={i}
                href={item.url}
                target={item.url.startsWith("http") ? "_blank" : "_self"}
                className="p-6 rounded-2xl border bg-card hover:shadow-md flex items-center gap-3 transition-all"
              >
                <Icon className="h-6 w-6 text-primary" />
                <span className="font-medium">{item.title}</span>
              </Link>
            );
          })}
        </div>

      </section>

      {/* FOOTER */}
      
    </div>
  );
}
