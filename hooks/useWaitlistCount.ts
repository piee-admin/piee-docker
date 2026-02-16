// hooks/useWaitlistCount.ts
import { useEffect, useState } from "react";
import { waitlistApi } from "@/lib/api/waitlist";

export function useWaitlistCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const c = await waitlistApi.getCount();
        setCount(c);
      } catch (e) {
        console.error("Error fetching waitlist count:", e);
      }
    };

    fetchCount();

    // Poll every 30 seconds instead of real-time for internal SQL
    const interval = setInterval(fetchCount, 30000);

    return () => clearInterval(interval);
  }, []);

  return count;
}
