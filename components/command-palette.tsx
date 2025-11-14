"use client";

import { useState, useEffect } from "react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { useRouter } from "next/navigation";

import { navMain, navSecondary, projects } from "@/config/nav";

// -----------------------------
// HELPERS
// -----------------------------

// TS-safe icon renderer
const RenderIcon = ({ icon: Icon }: { icon?: React.ComponentType<any> }) =>
  Icon ? <Icon className="mr-2 h-4 w-4" /> : null;

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Keyboard shortcut CMD + K / CTRL + K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search tools, pages, settings…" />

      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {/* MAIN NAV */}
        {navMain.map((section) => (
          <CommandGroup key={section.title} heading={section.title}>
            {/* Parent link */}
            <CommandItem
              onSelect={() => {
                router.push(section.url);
                setOpen(false);
              }}
            >
              {section.icon && <RenderIcon icon={section.icon} />}
              {section.title}
            </CommandItem>

            {/* Child links */}
            {section.items?.map((item) => (
              <CommandItem
                key={item.url}
                onSelect={() => {
                  router.push(item.url);
                  setOpen(false);
                }}
              >
                {item.icon && <RenderIcon icon={item.icon} />}
                {item.title}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}

        <CommandSeparator />

        {/* PROJECTS */}
        <CommandGroup heading="Projects">
          {projects.map((p) => (
            <CommandItem
              key={p.url}
              onSelect={() => {
                router.push(p.url);
                setOpen(false);
              }}
            >
              {p.icon && <RenderIcon icon={p.icon} />}
              {p.name}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {/* SECONDARY NAV */}
        <CommandGroup heading="More">
          {navSecondary.map((sec) => (
            <CommandItem
              key={sec.url}
              onSelect={() => {
                if (sec.url.startsWith("http")) {
                  window.open(sec.url, "_blank");
                } else {
                  router.push(sec.url);
                }
                setOpen(false);
              }}
            >
              {sec.icon && <RenderIcon icon={sec.icon} />}
              {sec.title}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
