"use client";

import { useState } from "react";

export function SimpleTooltip({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      tabIndex={0}
    >
      {children}

      {open && (
        <span
          className="
            absolute
            -top-9
            left-1/2
            -translate-x-1/2
            z-50
            whitespace-nowrap
            rounded-md
            border
            border-border/60
            bg-popover
            px-2.5
            py-1
            text-xs
            text-popover-foreground
            shadow-md
          "
        >
          {label}
        </span>
      )}
    </span>
  );
}
