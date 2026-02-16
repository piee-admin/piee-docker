"use client";

import { useState } from "react";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const FEEDBACK_TYPES = [
  { value: "praise", label: "😍 I love something", hint: "Tell us what’s working great" },
  { value: "improvement", label: "🙂 It’s good, but…", hint: "Something could be better" },
  { value: "issue", label: "😕 Something feels off", hint: "Bug or friction" },
  { value: "idea", label: "💡 I have an idea", hint: "New feature or workflow" },
  { value: "general", label: "💬 Just sharing thoughts", hint: "Anything else" },
];

export default function FeedbackPage() {
  const [type, setType] = useState("praise");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  async function submitFeedback() {
    if (!message.trim()) {
      toast.error("Please share a few words");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASEURL}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          message,
          email: email || null,
          rating,
          meta: {
            page: window.location.pathname,
            referrer: document.referrer || null,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language,
            screen: {
              w: window.innerWidth,
              h: window.innerHeight,
            },
          },
        }),
      });

      if (!res.ok) throw new Error();

      setSuccessOpen(true);
      setMessage("");
      setEmail("");
      setRating(null);
      setType("praise");
    } catch {
      toast.error("Could not send feedback");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="max-w-2xl mx-auto px-6 py-20 space-y-10">
        {/* Header */}
        <header className="space-y-2">
          <h1 className="text-3xl font-bold">How’s PIEE working for you?</h1>
          <p className="text-muted-foreground">
            Tell us what you like, what could be better, or what’s missing.
          </p>
        </header>

        {/* Feedback Type Cards */}
        <div className="grid gap-3 sm:grid-cols-2">
          {FEEDBACK_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setType(t.value)}
              className={`rounded-lg border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-ring ${type === t.value
                  ? "border-primary bg-primary/5"
                  : "hover:bg-muted"
                }`}
            >
              <div className="font-medium">{t.label}</div>
              <div className="text-sm text-muted-foreground">{t.hint}</div>
            </button>
          ))}
        </div>

        {/* Message */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Your message</label>
          <Textarea
            placeholder="Write in your own words…"
            className="min-h-[140px]"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        {/* Rating */}
        <fieldset className="space-y-1">
          <legend className="text-sm font-medium">
            Overall experience (optional)
          </legend>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                aria-label={`Rate ${n} star`}
                onClick={() => setRating(n)}
                className={`text-xl ${rating && rating >= n
                    ? "text-yellow-500"
                    : "text-muted-foreground"
                  }`}
              >
                ★
              </button>
            ))}
          </div>
        </fieldset>

        {/* Email */}
        <Input
          placeholder="Email (optional, if you want a reply)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Submit */}
        <Button onClick={submitFeedback} disabled={loading}>
          {loading ? "Sending…" : "Send feedback"}
        </Button>
      </div>

      {/* Success Dialog */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thank you 💜</DialogTitle>
            <DialogDescription>
              Your feedback helps shape PIEE. We truly appreciate it.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button asChild>
              <Link href="/">Go to Home</Link>
            </Button>
            <Button variant="ghost" onClick={() => setSuccessOpen(false)}>
              Share more feedback
            </Button>

          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
