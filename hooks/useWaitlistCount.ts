import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useWaitlistCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    // Fetch initial count
    const fetchCount = async () => {
      const { count, error } = await supabase
        .from("waitlist")
        .select("*", { count: "exact", head: true });

      if (!error) setCount(count || 0);
      else console.error("Error fetching waitlist count:", error);
    };

    fetchCount();

    // Realtime subscription
    const channel = supabase
      .channel("waitlist-count")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "waitlist",
        },
        (payload) => {
          // increment count by 1 on new insert
          setCount((prev) => (prev !== null ? prev + 1 : null));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return count;
}
