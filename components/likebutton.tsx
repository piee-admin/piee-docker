"use client";

import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { Heart } from "lucide-react";
import { OpenAPI } from "@/app/library/api";

type LikeButtonProps = {
  resourceId: string;
  resourceType?: "prompt";
};

export function LikeButton({
  resourceId,
  resourceType = "prompt",
}: LikeButtonProps) {
  const [user, setUser] = useState<User | null>(null);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  // -----------------------------
  // Wait for Firebase auth
  // -----------------------------
  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  // -----------------------------
  // Fetch like status
  // -----------------------------
  useEffect(() => {
    if (!user || !resourceId) return;

    const fetchStatus = async () => {
      try {
        const token = await user.getIdToken();

        const res = await fetch(
          `${OpenAPI.BASE}/library/interactions/likes/status?resource_id=${resourceId}&resource_type=${resourceType}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        setLiked(Boolean(data.liked));
      } catch (err) {
        console.error("Failed to fetch like status", err);
      }
    };

    fetchStatus();
  }, [user, resourceId, resourceType]);

  // -----------------------------
  // Toggle like
  // -----------------------------
  const toggleLike = async () => {
    if (!user || toggling) return;

    try {
      setToggling(true);
      const token = await user.getIdToken();

      const res = await fetch(
        `${OpenAPI.BASE}/library/interactions/likes`,
        {
          method: liked ? "DELETE" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            resource_id: resourceId,
            resource_type: resourceType,
          }),
        }
      );

      if (!res.ok) throw new Error("Request failed");

      // optimistic update
      setLiked((prev) => !prev);
    } catch (err) {
      console.error("Failed to toggle like", err);
    } finally {
      setToggling(false);
    }
  };

  // -----------------------------
  // UI states
  // -----------------------------
  if (loading) {
    return (
      <button
        disabled
        className="flex items-center gap-2 text-sm text-muted-foreground"
      >
        <Heart className="h-4 w-4 animate-pulse" />
        Loading
      </button>
    );
  }

  if (!user) {
    return null; // or show login CTA
  }

  return (
    <button
      onClick={toggleLike}
      disabled={toggling}
      className={`
        flex items-center gap-2 m-2
        rounded-full px-3 py-1.5 text-sm font-medium
        transition
        ${liked
          ? "bg-red-500/10 text-red-600 hover:bg-red-500/20"
          : "bg-muted text-muted-foreground hover:bg-muted/80"}
      `}
    >
      <Heart
        className={`h-4 w-4 transition ${
          liked ? "fill-red-500 text-red-500" : ""
        }`}
      />
      
    </button>
  );
}
