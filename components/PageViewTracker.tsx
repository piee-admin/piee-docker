"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = pathname + searchParams.toString();

    if (typeof window.gtag === "function") {
      window.gtag("event", "page_view", {
        page_path: url,
      });
    }
  }, [pathname, searchParams]);

  return null;
}
